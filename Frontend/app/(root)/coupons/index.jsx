// import React, { useEffect } from "react";
// import { useSafeAreaInsets } from "react-native-safe-area-context";


// import {
//     View,
//     Text,
//     FlatList,
//     ActivityIndicator,
//     Pressable,
//     Image,
// } from "react-native";

// import { useDispatch, useSelector } from "react-redux";

// import { fetchCoupons } from "../../../redux/slices/couponsSlice.js";

// import {
//     TicketPercent,
//     Tag,
//     CalendarDays,
//     ShoppingBag,
//     Package,
//     Layers,
//     CheckCircle2,
//     AlertCircle,
//     RefreshCw,
//     Gift,
// } from "lucide-react-native";


// // =====================================
// // Helper: Format Currency
// // =====================================

// const formatPrice = (price) => {

//     const amount = Number(price || 0);

//     return `₹${amount.toLocaleString("en-IN")}`;

// };


// // =====================================
// // Helper: Format Date
// // =====================================

// const formatDate = (date) => {

//     if (!date) return "";

//     return new Date(date).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//     });

// };


// // =====================================
// // Helper: Discount Text
// // =====================================

// const getDiscountText = (coupon) => {

//     const value = Number(coupon.value || 0);

//     switch (coupon.type) {

//         case "FLAT":
//             return `${formatPrice(value)} OFF`;

//         case "PERCENTAGE":
//             return `${value}% OFF`;

//         case "UPTO":
//             return `UP TO ${formatPrice(coupon.maxDiscountAmount || value)} OFF`;

//         default:
//             return `${value} OFF`;

//     }

// };


// // =====================================
// // Helper: Applicability Details
// // =====================================

// const getApplicability = (coupon) => {

//     const { type, details } = coupon.appliesTo || {};

//     switch (type) {

//         case "PRODUCT":

//             return {
//                 title: "Applicable Product",
//                 name: details?.productName || "Product",
//                 image: details?.imageUrl,
//                 icon: ShoppingBag,
//             };


//         case "VARIANT":

//             return {
//                 title: "Applicable Variant",
//                 name: `${details?.product?.productName || "Product"} - ${details?.description || "Variant"}`,
//                 image:
//                     details?.images?.find((img) => img.isPrimary)?.imageUrl ||
//                     details?.images?.[0]?.imageUrl ||
//                     details?.product?.imageUrl,
//                 icon: Package,
//             };


//         case "CATEGORY":

//             return {
//                 title: "Applicable Category",
//                 name: details?.productCategoryName || "Category",
//                 image: details?.imageUrl,
//                 icon: Layers,
//             };


//         case "SUBCATEGORY":

//             return {
//                 title: "Applicable Subcategory",
//                 name: details?.productSubCategoryName || "Subcategory",
//                 image: details?.imageUrl,
//                 icon: Layers,
//             };


//         case "ALL":

//         case "ALL_PRODUCTS":

//         default:

//             return {
//                 title: "Applicable On",
//                 name: "All Products",
//                 image: null,
//                 icon: Gift,
//             };

//     }

// };


// // =====================================
// // Coupon Card Component
// // =====================================

// const CouponCard = ({ coupon }) => {

//     const applicability = getApplicability(coupon);

//     const ApplicabilityIcon = applicability.icon;

//     return (

//         <View className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">

//             {/* Top Discount Section */}

//             <View className="bg-emerald-50 p-4 flex-row items-center justify-between">

//                 <View className="flex-1">

//                     <View className="flex-row items-center mb-2">

//                         <TicketPercent size={17} color="#059669" />

//                         <Text className="text-emerald-700 text-xs font-bold ml-2">
//                             SPECIAL COUPON
//                         </Text>

//                     </View>

//                     <Text className="text-2xl font-extrabold text-emerald-700">

//                         {getDiscountText(coupon)}

//                     </Text>

//                     <Text className="text-gray-600 text-xs mt-1">

//                         {coupon.description || "Get exciting discounts on your purchase"}

//                     </Text>

//                 </View>


//                 <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

//                     <Gift size={27} color="#059669" />

//                 </View>

//             </View>


//             {/* Coupon Code */}

//             <View className="p-4">

//                 <View className="flex-row items-center justify-between">

//                     <View className="flex-1">

//                         <Text className="text-gray-400 text-[10px] font-bold uppercase">

//                             Coupon Code

