// 📁 Ye file "app/orders/index.jsx" pe save karna hai
// Profile screen ka router.push("/orders") isi file ko open karega

import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    Pressable,
} from "react-native";
// import { Image } from "expo-image";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
    Package,
    MapPin,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    ArrowLeft,
    Inbox,
    Star,
} from "lucide-react-native";
import { fetchMyOrders } from "../../../redux/slices/orderSlice.js";
import { fetchMyReviews } from "../../../redux/slices/reviewSlice.js";
import OrderSkeleton from "../../../components/skeleton/Orderskeleton.js";
import ReviewModal from "../../../components/ReviewModal.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ------------------------------------------------------------------
// Status ke hisab se color + label
// ------------------------------------------------------------------
const STATUS_STYLES = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "#ca8a04", label: "Pending" },
    CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "#2563eb", label: "Confirmed" },
    PROCESSING: { bg: "bg-blue-50", text: "text-blue-700", dot: "#2563eb", label: "Processing" },
    SHIPPED: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "#4f46e5", label: "Shipped" },
    OUT_FOR_DELIVERY: { bg: "bg-purple-50", text: "text-purple-700", dot: "#7c3aed", label: "Out for Delivery" },
    DELIVERED: { bg: "bg-green-50", text: "text-green-700", dot: "#16a34a", label: "Delivered" },
    CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "#dc2626", label: "Cancelled" },
    RETURN_REQUESTED: { bg: "bg-orange-50", text: "text-orange-700", dot: "#ea580c", label: "Return Requested" },
    RETURN_ACCEPTED: { bg: "bg-orange-50", text: "text-orange-700", dot: "#ea580c", label: "Return Accepted" },
    RETURN_REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "#dc2626", label: "Return Rejected" },
    RETURNED: { bg: "bg-gray-100", text: "text-gray-700", dot: "#4b5563", label: "Returned" },
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ==================================================================
// Small status pill/badge
// ==================================================================
function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
    return (
        <View className={`px-2.5 py-1 rounded-full ${s.bg} flex-row items-center gap-1.5`}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.dot }} />
            <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
        </View>
    );
}

