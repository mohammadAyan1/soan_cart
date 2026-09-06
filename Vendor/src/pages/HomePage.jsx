import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { fetchDashboardStats } from "../redux/slices/dashboardSlice";
import { formatINR } from "../utils/dateHelpers";

const StatCard = ({ label, value, hint }) => (
    <div className="rounded-lg border border-stone-200 bg-white p-5">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="mt-2 text-2xl font-medium text-stone-800">{value}</p>
        {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
);

const monthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const HomePage = () => {
    const dispatch = useDispatch();
    const {
        loading,
        error,
        todaysOrdersCount,
        todaysSales,
        todaysProfit,
        currentMonthTotal,
        monthSalesByDay,
        reviewsToday,
        totalProductReviews,
    } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    return (
        <div>
            <h1 className="text-xl font-medium text-stone-800">Home</h1>
            <p className="mt-1 text-sm text-stone-500">
                Aaj ka overview - saara calculation vendor price ke basis par hai
            </p>

            {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            {loading ? (
                <p className="mt-6 text-sm text-stone-400">Loading...</p>
            ) : (
                <>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Aaj Ke Orders" value={todaysOrdersCount} />
                        <StatCard label="Aaj Ki Sales" value={formatINR(todaysSales)} />
                        <StatCard
                            label="Aaj Ka Profit"
                            value={formatINR(todaysProfit)}
                            hint="Sirf DELIVERED items ka"
                        />
                        <StatCard label="Aaj Ke Reviews" value={reviewsToday} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <StatCard
                            label={`${monthName} Ki Total Sales`}
                            value={formatINR(currentMonthTotal)}
                        />
                        <StatCard label="Total Product Reviews" value={totalProductReviews} />
                    </div>

                    <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
                        <p className="mb-4 text-sm font-medium text-stone-700">
                            {monthName} - Din Wise Sales
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthSalesByDay}>
                                <CartesianGrid stroke="#f1f1ef" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} />
                                <YAxis tick={{ fontSize: 12, fill: "#78716c" }} />
                                <Tooltip formatter={(value) => formatINR(value)} labelFormatter={(d) => `Din ${d}`} />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default HomePage;