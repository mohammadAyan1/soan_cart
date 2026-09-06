

// 📁 Save at: controller/wishlist.controller.js

import prisma from "../config/prisma.js";
import { getOrCreateWishlist } from "../utils/wishlist.helper.js";
import { getRequestContext, getActorInfo } from "../utils/requestContext.util.js";
import { buildProductSnapshot, logWishlistActivity } from "../utils/activityLogger.util.js";
import { mergeGuestWishlistIntoUser } from "../utils/wishlistMerge.service.js";

// ================== ADD TO WISHLIST ==================
// Body: { productId, variantId }
export const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.body;

        if (!productId || !variantId) {
            return res.status(400).json({
                success: false,
                message: "productId aur variantId dono required hain",
            });
        }

        const variant = await prisma.productVariant.findFirst({
            where: {
                id: Number(variantId),
                productId: Number(productId),
                isDelete: false,
            },
            include: { product: true, images: { where: { isPrimary: true }, take: 1 } },
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Product variant nahi mila",
            });
        }

        const { wishlist, guestId, isNewGuest } = await getOrCreateWishlist(req);
        const { actorType, userId, guestId: actorGuestId } = getActorInfo(req);
        const context = getRequestContext(req);
        const snapshot = buildProductSnapshot(variant.product, variant);

        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_variantId: {
                    wishlistId: wishlist.id,
                    variantId: variant.id,
                },
            },
        });

        if (existingItem) {
            return res.status(200).json({
                success: true,
                message: "Ye product pehle se hi wishlist me hai",
                wishlistItem: existingItem,
                ...(isNewGuest && { guestId }),
            });
        }

        const wishlistItem = await prisma.$transaction(async (tx) => {
            const item = await tx.wishlistItem.create({
                data: {
                    wishlistId: wishlist.id,
                    productId: Number(productId),
                    variantId: variant.id,
                    vendorId: variant.product.userId,
                    originallyAddedBy: actorType,
                    originalGuestId: actorType === "GUEST" ? actorGuestId : null,
                    firstAddedAt: new Date(),
                },
            });

            await logWishlistActivity(tx, {
                eventType: "ADD_TO_WISHLIST",
                actorType,
                userId,
                guestId: actorGuestId,
                wishlistId: wishlist.id,
                wishlistItemId: item.id,
                productId: Number(productId),
                variantId: variant.id,
                previousState: null,
                currentState: { added: true },
                productSnapshot: snapshot,
                reason: "USER_ACTION",
                context,
            });

            return item;
        });

        return res.status(201).json({
            success: true,
            message: "Product wishlist me add ho gaya",
            wishlistItem,
            ...(isNewGuest && { guestId }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================== GET WISHLIST ==================
// (Read-only - koi activity log nahi honi chahiye)
export const getWishlist = async (req, res) => {
    try {
        const { wishlist, guestId, isNewGuest } = await getOrCreateWishlist(req);

        const items = await prisma.wishlistItem.findMany({
            where: { wishlistId: wishlist.id },
            include: {
                product: {
                    select: { id: true, productName: true, description: true },
                },
                variant: {
                    select: {
                        id: true,
                        description: true,
                        actualPrice: true,
                        mrp: true,
                        showMrp: true,
                        stock: true,
                        attributes: true,
                        images: {
                            where: { isPrimary: true },
                            select: { imageUrl: true },
                            take: 1,
                        },
                    },
                },
                vendor: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedItems = items.map((item) => ({
            wishlistItemId: item.id,

            productId: item.product.id,
            productName: item.product.productName,
            productDescription: item.product.description,

            variantId: item.variant.id,
            variantDescription: item.variant.description,
            variantAttributes: item.variant.attributes,
            inStock: item.variant.stock > 0,

            productImage:
                item.variant.images.length > 0 ? item.variant.images[0].imageUrl : null,

            actualPrice: Number(item.variant.actualPrice),
            mrp: Number(item.variant.mrp),
            showMrp: item.variant.showMrp,

            vendor: item.vendor,
            addedAt: item.createdAt,

            // 👇 event-sourcing context, taaki frontend chahe to yaha bhi dikha sake
            addedAsGuestOriginally: item.originallyAddedBy === "GUEST",
            convertedToUserAt: item.convertedAt,
        }));

        return res.status(200).json({
            success: true,
            items: formattedItems,
            totalItems: formattedItems.length,
            ...(isNewGuest && { guestId }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================== REMOVE ONE ITEM (by variantId) ==================
export const removeWishlistItem = async (req, res) => {
    try {
        const variantId = Number(req.params.variantId);
        const { wishlist } = await getOrCreateWishlist(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const item = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_variantId: { wishlistId: wishlist.id, variantId },
            },
            include: { variant: { include: { product: true } } },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Ye product wishlist me nahi mila",
            });
        }

        const snapshot = buildProductSnapshot(item.variant.product, item.variant);

        await prisma.$transaction(async (tx) => {
            await tx.wishlistItem.delete({ where: { id: item.id } });

            await logWishlistActivity(tx, {
                eventType: "REMOVE_FROM_WISHLIST",
                actorType,
                userId,
                guestId,
                wishlistId: wishlist.id,
                wishlistItemId: item.id,
                productId: item.productId,
                variantId,
                previousState: { existed: true },
                currentState: null,
                productSnapshot: snapshot,
                reason: "USER_ACTION",
                reasonNote: "User ne single remove button dabaya",
                context,
            });
        });

        return res.status(200).json({
            success: true,
            message: "Product wishlist se hata diya gaya",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================== CLEAR ENTIRE WISHLIST (ek hi baar me) ==================
export const clearWishlist = async (req, res) => {
    try {
        const { wishlist } = await getOrCreateWishlist(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const items = await prisma.wishlistItem.findMany({
            where: { wishlistId: wishlist.id },
            include: { variant: { include: { product: true } } },
        });

        if (items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Wishlist pehle se hi khali hai",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });

            // Har item ke liye alag CLEAR_WISHLIST event - taaki "kaunse products clear hue"
            // ye detail permanently pata rahe (sirf ek generic event se ye kho jaati)
            for (const item of items) {
                await logWishlistActivity(tx, {
                    eventType: "CLEAR_WISHLIST",
                    actorType,
                    userId,
                    guestId,
                    wishlistId: wishlist.id,
                    wishlistItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousState: { existed: true },
                    currentState: null,
                    productSnapshot: buildProductSnapshot(item.variant.product, item.variant),
                    reason: "CLEAR_ACTION",
                    reasonNote: "User ne 'clear all wishlist' button dabaya",
                    context,
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Pura wishlist empty kar diya gaya",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================== GET WISHLIST ACTIVITY HISTORY ==================
// (GET /api/wishlist/history?productId=optional)
// Poori timeline - kab add hua, kab remove hua, kab merge hua, guest tha ya user, kis page se
export const getWishlistActivityHistory = async (req, res) => {
    try {
        const { userId, guestId } = getActorInfo(req);
        const { productId } = req.query;

        if (!userId && !guestId) {
            return res.status(200).json({ success: true, activities: [] });
        }

        const activities = await prisma.wishlistActivity.findMany({
            where: {
                ...(userId ? { userId } : { guestId }),
                ...(productId && { productId: Number(productId) }),
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({ success: true, activities, totalActivities: activities.length });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ================== MANUAL MERGE ENDPOINT (POST /api/wishlist/merge) ==================
export const mergeGuestWishlist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const guestId = req.headers["x-guest-id"];
        const context = getRequestContext(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authenticated nahi hai, pehle login karo",
            });
        }

        const result = await mergeGuestWishlistIntoUser(userId, guestId, context, "MANUAL");

        return res.status(200).json({
            success: true,
            message: result.merged
                ? "Guest wishlist user wishlist me merge ho gaya"
                : "Koi guest wishlist nahi mila, user wishlist bheja gaya",
            wishlist: result.wishlist,
            items: result.items,
        });
    } catch (error) {
        console.error("Error in mergeGuestWishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Wishlist merge karte waqt error aaya",
            error: error.message,
        });
    }
};

// ==================================================================
// ADMIN: kis user ne apne wishlist me kya kya add kiya hai - sab dikhao
// ==================================================================
export const getAllWishlistsAdmin = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const wishlists = await prisma.wishlist.findMany({
            where: { userId: { not: null } },
            include: {
                user: { select: { id: true, fullName: true, email: true, phone: true } },
                items: {
                    include: {
                        product: { select: { id: true, productName: true, imageUrl: true } },
                        variant: true,
                        vendor: { select: { id: true, fullName: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return res.status(200).json({ success: true, data: wishlists });
    } catch (error) {
        console.error("getAllWishlistsAdmin error:", error);
        return res.status(500).json({ success: false, message: "Wishlists fetch karne me error aaya" });
    }
};

// ==================================================================
// ADMIN: sabse jyada wishlist me add hua product + sabse jyada wishlist hua vendor
// ==================================================================
export const getWishlistStatsAdmin = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const productGrouped = await prisma.wishlistItem.groupBy({
            by: ["productId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
        });

        const productIds = productGrouped.map((p) => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, productName: true, imageUrl: true, userId: true },
        });

        const topProducts = productGrouped.map((p) => ({
            product: products.find((pr) => pr.id === p.productId),
            totalWishlistCount: p._count.id,
        }));

        const vendorGrouped = await prisma.wishlistItem.groupBy({
            by: ["vendorId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
        });

        const vendorIds = vendorGrouped.map((v) => v.vendorId);
        const vendors = await prisma.user.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, fullName: true, email: true },
        });

        const topVendors = vendorGrouped.map((v) => ({
            vendor: vendors.find((u) => u.id === v.vendorId),
            totalWishlistCount: v._count.id,
        }));

        return res.status(200).json({
            success: true,
            topProducts,
            topVendors,
        });
    } catch (error) {
        console.error("getWishlistStatsAdmin error:", error);
        return res.status(500).json({ success: false, message: "Wishlist stats fetch karne me error aaya" });
    }
};