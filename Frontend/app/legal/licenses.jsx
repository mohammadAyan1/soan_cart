// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
// import { router } from "expo-router";
// import { ChevronLeft, Award, ExternalLink } from "lucide-react-native";

// export default function LicensesScreen() {
//     const insets = useSafeAreaInsets();

//     const libraries = [
//         { name: "React Native", license: "MIT", url: "https://github.com/facebook/react-native" },
//         { name: "Expo", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo Router", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Redux Toolkit", license: "MIT", url: "https://github.com/reduxjs/redux-toolkit" },
//         { name: "React Redux", license: "MIT", url: "https://github.com/reduxjs/react-redux" },
//         { name: "NativeWind", license: "MIT", url: "https://github.com/nativewind/nativewind" },
//         { name: "React Native Reanimated", license: "MIT", url: "https://github.com/software-mansion/react-native-reanimated" },
//         { name: "React Native Gesture Handler", license: "MIT", url: "https://github.com/software-mansion/react-native-gesture-handler" },
//         { name: "Lucide Icons", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
//         { name: "Expo Image Picker", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo File System", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo Media Library", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo Crypto", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo Location", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Expo Blur", license: "MIT", url: "https://github.com/expo/expo" },
//         { name: "Prisma", license: "Apache-2.0", url: "https://github.com/prisma/prisma" },
//         { name: "Express", license: "MIT", url: "https://github.com/expressjs/express" },
//         { name: "Cloudinary", license: "MIT", url: "https://github.com/cloudinary/cloudinary_npm" },
//     ];

//     const LibraryRow = ({ name, license, url }) => (
//         <TouchableOpacity
//             onPress={() => Linking.openURL(url)}
//             className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100"
//             activeOpacity={0.6}
//         >
//             <View className="flex-1 pr-3">
//                 <Text className="text-[14.5px] font-medium text-gray-800">{name}</Text>
//                 <Text className="text-[12px] text-gray-500 mt-0.5">{license} License</Text>
//             </View>
//             <ExternalLink size={16} color="#9CA3AF" />
//         </TouchableOpacity>
//     );

//     return (
//         <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
//             {/* Header */}
//             <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
//                 {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
//                     <ChevronLeft size={24} color="#111827" />
//                 </TouchableOpacity> */}
//                 <View className="flex-row items-center gap-2">
//                     <Award size={20} color="#16a34a" />
//                     <Text className="text-lg font-bold text-gray-900">Licenses & Attributions</Text>
//                 </View>
//             </View>

//             <ScrollView
//                 className="flex-1"
//                 contentContainerStyle={{ paddingBottom: 60 }}
//                 showsVerticalScrollIndicator={false}
//             >
//                 <Text className="text-[13px] text-gray-500 leading-[20px] px-4 pt-5 pb-2">
//                     Sohn Cart app inn open-source libraries aur tools ka use karke banaya gaya hai. Hum
//                     inke developers aur contributors ka dhanyawad karte hain.
//                 </Text>

//                 <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-1">
//                     Open Source Libraries
//                 </Text>
//                 <View className="bg-white mx-4 rounded-xl overflow-hidden mb-4">
//                     {libraries.map((lib) => (
//                         <LibraryRow key={lib.name} name={lib.name} license={lib.license} url={lib.url} />
//                     ))}
//                 </View>

//                 <Text className="text-[12px] text-gray-400 leading-[18px] px-4 mb-6">
//                     Har library apne respective license ke terms ke andar use ki gayi hai. Kisi library ka
//                     license text dekhne ke liye uspe tap karo.
//                 </Text>
//             </ScrollView>
//         </View>
//     );
// }




import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, Award, ExternalLink } from "lucide-react-native";

export default function LicensesScreen() {
    const insets = useSafeAreaInsets();

    const libraries = [
        { name: "React Native", license: "MIT", url: "https://github.com/facebook/react-native" },
        { name: "Expo", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo Router", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Redux Toolkit", license: "MIT", url: "https://github.com/reduxjs/redux-toolkit" },
        { name: "React Redux", license: "MIT", url: "https://github.com/reduxjs/react-redux" },
        { name: "NativeWind", license: "MIT", url: "https://github.com/nativewind/nativewind" },
        { name: "React Native Reanimated", license: "MIT", url: "https://github.com/software-mansion/react-native-reanimated" },
        { name: "React Native Gesture Handler", license: "MIT", url: "https://github.com/software-mansion/react-native-gesture-handler" },
        { name: "Lucide Icons", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
        { name: "Expo Image Picker", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo File System", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo Media Library", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo Crypto", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo Location", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Expo Blur", license: "MIT", url: "https://github.com/expo/expo" },
        { name: "Prisma", license: "Apache-2.0", url: "https://github.com/prisma/prisma" },
        { name: "Express", license: "MIT", url: "https://github.com/expressjs/express" },
        { name: "Cloudinary", license: "MIT", url: "https://github.com/cloudinary/cloudinary_npm" },
    ];

    const LibraryRow = ({ name, license, url }) => (
        <TouchableOpacity
            onPress={() => Linking.openURL(url)}
            className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100"
            activeOpacity={0.6}
        >
            <View className="flex-1 pr-3">
                <Text className="text-[14.5px] font-medium text-gray-800">{name}</Text>
                <Text className="text-[12px] text-gray-500 mt-0.5">{license} License</Text>
            </View>
            <ExternalLink size={16} color="#9CA3AF" />
        </TouchableOpacity>
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
                        <Award size={20} color="#16a34a" />
                        <Text className="text-lg font-bold text-gray-900">Licenses & Attributions</Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-[13px] text-gray-500 leading-[20px] px-4 pt-5 pb-2">
                    Sohn Cart app inn open-source libraries aur tools ka use karke banaya gaya hai. Hum
                    inke developers aur contributors ka dhanyawad karte hain.
                </Text>

                <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-1">
                    Open Source Libraries
                </Text>
                <View className="bg-white mx-4 rounded-xl overflow-hidden mb-4">
                    {libraries.map((lib) => (
                        <LibraryRow key={lib.name} name={lib.name} license={lib.license} url={lib.url} />
                    ))}
                </View>

                <Text className="text-[12px] text-gray-400 leading-[18px] px-4 mb-6">
                    Har library apne respective license ke terms ke andar use ki gayi hai. Kisi library ka
                    license text dekhne ke liye uspe tap karo.
                </Text>
            </ScrollView>
        </View>
    );
}