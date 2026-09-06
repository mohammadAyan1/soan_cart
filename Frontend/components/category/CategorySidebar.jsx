// components/category/CategorySidebar.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    // Image,
    Pressable,
    Animated,
    ScrollView,
    Platform,
} from "react-native";
import { Image } from "expo-image";

const ITEM_HEIGHT = 92;

function SidebarItem({ item, isActive, onPress, onMeasure }) {
    // Scale + Press Animation
    const scaleAnim = useRef(new Animated.Value(1)).current;
    // Color Transition + Background Fill Animation
    const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
    // Morph Animation (square -> circle on active icon container)
    const radiusAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(activeAnim, {
            toValue: isActive ? 1 : 0,
            duration: 250,
            useNativeDriver: false, // backgroundColor / borderRadius can't use native driver
        }).start();

        Animated.timing(radiusAnim, {
            toValue: isActive ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isActive]);

    const handlePressIn = () => {
        // Press / Bounce Animation
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        // Elastic Animation on release
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
        }).start();
    };

    const bgColor = activeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#F3F4F6", "#EFF6FF"],
    });

    const textColor = activeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#374151", "#2563EB"],
    });

    const iconRadius = radiusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 999], // Morph: rounded-square -> circle
    });

    return (
        <Pressable
            onPress={() => onPress(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLayout={(e) => onMeasure(item.id, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}
            android_ripple={{ color: "#DBEAFE" }} // Ripple Animation (Android)
            style={{ height: ITEM_HEIGHT, alignItems: "center", justifyContent: "center" }}
        >
            <Animated.View
                style={{
                    transform: [{ scale: scaleAnim }],
                    alignItems: "center",
                }}
            >
                <Animated.View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: iconRadius, // Morph Animation
                        backgroundColor: bgColor, // Background Fill Animation
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        elevation: isActive ? 4 : 0, // Elevation / Shadow Animation
                        shadowColor: "#2563EB",
                        shadowOpacity: isActive ? 0.25 : 0,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                    }}
                >
                    {item.imageUrl ? (


                        <Image
                            source={item.imageUrl}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            style={{ width: 40, height: 40, borderRadius: 8 }}
                        />
                    ) : (
                        <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#E5E7EB" }} />
                    )}
                </Animated.View>

                <Animated.Text
                    numberOfLines={2}
                    style={{
                        marginTop: 6,
                        fontSize: 12,
                        fontWeight: isActive ? "700" : "500",
                        color: textColor, // Color Transition Animation
                        textAlign: "center",
                        width: 84,
                    }}
                >
                    {item.productCategoryName}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
}

export default function CategorySidebar({ categories, activeId, onSelect }) {
    const layouts = useRef({}).current; // id -> { y, height }
    const indicatorY = useRef(new Animated.Value(0)).current;
    const indicatorH = useRef(new Animated.Value(ITEM_HEIGHT)).current;
    const [ready, setReady] = useState(false);

    const measure = useCallback((id, y, height) => {
        layouts[id] = { y, height };
        if (id === activeId) {
            indicatorY.setValue(y);
            indicatorH.setValue(height);
            setReady(true);
        }
    }, [activeId]);

    useEffect(() => {
        const pos = layouts[activeId];
        if (!pos) return;

        // Sliding Indicator Animation (Spring)
        Animated.spring(indicatorY, {
            toValue: pos.y,
            friction: 8,
            tension: 60,
            useNativeDriver: true,
        }).start();

        // Height Expansion Animation
        Animated.timing(indicatorH, {
            toValue: pos.height,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [activeId, categories.length]);

    return (
        <View style={{ flex: 1, width: 96, backgroundColor: "#fff" }}>
            <View style={{ flex: 1 }}>
                {ready && (
                    <Animated.View
                        style={{
                            position: "absolute",
                            left: 0,
                            transform: [{ translateY: indicatorY }], // native-driven
                        }}
                    >
                        <Animated.View
                            style={{
                                width: 4,
                                borderRadius: 4,
                                backgroundColor: "#2563EB",
                                height: indicatorH, // JS-driven (height unsupported by native driver)
                            }}
                        />
                    </Animated.View>
                )}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ backgroundColor: "#F9FAFB" }}
                >
                    {categories.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isActive={item.id === activeId}
                            onPress={onSelect}
                            onMeasure={measure}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}