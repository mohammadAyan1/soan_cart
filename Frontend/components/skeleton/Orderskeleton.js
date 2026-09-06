// 📁 Save at: components/skeleton/OrderSkeleton.jsx

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
        <Animated.View
            className={`bg-gray-200 rounded-md ${className}`}
            style={[animatedStyle, style]}
        />
    );
}

// ------------------------------------------------------------------
// Ek order card jaisa skeleton
// ------------------------------------------------------------------
function OrderCardSkeleton() {
    return (
        <View
            className="bg-white mx-4 mt-3 rounded-xl p-4"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                    <Bone style={{ width: 36, height: 36, borderRadius: 18 }} />
                    <View className="flex-1">
                        <Bone style={{ width: "50%", height: 12 }} />
                        <Bone style={{ width: "35%", height: 10, marginTop: 6 }} />
                    </View>
                </View>
                <Bone style={{ width: 20, height: 20, borderRadius: 4 }} />
            </View>

            <View className="flex-row items-center justify-between mt-4">
                <Bone style={{ width: "40%", height: 10 }} />
                <Bone style={{ width: "20%", height: 14 }} />
            </View>
            <Bone style={{ width: "25%", height: 10, marginTop: 8 }} />
        </View>
    );
}

// ------------------------------------------------------------------
// Poora Orders screen skeleton (jab tak page pe pehli baar data aaye)
// ------------------------------------------------------------------
export default function OrderSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                <Bone style={{ width: 22, height: 22, borderRadius: 4 }} />
                <Bone style={{ width: 100, height: 16 }} />
            </View>

            {[1, 2, 3, 4].map((i) => (
                <OrderCardSkeleton key={i} />
            ))}
        </View>
    );
}