import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { triggerScreenExit } from "@/utils/eventTracker";
import { getAnalyticsScreen } from "@/components/Header"
import { usePathname, useRouter } from "expo-router";

export default function useBackTracker() {
    const pathname = usePathname();
    const router = useRouter();
    const navigation = useNavigation();

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

        // Android Hardware Back
        const hardwareSubscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                triggerScreenExit({
                    screen: getAnalyticsScreen(pathname),
                    source: "hardware_back",
                });

                if (router.canGoBack()) {
                    router.back();
                    return true; // handled
                }

                // Agar app direct deep link se open hui hai aur history stack empty hai
                const isHomeScreen = pathname === "/" || pathname === "/(root)/(tabs)" || pathname === "/index";
                if (!isHomeScreen) {
                    router.replace("/(root)/(tabs)");
                    return true; // handled: navigates to home instead of crashing
                }

                return false; // Already on home screen, let Android exit normally
            }
        );

        return () => {
            unsubscribeGesture();
            hardwareSubscription.remove();
        };
    }, [navigation, pathname, router]);
}