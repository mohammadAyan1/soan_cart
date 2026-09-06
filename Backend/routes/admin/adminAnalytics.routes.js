// 📁 Save at: routes/admin/adminAnalytics.routes.js

import express from "express";
import { requiredAuth } from "../../middleware/auth.middleware.js";
import {
    getAllActiveDevices,
    getUserDevices,
    getUserActivityTimeline,
    getSessionJourney,
    getUserTimeSummary,
    getAdminDashboardSummary
} from "../../controller/admin/adminAnalytics.controller.js";

const adminAnalyticsRoutes = express.Router();

adminAnalyticsRoutes.get("/devices", requiredAuth, getAllActiveDevices);
adminAnalyticsRoutes.get("/user/:userId/devices", requiredAuth, getUserDevices);
adminAnalyticsRoutes.get("/user/:userId/timeline", requiredAuth, getUserActivityTimeline);
adminAnalyticsRoutes.get("/session/:sessionId/journey", requiredAuth, getSessionJourney);
adminAnalyticsRoutes.get("/session/:sessionId/journey", requiredAuth, getSessionJourney);



////Admin DASHBOARD Routes///
adminAnalyticsRoutes.get("/admin/dashboard-summary", requiredAuth, getAdminDashboardSummary)
export default adminAnalyticsRoutes;