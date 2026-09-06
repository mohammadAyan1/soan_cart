// components/skeleton/ReviewSkeleton.jsx
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

// Ek review card jaisa dikhne wala skeleton
function ReviewCardSkeleton() {
    return (
        <View
            className="bg-white rounded-xl p-4 mx-4 mb-3"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
            }}
        >
            <View className="flex-row items-center gap-3 mb-3">
                <ShimmerBlock className="w-14 h-14 rounded-lg" />
                <View className="flex-1">
                    <ShimmerBlock className="h-3.5 w-3/4 mb-2" />
                    <ShimmerBlock className="h-3 w-1/2" />
                </View>
            </View>

            <View className="flex-row gap-1 mb-2">
                <ShimmerBlock className="h-3.5 w-24" />
            </View>

            <ShimmerBlock className="h-3 w-full mb-1.5" />
            <ShimmerBlock className="h-3 w-2/3" />
        </View>
    );
}

export default function ReviewSkeleton() {
    return (
        <View className="flex-1 bg-gray-50 pt-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <ReviewCardSkeleton key={index} />
            ))}
        </View>
    );
}