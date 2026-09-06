import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import productCategoryReducer from "./slices/productCategory"; // 👈 naam clear kiya
import orderReducer from "./slices/orderSlice";
import wishlistReducer from "./slices/wishlistSlice"; // 👈 ye import add karo
import addressReducer from "./slices/addressSlice"
import sessionReducer from "./slices/sessionSlice";
import reviewReducer from "./slices/reviewSlice"; // 👈 naya review reducer add kiya


export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        category: productCategoryReducer,
        order: orderReducer,
        wishlist: wishlistReducer, // 👈 ye line add karo
        address: addressReducer,
        session: sessionReducer,
        reviews: reviewReducer, // 👈 ye line add karo

    },
});