import express from "express";

import {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
    restoreUnit,
    toggleUnitStatus
} from "../controller/units.controller.js";

import { requiredAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


const adminAuthCheck = (req, res, next) => {
    if (req?.user?.role !== "ADMIN") {
        return res.status(401).json({
            success: false,
            message: "Authorization failed",
        });
    }

    next();
};

router.post("/", requiredAuth, adminAuthCheck, createUnit);

router.get("/", requiredAuth, adminAuthCheck, getAllUnits);

router.get("/:id", requiredAuth, adminAuthCheck, getUnitById);

router.put("/:id", requiredAuth, adminAuthCheck, updateUnit);

router.delete("/:id", requiredAuth, adminAuthCheck, deleteUnit);

router.patch("/:id/restore", requiredAuth, adminAuthCheck, restoreUnit);

router.patch("/:id/status", requiredAuth, adminAuthCheck, toggleUnitStatus);

export default router;