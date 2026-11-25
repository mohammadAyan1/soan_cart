import express from "express";
import upload from "../middleware/upload.js";
import { requiredAuth } from "../middleware/auth.middleware.js";
import {
    createBanner,
    getActiveBanners,
    getAllBannersAdmin,
    deleteBanner,
    toggleBannerStatus
} from "../controller/banner.controller.js";

const router = express.Router();

// Public: for mobile app home screen
router.get("/", getActiveBanners);

// Admin routes
router.get("/admin", requiredAuth, getAllBannersAdmin);
router.post("/", requiredAuth, upload.single("image"), createBanner);
router.delete("/:id", requiredAuth, deleteBanner);
router.patch("/:id/status", requiredAuth, toggleBannerStatus);

export default router;
