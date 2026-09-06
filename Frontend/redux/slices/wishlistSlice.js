

// 📁 Save at: redux/slices/wishlistSlice.js
// Cart slice jaisa hi pattern - guestId AsyncStorage me track hota hai

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- Helper: get guest ID from AsyncStorage ----------
const getGuestId = async () => {
    try {
        return (await AsyncStorage.getItem("guestId")) || null;
    } catch {
        return null;
    }
};

// ---------- Helper: build headers with guest ID ----------
const getHeaders = async () => {
    const guestId = await getGuestId();
    return guestId ? { "x-guest-id": guestId } : {};
};

// ---------- Helper: fetch wishlist and return data ----------
const fetchWishlistData = async (guestIdOverride = null) => {
    const headers = guestIdOverride ? { "x-guest-id": guestIdOverride } : await getHeaders();

    const res = await api.get("/api/wishlist", { headers });

    if (res.data.guestId) {
        await AsyncStorage.setItem("guestId", res.data.guestId);
    }
    return res.data;
};

// ---------- Async Thunks ----------

// 1. Fetch wishlist (isRefresh flag pull-to-refresh ke liye - taaki skeleton
//    dobara na dikhe, sirf pull spinner ghume)
export const fetchWishlist = createAsyncThunk(
    "wishlist/fetchWishlist",
    async ({ isRefresh = false } = {}, { rejectWithValue }) => {
        try {
            return await fetchWishlistData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Wishlist fetch karne me error aaya"
            );
        }
    }
);

// 2. Add to wishlist
export const addToWishlist = createAsyncThunk(
    "wishlist/addToWishlist",
    async ({ productId, variantId }, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            const postResponse = await api.post(
                "/api/wishlist/add",
                { productId, variantId },
                { headers }
            );

            const newGuestId = postResponse.data.guestId;
            if (newGuestId) {
                await AsyncStorage.setItem("guestId", newGuestId);
            }

            return await fetchWishlistData(newGuestId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Wishlist me add karne me error aaya"
            );
        }
    }
);

// 3. Remove single item (variantId se)
export const removeWishlistItem = createAsyncThunk(
    "wishlist/removeWishlistItem",
    async (variantId, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.delete(`/api/wishlist/item/${variantId}`, { headers });
            return await fetchWishlistData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Wishlist se remove karne me error aaya"
            );
        }
    }
);

// 4. Clear entire wishlist (ek hi baar me)
export const clearWishlist = createAsyncThunk(
    "wishlist/clearWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.delete("/api/wishlist/clear", { headers });
            return await fetchWishlistData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Wishlist clear karne me error aaya"
            );
        }
    }
);

// 5. Manual merge (normally login ke time hi backend khud kar deta hai,
//    ye sirf backup/manual trigger ke liye hai)
export const mergeGuestWishlist = createAsyncThunk(
    "wishlist/mergeGuestWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.post("/api/wishlist/merge", {}, { headers });
            await AsyncStorage.removeItem("guestId");
            return await fetchWishlistData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Wishlist merge karne me error aaya"
            );
        }
    }
);

// ---------- Slice ----------
const initialState = {
    items: [],
    totalItems: 0,
    loading: false,
    refreshing: false,
    pendingVariantId: null, // kaunsa variant abhi add/remove ho raha hai (per-item spinner ke liye)
    error: null,
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        resetWishlist: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.error = null;
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
            const { items, totalItems } = action.payload;
            state.items = items || [];
            state.totalItems = totalItems || 0;
            state.loading = false;
            state.refreshing = false;
            state.pendingVariantId = null;
        };

        const handleRejected = (state, action) => {
            state.loading = false;
            state.refreshing = false;
            state.pendingVariantId = null;
            state.error = action.payload;
        };

        builder
            .addCase(fetchWishlist.pending, handlePending)
            .addCase(fetchWishlist.fulfilled, handleFulfilled)
            .addCase(fetchWishlist.rejected, handleRejected)

            .addCase(addToWishlist.pending, (state, action) => {
                state.pendingVariantId = action.meta.arg?.variantId; // { productId, variantId }
                state.error = null;
            })
            .addCase(addToWishlist.fulfilled, handleFulfilled)
            .addCase(addToWishlist.rejected, handleRejected)

            .addCase(removeWishlistItem.pending, (state, action) => {
                state.pendingVariantId = action.meta.arg; // variantId
                state.error = null;
            })
            .addCase(removeWishlistItem.fulfilled, handleFulfilled)
            .addCase(removeWishlistItem.rejected, handleRejected)

            .addCase(clearWishlist.pending, handlePending)
            .addCase(clearWishlist.fulfilled, handleFulfilled)
            .addCase(clearWishlist.rejected, handleRejected)

            .addCase(mergeGuestWishlist.pending, handlePending)
            .addCase(mergeGuestWishlist.fulfilled, handleFulfilled)
            .addCase(mergeGuestWishlist.rejected, handleRejected);
    },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;