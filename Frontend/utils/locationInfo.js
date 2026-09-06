import * as Location from "expo-location";

// Login ke time ek baar call hota hai - device ka GPS location leke
// city/state/country nikalta hai. IP-based geoip se zyada reliable
// hai, especially dev/testing ke time jab dono devices same WiFi pe ho
export async function getLocationHeaders() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            return {}; // Permission nahi mili - backend IP-fallback try karega
        }

        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const [place] = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });

        if (!place) return {};

        return {
            "x-loc-city": place.city || "",
            "x-loc-region": place.region || "",
            "x-loc-country": place.country || "",
        };
    } catch (err) {
        // Location fail ho toh login block mat karo, bas headers skip karo
        return {};
    }
}