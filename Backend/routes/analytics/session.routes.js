import express from "express";
import { startSession, heartbeat, endSession } from "../../controller/analytics/session.controller.js";

const router = express.Router();

router.post("/start", startSession);
router.patch("/ping", heartbeat);
router.patch("/end", endSession);

export default router;