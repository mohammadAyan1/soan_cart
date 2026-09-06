// app/(root)/(tabs)/_layout.js
import { useRef, useEffect, useCallback } from "react";
import { useWindowDimensions, View, ActivityIndicator } from "react-native";
import { TabView } from "react-native-tab-view";
import { House, Grid2X2, Heart, ShoppingCart, User } from "lucide-react-native";
import CustomTabBar from "@/components/CustomTabBar";
import { ScrollProvider } from "@/context/ScrollContext";
import { TabProvider, useTabContext } from "@/context/TabContext";
import { trackEvent, triggerScreenExit, getCurrentScreen } from "@/utils/eventTracker";
import { useFocusEffect } from "@react-navigation/native";

import HomeScreen from "./index";
import CategoriesScreen from "./categories";
import WishlistScreen from "./wishlist";
import CartScreen from "./cart";
import ProfileScreen from "./profile";

const routes = [
    { key: "index", title: "Home", icon: House, screenName: "home_page" },
    { key: "categories", title: "Categories", icon: Grid2X2, screenName: "categories_page" },
    { key: "wishlist", title: "Wishlist", icon: Heart, screenName: "wishlist_page" },
    { key: "cart", title: "Cart", icon: ShoppingCart, screenName: "cart_page" },
    { key: "profile", title: "Profile", icon: User, screenName: "profile_page" },
];

const renderScene = ({ route }) => {
    switch (route.key) {
        case "index": return <HomeScreen />;
        case "categories": return <CategoriesScreen />;
        case "wishlist": return <WishlistScreen />;
        case "cart": return <CartScreen />;
        case "profile": return <ProfileScreen />;
        default: return null;
    }
};

function TabsContent() {
    const layout = useWindowDimensions();
    const { activeIndex, setActiveIndex } = useTabContext();

    const previousIndexRef = useRef(null);

    // 👇 NAYA - useFocusEffect ke stable callback ke andar latest tab jaanne ke liye
    const activeIndexRef = useRef(activeIndex);
    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    // 👇 NAYA - pehla mount skip karne ke liye (warna "app_launch" SCREEN_VIEW
    // ke turant baad ek aur duplicate SCREEN_VIEW chala jayega)
    const isInitialFocusRef = useRef(true);

    useEffect(() => {
        const currentRoute = routes[activeIndex];
        const previousRoute =
            previousIndexRef.current !== null ? routes[previousIndexRef.current] : null;

        if (previousIndexRef.current !== null && previousIndexRef.current !== activeIndex) {
            triggerScreenExit();
        }

        trackEvent({
            eventType: "SCREEN_VIEW",
            screen: currentRoute.screenName,
            referrerScreen: previousRoute?.screenName ?? null,
            source: previousRoute ? "tab_bar_switch" : "app_launch",
        });

        previousIndexRef.current = activeIndex;
    }, [activeIndex]);



    useFocusEffect(
        useCallback(() => {
            if (isInitialFocusRef.current) {
                isInitialFocusRef.current = false;
            } else {
                const currentRoute = routes[activeIndexRef.current];
                const referrer = getCurrentScreen(); // 👈 NAYA - naya SCREEN_VIEW call hone se PEHLE capture karo (abhi bhi "product_detail_page" hai)

                trackEvent({
                    eventType: "SCREEN_VIEW",
                    screen: currentRoute.screenName,
                    referrerScreen: referrer, // 👈 explicitly bhej diya
                    source: "back_navigation",
                });
            }

            //         return () => {
            //             triggerScreenExit();
            //         };
            //     }, [])
            // );


            // 👇 YAHAN CHANGE KAREIN - Naya Return statement 👇
            return () => {
                const currentRoute = routes[activeIndexRef.current];
                // Check lagaya: agar hum sach me isi tab par hain, tabhi timer null karo
                if (getCurrentScreen() === currentRoute.screenName) {
                    triggerScreenExit();
                }
            };
            // 👆 YAHAN TAK 👆

        }, [])
    );

    return (
        <View className="flex-1 bg-white">
            <TabView
                navigationState={{ index: activeIndex, routes }}
                renderScene={renderScene}
                onIndexChange={setActiveIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={() => null}
                swipeEnabled={false}
                lazy
                renderLazyPlaceholder={() => (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="small" color="#16a34a" />
                    </View>
                )}
                lazyPreloadDistance={0}
            />
            <CustomTabBar
                routes={routes}
                activeIndex={activeIndex}
                onTabPress={setActiveIndex}
            />
        </View>
    );
}

export default function TabsLayout() {
    return (
        <TabProvider>
            <ScrollProvider>
                <TabsContent />
            </ScrollProvider>
        </TabProvider>
    );
}