import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api'; // Apne project ke hisab se api import path check kar lena
import { fetchAllCategory } from '../redux/slices/categorySlice';
import { fetchSubCategoryByCategory } from '../redux/slices/subCategorySlice';

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux store se categories aur subcategories lena
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

    // 1. Page load hone par SARI categories fetch karna (bada limit bhej kar)
    useEffect(() => {
        dispatch(fetchAllCategory({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // 2. Product Details Fetch on Mount (aur product ki category ke basis pe subcategories fetch karna)
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

                // Agar product me categoryId hai, toh turant uski subcategories bhi fetch kar lo taaki pre-select ho sake
                if (prod.categoryId) {
                    dispatch(fetchSubCategoryByCategory(prod.categoryId));
                }

                // Map variants & convert attributes object into key-value array format
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

    // 3. Jab bhi admin manually Category change kare, subcategories fetch karo aur purani subcategory reset karo
    const handleCategoryChange = (e) => {
        const newCatId = e.target.value;
        setCategoryId(newCatId);
        setSubCategoryId(""); // Reset subcategory when category changes
        if (newCatId) {
            dispatch(fetchSubCategoryByCategory(newCatId));
        }
    };

    // Handle Variant Field Change
    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    // Handle Attribute Key/Value Change
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

    // Submit Form (Update Product)
    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    navigate(-1);
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
        <main className="p-6 bg-gray-50 min-h-screen">
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

                    {/* Category & SubCategory Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">SubCategory *</label>
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
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariant(variantIndex)}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remove Variant
                                        </button>
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

                                    {/* Dynamic Attributes (Key - Value Rows) */}
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
        </main>
    );
};

export default UpdateProduct;