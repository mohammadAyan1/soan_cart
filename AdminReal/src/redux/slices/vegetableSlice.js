import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// ==========================================
// CREATE VEGETABLE PRODUCT
// ==========================================
export const createVegetable = createAsyncThunk(
    "vegetable/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await api.post(
                "/api/vegetable/create",
                data
            );

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Something went wrong",
                }
            );
        }
    }
);



// ==========================================
// UPDATE VEGETABLE PRODUCT
// ==========================================
export const updateVegetable = createAsyncThunk(
    "vegetable/update",
    async (data, { rejectWithValue }) => {
        try {
            let id
            for (const [key, value] of data.entries()) {
                if (key == "id") {
                    id = value
                }

            }

            const res = await api.put(
                `/api/vegetable/update/${id}`,
                data
            );

            return res.data;

        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Something went wrong",
                }
            );
        }
    }
);


// ==========================================
// DELETE VEGETABLE PRODUCT
// ==========================================
export const toggleVegetableStatus = createAsyncThunk(
    "vegetable/toggle",
    async (id, { rejectWithValue }) => {
        try {



            const res = await api.put(
                `/api/vegetable/toggle/${id}`,
            );
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Something went wrong",
                }
            );
        }
    }
);

// ==========================================
// FETCH ALL VEGETABLE PRODUCTS
// ==========================================
export const fetchVegetable = createAsyncThunk(
    "vegetable/fetch",
    async (active, { rejectWithValue }) => {
        try {


            const res = await api.get(
                `/api/vegetable/get-all?status=${active?.isDelete}`
            );

            return res.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Something went wrong",
                }
            );
        }
    }
);





// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
    vegetables: [],
    currentVegetable: null,

    loading: false,
    createLoading: false,

    error: null,
};


// ==========================================
// SLICE
// ==========================================
const vegetableSlice = createSlice({
    name: "vegetable",

    initialState,

    reducers: {
        updateVegetableLocal: (state, action) => {
            state.currentVegetable = {
                ...state.currentVegetable,
                ...action.payload,
            };
        },

        clearCurrentVegetable: (state) => {
            state.currentVegetable = null;
        },

        clearVegetableError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ==========================================
            // CREATE VEGETABLE
            // ==========================================

            .addCase(createVegetable.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })

            .addCase(createVegetable.fulfilled, (state, action) => {
                state.createLoading = false;

                const newVegetable =
                    action.payload?.vegetableProduct ||
                    action.payload?.data;

                if (newVegetable) {
                    state.vegetables.unshift(newVegetable);
                }
            })

            .addCase(createVegetable.rejected, (state, action) => {
                state.createLoading = false;

                state.error =
                    action.payload?.message ||
                    "Vegetable product create nahi ho paaya";
            })




            // ==========================================
            // update VEGETABLE
            // ==========================================

            .addCase(updateVegetable.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })


            .addCase(updateVegetable.fulfilled, (state, action) => {
                state.createLoading = false;

                const updatedVegetable =
                    action.payload?.vegetableProduct ||
                    action.payload?.data;

                if (updatedVegetable) {
                    const index = state.vegetables.findIndex(
                        (vegetable) => vegetable.id === updatedVegetable.id
                    );

                    if (index !== -1) {
                        state.vegetables[index] = updatedVegetable;
                    }
                }
            })

            .addCase(updateVegetable.rejected, (state, action) => {
                state.createLoading = false;

                state.error =
                    action.payload?.message ||
                    "Vegetable product create nahi ho paaya";
            })


            // ==========================================
            // FETCH VEGETABLES
            // ==========================================

            .addCase(fetchVegetable.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchVegetable.fulfilled, (state, action) => {
                state.loading = false;


                state.vegetables =
                    action.payload?.vegetableProducts || [];
            })

            .addCase(fetchVegetable.rejected, (state, action) => {
                state.loading = false;

                state.error =
                    action.payload?.message ||
                    "Vegetable products fetch nahi ho paaye";
            });
    },
});


// ==========================================
// ACTIONS
// ==========================================
export const {
    updateVegetableLocal,
    clearCurrentVegetable,
    clearVegetableError,
} = vegetableSlice.actions;


// ==========================================
// REDUCER
// ==========================================
export default vegetableSlice.reducer;