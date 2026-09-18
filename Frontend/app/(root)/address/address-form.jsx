


// import { useState, useEffect } from "react";
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     Alert,
//     ActivityIndicator,
//     Switch,
// } from "react-native";
// import { router, useLocalSearchParams, Stack } from "expo-router";
// import { useSelector, useDispatch } from "react-redux";
// import { ChevronLeft, LocateFixed } from "lucide-react-native";
// import * as Location from "expo-location";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import { createAddress, updateAddress } from "@/redux/slices/addressSlice";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// // ==========================================================
// // ADD / EDIT ADDRESS FORM
// // Route: /profile/address-form
// // Params: mode ("add" | "edit"), addressId (edit ke case me)
// // ==========================================================
// export default function AddressFormScreen() {
//     const { mode, addressId } = useLocalSearchParams();
//     const isEditMode = mode === "edit";

//     const insets = useSafeAreaInsets();


//     const dispatch = useDispatch();
//     const actionLoading = useSelector((state) => state.address.actionLoading);
//     const addresses = useSelector((state) => state.address.addresses);

//     // Edit mode me existing address list se data prefill karo
//     const existingAddress = isEditMode
//         ? addresses.find((a) => String(a.id) === String(addressId))
//         : null;

//     const [fullName, setFullName] = useState(existingAddress?.fullName || "");
//     const [phone, setPhone] = useState(existingAddress?.phone || "");
//     const [addressLine, setAddressLine] = useState(existingAddress?.addressLine || "");
//     const [city, setCity] = useState(existingAddress?.city || "");
//     const [state, setStateVal] = useState(existingAddress?.state || "");
//     const [pincode, setPincode] = useState(existingAddress?.pincode || "");
//     const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
//     const [latitude, setLatitude] = useState(existingAddress?.latitude ?? null);
//     const [longitude, setLongitude] = useState(existingAddress?.longitude ?? null);
//     const [locationLoading, setLocationLoading] = useState(false);

//     // ----------------------------------------------------------------
//     // Current location fetch karo (optional, lat/long ke liye)
//     // ----------------------------------------------------------------
//     const handleUseCurrentLocation = async () => {
//         try {
//             setLocationLoading(true);

//             const { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== "granted") {
//                 Alert.alert(
//                     "Permission Required",
//                     "Location access allow karo current location use karne ke liye"
//                 );
//                 return;
//             }

//             const position = await Location.getCurrentPositionAsync({
//                 accuracy: Location.Accuracy.Balanced,
//             });

//             setLatitude(position.coords.latitude);
//             setLongitude(position.coords.longitude);

//             // Reverse geocode se city/state/pincode auto-fill (best effort)
//             const [place] = await Location.reverseGeocodeAsync({
//                 latitude: position.coords.latitude,
//                 longitude: position.coords.longitude,
//             });

//             if (place) {
//                 if (place.city) setCity(place.city);
//                 if (place.region) setStateVal(place.region);
//                 if (place.postalCode) setPincode(place.postalCode);
//                 if (place.street || place.name) {
//                     setAddressLine((prev) => prev || `${place.name ?? ""} ${place.street ?? ""}`.trim());
//                 }
//             }
//         } catch (err) {
//             Alert.alert("Error", "Location fetch nahi ho payi, manually address bharo");
//         } finally {
//             setLocationLoading(false);
//         }
//     };

//     // ----------------------------------------------------------------
//     // Validate + Submit
//     // ----------------------------------------------------------------
//     const handleSubmit = async () => {
//         if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
//             Alert.alert("Error", "Sabhi fields bharna zaroori hai");
//             return;
//         }
//         if (phone.length !== 10) {
//             Alert.alert("Error", "Phone number 10 digit ka hona chahiye");
//             return;
//         }
//         if (pincode.length !== 6) {
//             Alert.alert("Error", "Pincode 6 digit ka hona chahiye");
//             return;
//         }

