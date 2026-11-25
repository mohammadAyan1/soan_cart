import express from "express";

import {
    checkUserLocation
} from "../controller/location.controller.js";


// ================= OLD CODE (COMMENTED) =================
// import { requiredAuth } from "../middleware/auth.middleware.js";
// ========================================================
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";

const router = express.Router();

// ================= OLD CODE (COMMENTED) =================
// router.post(
//     "/check",
//     requiredAuth,
//     checkUserLocation
// );
// ========================================================
router.post(
    "/check",
    optionalAuth,
    checkUserLocation
);

export default router;