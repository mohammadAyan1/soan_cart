// 📁 Ye file "app/wishlist/index.jsx" pe save karna hai
// Profile screen ka router.push("/wishlist") isi file ko open karega

import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    // Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";

import { Image } from "expo-image";

import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, ArrowLeft, Trash2, X, HeartOff } from "lucide-react-native";
import { fetchWishlist, removeWishlistItem, clearWishlist } from "@/redux/slices/wishlistSlice";
import WishlistSkeleton from "@/components/skeleton/WishlistSkeleton";
import { Pressable } from "react-native";
import { trackEvent, triggerScreenExit, getCurrentScreen } from "@/utils/eventTracker";
import { EventTypes } from "react-native-gesture-handler/lib/typescript/web/interfaces";


const handleEventCall = (eventType, variantId) => {
    trackEvent({
        eventType,
        screen: getCurrentScreen(),
        ...(variantId ? { payload: { productVariantId: variantId } } : {})
    })
}

// ==================================================================
// Ek product card
// ==================================================================
function WishlistCard({ item }) {
    const dispatch = useDispatch();
    const removingVariantId = useSelector((state) => state.wishlist.removingVariantId);
    const isRemoving = removingVariantId === item.variantId;



    const handleRemove = () => {
        dispatch(removeWishlistItem(item.variantId));
        handleEventCall("REMOVE_PRODUCT_FROM_WISHLIST", item?.variantId)
    };




    return (
        <Pressable onPress={() => {
            handleEventCall("WISHLIST_PRODUCTS_CLICK")
            triggerScreenExit()
            router.push(`/product/${item?.productId}/${item?.variantId}`)
        }} className="w-[48%] bg-white rounded-xl overflow-hidden mb-3">
            <View className="w-full aspect-square bg-gray-100">
                {/* <Image
                    source={{ uri: item.productImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                /> */}
                <Image
                    source={item?.productImage}
                    className="w-full h-full"
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />

                {/* Remove button */}
                <TouchableOpacity
                    onPress={handleRemove}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 items-center justify-center"
                    activeOpacity={0.7}
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                    }}
                >
                    {isRemoving ? (
                        <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                        <X size={15} color="#374151" />
                    )}
                </TouchableOpacity>

                {!item.inStock && (
                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                        <Text className="text-white text-xs font-semibold">Out of Stock</Text>
                    </View>
                )}
            </View>
            <View className="p-2.5">
                <Text className="text-[13px] font-semibold text-gray-900" numberOfLines={2}>
                    {item.productName}
                </Text>

                <View className="flex-row items-center gap-1.5 mt-1.5">
                    <Text className="text-[14px] font-bold text-gray-900">
                        ₹{item.actualPrice.toFixed(0)}
                    </Text>
                    {item.showMrp && item.mrp > item.actualPrice && (
                        <Text className="text-[11px] text-gray-400 line-through">
                            ₹{item.mrp.toFixed(0)}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

// ==================================================================
// MAIN: Wishlist Screen
// ==================================================================
export default function WishlistScreen() {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { items, totalItems, loading, refreshing, error } = useSelector((state) => state.wishlist);



    const onRefresh = useCallback(() => {
        dispatch(fetchWishlist({ isRefresh: true }));
    }, []);

    const handleClearAll = () => {

        Alert.alert("Wishlist Clear Karo?", "Saare items wishlist se hat jayenge", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Clear All",
                style: "destructive",
                onPress: () => { dispatch(clearWishlist()), handleEventCall("CLEAR_ALL_WISHLIST") },

            },
        ]);
    };





    const isInitialLoading = loading && !refreshing && items.length === 0;

    if (isInitialLoading) {
        return <WishlistSkeleton />;
    }

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center justify-between border-b border-white">
                {/* <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-1">
                        <ArrowLeft size={22} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">
                        My Wishlist {totalItems > 0 ? `(${totalItems})` : ""}
                    </Text>
                </View> */}

                {items.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} className="flex-row items-center gap-1 p-1">
                        <Trash2 size={16} color="#dc2626" />
                        <Text className="text-xs font-semibold text-red-600">Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && items.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-gray-500 text-center">{error}</Text>
                    <TouchableOpacity
                        onPress={() => dispatch(fetchWishlist({}))}
                        className="mt-3 bg-green-600 px-5 py-2.5 rounded-full"
                    >
                        <Text className="text-white font-semibold text-sm">Dobara try karo</Text>
                    </TouchableOpacity>
                </View>
            ) : items.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <HeartOff size={40} color="#9CA3AF" />
                    <Text className="text-gray-500 text-center mt-3">Wishlist khali hai</Text>
                    <Text className="text-gray-400 text-xs text-center mt-1">
                        Products ke ❤️ icon pe tap karke wishlist me add karo
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/")} className="mt-4 bg-green-600 px-5 py-2.5 rounded-full">
                        <Text className="text-white font-semibold text-sm">Shopping shuru karo</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.wishlistItemId.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => <WishlistCard item={item} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
                    }
                />
            )}
        </View>
    );
}