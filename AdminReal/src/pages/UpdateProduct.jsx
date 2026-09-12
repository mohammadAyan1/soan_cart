


// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import api from '../api/api';
// import { fetchAllCategory, createCategory } from '../redux/slices/categorySlice';
// import { fetchSubCategoryByCategory, createSubCategory } from '../redux/slices/subCategorySlice';

// const UpdateProduct = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const { categories } = useSelector((state) => state.category);
//     const { subCategoriesByCategory } = useSelector((state) => state.subCategory);

//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [error, setError] = useState(null);
//     const [successMsg, setSuccessMsg] = useState("");

//     // Form States
//     const [productName, setProductName] = useState("");
//     const [description, setDescription] = useState("");
//     const [categoryId, setCategoryId] = useState("");
//     const [subCategoryId, setSubCategoryId] = useState("");
//     const [tags, setTags] = useState("");
//     const [productImageFile, setProductImageFile] = useState(null);
//     const [existingProductImageUrl, setExistingProductImageUrl] = useState("");
//     const [deleteProductImage, setDeleteProductImage] = useState(false);

//     // Variants & Image Deletions
//     const [variants, setVariants] = useState([]);
//     const [deleteImageIds, setDeleteImageIds] = useState([]);
//     const [newVariantFiles, setNewVariantFiles] = useState({});
//     const [existingVariantFiles, setExistingVariantFiles] = useState({});

//     // ---- Quick Add Category Modal States ----
//     const [isCatModalOpen, setIsCatModalOpen] = useState(false);
//     const [newCatName, setNewCatName] = useState("");
//     const [newCatTags, setNewCatTags] = useState("");
//     const [newCatImageFile, setNewCatImageFile] = useState(null);
//     const [newCatImagePreview, setNewCatImagePreview] = useState(null);

//     // ---- Quick Add SubCategory Modal States ----
//     const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
//     const [newSubCatName, setNewSubCatName] = useState("");
//     const [newSubCatCatId, setNewSubCatCatId] = useState("");
//     const [newSubCatTags, setNewSubCatTags] = useState("");
//     const [newSubCatImageFile, setNewSubCatImageFile] = useState(null);
//     const [newSubCatImagePreview, setNewSubCatImagePreview] = useState(null);

//     // ---- Validation Reason Modal State ----
//     const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
//     const [validationReasons, setValidationReasons] = useState([]);

//     useEffect(() => {
//         dispatch(fetchAllCategory({ page: 1, limit: 1000 }));
//     }, [dispatch]);

//     useEffect(() => {
//         const fetchProductDetails = async () => {
//             try {
//                 setLoading(true);
//                 const res = await api.get(`/api/product/vendor/products/${id}`);
//                 const prod = res.data.product;

//                 setProductName(prod.productName || "");
//                 setDescription(prod.description || "");
//                 setCategoryId(prod.categoryId || "");
//                 setSubCategoryId(prod.subCategoryId || "");
//                 setTags(Array.isArray(prod.tags) ? prod.tags.join(", ") : (prod.tags || ""));
//                 setExistingProductImageUrl(prod.imageUrl || "");

//                 if (prod.categoryId) {
//                     dispatch(fetchSubCategoryByCategory(prod.categoryId));
//                 }

//                 const mappedVariants = (prod.variants || []).map((v) => {
//                     let attrArray = [];
//                     if (v.attributes) {
//                         if (typeof v.attributes === "object") {
//                             attrArray = Object.entries(v.attributes).map(([key, value]) => ({ key, value }));
//                         } else if (typeof v.attributes === "string") {
//                             try {
//                                 const parsed = JSON.parse(v.attributes);
//                                 attrArray = Object.entries(parsed).map(([key, value]) => ({ key, value }));
//                             } catch (e) {
//                                 attrArray = [{ key: "Details", value: v.attributes }];
//                             }
//                         }
//                     }
//                     if (attrArray.length === 0) {
//                         attrArray = [{ key: "", value: "" }];
//                     }

//                     return {
//                         id: v.id,
//                         description: v.description || "",
//                         actualPrice: v.actualPrice || "",
//                         mrp: v.mrp || "",
//                         showMrp: v.showMrp ?? true,
//                         vendorMinPrice: v.vendorMinPrice || "",
//                         stock: v.stock || 0,
//                         tags: Array.isArray(v.tags) ? v.tags.join(", ") : (v.tags || ""),
//                         attributes: attrArray,
//                         isDelete: v.isDelete || false,
//                         images: v.images || []
//                     };
//                 });

//                 setVariants(mappedVariants);
//             } catch (err) {
//                 console.error("Error fetching product:", err);
//                 setError(err.response?.data?.message || "Product load karne me error aaya.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (id) {
//             fetchProductDetails();
//         }
//     }, [id, dispatch]);

//     const handleCategoryChange = (e) => {
//         const newCatId = e.target.value;
//         setCategoryId(newCatId);
//         setSubCategoryId("");
//         if (newCatId) {
//             dispatch(fetchSubCategoryByCategory(newCatId));
//         }
//     };

//     const handleVariantChange = (index, field, value) => {
//         const updated = [...variants];
//         updated[index][field] = value;
//         setVariants(updated);
//     };

//     const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
//         const updated = [...variants];
//         const updatedAttrs = [...updated[variantIndex].attributes];
//         updatedAttrs[attrIndex][field] = value;
//         updated[variantIndex].attributes = updatedAttrs;
//         setVariants(updated);
//     };

//     const handleAddAttributeRow = (variantIndex) => {
//         const updated = [...variants];
//         updated[variantIndex].attributes.push({ key: "", value: "" });
//         setVariants(updated);
//     };

