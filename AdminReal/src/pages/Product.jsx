// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from "react-redux";
// import {
//     fetchAllProductsAdmin,
//     clearAdminProductError,
// } from '../redux/slices/productSlice';
// // Agar aapke project me axios ya koi api instance hai toh usko import karein (jaise niche diya hai)
// import api from '../api/api'; // Apne project ke hisab se api path check kar lena

// const statusColor = {
//     PENDING: "bg-yellow-100 text-yellow-700",
//     CONFIRMED: "bg-blue-100 text-blue-700",
//     PROCESSING: "bg-indigo-100 text-indigo-700",
//     SHIPPED: "bg-purple-100 text-purple-700",
//     OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
//     DELIVERED: "bg-green-100 text-green-700",
//     CANCELLED: "bg-red-100 text-red-700",
//     RETURN_REQUESTED: "bg-orange-100 text-orange-700",
//     RETURN_ACCEPTED: "bg-orange-100 text-orange-700",
//     RETURN_REJECTED: "bg-red-100 text-red-700",
//     RETURNED: "bg-gray-200 text-gray-700",
// };

// const Stars = ({ rating }) => (
//     <span className="text-yellow-500 text-sm">
//         {"★".repeat(Math.round(rating))}
//         <span className="text-gray-300">{"★".repeat(5 - Math.round(rating))}</span>
//     </span>
// );

// const UserFilterDropdown = ({ users, selectedId, onChange, totalLabel }) => {
//     if (users.length === 0) return null;
//     return (
//         <div className="flex items-center gap-2 mb-3">
//             <label className="text-xs text-gray-500 whitespace-nowrap">
//                 User se filter karo:
//             </label>
//             <select
//                 value={selectedId}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 outline-none flex-1 max-w-[260px]"
//             >
//                 <option value="">{totalLabel}</option>
//                 {users.map((u) => (
//                     <option key={u.id} value={u.id}>
//                         {u.fullName}
//                     </option>
//                 ))}
//             </select>
//             {selectedId && (
//                 <button
//                     onClick={() => onChange("")}
//                     className="text-[11px] px-2 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition whitespace-nowrap"
//                 >
//                     Clear
//                 </button>
//             )}
//         </div>
//     );
// };

// const Product = () => {
//     const dispatch = useDispatch();

//     const {
//         adminProducts,
//         adminPagination,
//         adminFilters,
//         adminLoading,
//         adminError,
//     } = useSelector((state) => state.product);

//     const [page, setPage] = useState(1);
//     const [status, setStatus] = useState(false);

//     // Filters state
//     const [vendorId, setVendorId] = useState("");
//     const [categoryId, setCategoryId] = useState("");
//     const [subCategoryId, setSubCategoryId] = useState("");
//     const [isApprove, setIsApprove] = useState("");
//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");
//     const [sortBy, setSortBy] = useState("");

//     // Quick Checkboxes Filter State
//     const [hasOrdered, setHasOrdered] = useState(false);
//     const [hasCart, setHasCart] = useState(false);
//     const [hasWishlist, setHasWishlist] = useState(false);
//     const [hasReview, setHasReview] = useState(false);

//     const [expandedProductId, setExpandedProductId] = useState(null);
//     const [expandedVariantId, setExpandedVariantId] = useState(null);
//     const [activeTab, setActiveTab] = useState({});

//     const [buyerFilter, setBuyerFilter] = useState({});
//     const [reviewFilter, setReviewFilter] = useState({});
//     const [cartFilter, setCartFilter] = useState({});
//     const [wishlistFilter, setWishlistFilter] = useState({});

//     // Local loading state for product approval toggling
//     const [actionLoading, setActionLoading] = useState(false);

//     useEffect(() => {
//         dispatch(fetchAllProductsAdmin({
//             page, limit: 10, status,
//             vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy,
//             hasOrdered, hasCart, hasWishlist, hasReview
//         }));
//     }, [dispatch, page, status, vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy, hasOrdered, hasCart, hasWishlist, hasReview]);

//     const resetFilters = () => {
//         setPage(1);
//         setVendorId("");
//         setCategoryId("");
//         setSubCategoryId("");
//         setIsApprove("");
//         setFromDate("");
//         setToDate("");
//         setSortBy("");
//         setHasOrdered(false);
//         setHasCart(false);
//         setHasWishlist(false);
//         setHasReview(false);
//     };

//     const toggleProduct = (id) => setExpandedProductId((prev) => (prev === id ? null : id));
//     const toggleVariant = (id) => setExpandedVariantId((prev) => (prev === id ? null : id));
//     const setTab = (variantId, tab) => setActiveTab((prev) => ({ ...prev, [variantId]: tab }));

//     // 👇 NAYA: Admin Approve / Disapprove Handler
//     const handleToggleApprove = async (productId) => {
//         try {
//             setActionLoading(true);
//             const res = await api.put(`/api/product/approve/${productId}`);
//             if (res.data.success) {
//                 // Refresh list after successful toggle
//                 dispatch(fetchAllProductsAdmin({
//                     page, limit: 10, status,
//                     vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy,
//                     hasOrdered, hasCart, hasWishlist, hasReview
//                 }));
//             }
//         } catch (error) {
//             console.error("Approve toggle error:", error);
//             alert(error.response?.data?.message || "Failed to update product approval status");
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // 👇 NAYA: Update Product Handler (Navigate to update page or open modal)
//     const handleUpdateProduct = (productId) => {
//         // Aap apne router ke hisab se path adjust kar sakte hain (e.g., navigate(`/admin/product/update/${productId}`))
//         window.location.href = `/product/update/${productId}`;
//     };

//     const getUniqueBuyerUsers = (buyers) => {
//         const map = new Map();
//         buyers.forEach((b) => { if (b.user?.id && !map.has(b.user.id)) map.set(b.user.id, b.user); });
//         return Array.from(map.values());
//     };
//     const getUniqueReviewUsers = (reviews) => {
//         const map = new Map();
//         reviews.forEach((r) => { if (r.user?.id && !map.has(r.user.id)) map.set(r.user.id, r.user); });
//         return Array.from(map.values());
//     };
//     const getUniqueCartUsers = (cartUsers) => {
//         const map = new Map();
//         cartUsers.forEach((c) => { if (c.user?.id && !map.has(c.user.id)) map.set(c.user.id, c.user); });
//         return Array.from(map.values());
//     };
//     const getUniqueWishlistUsers = (wishlistUsers) => {
//         const map = new Map();
//         wishlistUsers.forEach((w) => { if (w.user?.id && !map.has(w.user.id)) map.set(w.user.id, w.user); });
//         return Array.from(map.values());
//     };

