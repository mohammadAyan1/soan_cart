import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardSummary } from '../redux/slices/dashboardSlice'; // Apna path check kar lena
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { summary, loading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardSummary());
    }, [dispatch]);

    // Dashboard summary ke basis par boxes ka data
    const dashBoardBox = [
        {
            name: "Aaj ke Users",
            routes: "/users",
            number: summary?.todayUsersCount || 0,
            color: "blue"
        },
        {
            name: "Aaj ke Orders",
            routes: "/orders",
            number: summary?.todayOrdersCount || 0,
            color: "yellow"
        },
        {
            name: "Aaj ki Sales (₹)",
            routes: "/orders",
            number: `₹${summary?.todaySalesTotal || 0}`,
            color: "green"
        },
        {
            name: "Running Month Sales (₹)",
            routes: "/orders",
            number: `₹${summary?.runningMonthSalesTotal || 0}`,
            color: "purple"
        },
        {
            name: "Naye Products (Aaj)",
            routes: "/products",
            number: summary?.todayProductsCount || 0,
            color: "blue"
        },
        {
            name: "Add to Cart (Aaj)",
            routes: "/",
            number: summary?.todayCartAddsCount || 0,
            color: "yellow"
        },
        {
            name: "Add to Wishlist (Aaj)",
            routes: "/",
            number: summary?.todayWishlistAddsCount || 0,
            color: "green"
        },
        {
            name: "New Reviews (Aaj)",
            routes: "/",
            number: summary?.todayReviewsCount || 0,
            color: "purple"
        }
    ];

    const borderColors = {
        blue: "border-blue-400",
        yellow: "border-yellow-400",
        green: "border-green-400",
        purple: "border-purple-400",
    };

    const handleClick = (payload) => {
        if (payload?.activeLabel) {
            navigate(`/sales/${payload?.activeLabel}`);
        }
    };

    return (
        <main className='grid grid-cols-1 gap-8 p-6'>
            <h1 className='font-bold text-2xl'>
                <span className='text-blue-600'>Dash</span><span className='text-black'>Board</span>
            </h1>

            {/* Dashboard Summary Cards */}
            <div className='grid grid-cols-4 gap-4'>
                {dashBoardBox.map((item, index) => (
                    <Link
                        key={index}
                        to={item.routes}
                        className={`flex flex-col h-30 w-full bg-white justify-center items-center rounded-2xl border-4 ${borderColors[item.color]} hover:border-blue-500 hover:shadow-lg transition p-4`}
                    >
                        <span className="text-xl font-bold text-gray-800">{item.number}</span>
                        <span className="text-xs text-gray-500 mt-1 text-center font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Current Year Month-Wise Sales Overview Chart (Dynamic from DB) */}
            <div className="w-full h-80 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Current Year Month-Wise Sales Overview</h2>
                {summary?.monthWiseSales?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={summary.monthWiseSales} onClick={handleClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#2A7C13" strokeWidth={3} style={{ cursor: "pointer" }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        {loading ? "Loading chart data..." : "Is year ki koi sales data available nahi hai"}
                    </div>
                )}
            </div>

            {/* Running Month Date Wise Sales Overview Chart */}
            <div className="w-full h-80 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Running Month Date-Wise Sales Overview</h2>
                {summary?.dateWiseSales?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={summary.dateWiseSales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                        {loading ? "Loading chart data..." : "Is month ki abhi tak koi sales nahi hai"}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Home;