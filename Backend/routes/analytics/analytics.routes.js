import express from "express";
import { trackEvent, trackEventsBatch } from "../../controller/analytics/analytics.controller.js";

const router = express.Router();

router.post("/track", trackEvent);
router.post("/track-batch", trackEventsBatch); // 👈 NAYA

export default router;