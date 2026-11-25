import * as Location from "expo-location";
// ================= OLD CODE (COMMENTED) =================
// import axios from "axios";
// ========================================================
import api from "@/api/api";
import { Platform } from "react-native";

export const checkAppLocation = async (source = "APP_OPEN") => {
    try {
        // Ask permission
        const { status } =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            return {
                success: false,
                permissionDenied: true
            };
        }

        // ================= OLD CODE (COMMENTED) =================
        // const location = await Location.getCurrentPositionAsync({
        //     accuracy: Location.Accuracy.High
        // });
        // const {
        //     latitude,
        //     longitude,
        //     accuracy
        // } = location.coords;
        // const response = await axios.post(
        //     "YOUR_BACKEND_URL/api/location/check",
        //     {
        //         latitude,
        //         longitude,
        //         accuracyMeters: accuracy,
        //         platform: Platform.OS.toUpperCase(),
        //         checkSource: source
        //     },
        //     {
        //         headers: {
        //             Authorization: `Bearer YOUR_AUTH_TOKEN`
        //         }
        //     }
        // );
        // return response.data;
        // ========================================================

        // ================= NEW FIXED CODE =======================
        // Fast location lookup (cached pehle, balanced accuracy fallback)
        let location = await Location.getLastKnownPositionAsync();
        if (!location) {
            location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
        }

        if (!location?.coords?.latitude || !location?.coords?.longitude) {
            return {
                success: false,
                message: "Location coordinates not available"
            };
        }

        const { latitude, longitude, accuracy } = location.coords;

        // api instance handles baseURL aur token automatically
        const response = await api.post("/api/location/check", {
            latitude,
            longitude,
            accuracyMeters: accuracy || null,
            platform: Platform.OS.toUpperCase(),
            checkSource: source
        });

        return response.data;
        // ========================================================
    } catch (error) {
        console.warn("checkAppLocation error:", error?.response?.data || error?.message);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || "Location check failed"
        };
    }
};