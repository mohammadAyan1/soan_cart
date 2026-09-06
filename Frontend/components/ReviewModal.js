// components/ReviewModal.jsx
import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    // Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    Animated,
    Dimensions,
    Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { Star, X, ImagePlus } from "lucide-react-native";
import { createReview } from "@/redux/slices/reviewSlice";
import { Image } from "expo-image";
const MAX_IMAGES = 5;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// ==========================================================
// Tappable star input - user rating select karta hai
// ==========================================================
function StarInput({ rating, onChange }) {
    return (
        <View className="flex-row items-center gap-2 justify-center my-2">
            {[1, 2, 3, 4, 5].map((position) => (
                <TouchableOpacity
                    key={position}
                    onPress={() => onChange(position)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                    <Star
                        size={34}
                        color={position <= rating ? "#f59e0b" : "#d1d5db"}
                        fill={position <= rating ? "#f59e0b" : "transparent"}
                        strokeWidth={1.5}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ==========================================================
// MAIN: Review Modal
// Props: visible, onClose, orderItemId, productName, onSuccess
// ==========================================================
export default function ReviewModal({ visible, onClose, orderItemId, productName, onSuccess }) {
    const dispatch = useDispatch();
    const actionLoading = useSelector((state) => state.reviews.actionLoading);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);

    // ------------------------------------------------------------
    // Modal ke andar RN ka <KeyboardAvoidingView> bharosemand nahi hai
    // (khaaskar Android pe + statusBarTranslucent ke saath) - isliye
    // keyboard ki height khud track kar rahe hain aur sheet ko manually
    // upar shift kar rahe hain. Ye dono platforms (iOS/Android) pe
    // reliably kaam karta hai.
    // ------------------------------------------------------------
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        // iOS pe "WillShow/WillHide" use karo - ye keyboard animation ke
        // saath sync me fire hote hain, isliye transition smooth lagta hai.
        // Android pe "WillShow/WillHide" reliably fire nahi hote, isliye
        // "DidShow/DidHide" use karna padta hai.
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates?.height || 0);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // ------------------------------------------------------------
    // Apna khud ka Animated mount/unmount control (RN ke built-in
    // <Modal animationType="slide"> ki jagah) - taaki backdrop fade
    // aur sheet slide dono smoothly, alag-alag control ho sakein.
    //  - internalVisible -> <Modal> ko actually mount/unmount karta hai
    //  - translateY -> sheet neeche se upar slide hoti hai (spring)
    //  - backdropOpacity -> background smoothly fade in/out hota hai
    // ------------------------------------------------------------
    const [internalVisible, setInternalVisible] = useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Modal ko pehle mount karo, phir animate in karo
            setInternalVisible(true);
            translateY.setValue(SCREEN_HEIGHT);
            backdropOpacity.setValue(0);
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    mass: 0.9,
                    stiffness: 180,
                }),
            ]).start();
        } else if (internalVisible) {
            // Pehle animate out karo, uske baad hi Modal ko unmount karo
            // (isiliye internalVisible ek render tak "true" rehta hai)
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) setInternalVisible(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const resetForm = () => {
        setRating(0);
        setComment("");
        setImages([]);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        resetForm();
        onClose?.();
    };

    const pickImages = async () => {
        if (images.length >= MAX_IMAGES) {
            Alert.alert("Limit", `Aap sirf ${MAX_IMAGES} photos tak add kar sakte hain`);
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission Required", "Photo access allow karo image lagane ke liye");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages((prev) => [...prev, ...result.assets].slice(0, MAX_IMAGES));
        }
    };

    const removeImage = (uri) => {
        setImages((prev) => prev.filter((img) => img.uri !== uri));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Rating Zaroori Hai", "Kam se kam ek star select karo");
            return;
        }

        try {
            await dispatch(
                createReview({ orderItemId, rating, comment: comment.trim(), images })
            ).unwrap();

            Alert.alert("Success", "Aapka review submit ho gaya");
            resetForm();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            Alert.alert("Error", err || "Review submit nahi ho paya, dobara try karo");
        }
    };

    if (!internalVisible) return null;

    return (
        // animationType="none" hi rehne do - Animated khud handle karega,
        // statusBarTranslucent add kiya taaki backdrop poori screen cover kare
        <Modal
            visible={internalVisible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Backdrop - tap karke bhi close ho jaye, aur smoothly fade ho */}
            <Animated.View
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    opacity: backdropOpacity,
                }}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={{ flex: 1 }} />
                </TouchableWithoutFeedback>

                {/*
                    FIX: KeyboardAvoidingView wrapper hata diya hai - Modal ke
                    andar wo bharosemand nahi tha (khaaskar Android pe). Iski
                    jagah upar wale "keyboardHeight" state se seedha sheet ko
                    marginBottom + maxHeight adjust karke upar shift kar rahe
                    hain. Ye dono platform pe consistently kaam karta hai.
                */}
                <Animated.View
                    style={{
                        transform: [{ translateY }],
                        // Sheet ki max height keyboard ke hisaab se shrink hogi
                        // taaki wo kabhi screen se overflow na ho
                        maxHeight: SCREEN_HEIGHT * 0.85 - keyboardHeight,
                        // Keyboard jitni height le raha hai, sheet ko utna hi
                        // upar push kar do taaki fields hamesha visible rahein
                        marginBottom: keyboardHeight,
                    }}
                    className="bg-white rounded-t-3xl px-5 pt-5"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-lg font-bold text-gray-900">Rate & Review</Text>
                        <TouchableOpacity onPress={handleClose} className="p-1">
                            <X size={22} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {productName ? (
                        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
                            {productName}
                        </Text>
                    ) : null}

                    <ScrollView
                        // flexShrink dena taaki wo apni maxHeight se bada na ho,
                        // aur content ke hisaab se hi size le - submit button
                        // hamesha andar hi render ho, screen ke bahar nahi jaaye
                        style={{ flexShrink: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 28 }}
                    >
                        {/* Star rating */}
                        <StarInput rating={rating} onChange={setRating} />

                        {/* Comment */}
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5 mt-3">
                            Apna experience likho (optional)
                        </Text>
                        <TextInput
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Product kaisa tha? Quality, delivery, packaging..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 min-h-[90px]"
                        />

                        {/* Images */}
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5 mt-4">
                            Photos add karo (optional)
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {images.map((img) => (
                                <View key={img.uri} className="relative">
                                    {/* <Image
                                        source={{ uri: img.uri }}
                                        className="w-16 h-16 rounded-lg bg-gray-100"
                                    /> */}

                                    <Image
                                        source={img.uri}
                                        contentFit="cover"
                                        cachePolicy="memory-disk"
                                        className="w-16 h-16 rounded-lg bg-gray-100"
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(img.uri)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 items-center justify-center"
                                        activeOpacity={0.8}
                                    >
                                        <X size={11} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < MAX_IMAGES && (
                                <TouchableOpacity
                                    onPress={pickImages}
                                    className="w-16 h-16 rounded-lg border border-dashed border-gray-300 items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    <ImagePlus size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={actionLoading}
                            className="bg-green-600 rounded-xl py-3.5 items-center justify-center mt-6"
                            activeOpacity={0.8}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-[15px]">Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}