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

// import { fetchRewards } from "../../../redux/slices/rewardsSlice";

// import {
//     Gift,
//     TicketPercent,
//     CalendarDays,
//     ShoppingBag,
//     Package,
//     Layers,
//     CheckCircle2,
//     AlertCircle,
//     RefreshCw,
//     ShieldCheck,
//     CircleCheck,
//     Ban,
//     Tag,
// } from "lucide-react-native";


// // =====================================
// // Helper: Currency
// // =====================================

// const formatPrice = (price) => {

//     const amount = Number(price || 0);

//     return `₹${amount.toLocaleString("en-IN")}`;

// };


// // =====================================
// // Helper: Date
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

// const getDiscountText = (reward) => {

//     const value = Number(reward.value || 0);

//     switch (reward.type) {

//         case "FLAT":
//             return `${formatPrice(value)} OFF`;

//         case "PERCENTAGE":
//             return `${value}% OFF`;

//         case "UPTO":
//             return `UP TO ${formatPrice(reward.maxDiscountAmount || value)} OFF`;

//         default:
//             return `${value} OFF`;

//     }

// };


// // =====================================
// // Helper: Applicability
// // =====================================

// const getApplicability = (reward) => {

//     const { type, details } = reward.appliesTo || {};

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
// // Reward Card
// // =====================================

// const RewardCard = ({ reward }) => {

//     const applicability = getApplicability(reward);

//     const ApplicabilityIcon = applicability.icon;

//     const usage = reward.usage || {};

//     const used = Number(usage.usedByYou || 0);

//     const totalAllowed = usage.totalAllowed;

//     const remaining = usage.remainingUses;

//     const canUse = usage.canUse !== false;

//     const unlimited = totalAllowed === null;


//     // Usage Progress

//     const progress = unlimited
//         ? 0
//         : totalAllowed > 0
//             ? Math.min((used / totalAllowed) * 100, 100)
//             : 0;


//     return (

//         <View className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">

//             {/* Discount Header */}

//             <View className="bg-violet-50 p-4 flex-row items-center justify-between">

//                 <View className="flex-1">

//                     <View className="flex-row items-center mb-2">

//                         <Gift size={17} color="#7C3AED" />

//                         <Text className="text-violet-700 text-xs font-bold ml-2">

//                             EXCLUSIVE REWARD

//                         </Text>

//                     </View>


//                     <Text className="text-2xl font-extrabold text-violet-700">

//                         {getDiscountText(reward)}

//                     </Text>


//                     <Text className="text-gray-600 text-xs mt-1">

//                         {reward.description || "Enjoy your exclusive reward"}

//                     </Text>

//                 </View>


//                 <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

//                     <TicketPercent size={27} color="#7C3AED" />

//                 </View>

//             </View>


//             {/* Reward Body */}

//             <View className="p-4">


//                 {/* Reward Code */}

//                 <View className="flex-row items-center justify-between">

//                     <View className="flex-1">

//                         <Text className="text-gray-400 text-[10px] font-bold uppercase">

//                             Reward Code

//                         </Text>

//                         <Text className="text-gray-900 text-base font-extrabold tracking-wider mt-1">

//                             {reward.code}

//                         </Text>

//                     </View>


//                     <View className="bg-violet-50 border border-dashed border-violet-400 rounded-lg px-3 py-2">

//                         <Text className="text-violet-700 text-xs font-extrabold">

//                             {reward.type}

//                         </Text>

//                     </View>

//                 </View>


//                 {/* Divider */}

//                 <View className="border-t border-dashed border-gray-200 my-4" />


//                 {/* Applicability */}

//                 <View>

//                     <Text className="text-gray-400 text-[10px] font-bold uppercase mb-3">

//                         Reward Applicable On

//                     </Text>


//                     <View className="flex-row items-center">


//                         {applicability.image ? (

//                             <Image
//                                 source={{ uri: applicability.image }}
//                                 className="w-12 h-12 rounded-xl bg-gray-100"
//                                 resizeMode="cover"
//                             />

