// components/skeleton/HeaderSkeleton.js
import { View, Platform, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CIRCLE_SIZE = 42;
const HEADER_GRADIENT_COLORS = ["#FFA733", "#FF7A45", "#ffffff"];
const HEADER_GRADIENT_LOCATIONS = [0, 0.55, 1];

export default function HeaderSkeleton() {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const itemWidth = (width - 40) / 5;
    const skeletonCategories = [1, 2, 3, 4, 5];

    return (
        <LinearGradient
            colors={HEADER_GRADIENT_COLORS}
            locations={HEADER_GRADIENT_LOCATIONS}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
                paddingHorizontal: 20,
                paddingTop: insets.top + (Platform.OS === "ios" ? 12 : 16),
                paddingBottom: 25,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6,
                zIndex: 100,
                overflow: "hidden",
            }}
        >
            {/* Search Bar Row */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                    style={{
                        flex: 1,
                        height: 40,
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                    }}
                >
                    {/* Search Icon Placeholder */}
                    <View
                        style={{
                            width: 17,
                            height: 17,
                            backgroundColor: "#E5E7EB",
                            borderRadius: 4,
                        }}
                    />
                    {/* Text Placeholder */}
                    <View
                        style={{
                            height: 14,
                            width: 120,
                            backgroundColor: "#E5E7EB",
                            borderRadius: 4,
                            marginLeft: 10,
                        }}
                    />
                </View>
            </View>

            {/* Address Row Placeholder */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, height: 28 }}>
                <View
                    style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        borderRadius: 3,
                    }}
                />
                <View
                    style={{
                        height: 12,
                        width: "60%",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        borderRadius: 4,
                        marginLeft: 6,
                    }}
                />
            </View>

            {/* Category Strip Placeholder */}
            <View style={{ flexDirection: "row", marginTop: 8, paddingHorizontal: 0 }}>
                {skeletonCategories.map((_, index) => (
                    <View
                        key={index}
                        style={{
                            width: itemWidth,
                            alignItems: "center",
                        }}
                    >
                        {/* Circular Image Placeholder */}
                        <View
                            style={{
                                width: CIRCLE_SIZE,
                                height: CIRCLE_SIZE,
                                borderRadius: CIRCLE_SIZE / 2,
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                marginBottom: 4,
                            }}
                        />
                        {/* Label Placeholder */}
                        <View
                            style={{
                                width: itemWidth - 16,
                                height: 8,
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                borderRadius: 3,
                            }}
                        />
                    </View>
                ))}
            </View>
        </LinearGradient>
    );
}