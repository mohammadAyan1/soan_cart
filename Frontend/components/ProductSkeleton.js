// components/ProductSkeleton.jsx
import { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

function ShimmerBlock({ className }) {
    const translateX = useRef(new Animated.Value(-CARD_WIDTH)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(translateX, {
                toValue: CARD_WIDTH,
                duration: 1200,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View className={`bg-gray-200 overflow-hidden ${className}`}>
            <Animated.View
                className="absolute inset-0"
                style={{ transform: [{ translateX }] }}
            >
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
}

function SingleSkeletonCard() {
    return (
        <View
            className="bg-white rounded-2xl overflow-hidden mb-4"
            style={{ width: CARD_WIDTH }}
        >
            <ShimmerBlock className="w-full h-[130px]" />
            <View className="p-2">
                <ShimmerBlock className="h-3 rounded mt-2 w-[90%]" />
                <ShimmerBlock className="h-2.5 rounded mt-1.5 w-[70%]" />
                <ShimmerBlock className="h-2.5 rounded mt-1.5 w-[40%]" />
                <ShimmerBlock className="h-8 rounded-lg mt-2.5 w-full" />
            </View>
        </View>
    );
}

// Home screen me 6 skeleton cards ek sath dikhane ke liye
export default function ProductSkeletonGrid({ count = 6 }) {
    return (
        <View className="flex-row flex-wrap justify-between px-3 pt-3">
            {Array.from({ length: count }).map((_, index) => (
                <SingleSkeletonCard key={index} />
            ))}
        </View>
    );
}