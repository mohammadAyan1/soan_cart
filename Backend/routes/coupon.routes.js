import express from "express";
import {
    createCoupon,
    getAllCouponsAdmin,
    getCouponByIdAdmin,
    updateCoupon,
    toggleCouponActive,
    toggleCouponDeleteAdmin,
    getActiveCouponsForUser,
} from "../controller/coupon.controller.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

const couponRoutes = express.Router();

// ---------------- USER routes ----------------
couponRoutes.get("/", requiredAuth, getActiveCouponsForUser);

// ---------------- ADMIN only ----------------
// NOTE: "/admin/all" ko "/admin/:couponId" se pehle hi rakhna warna "all" id samajh liya jayega
couponRoutes.post("/admin/create", requiredAuth, createCoupon);
couponRoutes.get("/admin/all", requiredAuth, getAllCouponsAdmin);
couponRoutes.get("/admin/:couponId", requiredAuth, getCouponByIdAdmin);
couponRoutes.put("/admin/:couponId", requiredAuth, updateCoupon);
couponRoutes.patch("/admin/:couponId/toggle-active", requiredAuth, toggleCouponActive);
couponRoutes.patch("/admin/:couponId/toggle-delete", requiredAuth, toggleCouponDeleteAdmin);

export default couponRoutes;