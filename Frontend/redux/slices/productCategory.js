// redux/slices/productCategory.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchProductsCategory = createAsyncThunk(
    "productCategory/fetchProductsCategory",
    async (arg = {}, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/product-category/tree`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const productCategorySlice = createSlice({
    name: "productCategory",
    initialState: {
        tree: [],       // 👈 categories + nested subCategories yahan aayenge
        loading: false,
        refreshing: false,
        error: null,
    },
    reducers: {
        resetProductsCategory: (state) => {
            state.tree = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductsCategory.pending, (state, action) => {
                if (action.meta.arg?.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchProductsCategory.fulfilled, (state, action) => {
                state.tree = action.payload.categories ?? []; // 👈 /tree endpoint ka actual shape
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchProductsCategory.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            });
    },
});

export const { resetProductsCategory } = productCategorySlice.actions;
export default productCategorySlice.reducer;