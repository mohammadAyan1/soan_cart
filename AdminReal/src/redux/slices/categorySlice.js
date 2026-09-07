import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// -----------------------------------------------------------------
// Fetch all categories (with pagination + status filter)
// -----------------------------------------------------------------
export const fetchAllCategory = createAsyncThunk(
    "category/fetchAllCategory",
    async ({ page = 1, limit = 20, status = "active" } = {}, { rejectWithValue }) => {
        try {
            const data = await api.get(
                `/api/product-category/get-all?page=${page}&limit=${limit}&status=${status}`
            );
            // data already contains: { success, currentPage, perPage, totalProductsCat, totalPages, hasNextPage, hasPreviousPage, productsCat }


            return data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Category load nahi ho paaye"
            );
        }
    }
);

// -----------------------------------------------------------------
// Fetch a single category by ID (for edit form prefill)
// -----------------------------------------------------------------
export const fetchCategoryById = createAsyncThunk(
    "category/fetchCategoryById",
    async (id, { rejectWithValue }) => {
        try {
            const data = await api.get(`/api/product-category/${id}`);
            // assuming the API returns the category object directly or under a key
            // adjust according to your actual response


            return data.category || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Category load nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Create a new category
// -----------------------------------------------------------------
export const createCategory = createAsyncThunk(
    "category/createCategory",
    async (formData, { rejectWithValue }) => {
        try {
            const data = await api.post("/api/product-category/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // assuming the response contains the created category under a key
            return data.category || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Category create nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Update an existing category
// -----------------------------------------------------------------
export const updateCategory = createAsyncThunk(
    "category/updateCategory",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const data = await api.put(
                `/api/product-category/update/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            // assuming the response contains the updated category under a key
            return data.category || data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Category update nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Soft‑delete / restore a category (backend toggles `isDelete`)
// -----------------------------------------------------------------
export const toggleCategoryDelete = createAsyncThunk(
    "category/toggleCategoryDelete",
    async (id, { rejectWithValue }) => {
        try {
            const data = await api.put(`/api/product-category/delete/${id}`);
            // the response might just be a success message, we return the id and message
            return { id, message: data.message };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Status change nahi hua"
            );
        }
    }
);

// -----------------------------------------------------------------
// Slice
// -----------------------------------------------------------------
const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],           // list of all categories
        currentCategory: null,    // single category for editing
        pagination: null,         // pagination meta data
        loading: false,           // for list fetching
        formLoading: false,       // for create/update/single fetch
        error: null,
    },
    reducers: {
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
        },
        clearCategoryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- fetch all ----------
            .addCase(fetchAllCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCategory.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload now contains the full response
                state.categories = action.payload.productsCat || [];
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    totalCategories: action.payload.totalProductsCat, // adjust if the API uses a different name
                    hasNextPage: action.payload.hasNextPage,
                    hasPreviousPage: action.payload.hasPreviousPage,
                };
            })
            .addCase(fetchAllCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---------- fetch single (by id) ----------
            .addCase(fetchCategoryById.pending, (state) => {
                state.formLoading = true;
                state.error = null;
                state.currentCategory = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.formLoading = false;
                state.currentCategory = action.payload; // assumes payload is the category object
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- create ----------
            .addCase(createCategory.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.formLoading = false;
                // add new category at the top of the list
                state.categories.unshift(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- update ----------
            .addCase(updateCategory.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.formLoading = false;
                const idx = state.categories.findIndex((cat) => cat.id === action.payload.id);
                if (idx !== -1) {
                    state.categories[idx] = action.payload;
                }
                state.currentCategory = action.payload;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- toggle delete / restore ----------
            .addCase(toggleCategoryDelete.fulfilled, (state, action) => {
                const cat = state.categories.find((c) => c.id === action.payload.id);
                if (cat) {
                    cat.isDelete = !cat.isDelete;
                }
                if (state.currentCategory?.id === action.payload.id) {
                    state.currentCategory.isDelete = !state.currentCategory.isDelete;
                }
            })
            .addCase(toggleCategoryDelete.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCurrentCategory, clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;