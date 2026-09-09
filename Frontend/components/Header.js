
// components/Header.js
import { View, Text, TextInput, Animated, TouchableOpacity, Platform, FlatList, Image, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Search, ArrowLeft, X } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useMemo } from "react";
import { useScrollContext, HEADER_HEIGHT } from "@/context/ScrollContext";
import { useSearchContext } from "@/context/SearchContext";
import { useTabContext } from "@/context/TabContext";
import { Keyboard } from "react-native";
import { trackEvent, triggerScreenExit, getCurrentScreen } from "@/utils/eventTracker";
import { fetchProductsCategory } from "@/redux/slices/productCategory";

export const getAnalyticsScreen = (pathname) => {
    if (/^\/product\/\d+$/.test(pathname)) {
        return "product_detail_page";
    }
    if (/^\/product\/\d+\/\d+$/.test(pathname)) {
        return "product_variant_page";
    }
    if (/^\/category\/\d+$/.test(pathname)) {
        return "category_detail_page";
    }
    if (pathname.startsWith("/wishlist")) {
        return "wishlist_page";
    }
    if (pathname.startsWith("/search")) {
        return "search_page";
    }
    return pathname;
};

const HEADER_CATEGORY_LIMIT = 10;
const CIRCLE_SIZE = 42;
const ADDRESS_BLOCK_HEIGHT = 28;

function HeaderCategoryStrip({ categories, onCategoryPress, onMorePress, progress }) {
    const { width } = useWindowDimensions();
    const itemWidth = (width - 40) / 5;

    const imageContainerHeight = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CIRCLE_SIZE],
        extrapolate: "clamp",
    });
    const imageContainerMarginBottom = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 2],
        extrapolate: "clamp",
    });

    const data = [...categories, { id: "__more__", isMore: true }];

    return (
        <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
                if (item.isMore) {
                    return (
                        <TouchableOpacity
                            onPress={onMorePress}
                            activeOpacity={0.7}
                            style={{ width: itemWidth, alignItems: "center" }}
                        >
                            <Animated.View
                                style={{
                                    width: CIRCLE_SIZE,
                                    height: imageContainerHeight,
                                    marginBottom: imageContainerMarginBottom,
                                    borderRadius: CIRCLE_SIZE / 2,
                                    backgroundColor: "rgba(255,255,255,0.25)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: progress,
                                    overflow: "hidden",
                                }}
                            >
                                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>⋯</Text>
                            </Animated.View>
                            <Text
                                numberOfLines={1}
                                style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}
                            >
                                More
                            </Text>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        onPress={() => onCategoryPress(item)}
                        activeOpacity={0.7}
                        style={{ width: itemWidth, alignItems: "center" }}
                    >
                        <Animated.View
                            style={{
                                width: CIRCLE_SIZE,
                                height: imageContainerHeight,
                                marginBottom: imageContainerMarginBottom,
                                borderRadius: CIRCLE_SIZE / 2,
                                backgroundColor: "#fff",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: progress,
                                overflow: "hidden",
                            }}
                        >
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text style={{ fontSize: 15 }}>📦</Text>
                            )}
                        </Animated.View>

                        <Text
                            numberOfLines={1}
                            style={{ color: "#fff", fontSize: 10, fontWeight: "600", maxWidth: itemWidth }}
                        >
                            {item.productCategoryName}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
}

export default function Header() {
    const { headerHeight, isHidden, showAll, setIsChildMode } = useScrollContext();
    const address = useSelector((state) => state.auth?.user?.address);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const { setActiveIndex } = useTabContext();




    const { text, handleTextChange, handleClear } = useSearchContext();
    const { tree: categoryTree, loading: categoryLoading } = useSelector((state) => state.category);

    useEffect(() => {
        if (!categoryLoading && categoryTree.length === 0) {
            dispatch(fetchProductsCategory());
        }
    }, []);

    const headerCategories = categoryTree.slice(0, HEADER_CATEGORY_LIMIT);

    const backEnabledRoutes = ["/product", "/category", "/login", "/checkout", "/order", "/address", "/profile", "/wishlist", "/legal", "/sell", "/forget", "/help-center", "/search"];
    const isChildScreen = backEnabledRoutes.some((route) => pathname?.includes(route));
    const isBackNaviagte = ["/search"].some((route) => pathname?.includes(route));

    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: isChildScreen ? 1 : 0,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [isChildScreen]);

    // Child screen pe jaate hi header scroll animation band karo aur header reset karo
    useEffect(() => {
        setIsChildMode(isChildScreen);
        if (isChildScreen) {
            // Header ko fully visible reset karo taaki wapas aane par fresh rahe
            showAll();
        }
    }, [isChildScreen]);

    const backOpacity = anim;
    const backTranslateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 0],
    });

    const searchScale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.94],
    });

    // headerHeight (0..HEADER_HEIGHT) se seedha interpolate — JS listener nahi, reliable hai
    // useMemo se stable reference — har render pe naya object nahi banega (FlatList ke liye zaroori)
    const localProgress = useMemo(() => headerHeight.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, 1],
        extrapolate: "clamp",
    }), []);

    const addressHeight = useMemo(() => headerHeight.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, ADDRESS_BLOCK_HEIGHT],
        extrapolate: "clamp",
    }), []);

    // Category container ka marginTop bhi animate karo taaki address ke collapse hone par gap na rahe
    const categoryMarginTop = useMemo(() => headerHeight.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [4, 6],
        extrapolate: "clamp",
    }), []);

    const handleCallEvent = () => {
        triggerScreenExit({
            screen: getCurrentScreen() ? getCurrentScreen() : getAnalyticsScreen(pathname),
            source: "header_back_button",
        });
    };

    const handleCategoryPress = (category) => {
        trackEvent({
            eventType: "CATEGORY_CLICK",
            screen: getCurrentScreen() ? getCurrentScreen() : getAnalyticsScreen(pathname),
            categoryId: category.id,
            source: "header_category_strip",
        });
        triggerScreenExit();
        router.push({
            pathname: "/category/[id]",
            params: {
                id: category.id,
                title: category.productCategoryName,
            },
        });
    };

    const handleMorePress = () => {
        setActiveIndex(1);
        router.push("/");
    };

    return (
        <View
            style={{
                backgroundColor: "#60A5FA",
                paddingHorizontal: 20,
                paddingTop: Platform.OS === "ios" ? 12 : 16,
                paddingBottom: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 6,
                zIndex: 100,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                            handleCallEvent();
                            isBackNaviagte ? router.push("/") : router.back();
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

            {!isChildScreen && (
                <View>
                    <Animated.View
                        style={{
                            height: addressHeight,
                            opacity: localProgress,
                            overflow: "hidden",
                            justifyContent: "center",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                            <MapPin size={14} color="#fff" />
                            <Text
                                numberOfLines={1}
                                style={{ color: "#fff", marginLeft: 6, flex: 1, fontSize: 12 }}
                            >
                                {address || "Apna address select karein"}
                            </Text>
                        </View>
                    </Animated.View>

                    {headerCategories.length > 0 && (
                        <Animated.View style={{ marginTop: categoryMarginTop, marginBottom: 2 }}>
                            <HeaderCategoryStrip
                                categories={headerCategories}
                                onCategoryPress={handleCategoryPress}
                                onMorePress={handleMorePress}
                                progress={localProgress}
                            />
                        </Animated.View>
                    )}
                </View>
            )}
        </View>
    );
}