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


import notificationRouter from "./routes/notification/notificationRoutes.js";
import vegetableRoutes from "./routes/vegetable.routes.js";
import unitsRoutes from "./routes/units.routes.js";
import shareRoutes from "./routes/share.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import serviceZoneRoutes from "./routes/serviceZone.routes.js";
import locationRoutes from "./routes/location.routes.js";
import analyticsLocationRoutes from "./routes/locationAnalytics.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import { exec } from "child_process";
import path from "path";

// 👇 NAYA: Server restart hone par auto database sync (Safe - No Data Loss)
const autoSyncDatabaseOnRestart = () => {
    try {
        const nodeBin = process.execPath;
        const prismaCli = path.resolve("./node_modules/prisma/build/index.js");
        exec(`"${nodeBin}" "${prismaCli}" db push --skip-generate --schema=./prisma/schema.prisma`, (error, stdout, stderr) => {
            if (error) {
                // Agar data loss ka risk hoga toh Prisma bina permission data delete nahi karega
                console.log("ℹ️ Auto DB Sync note:", stderr || error.message);
            } else {
                console.log("🚀 Database automatically synced with schema on server startup!");
            }
        });
    } catch (err) {
        console.warn("Auto DB Sync skipped:", err?.message);
    }
};

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

///////////////////ADMIN///////////////////////
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes); // 👈 NAYA
app.use("/api/auth", authRoutes);
app.use("/api/product", productRouter);
app.use('/api/vegetable', vegetableRoutes);
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
app.use('/api/notifications', notificationRouter);
app.use('/api/units', unitsRoutes);
app.use("/api/payment", paymentRoutes)
app.use("/api/coupons", couponRoutes);
app.use("/api/rewards", rewardRoutes);
// Share & App Links Landing Pages
app.use("/", shareRoutes);


// //////////////////////////////////

app.use("/api/service-zones", serviceZoneRoutes);

app.use("/api/location", locationRoutes);

app.use("/api/get-customer-range", analyticsLocationRoutes);

app.use("/api/banners", bannerRoutes);




const port = process.env.PORT || 5000;

// ================= OLD CODE (COMMENTED) =================
// app.listen(port, "0.0.0.0", () => {
//     console.log(`Server Running On ${port}`);
// });
// ========================================================
app.listen(port, "0.0.0.0", () => {
    console.log(`Server Running On ${port}`);
    // 👇 Server start / restart hote hi safe database sync execute hoga
    autoSyncDatabaseOnRestart();
});