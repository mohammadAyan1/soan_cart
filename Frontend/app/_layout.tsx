// app/_layout.js
import { useEffect } from "react";
import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device"; // agar nahi installed hai to: npx expo install expo-device
import Header from "@/components/Header";
import { store } from "../redux/store.js";
import { ScrollProvider } from "@/context/ScrollContext";
import { TabProvider } from "@/context/TabContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SearchProvider } from "../context/SearchContext";
import { initEventTracker } from "@/utils/eventTracker"; // 👈 NAYA IMPORT
import axiosInstance from "@/api/api"; // apna existing axios instance
import useBackTracker from "@/hooks/useBackTracker";
import { registerForPushNotificationsAsync } from "../utils/notificationService"
import { registerPushToken } from "@/redux/slices/authSlice";
import { useDispatch } from 'react-redux';
import { setupImageNotificationListener } from '../utils/notificationListener'

function RootLayoutContent() {

  useBackTracker();

  const dispatch = useDispatch()

  // 👇 NAYA - App khulte hi ek baar analytics session start karo aur
  // event tracker ko sessionId de do - isse pehle koi bhi event kaam
  // nahi karega
  useEffect(() => {

    setupImageNotificationListener()

    const setupPushNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      console.log(token, "Token");

      if (token) {
        try {
          await dispatch(registerPushToken(token)).unwrap();
        } catch (err) {
          console.log('Push token save failed:', err);
        }
      }
    };
    setupPushNotifications();


    const setupAnalytics = async () => {
      try {
        let deviceId = await AsyncStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = `${Device.osName}_${Device.modelName}_${Date.now()}`;
          await AsyncStorage.setItem("deviceId", deviceId);
        }

        const response = await axiosInstance.post("/api/analytics/session/start", {
          deviceId,
          platform: Device.osName === "iOS" ? "IOS" : "ANDROID", // web ke liye "WEB"
          appVersion: "1.0.0", // apna actual app version daalo
          deviceModel: Device.modelName || "Unknown Device",
          osVersion: Device.osVersion || null,
        });


        const sessionId = response.data?.data?.sessionId;
        if (sessionId) {
          initEventTracker(sessionId); // 👈 YEHI SABSE ZAROORI LINE HAI
        }
      } catch (error) {
        console.warn("Analytics session start fail hua:", error);
      }
    };

    setupAnalytics();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabProvider>
        <ScrollProvider>
          <SearchProvider>
            <SafeAreaProvider>
              <SafeAreaView
                style={{ flex: 1, backgroundColor: "#fff" }}
                edges={["top"]}
              >
                <StatusBar
                  style="dark"
                  backgroundColor="#EF4444"
                  translucent={false}
                />

                <View style={{ flex: 1 }}>
                  <Header />
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