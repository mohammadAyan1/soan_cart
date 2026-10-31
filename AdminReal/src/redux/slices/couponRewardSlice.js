import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api"; // Aapka axios instance

// ==================== ADMIN COUPON THUNKS ====================
export const fetchAdminCoupons = createAsyncThunk("couponReward/fetchAdminCoupons", async (_, thunkAPI) => {
    try {
        const response = await api.get("/api/coupons/admin/all");
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const createCoupon = createAsyncThunk("couponReward/createCoupon", async (couponData, thunkAPI) => {
    try {
        const response = await api.post("/api/coupons/admin/create", couponData);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateCoupon = createAsyncThunk("couponReward/updateCoupon", async ({ id, data }, thunkAPI) => {
    try {
        const response = await api.put(`/api/coupons/admin/${id}`, data);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleCouponActive = createAsyncThunk("couponReward/toggleCouponActive", async (id, thunkAPI) => {
    try {
        const response = await api.patch(`/api/coupons/admin/${id}/toggle-active`);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleCouponDelete = createAsyncThunk("couponReward/toggleCouponDelete", async (id, thunkAPI) => {
    try {
        const response = await api.patch(`/api/coupons/admin/${id}/toggle-delete`);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ==================== ADMIN REWARD THUNKS ====================
export const fetchAdminRewards = createAsyncThunk("couponReward/fetchAdminRewards", async (_, thunkAPI) => {
    try {
        const response = await api.get("/api/rewards/admin/all");
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const createReward = createAsyncThunk("couponReward/createReward", async (rewardData, thunkAPI) => {
    try {
        const response = await api.post("/api/rewards/admin/create", rewardData);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateReward = createAsyncThunk("couponReward/updateReward", async ({ id, data }, thunkAPI) => {
    try {
        const response = await api.put(`/api/rewards/admin/${id}`, data);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleRewardActive = createAsyncThunk("couponReward/toggleRewardActive", async (id, thunkAPI) => {
    try {
        const response = await api.patch(`/api/rewards/admin/${id}/toggle-active`);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const toggleRewardDelete = createAsyncThunk("couponReward/toggleRewardDelete", async (id, thunkAPI) => {
    try {
        const response = await api.patch(`/api/rewards/admin/${id}/toggle-delete`);
        return response.data.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// ==================== DROPDOWN DATA THUNKS ====================
export const fetchDropdownData = createAsyncThunk("couponReward/fetchDropdownData", async (_, thunkAPI) => {
    try {
        const [usersRes, catsRes, subCatsRes, prodsRes] = await Promise.all([
            api.get("/api/admin/users?role=USER&limit=100"),
            api.get("/api/product-category/get-all?limit=100"),
            api.get("/api/product-sub-category/get-all?limit=100"),
            api.get("/api/product/getall/admin?limit=100")
        ]);

        return {
            users: usersRes.data.data || [],
            categories: catsRes.data.productsCat || [],
            subCategories: subCatsRes.data.subCategories || [],
            products: prodsRes.data.data || []
        };
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
});

const couponRewardSlice = createSlice({
    name: "couponReward",
    initialState: {
        adminCoupons: [],
        adminRewards: [],
        dropdownUsers: [],
        dropdownCategories: [],
        dropdownSubCategories: [],
        dropdownProducts: [],
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Coupons
            .addCase(fetchAdminCoupons.fulfilled, (state, action) => { state.adminCoupons = action.payload || []; })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.adminCoupons.unshift(action.payload);
                state.successMessage = "Coupon successfully created!";
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                const index = state.adminCoupons.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.adminCoupons[index] = action.payload;
                state.successMessage = "Coupon updated successfully!";
            })
            .addCase(toggleCouponActive.fulfilled, (state, action) => {
                const index = state.adminCoupons.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.adminCoupons[index] = action.payload;
            })
            .addCase(toggleCouponDelete.fulfilled, (state, action) => {
                const index = state.adminCoupons.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.adminCoupons[index] = action.payload;
            })

            // Rewards
            .addCase(fetchAdminRewards.fulfilled, (state, action) => { state.adminRewards = action.payload || []; })
            .addCase(createReward.fulfilled, (state, action) => {
                state.adminRewards.unshift(action.payload);
                state.successMessage = "Reward successfully created!";
            })
            .addCase(updateReward.fulfilled, (state, action) => {
                const index = state.adminRewards.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.adminRewards[index] = action.payload;
                state.successMessage = "Reward updated successfully!";
            })
            .addCase(toggleRewardActive.fulfilled, (state, action) => {
                const index = state.adminRewards.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.adminRewards[index] = action.payload;
            })
            .addCase(toggleRewardDelete.fulfilled, (state, action) => {
                const index = state.adminRewards.findIndex(r => r.id === action.payload.id);
                if (index !== -1) state.adminRewards[index] = action.payload;
            })

            // Dropdown Data
            .addCase(fetchDropdownData.fulfilled, (state, action) => {
                state.dropdownUsers = action.payload.users;
                state.dropdownCategories = action.payload.categories;
                state.dropdownSubCategories = action.payload.subCategories;
                state.dropdownProducts = action.payload.products;
            });
    },
});

export const { clearMessages } = couponRewardSlice.actions;
export default couponRewardSlice.reducer;