
import express from "express"

// ================= OLD CODE (COMMENTED) =================
// import { requiredAuth } from "../middleware/auth.middleware";
// import { getLocationAnalytics } from "../controller/locationAnalytics.controller";
// ========================================================
import { requiredAuth } from "../middleware/auth.middleware.js";
import { getLocationAnalytics } from "../controller/locationAnalytics.controller.js";



const router = express.Router()

router.get(
    "/analytics",
    requiredAuth,
    getLocationAnalytics
);


export default router