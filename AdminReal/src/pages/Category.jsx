// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Plus, Pencil, Power, X } from "lucide-react";
// import {
//     fetchAllCategory,
//     createCategory,
//     updateCategory,
//     toggleCategoryDelete
// } from "../redux/slices/categorySlice";

// function Category() {

//     const dispatch = useDispatch();

//     const { categories, pagination, loading, formLoading } = useSelector(
//         (state) => state.category
//     );

//     // ---- list controls ----
//     const [page, setPage] = useState(1);
//     const [statusFilter, setStatusFilter] = useState("active"); // active | inactive | all
//     const limit = 10;

//     // ---- modal / form state ----
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingId, setEditingId] = useState(null);
//     const [name, setName] = useState("");
//     const [tagsInput, setTagsInput] = useState("");
//     const [imageFile, setImageFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState(null);
//     const [formError, setFormError] = useState("");

//     useEffect(() => {
//         dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
//     }, [dispatch, page, statusFilter]);

//     const resetForm = () => {
//         setEditingId(null);
//         setName("");
//         setTagsInput("");
//         setImageFile(null);
//         setImagePreview(null);
//         setFormError("");
//     };

//     const openCreateModal = () => {
//         resetForm();
//         setIsModalOpen(true);
//     };

//     const openEditModal = (cat) => {
//         setEditingId(cat.id);
//         setName(cat.productCategoryName);
//         setTagsInput(Array.isArray(cat.tags) ? cat.tags.join(", ") : "");
//         setImageFile(null);
//         setImagePreview(cat.imageUrl || null);
//         setFormError("");
//         setIsModalOpen(true);
//     };

