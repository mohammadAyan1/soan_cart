
import prisma from '../../config/prisma.js';
export const savePushToken = async (req, res) => {
    try {
        const userId = req.user.id; // auth middleware se aayega
        const { pushToken } = req.body;

        if (!pushToken) {
            return res.status(400).json({ message: 'Push token required hai' });
        }

        await prisma.pushToken.upsert({
            where: { token: pushToken },
            update: { userId },
            create: { token: pushToken, userId },
        });

        return res.status(200).json({ message: 'Push token saved' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};