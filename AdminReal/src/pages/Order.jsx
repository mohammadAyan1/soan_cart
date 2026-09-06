import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllOrder,
    OrderItemStatusChange,
    clearOrderError,
} from '../redux/slices/orderSlice';
import {
    fetchAllUsers
} from '../redux/slices/adminUserSlice';

const DELIVERY_STATUSES = [
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY",
    "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURN_ACCEPTED",
    "RETURN_REJECTED", "RETURNED",
];

const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    RETURN_REQUESTED: "bg-orange-100 text-orange-700",
    RETURN_ACCEPTED: "bg-orange-100 text-orange-700",
    RETURN_REJECTED: "bg-red-100 text-red-700",
    RETURNED: "bg-gray-200 text-gray-700",
};

// helper - profit amount ke hisab se text color (loss ho toh red, profit ho toh green)
const profitTextColor = (amount) => (amount < 0 ? "text-red-600" : "text-green-600");

const Order = () => {
    const dispatch = useDispatch();

    const {
        orders,
        pagination,
        summary, // 👈 NAYA
        loading,
        error,
        formLoading,
    } = useSelector((state) => state.order);


    const [filterVendors, setFilterVendors] = useState([])
    const [filterVendorsLoading, setFilterVendorsLoading] = useState(true)
    const [filterUsers, setFilterUsers] = useState([])
    const [filterUsersLoading, setFilterUsersLoading] = useState(true)

    // ---------- Filters ----------
    const [page, setPage] = useState(1);
    const [active, setActive] = useState(false); // isDelete=false -> "active" orders
    const [vendorId, setVendorId] = useState("");
    const [userId, setUserId] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState(""); // 👈 NAYA
    const [toDate, setToDate] = useState("");     // 👈 NAYA

    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [statusDraft, setStatusDraft] = useState({}); // { [itemId]: newStatus }
    const [noteDraft, setNoteDraft] = useState({}); // { [itemId]: note }

    // ---------- Vendors & Users dropdown (ek baar load - hasOrders=true wale hi aayenge) ----------
    useEffect(() => {
        dispatch(fetchAllUsers({ role: "VENDOR", hasOrders: "true", limit: 1000 }))
            .unwrap()
            .then((res) => {
                setFilterVendors(res?.data)
            })
            .catch((error) => {
                console.error("Failed to fetch users:", error);
            }).finally(() => {
                setFilterVendorsLoading(false)
            });
        dispatch(fetchAllUsers({ role: "USER", hasOrders: "true", limit: 1000 })).unwrap()
            .then((res) => {
                setFilterUsers(res?.data)
            })
            .catch((error) => {
                console.error("Failed to fetch users:", error);
            }).finally(() => {
                setFilterUsersLoading(false)
            });
    }, [dispatch]);

    // ---------- Orders (filters/page change hone pe) ----------
    useEffect(() => {
        dispatch(fetchAllOrder({ page, limit: 20, active, vendorId, userId, status, fromDate, toDate }));
    }, [dispatch, page, active, vendorId, userId, status, fromDate, toDate]); // 👈 fromDate/toDate add kiya

    const refetchOrders = () => {
        dispatch(fetchAllOrder({ page, limit: 20, active, vendorId, userId, status, fromDate, toDate }));
    };

    const resetFilters = () => {
        setPage(1);
        setVendorId("");
        setUserId("");
        setStatus("");
        setFromDate(""); // 👈 NAYA
        setToDate("");   // 👈 NAYA
    };

    const toggleExpand = (orderId) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    const handleItemStatusUpdate = async (itemId) => {
        const newStatus = statusDraft[itemId];
        if (!newStatus) return;
        try {
            await dispatch(
                OrderItemStatusChange({ id: itemId, status: newStatus, note: noteDraft[itemId] || "" })
            ).unwrap();
            refetchOrders(); // 👈 status change ke baad list refresh
        } catch (err) {
            // error already state.error me aa jayega
        }
    };

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                        <p className="text-sm text-gray-500">Vendor-wise ya User-wise orders dekho aur status update karo</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-semibold text-gray-800">{pagination?.total || 0}</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between items-center">
                        <span>{typeof error === "string" ? error : "Kuch error aaya"}</span>
                        <button onClick={() => dispatch(clearOrderError())} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                )}

                {/* 👇 NAYA - Top summary cards (poore FILTERED data ka sum, pagination independent) */}
                {summary && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Actual Amount (Total)</p>
                            <p className="text-lg font-bold text-gray-800">₹{summary.actualTotal.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">MRP Amount (Total)</p>
                            <p className="text-lg font-bold text-gray-800">₹{summary.mrpTotal.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Vendor Min Amount (Total)</p>
                            <p className="text-lg font-bold text-gray-800">₹{summary.vendorMinTotal.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Total Profit</p>
                            <p className={`text-lg font-bold ${profitTextColor(summary.profitAmount)}`}>
                                ₹{summary.profitAmount.toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs text-gray-400 mb-1">Profit %</p>
                            <p className={`text-lg font-bold ${profitTextColor(summary.profitAmount)}`}>
                                {summary.profitPercentage}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
                    {/* Vendor filter - sirf wahi jinke paas order hai */}
                    <select
                        value={vendorId}
                        onChange={(e) => { setPage(1); setVendorId(e.target.value); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[200px]"
                    >
                        <option value="">
                            {filterVendorsLoading ? "Vendors load ho rahe hai..." : "Sabhi Vendors"}
                        </option>
                        {filterVendors?.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.fullName} ({v._count?.vendorOrderItems || 0} items)
                            </option>
                        ))}
                    </select>

                    {/* User filter - sirf wahi jinke paas order hai */}
                    <select
                        value={userId}
                        onChange={(e) => { setPage(1); setUserId(e.target.value); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[200px]"
                    >
                        <option value="">
                            {filterUsersLoading ? "Users load ho rahe hai..." : "Sabhi Users"}
                        </option>
                        {filterUsers?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.fullName} ({u._count?.orders || 0} orders)
                            </option>
                        ))}
                    </select>

                    {/* Delivery status filter */}
                    <select
                        value={status}
                        onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        <option value="">Sabhi Status</option>
                        {DELIVERY_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* 👇 NAYA - Date range filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">From</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => { setPage(1); setFromDate(e.target.value); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <label className="text-xs text-gray-500">To</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => { setPage(1); setToDate(e.target.value); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {/* Active/Inactive toggle */}
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => { setPage(1); setActive(e.target.checked); }}
                            className="w-4 h-4"
                        />
                        Deleted/Inactive orders dikhao
                    </label>

                    {(vendorId || userId || status || fromDate || toDate) && (
                        <button
                            onClick={resetFilters}
                            className="text-xs px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition"
                        >
                            Filters clear karo
                        </button>
                    )}
                </div>

                {/* Orders list */}
                <div className="space-y-3">
                    {loading && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
                            Orders load ho rahe hai...
                        </div>
                    )}

                    {!loading && orders.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                            Koi order nahi mila in filters ke sath
                        </div>
                    )}

                    {!loading && orders?.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            {/* Order summary row */}
                            <button
                                onClick={() => toggleExpand(order.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium">{order.user?.fullName}</p>
                                        <p className="text-xs text-gray-400">{order.user?.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* 👇 NAYA - is order ka profit, price ke bagal me */}
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-800">₹{order.totalAmount}</span>
                                        {order.orderSummary && (
                                            <p className={`text-xs font-medium ${profitTextColor(order.orderSummary.profitAmount)}`}>
                                                Profit: ₹{order.orderSummary.profitAmount} ({order.orderSummary.profitPercentage}%)
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                        {order.paymentStatus}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {order.items?.length || 0} item(s)
                                    </span>
                                    <span className="text-gray-400">
                                        {expandedOrderId === order.id ? "▲" : "▼"}
                                    </span>
                                </div>
                            </button>

                            {/* Expanded items */}
                            {expandedOrderId === order.id && (
                                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                                    <div className="text-xs text-gray-500 mb-2">
                                        Delivery: {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                                    </div>

                                    {order.items?.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {item.product?.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Vendor: {item.vendor?.fullName} • Qty: {item.quantity}
                                                    </p>
                                                </div>

                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[item.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
                                                    {item.deliveryStatus}
                                                </span>
                                            </div>

                                            {/* 👇 NAYA - teeno price + profit */}
                                            {item.priceDetails && (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 bg-gray-50 rounded-lg p-3">
                                                    <div>
                                                        <p className="text-[11px] text-gray-400">Actual Price</p>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            ₹{item.priceDetails.actualPrice}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-gray-400">MRP</p>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            ₹{item.priceDetails.mrp}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-gray-400">Vendor Min Price</p>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            ₹{item.priceDetails.vendorMinPrice}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] text-gray-400">Profit</p>
                                                        <p className={`text-sm font-semibold ${profitTextColor(item.priceDetails.profitAmount)}`}>
                                                            ₹{item.priceDetails.profitAmount} ({item.priceDetails.profitPercentage}%)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status change controls */}
                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <select
                                                    value={statusDraft[item.id] || item.deliveryStatus}
                                                    onChange={(e) =>
                                                        setStatusDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                                                    }
                                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 outline-none"
                                                >
                                                    {DELIVERY_STATUSES.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>

                                                <input
                                                    type="text"
                                                    placeholder="Note (optional)"
                                                    value={noteDraft[item.id] || ""}
                                                    onChange={(e) =>
                                                        setNoteDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                                                    }
                                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 outline-none flex-1 min-w-[150px]"
                                                />

                                                <button
                                                    onClick={() => handleItemStatusUpdate(item.id)}
                                                    disabled={formLoading}
                                                    className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                                                >
                                                    {formLoading ? "..." : "Update"}
                                                </button>
                                            </div>

                                            {/* Status history */}
                                            {item.statusHistory?.length > 0 && (
                                                <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1">
                                                    {item.statusHistory.map((h) => (
                                                        <p key={h.id} className="text-[11px] text-gray-400">
                                                            {h.status} — {new Date(h.changedAt).toLocaleString("en-IN")}
                                                            {h.note ? ` (${h.note})` : ""}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* 👇 NAYA - is order ka overall breakup */}
                                    {order.orderSummary && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-gray-200 rounded-lg p-3">
                                            <div>
                                                <p className="text-[11px] text-gray-400">Order Actual Total</p>
                                                <p className="text-sm font-semibold text-gray-800">₹{order.orderSummary.actualTotal}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400">Order MRP Total</p>
                                                <p className="text-sm font-semibold text-gray-800">₹{order.orderSummary.mrpTotal}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400">Order Vendor Min Total</p>
                                                <p className="text-sm font-semibold text-gray-800">₹{order.orderSummary.vendorMinTotal}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400">Order Profit</p>
                                                <p className={`text-sm font-semibold ${profitTextColor(order.orderSummary.profitAmount)}`}>
                                                    ₹{order.orderSummary.profitAmount} ({order.orderSummary.profitPercentage}%)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-800">{pagination?.page || 1}</span> of{" "}
                        <span className="font-medium text-gray-800">{pagination?.totalPages || 1}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={pagination?.page <= 1}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(pagination?.totalPages || 1, p + 1))}
                            disabled={pagination?.page >= pagination?.totalPages}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Order