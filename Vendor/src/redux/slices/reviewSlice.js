import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVendorReviewsAggregate } from "../../utils/vendorReviewsAggregate";

export const fetchVendorReviews = createAsyncThunk(
    "review/fetchVendorReviews",
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchVendorReviewsAggregate();
            return data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Reviews load nahi hue");
        }
    }
);

const initialState = {
    products: [],
    totalReviews: 0,
    todayReviews: 0,
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVendorReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.totalReviews = action.payload.totalReviews;
                state.todayReviews = action.payload.todayReviews;
            })
            .addCase(fetchVendorReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;