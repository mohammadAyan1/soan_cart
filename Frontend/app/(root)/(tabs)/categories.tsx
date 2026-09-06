
// app/(root)/(tabs)/categories.js
import { useEffect, useState, useRef, useMemo } from "react";
import {
    View,
    Text,
    Animated,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
    PanResponder,
} from "react-native";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { trackEvent, triggerScreenExit } from "@/utils/eventTracker"; // 👈 NAYA IMPORT

import CategorySidebar from "@/components/category/CategorySidebar";
import SubCategoryCard from "@/components/category/SubCategoryCard";
import { fetchProductsCategory, resetProductsCategory } from "@/redux/slices/productCategory";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabled) {
    UIManager.setLayoutAnimationEnabled(true);
}

const SWIPE_THRESHOLD = 60;
const SIDEBAR_WIDTH = 96; // 👈 CategorySidebar ki width ke saath match hona chahiye

// ---------- Skeleton (Timing / Opacity shimmer) ----------
function SkeletonGrid({ offsetLeft = 0 }) {
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 8, paddingLeft: 8 + offsetLeft }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Animated.View
                    key={i}
                    style={{
                        opacity: shimmer,
                        width: "33.33%",
                        padding: 8,
                        alignItems: "center",
                    }}
                >
                    <View style={{ width: 84, height: 84, borderRadius: 16, backgroundColor: "#E5E7EB" }} />
                    <View style={{ width: 60, height: 10, borderRadius: 4, backgroundColor: "#E5E7EB", marginTop: 10 }} />
                </Animated.View>
            ))}
        </View>
    );
}