//                         ) : (

//                             <View className="w-12 h-12 rounded-xl bg-violet-50 items-center justify-center">

//                                 <ApplicabilityIcon size={21} color="#7C3AED" />

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


//                         <CheckCircle2 size={19} color="#7C3AED" />

//                     </View>

//                 </View>


//                 {/* Usage Section */}

//                 <View className="bg-gray-50 rounded-xl p-3 mt-4">


//                     <View className="flex-row items-center justify-between mb-3">

//                         <View className="flex-row items-center">

//                             <ShieldCheck size={16} color="#6B7280" />

//                             <Text className="text-gray-700 text-xs font-bold ml-2">

//                                 Reward Usage

//                             </Text>

//                         </View>


//                         <View className={`px-2.5 py-1 rounded-full flex-row items-center ${canUse ? "bg-green-100" : "bg-red-100"}`}>

//                             {canUse ? (

//                                 <CircleCheck size={12} color="#15803D" />

//                             ) : (

//                                 <Ban size={12} color="#DC2626" />

//                             )}

//                             <Text className={`text-[10px] font-bold ml-1 ${canUse ? "text-green-700" : "text-red-700"}`}>

//                                 {canUse ? "Available" : "Limit Reached"}

//                             </Text>

//                         </View>

//                     </View>


//                     <View className="flex-row justify-between">

//                         <View>

//                             <Text className="text-gray-400 text-[10px]">

//                                 Used

//                             </Text>

//                             <Text className="text-gray-900 text-sm font-extrabold mt-1">

//                                 {used}

//                             </Text>

//                         </View>


//                         <View>

//                             <Text className="text-gray-400 text-[10px]">

//                                 Total Allowed

//                             </Text>

//                             <Text className="text-gray-900 text-sm font-extrabold mt-1">

//                                 {unlimited ? "Unlimited" : totalAllowed}

//                             </Text>

//                         </View>


//                         <View>

//                             <Text className="text-gray-400 text-[10px]">

//                                 Remaining

//                             </Text>

//                             <Text className="text-violet-700 text-sm font-extrabold mt-1">

//                                 {unlimited ? "Unlimited" : remaining}

//                             </Text>

//                         </View>

//                     </View>


//                     {/* Progress Bar */}

//                     {!unlimited && (

//                         <View className="mt-4">

//                             <View className="h-2 bg-gray-200 rounded-full overflow-hidden">

//                                 <View
//                                     className="h-full bg-violet-600 rounded-full"
//                                     style={{
//                                         width: `${progress}%`
//                                     }}
//                                 />

//                             </View>


//                             <Text className="text-gray-400 text-[10px] mt-2">

//                                 {used} of {totalAllowed} reward uses consumed

//                             </Text>

//                         </View>

//                     )}

//                 </View>


//                 {/* Maximum Discount */}

//                 {reward.maxDiscountAmount !== null &&
//                     reward.maxDiscountAmount !== undefined && (

//                         <View className="flex-row items-center mt-4">

//                             <Tag size={15} color="#6B7280" />

//                             <Text className="text-gray-500 text-xs ml-2">

//                                 Maximum Discount:

//                             </Text>

//                             <Text className="text-gray-800 text-xs font-bold ml-1">

//                                 {formatPrice(reward.maxDiscountAmount)}

//                             </Text>

//                         </View>

//                     )}


//                 {/* Expiry Date */}

//                 <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">

//                     <CalendarDays size={15} color="#6B7280" />

//                     <Text className="text-gray-500 text-xs ml-2">

//                         Valid Till

//                     </Text>

//                     <Text className="text-gray-800 text-xs font-bold ml-1">

//                         {formatDate(reward.expiryDate)}

//                     </Text>

//                 </View>


//             </View>

//         </View>

//     );

// };


// // =====================================
// // Main Reward Screen
// // =====================================

// const Reward = () => {

//     const insets = useSafeAreaInsets();


//     const dispatch = useDispatch();


