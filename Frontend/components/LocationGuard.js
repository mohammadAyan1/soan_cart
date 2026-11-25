import React, {
    useEffect,
    useState,
    useRef
} from "react";

import {
    View,
    Text,
    StyleSheet,
    AppState,
    Modal,
    TouchableOpacity
} from "react-native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAppLocation } from "../services/locationService.jsx";

// ================= OLD CODE (COMMENTED) =================
// const LocationGuard = ({ children }) => {
//     const [available, setAvailable] = useState(true);
//     const [distance, setDistance] = useState(null);
//     const [allowedRadius, setAllowedRadius] = useState(5);
//     const [showModal, setShowModal] = useState(false);
//     const isCheckingRef = useRef(false);
//     // 👇 NAYA: User ne agar "Theek hai, Browse karein" click kar diya hai toh session me baar baar pop up na aaye
//     const hasDismissedModalRef = useRef(false);
//
//     // 👇 Login state track karein taaki user login hone par hi check chale
//     const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
//     const userId = useSelector((state) => state.auth?.user?.id);
//     const prevAuthRef = useRef(isLoggedIn);
// ========================================================

// 👇 Global session-level flag jo app minimize / resume hone par bhi reset nahi hota
let isLocationModalDismissedInSession = false;

const LocationGuard = ({ children }) => {
    const [available, setAvailable] = useState(true);
    const [distance, setDistance] = useState(null);
    const [allowedRadius, setAllowedRadius] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const isCheckingRef = useRef(false);

    // 👇 Redux auth state: Login hone par hi verification chalega
    const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
    const userId = useSelector((state) => state.auth?.user?.id);
    const prevAuthRef = useRef(isLoggedIn);

    const verifyLocation = async (source) => {
        // ================= OLD CODE (COMMENTED) =================
        // // Pehle guest user pe bhi chalta tha:
        // // if (isCheckingRef.current) return;
        // ========================================================

        // 👇 USER REQUIREMENT: Jab tak login na ho tab tak modal bilkul na chale
        if (!isLoggedIn) {
            setShowModal(false);
            return;
        }

        // Agar user ne session me ek baar dismiss kar diya hai toh modal wapis na dikhayein
        if (isLocationModalDismissedInSession) {
            return;
        }

        if (isCheckingRef.current) return;
        isCheckingRef.current = true;

        try {
            const response = await checkAppLocation(source);

            if (response && response.success) {
                const isAvailable = Boolean(response.available);
                setAvailable(isAvailable);
                setDistance(response.distanceKm != null ? response.distanceKm : null);
                setAllowedRadius(response.allowedRadiusKm != null ? response.allowedRadiusKm : 5);

                await AsyncStorage.setItem("isOutOfServiceRange", isAvailable ? "false" : "true");

                // Agar service range se bahar hai aur user ne current session me dismiss nahi kiya hai
                if (!isAvailable && !isLocationModalDismissedInSession && isLoggedIn) {
                    setShowModal(true);
                }
            }
        } catch (err) {
            console.warn("LocationGuard verify error:", err?.message);
        } finally {
            isCheckingRef.current = false;
        }
    };

    const previousState = useRef(AppState.currentState);

    useEffect(() => {
        // App open pe sirf tab check karein agar user logged in hai aur session me dismiss nahi kiya
        if (isLoggedIn && !isLocationModalDismissedInSession) {
            verifyLocation("APP_OPEN");
        }

        // Sirf real "background" se "active" hone par check karo, lekin agar dismiss kiya hai toh bilkul mat dikhao
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (previousState.current === "background" && nextState === "active") {
                if (isLoggedIn && !isLocationModalDismissedInSession) {
                    verifyLocation("APP_RESUME");
                }
            }
            previousState.current = nextState;
        });

        return () => {
            subscription.remove();
        };
    }, [isLoggedIn]);

    // 2. 👇 Login hone par check karo (User jaise hi login karta hai tab chalega)
    useEffect(() => {
        if (!prevAuthRef.current && isLoggedIn) {
            // Fresh login par session dismissal reset kar sakte hain taaki login ke baad warning mile
            isLocationModalDismissedInSession = false;
            verifyLocation("LOGIN");
        } else if (prevAuthRef.current && !isLoggedIn) {
            // Logout par reset aur modal band
            isLocationModalDismissedInSession = false;
            setShowModal(false);
        }
        prevAuthRef.current = isLoggedIn;
    }, [isLoggedIn, userId]);

    // ================= OLD CODE (COMMENTED) =================
    // 👇 Purana code jo poori app ko hide karke white screen dikha deta tha:
    // if (loading) {
    //     return (
    //         <View style={styles.center}>
    //             <ActivityIndicator size="large" />
    //             <Text>Checking your location...</Text>
    //         </View>
    //     );
    // }
    // if (error || !available) {
    //     return (
    //         <View style={styles.center}>
    //             <Text style={styles.title}>
    //                 {error || "Out of Service Range"}
    //             </Text>
    //             {distance !== null && (
    //                 <Text>
    //                     Your distance from service center: {distance} KM
    //                 </Text>
    //             )}
    //             <Text style={styles.description}>
    //                 Our service is currently available
    //                 within a 5 KM radius only.
    //             </Text>
    //         </View>
    //     );
    // }
    // return children;
    // ========================================================

    // ================= NEW FIXED MODAL CODE =================
    // App ke children hamesha render honge taaki user browsing kar sake.
    // Agar out-of-range hai toh ek attractive non-blocking popup dialog aayega.
    return (
        <View style={{ flex: 1 }}>
            {children}

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    // ================= OLD CODE (COMMENTED) =================
                    // setShowModal(false)
                    // ========================================================
                    isLocationModalDismissedInSession = true;
                    setShowModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconText}>📍</Text>
                        </View>

                        <Text style={styles.modalTitle}>Delivery Not Available</Text>

                        <Text style={styles.modalSubtitle}>
                            Aap hamari delivery service ke radius se bahar hain.
                        </Text>

                        <View style={styles.infoBox}>
                            {distance !== null && (
                                <Text style={styles.infoText}>
                                    Aapka Distance: <Text style={styles.bold}>{distance} KM</Text>
                                </Text>
                            )}
                            <Text style={styles.infoText}>
                                Delivery Radius: <Text style={styles.bold}>{allowedRadius} KM</Text>
                            </Text>
                        </View>

                        <Text style={styles.modalNote}>
                            Aap app me products browse kar sakte hain, lekin is location par abhi order place nahi ho sakta.
                        </Text>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            activeOpacity={0.8}
                            onPress={() => {
                                // ================= OLD CODE (COMMENTED) =================
                                // hasDismissedModalRef.current = true;
                                // setShowModal(false);
                                // ========================================================
                                isLocationModalDismissedInSession = true;
                                setShowModal(false);
                            }}
                        >
                            <Text style={styles.closeBtnText}>Theek hai, Browse karein</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    iconText: {
        fontSize: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 16,
    },
    infoBox: {
        width: "100%",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
    },
    infoText: {
        fontSize: 13,
        color: "#374151",
        textAlign: "center",
        marginVertical: 2,
    },
    bold: {
        fontWeight: "700",
        color: "#111827",
    },
    modalNote: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 20,
    },
    closeBtn: {
        width: "100%",
        backgroundColor: "#16A34A",
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
    },
    closeBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
});

export default LocationGuard;