//         const payload = {
//             fullName,
//             phone,
//             addressLine,
//             city,
//             state,
//             pincode,
//             isDefault,
//             latitude,
//             longitude,
//         };

//         try {
//             if (isEditMode) {
//                 await dispatch(updateAddress({ id: addressId, payload })).unwrap();
//                 Alert.alert("Success", "Address update ho gaya");
//             } else {
//                 await dispatch(createAddress(payload)).unwrap();
//                 Alert.alert("Success", "Address add ho gaya");
//             }
//             router.back();
//         } catch (err) {
//             Alert.alert("Error", err || "Kuch galat ho gaya, dobara try karo");
//         }
//     };

//     return (
//         <View className="flex-1 bg-gray-50"
//             style={{ paddingTop: insets.top }}
//         >
//             <Stack.Screen options={{ headerShown: false }} />

//             {/* Header */}
//             <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
//                 {/* <TouchableOpacity
//                     onPress={() => router.back()}
//                     className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
//                     activeOpacity={0.7}
//                 >
//                     <ChevronLeft size={20} color="#374151" />
//                 </TouchableOpacity>
//                 <Text className="text-lg font-bold text-gray-900 flex-1">
//                     {isEditMode ? "Edit Address" : "Add New Address"}
//                 </Text> */}
//             </View>

//             {/* 👇 KeyboardAvoidingView + ScrollView ki jagah ye ek hi component
//                 sab handle karta hai - focused TextInput tak khud scroll karta hai */}
//             <KeyboardAwareScrollView
//                 contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//                 showsVerticalScrollIndicator={false}
//                 keyboardShouldPersistTaps="handled"
//                 enableOnAndroid={true}
//                 enableAutomaticScroll={true}
//                 extraScrollHeight={20} // focused field ke upar thoda extra gap
//                 keyboardOpeningTime={0}
//             >
//                 {/* Use current location */}
//                 <TouchableOpacity
//                     onPress={handleUseCurrentLocation}
//                     disabled={locationLoading}
//                     className="flex-row items-center justify-center gap-2 border border-green-600 rounded-xl py-3 mb-5 bg-green-50"
//                     activeOpacity={0.7}
//                 >
//                     {locationLoading ? (
//                         <ActivityIndicator size="small" color="#16a34a" />
//                     ) : (
//                         <>
//                             <LocateFixed size={16} color="#16a34a" />
//                             <Text className="text-[14px] font-semibold text-green-700">
//                                 Use Current Location
//                             </Text>
//                         </>
//                     )}
//                 </TouchableOpacity>

//                 {latitude && longitude && (
//                     <Text className="text-xs text-gray-400 mb-4 text-center">
//                         📍 Location captured: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
//                     </Text>
//                 )}

//                 {/* Full Name */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">
//                     Full Name
//                 </Text>
//                 <TextInput
//                     value={fullName}
//                     onChangeText={setFullName}
//                     placeholder="Jaise: Mohammad Khan"
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Phone */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">
//                     Phone Number
//                 </Text>
//                 <TextInput
//                     value={phone}
//                     onChangeText={setPhone}
//                     placeholder="10 digit mobile number"
//                     keyboardType="number-pad"
//                     maxLength={10}
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Address Line */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">
//                     Full Address (House No, Area, Landmark)
//                 </Text>
//                 <TextInput
//                     value={addressLine}
//                     onChangeText={setAddressLine}
//                     placeholder="Jaise: 123, MG Road, Near Bus Stand"
//                     multiline
//                     numberOfLines={3}
//                     textAlignVertical="top"
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                     style={{ minHeight: 80 }}
//                 />

//                 {/* City + State (side by side) */}
//                 <View className="flex-row gap-3 mb-4">
//                     <View className="flex-1">
//                         <Text className="text-xs font-semibold text-gray-500 mb-1.5">City</Text>
//                         <TextInput
//                             value={city}
//                             onChangeText={setCity}
//                             placeholder="Indore"
//                             className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 bg-white"
//                         />
//                     </View>
//                     <View className="flex-1">
//                         <Text className="text-xs font-semibold text-gray-500 mb-1.5">State</Text>
//                         <TextInput
//                             value={state}
//                             onChangeText={setStateVal}
//                             placeholder="Madhya Pradesh"
//                             className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 bg-white"
//                         />
//                     </View>
//                 </View>