//     const availableCategories = React.useMemo(() => {
//         const allCategories = adminFilters?.categories || [];
//         if (!vendorId) return allCategories;
//         const vendorCategoryIds = new Set(
//             adminProducts.filter((p) => String(p.vendor?.id) === String(vendorId)).map((p) => p.category?.id).filter(Boolean)
//         );
//         return allCategories.filter((c) => vendorCategoryIds.has(c.id));
//     }, [vendorId, adminFilters?.categories, adminProducts]);

//     const availableSubCategories = React.useMemo(() => {
//         const allSubCategories = adminFilters?.subCategories || [];
//         if (!vendorId) return allSubCategories;
//         const vendorSubCategoryIds = new Set(
//             adminProducts.filter((p) => String(p.vendor?.id) === String(vendorId)).map((p) => p.subCategory?.id).filter(Boolean)
//         );
//         return allSubCategories.filter((sc) => vendorSubCategoryIds.has(sc.id));
//     }, [vendorId, adminFilters?.subCategories, adminProducts]);

//     const filteredSubCategories = categoryId
//         ? availableSubCategories.filter((sc) => String(sc.categoryId) === String(categoryId))
//         : availableSubCategories;

//     const hasActiveFilters = vendorId || categoryId || subCategoryId || isApprove || fromDate || toDate || sortBy || hasOrdered || hasCart || hasWishlist || hasReview;

//     return (
//         <main className="p-6 bg-gray-50 min-h-screen">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-6">
//                     <div>
//                         <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
//                         <p className="text-sm text-gray-500">Har product ka poora data — stock, sold, cart, wishlist, buyers, reviews</p>
//                     </div>
//                     <div className="text-sm text-gray-500">
//                         Total: <span className="font-semibold text-gray-800">{adminPagination?.totalProducts || 0}</span>
//                     </div>
//                 </div>

//                 {adminError && (
//                     <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between items-center">
//                         <span>{typeof adminError === "string" ? adminError : "Kuch error aaya"}</span>
//                         <button onClick={() => dispatch(clearAdminProductError())} className="text-red-400 hover:text-red-600">&times;</button>
//                     </div>
//                 )}

//                 {/* Filters */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 space-y-3">
//                     <div className="flex flex-wrap gap-3 items-center">
//                         <select
//                             value={vendorId}
//                             onChange={(e) => { setPage(1); setVendorId(e.target.value); setCategoryId(""); setSubCategoryId(""); }}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[180px]"
//                         >
//                             <option value="">Sabhi Vendors</option>
//                             {(adminFilters?.vendors || []).map((v) => (
//                                 <option key={v.id} value={v.id}>{v.fullName}</option>
//                             ))}
//                         </select>

//                         <select
//                             value={categoryId}
//                             onChange={(e) => { setPage(1); setCategoryId(e.target.value); setSubCategoryId(""); }}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[160px]"
//                         >
//                             <option value="">Sabhi Categories</option>
//                             {availableCategories.map((c) => (
//                                 <option key={c.id} value={c.id}>{c.productCategoryName}</option>
//                             ))}
//                         </select>

//                         <select
//                             value={subCategoryId}
//                             onChange={(e) => { setPage(1); setSubCategoryId(e.target.value); }}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[160px]"
//                         >
//                             <option value="">Sabhi SubCategories</option>
//                             {filteredSubCategories.map((sc) => (
//                                 <option key={sc.id} value={sc.id}>{sc.productSubCategoryName}</option>
//                             ))}
//                         </select>

//                         <select
//                             value={isApprove}
//                             onChange={(e) => { setPage(1); setIsApprove(e.target.value); }}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                         >
//                             <option value="">Approved + Pending</option>
//                             <option value="true">Sirf Approved</option>
//                             <option value="false">Sirf Pending</option>
//                         </select>

//                         <select
//                             value={sortBy}
//                             onChange={(e) => setSortBy(e.target.value)}
//                             className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                         >
//                             <option value="">Default Order</option>
//                             <option value="mostSold">Sabse Jyada Bika</option>
//                             <option value="leastSold">Sabse Kam Bika</option>
//                         </select>

//                         <div className="flex items-center gap-2">
//                             <label className="text-xs text-gray-500">From</label>
//                             <input
//                                 type="date"
//                                 value={fromDate}
//                                 onChange={(e) => { setPage(1); setFromDate(e.target.value); }}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             />
//                             <label className="text-xs text-gray-500">To</label>
//                             <input
//                                 type="date"
//                                 value={toDate}
//                                 onChange={(e) => { setPage(1); setToDate(e.target.value); }}
//                                 className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             />
//                         </div>
//                     </div>

//                     {/* Quick Checkboxes Filter */}
//                     <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
//                         <span className="text-xs font-semibold text-gray-600">Quick Filters:</span>

//                         <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
//                             <input
//                                 type="checkbox"
//                                 checked={hasOrdered}
//                                 onChange={(e) => { setPage(1); setHasOrdered(e.target.checked); }}
//                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
//                             />
//                             Ordered Products
//                         </label>

//                         <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
//                             <input
//                                 type="checkbox"
//                                 checked={hasCart}
//                                 onChange={(e) => { setPage(1); setHasCart(e.target.checked); }}
//                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
//                             />
//                             In Cart Products
//                         </label>

//                         <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
//                             <input
//                                 type="checkbox"
//                                 checked={hasWishlist}
//                                 onChange={(e) => { setPage(1); setHasWishlist(e.target.checked); }}
//                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
//                             />
//                             Wishlisted Products
//                         </label>

//                         <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
//                             <input
//                                 type="checkbox"
//                                 checked={hasReview}
//                                 onChange={(e) => { setPage(1); setHasReview(e.target.checked); }}
//                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
//                             />
//                             Reviewed Products
//                         </label>

//                         <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ml-auto">
//                             <input
//                                 type="checkbox"
//                                 checked={status}
//                                 onChange={(e) => { setPage(1); setStatus(e.target.checked); }}
//                                 className="w-4 h-4"
//                             />
//                             Deleted/Inactive products
//                         </label>

//                         {hasActiveFilters && (
//                             <button
//                                 onClick={resetFilters}
//                                 className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition"
//                             >
//                                 Clear All
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 {/* Products list */}
//                 <div className="space-y-3">
//                     {adminLoading && (
//                         <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
//                             Products load ho rahe hai...
//                         </div>
//                     )}

//                     {!adminLoading && adminProducts.length === 0 && (
//                         <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
//                             Koi product nahi mila in filters ke sath
//                         </div>
//                     )}

