// const prisma = require("../../config/prisma"); // apne prisma client ka path check kar lena
// agar alag jagah se prisma client import karte ho to path adjust kar lena
import prisma from "../../config/prisma.js";
// ---------------------------------------------------------------------
// 1) SABHI USERS GET KARO (with pagination + search + unke addresses)
// GET /api/admin/users?page=1&limit=10&search=xyz&role=USER
// ---------------------------------------------------------------------


export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, role, hasOrders } = req.query;

        // ---------- Dynamic AND conditions ----------
        const andConditions = [{ isDelete: false }];

        if (search) {
            andConditions.push({
                OR: [
                    { fullName: { contains: search } },
                    { email: { contains: search } },
                    { phone: { contains: search } },
                ],
            });
        }

        if (role) {
            andConditions.push({ role }); // ADMIN / USER / VENDOR
        }

        // 👇 NAYA - sirf wahi users/vendors jinke paas kam se kam 1 order/order-item hai
        if (hasOrders === "true") {
            andConditions.push({
                OR: [
                    { orders: { some: {} } },            // USER role - apne khud ke orders
                    { vendorOrderItems: { some: {} } },  // VENDOR role - unko assign hue order items
                ],
            });
        }

        const whereClause = { AND: andConditions };

        const [users, totalCount] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    fullName: true,
                    phone: true,
                    email: true,
                    role: true,
                    actual_password: true,
                    isVerified: true,
                    imageUrl: true,
                    isDelete: true,
                    createdAt: true,
                    updatedAt: true,
                    // Address/Orders count list me, taaki admin ko andaza rahe
                    // vendorOrderItems bhi add kiya taaki vendor ka items count bhi dikhe
                    _count: {
                        select: { addresses: true, orders: true, vendorOrderItems: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({ where: whereClause }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Users fetch ho gaye",
            data: users,
            pagination: {
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit,
            },
        });
    } catch (error) {
        console.error("getAllUsers error:", error);
        return res.status(500).json({
            success: false,
            message: "Users fetch karte waqt error aaya",
            error: error.message,
        });
    }
};



export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                role: true,
                isVerified: true,
                imageUrl: true,
                isDelete: true,
                createdAt: true,
                updatedAt: true,
                // User ke saare addresses (soft-deleted wale chhod ke)
                addresses: {
                    where: { isDelete: false },
                    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
                },

                _count: {
                    select: { orders: true, reviews: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User nahi mila",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User detail fetch ho gaya",
            data: user,
        });
    } catch (error) {
        console.error("getUserById error:", error);
        return res.status(500).json({
            success: false,
            message: "User detail fetch karte waqt error aaya",
            error: error.message,
        });
    }
};

// ---------------------------------------------------------------------
// 3) USER KA ROLE CHANGE KARO (ADMIN / USER / VENDOR)
// PATCH /api/admin/users/:userId/role
// Body: { role: "VENDOR" }
// ---------------------------------------------------------------------
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const validRoles = ["ADMIN", "USER", "VENDOR"];

        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role invalid hai. Valid roles: ${validRoles.join(", ")}`,
            });
        }

        // Pehle check kar lo user exist karta hai ya nahi
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User nahi mila",
            });
        }

        // Optional: khud apna hi role admin change na kar paye (safety check)
        if (req.user && req.user.id === Number(userId)) {
            return res.status(400).json({
                success: false,
                message: "Aap apna khud ka role change nahi kar sakte",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: { role },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: `User ka role "${role}" me update ho gaya`,
            data: updatedUser,
        });
    } catch (error) {
        console.error("updateUserRole error:", error);
        return res.status(500).json({
            success: false,
            message: "Role update karte waqt error aaya",
            error: error.message,
        });
    }
};

// ---------------------------------------------------------------------
// 4) USER KO ACTIVE / DEACTIVATE KARO (toggle)
// PATCH /api/admin/users/:userId/status
// Body: { isActive: false }   // false = deactivate, true = activate
// ---------------------------------------------------------------------
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive field boolean (true/false) me bhejo",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User nahi mila",
            });
        }

        if (req.user && req.user.id === Number(userId)) {
            return res.status(400).json({
                success: false,
                message: "Aap khud ko deactivate nahi kar sakte",
            });
        }

        // isActive = true -> isDelete = false (user active hai)
        // isActive = false -> isDelete = true (user deactivate/blocked hai)
        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: { isDelete: !isActive },
            select: {
                id: true,
                fullName: true,
                email: true,
                isDelete: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: isActive
                ? "User activate kar diya gaya"
                : "User deactivate kar diya gaya",
            data: updatedUser,
        });
    } catch (error) {
        console.error("toggleUserStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "User status update karte waqt error aaya",
            error: error.message,
        });
    }
};

// ---------------------------------------------------------------------
// 5) ADMIN USER KA (ACTUAL) PASSWORD DEKH SAKE
// GET /api/admin/users/:userId/password
// ---------------------------------------------------------------------
export const getUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                fullName: true,
                email: true,
                actual_password: true, // plaintext password field jo schema me already hai
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User nahi mila",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password fetch ho gaya",
            data: {
                userId: user.id,
                fullName: user.fullName,
                email: user.email,
                password: user.actual_password,
            },
        });
    } catch (error) {
        console.error("getUserPassword error:", error);
        return res.status(500).json({
            success: false,
            message: "Password fetch karte waqt error aaya",
            error: error.message,
        });
    }
};

