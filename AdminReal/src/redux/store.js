import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

import adminUserReducer from "./slices/adminUserSlice"; // path apna check kar lena
import productReducer from "./slices/productSlice"
import categorySlice from "./slices/categorySlice"
import subCategorySlice from "./slices/subCategorySlice"
import orderSlice from "./slices/orderSlice"
import dashboardSlice from "./slices/dashboardSlice"
import unitSlice from "./slices/unitSlice"
import vegetableReducer from "./slices/vegetableSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUser: adminUserReducer,
        product: productReducer, // 👈 add karo
        category: categorySlice,
        subCategory: subCategorySlice,
        order: orderSlice,
        dashboard: dashboardSlice,
        unit: unitSlice,
        vegetable: vegetableReducer
    },
});