import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// ---------------------------------------------------------
// THUNKS
// ---------------------------------------------------------

export const fetchVendorProducts = createAsyncThunk(
    "product/fetchVendorProducts",
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/product/vendor/products", {
                params: { page, limit },
            });
            return res.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Products load nahi hue");
        }
    }
);

export const fetchVendorProductById = createAsyncThunk(
    "product/fetchVendorProductById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/product/vendor/products/${id}`);
            return res.data.product;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Product load nahi hua");
        }
    }
);

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post("/product/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.product;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Product create nahi hua");
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/product/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.product;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Product update nahi hua");
        }
    }
);

export const toggleProductDelete = createAsyncThunk(
    "product/toggleProductDelete",
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/product/delete/${id}`);
            return { id, message: res.data.message };
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Product delete/restore nahi hua");
        }
    }
);

export const toggleVariantDelete = createAsyncThunk(
    "product/toggleVariantDelete",
    async ({ variantId, productId }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/product/variant/${variantId}/delete`);
            return { variantId, productId, message: res.data.message };
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Variant delete/restore nahi hua");
        }
    }
);

export const fetchCategoryTree = createAsyncThunk(
    "product/fetchCategoryTree",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get("/product-category/tree");
            return res.data.categories;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Categories load nahi hui");
        }
    }
);

// ---------------------------------------------------------
// SLICE
// ---------------------------------------------------------

const initialState = {
    items: [],
    pagination: { currentPage: 1, totalPages: 1, totalProducts: 0 },
    loading: false,
    error: null,

    current: null,
    currentLoading: false,
    currentError: null,

    formLoading: false, // create/update
    formError: null,

    actionLoadingId: null, // delete/restore ke button pe spinner ke liye
    actionError: null,

    categories: [],
    categoriesLoading: false,
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        clearProductError: (state) => {
            state.error = null;
            state.formError = null;
            state.actionError = null;
        },
        clearCurrentProduct: (state) => {
            state.current = null;
            state.currentError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- List ----------
            .addCase(fetchVendorProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.products;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    totalProducts: action.payload.totalProducts,
                };
            })
            .addCase(fetchVendorProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---------- Single (edit ke liye) ----------
            .addCase(fetchVendorProductById.pending, (state) => {
                state.currentLoading = true;
                state.currentError = null;
            })
            .addCase(fetchVendorProductById.fulfilled, (state, action) => {
                state.currentLoading = false;
                state.current = action.payload;
            })
            .addCase(fetchVendorProductById.rejected, (state, action) => {
                state.currentLoading = false;
                state.currentError = action.payload;
            })

            // ---------- Create ----------
            .addCase(createProduct.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.formLoading = false;
                state.items = [action.payload, ...state.items];
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })

            // ---------- Update ----------
            .addCase(updateProduct.pending, (state) => {
                state.formLoading = true;
                state.formError = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.formLoading = false;
                state.items = state.items.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                );
                state.current = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.formLoading = false;
                state.formError = action.payload;
            })

            // ---------- Delete/Restore product ----------
            .addCase(toggleProductDelete.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
                state.actionError = null;
            })
            .addCase(toggleProductDelete.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.items = state.items.map((p) =>
                    p.id === action.payload.id ? { ...p, isDelete: !p.isDelete } : p
                );
            })
            .addCase(toggleProductDelete.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.actionError = action.payload;
            })

            // ---------- Delete/Restore variant ----------
            .addCase(toggleVariantDelete.fulfilled, (state, action) => {
                if (state.current && state.current.id === action.payload.productId) {
                    state.current.variants = state.current.variants.map((v) =>
                        v.id === action.payload.variantId ? { ...v, isDelete: !v.isDelete } : v
                    );
                }
            })

            // ---------- Categories ----------
            .addCase(fetchCategoryTree.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchCategoryTree.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategoryTree.rejected, (state) => {
                state.categoriesLoading = false;
            });
    },
});

export const { clearProductError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;