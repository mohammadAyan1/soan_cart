

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
        // console.log('Push notifications only work on physical devices, emulator me nahi.');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        // console.log('User ne notification permission deny kar di.');
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