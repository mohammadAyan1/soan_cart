import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Linking,
} from "react-native";
import { router } from "expo-router";
import {
    ChevronLeft,
    Search,
    ChevronDown,
    Package,
    CreditCard,
    RotateCcw,
    UserCog,
    Truck,
    ShieldCheck,
    MessageCircle,
    Phone,
    Mail,
    HelpCircle,
} from "lucide-react-native";

// ==========================================================
// FAQ DATA - category wise
// ==========================================================
const FAQ_CATEGORIES = [
    {
        key: "orders",
        label: "Orders",
        icon: Package,
        color: "#ea580c",
        bg: "#FFF7ED",
        faqs: [
            {
                q: "Mai apna order kaise track karu?",
                a: "Profile > My Orders me jao, apna order select karo. Waha tumhe per-item delivery status aur timeline dikhega.",
            },
            {
                q: "Order cancel kaise karu?",
                a: "Order ship hone se pehle tak, Order Details screen se free cancellation available hai. Shipped hone ke baad cancel nahi ho sakta, delivery ke baad return karna padega.",
            },
            {
                q: "Mera order kitne din me deliver hoga?",
                a: "Delivery time product aur location ke hisaab se alag hoti hai, generally 3-7 business days lagte hain. Exact estimate order confirmation ke time dikhta hai.",
            },
        ],
    },
    {
        key: "payments",
        label: "Payments",
        icon: CreditCard,
        color: "#2563eb",
        bg: "#EFF6FF",
        faqs: [
            {
                q: "Konse payment methods accept hote hain?",
                a: "UPI, Credit/Debit cards, Net banking, aur Cash on Delivery (COD) — sab available hain.",
            },
            {
                q: "Payment fail ho gaya lekin paise kat gaye, kya karu?",
                a: "Chinta mat karo, fail hui transactions ka paisa 5-7 business days me automatically refund ho jata hai. Agar nahi hota to support team se contact karo.",
            },
            {
                q: "Kya payment details safe hain?",
                a: "Haan, hum tumhare card/bank details store nahi karte. Sab transactions secure payment gateway ke through process hoti hain.",
            },
        ],
    },
    {
        key: "returns",
        label: "Returns & Refunds",
        icon: RotateCcw,
        color: "#16a34a",
        bg: "#F0FDF4",
        faqs: [
            {
                q: "Return kaise request karu?",
                a: "Order Details screen se 'Return Item' option use karo. Zyadatar products delivery ke 7 din ke andar return kiye ja sakte hain.",
            },
            {
                q: "Refund kab tak milega?",
                a: "Return pickup confirm hone ke baad, 5-7 business days me original payment method me refund aa jata hai.",
            },
            {
                q: "Damaged ya wrong item mila to kya karu?",
                a: "Delivery ke 48 hours ke andar 'Report Issue' option use karke report karo. Aise cases me free pickup aur replacement/refund milta hai.",
            },
        ],
    },
    {
        key: "account",
        label: "Account",
        icon: UserCog,
        color: "#a855f7",
        bg: "#FDF4FF",
        faqs: [
            {
                q: "Password bhool gaya, kaise reset karu?",
                a: "Login screen pe 'Forgot Password' pe click karo, apna email daalo, OTP verify karke naya password set kar sakte ho.",
            },
            {
                q: "Profile details kaise update karu?",
                a: "Profile screen pe jao, upar right corner me edit icon pe tap karo, apni details update karke save karo.",
            },
            {
                q: "Account delete kaise karu?",
                a: "Profile > Privacy Center > Delete My Account se apna account permanently delete kar sakte ho.",
            },
        ],
    },
    {
        key: "shipping",
        label: "Shipping",
        icon: Truck,
        color: "#0891b2",
        bg: "#ECFEFF",
        faqs: [
            {
                q: "Delivery address kaise change karu?",
                a: "Order place karne se pehle, checkout screen pe saved address me se select karo ya naya address add karo. Order place hone ke baad address change nahi ho sakta.",
            },
            {
                q: "Kya Cash on Delivery available hai?",
                a: "Haan, zyadatar locations me COD available hai. Checkout ke time ye option dikhega agar tumhare area me eligible hai.",
            },
        ],
    },
];

