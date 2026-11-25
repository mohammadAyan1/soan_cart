


// app/_layout.js
import { useEffect, useState, useCallback, useRef } from "react";
import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { View, AppState } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device"; // agar nahi installed hai to: npx expo install expo-device
import Header from "@/components/Header";
import { store } from "../redux/store.js";
import { ScrollProvider } from "@/context/ScrollContext";
import { TabProvider, useTabContext } from "@/context/TabContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SearchProvider } from "../context/SearchContext";
import { initEventTracker, resetEventTracker, flushEvents } from "@/utils/eventTracker";
import axiosInstance from "@/api/api"; // apna existing axios instance
import useBackTracker from "@/hooks/useBackTracker";
import { registerForPushNotificationsAsync } from "../utils/notificationService"
import { registerPushToken } from "@/redux/slices/authSlice";
import { useDispatch } from 'react-redux';
import { setupImageNotificationListener } from '../utils/notificationListener'
import AnimatedSplashScreen from "../components/AnimatedSplashScreen"
import * as SplashScreen from 'expo-splash-screen';
import { usePathname, router } from "expo-router";
import { getCurrentLocationDetails } from "@/utils/locationService"
import LocationGuard from "@/components/LocationGuard";
import { Alert } from "react-native";
import { setOnUnauthorizedCallback } from "@/api/api";
import { forceLogout, fetchUserProfile, loadAuthFromStorage } from "@/redux/slices/authSlice";


SplashScreen.preventAutoHideAsync();

