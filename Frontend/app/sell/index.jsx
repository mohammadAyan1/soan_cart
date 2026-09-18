// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useState } from "react";
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     TextInput,
//     // Image,
//     Alert,
//     ActivityIndicator,
// } from "react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { router, useLocalSearchParams } from "expo-router";
// import * as ImagePicker from "expo-image-picker";
// import { ChevronLeft, Store, Camera, Eye, EyeOff } from "lucide-react-native";
// import api from "../../api/api.js"; // 👈 apna actual axios instance path daal dena
// import { useDispatch, useSelector } from "react-redux";
// import { vendorRegister } from "../../redux/slices/authSlice.js";
// import { Image } from "expo-image";
// export default function VendorRegisterScreen() {
//     const insets = useSafeAreaInsets();

//     const [fullName, setFullName] = useState("");
//     const [phone, setPhone] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [image, setImage] = useState(null);
//     // const [loading, setLoading] = useState(false);


//     // component ke andar:
//     const dispatch = useDispatch();
//     const loading = useSelector((state) => state.auth.vendorRegisterLoading);


//     ///////////////////////////////////
//     const { type } = useLocalSearchParams();
//     ///////////////////////////////////


//     // ==========================================================
//     // IMAGE PICKER (shop/profile image - optional)
//     // ==========================================================
//     const pickImage = async () => {
//         const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//         if (!permission.granted) {
//             Alert.alert("Permission Required", "Photo access allow karo image select karne ke liye");
//             return;
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: true,
//             aspect: [1, 1],
//             quality: 0.7,
//         });

//         if (!result.canceled) {
//             setImage(result.assets[0]);
//         }
//     };

//     // ==========================================================
//     // VALIDATION (backend ke exact same rules)
//     // ==========================================================
//     const validate = () => {
//         if (!fullName || !phone || !email || !password || !confirmPassword) {
//             Alert.alert("Error", "Sabhi fields bharna zaroori hai");
//             return false;
//         }

//         const nameRegex = /^[A-Za-z ]{2,50}$/;
//         if (!nameRegex.test(fullName)) {
//             Alert.alert("Error", "Please enter a valid full name");
//             return false;
//         }

//         const isValidPhone = /^\d{10}$/.test(phone);
//         if (!isValidPhone) {
//             Alert.alert("Error", "Phone number must contain exactly 10 digits");
//             return false;
//         }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             Alert.alert("Error", "Please enter a valid email address");
//             return false;
//         }

//         if (password.length < 8) {
//             Alert.alert("Error", "Password must be at least 8 characters");
//             return false;
//         }

//         const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;
//         if (!passwordRegex.test(password)) {
//             Alert.alert(
//                 "Error",
//                 "Password must contain at least one capital letter, one digit and one special character"
//             );
//             return false;
//         }

//         if (password !== confirmPassword) {
//             Alert.alert("Error", "Passwords match nahi kar rahe");
//             return false;
//         }

//         return true;
//     };

//     // ==========================================================
//     // SUBMIT
//     // ==========================================================
//     const handleRegister = async () => {
//         if (!validate()) return;

//         const formData = new FormData();
//         formData.append("fullName", fullName);
//         formData.append("phone", phone);
//         formData.append("email", email);
//         formData.append("password", password);
//         formData.append("type", type);
//         if (image) {
//             formData.append("image", {
//                 uri: image.uri,
//                 name: "vendor-profile.jpg",
//                 type: "image/jpeg",
//             });
//         }

//         try {

//             const result = await dispatch(vendorRegister(formData)).unwrap();

//             Alert.alert("Success", result?.data?.message || "OTP bheja gaya hai apne email pe");
//             router.push({
//                 pathname: "/sell/verify-otp",
//                 params: { email },
//             });
//         } catch (err) {
//             Alert.alert(
//                 "Error",
//                 err?.response?.data?.message || "Kuch galat ho gaya, dobara try karo"
//             );
//         } finally {
//             // setLoading(false);
//         }
//     };

//     return (
//         <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
//             {/* Header */}
//             <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
//                 <View className="flex-row items-center gap-2">
//                     <Store size={20} color="#16a34a" />
//                     <Text className="text-lg font-bold text-gray-900">{type === "user" ? "Register" : "Sell on Our Store"}</Text>
//                 </View>
//             </View>

