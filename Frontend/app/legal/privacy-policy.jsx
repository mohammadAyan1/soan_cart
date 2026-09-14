import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ShieldCheck } from "lucide-react-native";

export default function PrivacyPolicyScreen() {
    const insets = useSafeAreaInsets();

    const SectionTitle = ({ text }) => (
        <Text className="text-[15px] font-bold text-gray-900 mt-5 mb-2">{text}</Text>
    );

    const Paragraph = ({ children }) => (
        <Text className="text-[13.5px] text-gray-600 leading-[21px] mb-1">{children}</Text>
    );

    const BulletPoint = ({ children }) => (
        <View className="flex-row gap-2 mb-1.5 pl-1">
            <Text className="text-[13.5px] text-gray-600">•</Text>
            <Text className="text-[13.5px] text-gray-600 leading-[21px] flex-1">{children}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <View className="flex-row items-center gap-2">
                    <ShieldCheck size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Privacy Policy</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-xs text-gray-400 mb-2">Last updated: July 2026</Text>

                <Paragraph>
                    Sohn Cart ("hum", "hamara") tumhari privacy ko seriously leta hai. Ye policy batati hai
                    ki hum kaunsa data collect karte hain, kaise use karte hain, aur tumhare paas kya rights
                    hain.
                </Paragraph>

                <SectionTitle text="1. Hum Kya Data Collect Karte Hain" />
                <BulletPoint>Naam, email, phone number — jab tum account banate ho</BulletPoint>
                <BulletPoint>Delivery addresses aur GPS location — jab tum autofill use karte ho</BulletPoint>
                <BulletPoint>Profile aur review photos — jab tum upload karte ho</BulletPoint>
                <BulletPoint>Order history aur payment status (payment details khud store nahi hote)</BulletPoint>
                <BulletPoint>Device info aur login sessions — security ke liye</BulletPoint>

                <SectionTitle text="2. Data Kaise Use Hota Hai" />
                <BulletPoint>Order process karne aur deliver karne ke liye</BulletPoint>
                <BulletPoint>Account security aur fraud prevention ke liye</BulletPoint>
                <BulletPoint>App experience better banane ke liye (offers, recommendations)</BulletPoint>
                <BulletPoint>Customer support provide karne ke liye</BulletPoint>

                <SectionTitle text="3. Data Kisse Share Hota Hai" />
                <Paragraph>
                    Hum tumhara data kabhi bech nahi te. Sirf zaroori third-parties ke saath minimal data
                    share hota hai:
                </Paragraph>
                <BulletPoint>Payment gateways — transaction process karne ke liye</BulletPoint>
                <BulletPoint>Cloudinary — image storage ke liye</BulletPoint>
                <BulletPoint>Delivery partners — order shipping ke liye</BulletPoint>

                <SectionTitle text="4. Data Security" />
                <Paragraph>
                    Tumhara data encrypted servers pe store hota hai. Hum industry-standard security
                    practices follow karte hain taaki unauthorized access na ho.
                </Paragraph>

                <SectionTitle text="5. Tumhare Rights" />
                <BulletPoint>Apna data download karne ka right</BulletPoint>
                <BulletPoint>Apna account aur data delete karne ka right</BulletPoint>
                <BulletPoint>App permissions (location, camera) kabhi bhi off karne ka right</BulletPoint>
                <BulletPoint>Marketing notifications se opt-out karne ka right</BulletPoint>

                <SectionTitle text="6. Data Retention" />
                <Paragraph>
                    Account active rehne tak data store rehta hai. Account delete karne pe, data 30 din
                    ke andar permanently remove kar diya jata hai (legal requirements ke alawa).
                </Paragraph>

                <SectionTitle text="7. Contact" />
                <Paragraph>
                    Kisi bhi privacy-related query ke liye humein support@sohncart.com pe email karo.
                </Paragraph>
            </ScrollView>
        </View>
    );
}