import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api"; // 👈 apna actual axios instance path yaha daalo

// ==========================================================
// 1) Cart checkout — cart ke saare items ka ek order banega
// ==========================================================
export const checkoutCart = createAsyncThunk(
    "order/checkoutCart",
    async (addressData, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/order/checkout/cart", addressData);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Order place karne me error aaya");
        }
    }
);

// ==========================================================
// 2) Direct single product checkout (Buy Now)
// ==========================================================
export const checkoutDirect = createAsyncThunk(
    "order/checkoutDirect",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/order/checkout/direct", payload);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Order place karne me error aaya");
        }
    }
);

// ==========================================================
// 3) My orders (order-success/orders page ke liye kaam aayega)
// ==========================================================
export const fetchMyOrders = createAsyncThunk(
    "order/fetchMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/order/my-orders");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Orders fetch karne me error aaya");
        }
    }
);


// ==========================================================
// 4) My orders BY Id (order-success/orders page ke liye kaam aayega)
// ==========================================================
export const fetchMyOrdersById = createAsyncThunk(
    "order/fetchMyOrdersById",
    async (id, { rejectWithValue }) => {
        try {

            const res = await api.get(`/api/order/my-orders/${id}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Orders fetch karne me error aaya BY id");
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState: {
        placing: false,
        placeError: null,
        lastOrder: null,

        orders: [],

        orderData: null,


        ordersLoading: false,
        ordersError: null,
    },
    reducers: {
        clearLastOrder: (state) => {
            state.lastOrder = null;
            state.placeError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---- checkoutCart ----
            .addCase(checkoutCart.pending, (state) => {
                state.placing = true;
                state.placeError = null;
            })
            .addCase(checkoutCart.fulfilled, (state, action) => {
                state.placing = false;
                state.lastOrder = action.payload;
            })
            .addCase(checkoutCart.rejected, (state, action) => {
                state.placing = false;
                state.placeError = action.payload;
            })
            // ---- checkoutDirect ----
            .addCase(checkoutDirect.pending, (state) => {
                state.placing = true;
                state.placeError = null;
            })
            .addCase(checkoutDirect.fulfilled, (state, action) => {
                state.placing = false;
                state.lastOrder = action.payload;
            })
            .addCase(checkoutDirect.rejected, (state, action) => {
                state.placing = false;
                state.placeError = action.payload;
            })
            // ---- fetchMyOrders ----
            .addCase(fetchMyOrders.pending, (state) => {
                state.ordersLoading = true;
                state.ordersError = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.ordersLoading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.ordersLoading = false;
                state.ordersError = action.payload;
            })
            // ---- fetchMyOrdersById ----
            .addCase(fetchMyOrdersById.pending, (state) => {
                state.ordersLoading = true;
                state.ordersError = null;
            })
            .addCase(fetchMyOrdersById.fulfilled, (state, action) => {
                state.ordersLoading = false;
                state.orderData = action.payload;
            })
            .addCase(fetchMyOrdersById.rejected, (state, action) => {
                state.ordersLoading = false;
                state.ordersError = action.payload;
            });
    },
});

export const { clearLastOrder } = orderSlice.actions;
export default orderSlice.reducer;