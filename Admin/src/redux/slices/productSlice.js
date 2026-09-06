import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// -----------------------------------------------------------------
// Vendor ke apne products fetch karna (deleted bhi include hote hai)
// -----------------------------------------------------------------
export const fetchVendorProducts = createAsyncThunk(
    "product/fetchVendorProducts",
    async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
        try {
            const data = await api.get(
                `/api/product/vendor/products?page=${page}&limit=${limit}`
            );
            // data already has: { success, currentPage, perPage, totalProducts, totalPages, hasNextPage, hasPreviousPage, products }
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Products load nahi ho paaye"
            );
        }
    }
);

// Edit form prefill ke liye (deleted variants ke saath)
export const fetchVendorProductById = createAsyncThunk(
    "product/fetchVendorProductById",
    async (id, { rejectWithValue }) => {
        try {
            const data = await api.get(`/api/product/vendor/products/${id}`);
            // assuming the API returns { product: {...} } or directly the product object
            return data.product || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Product load nahi hua"
            );
        }
    }
);

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (formData, { rejectWithValue }) => {
        try {
            const data = await api.post("/api/product/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data.product || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Product create nahi hua"
            );
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const data = await api.put(
                `/api/product/update/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return data.product || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Product update nahi hua"
            );
        }
    }
);

// Poora product soft delete / restore (backend toggle karta hai)
export const toggleProductDelete = createAsyncThunk(
    "product/toggleProductDelete",
    async (id, { rejectWithValue }) => {
        try {
            const data = await api.put(`/api/product/delete/${id}`);
            // the response might just be a success message
            return { id, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Status change nahi hua"
            );
        }
    }
);

// Single variant soft delete / restore
export const toggleVariantDelete = createAsyncThunk(
    "product/toggleVariantDelete",
    async ({ productId, variantId }, { rejectWithValue }) => {
        try {
            const data = await api.put(`/api/product/variant/${variantId}/delete`);
            return { productId, variantId, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Variant status change nahi hua"
            );
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        currentProduct: null,
        pagination: null,
        loading: false,
        formLoading: false,
        error: null,
    },
    reducers: {
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        clearProductError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // list
            .addCase(fetchVendorProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorProducts.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload is now the full response object
                state.products = action.payload.products || [];
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    totalProducts: action.payload.totalProducts,
                    hasNextPage: action.payload.hasNextPage,
                    hasPreviousPage: action.payload.hasPreviousPage,
                };
            })
            .addCase(fetchVendorProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // single (edit prefill)
            .addCase(fetchVendorProductById.pending, (state) => {
                state.formLoading = true;
                state.error = null;
                state.currentProduct = null;
            })
            .addCase(fetchVendorProductById.fulfilled, (state, action) => {
                state.formLoading = false;
                state.currentProduct = action.payload; // assumes payload is the product object
            })
            .addCase(fetchVendorProductById.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // create
            .addCase(createProduct.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.formLoading = false;
                state.products.unshift(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // update
            .addCase(updateProduct.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.formLoading = false;
                const idx = state.products.findIndex((p) => p.id === action.payload.id);
                if (idx !== -1) state.products[idx] = action.payload;
                state.currentProduct = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // toggle product delete/restore
            .addCase(toggleProductDelete.fulfilled, (state, action) => {
                const p = state.products.find((p) => p.id === action.payload.id);
                if (p) p.isDelete = !p.isDelete;
                // also sync currentProduct if it's the same
                if (state.currentProduct?.id === action.payload.id) {
                    state.currentProduct.isDelete = !state.currentProduct.isDelete;
                }
            })
            .addCase(toggleProductDelete.rejected, (state, action) => {
                state.error = action.payload;
            })

            // toggle variant delete/restore
            .addCase(toggleVariantDelete.fulfilled, (state, action) => {
                const p = state.products.find((p) => p.id === action.payload.productId);
                const v = p?.variants?.find((v) => v.id === action.payload.variantId);
                if (v) v.isDelete = !v.isDelete;

                // currentProduct (edit form open ho to) bhi sync karo
                if (state.currentProduct?.id === action.payload.productId) {
                    const cv = state.currentProduct.variants?.find(
                        (v) => v.id === action.payload.variantId
                    );
                    if (cv) cv.isDelete = !cv.isDelete;
                }
            })
            .addCase(toggleVariantDelete.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCurrentProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;