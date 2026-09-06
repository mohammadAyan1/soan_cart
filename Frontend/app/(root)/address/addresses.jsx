

import { useEffect, useCallback, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { MapPin, Plus, Pencil, Trash2, ChevronLeft, Star } from "lucide-react-native";
import { fetchMyAddresses, deleteAddress } from "@/redux/slices/addressSlice";
import AddressSkeleton from "@/components/skeleton/AddressSkeleton";

// ==========================================================
// SAVED ADDRESSES SCREEN
// Route: /profile/addresses
// ==========================================================
export default function AddressesScreen() {
    const dispatch = useDispatch();

    const addresses = useSelector((state) => state.address.addresses);
    const loading = useSelector((state) => state.address.loading);
    const refreshing = useSelector((state) => state.address.refreshing);
    const actionLoading = useSelector((state) => state.address.actionLoading);

    // Track kaunsa address delete ho raha hai (uska hi loader dikhane ke liye)
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        dispatch(fetchMyAddresses({}));
    }, []);

    const onRefresh = useCallback(() => {
        dispatch(fetchMyAddresses({ isRefresh: true }));
    }, []);

    const handleAddNew = () => {
        router.push("/(root)/address/address-form");
    };

    const handleEdit = (address) => {
        router.push({
            pathname: "/(root)/address/address-form",
            params: { mode: "edit", addressId: address.id },
        });
    };

    const handleDelete = (address) => {
        Alert.alert(
            "Address Delete Karein?",
            `${address.fullName} ka ye address delete karna chahte ho?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeletingId(address.id);
                            await dispatch(deleteAddress(address.id)).unwrap();
                        } catch (err) {
                            Alert.alert("Error", err || "Delete nahi ho paya, dobara try karo");
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    // ----------------------------------------------------------------
    // Empty state
    // ----------------------------------------------------------------
    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center px-8" style={{ paddingTop: 100 }}>
            <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-4">
                <MapPin size={32} color="#16a34a" strokeWidth={2} />
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-1">
                Koi Address Save Nahi Hai
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
                Apna pehla delivery address add karo, taaki checkout aasan ho jaye
            </Text>
            <TouchableOpacity
                onPress={handleAddNew}
                className="bg-green-600 rounded-xl px-6 py-3 flex-row items-center gap-2"
                activeOpacity={0.8}
            >
                <Plus size={18} color="#fff" />
                <Text className="text-white font-semibold text-[14px]">Add New Address</Text>
            </TouchableOpacity>
        </View>
    );

    // ----------------------------------------------------------------
    // Address card
    // ----------------------------------------------------------------
    const AddressCard = ({ address }) => {
        const isDeletingThis = deletingId === address.id;

        return (
            <View
                className="bg-white mx-4 mb-3 rounded-xl p-4"
                style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                    opacity: isDeletingThis ? 0.5 : 1,
                }}
            >
                {/* Top row: name + default badge */}
                <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-[15px] font-bold text-gray-900" numberOfLines={1}>
                            {address.fullName}
                        </Text>
                        {address.isDefault && (
                            <View className="flex-row items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                <Star size={10} color="#16a34a" fill="#16a34a" />
                                <Text className="text-[10px] font-semibold text-green-700">
                                    DEFAULT
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text className="text-sm text-gray-500 mb-2">{address.phone}</Text>

                <Text className="text-[13px] text-gray-700 leading-5">
                    {address.addressLine}, {address.city}, {address.state} -{" "}
                    {address.pincode}
                </Text>

                {/* Actions */}
                <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => handleEdit(address)}
                        disabled={isDeletingThis}
                        className="flex-row items-center gap-1.5 flex-1 justify-center py-2 rounded-lg bg-gray-50"
                        activeOpacity={0.7}
                    >
                        <Pencil size={14} color="#374151" />
                        <Text className="text-[13px] font-medium text-gray-700">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleDelete(address)}
                        disabled={isDeletingThis}
                        className="flex-row items-center gap-1.5 flex-1 justify-center py-2 rounded-lg bg-red-50"
                        activeOpacity={0.7}
                    >
                        {isDeletingThis ? (
                            <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                            <>
                                <Trash2 size={14} color="#dc2626" />
                                <Text className="text-[13px] font-medium text-red-600">
                                    Delete
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const isInitialLoading = loading && !refreshing && addresses.length === 0;

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <Stack.Screen options={{ headerShown: false }} />
            <View className="bg-white px-4 pt-6 pb-4 flex-row items-center gap-3 border-b border-gray-100">
                {/* <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 flex-1">
                    Saved Addresses
                </Text> */}
                {addresses.length > 0 && (
                    <TouchableOpacity
                        onPress={handleAddNew}
                        className="w-9 h-9 rounded-full bg-green-50 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Plus size={18} color="#16a34a" />
                    </TouchableOpacity>
                )}
            </View>

            {isInitialLoading ? (
                <AddressSkeleton />
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#16a34a"]}
                        />
                    }
                >
                    {addresses.length === 0
                        ? renderEmpty()
                        : addresses.map((address) => (
                            <AddressCard key={address.id} address={address} />
                        ))}
                </ScrollView>
            )}
        </View>
    );
}