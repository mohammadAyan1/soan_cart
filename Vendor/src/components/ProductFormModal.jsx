import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import {
    createProduct,
    updateProduct,
    fetchCategoryTree,
    toggleVariantDelete,
    clearCurrentProduct,
} from "../redux/slices/productSlice";

const emptyAttributeRow = () => ({ _key: crypto.randomUUID(), key: "", value: "" });

const emptyVariant = () => ({
    // sirf naye variant ke liye - id nahi hota
    _key: crypto.randomUUID(),
    description: "",
    mrp: "",
    vendorMinPrice: "",
    stock: "",
    tags: "",
    attributes: [], // [{ _key, key, value }]
    newImages: [], // File[]
    isDefault: false, // 👈 sirf ek hi variant (existing + new milakar) default ho sakta hai
});

// Backend attributes ek object hai ({ size: "Free", color: "Red" }) -
// UI me edit karna aasan banane ke liye array of {key, value} me convert karte hai
const attributesObjectToRows = (attributesObj) => {
    if (!attributesObj || typeof attributesObj !== "object") return [];
    return Object.entries(attributesObj).map(([key, value]) => ({
        _key: crypto.randomUUID(),
        key,
        value: String(value ?? ""),
    }));
};

const attributeRowsToObject = (rows) =>
    Object.fromEntries(
        (rows || [])
            .filter((r) => r.key.trim() !== "")
            .map((r) => [r.key.trim(), r.value])
    );

// ---------------------------------------------------------
// IMPORTANT (bug fix): ye components pehle ProductFormModal ke ANDAR
// define ho rahe the. Isse har render pe ek NAYA component "type" ban
// raha tha, aur React usko purane se alag treat karke poora subtree
// unmount+remount kar deta tha - yehi wajah thi ki attribute fields me
// type karte hi focus hat jata tha. Ab dono components MODULE LEVEL
// (function ke bahar) par define hai, isliye same identity rehti hai
// aur re-render pe sirf props update hote hai, remount nahi hota.
// ---------------------------------------------------------

