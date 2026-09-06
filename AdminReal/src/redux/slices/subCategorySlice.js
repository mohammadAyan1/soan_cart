import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// -----------------------------------------------------------------
// Fetch all sub‑categories (with pagination)
// -----------------------------------------------------------------
export const fetchAllSubCategories = createAsyncThunk(
    "subCategory/fetchAllSubCategories",
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            const data = await api.get(
                `/api/product-sub-category/get-all?page=${page}&limit=${limit}`
            );
            // data: { success, currentPage, perPage, totalSubCategories, totalPages, hasNextPage, hasPreviousPage, subCategories }
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Sub‑categories load nahi ho paaye"
            );
        }
    }
);

// -----------------------------------------------------------------
// Fetch sub‑categories by category (for dropdown)
// -----------------------------------------------------------------
export const fetchSubCategoryByCategory = createAsyncThunk(
    "subCategory/fetchSubCategoryByCategory",
    async (categoryId, { rejectWithValue }) => {
        try {
            const data = await api.get(`/api/product-sub-category/get-by-category?cat=${categoryId}`);

            console.log(data, "ASDFGHJKL");

            // data: { success: true, subCategories: [...] }
            return data?.data?.subCategories || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Sub‑categories load nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Create a new sub‑category
// -----------------------------------------------------------------
export const createSubCategory = createAsyncThunk(
    "subCategory/createSubCategory",
    async (formData, { rejectWithValue }) => {
        try {
            const data = await api.post("/api/product-sub-category/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // response: { success, message, data: subCategory }
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Sub‑category create nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Update an existing sub‑category
// -----------------------------------------------------------------
export const updateSubCategory = createAsyncThunk(
    "subCategory/updateSubCategory",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const data = await api.put(
                `/api/product-sub-category/update/${id}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            // response: { success, message, data: subCategory }
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Sub‑category update nahi hui"
            );
        }
    }
);

// -----------------------------------------------------------------
// Soft‑delete / restore a sub‑category (backend toggles `isDelete`)
// -----------------------------------------------------------------
export const toggleSubCategoryDelete = createAsyncThunk(
    "subCategory/toggleSubCategoryDelete",
    async (id, { rejectWithValue }) => {
        try {
            const data = await api.put(`/api/product-sub-category/delete/${id}`);
            // response: { success, message }
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
const subCategorySlice = createSlice({
    name: "subCategory",
    initialState: {
        subCategories: [],        // list of all sub‑categories
        currentSubCategory: null, // single sub‑category for editing
        pagination: null,         // pagination meta data
        loading: false,           // for list fetching
        formLoading: false,       // for create/update/single fetch
        error: null,
        subCategoriesByCategory: [],     // 👈 category ke hisaab se

    },
    reducers: {
        clearCurrentSubCategory: (state) => {
            state.currentSubCategory = null;
        },
        clearSubCategoryError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- fetch all ----------
            .addCase(fetchAllSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSubCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subCategories = action.payload.subCategories || [];
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPages: action.payload.totalPages,
                    totalSubCategories: action.payload.totalSubCategories,
                    hasNextPage: action.payload.hasNextPage,
                    hasPreviousPage: action.payload.hasPreviousPage,
                };
            })
            .addCase(fetchAllSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---------- fetch single (by id) ----------
            .addCase(fetchSubCategoryByCategory.pending, (state) => {
                state.formLoading = true;
                state.error = null;

            })
            .addCase(fetchSubCategoryByCategory.fulfilled, (state, action) => {
                state.formLoading = false;
                state.subCategoriesByCategory = action.payload;
            })
            .addCase(fetchSubCategoryByCategory.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- create ----------
            .addCase(createSubCategory.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(createSubCategory.fulfilled, (state, action) => {
                state.formLoading = false;
                // add new sub‑category at the top of the list
                state.subCategories.unshift(action.payload);
            })
            .addCase(createSubCategory.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- update ----------
            .addCase(updateSubCategory.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                state.formLoading = false;
                const idx = state.subCategories.findIndex(
                    (sub) => sub.id === action.payload.id
                );
                if (idx !== -1) {
                    state.subCategories[idx] = action.payload;
                }
                state.currentSubCategory = action.payload;
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            })

            // ---------- toggle delete / restore ----------
            .addCase(toggleSubCategoryDelete.fulfilled, (state, action) => {
                const sub = state.subCategories.find(
                    (s) => s.id === action.payload.id
                );
                if (sub) {
                    sub.isDelete = !sub.isDelete;
                }
                // also update currentSubCategory if it is the same one
                if (state.currentSubCategory?.id === action.payload.id) {
                    state.currentSubCategory.isDelete = !state.currentSubCategory.isDelete;
                }
            })
            .addCase(toggleSubCategoryDelete.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCurrentSubCategory, clearSubCategoryError } =
    subCategorySlice.actions;
export default subCategorySlice.reducer;