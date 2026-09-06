import prisma from "../config/prisma.js";
import { v4 as uuidv4 } from "uuid";

// Ye helper har cart controller function ke shuru mein call hoga.
// Ye decide karta hai ki request kis "identity" se aayi hai:
//   1. Logged-in user (req.user.id se) -> uska permanent Cart row dhundo/banao
//   2. Guest (x-guest-id header se) -> uske guestId se Cart row dhundo/banao
//   3. Guest jiska pehli baar aana hai (koi header nahi) -> naya UUID banao, naya Cart banao
//
// Returns: { cart, guestId, isNewGuest }
//   - guestId sirf tab return hota hai jab request guest ki thi (logged-in ke liye null)
//   - isNewGuest true hoga jab UUID abhi generate hua ho — controller isko response mein
//     bhejega taaki frontend usko localStorage mein save kar le

export const getOrCreateCart = async (req) => {
    // ---- Case 1: Logged-in user ----


    if (req.user?.id) {

        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id }
            });
        }

        return { cart, guestId: null, isNewGuest: false };
    }

    // ---- Case 2 & 3: Guest ----
    let guestId = req.headers["x-guest-id"];
    let isNewGuest = false;

    if (!guestId) {
        guestId = uuidv4();
        isNewGuest = true;
    }

    let cart = await prisma.cart.findUnique({
        where: { guestId }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { guestId }
        });
    }

    return { cart, guestId, isNewGuest };
};
