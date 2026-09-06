import prisma from "../config/prisma.js";

/**
 * ROUTE SETUP NOTE:
 * ---------------------------------
 * User apne khud ke address create/read/update/delete kar sakta hai.
 * Admin kisi bhi user ke saare address dekh sakta hai + har user ke
 * kitne address hai wo count bhi dekh sakta hai.
 *
 * Ownership check har jagah userId se hota hai (req.user.id se milta hai,
 * kabhi bhi body/params se userId nahi liya jata — taki koi dusre ka
 * address edit/delete na kar paye).
 */

// ==================================================================
// CREATE ADDRESS (User)
// ==================================================================
export const createAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            latitude,
            longitude,
            isDefault
        } = req.body;

        if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Agar ye address default banana hai, to pehle purane sab default hata do
        if (isDefault === true || isDefault === "true") {
            await prisma.address.updateMany({
                where: { userId, isDelete: false },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.create({
            data: {
                userId,
                fullName,
                phone,
                addressLine,
                city,
                state,
                pincode,
                latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
                longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
                isDefault: isDefault === true || isDefault === "true"
            }
        });

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// GET MY ADDRESSES (User — sirf apne)
// ==================================================================
export const getMyAddresses = async (req, res) => {
    try {
        const userId = req.user.id;

        const addresses = await prisma.address.findMany({
            where: { userId, isDelete: false },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        });

        return res.status(200).json({
            success: true,
            totalAddress: addresses.length,
            addresses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// GET SINGLE ADDRESS BY ID (User — sirf apna hi)
// ==================================================================
export const getAddressById = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = Number(req.params.id);

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "address id is required"
            });
        }

        const address = await prisma.address.findFirst({
            where: { id: addressId, userId, isDelete: false }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            address
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// UPDATE ADDRESS (User — sirf apna hi)
// ==================================================================
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = Number(req.params.id);

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "address id is required"
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: { id: addressId, userId, isDelete: false }
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode,
            latitude,
            longitude,
            isDefault
        } = req.body;

        // Agar ye address default banana hai, to pehle purane sab default hata do
        if (isDefault === true || isDefault === "true") {
            await prisma.address.updateMany({
                where: { userId, isDelete: false, NOT: { id: addressId } },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: addressId },
            data: {
                fullName: fullName ?? existingAddress.fullName,
                phone: phone ?? existingAddress.phone,
                addressLine: addressLine ?? existingAddress.addressLine,
                city: city ?? existingAddress.city,
                state: state ?? existingAddress.state,
                pincode: pincode ?? existingAddress.pincode,
                latitude:
                    latitude !== undefined
                        ? (latitude === null ? null : Number(latitude))
                        : existingAddress.latitude,
                longitude:
                    longitude !== undefined
                        ? (longitude === null ? null : Number(longitude))
                        : existingAddress.longitude,
                isDefault:
                    isDefault !== undefined
                        ? (isDefault === true || isDefault === "true")
                        : existingAddress.isDefault
            }
        });

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// DELETE ADDRESS (User — soft delete, sirf apna hi)
// ==================================================================
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = Number(req.params.id);

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "address id is required"
            });
        }

        const existingAddress = await prisma.address.findFirst({
            where: { id: addressId, userId, isDelete: false }
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        await prisma.address.update({
            where: { id: addressId },
            data: { isDelete: true, isDefault: false }
        });

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// ============ ADMIN CONTROLLERS ============
// ==================================================================

// ==================================================================
// GET ALL ADDRESSES OF ALL USERS (Admin) — with pagination
// ==================================================================
export const getAllAddressesAdmin = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [addresses, totalAddress] = await Promise.all([
            prisma.address.findMany({
                where: { isDelete: false },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true, phone: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.address.count({ where: { isDelete: false } })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalAddress,
            totalPages: Math.ceil(totalAddress / limit),
            hasNextPage: page < Math.ceil(totalAddress / limit),
            hasPreviousPage: page > 1,
            addresses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// GET ADDRESSES OF A SPECIFIC USER (Admin)
// ==================================================================
export const getUserAddressesAdmin = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const targetUserId = Number(req.params.userId);

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                message: "user id is required"
            });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: targetUserId, isDelete: false },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        });

        return res.status(200).json({
            success: true,
            userId: targetUserId,
            totalAddress: addresses.length,
            addresses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// GET ADDRESS COUNT PER USER (Admin)
// "mera kis user ne kitne address add kiye hai" — is sabka jawab
// ==================================================================
export const getAddressCountByUserAdmin = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const grouped = await prisma.address.groupBy({
            by: ["userId"],
            where: { isDelete: false },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } }
        });

        // userId ke sath fullName/email bhi dikhane ke liye ek query aur
        const userIds = grouped.map((g) => g.userId);

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, email: true, phone: true }
        });

        const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

        const result = grouped.map((g) => ({
            userId: g.userId,
            addressCount: g._count.id,
            user: userMap[g.userId] ?? null
        }));

        return res.status(200).json({
            success: true,
            totalUsersWithAddress: result.length,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};