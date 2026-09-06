import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorOrders,
    updateOrderItemStatus,
    setStatusFilter,
    DELIVERY_STATUSES,
} from "../redux/slices/orderSlice";
import { formatDate, formatDateTime, formatINR } from "../utils/dateHelpers";

const statusColor = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    SHIPPED: "bg-indigo-50 text-indigo-700",
    OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700",
    DELIVERED: "bg-green-50 text-green-700",
    CANCELLED: "bg-red-50 text-red-700",
    RETURN_REQUESTED: "bg-orange-50 text-orange-700",
    RETURN_ACCEPTED: "bg-orange-50 text-orange-700",
    RETURN_REJECTED: "bg-red-50 text-red-700",
    RETURNED: "bg-stone-100 text-stone-700",
};

// Vendor sirf inhi statuses me manually badal sakta hai (return flow alag
// endpoints se hota hai backend me, isliye yaha se exclude kiya hai)
const EDITABLE_STATUSES = DELIVERY_STATUSES;

// Variant ki pehchaan (description + attributes) - "konsa variant bika" dikhane ke liye
const variantLabel = (variant) => {
    if (!variant) return null;
    const parts = [];
    if (variant.description) parts.push(variant.description);
    if (variant.attributes && typeof variant.attributes === "object") {
        const attrText = Object.entries(variant.attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        if (attrText) parts.push(attrText);
    }
    return parts.length > 0 ? parts.join(" · ") : `Variant #${variant.id}`;
};

// ---------------------------------------------------------
// Status change karte waqt remark (note) daalne ka chhota modal.
// ---------------------------------------------------------
const StatusRemarkModal = ({ pendingChange, note, onNoteChange, onCancel, onConfirm, submitting }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-base font-medium text-stone-800">Status Update Karo</h3>
            <p className="mt-1 text-sm text-stone-500">
                {pendingChange.productName} · Order #{pendingChange.orderNumber}
            </p>
            <p className="mt-2 text-sm text-stone-600">
                Naya Status:{" "}
                <span className="font-medium text-stone-800">
                    {pendingChange.status.replaceAll("_", " ")}
                </span>
            </p>

            <label className="mb-1 mt-4 block text-sm text-stone-600">Remark (optional)</label>
            <textarea
                autoFocus
                rows={3}
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="e.g. Aaj shaam tak dispatch ho jayega"
                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />

            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={onConfirm}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {submitting ? "Updating..." : "Confirm"}
                </button>
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------
// Order item ki poori status history dikhane wala modal
// (backend "statusHistory" array bhejta hai: status + note + changedAt)
// ---------------------------------------------------------
const StatusHistoryModal = ({ item, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-medium text-stone-800">Status History</h3>
                    <p className="text-sm text-stone-500">
                        {item.product?.productName} · Order #{item.order?.orderNumber}
                    </p>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
                    ✕
                </button>
            </div>

            <div className="space-y-4 border-l border-stone-200 pl-4">
                {(!item.statusHistory || item.statusHistory.length === 0) && (
                    <p className="text-sm text-stone-400">Koi history nahi mili</p>
                )}

                {[...(item.statusHistory || [])]
                    .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
                    .map((h) => (
                        <div key={h.id} className="relative">
                            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[h.status] || "bg-stone-100 text-stone-700"
                                    }`}
                            >
                                {h.status.replaceAll("_", " ")}
                            </span>
                            <p className="mt-1 text-xs text-stone-400">{formatDateTime(h.changedAt)}</p>
                            {h.note && <p className="mt-1 text-sm text-stone-700">{h.note}</p>}
                        </div>
                    ))}
            </div>
        </div>
    </div>
);

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { items, loading, error, statusFilter, updatingItemId } = useSelector(
        (state) => state.order
    );

    // pendingChange = { orderItemId, status, productName, orderNumber } | null
    const [pendingChange, setPendingChange] = useState(null);
    const [note, setNote] = useState("");
    const [historyItemId, setHistoryItemId] = useState(null); // jis item ki history dikha rahe hai

    // 👇 id se live item nikalte hai (snapshot nahi) - taaki status update
    // hote hi history modal me bhi turant naya entry dikhe
    const historyItem = items.find((i) => i.id === historyItemId) || null;

    useEffect(() => {
        dispatch(fetchVendorOrders({ page: 1, limit: 20, status: statusFilter }));
    }, [dispatch, statusFilter]);

    const openStatusModal = (item, newStatus) => {
        if (newStatus === item.deliveryStatus) return; // kuch badla hi nahi
        setNote("");
        setPendingChange({
            orderItemId: item.id,
            status: newStatus,
            productName: item.product?.productName,
            orderNumber: item.order?.orderNumber,
        });
    };

    const closeModal = () => setPendingChange(null);

    const confirmStatusChange = async () => {
        if (!pendingChange) return;
        await dispatch(
            updateOrderItemStatus({
                orderItemId: pendingChange.orderItemId,
                status: pendingChange.status,
                note: note.trim() || undefined,
            })
        );
        setPendingChange(null);
        setNote("");
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-stone-800">Orders</h1>
                    <p className="mt-1 text-sm text-stone-500">
                        Sirf wahi orders jisme aapke products bike hai
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                    className="rounded-md border border-stone-300 px-3 py-2 text-sm"
                >
                    <option value="">Saare Status</option>
                    {DELIVERY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 overflow-x-auto rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Product</th>
                            <th className="px-4 py-3 font-medium">Order #</th>
                            <th className="px-4 py-3 font-medium">Customer</th>
                            <th className="px-4 py-3 font-medium">Qty</th>
                            <th className="px-4 py-3 font-medium">Vendor Price</th>
                            <th className="px-4 py-3 font-medium">Ordered On</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-stone-400">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-stone-400">
                                    Abhi tak koi order nahi hai
                                </td>
                            </tr>
                        )}

                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-stone-100 last:border-0">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {item.product?.imageUrl && (
                                            <img
                                                src={item.product.imageUrl}
                                                alt=""
                                                className="h-9 w-9 rounded object-cover"
                                            />
                                        )}
                                        <div>
                                            <span className="text-stone-700">
                                                {item.product?.productName}
                                            </span>
                                            {/* 👇 Konsa variant bika ye yaha dikhta hai */}
                                            {variantLabel(item.variant) && (
                                                <p className="text-xs text-stone-400">
                                                    {variantLabel(item.variant)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-stone-600">{item.order?.orderNumber}</td>
                                <td className="px-4 py-3 text-stone-600">
                                    {item.order?.fullName}
                                    <div className="text-xs text-stone-400">{item.order?.phone}</div>
                                </td>
                                <td className="px-4 py-3 text-stone-600">{item.quantity}</td>
                                {/* 👇 Yaha ab actualPrice nahi, vendorMinPrice dikhta hai */}
                                <td className="px-4 py-3 text-stone-600">
                                    {formatINR(item.variant?.vendorMinPrice)}
                                </td>
                                <td className="px-4 py-3 text-stone-600">{formatDate(item.order?.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={item.deliveryStatus}
                                        disabled={updatingItemId === item.id}
                                        onChange={(e) => openStatusModal(item, e.target.value)}
                                        className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusColor[item.deliveryStatus] || "bg-stone-100 text-stone-700"
                                            }`}
                                    >
                                        {EDITABLE_STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s.replaceAll("_", " ")}
                                            </option>
                                        ))}
                                    </select>

                                    {/* 👇 Poori history dekhne ka link */}
                                    <button
                                        type="button"
                                        onClick={() => setHistoryItemId(item.id)}
                                        className="mt-1 block text-xs text-indigo-600 hover:underline"
                                    >
                                        History dekho ({item.statusHistory?.length || 0})
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pendingChange && (
                <StatusRemarkModal
                    pendingChange={pendingChange}
                    note={note}
                    onNoteChange={setNote}
                    onCancel={closeModal}
                    onConfirm={confirmStatusChange}
                    submitting={updatingItemId === pendingChange.orderItemId}
                />
            )}

            {historyItem && (
                <StatusHistoryModal item={historyItem} onClose={() => setHistoryItemId(null)} />
            )}
        </div>
    );
};

export default OrdersPage;