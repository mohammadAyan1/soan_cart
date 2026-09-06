import express from "express";
import { getMySessions, logoutSession, logoutAllSessions } from "../controller/session.controller.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

const sessionDeviceRoutes = express.Router();

sessionDeviceRoutes.get("/my-sessions", requiredAuth, getMySessions);
sessionDeviceRoutes.patch("/logout-all", requiredAuth, logoutAllSessions); // 👈 NAYA - specific route upar honi chahiye
sessionDeviceRoutes.patch("/:sessionId/logout", requiredAuth, logoutSession);

export default sessionDeviceRoutes;