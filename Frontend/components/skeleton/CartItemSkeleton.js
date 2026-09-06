// components/CartItemSkeleton.jsx
import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function ShimmerBlock({ style }) {
    return <Animated.View style={[{ backgroundColor: "#E5E7EB", borderRadius: 6 }, style]} />;
}

export default function CartItemSkeleton() {
    const shimmer = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0.4, duration: 600, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View
            style={{ opacity: shimmer }}
            className="flex-row bg-white p-3 rounded-2xl mb-3 border border-gray-100"
        >
            {/* Image placeholder */}
            <ShimmerBlock style={{ width: 96, height: 96, borderRadius: 12 }} />

            {/* Details placeholder */}
            <View className="flex-1 ml-3 justify-between">
                <View>
                    <View className="flex-row items-start justify-between">
                        <ShimmerBlock style={{ width: "70%", height: 14, borderRadius: 4 }} />
                        <ShimmerBlock style={{ width: 18, height: 18, borderRadius: 9 }} />
                    </View>

                    <ShimmerBlock style={{ width: "45%", height: 10, borderRadius: 4, marginTop: 8 }} />

                    <View className="flex-row gap-1.5 mt-2">
                        <ShimmerBlock style={{ width: 40, height: 16, borderRadius: 8 }} />
                        <ShimmerBlock style={{ width: 40, height: 16, borderRadius: 8 }} />
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                    <View>
                        <ShimmerBlock style={{ width: 60, height: 16, borderRadius: 4 }} />
                        <ShimmerBlock style={{ width: 50, height: 10, borderRadius: 4, marginTop: 6 }} />
                    </View>
                    <ShimmerBlock style={{ width: 80, height: 28, borderRadius: 14 }} />
                </View>
            </View>
        </Animated.View>
    );
}