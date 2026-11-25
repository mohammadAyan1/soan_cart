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

const LocationGuard = ({ children }) => {
    const [available, setAvailable] = useState(true);
    const [distance, setDistance] = useState(null);
    const [allowedRadius, setAllowedRadius] = useState(5);
    const [showModal, setShowModal] = useState(false);
    const isCheckingRef = useRef(false);

    // 👇 Login state track karein taaki user login hone par bhi check chale
    const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
    const userId = useSelector((state) => state.auth?.user?.id);
    const prevAuthRef = useRef(isLoggedIn);

    const verifyLocation = async (source) => {
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

                // Agar service range se bahar hai toh modal open karo
                if (!isAvailable) {
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
        // 1. App open pe check karo
        verifyLocation("APP_OPEN");

        // Sirf real "background" se "active" hone par check karo (inactive loop ko avoid karta hai)
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (previousState.current === "background" && nextState === "active") {
                verifyLocation("APP_RESUME");
            }
            previousState.current = nextState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // 2. 👇 Login hone par check karo (User jab login karega tab chalega)
    useEffect(() => {
        if (!prevAuthRef.current && isLoggedIn) {
            verifyLocation("LOGIN");
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
                onRequestClose={() => setShowModal(false)}
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
                            onPress={() => setShowModal(false)}
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