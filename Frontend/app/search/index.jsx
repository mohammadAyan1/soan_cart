import { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    // Image,
    ActivityIndicator,
    Platform,
    Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Search, X, SearchX } from "lucide-react-native";
import { searchProducts, resetSearch, setSearchQuery } from "@/redux/slices/productSlice";
import { useFocusEffect } from "@react-navigation/native";
import { useSearchContext } from "@/context/SearchContext";
import { Image } from "expo-image";


export default function SearchScreen() {
    const dispatch = useDispatch();
    // const inputRef = useRef(null);
    const { text, inputRef, handleClear } = useSearchContext();




    const {
        items,
        page,
        hasNextPage,
        loading,
        loadingMore,
        error,
    } = useSelector((state) => state.products.search);

    // 👇 Screen focus hote hi keyboard turant khul jaye aur field focus ho.
    // useFocusEffect isliye use kiya kyunki ye navigation animation complete
    // hone ke turant baad reliably fire hota hai (useEffect se zyada consistent)
    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, Platform.OS === "android" ? 150 : 300);
            return () => clearTimeout(timer);
        }, [])
    );

    // Screen se bahar jaate waqt search state clear kar do
    useEffect(() => {
        return () => {
            dispatch(resetSearch());
        };
    }, []);



    // ==========================================================
    // INFINITE SCROLL
    // ==========================================================
    const handleLoadMore = useCallback(() => {
        if (loading || loadingMore || !hasNextPage || !text.trim()) return;
        dispatch(searchProducts({ query: text.trim(), page: page + 1 }));
    }, [loading, loadingMore, hasNextPage, page, text]);

    // ==========================================================
    // RENDER PIECES
    // ==========================================================
    const ProductCard = ({ item }) => {
        const variant = item.variants?.[0];
        const image = variant?.images?.[0]?.imageUrl;

        return (
            <TouchableOpacity
                onPress={() => {
                    router.push(`/product/${item.id}`);
                    Keyboard.dismiss();
                }}
                activeOpacity={0.7}
                style={{ width: "48%" }}
                className="bg-white rounded-xl mb-3 overflow-hidden"
            >
                {/* <Image
                    source={{ uri: image || "https://via.placeholder.com/300" }}
                    style={{ width: "100%", height: 140, backgroundColor: "#F3F4F6" }}
                    resizeMode="cover"
                /> */}

                <Image
                    source={image || "https://via.placeholder.com/300"}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    style={{ width: "100%", height: 140, backgroundColor: "#F3F4F6" }}
                    resizeMode="cover"
                />
                <View className="p-2.5">
                    <Text numberOfLines={2} className="text-[13px] font-medium text-gray-800 mb-1">
                        {item.productName}
                    </Text>
                    {variant && (
                        <View className="flex-row items-center gap-1.5">
                            <Text className="text-[14px] font-bold text-gray-900">
                                ₹{variant.actualPrice}
                            </Text>
                            {variant.showMrp && variant.mrp > variant.actualPrice && (
                                <Text className="text-[11px] text-gray-400 line-through">
                                    ₹{variant.mrp}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const ListFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4 items-center">
                <ActivityIndicator color="#16a34a" />
            </View>
        );
    };

    const EmptyState = () => {
        if (loading) return null;

        if (!text.trim()) {
            return (
                <View className="items-center justify-center py-20 px-6">
                    <Search size={40} color="#D1D5DB" />
                    <Text className="text-[14px] text-gray-400 mt-3 text-center">
                        Products, brands ya categories search karo
                    </Text>
                </View>
            );
        }

        if (items.length === 0 && !error) {
            return (
                <View className="items-center justify-center py-20 px-6">
                    <SearchX size={40} color="#D1D5DB" />
                    <Text className="text-[14px] font-semibold text-gray-600 mt-3 text-center">
                        Koi product nahi mila
                    </Text>
                    <Text className="text-[12.5px] text-gray-400 mt-1 text-center">
                        {text} ke liye kuch match nahi hua, kuch aur try karo
                    </Text>
                </View>
            );
        }

        if (error) {
            return (
                <View className="items-center justify-center py-20 px-6">
                    <Text className="text-[13px] text-red-500 text-center">{error}</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View className="flex-1 bg-white">
            {/* 👇 Header - EXACT same position/style jaisa Header.js ke search box ka hai,
                bas ab ye khud ek real editable TextInput hai */}



            {/* Loading indicator jab pehli baar search ho rahi ho */}
            {loading && (
                <View className="py-10 items-center">
                    <ActivityIndicator color="#16a34a" size="large" />
                </View>
            )}

            {/* Results grid - baaki page bilkul white/blank rehta hai jab tak type na karo */}
            {!loading && (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingTop: 14, paddingBottom: 40, flexGrow: 1 }}
                    renderItem={({ item }) => <ProductCard item={item} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={ListFooter}
                    ListEmptyComponent={EmptyState}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}