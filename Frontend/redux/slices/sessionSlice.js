import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

export const fetchMySessions = createAsyncThunk(
    "session/fetchMySessions",
    async ({ isRefresh } = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/sessions/my-sessions");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Devices fetch nahi ho paye");
        }
    }
);

export const logoutSessionDevice = createAsyncThunk(
    "session/logoutSessionDevice",
    async (sessionId, { rejectWithValue }) => {
        try {
            await api.patch(`/api/sessions/${sessionId}/logout`);
            return sessionId;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Logout nahi ho paya");
        }
    }
);



// 👇 NAYA
export const logoutAllDevices = createAsyncThunk(
    "session/logoutAllDevices",
    async (_, { rejectWithValue }) => {
        try {
            await api.patch("/api/sessions/logout-all");
            return true;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Logout nahi ho paya");
        }
    }
);

const sessionSlice = createSlice({
    name: "session",
    initialState: {
        sessions: [],
        loading: false,
        refreshing: false,
        actionLoadingId: null,
        logoutAllLoading: false, // 👈 NAYA
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMySessions.pending, (state, action) => {
                if (action.meta.arg?.isRefresh) {
                    state.refreshing = true;
                } else {
                    state.loading = true;
                }
            })
            .addCase(fetchMySessions.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.sessions = action.payload;
            })
            .addCase(fetchMySessions.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })
            .addCase(logoutSessionDevice.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(logoutSessionDevice.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.sessions = state.sessions.filter((s) => s.sessionId !== action.payload);
            })
            .addCase(logoutSessionDevice.rejected, (state) => {
                state.actionLoadingId = null;
            })
            // 👇 NAYE CASES
            .addCase(logoutAllDevices.pending, (state) => {
                state.logoutAllLoading = true;
            })
            .addCase(logoutAllDevices.fulfilled, (state) => {
                state.logoutAllLoading = false;
                // Sirf current device wala session list me rakho, baaki hata do
                state.sessions = state.sessions.filter((s) => s.isCurrentDevice);
            })
            .addCase(logoutAllDevices.rejected, (state) => {
                state.logoutAllLoading = false;
            });
    },
});

export default sessionSlice.reducer;