import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, RotateCcw } from "lucide-react-native";

export default function RefundPolicyScreen() {
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
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <View className="flex-row items-center gap-2">
                    <RotateCcw size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Refund & Return Policy</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-xs text-gray-400 mb-2">Last updated: July 2026</Text>

                <Paragraph>
                    Hum chahte hain ki tumhara shopping experience smooth rahe. Agar order me koi problem
                    hai, to neeche di gayi policy ke hisaab se return ya refund le sakte ho.
                </Paragraph>

                <SectionTitle text="1. Return Eligibility" />
                <BulletPoint>Zyadatar products delivery ke 7 din ke andar return kiye ja sakte hain</BulletPoint>
                <BulletPoint>Product original packaging, tags aur bina use kiya hua hona chahiye</BulletPoint>
                <BulletPoint>Kuch categories (jaise innerwear, perishable items) return eligible nahi hain</BulletPoint>
                <BulletPoint>Har product page pe uski specific return window mention hoti hai</BulletPoint>

                <SectionTitle text="2. Damaged Ya Wrong Item" />
                <BulletPoint>Delivery ke 48 hours ke andar report karo, unboxing video helpful hota hai</BulletPoint>
                <BulletPoint>Aise cases me pickup aur replacement/refund dono free hote hain</BulletPoint>
                <BulletPoint>Order Details screen se "Report Issue" option use kar sakte ho</BulletPoint>

                <SectionTitle text="3. Refund Process" />
                <BulletPoint>Return pickup confirm hone ke baad refund process start hota hai</BulletPoint>
                <BulletPoint>Original payment method me 5–7 business days me refund aa jata hai</BulletPoint>
                <BulletPoint>COD orders ke liye refund bank account ya UPI me kiya jata hai</BulletPoint>
                <BulletPoint>Refund status Order Details ke status timeline me track kar sakte ho</BulletPoint>

                <SectionTitle text="4. Cancellation" />
                <BulletPoint>Order ship hone se pehle free cancellation available hai</BulletPoint>
                <BulletPoint>Shipped order cancel karna ho to delivery ke baad return karna padega</BulletPoint>
                <BulletPoint>Partial cancellation multi-item orders me possible hai</BulletPoint>

                <SectionTitle text="5. Non-Returnable Items" />
                <BulletPoint>Personal care aur hygiene products</BulletPoint>
                <BulletPoint>Perishable ya customized items</BulletPoint>
                <BulletPoint>Digital products aur gift cards</BulletPoint>

                <SectionTitle text="6. Exchange" />
                <Paragraph>
                    Size ya variant exchange kuch categories (jaise clothing) me available hai. Exchange
                    request Order Details screen se raise kar sakte ho, subject to stock availability.
                </Paragraph>

                <SectionTitle text="7. Contact" />
                <Paragraph>
                    Return ya refund se related kisi bhi query ke liye support@sohncart.com pe contact
                    karo ya app ke Help Center section use karo.
                </Paragraph>
            </ScrollView>
        </View>
    );
}