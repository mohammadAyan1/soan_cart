import express from "express";
import { requiredAuth } from "../middleware/auth.middleware.js";

import {
    createAddress,
    getMyAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    getAllAddressesAdmin,
    getUserAddressesAdmin,
    getAddressCountByUserAdmin
} from "../controller/address.controller.js";

const addressRouter = express.Router();

/* ============================
   User Address (sirf apna)
============================ */

// Create Address
addressRouter.post(
    "/create",
    requiredAuth,
    createAddress
);

// Get My All Addresses
addressRouter.get(
    "/my",
    requiredAuth,
    getMyAddresses
);

/* ============================
   Admin — ye specific routes
   "/:id" wale generic route se
   PEHLE hone chahiye
============================ */

// Admin: Get all addresses (all users)
addressRouter.get(
    "/admin/all",
    requiredAuth,
    getAllAddressesAdmin
);

// Admin: Kis user ne kitne address add kiye — count
addressRouter.get(
    "/admin/count-by-user",
    requiredAuth,
    getAddressCountByUserAdmin
);

// Admin: Specific user ke saare address
addressRouter.get(
    "/admin/user/:userId",
    requiredAuth,
    getUserAddressesAdmin
);

/* ============================
   User Address — generic /:id
   routes (sabse last me)
============================ */

// Get Single Address By Id
addressRouter.get(
    "/:id",
    requiredAuth,
    getAddressById
);

// Update Address
addressRouter.put(
    "/:id",
    requiredAuth,
    updateAddress
);

// Delete Address (soft delete)
addressRouter.delete(
    "/:id",
    requiredAuth,
    deleteAddress
);

export default addressRouter;