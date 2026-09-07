import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    FolderTree,
    Tags
} from "lucide-react";

function DashboardLayout() {

    const [isOpen, setIsOpen] = useState(true);

    return (

        <div className="flex h-screen overflow-hidden">

            {/* SIDEBAR */}

            <aside
                className={`
                    ${isOpen ? "w-64" : "w-20"}
                    h-screen
                    shrink-0
                    bg-white
                    border-r
                    transition-all
                    duration-300
                    overflow-hidden
                `}
            >

                {/* LOGO */}

                <div className="h-16 shrink-0 flex items-center justify-center border-b">

                    {isOpen ? (
                        <h1 className="text-xl font-bold">
                            My Dashboard
                        </h1>
                    ) : (
                        <h1 className="text-xl font-bold">
                            M
                        </h1>
                    )}

                </div>


                {/* SIDEBAR MENU */}

                <nav className="p-3 space-y-2">

                    <Link
                        to="/"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <LayoutDashboard size={20} />

                        {isOpen && (
                            <span>
                                Dashboard
                            </span>
                        )}
                    </Link>


                    <Link
                        to="/users"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <Users size={20} />

                        {isOpen && (
                            <span>
                                Users
                            </span>
                        )}
                    </Link>


                    <Link
                        to="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <span>📦</span>

                        {isOpen && (
                            <span>
                                Orders
                            </span>
                        )}
                    </Link>


                    <Link
                        to="/products"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <span>🛒</span>

                        {isOpen && (
                            <span>
                                Products
                            </span>
                        )}
                    </Link>


                    <Link
                        to="/categories"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <FolderTree size={20} />

                        {isOpen && (
                            <span>
                                Categories
                            </span>
                        )}
                    </Link>


                    <Link
                        to="/subcategories"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    >
                        <Tags size={20} />

                        {isOpen && (
                            <span>
                                Sub Categories
                            </span>
                        )}
                    </Link>

                </nav>

            </aside>


            {/* RIGHT SIDE */}

            <div className="flex-1 min-w-0 min-h-0 flex flex-col">

                {/* HEADER */}

                <header className="h-16 shrink-0 bg-white border-b flex items-center px-4">

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isOpen
                            ? <X size={24} />
                            : <Menu size={24} />
                        }
                    </button>

                    <h1 className="ml-4 text-lg font-semibold">
                        Dashboard
                    </h1>

                    <Link
                        to="/login"
                        className="ml-auto text-lg font-semibold"
                    >
                        Login
                    </Link>

                </header>


                {/* ONLY THIS AREA WILL SCROLL */}

                <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 p-6 hide-scrollbar">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;