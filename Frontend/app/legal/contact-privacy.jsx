import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircleQuestion,
} from "lucide-react-native";

export default function ContactPrivacyScreen() {
    const insets = useSafeAreaInsets();

    const ContactCard = ({ icon: Icon, title, value, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-xl p-4 flex-row items-center gap-3 mb-3"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }}
        >
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center">
                <Icon size={18} color="#16a34a" strokeWidth={2} />
            </View>
            <View className="flex-1">
                <Text className="text-[13px] text-gray-500">{title}</Text>
                <Text className="text-[15px] font-semibold text-gray-900 mt-0.5">{value}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <View className="flex-row items-center gap-2">
                    <MessageCircleQuestion size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Contact Privacy Team</Text>
                </View>
            </View>

            <View className="px-4 pt-5">
                <Text className="text-[13.5px] text-gray-500 leading-[20px] mb-5">
                    Tumhare data, privacy, ya account se related koi bhi sawaal ho, hamari privacy team
                    tumhari help ke liye ready hai.
                </Text>

                <ContactCard
                    icon={Mail}
                    title="Email"
                    value="support@sohncart.com"
                    onPress={() =>
                        Linking.openURL("mailto:support@sohncart.com?subject=Privacy%20Query")
                    }
                />

                <ContactCard
                    icon={Phone}
                    title="Phone"
                    value="+91 98765 43210"
                    onPress={() => Linking.openURL("tel:+919876543210")}
                />

                <ContactCard
                    icon={Clock}
                    title="Support Hours"
                    value="Mon – Sat, 10 AM – 7 PM"
                />

                <ContactCard
                    icon={MapPin}
                    title="Registered Office"
                    value="Anuppur, Madhya Pradesh, India"
                />

                <Text className="text-[12px] text-gray-400 mt-2 leading-[18px] px-1">
                    Hum tumhari privacy-related requests ka response 48 hours ke andar dete hain.
                </Text>
            </View>
        </View>
    );
}