export default function HelpCenterScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("orders");
    const [expandedFaq, setExpandedFaq] = useState(null);

    const currentCategory = FAQ_CATEGORIES.find((c) => c.key === activeCategory);

    const filteredFaqs = currentCategory.faqs.filter((faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    // ==========================================================
    // REUSABLE PIECES
    // ==========================================================
    const CategoryChip = ({ category }) => {
        const isActive = activeCategory === category.key;
        const Icon = category.icon;
        return (
            <TouchableOpacity
                onPress={() => {
                    setActiveCategory(category.key);
                    setExpandedFaq(null);
                }}
                activeOpacity={0.7}
                className="items-center mr-3"
            >
                <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-1.5"
                    style={{
                        backgroundColor: isActive ? category.color : category.bg,
                        borderWidth: isActive ? 0 : 1,
                        borderColor: "#F3F4F6",
                    }}
                >
                    <Icon size={22} color={isActive ? "#fff" : category.color} strokeWidth={2} />
                </View>
                <Text
                    className={`text-[11.5px] ${isActive ? "font-bold text-gray-900" : "text-gray-500"}`}
                >
                    {category.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const FaqItem = ({ faq, index }) => {
        const isExpanded = expandedFaq === index;
        return (
            <TouchableOpacity
                onPress={() => toggleFaq(index)}
                activeOpacity={0.7}
                className="border-b border-gray-100 py-3.5 px-4"
            >
                <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-medium text-gray-800 flex-1 pr-3">
                        {faq.q}
                    </Text>
                    <ChevronDown
                        size={18}
                        color="#9CA3AF"
                        style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
                    />
                </View>
                {isExpanded && (
                    <Text className="text-[13px] text-gray-500 leading-[20px] mt-2.5 pr-3">
                        {faq.a}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <View className="flex-row items-center gap-2">
                    <HelpCircle size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Help Center</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Search bar */}
                <View className="px-4 pt-4">
                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3.5 py-3">
                        <Search size={18} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Apna sawaal search karo"
                            className="flex-1 ml-2.5 text-[14px] text-gray-900"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Categories */}
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-5 pb-2">
                    Category Chuno
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                    {FAQ_CATEGORIES.map((category) => (
                        <CategoryChip key={category.key} category={category} />
                    ))}
                </ScrollView>

                {/* FAQs */}
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-5 pb-2">
                    {currentCategory.label} — Common Questions
                </Text>
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <FaqItem key={index} faq={faq} index={index} />
                        ))
                    ) : (
                        <View className="py-8 items-center">
                            <Text className="text-[13px] text-gray-400">
                                Is category me koi matching sawaal nahi mila
                            </Text>
                        </View>
                    )}
                </View>

                {/* Still need help - contact card */}
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-5 pb-2">
                    Ab Bhi Help Chahiye?
                </Text>
                <View className="mx-4">
                    <View
                        className="bg-white rounded-xl p-4 mb-3"
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 2,
                        }}
                    >
                        <View className="flex-row items-center gap-2 mb-1">
                            <MessageCircle size={16} color="#16a34a" />
                            <Text className="text-[14.5px] font-bold text-gray-900">
                                Hamari team se baat karo
                            </Text>
                        </View>
                        <Text className="text-[12.5px] text-gray-500 leading-[18px] mb-3">
                            Agar tumhe apna jawab nahi mila, hamari support team turant help karegi.
                        </Text>

                        <TouchableOpacity
                            onPress={() =>
                                Linking.openURL("mailto:support@sohncart.com?subject=Help%20Center%20Query")
                            }
                            activeOpacity={0.7}
                            className="flex-row items-center gap-3 py-2.5 border-t border-gray-100"
                        >
                            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
                                <Mail size={16} color="#2563eb" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[13.5px] font-medium text-gray-800">Email Support</Text>
                                <Text className="text-[12px] text-gray-500">support@sohncart.com</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Linking.openURL("tel:+919876543210")}
                            activeOpacity={0.7}
                            className="flex-row items-center gap-3 py-2.5 border-t border-gray-100"
                        >
                            <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center">
                                <Phone size={16} color="#16a34a" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[13.5px] font-medium text-gray-800">Call Support</Text>
                                <Text className="text-[12px] text-gray-500">+91 98765 43210 (10 AM - 7 PM)</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/profile/privacy-center")}
                        activeOpacity={0.7}
                        className="bg-white rounded-xl p-4 flex-row items-center gap-3"
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 2,
                        }}
                    >
                        <View className="w-9 h-9 rounded-full bg-purple-50 items-center justify-center">
                            <ShieldCheck size={16} color="#a855f7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[13.5px] font-medium text-gray-800">
                                Privacy & Data Questions
                            </Text>
                            <Text className="text-[12px] text-gray-500">Privacy Center pe jao</Text>
                        </View>
                        <ChevronDown
                            size={16}
                            color="#9CA3AF"
                            style={{ transform: [{ rotate: "-90deg" }] }}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}