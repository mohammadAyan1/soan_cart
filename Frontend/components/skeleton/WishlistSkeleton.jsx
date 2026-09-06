// 📁 Save at: components/skeleton/WishlistSkeleton.jsx

import { View } from "react-native";
import { useEffect } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

// ------------------------------------------------------------------
// Ek pulsing gray box - skeleton ka basic building block
// ------------------------------------------------------------------
function Bone({ style, className = "" }) {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View className={`bg-gray-200 rounded-md ${className}`} style={[animatedStyle, style]} />
    );
}

// ------------------------------------------------------------------
// Ek product card jaisa skeleton
// ------------------------------------------------------------------
function WishlistCardSkeleton() {
    return (
        <View className="w-[48%] bg-white rounded-xl overflow-hidden mb-3">
            <Bone style={{ width: "100%", aspectRatio: 1, borderRadius: 0 }} />
            <View className="p-2.5">
                <Bone style={{ width: "90%", height: 12 }} />
                <Bone style={{ width: "60%", height: 12, marginTop: 6 }} />
                <Bone style={{ width: "40%", height: 14, marginTop: 8 }} />
            </View>
        </View>
    );
}

// ------------------------------------------------------------------
// Poora Wishlist screen skeleton (jab tak page pe pehli baar data aaye)
// ------------------------------------------------------------------
export default function WishlistSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                <Bone style={{ width: 22, height: 22, borderRadius: 4 }} />
                <Bone style={{ width: 110, height: 16 }} />
            </View>

            <View className="flex-row flex-wrap justify-between px-4 pt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <WishlistCardSkeleton key={i} />
                ))}
            </View>
        </View>
    );
}