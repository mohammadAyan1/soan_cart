import express from "express";
import { requiredAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";
import { createVegetableProduct, fetchVegetableProduct, toggleVegetableProduct, updateVegetableProduct } from "../controller/vegetable.controller.js";

const vegetableRoutes = express.Router()


const adminAuthCheck = (req, res, next) => {
    if (req?.user?.role !== "ADMIN") {
        return res.status(401).json({
            success: false,
            message: "Authorization failed",
        });
    }

    next();
};


vegetableRoutes.post('/create', requiredAuth, adminAuthCheck, upload.any(), createVegetableProduct)
vegetableRoutes.get('/get-all', requiredAuth, adminAuthCheck, fetchVegetableProduct)
vegetableRoutes.put('/update/:id', requiredAuth, adminAuthCheck, upload.any(), updateVegetableProduct)
vegetableRoutes.put('/toggle/:id', requiredAuth, adminAuthCheck, toggleVegetableProduct)


export default vegetableRoutes