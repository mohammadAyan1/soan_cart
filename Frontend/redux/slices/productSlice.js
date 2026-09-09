// redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/product/getall?page=${page}&limit=${limit}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

export const fetchProductById = createAsyncThunk(
    "products/fetchProductById",
    async ({ id }, { rejectWithValue }) => {
        try {
            const res = await api.get(`/api/product/${id}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// 👇 naya thunk — category / subCategory se filtered products
export const fetchProductsByCategory = createAsyncThunk(
    "products/fetchProductsByCategory",
    async ({ categoryId, subCategoryId, page = 1, limit = 10, isRefresh = false }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (categoryId) params.append("categoryId", categoryId);
            if (subCategoryId) params.append("subCategoryId", subCategoryId);
            params.append("page", page);
            params.append("limit", limit);

            const res = await api.get(`/api/product/by-category?${params.toString()}`);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// ==========================================================
// 👇 NAYA THUNK — Search products (debounced call se hit hoga)
// ==========================================================
export const searchProducts = createAsyncThunk(
    "products/searchProducts",
    async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const res = await api.get(
                `/api/product/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
            );
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        items: [],
        product: null,
        page: 1,
        hasNextPage: true,
        loading: false,
        refreshing: false,
        error: null,

        // 👇 category-filtered product list
        categoryProducts: {
            items: [],
            subCategories: [], // 👈 NAYA - category ki saari subcategories yahan store hongi
            page: 1,
            hasNextPage: true,
            loading: false,
            refreshing: false,
            error: null,
        },

        // ==========================================================
        // 👇 NAYA STATE — Search results
        // ==========================================================
        search: {
            query: "",
            items: [],
            page: 1,
            hasNextPage: true,
            loading: false, // first page load
            loadingMore: false, // scroll pe next page load
            error: null,
        },
    },
    reducers: {
        resetProducts: (state) => {
            state.items = [];
            state.page = 1;
            state.hasNextPage = true;
        },
        resetCategoryProducts: (state) => {
            state.categoryProducts.items = [];
            state.categoryProducts.subCategories = []; // 👈 NAYA
            state.categoryProducts.page = 1;
            state.categoryProducts.hasNextPage = true;
            state.categoryProducts.error = null;
        },
        // 👇 NAYA REDUCER — jab search text change ho ya screen se bahar jao
        resetSearch: (state) => {
            state.search.items = [];
            state.search.page = 1;
            state.search.hasNextPage = true;
            state.search.error = null;
            state.search.loading = false;
            state.search.loadingMore = false;
        },
        setSearchQuery: (state, action) => {
            state.search.query = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state, action) => {
                if (action.meta.arg.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                const { products, hasNextPage, currentPage } = action.payload;
                state.items = currentPage === 1 ? products : [...state.items, ...products];
                state.hasNextPage = hasNextPage;
                state.page = currentPage;
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })
            .addCase(fetchProductById.pending, (state, action) => {
                if (action.meta.arg.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.product = action.payload.product;
                state.loading = false;
                state.refreshing = false;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })

            // 👇 category-filtered products
            .addCase(fetchProductsByCategory.pending, (state, action) => {
                if (action.meta.arg.isRefresh) {
                    state.categoryProducts.refreshing = true;
                } else {
                    state.categoryProducts.loading = true;
                }
                state.categoryProducts.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                const { products, hasNextPage, currentPage, subCategories } = action.payload;
                state.categoryProducts.items =
                    currentPage === 1 ? products : [...state.categoryProducts.items, ...products];
                // 👇 NAYA - subCategories sirf pehle page pe aati hai (backend se), tab hi overwrite karo
                if (currentPage === 1 && subCategories) {
                    state.categoryProducts.subCategories = subCategories;
                }
                state.categoryProducts.hasNextPage = hasNextPage;
                state.categoryProducts.page = currentPage;
                state.categoryProducts.loading = false;
                state.categoryProducts.refreshing = false;
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.categoryProducts.loading = false;
                state.categoryProducts.refreshing = false;
                state.categoryProducts.error = action.payload;
            })

            // ==========================================================
            // 👇 NAYE CASES — Search products
            // ==========================================================
            .addCase(searchProducts.pending, (state, action) => {
                const isFirstPage = action.meta.arg.page === 1;
                if (isFirstPage) {
                    state.search.loading = true;
                } else {
                    state.search.loadingMore = true;
                }
                state.search.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                const { products, hasNextPage, currentPage } = action.payload;
                state.search.items =
                    currentPage === 1 ? products : [...state.search.items, ...products];
                state.search.hasNextPage = hasNextPage;
                state.search.page = currentPage;
                state.search.loading = false;
                state.search.loadingMore = false;
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.search.loading = false;
                state.search.loadingMore = false;
                state.search.error = action.payload;
            });
    },
});

export const { resetProducts, resetCategoryProducts, resetSearch, setSearchQuery } =
    productSlice.actions;
export default productSlice.reducer;