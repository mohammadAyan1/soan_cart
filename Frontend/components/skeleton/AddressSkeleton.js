// components/skeleton/AddressSkeleton.jsx
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

// Ek address card jaisa dikhne wala skeleton
function AddressCardSkeleton() {
    return (
        <View
            className="bg-white mx-4 mb-3 rounded-xl p-4"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            {/* Name row */}
            <View className="flex-row items-center gap-2 mb-2">
                <ShimmerBlock className="h-4 w-32" />
                <ShimmerBlock className="h-4 w-14 rounded-full" />
            </View>

            {/* Phone */}
            <ShimmerBlock className="h-3 w-24 mb-3" />

            {/* Address lines */}
            <ShimmerBlock className="h-3 w-full mb-1.5" />
            <ShimmerBlock className="h-3 w-2/3 mb-3" />

            {/* Action buttons */}
            <View className="flex-row items-center gap-3 pt-3 border-t border-gray-100">
                <ShimmerBlock className="h-8 flex-1 rounded-lg" />
                <ShimmerBlock className="h-8 flex-1 rounded-lg" />
            </View>
        </View>
    );
}

export default function AddressSkeleton() {
    return (
        <View className="flex-1 bg-gray-50 pt-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <AddressCardSkeleton key={index} />
            ))}
        </View>
    );
}