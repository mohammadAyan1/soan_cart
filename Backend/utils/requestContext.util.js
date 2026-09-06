// 📁 Save at: utils/requestContext.util.js
//
// Har request se session/device/platform/ip context nikalne ke liye
// - taaki activity logger me baar baar wahi code na likhna pade.
// Tumhare requiredAuth/optionalAuth middleware jo headers already
// use kar rahe hain (x-session-id, x-guest-id) - unhi ko yaha bhi
// read kar rahe hain, plus kuch extra device headers jo tum
// frontend se bhej sakte ho (agar abhi nahi bhej rahe to bhi
// ye undefined hi rahega, error nahi aayega).

export const getRequestContext = (req) => {
    return {
        sessionId: req.headers["x-session-id"] || null,
        deviceId: req.headers["x-device-id"] || null,
        platform: req.headers["x-platform"] || null,
        ipAddress:
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket?.remoteAddress ||
            null,
        userAgent: req.headers["user-agent"] || null,
        sourceScreen: req.headers["x-source-screen"] || req.body?.sourceScreen || null,
    };
};

// Guest hai ya logged-in user - dono jagah se consistent nikalne ke liye
export const getActorInfo = (req) => {
    const userId = req.user?.id || null;
    const guestId = req.headers["x-guest-id"] || null;

    return {
        actorType: userId ? "USER" : "GUEST",
        userId,
        guestId: userId ? null : guestId, // user logged in hai to guestId irrelevant
    };
};