import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";


// =====================================
// Pulse Animation (shared by all bones)
// =====================================

const usePulse = () => {

    const opacity = useRef(new Animated.Value(0.55)).current;

    useEffect(() => {

        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.55,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        loop.start();

        return () => loop.stop();

    }, [opacity]);

    return opacity;

};


// =====================================
// Header Skeleton
// =====================================

const HeaderSkeleton = () => (

    <View className="flex-row items-center justify-between mb-4">

        <View>

            <View className="w-28 h-4 rounded-md bg-gray-200" />

            <View className="w-52 h-3 rounded-md bg-gray-200 mt-2" />

        </View>

        <View className="w-24 h-8 rounded-full bg-violet-100" />

    </View>

);


// =====================================
// Single Reward Card Skeleton
// =====================================

export const RewardCardSkeleton = () => (

    <View className="bg-white rounded-3xl border border-gray-100 mb-4 overflow-hidden">

        {/* Discount Header */}

        <View className="bg-violet-50 px-4 py-5 flex-row items-center justify-between">

            <View className="flex-1 pr-3">

                <View className="w-32 h-6 rounded-full bg-violet-100" />

                <View className="w-44 h-8 rounded-lg bg-violet-100 mt-3" />

                <View className="w-52 h-3 rounded-md bg-violet-100 mt-3" />

            </View>

            <View className="w-14 h-14 rounded-full bg-white" />

        </View>


        <View className="p-4">

            {/* Code Box */}

            <View className="h-14 rounded-xl bg-gray-100" />


            {/* Divider */}

            <View className="border-t border-dashed border-gray-200 my-4" />


            {/* Applicability */}

            <View className="w-28 h-3 rounded-md bg-gray-200 mb-3" />

            <View className="flex-row items-center bg-gray-50 rounded-2xl p-3">

                <View className="w-12 h-12 rounded-xl bg-gray-200" />

                <View className="flex-1 ml-3">

                    <View className="w-24 h-3 rounded-md bg-gray-200" />

                    <View className="w-40 h-4 rounded-md bg-gray-200 mt-2" />

                </View>

                <View className="w-12 h-4 rounded-md bg-gray-200" />

            </View>


            {/* Usage Section */}

            <View className="bg-gray-50 rounded-2xl p-3 mt-4">

                <View className="flex-row items-center justify-between mb-4">

                    <View className="w-28 h-4 rounded-md bg-gray-200" />

                    <View className="w-20 h-5 rounded-full bg-gray-200" />

                </View>

                <View className="flex-row">

                    <View className="flex-1">

                        <View className="w-8 h-3 rounded-md bg-gray-200" />

                        <View className="w-6 h-4 rounded-md bg-gray-200 mt-2" />

                    </View>

                    <View className="flex-1 items-center">

                        <View className="w-16 h-3 rounded-md bg-gray-200" />

                        <View className="w-8 h-4 rounded-md bg-gray-200 mt-2" />

                    </View>

                    <View className="flex-1 items-end">

                        <View className="w-14 h-3 rounded-md bg-gray-200" />

                        <View className="w-8 h-4 rounded-md bg-gray-200 mt-2" />

                    </View>

                </View>

                <View className="h-2 rounded-full bg-gray-200 mt-4" />

                <View className="w-32 h-3 rounded-md bg-gray-200 mt-2" />

            </View>


            {/* Footer */}

            <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">

                <View className="w-36 h-3 rounded-md bg-gray-200" />

                <View className="w-16 h-5 rounded-full bg-gray-200" />

            </View>

        </View>

    </View>

);


// =====================================
// Reward Skeleton (Header + N Cards)
// =====================================

const RewardSkeleton = ({ count = 3 }) => {

    const opacity = usePulse();

    return (

        <Animated.View style={{ flex: 1, opacity }}>

            <HeaderSkeleton />

            {Array.from({ length: count }).map((_, index) => (

                <RewardCardSkeleton key={index} />

            ))}

        </Animated.View>

    );

};


export default RewardSkeleton;