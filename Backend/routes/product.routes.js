import express from "express";
import upload from "../middleware/upload.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

import {
   createProduct,
   updateProduct,
   getAllProduct,
   getProductById,
   getProductByIdForVendor, // 👈 NAYA
   getAllProductByVendor,
   deletProduct,
   toggleVariantDelete,     // 👈 NAYA
   deleteVariantImage,
   addVariantImage,
   getProductsByCategory,
   searchProducts,
   getAllProductForAdmin,
   toggleProductApprove,
} from "../controller/product.controller.js";

const productRouter = express.Router();

/* ============================
   Product
============================ */

productRouter.post("/create", requiredAuth, upload.any(), createProduct);

productRouter.get("/getall", getAllProduct);

productRouter.get("/getall/admin", requiredAuth, getAllProductForAdmin);

productRouter.get("/by-category", getProductsByCategory);

productRouter.get("/search", searchProducts);

// Vendor Products — ⚠️ "/:id" se PEHLE hona chahiye
productRouter.get("/vendor/products", requiredAuth, getAllProductByVendor);

// 👇 NAYA — vendor ke edit form ke liye (deleted variants ke saath)
productRouter.get("/vendor/products/:id", requiredAuth, getProductByIdForVendor);

// Get Product By Id (public)
productRouter.get("/:id", getProductById);

// Update Product
productRouter.put("/update/:id", requiredAuth, upload.any(), updateProduct);

// Soft Delete / Restore — poora product
productRouter.put("/delete/:id", requiredAuth, deletProduct);

/* ============================
   Variant
============================ */

// 👇 NAYA — single variant soft delete / restore
productRouter.put("/variant/:variantId/delete", requiredAuth, toggleVariantDelete);

productRouter.post("/variant/:variantId/images", requiredAuth, upload.any(), addVariantImage);

productRouter.delete("/variant/:variantId/image/:imageId", requiredAuth, deleteVariantImage);


//admin approve the product
productRouter.put("/approve/:productId", requiredAuth, toggleProductApprove)

export default productRouter;