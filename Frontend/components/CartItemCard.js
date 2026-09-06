
// components/CartItemCard.jsx

import { View, Text, TouchableOpacity, Pressable, Image } from "react-native"; // 👈 Pressable import karo
import { useDispatch } from "react-redux";
import {
    increaseQuantity,
    decreaseQuantity,
    removeCartItem,
} from "@/redux/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { trackEvent, triggerScreenExit } from "@/utils/eventTracker";
// import { Image } from "expo-image";
export default function CartItemCard({ item }) {
    const dispatch = useDispatch();
    const router = useRouter();

    const {
        productId,
        variantId,
        productName = "Product",
        productImage = "https://via.placeholder.com/100",
        quantity = 1,
        actualPrice = 0,
        mrp = 0,
        totalPrice = 0,
        showMrp = false,
        variantDescription = "",
        variantAttributes = {},
        cart,
        cartItemId
    } = item;

    const totalMrp = mrp * quantity;
    const hasDiscount = showMrp && mrp > actualPrice;
    const discountPercent = hasDiscount
        ? Math.round(((mrp - actualPrice) / mrp) * 100)
        : 0;

    const chips = Object.entries(variantAttributes || {}).filter(([, v]) => v);

    const handleDecrease = () => {
        if (quantity <= 1) {
            dispatch(removeCartItem(variantId));
            handleEventCall("REMOVE_PRODUCTS_FROM_CART")
        } else {
            dispatch(decreaseQuantity(variantId));
            handleEventCall("DECREASE_QUANTITY_OF_PRODUCTS_FROM_CART")
        }
    };

    const handleCardPress = (varId = null) => {
        if (!varId) {
            router.push(`/product/${productId}`);

        } else {
            router.push(`/product/${productId}/${varId}`);
        }
    };




    const handleEventCall = (eventType, obj = {}) => {
        trackEvent({
            eventType,
            screen: "ADD_TO_CART_SCREEN",
            ...(Object.keys(obj).length > 0 ? { payload: obj } : {})
        })

        if (Object.keys(obj).length > 0) {
            triggerScreenExit()
            handleCardPress(variantId)
        }

    }

    const CartProductClick = (obj) => {
        handleEventCall("CLICK_PRODUCTS_FROM_CART", obj)
    }


    return (
        // 👇 View ki jagah Pressable
        <Pressable
            onPress={() => { CartProductClick({ cart, cartItemId }) }}
            className="flex-row bg-white p-3 rounded-2xl mb-3 border border-gray-100"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
            }}
        >
            {/* Product image */}
            <View className="relative">
                <Image
                    source={{ uri: productImage }}
                    className="w-24 h-24 rounded-xl bg-gray-100"
                    resizeMode="cover"
                />


                {discountPercent > 0 && (
                    <View className="absolute top-1 left-1 bg-green-600 px-1.5 py-0.5 rounded-md">
                        <Text className="text-white text-[10px] font-bold">
                            {discountPercent}% OFF
                        </Text>
                    </View>
                )}
            </View>

            {/* Details */}
            <View className="flex-1 ml-3 justify-between">
                <View>
                    <View className="flex-row items-start justify-between">
                        <Text
                            className="text-[15px] font-semibold text-gray-900 flex-1 pr-2"
                            numberOfLines={2}
                        >
                            {productName}
                        </Text>
                        {/* 👇 stopPropagation zaroori hai warna trash click pe bhi card navigate ho jayega */}
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation?.();
                                dispatch(removeCartItem(variantId));
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    </View>

                    {variantDescription ? (
                        <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                            {variantDescription}
                        </Text>
                    ) : null}

                    {chips.length > 0 && (
                        <View className="flex-row flex-wrap gap-1.5 mt-1.5">
                            {chips.map(([key, value]) => (
                                <View
                                    key={key}
                                    className="bg-gray-100 px-2 py-0.5 rounded-full"
                                >
                                    <Text className="text-[10px] text-gray-600 font-medium">
                                        {value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View className="flex-row items-center justify-between mt-2">
                    <View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-900 font-bold text-base">
                                ₹{totalPrice}
                            </Text>
                            {hasDiscount && (
                                <Text className="text-gray-400 text-xs ml-2 line-through">
                                    ₹{totalMrp}
                                </Text>
                            )}
                        </View>
                        <Text className="text-[11px] text-gray-400 mt-0.5">
                            ₹{actualPrice} / item
                        </Text>
                    </View>

                    {/* Quantity stepper */}
                    <View className="flex-row items-center bg-green-50 rounded-full border border-green-100">
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation?.();
                                handleDecrease();
                            }}
                            className="w-8 h-8 items-center justify-center"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <Ionicons
                                name={quantity <= 1 ? "trash-outline" : "remove"}
                                size={15}
                                color="#16a34a"
                            />
                        </TouchableOpacity>

                        <Text className="text-sm font-bold text-gray-900 min-w-[20px] text-center">
                            {quantity}
                        </Text>

                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation?.();
                                dispatch(increaseQuantity(variantId));
                                handleEventCall("INCREASE_QUANTITY_OF_PRODUCTS_FROM_CART")
                            }}
                            className="w-8 h-8 items-center justify-center"
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <Ionicons name="add" size={15} color="#16a34a" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}