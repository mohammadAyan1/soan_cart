// components/CustomTabBar.js
import { Animated, TouchableOpacity, Text, View } from "react-native";
import { useScrollContext, TAB_BAR_HEIGHT } from "@/context/ScrollContext";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCart } from "@/redux/slices/cartSlice";

export default function CustomTabBar({ routes, activeIndex, onTabPress }) {
    const { tabBarTranslateY } = useScrollContext();
    const dispatch = useDispatch();
    const cartTotalItems = useSelector((state) => state.cart.totalItems || 0);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated || false);

    useEffect(() => {
        const fetchCartIfNeeded = async () => {
            try {
                // Check if user is logged in OR guestId exists in AsyncStorage
                const guestId = await AsyncStorage.getItem("guestId");
                const token = await AsyncStorage.getItem("token");

                // Fetch cart only if there's a token (logged in) or a guestId
                if (token || guestId) {
                    await dispatch(fetchCart()).unwrap();
                }
            } catch (error) {
                console.error("Failed to fetch cart on tab load:", error);
            }
        };

        fetchCartIfNeeded();
    }, [isAuthenticated, dispatch]); // Re-run when login status changes

    return (
        <Animated.View
            style={{
                height: TAB_BAR_HEIGHT,
                flexDirection: "row",
                backgroundColor: "#fff",
                elevation: 10,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -5 },
                transform: [{ translateY: tabBarTranslateY }],
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
            }}
        >
            {routes.map((route, i) => {
                const Icon = route.icon;
                const isActive = i === activeIndex;
                const isCart = route.key === "cart";

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => onTabPress(i)}
                        className="flex-1 items-center justify-center pb-5 pt-3"
                    >
                        {/* Icon wrapper with badge */}
                        <View className="relative">
                            <Icon
                                size={24}
                                color={isActive ? "#16a34a" : "#9CA3AF"}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isCart && cartTotalItems > 0 && (
                                <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border border-white">
                                    <Text className="text-white text-[10px] font-bold">
                                        {cartTotalItems > 99 ? "99+" : cartTotalItems}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Label */}
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                marginTop: 4,
                                color: isActive ? "#16a34a" : "#9CA3AF",
                            }}
                        >
                            {route.title}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </Animated.View>
    );
}