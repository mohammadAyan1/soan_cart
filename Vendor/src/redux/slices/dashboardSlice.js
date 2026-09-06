import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { fetchVendorReviewsAggregate } from "../../utils/vendorReviewsAggregate";
import { isToday, isCurrentMonth, dayOfMonth } from "../../utils/dateHelpers";

/**
 * NOTE (assumption):
 * ---------------------------------------------------------
 * Backend me abhi vendor ke liye ek dedicated "/dashboard/stats" jaisa
 * endpoint nahi hai, isliye ye thunk GET /api/order/vendor/my-orders ko
 * bade limit (500) ke saath call karke saara data client-side me
 * aggregate karta hai. Products bahut zyada badhne par, ek proper
 * backend aggregation endpoint (Prisma groupBy) zyada efficient hoga.
 *
 * PRICE RULE (jaisa bataya gaya): actualPrice admin ka margin-wala price hai,
 * isliye vendor ke saare calculations "vendorMinPrice" (jo vendor ko milta hai)
 * ke basis par honge, actualPrice ka use kahi nahi kiya gaya.
 *
 * "Aaj ki Sales" = aaj ke saare (CANCELLED chhodkar) order-items ki
 *                  vendorMinPrice * quantity ka total (abhi tak ka business)
 * "Aaj ka Profit" = aaj ke sirf DELIVERED order-items ki
 *                  vendorMinPrice * quantity ka total (jo paisa actually mil chuka)
 * Ye ek reasonable assumption hai kyuki vendor ka apna cost-price system store
 * nahi hota - agar aap chahte ho ki "profit" kisi aur formula se nikle
 * (jaise ek alag costPrice field add karke), bata dena, isko update kar denge.
 */

export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
        try {
            const [ordersRes, reviewsSummary] = await Promise.all([
                axiosInstance.get("/order/vendor/my-orders", {
                    params: { page: 1, limit: 500 },
                }),
                fetchVendorReviewsAggregate(),
            ]);

            const orderItems = ordersRes.data.data || [];
            const now = new Date();

            let todaysOrdersCount = 0;
            let todaysSales = 0;
            let todaysProfit = 0;
            let currentMonthTotal = 0;

            // 1..31 din ke liye sales bucket (chart ke liye)
            const dailyMap = {};

            orderItems.forEach((item) => {
                const orderDate = item.order?.createdAt;
                if (!orderDate) return;

                const lineValue = Number(item.variant?.vendorMinPrice || 0) * item.quantity;
                const isCancelled = item.deliveryStatus === "CANCELLED";

                if (isToday(orderDate)) {
                    todaysOrdersCount += 1;
                    if (!isCancelled) todaysSales += lineValue;
                    if (item.deliveryStatus === "DELIVERED") todaysProfit += lineValue;
                }

                if (isCurrentMonth(orderDate, now) && !isCancelled) {
                    currentMonthTotal += lineValue;
                    const day = dayOfMonth(orderDate);
                    dailyMap[day] = (dailyMap[day] || 0) + lineValue;
                }
            });

            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const monthSalesByDay = Array.from({ length: daysInMonth }, (_, i) => ({
                day: i + 1,
                sales: Number((dailyMap[i + 1] || 0).toFixed(2)),
            }));

            return {
                todaysOrdersCount,
                todaysSales: Number(todaysSales.toFixed(2)),
                todaysProfit: Number(todaysProfit.toFixed(2)),
                currentMonthTotal: Number(currentMonthTotal.toFixed(2)),
                monthSalesByDay,
                reviewsToday: reviewsSummary.todayReviews,
                totalProductReviews: reviewsSummary.totalReviews,
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Dashboard data load nahi hua");
        }
    }
);

const initialState = {
    loading: false,
    error: null,

    todaysOrdersCount: 0,
    todaysSales: 0,
    todaysProfit: 0,
    currentMonthTotal: 0,
    monthSalesByDay: [],
    reviewsToday: 0,
    totalProductReviews: 0,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;