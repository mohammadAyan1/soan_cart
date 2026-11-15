import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// 1. Fetch coupons
export const fetchCoupons = createAsyncThunk(
    "coupon/fetchCoupons",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/coupons");



            return res.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch coupons"
            );
        }
    }
);
// ---------- Slice ----------
const initialState = {
    items: [],
    loading: false,
    refreshing: false,
    error: null,
};
const couponSlice = createSlice({
    name: "coupons",
    initialState,
    reducers: {
        resetCoupons: (state) => {
            state.items = [];
            state.error = null;
            // Optionally clear guestId from AsyncStorage if needed (but not here, do it in a thunk)
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state, action) => {
            if (action.meta?.arg?.isRefresh) {
                state.refreshing = true;
            } else {
                state.loading = true;
            }
            state.error = null;
        };

        const handleFulfilled = (state, action) => {


            const { data: items } = action.payload;
            state.items = items || [];
            state.loading = false;
            state.refreshing = false;
            state.error = null;
        };

        const handleRejected = (state, action) => {
            state.loading = false;
            state.refreshing = false;
            state.error = action.payload;
        };

        builder
            .addCase(fetchCoupons.pending, handlePending)
            .addCase(fetchCoupons.fulfilled, handleFulfilled)
            .addCase(fetchCoupons.rejected, handleRejected)
    },
});

export const { resetCoupons } = couponSlice.actions;
export default couponSlice.reducer;