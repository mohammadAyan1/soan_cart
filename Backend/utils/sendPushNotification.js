import { Expo } from 'expo-server-sdk';   // ✅ sahi

const expo = new Expo();

async function sendPushNotifications(tokens, title, body, data = {}) {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    const messages = validTokens.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Push send error:', error);
        }
    }

    return tickets;
}

export default sendPushNotifications;