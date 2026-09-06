// 📁 Frontend (React Native): hooks/usePageTimeTracker.js

import { useRef, useCallback } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { trackEvent } from "../utils/eventTracker";

// 👇 Ye hook SIRF un pages ke liye use karo jo router.push() se khulte hai
// (product detail, order detail, search results, etc) - TAB screens
// (home/categories/wishlist/cart/profile) ke liye NAHI, unka tracking
// _layout.js me hi centrally hota hai
export const usePageTimeTracker = (screenName, extraData = {}) => {
    const activeStartTime = useRef(null);
    const totalActiveMs = useRef(0);
    const isActive = useRef(true);
    const appStateSubscription = useRef(null);

    useFocusEffect(
        useCallback(() => {
            // referrerScreen automatically eventTracker.js ke global tracker se bhar jayega
            trackEvent({ eventType: "SCREEN_VIEW", screen: screenName, ...extraData });
            activeStartTime.current = Date.now();
            totalActiveMs.current = 0;
            isActive.current = true;

            const handleAppStateChange = (nextState) => {
                if (nextState === "background" || nextState === "inactive") {
                    if (isActive.current) {
                        totalActiveMs.current += Date.now() - activeStartTime.current;
                        isActive.current = false;
                    }
                } else if (nextState === "active") {
                    activeStartTime.current = Date.now();
                    isActive.current = true;
                }
            };

            appStateSubscription.current = AppState.addEventListener("change", handleAppStateChange);

            return () => {
                appStateSubscription.current?.remove();

                if (isActive.current) {
                    totalActiveMs.current += Date.now() - activeStartTime.current;
                }

                const seconds = Math.round(totalActiveMs.current / 1000);

                if (seconds >= 1) {
                    trackEvent({
                        eventType: "SCREEN_EXIT",
                        screen: screenName,
                        durationSeconds: seconds,
                        ...extraData,
                    });
                }
            };
        }, [screenName])
    );
};