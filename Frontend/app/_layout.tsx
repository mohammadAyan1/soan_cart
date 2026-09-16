

///////////////////////////////////////////////////////
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
import { usePathname } from "expo-router";
import { getCurrentLocationDetails } from "@/utils/locationService"


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

  const backEnabledRoutes = ["/product", "/search", "/category"];
  const isChildScreen = backEnabledRoutes.some((route) => pathname?.includes(route));




  useBackTracker();

  const dispatch = useDispatch();

  // 👇 setupAnalytics ko useCallback mein rakha taaki mount pe bhi chale
  // aur reopen pe bhi - code duplicate nahi karna pada
  const setupAnalytics = useCallback(async () => {
    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = `${Device.osName}_${Device.modelName}_${Date.now()}`;
        await AsyncStorage.setItem("deviceId", deviceId);
      }

      // 👇 TEMP DEBUG - location fetch ko temporarily disable kiya hai
      // taaki confirm kar sakein ki ye hi AppState loop ka culprit hai ya nahi
      // const { latitude, longitude, city, state, country } =
      //   await getCurrentLocationDetails();
      const latitude = null, longitude = null, city = null, state = null, country = null;
      // console.log("TEMP DEBUG: location fetch skipped for testing");


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


      console.log('====================================');
      console.log(response?.data, "response");
      console.log('====================================');

      const sessionId = response.data?.data?.sessionId;

      await AsyncStorage.setItem("guestId", response.data?.data?.guestId);


      if (sessionId) {
        initEventTracker(sessionId); // 👈 YEHI SABSE ZAROORI LINE HAI
      }
    } catch (error) {
      console.warn("Analytics session start fail hua:", error);
    } finally {
      setAppIsReady(true);
    }
  }, []);

  // 👇 App khulte hi ek baar analytics session start karo aur
  // event tracker ko sessionId de do - isse pehle koi bhi event kaam
  // nahi karega
  useEffect(() => {

    setupImageNotificationListener();

    const setupPushNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      // console.log(token, "Token");

      if (token) {
        try {
          await dispatch(registerPushToken(token)).unwrap();
        } catch (err) {
          // console.log('Push token save failed:', err);
        }
      }
    };
    setupPushNotifications();

    setupAnalytics();
  }, [setupAnalytics]);

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
    // console.log("AppState listener MOUNTED, current state:", AppState.currentState);

    const handleAppStateChange = async (nextState) => {
      // console.log("RAW AppState event ->", nextState);

      const prevState = appStateRef.current;
      // 👇 turant update karo - agla event (jo milliseconds baad hi
      // aa sakta hai) isi updated value se compare hoga
      appStateRef.current = nextState;

      if (prevState === nextState) return; // real change nahi hai, skip

      if (
        prevState === "active" &&
        (nextState === "background" || nextState === "inactive")
      ) {
        console.log('====================================');
        console.log("close");
        console.log('====================================');

        flushEvents();
        resetEventTracker(); // sessionId, queue, currentScreen sab reset

        try {
          await AsyncStorage.removeItem("deviceId");
          await AsyncStorage.removeItem("sessionId");
        } catch (err) {
          console.warn("deviceId clear fail hua:", err);
        }
      } else if (
        (prevState === "background" || prevState === "inactive") &&
        nextState === "active"
      ) {
        console.log('====================================');
        console.log("reopen");
        console.log('====================================');

        // 👇 setAppIsReady(false) jaan-bujh kar NAHI kiya
        setupAnalytics();
      }
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
function RootLayoutContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabProvider>
        <ScrollProvider>
          <SearchProvider>
            <AppContent />
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