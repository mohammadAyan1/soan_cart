import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Power,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle,
    Eye,
    Type,
    Link as LinkIcon,
    Layers,
    Tag,
    Package
} from "lucide-react";
import api from "../api/api";

export default function Banners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Dynamic dropdown data
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProductVariants, setSelectedProductVariants] = useState([]);

    // Form fields
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Text Overlay Styling
    const [overlayText, setOverlayText] = useState("");
    const [textSize, setTextSize] = useState(24);
    const [isBold, setIsBold] = useState(true);
    const [textColor, setTextColor] = useState("#FFFFFF");
    const [textPosition, setTextPosition] = useState("BOTTOM_LEFT");

    // Target Link
    const [targetType, setTargetType] = useState("CATEGORY"); // CATEGORY | SUB_CATEGORY | PRODUCT | VARIANT
    const [targetId, setTargetId] = useState("");
    const [targetName, setTargetName] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(""); // For VARIANT target

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/banners/admin");
            if (res.data?.success) {
                setBanners(res.data.data || []);
            }
        } catch (err) {
            console.error("fetchBanners error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [catRes, subRes, prodRes] = await Promise.allSettled([
                api.get("/api/product-category/get-all?limit=200"),
                api.get("/api/product-sub-category/get-all?limit=200"),
                api.get("/api/product/getall/admin?limit=200")
            ]);

            if (catRes.status === "fulfilled" && catRes.value.data?.data) {
                setCategories(catRes.value.data.data || []);
            }
            if (subRes.status === "fulfilled" && subRes.value.data?.data) {
                setSubCategories(subRes.value.data.data || []);
            }
            if (prodRes.status === "fulfilled" && prodRes.value.data?.data) {
                setProducts(prodRes.value.data.data?.products || prodRes.value.data.data || []);
            }
        } catch (err) {
            console.error("fetchDropdownData error:", err);
        }
    };

    useEffect(() => {
        fetchBanners();
        fetchDropdownData();
    }, []);

    const resetForm = () => {
        setTitle("");
        setSubtitle("");
        setImageFile(null);
        setImagePreview(null);
        setOverlayText("");
        setTextSize(24);
        setIsBold(true);
        setTextColor("#FFFFFF");
        setTextPosition("BOTTOM_LEFT");
        setTargetType("CATEGORY");
        setTargetId("");
        setTargetName("");
        setSelectedProductId("");
        setSelectedProductVariants([]);
        setFormError("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleTargetTypeChange = (type) => {
        setTargetType(type);
        setTargetId("");
        setTargetName("");
        setSelectedProductId("");
        setSelectedProductVariants([]);
    };

    const handleProductSelectForVariant = (productId) => {
        setSelectedProductId(productId);
        const prod = products.find((p) => String(p.id) === String(productId));
        if (prod && Array.isArray(prod.variants)) {
            setSelectedProductVariants(prod.variants);
        } else {
            setSelectedProductVariants([]);
        }
    };

    const handleCreateBanner = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!imageFile) {
            setFormError("Please select a banner image.");
            return;
        }

        if (!targetId) {
            setFormError(`Please select a ${targetType.toLowerCase().replace("_", " ")} to link this banner to.`);
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("title", title || "");
        formData.append("subtitle", subtitle || "");
        formData.append("text", overlayText || "");
        formData.append("textSize", String(textSize));
        formData.append("isBold", String(isBold));
        formData.append("textColor", textColor);
        formData.append("textPosition", textPosition);
        formData.append("targetType", targetType);
        formData.append("targetId", String(targetId));
        if (targetType === "VARIANT" && selectedProductId) {
            formData.append("productId", String(selectedProductId));
        }
        formData.append("targetName", targetName || "");

        try {
            setActionLoading(true);
            const res = await api.post("/api/banners", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data?.success) {
                setSuccessMsg("Hero banner created successfully!");
                setIsModalOpen(false);
                resetForm();
                fetchBanners();
                setTimeout(() => setSuccessMsg(""), 4000);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create banner");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.patch(`/api/banners/${id}/status`);
            if (res.data?.success) {
                setBanners((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
                );
            }
        } catch (err) {
            console.error("toggleBanner error:", err);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        try {
            const res = await api.delete(`/api/banners/${id}`);
            if (res.data?.success) {
                setBanners((prev) => prev.filter((b) => b.id !== id));
            }
        } catch (err) {
            console.error("deleteBanner error:", err);
        }
    };

    // Helper for text alignment classes
    const getPositionClasses = (pos) => {
        switch (pos) {
            case "TOP_LEFT":
                return "top-4 left-4 text-left items-start";
            case "CENTER":
                return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center";
            case "BOTTOM_CENTER":
                return "bottom-4 left-1/2 -translate-x-1/2 text-center items-center";
            case "BOTTOM_LEFT":
            default:
                return "bottom-4 left-4 text-left items-start";
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="text-emerald-600" /> Hero Section Banners
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage home screen sliding hero banners, customizable overlay text, and dynamic navigation links (Category, Subcategory, Product, Variant).
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
                >
                    <Plus size={18} /> Add Hero Banner
                </button>
            </div>

            {/* Notification alert */}
            {successMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">
                    <CheckCircle size={18} />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Banners Grid */}
            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading banners...</div>
            ) : banners.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-300 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-gray-800">No Hero Banners Added Yet</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        Click "Add Hero Banner" to upload promotional images and link them to categories or products.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((b) => (
                        <div
                            key={b.id}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md ${
                                b.isActive ? "border-gray-200" : "border-red-200 opacity-70"
                            }`}
                        >
                            {/* Banner Preview Card with Aspect Ratio 16:7 */}
                            <div className="relative w-full aspect-[16/7] bg-gray-900 overflow-hidden group">
                                <img
                                    src={b.imageUrl}
                                    alt={b.title || "Hero Banner"}
                                    className="w-full h-full object-cover"
                                />

                                {/* Dark overlay gradient for readable text */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                                {/* Custom Text Overlay */}
                                {b.text && (
                                    <div
                                        className={`absolute pointer-events-none p-3 max-w-[85%] ${getPositionClasses(
                                            b.textPosition
                                        )}`}
                                    >
                                        <p
                                            style={{
                                                color: b.textColor || "#FFFFFF",
                                                fontSize: `${Math.max(14, Math.min(26, b.textSize * 0.85))}px`,
                                                fontWeight: b.isBold ? "700" : "400",
                                                textShadow: "0 2px 4px rgba(0,0,0,0.8)"
                                            }}
                                            className="leading-tight"
                                        >
                                            {b.text}
                                        </p>
                                    </div>
                                )}

                                {/* Status badge */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                            b.isActive
                                                ? "bg-emerald-500 text-white"
                                                : "bg-red-500 text-white"
                                        }`}
                                    >
                                        {b.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {/* Details and Actions */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                                            <LinkIcon size={12} /> {b.targetType}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-700 truncate">
                                            {b.targetName ? `Target: ${b.targetName}` : `ID: #${b.targetId}`}
                                        </span>
                                    </div>

                                    {b.title && (
                                        <h4 className="text-base font-bold text-gray-800">{b.title}</h4>
                                    )}
                                    {b.subtitle && (
                                        <p className="text-xs text-gray-500">{b.subtitle}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleToggleStatus(b.id)}
                                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                                            b.isActive
                                                ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                        }`}
                                    >
                                        <Power size={13} />
                                        {b.isActive ? "Deactivate" : "Activate"}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteBanner(b.id)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                                        title="Delete Banner"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Creating Banner */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Create Hero Section Banner</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            Configure image, overlay text styling, and navigation target.
                        </p>

                        {formError && (
                            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                                <AlertCircle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateBanner} className="space-y-5">
                            {/* Image Upload and Dimension Guide */}
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                                <div className="flex items-start gap-2">
                                    <ImageIcon className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">
                                            Banner Image & Recommended Dimensions
                                        </h4>
                                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                                            📏 Recommended Size: <span className="underline font-bold">1200 x 500 px</span> (Aspect Ratio 16:7 / 2.4:1).
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            The mobile app will display this in an adaptive container so no content is cropped or distorted.
                                        </p>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                                    required
                                />

                                {/* Live Image Preview with Overlay */}
                                {imagePreview && (
                                    <div className="mt-3 relative w-full aspect-[16/7] bg-gray-950 rounded-xl overflow-hidden border border-gray-300 shadow-inner">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                                        {overlayText && (
                                            <div
                                                className={`absolute pointer-events-none p-3 max-w-[85%] ${getPositionClasses(
                                                    textPosition
                                                )}`}
                                            >
                                                <p
                                                    style={{
                                                        color: textColor,
                                                        fontSize: `${textSize}px`,
                                                        fontWeight: isBold ? "700" : "400",
                                                        textShadow: "0 2px 4px rgba(0,0,0,0.8)"
                                                    }}
                                                    className="leading-tight"
                                                >
                                                    {overlayText}
                                                </p>
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                                            Live Mobile Preview
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Text Overlay Customization */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                                    <Type size={16} /> Custom Text Overlay on Image
                                </h4>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Text to Display (Appears on top of banner)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 50% OFF Fresh Vegetables Today!"
                                        value={overlayText}
                                        onChange={(e) => setOverlayText(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Text Size */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Font Size (px)</label>
                                        <select
                                            value={textSize}
                                            onChange={(e) => setTextSize(Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                        >
                                            <option value={16}>Small (16px)</option>
                                            <option value={20}>Medium (20px)</option>
                                            <option value={24}>Large (24px)</option>
                                            <option value={28}>Extra Large (28px)</option>
                                            <option value={34}>Huge (34px)</option>
                                        </select>
                                    </div>

                                    {/* Text Bold */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsBold(!isBold)}
                                            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition ${
                                                isBold
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-white text-gray-700 border-gray-200"
                                            }`}
                                        >
                                            {isBold ? "Bold (Active)" : "Normal"}
                                        </button>
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={textColor}
                                                onChange={(e) => setTextColor(e.target.value)}
                                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono uppercase"
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target Navigation Section */}
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                                <h4 className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                                    <LinkIcon size={16} /> Click Navigation Target
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Select what opens when a user taps this hero banner in the mobile app.
                                </p>

                                {/* Target Type Selector Buttons */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { key: "CATEGORY", label: "Category", icon: Layers },
                                        { key: "SUB_CATEGORY", label: "Sub Category", icon: Tag },
                                        { key: "PRODUCT", label: "Product", icon: Package },
                                        { key: "VARIANT", label: "Specific Variant", icon: Tag }
                                    ].map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleTargetTypeChange(key)}
                                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                                                targetType === key
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <Icon size={14} />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Dropdown based on Target Type */}
                                {targetType === "CATEGORY" && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Select Category *
                                        </label>
                                        <select
                                            value={targetId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setTargetId(id);
                                                const cat = categories.find((c) => String(c.id) === String(id));
                                                setTargetName(cat?.productCategoryName || "");
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                                            required
                                        >
                                            <option value="">-- Choose Category --</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.productCategoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {targetType === "SUB_CATEGORY" && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Select Subcategory *
                                        </label>
                                        <select
                                            value={targetId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setTargetId(id);
                                                const sub = subCategories.find((s) => String(s.id) === String(id));
                                                setTargetName(sub?.subCategoryTitle || sub?.name || "");
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                                            required
                                        >
                                            <option value="">-- Choose Subcategory --</option>
                                            {subCategories.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.subCategoryTitle || s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {targetType === "PRODUCT" && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Select Product *
                                        </label>
                                        <select
                                            value={targetId}
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setTargetId(id);
                                                const p = products.find((prod) => String(prod.id) === String(id));
                                                setTargetName(p?.productName || "");
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                                            required
                                        >
                                            <option value="">-- Choose Product --</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.productName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {targetType === "VARIANT" && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                First Choose Product *
                                            </label>
                                            <select
                                                value={selectedProductId}
                                                onChange={(e) => handleProductSelectForVariant(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                                                required
                                            >
                                                <option value="">-- Choose Parent Product --</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.productName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Then Choose Variant *
                                            </label>
                                            <select
                                                value={targetId}
                                                onChange={(e) => {
                                                    const id = e.target.value;
                                                    setTargetId(id);
                                                    const v = selectedProductVariants.find(
                                                        (vr) => String(vr.id) === String(id)
                                                    );
                                                    setTargetName(
                                                        v ? `${v.title || v.packSize || v.unit} (₹${v.price})` : ""
                                                    );
                                                }}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                                                disabled={!selectedProductId}
                                                required
                                            >
                                                <option value="">
                                                    {selectedProductId
                                                        ? "-- Choose Variant --"
                                                        : "-- Select Product First --"}
                                                </option>
                                                {selectedProductVariants.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.title || v.packSize || v.unit || "Variant"} - ₹{v.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm disabled:opacity-50"
                                >
                                    {actionLoading ? "Uploading & Saving..." : "Publish Banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
