import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {

    // 1. Check physical device
    if (!Device.isDevice) {
        console.log(
            "Push notification ke liye physical device use karo"
        );
        return null;
    }

    // 2. Existing permission check karo
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // 3. Agar permission nahi hai toh permission maango
    if (existingStatus !== "granted") {

        const { status } =
            await Notifications.requestPermissionsAsync();

        finalStatus = status;
    }

    // 4. User ne permission deny kar di
    if (finalStatus !== "granted") {

        console.log(
            "Notification permission denied"
        );

        return null;
    }

    // 5. EAS Project ID nikalo
    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    console.log("Project ID:", projectId);

    // 6. Project ID nahi mili
    if (!projectId) {

        console.log(
            "EAS Project ID nahi mili"
        );

        return null;
    }

    // 7. Expo Push Token obtain karo
    const tokenData =
        await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });

    console.log(
        "Expo Push Token:",
        tokenData.data
    );

    return tokenData.data;
}