//     const {
//         items,
//         loading,
//         error
//     } = useSelector((state) => state.rewards);


//     // Fetch Rewards

//     useEffect(() => {

//         dispatch(fetchRewards());

//     }, [dispatch]);


//     // Loading

//     if (loading && items.length === 0) {

//         return (

//             <View className="flex-1 items-center justify-center py-16">

//                 <ActivityIndicator size="large" color="#7C3AED" />

//                 <Text className="text-gray-500 text-sm mt-3">

//                     Fetching your rewards...

//                 </Text>

//             </View>

//         );

//     }


//     // Error

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
//                     onPress={() => dispatch(fetchRewards())}
//                     className="bg-violet-600 px-5 py-3 rounded-xl mt-4 flex-row items-center"
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

//                 <View className="w-20 h-20 rounded-full bg-violet-50 items-center justify-center">

//                     <Gift size={36} color="#7C3AED" />

//                 </View>


//                 <Text className="text-gray-800 font-bold text-base mt-4">

//                     No Rewards Available

//                 </Text>


//                 <Text className="text-gray-400 text-xs mt-2 text-center">

//                     You don't have any active rewards right now.

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

//                         My Rewards

//                     </Text>

//                     <Text className="text-xs text-gray-400 mt-1">

//                         Your exclusive rewards and benefits

//                     </Text>

//                 </View>


//                 <View className="bg-violet-50 px-3 py-2 rounded-full">

//                     <Text className="text-violet-700 text-xs font-bold">

//                         {items.length} Rewards

//                     </Text>

//                 </View>

//             </View>


//             {/* Reward List */}

//             <FlatList

//                 data={items}

//                 keyExtractor={(item) => item.id.toString()}

//                 renderItem={({ item }) => (

//                     <RewardCard reward={item} />

//                 )}

//                 showsVerticalScrollIndicator={false}

//                 contentContainerStyle={{
//                     paddingBottom: 25
//                 }}

//                 refreshing={loading}

//                 onRefresh={() => dispatch(fetchRewards())}

//             />


//         </View>

//     );

// };


// export default Reward;


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

import { fetchRewards } from "../../../redux/slices/rewardsSlice";

import RewardSkeleton from "../../../components/skeleton/RewardSkeleton";