// ==================================================================
// Har status change ki timeline (kab kya hua)
// ==================================================================
function StatusTimeline({ history = [] }) {
    if (!history.length) return null;
    return (
        <View className="mt-3 pl-1">
            {history.map((h, index) => {
                const s = STATUS_STYLES[h.status] || STATUS_STYLES.PENDING;
                const isLast = index === history.length - 1;
                return (
                    <View key={h.id} className="flex-row">
                        <View className="items-center mr-3">
                            <View
                                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.dot }}
                            />
                            {!isLast && (
                                <View className="w-[1.5px] flex-1 bg-gray-200 my-1" style={{ minHeight: 24 }} />
                            )}
                        </View>
                        <View className="pb-4 flex-1">
                            <Text className="text-[13px] font-semibold text-gray-800">{s.label}</Text>
                            <Text className="text-[11px] text-gray-400 mt-0.5">{formatDateTime(h.changedAt)}</Text>
                            {h.note ? <Text className="text-xs text-gray-500 mt-0.5">{h.note}</Text> : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

// ==================================================================
// Ek order item (product + variant) card, apni status history ke saath
// ==================================================================
function OrderItemRow({ item, isReviewed, onOpenReview }) {
    const [showHistory, setShowHistory] = useState(false);
    const isDelivered = item.deliveryStatus === "DELIVERED";

    return (
        <View className="border-t border-gray-100 pt-3 mt-3">
            <Pressable className="flex-row gap-3" onPress={() => router.push(`/product/${item?.product?.id}/${item?.variant?.id}`)}>
                <Image
                    source={{ uri: item.variant?.images?.[0]?.imageUrl || item.product?.imageUrl }}
                    className="w-16 h-16 rounded-lg bg-gray-100"
                />



                <View className="flex-1">
                    <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={2}>
                        {item.product?.productName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} • ₹{Number(item.price).toFixed(2)} each
                    </Text>
                    {item.vendor?.fullName ? (
                        <Text className="text-[11px] text-gray-400 mt-0.5">Sold by {item.vendor.fullName}</Text>
                    ) : null}
                    <View className="mt-2 flex-row items-center justify-between">
                        <StatusBadge status={item.deliveryStatus} />
                        {item.expectedDeliveryDate ? (
                            <Text className="text-[11px] text-gray-400">
                                Exp: {formatDateTime(item.expectedDeliveryDate)}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </Pressable>

            {/* 👇 Sirf DELIVERED item pe hi rate/review karne ka option milega */}
            {isDelivered && (
                <TouchableOpacity
                    onPress={() => onOpenReview(item)}
                    disabled={isReviewed}
                    className={`flex-row items-center justify-center gap-1.5 mt-3 py-2 rounded-lg ${isReviewed ? "bg-gray-50" : "bg-green-50"
                        }`}
                    activeOpacity={0.7}
                >
                    <Star
                        size={14}
                        color={isReviewed ? "#16a34a" : "#16a34a"}
                        fill={isReviewed ? "#16a34a" : "transparent"}
                    />
                    <Text className={`text-xs font-semibold ${isReviewed ? "text-green-700" : "text-green-700"}`}>
                        {isReviewed ? "Aapne review de diya hai" : "Rate & Review"}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Status history toggle */}
            <TouchableOpacity
                onPress={() => setShowHistory((p) => !p)}
                className="flex-row items-center gap-1.5 mt-3"
                activeOpacity={0.6}
            >
                <Clock size={13} color="#6b7280" />
                <Text className="text-xs font-medium text-gray-500">
                    {showHistory ? "Status history chhupao" : "Status history dekho"}
                </Text>
                {showHistory ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
            </TouchableOpacity>

            {showHistory && <StatusTimeline history={item.statusHistory} />}
        </View>
    );
}

// ==================================================================
// Ek pura order card - header + address + items (expandable)
// ==================================================================
function OrderCard({ order, reviewedOrderItemIds, onOpenReview }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View
            className="bg-white mx-4 mt-3 rounded-xl p-4"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            {/* Header */}
            <TouchableOpacity onPress={() => setExpanded((p) => !p)} activeOpacity={0.7}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center">
                            <Package size={17} color="#16a34a" strokeWidth={2} />
                        </View>
                        <View>
                            <Text className="text-[13px] font-bold text-gray-900" onPress={() => router.push(`/orders/${order?.id}`)}>{order.orderNumber}</Text>
                            <Text className="text-[11px] text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</Text>
                        </View>
                    </View>
                    {expanded ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
                </View>

                {/* Quick summary row */}
                <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center gap-1.5">
                        <CreditCard size={13} color="#6b7280" />
                        <Text className="text-xs text-gray-500">
                            {order.orderType} • {order.paymentStatus}
                        </Text>
                    </View>
                    <Text className="text-[14px] font-bold text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                    {order.items?.length} item{order.items?.length > 1 ? "s" : ""}
                </Text>
            </TouchableOpacity>
            {/* Expanded details */}
            {expanded && (
                <View className="mt-2">
                    {/* Delivery address */}
                    <View className="bg-gray-50 rounded-lg p-3 mt-2 flex-row gap-2">
                        <MapPin size={16} color="#374151" style={{ marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="text-[13px] font-semibold text-gray-800">{order.fullName}</Text>
                            <Text className="text-xs text-gray-500 mt-0.5">{order.phone}</Text>
                            <Text className="text-xs text-gray-500 mt-0.5">
                                {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                            </Text>
                        </View>
                    </View>

                    {/* Items */}
                    <View className="mt-1">
                        {order.items?.map((item) => (
                            <OrderItemRow
                                key={item.id}
                                item={item}
                                isReviewed={reviewedOrderItemIds.includes(item.id)}
                                onOpenReview={onOpenReview}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

// ==================================================================
// MAIN: My Orders Screen
// ==================================================================
export default function OrdersScreen() {
    const dispatch = useDispatch();
    const { orders, ordersLoading, ordersError } = useSelector((state) => state.order);
    const reviewedOrderItemIds = useSelector((state) => state.reviews.reviewedOrderItemIds);
    const insets = useSafeAreaInsets();



    // Pull-to-refresh apna local state se handle - kyunki thunk me
    // isRefresh jaisa alag param nahi hai, ordersLoading reuse karne se
    // refresh ke time bhi poora skeleton dikh jaata (jo UX me acha nahi lagta)
    const [refreshing, setRefreshing] = useState(false);

    // Review modal ka state - kaunsa item review ho raha hai
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [activeReviewItem, setActiveReviewItem] = useState(null);

    // Page open hote hi apne saare orders + already-diye-hue reviews fetch karo
    // (reviews isliye chahiye taaki pata chale kaunsa item already reviewed hai)
    useEffect(() => {
        dispatch(fetchMyOrders());
        dispatch(fetchMyReviews({}));
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([dispatch(fetchMyOrders()), dispatch(fetchMyReviews({ isRefresh: true }))]);
        setRefreshing(false);
    }, [dispatch]);

    const handleOpenReview = (item) => {
        setActiveReviewItem(item);
        setReviewModalVisible(true);
    };

    const handleCloseReview = () => {
        setReviewModalVisible(false);
        setActiveReviewItem(null);
    };

    // Sirf pehli baar (jab list khali ho aur load ho rahi ho) skeleton dikhana hai
    const isInitialLoading = ordersLoading && orders.length === 0 && !refreshing;

    if (isInitialLoading) {
        return <OrderSkeleton />;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View style={{ height: insets.top + 10 }} />

            {/* Header */}
            {/* <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-1">
                    <ArrowLeft size={22} color="#111827" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">My Orders</Text>
            </View> */}

            {ordersError && orders.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-gray-500 text-center">{ordersError}</Text>
                    <TouchableOpacity
                        onPress={() => dispatch(fetchMyOrders())}
                        className="mt-3 bg-green-600 px-5 py-2.5 rounded-full"
                    >
                        <Text className="text-white font-semibold text-sm">Dobara try karo</Text>
                    </TouchableOpacity>
                </View>
            ) : orders.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Inbox size={40} color="#9CA3AF" />
                    <Text className="text-gray-500 text-center mt-3">Abhi tak koi order nahi hai</Text>
                    <TouchableOpacity onPress={() => router.push("/")} className="mt-3 bg-green-600 px-5 py-2.5 rounded-full">
                        <Text className="text-white font-semibold text-sm">Shopping shuru karo</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
                    }
                >
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            reviewedOrderItemIds={reviewedOrderItemIds}
                            onOpenReview={handleOpenReview}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Rate & Review bottom sheet */}
            <ReviewModal
                visible={reviewModalVisible}
                onClose={handleCloseReview}
                orderItemId={activeReviewItem?.id}
                productName={activeReviewItem?.product?.productName}
            />
        </View>
    );
}