//                 {/* Pincode */}
//                 <Text className="text-xs font-semibold text-gray-500 mb-1.5">
//                     Pincode
//                 </Text>
//                 <TextInput
//                     value={pincode}
//                     onChangeText={setPincode}
//                     placeholder="452001"
//                     keyboardType="number-pad"
//                     maxLength={6}
//                     className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
//                 />

//                 {/* Default toggle */}
//                 <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
//                     <Text className="text-[14px] font-medium text-gray-800">
//                         Isko Default Address Banao
//                     </Text>
//                     <Switch
//                         value={isDefault}
//                         onValueChange={setIsDefault}
//                         trackColor={{ false: "#D1D5DB", true: "#86efac" }}
//                         thumbColor={isDefault ? "#16a34a" : "#f4f3f4"}
//                     />
//                 </View>

//                 {/* Submit */}
//                 <TouchableOpacity
//                     onPress={handleSubmit}
//                     disabled={actionLoading}
//                     className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
//                     activeOpacity={0.8}
//                 >
//                     {actionLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text className="text-white font-semibold text-[15px]">
//                             {isEditMode ? "Update Address" : "Save Address"}
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </KeyboardAwareScrollView>
//         </View>
//     );
// }





import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, LocateFixed } from "lucide-react-native";
import * as Location from "expo-location";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createAddress, updateAddress } from "@/redux/slices/addressSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ==========================================================
// ADD / EDIT ADDRESS FORM
// Route: /profile/address-form
// Params: mode ("add" | "edit"), addressId (edit ke case me)
// ==========================================================
export default function AddressFormScreen() {
    const { mode, addressId } = useLocalSearchParams();
    const isEditMode = mode === "edit";

    const insets = useSafeAreaInsets();


    const dispatch = useDispatch();
    const actionLoading = useSelector((state) => state.address.actionLoading);
    const addresses = useSelector((state) => state.address.addresses);

    // Edit mode me existing address list se data prefill karo
    const existingAddress = isEditMode
        ? addresses.find((a) => String(a.id) === String(addressId))
        : null;

    const [fullName, setFullName] = useState(existingAddress?.fullName || "");
    const [phone, setPhone] = useState(existingAddress?.phone || "");
    const [addressLine, setAddressLine] = useState(existingAddress?.addressLine || "");
    const [city, setCity] = useState(existingAddress?.city || "");
    const [state, setStateVal] = useState(existingAddress?.state || "");
    const [pincode, setPincode] = useState(existingAddress?.pincode || "");
    const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
    const [latitude, setLatitude] = useState(existingAddress?.latitude ?? null);
    const [longitude, setLongitude] = useState(existingAddress?.longitude ?? null);
    const [locationLoading, setLocationLoading] = useState(false);

    // ----------------------------------------------------------------
    // Current location fetch karo (optional, lat/long ke liye)
    // ----------------------------------------------------------------
    const handleUseCurrentLocation = async () => {
        try {
            setLocationLoading(true);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Location access allow karo current location use karne ke liye"
                );
                return;
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);

            // Reverse geocode se city/state/pincode auto-fill (best effort)
            const [place] = await Location.reverseGeocodeAsync({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });

            if (place) {
                if (place.city) setCity(place.city);
                if (place.region) setStateVal(place.region);
                if (place.postalCode) setPincode(place.postalCode);
                if (place.street || place.name) {
                    setAddressLine((prev) => prev || `${place.name ?? ""} ${place.street ?? ""}`.trim());
                }
            }
        } catch (err) {
            Alert.alert("Error", "Location fetch nahi ho payi, manually address bharo");
        } finally {
            setLocationLoading(false);
        }
    };

    // ----------------------------------------------------------------
    // Validate + Submit
    // ----------------------------------------------------------------
    const handleSubmit = async () => {
        if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
            Alert.alert("Error", "Sabhi fields bharna zaroori hai");
            return;
        }
        if (phone.length !== 10) {
            Alert.alert("Error", "Phone number 10 digit ka hona chahiye");
            return;
        }
        if (pincode.length !== 6) {
            Alert.alert("Error", "Pincode 6 digit ka hona chahiye");
            return;
        }

        const payload = {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            isDefault,
            latitude,
            longitude,
        };

        try {
            if (isEditMode) {
                await dispatch(updateAddress({ id: addressId, payload })).unwrap();
                Alert.alert("Success", "Address update ho gaya");
            } else {
                await dispatch(createAddress(payload)).unwrap();
                Alert.alert("Success", "Address add ho gaya");
            }
            router.back();
        } catch (err) {
            Alert.alert("Error", err || "Kuch galat ho gaya, dobara try karo");
        }
    };

    return (
        <View className="flex-1 bg-gray-50"
            style={{ paddingTop: insets.top }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 flex-1">
                    {isEditMode ? "Edit Address" : "Add New Address"}
                </Text>
            </View>

            {/* 👇 KeyboardAvoidingView + ScrollView ki jagah ye ek hi component
                sab handle karta hai - focused TextInput tak khud scroll karta hai */}
            <KeyboardAwareScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20} // focused field ke upar thoda extra gap
                keyboardOpeningTime={0}
            >
                {/* Use current location */}
                <TouchableOpacity
                    onPress={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="flex-row items-center justify-center gap-2 border border-green-600 rounded-xl py-3 mb-5 bg-green-50"
                    activeOpacity={0.7}
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#16a34a" />
                    ) : (
                        <>
                            <LocateFixed size={16} color="#16a34a" />
                            <Text className="text-[14px] font-semibold text-green-700">
                                Use Current Location
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {latitude && longitude && (
                    <Text className="text-xs text-gray-400 mb-4 text-center">
                        📍 Location captured: {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
                    </Text>
                )}

                {/* Full Name */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">
                    Full Name
                </Text>
                <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Jaise: Mohammad Khan"
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Phone */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">
                    Phone Number
                </Text>
                <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10 digit mobile number"
                    keyboardType="number-pad"
                    maxLength={10}
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Address Line */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">
                    Full Address (House No, Area, Landmark)
                </Text>
                <TextInput
                    value={addressLine}
                    onChangeText={setAddressLine}
                    placeholder="Jaise: 123, MG Road, Near Bus Stand"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                    style={{ minHeight: 80 }}
                />

                {/* City + State (side by side) */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">City</Text>
                        <TextInput
                            value={city}
                            onChangeText={setCity}
                            placeholder="Indore"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 bg-white"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-semibold text-gray-500 mb-1.5">State</Text>
                        <TextInput
                            value={state}
                            onChangeText={setStateVal}
                            placeholder="Madhya Pradesh"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 bg-white"
                        />
                    </View>
                </View>

                {/* Pincode */}
                <Text className="text-xs font-semibold text-gray-500 mb-1.5">
                    Pincode
                </Text>
                <TextInput
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="452001"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-[15px] text-gray-900 bg-white"
                />

                {/* Default toggle */}
                <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
                    <Text className="text-[14px] font-medium text-gray-800">
                        Isko Default Address Banao
                    </Text>
                    <Switch
                        value={isDefault}
                        onValueChange={setIsDefault}
                        trackColor={{ false: "#D1D5DB", true: "#86efac" }}
                        thumbColor={isDefault ? "#16a34a" : "#f4f3f4"}
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={actionLoading}
                    className="bg-green-600 rounded-xl py-3.5 items-center justify-center"
                    activeOpacity={0.8}
                >
                    {actionLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-[15px]">
                            {isEditMode ? "Update Address" : "Save Address"}
                        </Text>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
}