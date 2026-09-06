// 📁 Save at: controller/admin/adminAnalytics.controller.js
//
// Admin ke liye - user kaunsa device/location se aa raha hai, aur uska
// poora activity journey (page visit, time spent, scroll, product touch,
// search) dikhane ke liye saare endpoints yaha hain.

import prisma from "../../config/prisma.js";

function serializeSession(s) {
    return {
        sessionId: s.sessionId,
        isActive: s.isActive,
        deviceId: s.deviceId,
        deviceName: s.deviceModel,      // 👈 device ka naam
        platform: s.platform,           // 👈 WEB / ANDROID / IOS
        osVersion: s.osVersion,
        appVersion: s.appVersion,
        ipAddress: s.ipAddress,
        location: {
            city: s.city,
            state: s.state,
            country: s.country,
            latitude: s.latitude ? Number(s.latitude) : null,
            longitude: s.longitude ? Number(s.longitude) : null,
        },
        startedAt: s.startedAt,
        lastSeen: s.lastSeen,
        endedAt: s.endedAt,
        durationSeconds: s.durationSeconds,
        endedBy: s.endedBy,
    };
}

// ==================================================================
// GET /api/admin/analytics/devices
// Sab currently ACTIVE devices ki list - kaunsa user, kaha se, kis
// device pe abhi active hai
// ==================================================================
export const getAllActiveDevices = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const sessions = await prisma.userSession.findMany({
            where: { isActive: true },
            include: {
                user: { select: { id: true, fullName: true, email: true, phone: true } },
            },
            orderBy: { lastSeen: "desc" },
        });

        const data = sessions.map((s) => ({
            user: s.user
                ? { id: s.user.id, fullName: s.user.fullName, email: s.user.email, phone: s.user.phone }
                : null,
            isGuest: !s.userId,
            guestId: s.guestId,
            ...serializeSession(s),
        }));

        return res.status(200).json({ success: true, totalActive: data.length, data });
    } catch (error) {
        console.error("getAllActiveDevices error:", error);
        return res.status(500).json({ success: false, message: "Devices fetch karne me error aaya" });
    }
};

// ==================================================================
// GET /api/admin/analytics/user/:userId/devices
// Ek specific user ka poora device/session history (active + inactive dono)
// ==================================================================
export const getUserDevices = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const userId = Number(req.params.userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, fullName: true, email: true, phone: true },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User nahi mila" });
        }

        const sessions = await prisma.userSession.findMany({
            where: { userId },
            orderBy: { lastSeen: "desc" },
        });

        return res.status(200).json({
            success: true,
            user,
            totalDevices: sessions.length,
            data: sessions.map(serializeSession),
        });
    } catch (error) {
        console.error("getUserDevices error:", error);
        return res.status(500).json({ success: false, message: "User devices fetch karne me error aaya" });
    }
};

// ==================================================================
// GET /api/admin/analytics/user/:userId/timeline
// Query params: ?limit=100&page=1&eventType=PRODUCT_VIEW&sessionId=xxx
//
// Ek user ne kya-kya kiya - poori timeline. Har event ke sath:
// - kaunsa screen tha
// - kitna time spend kiya (SCREEN_EXIT events se)
// - kitna scroll kiya (SCROLL_STOP events se)
// - kaunsa product touch/view/click kiya (productId se Product join)
// - kya search kiya
// ==================================================================
export const getUserActivityTimeline = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const userId = Number(req.params.userId);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 100;
        const { eventType, sessionId } = req.query;

        const whereClause = {
            userId,
            ...(eventType && { eventType }),
            ...(sessionId && { sessionId }),
        };

        const [events, total] = await Promise.all([
            prisma.analyticsEvent.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.analyticsEvent.count({ where: whereClause }),
        ]);

        // Jitne bhi events me productId hai unke product details ek saath fetch karlo
        const productIds = [...new Set(events.filter((e) => e.productId).map((e) => e.productId))];
        const products = productIds.length
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, productName: true, imageUrl: true },
            })
            : [];
        const productMap = new Map(products.map((p) => [p.id, p]));

        const formatted = events.map((e) => ({
            id: e.id,
            eventType: e.eventType,
            sessionId: e.sessionId,
            screen: e.screen,
            source: e.source,
            product: e.productId ? productMap.get(e.productId) ?? null : null,
            variantId: e.variantId,
            durationSeconds: e.durationSeconds,   // is screen pe kitni der ruka
            scrollDepth: e.scrollDepth,           // kitna % scroll kiya
            searchQuery: e.searchQuery,           // kya search kiya
            referrerScreen: e.referrerScreen,     // kaha se aaya tha
            payload: e.payload,
            eventAt: e.eventAt,
            createdAt: e.createdAt,
        }));

        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("getUserActivityTimeline error:", error);
        return res.status(500).json({ success: false, message: "User timeline fetch karne me error aaya" });
    }
};

// ==================================================================
// GET /api/admin/analytics/session/:sessionId/journey
// Ek session (ek baar ka app/website use) ka bilkul step-by-step journey -
// kaunse page pe gaya, kitni der raha, kya kya click/search kiya - sab
// chronological (purane se naye) order me
// ==================================================================
export const getSessionJourney = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const { sessionId } = req.params;

        const session = await prisma.userSession.findUnique({
            where: { sessionId },
            include: {
                user: { select: { id: true, fullName: true, email: true, phone: true } },
            },
        });

        if (!session) {
            return res.status(404).json({ success: false, message: "Session nahi mila" });
        }

        const events = await prisma.analyticsEvent.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" }, // journey order me chahiye - purane se naye
        });

        const productIds = [...new Set(events.filter((e) => e.productId).map((e) => e.productId))];
        const products = productIds.length
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, productName: true, imageUrl: true },
            })
            : [];
        const productMap = new Map(products.map((p) => [p.id, p]));

        const journey = events.map((e) => ({
            eventType: e.eventType,
            screen: e.screen,
            source: e.source,
            product: e.productId ? productMap.get(e.productId) ?? null : null,
            variantId: e.variantId,
            durationSeconds: e.durationSeconds,
            scrollDepth: e.scrollDepth,
            searchQuery: e.searchQuery,
            referrerScreen: e.referrerScreen,
            payload: e.payload,
            at: e.eventAt || e.createdAt,
        }));

        // Total is session me spend hua time = saare SCREEN_EXIT events ke durationSeconds ka sum
        const totalActiveSeconds = events
            .filter((e) => e.eventType === "SCREEN_EXIT" && e.durationSeconds)
            .reduce((sum, e) => sum + e.durationSeconds, 0);

        return res.status(200).json({
            success: true,
            user: session.user,
            isGuest: !session.userId,
            guestId: session.guestId,
            device: {
                deviceName: session.deviceModel,
                platform: session.platform,
                osVersion: session.osVersion,
                appVersion: session.appVersion,
            },
            location: {
                city: session.city,
                state: session.state,
                country: session.country,
                latitude: session.latitude ? Number(session.latitude) : null,
                longitude: session.longitude ? Number(session.longitude) : null,
            },
            sessionStartedAt: session.startedAt,
            sessionEndedAt: session.endedAt,
            totalActiveSeconds,
            totalEvents: journey.length,
            journey,
        });
    } catch (error) {
        console.error("getSessionJourney error:", error);
        return res.status(500).json({ success: false, message: "Session journey fetch karne me error aaya" });
    }
};



// ==================================================================
// GET /api/admin/analytics/user/:userId/time-summary
// Ek user ne HAR PAGE pe total mila kar kitna time bitaya - saare
// sessions ka combined summary
// ==================================================================
export const getUserTimeSummary = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const userId = Number(req.params.userId);

        // Sirf SCREEN_EXIT events chahiye - inhi me durationSeconds hota hai
        const exitEvents = await prisma.analyticsEvent.findMany({
            where: {
                userId,
                eventType: "SCREEN_EXIT",
                durationSeconds: { not: null },
            },
            select: { screen: true, durationSeconds: true, createdAt: true },
        });

        // Screen ke hisaab se group karke total time nikaalo
        const summary = {};
        for (const e of exitEvents) {
            const screen = e.screen || "unknown_screen";
            if (!summary[screen]) {
                summary[screen] = { totalSeconds: 0, visitCount: 0 };
            }
            summary[screen].totalSeconds += e.durationSeconds;
            summary[screen].visitCount += 1;
        }

        const formatted = Object.entries(summary)
            .map(([screen, data]) => ({
                screen,
                totalSeconds: data.totalSeconds,
                totalMinutes: Math.round((data.totalSeconds / 60) * 10) / 10,
                visitCount: data.visitCount,
                avgSecondsPerVisit: Math.round(data.totalSeconds / data.visitCount),
            }))
            .sort((a, b) => b.totalSeconds - a.totalSeconds); // sabse zyada time wala upar

        const grandTotalSeconds = exitEvents.reduce((sum, e) => sum + e.durationSeconds, 0);

        return res.status(200).json({
            success: true,
            userId,
            grandTotalSeconds,
            grandTotalMinutes: Math.round((grandTotalSeconds / 60) * 10) / 10,
            perScreen: formatted,
        });
    } catch (error) {
        console.error("getUserTimeSummary error:", error);
        return res.status(500).json({ success: false, message: "Time summary fetch karne me error aaya" });
    }
};




// =================================================================
// ADMIN DASHBOARD SUMMARY API (Updated with real-time Month-wise Sales)
// =================================================================
export const getAdminDashboardSummary = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Running Month boundaries
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Current Year boundaries (e.g., Jan 1, 2026 to Dec 31, 2026)
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

        // 1. Aaj ke users
        const todayUsersCount = await prisma.user.count({
            where: { createdAt: { gte: startOfToday, lte: endOfToday } }
        });

        // 2. Aaj ke orders & sales
        const todayOrdersData = await prisma.order.aggregate({
            where: { createdAt: { gte: startOfToday, lte: endOfToday }, isDelete: false },
            _count: { id: true },
            _sum: { totalAmount: true }
        });

        const todayOrdersCount = todayOrdersData._count.id || 0;
        const todaySalesTotal = todayOrdersData._sum.totalAmount || 0;

        // 3. Running Month ka total sale
        const runningMonthOrdersData = await prisma.order.aggregate({
            where: { createdAt: { gte: startOfMonth, lte: now }, isDelete: false },
            _sum: { totalAmount: true }
        });
        const runningMonthSalesTotal = runningMonthOrdersData._sum.totalAmount || 0;

        // 4. Running Month Date-wise Sales Overview
        const monthOrders = await prisma.order.findMany({
            where: { createdAt: { gte: startOfMonth, lte: now }, isDelete: false },
            select: { createdAt: true, totalAmount: true }
        });

        const salesByDateMap = {};
        monthOrders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!salesByDateMap[dateStr]) salesByDateMap[dateStr] = 0;
            salesByDateMap[dateStr] += Number(order.totalAmount);
        });

        const dateWiseSales = Object.keys(salesByDateMap).map(date => ({
            date,
            sales: salesByDateMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 5. 👇 NAYA: Current Year (Running Year) Month-wise Sales Overview
        const yearOrders = await prisma.order.findMany({
            where: { createdAt: { gte: startOfYear, lte: endOfYear }, isDelete: false },
            select: { createdAt: true, totalAmount: true }
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlySalesMap = {};
        monthNames.forEach(m => { monthlySalesMap[m] = 0; });

        yearOrders.forEach(order => {
            const monthIndex = order.createdAt.getMonth(); // 0 for Jan, 1 for Feb...
            const monthStr = monthNames[monthIndex];
            monthlySalesMap[monthStr] += Number(order.totalAmount);
        });

        const monthWiseSales = monthNames.map(month => ({
            month,
            sales: monthlySalesMap[month]
        }));

        // 6. Aaj ke naye products, cart, wishlist, reviews counts
        const todayProductsCount = await prisma.product.count({
            where: { createdAt: { gte: startOfToday, lte: endOfToday }, isDelete: false }
        });

        const todayCartAddsCount = await prisma.cartActivity.count({
            where: { eventType: "ADD_TO_CART", createdAt: { gte: startOfToday, lte: endOfToday } }
        });

        const todayWishlistAddsCount = await prisma.wishlistActivity.count({
            where: { eventType: "ADD_TO_WISHLIST", createdAt: { gte: startOfToday, lte: endOfToday } }
        });

        const todayReviewsCount = await prisma.review.count({
            where: { createdAt: { gte: startOfToday, lte: endOfToday }, isDelete: false }
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard summary fetched successfully",
            data: {
                todayUsersCount,
                todayOrdersCount,
                todaySalesTotal,
                runningMonthSalesTotal,
                dateWiseSales,
                monthWiseSales, // 👈 Current year ke saare mahino ka data
                todayProductsCount,
                todayCartAddsCount,
                todayWishlistAddsCount,
                todayReviewsCount
            }
        });

    } catch (error) {
        console.error("getAdminDashboardSummary error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};