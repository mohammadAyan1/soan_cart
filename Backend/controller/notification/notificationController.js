
import prisma from '../../config/prisma.js';
import sendPushNotifications from '../../utils/sendPushNotification.js';

// SAB users ko
export const sendToAllUsers = async (req, res) => {
    try {
        const { title, body } = req.body;


        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        if (!title || !body) {
            return res.status(400).json({ message: 'Title aur body dono chahiye' });
        }

        const allTokens = await prisma.pushToken.findMany({ select: { token: true } });
        const tokenList = allTokens.map((t) => t.token);

        if (tokenList.length === 0) {
            return res.status(400).json({ message: 'Koi bhi user push token registered nahi hai' });
        }

        const tickets = await sendPushNotifications(tokenList, title, body);

        return res.status(200).json({
            message: `Notification ${tokenList.length} users ko bheji gayi`,
            tickets,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// EK specific user ko
export const sendToSingleUser = async (req, res) => {
    try {
        const { userId, title, body } = req.body;

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        if (!userId || !title || !body) {
            return res.status(400).json({ message: 'userId, title aur body zaroori hai' });
        }

        const userTokens = await prisma.pushToken.findMany({
            where: { userId: Number(userId) },
            select: { token: true },
        });
        const tokenList = userTokens.map((t) => t.token);

        if (tokenList.length === 0) {
            return res.status(400).json({ message: 'Is user ka koi push token registered nahi hai' });
        }

        const tickets = await sendPushNotifications(tokenList, title, body);

        return res.status(200).json({ message: 'Notification is user ko bhej di gayi', tickets });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};