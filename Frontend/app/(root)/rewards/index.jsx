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

import { fetchRewards } from "../../../redux/slices/rewardsSlice";

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
} from "lucide-react-native";


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
// Reward Card
// =====================================

const RewardCard = ({ reward }) => {

    const applicability = getApplicability(reward);

    const ApplicabilityIcon = applicability.icon;

    const usage = reward.usage || {};

    const used = Number(usage.usedByYou || 0);

    const totalAllowed = usage.totalAllowed;

    const remaining = usage.remainingUses;

    const canUse = usage.canUse !== false;

    const unlimited = totalAllowed === null;


    // Usage Progress

    const progress = unlimited
        ? 0
        : totalAllowed > 0
            ? Math.min((used / totalAllowed) * 100, 100)
            : 0;


    return (

        <View className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">

            {/* Discount Header */}

            <View className="bg-violet-50 p-4 flex-row items-center justify-between">

                <View className="flex-1">

                    <View className="flex-row items-center mb-2">

                        <Gift size={17} color="#7C3AED" />

                        <Text className="text-violet-700 text-xs font-bold ml-2">

                            EXCLUSIVE REWARD

                        </Text>

                    </View>


                    <Text className="text-2xl font-extrabold text-violet-700">

                        {getDiscountText(reward)}

                    </Text>


                    <Text className="text-gray-600 text-xs mt-1">

                        {reward.description || "Enjoy your exclusive reward"}

                    </Text>

                </View>


                <View className="w-14 h-14 rounded-full bg-white items-center justify-center">

                    <TicketPercent size={27} color="#7C3AED" />

                </View>

            </View>


            {/* Reward Body */}

            <View className="p-4">


                {/* Reward Code */}

                <View className="flex-row items-center justify-between">

                    <View className="flex-1">

                        <Text className="text-gray-400 text-[10px] font-bold uppercase">

                            Reward Code

                        </Text>

                        <Text className="text-gray-900 text-base font-extrabold tracking-wider mt-1">

                            {reward.code}

                        </Text>

                    </View>


                    <View className="bg-violet-50 border border-dashed border-violet-400 rounded-lg px-3 py-2">

                        <Text className="text-violet-700 text-xs font-extrabold">

                            {reward.type}

                        </Text>

                    </View>

                </View>


                {/* Divider */}

                <View className="border-t border-dashed border-gray-200 my-4" />


                {/* Applicability */}

                <View>

                    <Text className="text-gray-400 text-[10px] font-bold uppercase mb-3">

                        Reward Applicable On

                    </Text>


                    <View className="flex-row items-center">


                        {applicability.image ? (

                            <Image
                                source={{ uri: applicability.image }}
                                className="w-12 h-12 rounded-xl bg-gray-100"
                                resizeMode="cover"
                            />

                        ) : (

                            <View className="w-12 h-12 rounded-xl bg-violet-50 items-center justify-center">

                                <ApplicabilityIcon size={21} color="#7C3AED" />

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


                        <CheckCircle2 size={19} color="#7C3AED" />

                    </View>

                </View>


                {/* Usage Section */}

                <View className="bg-gray-50 rounded-xl p-3 mt-4">


                    <View className="flex-row items-center justify-between mb-3">

                        <View className="flex-row items-center">

                            <ShieldCheck size={16} color="#6B7280" />

                            <Text className="text-gray-700 text-xs font-bold ml-2">

                                Reward Usage

                            </Text>

                        </View>


                        <View className={`px-2.5 py-1 rounded-full flex-row items-center ${canUse ? "bg-green-100" : "bg-red-100"}`}>

                            {canUse ? (

                                <CircleCheck size={12} color="#15803D" />

                            ) : (

                                <Ban size={12} color="#DC2626" />

                            )}

                            <Text className={`text-[10px] font-bold ml-1 ${canUse ? "text-green-700" : "text-red-700"}`}>

                                {canUse ? "Available" : "Limit Reached"}

                            </Text>

                        </View>

                    </View>


                    <View className="flex-row justify-between">

                        <View>

                            <Text className="text-gray-400 text-[10px]">

                                Used

                            </Text>

                            <Text className="text-gray-900 text-sm font-extrabold mt-1">

                                {used}

                            </Text>

                        </View>


                        <View>

                            <Text className="text-gray-400 text-[10px]">

                                Total Allowed

                            </Text>

                            <Text className="text-gray-900 text-sm font-extrabold mt-1">

                                {unlimited ? "Unlimited" : totalAllowed}

                            </Text>

                        </View>


                        <View>

                            <Text className="text-gray-400 text-[10px]">

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
                                    className="h-full bg-violet-600 rounded-full"
                                    style={{
                                        width: `${progress}%`
                                    }}
                                />

                            </View>


                            <Text className="text-gray-400 text-[10px] mt-2">

                                {used} of {totalAllowed} reward uses consumed

                            </Text>

                        </View>

                    )}

                </View>


                {/* Maximum Discount */}

                {reward.maxDiscountAmount !== null &&
                    reward.maxDiscountAmount !== undefined && (

                        <View className="flex-row items-center mt-4">

                            <Tag size={15} color="#6B7280" />

                            <Text className="text-gray-500 text-xs ml-2">

                                Maximum Discount:

                            </Text>

                            <Text className="text-gray-800 text-xs font-bold ml-1">

                                {formatPrice(reward.maxDiscountAmount)}

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

                        {formatDate(reward.expiryDate)}

                    </Text>

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


    // Fetch Rewards

    useEffect(() => {

        dispatch(fetchRewards());

    }, [dispatch]);


    // Loading

    if (loading && items.length === 0) {

        return (

            <View className="flex-1 items-center justify-center py-16">

                <ActivityIndicator size="large" color="#7C3AED" />

                <Text className="text-gray-500 text-sm mt-3">

                    Fetching your rewards...

                </Text>

            </View>

        );

    }


    // Error

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
                    onPress={() => dispatch(fetchRewards())}
                    className="bg-violet-600 px-5 py-3 rounded-xl mt-4 flex-row items-center"
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

                <View className="w-20 h-20 rounded-full bg-violet-50 items-center justify-center">

                    <Gift size={36} color="#7C3AED" />

                </View>


                <Text className="text-gray-800 font-bold text-base mt-4">

                    No Rewards Available

                </Text>


                <Text className="text-gray-400 text-xs mt-2 text-center">

                    You don't have any active rewards right now.

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

                        My Rewards

                    </Text>

                    <Text className="text-xs text-gray-400 mt-1">

                        Your exclusive rewards and benefits

                    </Text>

                </View>


                <View className="bg-violet-50 px-3 py-2 rounded-full">

                    <Text className="text-violet-700 text-xs font-bold">

                        {items.length} Rewards

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