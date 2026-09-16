// app/(root)/category/[id].js
import { useEffect, useCallback } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import {
    fetchProductsByCategory,
    resetCategoryProducts,
} from "../../redux/slices/productSlice";
import { trackEvent, triggerScreenExit, getCurrentScreen } from "../../utils/eventTracker";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const SCREEN_NAME = "category_detail_page";

export default function CategoryDetailScreen() {
    const { id, title } = useLocalSearchParams();
    const categoryId = Number(id);
    const insets = useSafeAreaInsets();


    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const numColumns = 2;
    const cardWidth = (width - 16 * 2 - 12 * (numColumns - 1)) / numColumns;

    const { items, subCategories, loading, refreshing, error, hasNextPage, page } =
        useSelector((state) => state.products.categoryProducts);

    // 👇 pehli baar page open hote hi data fetch karo
    useEffect(() => {
        dispatch(resetCategoryProducts());
        dispatch(fetchProductsByCategory({ categoryId, page: 1, limit: 10 }));
    }, [categoryId]);

    // 👇 SCREEN_VIEW / SCREEN_EXIT tracking, baaki pages ki tarah
    useFocusEffect(
        useCallback(() => {
            trackEvent({
                eventType: "SCREEN_VIEW",
                screen: SCREEN_NAME,
                // referrerScreen: getCurrentScreen(),
                source: "category_navigation",
            });

            return () => {
                if (getCurrentScreen() === SCREEN_NAME) {
                    triggerScreenExit();
                }
            };
        }, [])
    );

    const onRefresh = () => {
        dispatch(resetCategoryProducts());
        dispatch(fetchProductsByCategory({ categoryId, page: 1, limit: 10, isRefresh: true }));
    };

    const onEndReached = () => {
        if (!loading && hasNextPage) {
            dispatch(fetchProductsByCategory({ categoryId, page: page + 1, limit: 10 }));
        }
    };

    // 👇 subcategory pe click -> product-list page (sirf usi category+subcategory ke products)
    const handleSubCategoryPress = (sub) => {
        trackEvent({
            eventType: "SUB_CATEGORY_CLICK",
            screen: SCREEN_NAME,
            categoryId,
            subCategoryId: sub.id,
            source: "category_detail_subcategory_row",
        });
        triggerScreenExit();
        router.push({
            pathname: "/(root)/product/product-list",
            params: {
                categoryId,
                subCategoryId: sub.id,
                title: sub.productSubCategoryName,
            },
        });
    };

    // 👇 product pe click -> product details page
    const handleProductPress = (product) => {
        trackEvent({
            eventType: "PRODUCT_CLICK",
            screen: SCREEN_NAME,
            categoryId,
            productId: product.id,
            source: "category_detail_product_grid",
        });
        triggerScreenExit();
        router.push({
            pathname: "/(root)/product/[id]",
            params: { id: product.id },
        });
    };

    const renderSubCategories = () => {
        if (subCategories.length === 0) return null;

        return (
            <View style={{ marginTop: 12, marginBottom: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", paddingHorizontal: 16, marginBottom: 10 }}>
                    Shop by Sub Category
                </Text>
                <FlatList
                    data={subCategories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSubCategoryPress(item)}
                            activeOpacity={0.7}
                            style={{ alignItems: "center", marginRight: 16, width: 74 }}
                        >
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 16,
                                    backgroundColor: "#F3F4F6",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                }}
                            >
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={{ width: 64, height: 64 }}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text style={{ fontSize: 20 }}>🗂️</Text>
                                )}
                            </View>
                            <Text
                                numberOfLines={2}
                                style={{ fontSize: 12, color: "#374151", marginTop: 6, textAlign: "center" }}
                            >
                                {item.productSubCategoryName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    };

    const renderProductCard = ({ item }) => {
        const variant = item.variants?.[0];
        const image = variant?.images?.[0]?.imageUrl;

        return (
            <TouchableOpacity
                onPress={() => handleProductPress(item)}
                activeOpacity={0.8}
                style={{
                    width: cardWidth,
                    marginBottom: 16,
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#F3F4F6",
                }}
            >
                <View style={{ width: cardWidth, height: cardWidth, backgroundColor: "#F9FAFB" }}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 24 }}>🛒</Text>
                        </View>
                    )}
                </View>
                <View style={{ padding: 10 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>
                        {item.productName}
                    </Text>
                    {variant && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                            <Text style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>
                                ₹{Number(variant.actualPrice)}
                            </Text>
                            {variant.showMrp && Number(variant.mrp) > Number(variant.actualPrice) && (
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: "#9CA3AF",
                                        textDecorationLine: "line-through",
                                        marginLeft: 6,
                                    }}
                                >
                                    ₹{Number(variant.mrp)}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && items.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
                <ActivityIndicator size="small" color="#16a34a" />
            </View>
        );
    }

    if (error && items.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" }}>
                <Text style={{ color: "#DC2626", textAlign: "center" }}>{error}</Text>
            </View>
        );
    }

    return (

        // <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>

        <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                numColumns={numColumns}
                columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: "space-between" }}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
                }
                ListHeaderComponent={
                    <View>
                        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
                                {title || "Category"}
                            </Text>
                        </View>
                        {renderSubCategories()}
                        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", paddingHorizontal: 16, marginTop: 16, marginBottom: 10 }}>
                            All Products
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={{ padding: 32, alignItems: "center" }}>
                        <Text style={{ color: "#6B7280" }}>Is category me abhi koi product nahi hai.</Text>
                    </View>
                }
                ListFooterComponent={
                    loading && items.length > 0 ? (
                        <View style={{ paddingVertical: 16 }}>
                            <ActivityIndicator size="small" color="#16a34a" />
                        </View>
                    ) : null
                }
                renderItem={renderProductCard}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
}