//                     {!adminLoading && adminProducts.map((product) => (
//                         <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//                             <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
//                                 <button
//                                     onClick={() => toggleProduct(product.id)}
//                                     className="flex items-center gap-4 flex-1 text-left"
//                                 >
//                                     <img
//                                         src={product.imageUrl || "https://via.placeholder.com/56"}
//                                         alt={product.productName}
//                                         className="w-14 h-14 rounded-lg object-cover border border-gray-200"
//                                     />
//                                     <div>
//                                         <p className="font-semibold text-gray-800">{product.productName}</p>
//                                         <p className="text-xs text-gray-400">
//                                             {product.category?.productCategoryName} → {product.subCategory?.productSubCategoryName}
//                                         </p>
//                                         <div className="flex items-center gap-2 mt-1">
//                                             <img
//                                                 src={product.vendor?.imageUrl || "https://via.placeholder.com/20"}
//                                                 alt=""
//                                                 className="w-5 h-5 rounded-full object-cover"
//                                             />
//                                             <span className="text-xs text-gray-500">{product.vendor?.fullName}</span>
//                                         </div>
//                                     </div>
//                                 </button>

//                                 <div className="flex items-center gap-6 text-center">
//                                     <div>
//                                         <p className="text-sm font-semibold text-gray-800">{product.totalStock}</p>
//                                         <p className="text-[11px] text-gray-400">Stock</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-semibold text-indigo-600">{product.totalSold}</p>
//                                         <p className="text-[11px] text-gray-400">Sold</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-semibold text-gray-800">{product.currentlyInCart?.totalQuantity || 0}</p>
//                                         <p className="text-[11px] text-gray-400">In Cart</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-semibold text-gray-800">{product.currentlyInWishlist || 0}</p>
//                                         <p className="text-[11px] text-gray-400">Wishlist</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-sm font-semibold text-gray-800">
//                                             {product.avgRating > 0 ? product.avgRating : "-"}
//                                         </p>
//                                         <p className="text-[11px] text-gray-400">{product.totalReviews} Reviews</p>
//                                     </div>

//                                     {/* 👇 NAYA: Admin Action Buttons (Approve Toggle & Update) */}
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             disabled={actionLoading}
//                                             onClick={() => handleToggleApprove(product.id)}
//                                             className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${product.isApprove
//                                                 ? "bg-green-100 text-green-700 hover:bg-green-200"
//                                                 : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
//                                                 }`}
//                                             title="Click to toggle approval status"
//                                         >
//                                             {product.isApprove ? "Approved" : "Pending"}
//                                         </button>

//                                         <button
//                                             onClick={() => handleUpdateProduct(product.id)}
//                                             className="text-xs px-2.5 py-1 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition"
//                                         >
//                                             Update
//                                         </button>
//                                     </div>

//                                     <button onClick={() => toggleProduct(product.id)} className="text-gray-400 p-1">
//                                         {expandedProductId === product.id ? "▲" : "▼"}
//                                     </button>
//                                 </div>
//                             </div>

//                             {expandedProductId === product.id && (
//                                 <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
//                                     {product.variants.map((variant) => {
//                                         const tab = activeTab[variant.id] || "buyers";

//                                         const selectedBuyerId = buyerFilter[variant.id] || "";
//                                         const selectedReviewId = reviewFilter[variant.id] || "";
//                                         const selectedCartId = cartFilter[variant.id] || "";
//                                         const selectedWishlistId = wishlistFilter[variant.id] || "";

//                                         const uniqueBuyerUsers = getUniqueBuyerUsers(variant.buyers);
//                                         const uniqueReviewUsers = getUniqueReviewUsers(variant.reviews);
//                                         const uniqueCartUsers = getUniqueCartUsers(variant.currentlyInCart.users);
//                                         const uniqueWishlistUsers = getUniqueWishlistUsers(variant.currentlyInWishlist.users);

//                                         const filteredBuyers = selectedBuyerId
//                                             ? variant.buyers.filter((b) => String(b.user?.id) === String(selectedBuyerId))
//                                             : variant.buyers;
//                                         const filteredReviews = selectedReviewId
//                                             ? variant.reviews.filter((r) => String(r.user?.id) === String(selectedReviewId))
//                                             : variant.reviews;
//                                         const filteredCartUsers = selectedCartId
//                                             ? variant.currentlyInCart.users.filter((c) => String(c.user?.id) === String(selectedCartId))
//                                             : variant.currentlyInCart.users;
//                                         const filteredWishlistUsers = selectedWishlistId
//                                             ? variant.currentlyInWishlist.users.filter((w) => String(w.user?.id) === String(selectedWishlistId))
//                                             : variant.currentlyInWishlist.users;

//                                         return (
//                                             <div key={variant.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//                                                 <button
//                                                     onClick={() => toggleVariant(variant.id)}
//                                                     className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition text-left"
//                                                 >
//                                                     <div className="flex items-center gap-3">
//                                                         <img
//                                                             src={variant.images?.[0]?.imageUrl || "https://via.placeholder.com/40"}
//                                                             alt=""
//                                                             className="w-10 h-10 rounded-md object-cover border border-gray-200"
//                                                         />
//                                                         <div>
//                                                             <p className="text-sm font-medium text-gray-800">{variant.description}</p>
//                                                             <p className="text-xs text-gray-400">
//                                                                 ₹{variant.actualPrice} • MRP ₹{variant.mrp} • Vendor Min ₹{variant.vendorMinPrice}
//                                                             </p>
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex items-center gap-4 text-center">
//                                                         <div>
//                                                             <p className="text-xs font-semibold text-gray-800">{variant.stock}</p>
//                                                             <p className="text-[10px] text-gray-400">Stock</p>
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-xs font-semibold text-indigo-600">{variant.totalSold}</p>
//                                                             <p className="text-[10px] text-gray-400">Sold</p>
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-xs font-semibold text-gray-800">{variant.uniqueBuyersCount ?? 0}</p>
//                                                             <p className="text-[10px] text-gray-400">Buyers</p>
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-xs font-semibold text-gray-800">{variant.currentlyInCart.usersCount}</p>
//                                                             <p className="text-[10px] text-gray-400">Cart</p>
//                                                         </div>
//                                                         <div>
//                                                             <p className="text-xs font-semibold text-gray-800">{variant.currentlyInWishlist.count}</p>
//                                                             <p className="text-[10px] text-gray-400">Wishlist</p>
//                                                         </div>
//                                                         <div>
//                                                             <Stars rating={variant.avgRating} />
//                                                         </div>
//                                                         <span className="text-gray-400 text-xs">
//                                                             {expandedVariantId === variant.id ? "▲" : "▼"}
//                                                         </span>
//                                                     </div>
//                                                 </button>

