import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api"; // Apna api import path check kar lena

export const fetchDashboardSummary = createAsyncThunk(
    "dashboard/fetchDashboardSummary",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/admin/analytics/admin/dashboard-summary");
            return res.data.data; // { todayUsersCount, todayOrdersCount, todaySalesTotal, ... }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Dashboard data load nahi ho paaya"
            );
        }
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        summary: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.summary = action.payload;
            })
            .addCase(fetchDashboardSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;