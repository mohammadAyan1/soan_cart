import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllUsers,
    fetchUserById,
    updateUserRole,
    toggleUserStatus,
    fetchUserPassword,
    clearSelectedUser,
    clearPasswordData,
} from "../../redux/slices/adminUserSlice"; // apna path daal dena

const ROLES = ["USER", "VENDOR", "ADMIN"];

const roleBadgeClass = {
    ADMIN: "bg-indigo-100 text-indigo-700",
    VENDOR: "bg-emerald-100 text-emerald-700",
    USER: "bg-gray-100 text-gray-700",
};

const Users = () => {
    const dispatch = useDispatch();

    const {
        users,
        pagination,
        listLoading,
        listError,
        selectedUser,
        detailLoading,
        roleUpdateLoading,
        statusUpdateLoading,
        passwordData,
        passwordLoading,
        passwordError,
    } = useSelector((state) => state.adminUser);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [detailModalUserId, setDetailModalUserId] = useState(null);
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [showPasswordText, setShowPasswordText] = useState(false);

    // Search debounce - taaki har keystroke pe API na maare
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);



    useEffect(() => {
        dispatch(fetchAllUsers({ page, limit, search: debouncedSearch, role: roleFilter }));
    }, [dispatch, page, limit, debouncedSearch, roleFilter]);

    // ---------------- Detail Modal ----------------
    const openDetailModal = (userId) => {
        setDetailModalUserId(userId);
        dispatch(fetchUserById(userId));
    };

    const closeDetailModal = () => {
        setDetailModalUserId(null);
        dispatch(clearSelectedUser());
    };

    // ---------------- Role Change ----------------
    const handleRoleChange = (userId, newRole) => {
        if (!window.confirm(`Role ko "${newRole}" me change karna hai?`)) return;
        dispatch(updateUserRole({ userId, role: newRole }));
    };

    // ---------------- Activate/Deactivate ----------------
    const handleToggleStatus = (user) => {
        const isCurrentlyActive = !user.isDelete;
        const confirmMsg = isCurrentlyActive
            ? `${user.fullName} ko deactivate karna hai?`
            : `${user.fullName} ko activate karna hai?`;
        if (!window.confirm(confirmMsg)) return;

        dispatch(toggleUserStatus({ userId: user.id, isActive: !isCurrentlyActive }));
    };

    // ---------------- Password Modal ----------------
    const openPasswordModal = (user) => {
        setPasswordModalUser(user);
        setShowPasswordText(false);
        dispatch(fetchUserPassword(user.id));
    };

    const closePasswordModal = () => {
        setPasswordModalUser(null);
        dispatch(clearPasswordData());
    };

    const totalPages = pagination?.totalPages || 1;

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>

                <div className="flex items-center gap-3 flex-wrap">
                    <input
                        type="text"
                        placeholder="Naam, email ya phone se search karo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Sabhi Roles</option>
                        {ROLES.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {listError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {listError}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">User</th>
                                <th className="px-4 py-3 font-medium">Contact</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Addresses</th>
                                <th className="px-4 py-3 font-medium">Orders</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {listLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                        Koi user nahi mila
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.imageUrl ? (
                                                    <img
                                                        src={user.imageUrl}
                                                        alt={user.fullName}
                                                        className="w-9 h-9 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                                                        {user.fullName?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800">{user.fullName}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {user.isVerified ? "Verified" : "Not Verified"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <p>{user.email}</p>
                                            <p className="text-xs text-gray-400">{user.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={user.role}
                                                disabled={roleUpdateLoading}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`text-xs font-semibold rounded-full px-2.5 py-1.5 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${roleBadgeClass[user.role]}`}
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r} value={r}>
                                                        {r}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={statusUpdateLoading}
                                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${!user.isDelete
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                    }`}
                                            >
                                                {!user.isDelete ? "Active" : "Deactivated"}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user._count?.addresses ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user._count?.orders ?? 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetailModal(user.id)}
                                                    className="text-xs font-medium text-indigo-600 hover:underline"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => openPasswordModal(user)}
                                                    className="text-xs font-medium text-amber-600 hover:underline"
                                                >
                                                    Password
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Total {pagination?.totalCount || 0} users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-gray-600">
                            Page {pagination?.currentPage || 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------------- Detail Modal (with Addresses) ---------------- */}
            {detailModalUserId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-800">User Detail</h3>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-5">
                            {detailLoading ? (
                                <p className="text-center text-gray-400 py-8">Loading...</p>
                            ) : selectedUser ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        {selectedUser.imageUrl ? (
                                            <img
                                                src={selectedUser?.imageUrl}
                                                alt={selectedUser.fullName}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-semibold">
                                                {selectedUser.fullName?.charAt(0)?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {selectedUser.fullName}
                                            </p>
                                            <span
                                                className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mt-1 ${roleBadgeClass[selectedUser.role]}`}
                                            >
                                                {selectedUser.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div>
                                            <p className="text-gray-400">Email</p>
                                            <p className="text-gray-800">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Phone</p>
                                            <p className="text-gray-800">{selectedUser.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <p className="text-gray-800">
                                                {selectedUser.isDelete ? "Deactivated" : "Active"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Verified</p>
                                            <p className="text-gray-800">
                                                {selectedUser.isVerified ? "Haan" : "Nahi"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Total Orders</p>
                                            <p className="text-gray-800">{selectedUser._count?.orders ?? 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Total Reviews</p>
                                            <p className="text-gray-800">{selectedUser._count?.reviews ?? 0}</p>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                        Addresses ({selectedUser.addresses?.length || 0})
                                    </h4>

                                    {selectedUser.addresses?.length ? (
                                        <div className="space-y-3">
                                            {selectedUser.addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className="border border-gray-200 rounded-lg p-3 text-sm"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-gray-800">
                                                            {addr.fullName} — {addr.phone}
                                                        </p>
                                                        {addr.isDefault && (
                                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600">
                                                        {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                                                        {addr.pincode}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">Koi address nahi mila</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-gray-400 py-8">User nahi mila</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- Password Modal ---------------- */}
            {passwordModalUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">Password</h3>
                            <button
                                onClick={closePasswordModal}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-gray-500 mb-3">
                                {passwordModalUser.fullName} ({passwordModalUser.email})
                                <br />

                                Password:={passwordModalUser?.actual_password}
                            </p>

                            {passwordLoading ? (
                                <p className="text-center text-gray-400 py-4">Loading...</p>
                            ) : passwordError ? (
                                <p className="text-sm text-red-600">{passwordError}</p>
                            ) : passwordData ? (
                                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                                    <span className="flex-1 font-mono text-sm text-gray-800">
                                        {showPasswordText ? passwordData.password : "••••••••••"}
                                    </span>
                                    <button
                                        onClick={() => setShowPasswordText((s) => !s)}
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        {showPasswordText ? "Hide" : "Show"}
                                    </button>
                                    <button
                                        onClick={() =>
                                            navigator.clipboard.writeText(passwordData.password)
                                        }
                                        className="text-xs text-gray-500 hover:underline"
                                    >
                                        Copy
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;