//     const handleRemoveAttributeRow = (variantIndex, attrIndex) => {
//         const updated = [...variants];
//         updated[variantIndex].attributes.splice(attrIndex, 1);
//         setVariants(updated);
//     };

//     const handleAddVariant = () => {
//         setVariants([
//             ...variants,
//             {
//                 tempId: `new_${Date.now()}`,
//                 description: "",
//                 actualPrice: "",
//                 mrp: "",
//                 showMrp: true,
//                 vendorMinPrice: "",
//                 stock: 0,
//                 tags: "",
//                 attributes: [{ key: "", value: "" }],
//                 images: []
//             }
//         ]);
//     };

//     const handleRemoveVariant = (index) => {
//         const updated = [...variants];
//         updated.splice(index, 1);
//         setVariants(updated);
//     };

//     const handleMarkImageForDeletion = (imageId) => {
//         if (!deleteImageIds.includes(imageId)) {
//             setDeleteImageIds([...deleteImageIds, imageId]);
//         }
//         setVariants(variants.map(v => ({
//             ...v,
//             images: v.images.filter(img => img.id !== imageId)
//         })));
//     };

//     const handleExistingVariantFileChange = (variantId, e) => {
//         const files = Array.from(e.target.files);
//         setExistingVariantFiles({
//             ...existingVariantFiles,
//             [variantId]: files
//         });
//     };

//     const handleNewVariantFileChange = (tempId, index, e) => {
//         const files = Array.from(e.target.files);
//         const key = tempId || `new_${index}`;
//         setNewVariantFiles({
//             ...newVariantFiles,
//             [key]: files
//         });
//     };

//     // Quick Add Category Handler (with Name, Tags, Image)
//     const handleQuickCreateCategory = async (e) => {
//         e.preventDefault();
//         if (!newCatName.trim()) return;

//         const tagsArray = newCatTags
//             .split(",")
//             .map((t) => t.trim())
//             .filter(Boolean);

//         const fd = new FormData();
//         fd.append("productCategoryName", newCatName.trim());
//         fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
//         if (newCatImageFile) {
//             fd.append("image", newCatImageFile);
//         }

//         try {
//             const res = await dispatch(createCategory(fd)).unwrap();
//             const createdCatId = res?.category?.id || res?.id;

//             await dispatch(fetchAllCategory({ page: 1, limit: 1000 }));
//             if (createdCatId) {
//                 setCategoryId(String(createdCatId));
//                 dispatch(fetchSubCategoryByCategory(createdCatId));
//             }
//             // Reset & Close
//             setNewCatName("");
//             setNewCatTags("");
//             setNewCatImageFile(null);
//             setNewCatImagePreview(null);
//             setIsCatModalOpen(false);
//         } catch (err) {
//             alert(err || "Category create karne me error aaya.");
//         }
//     };

//     // Quick Add SubCategory Handler (with Category Dropdown, Name, Tags, Image)
//     const handleQuickCreateSubCategory = async (e) => {
//         e.preventDefault();
//         if (!newSubCatName.trim() || !newSubCatCatId) {
//             alert("Category aur SubCategory Name dono anivarya hain!");
//             return;
//         }

//         const tagsArray = newSubCatTags
//             .split(",")
//             .map((t) => t.trim())
//             .filter(Boolean);

//         const fd = new FormData();
//         fd.append("productSubCategoryName", newSubCatName.trim());
//         fd.append("categoryId", newSubCatCatId);
//         fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
//         if (newSubCatImageFile) {
//             fd.append("image", newSubCatImageFile);
//         }

//         try {
//             const res = await dispatch(createSubCategory(fd)).unwrap();
//             const createdSubCatId = res?.subCategory?.id || res?.id;

//             setCategoryId(String(newSubCatCatId));
//             await dispatch(fetchSubCategoryByCategory(newSubCatCatId));
//             if (createdSubCatId) {
//                 setSubCategoryId(String(createdSubCatId));
//             }
//             // Reset & Close
//             setNewSubCatName("");
//             setNewSubCatCatId("");
//             setNewSubCatTags("");
//             setNewSubCatImageFile(null);
//             setNewSubCatImagePreview(null);
//             setIsSubCatModalOpen(false);
//         } catch (err) {
//             alert(err || "SubCategory create karne me error aaya.");
//         }
//     };

//     // Submit Form (Update Product) with Validations
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         let errors = [];

//         if (!categoryId) {
//             errors.push("Category select karna anivarya hai (Category null nahi ho sakti).");
//         }
//         if (!subCategoryId) {
//             errors.push("SubCategory select karna anivarya hai (SubCategory null nahi ho sakti).");
//         }

//         variants.forEach((v, idx) => {
//             const price = Number(v.actualPrice);
//             if (isNaN(price) || price <= 0) {
//                 errors.push(`Variant #${idx + 1} ka Actual Price 0 ya usse kam nahi ho sakta.`);
//             }
//         });

//         if (errors.length > 0) {
//             setValidationReasons(errors);
//             setValidationErrorModalOpen(true);
//             return;
//         }

//         try {
//             setSubmitting(true);
//             setError(null);

//             const formData = new FormData();
//             formData.append("productName", productName);
//             formData.append("description", description);
//             formData.append("categoryId", categoryId);
//             formData.append("subCategoryId", subCategoryId);

//             const parsedTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
//             formData.append("tags", JSON.stringify(parsedTags));

//             if (productImageFile) {
//                 formData.append("productImage", productImageFile);
//             }
//             if (deleteProductImage) {
//                 formData.append("deleteProductImage", "true");
//             }

//             if (deleteImageIds.length > 0) {
//                 formData.append("deleteImageIds", JSON.stringify(deleteImageIds));
//             }

