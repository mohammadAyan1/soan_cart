import express from "express";
// ⚠️ Yaha apna EXISTING JWT-required auth middleware import karo (jo req.user set karta hai
// aur agar token nahi hai to 401 dega). Maine "authenticate" naam se dikhaya hai —
// apne actual middleware ka naam/path daal do.
// import { authenticate } from "../middleware/auth.middleware.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

import {
    getAllCartsForAdmin,
    getVendorWiseCartStats
} from "../controller/cartAdmin.controller.js";

const cartAdminRoutes = express.Router();

// Ye routes strictly logged-in ADMIN ke liye hain — guest allowed nahi
cartAdminRoutes.use(requiredAuth);

cartAdminRoutes.get("/all", getAllCartsForAdmin);
cartAdminRoutes.get("/vendor-stats", getVendorWiseCartStats);

export default cartAdminRoutes;
