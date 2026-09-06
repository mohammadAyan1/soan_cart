import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    createProduct,
    updateProduct,
    fetchVendorProductById,
    toggleVariantDelete,
    clearCurrentProduct,
} from "../../redux/slices/productSlice";
import { fetchAllCategory } from "../../redux/slices/categorySlice";
import { fetchSubCategoryByCategory, clearSubCategoryError } from "../../redux/slices/subCategorySlice";

const emptyVariant = () => ({
    tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: null,
    description: "",
    actualPrice: "",
    mrp: "",
    vendorMinPrice: "",
    stock: "",
    showMrp: true,
    tags: "",
    attributes: [{ key: "", value: "" }],
    existingImages: [],
    newImages: [],
    deleteImageIds: [],
    isDelete: false,
});

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const { currentProduct, formLoading, error: productError } = useSelector((s) => s.product);
    const { categories } = useSelector((s) => s.category);
    const { subCategoriesByCategory, loading: subLoading, error: subError } = useSelector(
        (s) => s.subCategory
    );

    // Local state
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [tags, setTags] = useState("");
    const [productImageFile, setProductImageFile] = useState(null);
    const [productImagePreview, setProductImagePreview] = useState(null);
    const [deleteProductImage, setDeleteProductImage] = useState(false);
    const [variants, setVariants] = useState([emptyVariant()]);

    // ─── Fetch categories on mount ──────────────────────────────
    useEffect(() => {
        dispatch(fetchAllCategory());
        // Clean subCategory error on unmount
        return () => dispatch(clearSubCategoryError());
    }, [dispatch]);

    // ─── Edit mode: fetch product data ──────────────────────────
    useEffect(() => {
        if (isEditMode) {
            dispatch(fetchVendorProductById(id));
        }
        return () => dispatch(clearCurrentProduct());
    }, [dispatch, id, isEditMode]);

    // ─── Populate form when product loads in edit mode ──────────
    useEffect(() => {
        if (isEditMode && currentProduct) {
            setProductName(currentProduct.productName || "");
            setDescription(currentProduct.description || "");
            setCategoryId(currentProduct.categoryId?.toString() || "");
            setSubCategoryId(currentProduct.subCategoryId?.toString() || "");
            setTags(
                Array.isArray(currentProduct.tags) ? currentProduct.tags.join(", ") : ""
            );
            setProductImagePreview(currentProduct.imageUrl || null);

            // If category is already set, fetch its sub‑categories
            if (currentProduct.categoryId) {
                dispatch(fetchSubCategoryByCategory(currentProduct.categoryId));
            }

            setVariants(
                (currentProduct.variants || []).map((v) => ({
                    tempId: `existing-${v.id}`,
                    id: v.id,
                    description: v.description || "",
                    actualPrice: v.actualPrice,
                    mrp: v.mrp,
                    vendorMinPrice: v.vendorMinPrice,
                    stock: v.stock,
                    showMrp: v.showMrp,
                    tags: Array.isArray(v.tags) ? v.tags.join(", ") : "",
                    attributes:
                        v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes)
                            ? Object.entries(v.attributes).map(([key, value]) => ({ key, value: String(value) }))
                            : [{ key: "", value: "" }],
                    existingImages: v.images || [],
                    newImages: [],
                    deleteImageIds: [],
                    isDelete: v.isDelete,
                }))
            );
        }
    }, [isEditMode, currentProduct, dispatch]);

    // ─── Category change handler ────────────────────────────────
    const handleCategoryChange = (e) => {
        const catId = e.target.value;
        setCategoryId(catId);
        setSubCategoryId(""); // reset subcategory selection
        if (catId) {
            dispatch(fetchSubCategoryByCategory(catId));
        } else {
            // if no category selected, clear subcategories
            // We can also handle it in slice by clearing subCategoriesByCategory, but we'll just reset local
            // Actually subCategoriesByCategory will still hold old data, but we can conditionally render dropdown
        }
    };

    // ─── Handlers for product image ─────────────────────────────
    const handleProductImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProductImageFile(file);
        setProductImagePreview(URL.createObjectURL(file));
        setDeleteProductImage(false);
    };

    const handleRemoveProductImage = () => {
        setProductImageFile(null);
        setProductImagePreview(null);
        setDeleteProductImage(true);
    };

    // ─── Handlers for variants (same as before) ─────────────────
    const updateVariantField = (index, field, value) => {
        setVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        );
    };

    const handleAddAttribute = (variantIndex) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === variantIndex
                    ? { ...v, attributes: [...v.attributes, { key: "", value: "" }] }
                    : v
            )
        );
    };

    const handleRemoveAttribute = (variantIndex, attrIndex) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === variantIndex
                    ? { ...v, attributes: v.attributes.filter((_, ai) => ai !== attrIndex) }
                    : v
            )
        );
    };

    const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === variantIndex
                    ? {
                        ...v,
                        attributes: v.attributes.map((attr, ai) =>
                            ai === attrIndex ? { ...attr, [field]: value } : attr
                        ),
                    }
                    : v
            )
        );
    };

    const handleAddVariant = () => {
        setVariants((prev) => [...prev, emptyVariant()]);
    };

    const handleRemoveNewVariant = (index) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVariantImagesChange = (index, e) => {
        const files = Array.from(e.target.files);
        setVariants((prev) =>
            prev.map((v, i) =>
                i === index ? { ...v, newImages: [...v.newImages, ...files] } : v
            )
        );
    };

    const handleRemoveNewVariantImage = (index, fileIdx) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === index
                    ? { ...v, newImages: v.newImages.filter((_, fi) => fi !== fileIdx) }
                    : v
            )
        );
    };

    const handleMarkExistingImageForDelete = (index, imageId) => {
        setVariants((prev) =>
            prev.map((v, i) =>
                i === index
                    ? {
                        ...v,
                        existingImages: v.existingImages.filter((img) => img.id !== imageId),
                        deleteImageIds: [...v.deleteImageIds, imageId],
                    }
                    : v
            )
        );
    };

    const handleToggleVariantDelete = (variant) => {
        if (!variant.id) return;
        const action = variant.isDelete ? "restore" : "delete";
        if (!window.confirm(`Is variant ko ${action} karna hai?`)) return;

        dispatch(
            toggleVariantDelete({ productId: Number(id), variantId: variant.id })
        ).then(() => {
            setVariants((prev) =>
                prev.map((v) =>
                    v.id === variant.id ? { ...v, isDelete: !v.isDelete } : v
                )
            );
        });
    };

    // ─── Submit handler ──────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !categoryId || !subCategoryId) {
            alert("Product name, category aur subCategory zaroori hai");
            return;
        }

        const formData = new FormData();
        formData.append("productName", productName);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("subCategoryId", subCategoryId);
        formData.append(
            "tags",
            JSON.stringify(
                tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
            )
        );

        if (productImageFile) {
            formData.append("productImage", productImageFile);
        }
        if (isEditMode && deleteProductImage) {
            formData.append("deleteProductImage", "true");
        }

        const variantsPayload = variants.map((v) => ({
            id: v.id || undefined,
            tempId: v.id ? undefined : v.tempId,
            description: v.description,
            actualPrice: v.actualPrice,
            mrp: v.mrp,
            showMrp: v.showMrp,
            vendorMinPrice: v.vendorMinPrice,
            stock: v.stock,
            tags: v.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            attributes: v.attributes.reduce((acc, attr) => {
                const key = attr.key.trim();
                const value = attr.value.trim();
                if (key && value) acc[key] = value;
                return acc;
            }, {}),
        }));
        formData.append("variants", JSON.stringify(variantsPayload));

        variants.forEach((v) => {
            v.newImages.forEach((file) => {
                const fieldName = v.id
                    ? `variant_image_${v.id}`
                    : `variant_image_${v.tempId}`;
                formData.append(fieldName, file);
            });
        });

        const allDeleteImageIds = variants.flatMap((v) => v.deleteImageIds);
        if (isEditMode && allDeleteImageIds.length > 0) {
            formData.append("deleteImageIds", JSON.stringify(allDeleteImageIds));
        }

        let result;
        if (isEditMode) {
            result = await dispatch(updateProduct({ id, formData }));
        } else {
            result = await dispatch(createProduct(formData));
        }

        if (!result.error) {
            navigate("/vendor/products");
        }
    };

    // Combine errors
    const error = productError || subError;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isEditMode ? "Product Edit Karo" : "Naya Product Add Karo"}
            </h2>

            {error && (
                <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ─── Basic Info ──────────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <h3 className="font-medium text-gray-700">Basic Details</h3>

                    <div>
                        <label className="text-sm text-gray-600">Product Name</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* ─── Category Dropdown ───────────────────── */}
                    <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <select
                            value={categoryId}
                            onChange={handleCategoryChange}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.productCategoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ─── Sub‑Category Dropdown ───────────────── */}
                    <div>
                        <label className="text-sm text-gray-600">Sub‑Category</label>
                        <select
                            value={subCategoryId}
                            onChange={(e) => setSubCategoryId(e.target.value)}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                            required
                            disabled={!categoryId || subLoading}
                        >
                            <option value="">
                                {!categoryId
                                    ? "Pehle category select karo"
                                    : subLoading
                                        ? "Loading..."
                                        : "Select Sub‑Category"}
                            </option>
                            {subCategoriesByCategory.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.productSubCategoryName}
                                </option>
                            ))}
                        </select>
                        {categoryId && subCategoriesByCategory.length === 0 && !subLoading && (
                            <p className="text-xs text-amber-600 mt-1">
                                Is category me koi sub‑category nahi hai.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Tags (comma se separate karo)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="summer, cotton, trending"
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600">Product Image (cover)</label>
                        <div className="mt-2 flex items-center gap-4">
                            {productImagePreview && (
                                <div className="relative">
                                    <img
                                        src={productImagePreview}
                                        alt="preview"
                                        className="w-20 h-20 object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveProductImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleProductImageChange} />
                        </div>
                    </div>
                </div>

                {/* ─── Variants ────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700">Variants</h3>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="text-sm text-emerald-600 font-medium hover:underline"
                        >
                            + Variant Add Karo
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div
                            key={variant.tempId}
                            className={`bg-white rounded-xl shadow-sm p-6 space-y-4 ${variant.isDelete ? "opacity-60 border border-red-200" : ""
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-600">
                                    Variant {index + 1}
                                    {variant.isDelete && (
                                        <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                            Deleted
                                        </span>
                                    )}
                                </p>
                                <div className="flex items-center gap-3">
                                    {variant.id ? (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleVariantDelete(variant)}
                                            className={`text-xs font-medium hover:underline ${variant.isDelete ? "text-emerald-600" : "text-red-600"
                                                }`}
                                        >
                                            {variant.isDelete ? "Restore Variant" : "Delete Variant"}
                                        </button>
                                    ) : (
                                        variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewVariant(index)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Description</label>
                                <input
                                    type="text"
                                    value={variant.description}
                                    onChange={(e) =>
                                        updateVariantField(index, "description", e.target.value)
                                    }
                                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600">Actual Price</label>
                                    <input
                                        type="number"
                                        value={variant.actualPrice}
                                        onChange={(e) =>
                                            updateVariantField(index, "actualPrice", e.target.value)
                                        }
                                        className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">MRP</label>
                                    <input
                                        type="number"
                                        value={variant.mrp}
                                        onChange={(e) =>
                                            updateVariantField(index, "mrp", e.target.value)
                                        }
                                        className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Vendor Min Price</label>
                                    <input
                                        type="number"
                                        value={variant.vendorMinPrice}
                                        onChange={(e) =>
                                            updateVariantField(index, "vendorMinPrice", e.target.value)
                                        }
                                        className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">Stock</label>
                                    <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) =>
                                            updateVariantField(index, "stock", e.target.value)
                                        }
                                        className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={variant.showMrp}
                                    onChange={(e) =>
                                        updateVariantField(index, "showMrp", e.target.checked)
                                    }
                                />
                                MRP dikhao (strikethrough)
                            </label>

                            {/* Variant Tags */}
                            <div>
                                <label className="text-sm text-gray-600">
                                    Variant Tags (comma se separate karo)
                                </label>
                                <input
                                    type="text"
                                    value={variant.tags}
                                    onChange={(e) =>
                                        updateVariantField(index, "tags", e.target.value)
                                    }
                                    placeholder="red, XL, cotton"
                                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Ye tags color, size, material jaise variant-specific attributes ke
                                    liye use kar sakte ho — search/filter me kaam aayenge.
                                </p>
                            </div>

                            {/* Attributes */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm text-gray-600">
                                        Attributes (Size, Color, waghera)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleAddAttribute(index)}
                                        className="text-xs text-emerald-600 font-medium hover:underline"
                                    >
                                        + Attribute Add Karo
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {variant.attributes.map((attr, attrIndex) => (
                                        <div key={attrIndex} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={attr.key}
                                                onChange={(e) =>
                                                    handleAttributeChange(
                                                        index,
                                                        attrIndex,
                                                        "key",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Naam (jaise: Color)"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={attr.value}
                                                onChange={(e) =>
                                                    handleAttributeChange(
                                                        index,
                                                        attrIndex,
                                                        "value",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Value (jaise: Red)"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                            {variant.attributes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveAttribute(index, attrIndex)
                                                    }
                                                    className="text-red-500 hover:text-red-700 text-lg leading-none px-2"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Har row ek key-value pair hai — jaise Color: Red, Size: XL, Material:
                                    Cotton
                                </p>
                            </div>

                            {/* Existing images */}
                            {variant.existingImages.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Existing Images</p>
                                    <div className="flex flex-wrap gap-3">
                                        {variant.existingImages.map((img) => (
                                            <div key={img.id} className="relative">
                                                <img
                                                    src={img.imageUrl}
                                                    alt=""
                                                    className={`w-16 h-16 object-cover rounded-lg border ${img.isPrimary ? "ring-2 ring-emerald-500" : ""
                                                        }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMarkExistingImageForDelete(index, img.id)
                                                    }
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New images */}
                            <div>
                                <label className="text-sm text-gray-600">Nayi Images Add Karo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleVariantImagesChange(index, e)}
                                    className="block mt-1 text-sm"
                                />
                                {variant.newImages.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {variant.newImages.map((file, fi) => (
                                            <div key={fi} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-16 h-16 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveNewVariantImage(index, fi)
                                                    }
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={formLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
                    >
                        {formLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/vendor/products")}
                        className="text-sm text-gray-500 hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;