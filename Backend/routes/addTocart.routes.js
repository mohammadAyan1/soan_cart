
// 📁 Save at: routes/addTocart.routes.js

import express from "express";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";
import { requiredAuth } from "../middleware/auth.middleware.js";
import {
    addToCart,
    getCart,
    increaseQuantity,
    decreaseQuantity,
    removeCartItem,
    clearCart,
    mergeGuestCart,
    getCartActivityHistory
} from "../controller/addTocart.controller.js";

const cartRoutes = express.Router();

cartRoutes.use(optionalAuth);

cartRoutes.post("/add", optionalAuth, addToCart);
cartRoutes.get("/", optionalAuth, getCart);
cartRoutes.get("/history", optionalAuth, getCartActivityHistory); // 👈 NAYA
cartRoutes.patch("/increase/:variantId", optionalAuth, increaseQuantity);
cartRoutes.patch("/decrease/:variantId", optionalAuth, decreaseQuantity);
cartRoutes.delete("/item/:variantId", optionalAuth, removeCartItem);
cartRoutes.delete("/clear", optionalAuth, clearCart);
cartRoutes.post("/merge", requiredAuth, mergeGuestCart);

export default cartRoutes;