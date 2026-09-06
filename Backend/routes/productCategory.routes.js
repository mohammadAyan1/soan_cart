import express from "express";
import upload from "../middleware/upload.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

import {
    createProductCategory,
    getAllProductCategory,
    updateProductCat,
    deleteProductCat,
    getCategoryTree,
    getAllProductCategoryByVendor
} from "../controller/productCategory.controller.js";

const productCategoryRoutes = express.Router();

// Create Product Category
productCategoryRoutes.post(
    "/create",
    requiredAuth,
    upload.single("image"),
    createProductCategory
);

// Get All Product Categories
productCategoryRoutes.get(
    "/get-all",
    getAllProductCategory
);



// Get All Product Categories
productCategoryRoutes.get(
    "/by-vendor",
    requiredAuth,
    getAllProductCategoryByVendor
);


// 👇 naya route — category + subCategory dono ek saath
productCategoryRoutes.get(
    "/tree",
    getCategoryTree
);

// Update Product Category
productCategoryRoutes.put(
    "/update/:id",
    requiredAuth,
    upload.single("image"),
    updateProductCat
);

// Soft Delete Product Category
productCategoryRoutes.put(
    "/delete/:id",
    requiredAuth,
    deleteProductCat
);

export default productCategoryRoutes;