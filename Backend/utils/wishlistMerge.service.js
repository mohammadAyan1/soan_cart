// 📁 Save at: utils/wishlistMerge.service.js
//
// cartMerge.service.js jaisa hi - guest wishlist ko user wishlist me
// merge karne ka SAARA logic yahan hai, poori activity logging ke saath.
// Login controller aur /api/wishlist/merge endpoint dono ye use karte hain.

import prisma from "../config/prisma.js";
import { buildProductSnapshot, logWishlistActivity } from "./activityLogger.util.js";

/**
 * @param {number} userId
 * @param {string} guestId
 * @param {object} context - { sessionId, deviceId, ipAddress, platform, userAgent, sourceScreen }
 * @param {"AUTO"|"MANUAL"} triggerType
 * @returns {object} { merged, wishlist, items, mergedCount, skippedCount, guestWishlistId }
 */
export const mergeGuestWishlistIntoUser = async (userId, guestId, context = {}, triggerType = "AUTO") => {
    if (!guestId) {
        const userWishlist = await prisma.wishlist.upsert({
            where: { userId },
            update: {},
            create: { userId },
            include: { items: true },
        });
        return { merged: false, wishlist: userWishlist, items: userWishlist.items, mergedCount: 0, skippedCount: 0, guestWishlistId: null };
    }

    const result = await prisma.$transaction(async (tx) => {
        const guestWishlist = await tx.wishlist.findUnique({
            where: { guestId },
            include: { items: { include: { variant: { include: { product: true } } } } },
        });

        let userWishlist = await tx.wishlist.findUnique({ where: { userId } });

        // Guest wishlist hi nahi mila - kuch merge karne ko nahi
        if (!guestWishlist) {
            if (!userWishlist) {
                userWishlist = await tx.wishlist.create({ data: { userId } });
            }
            const items = await tx.wishlistItem.findMany({ where: { wishlistId: userWishlist.id } });
            return { wishlist: userWishlist, items, merged: false, mergedCount: 0, skippedCount: 0, guestWishlistId: null };
        }

        let mergedCount = 0;
        let skippedCount = 0;

        // User ka wishlist abhi tak nahi bana - guest wishlist ko hi promote kar do
        if (!userWishlist) {
            userWishlist = await tx.wishlist.update({
                where: { id: guestWishlist.id },
                data: { userId, guestId: null },
            });

            for (const item of guestWishlist.items) {
                await tx.wishlistItem.update({
                    where: { id: item.id },
                    data: { convertedAt: new Date(), convertedUserId: userId },
                });

                await logWishlistActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    wishlistId: userWishlist.id,
                    wishlistItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousState: { wishlistId: guestWishlist.id, ownedBy: "GUEST" },
                    currentState: { wishlistId: userWishlist.id, ownedBy: "USER" },
                    productSnapshot: buildProductSnapshot(item.variant.product, item.variant),
                    reason: "GUEST_MERGE",
                    context,
                });

                mergedCount++;
            }

            const items = await tx.wishlistItem.findMany({ where: { wishlistId: userWishlist.id } });
            return { wishlist: userWishlist, items, merged: true, mergedCount, skippedCount, guestWishlistId: guestWishlist.id };
        }

        // Dono wishlist maujood hain -> item by item merge karo
        for (const item of guestWishlist.items) {
            const existingUserItem = await tx.wishlistItem.findUnique({
                where: { wishlistId_variantId: { wishlistId: userWishlist.id, variantId: item.variantId } },
            });

            const snapshot = buildProductSnapshot(item.variant.product, item.variant);

            if (existingUserItem) {
                // Ye variant already user ke wishlist me hai -> guest wala duplicate hata do
                await logWishlistActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    wishlistId: userWishlist.id,
                    wishlistItemId: existingUserItem.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousState: { wishlistId: guestWishlist.id, ownedBy: "GUEST" },
                    currentState: { wishlistId: userWishlist.id, ownedBy: "USER", duplicate: true },
                    productSnapshot: snapshot,
                    reason: "GUEST_MERGE",
                    reasonNote: "Ye product already user ke wishlist me tha, guest wala duplicate hata diya",
                    context,
                });

                await tx.wishlistItem.delete({ where: { id: item.id } });
                skippedCount++;
            } else {
                await tx.wishlistItem.update({
                    where: { id: item.id },
                    data: {
                        wishlistId: userWishlist.id,
                        convertedAt: new Date(),
                        convertedUserId: userId,
                    },
                });

                await logWishlistActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    wishlistId: userWishlist.id,
                    wishlistItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousState: { wishlistId: guestWishlist.id },
                    currentState: { wishlistId: userWishlist.id },
                    productSnapshot: snapshot,
                    reason: "GUEST_MERGE",
                    context,
                });

                mergedCount++;
            }
        }

        await tx.wishlist.delete({ where: { id: guestWishlist.id } });

        const finalItems = await tx.wishlistItem.findMany({ where: { wishlistId: userWishlist.id } });
        return { wishlist: userWishlist, items: finalItems, merged: true, mergedCount, skippedCount, guestWishlistId: guestWishlist.id };
    });

    // GuestConversion record - agar login ke time (thodi der pehle) cart merge se pehle
    // se ek record ban chuka hai, to usi me wishlist stats add kar do (ek hi combined
    // record rahe), warna naya record bana do (jaise standalone wishlist merge endpoint se)
    if (result.merged) {
        const recentConversion = await prisma.guestConversion.findFirst({
            where: {
                guestId,
                userId,
                mergedAt: { gte: new Date(Date.now() - 15000) }, // pichle 15 second ke andar
            },
            orderBy: { mergedAt: "desc" },
        });

        if (recentConversion) {
            await prisma.guestConversion.update({
                where: { id: recentConversion.id },
                data: {
                    guestWishlistId: result.guestWishlistId,
                    userWishlistId: result.wishlist.id,
                    wishlistItemsMergedCount: result.mergedCount,
                    wishlistItemsSkippedCount: result.skippedCount,
                },
            });
        } else {
            await prisma.guestConversion.create({
                data: {
                    guestId,
                    guestWishlistId: result.guestWishlistId,
                    userId,
                    userWishlistId: result.wishlist.id,
                    triggerType,
                    mergeReason:
                        triggerType === "AUTO"
                            ? "Login ke time automatic wishlist merge"
                            : "Frontend ne explicitly /wishlist/merge call kiya",
                    wishlistItemsMergedCount: result.mergedCount,
                    wishlistItemsSkippedCount: result.skippedCount,
                    sessionId: context.sessionId ?? null,
                    deviceId: context.deviceId ?? null,
                    ipAddress: context.ipAddress ?? null,
                },
            });
        }
    }

    return result;
};