// 👇 Ye component ab TabProvider ke ANDAR render hoga, isliye useTabContext()
// yaha safely call ho sakta hai. Splash + Stack dono isi ke andar hain.
function AppContent() {
  const { activeIndex } = useTabContext();
  const [appIsReady, setAppIsReady] = useState(false);
  const [customAnimationDone, setCustomAnimationDone] = useState(false);
  const pathname = usePathname();

  // 👇 AppState ka pichla value track karne ke liye
  const appStateRef = useRef(AppState.currentState);
  // 👇 NAYA: setupAnalytics ko ek hi waqt pe multiple baar chalne se rokne ke liye guard
  const isSettingUpRef = useRef(false);

  const backEnabledRoutes = ["/product", "/search", "/category"];
  const isChildScreen = backEnabledRoutes.some((route) => pathname?.includes(route));




  useBackTracker();

  const dispatch = useDispatch();

  // 👇 setupAnalytics ko useCallback mein rakha taaki mount pe bhi chale
  // aur reopen pe bhi - code duplicate nahi karna pada
  const setupAnalytics = useCallback(async () => {
    // 👇 NAYA: Agar analytics pehle se chal raha hai toh dobara mat chalao (Loop protection)
    if (isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = `${Device.osName}_${Device.modelName}_${Date.now()}`;
        await AsyncStorage.setItem("deviceId", deviceId);
      }

      // 👇 TEMP DEBUG - location fetch ko temporarily disable kiya hai
      // taaki confirm kar sakein ki ye hi AppState loop ka culprit hai ya nahi
      const { latitude, longitude, city, state, country } =
        await getCurrentLocationDetails();
      // const latitude = null, longitude = null, city = null, state = null, country = null;



      const response = await axiosInstance.post("/api/analytics/session/start", {
        deviceId,
        platform: Device.osName === "iOS" ? "IOS" : "ANDROID", // web ke liye "WEB"
        appVersion: "1.0.0", // apna actual app version daalo
        deviceModel: Device.modelName || "Unknown Device",
        osVersion: Device.osVersion || null,
        country,
        state,
        city,
        latitude,
        longitude,
      });



      const sessionId = response.data?.data?.sessionId;

      await AsyncStorage.setItem("guestId", response.data?.data?.guestId);


      if (sessionId) {
        initEventTracker(sessionId); // 👈 YEHI SABSE ZAROORI LINE HAI
      }
    } catch (error) {

    } finally {
      isSettingUpRef.current = false; // 👈 Lock release
      setAppIsReady(true);
    }
  }, []);

  // 👇 App khulte hi ek baar analytics session start karo aur
  // event tracker ko sessionId de do - isse pehle koi bhi event kaam
  // nahi karega
  useEffect(() => {
    let alertActive = false;
    setOnUnauthorizedCallback((reason) => {
      dispatch(forceLogout());
      if (reason && !alertActive) {
        alertActive = true;
        Alert.alert("Session Expired", reason, [
          {
            text: "OK",
            onPress: () => {
              alertActive = false;
            },
          },
        ]);
      }
      router.replace("/(root)/login");
    });

    dispatch(loadAuthFromStorage());
    setupImageNotificationListener();

    const setupPushNotifications = async () => {
      // Guest users ke liye save-push-token call nahi karna
      const userToken = await AsyncStorage.getItem("token");
      if (!userToken) return;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        try {
          await dispatch(registerPushToken(token)).unwrap();
        } catch (err) {

        }
      }
    };
    setupPushNotifications();

    setupAnalytics();
  }, [setupAnalytics, dispatch]);

  // 👇 FIXED (v2) - NO debounce ab. Android background me JS engine
  // suspend ho jaata hai, isliye resume hone par "background" aur "active"
  // dono events ek saath back-to-back deliver hote hain (real-world
  // seconds ka gap irrelevant hai) - isliye setTimeout-based debounce
  // events ko cancel kar deta tha aur "close"/"reopen" kabhi print hi
  // nahi hota tha. Ab har event turant, synchronously process hota hai,
  // aur `appStateRef` turant update hota hai taaki agla event turant
  // sahi prevState se compare ho sake.
  //
  // IMPORTANT: reopen pe `setAppIsReady(false)` NAHI karte - wahi
  // cheez splash/animation ko remount kar rahi thi, jiski wajah se
  // AppState khud "inactive"/"background" fire kar raha tha aur
  // pehle infinite loop ban raha tha.
  useEffect(() => {


    const handleAppStateChange = async (nextState) => {


      const prevState = appStateRef.current;
      // 👇 turant update karo - agla event (jo milliseconds baad hi
      // aa sakta hai) isi updated value se compare hoga
      appStateRef.current = nextState;

      if (prevState === nextState) return; // real change nahi hai, skip

      // ================= OLD CODE (COMMENTED) =================
      // 👇 Purana code jo "inactive" pe bhi chalta tha aur Android me loop banata tha:
      // if (
      //   prevState === "active" &&
      //   (nextState === "background" || nextState === "inactive")
      // ) {
      //   flushEvents();
      //   resetEventTracker(); // sessionId, queue, currentScreen sab reset
      // } else if (
      //   (prevState === "background" || prevState === "inactive") &&
      //   nextState === "active"
      // ) {
      //   // 👇 setAppIsReady(false) jaan-bujh kar NAHI kiya
      //   setupAnalytics();
      //   // Foreground me aane par check karo ki session abhi bhi active hai ya nahi
      //   AsyncStorage.getItem("token").then((token) => {
      //     if (token) {
      //       dispatch(fetchUserProfile({}));
      //     }
      //   });
      // }
      // ========================================================

      // ================= NEW FIXED CODE =======================
      // 👇 NAYA CODE: Android me sirf "background" ko app-minimize maanein.
      // "inactive" state temporary system dialog (jaise location popup) ke waqt aati hai,
      // usse app-exit ya re-open na maanein taaki loop na bane.
      if (prevState === "active" && nextState === "background") {
        flushEvents();
        resetEventTracker(); // sessionId, queue, currentScreen sab reset
      } else if (prevState === "background" && nextState === "active") {
        setupAnalytics();

        // Foreground me aane par check karo ki session abhi bhi active hai ya nahi
        AsyncStorage.getItem("token").then((token) => {
          if (token) {
            dispatch(fetchUserProfile({}));
          }
        });
      }
      // ========================================================
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [setupAnalytics]);


  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // native splash hata do, apna custom animated splash dikhna shuru ho jayega
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!appIsReady || !customAnimationDone) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => setCustomAnimationDone(true)}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#fff" }}
        edges={[]}
      >
        <StatusBar
          style={activeIndex > 1 ? isChildScreen ? "light" : "dark" : isChildScreen ? "dark" : "light"}
          backgroundColor="transparent"
          translucent={true}
        />

        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(root)/(tabs)" />
            <Stack.Screen name="(root)/product/[id]" />
            <Stack.Screen name="(root)/product/[id]/[varid]" />
            <Stack.Screen name="(root)/product/product-list" />
            <Stack.Screen name="(root)/address/addresses" />
            <Stack.Screen name="(root)/address/address-form" />
            <Stack.Screen name="(root)/orders/[id]" />
            <Stack.Screen name="(root)/orders/index" />
          </Stack>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// 👇 Ye outer component sirf providers set karta hai - koi useTabContext()
// call nahi karta, isliye order ki koi problem nahi
// ================= OLD CODE (COMMENTED) =================
// function RootLayoutContent() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <TabProvider>
//         <ScrollProvider>
//           <SearchProvider>
//             <AppContent />
//           </SearchProvider>
//         </ScrollProvider>
//       </TabProvider>
//     </GestureHandlerRootView>
//   );
// }
// ========================================================
function RootLayoutContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabProvider>
        <ScrollProvider>
          <SearchProvider>
            <LocationGuard>
              <AppContent />
            </LocationGuard>
          </SearchProvider>
        </ScrollProvider>
      </TabProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}