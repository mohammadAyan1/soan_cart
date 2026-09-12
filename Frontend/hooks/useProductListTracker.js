
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