//                                                 {expandedVariantId === variant.id && (
//                                                     <div className="border-t border-gray-100 p-3">
//                                                         <div className="flex flex-wrap gap-2 mb-3">
//                                                             <button
//                                                                 onClick={() => setTab(variant.id, "buyers")}
//                                                                 className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "buyers" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
//                                                             >
//                                                                 Buyers ({variant.buyers.length} orders • {variant.uniqueBuyersCount ?? 0} users)
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => setTab(variant.id, "reviews")}
//                                                                 className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "reviews" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
//                                                             >
//                                                                 Reviews ({variant.reviewsCount})
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => setTab(variant.id, "cart")}
//                                                                 className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "cart" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
//                                                             >
//                                                                 In Cart ({variant.currentlyInCart.usersCount})
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => setTab(variant.id, "wishlist")}
//                                                                 className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "wishlist" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
//                                                             >
//                                                                 Wishlist ({variant.currentlyInWishlist.count})
//                                                             </button>
//                                                         </div>

//                                                         {tab === "buyers" && (
//                                                             <div>
//                                                                 <UserFilterDropdown
//                                                                     users={uniqueBuyerUsers}
//                                                                     selectedId={selectedBuyerId}
//                                                                     onChange={(val) => setBuyerFilter((prev) => ({ ...prev, [variant.id]: val }))}
//                                                                     totalLabel={`Sabhi Buyers (${variant.uniqueBuyersCount ?? 0} users)`}
//                                                                 />
//                                                                 <div className="space-y-2">
//                                                                     {filteredBuyers.length === 0 && (
//                                                                         <p className="text-xs text-gray-400">
//                                                                             {selectedBuyerId ? "Is user ka koi order nahi mila" : "Abhi tak koi order nahi"}
//                                                                         </p>
//                                                                     )}
//                                                                     {filteredBuyers.map((b, i) => (
//                                                                         <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <img
//                                                                                     src={b.user?.imageUrl || "https://via.placeholder.com/28"}
//                                                                                     alt=""
//                                                                                     className="w-7 h-7 rounded-full object-cover"
//                                                                                 />
//                                                                                 <div>
//                                                                                     <p className="text-xs font-medium text-gray-800">{b.user?.fullName}</p>
//                                                                                     <p className="text-[10px] text-gray-400">
//                                                                                         #{b.orderNumber} • Qty {b.quantity} • ₹{b.price}
//                                                                                     </p>
//                                                                                     <p className="text-[10px] text-gray-400">
//                                                                                         {b.orderedDate} • {b.orderedTime} • {b.orderedDay}
//                                                                                     </p>
//                                                                                 </div>
//                                                                             </div>
//                                                                             <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColor[b.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
//                                                                                 {b.deliveryStatus}
//                                                                             </span>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {tab === "reviews" && (
//                                                             <div>
//                                                                 <UserFilterDropdown
//                                                                     users={uniqueReviewUsers}
//                                                                     selectedId={selectedReviewId}
//                                                                     onChange={(val) => setReviewFilter((prev) => ({ ...prev, [variant.id]: val }))}
//                                                                     totalLabel={`Sabhi Reviewers (${uniqueReviewUsers.length} users)`}
//                                                                 />
//                                                                 <div className="space-y-2">
//                                                                     {filteredReviews.length === 0 && (
//                                                                         <p className="text-xs text-gray-400">
//                                                                             {selectedReviewId ? "Is user ka koi review nahi mila" : "Abhi tak koi review nahi"}
//                                                                         </p>
//                                                                     )}
//                                                                     {filteredReviews.map((r) => (
//                                                                         <div key={r.id} className="bg-gray-50 rounded-lg p-2">
//                                                                             <div className="flex items-center justify-between">
//                                                                                 <div className="flex items-center gap-2">
//                                                                                     <img
//                                                                                         src={r.user?.imageUrl || "https://via.placeholder.com/28"}
//                                                                                         alt=""
//                                                                                         className="w-7 h-7 rounded-full object-cover"
//                                                                                     />
//                                                                                     <div>
//                                                                                         <p className="text-xs font-medium text-gray-800">{r.user?.fullName}</p>
//                                                                                         <p className="text-[10px] text-gray-400">
//                                                                                             {r.reviewDate} • {r.reviewTime} • {r.reviewDay}
//                                                                                         </p>
//                                                                                     </div>
//                                                                                 </div>
//                                                                                 <Stars rating={r.rating} />
//                                                                             </div>
//                                                                             {r.comment && (
//                                                                                 <p className="text-xs text-gray-600 mt-1 pl-9">{r.comment}</p>
//                                                                             )}
//                                                                             {r.images?.length > 0 && (
//                                                                                 <div className="flex gap-1 mt-1 pl-9">
//                                                                                     {r.images.map((img) => (
//                                                                                         <img
//                                                                                             key={img.id}
//                                                                                             src={img.imageUrl}
//                                                                                             alt=""
//                                                                                             className="w-10 h-10 rounded object-cover border border-gray-200"
//                                                                                         />
//                                                                                     ))}
//                                                                                 </div>
//                                                                             )}
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {tab === "cart" && (
//                                                             <div>
//                                                                 <UserFilterDropdown
//                                                                     users={uniqueCartUsers}
//                                                                     selectedId={selectedCartId}
//                                                                     onChange={(val) => setCartFilter((prev) => ({ ...prev, [variant.id]: val }))}
//                                                                     totalLabel={`Sabhi Cart Users (${uniqueCartUsers.length} users)`}
//                                                                 />
//                                                                 <div className="space-y-2">
//                                                                     {filteredCartUsers.length === 0 && (
//                                                                         <p className="text-xs text-gray-400">
//                                                                             {selectedCartId ? "Is user ke cart me nahi hai" : "Abhi kisi ke cart me nahi hai"}
//                                                                         </p>
//                                                                     )}
//                                                                     {filteredCartUsers.map((c, i) => (
//                                                                         <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <img
//                                                                                     src={c.user?.imageUrl || "https://via.placeholder.com/28"}
//                                                                                     alt=""
//                                                                                     className="w-7 h-7 rounded-full object-cover"
//                                                                                 />
//                                                                                 <div>
//                                                                                     <p className="text-xs font-medium text-gray-800">{c.user?.fullName}</p>
//                                                                                     <p className="text-[10px] text-gray-400">
//                                                                                         {c.cartDate} • {c.cartTime} • {c.cartDay}
//                                                                                     </p>
//                                                                                 </div>
//                                                                             </div>
//                                                                             <span className="text-[10px] text-gray-500">Qty {c.quantity}</span>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {tab === "wishlist" && (
//                                                             <div>
//                                                                 <UserFilterDropdown
//                                                                     users={uniqueWishlistUsers}
//                                                                     selectedId={selectedWishlistId}
//                                                                     onChange={(val) => setWishlistFilter((prev) => ({ ...prev, [variant.id]: val }))}
//                                                                     totalLabel={`Sabhi Wishlist Users (${uniqueWishlistUsers.length} users)`}
//                                                                 />
//                                                                 <div className="space-y-2">
//                                                                     {filteredWishlistUsers.length === 0 && (
//                                                                         <p className="text-xs text-gray-400">
//                                                                             {selectedWishlistId ? "Is user ke wishlist me nahi hai" : "Abhi kisi ke wishlist me nahi hai"}
//                                                                         </p>
//                                                                     )}
//                                                                     {filteredWishlistUsers.map((w, i) => (
//                                                                         <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <img
//                                                                                     src={w.user?.imageUrl || "https://via.placeholder.com/28"}
//                                                                                     alt=""
//                                                                                     className="w-7 h-7 rounded-full object-cover"
//                                                                                 />
//                                                                                 <div>
//                                                                                     <p className="text-xs font-medium text-gray-800">{w.user?.fullName}</p>
//                                                                                     <p className="text-[10px] text-gray-400">
//                                                                                         {w.wishDate} • {w.wishTime} • {w.wishDay}
//                                                                                     </p>
//                                                                                 </div>
//                                                                             </div>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-between mt-4">
//                     <p className="text-sm text-gray-500">
//                         Page <span className="font-medium text-gray-800">{adminPagination?.currentPage || 1}</span> of{" "}
//                         <span className="font-medium text-gray-800">{adminPagination?.totalPages || 1}</span>
//                     </p>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => setPage((p) => Math.max(1, p - 1))}
//                             disabled={adminPagination?.currentPage <= 1}
//                             className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                         >
//                             Prev
//                         </button>
//                         <button
//                             onClick={() => setPage((p) => Math.min(adminPagination?.totalPages || 1, p + 1))}
//                             disabled={adminPagination?.currentPage >= adminPagination?.totalPages}
//                             className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </main>
//     );
// };

// export default Product;



import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllProductsAdmin,
    clearAdminProductError,
} from '../redux/slices/productSlice';
// Agar aapke project me axios ya koi api instance hai toh usko import karein (jaise niche diya hai)
import api from '../api/api'; // Apne project ke hisab se api path check kar lena

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

const Stars = ({ rating }) => (
    <span className="text-yellow-500 text-sm">
        {"★".repeat(Math.round(rating))}
        <span className="text-gray-300">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
);

const UserFilterDropdown = ({ users, selectedId, onChange, totalLabel }) => {
    if (users.length === 0) return null;
    return (
        <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-gray-500 whitespace-nowrap">
                User se filter karo:
            </label>
            <select
                value={selectedId}
                onChange={(e) => onChange(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 outline-none flex-1 max-w-[260px]"
            >
                <option value="">{totalLabel}</option>
                {users.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.fullName}
                    </option>
                ))}
            </select>
            {selectedId && (
                <button
                    onClick={() => onChange("")}
                    className="text-[11px] px-2 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition whitespace-nowrap"
                >
                    Clear
                </button>
            )}
        </div>
    );
};

