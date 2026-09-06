import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ---------------------------------------------------------
// THUNKS
// ---------------------------------------------------------

// GET /api/order/vendor/my-orders -> backend khud vendorId = req.user.id se filter
// karta hai, isliye yaha sirf apne (vendor ke) products bikne wale orders hi aate hai
export const fetchVendorOrders = createAsyncThunk(
    "order/fetchVendorOrders",
    async ({ page = 1, limit = 10, status = "" } = {}, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/order/vendor/my-orders", {
                params: { page, limit, ...(status && { status }) },
            });
            return { orderItems: res.data.data, page, limit, status };
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Orders load nahi hue");
        }
    }
);

export const updateOrderItemStatus = createAsyncThunk(
    "order/updateOrderItemStatus",
    async ({ orderItemId, status, note, expectedDeliveryDate }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.patch(`/order/items/${orderItemId}/status`, {
                status,
                note,
                ...(expectedDeliveryDate && { expectedDeliveryDate }),
            });
            return res.data.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Status update nahi hua");
        }
    }
);

// ---------------------------------------------------------
// SLICE
// ---------------------------------------------------------

export const DELIVERY_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
];

const initialState = {
    items: [], // orderItems (product/variant/order details ke saath)
    loading: false,
    error: null,

    page: 1,
    limit: 10,
    statusFilter: "",

    updatingItemId: null,
    updateError: null,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
            state.updateError = null;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVendorOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.orderItems;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.statusFilter = action.payload.status;
            })
            .addCase(fetchVendorOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateOrderItemStatus.pending, (state, action) => {
                state.updatingItemId = action.meta.arg.orderItemId;
                state.updateError = null;
            })
            .addCase(updateOrderItemStatus.fulfilled, (state, action) => {
                state.updatingItemId = null;
                // 👇 Backend response me statusHistory wapas nahi aata (sirf
                // updated orderItem aata hai), isliye yaha khud ek naya
                // history entry bana ke push kar rahe hai taaki "History dekho"
                // modal me turant naya status+note dikhe, refresh ka wait na karna pade.
                const { status: sentStatus, note: sentNote } = action.meta.arg;
                state.items = state.items.map((item) => {
                    if (item.id !== action.payload.id) return item;
                    const newHistoryEntry = {
                        id: `local_${Date.now()}`, // 👈 temp id, agli fetchVendorOrders call pe real id se replace ho jayega
                        status: sentStatus,
                        note: sentNote || null,
                        changedAt: new Date().toISOString(),
                    };
                    return {
                        ...item,
                        deliveryStatus: action.payload.deliveryStatus,
                        statusHistory: [...(item.statusHistory || []), newHistoryEntry],
                    };
                });
            })
            .addCase(updateOrderItemStatus.rejected, (state, action) => {
                state.updatingItemId = null;
                state.updateError = action.payload;
            });
    },
});

export const { clearOrderError, setStatusFilter } = orderSlice.actions;
export default orderSlice.reducer;