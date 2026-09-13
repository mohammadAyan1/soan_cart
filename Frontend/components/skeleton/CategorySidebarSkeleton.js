// components/category/CategorySidebarSkeleton.jsx
import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

const ITEM_HEIGHT = 92;
const ITEM_COUNT = 6;

export default function CategorySidebarSkeleton() {
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
        <View style={{ flex: 1, width: 96, backgroundColor: "#F9FAFB" }}>
            {Array.from({ length: ITEM_COUNT }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        height: ITEM_HEIGHT,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Animated.View
                        style={{
                            opacity: shimmer,
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            backgroundColor: "#E5E7EB",
                        }}
                    />
                    <Animated.View
                        style={{
                            opacity: shimmer,
                            marginTop: 6,
                            width: 60,
                            height: 10,
                            borderRadius: 4,
                            backgroundColor: "#E5E7EB",
                        }}
                    />
                </View>
            ))}
        </View>
    );
}