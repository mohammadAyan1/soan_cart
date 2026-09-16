import sessionService from "../../services/analytics/session.service.js";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/prisma.js";
export const startSession = async (req, res) => {
    try {

        let guestId;

        console.log('====================================');
        console.log(req?.user?.id, "ASDFGH");
        console.log(req.headers["x-guest-id"]);
        console.log('====================================');




        if (!req.user?.id) {
            guestId = req.headers["x-guest-id"];

            while (true) {
                // Agar guestId nahi hai to naya generate karo
                if (!guestId) {
                    guestId = uuidv4();
                }

                const cart = await prisma.cart.findUnique({
                    where: { guestId }
                });

                console.log("ASDFG", guestId);


                // Agar guestId available hai
                if (!cart) {
                    break;
                }

                // Already exist karta hai, isliye naya UUID generate karo
                guestId = uuidv4();

                console.log('====================================');
                console.log(guestId);
                console.log('====================================');
            }
        }

        const result = await sessionService.startSession({
            userId: req.user?.id || null,
            guestId: req.headers["x-guest-id"] || guestId,
            deviceId: req.body.deviceId,
            platform: req.body.platform,
            appVersion: req.body.appVersion,
            deviceModel: req.body.deviceModel,
            osVersion: req.body.osVersion,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            latitude: req.body.latitude,    // 👈 NAYA
            longitude: req.body.longitude,  // 👈 NAYA
        });

        return res.status(result.isExisting ? 200 : 201).json({
            success: true,
            message: result.isExisting
                ? "Active session already exists."
                : "Session started successfully.",
            data: {
                sessionId: result.session.sessionId,
                isActive: result.session.isActive,
                startedAt: result.session.startedAt,
                guestId: result.session.guestId,
                number: result.session.id
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to start session."
        });
    }
};

export const heartbeat = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "sessionId is required."
            });
        }

        const session = await sessionService.heartbeat(sessionId);

        return res.status(200).json({
            success: true,
            message: "Heartbeat updated successfully.",
            data: {
                sessionId: session.sessionId,
                lastSeen: session.lastSeen
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const endSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "sessionId is required."
            });
        }

        const session = await sessionService.endSession(sessionId);

        return res.status(200).json({
            success: true,
            message: "Session ended successfully.",
            data: {
                sessionId: session.sessionId,
                durationSeconds: session.durationSeconds,
                endedAt: session.endedAt
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};