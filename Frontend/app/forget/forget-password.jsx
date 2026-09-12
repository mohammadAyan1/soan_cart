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
import { router } from "expo-router";
import { ChevronLeft, KeyRound, Mail, Eye, EyeOff } from "lucide-react-native";
import api from "../../api/api.js"; // 👈 apna actual axios instance path daal dena

import { useDispatch, useSelector } from "react-redux";
import { resendOtp, forgetPassword } from "../../redux/slices/authSlice.js";


export default function ForgetPasswordScreen() {
    const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



    const dispatch = useDispatch();
    const sendLoading = useSelector((state) => state.auth.resendOtpLoading);
    const resendLoading = useSelector((state) => state.auth.resendOtpLoading);
    const submitLoading = useSelector((state) => state.auth.forgetPasswordLoading);


    // ==========================================================
    // STEP 1 - Email submit karke OTP bhejo (resend-otp API use hoti hai)
    // ==========================================================
    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert("Error", "Email daalna zaroori hai");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        try {
            // setSendLoading(true);
            // const res = await api.post("/api/auth/resend-otp", { email });
            const result = await dispatch(resendOtp({ email })).unwrap();

            Alert.alert("Success", result?.data?.message || "OTP bheja gaya hai apne email pe");
            setStep(2);
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message || "User is email se nahi mila, dobara try karo"
            );
        } finally {
            
        }
    };

    // ==========================================================
    // STEP 2 - Resend OTP (agar OTP expire ho gaya ya mila nahi)
    // ==========================================================
    const handleResendOtp = async () => {
        try {
            
            const result = await dispatch(resendOtp({ email })).unwrap();

            Alert.alert("Success", result?.data?.message || "OTP dobara bheja gaya");
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "Resend fail ho gaya");
        } finally {
            
        }
    };

    // ==========================================================
    // STEP 2 - Password reset submit (forget-password API)
    // ==========================================================
    const validateResetForm = () => {
        if (!otp || !password || !confirmPassword) {
            Alert.alert("Error", "Sabhi fields bharna zaroori hai");
            return false;
        }

        if (otp.length !== 6) {
            Alert.alert("Error", "6 digit ka valid OTP daalo");
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

    const handleResetPassword = async () => {
        if (!validateResetForm()) return;

        try {
            
            const result = await dispatch(forgetPassword({ email, password, otp })).unwrap();

            Alert.alert("Success", result?.data?.message || "Password reset ho gaya", [
                {
                    text: "Login Karo",
                    onPress: () => router.replace("/(root)/login"),
                },
            ]);
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Kuch galat ho gaya, dobara try karo"
            );
        } finally {
            // setSubmitLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-5 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
                    <ChevronLeft size={24} color="#111827" />
                </TouchableOpacity> */}
                <View className="flex-row items-center gap-2">
                    <KeyRound size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Forgot Password</Text>
                </View>
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
                {step === 1 ? (
                    // ==========================================================
                    // STEP 1 - EMAIL INPUT
                    // ==========================================================
                    <>
                        <View className="items-center mb-6 mt-4">
                            <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                                <Mail size={28} color="#16a34a" />
                            </View>
                            <Text className="text-[15px] font-bold text-gray-900 text-center mb-1.5">
                                Password Bhool Gaye?
                            </Text>
                            <Text className="text-[13px] text-gray-500 text-center leading-[19px] px-4">
                                Koi baat nahi. Apna registered email daalo, hum tumhe OTP bhej denge
                                password reset karne ke liye.
                            </Text>
                        </View>

                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-[15px] text-gray-900 bg-white"
                        />

                        <TouchableOpacity
                            onPress={handleSendOtp}
                            disabled={sendLoading}
                            className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
                            activeOpacity={0.8}
                        >
                            {sendLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-[15px]">Send OTP</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} className="items-center mt-5">
                            <Text className="text-[13px] text-gray-500">
                                Password yaad aa gaya? <Text className="text-green-600 font-semibold">Login karo</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    // ==========================================================
                    // STEP 2 - OTP + NEW PASSWORD
                    // ==========================================================
                    <>
                        <View className="items-center mb-6 mt-4">
                            <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                                <KeyRound size={28} color="#16a34a" />
                            </View>
                            <Text className="text-[15px] font-bold text-gray-900 text-center mb-1.5">
                                Naya Password Banao
                            </Text>
                            <Text className="text-[13px] text-gray-500 text-center leading-[19px] px-4">
                                Humne 6-digit OTP bheja hai{"\n"}
                                <Text className="font-semibold text-gray-700">{email}</Text> pe
                            </Text>
                        </View>

                        {/* OTP */}
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">OTP</Text>
                        <TextInput
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="000000"
                            keyboardType="number-pad"
                            maxLength={6}
                            className="border border-gray-200 rounded-xl px-4 py-3 mb-1 text-center text-[20px] tracking-[8px] text-gray-900 bg-white"
                        />
                        <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading} className="self-end mb-4">
                            {resendLoading ? (
                                <ActivityIndicator color="#16a34a" size="small" />
                            ) : (
                                <Text className="text-[12.5px] text-green-600 font-semibold">
                                    OTP nahi mila? Resend karo
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* New Password */}
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">New Password</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-1 bg-white">
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Naya strong password banao"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                className="flex-1 py-3 text-[15px] text-gray-900"
                            />
                            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
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
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 mb-6 bg-white">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Password dobara likho"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                className="flex-1 py-3 text-[15px] text-gray-900"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)}>
                                {showConfirmPassword ? (
                                    <EyeOff size={18} color="#9CA3AF" />
                                ) : (
                                    <Eye size={18} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={submitLoading}
                            className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
                            activeOpacity={0.8}
                        >
                            {submitLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-[15px]">Reset Password</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setStep(1)} className="items-center mt-5">
                            <Text className="text-[13px] text-gray-500">
                                Galat email daala? <Text className="text-green-600 font-semibold">Wapas jao</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardAwareScrollView>
        </View>
    );
}