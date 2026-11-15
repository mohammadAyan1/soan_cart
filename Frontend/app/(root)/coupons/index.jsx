import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    Pressable,
    Image,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";

import { fetchCoupons } from "../../../redux/slices/couponsSlice.js";

import {
    TicketPercent,
    Tag,
    CalendarDays,
    ShoppingBag,
    Package,
    Layers,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Gift,
} from "lucide-react-native";


// =====================================
// Helper: Format Currency
// =====================================

const formatPrice = (price) => {

    const amount = Number(price || 0);

    return `₹${amount.toLocaleString("en-IN")}`;

};


// =====================================
// Helper: Format Date
// =====================================

const formatDate = (date) => {

    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

};


// =====================================
// Helper: Discount Text
// =====================================

const getDiscountText = (coupon) => {

    const value = Number(coupon.value || 0);

    switch (coupon.type) {

        case "FLAT":
            return `${formatPrice(value)} OFF`;

        case "PERCENTAGE":
            return `${value}% OFF`;

        case "UPTO":
            return `UP TO ${formatPrice(coupon.maxDiscountAmount || value)} OFF`;

        default:
            return `${value} OFF`;

    }

};


// =====================================
// Helper: Applicability Details
// =====================================

const getApplicability = (coupon) => {

    const { type, details } = coupon.appliesTo || {};

    switch (type) {

        case "PRODUCT":

            return {
                title: "Applicable Product",
                name: details?.productName || "Product",
                image: details?.imageUrl,
                icon: ShoppingBag,
            };


        case "VARIANT":

            return {
                title: "Applicable Variant",
                name: `${details?.product?.productName || "Product"} - ${details?.description || "Variant"}`,
                image:
                    details?.images?.find((img) => img.isPrimary)?.imageUrl ||
                    details?.images?.[0]?.imageUrl ||
                    details?.product?.imageUrl,
                icon: Package,
            };


        case "CATEGORY":

            return {
                title: "Applicable Category",
                name: details?.productCategoryName || "Category",
                image: details?.imageUrl,
                icon: Layers,
            };


        case "SUBCATEGORY":

            return {
                title: "Applicable Subcategory",
                name: details?.productSubCategoryName || "Subcategory",
                image: details?.imageUrl,
                icon: Layers,
            };


        case "ALL":

        case "ALL_PRODUCTS":

        default:

            return {
                title: "Applicable On",
                name: "All Products",
                image: null,
                icon: Gift,
            };

    }

};


// =====================================
// Coupon Card Component
// =====================================

const CouponCard = ({ coupon }) => {

    const applicability = getApplicability(coupon);

    const ApplicabilityIcon = applicability.icon;

    return (

        <View className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">

            {/* Top Discount Section */}

            <View className="bg-emerald-50 p-4 flex-row items-center justify-between">

                <View className="flex-1">

                    <View className="flex-row items-center mb-2">

                        <TicketPercent size={17} color="#059669" />

                        <Text className="text-emerald-700 text-xs font-bold ml-2">
                            SPECIAL COUPON
                        </Text>

                    </View>

                    <Text className="text-2xl font-extrabold text-emerald-700">

                        {getDiscountText(coupon)}

                    </Text>

                    <Text className="text-gray-600 text-xs mt-1">

                        {coupon.description || "Get exciting discounts on your purchase"}

                    </Text>

                </View>


                <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

                    <Gift size={27} color="#059669" />

                </View>

            </View>


            {/* Coupon Code */}

            <View className="p-4">

                <View className="flex-row items-center justify-between">

                    <View className="flex-1">

                        <Text className="text-gray-400 text-[10px] font-bold uppercase">

                            Coupon Code

                        </Text>

                        <Text className="text-gray-900 text-base font-extrabold tracking-wider mt-1">

                            {coupon.code}

                        </Text>

                    </View>


                    <View className="bg-emerald-50 border border-dashed border-emerald-400 rounded-lg px-3 py-2">

                        <Text className="text-emerald-700 text-xs font-extrabold">

                            {coupon.type}

                        </Text>

                    </View>

                </View>


                {/* Divider */}

                <View className="border-t border-dashed border-gray-200 my-4" />


                {/* Applicability */}

                <View>

                    <Text className="text-gray-400 text-[10px] font-bold uppercase mb-3">

                        Coupon Applicable On

                    </Text>


                    <View className="flex-row items-center">

                        {applicability.image ? (

                            <Image
                                source={{ uri: applicability.image }}
                                className="w-12 h-12 rounded-xl bg-gray-100"
                                resizeMode="cover"
                            />

                        ) : (

                            <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">

                                <ApplicabilityIcon size={21} color="#059669" />

                            </View>

                        )}


                        <View className="flex-1 ml-3">

                            <Text className="text-gray-400 text-[10px]">

                                {applicability.title}

                            </Text>

                            <Text
                                className="text-gray-800 text-sm font-bold mt-1"
                                numberOfLines={2}
                            >

                                {applicability.name}

                            </Text>

                        </View>


                        <CheckCircle2 size={19} color="#059669" />

                    </View>

                </View>


                {/* Maximum Discount */}

                {coupon.maxDiscountAmount && (

                    <View className="flex-row items-center mt-4">

                        <Tag size={15} color="#6B7280" />

                        <Text className="text-gray-500 text-xs ml-2">

                            Maximum Discount:

                        </Text>

                        <Text className="text-gray-800 text-xs font-bold ml-1">

                            {formatPrice(coupon.maxDiscountAmount)}

                        </Text>

                    </View>

                )}


                {/* Expiry Date */}

                <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">

                    <CalendarDays size={15} color="#6B7280" />

                    <Text className="text-gray-500 text-xs ml-2">

                        Valid Till

                    </Text>

                    <Text className="text-gray-800 text-xs font-bold ml-1">

                        {formatDate(coupon.expiryDate)}

                    </Text>

                </View>

            </View>

        </View>

    );

};


