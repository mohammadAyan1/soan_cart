// components/ProductDetailsSkeleton.jsx
import { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

function ShimmerBlock({ className, style }) {
    const translateX = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(translateX, {
                toValue: width,
                duration: 1200,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View className={`bg-gray-200 overflow-hidden ${className}`} style={style}>
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

export default function ProductDetailsSkeleton() {
    return (
        <View className="flex-1 bg-white">
            {/* Main image skeleton */}
            <ShimmerBlock style={{ width, height: 340 }} />

            {/* Thumbnail strip skeleton */}
            <View className="flex-row px-4 py-3 gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ShimmerBlock
                        key={i}
                        className="rounded-xl"
                        style={{ width: 64, height: 64 }}
                    />
                ))}
            </View>

            <View className="px-4 pt-2">
                {/* Category tag */}
                <ShimmerBlock className="h-2.5 rounded w-[30%] mb-2" />

                {/* Product name */}
                <ShimmerBlock className="h-5 rounded w-[80%] mb-2" />

                {/* Variant description */}
                <ShimmerBlock className="h-3 rounded w-[50%] mb-3" />

                {/* Price row */}
                <View className="flex-row items-center gap-2 mb-2">
                    <ShimmerBlock className="h-6 rounded w-[25%]" />
                    <ShimmerBlock className="h-4 rounded w-[15%]" />
                    <ShimmerBlock className="h-4 rounded w-[15%]" />
                </View>

                {/* Stock text */}
                <ShimmerBlock className="h-2.5 rounded w-[35%] mb-4" />

                <View className="h-[1px] bg-gray-100 mb-4" />

                {/* Variant selector label */}
                <ShimmerBlock className="h-3 rounded w-[30%] mb-2.5" />

                {/* Variant thumbnails */}
                <View className="flex-row gap-2.5 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <ShimmerBlock
                            key={i}
                            className="rounded-xl"
                            style={{ width: 56, height: 56 }}
                        />
                    ))}
                </View>

                <View className="h-[1px] bg-gray-100 mb-4" />

                {/* Description */}
                <ShimmerBlock className="h-3 rounded w-[35%] mb-2" />
                <ShimmerBlock className="h-2.5 rounded w-full mb-1.5" />
                <ShimmerBlock className="h-2.5 rounded w-full mb-1.5" />
                <ShimmerBlock className="h-2.5 rounded w-[60%] mb-4" />
            </View>
        </View>
    );
}