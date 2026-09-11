// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import Constants from "expo-constants";

// export async function registerForPushNotificationsAsync() {

//     // 1. Check physical device
//     if (!Device.isDevice) {
//         console.log(
//             "Push notification ke liye physical device use karo"
//         );
//         return null;
//     }

//     // 2. Existing permission check karo
//     const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;

//     // 3. Agar permission nahi hai toh permission maango
//     if (existingStatus !== "granted") {

//         const { status } =
//             await Notifications.requestPermissionsAsync();

//         finalStatus = status;
//     }

//     // 4. User ne permission deny kar di
//     if (finalStatus !== "granted") {

//         console.log(
//             "Notification permission denied"
//         );

//         return null;
//     }

//     // 5. EAS Project ID nikalo
//     const projectId =
//         Constants.expoConfig?.extra?.eas?.projectId ??
//         Constants.easConfig?.projectId;

//     console.log("Project ID:", projectId);

//     // 6. Project ID nahi mili
//     if (!projectId) {

//         console.log(
//             "EAS Project ID nahi mili"
//         );

//         return null;
//     }

//     // 7. Expo Push Token obtain karo
//     const tokenData =
//         await Notifications.getExpoPushTokenAsync({
//             projectId: projectId,
//         });

//     console.log(
//         "Expo Push Token:",
//         tokenData.data
//     );

//     return tokenData.data;
// }


import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices, emulator me nahi.');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('User ne notification permission deny kar di.');
        return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
        token = tokenResponse.data; // Ye kuch aisa dikhega: ExponentPushToken[xxxxxxxxxxxx]
    } catch (e) {
        console.warn("Push token fetching failed (Firebase shayad configure nahi hai):", e);
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return token;
}