//                         </Text>

//                         <Text className="text-gray-900 text-base font-extrabold tracking-wider mt-1">

//                             {coupon.code}

//                         </Text>

//                     </View>


//                     <View className="bg-emerald-50 border border-dashed border-emerald-400 rounded-lg px-3 py-2">

//                         <Text className="text-emerald-700 text-xs font-extrabold">

//                             {coupon.type}

//                         </Text>

//                     </View>

//                 </View>


//                 {/* Divider */}

//                 <View className="border-t border-dashed border-gray-200 my-4" />


//                 {/* Applicability */}

//                 <View>

//                     <Text className="text-gray-400 text-[10px] font-bold uppercase mb-3">

//                         Coupon Applicable On

//                     </Text>


//                     <View className="flex-row items-center">

//                         {applicability.image ? (

//                             <Image
//                                 source={{ uri: applicability.image }}
//                                 className="w-12 h-12 rounded-xl bg-gray-100"
//                                 resizeMode="cover"
//                             />

//                         ) : (

//                             <View className="w-12 h-12 rounded-xl bg-emerald-50 items-center justify-center">

//                                 <ApplicabilityIcon size={21} color="#059669" />

//                             </View>

//                         )}


//                         <View className="flex-1 ml-3">

//                             <Text className="text-gray-400 text-[10px]">

//                                 {applicability.title}

//                             </Text>

//                             <Text
//                                 className="text-gray-800 text-sm font-bold mt-1"
//                                 numberOfLines={2}
//                             >

//                                 {applicability.name}

//                             </Text>

//                         </View>


//                         <CheckCircle2 size={19} color="#059669" />

//                     </View>

//                 </View>


//                 {/* Maximum Discount */}

//                 {coupon.maxDiscountAmount && (

//                     <View className="flex-row items-center mt-4">

//                         <Tag size={15} color="#6B7280" />

//                         <Text className="text-gray-500 text-xs ml-2">

//                             Maximum Discount:

//                         </Text>

//                         <Text className="text-gray-800 text-xs font-bold ml-1">

//                             {formatPrice(coupon.maxDiscountAmount)}

//                         </Text>

//                     </View>

//                 )}


//                 {/* Expiry Date */}

//                 <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">

//                     <CalendarDays size={15} color="#6B7280" />

//                     <Text className="text-gray-500 text-xs ml-2">

//                         Valid Till

//                     </Text>

//                     <Text className="text-gray-800 text-xs font-bold ml-1">

//                         {formatDate(coupon.expiryDate)}

//                     </Text>

//                 </View>

//             </View>

//         </View>

//     );

// };


// // =====================================
// // Main Coupon Component
// // =====================================

// const Coupon = () => {

//     const dispatch = useDispatch();

//     const insets = useSafeAreaInsets();


//     const {
//         items,
//         loading,
//         error
//     } = useSelector((state) => state.coupons);


//     // Fetch Coupons

//     useEffect(() => {

//         dispatch(fetchCoupons());

//     }, [dispatch]);


//     // Loading State

//     if (loading && items.length === 0) {

//         return (

//             <View className="flex-1 items-center justify-center py-16">

//                 <ActivityIndicator size="large" color="#059669" />

//                 <Text className="text-gray-500 text-sm mt-3">

//                     Fetching available coupons...

//                 </Text>

//             </View>

//         );

//     }


//     // Error State

//     if (error && items.length === 0) {

//         return (

//             <View className="items-center justify-center py-12">

//                 <AlertCircle size={40} color="#EF4444" />

//                 <Text className="text-gray-800 font-bold text-base mt-3">

//                     Something went wrong!

//                 </Text>

//                 <Text className="text-gray-500 text-xs mt-2 text-center">

//                     {error}

//                 </Text>


//                 <Pressable
//                     onPress={() => dispatch(fetchCoupons())}
//                     className="bg-emerald-600 px-5 py-3 rounded-xl mt-4 flex-row items-center"
//                 >

//                     <RefreshCw size={15} color="white" />

//                     <Text className="text-white font-bold text-xs ml-2">

//                         Try Again

//                     </Text>

//                 </Pressable>

//             </View>

//         );

//     }


//     // Empty State

//     if (!items || items.length === 0) {

//         return (

//             <View className="items-center justify-center py-14">

//                 <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">

//                     <TicketPercent size={36} color="#059669" />

//                 </View>