// =====================================
// Main Coupon Component
// =====================================

const Coupon = () => {

    const dispatch = useDispatch();

    const insets = useSafeAreaInsets();


    const {
        items,
        loading,
        error
    } = useSelector((state) => state.coupons);


    // Fetch Coupons

    useEffect(() => {

        dispatch(fetchCoupons());

    }, [dispatch]);


    // Loading State

    if (loading && items.length === 0) {

        return (

            <View className="flex-1 items-center justify-center py-16">

                <ActivityIndicator size="large" color="#059669" />

                <Text className="text-gray-500 text-sm mt-3">

                    Fetching available coupons...

                </Text>

            </View>

        );

    }


    // Error State

    if (error && items.length === 0) {

        return (

            <View className="items-center justify-center py-12">

                <AlertCircle size={40} color="#EF4444" />

                <Text className="text-gray-800 font-bold text-base mt-3">

                    Something went wrong!

                </Text>

                <Text className="text-gray-500 text-xs mt-2 text-center">

                    {error}

                </Text>


                <Pressable
                    onPress={() => dispatch(fetchCoupons())}
                    className="bg-emerald-600 px-5 py-3 rounded-xl mt-4 flex-row items-center"
                >

                    <RefreshCw size={15} color="white" />

                    <Text className="text-white font-bold text-xs ml-2">

                        Try Again

                    </Text>

                </Pressable>

            </View>

        );

    }


    // Empty State

    if (!items || items.length === 0) {

        return (

            <View className="items-center justify-center py-14">

                <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">

                    <TicketPercent size={36} color="#059669" />

                </View>

                <Text className="text-gray-800 font-bold text-base mt-4">

                    No Coupons Available

                </Text>

                <Text className="text-gray-400 text-xs mt-2 text-center">

                    Currently there are no active coupons available.

                </Text>

            </View>

        );

    }


    // Main UI

    return (

        <View className="flex-1" style={{ paddingTop: insets.top }}>

            {/* Header */}

            <View className="flex-row items-center justify-between mb-4">

                <View>

                    <Text className="text-base font-extrabold text-gray-900">

                        Available Coupons

                    </Text>

                    <Text className="text-xs text-gray-400 mt-1">

                        Save more on your shopping

                    </Text>

                </View>


                <View className="bg-emerald-50 px-3 py-2 rounded-full">

                    <Text className="text-emerald-700 text-xs font-bold">

                        {items.length} Coupons

                    </Text>

                </View>

            </View>


            {/* Coupon List */}

            <FlatList

                data={items}

                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item }) => (

                    <CouponCard coupon={item} />

                )}

                showsVerticalScrollIndicator={false}

                contentContainerStyle={{
                    paddingBottom: 20
                }}

                refreshing={loading}

                onRefresh={() => dispatch(fetchCoupons())}

            />

        </View>

    );

};


export default Coupon;