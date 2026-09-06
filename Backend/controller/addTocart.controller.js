


import prisma from "../config/prisma.js";
import { getOrCreateCart } from "../utils/cart.helper.js";
import { getRequestContext, getActorInfo } from "../utils/requestContext.util.js";
import { buildProductSnapshot, logCartActivity } from "../utils/activityLogger.util.js";
import { mergeGuestCartIntoUser } from "../utils/cartMerge.service.js";

// ================== ADD TO CART ==================
// Body: { productId, variantId, quantity (optional, default 1) }
export const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity } = req.body;

        if (!productId || !variantId) {
            return res.status(400).json({
                success: false,
                message: "productId aur variantId dono required hain"
            });
        }

        const qty = quantity ? Number(quantity) : 1;

        if (qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "quantity 1 ya usse zyada honi chahiye"
            });
        }

        // Variant valid hai aur isi product ka hai, ye verify karo
        const variant = await prisma.productVariant.findFirst({
            where: {
                id: Number(variantId),
                productId: Number(productId),
                isDelete: false
            },
            include: {
                product: true,
                images: { where: { isPrimary: true }, take: 1 },
            }
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Product variant nahi mila"
            });
        }

        if (variant.stock < qty) {
            return res.status(400).json({
                success: false,
                message: `Sirf ${variant.stock} stock available hai`
            });
        }

        const { cart, guestId, isNewGuest } = await getOrCreateCart(req);
        const { actorType, userId, guestId: actorGuestId } = getActorInfo(req);
        const context = getRequestContext(req);
        const snapshot = buildProductSnapshot(variant.product, variant);

        // Ye variant is cart mein already hai kya, check karo
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: variant.id
                }
            }
        });

        let cartItem;

        const result = await prisma.$transaction(async (tx) => {
            if (existingItem) {
                const newQty = existingItem.quantity + qty;

                if (newQty > variant.stock) {
                    throw { status: 400, message: `Cart mein total quantity stock (${variant.stock}) se zyada nahi ho sakti` };
                }

                const wasRemoved = existingItem.quantity === 0; // safety, generally row delete hoti hai

                cartItem = await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: newQty,
                        totalQuantityChanges: { increment: 1 },
                    }
                });

                await logCartActivity(tx, {
                    eventType: "UPDATE_QUANTITY",
                    actorType,
                    userId,
                    guestId: actorGuestId,
                    cartId: cart.id,
                    cartItemId: cartItem.id,
                    productId: Number(productId),
                    variantId: variant.id,
                    previousQuantity: existingItem.quantity,
                    newQuantity: newQty,
                    previousState: { quantity: existingItem.quantity },
                    currentState: { quantity: newQty },
                    productSnapshot: snapshot,
                    reason: "USER_ACTION",
                    context,
                });
            } else {
                cartItem = await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: Number(productId),
                        variantId: variant.id,
                        quantity: qty,
                        originallyAddedBy: actorType,
                        originalGuestId: actorType === "GUEST" ? actorGuestId : null,
                        firstAddedAt: new Date(),
                    }
                });

                await logCartActivity(tx, {
                    eventType: "ADD_TO_CART",
                    actorType,
                    userId,
                    guestId: actorGuestId,
                    cartId: cart.id,
                    cartItemId: cartItem.id,
                    productId: Number(productId),
                    variantId: variant.id,
                    previousQuantity: 0,
                    newQuantity: qty,
                    previousState: null,
                    currentState: { quantity: qty },
                    productSnapshot: snapshot,
                    reason: "USER_ACTION",
                    context,
                });
            }

            return cartItem;
        });

        return res.status(200).json({
            success: true,
            message: "Product cart mein add ho gaya",
            cartItem: result,
            ...(isNewGuest && { guestId })
        });

    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== GET CART ==================
