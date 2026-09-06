// utils/eventTracker.js

import { AppState } from "react-native";

let screenEnterTime = null;

const FLUSH_INTERVAL_MS = 10000;
const MAX_BATCH_SIZE = 20;
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

let queue = [];
let flushTimer = null;
let sessionId = null;

let currentScreen = null;
let previousScreen = null;

// 👇 NAYA - sessionId set hone se pehle jitne bhi trackEvent() calls aaye,
// unhe yaha park karo taaki wo drop na ho
let pendingQueue = [];

export const getCurrentScreen = () => currentScreen;
export const getPreviousScreen = () => previousScreen;

export const setCurrentScreen = (screen) => {
    if (screen === currentScreen) return;
    previousScreen = currentScreen;
    currentScreen = screen;
};

export const initEventTracker = (currentSessionId) => {
    if (sessionId) return; // 👈 NAYA - dobara init hone se guard (StrictMode/remount safety)

    sessionId = currentSessionId;
    startFlushTimer();

    // 👇 NAYA - sessionId milte hi pending events ko unke original order mein bhejo
    if (pendingQueue.length > 0) {
        const pending = [...pendingQueue];
        pendingQueue = [];
        pending.forEach((eventData) => trackEvent(eventData));
    }

    if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", flushSync);
        window.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") flush();
        });
    }

    AppState.addEventListener("change", (nextState) => {
        if (nextState === "background" || nextState === "inactive") {
            flush();
        }
    });
};

const startFlushTimer = () => {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(() => {
        if (queue.length > 0) flush();
    }, FLUSH_INTERVAL_MS);
};

export const triggerScreenExit = (extra = {}) => {
    const screen = extra.screen || currentScreen;

    if (!screen || screenEnterTime == null) return;


    const { screen: _omit, ...restExtra } = extra;

    const seconds =
        restExtra.durationSeconds != null
            ? restExtra.durationSeconds
            : Math.round((Date.now() - screenEnterTime) / 1000);

    screenEnterTime = null;

    if (seconds >= 1) {
        trackEvent({
            eventType: "SCREEN_EXIT",
            ...restExtra,
            screen,
            durationSeconds: seconds,
        });
    }
};

export const trackEvent = (eventData) => {
    if (!sessionId) {
        pendingQueue.push(eventData); // 👈 FIX - drop nahi, queue mein park karo
        return;
    }

    let finalData = { ...eventData };

    if (eventData.eventType === "SCREEN_VIEW") {

        const prevBeforeUpdate = currentScreen;
        setCurrentScreen(eventData.screen);

        if (!finalData.referrerScreen) {
            finalData.referrerScreen = prevBeforeUpdate;
        }

        screenEnterTime = Date.now();
    } else if (!finalData.screen) {
        finalData.screen = currentScreen;
    }

    queue.push({
        ...finalData,
        sessionId,
        eventAt: new Date().toISOString(),
    });

    if (queue.length >= MAX_BATCH_SIZE) {
        flush();
    }
};

const flush = async () => {
    if (queue.length === 0) return;

    const batchToSend = [...queue];
    queue = [];

    try {
        await fetch(`${API_BASE_URL}/analytics/track-batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: batchToSend }),
        });
    } catch (error) {
        console.warn("Event batch send fail hua, events discard ho gaye:", error);
    }
};

const flushSync = () => {
    if (queue.length === 0) return;

    const batchToSend = [...queue];
    queue = [];

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob(
            [JSON.stringify({ events: batchToSend })],
            { type: "application/json" }
        );
        navigator.sendBeacon(`${API_BASE_URL}/analytics/track-batch`, blob);
    }
};