// app/(root)/(tabs)/cart.js

import React, { useCallback, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, resetCart } from "@/redux/slices/cartSlice";
import { useFocusEffect } from "@react-navigation/native";
import { useScrollContext, TAB_BAR_HEIGHT } from "@/context/ScrollContext";
import CartItemCard from "@/components/CartItemCard";
import CartItemSkeleton from "@/components/skeleton/CartItemSkeleton"; // 👈 naya import
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTabContext } from "@/context/TabContext";
import { trackEvent, triggerScreenExit } from "@/utils/eventTracker";


export default function CartScreen() {
    const dispatch = useDispatch();
    const { items, loading, refreshing, error, cartTotal, totalItems, totalSavings } = useSelector((state) => state.cart);
    const { handleScroll } = useScrollContext();

    const { goToTab } = useTabContext();

    let result = {}
    useEffect(() => {
        result = items.map((item) => ({
            productId: item?.productId,
            variantId: item?.variantId,
            cartItemId: item?.cartItemId,
            cart: item?.cart
        }))
    }, [items])


    useEffect(() => {
        dispatch(fetchCart());
    }, []);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchCart());
        }, [])
    );

    const onRefresh = useCallback(() => {
        dispatch(resetCart());
        dispatch(fetchCart());
    }, []);


    const handleEventCall = (eventType, cartItemData) => {
        trackEvent({
            eventType,
            screen: "cart_page",
            ...(cartItemData ? { payload: { cartItemData } } : {})
        })
    }

    // 👇 replaced: ActivityIndicator ki jagah skeleton list
    if (loading && items.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 px-4 pt-4">
                <View className="mb-3">
                    <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
                </View>
                {Array.from({ length: 5 }).map((_, i) => (
                    <CartItemSkeleton key={i} />
                ))}
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-gray-50">
                <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
                <Text className="text-red-500 text-center mt-2 font-medium">
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={() => dispatch(fetchCart())}
                    className="mt-4 bg-green-600 px-6 py-2.5 rounded-full"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }



    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.cartItemId || item.id)}
                renderItem={({ item }) => <CartItemCard item={item} />}
                ListHeaderComponent={
                    items.length > 0 ? (
                        <View className="mb-3">
                            <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
                        </View>
                    ) : null
                }
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: items.length > 0 ? 140 : TAB_BAR_HEIGHT + 20,
                }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#16a34a"]}
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View className="items-center mt-24 px-8">
                            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
                                <Ionicons name="cart-outline" size={44} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-900 text-lg font-semibold">
                                Your cart is empty
                            </Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">
                                Looks like you haven't added anything yet. Start exploring products!
                            </Text>
                            <TouchableOpacity
                                onPress={() => goToTab(0)}
                                className="mt-5 bg-green-600 px-8 py-3 rounded-full"
                            >
                                <Text className="text-white font-semibold">Start Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
                ListFooterComponent={
                    loading && items.length > 0 && (
                        <View className="py-4">
                            <ActivityIndicator size="small" color="#16a34a" />
                        </View>
                    )
                }
            />

            {/* Sticky bottom summary bar */}
            {items.length > 0 && (
                <View
                    className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-3 border-t border-gray-100"
                    style={{
                        paddingBottom: TAB_BAR_HEIGHT + 12,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 10,
                    }}
                >
                    {totalSavings > 0 && (
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row">
                                <Ionicons name="pricetag" size={13} color="#16a34a" />
                                <Text className="text-green-600 text-xs font-medium ml-1">
                                    You're saving ₹{totalSavings} on this order
                                </Text>
                            </View>


                            <Text className="text-sm text-gray-400 mt-0.5">
                                {totalItems} {totalItems === 1 ? "item" : "items"}
                            </Text>
                        </View>
                    )}
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-400 text-xs">Total Amount</Text>
                            <Text className="text-gray-900 text-xl font-bold">
                                {/* ₹{totalAmount} */}
                                {cartTotal}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => { router.push("/(root)/checkout/checkout"), handleEventCall("CART_CHECKOUT_BTN_CLICK", result), triggerScreenExit() }}
                            className="bg-green-600 px-8 py-3.5 rounded-full flex-row items-center"
                            activeOpacity={0.85}
                        >
                            <Text className="text-white font-semibold text-base mr-1">
                                Checkout
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}