const AttributeEditor = ({ rows, onAdd, onRemove, onChange }) => (
    <div className="mt-2">
        <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-stone-500">Attributes (Key - Value)</p>
            <button
                type="button"
                onClick={onAdd}
                className="text-xs font-medium text-indigo-600 hover:underline"
            >
                + Add Attribute
            </button>
        </div>

        {rows.length === 0 && (
            <p className="text-xs text-stone-400">Koi attribute nahi hai (e.g. size, color)</p>
        )}

        <div className="space-y-1.5">
            {rows.map((row) => (
                <div key={row._key} className="flex items-center gap-1.5">
                    <input
                        placeholder="key (e.g. size)"
                        value={row.key}
                        onChange={(e) => onChange(row._key, "key", e.target.value)}
                        className="w-1/2 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                    />
                    <input
                        placeholder="value (e.g. Free)"
                        value={row.value}
                        onChange={(e) => onChange(row._key, "value", e.target.value)}
                        className="w-1/2 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(row._key)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    </div>
);

// Naye select ki hui (abhi upload nahi hui) images ke thumbnails, har ek
// ke upar ek ✕ button jisse vendor select hone ke baad bhi hata sake
const NewImageThumbnails = ({ files, onRemove }) => {
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        const urls = (files || []).map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);

        // Memory leak na ho isliye object URLs cleanup karo jab files badle/unmount ho
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    if (!files || files.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {previewUrls.map((url, idx) => (
                <div key={url} className="relative">
                    <img src={url} alt="" className="h-14 w-14 rounded object-cover" />
                    <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

const ProductFormModal = ({ isEditMode, onClose }) => {
    const effectRan = useRef(false);

    const dispatch = useDispatch();
    const { current, categories, formLoading, formError } = useSelector((state) => state.product);

    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [tags, setTags] = useState("");

    const [productImageFile, setProductImageFile] = useState(null);
    const [deleteProductImage, setDeleteProductImage] = useState(false);

    // Existing variants (edit mode) - har ek me id hota hai
    const [existingVariants, setExistingVariants] = useState([]);
    // Naye variants (create mode ya edit ke dauraan add kiye gaye)
    const [newVariants, setNewVariants] = useState(isEditMode ? [] : [emptyVariant()]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);

    useEffect(() => {
        dispatch(fetchCategoryTree());
    }, [dispatch]);

    useEffect(() => {
        if (isEditMode && current) {
            setProductName(current.productName || "");
            setDescription(current.description || "");
            setCategoryId(String(current.categoryId || ""));
            setSubCategoryId(String(current.subCategoryId || ""));
            setTags((current.tags || []).join(", "));
            setExistingVariants(
                (current.variants || []).map((v) => ({
                    id: v.id,
                    description: v.description || "",
                    mrp: v.mrp,
                    vendorMinPrice: v.vendorMinPrice,
                    stock: v.stock, // 👈 sirf dikhane ke liye, edit nahi hoga
                    tags: (v.tags || []).join(", "),
                    attributes: attributesObjectToRows(v.attributes),
                    isDelete: v.isDelete,
                    images: v.images || [],
                    newImages: [],
                    isDefault: v.isDefault || false, // 👈 backend se jo default variant aaya hai wahi checked dikhega
                }))
            );
        }
    }, [isEditMode, current]);




    useEffect(() => {
        if (effectRan.current) return;

        effectRan.current = true;

        setNewVariants((prev) =>
            prev.map((v) => ({
                ...v,
                attributes: [
                    ...v.attributes,
                    emptyAttributeRow(),
                ],
            }))
        );
    }, []);

    const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));

    // ---------------- Variant helpers ----------------
    const addNewVariant = () => setNewVariants((prev) => [...prev, emptyVariant()]);

    const removeNewVariant = (key) =>
        setNewVariants((prev) => prev.filter((v) => v._key !== key));

    const updateNewVariant = (key, field, value) =>
        setNewVariants((prev) =>
            prev.map((v) => (v._key === key ? { ...v, [field]: value } : v))
        );

    const updateExistingVariant = (id, field, value) =>
        setExistingVariants((prev) =>
            prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );

    // ---------------- Default variant helper ----------------
    // Existing aur new variants dono ko milakar sirf EK hi variant ka
    // isDefault true rahega - baaki sab (dusre existing + saare new) false ho jayenge.
    // type: "existing" | "new", identifier: existing ke liye variant.id, new ke liye variant._key
    const setDefaultVariant = (type, identifier) => {
        setExistingVariants((prev) =>
            prev.map((v) => ({
                ...v,
                isDefault: type === "existing" && v.id === identifier,
            }))
        );
        setNewVariants((prev) =>
            prev.map((v) => ({
                ...v,
                isDefault: type === "new" && v._key === identifier,
            }))
        );
    };

    // Checkbox par click: check kiya toh isko default banao (baaki sab hatao),
    // uncheck kiya toh sirf isi ko false karo (koi default nahi rahega)
    const handleDefaultCheckboxChange = (type, identifier, checked) => {
        if (checked) {
            setDefaultVariant(type, identifier);
        } else if (type === "existing") {
            updateExistingVariant(identifier, "isDefault", false);
        } else {
            updateNewVariant(identifier, "isDefault", false);
        }
    };

    // ---------------- Attribute helpers (existing variant) ----------------
    const addExistingAttribute = (variantId) =>
        setExistingVariants((prev) =>
            prev.map((v) =>
                v.id === variantId
                    ? { ...v, attributes: [...v.attributes, emptyAttributeRow()] }
                    : v
            )
        );

    const removeExistingAttribute = (variantId, rowKey) =>
        setExistingVariants((prev) =>
            prev.map((v) =>
                v.id === variantId
                    ? { ...v, attributes: v.attributes.filter((a) => a._key !== rowKey) }
                    : v
            )
        );

    const updateExistingAttribute = (variantId, rowKey, field, value) =>
        setExistingVariants((prev) =>
            prev.map((v) =>
                v.id === variantId
                    ? {
                        ...v,
                        attributes: v.attributes.map((a) =>
                            a._key === rowKey ? { ...a, [field]: value } : a
                        ),
                    }
                    : v
            )
        );

    // ---------------- Attribute helpers (new variant) ----------------
    const addNewVariantAttribute = (variantKey) =>
        setNewVariants((prev) =>
            prev.map((v) =>
                v._key === variantKey
                    ? { ...v, attributes: [...v.attributes, emptyAttributeRow()] }
                    : v
            )
        );

    const removeNewVariantAttribute = (variantKey, rowKey) =>
        setNewVariants((prev) =>
            prev.map((v) =>
                v._key === variantKey
                    ? { ...v, attributes: v.attributes.filter((a) => a._key !== rowKey) }
                    : v
            )
        );

    const updateNewVariantAttribute = (variantKey, rowKey, field, value) =>
        setNewVariants((prev) =>
            prev.map((v) =>
                v._key === variantKey
                    ? {
                        ...v,
                        attributes: v.attributes.map((a) =>
                            a._key === rowKey ? { ...a, [field]: value } : a
                        ),
                    }
                    : v
            )
        );

    // ---------------- Image helpers ----------------
    // Naya file select hone par PURANI selection ke sath merge karte hai
    // (replace nahi), taaki do baar "Choose Files" karne par pehli baar
    // ki images gayab na ho jaye
    const addExistingVariantImages = (variantId, fileList) => {
        const files = Array.from(fileList);
        setExistingVariants((prev) =>
            prev.map((v) =>
                v.id === variantId ? { ...v, newImages: [...v.newImages, ...files] } : v
            )
        );
    };

    const removeExistingVariantNewImage = (variantId, idx) =>
        setExistingVariants((prev) =>
            prev.map((v) =>
                v.id === variantId
                    ? { ...v, newImages: v.newImages.filter((_, i) => i !== idx) }
                    : v
            )
        );

    const addNewVariantImages = (variantKey, fileList) => {
        const files = Array.from(fileList);
        setNewVariants((prev) =>
            prev.map((v) =>
                v._key === variantKey ? { ...v, newImages: [...v.newImages, ...files] } : v
            )
        );
    };

    const removeNewVariantImage = (variantKey, idx) =>
        setNewVariants((prev) =>
            prev.map((v) =>
                v._key === variantKey
                    ? { ...v, newImages: v.newImages.filter((_, i) => i !== idx) }
                    : v
            )
        );

    const markImageForDelete = (imageId) =>
        setDeleteImageIds((prev) => [...prev, imageId]);

    const handleToggleVariantDelete = (variantId) => {
        dispatch(toggleVariantDelete({ variantId, productId: current.id }));
    };

    // ---------------- Submit ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("productName", productName);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("subCategoryId", subCategoryId);
        formData.append(
            "tags",
            JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))
        );

        if (productImageFile) {
            formData.append("productImage", productImageFile);
        }
        if (isEditMode && deleteProductImage) {
            formData.append("deleteProductImage", "true");
        }

        // ------- variants array banao (order = existing pehle, phir new) -------
        const variantsPayload = [];

        existingVariants.forEach((v) => {
            variantsPayload.push({
                id: v.id,
                description: v.description,
                mrp: v.mrp,
                vendorMinPrice: v.vendorMinPrice,
                // 👈 stock jaan-bujh kar NAHI bhej rahe -> backend existing stock as-is rakhega
                tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
                attributes: attributeRowsToObject(v.attributes),
                isDefault: v.isDefault, // 👈 kaunsa variant default hai
            });
        });

        newVariants.forEach((v, idx) => {
            variantsPayload.push({
                tempId: `new_${idx}`,
                description: v.description,
                mrp: v.mrp,
                vendorMinPrice: v.vendorMinPrice,
                stock: v.stock || 0, // 👈 sirf naye variant ke liye stock allowed hai
                tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
                attributes: attributeRowsToObject(v.attributes),
                isDefault: v.isDefault, // 👈 kaunsa variant default hai

            });

            v.newImages.forEach((file) => {
                formData.append(`variant_image_new_${idx}`, file);
            });
        });

        formData.append("variants", JSON.stringify(variantsPayload));

        // ------- existing variant ki nayi images -------
        existingVariants.forEach((v) => {
            v.newImages.forEach((file) => {
                formData.append(`variant_image_${v.id}`, file);
            });
        });

        if (deleteImageIds.length > 0) {
            formData.append("deleteImageIds", JSON.stringify(deleteImageIds));
        }

        if (isEditMode) {
            await dispatch(updateProduct({ id: current.id, formData }));
        } else {
            await dispatch(createProduct(formData));
        }

        onClose();
        dispatch(clearCurrentProduct());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-stone-800">
                        {isEditMode ? "Product Update Karo" : "Naya Product Add Karo"}
                    </h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
                        ✕
                    </button>
                </div>

                {formError && (
                    <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {formError}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ---------------- Basic Info ---------------- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-stone-600">Product Name</label>
                            <input
                                required
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-stone-600">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-stone-600">Category</label>
                            <select
                                required
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setSubCategoryId("");
                                }}
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.productCategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-stone-600">Sub Category</label>
                            <select
                                required
                                value={subCategoryId}
                                onChange={(e) => setSubCategoryId(e.target.value)}
                                disabled={!selectedCategory}
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100"
                            >
                                <option value="">Select sub category</option>
                                {selectedCategory?.subCategories?.map((sc) => (
                                    <option key={sc.id} value={sc.id}>
                                        {sc.productSubCategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-stone-600">
                                Tags (comma se alag karo)
                            </label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. summer, cotton, trending"
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1 block text-sm text-stone-600">Product Image</label>

                            {/* Existing (already saved) image */}
                            {isEditMode && current?.imageUrl && !deleteProductImage && !productImageFile && (
                                <div className="mb-2 flex items-center gap-3">
                                    <img
                                        src={current.imageUrl}
                                        alt="product"
                                        className="h-16 w-16 rounded-md object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setDeleteProductImage(true)}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            )}

                            {/* Newly selected (not yet uploaded) image - ab preview + remove dono milte hai */}
                            <NewImageThumbnails
                                files={productImageFile ? [productImageFile] : []}
                                onRemove={() => setProductImageFile(null)}
                            />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        setProductImageFile(e.target.files[0]);
                                        setDeleteProductImage(false);
                                    }
                                    e.target.value = ""; // 👈 taaki wahi file dobara select ho sake agar zaroorat pade
                                }}
                                className="mt-2 w-full text-sm"
                            />
                        </div>
                    </div>

                    {/* ---------------- Existing Variants (edit mode) ---------------- */}
                    {isEditMode && existingVariants.length > 0 && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-stone-700">
                                Existing Variants
                            </p>
                            <div className="space-y-3">
                                {existingVariants.map((v) => (
                                    <div
                                        key={v.id}
                                        className={`rounded-md border p-3 ${v.isDelete ? "border-red-200 bg-red-50" : "border-stone-200"
                                            }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs text-stone-400">
                                                Variant #{v.id} {v.isDelete && "(deleted)"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVariantDelete(v.id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                {v.isDelete ? "Restore" : "Delete"}
                                            </button>
                                        </div>

                                        {/* 👇 Default Variant Checkbox */}
                                        <label className="mb-2 flex items-center gap-1.5 text-xs text-stone-600">
                                            <input
                                                type="checkbox"
                                                checked={v.isDefault}
                                                onChange={(e) =>
                                                    handleDefaultCheckboxChange(
                                                        "existing",
                                                        v.id,
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-3.5 w-3.5 rounded border-stone-300"
                                            />
                                            Default Variant
                                        </label>

                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                placeholder="Description"
                                                value={v.description}
                                                onChange={(e) =>
                                                    updateExistingVariant(v.id, "description", e.target.value)
                                                }
                                                className="col-span-3 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                            />
                                            <input
                                                placeholder="MRP"
                                                type="number"
                                                value={v.mrp}
                                                onChange={(e) =>
                                                    updateExistingVariant(v.id, "mrp", e.target.value)
                                                }
                                                className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                            />
                                            <input
                                                placeholder="Vendor Min Price"
                                                type="number"
                                                value={v.vendorMinPrice}
                                                onChange={(e) =>
                                                    updateExistingVariant(
                                                        v.id,
                                                        "vendorMinPrice",
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                            />
                                            <input
                                                disabled
                                                title="Ek baar add hone ke baad quantity yaha se update nahi hoti"
                                                value={v.stock}
                                                className="rounded-md border border-stone-200 bg-stone-100 px-2 py-1.5 text-sm text-stone-400"
                                            />
                                        </div>

                                        {/* 👇 Variant Tags */}
                                        <input
                                            placeholder="Variant Tags (comma separated)"
                                            value={v.tags}
                                            onChange={(e) =>
                                                updateExistingVariant(v.id, "tags", e.target.value)
                                            }
                                            className="mt-2 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                        />

                                        {/* 👇 Variant Attributes (key-value) */}
                                        <AttributeEditor
                                            rows={v.attributes}
                                            onAdd={() => addExistingAttribute(v.id)}
                                            onRemove={(rowKey) => removeExistingAttribute(v.id, rowKey)}
                                            onChange={(rowKey, field, value) =>
                                                updateExistingAttribute(v.id, rowKey, field, value)
                                            }
                                        />

                                        {/* Existing (already saved) images */}
                                        {v.images.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {v.images
                                                    .filter((img) => !deleteImageIds.includes(img.id))
                                                    .map((img) => (
                                                        <div key={img.id} className="relative">
                                                            <img
                                                                src={img.imageUrl}
                                                                alt=""
                                                                className="h-14 w-14 rounded object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => markImageForDelete(img.id)}
                                                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Newly selected (not yet uploaded) images */}
                                        <NewImageThumbnails
                                            files={v.newImages}
                                            onRemove={(idx) => removeExistingVariantNewImage(v.id, idx)}
                                        />

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                addExistingVariantImages(v.id, e.target.files);
                                                e.target.value = "";
                                            }}
                                            className="mt-2 w-full text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ---------------- New Variants ---------------- */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-stone-700">
                                {isEditMode ? "Naye Variants Add Karo" : "Variants"}
                            </p>
                            <button
                                type="button"
                                onClick={addNewVariant}
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                + Variant Add Karo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {newVariants.map((v) => (
                                <div key={v._key} className="rounded-md border border-stone-200 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        {/* 👇 Default Variant Checkbox */}
                                        <label className="flex items-center gap-1.5 text-xs text-stone-600">
                                            <input
                                                type="checkbox"
                                                checked={v.isDefault}
                                                onChange={(e) =>
                                                    handleDefaultCheckboxChange(
                                                        "new",
                                                        v._key,
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-3.5 w-3.5 rounded border-stone-300"
                                            />
                                            Default Variant
                                        </label>

                                        {newVariants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeNewVariant(v._key)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            placeholder="Description"
                                            value={v.description}
                                            onChange={(e) =>
                                                updateNewVariant(v._key, "description", e.target.value)
                                            }
                                            className="col-span-3 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                        />
                                        <input
                                            required
                                            placeholder="MRP"
                                            type="number"
                                            value={v.mrp}
                                            onChange={(e) => updateNewVariant(v._key, "mrp", e.target.value)}
                                            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                        />
                                        <input
                                            required
                                            placeholder="Vendor Min Price"
                                            type="number"
                                            value={v.vendorMinPrice}
                                            onChange={(e) =>
                                                updateNewVariant(v._key, "vendorMinPrice", e.target.value)
                                            }
                                            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                        />
                                        <input
                                            required
                                            placeholder="Stock"
                                            type="number"
                                            value={v.stock}
                                            onChange={(e) => updateNewVariant(v._key, "stock", e.target.value)}
                                            className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                        />
                                    </div>

                                    {/* 👇 Variant Tags */}
                                    <input
                                        placeholder="Variant Tags (comma separated)"
                                        value={v.tags}
                                        onChange={(e) => updateNewVariant(v._key, "tags", e.target.value)}
                                        className="mt-2 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                                    />

                                    {/* 👇 Variant Attributes (key-value) */}
                                    <AttributeEditor
                                        rows={v.attributes}
                                        onAdd={() => addNewVariantAttribute(v._key)}
                                        onRemove={(rowKey) => removeNewVariantAttribute(v._key, rowKey)}
                                        onChange={(rowKey, field, value) =>
                                            updateNewVariantAttribute(v._key, rowKey, field, value)
                                        }
                                    />

                                    {/* Newly selected (not yet uploaded) images */}
                                    <NewImageThumbnails
                                        files={v.newImages}
                                        onRemove={(idx) => removeNewVariantImage(v._key, idx)}
                                    />

                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            addNewVariantImages(v._key, e.target.files);
                                            e.target.value = "";
                                        }}
                                        className="mt-2 w-full text-xs"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* 👇 Note ke roop me batate hai ki actual selling price admin set karega */}
                        <p className="mt-2 text-xs text-stone-400">
                            Note: Final selling price (actual price) admin apni taraf se set karta hai.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {formLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;