import { prisma } from "../config/prisma.js";
import { buildDiscountData, parseBool, COUPON_TYPES, COUPON_SCOPES } from "../utils/discount.helper.js";

const adminOnly = (req, res) => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "You don't have authority" });
        return false;
    }
    return true;
};

// ==================================================================
// 1) ADMIN: reward create (POST /api/rewards/admin/create)
//    Body me "userId" required hai (reward kis user ke liye hai)
// ==================================================================
export const createReward = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const { error, data } = await buildDiscountData(req.body, null, { label: "Reward", requireUser: true });
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const exists = await prisma.reward.findUnique({ where: { code: data.code } });
        if (exists) {
            return res.status(409).json({ success: false, message: "Ye reward code pehle se maujood hai" });
        }

        const isActive = req.body.isActive === undefined ? true : parseBool(req.body.isActive);

        const reward = await prisma.reward.create({
            data: { ...data, isActive, createdBy: req.user.id },
            include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        });

        return res.status(201).json({ success: true, message: "Reward successfully create ho gaya", data: reward });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Reward create karne me error aaya ${error?.message}` });
    }
};

// ==================================================================
// 2) ADMIN: saare rewards (GET /api/rewards/admin/all)
//    query: page, limit, userId, active=true|false, deleted=true, scope, type, search
// ==================================================================
export const getAllRewardsAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const { userId, active, deleted, scope, type, search } = req.query;

        if (scope && !COUPON_SCOPES.includes(String(scope).toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid scope" });
        }
        if (type && !COUPON_TYPES.includes(String(type).toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        const where = {
            isDelete: deleted === "true",
            ...(userId && { userId: Number(userId) }),
            ...(active !== undefined && { isActive: active === "true" }),
            ...(scope && { scope: String(scope).toUpperCase() }),
            ...(type && { type: String(type).toUpperCase() }),
            ...(search && { code: { contains: String(search) } }),
        };

        const [rewards, total] = await Promise.all([
            prisma.reward.findMany({
                where,
                include: {
                    user: { select: { id: true, fullName: true, email: true, phone: true } },
                    _count: { select: { usages: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.reward.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            data: rewards,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Rewards fetch karne me error aaya" });
    }
};

// ==================================================================
// 3) ADMIN: single reward (GET /api/rewards/admin/:rewardId)
// ==================================================================
export const getRewardByIdAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const rewardId = Number(req.params.rewardId);
        if (!rewardId) {
            return res.status(400).json({ success: false, message: "Valid rewardId required hai" });
        }

        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
            include: {
                user: { select: { id: true, fullName: true, email: true, phone: true } },
                _count: { select: { usages: true } },
            },
        });

        if (!reward) {
            return res.status(404).json({ success: false, message: "Reward nahi mila" });
        }

        return res.status(200).json({ success: true, data: reward });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Reward fetch karne me error aaya" });
    }
};

// ==================================================================
// 4) ADMIN: reward update (PUT /api/rewards/admin/:rewardId)
//    Partial update chalega - jo field bhejoge wahi change hogi
// ==================================================================
export const updateReward = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const rewardId = Number(req.params.rewardId);
        if (!rewardId) {
            return res.status(400).json({ success: false, message: "Valid rewardId required hai" });
        }

        const existing = await prisma.reward.findUnique({ where: { id: rewardId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Reward nahi mila" });
        }

        const { error, data } = await buildDiscountData(req.body, existing, { label: "Reward", requireUser: true });
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        if (data.code !== existing.code) {
            const codeTaken = await prisma.reward.findUnique({ where: { code: data.code } });
            if (codeTaken) {
                return res.status(409).json({ success: false, message: "Ye reward code pehle se maujood hai" });
            }
        }

        const updated = await prisma.reward.update({
            where: { id: rewardId },
            data: {
                ...data,
                ...(req.body.isActive !== undefined && { isActive: parseBool(req.body.isActive) }),
            },
            include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        });

        return res.status(200).json({ success: true, message: "Reward update ho gaya", data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Reward update karne me error aaya ${error?.message}` });
    }
};

// ==================================================================
// 5) ADMIN: active / deactive toggle (PATCH /api/rewards/admin/:rewardId/toggle-active)
// ==================================================================
export const toggleRewardActive = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const rewardId = Number(req.params.rewardId);
        if (!rewardId) {
            return res.status(400).json({ success: false, message: "Valid rewardId required hai" });
        }

        const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward) {
            return res.status(404).json({ success: false, message: "Reward nahi mila" });
        }
        if (reward.isDelete) {
            return res.status(400).json({ success: false, message: "Deleted reward ko active nahi kar sakte, pehle restore karo" });
        }

        const updated = await prisma.reward.update({
            where: { id: rewardId },
            data: { isActive: !reward.isActive },
        });

        return res.status(200).json({
            success: true,
            message: updated.isActive ? "Reward Active ho gaya" : "Reward Deactive ho gaya",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Reward status change karne me error aaya" });
    }
};

// ==================================================================
// 6) ADMIN: soft delete / restore toggle (PATCH /api/rewards/admin/:rewardId/toggle-delete)
// ==================================================================
export const toggleRewardDeleteAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const rewardId = Number(req.params.rewardId);
        if (!rewardId) {
            return res.status(400).json({ success: false, message: "Valid rewardId required hai" });
        }

        const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
        if (!reward) {
            return res.status(404).json({ success: false, message: "Reward nahi mila" });
        }

        const newDeleteState = !reward.isDelete;

        const updated = await prisma.reward.update({
            where: { id: rewardId },
            data: {
                isDelete: newDeleteState,
                ...(newDeleteState && { isActive: false }),
            },
        });

        return res.status(200).json({
            success: true,
            message: newDeleteState ? "Reward successfully Deleted (Inactive)" : "Reward successfully Restored (abhi Deactive hai, active karo)",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Reward delete/restore karne me error aaya" });
    }
};

// ==================================================================
// 7) USER: sirf apne liye bane hue + active + non-expired rewards (GET /api/rewards/my-rewards)
// ==================================================================
export const getMyRewards = async (req, res) => {
    try {
        const userId = req.user.id;

        const rewards = await prisma.reward.findMany({
            where: {
                userId,
                isActive: true,
                isDelete: false,
                expiryDate: { gt: new Date() },
            },
            select: {
                id: true,
                code: true,
                description: true,
                type: true,
                value: true,
                maxDiscountAmount: true,
                perUserLimit: true,
                expiryDate: true,
                scope: true,
                productId: true,
                variantId: true,
                categoryId: true,
                subCategoryId: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const usedMap = new Map();
        if (rewards.length > 0) {
            const usedRows = await prisma.rewardUsage.groupBy({
                by: ["rewardId"],
                where: { userId, isActive: true, rewardId: { in: rewards.map((r) => r.id) } },
                _count: { id: true },
            });
            for (const row of usedRows) usedMap.set(row.rewardId, row._count.id);
        }

        const data = rewards.map((r) => {
            const used = usedMap.get(r.id) || 0;
            const remainingUses = r.perUserLimit === null ? null : Math.max(r.perUserLimit - used, 0);
            return {
                ...r,
                usedByYou: used,
                remainingUses, // null = unlimited
                canUse: remainingUses === null || remainingUses > 0,
            };
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Rewards fetch karne me error aaya" });
    }
};