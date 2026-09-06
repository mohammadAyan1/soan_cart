// 📁 Save at: utils/cartMerge.service.js
//
// Guest cart ko User cart me merge karne ka SAARA logic yahan hai -
// isko login controller aur /api/cart/merge endpoint dono use karte hain.
// Isse duplicate code nahi likhna padta, aur dono jagah se merge
// consistently activity-logged hota hai.

import prisma from "../config/prisma.js";
import { buildProductSnapshot, logCartActivity } from "./activityLogger.util.js";

/**
 * @param {number} userId
 * @param {string} guestId
 * @param {object} context - { sessionId, deviceId, ipAddress, platform, userAgent, sourceScreen }
 * @param {"AUTO"|"MANUAL"} triggerType - AUTO = login ke time automatic, MANUAL = explicit endpoint call
 * @returns {object} { merged, cart, items, mergedCount, skippedCount, guestCartId }
 */
export const mergeGuestCartIntoUser = async (userId, guestId, context = {}, triggerType = "AUTO") => {
    if (!guestId) {
        const userCart = await prisma.cart.upsert({
            where: { userId },
            update: {},
            create: { userId },
            include: { items: true },
        });
        return { merged: false, cart: userCart, items: userCart.items, mergedCount: 0, skippedCount: 0, guestCartId: null };
    }

    const result = await prisma.$transaction(async (tx) => {
        const guestCart = await tx.cart.findUnique({
            where: { guestId },
            include: { items: { include: { variant: { include: { product: true } } } } },
        });

        let userCart = await tx.cart.findUnique({ where: { userId } });

        // Guest cart hi nahi mila - kuch merge karne ko nahi
        if (!guestCart) {
            if (!userCart) {
                userCart = await tx.cart.create({ data: { userId } });
            }
            const items = await tx.cartItem.findMany({ where: { cartId: userCart.id } });
            return { cart: userCart, items, merged: false, mergedCount: 0, skippedCount: 0, guestCartId: null };
        }

        let mergedCount = 0;
        let skippedCount = 0;

        // User ka cart abhi tak nahi bana - guest cart ko hi promote kar do
        if (!userCart) {
            userCart = await tx.cart.update({
                where: { id: guestCart.id },
                data: { userId, guestId: null },
            });

            for (const item of guestCart.items) {
                await tx.cartItem.update({
                    where: { id: item.id },
                    data: {
                        convertedAt: new Date(),
                        convertedSessionId: context.sessionId ?? null,
                        convertedDeviceId: context.deviceId ?? null,
                        convertedUserId: userId,
                    },
                });

                await logCartActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    cartId: userCart.id,
                    cartItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousQuantity: item.quantity,
                    newQuantity: item.quantity,
                    previousState: { cartId: guestCart.id, ownedBy: "GUEST" },
                    currentState: { cartId: userCart.id, ownedBy: "USER" },
                    productSnapshot: buildProductSnapshot(item.variant.product, item.variant),
                    reason: "GUEST_MERGE",
                    context,
                });

                mergedCount++;
            }

            const items = await tx.cartItem.findMany({ where: { cartId: userCart.id } });
            return { cart: userCart, items, merged: true, mergedCount, skippedCount, guestCartId: guestCart.id };
        }

        // Dono cart maujood hain -> item by item merge karo
        for (const item of guestCart.items) {
            const existingUserItem = await tx.cartItem.findUnique({
                where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
            });

            const snapshot = buildProductSnapshot(item.variant.product, item.variant);

            if (existingUserItem) {
                const mergedQty = existingUserItem.quantity + item.quantity;

                await tx.cartItem.update({
                    where: { id: existingUserItem.id },
                    data: {
                        quantity: mergedQty,
                        totalQuantityChanges: { increment: 1 },
                    },
                });

                await logCartActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    cartId: userCart.id,
                    cartItemId: existingUserItem.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousQuantity: existingUserItem.quantity,
                    newQuantity: mergedQty,
                    previousState: { quantity: existingUserItem.quantity },
                    currentState: { quantity: mergedQty },
                    productSnapshot: snapshot,
                    reason: "GUEST_MERGE",
                    reasonNote: "Guest item quantity user ke existing item me jud gayi",
                    context,
                });

                await tx.cartItem.delete({ where: { id: item.id } });
                skippedCount++;
            } else {
                await tx.cartItem.update({
                    where: { id: item.id },
                    data: {
                        cartId: userCart.id,
                        convertedAt: new Date(),
                        convertedSessionId: context.sessionId ?? null,
                        convertedDeviceId: context.deviceId ?? null,
                        convertedUserId: userId,
                    },
                });

                await logCartActivity(tx, {
                    eventType: "MERGED_TO_USER",
                    actorType: "USER",
                    userId,
                    guestId,
                    cartId: userCart.id,
                    cartItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousQuantity: item.quantity,
                    newQuantity: item.quantity,
                    previousState: { cartId: guestCart.id },
                    currentState: { cartId: userCart.id },
                    productSnapshot: snapshot,
                    reason: "GUEST_MERGE",
                    context,
                });

                mergedCount++;
            }
        }

        await tx.cart.delete({ where: { id: guestCart.id } });

        const finalItems = await tx.cartItem.findMany({ where: { cartId: userCart.id } });
        return { cart: userCart, items: finalItems, merged: true, mergedCount, skippedCount, guestCartId: guestCart.id };
    });

    // GuestConversion permanent record - transaction ke bahar (log fail hone se
    // actual merge revert nahi hona chahiye)
    if (result.merged) {
        await prisma.guestConversion.create({
            data: {
                guestId,
                guestCartId: result.guestCartId,
                userId,
                userCartId: result.cart.id,
                triggerType,
                mergeReason:
                    triggerType === "AUTO"
                        ? "Login ke time automatic cart merge"
                        : "Frontend ne explicitly /cart/merge call kiya",
                cartItemsMergedCount: result.mergedCount,
                cartItemsSkippedCount: result.skippedCount,
                sessionId: context.sessionId ?? null,
                deviceId: context.deviceId ?? null,
                ipAddress: context.ipAddress ?? null,
            },
        });
    }

    return result;
};