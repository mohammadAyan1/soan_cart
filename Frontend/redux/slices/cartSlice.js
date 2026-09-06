import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- Helper: get guest ID from AsyncStorage ----------
const getGuestId = async () => {
    try {
        return await AsyncStorage.getItem("guestId") || null;
    } catch {
        return null;
    }
};

// ---------- Helper: build headers with guest ID ----------
const getHeaders = async () => {
    const guestId = await getGuestId();
    return guestId ? { "x-guest-id": guestId } : {};
};
// ---------- Async Thunks ----------
// 1. Fetch cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            return await fetchCartData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch cart"
            );
        }
    }
);
// ---------- Helper: fetch cart and return data ----------
const fetchCartData = async (guestIdOverride = null) => {
    // If we already have a guest ID from the POST response, use it directly.
    // Otherwise, read it from AsyncStorage.
    const headers = guestIdOverride
        ? { "x-guest-id": guestIdOverride }
        : await getHeaders();

    const res = await api.get("/api/cartItem", { headers });

    if (res.data.guestId) {
        await AsyncStorage.setItem("guestId", res.data.guestId);
    }
    return res.data;
};
// 2. Add to cart – now passes the new guestId to fetchCartData
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, variantId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            const postResponse = await api.post(
                "/api/cartItem/add",
                { productId, variantId, quantity },
                { headers }
            );

            const newGuestId = postResponse.data.guestId;
            if (newGuestId) {
                await AsyncStorage.setItem("guestId", newGuestId);
            }

            // Use the new guestId directly for the GET request
            return await fetchCartData(newGuestId);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to add to cart"
            );
        }
    }
);
// 3. Increase quantity
export const increaseQuantity = createAsyncThunk(
    "cart/increaseQuantity",
    async (variantId, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.patch(`/api/cartItem/increase/${variantId}`, {}, { headers });
            return await fetchCartData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to increase quantity"
            );
        }
    }
);
// 4. Decrease quantity
export const decreaseQuantity = createAsyncThunk(
    "cart/decreaseQuantity",
    async (variantId, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.patch(`/api/cartItem/decrease/${variantId}`, {}, { headers });
            return await fetchCartData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to decrease quantity"
            );
        }
    }
);
// 5. Remove item
export const removeCartItem = createAsyncThunk(
    "cart/removeCartItem",
    async (variantId, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.delete(`/api/cartItem/item/${variantId}`, { headers });
            return await fetchCartData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to remove item"
            );
        }
    }
);
// 6. Clear cart
export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.delete("/api/cartItem/clear", { headers });
            return await fetchCartData();
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to clear cart"
            );
        }
    }
);
// 7. Merge guest cart
export const mergeGuestCart = createAsyncThunk(
    "cart/mergeGuestCart",
    async (_, { rejectWithValue }) => {
        try {
            const headers = await getHeaders();
            await api.post("/api/cartItem/merge", {}, { headers });
            // After merge, remove guestId and fetch the merged cart
            await AsyncStorage.removeItem("guestId");
            return await fetchCartData(); // will not send guestId
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to merge guest cart"
            );
        }
    }
);
// ---------- Slice ----------
const initialState = {
    items: [],
    totalItems: 0,
    cartTotal: 0,
    loading: false,
    refreshing: false,
    error: null,
    totalSavings: 0,
};
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        resetCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.cartTotal = 0;
            state.error = null;
            state.totalSavings = 0;
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
            const { items, totalItems, cartTotal, totalSavings } = action.payload;
            state.items = items || [];
            state.totalItems = totalItems || 0;
            state.cartTotal = cartTotal || 0;
            state.loading = false;
            state.refreshing = false;
            state.totalSavings = totalSavings;
            state.error = null;
        };

        const handleRejected = (state, action) => {
            state.loading = false;
            state.refreshing = false;
            state.error = action.payload;
        };

        builder
            .addCase(fetchCart.pending, handlePending)
            .addCase(fetchCart.fulfilled, handleFulfilled)
            .addCase(fetchCart.rejected, handleRejected)
            .addCase(addToCart.pending, handlePending)
            .addCase(addToCart.fulfilled, handleFulfilled)
            .addCase(addToCart.rejected, handleRejected)
            .addCase(increaseQuantity.pending, handlePending)
            .addCase(increaseQuantity.fulfilled, handleFulfilled)
            .addCase(increaseQuantity.rejected, handleRejected)
            .addCase(decreaseQuantity.pending, handlePending)
            .addCase(decreaseQuantity.fulfilled, handleFulfilled)
            .addCase(decreaseQuantity.rejected, handleRejected)
            .addCase(removeCartItem.pending, handlePending)
            .addCase(removeCartItem.fulfilled, handleFulfilled)
            .addCase(removeCartItem.rejected, handleRejected)
            .addCase(clearCart.pending, handlePending)
            .addCase(clearCart.fulfilled, handleFulfilled)
            .addCase(clearCart.rejected, handleRejected)
            .addCase(mergeGuestCart.pending, handlePending)
            .addCase(mergeGuestCart.fulfilled, handleFulfilled)
            .addCase(mergeGuestCart.rejected, handleRejected);
    },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;