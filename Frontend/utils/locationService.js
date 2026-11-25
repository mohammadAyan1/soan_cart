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
            
            return {
                latitude: null,
                longitude: null,
                city: null,
                state: null,
                country: null,
            };
        }

        // 2) Current coordinates lo (balanced accuracy — fast + battery friendly)
        // ================= OLD CODE (COMMENTED) =================
        // const position = await Location.getCurrentPositionAsync({
        //     accuracy: Location.Accuracy.Balanced,
        // });
        // const { latitude, longitude } = position.coords;
        // ========================================================

        // ================= NEW SAFE CODE ========================
        // Pehle fast cached location try karo, nahi toh balanced accuracy
        let position = await Location.getLastKnownPositionAsync();
        if (!position) {
            position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
        }
        const latitude = position?.coords?.latitude ? Number(position.coords.latitude) : null;
        const longitude = position?.coords?.longitude ? Number(position.coords.longitude) : null;

        if (!latitude || !longitude) {
            return { latitude: null, longitude: null, city: null, state: null, country: null };
        }
        // ========================================================

        // 3) Reverse geocode karke city/state/country nikalo
        let city = null;
        let state = null;
        let country = null;

        // ================= OLD CODE (COMMENTED) =================
        // try {
        //     const [place] = await Location.reverseGeocodeAsync({
        //         latitude,
        //         longitude,
        //     });
        //     if (place) {
        //         city = place.city || place.subregion || null;
        //         state = place.region || null;
        //         country = place.country || null;
        //     }
        // } catch (geoErr) {
        // }
        // ========================================================

        // ================= NEW FIXED CODE =======================
        try {
            const places = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (places && places.length > 0) {
                const place = places[0];
                // 👇 India me city aksar district ya subregion me hoti hai
                city = place.city || place.district || place.subregion || null;
                state = place.region || place.subregion || null;
                country = place.country || null;
            }
        } catch (geoErr) {
            // Native geocoder Android par timeout/grpc failed de sakta hai
        }

        // 👇 Native geocoder fail ho jaye ya null de, toh fast HTTP fallback
        if (!city || !country) {
            try {
                const res = await fetch(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const data = await res.json();
                if (data) {
                    city = city || data.city || data.locality || data.principalSubdivision;
                    state = state || data.principalSubdivision;
                    country = country || data.countryName;
                }
            } catch (fallbackErr) {
                // Fallback error
            }
        }
        // ========================================================

        return { latitude, longitude, city, state, country };
    } catch (error) {
        
        return {
            latitude: null,
            longitude: null,
            city: null,
            state: null,
            country: null,
        };
    }
};