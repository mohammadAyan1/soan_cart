import sessionService from "../../services/analytics/session.service.js";

export const startSession = async (req, res) => {
    try {
        const result = await sessionService.startSession({
            userId: req.user?.id || null,
            guestId: req.headers["x-guest-id"] || null,
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
                startedAt: result.session.startedAt
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