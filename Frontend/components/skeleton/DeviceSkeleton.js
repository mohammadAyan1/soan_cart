// components/skeleton/DeviceSkeleton.jsx
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

// Ek single shimmering block - width/height/className sab customizable
function ShimmerBlock({ style, className }) {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            className={`bg-gray-200 rounded-md ${className || ""}`}
            style={[animatedStyle, style]}
        />
    );
}

// Ek device card jaisa dikhne wala skeleton
function DeviceCardSkeleton() {
    return (
        <View className="bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden">
            <View className="p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                        <ShimmerBlock className="w-9 h-9 rounded-full" />
                        <View className="flex-1">
                            <ShimmerBlock className="h-3.5 w-32 mb-2" />
                            <ShimmerBlock className="h-3 w-20" />
                        </View>
                    </View>
                    <ShimmerBlock className="h-3.5 w-12" />
                </View>

                <ShimmerBlock className="h-3 w-40 mt-3.5" />
                <ShimmerBlock className="h-3 w-28 mt-2" />
            </View>

            <View className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
                <ShimmerBlock className="h-2.5 w-36" />
            </View>
        </View>
    );
}

export default function DeviceSkeleton() {
    return (
        <View className="flex-1 bg-gray-50 px-4 pt-4">
            <ShimmerBlock className="h-3 w-24 mb-2" />
            <DeviceCardSkeleton />

            <ShimmerBlock className="h-3 w-24 mb-2 mt-2" />
            <DeviceCardSkeleton />
            <DeviceCardSkeleton />
        </View>
    );
}