//             const processedVariants = variants.map(v => {
//                 let parsedVariantTags = null;
//                 if (typeof v.tags === "string" && v.tags.trim() !== "") {
//                     parsedVariantTags = v.tags.split(",").map(t => t.trim()).filter(Boolean);
//                 } else if (Array.isArray(v.tags)) {
//                     parsedVariantTags = v.tags;
//                 }

//                 const attributesObj = {};
//                 if (Array.isArray(v.attributes)) {
//                     v.attributes.forEach(attr => {
//                         if (attr.key && attr.key.trim() !== "") {
//                             attributesObj[attr.key.trim()] = attr.value;
//                         }
//                     });
//                 }

//                 return {
//                     ...v,
//                     tags: parsedVariantTags,
//                     attributes: Object.keys(attributesObj).length > 0 ? attributesObj : null
//                 };
//             });

//             formData.append("variants", JSON.stringify(processedVariants));

//             variants.forEach((v, index) => {
//                 if (v.id) {
//                     const files = existingVariantFiles[v.id];
//                     if (files && files.length > 0) {
//                         files.forEach(file => {
//                             formData.append(`variant_image_${v.id}`, file);
//                         });
//                     }
//                 } else {
//                     const tempKey = v.tempId || `new_${index}`;
//                     const files = newVariantFiles[tempKey];
//                     if (files && files.length > 0) {
//                         files.forEach(file => {
//                             formData.append(`variant_image_${tempKey}`, file);
//                             formData.append(`variant_image_new_${index}`, file);
//                         });
//                     }
//                 }
//             });

//             const res = await api.put(`/api/product/update/${id}`, formData, {
//                 headers: { "Content-Type": "multipart/form-data" }
//             });

//             if (res.data.success) {
//                 setSuccessMsg("Product updated successfully!");
//                 setTimeout(() => {
//                     navigate("/products");
//                 }, 1500);
//             }
//         } catch (err) {
//             console.error("Update error:", err);
//             setError(err.response?.data?.message || "Product update karne me kuch error aaya.");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500 text-sm">
//                 Product data load ho raha hai...
//             </div>
//         );
//     }

//     return (
//         <main className="p-6 bg-gray-50 min-h-screen relative">
//             <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">

//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
//                     <div>
//                         <h1 className="text-xl font-bold text-gray-800">Update Product</h1>
//                         <p className="text-xs text-gray-400">Product ID: #{id}</p>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={() => navigate(-1)}
//                         className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
//                     >
//                         ← Back
//                     </button>
//                 </div>

//                 {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg">
//                         {error}
//                     </div>
//                 )}

//                 {successMsg && (
//                     <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-2 rounded-lg">
//                         {successMsg}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Basic Info */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
//                             <input
//                                 type="text"
//                                 value={productName}
//                                 onChange={(e) => setProductName(e.target.value)}
//                                 required
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma separated)</label>
//                             <input
//                                 type="text"
//                                 value={tags}
//                                 onChange={(e) => setTags(e.target.value)}
//                                 placeholder="e.g. apple, mobile, electronics"
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             />
//                         </div>
//                     </div>

//                     {/* Category & SubCategory Dropdowns with Plus Buttons */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <div className="flex items-center justify-between mb-1">
//                                 <label className="text-xs font-medium text-gray-700">Category *</label>
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsCatModalOpen(true)}
//                                     className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
//                                 >
//                                     + Add New Category
//                                 </button>
//                             </div>
//                             <select
//                                 value={categoryId}
//                                 onChange={handleCategoryChange}
//                                 required
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             >
//                                 <option value="">Select Category</option>
//                                 {(categories || []).map((c) => (
//                                     <option key={c.id} value={c.id}>{c.productCategoryName}</option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <div className="flex items-center justify-between mb-1">
//                                 <label className="text-xs font-medium text-gray-700">SubCategory *</label>
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setNewSubCatCatId(categoryId || "");
//                                         setIsSubCatModalOpen(true);
//                                     }}
//                                     className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
//                                 >
//                                     + Add New SubCategory
//                                 </button>
//                             </div>
//                             <select
//                                 value={subCategoryId}
//                                 onChange={(e) => setSubCategoryId(e.target.value)}
//                                 required
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                             >
//                                 <option value="">Select SubCategory</option>
//                                 {(subCategoriesByCategory || []).map((sc) => (
//                                     <option key={sc.id} value={sc.id}>{sc.productSubCategoryName}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
//                         <textarea
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             rows="3"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
//                         />
//                     </div>

