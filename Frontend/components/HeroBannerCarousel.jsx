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
// ================= OLD CODE (COMMENTED) =================
// // Aspect ratio 16:7 ensures crisp rendering without distortion on all screen sizes
// const BANNER_HEIGHT = Math.round(BANNER_WIDTH * (7 / 16));
// ========================================================
// Instamart-style roomy height (~195px) for spacious title, subtitle & CTA button
const BANNER_HEIGHT = 195;

// Helper to safely parse multi-row text overlay & CTA button
const parseBannerOverlay = (textString, fallbackSize, fallbackColor, fallbackBold) => {
    if (!textString) return { rows: [], cta: null };
    try {
        const parsed = JSON.parse(textString);
        if (parsed && Array.isArray(parsed.rows)) {
            return { rows: parsed.rows, cta: parsed.cta || null };
        } else if (Array.isArray(parsed)) {
            return { rows: parsed, cta: null };
        } else {
            return {
                rows: [
                    {
                        text: textString,
                        fontSize: fallbackSize || 20,
                        color: fallbackColor || "#FFFFFF",
                        fontWeight: fallbackBold ? "700" : "400",
                        fontStyle: "normal",
                    },
                ],
                cta: null,
            };
        }
    } catch {
        return {
            rows: [
                {
                    text: textString,
                    fontSize: fallbackSize || 20,
                    color: fallbackColor || "#FFFFFF",
                    fontWeight: fallbackBold ? "700" : "400",
                    fontStyle: "normal",
                },
            ],
            cta: null,
        };
    }
};

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
                renderItem={({ item }) => {
                    const overlayData = parseBannerOverlay(
                        item.text,
                        item.textSize,
                        item.textColor,
                        item.isBold
                    );

                    return (
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

                            {/* Subtle dark gradient overlay to keep text and CTA crisp */}
                            <View style={styles.darkGradient} pointerEvents="none" />

                            {/* ================= OLD CODE (COMMENTED) ================= */}
                            {/* {item.text ? (
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
                            ) : null} */}
                            {/* ======================================================== */}

                            {/* 👇 NAYA: Dynamic Multi-Row Text Overlay & Instamart CTA Button */}
                            {(overlayData.rows.length > 0 || overlayData.cta?.show) && (
                                <View
                                    style={[
                                        styles.textContainer,
                                        getTextPositionStyle(item.textPosition),
                                    ]}
                                    pointerEvents="none"
                                >
                                    {overlayData.rows.map((row, idx) => (
                                        <Text
                                            key={idx}
                                            style={[
                                                styles.overlayText,
                                                {
                                                    color: row.color || "#FFFFFF",
                                                    fontSize: row.fontSize
                                                        ? Number(row.fontSize)
                                                        : idx === 0
                                                        ? 20
                                                        : 13,
                                                    fontWeight:
                                                        row.fontWeight === "bold" || row.fontWeight === "700" || row.fontWeight === "900"
                                                            ? "700"
                                                            : "400",
                                                    fontStyle: row.fontStyle || "normal",
                                                    fontFamily:
                                                        row.fontFamily === "serif"
                                                            ? Platform.OS === "android"
                                                                ? "serif"
                                                                : "Georgia"
                                                            : undefined,
                                                },
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {row.text}
                                        </Text>
                                    ))}

                                    {/* Instamart Style Pill CTA Button */}
                                    {overlayData.cta && overlayData.cta.show && (
                                        <View
                                            style={[
                                                styles.ctaPill,
                                                {
                                                    backgroundColor:
                                                        overlayData.cta.bgColor || "#E11D48",
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.ctaText,
                                                    {
                                                        color:
                                                            overlayData.cta.textColor ||
                                                            "#FFFFFF",
                                                    },
                                                ]}
                                            >
                                                {overlayData.cta.text || "SHOP NOW"}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* ================= OLD CODE (COMMENTED) ================= */}
            {/* {banners.length > 1 && (
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
            )} */}
            {/* ======================================================== */}

            {/* 👇 NAYA: Instamart-Style Floating Pagination Pill: [ 1/7 • • • • ] */}
            {banners.length > 1 && (
                <View style={styles.instamartBadgeContainer}>
                    <View style={styles.instamartBadge}>
                        <Text style={styles.instamartBadgeCount}>
                            {currentIndex + 1}/{banners.length}
                        </Text>
                        <View style={styles.badgeDotRow}>
                            {banners.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.badgeDot,
                                        currentIndex === i
                                            ? styles.badgeActiveDot
                                            : styles.badgeInactiveDot,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 6,
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingTop: 2,
    },
    cardContainer: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        marginRight: 12,
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: "#1F2937",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    darkGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    textContainer: {
        position: "absolute",
        maxWidth: "85%",
        paddingHorizontal: 8,
    },
    overlayText: {
        textShadowColor: "rgba(0, 0, 0, 0.85)",
        textShadowOffset: { width: 0, height: 1.5 },
        textShadowRadius: 4,
        lineHeight: Platform.OS === "android" ? 24 : 26,
        marginBottom: 2,
    },
    ctaPill: {
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        marginTop: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    ctaText: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    // Instamart-style Pagination Capsule Pill
    instamartBadgeContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    instamartBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(30, 41, 59, 0.88)",
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 7,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    instamartBadgeCount: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    badgeDotRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    badgeDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    badgeActiveDot: {
        backgroundColor: "#FFFFFF",
    },
    badgeInactiveDot: {
        backgroundColor: "rgba(255, 255, 255, 0.35)",
    },
});
