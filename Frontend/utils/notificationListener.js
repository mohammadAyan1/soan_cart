// utils/notificationListener.js
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export function setupImageNotificationListener() {
    // 1. Jab user notification par click karega toh navigate hoga
    Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        const targetPath = data?.path;

        if (targetPath) {
            
            router.push(targetPath);
        }
    });

    // 2. Foreground / Background me notification aane par receive handler
    Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
        
    });
}