//                     {/* Product Main Image */}
//                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
//                         <label className="block text-xs font-semibold text-gray-700 mb-2">Main Product Image</label>
//                         <div className="flex items-center gap-4">
//                             {existingProductImageUrl && !deleteProductImage && (
//                                 <div className="relative">
//                                     <img src={existingProductImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
//                                     <button
//                                         type="button"
//                                         onClick={() => setDeleteProductImage(true)}
//                                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
//                                     >
//                                         ✕
//                                     </button>
//                                 </div>
//                             )}
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={(e) => {
//                                     setProductImageFile(e.target.files[0]);
//                                     setDeleteProductImage(false);
//                                 }}
//                                 className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                             />
//                         </div>
//                     </div>

//                     {/* Variants Section */}
//                     <div>
//                         <div className="flex items-center justify-between mb-3">
//                             <h2 className="text-sm font-bold text-gray-800">Product Variants</h2>
//                             <button
//                                 type="button"
//                                 onClick={handleAddVariant}
//                                 className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//                             >
//                                 + Add Variant
//                             </button>
//                         </div>

//                         <div className="space-y-4">
//                             {variants.map((v, variantIndex) => (
//                                 <div key={v.id || v.tempId} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
//                                     <div className="flex items-center justify-between">
//                                         <span className="text-xs font-semibold text-gray-600">Variant #{variantIndex + 1}</span>
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveVariant(variantIndex)}
//                                             className="text-xs text-red-500 hover:text-red-700"
//                                         >
//                                             Remove Variant
//                                         </button>
//                                     </div>

//                                     <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                                         <div>
//                                             <label className="block text-[10px] text-gray-500 mb-1">Actual Price (₹) *</label>
//                                             <input
//                                                 type="number"
//                                                 value={v.actualPrice}
//                                                 onChange={(e) => handleVariantChange(variantIndex, "actualPrice", e.target.value)}
//                                                 required
//                                                 className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[10px] text-gray-500 mb-1">MRP (₹) *</label>
//                                             <input
//                                                 type="number"
//                                                 value={v.mrp}
//                                                 onChange={(e) => handleVariantChange(variantIndex, "mrp", e.target.value)}
//                                                 required
//                                                 className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[10px] text-gray-500 mb-1">Vendor Min Price (₹) *</label>
//                                             <input
//                                                 type="number"
//                                                 value={v.vendorMinPrice}
//                                                 onChange={(e) => handleVariantChange(variantIndex, "vendorMinPrice", e.target.value)}
//                                                 required
//                                                 className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[10px] text-gray-500 mb-1">Stock *</label>
//                                             <input
//                                                 type="number"
//                                                 value={v.stock}
//                                                 onChange={(e) => handleVariantChange(variantIndex, "stock", e.target.value)}
//                                                 required
//                                                 className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div>
//                                         <label className="block text-[10px] text-gray-500 mb-1">Variant Description / Specification</label>
//                                         <input
//                                             type="text"
//                                             value={v.description}
//                                             onChange={(e) => handleVariantChange(variantIndex, "description", e.target.value)}
//                                             placeholder="e.g. 6GB RAM / 128GB Storage - Black"
//                                             className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-[10px] text-gray-500 mb-1">Variant Tags (comma separated)</label>
//                                         <input
//                                             type="text"
//                                             value={v.tags}
//                                             onChange={(e) => handleVariantChange(variantIndex, "tags", e.target.value)}
//                                             placeholder="e.g. black, 6gb, sale"
//                                             className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
//                                         />
//                                     </div>

//                                     {/* Dynamic Attributes */}
//                                     <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
//                                         <div className="flex items-center justify-between">
//                                             <label className="block text-[11px] font-semibold text-gray-700">Attributes (Key - Value)</label>
//                                             <button
//                                                 type="button"
//                                                 onClick={() => handleAddAttributeRow(variantIndex)}
//                                                 className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
//                                             >
//                                                 + Add Attribute
//                                             </button>
//                                         </div>

//                                         {v.attributes.map((attr, attrIndex) => (
//                                             <div key={attrIndex} className="flex items-center gap-2">
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Key (e.g. Color)"
//                                                     value={attr.key}
//                                                     onChange={(e) => handleAttributeChange(variantIndex, attrIndex, "key", e.target.value)}
//                                                     className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs outline-none"
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Value (e.g. Black)"
//                                                     value={attr.value}
//                                                     onChange={(e) => handleAttributeChange(variantIndex, attrIndex, "value", e.target.value)}
//                                                     className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs outline-none"
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => handleRemoveAttributeRow(variantIndex, attrIndex)}
//                                                     className="text-red-500 hover:text-red-700 px-1 text-xs"
//                                                     title="Remove Row"
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {/* Variant Images */}
//                                     <div>
//                                         <label className="block text-[10px] text-gray-500 mb-1">Variant Images</label>
//                                         <div className="flex flex-wrap items-center gap-2 mb-2">
//                                             {v.images?.map((img) => (
//                                                 <div key={img.id} className="relative">
//                                                     <img src={img.imageUrl} alt="" className="w-12 h-12 rounded object-cover border" />
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => handleMarkImageForDeletion(img.id)}
//                                                         className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center"
//                                                     >
//                                                         ✕
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         <input
//                                             type="file"
//                                             multiple
//                                             accept="image/*"
//                                             onChange={(e) => {
//                                                 if (v.id) {
//                                                     handleExistingVariantFileChange(v.id, e);
//                                                 } else {
//                                                     handleNewVariantFileChange(v.tempId, variantIndex, e);
//                                                 }
//                                             }}
//                                             className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//                         <button
//                             type="button"
//                             onClick={() => navigate(-1)}
//                             className="px-4 py-2 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-6 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
//                         >
//                             {submitting ? "Updating..." : "Update Product"}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Quick Add Category Modal (with Name, Tags, Image) */}
//             {isCatModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
//                         <h3 className="text-base font-bold mb-4 text-gray-800">Add New Category</h3>
//                         <form onSubmit={handleQuickCreateCategory} className="space-y-3">
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Category Name *</label>
//                                 <input
//                                     type="text"
//                                     placeholder="e.g. Electronics"
//                                     value={newCatName}
//                                     onChange={(e) => setNewCatName(e.target.value)}
//                                     required
//                                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
//                                 <input
//                                     type="text"
//                                     placeholder="e.g. gadgets, devices"
//                                     value={newCatTags}
//                                     onChange={(e) => setNewCatTags(e.target.value)}
//                                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => {
//                                         const file = e.target.files?.[0];
//                                         if (file) {
//                                             setNewCatImageFile(file);
//                                             setNewCatImagePreview(URL.createObjectURL(file));
//                                         }
//                                     }}
//                                     className="w-full text-xs"
//                                 />
//                                 {newCatImagePreview && (
//                                     <img src={newCatImagePreview} alt="preview" className="w-14 h-14 rounded object-cover mt-2" />
//                                 )}
//                             </div>
//                             <div className="flex justify-end gap-2 pt-2">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsCatModalOpen(false)}
//                                     className="px-3 py-1.5 text-xs border rounded-md text-gray-600"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800"
//                                 >
//                                     Save Category
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Quick Add SubCategory Modal (with Category Dropdown, Name, Tags, Image) */}
//             {isSubCatModalOpen && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
//                         <h3 className="text-base font-bold mb-4 text-gray-800">Add New SubCategory</h3>
//                         <form onSubmit={handleQuickCreateSubCategory} className="space-y-3">
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Select Category *</label>
//                                 <select
//                                     value={newSubCatCatId}
//                                     onChange={(e) => setNewSubCatCatId(e.target.value)}
//                                     required
//                                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
//                                 >
//                                     <option value="">Select Category</option>
//                                     {(categories || []).map((c) => (
//                                         <option key={c.id} value={c.id}>{c.productCategoryName}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">SubCategory Name *</label>
//                                 <input
//                                     type="text"
//                                     placeholder="e.g. Mobile Phones"
//                                     value={newSubCatName}
//                                     onChange={(e) => setNewSubCatName(e.target.value)}
//                                     required
//                                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
//                                 <input
//                                     type="text"
//                                     placeholder="e.g. smartphones, apple, samsung"
//                                     value={newSubCatTags}
//                                     onChange={(e) => setNewSubCatTags(e.target.value)}
//                                     className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium mb-1">Image</label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={(e) => {
//                                         const file = e.target.files?.[0];
//                                         if (file) {
//                                             setNewSubCatImageFile(file);
//                                             setNewSubCatImagePreview(URL.createObjectURL(file));
//                                         }
//                                     }}
//                                     className="w-full text-xs"
//                                 />
//                                 {newSubCatImagePreview && (
//                                     <img src={newSubCatImagePreview} alt="preview" className="w-14 h-14 rounded object-cover mt-2" />
//                                 )}
//                             </div>
//                             <div className="flex justify-end gap-2 pt-2">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsSubCatModalOpen(false)}
//                                     className="px-3 py-1.5 text-xs border rounded-md text-gray-600"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800"
//                                 >
//                                     Save SubCategory
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Validation & Error Reasons Modal */}
//             {validationErrorModalOpen && (
//                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-red-100">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
//                                 ✕
//                             </div>
//                             <div>
//                                 <h3 className="text-base font-bold text-gray-900">Aap product update nahi kar sakte!</h3>
//                                 <p className="text-xs text-gray-500">Kripya nimnalikhit wajaho ko sudharein:</p>
//                             </div>
//                         </div>

