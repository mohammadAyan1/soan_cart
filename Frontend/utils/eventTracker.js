
// utils/eventTracker.js

import AsyncStorage from "@react-native-async-storage/async-storage";

let screenEnterTime = null;

const FLUSH_INTERVAL_MS = 10000;
const MAX_BATCH_SIZE = 20;
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api`;

let queue = [];
let flushTimer = null;
let sessionId = null;

let currentScreen = null;
let previousScreen = null;

// 👇 sessionId set hone se pehle jitne bhi trackEvent() calls aaye,
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
    if (sessionId) return; // 👈 dobara init hone se guard (StrictMode/remount safety)

    sessionId = currentSessionId;
    startFlushTimer();

    // 👇 sessionId milte hi pending events ko unke original order mein bhejo
    if (pendingQueue.length > 0) {
        const pending = [...pendingQueue];
        pendingQueue = [];
        pending.forEach((eventData) => trackEvent(eventData));
    }

    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener("beforeunload", flushSync);
        window.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") flush();
        });
    }

    // 👇 NAYA - AppState ka background/reopen handling ab _layout.js se
    // control hoti hai (flushEvents + resetEventTracker ke through),
    // isliye yaha se AppState listener hata diya - warna dono jagah
    // se duplicate listeners lag jaate aur deviceId/session state conflict karta
};

const startFlushTimer = () => {
    if (flushTimer) clearInterval(flushTimer);
    flushTimer = setInterval(() => {
        if (queue.length > 0) flush();
    }, FLUSH_INTERVAL_MS);
};

// 👇 NAYA - app background/close hote waqt poora tracker state reset karo,
// taaki jab user dubara app open kare to bilkul fresh session ban sake
// (initEventTracker ka `if (sessionId) return;` guard tabhi naya session
// banne dega jab sessionId yaha se null ho chuka ho)
export const resetEventTracker = () => {
    if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
    }

    queue = [];
    pendingQueue = [];
    sessionId = null;
    currentScreen = null;
    previousScreen = null;
    screenEnterTime = null;
};

// 👇 NAYA - _layout.js se background jaate waqt pending events flush
// karne ke liye export kar diya (pehle flush() sirf internal tha)
export const flushEvents = () => {
    flush();
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
        pendingQueue.push(eventData); // 👈 drop nahi, queue mein park karo
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