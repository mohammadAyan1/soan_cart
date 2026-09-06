import prisma from "../config/prisma.js";

// ================== ADMIN: SAB USERS/GUESTS KE CARTS DEKHO ==================
// Har cart ke andar: konsa user (ya guest), kaunse products, kitni quantity,
// aur har product kis vendor (product creator) ka hai — sab kuch ek jagah
export const getAllCartsForAdmin = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Sirf admin ye dekh sakta hai"
            });
        }

        const carts = await prisma.cart.findMany({
            where: {
                items: { some: {} } // sirf wo carts jinme kam se kam 1 item ho, khaali cart skip
            },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true, phone: true }
                },
                items: {
                    include: {
                        product: {
                            include: {
                                user: {
                                    select: { id: true, fullName: true, email: true, role: true }
                                }
                            }
                        },
                        variant: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        const formatted = carts.map((cart) => {
            const items = cart.items.map((item) => ({
                cartItemId: item.id,
                productId: item.productId,
                productName: item.product.productName,
                variantId: item.variantId,
                variantDescription: item.variant.description,
                variantAttributes: item.variant.attributes,
                quantity: item.quantity,
                pricePerUnit: item.variant.actualPrice,
                totalPrice: Number(item.variant.actualPrice) * item.quantity,
                // ye product kis vendor ne banaya tha
                vendor: {
                    id: item.product.user.id,
                    name: item.product.user.fullName,
                    email: item.product.user.email,
                    role: item.product.user.role
                }
            }));

            const cartTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

            return {
                cartId: cart.id,
                cartOwner: cart.user
                    ? {
                        type: "registered",
                        id: cart.user.id,
                        name: cart.user.fullName,
                        email: cart.user.email,
                        phone: cart.user.phone
                    }
                    : {
                        type: "guest",
                        guestId: cart.guestId
                    },
                totalItems: items.length,
                cartTotal,
                items
            };
        });

        return res.status(200).json({
            success: true,
            totalCarts: formatted.length,
            carts: formatted
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ================== ADMIN: VENDOR-WISE CART ANALYTICS ==================
// Har vendor ke liye: total quantity carts mein pending hai, total value,
// kitne distinct products, kitne alag users ne cart mein daala
// Plus: sabse zyada quantity wala vendor aur sabse zyada value wala vendor
export const getVendorWiseCartStats = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Sirf admin ye dekh sakta hai"
            });
        }

        const cartItems = await prisma.cartItem.findMany({
            include: {
                variant: true,
                product: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true, role: true }
                        }
                    }
                },
                cart: {
                    select: { userId: true, guestId: true }
                }
            }
        });

        const vendorMap = {};

        for (const item of cartItems) {
            const vendor = item.product.user;
            const vendorId = vendor.id;
            const itemValue = Number(item.variant.actualPrice) * item.quantity;

            if (!vendorMap[vendorId]) {
                vendorMap[vendorId] = {
                    vendorId,
                    vendorName: vendor.fullName,
                    vendorEmail: vendor.email,
                    vendorRole: vendor.role,
                    totalQuantityInCarts: 0,
                    totalValueInCarts: 0,
                    distinctProductsSet: new Set(),
                    distinctCartsSet: new Set()
                };
            }

            const v = vendorMap[vendorId];
            v.totalQuantityInCarts += item.quantity;
            v.totalValueInCarts += itemValue;
            v.distinctProductsSet.add(item.productId);
            v.distinctCartsSet.add(item.cart.userId ?? item.cart.guestId);
        }

        let vendorStats = Object.values(vendorMap).map((v) => ({
            vendorId: v.vendorId,
            vendorName: v.vendorName,
            vendorEmail: v.vendorEmail,
            vendorRole: v.vendorRole,
            totalQuantityInCarts: v.totalQuantityInCarts,
            totalValueInCarts: Number(v.totalValueInCarts.toFixed(2)),
            distinctProductsInCarts: v.distinctProductsSet.size,
            distinctUsersCartingProducts: v.distinctCartsSet.size
        }));

        // Sabse zyada quantity wala vendor
        const mostQuantityVendor = vendorStats.length
            ? [...vendorStats].sort((a, b) => b.totalQuantityInCarts - a.totalQuantityInCarts)[0]
            : null;

        // Sabse zyada value (price * quantity) wala vendor
        const highestValueVendor = vendorStats.length
            ? [...vendorStats].sort((a, b) => b.totalValueInCarts - a.totalValueInCarts)[0]
            : null;

        // Default listing highest-value-first
        vendorStats.sort((a, b) => b.totalValueInCarts - a.totalValueInCarts);

        return res.status(200).json({
            success: true,
            vendorStats,
            insights: {
                mostQuantityVendor,
                highestValueVendor
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
