// const express = require("express");
import express from "express";
const adminUserRoutes = express.Router();


import {
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserStatus,
    getUserPassword,
} from "../../controller/admin/adminUser.controller.js";

// apne existing auth/admin-check middleware yaha import karo
import { requiredAuth } from "../../middleware/auth.middleware.js"


const AdminCheck = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Sirf admin ye dekh sakta hai"
        });
    }

    next(); // ✅ Bahut important
};
// Sabhi routes pe pehle login check, phir admin-only check
adminUserRoutes.use(requiredAuth, AdminCheck);

// 1) Saare users list (pagination + search + role filter ke saath)
adminUserRoutes.get("/users", getAllUsers);

// 2) Ek specific user ka detail + uske addresses
adminUserRoutes.get("/users/:userId", getUserById);

// 3) User ka role change karo
adminUserRoutes.patch("/users/:userId/role", updateUserRole);

// 4) User ko active/deactivate karo
adminUserRoutes.patch("/users/:userId/status", toggleUserStatus);

// 5) User ka password dekho
adminUserRoutes.get("/users/:userId/password", getUserPassword);

export default adminUserRoutes