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

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                tokenExpired: jwtErr.name === "TokenExpiredError",
                message: `Invalid or expired token ${jwtErr.message}`,
            });
        }

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

        // 👇 Session check
        // Agar token ke andar embedded sessionId hai, toh check karo ki wo active hai ya nahi
        const sessionId = decoded.sessionId || req.headers["x-session-id"];
        if (decoded.sessionId) {
            const session = await prisma.userSession.findUnique({ where: { sessionId: decoded.sessionId } });
            if (!session || !session.isActive) {
                return res.status(401).json({
                    success: false,
                    sessionExpired: true,
                    message: "Session expire ho gaya hai ya device logout kar diya gaya hai",
                });
            }
            // lastSeen background me update
            prisma.userSession
                .update({ where: { sessionId: decoded.sessionId }, data: { lastSeen: new Date() } })
                .catch(() => { });
        } else if (req.headers["x-session-id"]) {
            // Legacy token support: agar header bheja hai aur wo explicitly inactive hai tabhi 401 do
            const session = await prisma.userSession.findUnique({ where: { sessionId: req.headers["x-session-id"] } });
            if (session && !session.isActive) {
                return res.status(401).json({
                    success: false,
                    sessionExpired: true,
                    message: "Session expire ho gaya hai ya device logout kar diya gaya hai",
                });
            }
        }

        req.user = user;
        req.sessionId = sessionId;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: `Invalid or expired token ${error?.message}`,
        });
    }
};