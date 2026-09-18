// import { useState } from "react";
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     ActivityIndicator,
//     Alert,
// } from "react-native";
// import { router } from "expo-router";
// import { useDispatch, useSelector } from "react-redux";
// import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { loginUser } from "../redux/slices/authSlice.js"
// import { fetchCart } from "../redux/slices/cartSlice.js"

// export default function LoginScreen() {
//     const dispatch = useDispatch();
//     const loading = useSelector((state) => state.auth.loading);

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [errors, setErrors] = useState({});

//     const validate = () => {
//         const newErrors = {};
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!email) newErrors.email = "Email zaroori hai";
//         else if (!emailRegex.test(email)) newErrors.email = "Valid email daalo";

//         if (!password) newErrors.password = "Password zaroori hai";
//         else if (password.length < 8) newErrors.password = "Password kam se kam 8 character ka ho";

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleLogin = async () => {
//         if (!validate()) return;

//         try {
//             await dispatch(loginUser({ email, password })).unwrap();
//             dispatch(fetchCart());
//             router.replace("/(root)/(tabs)");
//         } catch (err) {
//             Alert.alert("Login Failed", err?.message || "Kuch galat ho gaya, dobara try karo");
//         }
//     };

//     return (
//         // 👇 KeyboardAvoidingView + ScrollView ki jagah ye - focused
//         // input tak automatically scroll kar deta hai
//         <KeyboardAwareScrollView
//             className="flex-1 bg-white"
//             contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//             enableOnAndroid={true}
//             enableAutomaticScroll={true}
//             extraScrollHeight={20}
//             keyboardOpeningTime={0}
//         >
//             <View className="flex-1 px-6 justify-center">
//                 <View className="mb-10">
//                     <Text className="text-3xl font-bold text-gray-900 mb-2">
//                         Welcome Back 👋
//                     </Text>
//                     <Text className="text-sm text-gray-500">
//                         Login karke apna shopping continue karo
//                     </Text>
//                 </View>

//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
//                 <View
//                     className={`flex-row items-center border rounded-xl px-4 mb-1 ${errors.email ? "border-red-400" : "border-gray-200"
//                         }`}
//                 >
//                     <Mail size={18} color="#9CA3AF" />
//                     <TextInput
//                         value={email}
//                         onChangeText={(text) => {
//                             setEmail(text);
//                             if (errors.email) setErrors((p) => ({ ...p, email: null }));
//                         }}
//                         placeholder="you@example.com"
//                         keyboardType="email-address"
//                         autoCapitalize="none"
//                         className="flex-1 px-3 py-3.5 text-[15px] text-gray-900"
//                     />
//                 </View>
//                 {errors.email ? (
//                     <Text className="text-red-500 text-xs mb-3">{errors.email}</Text>
//                 ) : (
//                     <View className="mb-3" />
//                 )}

//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">Password</Text>
//                 <View
//                     className={`flex-row items-center border rounded-xl px-4 mb-1 ${errors.password ? "border-red-400" : "border-gray-200"
//                         }`}
//                 >
//                     <Lock size={18} color="#9CA3AF" />
//                     <TextInput
//                         value={password}
//                         onChangeText={(text) => {
//                             setPassword(text);
//                             if (errors.password) setErrors((p) => ({ ...p, password: null }));
//                         }}
//                         placeholder="••••••••"
//                         secureTextEntry={!showPassword}
//                         className="flex-1 px-3 py-3.5 text-[15px] text-gray-900"
//                     />
//                     <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
//                         {showPassword ? (
//                             <EyeOff size={18} color="#9CA3AF" />
//                         ) : (
//                             <Eye size={18} color="#9CA3AF" />
//                         )}
//                     </TouchableOpacity>
//                 </View>
//                 {errors.password ? (
//                     <Text className="text-red-500 text-xs mb-3">{errors.password}</Text>
//                 ) : (
//                     <View className="mb-3" />
//                 )}

//                 <TouchableOpacity
//                     onPress={() => router.push("/forget/forget-password")}
//                     className="self-end mb-6"
//                 >
//                     <Text className="text-green-600 text-sm font-medium">
//                         Password bhool gaye?
//                     </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                     onPress={handleLogin}
//                     disabled={loading}
//                     className="bg-green-600 rounded-xl py-4 items-center justify-center"
//                     activeOpacity={0.85}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-semibold text-[15px]">Login</Text>
//                     )}
//                 </TouchableOpacity>

//                 <View className="flex-row justify-center mt-6">
//                     <Text className="text-gray-500 text-sm">Account nahi hai? </Text>
//                     <TouchableOpacity
//                         onPress={() =>
//                             router.push({
//                                 pathname: "/sell",
//                                 params: {
//                                     type: "user",
//                                 },
//                             })
//                         }
//                     >
//                         <Text className="text-green-600 text-sm font-semibold">
//                             Sign Up
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </KeyboardAwareScrollView>
//     );
// }



import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { loginUser } from "../redux/slices/authSlice.js"
import { fetchCart } from "../redux/slices/cartSlice.js"
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth.loading);
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) newErrors.email = "Email zaroori hai";
        else if (!emailRegex.test(email)) newErrors.email = "Valid email daalo";

        if (!password) newErrors.password = "Password zaroori hai";
        else if (password.length < 8) newErrors.password = "Password kam se kam 8 character ka ho";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await dispatch(loginUser({ email, password })).unwrap();
            dispatch(fetchCart());
            router.replace("/(root)/(tabs)");
        } catch (err) {
            Alert.alert("Login Failed", err?.message || "Kuch galat ho gaya, dobara try karo");
        }
    };

    return (
        // 👇 KeyboardAvoidingView + ScrollView ki jagah ye - focused
        // input tak automatically scroll kar deta hai
        <KeyboardAwareScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={20}
            keyboardOpeningTime={0}
        >
            {/* Header */}
            <View
                className="px-6 flex-row items-center mb-2"
                style={{ paddingTop: insets.top }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6 justify-center">
                <View className="mb-10">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back 👋
                    </Text>
                    <Text className="text-sm text-gray-500">
                        Login karke apna shopping continue karo
                    </Text>
                </View>

                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
                <View
                    className={`flex-row items-center border rounded-xl px-4 mb-1 ${errors.email ? "border-red-400" : "border-gray-200"
                        }`}
                >
                    <Mail size={18} color="#9CA3AF" />
                    <TextInput
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors((p) => ({ ...p, email: null }));
                        }}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 px-3 py-3.5 text-[15px] text-gray-900"
                    />
                </View>
                {errors.email ? (
                    <Text className="text-red-500 text-xs mb-3">{errors.email}</Text>
                ) : (
                    <View className="mb-3" />
                )}

                <Text className="text-xs font-semibold text-gray-500 mb-1.5">Password</Text>
                <View
                    className={`flex-row items-center border rounded-xl px-4 mb-1 ${errors.password ? "border-red-400" : "border-gray-200"
                        }`}
                >
                    <Lock size={18} color="#9CA3AF" />
                    <TextInput
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors((p) => ({ ...p, password: null }));
                        }}
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        className="flex-1 px-3 py-3.5 text-[15px] text-gray-900"
                    />
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                        {showPassword ? (
                            <EyeOff size={18} color="#9CA3AF" />
                        ) : (
                            <Eye size={18} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                </View>
                {errors.password ? (
                    <Text className="text-red-500 text-xs mb-3">{errors.password}</Text>
                ) : (
                    <View className="mb-3" />
                )}

                <TouchableOpacity
                    onPress={() => router.push("/forget/forget-password")}
                    className="self-end mb-6"
                >
                    <Text className="text-green-600 text-sm font-medium">
                        Password bhool gaye?
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-green-600 rounded-xl py-4 items-center justify-center"
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-[15px]">Login</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 text-sm">Account nahi hai? </Text>
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/sell",
                                params: {
                                    type: "user",
                                },
                            })
                        }
                    >
                        <Text className="text-green-600 text-sm font-semibold">
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}