import {
    Gift,
    TicketPercent,
    CalendarDays,
    ShoppingBag,
    Package,
    Layers,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ShieldCheck,
    CircleCheck,
    Ban,
    Tag,
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
// Helper: Currency
// =====================================

const formatPrice = (price) => {

    const amount = Number(price || 0);

    return `₹${amount.toLocaleString("en-IN")}`;

};


// =====================================
// Helper: Date
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

const getDiscountText = (reward) => {

    const value = Number(reward.value || 0);

    switch (reward.type) {

        case "FLAT":
            return `${formatPrice(value)} OFF`;

        case "PERCENTAGE":
            return `${value}% OFF`;

        case "UPTO":
            return `UP TO ${formatPrice(reward.maxDiscountAmount || value)} OFF`;

        default:
            return `${value} OFF`;

    }

};


// =====================================
// Helper: Applicability
// =====================================

const getApplicability = (reward) => {

    const { type, details } = reward.appliesTo || {};

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

const getNavigationHref = (reward) => {

    const { type, details } = reward.appliesTo || {};

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
// Reward Card
// =====================================

const RewardCard = ({ reward }) => {

    const router = useRouter();

    const { copied, copy } = useCopyCode(reward.code);

    const applicability = getApplicability(reward);

    const ApplicabilityIcon = applicability.icon;

    const href = getNavigationHref(reward);

    const expiryBadge = getExpiryBadge(reward.expiryDate);

    const usage = reward.usage || {};

    const used = Number(usage.usedByYou || 0);

    const totalAllowed = usage.totalAllowed;

    const remaining = usage.remainingUses;

    const canUse = usage.canUse !== false;

    const unlimited = totalAllowed === null || totalAllowed === undefined;

    const showMaxDiscount =
        reward.type !== "UPTO" && Number(reward.maxDiscountAmount) > 0;


    // Usage Progress

    const progress = unlimited
        ? 0
        : totalAllowed > 0
            ? Math.min((used / totalAllowed) * 100, 100)
            : 0;


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

                <View className="w-12 h-12 rounded-xl bg-violet-100 items-center justify-center">

                    <ApplicabilityIcon size={21} color="#7C3AED" />

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
            className={`bg-white rounded-3xl border border-gray-100 mb-4 overflow-hidden ${canUse ? "" : "opacity-80"}`}
            style={{ elevation: 2 }}
        >

            {/* Discount Header */}

            <View className="bg-violet-50 px-4 py-5 flex-row items-center justify-between">

                <View className="flex-1 pr-3">

                    <View className="flex-row items-center self-start bg-white rounded-full px-2.5 py-1">

                        <Gift size={14} color="#7C3AED" />

                        <Text className="text-violet-700 text-xs font-bold ml-1.5">
                            Exclusive reward
                        </Text>

                    </View>


                    <Text className="text-3xl font-extrabold text-violet-700 mt-3">

                        {getDiscountText(reward)}

                    </Text>


                    <Text
                        className="text-gray-600 text-xs mt-1.5"
                        numberOfLines={2}
                    >

                        {reward.description || "Enjoy your exclusive reward"}

                    </Text>

                </View>


                <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

                    <TicketPercent size={27} color="#7C3AED" />

                </View>

            </View>


            {/* Reward Body */}

            <View className="p-4">


                {/* Reward Code + Copy */}

                <View className="flex-row items-center justify-between border border-dashed border-violet-400 bg-violet-50 rounded-xl pl-4 pr-2 py-2">

                    <View className="flex-1 pr-2">

                        <Text className="text-gray-400 text-[11px]">

                            Reward code

                        </Text>

                        <Text
                            className="text-gray-900 text-base font-extrabold tracking-widest mt-0.5"
                            numberOfLines={1}
                        >

                            {reward.code}

                        </Text>

                    </View>


                    <Pressable
                        onPress={copy}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Copy reward code ${reward.code}`}
                        className={`flex-row items-center rounded-lg px-3 py-2 active:opacity-70 ${copied ? "bg-violet-600" : "bg-white border border-violet-200"}`}
                    >

                        {copied ? (

                            <Check size={15} color="#FFFFFF" />

                        ) : (

                            <Copy size={15} color="#6D28D9" />

                        )}

                        <Text className={`text-xs font-bold ml-1.5 ${copied ? "text-white" : "text-violet-700"}`}>

                            {copied ? "Copied" : "Copy"}

                        </Text>

                    </Pressable>

                </View>


                {/* Divider */}

                <View className="border-t border-dashed border-gray-200 my-4" />


                {/* Applicability (tap to open) */}

                <View>

                    <Text className="text-gray-400 text-[11px] font-semibold mb-2">

                        Reward applicable on

                    </Text>


                    {href ? (

                        <Pressable
                            onPress={handleApplicabilityPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${applicability.name}`}
                            className="flex-row items-center bg-gray-50 rounded-2xl p-3 active:opacity-70"
                        >

                            {applicabilityContent}

                            <Text className="text-violet-700 text-xs font-bold ml-2">

                                View

                            </Text>

                            <ChevronRight size={16} color="#6D28D9" />

                        </Pressable>

                    ) : (

                        <View className="flex-row items-center bg-gray-50 rounded-2xl p-3">

                            {applicabilityContent}

                            <CheckCircle2 size={19} color="#7C3AED" />

                        </View>

                    )}

                </View>


                {/* Usage Section */}

                <View className="bg-gray-50 rounded-2xl p-3 mt-4">


                    <View className="flex-row items-center justify-between mb-4">

                        <View className="flex-row items-center">

                            <ShieldCheck size={16} color="#6B7280" />

                            <Text className="text-gray-700 text-xs font-bold ml-2">

                                Reward usage

                            </Text>

                        </View>


                        <View className={`px-2.5 py-1 rounded-full flex-row items-center ${canUse ? "bg-green-100" : "bg-red-100"}`}>

                            {canUse ? (

                                <CircleCheck size={12} color="#15803D" />

                            ) : (

                                <Ban size={12} color="#DC2626" />

                            )}

                            <Text className={`text-[10px] font-bold ml-1 ${canUse ? "text-green-700" : "text-red-700"}`}>

                                {canUse ? "Available" : "Limit reached"}

                            </Text>

                        </View>

                    </View>


                    <View className="flex-row">

                        <View className="flex-1">

                            <Text className="text-gray-400 text-[11px]">

                                Used

                            </Text>

                            <Text className="text-gray-900 text-sm font-extrabold mt-1">

                                {used}

                            </Text>

                        </View>


                        <View className="flex-1 items-center">

                            <Text className="text-gray-400 text-[11px]">

                                Total allowed

                            </Text>

                            <Text className="text-gray-900 text-sm font-extrabold mt-1">

                                {unlimited ? "Unlimited" : totalAllowed}

                            </Text>

                        </View>


                        <View className="flex-1 items-end">

                            <Text className="text-gray-400 text-[11px]">

                                Remaining

                            </Text>

                            <Text className="text-violet-700 text-sm font-extrabold mt-1">

                                {unlimited ? "Unlimited" : remaining}

                            </Text>

                        </View>

                    </View>


                    {/* Progress Bar */}

                    {!unlimited && (

                        <View className="mt-4">

                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">

                                <View
                                    className={`h-full rounded-full ${canUse ? "bg-violet-600" : "bg-red-500"}`}
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />

                            </View>


                            <Text className="text-gray-400 text-[11px] mt-2">

                                {used} of {totalAllowed} reward uses consumed

                            </Text>

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

                            {formatPrice(reward.maxDiscountAmount)}

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

                            {formatDate(reward.expiryDate) || "No expiry"}

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
// Main Reward Screen
// =====================================

const Reward = () => {

    const insets = useSafeAreaInsets();


    const dispatch = useDispatch();


    const {
        items,
        loading,
        error
    } = useSelector((state) => state.rewards);


    const hasItems = Array.isArray(items) && items.length > 0;


    // Fetch Rewards

    useEffect(() => {

        dispatch(fetchRewards());

    }, [dispatch]);


    // Loading (Skeleton)

    if (loading && !hasItems) {

        return (

            <View className="flex-1" style={{ paddingTop: insets.top }}>

                <RewardSkeleton count={3} />

            </View>

        );

    }


    // Error

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
                    onPress={() => dispatch(fetchRewards())}
                    className="bg-violet-600 px-5 py-3 rounded-xl mt-5 flex-row items-center active:opacity-80"
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

                <View className="w-20 h-20 rounded-full bg-violet-50 items-center justify-center">

                    <Gift size={36} color="#7C3AED" />

                </View>


                <Text className="text-gray-800 font-bold text-base mt-4">

                    No rewards available

                </Text>


                <Text className="text-gray-400 text-xs mt-2 text-center">

                    You {"don't"} have any active rewards right now.

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

                        My rewards

                    </Text>

                    <Text className="text-xs text-gray-400 mt-0.5">

                        Your exclusive rewards and benefits

                    </Text>

                </View>


                <View className="bg-violet-50 px-3 py-2 rounded-full">

                    <Text className="text-violet-700 text-xs font-bold">

                        {items.length} {items.length === 1 ? "reward" : "rewards"}

                    </Text>

                </View>

            </View>


            {/* Reward List */}

            <FlatList

                data={items}

                keyExtractor={(item) => item.id.toString()}

                renderItem={({ item }) => (

                    <RewardCard reward={item} />

                )}

                showsVerticalScrollIndicator={false}

                contentContainerStyle={{
                    paddingBottom: 25
                }}

                refreshing={loading}

                onRefresh={() => dispatch(fetchRewards())}

            />


        </View>

    );

};


export default Reward;