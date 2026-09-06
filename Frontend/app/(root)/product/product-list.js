// app/(root)/product-list.js
import { useCallback, useEffect, useRef } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";
import { useProductListTracker } from "../../../hooks/useProductListTracker"; // 👈 NAYA
import { getCurrentScreen, getPreviousScreen } from "../../../utils/eventTracker";
import {
    fetchProductsByCategory,
    resetCategoryProducts,
} from "@/redux/slices/productSlice";
import ProductCard from "../../../components/ProductCard";
import ProductSkeletonGrid from "@/components/ProductSkeleton";
import { useScrollContext } from "../../../context/ScrollContext";
import { trackEvent } from "../../../utils/eventTracker";
import { useFocusEffect } from "expo-router";

export default function ProductListScreen() {
    const dispatch = useDispatch();
    const SCREEN_NAME = "Product_List_By_Cat_&_SubCat"

    const { handleScroll } = useScrollContext();


    let refference = getCurrentScreen()
    let previouScreen = getPreviousScreen()

    // usePageTimeTracker(refference)


    // 👇 Scroll, impression (kaunse products dikhe), scroll-stop tracking
    const { onScroll: trackScroll, onViewableItemsChanged, viewabilityConfig } =
        useProductListTracker(SCREEN_NAME);

    useFocusEffect(
        useCallback(() => {
            trackEvent({
                eventType: "SCREEN_VIEW",
                screen: SCREEN_NAME,
                // referrerScreen: refference,
            })
        }, [])
    )

    // 👇 NAYA - FlatList ka apna scroll handler (tab bar hide/show) +
    // hamara tracking scroll handler - dono ek sath chalenge
    const combinedOnScroll = useCallback(
        (event) => {
            handleScroll(event); // purana wala - tab bar ke liye
            trackScroll(event);  // naya wala - analytics ke liye
        },
        [handleScroll, trackScroll]
    );

    const { categoryId, subCategoryId, title } = useLocalSearchParams();

    const { items, loading, refreshing, hasNextPage, page } = useSelector(
        (state) => state.products.categoryProducts
    );

    const didFetchRef = useRef(false);

    // Pehli load — jab screen open ho
    useEffect(() => {
        // Naya subCategory/category aane pe purani list reset karo
        dispatch(resetCategoryProducts());
        didFetchRef.current = false;
    }, [categoryId, subCategoryId]);

    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        dispatch(fetchProductsByCategory({ categoryId, subCategoryId, page: 1 }));
    }, [categoryId, subCategoryId]);

    const loadMore = useCallback(() => {
        if (!loading && !refreshing && hasNextPage) {
            dispatch(
                fetchProductsByCategory({
                    categoryId,
                    subCategoryId,
                    page: page + 1,
                })
            );
        }
    }, [loading, refreshing, hasNextPage, page, categoryId, subCategoryId]);

    const onRefresh = useCallback(() => {
        dispatch(resetCategoryProducts());
        dispatch(
            fetchProductsByCategory({
                categoryId,
                subCategoryId,
                page: 1,
                isRefresh: true,
            })
        );
    }, [categoryId, subCategoryId]);

    const isInitialLoading = loading && !refreshing && items.length === 0;

    return (
        <View className="flex-1 bg-white">
            {/* Simple header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity> */}
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                    {title || "Products"}
                </Text>
            </View>

            {isInitialLoading ? (
                <ProductSkeletonGrid count={6} />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <ProductCard item={item} screenName={SCREEN_NAME} />}
                    numColumns={2}
                    onScroll={combinedOnScroll}
                    scrollEventThrottle={16}
                    onViewableItemsChanged={onViewableItemsChanged} // 👈 NAYA - kaunse products dikhe
                    viewabilityConfig={viewabilityConfig}
                    columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#16a34a"]}
                        />
                    }
                    ListFooterComponent={
                        loading && !refreshing && items.length > 0 ? (
                            <View className="py-4">
                                <Text className="text-center text-gray-400 text-xs">
                                    Loading more...
                                </Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View className="items-center mt-20">
                                <Text className="text-gray-400">
                                    Is category me abhi koi product nahi hai
                                </Text>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
}