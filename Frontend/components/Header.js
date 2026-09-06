

// components/Header.js
import { View, Text, TextInput, Animated, TouchableOpacity, Platform } from "react-native";
import { useSelector } from "react-redux";
import { MapPin, Search, ArrowLeft, X } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useScrollContext, HEADER_HEIGHT } from "@/context/ScrollContext";
import { useSearchContext } from "@/context/SearchContext";
import { Keyboard } from "react-native";
import { triggerScreenExit } from "@/utils/eventTracker";

import { getCurrentScreen } from "@/utils/eventTracker";

export const getAnalyticsScreen = (pathname) => {

    if (/^\/product\/\d+$/.test(pathname)) {
        return "product_detail_page";
    }

    if (/^\/product\/\d+\/\d+$/.test(pathname)) {
        return "product_variant_page";
    }

    if (pathname.startsWith("/wishlist")) {
        return "wishlist_page";
    }

    if (pathname.startsWith("/search")) {
        return "search_page";
    }

    return pathname;
};


export default function Header() {
    const { headerHeight } = useScrollContext();
    const address = useSelector((state) => state.auth?.user?.address);
    const pathname = usePathname();
    const router = useRouter();


    // let refference = getCurrentScreen()


    const { text, handleTextChange, handleClear } = useSearchContext();


    // const isChildScreen = pathname?.includes("/product");



    // 👇 in routes pe search box ki jagah back button dikhega (login form + product detail)
    const backEnabledRoutes = ["/product", "/login", "/checkout", "/order", "/address", "/profile", "/wishlist", "/legal", "/sell", "/forget", "/help-center", "/search"];
    const isChildScreen = backEnabledRoutes.some((route) => pathname?.includes(route));
    const isBackNaviagte = ["/search"].some((route) => pathname?.includes(route));


    // 👇 sirf opacity + scale animate hoga -> native driver use hoga -> buttery smooth
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: isChildScreen ? 1 : 0,
            duration: 220,
            useNativeDriver: true, // 👈 yahi fix hai jankiness ka
        }).start();
    }, [isChildScreen]);

    const opacity = headerHeight.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    // back circle: opacity 0->1 + thoda scale/slide, sab native driver pe
    const backOpacity = anim;
    const backTranslateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
    });

    // search box: sirf scale se "chota" feel dena hai, layout property nahi chedni
    const searchScale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.94],
    });



    // Header.js
    const handleCallEvent = () => {

        triggerScreenExit({
            screen: getCurrentScreen() ? getCurrentScreen() : getAnalyticsScreen(pathname), //tumhara apna logic, jaisa pehle tha
            source: "header_back_button",
        });
    }

    return (
        <View
            style={{
                backgroundColor: "#60A5FA",
                paddingHorizontal: 20,
                paddingTop: Platform.OS === "ios" ? 12 : 16,
                paddingBottom: 14,
                // borderBottomLeftRadius: 18,
                // borderBottomRightRadius: 18,
                // 👇 shadow taki content se chipka hua na lage
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>

                {/* Back button - hamesha mounted rehta hai, sirf opacity/scale se hide-show hota hai
                    isse "stuck touch" wala bug nahi aata jo width:0 se aata tha */}
                <Animated.View
                    pointerEvents={isChildScreen ? "auto" : "none"}
                    style={{
                        opacity: backOpacity,
                        transform: [{ translateX: backTranslateX }],
                        width: isChildScreen ? 36 : 0,
                        marginRight: isChildScreen ? 8 : 0,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            handleClear();

                            handleCallEvent()

                            isBackNaviagte
                                ? router.push("/")
                                : router.back();

                            Keyboard.dismiss();
                        }}

                        activeOpacity={0.7}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "rgba(255,255,255,0.2)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowLeft size={18} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Search box - scale se compact feel, transform hone se GPU pe smooth chalta hai */}
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ scale: searchScale }],
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            // paddingVertical: 10,
                        }}
                    >
                        <Search size={17} color="#9CA3AF" />
                        <TextInput
                            value={text}
                            onChangeText={handleTextChange}
                            placeholder="Search products..."
                            placeholderTextColor="#9CA3AF"

                            onFocus={
                                !isChildScreen
                                    ? () => {
                                        router.push("/search");
                                    }
                                    : undefined
                            }
                            style={{ marginLeft: 8, flex: 1, fontSize: 14 }}
                        />

                        {text.length > 0 && (
                            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <X size={17} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>

            {/* Address - child screen pe poora hide */}
            {
                !isChildScreen && (
                    <Animated.View
                        style={{
                            height: headerHeight,
                            opacity,
                            overflow: "hidden",
                            justifyContent: "center",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                            <MapPin size={16} color="#fff" />
                            <Text
                                numberOfLines={1}
                                style={{ color: "#fff", marginLeft: 6, flex: 1, fontSize: 13 }}
                            >
                                {address || "Apna address select karein"}
                            </Text>
                        </View>
                    </Animated.View>
                )
            }
        </View >
    );
}