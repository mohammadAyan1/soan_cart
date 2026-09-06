import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
// ⚠️ NOTE: upar wala import path apne project ke actual axios instance
// wale path se replace kar dena (jaisa authSlice me use hota hai).
// Agar tumhare axiosInstance me already baseURL + auth token interceptor
// laga hua hai (jaisa fetchUserProfile me hota hoga) to yahi kaafi hai.

/**
 * BACKEND ROUTES (address.routes.js se):
 * ---------------------------------------
 * POST   /api/address/create
 * GET    /api/address/my
 * GET    /api/address/:id
 * PUT    /api/address/:id
 * DELETE /api/address/:id
 */

// ==================================================================
// THUNKS
// ==================================================================

// Apne saare address fetch karo
export const fetchMyAddresses = createAsyncThunk(
    "address/fetchMyAddresses",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/address/my");
            return data.addresses;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Address load nahi ho paye"
            );
        }
    }
);

// Naya address create karo
export const createAddress = createAsyncThunk(
    "address/createAddress",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/api/address/create", payload);
            return data.address;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Address add nahi ho paya"
            );
        }
    }
);

// Existing address update karo
export const updateAddress = createAsyncThunk(
    "address/updateAddress",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/api/address/${id}`, payload);
            return data.address;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Address update nahi ho paya"
            );
        }
    }
);

// Address delete karo (soft delete backend pe)
export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/api/address/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "Address delete nahi ho paya"
            );
        }
    }
);

// ==================================================================
// SLICE
// ==================================================================
const addressSlice = createSlice({
    name: "address",
    initialState: {
        addresses: [],
        loading: false, // list fetch loading
        refreshing: false, // pull-to-refresh loading
        actionLoading: false, // create/update/delete loading
        error: null,
    },
    reducers: {
        clearAddressError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- FETCH ----------
            .addCase(fetchMyAddresses.pending, (state, action) => {
                if (action.meta.arg?.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchMyAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.addresses = action.payload;
            })
            .addCase(fetchMyAddresses.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })

            // ---------- CREATE ----------
            .addCase(createAddress.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Agar naya address default banaya gaya hai to baaki sab ka
                // isDefault false kar do (backend bhi yahi karta hai)
                if (action.payload.isDefault) {
                    state.addresses.forEach((a) => (a.isDefault = false));
                }
                state.addresses.unshift(action.payload);
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // ---------- UPDATE ----------
            .addCase(updateAddress.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.actionLoading = false;
                if (action.payload.isDefault) {
                    state.addresses.forEach((a) => (a.isDefault = false));
                }
                const index = state.addresses.findIndex(
                    (a) => a.id === action.payload.id
                );
                if (index !== -1) state.addresses[index] = action.payload;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // ---------- DELETE ----------
            .addCase(deleteAddress.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.addresses = state.addresses.filter(
                    (a) => a.id !== action.payload
                );
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;