//                         <ul className="space-y-2 mb-6 bg-red-50 p-3 rounded-lg border border-red-200">
//                             {validationReasons.map((reason, idx) => (
//                                 <li key={idx} className="text-xs text-red-700 flex items-start gap-2">
//                                     <span className="text-red-500 font-bold">•</span>
//                                     <span>{reason}</span>
//                                 </li>
//                             ))}
//                         </ul>

//                         <div className="flex justify-end">
//                             <button
//                                 type="button"
//                                 onClick={() => setValidationErrorModalOpen(false)}
//                                 className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
//                             >
//                                 Theek hai (Understand)
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </main>
//     );
// };

// export default UpdateProduct;



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import { fetchAllCategory, createCategory } from '../redux/slices/categorySlice';
import { fetchSubCategoryByCategory, createSubCategory } from '../redux/slices/subCategorySlice';

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { categories } = useSelector((state) => state.category);
    const { subCategoriesByCategory } = useSelector((state) => state.subCategory);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    // Form States
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [tags, setTags] = useState("");
    const [productImageFile, setProductImageFile] = useState(null);
    const [existingProductImageUrl, setExistingProductImageUrl] = useState("");
    const [deleteProductImage, setDeleteProductImage] = useState(false);

    // Variants & Image Deletions
    const [variants, setVariants] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const [newVariantFiles, setNewVariantFiles] = useState({});
    const [existingVariantFiles, setExistingVariantFiles] = useState({});

    // 👇 NAYA - variant-level Active/Deactive toggle ke liye per-variant loading state
    const [variantToggleLoadingId, setVariantToggleLoadingId] = useState(null);

    // ---- Quick Add Category Modal States ----
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatTags, setNewCatTags] = useState("");
    const [newCatImageFile, setNewCatImageFile] = useState(null);
    const [newCatImagePreview, setNewCatImagePreview] = useState(null);

    // ---- Quick Add SubCategory Modal States ----
    const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
    const [newSubCatName, setNewSubCatName] = useState("");
    const [newSubCatCatId, setNewSubCatCatId] = useState("");
    const [newSubCatTags, setNewSubCatTags] = useState("");
    const [newSubCatImageFile, setNewSubCatImageFile] = useState(null);
    const [newSubCatImagePreview, setNewSubCatImagePreview] = useState(null);

    // ---- Validation Reason Modal State ----
    const [validationErrorModalOpen, setValidationErrorModalOpen] = useState(false);
    const [validationReasons, setValidationReasons] = useState([]);

    useEffect(() => {
        dispatch(fetchAllCategory({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/product/vendor/products/${id}`);
                const prod = res.data.product;

                setProductName(prod.productName || "");
                setDescription(prod.description || "");
                setCategoryId(prod.categoryId || "");
                setSubCategoryId(prod.subCategoryId || "");
                setTags(Array.isArray(prod.tags) ? prod.tags.join(", ") : (prod.tags || ""));
                setExistingProductImageUrl(prod.imageUrl || "");

                if (prod.categoryId) {
                    dispatch(fetchSubCategoryByCategory(prod.categoryId));
                }

                const mappedVariants = (prod.variants || []).map((v) => {
                    let attrArray = [];
                    if (v.attributes) {
                        if (typeof v.attributes === "object") {
                            attrArray = Object.entries(v.attributes).map(([key, value]) => ({ key, value }));
                        } else if (typeof v.attributes === "string") {
                            try {
                                const parsed = JSON.parse(v.attributes);
                                attrArray = Object.entries(parsed).map(([key, value]) => ({ key, value }));
                            } catch (e) {
                                attrArray = [{ key: "Details", value: v.attributes }];
                            }
                        }
                    }
                    if (attrArray.length === 0) {
                        attrArray = [{ key: "", value: "" }];
                    }

                    return {
                        id: v.id,
                        description: v.description || "",
                        actualPrice: v.actualPrice || "",
                        mrp: v.mrp || "",
                        showMrp: v.showMrp ?? true,
                        vendorMinPrice: v.vendorMinPrice || "",
                        stock: v.stock || 0,
                        tags: Array.isArray(v.tags) ? v.tags.join(", ") : (v.tags || ""),
                        attributes: attrArray,
                        isDelete: v.isDelete || false,
                        images: v.images || []
                    };
                });

                setVariants(mappedVariants);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err.response?.data?.message || "Product load karne me error aaya.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id, dispatch]);

    const handleCategoryChange = (e) => {
        const newCatId = e.target.value;
        setCategoryId(newCatId);
        setSubCategoryId("");
        if (newCatId) {
            dispatch(fetchSubCategoryByCategory(newCatId));
        }
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
        const updated = [...variants];
        const updatedAttrs = [...updated[variantIndex].attributes];
        updatedAttrs[attrIndex][field] = value;
        updated[variantIndex].attributes = updatedAttrs;
        setVariants(updated);
    };

    const handleAddAttributeRow = (variantIndex) => {
        const updated = [...variants];
        updated[variantIndex].attributes.push({ key: "", value: "" });
        setVariants(updated);
    };

    const handleRemoveAttributeRow = (variantIndex, attrIndex) => {
        const updated = [...variants];
        updated[variantIndex].attributes.splice(attrIndex, 1);
        setVariants(updated);
    };

    const handleAddVariant = () => {
        setVariants([
            ...variants,
            {
                tempId: `new_${Date.now()}`,
                description: "",
                actualPrice: "",
                mrp: "",
                showMrp: true,
                vendorMinPrice: "",
                stock: 0,
                tags: "",
                attributes: [{ key: "", value: "" }],
                images: []
            }
        ]);
    };

    const handleRemoveVariant = (index) => {
        const updated = [...variants];
        updated.splice(index, 1);
        setVariants(updated);
    };

    const handleMarkImageForDeletion = (imageId) => {
        if (!deleteImageIds.includes(imageId)) {
            setDeleteImageIds([...deleteImageIds, imageId]);
        }
        setVariants(variants.map(v => ({
            ...v,
            images: v.images.filter(img => img.id !== imageId)
        })));
    };

    const handleExistingVariantFileChange = (variantId, e) => {
        const files = Array.from(e.target.files);
        setExistingVariantFiles({
            ...existingVariantFiles,
            [variantId]: files
        });
    };

    const handleNewVariantFileChange = (tempId, index, e) => {
        const files = Array.from(e.target.files);
        const key = tempId || `new_${index}`;
        setNewVariantFiles({
            ...newVariantFiles,
            [key]: files
        });
    };

    // 👇 NAYA: Variant Active/Deactive toggle handler
    // Backend route: PUT /api/product/variant/:variantId/delete
    // isDelete = false -> Active, isDelete = true -> Deactive
    // Sirf existing variant (jiska real "id" hai) par kaam karega
    const handleToggleVariantStatus = async (variantId) => {
        if (!variantId) return;
        try {
            setVariantToggleLoadingId(variantId);
            const res = await api.put(`/api/product/variant/${variantId}/delete`);
            if (res.data.success) {
                setVariants((prev) =>
                    prev.map((v) =>
                        v.id === variantId ? { ...v, isDelete: !v.isDelete } : v
                    )
                );
            }
        } catch (err) {
            console.error("Variant toggle error:", err);
            alert(err.response?.data?.message || "Variant status update karne me error aaya.");
        } finally {
            setVariantToggleLoadingId(null);
        }
    };

    // Quick Add Category Handler (with Name, Tags, Image)
    const handleQuickCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const tagsArray = newCatTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const fd = new FormData();
        fd.append("productCategoryName", newCatName.trim());
        fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
        if (newCatImageFile) {
            fd.append("image", newCatImageFile);
        }

        try {
            const res = await dispatch(createCategory(fd)).unwrap();
            const createdCatId = res?.category?.id || res?.id;

            await dispatch(fetchAllCategory({ page: 1, limit: 1000 }));
            if (createdCatId) {
                setCategoryId(String(createdCatId));
                dispatch(fetchSubCategoryByCategory(createdCatId));
            }
            // Reset & Close
            setNewCatName("");
            setNewCatTags("");
            setNewCatImageFile(null);
            setNewCatImagePreview(null);
            setIsCatModalOpen(false);
        } catch (err) {
            alert(err || "Category create karne me error aaya.");
        }
    };

    // Quick Add SubCategory Handler (with Category Dropdown, Name, Tags, Image)
    const handleQuickCreateSubCategory = async (e) => {
        e.preventDefault();
        if (!newSubCatName.trim() || !newSubCatCatId) {
            alert("Category aur SubCategory Name dono anivarya hain!");
            return;
        }

        const tagsArray = newSubCatTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const fd = new FormData();
        fd.append("productSubCategoryName", newSubCatName.trim());
        fd.append("categoryId", newSubCatCatId);
        fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
        if (newSubCatImageFile) {
            fd.append("image", newSubCatImageFile);
        }

        try {
            const res = await dispatch(createSubCategory(fd)).unwrap();
            const createdSubCatId = res?.subCategory?.id || res?.id;

            setCategoryId(String(newSubCatCatId));
            await dispatch(fetchSubCategoryByCategory(newSubCatCatId));
            if (createdSubCatId) {
                setSubCategoryId(String(createdSubCatId));
            }
            // Reset & Close
            setNewSubCatName("");
            setNewSubCatCatId("");
            setNewSubCatTags("");
            setNewSubCatImageFile(null);
            setNewSubCatImagePreview(null);
            setIsSubCatModalOpen(false);
        } catch (err) {
            alert(err || "SubCategory create karne me error aaya.");
        }
    };

    // Submit Form (Update Product) with Validations
    const handleSubmit = async (e) => {
        e.preventDefault();

        let errors = [];

        if (!categoryId) {
            errors.push("Category select karna anivarya hai (Category null nahi ho sakti).");
        }
        if (!subCategoryId) {
            errors.push("SubCategory select karna anivarya hai (SubCategory null nahi ho sakti).");
        }

        variants.forEach((v, idx) => {
            const price = Number(v.actualPrice);
            if (isNaN(price) || price <= 0) {
                errors.push(`Variant #${idx + 1} ka Actual Price 0 ya usse kam nahi ho sakta.`);
            }
        });

        if (errors.length > 0) {
            setValidationReasons(errors);
            setValidationErrorModalOpen(true);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append("productName", productName);
            formData.append("description", description);
            formData.append("categoryId", categoryId);
            formData.append("subCategoryId", subCategoryId);

            const parsedTags = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
            formData.append("tags", JSON.stringify(parsedTags));

            if (productImageFile) {
                formData.append("productImage", productImageFile);
            }
            if (deleteProductImage) {
                formData.append("deleteProductImage", "true");
            }

            if (deleteImageIds.length > 0) {
                formData.append("deleteImageIds", JSON.stringify(deleteImageIds));
            }

            const processedVariants = variants.map(v => {
                let parsedVariantTags = null;
                if (typeof v.tags === "string" && v.tags.trim() !== "") {
                    parsedVariantTags = v.tags.split(",").map(t => t.trim()).filter(Boolean);
                } else if (Array.isArray(v.tags)) {
                    parsedVariantTags = v.tags;
                }

                const attributesObj = {};
                if (Array.isArray(v.attributes)) {
                    v.attributes.forEach(attr => {
                        if (attr.key && attr.key.trim() !== "") {
                            attributesObj[attr.key.trim()] = attr.value;
                        }
                    });
                }

                return {
                    ...v,
                    tags: parsedVariantTags,
                    attributes: Object.keys(attributesObj).length > 0 ? attributesObj : null
                };
            });

            formData.append("variants", JSON.stringify(processedVariants));

            variants.forEach((v, index) => {
                if (v.id) {
                    const files = existingVariantFiles[v.id];
                    if (files && files.length > 0) {
                        files.forEach(file => {
                            formData.append(`variant_image_${v.id}`, file);
                        });
                    }
                } else {
                    const tempKey = v.tempId || `new_${index}`;
                    const files = newVariantFiles[tempKey];
                    if (files && files.length > 0) {
                        files.forEach(file => {
                            formData.append(`variant_image_${tempKey}`, file);
                            formData.append(`variant_image_new_${index}`, file);
                        });
                    }
                }
            });

            const res = await api.put(`/api/product/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setSuccessMsg("Product updated successfully!");
                setTimeout(() => {
                    navigate("/products");
                }, 1500);
            }
        } catch (err) {
            console.error("Update error:", err);
            setError(err.response?.data?.message || "Product update karne me kuch error aaya.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500 text-sm">
                Product data load ho raha hai...
            </div>
        );
    }

    return (
        <main className="p-6 bg-gray-50 min-h-screen relative">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Update Product</h1>
                        <p className="text-xs text-gray-400">Product ID: #{id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                        ← Back
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-2 rounded-lg">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. apple, mobile, electronics"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Category & SubCategory Dropdowns with Plus Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-gray-700">Category *</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCatModalOpen(true)}
                                    className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    + Add New Category
                                </button>
                            </div>
                            <select
                                value={categoryId}
                                onChange={handleCategoryChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">Select Category</option>
                                {(categories || []).map((c) => (
                                    <option key={c.id} value={c.id}>{c.productCategoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-gray-700">SubCategory *</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewSubCatCatId(categoryId || "");
                                        setIsSubCatModalOpen(true);
                                    }}
                                    className="text-[11px] text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    + Add New SubCategory
                                </button>
                            </div>
                            <select
                                value={subCategoryId}
                                onChange={(e) => setSubCategoryId(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">Select SubCategory</option>
                                {(subCategoriesByCategory || []).map((sc) => (
                                    <option key={sc.id} value={sc.id}>{sc.productSubCategoryName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {/* Product Main Image */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Main Product Image</label>
                        <div className="flex items-center gap-4">
                            {existingProductImageUrl && !deleteProductImage && (
                                <div className="relative">
                                    <img src={existingProductImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                                    <button
                                        type="button"
                                        onClick={() => setDeleteProductImage(true)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setProductImageFile(e.target.files[0]);
                                    setDeleteProductImage(false);
                                }}
                                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-gray-800">Product Variants</h2>
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                + Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {variants.map((v, variantIndex) => (
                                <div key={v.id || v.tempId} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600">Variant #{variantIndex + 1}</span>

                                        {/* 👇 UPDATED: "Remove Variant" ke sath ab Active/Deactive toggle bhi hai (existing variant ke liye) */}
                                        <div className="flex items-center gap-2">
                                            {v.id && (
                                                <button
                                                    type="button"
                                                    disabled={variantToggleLoadingId === v.id}
                                                    onClick={() => handleToggleVariantStatus(v.id)}
                                                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition ${!v.isDelete
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                        }`}
                                                    title="Click to toggle variant status"
                                                >
                                                    {!v.isDelete ? "Active" : "Deactive"}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariant(variantIndex)}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Remove Variant
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">Actual Price (₹) *</label>
                                            <input
                                                type="number"
                                                value={v.actualPrice}
                                                onChange={(e) => handleVariantChange(variantIndex, "actualPrice", e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">MRP (₹) *</label>
                                            <input
                                                type="number"
                                                value={v.mrp}
                                                onChange={(e) => handleVariantChange(variantIndex, "mrp", e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">Vendor Min Price (₹) *</label>
                                            <input
                                                type="number"
                                                value={v.vendorMinPrice}
                                                onChange={(e) => handleVariantChange(variantIndex, "vendorMinPrice", e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 mb-1">Stock *</label>
                                            <input
                                                type="number"
                                                value={v.stock}
                                                onChange={(e) => handleVariantChange(variantIndex, "stock", e.target.value)}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1">Variant Description / Specification</label>
                                        <input
                                            type="text"
                                            value={v.description}
                                            onChange={(e) => handleVariantChange(variantIndex, "description", e.target.value)}
                                            placeholder="e.g. 6GB RAM / 128GB Storage - Black"
                                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1">Variant Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={v.tags}
                                            onChange={(e) => handleVariantChange(variantIndex, "tags", e.target.value)}
                                            placeholder="e.g. black, 6gb, sale"
                                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        />
                                    </div>

                                    {/* Dynamic Attributes */}
                                    <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[11px] font-semibold text-gray-700">Attributes (Key - Value)</label>
                                            <button
                                                type="button"
                                                onClick={() => handleAddAttributeRow(variantIndex)}
                                                className="text-[10px] px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                                            >
                                                + Add Attribute
                                            </button>
                                        </div>

                                        {v.attributes.map((attr, attrIndex) => (
                                            <div key={attrIndex} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Key (e.g. Color)"
                                                    value={attr.key}
                                                    onChange={(e) => handleAttributeChange(variantIndex, attrIndex, "key", e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. Black)"
                                                    value={attr.value}
                                                    onChange={(e) => handleAttributeChange(variantIndex, attrIndex, "value", e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttributeRow(variantIndex, attrIndex)}
                                                    className="text-red-500 hover:text-red-700 px-1 text-xs"
                                                    title="Remove Row"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Variant Images */}
                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1">Variant Images</label>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            {v.images?.map((img) => (
                                                <div key={img.id} className="relative">
                                                    <img src={img.imageUrl} alt="" className="w-12 h-12 rounded object-cover border" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkImageForDeletion(img.id)}
                                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (v.id) {
                                                    handleExistingVariantFileChange(v.id, e);
                                                } else {
                                                    handleNewVariantFileChange(v.tempId, variantIndex, e);
                                                }
                                            }}
                                            className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {submitting ? "Updating..." : "Update Product"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick Add Category Modal (with Name, Tags, Image) */}
            {isCatModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
                        <h3 className="text-base font-bold mb-4 text-gray-800">Add New Category</h3>
                        <form onSubmit={handleQuickCreateCategory} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Electronics"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. gadgets, devices"
                                    value={newCatTags}
                                    onChange={(e) => setNewCatTags(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewCatImageFile(file);
                                            setNewCatImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-xs"
                                />
                                {newCatImagePreview && (
                                    <img src={newCatImagePreview} alt="preview" className="w-14 h-14 rounded object-cover mt-2" />
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCatModalOpen(false)}
                                    className="px-3 py-1.5 text-xs border rounded-md text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Add SubCategory Modal (with Category Dropdown, Name, Tags, Image) */}
            {isSubCatModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
                        <h3 className="text-base font-bold mb-4 text-gray-800">Add New SubCategory</h3>
                        <form onSubmit={handleQuickCreateSubCategory} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Select Category *</label>
                                <select
                                    value={newSubCatCatId}
                                    onChange={(e) => setNewSubCatCatId(e.target.value)}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {(categories || []).map((c) => (
                                        <option key={c.id} value={c.id}>{c.productCategoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">SubCategory Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mobile Phones"
                                    value={newSubCatName}
                                    onChange={(e) => setNewSubCatName(e.target.value)}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. smartphones, apple, samsung"
                                    value={newSubCatTags}
                                    onChange={(e) => setNewSubCatTags(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewSubCatImageFile(file);
                                            setNewSubCatImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-xs"
                                />
                                {newSubCatImagePreview && (
                                    <img src={newSubCatImagePreview} alt="preview" className="w-14 h-14 rounded object-cover mt-2" />
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSubCatModalOpen(false)}
                                    className="px-3 py-1.5 text-xs border rounded-md text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-xs bg-black text-white rounded-md hover:bg-gray-800"
                                >
                                    Save SubCategory
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Validation & Error Reasons Modal */}
            {validationErrorModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                                ✕
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Aap product update nahi kar sakte!</h3>
                                <p className="text-xs text-gray-500">Kripya nimnalikhit wajaho ko sudharein:</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 bg-red-50 p-3 rounded-lg border border-red-200">
                            {validationReasons.map((reason, idx) => (
                                <li key={idx} className="text-xs text-red-700 flex items-start gap-2">
                                    <span className="text-red-500 font-bold">•</span>
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setValidationErrorModalOpen(false)}
                                className="w-full py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
                            >
                                Theek hai (Understand)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default UpdateProduct;