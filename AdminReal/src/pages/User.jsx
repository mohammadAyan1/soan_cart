import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllUsers,
    updateUserRole,
    toggleUserStatus,
    fetchUserPassword,
    clearPasswordData,
} from '../redux/slices/adminUserSlice';

const ROLES = ["USER", "VENDOR", "ADMIN"];

const roleBadgeColor = {
    ADMIN: "bg-purple-100 text-purple-700 border-purple-300",
    VENDOR: "bg-blue-100 text-blue-700 border-blue-300",
    USER: "bg-gray-100 text-gray-700 border-gray-300",
};

const User = () => {
    const dispatch = useDispatch();

    const {
        users,
        pagination,
        listLoading,
        listError,
        passwordData,
        passwordLoading,
        passwordError,
    } = useSelector((state) => state.adminUser);



    // ---------- Local state ----------
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const [passwordModalUser, setPasswordModalUser] = useState(null); // { id, fullName }
    const [roleUpdatingId, setRoleUpdatingId] = useState(null); // jis user ka role change ho raha hai
    const [statusUpdatingId, setStatusUpdatingId] = useState(null); // jis user ka status toggle ho raha hai
    const [actionError, setActionError] = useState("");

    // ---------- Fetch users on page/search/role change ----------
    useEffect(() => {
        dispatch(fetchAllUsers({ page, limit: 10, search, role: roleFilter }));
    }, [dispatch, page, search, roleFilter]);


    useEffect(() => {
        console.log(users, "ASDFGHJK");
    }, [users])

    // ---------- Search submit (debounce ki jagah simple submit rakha hai) ----------
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    // ---------- Role change ----------
    const handleRoleChange = async (userId, newRole) => {
        setActionError("");
        setRoleUpdatingId(userId);
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
        } catch (err) {
            setActionError(err?.message || "Role update nahi hua");
        } finally {
            setRoleUpdatingId(null);
        }
    };

    // ---------- Status toggle (isDelete = true matlab inactive) ----------
    const handleStatusToggle = async (user) => {
        setActionError("");
        setStatusUpdatingId(user.id);
        try {
            await dispatch(
                toggleUserStatus({ userId: user.id, isActive: user.isDelete })
                // isDelete true hai -> activate karna hai (isActive: true bhejna backend expectation ke hisab se)
            ).unwrap();
        } catch (err) {
            setActionError(err?.message || "Status update nahi hua");
        } finally {
            setStatusUpdatingId(null);
        }
    };

    // ---------- Password modal open/close ----------
    const openPasswordModal = async (user) => {
        setPasswordModalUser({ id: user.id, fullName: user.fullName });
        try {
            await dispatch(fetchUserPassword(user.id)).unwrap();
        } catch (err) {
            // error passwordError se UI me already dikh jayega
        }
    };

    const closePasswordModal = () => {
        setPasswordModalUser(null);
        dispatch(clearPasswordData());
    };

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                        <p className="text-sm text-gray-500">Admin panel se saare users control karo</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-semibold text-gray-800">{pagination?.totalCount || 0}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
                    <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[250px]">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Naam, email ya phone se search karo..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                        >
                            Search
                        </button>
                    </form>

                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setPage(1);
                            setRoleFilter(e.target.value);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        <option value="">Sabhi Roles</option>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {actionError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                        {actionError}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-left">
                                    <th className="p-3 font-medium">User</th>
                                    <th className="p-3 font-medium">Contact</th>
                                    <th className="p-3 font-medium">Role</th>
                                    <th className="p-3 font-medium">Password</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium">Orders</th>
                                    <th className="p-3 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listLoading && (
                                    <tr>
                                        <td colSpan={7} className="text-center p-6 text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                )}

                                {!listLoading && listError && (
                                    <tr>
                                        <td colSpan={7} className="text-center p-6 text-red-500">
                                            {listError}
                                        </td>
                                    </tr>
                                )}

                                {!listLoading && !listError && users?.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center p-6 text-gray-400">
                                            Koi user nahi mila
                                        </td>
                                    </tr>
                                )}

                                {!listLoading && !listError && users?.map((user) => (
                                    <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                        {/* User info */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.imageUrl || "https://via.placeholder.com/40"}
                                                    alt={user.fullName}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">{user.fullName}</p>
                                                    <p className="text-xs text-gray-400">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="p-3">
                                            <p className="text-gray-700">{user.email}</p>
                                            <p className="text-xs text-gray-400">{user.phone}</p>
                                        </td>

                                        {/* Role dropdown */}
                                        <td className="p-3">
                                            <select
                                                value={user.role}
                                                disabled={roleUpdatingId === user.id}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`text-xs font-semibold border rounded-full px-2 py-1 outline-none cursor-pointer ${roleBadgeColor[user.role] || "bg-gray-100 text-gray-700 border-gray-300"} ${roleUpdatingId === user.id ? "opacity-50" : ""}`}
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Password reveal */}
                                        <td className="p-3">
                                            <button
                                                onClick={() => openPasswordModal(user)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                            >
                                                Dekho
                                            </button>
                                        </td>

                                        {/* Status toggle */}
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleStatusToggle(user)}
                                                disabled={statusUpdatingId === user.id}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${user.isDelete
                                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                    : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                    } ${statusUpdatingId === user.id ? "opacity-50" : ""}`}
                                            >
                                                {statusUpdatingId === user.id
                                                    ? "..."
                                                    : user.isDelete
                                                        ? "Inactive"
                                                        : "Active"}
                                            </button>
                                        </td>

                                        {/* Orders count */}
                                        <td className="p-3 text-gray-600">
                                            {user._count?.orders ?? 0}
                                        </td>

                                        {/* Joined */}
                                        <td className="p-3 text-gray-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-800">{pagination?.currentPage || 1}</span> of{" "}
                        <span className="font-medium text-gray-800">{pagination?.totalPages || 1}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pagination?.currentPage <= 1}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination?.totalPages || 1, p + 1))}
                            disabled={pagination?.currentPage >= pagination?.totalPages}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {passwordModalUser && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {passwordModalUser.fullName} ka Password
                            </h2>
                            <button
                                onClick={closePasswordModal}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {passwordLoading && (
                            <p className="text-sm text-gray-500">Password fetch ho raha hai...</p>
                        )}

                        {!passwordLoading && passwordError && (
                            <p className="text-sm text-red-500">{passwordError}</p>
                        )}

                        {!passwordLoading && !passwordError && passwordData && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                                <span className="font-mono text-sm text-gray-800">
                                    {passwordData.password}
                                </span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(passwordData.password)}
                                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        )}

                        <button
                            onClick={closePasswordModal}
                            className="w-full mt-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        >
                            Band Karo
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default User