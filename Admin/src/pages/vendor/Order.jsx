

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchAllOrderByVendor, fetchAllOrder, OrderItemStatusChange } from '../../redux/slices/orderSlice';

const Order = ({ Role }) => {
    const dispatch = useDispatch();
    const { orders, loading, error, pagination } = useSelector((s) => s.order);

    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("PENDING");


    const limit = 20;

    // Har item ke liye alag note store karte hain (item.id => note text)
    const [notes, setNotes] = useState({});

    useEffect(() => {
        Role === 'ADMIN'
            ? dispatch(fetchAllOrder({ page, limit }))
            : dispatch(fetchAllOrderByVendor({ page, limit, status }));
    }, [dispatch, Role, page, status]);

    if (loading) {
        return <div className="p-4">Orders load ho rahe hain...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    // Base statuses jo hamesha selectable hain
    const BASE_STATUSES = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
    ];

    // Return-related statuses — inko tabhi dikhana hai jab item DELIVERED ho chuka ho
    // (ya already return-flow me ho, taaki wo status wapas na chhut jaye dropdown se)
    const RETURN_STATUSES = [
        'RETURN_REQUESTED',
        'RETURN_ACCEPTED',
        'RETURN_REJECTED',
        'RETURNED',
    ];

    const statusOptions = [...RETURN_STATUSES, ...BASE_STATUSES];


    const getStatusOptions = (currentStatus) => {
        const showReturnOptions =
            currentStatus === 'DELIVERED' || RETURN_STATUSES.includes(currentStatus);
        return showReturnOptions ? [...BASE_STATUSES, ...RETURN_STATUSES] : BASE_STATUSES;
    };

    // Input me note type karne par yeh chalega
    const handleNoteChange = (itemId, value) => {
        setNotes((prev) => ({ ...prev, [itemId]: value }));
    };

    // Dropdown se status change hone par yeh chalega — id yaha orderItemId hai
    // note bhi saath me bhejte hain (agar user ne likha ho)
    const handleStatusChange = (item, newStatus) => {
        if (newStatus === item.deliveryStatus) return;
        const note = notes[item.id] || '';

        dispatch(OrderItemStatusChange({ id: item.id, status: newStatus, note }))
            .unwrap()
            .then((updatedData) => {
                // Agar thunk updated item ka pura data return karta hai (fulfillWithValue se),
                // to yaha uska use kar sakte hain. Filhaal safe side lene ke liye
                // list ko bhi refresh kar dete hain taaki naya status/timeline turant dikhe.
                console.log('Status update ka response:', updatedData);
                dispatch(fetchAllOrderByVendor({ page, limit }));
                // Note field ko clear kar dete hain us item ke liye
                setNotes((prev) => ({ ...prev, [item.id]: '' }));
            })
            .catch((err) => {
                console.error('Status change fail ho gaya:', err);
            });
    };

    // Helper to group items by vendor (used for ADMIN response, jahan order.items available hai)
    const groupItemsByVendor = (items) => {
        const groups = {};
        items?.forEach((item) => {
            const vendorId = item.vendor?.id || 'unknown';
            if (!groups[vendorId]) {
                groups[vendorId] = {
                    vendor: item.vendor,
                    items: [],
                };
            }
            groups[vendorId].items.push(item);
        });
        return Object.values(groups);
    };

    // Helper to group flat order-items array by order (used for VENDOR response,
    // jahan har item ke andar khud "order" object nested hota hai, "items" array nahi hota)
    const groupItemsByOrder = (flatItems) => {
        const groups = {};
        flatItems?.forEach((item) => {
            const orderId = item.orderId || item.order?.id || 'unknown';
            if (!groups[orderId]) {
                groups[orderId] = {
                    order: item.order,
                    items: [],
                };
            }
            groups[orderId].items.push(item);
        });
        return Object.values(groups);
    };

    // ============================================================
    // ADMIN VIEW — ISME KUCH BHI CHANGE NAHI KIYA, JAISA THA WAISA HI HAI
    // ============================================================
    if (Role === 'ADMIN') {
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">All Orders</h2>

                {orders.length === 0 ? (
                    <p>Koi order nahi mila.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const vendorGroups = groupItemsByVendor(order.items);
                            return (
                                <div
                                    key={order.id}
                                    className="border rounded-lg p-4 shadow-sm bg-white"
                                >
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start flex-wrap gap-2 border-b pb-2">
                                        <div>
                                            <p className="font-semibold text-lg">{order?.orderNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Customer: {order.user?.fullName} ({order.user?.email}) | ID: {order.userId}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-xl">₹{order.totalAmount}</p>
                                            <p className="text-sm">
                                                {order.orderType} • {order.paymentStatus}
                                            </p>
                                            <p className="text-xs text-gray-400">Order ID: {order.id}</p>
                                        </div>
                                    </div>

                                    {/* Customer Address */}
                                    <div className="mt-2 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Customer:</span> {order.fullName} | {order.phone}
                                        </p>
                                        <p>
                                            <span className="font-medium">Address:</span> {order.addressLine},{' '}
                                            {order.city}, {order.state} - {order.pincode}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Created: {new Date(order.createdAt).toLocaleString()} | Updated:{' '}
                                            {new Date(order.updatedAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Vendor Groups */}
                                    <div className="mt-3 space-y-4">
                                        {vendorGroups?.map((group) => {
                                            const vendor = group.vendor;
                                            const items = group.items;
                                            // Compute subtotal for this vendor
                                            const vendorSubtotal = items.reduce(
                                                (sum, it) => sum + parseFloat(it.price) * it.quantity,
                                                0
                                            );

                                            return (
                                                <div
                                                    key={vendor?.id || 'unknown'}
                                                    className="border-t pt-3 first:border-t-0"
                                                >
                                                    {/* Vendor Header */}
                                                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                        <div>
                                                            <span className="font-semibold">
                                                                Vendor: {vendor?.fullName || 'Unknown'}
                                                            </span>
                                                            <span className="text-xs text-gray-500 ml-2">
                                                                (ID: {vendor?.id || 'N/A'})
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            Vendor Total: ₹{vendorSubtotal.toFixed(2)}
                                                        </div>
                                                    </div>

                                                    {/* Items under this vendor */}
                                                    <div className="mt-2 space-y-3">
                                                        {items.map((item) => (
                                                            <div key={item.id} className="border-b pb-3 last:border-0">
                                                                <div className="flex justify-between items-start flex-wrap gap-2">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">
                                                                            {item.product?.productName}{' '}
                                                                            <span className="text-gray-500 text-sm">
                                                                                ({item.variant?.description})
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            Qty: {item.quantity} × ₹{item.price} ={' '}
                                                                            <span className="font-medium">
                                                                                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            Item ID: {item.id} | Variant ID: {item.variantId}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span
                                                                            className={`text-xs px-2 py-1 rounded ${item.deliveryStatus === 'DELIVERED'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : item.deliveryStatus === 'PENDING'
                                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                                    : 'bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            {item.deliveryStatus}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Status History Timeline */}
                                                                {item.statusHistory && item.statusHistory.length > 0 && (
                                                                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                                                        <p className="text-xs font-semibold text-gray-600 mb-1">
                                                                            Status Timeline:
                                                                        </p>
                                                                        <div className="space-y-1">
                                                                            {item.statusHistory.map((entry) => (
                                                                                <div
                                                                                    key={entry.id}
                                                                                    className="flex justify-between text-xs"
                                                                                >
                                                                                    <span>
                                                                                        <span className="font-medium">
                                                                                            {entry.status}
                                                                                        </span>
                                                                                        {entry.note && (
                                                                                            <span className="text-gray-500 ml-1">
                                                                                                — {entry.note}
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                    <span className="text-gray-400">
                                                                                        {new Date(entry.changedAt).toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {pagination && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>
                            Page {pagination.page} of {pagination.totalPages} • Total: {pagination.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => (pagination.totalPages ? Math.min(pagination.totalPages, p + 1) : p + 1))}
                                disabled={pagination.totalPages ? page >= pagination.totalPages : true}
                                className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ============================================================
    // VENDOR VIEW — Yaha response ka structure alag hai:
    // "orders" ek FLAT array hai jisme direct order-items hain,
    // aur har item ke andar uska "order" object nested hai (items array nahi).
    // Isliye pehle order-wise group karte hain, phir render karte hain.
    // ============================================================
    const orderGroups = groupItemsByOrder(orders);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>



            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`text-xs px-2 py-1 rounded border cursor-pointer ${status === "DELIVERED"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-gray-100 border-gray-300"
                    }`}
            >
                {statusOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                        {statusOption}
                    </option>
                ))}
            </select>



            {orderGroups.length === 0 ? (
                <p>Koi order nahi mila.</p>
            ) : (
                <div className="space-y-6">
                    {orderGroups.map((group) => {
                        const order = group.order;
                        const items = group.items;
                        const orderSubtotal = items.reduce(
                            (sum, it) => sum + parseFloat(it.variant?.vendorMinPrice || 0) * it.quantity,
                            0
                        );

                        return (
                            <div
                                key={order?.id || items[0]?.orderId}
                                className="border rounded-lg p-4 shadow-sm bg-white"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start flex-wrap gap-2 border-b pb-2">
                                    <div>
                                        <p className="font-semibold text-lg">{order?.orderNumber}</p>
                                        <p className="text-sm text-gray-500">
                                            {order?.createdAt && new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-xl">₹{orderSubtotal.toFixed(2)}</p>
                                        <p className="text-sm">
                                            {order?.orderType} • {order?.paymentStatus}
                                        </p>
                                        <p className="text-xs text-gray-400">Order ID: {order?.id}</p>
                                    </div>
                                </div>

                                {/* Items for this vendor in this order */}
                                <div className="mt-3 space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="border-t pt-3 first:border-t-0">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {item.product?.productName}{' '}
                                                        <span className="text-gray-500 text-sm">
                                                            ({item.variant?.description})
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity} × ₹{item.variant?.vendorMinPrice} ={' '}
                                                        <span className="font-medium">
                                                            ₹{(parseFloat(item.variant?.vendorMinPrice || 0) * item.quantity).toFixed(2)}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Item ID: {item.id} | Variant ID: {item.variantId}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <select
                                                        value={item.deliveryStatus}
                                                        onChange={(e) => handleStatusChange(item, e.target.value)}
                                                        className={`text-xs px-2 py-1 rounded border cursor-pointer ${item.deliveryStatus === 'DELIVERED'
                                                            ? 'bg-green-100 text-green-800 border-green-300'
                                                            : item.deliveryStatus === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                                                : 'bg-gray-100 border-gray-300'
                                                            }`}
                                                    >
                                                        {getStatusOptions(item.deliveryStatus).map((statusOption) => (
                                                            <option key={statusOption} value={statusOption}>
                                                                {statusOption}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        placeholder="Note (optional)"
                                                        value={notes[item.id] || ''}
                                                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                                        className="mt-1 block w-40 text-xs border rounded px-2 py-1"
                                                    />
                                                </div>
                                            </div>

                                            {/* Status History Timeline */}
                                            {item.statusHistory && item.statusHistory.length > 0 && (
                                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-600 mb-1">
                                                        Status Timeline:
                                                    </p>
                                                    <div className="space-y-1">
                                                        {item.statusHistory.map((entry) => (
                                                            <div
                                                                key={entry.id}
                                                                className="flex justify-between text-xs"
                                                            >
                                                                <span>
                                                                    <span className="font-medium">
                                                                        {entry.status}
                                                                    </span>
                                                                    {entry.note && (
                                                                        <span className="text-gray-500 ml-1">
                                                                            — {entry.note}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="text-gray-400">
                                                                    {new Date(entry.changedAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Page {pagination.page} of {pagination.totalPages} • Total: {pagination.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => (pagination.totalPages ? Math.min(pagination.totalPages, p + 1) : p + 1))}
                            disabled={pagination.totalPages ? page >= pagination.totalPages : true}
                            className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Order;