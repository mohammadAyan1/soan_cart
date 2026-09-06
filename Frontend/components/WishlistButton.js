// 📁 Save at: components/WishlistButton.jsx

import { useRef, useMemo } from "react";
import { Pressable, Animated, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeWishlistItem } from "@/redux/slices/wishlistSlice";
import { trackEvent } from "@/utils/eventTracker"; // 👈 NAYA IMPORT

export default function WishlistButton({ productId, variantId, source = "wishlist_heart_icon" }) {
    const dispatch = useDispatch();
    const scale = useRef(new Animated.Value(1)).current;

    const wishlistItems = useSelector((state) => state.wishlist.items);
    const pendingVariantId = useSelector((state) => state.wishlist.pendingVariantId);

    const isActive = useMemo(
        () => wishlistItems.some((i) => i.variantId === variantId),
        [wishlistItems, variantId]
    );

    const isBusy = pendingVariantId === variantId;

    const handlePress = () => {
        if (isBusy || !variantId) return;

        Animated.sequence([
            Animated.timing(scale, {
                toValue: 1.3,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        // 👇 NAYA - click hote hi track karo (screen automatically current
        // active screen se bhar jayega, eventTracker.js ke andar wale logic se)
        trackEvent({
            eventType: isActive ? "PRODUCT_REMOVE_FROM_WISHLIST" : "PRODUCT_ADD_TO_WISHLIST",
            productId,
            variantId,
            source,
            screen: "product_details_page",
        });

        if (isActive) {
            dispatch(removeWishlistItem(variantId));
        } else {
            dispatch(addToWishlist({ productId, variantId }));
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isBusy}
            className="absolute top-2.5 right-2.5 z-10"
            hitSlop={10}
        >
            <Animated.View
                className="w-8 h-8 rounded-full bg-white/90 items-center justify-center"
                style={{
                    transform: [{ scale }],
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 4,
                }}
            >
                {isBusy ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                    <Ionicons
                        name={isActive ? "heart" : "heart-outline"}
                        size={18}
                        color={isActive ? "#DC2626" : "#374151"}
                    />
                )}
            </Animated.View>
        </Pressable>
    );
}