
import express from "express";
import { checkoutFromCart, checkoutSingleProduct, confirmReturned, getAllOrdersAdmin, getMyOrderById, getMyOrders, getVendorOrders, getVendorSalesStatsAdmin, requestReturn, respondToReturn, updateOrderItemStatus } from "../controller/order.controller.js";
const orderRoutes = express.Router();
import { requiredAuth } from "../middleware/auth.middleware.js";


// ---------------- USER routes ----------------
orderRoutes.post("/checkout/cart", requiredAuth, checkoutFromCart);
orderRoutes.post("/checkout/direct", requiredAuth, checkoutSingleProduct);
orderRoutes.get("/my-orders", requiredAuth, getMyOrders);
orderRoutes.get("/my-orders/:orderId", requiredAuth, getMyOrderById);
orderRoutes.patch("/items/:orderItemId/return-request", requiredAuth, requestReturn);

// ---------------- VENDOR / ADMIN shared routes ----------------
orderRoutes.patch("/items/:orderItemId/status", requiredAuth, updateOrderItemStatus);
orderRoutes.patch("/items/:orderItemId/return-response", requiredAuth, respondToReturn);
orderRoutes.patch("/items/:orderItemId/return-confirm", requiredAuth, confirmReturned);

// ---------------- VENDOR only ----------------
orderRoutes.get("/vendor/my-orders", requiredAuth, getVendorOrders);

// ---------------- ADMIN only ----------------
orderRoutes.get("/admin/all", requiredAuth, getAllOrdersAdmin);
orderRoutes.get("/admin/vendor-stats", requiredAuth, getVendorSalesStatsAdmin);

// module.exports = router;
export default orderRoutes
