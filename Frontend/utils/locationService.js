// utils/locationService.js
import * as Location from "expo-location";

/**
 * Device ki current location fetch karta hai aur reverse geocode karke
 * city, state, country nikaal ke deta hai.
 *
 * Agar permission deny ho ya koi error aaye, to sab fields null return
 * honge — isliye ye function kabhi bhi throw nahi karega, session-start
 * API call safe rahegi.
 */
export const getCurrentLocationDetails = async () => {
    try {
        // 1) Permission check/request
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            console.warn("Location permission denied by user");
            return {
                latitude: null,
                longitude: null,
                city: null,
                state: null,
                country: null,
            };
        }

        // 2) Current coordinates lo (balanced accuracy — fast + battery friendly)
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = position.coords;

        // 3) Reverse geocode karke city/state/country nikalo
        let city = null;
        let state = null;
        let country = null;

        try {
            const [place] = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (place) {
                city = place.city || place.subregion || null;
                state = place.region || null;
                country = place.country || null;
            }
        } catch (geoErr) {
            console.warn("Reverse geocoding failed:", geoErr);
        }

        return { latitude, longitude, city, state, country };
    } catch (error) {
        console.warn("getCurrentLocationDetails failed:", error);
        return {
            latitude: null,
            longitude: null,
            city: null,
            state: null,
            country: null,
        };
    }
};