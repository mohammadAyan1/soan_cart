import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// =========================
// FETCH ALL UNITS
// =========================
export const fetchAllUnits = createAsyncThunk(
    "units/fetchAllUnits",
    async ({ status = "active" } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/api/units?status=${status}`
            );




            return response.data?.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Units load nahi ho paaye"
            );
        }
    }
);


// =========================
// CREATE UNIT
// =========================
export const createUnit = createAsyncThunk(
    "units/createUnit",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post(
                `/api/units`,
                formData
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unit create nahi ho paayi"
            );
        }
    }
);


// =========================
// SLICE
// =========================
const unitSlice = createSlice({
    name: "units",

    initialState: {
        units: [],
        currentUnit: null,

        loading: false,
        formLoading: false,

        error: null,
    },

    reducers: {
        clearCurrentUnit: (state) => {
            state.currentUnit = null;
        },

        clearUnitError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // =========================
            // FETCH ALL UNITS
            // =========================
            .addCase(fetchAllUnits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchAllUnits.fulfilled, (state, action) => {
                state.loading = false;


                state.units = action.payload || [];
            })

            .addCase(fetchAllUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // =========================
            // CREATE UNIT
            // =========================
            .addCase(createUnit.pending, (state) => {
                state.formLoading = true;
                state.error = null;
            })

            .addCase(createUnit.fulfilled, (state, action) => {
                state.formLoading = false;

                const newUnit = action.payload.unit;

                if (newUnit) {
                    state.units.unshift(newUnit);
                }
            })

            .addCase(createUnit.rejected, (state, action) => {
                state.formLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearCurrentUnit,
    clearUnitError,
} = unitSlice.actions;

export default unitSlice.reducer;