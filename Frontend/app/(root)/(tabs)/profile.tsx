
import { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    StyleSheet,
} from "react-native";
// import { Image } from "expo-image";

import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import {
    Package,
    Heart,
    Ticket,
    Gift,
    HelpCircle,
    Smartphone,
    UserPen,
    MapPin,
    ShieldCheck,
    Star,
    MessageCircleQuestion,
    Store,
    FileText,
    LogOut,
    LogIn,
    ChevronRight,
    X,
    Camera,
} from "lucide-react-native";
import { logoutUser, updateProfile, fetchUserProfile } from "@/redux/slices/authSlice";
import ProfileSkeleton from "@/components/skeleton/ProfileSkeleton";

import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withSpring,
    withTiming,
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedReaction,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HALF_HEIGHT = SCREEN_HEIGHT * 0.62;
const FULL_HEIGHT = SCREEN_HEIGHT * 0.94;
const CLOSE_THRESHOLD = SCREEN_HEIGHT * 0.15;
const CLOSE_ANIM_DURATION = 280;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// ==========================================================
// MAIN PROFILE SCREEN
// ==========================================================
export default function ProfileScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const user = useSelector((state) => state.auth.user);
    const authLoading = useSelector((state) => state.auth.loading);
    const profileLoading = useSelector((state) => state.auth.profileLoading);
    const profileRefreshing = useSelector((state) => state.auth.profileRefreshing);

    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchUserProfile({}));
    }, []);



    const onRefresh = useCallback(() => {
        dispatch(fetchUserProfile({ isRefresh: true }));
    }, []);

    // Tab bar modal khulte hi hide, aur closing animation poori hone
    // ke baad hi wapas dikhega
    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: editModalVisible ? { display: "none" } : undefined,
        });
        return () => {
            navigation.getParent()?.setOptions({ tabBarStyle: undefined });
        };
    }, [editModalVisible]);

    const handleLogout = () => {
        Alert.alert("Logout", "Kya aap sach me logout karna chahte hain?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => dispatch(logoutUser()),
            },
        ]);
    };

    const MenuItem = ({ icon: Icon, label, onPress, danger = false }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-100"
            activeOpacity={0.6}
        >
            <View className="flex-row items-center gap-3">
                <Icon size={20} color={danger ? "#dc2626" : "#374151"} strokeWidth={2} />
                <Text className={`text-[15px] ${danger ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                    {label}
                </Text>
            </View>
            {!danger && <ChevronRight size={18} color="#9CA3AF" />}
        </TouchableOpacity>
    );

    const QuickAction = ({ icon: Icon, label, onPress }) => (
        <TouchableOpacity onPress={onPress} className="flex-1 items-center justify-center py-3" activeOpacity={0.6}>
            <View className="w-11 h-11 rounded-full bg-green-50 items-center justify-center mb-1">
                <Icon size={20} color="#16a34a" strokeWidth={2} />
            </View>
            <Text className="text-xs text-gray-700 font-medium">{label}</Text>
        </TouchableOpacity>
    );

    const SectionLabel = ({ text }) => (
        <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-1">{text}</Text>
    );

    const isInitialLoading = isLoggedIn && profileLoading && !profileRefreshing && !user;

    if (isInitialLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={profileRefreshing}
                    onRefresh={onRefresh}
                    colors={["#16a34a"]}
                />
            }
        >
            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-5 flex-row items-center gap-4">

                <Image
                    source={{
                        uri:
                            user?.imageUrl ||
                            "https://api.dicebear.com/7.x/initials/png?seed=Guest",
                    }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    className="w-16 h-16 rounded-full bg-gray-200"
                />


                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">
                        {isLoggedIn ? user?.fullName || "User" : "Welcome, Guest 👋"}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5">
                        {isLoggedIn ? user?.email || user?.phone : "Login to access your account"}
                    </Text>
                </View>

                {isLoggedIn && (
                    <TouchableOpacity
                        onPress={() => setEditModalVisible(true)}
                        className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <UserPen size={16} color="#374151" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Orders */}
            <TouchableOpacity
                onPress={() => router.push("/(root)/orders")}
                className="bg-white mt-2 mx-4 rounded-xl p-4 flex-row items-center justify-between"
                activeOpacity={0.7}
                style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                }}
            >
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                        <Package size={20} color="#ea580c" strokeWidth={2} />
                    </View>
                    <View>
                        <Text className="text-[15px] font-semibold text-gray-900">My Orders</Text>
                        <Text className="text-xs text-gray-500 mt-0.5">Track, return or buy again</Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Quick actions */}
            <View className="bg-white mt-3 mx-4 rounded-xl flex-row items-center justify-between">
                <QuickAction icon={Heart} label="Wishlist" onPress={() => router.push("/wishlist")} />
                <QuickAction icon={Ticket} label="Coupons" onPress={() => router.push("/coupons")} />
                <QuickAction icon={Gift} label="Rewards" onPress={() => router.push("/rewards")} />
            </View>

            {/* Help center */}
            <View className="bg-white mt-3 mx-4 rounded-xl overflow-hidden">
                <MenuItem icon={HelpCircle} label="Help Center" onPress={() => router.push("/help-center")} />
            </View>

            {/* Account settings */}
            <SectionLabel text="Account Settings" />
            <View className="bg-white mx-4 rounded-xl overflow-hidden">
                {isLoggedIn && (
                    <>
                        <MenuItem icon={UserPen} label="Edit Profile" onPress={() => setEditModalVisible(true)} />
                        <MenuItem icon={MapPin} label="Saved Addresses" onPress={() => router.push("/(root)/address/addresses")} />
                        <MenuItem icon={Smartphone} label="Manage Devices" onPress={() => router.push("/profile/devices")} />
                    </>
                )}
                <MenuItem icon={ShieldCheck} label="Privacy Center" onPress={() => router.push("/profile/privacy-center")} />
            </View>

            {/* Reviews & Q/A */}
            <SectionLabel text="My Activity" />
            <View className="bg-white mx-4 rounded-xl overflow-hidden">
                <MenuItem icon={Star} label="My Reviews" onPress={() => router.push("/profile/reviews")} />
                <MenuItem icon={MessageCircleQuestion} label="Questions & Answers" onPress={() => router.push("/profile/questions")} />
            </View>

            {/* Sell + policies */}
            <SectionLabel text="Others" />
            <View className="bg-white mx-4 rounded-xl overflow-hidden">
                <MenuItem icon={Store} label="Sell on Our Store" onPress={() => router.push("/sell")} />
                <MenuItem icon={FileText} label="Terms, Policies & Licenses" onPress={() => router.push("/legal")} />
            </View>

            {/* Login / Logout */}
            <View className="bg-white mt-3 mx-4 rounded-xl overflow-hidden mb-4">
                {isLoggedIn ? (
                    <MenuItem icon={LogOut} label={authLoading ? "Logging out..." : "Logout"} onPress={handleLogout} danger />
                ) : (
                    <MenuItem icon={LogIn} label="Login / Sign Up" onPress={() => router.push("/(root)/login")} />
                )}
            </View>

            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                user={user}
            />
        </ScrollView>
    );
}

// ==========================================================
// EDIT PROFILE BOTTOM SHEET
// ==========================================================
function EditProfileModal({ visible, onClose, user }) {
    const dispatch = useDispatch();
    const updateLoading = useSelector((state) => state.auth.updateLoading);

    const [fullName, setFullName] = useState(user?.fullName || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [email, setEmail] = useState(user?.email || "");
    const [image, setImage] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);

    const sheetHeight = useSharedValue(0);
    const backdropOpacity = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const isFull = useSharedValue(false);

    const [scrollEnabled, setScrollEnabled] = useState(false);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // sheetHeight change hote hi isFull shared value bhi sync karo -
    // yehi value backdrop-tap aur drag dono logic me use hogi
    useAnimatedReaction(
        () => sheetHeight.value >= FULL_HEIGHT - 5,
        (isFullNow) => {
            isFull.value = isFullNow;
            runOnJS(setScrollEnabled)(isFullNow);
        },
        [sheetHeight]
    );

    const finishClose = useCallback(() => {
        setModalVisible(false);
        onClose?.();
    }, [onClose]);

    const closeSheet = useCallback(() => {
        backdropOpacity.value = withTiming(0, { duration: CLOSE_ANIM_DURATION });
        sheetHeight.value = withTiming(0, { duration: CLOSE_ANIM_DURATION }, (finished) => {
            if (finished) {
                runOnJS(finishClose)();
            }
        });
    }, [finishClose]);

    // 👇 FIX 2: Backdrop tap - sirf tab close karega jab sheet
    // HALF-open ho. Full-screen me user ko explicitly X ya
    // drag-down hi karna hoga (jaisa tune manga tha)
    const backdropTap = Gesture.Tap().onEnd(() => {
        if (!isFull.value) {
            runOnJS(closeSheet)();
        }
    });

    // 👇 FIX 1: Ye gesture ScrollView ko wrap karega taaki uska native
    // scroll aur neeche wala Pan gesture properly saath me kaam kare -
    // isi ki wajah se pehle sirf drag-handle se hi close hota tha,
    // ab poore sheet me kahi se bhi (jab scroll top pe ho) drag-to-close
    // kaam karega
    const nativeGesture = Gesture.Native();

    const pan = Gesture.Pan()
        .onChange((event) => {
            if (isFull.value && scrollY.value > 0) {
                // ScrollView abhi scroll ho rahi hai, sheet ko drag mat karo
                return;
            }
            const currentHeight = sheetHeight.value;
            let newHeight = currentHeight - event.changeY;
            newHeight = Math.min(Math.max(newHeight, 0), FULL_HEIGHT);
            sheetHeight.value = newHeight;
        })
        .onEnd((event) => {
            const currentHeight = sheetHeight.value;
            const velocity = event.velocityY;

            if (currentHeight < CLOSE_THRESHOLD || (velocity > 800 && currentHeight < HALF_HEIGHT)) {
                runOnJS(closeSheet)();
                return;
            }

            const targetFull = currentHeight > (HALF_HEIGHT + FULL_HEIGHT) / 2;
            const targetHeight = targetFull ? FULL_HEIGHT : HALF_HEIGHT;

            sheetHeight.value = withSpring(targetHeight, { damping: 15, stiffness: 150 });
        })
        .simultaneousWithExternalGesture(nativeGesture);

    const sheetStyle = useAnimatedStyle(() => ({
        height: sheetHeight.value,
        borderTopLeftRadius: Math.max(0, 24 * (1 - sheetHeight.value / FULL_HEIGHT)),
        borderTopRightRadius: Math.max(0, 24 * (1 - sheetHeight.value / FULL_HEIGHT)),
        backgroundColor: "#fff",
        overflow: "hidden",
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 32,
    }));

    const blurAnimatedProps = useAnimatedProps(() => ({
        intensity: backdropOpacity.value * 45,
    }));

    const dimStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    }));

    useEffect(() => {
        if (visible) {
            setModalVisible(true);
            sheetHeight.value = 0;
            backdropOpacity.value = 0;
            isFull.value = false;
            setScrollEnabled(false);

            requestAnimationFrame(() => {
                sheetHeight.value = withSpring(HALF_HEIGHT, { damping: 18, stiffness: 150 });
                backdropOpacity.value = withTiming(1, { duration: 250 });
            });
        }
    }, [visible]);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Photo access allow karo image change karne ke liye");
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

    const handleSubmit = async () => {
        if (!fullName || !phone || !email) {
            Alert.alert("Error", "Sabhi fields bharna zaroori hai");
            return;
        }
        if (phone.length !== 10) {
            Alert.alert("Error", "Phone number 10 digit ka hona chahiye");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("phone", phone);
        formData.append("email", email);
        if (image) {
            formData.append("image", { uri: image.uri, name: "profile.jpg", type: "image/jpeg" });
        }

        try {
            await dispatch(updateProfile(formData)).unwrap();
            Alert.alert("Success", "Profile update ho gayi");
            closeSheet();
        } catch (err) {
            Alert.alert("Error", err?.message || "Kuch galat ho gaya, dobara try karo");
        }
    };

    if (!modalVisible) return null;

    return (
        <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeSheet}>
            {/* 👇 EK HI GestureHandlerRootView poore modal content (backdrop
                + sheet dono) ke liye. Pehle backdrop isse bahar tha, isliye
                uske touches capture hi nahi ho rahe the - yehi asli bug tha */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    {/* Blurred backdrop */}
                    <GestureDetector gesture={backdropTap}>
                        <AnimatedBlurView
                            animatedProps={blurAnimatedProps}
                            tint="dark"
                            style={StyleSheet.absoluteFillObject}
                        >
                            <Animated.View style={dimStyle} />
                        </AnimatedBlurView>
                    </GestureDetector>

                    <GestureDetector gesture={pan}>
                        <Animated.View style={sheetStyle}>
                            <View style={{ alignItems: "center", paddingVertical: 10 }}>
                                <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: "#D1D5DB" }} />
                            </View>

                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-bold text-gray-900">Edit Profile</Text>
                                <TouchableOpacity onPress={closeSheet} className="p-1">
                                    <X size={22} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <GestureDetector gesture={nativeGesture}>
                                <Animated.ScrollView
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={scrollEnabled}
                                    keyboardShouldPersistTaps="handled"
                                    onScroll={scrollHandler}
                                    scrollEventThrottle={16}
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ paddingBottom: 40 }}
                                >
                                    <View className="items-center mb-5">
                                        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>

                                            <Image
                                                source={{
                                                    uri:
                                                        user?.imageUrl || image?.uri ||
                                                        "https://api.dicebear.com/7.x/initials/png?seed=Guest",
                                                }}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                                onLoad={() => console.log("Image Loaded")}
                                                onError={(e) => console.log("Image Error:", e.nativeEvent)}
                                                className="w-16 h-16 rounded-full bg-gray-200"
                                            />
                                            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 items-center justify-center border-2 border-white">
                                                <Camera size={14} color="#fff" />
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <Text className="text-xs font-semibold text-gray-500 mb-1.5">Full Name</Text>
                                    <TextInput
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholder="Apna naam likho"
                                        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900"
                                    />

                                    <Text className="text-xs font-semibold text-gray-500 mb-1.5">Phone Number</Text>
                                    <TextInput
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="10 digit number"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900"
                                    />

                                    <Text className="text-xs font-semibold text-gray-500 mb-1.5">Email</Text>
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="you@example.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-[15px] text-gray-900"
                                    />

                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        disabled={updateLoading}
                                        className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
                                        activeOpacity={0.8}
                                    >
                                        {updateLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text className="text-white font-semibold text-[15px]">Save Changes</Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.ScrollView>
                            </GestureDetector>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}