//     const closeModal = () => {
//         setIsModalOpen(false);
//         resetForm();
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setImageFile(file);
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!name.trim()) {
//             setFormError("Category Name is required");
//             return;
//         }

//         const tagsArray = tagsInput
//             .split(",")
//             .map((t) => t.trim())
//             .filter(Boolean);

//         const fd = new FormData();
//         fd.append("productCategoryName", name.trim());
//         fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
//         if (imageFile) {
//             fd.append("image", imageFile);
//         }

//         try {
//             if (editingId) {
//                 await dispatch(
//                     updateCategory({ id: editingId, formData: fd })
//                 ).unwrap();
//             } else {
//                 await dispatch(createCategory(fd)).unwrap();
//             }

//             closeModal();
//             dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
//         } catch (err) {
//             setFormError(err || "Something went wrong");
//         }
//     };

//     const handleToggleStatus = async (id) => {
//         try {
//             await dispatch(toggleCategoryDelete(id)).unwrap();
//             dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
//         } catch (err) {
//             console.error("Toggle status error:", err);
//         }
//     };

//     return (
//         <div>

//             {/* HEADER */}
//             <div className="flex items-center justify-between mb-4">
//                 <h1 className="text-xl font-semibold">Product Categories</h1>

//                 <button
//                     onClick={openCreateModal}
//                     className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
//                 >
//                     <Plus size={18} />
//                     Add Category
//                 </button>
//             </div>

//             {/* STATUS FILTER */}
//             <div className="flex gap-2 mb-4">
//                 {["active", "inactive", "all"].map((s) => (
//                     <button
//                         key={s}
//                         onClick={() => {
//                             setStatusFilter(s);
//                             setPage(1);
//                         }}
//                         className={`px-4 py-1.5 rounded-full text-sm capitalize border ${statusFilter === s
//                                 ? "bg-black text-white border-black"
//                                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
//                             }`}
//                     >
//                         {s}
//                     </button>
//                 ))}
//             </div>

//             {/* TABLE */}
//             <div className="bg-white rounded-lg border overflow-x-auto">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b">
//                         <tr>
//                             <th className="text-left p-3">Image</th>
//                             <th className="text-left p-3">Name</th>
//                             <th className="text-left p-3">Tags</th>
//                             <th className="text-left p-3">Products</th>
//                             <th className="text-left p-3">Sub Categories</th>
//                             <th className="text-left p-3">Status</th>
//                             <th className="text-left p-3">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={7} className="text-center p-6 text-gray-500">
//                                     Loading...
//                                 </td>
//                             </tr>
//                         ) : categories.length === 0 ? (
//                             <tr>
//                                 <td colSpan={7} className="text-center p-6 text-gray-500">
//                                     No categories found
//                                 </td>
//                             </tr>
//                         ) : (
//                             categories.map((cat) => (
//                                 <tr key={cat.id} className="border-b last:border-0">
//                                     <td className="p-3">
//                                         {cat.imageUrl ? (
//                                             <img
//                                                 src={cat.imageUrl}
//                                                 alt={cat.productCategoryName}
//                                                 className="w-10 h-10 rounded object-cover"
//                                             />
//                                         ) : (
//                                             <div className="w-10 h-10 rounded bg-gray-100" />
//                                         )}
//                                     </td>
//                                     <td className="p-3 capitalize">{cat.productCategoryName}</td>
//                                     <td className="p-3">
//                                         {Array.isArray(cat.tags) && cat.tags.length > 0
//                                             ? cat.tags.join(", ")
//                                             : "-"}
//                                     </td>
//                                     <td className="p-3">{cat._count?.products ?? 0}</td>
//                                     <td className="p-3">{cat._count?.subCategories ?? 0}</td>
//                                     <td className="p-3">
//                                         <span
//                                             className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isDelete
//                                                     ? "bg-red-100 text-red-700"
//                                                     : "bg-green-100 text-green-700"
//                                                 }`}
//                                         >
//                                             {cat.isDelete ? "Inactive" : "Active"}
//                                         </span>
//                                     </td>
//                                     <td className="p-3">
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={() => openEditModal(cat)}
//                                                 className="p-2 rounded-lg hover:bg-gray-100"
//                                                 title="Edit"
//                                             >
//                                                 <Pencil size={16} />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleToggleStatus(cat.id)}
//                                                 className={`p-2 rounded-lg hover:bg-gray-100 ${cat.isDelete ? "text-green-600" : "text-red-600"
//                                                     }`}
//                                                 title={cat.isDelete ? "Activate" : "Deactivate"}
//                                             >
//                                                 <Power size={16} />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* PAGINATION */}
//             {pagination && pagination.totalPages > 1 && (
//                 <div className="flex items-center justify-between mt-4">
//                     <span className="text-sm text-gray-500">
//                         Page {pagination.currentPage} of {pagination.totalPages}
//                     </span>
//                     <div className="flex gap-2">
//                         <button
//                             disabled={!pagination.hasPreviousPage}
//                             onClick={() => setPage((p) => p - 1)}
//                             className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
//                         >
//                             Previous
//                         </button>
//                         <button
//                             disabled={!pagination.hasNextPage}
//                             onClick={() => setPage((p) => p + 1)}
//                             className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* CREATE / EDIT MODAL */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
//                         <button
//                             onClick={closeModal}
//                             className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
//                         >
//                             <X size={20} />
//                         </button>

//                         <h2 className="text-lg font-semibold mb-4">
//                             {editingId ? "Edit Category" : "Add Category"}
//                         </h2>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                     Category Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={name}
//                                     onChange={(e) => setName(e.target.value)}
//                                     className="w-full border rounded-lg px-3 py-2 text-sm"
//                                     placeholder="e.g. Vegetables"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                     Tags (comma separated)
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={tagsInput}
//                                     onChange={(e) => setTagsInput(e.target.value)}
//                                     className="w-full border rounded-lg px-3 py-2 text-sm"
//                                     placeholder="fresh, organic, seasonal"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                     Image
//                                 </label>
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleImageChange}
//                                     className="w-full text-sm"
//                                 />
//                                 {imagePreview && (
//                                     <img
//                                         src={imagePreview}
//                                         alt="preview"
//                                         className="w-16 h-16 rounded object-cover mt-2"
//                                     />
//                                 )}
//                             </div>

//                             {formError && (
//                                 <p className="text-sm text-red-600">{formError}</p>
//                             )}

