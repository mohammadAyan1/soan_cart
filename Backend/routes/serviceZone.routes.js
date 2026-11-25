import express from "express";

import {
    createServiceZone,
    getServiceZones,
    updateServiceZone,
    deleteServiceZone,
    toggleServiceZoneStatus
} from "../controller/serviceZone.controller.js";

import { requiredAuth } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", requiredAuth, getServiceZones);
router.post("/", requiredAuth, createServiceZone);
router.put("/:id", requiredAuth, updateServiceZone);
router.delete("/:id", requiredAuth, deleteServiceZone);
router.patch("/:id/status", requiredAuth, toggleServiceZoneStatus);

export default router;