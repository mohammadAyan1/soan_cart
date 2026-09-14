import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import {
    ShieldCheck,
    Database,
    MapPin,
    Camera,
    Bell,
    Share2,
    Cookie,
    Download,
    Trash2,
    FileText,
    ChevronRight,
    ChevronLeft,
    Lock,
    Smartphone,
} from "lucide-react-native";
import { logoutUser } from "@/redux/slices/authSlice";
// 👇 Agar tumhare paas already koi "requestAccountDeletion" ya
// "requestDataExport" thunk/API hai to usko yaha import kar lena.
// Abhi maine placeholder handlers rakhe hain jinhe tum apne backend
// endpoint se connect kar sakte ho.

export default function PrivacyCenterScreen() {
    const insets = useSafeAreaInsets();

    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const user = useSelector((state) => state.auth.user);

    const [exportLoading, setExportLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ==========================================================
    // HANDLERS
    // ==========================================================

    const handleDownloadData = async () => {
        if (!isLoggedIn) {
            Alert.alert("Login Required", "Apna data download karne ke liye pehle login karo");
            return;
        }
        try {
            setExportLoading(true);
            // TODO: apna real API call yaha lagao, e.g.
            // await dispatch(requestDataExport()).unwrap();
            await new Promise((resolve) => setTimeout(resolve, 1200));
            Alert.alert(
                "Request Received",
                "Tumhara data export ho raha hai. Ye tumhare registered email pe 24-48 hours me bhej diya jayega."
            );
        } catch (err) {
            Alert.alert("Error", err?.message || "Kuch galat ho gaya, dobara try karo");
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        if (!isLoggedIn) {
            Alert.alert("Login Required", "Account delete karne ke liye pehle login karo");
            return;
        }
        Alert.alert(
            "Delete Account",
            "Ye action permanent hai. Tumhara profile, orders history, addresses aur saved data sab hamesha ke liye delete ho jayega. Kya tum sure ho?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete My Account",
                    style: "destructive",
                    onPress: confirmDeleteAccount,
                },
            ]
        );
    };

    const confirmDeleteAccount = async () => {
        try {
            setDeleteLoading(true);
            // TODO: apna real API call yaha lagao, e.g.
            // await dispatch(requestAccountDeletion()).unwrap();
            await new Promise((resolve) => setTimeout(resolve, 1200));
            Alert.alert("Account Deleted", "Tumhara account successfully delete ho gaya hai.");
            dispatch(logoutUser());
            router.replace("/(root)/login");
        } catch (err) {
            Alert.alert("Error", err?.message || "Delete request fail ho gayi, dobara try karo");
        } finally {
            setDeleteLoading(false);
        }
    };

    const openMail = () => {
        Linking.openURL("mailto:support@sohncart.com?subject=Privacy%20Query");
    };

    // ==========================================================
    // REUSABLE PIECES (same pattern as ProfileScreen)
    // ==========================================================

    const SectionLabel = ({ text }) => (
        <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-1">{text}</Text>
    );

    const InfoRow = ({ icon: Icon, iconBg, iconColor, title, description }) => (
        <View className="flex-row items-start gap-3 py-3.5 px-4 border-b border-gray-100">
            <View
                className="w-9 h-9 rounded-full items-center justify-center mt-0.5"
                style={{ backgroundColor: iconBg }}
            >
                <Icon size={17} color={iconColor} strokeWidth={2} />
            </View>
            <View className="flex-1">
                <Text className="text-[14.5px] font-semibold text-gray-900">{title}</Text>
                <Text className="text-[13px] text-gray-500 mt-0.5 leading-[18px]">{description}</Text>
            </View>
        </View>
    );

    const ActionRow = ({ icon: Icon, label, description, onPress, danger = false, loading = false }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-100"
            activeOpacity={0.6}
        >
            <View className="flex-row items-center gap-3 flex-1 pr-3">
                <Icon size={20} color={danger ? "#dc2626" : "#374151"} strokeWidth={2} />
                <View className="flex-1">
                    <Text className={`text-[15px] ${danger ? "text-red-600 font-semibold" : "text-gray-800 font-medium"}`}>
                        {label}
                    </Text>
                    {description ? (
                        <Text className="text-[12.5px] text-gray-500 mt-0.5">{description}</Text>
                    ) : null}
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="small" color={danger ? "#dc2626" : "#16a34a"} />
            ) : (
                <ChevronRight size={18} color="#9CA3AF" />
            )}
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
                    <ShieldCheck size={20} color="#16a34a" />
                    <Text className="text-lg font-bold text-gray-900">Privacy Center</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro card */}
                <View
                    className="bg-white mt-4 mx-4 rounded-xl p-4"
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                    }}
                >
                    <View className="flex-row items-center gap-2 mb-1.5">
                        <Lock size={16} color="#16a34a" />
                        <Text className="text-[15px] font-bold text-gray-900">Tumhara data, tumhara control</Text>
                    </View>
                    <Text className="text-[13px] text-gray-500 leading-[19px]">
                        Hum sirf wahi data collect karte hain jo tumhe better shopping experience dene ke
                        liye zaroori hai. Neeche dekho hum kya collect karte hain, kaise use karte hain,
                        aur tum apne data pe kya control rakhte ho.
                    </Text>
                </View>

                {/* What we collect */}
                <SectionLabel text="Hum Kya Data Collect Karte Hain" />
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    <InfoRow
                        icon={Database}
                        iconBg="#EFF6FF"
                        iconColor="#2563eb"
                        title="Account Information"
                        description="Naam, email, phone number aur profile photo jo tumne signup ke time diya"
                    />
                    <InfoRow
                        icon={MapPin}
                        iconBg="#F0FDF4"
                        iconColor="#16a34a"
                        title="Location Data"
                        description="Sirf tab collect hoti hai jab tum delivery address me GPS autofill use karte ho"
                    />
                    <InfoRow
                        icon={Camera}
                        iconBg="#FDF4FF"
                        iconColor="#a855f7"
                        title="Photos & Media"
                        description="Sirf jab tum profile photo ya review ke saath image upload karte ho"
                    />
                    <InfoRow
                        icon={Smartphone}
                        iconBg="#FFF7ED"
                        iconColor="#ea580c"
                        title="Device & Session Info"
                        description="Device type, app version aur login sessions taaki tum apne devices manage kar sako"
                    />
                </View>

                {/* Permissions */}
                <SectionLabel text="App Permissions" />
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    <ActionRow
                        icon={MapPin}
                        label="Location Access"
                        description="Address autofill ke liye — kabhi bhi phone settings se off kar sakte ho"
                        onPress={() => Linking.openSettings()}
                    />
                    <ActionRow
                        icon={Camera}
                        label="Camera & Gallery Access"
                        description="Profile photo aur review images ke liye"
                        onPress={() => Linking.openSettings()}
                    />
                    <ActionRow
                        icon={Bell}
                        label="Notification Access"
                        description="Order updates aur offers ke liye"
                        onPress={() => Linking.openSettings()}
                    />
                </View>

                {/* Data sharing */}
                <SectionLabel text="Data Sharing" />
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    <InfoRow
                        icon={Share2}
                        iconBg="#FEF2F2"
                        iconColor="#dc2626"
                        title="Third-Party Services"
                        description="Payment processing aur image storage (Cloudinary) ke liye trusted partners ke saath minimal data share hota hai"
                    />
                    <InfoRow
                        icon={Cookie}
                        iconBg="#FEFCE8"
                        iconColor="#ca8a04"
                        title="Cookies & Tracking"
                        description="App experience improve karne ke liye basic analytics use hoti hai, koi third-party ad tracking nahi"
                    />
                </View>

                {/* Your rights / actions */}
                <SectionLabel text="Tumhare Rights" />
                <View className="bg-white mx-4 rounded-xl overflow-hidden">
                    <ActionRow
                        icon={Download}
                        label="Download My Data"
                        description="Apna saara account data ek copy me le sakte ho"
                        onPress={handleDownloadData}
                        loading={exportLoading}
                    />
                    <ActionRow
                        icon={Smartphone}
                        label="Manage Devices"
                        description="Dekho kaha kaha tumhara account login hai"
                        onPress={() => router.push("/profile/devices")}
                    />
                    <ActionRow
                        icon={Trash2}
                        label="Delete My Account"
                        description="Ye permanent hai — sab data delete ho jayega"
                        onPress={handleDeleteAccount}
                        danger
                        loading={deleteLoading}
                    />
                </View>

                {/* Legal */}
                <SectionLabel text="Legal" />
                <View className="bg-white mx-4 rounded-xl overflow-hidden mb-6">
                    <ActionRow
                        icon={FileText}
                        label="Privacy Policy"
                        onPress={() => router.push("/legal/privacy-policy")}
                    />
                    <ActionRow
                        icon={FileText}
                        label="Terms of Service"
                        onPress={() => router.push("/legal/terms-of-service")}
                    />
                    <ActionRow
                        icon={ShieldCheck}
                        label="Contact Privacy Team"
                        description="support@sohncart.com"
                        onPress={() => router.push("/legal/contact-privacy")}
                    />
                </View>
            </ScrollView>
        </View>
    );
}