//             <KeyboardAwareScrollView
//                 className="flex-1"
//                 contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//                 enableOnAndroid={true}
//                 enableAutomaticScroll={true}
//                 extraScrollHeight={20}
//                 keyboardOpeningTime={0}
//             >
//                 <Text className="text-[15px] font-bold text-gray-900 mb-1">
//                     Vendor Account Banao
//                 </Text>
//                 <Text className="text-[13px] text-gray-500 leading-[19px] mb-6">
//                     Apne products list karna shuru karo. Neeche apni details bharo, register karne
//                     ke baad email pe OTP milega verify karne ke liye.
//                 </Text>

//                 {/* Image picker */}
//                 <View className="items-center mb-6">
//                     <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
//                         <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
//                             {image ? (

//                                 <Image source={image.uri} contentFit="cover"
//                                     cachePolicy="memory-disk" className="w-24 h-24" />

//                             ) : (
//                                 <Store size={28} color="#9CA3AF" />
//                             )}
//                         </View>
//                         <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 items-center justify-center border-2 border-white">
//                             <Camera size={14} color="#fff" />
//                         </View>
//                     </TouchableOpacity>
//                     <Text className="text-xs text-gray-400 mt-2">Shop/Profile photo (optional)</Text>
//                 </View>

//                 {/* Full Name */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Full Name</Text>
//                 <TextInput
//                     value={fullName}
//                     onChangeText={setFullName}
//                     placeholder="Apna naam likho"
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Phone */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Phone Number</Text>
//                 <TextInput
//                     value={phone}
//                     onChangeText={setPhone}
//                     placeholder="10 digit number"
//                     keyboardType="number-pad"
//                     maxLength={10}
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Email */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
//                 <TextInput
//                     value={email}
//                     onChangeText={setEmail}
//                     placeholder="you@example.com"
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Password */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Password</Text>
//                 <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-1 bg-white">
//                     <TextInput
//                         value={password}
//                         onChangeText={setPassword}
//                         placeholder="Strong password banao"
//                         secureTextEntry={!showPassword}
//                         autoCapitalize="none"
//                         className="flex-1 py-3 text-[15px] text-gray-900"
//                     />
//                     <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
//                         {showPassword ? (
//                             <EyeOff size={18} color="#9CA3AF" />
//                         ) : (
//                             <Eye size={18} color="#9CA3AF" />
//                         )}
//                     </TouchableOpacity>
//                 </View>
//                 <Text className="text-[11px] text-gray-400 mb-4 leading-[16px]">
//                     Kam se kam 8 characters, ek capital letter, ek digit aur ek special character
//                 </Text>

//                 {/* Confirm Password */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</Text>
//                 <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-6 bg-white">
//                     <TextInput
//                         value={confirmPassword}
//                         onChangeText={setConfirmPassword}
//                         placeholder="Password dobara likho"
//                         secureTextEntry={!showConfirmPassword}
//                         autoCapitalize="none"
//                         className="flex-1 py-3 text-[15px] text-gray-900"
//                     />
//                     <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)}>
//                         {showConfirmPassword ? (
//                             <EyeOff size={18} color="#9CA3AF" />
//                         ) : (
//                             <Eye size={18} color="#9CA3AF" />
//                         )}
//                     </TouchableOpacity>
//                 </View>

//                 <TouchableOpacity
//                     onPress={handleRegister}
//                     disabled={loading}
//                     className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
//                     activeOpacity={0.8}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-semibold text-[15px]">Register as Vendor</Text>
//                     )}
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => router.back()} className="items-center mt-4">
//                     <Text className="text-[13px] text-gray-500">
//                         Vendor nahi banna? <Text className="text-green-600 font-semibold">Wapas jao</Text>
//                     </Text>
//                 </TouchableOpacity>
//             </KeyboardAwareScrollView>
//         </View>
//     );
// }



import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Store, Camera, Eye, EyeOff } from "lucide-react-native";
import api from "../../api/api.js"; // 👈 apna actual axios instance path daal dena
import { useDispatch, useSelector } from "react-redux";
import { vendorRegister } from "../../redux/slices/authSlice.js";
import { Image } from "expo-image";

