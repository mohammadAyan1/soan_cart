import analyticsService from "../../services/analytics/analytics.service.js";

export const trackEvent = async (req, res) => {
    try {
        const {
            eventType, sessionId, payload, screen, source,
            productId, variantId, durationSeconds, scrollDepth,
            searchQuery, referrerScreen,
        } = req.body;

        if (!eventType) {
            return res.status(400).json({ success: false, message: "eventType is required." });
        }
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId is required." });
        }

        const event = await analyticsService.track({
            eventType, sessionId, payload, screen, source,
            productId, variantId, durationSeconds, scrollDepth,
            searchQuery, referrerScreen,
        });

        return res.status(201).json({
            success: true,
            message: "Analytics event tracked successfully.",
            data: event
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==================================================================
// 👇 NAYA - POST /api/analytics/track-batch
// Body: { events: [ {eventType, sessionId, screen, ...}, ... ] }
// Frontend ek saath multiple events bhejega isme - costly N-calls
// wali problem yehi solve karta hai
// ==================================================================
export const trackEventsBatch = async (req, res) => {
    try {
        const { events } = req.body;

        if (!events || !Array.isArray(events)) {
            return res.status(400).json({
                success: false,
                message: "events array required hai (body: { events: [...] })",
            });
        }

        const result = await analyticsService.trackBatch(events);

        return res.status(201).json({
            success: true,
            message: `${result.insertedCount} events tracked successfully.`,
            inserted: result.insertedCount,
            skipped: result.skippedCount,
            // skipped details sirf tabhi bhejo jab kuch skip hua ho - debugging ke liye
            ...(result.skippedCount > 0 && { skippedDetails: result.skipped }),
        });
    } catch (error) {
        console.error("trackEventsBatch error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};