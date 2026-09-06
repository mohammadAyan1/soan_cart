// 📁 Save at: components/ProductCard.jsx

import { useRef, useState } from "react";
import { View, Text, Pressable, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import DiscountBadge from "./DiscountBadge";
import WishlistButton from "./WishlistButton";
import Rating from "./Rating";
import PriceSection from "./PriceSection";
import AddToCartButton from "./AddToCartButton";
import { getDiscountPercent } from "@/utils/priceUtils";
import { trackEvent, triggerScreenExit } from "@/utils/eventTracker"; // 👈 NAYA IMPORT
// import { usePageTimeTracker } from "@/hooks/usePageTimeTracker"
// import { getAnalyticsScreen } from "./Header";
// import { usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 36) / 2;

// 👇 screenName prop add kiya - taaki ye card kisi bhi page (home,
// category, search) pe use ho, tracking me sahi page ka naam jaye
export default function ProductCard({ item, screenName = "home_page", source = "product_grid" }) {
    const router = useRouter();
    // const pathname = usePathname();

    // usePageTimeTracker(getAnalyticsScreen(pathname)); // ya "product_detail_page"

    const cardScale = useRef(new Animated.Value(1)).current;
    const imageOpacity = useRef(new Animated.Value(0)).current;

    const [imageLoaded, setImageLoaded] = useState(false);

    const variant = item?.variants?.[0];
    const imageUrl = variant?.images?.[0]?.imageUrl;
    const discount = variant
        ? getDiscountPercent(variant.mrp, variant.actualPrice)
        : 0;

    const handlePressIn = () => {
        Animated.spring(cardScale, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(cardScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
    };

    // 👇 Card click hote hi PRODUCT_CLICK event track karo, phir navigate karo
    const handleCardPress = () => {
        trackEvent({
            eventType: "PRODUCT_CLICK",
            screen: screenName,
            productId: item.id,
            variantId: variant?.id,
            source, // kis section se click hua (e.g. "product_grid", "featured_section")
        });
        triggerScreenExit(); // 👈 NAYA - pehle exit, phir click
        router.push(`/product/${item.id}`);
    };

    if (!variant) return null;

    return (
        <Animated.View
            className="bg-white rounded-2xl overflow-hidden mb-4"
            style={{
                width: CARD_WIDTH,
                transform: [{ scale: cardScale }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
            }}
        >
            <Pressable
                onPress={handleCardPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "#F3F4F6" }}
            >
                <View className="w-full h-[140px] bg-gray-100">
                    {!imageLoaded && (
                        <View className="absolute inset-0 bg-gray-100" />
                    )}
                    <Animated.Image
                        source={{ uri: imageUrl }}
                        className="w-full h-full"
                        style={{ opacity: imageOpacity }}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                    />
                    <DiscountBadge discount={variant.showMrp ? discount : 0} />

                    <WishlistButton productId={item.id} variantId={variant.id} />
                </View>

                <View className="p-2.5">
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-[13px] font-bold text-gray-900"
                    >
                        {item.productName}
                    </Text>

                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-[11px] text-gray-500 mt-0.5 leading-[15px]"
                        style={{ minHeight: 15 }}
                    >
                        {item.description}
                    </Text>

                    <Rating />

                    <PriceSection
                        actualPrice={variant.actualPrice}
                        mrp={variant.mrp}
                        showMrp={variant.showMrp}
                    />

                    <AddToCartButton
                        productId={item.id}
                        variantId={variant.id}
                        quantity={1}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
}