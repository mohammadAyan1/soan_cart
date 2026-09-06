// components/category/SubCategoryCard.jsx
import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
export default function SubCategoryCard({ item, index, onPress }) {
    // Stagger + Reveal Animation
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(24)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(index * 60), // Stagger Animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 7,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 5,
                    tension: 80,
                    useNativeDriver: true, // Elastic/Bounce reveal
                }),
            ]),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.92, // Press Animation
            friction: 6,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1, // Bounce back
            friction: 3,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }, { scale }],
                width: "33.33%",
                padding: 8,
            }}
        >
            <Pressable
                onPress={() => onPress(item)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "#E5E7EB", borderless: false }}
                style={{ alignItems: "center" }}
            >
                <View
                    style={{
                        width: 84,
                        height: 84,
                        borderRadius: 16,
                        backgroundColor: "#F1F5F9",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                    }}
                >
                    {item.imageUrl ? (
                        <Image
                            source={item.imageUrl}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            style={{ width: 84, height: 84 }}

                        />
                    ) : (
                        <View style={{ width: 84, height: 84, backgroundColor: "#E2E8F0" }} />
                    )}
                </View>

                <Text
                    numberOfLines={2}
                    style={{
                        marginTop: 8,
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#111827",
                        textAlign: "center",
                    }}
                >
                    {item.productSubCategoryName}
                </Text>
            </Pressable>
        </Animated.View>
    );
}