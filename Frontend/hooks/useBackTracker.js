import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { triggerScreenExit } from "@/utils/eventTracker";
import { getAnalyticsScreen } from "@/components/Header"
import { usePathname } from "expo-router";

export default function useBackTracker() {
    const pathname = usePathname();

    const navigation = useNavigation();

    useEffect(() => {
        // iOS Swipe Back
        const unsubscribeGesture = navigation.addListener(
            "gestureEnd",
            () => {

                // useBackTracker.js
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
                return false; // back ko continue hone do
            }
        );

        return () => {
            unsubscribeGesture();
            hardwareSubscription.remove();
        };
    }, [navigation]);
}