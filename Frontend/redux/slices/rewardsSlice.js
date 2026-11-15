import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/api";

// =====================================
// Fetch My Rewards
// =====================================

export const fetchRewards = createAsyncThunk(
    "reward/fetchRewards",
    async (_, { rejectWithValue }) => {
        try {

            console.log('====================================');
            console.log("QWERYUIOP");
            console.log('====================================');

            const res = await api.get("/api/rewards/my-rewards");

            console.log('====================================');
            console.log(res);
            console.log('====================================');
            return res.data;

        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch rewards"
            );
        }
    }
);


// =====================================
// Initial State
// =====================================

const initialState = {
    items: [],
    loading: false,
    refreshing: false,
    error: null,
};


// =====================================
// Reward Slice
// =====================================

const rewardSlice = createSlice({

    name: "rewards",

    initialState,

    reducers: {

        resetRewards: (state) => {
            state.items = [];
            state.error = null;
        },

    },

    extraReducers: (builder) => {

        builder

            .addCase(fetchRewards.pending, (state) => {

                state.loading = true;
                state.error = null;

            })

            .addCase(fetchRewards.fulfilled, (state, action) => {

                state.items = action.payload?.data || [];

                state.loading = false;
                state.refreshing = false;
                state.error = null;

            })

            .addCase(fetchRewards.rejected, (state, action) => {

                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;

            });

    },

});


export const { resetRewards } = rewardSlice.actions;

export default rewardSlice.reducer;