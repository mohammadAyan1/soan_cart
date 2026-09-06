// 📁 Save at: utils/activityLogger.util.js
//
// Ye file CartActivity / WishlistActivity table me event insert karti hai.
// IMPORTANT: Ye functions sirf INSERT karte hain, kabhi update/delete nahi -
// yehi to poore event-sourcing ka core rule hai.
//
// Dono functions ek `tx` (Prisma transaction client) accept karte hain -
// taaki activity insert hamesha usi transaction ke andar ho jisme
// actual cart/wishlist change ho raha hai. Agar transaction fail hua,
// to activity bhi rollback ho jayegi (consistency guaranteed).
// Agar transaction nahi chahiye kisi jagah, seedha `prisma` bhi pass kar sakte ho.

// Product + Variant ka immutable snapshot banata hai - taaki product
// baad me edit/delete ho jaye, tab bhi history me ye purana data safe rahe
export const buildProductSnapshot = (product, variant) => {
    return {
        productId: product?.id ?? null,
        productName: product?.productName ?? null,
        variantId: variant?.id ?? null,
        description: variant?.description ?? null,
        attributes: variant?.attributes ?? null,
        actualPrice: variant?.actualPrice ? Number(variant.actualPrice) : null,
        mrp: variant?.mrp ? Number(variant.mrp) : null,
        stock: variant?.stock ?? null,
        imageUrl: variant?.images?.[0]?.imageUrl ?? null,
        capturedAt: new Date().toISOString(),
    };
};

/**
 * CartActivity insert karo
 * @param {object} tx - Prisma client ya transaction client
 * @param {object} params
 */
export const logCartActivity = async (tx, {
    eventType,
    actorType,
    userId = null,
    guestId = null,
    cartId,
    cartItemId = null,
    productId,
    variantId,
    previousQuantity = null,
    newQuantity = null,
    previousState = null,
    currentState = null,
    productSnapshot,
    reason = null,
    reasonNote = null,
    context = {}, // { sessionId, deviceId, platform, ipAddress, userAgent, sourceScreen }
}) => {
    return tx.cartActivity.create({
        data: {
            eventType,
            actorType,
            userId,
            guestId,
            cartId,
            cartItemId,
            productId,
            variantId,
            previousQuantity,
            newQuantity,
            previousState: previousState ?? undefined,
            currentState: currentState ?? undefined,
            productSnapshot,
            reason,
            reasonNote,
            sessionId: context.sessionId ?? null,
            deviceId: context.deviceId ?? null,
            platform: context.platform ?? null,
            ipAddress: context.ipAddress ?? null,
            userAgent: context.userAgent ?? null,
            sourceScreen: context.sourceScreen ?? null,
        },
    });
};

/**
 * WishlistActivity insert karo
 */
export const logWishlistActivity = async (tx, {
    eventType,
    actorType,
    userId = null,
    guestId = null,
    wishlistId,
    wishlistItemId = null,
    productId,
    variantId,
    previousState = null,
    currentState = null,
    productSnapshot,
    reason = null,
    reasonNote = null,
    context = {},
}) => {
    return tx.wishlistActivity.create({
        data: {
            eventType,
            actorType,
            userId,
            guestId,
            wishlistId,
            wishlistItemId,
            productId,
            variantId,
            previousState: previousState ?? undefined,
            currentState: currentState ?? undefined,
            productSnapshot,
            reason,
            reasonNote,
            sessionId: context.sessionId ?? null,
            deviceId: context.deviceId ?? null,
            platform: context.platform ?? null,
            ipAddress: context.ipAddress ?? null,
            userAgent: context.userAgent ?? null,
            sourceScreen: context.sourceScreen ?? null,
        },
    });
};