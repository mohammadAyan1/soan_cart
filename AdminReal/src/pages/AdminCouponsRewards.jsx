import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAdminCoupons, createCoupon, updateCoupon, toggleCouponActive, toggleCouponDelete,
    fetchAdminRewards, createReward, updateReward, toggleRewardActive, toggleRewardDelete,
    fetchDropdownData, clearMessages
} from "../redux/slices/couponRewardSlice";
import { Tag, Award, Plus, Edit, Trash2, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const AdminCouponsRewards = () => {
    const dispatch = useDispatch();
    const {
        adminCoupons = [],
        adminRewards = [],
        dropdownUsers = [],
        dropdownCategories = [],
        dropdownSubCategories = [],
        dropdownProducts = [],
        successMessage,
        error
    } = useSelector((state) => state.couponReward) || {};

    const [activeTab, setActiveTab] = useState("coupons"); // 'coupons' or 'rewards'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Pagination State for Listing Table
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        type: "FLAT",
        value: "",
        maxDiscountAmount: "",
        perUserLimit: "",
        expiryDate: "",
        scope: "ALL",
        productId: "",
        variantId: "",
        categoryId: "",
        subCategoryId: "",
        userId: "", // Sirf reward ke liye
    });

    useEffect(() => {
        dispatch(fetchAdminCoupons());
        dispatch(fetchAdminRewards());
        dispatch(fetchDropdownData());
    }, [dispatch]);

    // Selected Product ke variants nikalne ke liye
    const selectedProduct = dropdownProducts.find(p => p.id === Number(formData.productId));
    const availableVariants = selectedProduct ? selectedProduct.variants || [] : [];

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                code: item.code || "",
                description: item.description || "",
                type: item.type || "FLAT",
                value: item.value || "",
                maxDiscountAmount: item.maxDiscountAmount || "",
                perUserLimit: item.perUserLimit || "",
                expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
                scope: item.scope || "ALL",
                productId: item.productId || "",
                variantId: item.variantId || "",
                categoryId: item.categoryId || "",
                subCategoryId: item.subCategoryId || "",
                userId: item.userId || "",
            });
        } else {
            setEditingItem(null);
            setFormData({
                code: "", description: "", type: "FLAT", value: "", maxDiscountAmount: "",
                perUserLimit: "", expiryDate: "", scope: "ALL", productId: "", variantId: "",
                categoryId: "", subCategoryId: "", userId: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            value: Number(formData.value),
            maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
            perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : null,
            productId: formData.productId ? Number(formData.productId) : null,
            variantId: formData.variantId ? Number(formData.variantId) : null,
            categoryId: formData.categoryId ? Number(formData.categoryId) : null,
            subCategoryId: formData.subCategoryId ? Number(formData.subCategoryId) : null,
            userId: formData.userId ? Number(formData.userId) : null,
        };

        if (activeTab === "coupons") {
            if (editingItem) {
                dispatch(updateCoupon({ id: editingItem.id, data: payload }));
            } else {
                dispatch(createCoupon(payload));
            }
        } else {
            if (editingItem) {
                dispatch(updateReward({ id: editingItem.id, data: payload }));
            } else {
                dispatch(createReward(payload));
            }
        }
        setIsModalOpen(false);
    };

    // Pagination Logic for Table
    const currentList = activeTab === "coupons" ? adminCoupons : adminRewards;
    const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
    const paginatedList = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {activeTab === "coupons" ? <Tag className="text-blue-600" /> : <Award className="text-purple-600" />}
                    Manage {activeTab === "coupons" ? "Coupons" : "Rewards"}
                </h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setActiveTab("coupons"); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "coupons" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Coupons
                    </button>
                    <button
                        onClick={() => { setActiveTab("rewards"); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "rewards" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Rewards
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-green-700"
                    >
                        <Plus size={20} /> Create {activeTab === "coupons" ? "Coupon" : "Reward"}
                    </button>
                </div>
            </div>

            {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* TABLE LISTING */}
            <div className="bg-white rounded-xl shadow overflow-x-auto border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                            <th className="p-4">Code / Title</th>
                            {activeTab === "rewards" && <th className="p-4">User</th>}
                            <th className="p-4">Type & Value</th>
                            <th className="p-4">Scope</th>
                            <th className="p-4">Expiry Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {paginatedList.length === 0 ? (
                            <tr><td colSpan={7} className="text-center p-6 text-gray-400">No records found</td></tr>
                        ) : (
                            paginatedList.map((item) => {
                                const assignedUser = dropdownUsers.find(u => u.id === item.userId);
                                return (
                                    <tr key={item.id} className={item.isDelete ? "bg-red-50 opacity-60" : "hover:bg-gray-50"}>
                                        <td className="p-4 font-bold text-gray-800">
                                            {item.code}
                                            <div className="text-xs text-gray-400 font-normal">{item.description}</div>
                                        </td>
                                        {activeTab === "rewards" && (
                                            <td className="p-4 font-medium">
                                                {assignedUser ? `${assignedUser.fullName} (${assignedUser.email})` : `User #${item.userId}`}
                                            </td>
                                        )}
                                        <td className="p-4 font-semibold text-blue-600">
                                            {item.type} ({item.value}{item.type === "FLAT" ? "₹" : "%"})
                                        </td>
                                        <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.scope}</span></td>
                                        <td className="p-4 text-gray-500">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {item.isActive ? "Active" : "Deactive"}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => activeTab === "coupons" ? dispatch(toggleCouponActive(item.id)) : dispatch(toggleRewardActive(item.id))}
                                                className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                                                title="Toggle Active/Deactive"
                                            >
                                                {item.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                            <button
                                                onClick={() => activeTab === "coupons" ? dispatch(toggleCouponDelete(item.id)) : dispatch(toggleRewardDelete(item.id))}
                                                className={`p-2 rounded ${item.isDelete ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                                                title={item.isDelete ? "Restore" : "Soft Delete"}
                                            >
                                                {item.isDelete ? <RotateCcw size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* PAGINATION CONTROLS */}
                <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
                    <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm"
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE / UPDATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? "Edit" : "Create"} {activeTab === "coupons" ? "Coupon" : "Reward"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === "rewards" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select User (Kiske liye hai)</label>
                                    <select
                                        required
                                        className="w-full border p-2 rounded bg-white"
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    >
                                        <option value="">-- Choose User --</option>
                                        {dropdownUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Code (e.g. SAVE50)</label>
                                <input type="text" required className="w-full border p-2 rounded uppercase" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea className="w-full border p-2 rounded" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select className="w-full border p-2 rounded bg-white" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="FLAT">FLAT</option>
                                        <option value="PERCENTAGE">PERCENTAGE</option>
                                        <option value="UPTO">UPTO</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input type="number" step="any" required className="w-full border p-2 rounded" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                                </div>
                            </div>
                            {formData.type === "UPTO" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount Amount</label>
                                    <input type="number" className="w-full border p-2 rounded" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Per User Limit (Blank = Unlimited)</label>
                                    <input type="number" className="w-full border p-2 rounded" value={formData.perUserLimit} onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Expiry Date (Future)</label>
                                    <input type="date" required className="w-full border p-2 rounded" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Scope</label>
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    value={formData.scope}
                                    onChange={(e) => setFormData({ ...formData, scope: e.target.value, productId: "", variantId: "", categoryId: "", subCategoryId: "" })}
                                >
                                    <option value="ALL">ALL Products</option>
                                    <option value="PRODUCT">Specific Product</option>
                                    <option value="VARIANT">Specific Variant</option>
                                    <option value="CATEGORY">Specific Category</option>
                                    <option value="SUBCATEGORY">Specific SubCategory</option>
                                </select>
                            </div>

                            {formData.scope === "PRODUCT" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Product</label>
                                    <select className="w-full border p-2 rounded bg-white" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })}>
                                        <option value="">-- Choose Product --</option>
                                        {dropdownProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.productName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.scope === "VARIANT" && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Select Product First</label>
                                        <select className="w-full border p-2 rounded bg-white" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value, variantId: "" })}>
                                            <option value="">-- Choose Product --</option>
                                            {dropdownProducts.map(p => (
                                                <option key={p.id} value={p.id}>{p.productName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Select Variant</label>
                                        <select className="w-full border p-2 rounded bg-white" value={formData.variantId} onChange={(e) => setFormData({ ...formData, variantId: e.target.value })} disabled={!formData.productId}>
                                            <option value="">-- Choose Variant --</option>
                                            {availableVariants.map(v => (
                                                <option key={v.id} value={v.id}>ID: {v.id} | Price: ₹{v.actualPrice} | Stock: {v.stock}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {formData.scope === "CATEGORY" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select Category</label>
                                    <select className="w-full border p-2 rounded bg-white" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                                        <option value="">-- Choose Category --</option>
                                        {dropdownCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.productCategoryName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.scope === "SUBCATEGORY" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Select SubCategory</label>
                                    <select className="w-full border p-2 rounded bg-white" value={formData.subCategoryId} onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}>
                                        <option value="">-- Choose SubCategory --</option>
                                        {dropdownSubCategories.map(sc => (
                                            <option key={sc.id} value={sc.id}>{sc.productSubCategoryName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponsRewards;