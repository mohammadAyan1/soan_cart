import prisma from "../../config/prisma.js";

class AnalyticsService {

    async track({
        eventType, sessionId, payload, screen, source, productId, variantId,
        durationSeconds, scrollDepth, searchQuery, referrerScreen, eventAt
    }) {
        const session = await prisma.userSession.findUnique({ where: { sessionId } });
        if (!session) throw new Error("Invalid session.");

        const event = await prisma.analyticsEvent.create({
            data: {
                eventType, sessionId, userId: session.userId, guestId: session.guestId,
                screen: screen ?? null, source: source ?? null,
                productId: productId ? Number(productId) : null,
                variantId: variantId ? Number(variantId) : null,
                durationSeconds: durationSeconds != null ? Number(durationSeconds) : null,
                scrollDepth: scrollDepth != null ? Number(scrollDepth) : null,
                searchQuery: searchQuery ?? null,
                referrerScreen: referrerScreen ?? null,
                payload: payload ?? undefined,
                eventAt: eventAt || new Date()
            }
        });

        await prisma.userSession.update({
            where: { sessionId }, data: { lastSeen: new Date() }
        }).catch(() => { });

        return event;
    }

    /**
     * 👇 NAYA - BATCH TRACKING
     * Frontend ek saath 10-20 events ka array bhejega, isse ek hi
     * DB round-trip me (createMany se) sab insert ho jayenge -
     * bahut fast aur sasta, N alag API call/queries nahi lagengi.
     *
     * @param {Array} events - [{ eventType, sessionId, screen, source, productId, ... }, ...]
     */
    async trackBatch(events) {
        if (!Array.isArray(events) || events.length === 0) {
            throw new Error("events array required aur khaali nahi hona chahiye.");
        }

        // Max ek limit rakho - taaki koi galti se 10000 events ek call me na bhej de
        if (events.length > 100) {
            throw new Error("Ek batch me max 100 events bhej sakte ho.");
        }

        // Saari unique sessionIds ek saath verify kar lo (N alag query ki jagah 1 query)
        const sessionIds = [...new Set(events.map((e) => e.sessionId).filter(Boolean))];

        if (sessionIds.length === 0) {
            throw new Error("Har event me sessionId required hai.");
        }

        const sessions = await prisma.userSession.findMany({
            where: { sessionId: { in: sessionIds } },
        });

        const sessionMap = new Map(sessions.map((s) => [s.sessionId, s]));

        // Invalid sessionId wale events skip kar do (crash nahi karne dena poora batch)
        const validRows = [];
        const skipped = [];

        for (const e of events) {
            const session = sessionMap.get(e.sessionId);
            if (!session) {
                skipped.push({ ...e, reason: "invalid sessionId" });
                continue;
            }
            if (!e.eventType) {
                skipped.push({ ...e, reason: "eventType missing" });
                continue;
            }

            validRows.push({
                eventType: e.eventType,
                sessionId: e.sessionId,
                userId: session.userId,
                guestId: session.guestId,
                screen: e.screen ?? null,
                source: e.source ?? null,
                productId: e.productId ? Number(e.productId) : null,
                variantId: e.variantId ? Number(e.variantId) : null,
                categoryId: e.categoryId ? Number(e.categoryId) : null,
                subCategoryId: e.subCategoryId ? Number(e.subCategoryId) : null,
                durationSeconds: e.durationSeconds != null ? Number(e.durationSeconds) : null,
                scrollDepth: e.scrollDepth != null ? Number(e.scrollDepth) : null,
                searchQuery: e.searchQuery ?? null,
                referrerScreen: e.referrerScreen ?? null,
                payload: e.payload ?? undefined,
                eventAt: e.eventAt ? new Date(e.eventAt) : new Date(),
            });
        }

        let insertedCount = 0;
        if (validRows.length > 0) {
            const result = await prisma.analyticsEvent.createMany({
                data: validRows,
            });
            insertedCount = result.count;
        }

        // Sab sessions ka lastSeen ek saath update kar do
        if (sessionIds.length > 0) {
            await prisma.userSession.updateMany({
                where: { sessionId: { in: sessionIds } },
                data: { lastSeen: new Date() },
            }).catch(() => { });
        }

        return { insertedCount, skippedCount: skipped.length, skipped };
    }
}

export default new AnalyticsService();