import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice"; // apna actual path daal dena

const navItems = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/order", label: "Order" },
];

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-gray-100 flex flex-col">
                <div className="h-16 flex items-center px-6 text-lg font-bold border-b border-gray-800">
                    Admin Panel
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-2 truncate">{user?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Content area */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white shadow-sm flex items-center px-6">
                    <h1 className="text-lg font-semibold text-gray-800">
                        Welcome, {user?.fullName}
                    </h1>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;