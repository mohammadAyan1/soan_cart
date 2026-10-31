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
// 1) ADMIN: coupon create (POST /api/coupons/admin/create)
// ==================================================================
export const createCoupon = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const { error, data } = await buildDiscountData(req.body, null, { label: "Coupon" });
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const exists = await prisma.coupon.findUnique({ where: { code: data.code } });
        if (exists) {
            return res.status(409).json({ success: false, message: "Ye coupon code pehle se maujood hai" });
        }

        const isActive = req.body.isActive === undefined ? true : parseBool(req.body.isActive);

        const coupon = await prisma.coupon.create({
            data: { ...data, isActive, createdBy: req.user.id },
        });

        return res.status(201).json({ success: true, message: "Coupon successfully create ho gaya", data: coupon });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Coupon create karne me error aaya ${error?.message}` });
    }
};

// ==================================================================
// 2) ADMIN: saare coupons (GET /api/coupons/admin/all)
//    query: page, limit, active=true|false, deleted=true, scope, type, search
// ==================================================================
export const getAllCouponsAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const { active, deleted, scope, type, search } = req.query;

        if (scope && !COUPON_SCOPES.includes(String(scope).toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid scope" });
        }
        if (type && !COUPON_TYPES.includes(String(type).toUpperCase())) {
            return res.status(400).json({ success: false, message: "Invalid type" });
        }

        const where = {
            isDelete: deleted === "true",
            ...(active !== undefined && { isActive: active === "true" }),
            ...(scope && { scope: String(scope).toUpperCase() }),
            ...(type && { type: String(type).toUpperCase() }),
            ...(search && { code: { contains: String(search) } }),
        };

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                include: { _count: { select: { usages: true } } },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.coupon.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            data: coupons,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Coupons fetch karne me error aaya" });
    }
};

// ==================================================================
// 3) ADMIN: single coupon (GET /api/coupons/admin/:couponId)
// ==================================================================
export const getCouponByIdAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const couponId = Number(req.params.couponId);
        if (!couponId) {
            return res.status(400).json({ success: false, message: "Valid couponId required hai" });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
            include: { _count: { select: { usages: true } } },
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon nahi mila" });
        }

        return res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Coupon fetch karne me error aaya" });
    }
};

// ==================================================================
// 4) ADMIN: coupon update (PUT /api/coupons/admin/:couponId)
//    Partial update chalega - jo field bhejoge wahi change hogi
// ==================================================================
export const updateCoupon = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const couponId = Number(req.params.couponId);
        if (!couponId) {
            return res.status(400).json({ success: false, message: "Valid couponId required hai" });
        }

        const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Coupon nahi mila" });
        }

        const { error, data } = await buildDiscountData(req.body, existing, { label: "Coupon" });
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        if (data.code !== existing.code) {
            const codeTaken = await prisma.coupon.findUnique({ where: { code: data.code } });
            if (codeTaken) {
                return res.status(409).json({ success: false, message: "Ye coupon code pehle se maujood hai" });
            }
        }

        const updated = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                ...data,
                ...(req.body.isActive !== undefined && { isActive: parseBool(req.body.isActive) }),
            },
        });

        return res.status(200).json({ success: true, message: "Coupon update ho gaya", data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Coupon update karne me error aaya ${error?.message}` });
    }
};

// ==================================================================
// 5) ADMIN: active / deactive toggle (PATCH /api/coupons/admin/:couponId/toggle-active)
// ==================================================================
export const toggleCouponActive = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const couponId = Number(req.params.couponId);
        if (!couponId) {
            return res.status(400).json({ success: false, message: "Valid couponId required hai" });
        }

        const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon nahi mila" });
        }
        if (coupon.isDelete) {
            return res.status(400).json({ success: false, message: "Deleted coupon ko active nahi kar sakte, pehle restore karo" });
        }

        const updated = await prisma.coupon.update({
            where: { id: couponId },
            data: { isActive: !coupon.isActive },
        });

        return res.status(200).json({
            success: true,
            message: updated.isActive ? "Coupon Active ho gaya" : "Coupon Deactive ho gaya",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Coupon status change karne me error aaya" });
    }
};

// ==================================================================
// 6) ADMIN: soft delete / restore toggle (PATCH /api/coupons/admin/:couponId/toggle-delete)
//    Delete hone par isActive bhi false ho jata hai. Restore ke baad admin ko manually active karna hoga.
// ==================================================================
export const toggleCouponDeleteAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const couponId = Number(req.params.couponId);
        if (!couponId) {
            return res.status(400).json({ success: false, message: "Valid couponId required hai" });
        }

        const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon nahi mila" });
        }

        const newDeleteState = !coupon.isDelete;

        const updated = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                isDelete: newDeleteState,
                ...(newDeleteState && { isActive: false }),
            },
        });

        return res.status(200).json({
            success: true,
            message: newDeleteState ? "Coupon successfully Deleted (Inactive)" : "Coupon successfully Restored (abhi Deactive hai, active karo)",
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Coupon delete/restore karne me error aaya" });
    }
};

// ==================================================================
// 7) USER: sirf active + non-expired coupons (GET /api/coupons)
//    Har coupon ke saath user ka usage bhi aata hai (usedByYou, remainingUses, canUse)
// ==================================================================
export const getActiveCouponsForUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const coupons = await prisma.coupon.findMany({
            where: {
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
        if (coupons.length > 0) {
            const usedRows = await prisma.couponUsage.groupBy({
                by: ["couponId"],
                where: { userId, isActive: true, couponId: { in: coupons.map((c) => c.id) } },
                _count: { id: true },
            });
            for (const row of usedRows) usedMap.set(row.couponId, row._count.id);
        }

        const data = coupons.map((c) => {
            const used = usedMap.get(c.id) || 0;
            const remainingUses = c.perUserLimit === null ? null : Math.max(c.perUserLimit - used, 0);
            return {
                ...c,
                usedByYou: used,
                remainingUses, // null = unlimited
                canUse: remainingUses === null || remainingUses > 0,
            };
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Coupons fetch karne me error aaya" });
    }
};