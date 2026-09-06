// redux/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// Logged-in user ke apne diye hue saare reviews (backend: GET /api/reviews/my)
export const fetchMyReviews = createAsyncThunk(
    "reviews/fetchMyReviews",
    async ({ isRefresh = false } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/reviews/my`);
            return res.data; // { success, reviews: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// Delivered but abhi tak review nahi hue order-items ("Rate this" prompt ke liye)
export const fetchReviewableOrderItems = createAsyncThunk(
    "reviews/fetchReviewableOrderItems",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/reviews/reviewable`);
            return res.data; // { success, reviewableItems: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// Review create karna - rating + comment + optional images (multipart)
export const createReview = createAsyncThunk(
    "reviews/createReview",
    async ({ orderItemId, rating, comment, images = [] }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("orderItemId", String(orderItemId));
            formData.append("rating", String(rating));
            if (comment) formData.append("comment", comment);

            // Same fieldname baar baar - backend upload.any() sab pakad leta hai
            images.forEach((img, index) => {
                formData.append("reviewImage", {
                    uri: img.uri,
                    name: `review_${orderItemId}_${index}.jpg`,
                    type: "image/jpeg",
                });
            });

            const res = await api.post(`/api/reviews`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.review; // created review object (with images)
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// Existing review edit karna (sirf rating/comment - images alag flow se)
export const updateReview = createAsyncThunk(
    "reviews/updateReview",
    async ({ reviewId, rating, comment }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/api/reviews/${reviewId}`, { rating, comment });
            return res.data.review;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// Apna review delete karna
export const deleteReview = createAsyncThunk(
    "reviews/deleteReview",
    async ({ reviewId }, { rejectWithValue }) => {
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            return { reviewId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const reviewSlice = createSlice({
    name: "reviews",
    initialState: {
        items: [],
        loading: false,
        refreshing: false,
        error: null,

        reviewableItems: [],
        reviewableLoading: false,

        // create/update/delete ke liye alag loading flags -
        // taaki list ke loading se conflict na ho
        actionLoading: false,
        actionError: null,

        // Kaunse orderItemId abhi-abhi review ho chuke hain (local optimistic
        // tracking) - taaki Orders screen turant button update kar sake
        reviewedOrderItemIds: [],
    },
    reducers: {
        resetReviews: (state) => {
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---- fetch my reviews ----
            .addCase(fetchMyReviews.pending, (state, action) => {
                if (action.meta.arg?.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchMyReviews.fulfilled, (state, action) => {
                state.items = action.payload.reviews || [];
                state.reviewedOrderItemIds = state.items.map((r) => r.orderItemId);
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchMyReviews.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })

            // ---- fetch reviewable order items ----
            .addCase(fetchReviewableOrderItems.pending, (state) => {
                state.reviewableLoading = true;
            })
            .addCase(fetchReviewableOrderItems.fulfilled, (state, action) => {
                state.reviewableLoading = false;
                state.reviewableItems = action.payload.reviewableItems || [];
            })
            .addCase(fetchReviewableOrderItems.rejected, (state) => {
                state.reviewableLoading = false;
            })

            // ---- create review ----
            .addCase(createReview.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items = [action.payload, ...state.items];
                state.reviewedOrderItemIds.push(action.payload.orderItemId);
            })
            .addCase(createReview.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })

            // ---- update review ----
            .addCase(updateReview.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.items.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...action.payload };
                }
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })

            // ---- delete review ----
            .addCase(deleteReview.pending, (state) => {
                state.actionLoading = true;
                state.actionError = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.actionLoading = false;
                const removed = state.items.find((r) => r.id === action.payload.reviewId);
                state.items = state.items.filter((r) => r.id !== action.payload.reviewId);
                if (removed) {
                    state.reviewedOrderItemIds = state.reviewedOrderItemIds.filter(
                        (id) => id !== removed.orderItemId
                    );
                }
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { resetReviews } = reviewSlice.actions;
export default reviewSlice.reducer;