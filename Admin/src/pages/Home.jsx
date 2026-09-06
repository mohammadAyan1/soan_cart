import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
    const { isLoggedIn, user } = useSelector((state) => state.auth);

    return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to MyApp
            </h1>
            <p className="text-gray-600 mb-8">
                Vendors ke liye ek platform jahan wo apne products manage kar sakte hain.
            </p>

            {!isLoggedIn && (
                <div className="flex justify-center gap-4">
                    <Link
                        to="/register"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
                    >
                        Vendor Bano
                    </Link>
                    <Link
                        to="/login"
                        className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Login
                    </Link>
                </div>
            )}

            {isLoggedIn && user?.role === "VENDOR" && (
                <Link
                    to="/vendor/dashboard"
                    className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
                >
                    Go to Vendor Dashboard
                </Link>
            )}

            {isLoggedIn && user?.role === "ADMIN" && (
                <Link
                    to="/admin/dashboard"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
                >
                    Go to Admin Dashboard
                </Link>
            )}
        </div>
    );
};

export default Home;