//                             <button
//                                 type="submit"
//                                 disabled={formLoading}
//                                 className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60"
//                             >
//                                 {formLoading
//                                     ? "Saving..."
//                                     : editingId
//                                         ? "Update Category"
//                                         : "Create Category"}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// }

// export default Category;


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Power, X } from "lucide-react";
import {
    fetchAllCategory,
    createCategory,
    updateCategory,
    toggleCategoryDelete
} from "../redux/slices/categorySlice";

function Category() {

    const dispatch = useDispatch();

    const { categories, pagination, loading, formLoading } = useSelector(
        (state) => state.category
    );

    // ---- list controls ----
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("active"); // active | inactive | all
    const limit = 10;

    // ---- modal / form state ----
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
    }, [dispatch, page, statusFilter]);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setTagsInput("");
        setImageFile(null);
        setImagePreview(null);
        setFormError("");
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingId(cat.id);
        setName(cat.productCategoryName);
        setTagsInput(Array.isArray(cat.tags) ? cat.tags.join(", ") : "");
        setImageFile(null);
        setImagePreview(cat.imageUrl || null);
        setFormError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setFormError("Category Name is required");
            return;
        }

        const tagsArray = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const fd = new FormData();
        fd.append("productCategoryName", name.trim());
        fd.append("tags", tagsArray.length ? JSON.stringify(tagsArray) : "");
        if (imageFile) {
            fd.append("image", imageFile);
        }

        try {
            if (editingId) {
                await dispatch(
                    updateCategory({ id: editingId, formData: fd })
                ).unwrap();
            } else {
                await dispatch(createCategory(fd)).unwrap();
            }

            closeModal();
            dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
        } catch (err) {
            setFormError(err || "Something went wrong");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleCategoryDelete(id)).unwrap();
            dispatch(fetchAllCategory({ page, limit, status: statusFilter }));
        } catch (err) {
            console.error("Toggle status error:", err);
        }
    };

    return (
        <div>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Product Categories</h1>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {/* STATUS FILTER */}
            <div className="flex gap-2 mb-4">
                {["active", "inactive", "all"].map((s) => (
                    <button
                        key={s}
                        onClick={() => {
                            setStatusFilter(s);
                            setPage(1);
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm capitalize border ${statusFilter === s
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-3">Image</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Tags</th>
                            <th className="text-left p-3">Products</th>
                            <th className="text-left p-3">Sub Categories</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center p-6 text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : categories.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-6 text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="border-b last:border-0">
                                    <td className="p-3">
                                        {cat.imageUrl ? (
                                            <img
                                                src={cat.imageUrl}
                                                alt={cat.productCategoryName}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100" />
                                        )}
                                    </td>
                                    <td className="p-3 capitalize">{cat.productCategoryName}</td>
                                    <td className="p-3">
                                        {Array.isArray(cat.tags) && cat.tags.length > 0
                                            ? cat.tags.join(", ")
                                            : "-"}
                                    </td>
                                    <td className="p-3">{cat._count?.products ?? 0}</td>
                                    <td className="p-3">{cat._count?.subCategories ?? 0}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isDelete
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {cat.isDelete ? "Inactive" : "Active"}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(cat)}
                                                className="p-2 rounded-lg hover:bg-gray-100"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(cat.id)}
                                                className={`p-2 rounded-lg hover:bg-gray-100 ${cat.isDelete ? "text-green-600" : "text-red-600"
                                                    }`}
                                                title={cat.isDelete ? "Activate" : "Deactivate"}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.hasPreviousPage}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <button
                            disabled={!pagination.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                            {editingId ? "Edit Category" : "Add Category"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    placeholder="e.g. Vegetables"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    placeholder="fresh, organic, seasonal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-sm"
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="preview"
                                        className="w-16 h-16 rounded object-cover mt-2"
                                    />
                                )}
                            </div>

                            {formError && (
                                <p className="text-sm text-red-600">{formError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-60"
                            >
                                {formLoading
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Category"
                                        : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Category;