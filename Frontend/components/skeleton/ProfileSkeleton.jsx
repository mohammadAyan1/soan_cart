// components/ProfileSkeleton.jsx
import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

function ShimmerBlock({ className }) {
    const translateX = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(translateX, {
                toValue: 150,
                duration: 1200,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View className={`bg-gray-200 overflow-hidden ${className}`}>
            <Animated.View className="absolute inset-0" style={{ transform: [{ translateX }] }}>
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

function Row({ height = 52 }) {
    return (
        <View
            className="flex-row items-center gap-3 px-4 border-b border-gray-100"
            style={{ height }}
        >
            <ShimmerBlock className="w-5 h-5 rounded" />
            <ShimmerBlock className="h-3 rounded flex-1 max-w-[55%]" />
        </View>
    );
}

export default function ProfileSkeleton() {
    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-5 flex-row items-center gap-4">
                <ShimmerBlock className="w-16 h-16 rounded-full" />
                <View className="flex-1">
                    <ShimmerBlock className="h-4 rounded w-[60%] mb-2" />
                    <ShimmerBlock className="h-3 rounded w-[80%]" />
                </View>
            </View>

            {/* Orders card */}
            <View className="bg-white mt-2 mx-4 rounded-xl p-4 flex-row items-center gap-3">
                <ShimmerBlock className="w-10 h-10 rounded-full" />
                <View className="flex-1">
                    <ShimmerBlock className="h-3 rounded w-[40%] mb-2" />
                    <ShimmerBlock className="h-2.5 rounded w-[60%]" />
                </View>
            </View>

            {/* Quick actions row */}
            <View className="bg-white mt-3 mx-4 rounded-xl flex-row items-center justify-between px-4 py-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <View key={i} className="items-center flex-1">
                        <ShimmerBlock className="w-11 h-11 rounded-full mb-1" />
                        <ShimmerBlock className="h-2.5 rounded w-10" />
                    </View>
                ))}
            </View>

            {/* Help center */}
            <View className="bg-white mt-3 mx-4 rounded-xl overflow-hidden">
                <Row />
            </View>

            {/* Account settings block */}
            <View className="bg-white mt-4 mx-4 rounded-xl overflow-hidden">
                <Row />
                <Row />
                <Row />
                <Row />
            </View>

            {/* Activity block */}
            <View className="bg-white mt-4 mx-4 rounded-xl overflow-hidden">
                <Row />
                <Row />
            </View>

            {/* Others block */}
            <View className="bg-white mt-4 mx-4 rounded-xl overflow-hidden">
                <Row />
                <Row />
            </View>
        </View>
    );
}