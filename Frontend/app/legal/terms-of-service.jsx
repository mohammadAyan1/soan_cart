// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { ScrollView, View, Text, TouchableOpacity } from "react-native";
// import { router } from "expo-router";
// import { ChevronLeft, FileText } from "lucide-react-native";

// export default function TermsOfServiceScreen() {
//     const insets = useSafeAreaInsets();

//     const SectionTitle = ({ text }) => (
//         <Text className="text-[15px] font-bold text-gray-900 mt-5 mb-2">{text}</Text>
//     );

//     const Paragraph = ({ children }) => (
//         <Text className="text-[13.5px] text-gray-600 leading-[21px] mb-1">{children}</Text>
//     );

//     const BulletPoint = ({ children }) => (
//         <View className="flex-row gap-2 mb-1.5 pl-1">
//             <Text className="text-[13.5px] text-gray-600">•</Text>
//             <Text className="text-[13.5px] text-gray-600 leading-[21px] flex-1">{children}</Text>
//         </View>
//     );

//     return (
//         <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
//             {/* Header */}
//             <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
//                 {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
//                     <ChevronLeft size={24} color="#111827" />
//                 </TouchableOpacity> */}
//                 <View className="flex-row items-center gap-2">
//                     <FileText size={20} color="#16a34a" />
//                     <Text className="text-lg font-bold text-gray-900">Terms of Service</Text>
//                 </View>
//             </View>

//             <ScrollView
//                 className="flex-1 px-5"
//                 contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
//                 showsVerticalScrollIndicator={false}
//             >
//                 <Text className="text-xs text-gray-400 mb-2">Last updated: July 2026</Text>

//                 <Paragraph>
//                     Sohn Cart app use karke, tum in terms se agree karte ho. Please inhe dhyan se padho.
//                 </Paragraph>

//                 <SectionTitle text="1. Account Responsibility" />
//                 <BulletPoint>Tum apne account credentials ko safe rakhne ke liye zimmedar ho</BulletPoint>
//                 <BulletPoint>18 saal se kam umar walo ko parent/guardian supervision me use karna chahiye</BulletPoint>
//                 <BulletPoint>Ek se zyada fake accounts banana allowed nahi hai</BulletPoint>

//                 <SectionTitle text="2. Orders & Payments" />
//                 <BulletPoint>Order confirm hone ke baad price aur availability final hoti hai</BulletPoint>
//                 <BulletPoint>Payment failure ya fraud detect hone pe order cancel ho sakta hai</BulletPoint>
//                 <BulletPoint>Prices bina notice ke change ho sakti hain</BulletPoint>

//                 <SectionTitle text="3. Shipping & Returns" />
//                 <BulletPoint>Delivery timelines estimated hain, guaranteed nahi</BulletPoint>
//                 <BulletPoint>Return/refund policy product category ke hisaab se alag ho sakti hai</BulletPoint>
//                 <BulletPoint>Damaged ya wrong item milne pe 48 hours ke andar report karo</BulletPoint>

//                 <SectionTitle text="4. Reviews & Content" />
//                 <Paragraph>
//                     Jab tum review ya photo upload karte ho, tum humein use display karne ka right dete ho.
//                     Fake, abusive, ya misleading reviews remove kar diye jayenge.
//                 </Paragraph>

//                 <SectionTitle text="5. Prohibited Activities" />
//                 <BulletPoint>App ko reverse-engineer ya misuse karna</BulletPoint>
//                 <BulletPoint>Fraudulent orders ya payment karna</BulletPoint>
//                 <BulletPoint>Doosre users ko harass ya abuse karna</BulletPoint>

//                 <SectionTitle text="6. Account Suspension" />
//                 <Paragraph>
//                     Terms violate karne pe hum bina notice ke account suspend ya terminate kar sakte hain.
//                 </Paragraph>

//                 <SectionTitle text="7. Limitation of Liability" />
//                 <Paragraph>
//                     Sohn Cart indirect ya consequential damages ke liye liable nahi hoga. App "as-is" basis
//                     pe provide kiya jata hai.
//                 </Paragraph>

//                 <SectionTitle text="8. Changes to Terms" />
//                 <Paragraph>
//                     Hum in terms ko kabhi bhi update kar sakte hain. Major changes hone pe app notification
//                     se inform kiya jayega.
//                 </Paragraph>

//                 <SectionTitle text="9. Contact" />
//                 <Paragraph>
//                     Terms se related kisi bhi query ke liye support@sohncart.com pe contact karo.
//                 </Paragraph>
//             </ScrollView>
//         </View>
//     );
// }



import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, FileText } from "lucide-react-native";

export default function TermsOfServiceScreen() {
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
            <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2">
                        <FileText size={20} color="#16a34a" />
                        <Text className="text-lg font-bold text-gray-900">Terms of Service</Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 60, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-xs text-gray-400 mb-2">Last updated: July 2026</Text>

                <Paragraph>
                    Sohn Cart app use karke, tum in terms se agree karte ho. Please inhe dhyan se padho.
                </Paragraph>

                <SectionTitle text="1. Account Responsibility" />
                <BulletPoint>Tum apne account credentials ko safe rakhne ke liye zimmedar ho</BulletPoint>
                <BulletPoint>18 saal se kam umar walo ko parent/guardian supervision me use karna chahiye</BulletPoint>
                <BulletPoint>Ek se zyada fake accounts banana allowed nahi hai</BulletPoint>

                <SectionTitle text="2. Orders & Payments" />
                <BulletPoint>Order confirm hone ke baad price aur availability final hoti hai</BulletPoint>
                <BulletPoint>Payment failure ya fraud detect hone pe order cancel ho sakta hai</BulletPoint>
                <BulletPoint>Prices bina notice ke change ho sakti hain</BulletPoint>

                <SectionTitle text="3. Shipping & Returns" />
                <BulletPoint>Delivery timelines estimated hain, guaranteed nahi</BulletPoint>
                <BulletPoint>Return/refund policy product category ke hisaab se alag ho sakti hai</BulletPoint>
                <BulletPoint>Damaged ya wrong item milne pe 48 hours ke andar report karo</BulletPoint>

                <SectionTitle text="4. Reviews & Content" />
                <Paragraph>
                    Jab tum review ya photo upload karte ho, tum humein use display karne ka right dete ho.
                    Fake, abusive, ya misleading reviews remove kar diye jayenge.
                </Paragraph>

                <SectionTitle text="5. Prohibited Activities" />
                <BulletPoint>App ko reverse-engineer ya misuse karna</BulletPoint>
                <BulletPoint>Fraudulent orders ya payment karna</BulletPoint>
                <BulletPoint>Doosre users ko harass ya abuse karna</BulletPoint>

                <SectionTitle text="6. Account Suspension" />
                <Paragraph>
                    Terms violate karne pe hum bina notice ke account suspend ya terminate kar sakte hain.
                </Paragraph>

                <SectionTitle text="7. Limitation of Liability" />
                <Paragraph>
                    Sohn Cart indirect ya consequential damages ke liye liable nahi hoga. App "as-is" basis
                    pe provide kiya jata hai.
                </Paragraph>

                <SectionTitle text="8. Changes to Terms" />
                <Paragraph>
                    Hum in terms ko kabhi bhi update kar sakte hain. Major changes hone pe app notification
                    se inform kiya jayega.
                </Paragraph>

                <SectionTitle text="9. Contact" />
                <Paragraph>
                    Terms se related kisi bhi query ke liye support@sohncart.com pe contact karo.
                </Paragraph>
            </ScrollView>
        </View>
    );
}