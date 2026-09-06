import prisma from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";
import geoip from "geoip-lite";

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.socket?.remoteAddress || req.ip;
}

// Header se aaye platform string ko humare Platform enum (WEB/ANDROID/IOS) me normalize karta hai
function normalizePlatform(raw) {
    const val = (raw || "").toString().trim().toUpperCase();
    if (val === "ANDROID") return "ANDROID";
    if (val === "IOS") return "IOS";
    return "WEB"; // default - agar header nahi bheja ya invalid bheja to WEB maan lo
}

// Ye function auth.controller.js ke login() se call hota hai
export async function createOrUpdateSession(req, userId) {
    const deviceId = req.headers["x-device-id"];
    if (!deviceId) return null;

    const platform = normalizePlatform(req.headers["x-platform"]);
    const deviceBrand = req.headers["x-device-brand"] || "";
    const deviceModelRaw = req.headers["x-device-model"] || "";
    // Brand + model code milake ek readable naam banao (jaise "Vivo V2228")
    // Web ke liye frontend x-device-model me "Chrome on Windows" jaisa bhi bhej sakta hai
    const deviceModel =
        [deviceBrand, deviceModelRaw].filter(Boolean).join(" ").trim() || "Unknown Device";

    const osVersion = req.headers["x-os-version"] || null;
    const appVersion = req.headers["x-app-version"] || null;

    // 👇 Pehle GPS-based location try karo (frontend se), warna IP-based fallback
    const locCity = req.headers["x-loc-city"];
    const locRegion = req.headers["x-loc-region"];
    const locCountry = req.headers["x-loc-country"];
    const locLat = req.headers["x-loc-lat"];   // 👈 NAYA
    const locLng = req.headers["x-loc-lng"];   // 👈 NAYA

    const ip = getClientIp(req);
    const geo = !locCity && ip ? geoip.lookup(ip) : null;

    // IP-based lookup se bhi ek approx lat/long mil jaata hai (geoip-lite ka ll field: [lat, lng])
    const geoLat = geo?.ll?.[0] ?? null;
    const geoLng = geo?.ll?.[1] ?? null;

    const finalLat = locLat ? Number(locLat) : geoLat;
    const finalLng = locLng ? Number(locLng) : geoLng;

    const existing = await prisma.userSession.findFirst({
        where: { userId, deviceId },
        orderBy: { createdAt: "desc" },
    });

    if (existing) {
        return await prisma.userSession.update({
            where: { id: existing.id },
            data: {
                sessionId: uuidv4(),
                isActive: true,
                lastSeen: new Date(),
                // 👇 startedAt jaan-bujh kar update NAHI kar rahe -
                // ye "Registered on" date hai, first-time value hi
                // permanently rehni chahiye
                endedAt: null,
                endedBy: null,
                platform,
                deviceModel,
                osVersion,
                appVersion,
                ipAddress: ip,
                userAgent: req.headers["user-agent"] || null,
                country: locCountry || geo?.country || existing.country,
                state: locRegion || geo?.region || existing.state,
                city: locCity || geo?.city || existing.city,
                latitude: finalLat ?? existing.latitude,   // 👈 NAYA
                longitude: finalLng ?? existing.longitude, // 👈 NAYA
            },
        });
    }

    return await prisma.userSession.create({
        data: {
            sessionId: uuidv4(),
            userId,
            deviceId,
            platform,
            deviceModel,
            osVersion,
            appVersion,
            ipAddress: ip,
            userAgent: req.headers["user-agent"] || null,
            country: locCountry || geo?.country || null,
            state: locRegion || geo?.region || null,
            city: locCity || geo?.city || null,
            latitude: finalLat,   // 👈 NAYA
            longitude: finalLng,  // 👈 NAYA
        },
    });
}

// ==================================================================
// GET /api/sessions/my-sessions
// ==================================================================
export const getMySessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentSessionId = req.headers["x-session-id"];

        const sessions = await prisma.userSession.findMany({
            where: { userId, isActive: true },
            orderBy: { lastSeen: "desc" },
        });

        const formatted = sessions.map((s) => ({
            ...s,
            isCurrentDevice: currentSessionId ? s.sessionId === currentSessionId : false,
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error("getMySessions error:", error);
        return res.status(500).json({ success: false, message: "Devices fetch karne me error aaya" });
    }
};

// ==================================================================
// PATCH /api/sessions/:sessionId/logout - ek specific device
// ==================================================================
export const logoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        const session = await prisma.userSession.findUnique({ where: { sessionId } });

        if (!session || session.userId !== userId) {
            return res.status(404).json({ success: false, message: "Session nahi mila" });
        }
        if (!session.isActive) {
            return res.status(400).json({ success: false, message: "Ye device pehle se hi logout hai" });
        }

        const durationSeconds = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);

        await prisma.userSession.update({
            where: { sessionId },
            data: {
                isActive: false,
                endedAt: new Date(),
                endedBy: "USER",
                durationSeconds,
            },
        });

        return res.status(200).json({ success: true, message: "Device logout ho gaya" });
    } catch (error) {
        console.error("logoutSession error:", error);
        return res.status(500).json({ success: false, message: "Logout karne me error aaya" });
    }
};

// ==================================================================
// PATCH /api/sessions/logout-all - saare OTHER devices se logout
// ==================================================================
export const logoutAllSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentSessionId = req.headers["x-session-id"];

        await prisma.userSession.updateMany({
            where: {
                userId,
                isActive: true,
                ...(currentSessionId ? { sessionId: { not: currentSessionId } } : {}),
            },
            data: {
                isActive: false,
                endedAt: new Date(),
                endedBy: "USER",
            },
        });

        return res.status(200).json({ success: true, message: "Baaki saare devices se logout ho gaya" });
    } catch (error) {
        console.error("logoutAllSessions error:", error);
        return res.status(500).json({ success: false, message: "Logout karne me error aaya" });
    }
};