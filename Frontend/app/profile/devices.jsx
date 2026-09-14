import { useSafeAreaInsets } from "react-native-safe-area-context";


import { useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Stack, router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { Smartphone, MapPin, Clock, ChevronLeft } from "lucide-react-native";
import { fetchMySessions, logoutSessionDevice, logoutAllDevices } from "@/redux/slices/sessionSlice";
import { logoutUser } from "@/redux/slices/authSlice";
import DeviceSkeleton from "@/components/skeleton/DeviceSkeleton";

// Backend se ab combined "Brand Model" string aati hai (jaise "vivo V2228")
// - bas pehla letter capitalize kar dete hai dikhne me acha lage
function formatDeviceName(deviceModel = "") {
    if (!deviceModel) return "Unknown Device";
    return deviceModel.charAt(0).toUpperCase() + deviceModel.slice(1);
}

function formatDateTime(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} · ${timePart}`;
}

export default function ManageDevicesScreen() {
    const insets = useSafeAreaInsets();

    const dispatch = useDispatch();

    const sessions = useSelector((state) => state.session.sessions);
    const loading = useSelector((state) => state.session.loading);
    const refreshing = useSelector((state) => state.session.refreshing);
    const actionLoadingId = useSelector((state) => state.session.actionLoadingId);
    const logoutAllLoading = useSelector((state) => state.session.logoutAllLoading);

    useEffect(() => {
        dispatch(fetchMySessions({}));
    }, []);

    const onRefresh = useCallback(() => {
        dispatch(fetchMySessions({ isRefresh: true }));
    }, []);

    // Current device pe "Log Out" dabane se normal app-logout hota hai
    // (token clear, login screen pe bhej do)
    const handleLogoutCurrentDevice = () => {
        Alert.alert("Logout", "Kya aap is device se logout karna chahte hain?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await dispatch(logoutUser());
                    router.replace("/(root)/login");
                },
            },
        ]);
    };

    // Doosre device pe "Log Out" dabane se sirf wahi remote session
    // invalidate hoti hai - current device pe koi asar nahi padta
    const handleLogoutOtherDevice = (session) => {
        Alert.alert(
            "Device Logout Karein?",
            `${formatDeviceName(session.deviceModel)} se logout karna chahte ho?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => {
                        dispatch(logoutSessionDevice(session.sessionId))
                            .unwrap()
                            .catch((err) => Alert.alert("Error", err || "Logout nahi ho paya"));
                    },
                },
            ]
        );
    };

    const handleLogoutAll = () => {
        Alert.alert(
            "Sab Devices Se Logout Karein?",
            "Iske alawa jitne bhi devices me aap login hai, sab se logout ho jayenge. Ye device (jisme aap abhi ho) logged in rahega.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout All",
                    style: "destructive",
                    onPress: () => {
                        dispatch(logoutAllDevices())
                            .unwrap()
                            .catch((err) => Alert.alert("Error", err || "Logout nahi ho paya"));
                    },
                },
            ]
        );
    };

    const currentDevice = sessions.find((s) => s.isCurrentDevice);
    const otherDevices = sessions.filter((s) => !s.isCurrentDevice);

    const isInitialLoading = loading && !refreshing && sessions.length === 0;

    const DeviceCard = ({ session, isCurrent }) => {
        const isLoggingOut = actionLoadingId === session.sessionId;
        const locationText =
            [session.city, session.state, session.country].filter(Boolean).join(", ") ||
            "Location available nahi hai";

        return (
            <View className="bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden">
                <View className="p-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                            <View className="w-9 h-9 rounded-full bg-green-50 items-center justify-center">
                                <Smartphone size={18} color="#16a34a" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[15px] font-bold text-gray-900" numberOfLines={1}>
                                    {formatDeviceName(session.deviceModel)}
                                </Text>
                                <Text className="text-[11px] text-gray-400" numberOfLines={1}>
                                    {session.platform} {session.osVersion ? `· ${session.osVersion}` : ""}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                isCurrent ? handleLogoutCurrentDevice() : handleLogoutOtherDevice(session)
                            }
                            disabled={isLoggingOut}
                            activeOpacity={0.6}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator size="small" color="#16a34a" />
                            ) : (
                                <Text className="text-[13px] font-bold text-green-700">Log Out</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-1.5 mt-3">
                        <Clock size={13} color="#9CA3AF" />
                        <Text className="text-[12px] text-gray-500">
                            Last used on {formatDateTime(session.lastSeen)}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5 mt-1.5">
                        <MapPin size={13} color="#9CA3AF" />
                        <Text className="text-[12px] text-gray-500 flex-1" numberOfLines={1}>
                            {locationText}
                        </Text>
                    </View>
                </View>

                <View className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
                    <Text className="text-[11px] text-gray-400">
                        Registered on {formatDateTime(session.startedAt)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={20} color="#374151" />
                </TouchableOpacity> */}
                <View>
                    <Text className="text-lg font-bold text-gray-900">Manage Devices</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                        Ye sab devices hai jinme aapka account currently login hai
                    </Text>
                </View>
            </View>

            {isInitialLoading ? (
                <DeviceSkeleton />
            ) : (
                <>
                    <ScrollView
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
                        }
                    >
                        {currentDevice && (
                            <>
                                <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                                    This Device
                                </Text>
                                <DeviceCard session={currentDevice} isCurrent />
                            </>
                        )}

                        {otherDevices.length > 0 && (
                            <>
                                <Text className="text-xs font-bold text-gray-400 uppercase mb-2 mt-2">
                                    Other Devices
                                </Text>
                                {otherDevices.map((session) => (
                                    <DeviceCard key={session.sessionId} session={session} isCurrent={false} />
                                ))}
                            </>
                        )}

                        {sessions.length === 0 && (
                            <View className="items-center justify-center py-20">
                                <Smartphone size={40} color="#9CA3AF" />
                                <Text className="text-sm text-gray-500 mt-3">Koi active device nahi mila</Text>
                            </View>
                        )}
                    </ScrollView>

                    {otherDevices.length > 0 && (
                        <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-100">
                            <TouchableOpacity
                                onPress={handleLogoutAll}
                                disabled={logoutAllLoading}
                                className="border border-gray-300 rounded-xl py-3.5 items-center justify-center"
                                activeOpacity={0.7}
                            >
                                {logoutAllLoading ? (
                                    <ActivityIndicator color="#374151" />
                                ) : (
                                    <Text className="text-[14px] font-semibold text-gray-800">
                                        Log out from all devices
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}