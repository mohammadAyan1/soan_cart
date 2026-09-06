import express from "express";
// import { requiredAuth } from "../middleware/auth.middleware.js"; // apna actual path daal dena
import { requiredAuth } from "../middleware/auth.middleware.js";
import multer from "multer"; // agar image upload ke liye already use ho raha hai

import {
    register,
    verifyOtp,
    resendOtp,
    forgetPassword,
    login,
    logout,
    updateProfile,
    getMe,
    VendorRegister,
} from "../controller/auth.controller.js"; // apna actual path



const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // apne existing multer config se match kar lena

// ---------- Public routes ----------
router.post("/register", upload.single("image"), register);
router.post("/vendor-register", upload.single("image"), VendorRegister);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forget-password", forgetPassword);
router.post("/login", login);

// ---------- Protected routes ----------
router.post("/logout", requiredAuth, logout);
router.put("/update-profile", requiredAuth, upload.single("image"), updateProfile);
router.get("/me", requiredAuth, getMe); // 👈 naya route

export default router;