//                 <Text className="text-gray-800 font-bold text-base mt-4">

//                     No Coupons Available

//                 </Text>

//                 <Text className="text-gray-400 text-xs mt-2 text-center">

//                     Currently there are no active coupons available.

//                 </Text>

//             </View>

//         );

//     }


//     // Main UI

//     return (

//         <View className="flex-1" style={{ paddingTop: insets.top }}>

//             {/* Header */}

//             <View className="flex-row items-center justify-between mb-4">

//                 <View>

//                     <Text className="text-base font-extrabold text-gray-900">

//                         Available Coupons

//                     </Text>

//                     <Text className="text-xs text-gray-400 mt-1">

//                         Save more on your shopping

//                     </Text>

//                 </View>


//                 <View className="bg-emerald-50 px-3 py-2 rounded-full">

//                     <Text className="text-emerald-700 text-xs font-bold">

//                         {items.length} Coupons

//                     </Text>

//                 </View>

//             </View>


//             {/* Coupon List */}

//             <FlatList

//                 data={items}

//                 keyExtractor={(item) => item.id.toString()}

//                 renderItem={({ item }) => (

//                     <CouponCard coupon={item} />

//                 )}

//                 showsVerticalScrollIndicator={false}

//                 contentContainerStyle={{
//                     paddingBottom: 20
//                 }}

//                 refreshing={loading}

//                 onRefresh={() => dispatch(fetchCoupons())}

//             />

//         </View>

//     );

// };


// export default Coupon;



import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";


import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
} from "react-native";

import { useRouter } from "expo-router";

import * as Clipboard from "expo-clipboard";

import { useDispatch, useSelector } from "react-redux";

import { fetchCoupons } from "../../../redux/slices/couponsSlice.js";

import CouponSkeleton from "../../../components/skeleton/CouponSkeleton.jsx";

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
    Copy,
    Check,
    ChevronRight,
} from "lucide-react-native";


// =====================================
// Navigation Routes
// (Change these paths to match your Expo Router files)
// =====================================

const ROUTES = {
    product: (id) => `/product/${id}`,
    variant: (productId, variantId) => `/product/${productId}?variantId=${variantId}`,
    category: (id) => `/category/${id}`,
    subcategory: (id) => `/subcategory/${id}`,
};


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
// Helper: Expiry Badge (only when ending soon / expired)
// =====================================

