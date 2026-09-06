import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const DEVICE_ID_KEY = "app_device_id";

export async function getOrCreateDeviceId() {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

export async function getDeviceHeaders() {
    const deviceId = await getOrCreateDeviceId();
    return {
        "x-device-id": deviceId,
        "x-platform": Platform.OS,
        "x-device-brand": Device.manufacturer || Device.brand || "", // 👈 NAYA
        "x-device-model": Device.modelName || "Unknown Device",
        "x-os-version": Device.osVersion || "",
        "x-app-version": Constants.expoConfig?.version || "1.0.0",
    };
}