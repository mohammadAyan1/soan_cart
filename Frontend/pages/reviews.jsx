// app/profile/reviews.jsx
import { useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Star, PackageSearch } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchMyReviews } from "../redux/slices/reviewSlice.js";
import ReviewSkeleton from "../components/skeleton/ReviewSkeleton.js";

// ==========================================================
// STAR RATING - readonly, sirf display ke liye
// ==========================================================
function StarRating({ rating = 0, size = 15 }) {
    return (
        <View className="flex-row items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((position) => (
                <Star
                    key={position}
                    size={size}
                    color={position <= rating ? "#f59e0b" : "#d1d5db"}
                    fill={position <= rating ? "#f59e0b" : "transparent"}
                    strokeWidth={1.5}
                />
            ))}
        </View>
    );
}

// ==========================================================
// SINGLE REVIEW CARD
// ==========================================================
function ReviewCard({ review }) {
    const { product, variant, order, rating, comment, createdAt } = review;



    // variant.attributes ek JSON object hai (jaise { color: "Red", size: "L" })
    // - usko "Red • L" jaise chhote string me convert kar rahe hain
    const variantLabel =
        variant?.attributes && typeof variant.attributes === "object"
            ? Object.values(variant.attributes).filter(Boolean).join(" • ")
            : null;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "";

    return (
        <Pressable
            onPress={() => router.push(`/product/${product?.id}/${variant?.id}`)}
            className="bg-white rounded-xl p-4 mx-4 mb-3"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
            }}
        >
            <View className="flex-row items-center gap-3 mb-3">
                {/* <Image
                    source={{
                        uri: variant?.images?.[0]?.imageUrl || "https://api.dicebear.com/7.x/shapes/png?seed=product",
                    }}
                    className="w-14 h-14 rounded-lg bg-gray-100"
                /> */}

                <Image
                    source={
                        variant?.images?.[0]?.imageUrl || "https://api.dicebear.com/7.x/shapes/png?seed=product"
                    }
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    className="w-14 h-14 rounded-lg bg-gray-100"
                />
                <View className="flex-1">
                    <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
                        {product?.productName || "Product"}
                    </Text>
                    {variantLabel && (
                        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                            {variantLabel}
                        </Text>
                    )}
                    {order?.orderNumber && (
                        <Text className="text-[11px] text-gray-400 mt-0.5">
                            Order #{order.orderNumber}
                        </Text>
                    )}
                </View>
            </View>
            <View className="flex-row items-center justify-between mb-2">
                <StarRating rating={rating} />
                {formattedDate ? (
                    <Text className="text-[11px] text-gray-400">{formattedDate}</Text>
                ) : null}
            </View>
            {comment ? (
                <Text className="text-[13px] text-gray-700 leading-5">{comment}</Text>
            ) : (
                <Text className="text-[13px] text-gray-400 italic">Koi comment nahi likha gaya</Text>
            )}
        </Pressable>
    );
}

// ==========================================================
// EMPTY STATE
// ==========================================================
function EmptyReviews() {
    return (
        <View className="flex-1 items-center justify-center px-8" style={{ paddingTop: 100 }}>
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <PackageSearch size={28} color="#9CA3AF" strokeWidth={1.5} />
            </View>
            <Text className="text-[15px] font-semibold text-gray-800 mb-1">
                Abhi tak koi review nahi
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-5">
                Jab aap apna koi delivered order review karenge, wo yaha dikhega
            </Text>
        </View>
    );
}

// ==========================================================
// MAIN SCREEN
// ==========================================================
export default function MyReviewsScreen() {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    const items = useSelector((state) => state.reviews.items);
    const loading = useSelector((state) => state.reviews.loading);
    const refreshing = useSelector((state) => state.reviews.refreshing);

    useEffect(() => {
        dispatch(fetchMyReviews({}));
    }, []);

    const onRefresh = useCallback(() => {
        dispatch(fetchMyReviews({ isRefresh: true }));
    }, []);

    const isInitialLoading = loading && !refreshing && items.length === 0;

    return (
        <View className="flex-1 bg-gray-50"


            style={{ paddingTop: insets.top }}

        >
            {/* Header */}
            <View className="bg-white flex-row items-center px-4 pt-4 pb-3 border-b border-gray-100">
                {/* <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={18} color="#374151" />
                </TouchableOpacity> */}
                <Text className="text-[17px] font-bold text-gray-900">My Reviews</Text>
            </View>

            {isInitialLoading ? (
                <ReviewSkeleton />
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <ReviewCard review={item} />}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<EmptyReviews />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#16a34a"]}
                        />
                    }
                />
            )}
        </View>
    );
}