const getExpiryBadge = (date) => {

    if (!date) return null;

    const end = new Date(date);

    if (Number.isNaN(end.getTime())) return null;

    const msLeft = end.getTime() - Date.now();

    if (msLeft <= 0) {
        return {
            label: "Expired",
            bg: "bg-red-100",
            text: "text-red-700",
        };
    }

    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3) {
        return {
            label: `Ends in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
            bg: "bg-amber-100",
            text: "text-amber-700",
        };
    }

    return null;

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
                title: "Applicable product",
                name: details?.productName || "Product",
                image: details?.imageUrl,
                icon: ShoppingBag,
            };


        case "VARIANT":

            return {
                title: "Applicable variant",
                name: `${details?.product?.productName || "Product"} - ${details?.description || "Variant"}`,
                image:
                    details?.images?.find((img) => img.isPrimary)?.imageUrl ||
                    details?.images?.[0]?.imageUrl ||
                    details?.product?.imageUrl,
                icon: Package,
            };


        case "CATEGORY":

            return {
                title: "Applicable category",
                name: details?.productCategoryName || "Category",
                image: details?.imageUrl,
                icon: Layers,
            };


        case "SUBCATEGORY":

            return {
                title: "Applicable subcategory",
                name: details?.productSubCategoryName || "Subcategory",
                image: details?.imageUrl,
                icon: Layers,
            };


        case "ALL":

        case "ALL_PRODUCTS":

        default:

            return {
                title: "Applicable on",
                name: "All products",
                image: null,
                icon: Gift,
            };

    }

};


// =====================================
// Helper: Where to navigate on tap
// (returns null => row is not tappable)
// =====================================

const getNavigationHref = (coupon) => {

    const { type, details } = coupon.appliesTo || {};

    switch (type) {

        case "PRODUCT": {

            const id = details?.id ?? details?.productId;

            return id ? ROUTES.product(id) : null;

        }


        case "VARIANT": {

            const productId = details?.productId ?? details?.product?.id;

            const variantId = details?.id;

            if (!productId) return null;

            return variantId
                ? ROUTES.variant(productId, variantId)
                : ROUTES.product(productId);

        }


        case "CATEGORY": {

            const id = details?.id ?? details?.productCategoryId;

            return id ? ROUTES.category(id) : null;

        }


        case "SUBCATEGORY": {

            const id = details?.id ?? details?.productSubCategoryId;

            return id ? ROUTES.subcategory(id) : null;

        }


        default:

            return null;

    }

};


// =====================================
// Hook: Copy Code To Clipboard
// =====================================

const useCopyCode = (code) => {

    const [copied, setCopied] = useState(false);

    const timerRef = useRef(null);

    useEffect(() => {

        return () => {

            if (timerRef.current) clearTimeout(timerRef.current);

        };

    }, []);

    const copy = useCallback(async () => {

        try {

            await Clipboard.setStringAsync(String(code));

            setCopied(true);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => setCopied(false), 2000);

        } catch (err) {

            console.log("Copy failed:", err);

        }

    }, [code]);

    return { copied, copy };

};


// =====================================
// Coupon Card Component
// =====================================

const CouponCard = ({ coupon }) => {

    const router = useRouter();

    const { copied, copy } = useCopyCode(coupon.code);

    const applicability = getApplicability(coupon);

    const ApplicabilityIcon = applicability.icon;

    const href = getNavigationHref(coupon);

    const expiryBadge = getExpiryBadge(coupon.expiryDate);

    const showMaxDiscount =
        coupon.type !== "UPTO" && Number(coupon.maxDiscountAmount) > 0;


    const handleApplicabilityPress = () => {

        if (href) router.push(href);

    };


    const applicabilityContent = (

        <>

            {applicability.image ? (

                <Image
                    source={{ uri: applicability.image }}
                    className="w-12 h-12 rounded-xl bg-gray-100"
                    resizeMode="cover"
                />

            ) : (

                <View className="w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center">

                    <ApplicabilityIcon size={21} color="#059669" />

                </View>

            )}


            <View className="flex-1 ml-3">

                <Text className="text-gray-400 text-[11px]">

                    {applicability.title}

                </Text>

                <Text
                    className="text-gray-800 text-sm font-bold mt-0.5"
                    numberOfLines={2}
                >

                    {applicability.name}

                </Text>

            </View>

        </>

    );


    return (

        <View
            className="bg-white rounded-3xl border border-gray-100 mb-4 overflow-hidden"
            style={{ elevation: 2 }}
        >

            {/* Top Discount Section */}

            <View className="bg-emerald-50 px-4 py-5 flex-row items-center justify-between">

                <View className="flex-1 pr-3">

                    <View className="flex-row items-center self-start bg-white rounded-full px-2.5 py-1">

                        <TicketPercent size={14} color="#059669" />

                        <Text className="text-emerald-700 text-xs font-bold ml-1.5">
                            Special coupon
                        </Text>

                    </View>

                    <Text className="text-3xl font-extrabold text-emerald-700 mt-3">

                        {getDiscountText(coupon)}

                    </Text>

                    <Text
                        className="text-gray-600 text-xs mt-1.5"
                        numberOfLines={2}
                    >

                        {coupon.description || "Get exciting discounts on your purchase"}

                    </Text>

                </View>


                <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

                    <Gift size={27} color="#059669" />

                </View>

            </View>


            <View className="p-4">

                {/* Coupon Code + Copy */}

                <View className="flex-row items-center justify-between border border-dashed border-emerald-400 bg-emerald-50 rounded-xl pl-4 pr-2 py-2">

                    <View className="flex-1 pr-2">

                        <Text className="text-gray-400 text-[11px]">

                            Coupon code

                        </Text>

                        <Text
                            className="text-gray-900 text-base font-extrabold tracking-widest mt-0.5"
                            numberOfLines={1}
                        >

                            {coupon.code}

                        </Text>

                    </View>


                    <Pressable
                        onPress={copy}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Copy coupon code ${coupon.code}`}
                        className={`flex-row items-center rounded-lg px-3 py-2 active:opacity-70 ${copied ? "bg-emerald-600" : "bg-white border border-emerald-200"}`}
                    >

                        {copied ? (

                            <Check size={15} color="#FFFFFF" />

                        ) : (

                            <Copy size={15} color="#047857" />

                        )}

                        <Text className={`text-xs font-bold ml-1.5 ${copied ? "text-white" : "text-emerald-700"}`}>

                            {copied ? "Copied" : "Copy"}

                        </Text>

                    </Pressable>

                </View>


                {/* Divider */}

                <View className="border-t border-dashed border-gray-200 my-4" />


                {/* Applicability (tap to open) */}

                <View>

                    <Text className="text-gray-400 text-[11px] font-semibold mb-2">

                        Coupon applicable on

                    </Text>


                    {href ? (

                        <Pressable
                            onPress={handleApplicabilityPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${applicability.name}`}
                            className="flex-row items-center bg-gray-50 rounded-2xl p-3 active:opacity-70"
                        >

                            {applicabilityContent}

                            <Text className="text-emerald-700 text-xs font-bold ml-2">

                                View

                            </Text>

                            <ChevronRight size={16} color="#047857" />

                        </Pressable>

                    ) : (

                        <View className="flex-row items-center bg-gray-50 rounded-2xl p-3">

                            {applicabilityContent}

                            <CheckCircle2 size={19} color="#059669" />

                        </View>

                    )}

                </View>


                {/* Maximum Discount */}

                {showMaxDiscount && (

                    <View className="flex-row items-center mt-4">

                        <Tag size={15} color="#6B7280" />

                        <Text className="text-gray-500 text-xs ml-2">

                            Maximum discount:

                        </Text>

                        <Text className="text-gray-800 text-xs font-bold ml-1">

                            {formatPrice(coupon.maxDiscountAmount)}

                        </Text>

                    </View>

                )}


                {/* Expiry Date */}

                <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">

                    <View className="flex-row items-center">

                        <CalendarDays size={15} color="#6B7280" />

                        <Text className="text-gray-500 text-xs ml-2">

                            Valid till

                        </Text>

                        <Text className="text-gray-800 text-xs font-bold ml-1">

                            {formatDate(coupon.expiryDate) || "No expiry"}

                        </Text>

                    </View>


                    {expiryBadge && (

                        <View className={`px-2.5 py-1 rounded-full ${expiryBadge.bg}`}>

                            <Text className={`text-[10px] font-bold ${expiryBadge.text}`}>

                                {expiryBadge.label}

                            </Text>

                        </View>

                    )}

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


    const hasItems = Array.isArray(items) && items.length > 0;


    // Fetch Coupons

    useEffect(() => {

        dispatch(fetchCoupons());

    }, [dispatch]);


    // Loading State (Skeleton)

    if (loading && !hasItems) {

        return (

            <View className="flex-1" style={{ paddingTop: insets.top }}>

                <CouponSkeleton count={3} />

            </View>

        );

    }


    // Error State

    if (error && !hasItems) {

        return (

            <View className="items-center justify-center py-12 px-6">

                <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center">

                    <AlertCircle size={38} color="#EF4444" />

                </View>

                <Text className="text-gray-800 font-bold text-base mt-4">

                    Something went wrong!

                </Text>

                <Text className="text-gray-500 text-xs mt-2 text-center">

                    {String(error)}

                </Text>


                <Pressable
                    onPress={() => dispatch(fetchCoupons())}
                    className="bg-emerald-600 px-5 py-3 rounded-xl mt-5 flex-row items-center active:opacity-80"
                >

                    <RefreshCw size={15} color="white" />

                    <Text className="text-white font-bold text-xs ml-2">

                        Try again

                    </Text>

                </Pressable>

            </View>

        );

    }


    // Empty State

    if (!hasItems) {

        return (

            <View className="items-center justify-center py-14 px-6">

                <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center">

                    <TicketPercent size={36} color="#059669" />

                </View>

                <Text className="text-gray-800 font-bold text-base mt-4">

                    No coupons available

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

                    <Text className="text-lg font-extrabold text-gray-900">

                        Available coupons

                    </Text>

                    <Text className="text-xs text-gray-400 mt-0.5">

                        Save more on your shopping

                    </Text>

                </View>


                <View className="bg-emerald-50 px-3 py-2 rounded-full">

                    <Text className="text-emerald-700 text-xs font-bold">

                        {items.length} {items.length === 1 ? "coupon" : "coupons"}

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
                    paddingBottom: 24
                }}

                refreshing={loading}

                onRefresh={() => dispatch(fetchCoupons())}

            />

        </View>

    );

};


export default Coupon;