import { Outlet, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const MainLayout = () => {
    const { isLoggedIn, user } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Public navbar - login/register sirf yahin dikhega */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                        MyApp
                    </Link>

                    <nav className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <>
                                <span className="text-sm text-gray-600 hidden sm:inline">
                                    Hi, {user?.fullName}
                                </span>

                                {/* Role ke hisab se apna dashboard link dikhao */}
                                {user?.role === "ADMIN" && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-sm font-medium text-indigo-600 hover:underline"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {user?.role === "VENDOR" && (
                                    <Link
                                        to="/vendor/dashboard"
                                        className="text-sm font-medium text-indigo-600 hover:underline"
                                    >
                                        Vendor Panel
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    Become a Vendor
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} MyApp. All rights reserved.
            </footer>
        </div>
    );
};

export default MainLayout;