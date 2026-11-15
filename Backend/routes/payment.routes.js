
import express from "express";

import {
    createWebsitePayment,
    createMobilePayment,
    verifyPayment
} from "../controller/payment.controller.js";

import { requiredAuth } from "../middleware/auth.middleware.js";


const paymentRoutes = express.Router();



paymentRoutes.post("/website/create", requiredAuth, createWebsitePayment)
paymentRoutes.post("/mobile/create", requiredAuth, createMobilePayment)
paymentRoutes.post("/verify/:merchantOrderId", requiredAuth, verifyPayment)

export default paymentRoutes;