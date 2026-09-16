import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceHeaders } from "@/utils/deviceInfo";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "https://soan-cart-backend.onrender.com",
    timeout: 40000,
    headers: {
        "Content-Type": "application/json",
    },
});

// console.log("🚀 ~ API Base URL being used:", api.defaults.baseURL);
// console.log("🚀 ~ From ENV file (EXPO_PUBLIC_API_URL):", process.env.EXPO_PUBLIC_API_URL);

// Request Interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("token");
            const guestId = await AsyncStorage.getItem("guestId");
            const sessionId = await AsyncStorage.getItem("sessionId");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (guestId) {
                config.headers["x-guest-id"] = guestId;
            }

            if (sessionId) {
                config.headers["x-session-id"] = sessionId;
            }

            // 👇 Device headers ko alag try-catch me rakha hai - agar
            // ye kisi bhi wajah se fail ho, toh poori request fail nahi
            // hogi, bas device headers skip ho jayenge
            try {
                const deviceHeaders = await getDeviceHeaders();
                Object.assign(config.headers, deviceHeaders);
            } catch (deviceError) {
                console.warn("Device headers add nahi ho paye:", deviceError?.message);
            }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

export default api;