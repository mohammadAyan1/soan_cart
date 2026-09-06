

// 📁 Save at: routes/wishlist.routes.js

import express from "express";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";
import { requiredAuth } from "../middleware/auth.middleware.js";
import {
    addToWishlist,
    getWishlist,
    removeWishlistItem,
    clearWishlist,
    mergeGuestWishlist,
    getAllWishlistsAdmin,
    getWishlistStatsAdmin,
    getWishlistActivityHistory,
} from "../controller/wishlist.controller.js";

const wishlistRoutes = express.Router();

wishlistRoutes.use(optionalAuth);

// ---------------- USER / GUEST routes ----------------
wishlistRoutes.post("/add", optionalAuth, addToWishlist);
wishlistRoutes.get("/", optionalAuth, getWishlist);
wishlistRoutes.get("/history", optionalAuth, getWishlistActivityHistory); // 👈 NAYA
wishlistRoutes.delete("/item/:variantId", optionalAuth, removeWishlistItem);
wishlistRoutes.delete("/clear", optionalAuth, clearWishlist);
wishlistRoutes.post("/merge", requiredAuth, mergeGuestWishlist);

// ---------------- ADMIN only ----------------
wishlistRoutes.get("/admin/all", requiredAuth, getAllWishlistsAdmin);
wishlistRoutes.get("/admin/stats", requiredAuth, getWishlistStatsAdmin);

export default wishlistRoutes;