

import { prisma, DeliveryStatus, PaymentStatus, OrderType } from "../config/prisma.js";

// ------------------------------------------------------------------
// Helper: unique order number generator
// ------------------------------------------------------------------
function generateOrderNumber() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `ORD-${ts}-${rand}`;
}

const RETURN_FLOW_STATUSES = [
    DeliveryStatus.RETURN_REQUESTED,
    DeliveryStatus.RETURN_ACCEPTED,
    DeliveryStatus.RETURN_REJECTED,
    DeliveryStatus.RETURNED,
];

// Helper - kya ye product user ke wishlist me hai
async function checkWasInWishlist(tx, userId, variantId) {
    if (!userId) return false;
    const wishlist = await tx.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return false;
    const item = await tx.wishlistItem.findUnique({
        where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
    });
    return !!item;
}

// ==================================================================
// 1) CHECKOUT FROM CART  (POST /api/orders/checkout/cart)
//    Body me ab optional "sourceScreen" bhi le sakte ho (e.g. "cart_page")
// ==================================================================
export const checkoutFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, addressLine, city, state, pincode, orderType, sourceScreen } = req.body;

        if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: "Address ki saari fields required hai" });
        }
        if (!orderType || !Object.values(OrderType).includes(orderType)) {
            return res.status(400).json({ success: false, message: "orderType ONLINE ya COD hona chahiye" });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart khali hai" });
        }

        for (const item of cart.items) {
            if (item.variant.isDelete) {
                return res.status(400).json({ success: false, message: `Ek product available nahi hai (variant #${item.variantId})` });
            }
            if (item.variant.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${item.product.productName} ka stock kam hai. Available: ${item.variant.stock}`,
                });
            }
        }

        const totalAmount = cart.items.reduce(
            (sum, item) => sum + Number(item.variant.actualPrice) * item.quantity,
            0
        );

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId,
                    totalAmount,
                    paymentStatus: PaymentStatus.PENDING,
                    orderType,
                    orderSource: "CART",                      // 👈 NAYA
                    sourceScreen: sourceScreen || "cart_page", // 👈 NAYA
                    fullName,
                    phone,
                    addressLine,
                    city,
                    state,
                    pincode,
                },
            });

            for (const item of cart.items) {
                const wasInWishlist = await checkWasInWishlist(tx, userId, item.variantId);

                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        vendorId: item.product.userId,
                        quantity: item.quantity,
                        price: item.variant.actualPrice,
                        deliveryStatus: DeliveryStatus.PENDING,
                        fromWishlist: wasInWishlist, // 👈 NAYA
                    },
                });

                await tx.orderItemStatusHistory.create({
                    data: {
                        orderItemId: orderItem.id,
                        status: DeliveryStatus.PENDING,
                        note: "Order placed",
                    },
                });

                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } },
                });

                // 👇 NAYA - is cart item ka SABSE PEHLA ADD_TO_CART event dhundo,
                // taaki pata chale ye product kis page se add hua tha
                const originAddEvent = await tx.cartActivity.findFirst({
                    where: { cartItemId: item.id, eventType: "ADD_TO_CART" },
                    orderBy: { createdAt: "asc" },
                });

                // 👇 NAYA - PurchaseJourney record banao (cart-activity -> order ka exact link)
                await tx.purchaseJourney.create({
                    data: {
                        orderId: newOrder.id,
                        orderItemId: orderItem.id,
                        originCartActivityId: originAddEvent?.id ?? null,
                        cartId: cart.id,
                        cartItemId: item.id,
                        userId,
                        guestId: item.originalGuestId ?? null,
                        productId: item.productId,
                        variantId: item.variantId,
                        purchasedQuantity: item.quantity,
                        purchasedPrice: item.variant.actualPrice,
                        paymentMethod: orderType,
                        wasInWishlist,
                        addedFromScreen: originAddEvent?.sourceScreen ?? null,
                    },
                });

                // 👇 NAYA - is cart item ke liye ORDER_CREATED activity bhi log karo
                await tx.cartActivity.create({
                    data: {
                        eventType: "ORDER_CREATED",
                        actorType: "USER",
                        userId,
                        cartId: cart.id,
                        cartItemId: item.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        previousQuantity: item.quantity,
                        newQuantity: 0,
                        previousState: { quantity: item.quantity },
                        currentState: { orderId: newOrder.id, orderItemId: orderItem.id },
                        productSnapshot: {
                            productId: item.product.id,
                            productName: item.product.productName,
                            variantId: item.variant.id,
                            actualPrice: Number(item.variant.actualPrice),
                            capturedAt: new Date().toISOString(),
                        },
                        reason: "CHECKOUT",
                        reasonNote: "Cart checkout se order ban gaya",
                        sourceScreen: sourceScreen || "cart_page",
                    },
                });
            }

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        });

        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { product: true, variant: true } } },
        });

        return res.status(201).json({ success: true, message: "Order successfully placed", data: fullOrder });
    } catch (error) {
        console.error("checkoutFromCart error:", error);
        return res.status(500).json({ success: false, message: `Order create karne me error aaya ${error?.message}` });
    }
};

// ==================================================================
// 2) DIRECT SINGLE PRODUCT CHECKOUT (POST /api/orders/checkout/direct)
//    Body me ab optional "sourceScreen" bhi le sakte ho (e.g. "product_detail_page")
// ==================================================================
export const checkoutSingleProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            productId,
            variantId,
            quantity,
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            orderType,
            sourceScreen,
        } = req.body;

        if (!productId || !variantId) {
            return res.status(400).json({ success: false, message: "productId aur variantId required hai" });
        }
        if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: "Address ki saari fields required hai" });
        }
        if (!orderType || !Object.values(OrderType).includes(orderType)) {
            return res.status(400).json({ success: false, message: "orderType ONLINE ya COD hona chahiye" });
        }

        const qty = Number(quantity) > 0 ? Number(quantity) : 1;

        const variant = await prisma.productVariant.findUnique({
            where: { id: Number(variantId) },
            include: { product: true },
        });

        if (!variant || variant.isDelete || variant.productId !== Number(productId)) {
            return res.status(404).json({ success: false, message: "Product variant nahi mila" });
        }
        if (variant.stock < qty) {
            return res.status(400).json({ success: false, message: `Stock kam hai. Available: ${variant.stock}` });
        }

        const totalAmount = Number(variant.actualPrice) * qty;

        const order = await prisma.$transaction(async (tx) => {
            const wasInWishlist = await checkWasInWishlist(tx, userId, variant.id);

            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId,
                    totalAmount,
                    paymentStatus: PaymentStatus.PENDING,
                    orderType,
                    orderSource: "DIRECT",                              // 👈 NAYA
                    sourceScreen: sourceScreen || "product_detail_page", // 👈 NAYA
                    fullName,
                    phone,
                    addressLine,
                    city,
                    state,
                    pincode,
                },
            });

            const orderItem = await tx.orderItem.create({
                data: {
                    orderId: newOrder.id,
                    productId: variant.productId,
                    variantId: variant.id,
                    vendorId: variant.product.userId,
                    quantity: qty,
                    price: variant.actualPrice,
                    deliveryStatus: DeliveryStatus.PENDING,
                    fromWishlist: wasInWishlist, // 👈 NAYA
                },
            });

            await tx.orderItemStatusHistory.create({
                data: {
                    orderItemId: orderItem.id,
                    status: DeliveryStatus.PENDING,
                    note: "Order placed",
                },
            });

            await tx.productVariant.update({
                where: { id: variant.id },
                data: { stock: { decrement: qty } },
            });

            // 👇 NAYA - direct order ka bhi PurchaseJourney banega (bina cart involve kiye)
            await tx.purchaseJourney.create({
                data: {
                    orderId: newOrder.id,
                    orderItemId: orderItem.id,
                    originCartActivityId: null,
                    cartId: null,
                    cartItemId: null,
                    userId,
                    guestId: null,
                    productId: variant.productId,
                    variantId: variant.id,
                    purchasedQuantity: qty,
                    purchasedPrice: variant.actualPrice,
                    paymentMethod: orderType,
                    wasInWishlist,
                    addedFromScreen: sourceScreen || "product_detail_page",
                },
            });

            return newOrder;
        });

        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { product: true, variant: true } } },
        });

        return res.status(201).json({ success: true, message: "Order successfully placed", data: fullOrder });
    } catch (error) {
        console.error("checkoutSingleProduct error:", error);
        return res.status(500).json({ success: false, message: "Order create karne me error aaya" });
    }
};

// ==================================================================
// Helper - order ke items me purchaseJourney (source info) attach karo
// (koi hard FK relation nahi hai, isliye manually merge kar rahe hai)
// ==================================================================
async function attachPurchaseJourneys(orders) {
    const isArray = Array.isArray(orders);
    const orderList = isArray ? orders : [orders];
    if (orderList.length === 0) return orders;

    const orderIds = orderList.map((o) => o.id);
    const journeys = await prisma.purchaseJourney.findMany({
        where: { orderId: { in: orderIds } },
    });

    const journeyMap = new Map();
    for (const j of journeys) {
        journeyMap.set(j.orderItemId, j);
    }

    for (const order of orderList) {
        order.items = order.items.map((item) => {
            const journey = journeyMap.get(item.id);
            return {
                ...item,
                sourceInfo: journey
                    ? {
                        addedFromScreen: journey.addedFromScreen,
                        wasInWishlist: journey.wasInWishlist,
                        fromCart: !!journey.cartItemId,
                        originCartActivityId: journey.originCartActivityId,
                    }
                    : null,
            };
        });
        order.orderSourceInfo = {
            orderSource: order.orderSource,
            sourceScreen: order.sourceScreen,
        };
    }

    return isArray ? orderList : orderList[0];
}

// ==================================================================
// 3) USER: apne saare orders dekhna (GET /api/orders/my-orders)
// ==================================================================
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { userId, isDelete: false },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, productName: true, imageUrl: true } },
                        variant: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1
                                }
                            }
                        },
                        vendor: { select: { id: true, fullName: true } },
                        statusHistory: { orderBy: { changedAt: "asc" } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const ordersWithSource = await attachPurchaseJourneys(orders);

        return res.status(200).json({ success: true, data: ordersWithSource });
    } catch (error) {
        console.error("getMyOrders error:", error);
        return res.status(500).json({ success: false, message: "Orders fetch karne me error aaya" });
    }
};

// Single order detail (GET /api/orders/my-orders/:orderId)
export const getMyOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = Number(req.params.orderId);

        const order = await prisma.order.findFirst({
            where: { userId, isDelete: false },
            include: {
                items: {
                    include: {
                        product: { select: { id: true, productName: true, imageUrl: true } },
                        variant: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1
                                }
                            }
                        },
                        vendor: { select: { id: true, fullName: true } },
                        statusHistory: { orderBy: { changedAt: "asc" } },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order nahi mila" });
        }

        const orderWithSource = await attachPurchaseJourneys(order);

        return res.status(200).json({ success: true, data: orderWithSource });
    } catch (error) {
        console.error("getMyOrderById error:", error);
        return res.status(500).json({ success: false, message: "Order fetch karne me error aaya" });
    }
};

// ==================================================================
// 4) USER: return request daalna (PATCH /api/orders/items/:orderItemId/return-request)
// ==================================================================
export const requestReturn = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderItemId = Number(req.params.orderItemId);
        const { note } = req.body;

        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
            include: { order: true },
        });

        if (!orderItem || orderItem.order.userId !== userId) {
            return res.status(404).json({ success: false, message: "Order item nahi mila" });
        }
        if (orderItem.deliveryStatus !== DeliveryStatus.DELIVERED) {
            return res.status(400).json({ success: false, message: "Sirf delivered product ka hi return request ho sakta hai" });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.update({
                where: { id: orderItemId },
                data: { deliveryStatus: DeliveryStatus.RETURN_REQUESTED },
            });
            await tx.orderItemStatusHistory.create({
                data: {
                    orderItemId,
                    status: DeliveryStatus.RETURN_REQUESTED,
                    note: note || "Return requested by user",
                },
            });
            return item;
        });

        return res.status(200).json({ success: true, message: "Return request submit ho gayi", data: updated });
    } catch (error) {
        console.error("requestReturn error:", error);
        return res.status(500).json({ success: false, message: "Return request me error aaya" });
    }
};

// ==================================================================
// 5) VENDOR/ADMIN: return request accept/reject
// ==================================================================
export const respondToReturn = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const { action, note } = req.body;
        const orderItemId = Number(req.params.orderItemId);

        if (!["ACCEPT", "REJECT"].includes(action)) {
            return res.status(400).json({ success: false, message: "action ACCEPT ya REJECT hona chahiye" });
        }

        const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
        if (!orderItem) {
            return res.status(404).json({ success: false, message: "Order item nahi mila" });
        }

        if (req.user.role === "VENDOR" && orderItem.vendorId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Ye order item aapka nahi hai" });
        }
        if (orderItem.deliveryStatus !== DeliveryStatus.RETURN_REQUESTED) {
            return res.status(400).json({ success: false, message: "Is item par koi pending return request nahi hai" });
        }

        const newStatus = action === "ACCEPT" ? DeliveryStatus.RETURN_ACCEPTED : DeliveryStatus.RETURN_REJECTED;

        const updated = await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.update({
                where: { id: orderItemId },
                data: { deliveryStatus: newStatus },
            });
            await tx.orderItemStatusHistory.create({
                data: { orderItemId, status: newStatus, note: note || `Return ${action.toLowerCase()}ed` },
            });
            return item;
        });

        return res.status(200).json({ success: true, message: `Return ${action.toLowerCase()}ed`, data: updated });
    } catch (error) {
        console.error("respondToReturn error:", error);
        return res.status(500).json({ success: false, message: "Return response me error aaya" });
    }
};

export const confirmReturned = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const orderItemId = Number(req.params.orderItemId);
        const { note } = req.body;

        const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
        if (!orderItem) {
            return res.status(404).json({ success: false, message: "Order item nahi mila" });
        }
        if (req.user.role === "VENDOR" && orderItem.vendorId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Ye order item aapka nahi hai" });
        }
        if (orderItem.deliveryStatus !== DeliveryStatus.RETURN_ACCEPTED) {
            return res.status(400).json({ success: false, message: "Return pehle accept hona chahiye" });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.update({
                where: { id: orderItemId },
                data: { deliveryStatus: DeliveryStatus.RETURNED },
            });
            await tx.orderItemStatusHistory.create({
                data: { orderItemId, status: DeliveryStatus.RETURNED, note: note || "Product returned & received back" },
            });
            await tx.productVariant.update({
                where: { id: orderItem.variantId },
                data: { stock: { increment: orderItem.quantity } },
            });
            return item;
        });

        return res.status(200).json({ success: true, message: "Return confirm ho gaya", data: updated });
    } catch (error) {
        console.error("confirmReturned error:", error);
        return res.status(500).json({ success: false, message: "Return confirm karne me error aaya" });
    }
};

export const updateOrderItemStatus = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const orderItemId = Number(req.params.orderItemId);
        const { status, note, expectedDeliveryDate } = req.body;

        if (status && !Object.values(DeliveryStatus).includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        if (status && RETURN_FLOW_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Return se related status yaha se change nahi hote, return endpoints use karo",
            });
        }

        const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
        if (!orderItem) {
            return res.status(404).json({ success: false, message: "Order item nahi mila" });
        }

        if (req.user.role === "VENDOR" && orderItem.vendorId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Ye order item aapka nahi hai" });
        }

        const dataToUpdate = {};
        if (status) dataToUpdate.deliveryStatus = status;
        if (expectedDeliveryDate) dataToUpdate.expectedDeliveryDate = new Date(expectedDeliveryDate);

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ success: false, message: "status ya expectedDeliveryDate me se kam se kam ek dena hoga" });
        }

        const updated = await prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.update({
                where: { id: orderItemId },
                data: dataToUpdate,
            });

            if (status) {
                await tx.orderItemStatusHistory.create({
                    data: { orderItemId, status, note: note || null },
                });
            }

            return item;
        });

        return res.status(200).json({ success: true, message: "Order item update ho gaya", data: updated });
    } catch (error) {
        console.error("updateOrderItemStatus error:", error);
        return res.status(500).json({ success: false, message: "Status update karne me error aaya" });
    }
};



export const getAllOrdersAdmin = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const { active, vendorId, userId, status, fromDate, toDate } = req.query;
        const isActive = active === "true";

        // ---------- Dynamic item-level filter (vendor + delivery status) ----------
        const itemsFilter = {};
        if (vendorId) itemsFilter.vendorId = Number(vendorId);
        if (status) itemsFilter.deliveryStatus = status;

        const hasItemsFilter = Object.keys(itemsFilter).length > 0;

        // ---------- 👇 NAYA - Date range filter (order ki createdAt pe) ----------
        const dateFilter = {};
        if (fromDate) dateFilter.gte = new Date(fromDate);
        if (toDate) {
            // poora din cover karne ke liye end of day tak (23:59:59)
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }
        const hasDateFilter = Object.keys(dateFilter).length > 0;

        // ---------- Order level where ----------
        const whereClause = {
            isDelete: isActive,
            ...(userId && { userId: Number(userId) }),
            ...(hasDateFilter && { createdAt: dateFilter }), // 👈 NAYA
            ...(hasItemsFilter && {
                items: { some: itemsFilter },
            }),
        };

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    user: { select: { id: true, fullName: true, email: true, phone: true } },
                    items: {
                        where: hasItemsFilter ? itemsFilter : undefined,
                        include: {
                            product: { select: { id: true, productName: true } },
                            variant: true,
                            vendor: { select: { id: true, fullName: true } },
                            statusHistory: { orderBy: { changedAt: "asc" } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where: whereClause }),
        ]);

        // ---------- 👇 NAYA - Har order aur har item ke sath price + profit calculate karo ----------
        // profitAmount (line-wise)     = (actualPrice - vendorMinPrice) * quantity
        // profitPercentage (line-wise) = ((actualPrice - vendorMinPrice) / vendorMinPrice) * 100
        const ordersWithProfit = orders.map((order) => {
            let orderActualTotal = 0;
            let orderMrpTotal = 0;
            let orderVendorMinTotal = 0;
            let orderProfitAmount = 0;

            const itemsWithProfit = order.items.map((item) => {
                const actualPrice = Number(item.price); // order ke time ka locked price
                const mrp = Number(item.variant?.mrp || 0);
                const vendorMinPrice = Number(item.variant?.vendorMinPrice || 0);
                const qty = item.quantity;

                const lineActualTotal = actualPrice * qty;
                const lineMrpTotal = mrp * qty;
                const lineVendorMinTotal = vendorMinPrice * qty;
                const lineProfitAmount = lineActualTotal - lineVendorMinTotal;
                const lineProfitPercentage =
                    vendorMinPrice > 0 ? ((actualPrice - vendorMinPrice) / vendorMinPrice) * 100 : 0;

                orderActualTotal += lineActualTotal;
                orderMrpTotal += lineMrpTotal;
                orderVendorMinTotal += lineVendorMinTotal;
                orderProfitAmount += lineProfitAmount;

                return {
                    ...item,
                    priceDetails: {
                        actualPrice,
                        mrp,
                        vendorMinPrice,
                        quantity: qty,
                        lineActualTotal: Number(lineActualTotal.toFixed(2)),
                        lineMrpTotal: Number(lineMrpTotal.toFixed(2)),
                        lineVendorMinTotal: Number(lineVendorMinTotal.toFixed(2)),
                        profitAmount: Number(lineProfitAmount.toFixed(2)),
                        profitPercentage: Number(lineProfitPercentage.toFixed(2)),
                    },
                };
            });

            const orderProfitPercentage =
                orderVendorMinTotal > 0 ? (orderProfitAmount / orderVendorMinTotal) * 100 : 0;

            return {
                ...order,
                items: itemsWithProfit,
                orderSummary: {
                    actualTotal: Number(orderActualTotal.toFixed(2)),
                    mrpTotal: Number(orderMrpTotal.toFixed(2)),
                    vendorMinTotal: Number(orderVendorMinTotal.toFixed(2)),
                    profitAmount: Number(orderProfitAmount.toFixed(2)),
                    profitPercentage: Number(orderProfitPercentage.toFixed(2)),
                },
            };
        });

        // ---------- 👇 NAYA - Poore FILTERED data ka overall summary (pagination se independent) ----------
        // Directly OrderItem se query kar rahe hai - taaki jitna bhi filter lage (vendor/status/user/date),
        // uska PURA sum aaye - screen pe 10 dikhein ya 20, sum saare matching data ka hi hoga.
        const summaryItems = await prisma.orderItem.findMany({
            where: {
                ...itemsFilter,
                order: {
                    isDelete: isActive,
                    ...(userId && { userId: Number(userId) }),
                    ...(hasDateFilter && { createdAt: dateFilter }),
                },
            },
            select: {
                price: true,
                quantity: true,
                variant: { select: { mrp: true, vendorMinPrice: true } },
            },
        });

        let summaryActualTotal = 0;
        let summaryMrpTotal = 0;
        let summaryVendorMinTotal = 0;

        for (const item of summaryItems) {
            const actualPrice = Number(item.price);
            const mrp = Number(item.variant?.mrp || 0);
            const vendorMinPrice = Number(item.variant?.vendorMinPrice || 0);
            const qty = item.quantity;

            summaryActualTotal += actualPrice * qty;
            summaryMrpTotal += mrp * qty;
            summaryVendorMinTotal += vendorMinPrice * qty;
        }

        const summaryProfitAmount = summaryActualTotal - summaryVendorMinTotal;
        const summaryProfitPercentage =
            summaryVendorMinTotal > 0 ? (summaryProfitAmount / summaryVendorMinTotal) * 100 : 0;

        return res.status(200).json({
            success: true,
            data: ordersWithProfit,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            summary: {
                itemCount: summaryItems.length,
                actualTotal: Number(summaryActualTotal.toFixed(2)),
                mrpTotal: Number(summaryMrpTotal.toFixed(2)),
                vendorMinTotal: Number(summaryVendorMinTotal.toFixed(2)),
                profitAmount: Number(summaryProfitAmount.toFixed(2)),
                profitPercentage: Number(summaryProfitPercentage.toFixed(2)),
            },
        });
    } catch (error) {
        console.error("getAllOrdersAdmin error:", error);
        return res.status(500).json({ success: false, message: "Orders fetch karne me error aaya" });
    }
};


export const getVendorSalesStatsAdmin = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }
        const vendorGrouped = await prisma.orderItem.groupBy({
            by: ["vendorId"],
            _sum: { quantity: true, price: true },
            _count: { id: true },
        });

        const vendorIds = vendorGrouped.map((v) => v.vendorId);
        const vendors = await prisma.user.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, fullName: true, email: true, phone: true },
        });

        const result = await Promise.all(
            vendorGrouped.map(async (v) => {
                const vendorInfo = vendors.find((u) => u.id === v.vendorId);

                const buyers = await prisma.orderItem.findMany({
                    where: { vendorId: v.vendorId },
                    include: {
                        order: { include: { user: { select: { id: true, fullName: true, email: true } } } },
                        product: { select: { id: true, productName: true } },
                    },
                });

                const uniqueBuyersMap = new Map();
                buyers.forEach((item) => {
                    uniqueBuyersMap.set(item.order.user.id, item.order.user);
                });

                return {
                    vendor: vendorInfo,
                    totalItemsSold: v._sum.quantity || 0,
                    totalOrderItems: v._count.id,
                    totalRevenue: v._sum.price ? Number(v._sum.price) : 0,
                    buyers: Array.from(uniqueBuyersMap.values()),
                    soldDetails: buyers.map((b) => ({
                        product: b.product.productName,
                        quantity: b.quantity,
                        price: b.price,
                        buyer: b.order.user.fullName,
                        deliveryStatus: b.deliveryStatus,
                    })),
                };
            })
        );

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("getVendorSalesStatsAdmin error:", error);
        return res.status(500).json({ success: false, message: "Vendor stats fetch karne me error aaya" });
    }
};

export const getVendorOrders = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({ success: false, message: "You don't have authority" });
        }

        const vendorId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { status } = req.query;

        const allowedStatuses = [
            "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY",
            "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURN_ACCEPTED",
            "RETURN_REJECTED", "RETURNED",
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
            });
        }

        const whereClause = {
            vendorId,
            ...(status && { deliveryStatus: status }),
        };

        const totalItems = await prisma.orderItem.count({ where: whereClause });

        const orderItems = await prisma.orderItem.findMany({
            where: whereClause,
            include: {
                product: { select: { id: true, productName: true, imageUrl: true } },
                variant: true,
                statusHistory: { orderBy: { changedAt: "asc" } },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        orderType: true,
                        orderSource: true,   // 👈 NAYA
                        sourceScreen: true,  // 👈 NAYA
                        paymentStatus: true,
                        createdAt: true,
                        fullName: true,
                        phone: true,
                        addressLine: true,
                        city: true,
                        state: true,
                        pincode: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        return res.status(200).json({ success: true, data: orderItems });
    } catch (error) {
        console.error("getVendorOrders error:", error);
        return res.status(500).json({ success: false, message: "Orders fetch karne me error aaya" });
    }
};