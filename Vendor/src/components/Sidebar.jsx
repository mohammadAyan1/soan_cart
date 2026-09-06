import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutVendor } from "../redux/slices/authSlice";

const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/orders", label: "Orders" },
    { to: "/products", label: "Products" },
    { to: "/reviews", label: "Reviews" },
    { to: "/profile", label: "Update Profile" },
];

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logoutVendor());
        navigate("/login");
    };

    return (
        <aside className="flex h-screen w-64 flex-col justify-between border-r border-stone-200 bg-white">
            <div>
                <div className="border-b border-stone-200 px-6 py-5">
                    <p className="text-sm text-stone-400">Vendor Panel</p>
                    <p className="mt-1 truncate text-base font-medium text-stone-800">
                        {user?.fullName || "..."}
                    </p>
                </div>

                <nav className="flex flex-col gap-1 px-3 py-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                    ? "bg-indigo-50 font-medium text-indigo-700"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="border-t border-stone-200 p-3">
                <button
                    onClick={handleLogout}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-stone-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;