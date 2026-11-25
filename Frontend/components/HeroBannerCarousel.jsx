import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Platform
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import api from "@/api/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Card width with 12px margin on both sides for a clean modern banner look
const BANNER_WIDTH = SCREEN_WIDTH - 24;
// Aspect ratio 16:7 ensures crisp rendering without distortion on all screen sizes
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * (7 / 16));

export default function HeroBannerCarousel() {
    const router = useRouter();
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const timerRef = useRef(null);

    const fetchBanners = async () => {
        try {
            const res = await api.get("/api/banners");
            if (res.data?.success && Array.isArray(res.data.data)) {
                setBanners(res.data.data);
            }
        } catch (err) {
            console.warn("fetchBanners error:", err?.message);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Auto-scroll carousel every 4.5 seconds if there are multiple banners
    useEffect(() => {
        if (banners.length <= 1) return;

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = (prev + 1) % banners.length;
                if (flatListRef.current) {
                    flatListRef.current.scrollToOffset({
                        offset: next * (BANNER_WIDTH + 12),
                        animated: true,
                    });
                }
                return next;
            });
        }, 4500);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [banners.length]);

    const handleScroll = (event) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / (BANNER_WIDTH + 12));
        if (index >= 0 && index < banners.length && index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    // Deep link navigation on banner press
    const handleBannerPress = useCallback(
        (banner) => {
            if (!banner || !banner.targetType) return;

            switch (banner.targetType) {
                case "CATEGORY":
                    // Opens product list filtered by Category
                    router.push({
                        pathname: "/(root)/product/product-list",
                        params: {
                            categoryId: String(banner.targetId),
                            title: banner.targetName || "Category Products",
                        },
                    });
                    break;

                case "SUB_CATEGORY":
                    // Opens product list filtered by Subcategory
                    router.push({
                        pathname: "/(root)/product/product-list",
                        params: {
                            subCategoryId: String(banner.targetId),
                            title: banner.targetName || "Products",
                        },
                    });
                    break;

                case "PRODUCT":
                    // Opens single Product details page
                    router.push(`/(root)/product/${banner.targetId}`);
                    break;

                case "VARIANT":
                    // Opens single Variant details page
                    if (banner.productId) {
                        router.push(`/(root)/product/${banner.productId}/${banner.targetId}`);
                    } else {
                        router.push(`/(root)/product/${banner.targetId}`);
                    }
                    break;

                default:
                    break;
            }
        },
        [router]
    );

    // Text position alignment helper
    const getTextPositionStyle = (pos) => {
        switch (pos) {
            case "TOP_LEFT":
                return { top: 14, left: 14, alignItems: "flex-start" };
            case "CENTER":
                return { top: "35%", left: 14, right: 14, alignItems: "center" };
            case "BOTTOM_CENTER":
                return { bottom: 14, left: 14, right: 14, alignItems: "center" };
            case "BOTTOM_LEFT":
            default:
                return { bottom: 14, left: 14, alignItems: "flex-start" };
        }
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={banners}
                keyExtractor={(item) => String(item.id)}
                horizontal
                pagingEnabled={false}
                snapToInterval={BANNER_WIDTH + 12}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.cardContainer}
                        onPress={() => handleBannerPress(item)}
                    >
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.bannerImage}
                            contentFit="cover"
                            transition={200}
                        />

                        {/* Subtle dark bottom gradient overlay to keep text crisp */}
                        <View style={styles.darkGradient} pointerEvents="none" />

                        {/* Custom Text Overlay */}
                        {item.text ? (
                            <View
                                style={[
                                    styles.textContainer,
                                    getTextPositionStyle(item.textPosition),
                                ]}
                                pointerEvents="none"
                            >
                                <Text
                                    style={[
                                        styles.overlayText,
                                        {
                                            color: item.textColor || "#FFFFFF",
                                            fontSize: item.textSize ? Number(item.textSize) : 18,
                                            fontWeight: item.isBold ? "700" : "400",
                                        },
                                    ]}
                                    numberOfLines={2}
                                >
                                    {item.text}
                                </Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>
                )}
            />

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <View style={styles.paginationContainer}>
                    {banners.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                currentIndex === i ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingTop: 4,
    },
    cardContainer: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        marginRight: 12,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: "#1F2937",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    darkGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.22)",
    },
    textContainer: {
        position: "absolute",
        maxWidth: "88%",
        paddingHorizontal: 6,
    },
    overlayText: {
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 0, height: 1.5 },
        textShadowRadius: 4,
        lineHeight: Platform.OS === "android" ? 24 : 26,
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        gap: 6,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        width: 18,
        backgroundColor: "#16A34A",
    },
    inactiveDot: {
        width: 6,
        backgroundColor: "#D1D5DB",
    },
});
