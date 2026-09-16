import express from "express";
import { startSession, heartbeat, endSession } from "../../controller/analytics/session.controller.js";
import { optionalAuth } from "../../middleware/optionalAuth.middleware.js";

const router = express.Router();

router.post("/start", optionalAuth, startSession);
router.patch("/ping", heartbeat);
router.patch("/end", endSession);

export default router;