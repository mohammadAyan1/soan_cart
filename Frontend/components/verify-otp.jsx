// import { useState, useRef } from "react";
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     TextInput,
//     Alert,
//     ActivityIndicator,
// } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import { ChevronLeft, MailCheck } from "lucide-react-native";
// import api from "@/api/api"; // 👈 apna actual axios instance path daal dena
// import { useDispatch, useSelector } from "react-redux";
// import { verifyOtp, resendOtp } from "../redux/slices/authSlice";
// import { useSafeAreaInsets } from "react-native-safe-area-context";



// export default function VendorVerifyOtpScreen() {
//     const insets = useSafeAreaInsets();
//     const { email } = useLocalSearchParams();
//     const [otp, setOtp] = useState("");
//     // const [loading, setLoading] = useState(false);
//     // const [resendLoading, setResendLoading] = useState(false);


//     const dispatch = useDispatch();
//     const loading = useSelector((state) => state.auth.verifyOtpLoading);
//     const resendLoading = useSelector((state) => state.auth.resendOtpLoading);


//     const handleVerify = async () => {
//         if (!otp || otp.length !== 6) {
//             Alert.alert("Error", "6 digit ka valid OTP daalo");
//             return;
//         }

//         try {
//             // setLoading(true);
//             // const res = await api.post("/api/auth/verify-otp", { email, otp });
//             const result = await dispatch(verifyOtp({ email, otp })).unwrap();

//             Alert.alert("Success", result?.data?.message || "OTP verify ho gaya", [
//                 {
//                     text: "OK",
//                     onPress: () => router.replace("/(root)/login"),
//                 },
//             ]);
//         } catch (err) {
//             Alert.alert("Error", err?.response?.data?.message || "Invalid OTP, dobara try karo");
//         } finally {
//             // setLoading(false);
//         }
//     };

//     const handleResend = async () => {
//         try {
//             // setResendLoading(true);
//             // const res = await api.post("/api/auth/resend-otp", { email });
//             const result = await dispatch(resendOtp({ email })).unwrap();
//             Alert.alert("Success", result?.data?.message || "OTP dobara bheja gaya");
//         } catch (err) {
//             Alert.alert("Error", err?.response?.data?.message || "Resend fail ho gaya");
//         } finally {
//             // setResendLoading(false);
//         }
//     };

//     return (
//         <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
//             {/* Header */}
//             <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
//                 <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
//                     <ChevronLeft size={24} color="#111827" />
//                 </TouchableOpacity>
//                 <Text className="text-lg font-bold text-gray-900">Verify Email</Text>
//             </View>

//             <View className="px-6 pt-10 items-center">
//                 <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
//                     <MailCheck size={28} color="#16a34a" />
//                 </View>

//                 <Text className="text-[15px] font-bold text-gray-900 text-center mb-1.5">
//                     OTP Verify Karo
//                 </Text>
//                 <Text className="text-[13px] text-gray-500 text-center leading-[19px] mb-8">
//                     Humne 6-digit OTP bheja hai{"\n"}
//                     <Text className="font-semibold text-gray-700">{email}</Text> pe
//                 </Text>

//                 <TextInput
//                     value={otp}
//                     onChangeText={setOtp}
//                     placeholder="000000"
//                     keyboardType="number-pad"
//                     maxLength={6}
//                     className="border border-gray-200 rounded-xl px-4 py-3 text-center text-[20px] tracking-[8px] text-gray-900 bg-white w-full mb-6"
//                 />

//                 <TouchableOpacity
//                     onPress={handleVerify}
//                     disabled={loading}
//                     className="bg-green-600 rounded-xl py-3.5 items-center justify-center w-full"
//                     activeOpacity={0.8}
//                 >
//                     {loading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-semibold text-[15px]">Verify OTP</Text>
//                     )}
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={handleResend} disabled={resendLoading} className="mt-5">
//                     {resendLoading ? (
//                         <ActivityIndicator color="#16a34a" size="small" />
//                     ) : (
//                         <Text className="text-[13px] text-gray-500">
//                             OTP nahi mila? <Text className="text-green-600 font-semibold">Resend karo</Text>
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// }



import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MailCheck } from "lucide-react-native";
import api from "@/api/api"; // 👈 apna actual axios instance path daal dena
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resendOtp } from "../redux/slices/authSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorVerifyOtpScreen() {
    const insets = useSafeAreaInsets();
    const { email } = useLocalSearchParams();
    const [otp, setOtp] = useState("");

    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth.verifyOtpLoading);
    const resendLoading = useSelector((state) => state.auth.resendOtpLoading);

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "6 digit ka valid OTP daalo");
            return;
        }

        try {
            const result = await dispatch(verifyOtp({ email, otp })).unwrap();

            Alert.alert("Success", result?.data?.message || "OTP verify ho gaya", [
                {
                    text: "OK",
                    onPress: () => router.replace("/(root)/login"),
                },
            ]);
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Invalid OTP, dobara try karo");
        } finally {
        }
    };

    const handleResend = async () => {
        try {
            const result = await dispatch(resendOtp({ email })).unwrap();
            Alert.alert("Success", result?.data?.message || "OTP dobara bheja gaya");
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Resend fail ho gaya");
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
                    <Text className="text-lg font-bold text-gray-900">Verify Email</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <View className="px-6 pt-10 items-center">
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                    <MailCheck size={28} color="#16a34a" />
                </View>

                <Text className="text-[15px] font-bold text-gray-900 text-center mb-1.5">
                    OTP Verify Karo
                </Text>
                <Text className="text-[13px] text-gray-500 text-center leading-[19px] mb-8">
                    Humne 6-digit OTP bheja hai{"\n"}
                    <Text className="font-semibold text-gray-700">{email}</Text> pe
                </Text>

                <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="000000"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-center text-[20px] tracking-[8px] text-gray-900 bg-white w-full mb-6"
                />

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading}
                    className="bg-green-600 rounded-xl py-3.5 items-center justify-center w-full"
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-[15px]">Verify OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleResend} disabled={resendLoading} className="mt-5" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {resendLoading ? (
                        <ActivityIndicator color="#16a34a" size="small" />
                    ) : (
                        <Text className="text-[13px] text-gray-500">
                            OTP nahi mila? <Text className="text-green-600 font-semibold">Resend karo</Text>
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}