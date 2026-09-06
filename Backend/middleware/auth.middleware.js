import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const requiredAuth = async (req, res, next) => {
    try {
        let token;


        const authHeader = req.headers.authorization;

        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your account",
            });
        }

        if (user.isDelete) {
            return res.status(403).json({
                success: false,
                message: "Account has been deactivated",
            });
        }



        // 👇 NAYA BLOCK - agar frontend x-session-id header bhej raha
        // hai, toh check karo wo session abhi bhi active hai ya nahi.
        // Yehi Manage Devices ke remote-logout ko REAL banata hai -
        // warna DB row update hoti rahegi par token phir bhi valid
        // rahega us device pe.
        const sessionId = req.headers["x-session-id"];
        if (sessionId) {
            const session = await prisma.userSession.findUnique({ where: { sessionId } });
            if (!session || !session.isActive) {
                return res.status(401).json({
                    success: false,
                    message: "Session expire ho gaya hai, dobara login karo",
                });
            }
            // lastSeen background me update - await ki zaroorat nahi
            prisma.userSession
                .update({ where: { sessionId }, data: { lastSeen: new Date() } })
                .catch(() => { });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: `Invalid or expired token ${error?.message}`,
        });
    }
};