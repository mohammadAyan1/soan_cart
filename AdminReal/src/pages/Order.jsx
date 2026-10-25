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
import api from '../api/api';


import ImagePreviewModal from '../components/imagePreview/ImagePreviewModal';
import OrderInvoiceModal from '../components/invoice/OrderInvoiceModal';

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
    const [selectedVendor, setSelectedVendor] = useState("");




    const handleVendorChange = async (e, id) => {
        const vendorId = Number(e.target.value);

        const vendor = filterVendors.find(
            (item) => item.id === vendorId
        );

        setSelectedVendor(vendor || null);

        try {
            const res = await api.patch(`/api/order/items/${id}/${vendor?.id}/changeVendor`);

            if (res.data?.success) {

                dispatch(fetchAllOrder({ page, limit: 20, active, vendorId, userId, status, fromDate, toDate }));

                // yahan apni list refresh/update kar sakte ho
            }
        } catch (error) {

        }



        // Yahan apna API/function bhi call kar sakte ho
        // handleChangeVendor(vendorId);
    };

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
    const [showImage, setShowImage] = useState(false); // { [itemId]: note }
    const [imageUrl, setImageUrl] = useState(""); // { [itemId]: note }
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

    // ---------- Vendors & Users dropdown (ek baar load - hasOrders=true wale hi aayenge) ----------
    useEffect(() => {
        dispatch(fetchAllUsers({ role: "VENDOR", hasOrders: "true", limit: 1000 }))
            .unwrap()
            .then((res) => {
                setFilterVendors(res?.data)
            })
            .catch((error) => {

            }).finally(() => {
                setFilterVendorsLoading(false)
            });
        dispatch(fetchAllUsers({ role: "USER", hasOrders: "true", limit: 1000 })).unwrap()
            .then((res) => {
                setFilterUsers(res?.data)
            })
            .catch((error) => {

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

    const handleOpenModel = (imageModel) => {
        setShowImage(true)
        setImageUrl(imageModel)
    }

    const handleCloseImagePreview = () => {
        setShowImage(false)
    }



    const handleChnageVendorAllow = async (id) => {
        try {
            const res = await api.patch(`/api/order/items/${id}/toggleVendor`);

            if (res.data?.success) {

                dispatch(fetchAllOrder({ page, limit: 20, active, vendorId, userId, status, fromDate, toDate }));

                // yahan apni list refresh/update kar sakte ho
            }
        } catch (error) {

        }
    };

    const handleToggleOrderDelete = async (orderId, currentIsDelete) => {
        const confirmMessage = currentIsDelete
            ? "Kya aap is order ko wapas ACTIVE karna chahte hain?"
            : "Kya aap is order ko INACTIVE (Delete) karna chahte hain?";

        if (!window.confirm(confirmMessage)) return;

        try {
            const res = await api.patch(`/api/order/admin/${orderId}/toggle-delete`);
            if (res.data?.success) {
                refetchOrders();
            }
        } catch (error) {

            alert(error?.response?.data?.message || "Order status change karne me error aaya");
        }
    };

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            {showImage && <ImagePreviewModal image={imageUrl} onClose={handleCloseImagePreview} />}
            {selectedInvoiceOrder && (
                <OrderInvoiceModal
                    order={selectedInvoiceOrder}
                    onClose={() => setSelectedInvoiceOrder(null)}
                />
            )}
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
                            <div
                                onClick={() => toggleExpand(order.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-800">#{order.orderNumber}</p>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-bold border border-gray-200">
                                                Inv #{order.invoiceNumber || order.id}
                                            </span>
                                        </div>
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

                                <div className="flex items-center gap-3">
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

                                    {/* 👇 Print Bill Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedInvoiceOrder(order);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition active:scale-95 shadow-xs"
                                        title="Print Tax Invoice / Bill"
                                    >
                                        <span>🧾</span>
                                        <span>Print Bill</span>
                                    </button>

                                    {/* 👇 Inactive / Active Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleOrderDelete(order.id, order.isDelete);
                                        }}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border active:scale-95 ${order.isDelete
                                            ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                            : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                            }`}
                                        title={order.isDelete ? "Order ko wapas Active karo" : "Order ko Inactive (Delete) karo"}
                                    >
                                        <span>{order.isDelete ? "♻️" : "🗑️"}</span>
                                        <span>{order.isDelete ? "Active" : "Inactive"}</span>
                                    </button>

                                    <span className="text-gray-400 pl-1">
                                        {expandedOrderId === order.id ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded items */}
                            {expandedOrderId === order.id && (
                                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mb-2">
                                        <div>
                                            Delivery: {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedInvoiceOrder(order)}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 transition shadow-xs"
                                        >
                                            <span>🧾</span>
                                            <span>View Full Tax Invoice</span>
                                        </button>
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


                                            {item?.variant && (
                                                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                        {/* Variant Details */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                                                                Variant
                                                            </p>

                                                            <h3 className="text-sm font-semibold text-gray-800">
                                                                {item?.variant?.description || "No description available"}
                                                            </h3>

                                                            {/* Optional price/details */}
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {item?.variant?.actualPrice && (
                                                                    <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                                                        ₹{item.variant.actualPrice}
                                                                    </span>
                                                                )}

                                                                {item?.variant?.stock !== undefined && (
                                                                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                                        Stock: {item.variant.stock}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Images */}
                                                        {item?.variant?.images?.length > 0 && (
                                                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                                                {item.variant.images.map((img, index) => (
                                                                    <div
                                                                        key={img?.id || img?.imageId || index}
                                                                        className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                img?.imageUrl ||
                                                                                "https://via.placeholder.com/64"
                                                                            }
                                                                            alt={`Variant image ${index + 1}`}
                                                                            onClick={() => handleOpenModel(img?.imageUrl)}
                                                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button className={`cursor-pointer rounded-2xl p-3 mt-1 text-white ${!item?.allowVendorToSee == 1 ? "bg-green-600" : "bg-red-600"}`} onClick={() => handleChnageVendorAllow(item?.id)}> {!item?.allowVendorToSee == 1 ? "Allow vendor" : "Not Allow Vendor"} </button>

                                                    <div className="w-full max-w-sm">
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                                            Select Vendor
                                                        </label>

                                                        <select
                                                            value={selectedVendor}
                                                            // onChange={(e) => setSelectedVendor(e.target.value)}
                                                            onChange={(e) => handleVendorChange(e, item?.id)}

                                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        >
                                                            <option value="">
                                                                Select a vendor
                                                            </option>

                                                            {filterVendors?.map((vendor) => (
                                                                <option key={vendor.id} value={vendor.id}>
                                                                    {vendor.fullName}
                                                                </option>
                                                            ))}
                                                        </select>
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
    );
}

export default Order