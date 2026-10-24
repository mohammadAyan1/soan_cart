import { useEffect, useRef } from "react";
import { BackHandler, Platform, ToastAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { triggerScreenExit } from "@/utils/eventTracker";
import { getAnalyticsScreen } from "@/components/Header";
import { usePathname, useRouter } from "expo-router";
import { useTabContext } from "@/context/TabContext";

export default function useBackTracker() {
    const pathname = usePathname();
    const router = useRouter();
    const navigation = useNavigation();

    let tabContext = null;
    try {
        tabContext = useTabContext();
    } catch {
        tabContext = null;
    }

    const activeIndex = tabContext?.activeIndex ?? 0;
    const goToTab = tabContext?.goToTab;

    const activeIndexRef = useRef(activeIndex);
    const lastBackPressRef = useRef(0);

    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    useEffect(() => {
        // iOS Swipe Back
        const unsubscribeGesture = navigation.addListener(
            "gestureEnd",
            () => {
                triggerScreenExit({
                    screen: getAnalyticsScreen(pathname),
                    source: "swipe_back",
                });
            }
        );

        // Android Hardware Back & Gesture Navigation
        const hardwareSubscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                triggerScreenExit({
                    screen: getAnalyticsScreen(pathname),
                    source: "hardware_back",
                });

                // 1. Agar user kisi child screen par hai (e.g. /product/[id], /search, /checkout, etc.)
                if (router.canGoBack()) {
                    router.back();
                    return true; // handled
                }

                const isTabsScreen =
                    !pathname ||
                    pathname === "/" ||
                    pathname === "/index" ||
                    pathname.includes("(tabs)");

                // 2. Agar app direct deep link se open hui hai aur history stack empty hai
                if (!isTabsScreen) {
                    router.replace("/(root)/(tabs)");
                    if (goToTab) goToTab(0);
                    return true; // handled: navigates to home instead of crashing
                }

                // 3. User tabs screen par hai:
                // Agar user Home tab (index 0) pe NAHI hai (Categories, Wishlist, Cart, ya Profile me hai)
                if (activeIndexRef.current !== 0) {
                    if (goToTab) {
                        goToTab(0); // Home tab par switch karo
                    }
                    return true; // handled: app close nahi hogi!
                }

                // 4. User pehle se hi Home tab (index 0) par hai:
                // Ab back press karne par app minimize / exit hogi (Double press to confirm exit)
                const now = Date.now();
                if (now - lastBackPressRef.current < 2000) {
                    BackHandler.exitApp();
                    return true;
                }

                lastBackPressRef.current = now;
                if (Platform.OS === "android") {
                    ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
                }
                return true;
            }
        );

        return () => {
            unsubscribeGesture();
            hardwareSubscription.remove();
        };
    }, [navigation, pathname, router, goToTab]);
}