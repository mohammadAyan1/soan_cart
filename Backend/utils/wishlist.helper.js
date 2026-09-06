// 📁 Save at: utils/wishlist.helper.js
// Cart ke getOrCreateCart jaisa hi hai, bas Wishlist model ke liye

import prisma from "../config/prisma.js";
import crypto from "crypto";

export const getOrCreateWishlist = async (req) => {
    const userId = req.user?.id;

    // ---------------- Logged-in user ----------------
    if (userId) {
        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        return { wishlist, guestId: null, isNewGuest: false };
    }

    // ---------------- Guest - agar pehle se guestId hai ----------------
    const existingGuestId = req.headers["x-guest-id"];

    if (existingGuestId) {
        const wishlist = await prisma.wishlist.findUnique({
            where: { guestId: existingGuestId },
        });

        if (wishlist) {
            return { wishlist, guestId: existingGuestId, isNewGuest: false };
        }
    }

    // ---------------- Guest - naya UUID banao ----------------
    const newGuestId = crypto.randomUUID();
    const wishlist = await prisma.wishlist.create({ data: { guestId: newGuestId } });

    return { wishlist, guestId: newGuestId, isNewGuest: true };
};