export default function CategoriesScreen({ screenName = "category_tab", source = "category_grid" }) {
    const dispatch = useDispatch();
    const { tree, loading, refreshing, error } = useSelector((state) => state.category);

    const [activeId, setActiveId] = useState(null);
    const [sortBy, setSortBy] = useState("Default");

    // Cross-fade + Slide + Translate Animation (content switch)
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentTranslateX = useRef(new Animated.Value(0)).current;

    // Parallax Animation on scroll
    const scrollY = useRef(new Animated.Value(0)).current;

    const didFetchRef = useRef(false); // StrictMode double-call guard

    // Pehli baar tree fetch karo
    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        dispatch(fetchProductsCategory());
    }, [dispatch]);

    // Jab tree pehli baar aaye, pehla category active select karo
    useEffect(() => {
        if (tree.length > 0) {
            setActiveId((prev) => prev ?? tree[0].id);
        }
    }, [tree]);

    const onRefresh = () => {
        dispatch(resetProductsCategory())
        dispatch(fetchProductsCategory());
    };

    const activeCategory = useMemo(
        () => tree.find((c) => c.id === activeId),
        [tree, activeId]
    );

    const subCategories = useMemo(() => {
        const list = activeCategory?.subCategories ?? [];
        if (sortBy === "A-Z") {
            return [...list].sort((a, b) =>
                a.productSubCategoryName.localeCompare(b.productSubCategoryName)
            );
        }
        if (sortBy === "Newest") {
            return [...list].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        }
        return list;
    }, [activeCategory, sortBy]);

    // Category switch -> Fade + Slide + Layout animation
    const runSwitchAnimation = (direction = 0) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        contentOpacity.setValue(0);
        contentTranslateX.setValue(direction * 24);

        Animated.parallel([
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.spring(contentTranslateX, {
                toValue: 0,
                friction: 8,
                tension: 70,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleSelectCategory = (item) => {
        if (item.id === activeId) return;
        const oldIndex = tree.findIndex((c) => c.id === activeId);
        const newIndex = tree.findIndex((c) => c.id === item.id);
        runSwitchAnimation(newIndex > oldIndex ? 1 : -1);
        setActiveId(item.id);

        trackEvent({
            eventType: "CATEGORY_CLICK",
            screen: screenName,
            categoryId: activeCategory.id,
            // subCategoryId: sub?.id,
            source: "Side_Category_Click", // kis section se click hua (e.g. "product_grid", "featured_section")
        });
    };

    // Swipe Animation: left/right swipe on grid to move between categories
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
            onPanResponderMove: (_, g) => {
                contentTranslateX.setValue(g.dx * 0.3);
            },
            onPanResponderRelease: (_, g) => {
                const idx = tree.findIndex((c) => c.id === activeId);
                if (g.dx < -SWIPE_THRESHOLD && idx < tree.length - 1) {
                    handleSelectCategory(tree[idx + 1]);
                } else if (g.dx > SWIPE_THRESHOLD && idx > 0) {
                    handleSelectCategory(tree[idx - 1]);
                } else {
                    Animated.spring(contentTranslateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const headerTranslate = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -20],
        extrapolate: "clamp",
    });

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>
                    All Categories
                </Text>
            </View>

            {/* 👇 flexDirection: row hataya, ab position: relative container hai */}
            <View style={{ flex: 1 }}>
                {tree.length > 0 && (
                    // 👇 Sidebar ab overlay hai — layout se width nahi le raha
                    <View
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: SIDEBAR_WIDTH,
                            zIndex: 10,
                        }}
                    >
                        <CategorySidebar
                            categories={tree}
                            activeId={activeId}
                            onSelect={handleSelectCategory}
                        />
                    </View>
                )}

                {/* 👇 Ye ab poori screen width leta hai — FlatList/RefreshControl isi ke andar center hoga */}
                <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                    {loading ? (
                        <SkeletonGrid offsetLeft={tree.length > 0 ? SIDEBAR_WIDTH : 0} />
                    ) : error ? (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 24,
                                paddingLeft: 24 + (tree.length > 0 ? SIDEBAR_WIDTH : 0),
                            }}
                        >
                            <Text style={{ color: "#DC2626", textAlign: "center" }}>{error}</Text>
                        </View>
                    ) : (
                        <Animated.View
                            style={{
                                flex: 1,
                                opacity: contentOpacity,
                                transform: [{ translateX: contentTranslateX }],
                            }}
                        >
                            <Animated.FlatList
                                data={subCategories}
                                keyExtractor={(item) => String(item.id)}
                                numColumns={3}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: true }
                                )}
                                scrollEventThrottle={16}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={["#16a34a"]}
                                    />
                                }
                                ListHeaderComponent={
                                    <Animated.View style={{ transform: [{ translateY: headerTranslate }] }}>
                                        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                                            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
                                                {activeCategory?.productCategoryName}
                                            </Text>
                                        </View>
                                    </Animated.View>
                                }
                                ListEmptyComponent={
                                    <View style={{ padding: 32, alignItems: "center" }}>
                                        <Text style={{ color: "#6B7280" }}>
                                            Is category me abhi koi sub category nahi hai.
                                        </Text>
                                    </View>
                                }
                                renderItem={({ item, index }) => (
                                    <SubCategoryCard
                                        item={item}
                                        index={index}
                                        onPress={(sub) => {

                                            trackEvent({
                                                eventType: "SUB_CATEGORY_CLICK",
                                                screen: screenName,
                                                categoryId: activeCategory.id,
                                                subCategoryId: sub?.id,
                                                source, // kis section se click hua (e.g. "product_grid", "featured_section")
                                            });
                                            triggerScreenExit()
                                            router.push({
                                                pathname: "/(root)/product/product-list",
                                                params: {
                                                    subCategoryId: sub.id,
                                                    categoryId: activeCategory?.id,
                                                    title: sub.productSubCategoryName,
                                                },
                                            });
                                        }}
                                    />
                                )}
                                // 👇 YAHI ASLI FIX HAI: FlatList poori screen width ka hai (RefreshControl
                                // isi ke center me aayega), sirf CONTENT ko paddingLeft se sidebar
                                // ke peeche se hata rahe hain
                                contentContainerStyle={{
                                    paddingLeft: tree.length > 0 ? SIDEBAR_WIDTH : 0,
                                    paddingBottom: 100,
                                }}
                            />
                        </Animated.View>
                    )}
                </View>
            </View>
        </View>
    );
}