import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";


export const fetchAllOrderByVendor = createAsyncThunk(
    "order/fetchAllOrderByVendor", async ({ page = 1, limit = 20, status = "PENDING" } = {}, { rejectWithValue }) => {
        try {
            const data = await api.get(
                `/api/order/vendor/my-orders?page=${page}&limit=${limit}&status=${status}`
            );
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Order load nahi ho paaye"
            );
        }
    }
);


// export const fetchAllOrder = createAsyncThunk(
//     "order/fetchAllOrder", async ({ page = 1, limit = 20, active = false, vendorId = null, status = null } = {}, { rejectWithValue }) => {
//         try {
//             const data = await api.get(
//                 `/api/order/admin/all?page=${page}&limit=${limit}&active=${active}&vendorId=${vendorId}&status=${status}`
//             );
//             return data?.data;
//         } catch (error) {
//             return rejectWithValue(
//                 error.response?.data?.message || "Order load nahi ho paaye"
//             );
//         }
//     }
// );


// ---------------- ADMIN - saare orders (vendorId/userId/status/date filter ke sath) ----------------
export const fetchAllOrder = createAsyncThunk(
    "order/fetchAllOrder",
    async (
        {
            page = 1,
            limit = 20,
            active = false,
            vendorId = "",
            userId = "",
            status = "",
            fromDate = "", // 👈 NAYA
            toDate = "",   // 👈 NAYA
        } = {},
        { rejectWithValue }
    ) => {
        try {
            const params = { page, limit, active };
            if (vendorId) params.vendorId = vendorId;
            if (userId) params.userId = userId;
            if (status) params.status = status;
            if (fromDate) params.fromDate = fromDate; // 👈 NAYA
            if (toDate) params.toDate = toDate;       // 👈 NAYA

            const res = await api.get(`/api/order/admin/all`, { params });
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Order load nahi ho paaye"
            );
        }
    }
);

export const OrderItemStatusChange = createAsyncThunk(
    "orderItem/StatusChange", async ({ id, status, note }, { rejectWithValue }) => {
        try {
            const data = await api.patch(`/api/order/items/${id}/status`, { status, note })
            if (data?.success) {
                fetchAllOrderByVendor()
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Order Status Change Nahi Hua"
            );
        }
    }
);




const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],
        currentOrder: null,
        pagination: null,
        summary: null, // 👈 NAYA - filtered data ka overall amount/profit summary
        loading: false,
        formLoading: false,
        error: null,
    },
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearOrderError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllOrderByVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrderByVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchAllOrderByVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchAllOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
                state.summary = action.payload.summary || null; // 👈 NAYA
            })
            .addCase(fetchAllOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            ;

    },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer