import prisma from "../../config/prisma.js";
import { nanoid } from "nanoid";

function normalizePlatform(raw) {
    const val = (raw || "").toString().trim().toUpperCase();
    if (val === "ANDROID") return "ANDROID";
    if (val === "IOS") return "IOS";
    return "WEB";
}

class SessionService {

    /**
     * Create New Session
     */
    async startSession(data) {
        // Check active session for same device
        const existingSession = await prisma.userSession.findFirst({
            where: {
                deviceId: data.deviceId,
                isActive: true
            }
        });

        if (existingSession) {
            return {
                isExisting: true,
                session: existingSession
            };
        }

        const session = await prisma.userSession.create({
            data: {
                sessionId: `sess_${nanoid(24)}`,

                userId: data.userId || null,

                guestId: data.guestId || null,

                deviceId: data.deviceId,

                platform: normalizePlatform(data.platform), // 👈 CHANGED - normalize karke enum me daalo

                appVersion: data.appVersion,

                deviceModel: data.deviceModel,

                osVersion: data.osVersion,

                ipAddress: data.ipAddress,

                userAgent: data.userAgent,

                country: data.country,

                state: data.state,

                city: data.city,

                latitude: data.latitude ?? null,   // 👈 NAYA
                longitude: data.longitude ?? null, // 👈 NAYA
            }
        });

        return {
            isExisting: false,
            session
        };
    }

    /**
     * Update Session Heartbeat
     */
    async heartbeat(sessionId) {
        const session = await prisma.userSession.findUnique({
            where: { sessionId }
        });

        if (!session) {
            throw new Error("Session not found.");
        }

        if (!session.isActive) {
            throw new Error("Session already closed.");
        }

        const updatedSession = await prisma.userSession.update({
            where: { sessionId },
            data: { lastSeen: new Date() }
        });

        return updatedSession;
    }

    /**
     * End User Session
     */
    async endSession(sessionId, endedBy = "USER") {
        const session = await prisma.userSession.findUnique({
            where: { sessionId }
        });

        if (!session) {
            throw new Error("Session not found.");
        }

        if (!session.isActive) {
            throw new Error("Session already ended.");
        }

        const endedAt = new Date();

        const durationSeconds = Math.floor(
            (endedAt.getTime() - session.startedAt.getTime()) / 1000
        );

        const updatedSession = await prisma.userSession.update({
            where: { sessionId },
            data: {
                endedAt,
                durationSeconds,
                isActive: false,
                endedBy
            }
        });

        return updatedSession;
    }
}

export default new SessionService();