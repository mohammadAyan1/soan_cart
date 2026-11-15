import { prisma } from "../config/prisma.js";
import phonePeClient from "../config/phonepe.js";
import { StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node";
import { randomUUID } from "crypto";
import { DiscountError, resolveDiscountForCheckout, recordDiscountUsage } from "../utils/discount.helper.js";



// ==========================================
// 1) WEBSITE PAYMENT
// ==========================================
export const createWebsitePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id: Number(orderId),
                userId: userId,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.orderType !== "ONLINE") {
            return res.status(400).json({
                success: false,
                message: "Online payment is not allowed for this order.",
            });
        }

        if (order.paymentStatus === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Order already paid.",
            });
        }

        if (order.orderStatus === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "This order has been cancelled.",
            });
        }

        const amount = Math.round(Number(order.totalAmount) * 100);
        const merchantOrderId = randomUUID();

        // Create Payment record using Prisma
        await prisma.payment.create({
            data: {
                orderId: order.id,
                merchantOrderId: merchantOrderId,
                amount: BigInt(amount),
                paymentSource: "WEBSITE",
                paymentStatus: "PENDING",
            },
        });

        const redirectUrl = `${process.env.BACKEND_URL}/api/payment/redirect/${merchantOrderId}`;

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .redirectUrl(redirectUrl)
            .build();

        const response = await phonePeClient.pay(request);

        return res.json({
            success: true,
            data: {
                merchantOrderId,
                checkoutUrl: response.redirectUrl,
            },
        });
    } catch (error) {
        console.error("Website Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment initiation failed",
        });
    }
};

// ==========================================
// 2) MOBILE PAYMENT (WebView / In-App)
// ==========================================
export const createMobilePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                id: Number(orderId),
                userId: userId,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.orderType !== "ONLINE") {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        if (order.paymentStatus === "PAID" || order.orderStatus === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Payment is not allowed for this order",
            });
        }

        const amount = Math.round(Number(order.totalAmount) * 100);
        const merchantOrderId = randomUUID();

        // Create Payment record using Prisma
        await prisma.payment.create({
            data: {
                orderId: order.id,
                merchantOrderId: merchantOrderId,
                amount: BigInt(amount),
                paymentSource: "MOBILE_APP",
                paymentStatus: "PENDING",
            },
        });

        const redirectUrl = `${process.env.BACKEND_URL}/api/payment/mobile-redirect/${merchantOrderId}`;

        const request = StandardCheckoutPayRequest.builder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .redirectUrl(redirectUrl)
            .build();

        const response = await phonePeClient.pay(request);

        return res.status(200).json({
            success: true,
            message: "Mobile payment initiated",
            data: {
                merchantOrderId,
                checkoutUrl: response.redirectUrl,
            },
        });
    } catch (error) {
        console.error("Mobile Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to initiate mobile payment",
        });
    }
};

// ==========================================
// 3) VERIFY PAYMENT (Cart Clearing & Status Updates)
// ==========================================
export const verifyPayment = async (req, res) => {
    try {
        const { merchantOrderId } = req.params;
        const userId = req.user.id;

        // 1. Fetch payment and order details via Prisma
        const paymentRecord = await prisma.payment.findUnique({
            where: { merchantOrderId },
            include: {
                order: true,
            },
        });



        if (!paymentRecord || paymentRecord.order.userId !== userId) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found.",
            });
        }

        // 2. Already paid check
        if (paymentRecord.paymentStatus === "SUCCESS") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified.",
                paymentStatus: "SUCCESS",
            });
        }

        // 3. Verify status from PhonePe
        const phonePeResponse = await phonePeClient.getOrderStatus(merchantOrderId);
        const state = phonePeResponse.state; // e.g. "COMPLETED", "FAILED"

        // 4. Verify amount match
        if (Number(phonePeResponse.amount) !== Number(paymentRecord.amount)) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch.",
            });
        }

        let cartCleared = false;

        // 5. Prisma Transaction for atomic updates
        await prisma.$transaction(async (tx) => {
            if (state === "COMPLETED") {
                // Update Payment Status
                await tx.payment.update({
                    where: { id: paymentRecord.id },
                    data: {
                        paymentStatus: "SUCCESS",
                        transactionId: phonePeResponse.orderId || merchantOrderId,
                    },
                });

                // Update Order Status
                await tx.order.update({
                    where: { id: paymentRecord.orderId },
                    data: {
                        paymentStatus: "PAID",
                        orderStatus: "CONFIRMED",
                    },
                });

                // If Reward was attached, mark reward usage / reward status if applicable
                // if (paymentRecord.order.rewardId) {
                //     await tx.reward.updateMany({
                //         where: { id: paymentRecord.order.rewardId },
                //         data: { isActive: false }, // ya jo bhi aapka reward used flag ho
                //     });
                // }

                // **CART CLEARING LOGIC:** 
                // Agar orderSource "CART" hai, tabhi payment success hone par cart khali hoga!
                if (paymentRecord.order.orderSource === "CART") {
                    const userCart = await tx.cart.findUnique({
                        where: { userId: userId },
                    });

                    if (userCart) {
                        await tx.cartItem.deleteMany({
                            where: { cartId: userCart.id },
                        });
                        cartCleared = true;
                    }
                }

                const discount = paymentRecord.order.rewardId
                    ? {
                        kind: "REWARD",
                        record: {
                            id: paymentRecord.order.rewardId
                        },
                        discountAmount: paymentRecord.order.discountAmount
                    }
                    : paymentRecord.order.couponId
                        ? {
                            kind: "COUPON",
                            record: {
                                id: paymentRecord.order.couponId
                            },
                            discountAmount: paymentRecord.order.discountAmount
                        }
                        : null;
                await recordDiscountUsage(tx, { discount, userId, orderId: paymentRecord.order.id });

            } else if (state === "FAILED") {
                // Update Payment Status to FAILED
                await tx.payment.update({
                    where: { id: paymentRecord.id },
                    data: {
                        paymentStatus: "FAILED",
                    },
                });

                // Update Order Payment Status to FAILED (Cart untouched rehta hai)
                await tx.order.update({
                    where: { id: paymentRecord.orderId },
                    data: {
                        paymentStatus: "FAILED",
                    },
                });
            }


            const order = await tx.order.findUnique({
                where: {
                    id: paymentRecord.orderId,
                },
                include: {
                    items: true,
                },
            });

            if (!order) {
                throw new Error("Order not found");
            }

            for (const item of order.items) {

                const stockUpdated = await tx.productVariant.updateMany({
                    where: {
                        id: item.variantId,
                        productId: item.productId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                if (stockUpdated.count === 0) {
                    throw new Error(
                        `Insufficient stock for product variant ${item.variantId}`
                    );
                }
            }



            // await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        });

        const paymentStatus =
            state === "COMPLETED"
                ? "SUCCESS"
                : state === "FAILED"
                    ? "FAILED"
                    : "PENDING";

        const message =
            paymentStatus === "SUCCESS"
                ? "Payment successful. Order confirmed."
                : paymentStatus === "FAILED"
                    ? "Payment failed. Your order is unpaid, and your cart items are safe."
                    : "Payment is still pending.";

        return res.status(200).json({
            success: true,
            message,
            data: {
                merchantOrderId,
                orderId: paymentRecord.orderId,
                orderSource: paymentRecord.order.orderSource,
                paymentStatus,
                orderStatus:
                    paymentStatus === "SUCCESS"
                        ? "CONFIRMED"
                        : paymentRecord.order.orderStatus,
                cartCleared,
            },
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed.",
            error: error.message,
        });
    }
};