export default function VendorRegisterScreen() {
    const insets = useSafeAreaInsets();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [image, setImage] = useState(null);

    // component ke andar:
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth.vendorRegisterLoading);

    ///////////////////////////////////
    const { type } = useLocalSearchParams();
    ///////////////////////////////////

    // ==========================================================
    // IMAGE PICKER (shop/profile image - optional)
    // ==========================================================
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Photo access allow karo image select karne ke liye");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // ==========================================================
    // VALIDATION (backend ke exact same rules)
    // ==========================================================
    const validate = () => {
        if (!fullName || !phone || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Sabhi fields bharna zaroori hai");
            return false;
        }

        const nameRegex = /^[A-Za-z ]{2,50}$/;
        if (!nameRegex.test(fullName)) {
            Alert.alert("Error", "Please enter a valid full name");
            return false;
        }

        const isValidPhone = /^\d{10}$/.test(phone);
        if (!isValidPhone) {
            Alert.alert("Error", "Phone number must contain exactly 10 digits");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return false;
        }

        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return false;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;
        if (!passwordRegex.test(password)) {
            Alert.alert(
                "Error",
                "Password must contain at least one capital letter, one digit and one special character"
            );
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords match nahi kar rahe");
            return false;
        }

        return true;
    };

    // ==========================================================
    // SUBMIT
    // ==========================================================
    const handleRegister = async () => {
        if (!validate()) return;

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("phone", phone);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("type", type);
        if (image) {
            formData.append("image", {
                uri: image.uri,
                name: "vendor-profile.jpg",
                type: "image/jpeg",
            });
        }

        try {
            const result = await dispatch(vendorRegister(formData)).unwrap();

            Alert.alert("Success", result?.data?.message || "OTP bheja gaya hai apne email pe");
            router.push({
                pathname: "/sell/verify-otp",
                params: { email },
            });
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Kuch galat ho gaya, dobara try karo"
            );
        } finally {
        }
    };

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
                        <Store size={20} color="#16a34a" />
                        <Text className="text-lg font-bold text-gray-900">
                            {type === "user" ? "Register" : "Sell on Our Store"}
                        </Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardOpeningTime={0}
            >
                <Text className="text-[15px] font-bold text-gray-900 mb-1">
                    Vendor Account Banao
                </Text>
                <Text className="text-[13px] text-gray-500 leading-[19px] mb-6">
                    Apne products list karna shuru karo. Neeche apni details bharo, register karne
                    ke baad email pe OTP milega verify karne ke liye.
                </Text>

                {/* Image picker */}
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                        <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                            {image ? (
                                <Image
                                    source={image.uri}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    className="w-24 h-24"
                                />
                            ) : (
                                <Store size={28} color="#9CA3AF" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 items-center justify-center border-2 border-white">
                            <Camera size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-xs text-gray-400 mt-2">Shop/Profile photo (optional)</Text>
                </View>

                {/* Full Name */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Full Name</Text>
                <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Apna naam likho"
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Phone */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Phone Number</Text>
                <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10 digit number"
                    keyboardType="number-pad"
                    maxLength={10}
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Email */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Password */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Password</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-1 bg-white">
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Strong password banao"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="flex-1 py-3 text-[15px] text-gray-900"
                    />
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {showPassword ? (
                            <EyeOff size={18} color="#9CA3AF" />
                        ) : (
                            <Eye size={18} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                </View>
                <Text className="text-[11px] text-gray-400 mb-4 leading-[16px]">
                    Kam se kam 8 characters, ek capital letter, ek digit aur ek special character
                </Text>

                {/* Confirm Password */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-6 bg-white">
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Password dobara likho"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        className="flex-1 py-3 text-[15px] text-gray-900"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {showConfirmPassword ? (
                            <EyeOff size={18} color="#9CA3AF" />
                        ) : (
                            <Eye size={18} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-[15px]">Register as Vendor</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} className="items-center mt-4" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text className="text-[13px] text-gray-500">
                        Vendor nahi banna? <Text className="text-green-600 font-semibold">Wapas jao</Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
}