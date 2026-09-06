import express from "express";
import upload from "../middleware/upload.js";
import { requiredAuth } from "../middleware/auth.middleware.js";


import { createProductSubCategory, deleteProductSubCat, getAllProductSubCategory, getAllProductSubCategoryByCategory, updateProductSubCategory } from "../controller/productSubCategory.controller.js";


const productSubCategoryRoutes = express.Router();

// Create sub Product Category
productSubCategoryRoutes.post(
    "/create",
    requiredAuth,
    upload.single("image"),
    createProductSubCategory
);



// Get All sub Product Categories
productSubCategoryRoutes.get(
    "/get-all",
    getAllProductSubCategory
);



productSubCategoryRoutes.get(
    "/get-by-category",
    getAllProductSubCategoryByCategory
);

// Update sub Product Category
productSubCategoryRoutes.put(
    "/update/:id",
    requiredAuth,
    upload.single("image"),
    updateProductSubCategory
);



// Soft Delete Product sub Category
productSubCategoryRoutes.put(
    "/delete/:id",
    requiredAuth,
    deleteProductSubCat
);


export default productSubCategoryRoutes;