// ---------------------------------------------------------
// 👇 NAYA - Approve karne se pehle product check karta hai ki
// kahi default variant ka actualPrice 0 to nahi, ya category/subCategory
// "Other" (null) to nahi. Jo bhi reasons fail hote hai, unka array return
// hota hai - array khali hua to approve allowed hai.
// ---------------------------------------------------------
const getApprovalBlockReasons = (product) => {
    const reasons = [];

    const defaultVariant =
        product.variants?.find((v) => v.isDefault) || product.variants?.[0];

    if (!defaultVariant || Number(defaultVariant.actualPrice) === 0) {
        reasons.push(
            "Default variant ka Actual Price abhi 0 hai — pehle isko update karke actual selling price set karo."
        );
    }

    if (!product.category) {
        reasons.push(
            "Is product ki Category 'Other' hai (koi fixed category assign nahi hui) — pehle vendor/admin se sahi category set karwao."
        );
    }

    if (!product.subCategory) {
        reasons.push(
            "Is product ki Sub Category 'Other' hai (koi fixed sub category assign nahi hui) — pehle vendor/admin se sahi sub category set karwao."
        );
    }

    return reasons;
};

// 👇 NAYA - Approve block hone par jo reasons hai unhe dikhane wala modal
const ApprovalBlockedModal = ({ product, reasons, onClose }) => {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">
                            Approve nahi kar sakte
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">{product.productName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-2 text-sm text-gray-600">
                    Is product ko in wajah se abhi approve nahi kiya ja sakta:
                </p>

                <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-red-600">
                    {reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                    ))}
                </ul>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                    >
                        Theek hai
                    </button>
                </div>
            </div>
        </div>
    );
};

