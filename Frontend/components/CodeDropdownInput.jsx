import React, { useEffect, useMemo, useRef, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";


// =====================================
// Themes (coupon = green, reward = violet)
// =====================================

const THEMES = {

    coupon: {
        icon: "ticket-outline",
        iconColor: "#059669",
        iconBg: "bg-emerald-100",
        accentText: "text-emerald-700",
        listTitle: "Available coupons",
        emptyText: "No matching coupons found",
    },

    reward: {
        icon: "gift-outline",
        iconColor: "#7C3AED",
        iconBg: "bg-violet-100",
        accentText: "text-violet-700",
        listTitle: "Your rewards",
        emptyText: "No matching rewards found",
    },

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
// Helper: Discount Text
// =====================================

const getDiscountText = (item) => {

    const value = Number(item.value || 0);

    switch (item.type) {

        case "FLAT":
            return `${formatPrice(value)} OFF`;

        case "PERCENTAGE":
            return `${value}% OFF`;

        case "UPTO":
            return `UP TO ${formatPrice(item.maxDiscountAmount || value)} OFF`;

        default:
            return `${value} OFF`;

    }

};


// =====================================
// Helper: Is Expired
// =====================================

const isExpired = (item) => {

    if (!item.expiryDate) return false;

    const end = new Date(item.expiryDate);

    if (Number.isNaN(end.getTime())) return false;

    return end.getTime() <= Date.now();

};


// =====================================
// Helper: Status Line (usage / expiry) + usable flag
// =====================================

const getStatus = (item) => {

    if (isExpired(item)) {
        return { text: "Expired", usable: false };
    }

    const usage = item.usage;

    if (usage) {

        if (usage.canUse === false) {
            return { text: "Limit reached", usable: false };
        }

        const totalAllowed = usage.totalAllowed;

        const unlimited = totalAllowed === null || totalAllowed === undefined;

        return {
            text: unlimited
                ? "Unlimited uses"
                : `${usage.remainingUses} of ${totalAllowed} uses left`,
            usable: true,
        };

    }

    if (item.expiryDate) {
        return {
            text: `Valid till ${formatDate(item.expiryDate)}`,
            usable: true,
        };
    }

    return { text: "", usable: true };

};


// =====================================
// Dropdown Option
// =====================================

const CodeOption = ({ item, theme, onSelect, onPressIn }) => {

    const status = getStatus(item);

    return (

        <TouchableOpacity
            activeOpacity={0.7}
            disabled={!status.usable}
            onPressIn={onPressIn}
            onPress={() => onSelect(item)}
            className={`flex-row items-center px-3 py-3 border-b border-gray-100 ${status.usable ? "" : "opacity-50"}`}
        >

            <View className={`w-10 h-10 rounded-full items-center justify-center ${theme.iconBg}`}>

                <Ionicons name={theme.icon} size={19} color={theme.iconColor} />

            </View>


            <View className="flex-1 ml-3">

                <View className="flex-row items-center justify-between">

                    <Text
                        className="text-gray-900 text-sm font-extrabold tracking-wider flex-1"
                        numberOfLines={1}
                    >

                        {item.code}

                    </Text>

                    <Text className={`text-xs font-bold ml-2 ${theme.accentText}`}>

                        {getDiscountText(item)}

                    </Text>

                </View>


                {!!item.description && (

                    <Text
                        className="text-gray-500 text-xs mt-0.5"
                        numberOfLines={1}
                    >

                        {item.description}

                    </Text>

                )}


                {!!status.text && (

                    <Text className={`text-[11px] mt-1 font-semibold ${status.usable ? "text-green-700" : "text-red-600"}`}>

                        {status.text}

                    </Text>

                )}

            </View>

        </TouchableOpacity>

    );

};


// =====================================
// Code Dropdown Input
//
// Props:
//   variant     -> "coupon" | "reward"
//   value       -> current code string
//   onChange    -> setter, gets the cleaned code string
//   items       -> coupons / rewards array from redux
//   onSelect    -> (optional) called with the picked item
//   placeholder -> (optional)
// =====================================

const CodeDropdownInput = ({
    variant = "coupon",
    value,
    onChange,
    items = [],
    onSelect,
    placeholder,
}) => {

    const theme = THEMES[variant] || THEMES.coupon;

    const inputRef = useRef(null);

    const closeTimerRef = useRef(null);

    const [open, setOpen] = useState(false);


    useEffect(() => {

        return () => {

            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

        };

    }, []);


    const list = Array.isArray(items) ? items : [];

    const hasAnyItems = list.length > 0;


    // Filter by what user typed (show all when empty or when a code is already picked)

    const visibleItems = useMemo(() => {

        const query = String(value || "").trim().toUpperCase();

        if (!query) return list;

        const exactMatch = list.some(
            (item) => String(item.code).toUpperCase() === query
        );

        if (exactMatch) return list;

        return list.filter((item) =>
            String(item.code).toUpperCase().includes(query)
        );

    }, [list, value]);


    // Open on focus / tap

    const openDropdown = () => {

        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

        setOpen(true);

    };


    // Close on blur (small delay so a tap on an option can still register)

    const handleBlur = () => {

        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

        closeTimerRef.current = setTimeout(() => setOpen(false), 200);

    };


    // User touched an option -> cancel pending close

    const cancelClose = () => {

        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    };


    const handleSelect = (item) => {

        onChange(String(item.code).toUpperCase().replace(/\s/g, ""));

        if (onSelect) onSelect(item);

        setOpen(false);

        inputRef.current?.blur();

        Keyboard.dismiss();

    };


    return (

        <View>

            {/* Input */}

            <View className="relative">

                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={(text) =>
                        onChange(text.toUpperCase().replace(/\s/g, ""))
                    }
                    onFocus={openDropdown}
                    onPressIn={openDropdown}
                    onBlur={handleBlur}
                    placeholder={placeholder || `Enter ${variant} code`}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 pr-10"
                />

                {value.length > 0 && (

                    <TouchableOpacity
                        onPress={() => onChange("")}
                        className="absolute right-3 top-3.5"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >

                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />

                    </TouchableOpacity>

                )}

            </View>


            {/* Dropdown (inline, not absolute, so taps always work on Android) */}

            {open && hasAnyItems && (

                <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">

                    <View className="flex-row items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">

                        <Text className="text-gray-500 text-xs font-bold">

                            {theme.listTitle}

                        </Text>

                        <Text className="text-gray-400 text-xs">

                            {visibleItems.length}

                        </Text>

                    </View>


                    {visibleItems.length > 0 ? (

                        <ScrollView
                            style={{ maxHeight: 220 }}
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >

                            {visibleItems.map((item) => (

                                <CodeOption
                                    key={item.id ?? item.code}
                                    item={item}
                                    theme={theme}
                                    onSelect={handleSelect}
                                    onPressIn={cancelClose}
                                />

                            ))}

                        </ScrollView>

                    ) : (

                        <View className="px-3 py-5 items-center">

                            <Text className="text-gray-400 text-xs">

                                {theme.emptyText}

                            </Text>

                        </View>

                    )}

                </View>

            )}

        </View>

    );

};


export default CodeDropdownInput;