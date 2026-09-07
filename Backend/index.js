import prisma from "./config/prisma.js";
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import productCategoryRoutes from "./routes/productCategory.routes.js";
import productSubCategoryRoutes from "./routes/productSubCategory.routes.js";
import cartRoutes from "./routes/addTocart.routes.js";
import cartAdminRoutes from "./routes/cartAdmin.routes.js";
import orderRoutes from "./routes/order.routes.js";

import addressRouter from "./routes/address.routes.js";

import sessionDeviceRoutes from "./routes/session.routes.js";

import ReviewRouter from "./routes/review.routes.js";

import sessionRoutes from "./routes/analytics/session.routes.js";
import analyticsRoutes from "./routes/analytics/analytics.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

import adminAnalyticsRoutes from "./routes/admin/adminAnalytics.routes.js";

import adminUserRoutes from "./routes/admin/adminUser.routes.js";
const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_VENDOR, process.env.FRONTEND_URL_ADMIN],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/db-test", async (req, res) => {
    try {
        const db = await prisma.$queryRaw`
      SELECT DATABASE() AS database_name
    `;

        const tables = await prisma.$queryRaw`
      SHOW TABLES
    `;

        res.json({
            success: true,
            database: db,
            tables: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

///////////////////ADMIN////////////////////////
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes); // 👈 NAYA
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use("/api/product-category", productCategoryRoutes);
app.use("/api/product-sub-category", productSubCategoryRoutes);
app.use("/api/cartItem", cartRoutes);
app.use("/api/cartAdmin", cartAdminRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/address", addressRouter);
app.use("/api/reviews", ReviewRouter)
app.use("/api/sessions", sessionDeviceRoutes);
app.use("/api/analytics/session", sessionRoutes);
app.use("/api/analytics", analyticsRoutes);




const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server Running On ${port}`);
});