const Product = () => {
    const dispatch = useDispatch();

    const {
        adminProducts,
        adminPagination,
        adminFilters,
        adminLoading,
        adminError,
    } = useSelector((state) => state.product);

    const [page, setPage] = useState(1);
    const [status, setStatus] = useState(false);

    // Filters state
    const [vendorId, setVendorId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [isApprove, setIsApprove] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sortBy, setSortBy] = useState("");

    // Quick Checkboxes Filter State
    const [hasOrdered, setHasOrdered] = useState(false);
    const [hasCart, setHasCart] = useState(false);
    const [hasWishlist, setHasWishlist] = useState(false);
    const [hasReview, setHasReview] = useState(false);

    const [expandedProductId, setExpandedProductId] = useState(null);
    const [expandedVariantId, setExpandedVariantId] = useState(null);
    const [activeTab, setActiveTab] = useState({});

    const [buyerFilter, setBuyerFilter] = useState({});
    const [reviewFilter, setReviewFilter] = useState({});
    const [cartFilter, setCartFilter] = useState({});
    const [wishlistFilter, setWishlistFilter] = useState({});

    // Local loading state for product approval toggling
    const [actionLoading, setActionLoading] = useState(false);

    // 👇 NAYE - approve block hone par modal ke liye state
    const [blockModalProduct, setBlockModalProduct] = useState(null);
    const [blockReasons, setBlockReasons] = useState([]);

    useEffect(() => {
        dispatch(fetchAllProductsAdmin({
            page, limit: 10, status,
            vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy,
            hasOrdered, hasCart, hasWishlist, hasReview
        }));
    }, [dispatch, page, status, vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy, hasOrdered, hasCart, hasWishlist, hasReview]);

    const resetFilters = () => {
        setPage(1);
        setVendorId("");
        setCategoryId("");
        setSubCategoryId("");
        setIsApprove("");
        setFromDate("");
        setToDate("");
        setSortBy("");
        setHasOrdered(false);
        setHasCart(false);
        setHasWishlist(false);
        setHasReview(false);
    };

    const toggleProduct = (id) => setExpandedProductId((prev) => (prev === id ? null : id));
    const toggleVariant = (id) => setExpandedVariantId((prev) => (prev === id ? null : id));
    const setTab = (variantId, tab) => setActiveTab((prev) => ({ ...prev, [variantId]: tab }));

    // 👇 UPDATED: Admin Approve / Disapprove Handler
    // Ab poora "product" object leta hai (id nahi), taaki approve se pehle
    // uske variants/category/subCategory check kiye ja sakein
    const handleToggleApprove = async (product) => {
        // Disapprove karna (Approved -> Pending) hamesha allowed hai,
        // check sirf tab lagta hai jab Pending se Approve karne ki koshish ho
        if (!product.isApprove) {
            const reasons = getApprovalBlockReasons(product);
            if (reasons.length > 0) {
                setBlockReasons(reasons);
                setBlockModalProduct(product);
                return; // 👈 API call hi nahi jayegi
            }
        }

        try {
            setActionLoading(true);
            const res = await api.put(`/api/product/approve/${product.id}`);
            if (res.data.success) {
                // Refresh list after successful toggle
                dispatch(fetchAllProductsAdmin({
                    page, limit: 10, status,
                    vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy,
                    hasOrdered, hasCart, hasWishlist, hasReview
                }));
            }
        } catch (error) {
            console.error("Approve toggle error:", error);
            alert(error.response?.data?.message || "Failed to update product approval status");
        } finally {
            setActionLoading(false);
        }
    };

    // 👇 NAYA: Update Product Handler (Navigate to update page or open modal)
    const handleUpdateProduct = (productId) => {
        // Aap apne router ke hisab se path adjust kar sakte hain (e.g., navigate(`/admin/product/update/${productId}`))
        window.location.href = `/product/update/${productId}`;
    };

    const getUniqueBuyerUsers = (buyers) => {
        const map = new Map();
        buyers.forEach((b) => { if (b.user?.id && !map.has(b.user.id)) map.set(b.user.id, b.user); });
        return Array.from(map.values());
    };
    const getUniqueReviewUsers = (reviews) => {
        const map = new Map();
        reviews.forEach((r) => { if (r.user?.id && !map.has(r.user.id)) map.set(r.user.id, r.user); });
        return Array.from(map.values());
    };
    const getUniqueCartUsers = (cartUsers) => {
        const map = new Map();
        cartUsers.forEach((c) => { if (c.user?.id && !map.has(c.user.id)) map.set(c.user.id, c.user); });
        return Array.from(map.values());
    };
    const getUniqueWishlistUsers = (wishlistUsers) => {
        const map = new Map();
        wishlistUsers.forEach((w) => { if (w.user?.id && !map.has(w.user.id)) map.set(w.user.id, w.user); });
        return Array.from(map.values());
    };

    const availableCategories = React.useMemo(() => {
        const allCategories = adminFilters?.categories || [];
        if (!vendorId) return allCategories;
        const vendorCategoryIds = new Set(
            adminProducts.filter((p) => String(p.vendor?.id) === String(vendorId)).map((p) => p.category?.id).filter(Boolean)
        );
        return allCategories.filter((c) => vendorCategoryIds.has(c.id));
    }, [vendorId, adminFilters?.categories, adminProducts]);

    const availableSubCategories = React.useMemo(() => {
        const allSubCategories = adminFilters?.subCategories || [];
        if (!vendorId) return allSubCategories;
        const vendorSubCategoryIds = new Set(
            adminProducts.filter((p) => String(p.vendor?.id) === String(vendorId)).map((p) => p.subCategory?.id).filter(Boolean)
        );
        return allSubCategories.filter((sc) => vendorSubCategoryIds.has(sc.id));
    }, [vendorId, adminFilters?.subCategories, adminProducts]);

    const filteredSubCategories = categoryId
        ? availableSubCategories.filter((sc) => String(sc.categoryId) === String(categoryId))
        : availableSubCategories;

    const hasActiveFilters = vendorId || categoryId || subCategoryId || isApprove || fromDate || toDate || sortBy || hasOrdered || hasCart || hasWishlist || hasReview;

    return (
        <main className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
                        <p className="text-sm text-gray-500">Har product ka poora data — stock, sold, cart, wishlist, buyers, reviews</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-semibold text-gray-800">{adminPagination?.totalProducts || 0}</span>
                    </div>
                </div>

                {adminError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg flex justify-between items-center">
                        <span>{typeof adminError === "string" ? adminError : "Kuch error aaya"}</span>
                        <button onClick={() => dispatch(clearAdminProductError())} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 space-y-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={vendorId}
                            onChange={(e) => { setPage(1); setVendorId(e.target.value); setCategoryId(""); setSubCategoryId(""); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[180px]"
                        >
                            <option value="">Sabhi Vendors</option>
                            {(adminFilters?.vendors || []).map((v) => (
                                <option key={v.id} value={v.id}>{v.fullName}</option>
                            ))}
                        </select>

                        <select
                            value={categoryId}
                            onChange={(e) => { setPage(1); setCategoryId(e.target.value); setSubCategoryId(""); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[160px]"
                        >
                            <option value="">Sabhi Categories</option>
                            {availableCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.productCategoryName}</option>
                            ))}
                        </select>

                        <select
                            value={subCategoryId}
                            onChange={(e) => { setPage(1); setSubCategoryId(e.target.value); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-[160px]"
                        >
                            <option value="">Sabhi SubCategories</option>
                            {filteredSubCategories.map((sc) => (
                                <option key={sc.id} value={sc.id}>{sc.productSubCategoryName}</option>
                            ))}
                        </select>

                        <select
                            value={isApprove}
                            onChange={(e) => { setPage(1); setIsApprove(e.target.value); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="">Approved + Pending</option>
                            <option value="true">Sirf Approved</option>
                            <option value="false">Sirf Pending</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="">Default Order</option>
                            <option value="mostSold">Sabse Jyada Bika</option>
                            <option value="leastSold">Sabse Kam Bika</option>
                        </select>

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
                    </div>

                    {/* Quick Checkboxes Filter */}
                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-600">Quick Filters:</span>

                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hasOrdered}
                                onChange={(e) => { setPage(1); setHasOrdered(e.target.checked); }}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            Ordered Products
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hasCart}
                                onChange={(e) => { setPage(1); setHasCart(e.target.checked); }}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            In Cart Products
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hasWishlist}
                                onChange={(e) => { setPage(1); setHasWishlist(e.target.checked); }}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            Wishlisted Products
                        </label>

                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hasReview}
                                onChange={(e) => { setPage(1); setHasReview(e.target.checked); }}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            Reviewed Products
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ml-auto">
                            <input
                                type="checkbox"
                                checked={status}
                                onChange={(e) => { setPage(1); setStatus(e.target.checked); }}
                                className="w-4 h-4"
                            />
                            Deleted/Inactive products
                        </label>

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Products list */}
                <div className="space-y-3">
                    {adminLoading && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-sm">
                            Products load ho rahe hai...
                        </div>
                    )}

                    {!adminLoading && adminProducts.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                            Koi product nahi mila in filters ke sath
                        </div>
                    )}

                    {!adminLoading && adminProducts.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
                                <button
                                    onClick={() => toggleProduct(product.id)}
                                    className="flex items-center gap-4 flex-1 text-left"
                                >
                                    <img
                                        src={product.imageUrl || "https://via.placeholder.com/56"}
                                        alt={product.productName}
                                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">{product.productName}</p>
                                        <p className="text-xs text-gray-400">
                                            {product.category?.productCategoryName || `Other (${product.categoryRemark || "-"})`}
                                            {" → "}
                                            {product.subCategory?.productSubCategoryName || `Other (${product.subCategoryRemark || "-"})`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <img
                                                src={product.vendor?.imageUrl || "https://via.placeholder.com/20"}
                                                alt=""
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                            <span className="text-xs text-gray-500">{product.vendor?.fullName}</span>
                                        </div>
                                    </div>
                                </button>

                                <div className="flex items-center gap-6 text-center">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{product.totalStock}</p>
                                        <p className="text-[11px] text-gray-400">Stock</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-600">{product.totalSold}</p>
                                        <p className="text-[11px] text-gray-400">Sold</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{product.currentlyInCart?.totalQuantity || 0}</p>
                                        <p className="text-[11px] text-gray-400">In Cart</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{product.currentlyInWishlist || 0}</p>
                                        <p className="text-[11px] text-gray-400">Wishlist</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {product.avgRating > 0 ? product.avgRating : "-"}
                                        </p>
                                        <p className="text-[11px] text-gray-400">{product.totalReviews} Reviews</p>
                                    </div>

                                    {/* 👇 Admin Action Buttons (Approve Toggle & Update) */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleToggleApprove(product)}
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${product.isApprove
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                }`}
                                            title="Click to toggle approval status"
                                        >
                                            {product.isApprove ? "Approved" : "Pending"}
                                        </button>

                                        <button
                                            onClick={() => handleUpdateProduct(product.id)}
                                            className="text-xs px-2.5 py-1 rounded-lg border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition"
                                        >
                                            Update
                                        </button>
                                    </div>

                                    <button onClick={() => toggleProduct(product.id)} className="text-gray-400 p-1">
                                        {expandedProductId === product.id ? "▲" : "▼"}
                                    </button>
                                </div>
                            </div>

                            {expandedProductId === product.id && (
                                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                                    {product.variants.map((variant) => {
                                        const tab = activeTab[variant.id] || "buyers";

                                        const selectedBuyerId = buyerFilter[variant.id] || "";
                                        const selectedReviewId = reviewFilter[variant.id] || "";
                                        const selectedCartId = cartFilter[variant.id] || "";
                                        const selectedWishlistId = wishlistFilter[variant.id] || "";

                                        const uniqueBuyerUsers = getUniqueBuyerUsers(variant.buyers);
                                        const uniqueReviewUsers = getUniqueReviewUsers(variant.reviews);
                                        const uniqueCartUsers = getUniqueCartUsers(variant.currentlyInCart.users);
                                        const uniqueWishlistUsers = getUniqueWishlistUsers(variant.currentlyInWishlist.users);

                                        const filteredBuyers = selectedBuyerId
                                            ? variant.buyers.filter((b) => String(b.user?.id) === String(selectedBuyerId))
                                            : variant.buyers;
                                        const filteredReviews = selectedReviewId
                                            ? variant.reviews.filter((r) => String(r.user?.id) === String(selectedReviewId))
                                            : variant.reviews;
                                        const filteredCartUsers = selectedCartId
                                            ? variant.currentlyInCart.users.filter((c) => String(c.user?.id) === String(selectedCartId))
                                            : variant.currentlyInCart.users;
                                        const filteredWishlistUsers = selectedWishlistId
                                            ? variant.currentlyInWishlist.users.filter((w) => String(w.user?.id) === String(selectedWishlistId))
                                            : variant.currentlyInWishlist.users;

                                        return (
                                            <div key={variant.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => toggleVariant(variant.id)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={variant.images?.[0]?.imageUrl || "https://via.placeholder.com/40"}
                                                            alt=""
                                                            className="w-10 h-10 rounded-md object-cover border border-gray-200"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {variant.description}
                                                                {variant.isDefault && (
                                                                    <span className="ml-2 text-[10px] font-semibold text-indigo-600">
                                                                        (Default)
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Actual ₹{variant.actualPrice} • MRP ₹{variant.mrp} • Vendor Min ₹{variant.vendorMinPrice}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-center">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800">{variant.stock}</p>
                                                            <p className="text-[10px] text-gray-400">Stock</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-indigo-600">{variant.totalSold}</p>
                                                            <p className="text-[10px] text-gray-400">Sold</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800">{variant.uniqueBuyersCount ?? 0}</p>
                                                            <p className="text-[10px] text-gray-400">Buyers</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800">{variant.currentlyInCart.usersCount}</p>
                                                            <p className="text-[10px] text-gray-400">Cart</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-800">{variant.currentlyInWishlist.count}</p>
                                                            <p className="text-[10px] text-gray-400">Wishlist</p>
                                                        </div>
                                                        <div>
                                                            <Stars rating={variant.avgRating} />
                                                        </div>
                                                        <span className="text-gray-400 text-xs">
                                                            {expandedVariantId === variant.id ? "▲" : "▼"}
                                                        </span>
                                                    </div>
                                                </button>

                                                {expandedVariantId === variant.id && (
                                                    <div className="border-t border-gray-100 p-3">
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            <button
                                                                onClick={() => setTab(variant.id, "buyers")}
                                                                className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "buyers" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                                                            >
                                                                Buyers ({variant.buyers.length} orders • {variant.uniqueBuyersCount ?? 0} users)
                                                            </button>
                                                            <button
                                                                onClick={() => setTab(variant.id, "reviews")}
                                                                className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "reviews" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                                                            >
                                                                Reviews ({variant.reviewsCount})
                                                            </button>
                                                            <button
                                                                onClick={() => setTab(variant.id, "cart")}
                                                                className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "cart" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                                                            >
                                                                In Cart ({variant.currentlyInCart.usersCount})
                                                            </button>
                                                            <button
                                                                onClick={() => setTab(variant.id, "wishlist")}
                                                                className={`text-xs px-3 py-1.5 rounded-full border transition ${tab === "wishlist" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                                                            >
                                                                Wishlist ({variant.currentlyInWishlist.count})
                                                            </button>
                                                        </div>

                                                        {tab === "buyers" && (
                                                            <div>
                                                                <UserFilterDropdown
                                                                    users={uniqueBuyerUsers}
                                                                    selectedId={selectedBuyerId}
                                                                    onChange={(val) => setBuyerFilter((prev) => ({ ...prev, [variant.id]: val }))}
                                                                    totalLabel={`Sabhi Buyers (${variant.uniqueBuyersCount ?? 0} users)`}
                                                                />
                                                                <div className="space-y-2">
                                                                    {filteredBuyers.length === 0 && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {selectedBuyerId ? "Is user ka koi order nahi mila" : "Abhi tak koi order nahi"}
                                                                        </p>
                                                                    )}
                                                                    {filteredBuyers.map((b, i) => (
                                                                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <img
                                                                                    src={b.user?.imageUrl || "https://via.placeholder.com/28"}
                                                                                    alt=""
                                                                                    className="w-7 h-7 rounded-full object-cover"
                                                                                />
                                                                                <div>
                                                                                    <p className="text-xs font-medium text-gray-800">{b.user?.fullName}</p>
                                                                                    <p className="text-[10px] text-gray-400">
                                                                                        #{b.orderNumber} • Qty {b.quantity} • ₹{b.price}
                                                                                    </p>
                                                                                    <p className="text-[10px] text-gray-400">
                                                                                        {b.orderedDate} • {b.orderedTime} • {b.orderedDay}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusColor[b.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
                                                                                {b.deliveryStatus}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {tab === "reviews" && (
                                                            <div>
                                                                <UserFilterDropdown
                                                                    users={uniqueReviewUsers}
                                                                    selectedId={selectedReviewId}
                                                                    onChange={(val) => setReviewFilter((prev) => ({ ...prev, [variant.id]: val }))}
                                                                    totalLabel={`Sabhi Reviewers (${uniqueReviewUsers.length} users)`}
                                                                />
                                                                <div className="space-y-2">
                                                                    {filteredReviews.length === 0 && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {selectedReviewId ? "Is user ka koi review nahi mila" : "Abhi tak koi review nahi"}
                                                                        </p>
                                                                    )}
                                                                    {filteredReviews.map((r) => (
                                                                        <div key={r.id} className="bg-gray-50 rounded-lg p-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <img
                                                                                        src={r.user?.imageUrl || "https://via.placeholder.com/28"}
                                                                                        alt=""
                                                                                        className="w-7 h-7 rounded-full object-cover"
                                                                                    />
                                                                                    <div>
                                                                                        <p className="text-xs font-medium text-gray-800">{r.user?.fullName}</p>
                                                                                        <p className="text-[10px] text-gray-400">
                                                                                            {r.reviewDate} • {r.reviewTime} • {r.reviewDay}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <Stars rating={r.rating} />
                                                                            </div>
                                                                            {r.comment && (
                                                                                <p className="text-xs text-gray-600 mt-1 pl-9">{r.comment}</p>
                                                                            )}
                                                                            {r.images?.length > 0 && (
                                                                                <div className="flex gap-1 mt-1 pl-9">
                                                                                    {r.images.map((img) => (
                                                                                        <img
                                                                                            key={img.id}
                                                                                            src={img.imageUrl}
                                                                                            alt=""
                                                                                            className="w-10 h-10 rounded object-cover border border-gray-200"
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {tab === "cart" && (
                                                            <div>
                                                                <UserFilterDropdown
                                                                    users={uniqueCartUsers}
                                                                    selectedId={selectedCartId}
                                                                    onChange={(val) => setCartFilter((prev) => ({ ...prev, [variant.id]: val }))}
                                                                    totalLabel={`Sabhi Cart Users (${uniqueCartUsers.length} users)`}
                                                                />
                                                                <div className="space-y-2">
                                                                    {filteredCartUsers.length === 0 && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {selectedCartId ? "Is user ke cart me nahi hai" : "Abhi kisi ke cart me nahi hai"}
                                                                        </p>
                                                                    )}
                                                                    {filteredCartUsers.map((c, i) => (
                                                                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <img
                                                                                    src={c.user?.imageUrl || "https://via.placeholder.com/28"}
                                                                                    alt=""
                                                                                    className="w-7 h-7 rounded-full object-cover"
                                                                                />
                                                                                <div>
                                                                                    <p className="text-xs font-medium text-gray-800">{c.user?.fullName}</p>
                                                                                    <p className="text-[10px] text-gray-400">
                                                                                        {c.cartDate} • {c.cartTime} • {c.cartDay}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-[10px] text-gray-500">Qty {c.quantity}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {tab === "wishlist" && (
                                                            <div>
                                                                <UserFilterDropdown
                                                                    users={uniqueWishlistUsers}
                                                                    selectedId={selectedWishlistId}
                                                                    onChange={(val) => setWishlistFilter((prev) => ({ ...prev, [variant.id]: val }))}
                                                                    totalLabel={`Sabhi Wishlist Users (${uniqueWishlistUsers.length} users)`}
                                                                />
                                                                <div className="space-y-2">
                                                                    {filteredWishlistUsers.length === 0 && (
                                                                        <p className="text-xs text-gray-400">
                                                                            {selectedWishlistId ? "Is user ke wishlist me nahi hai" : "Abhi kisi ke wishlist me nahi hai"}
                                                                        </p>
                                                                    )}
                                                                    {filteredWishlistUsers.map((w, i) => (
                                                                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <img
                                                                                    src={w.user?.imageUrl || "https://via.placeholder.com/28"}
                                                                                    alt=""
                                                                                    className="w-7 h-7 rounded-full object-cover"
                                                                                />
                                                                                <div>
                                                                                    <p className="text-xs font-medium text-gray-800">{w.user?.fullName}</p>
                                                                                    <p className="text-[10px] text-gray-400">
                                                                                        {w.wishDate} • {w.wishTime} • {w.wishDay}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-800">{adminPagination?.currentPage || 1}</span> of{" "}
                        <span className="font-medium text-gray-800">{adminPagination?.totalPages || 1}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={adminPagination?.currentPage <= 1}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(adminPagination?.totalPages || 1, p + 1))}
                            disabled={adminPagination?.currentPage >= adminPagination?.totalPages}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* 👇 NAYA - Approve block modal */}
            <ApprovalBlockedModal
                product={blockModalProduct}
                reasons={blockReasons}
                onClose={() => {
                    setBlockModalProduct(null);
                    setBlockReasons([]);
                }}
            />
        </main>
    );
};

export default Product;