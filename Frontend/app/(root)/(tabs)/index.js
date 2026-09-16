// app/(root)/(tabs)/index.js
import { useCallback, useEffect } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, resetProducts } from "@/redux/slices/productSlice";
import { useScrollContext } from "@/context/ScrollContext";
import { TAB_BAR_HEIGHT } from "@/context/ScrollContext";
import ProductCard from "@/components/ProductCard";
import ProductSkeletonGrid from "@/components/ProductSkeleton";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";
import { useProductListTracker } from "../../../hooks/useProductListTracker"; // 👈 NAYA
import Header from "@/components/Header";

const SCREEN_NAME = "home_page";

export default function HomeScreen() {
    const dispatch = useDispatch();
    const { items, loading, refreshing, hasNextPage, page } = useSelector(
        (state) => state.products
    );
    const { handleScroll } = useScrollContext();

    // 👇 Page pe kitna time bita - automatic track hoga
    // usePageTimeTracker(SCREEN_NAME);

    // 👇 Scroll, impression (kaunse products dikhe), scroll-stop tracking
    const { onScroll: trackScroll, onViewableItemsChanged, viewabilityConfig } =
        useProductListTracker(SCREEN_NAME);

    useEffect(() => {
        const loadData = async () => {
            try {
                await dispatch(fetchProducts({ page: 1 }));
                await dispatch(fetchWishlist({}));
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        loadData();
    }, [dispatch]);

    const loadMore = useCallback(() => {
        if (!loading && !refreshing && hasNextPage) {
            dispatch(fetchProducts({ page: page + 1 }));
        }
    }, [loading, refreshing, hasNextPage, page]);

    const onRefresh = useCallback(() => {
        dispatch(resetProducts());
        dispatch(fetchProducts({ page: 1, isRefresh: true }));
    }, []);

    // 👇 NAYA - FlatList ka apna scroll handler (tab bar hide/show) +
    // hamara tracking scroll handler - dono ek sath chalenge
    const combinedOnScroll = useCallback(
        (event) => {
            handleScroll(event); // purana wala - tab bar ke liye
            trackScroll(event);  // naya wala - analytics ke liye
        },
        [handleScroll, trackScroll]
    );

    const isInitialLoading = loading && !refreshing && items.length === 0;

    if (isInitialLoading) {
        return <ProductSkeletonGrid count={6} />;
    }



    return (
        <View style={{ flex: 1 }}>
            <Header />
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <ProductCard item={item} screenName={SCREEN_NAME} source="home_grid" />
                )}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: TAB_BAR_HEIGHT + 20 }}
                onScroll={combinedOnScroll}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged} // 👈 NAYA - kaunse products dikhe
                viewabilityConfig={viewabilityConfig}            // 👈 NAYA
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
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
                            <Text className="text-gray-400">Koi product nahi mila</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}