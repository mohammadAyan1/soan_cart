import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import {
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    FileText,
    Award,
    RotateCcw,
    MessageCircleQuestion,
} from "lucide-react-native";

export default function LegalHubScreen() {
    const insets = useSafeAreaInsets();

    const LegalItem = ({ icon: Icon, label, description, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-100"
            activeOpacity={0.6}
        >
            <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center">
                    <Icon size={17} color="#16a34a" strokeWidth={2} />
                </View>
                <View className="flex-1">
                    <Text className="text-[15px] font-medium text-gray-800">{label}</Text>
                    {description ? (
                        <Text className="text-[12.5px] text-gray-500 mt-0.5">{description}</Text>
                    ) : null}
                </View>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <Text className="text-lg font-bold text-gray-900">Terms, Policies & Licenses</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-5 pb-1">
                    Legal Documents
                </Text>
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    <LegalItem
                        icon={ShieldCheck}
                        label="Privacy Policy"
                        description="Tumhara data kaise use hota hai"
                        onPress={() => router.push("/legal/privacy-policy")}
                    />
                    <LegalItem
                        icon={FileText}
                        label="Terms of Service"
                        description="App use karne ki conditions"
                        onPress={() => router.push("/legal/terms-of-service")}
                    />
                    <LegalItem
                        icon={RotateCcw}
                        label="Refund & Return Policy"
                        description="Return, refund aur cancellation rules"
                        onPress={() => router.push("/legal/refund-policy")}
                    />
                    <LegalItem
                        icon={Award}
                        label="Licenses & Attributions"
                        description="Open-source libraries aur credits"
                        onPress={() => router.push("/legal/licenses")}
                    />
                </View>

                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-5 pb-1">
                    Support
                </Text>
                <View className="bg-white mx-4 rounded-xl overflow-hidden mb-4">
                    <LegalItem
                        icon={MessageCircleQuestion}
                        label="Contact Privacy Team"
                        description="support@sohncart.com"
                        onPress={() => router.push("/legal/contact-privacy")}
                    />
                </View>
            </ScrollView>
        </View>
    );
}