// (Read-only hai, koi activity log nahi honi chahiye - warna GET call pe
// bhi table bhar jayega, jo galat hoga)
export const getCart = async (req, res) => {
    try {
        const { cart, guestId, isNewGuest } = await getOrCreateCart(req);

        const items = await prisma.cartItem.findMany({
            where: {
                cartId: cart.id
            },
            include: {
                product: {
                    select: {
                        id: true,
                        productName: true,
                        description: true,
                    }
                },
                variant: {
                    select: {
                        id: true,
                        description: true,
                        actualPrice: true,
                        mrp: true,
                        showMrp: true,
                        attributes: true,
                        images: {
                            where: {
                                isPrimary: true
                            },
                            select: {
                                imageUrl: true
                            },
                            take: 1
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const formattedItems = items.map((item) => ({
            cartItemId: item.id,
            cart: cart?.id,
            productId: item.product.id,
            productName: item.product.productName,
            productDescription: item.product.description,

            variantId: item.variant.id,
            variantDescription: item.variant.description,
            variantAttributes: item.variant.attributes,

            productImage:
                item.variant.images.length > 0
                    ? item.variant.images[0].imageUrl
                    : null,

            quantity: item.quantity,

            actualPrice: Number(item.variant.actualPrice),
            mrp: Number(item.variant.mrp),
            showMrp: item.variant.showMrp,

            totalPrice:
                Number(item.variant.actualPrice) * item.quantity
        }));

        const cartTotal = formattedItems.reduce((sum, i) => sum + i.totalPrice, 0);

        const totalAmount = formattedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const totalMrpAmount = formattedItems.reduce(
            (sum, item) => sum + (item.mrp || 0) * item.quantity,
            0
        );
        const totalSavings = totalMrpAmount - totalAmount;

        return res.status(200).json({
            success: true,
            items: formattedItems,
            totalItems: formattedItems.length,
            cartTotal,
            ...(isNewGuest && { guestId }),
            totalSavings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== INCREASE QUANTITY (by 1) ==================
export const increaseQuantity = async (req, res) => {
    try {
        const variantId = Number(req.params.variantId);
        const { cart } = await getOrCreateCart(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const item = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: { cartId: cart.id, variantId }
            },
            include: { variant: { include: { product: true, images: { where: { isPrimary: true }, take: 1 } } } }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Ye product cart mein nahi mila"
            });
        }

        if (item.quantity + 1 > item.variant.stock) {
            return res.status(400).json({
                success: false,
                message: `Sirf ${item.variant.stock} stock available hai`
            });
        }

        const snapshot = buildProductSnapshot(item.variant.product, item.variant);

        const updated = await prisma.$transaction(async (tx) => {
            const newItem = await tx.cartItem.update({
                where: { id: item.id },
                data: {
                    quantity: item.quantity + 1,
                    totalQuantityChanges: { increment: 1 },
                }
            });

            await logCartActivity(tx, {
                eventType: "INCREASE_QUANTITY",
                actorType,
                userId,
                guestId,
                cartId: cart.id,
                cartItemId: item.id,
                productId: item.productId,
                variantId,
                previousQuantity: item.quantity,
                newQuantity: item.quantity + 1,
                previousState: { quantity: item.quantity },
                currentState: { quantity: item.quantity + 1 },
                productSnapshot: snapshot,
                reason: "USER_ACTION",
                context,
            });

            return newItem;
        });

        return res.status(200).json({
            success: true,
            message: "Quantity 1 se badha di",
            cartItem: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== DECREASE QUANTITY (by 1) ==================
// Agar quantity 1 se 0 pe aati hai -> row hi delete ho jayegi
export const decreaseQuantity = async (req, res) => {
    try {
        const variantId = Number(req.params.variantId);
        const { cart } = await getOrCreateCart(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const item = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: { cartId: cart.id, variantId }
            },
            include: { variant: { include: { product: true, images: { where: { isPrimary: true }, take: 1 } } } }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Ye product cart mein nahi mila"
            });
        }

        const snapshot = buildProductSnapshot(item.variant.product, item.variant);

        if (item.quantity <= 1) {
            await prisma.$transaction(async (tx) => {
                await tx.cartItem.delete({ where: { id: item.id } });

                await logCartActivity(tx, {
                    eventType: "REMOVE_FROM_CART",
                    actorType,
                    userId,
                    guestId,
                    cartId: cart.id,
                    cartItemId: item.id,
                    productId: item.productId,
                    variantId,
                    previousQuantity: item.quantity,
                    newQuantity: 0,
                    previousState: { quantity: item.quantity },
                    currentState: null,
                    productSnapshot: snapshot,
                    reason: "USER_ACTION",
                    reasonNote: "Quantity 0 pe pahunchi, item auto-removed",
                    context,
                });
            });

            return res.status(200).json({
                success: true,
                message: "Quantity 0 ho gayi, product cart se remove ho gaya",
                removed: true
            });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const newItem = await tx.cartItem.update({
                where: { id: item.id },
                data: {
                    quantity: item.quantity - 1,
                    totalQuantityChanges: { increment: 1 },
                }
            });

            await logCartActivity(tx, {
                eventType: "DECREASE_QUANTITY",
                actorType,
                userId,
                guestId,
                cartId: cart.id,
                cartItemId: item.id,
                productId: item.productId,
                variantId,
                previousQuantity: item.quantity,
                newQuantity: item.quantity - 1,
                previousState: { quantity: item.quantity },
                currentState: { quantity: item.quantity - 1 },
                productSnapshot: snapshot,
                reason: "USER_ACTION",
                context,
            });

            return newItem;
        });

        return res.status(200).json({
            success: true,
            message: "Quantity 1 se kam ki",
            cartItem: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== REMOVE ITEM DIRECTLY ==================
export const removeCartItem = async (req, res) => {
    try {
        const variantId = Number(req.params.variantId);
        const { cart } = await getOrCreateCart(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const item = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: { cartId: cart.id, variantId }
            },
            include: { variant: { include: { product: true, images: { where: { isPrimary: true }, take: 1 } } } }
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Ye product cart mein nahi mila"
            });
        }

        const snapshot = buildProductSnapshot(item.variant.product, item.variant);

        await prisma.$transaction(async (tx) => {
            await tx.cartItem.delete({ where: { id: item.id } });

            await logCartActivity(tx, {
                eventType: "REMOVE_FROM_CART",
                actorType,
                userId,
                guestId,
                cartId: cart.id,
                cartItemId: item.id,
                productId: item.productId,
                variantId,
                previousQuantity: item.quantity,
                newQuantity: 0,
                previousState: { quantity: item.quantity },
                currentState: null,
                productSnapshot: snapshot,
                reason: "USER_ACTION",
                reasonNote: "User ne direct remove button dabaya",
                context,
            });
        });

        return res.status(200).json({
            success: true,
            message: "Product cart se hata diya gaya (chahe kitni bhi quantity thi)"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== CLEAR ENTIRE CART ==================
export const clearCart = async (req, res) => {
    try {
        const { cart } = await getOrCreateCart(req);
        const { actorType, userId, guestId } = getActorInfo(req);
        const context = getRequestContext(req);

        const items = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: { variant: { include: { product: true, images: { where: { isPrimary: true }, take: 1 } } } }
        });

        if (items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart pehle se hi khali hai"
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            // Har item ke liye alag CLEAR_CART event - taaki "kaunse products
            // clear hue" ye bhi permanently pata rahe (sirf ek generic event
            // se ye detail kho jaati)
            for (const item of items) {
                await logCartActivity(tx, {
                    eventType: "CLEAR_CART",
                    actorType,
                    userId,
                    guestId,
                    cartId: cart.id,
                    cartItemId: item.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    previousQuantity: item.quantity,
                    newQuantity: 0,
                    previousState: { quantity: item.quantity },
                    currentState: null,
                    productSnapshot: buildProductSnapshot(item.variant.product, item.variant),
                    reason: "CLEAR_ACTION",
                    context,
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Pura cart empty kar diya gaya"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 👇 addTocart.controller.js me clearCart function ke turant baad ye add karo

// ================== GET CART ACTIVITY HISTORY ==================
// (GET /api/cartItem/history?productId=optional)
// Poori timeline - kab add hua, increase/decrease kab hua, guest tha ya user tha,
// remove kaise hua (single ya clear-all se), kis page se add hua
export const getCartActivityHistory = async (req, res) => {
    try {
        const { userId, guestId } = getActorInfo(req);
        const { productId } = req.query;

        if (!userId && !guestId) {
            return res.status(200).json({ success: true, activities: [] });
        }

        const activities = await prisma.cartActivity.findMany({
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

// ================== MERGE GUEST CART WITH USER (manual endpoint) ==================
// Ye "MANUAL" trigger hai - jab frontend explicitly ye endpoint call karta hai
// (login ke time wala automatic merge alag hai - auth.controller.js me,
// jo isi service ka "AUTO" trigger use karta hai)
export const mergeGuestCart = async (req, res) => {
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

        const result = await mergeGuestCartIntoUser(userId, guestId, context, "MANUAL");

        return res.status(200).json({
            success: true,
            message: result.merged
                ? "Guest cart user cart me merge ho gaya"
                : "Koi guest cart nahi mila, user cart bheja gaya",
            cart: result.cart,
            items: result.items,
        });
    } catch (error) {
        console.error("Error in mergeGuestCart:", error);
        return res.status(500).json({
            success: false,
            message: "Cart merge karte waqt error aaya",
            error: error.message,
        });
    }
};

