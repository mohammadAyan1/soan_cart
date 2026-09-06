// // 📁 Save at: hooks/useProductListTracker.js
// //
// // Ye hook FlatList ke sath jodne ke liye hai - product list wale
// // kisi bhi page (home, category, search results) pe use ho sakta hai.
// //
// // Ye 2 cheez karta hai:
// //  1. onViewableItemsChanged - batata hai kaunse products abhi screen
// //     pe dikh rahe hai (60%+ visible) -> PRODUCT_IMPRESSION event
// //  2. onScroll (debounced) - user jab scroll karke ruk jaata hai
// //     (400ms tak scroll nahi hua), tab uska scrollDepth % aur us
// //     waqt jo products visible the unki list bhejta hai -> SCROLL_STOP event

// import { useRef, useCallback } from "react";
// import { trackEvent } from "../utils/eventTracker";

// const SCROLL_STOP_DELAY = 400; // itni der tak scroll na ho tabhi "ruka" maanenge

// export const useProductListTracker = (screenName, refference = "") => {
//     // Abhi jo products screen pe dikh rahe hai unki id list
//     const viewableIdsRef = useRef([]);

//     // Scroll debounce timer
//     const scrollTimerRef = useRef(null);

//     // Abhi tak ka scroll % (0-100)
//     const lastScrollDepthRef = useRef(0);

//     // Duplicate impression events se bachne ke liye - ek product ka
//     // impression sirf ek baar bhejo (jab tak page dobara open na ho)
//     const impressionSentRef = useRef(new Set());

//     const viewabilityConfig = useRef({
//         itemVisiblePercentThreshold: 60, // kam se kam 60% card visible ho tabhi count karo
//         minimumViewTime: 300,            // kam se kam 300ms tak visible rahe (galti se flash na ho)
//     }).current;

//     // 👇 FlatList ye call karta hai jab bhi visible items badalte hai
//     const onViewableItemsChanged = useRef(({ viewableItems }) => {
//         const ids = viewableItems.map((v) => v.item.id);
//         viewableIdsRef.current = ids;

//         // Sirf naye products (jo pehle track nahi hue) ka impression bhejo
//         const newIds = ids.filter((id) => !impressionSentRef.current.has(id));

//         if (newIds.length > 0) {
//             newIds.forEach((id) => impressionSentRef.current.add(id));

//             trackEvent({
//                 eventType: "PRODUCT_IMPRESSION",
//                 screen: screenName,
//                 payload: { productIds: newIds }, // kaunse products dikhe
//                 ...(refference && {
//                     referrerScreen: refference,
//                 }),
//             });
//         }
//     }).current;

//     // 👇 FlatList ka onScroll - debounce karke "scroll stop" detect karta hai
//     const onScroll = useCallback(
//         (event) => {
//             const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
//             const maxScroll = contentSize.height - layoutMeasurement.height;
//             const percent =
//                 maxScroll > 0
//                     ? Math.min(100, Math.max(0, Math.round((contentOffset.y / maxScroll) * 100)))
//                     : 0;

//             lastScrollDepthRef.current = percent;

//             if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

//             scrollTimerRef.current = setTimeout(() => {
//                 trackEvent({
//                     eventType: "SCROLL_STOP",
//                     screen: screenName,
//                     scrollDepth: lastScrollDepthRef.current,
//                     // Jab scroll ruka, us waqt jo products visible the unki list
//                     payload: { visibleProductIds: viewableIdsRef.current },
//                 });
//             }, SCROLL_STOP_DELAY);
//         },
//         [screenName]
//     );

//     return { onScroll, onViewableItemsChanged, viewabilityConfig };
// };


import { useRef, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { trackEvent } from "../utils/eventTracker";

const SCROLL_STOP_DELAY = 400;

export const useProductListTracker = (
    screenName
) => {
    const viewableIdsRef = useRef([]);
    const scrollTimerRef = useRef(null);
    const lastScrollDepthRef = useRef(0);

    // 👇 Previous scroll position
    const previousScrollYRef = useRef(0);

    // 👇 Current direction
    const scrollDirectionRef = useRef(null);


    const impressionSentRef = useRef(new Set());

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 60,
        minimumViewTime: 300,
    }).current;

    // ⭐ Screen dobara focus hone par tracker reset
    useFocusEffect(
        useCallback(() => {


            // Naya visit/session maan rahe hain
            impressionSentRef.current.clear();

            // Purani visible IDs clear
            viewableIdsRef.current = [];

            // Scroll depth bhi reset
            lastScrollDepthRef.current = 0;

            return () => {


                // Pending SCROLL_STOP ko cancel karo
                if (scrollTimerRef.current) {
                    clearTimeout(scrollTimerRef.current);
                    scrollTimerRef.current = null;
                }
            };
        }, [])
    );

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        const ids = viewableItems.map((v) => v.item.id);

        viewableIdsRef.current = ids;

        const newIds = ids.filter(
            (id) => !impressionSentRef.current.has(id)
        );

        if (newIds.length > 0) {
            newIds.forEach((id) =>
                impressionSentRef.current.add(id)
            );

            trackEvent({
                eventType: "PRODUCT_IMPRESSION",
                screen: screenName,
                payload: {
                    productIds: newIds,
                },
            });
        }
    }).current;

    const onScroll = useCallback(
        (event) => {
            const {
                contentOffset,
                contentSize,
                layoutMeasurement,
            } = event.nativeEvent;



            const currentY = contentOffset.y;
            const previousY = previousScrollYRef.current;

            // 👇 Direction detect
            if (currentY > previousY) {
                scrollDirectionRef.current = "DOWN";
            } else if (currentY < previousY) {
                scrollDirectionRef.current = "UP";
            }

            // 👇 Save current position
            previousScrollYRef.current = currentY;



            const maxScroll =
                contentSize.height - layoutMeasurement.height;

            const percent =
                maxScroll > 0
                    ? Math.min(
                        100,
                        Math.max(
                            0,
                            Math.round(
                                (contentOffset.y / maxScroll) * 100
                            )
                        )
                    )
                    : 0;

            lastScrollDepthRef.current = percent;

            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
            }

            scrollTimerRef.current = setTimeout(() => {
                trackEvent({
                    eventType: "SCROLL_STOP",
                    screen: screenName,
                    scrollDepth: lastScrollDepthRef.current,
                    payload: {
                        visibleProductIds:
                            viewableIdsRef.current,
                    },
                    source: scrollDirectionRef.current,
                });
            }, SCROLL_STOP_DELAY);
        },
        [screenName]
    );

    return {
        onScroll,
        onViewableItemsChanged,
        viewabilityConfig,
    };
};