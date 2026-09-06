
import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    // Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { checkoutCart, checkoutDirect, clearLastOrder } from "@/redux/slices/orderSlice";
import { fetchCart, resetCart } from "@/redux/slices/cartSlice";
import { fetchMyAddresses, createAddress } from "@/redux/slices/addressSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { trackEvent } from "../../../utils/eventTracker";
export default function CheckoutScreen() {
    const dispatch = useDispatch();
    const params = useLocalSearchParams();

    const isDirectCheckout = !!params.productId;

    const { items: cartItems, cartTotal } = useSelector((state) => state.cart);
    const { placing } = useSelector((state) => state.order);

    const addresses = useSelector((state) => state.address.addresses);
    const addressLoading = useSelector((state) => state.address.loading);
    const addressActionLoading = useSelector((state) => state.address.actionLoading);

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");

    const [orderType, setOrderType] = useState("COD");

    const directQuantity = Number(params.quantity) || 1;
    const directPrice = Number(params.price) || 0;
    const directTotal = directPrice * directQuantity;

    useEffect(() => {
        dispatch(fetchMyAddresses({}));
    }, []);


    const handleEventCall = (eventType = "SCREEN_VIEW", payload) => {
        trackEvent({
            eventType,
            screen: "CHECK_OUT_SCREEN",
            ...(payload ? { payload } : {})
        })
    }

    useEffect(() => {
        handleEventCall()
    }, []);

    useEffect(() => {
        if (addresses.length === 0) {
            setShowNewAddressForm(true);
            setSelectedAddressId(null);
            return;
        }

        const stillExists = addresses.some((a) => a.id === selectedAddressId);
        if (!selectedAddressId || !stillExists) {
            const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddress.id);
            setShowNewAddressForm(false);
        }
    }, [addresses]);

    const validateNewAddress = () => {
        if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
            Alert.alert("Error", "Address ki saari fields bharna zaroori hai");
            return false;
        }
        if (phone.length !== 10) {
            Alert.alert("Error", "Phone number 10 digit ka hona chahiye");
            return false;
        }
        if (pincode.length !== 6) {
            Alert.alert("Error", "Pincode 6 digit ka hona chahiye");
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        let addressData = null;

        try {
            if (showNewAddressForm) {
                if (!validateNewAddress()) return;

                const payload = {
                    fullName,
                    phone,
                    addressLine,
                    city,
                    state,
                    pincode,
                    isDefault: true,
                };

                const newAddress = await dispatch(createAddress(payload)).unwrap();

                addressData = {
                    fullName: newAddress.fullName,
                    phone: newAddress.phone,
                    addressLine: newAddress.addressLine,
                    city: newAddress.city,
                    state: newAddress.state,
                    pincode: newAddress.pincode,
                    orderType,
                };

                dispatch(fetchMyAddresses({}));
                setSelectedAddressId(newAddress.id);
                setShowNewAddressForm(false);
            } else {
                const selected = addresses.find((a) => a.id === selectedAddressId);
                if (!selected) {
                    Alert.alert("Error", "Pehle delivery address select karo");
                    return;
                }

                addressData = {
                    fullName: selected.fullName,
                    phone: selected.phone,
                    addressLine: selected.addressLine,
                    city: selected.city,
                    state: selected.state,
                    pincode: selected.pincode,
                    orderType,
                };
            }

            if (isDirectCheckout) {
                await dispatch(
                    checkoutDirect({
                        productId: Number(params.productId),
                        variantId: Number(params.variantId),
                        quantity: directQuantity,
                        ...addressData,
                    })
                ).unwrap();

                handleEventCall("HANDLE_CHECK_OUT_FROM_DETAILS_PAGE", {
                    productId: Number(params.productId),
                    variantId: Number(params.variantId),
                })
            } else {
                await dispatch(checkoutCart(addressData)).unwrap();
                dispatch(resetCart());
                dispatch(fetchCart());
                handleEventCall("HANDLE_CHECK_OUT_FROM_CART_PAGE")
            }

            Alert.alert("Success 🎉", "Aapka order successfully place ho gaya!", [
                {
                    text: "OK",
                    onPress: () => {
                        dispatch(clearLastOrder());
                        router.replace("/(root)/(tabs)");
                    },
                },
            ]);
        } catch (err) {
            Alert.alert("Order Failed", err || "Kuch galat ho gaya, dobara try karo");
        }
    };

    const isPlacing = placing || addressActionLoading;

    return (
        <View className="flex-1 bg-gray-50">
            {/* 👇 Yahan bhi KeyboardAvoidingView + ScrollView ki jagah
                KeyboardAwareScrollView - focused field tak auto scroll karega */}
            <KeyboardAwareScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={20}
                keyboardOpeningTime={0}
            >
                <Text className="text-2xl font-bold text-gray-900 mb-4">Checkout</Text>

                {/* ---------- Order Summary ---------- */}
                <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                    <Text className="text-sm font-semibold text-gray-500 mb-3">Order Summary</Text>

                    {isDirectCheckout ? (
                        <View className="flex-row items-center">
                            {/* <Image
                                source={{ uri: params.productImage }}
                                className="w-16 h-16 rounded-xl bg-gray-100"
                            /> */}

                            <Image
                                source={params.productImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                className="w-16 h-16 rounded-xl bg-gray-100"
                            />
                            <View className="flex-1 ml-3">
                                <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={2}>
                                    {params.productName}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-1">Qty: {directQuantity}</Text>
                            </View>
                            <Text className="text-[15px] font-bold text-gray-900">₹{directTotal}</Text>
                        </View>
                    ) : (
                        <>
                            {cartItems.map((item) => (
                                <View
                                    key={item.cartItemId || item.id}
                                    className="flex-row items-center justify-between mb-2"
                                >
                                    <Text className="text-[13px] text-gray-700 flex-1" numberOfLines={1}>
                                        {item.productName} × {item.quantity}
                                    </Text>
                                    <Text className="text-[13px] font-semibold text-gray-900">
                                        ₹{item.totalPrice}
                                    </Text>
                                </View>
                            ))}
                            <View className="h-[1px] bg-gray-100 my-2" />
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-bold text-gray-900">Total</Text>
                                <Text className="text-base font-bold text-gray-900">{cartTotal}</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* ---------- Delivery Address ---------- */}
                <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-gray-500">Delivery Address</Text>

                        {addresses.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setShowNewAddressForm((prev) => !prev)}
                                className="flex-row items-center gap-1"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={showNewAddressForm ? "list-outline" : "add-circle-outline"}
                                    size={16}
                                    color="#16a34a"
                                />
                                <Text className="text-[13px] font-semibold text-green-700">
                                    {showNewAddressForm ? "Use Saved Address" : "Add New Address"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {addressLoading && addresses.length === 0 ? (
                        <ActivityIndicator color="#16a34a" style={{ marginVertical: 12 }} />
                    ) : !showNewAddressForm ? (
                        <View>
                            {addresses.map((address) => {
                                const isSelected = address.id === selectedAddressId;
                                return (
                                    <TouchableOpacity
                                        key={address.id}
                                        onPress={() => setSelectedAddressId(address.id)}
                                        activeOpacity={0.7}
                                        className={`flex-row border rounded-xl p-3 mb-2 ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                                            }`}
                                    >
                                        <Ionicons
                                            name={isSelected ? "radio-button-on" : "radio-button-off"}
                                            size={18}
                                            color={isSelected ? "#16a34a" : "#9CA3AF"}
                                            style={{ marginRight: 10, marginTop: 2 }}
                                        />
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2">
                                                <Text className="text-[14px] font-bold text-gray-900">
                                                    {address.fullName}
                                                </Text>
                                                {address.isDefault && (
                                                    <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                                        <Text className="text-[10px] font-semibold text-green-700">
                                                            DEFAULT
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-xs text-gray-500 mt-0.5">{address.phone}</Text>
                                            <Text className="text-[13px] text-gray-700 mt-1 leading-5">
                                                {address.addressLine}, {address.city}, {address.state} -{" "}
                                                {address.pincode}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View>
                            <Text className="text-xs font-semibold text-gray-500 mb-1.5">Full Name</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Apna naam likho"
                                className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-[15px] text-gray-900"
                            />

                            <Text className="text-xs font-semibold text-gray-500 mb-1.5">Phone Number</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="10 digit number"
                                keyboardType="number-pad"
                                maxLength={10}
                                className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-[15px] text-gray-900"
                            />

                            <Text className="text-xs font-semibold text-gray-500 mb-1.5">Address Line</Text>
                            <TextInput
                                value={addressLine}
                                onChangeText={setAddressLine}
                                placeholder="House no, street, area"
                                className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-[15px] text-gray-900"
                            />

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-xs font-semibold text-gray-500 mb-1.5">City</Text>
                                    <TextInput
                                        value={city}
                                        onChangeText={setCity}
                                        placeholder="City"
                                        className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-[15px] text-gray-900"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-semibold text-gray-500 mb-1.5">State</Text>
                                    <TextInput
                                        value={state}
                                        onChangeText={setState}
                                        placeholder="State"
                                        className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-[15px] text-gray-900"
                                    />
                                </View>
                            </View>

                            <Text className="text-xs font-semibold text-gray-500 mb-1.5">Pincode</Text>
                            <TextInput
                                value={pincode}
                                onChangeText={setPincode}
                                placeholder="6 digit pincode"
                                keyboardType="number-pad"
                                maxLength={6}
                                className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900"
                            />

                            <Text className="text-[11px] text-gray-400 mt-2">
                                Ye address save hoke automatically default aur checkout ke liye select ho jayega.
                            </Text>
                        </View>
                    )}
                </View>

                {/* ---------- Payment Method ---------- */}
                <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
                    <Text className="text-sm font-semibold text-gray-500 mb-3">Payment Method</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setOrderType("COD")}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${orderType === "COD" ? "bg-green-50 border-green-500" : "border-gray-200"
                                }`}
                        >
                            {orderType === "COD" && (
                                <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginRight: 6 }} />
                            )}
                            <Text className={`text-[13px] font-semibold ${orderType === "COD" ? "text-green-700" : "text-gray-700"}`}>
                                Cash on Delivery
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setOrderType("ONLINE")}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${orderType === "ONLINE" ? "bg-green-50 border-green-500" : "border-gray-200"
                                }`}
                        >
                            {orderType === "ONLINE" && (
                                <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginRight: 6 }} />
                            )}
                            <Text className={`text-[13px] font-semibold ${orderType === "ONLINE" ? "text-green-700" : "text-gray-700"}`}>
                                Pay Online
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ---------- Place Order ---------- */}
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={isPlacing}
                    className="bg-green-600 rounded-xl py-4 items-center justify-center"
                    activeOpacity={0.85}
                >
                    {isPlacing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-[15px]">
                            {showNewAddressForm ? "Save Address & Place Order" : "Place Order"}
                        </Text>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
}