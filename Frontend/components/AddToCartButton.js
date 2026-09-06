// components/AddToCartButton.jsx
import { useRef, useState } from "react";
import { Pressable, Animated, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import { trackEvent } from "@/utils/eventTracker"; // 👈 NAYA IMPORT

export default function AddToCartButton({ productId, variantId, quantity = 1, source = "add_to_cart_btn" }) {
    const [status, setStatus] = useState("idle");
    const scale = useRef(new Animated.Value(1)).current;
    const dispatch = useDispatch();

    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.94,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleAddToCart = async () => {
        if (status === "loading") return;
        animatePress();
        setStatus("loading");

        // 👇 NAYA - click hote hi track karo
        trackEvent({
            eventType: "PRODUCT_ADD_TO_CART",
            productId,
            variantId,
            source,
            payload: { quantity },
        });

        try {
            await dispatch(addToCart({ productId, variantId, quantity })).unwrap();
            setStatus("success");
            setTimeout(() => setStatus("idle"), 1500);
        } catch (error) {
            console.error("Add to cart failed:", error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 1500);
        }
    };

    const getLabel = () => {
        if (status === "loading") return "Adding...";
        if (status === "success") return "Added";
        if (status === "error") return "Try Again";
        return "Add to Cart";
    };

    const getIcon = () => {
        if (status === "success") return "checkmark-circle";
        if (status === "error") return "alert-circle";
        return "cart-outline";
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={handleAddToCart}
                disabled={status === "loading"}
                className={`mt-2.5 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5 ${status === "error"
                    ? "bg-red-600"
                    : "bg-green-600"
                    } ${status === "loading" ? "opacity-80" : "opacity-100"}`}
                style={{
                    shadowColor: status === "error" ? "#DC2626" : "#16A34A",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {status === "loading" ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Ionicons name={getIcon()} size={16} color="#FFFFFF" />
                )}
                <Text className="text-white text-[13px] font-bold">{getLabel()}</Text>
            </Pressable>
        </Animated.View>
    );
}