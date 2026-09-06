import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorProducts,
    fetchVendorProductById,
    toggleProductDelete,
    clearCurrentProduct,
} from "../redux/slices/productSlice";
import ProductFormModal from "../components/ProductFormModal";
import { formatINR } from "../utils/dateHelpers";

const ProductsPage = () => {
    const dispatch = useDispatch();
    const { items, loading, error, pagination, actionLoadingId } = useSelector(
        (state) => state.product
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchVendorProducts({ page, limit: 10 }));
    }, [dispatch, page]);

    const openCreate = () => {
        dispatch(clearCurrentProduct());
        setIsEditMode(false);
        setModalOpen(true);
    };

    const openEdit = async (id) => {
        await dispatch(fetchVendorProductById(id));
        setIsEditMode(true);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        dispatch(fetchVendorProducts({ page, limit: 10 }));
    };

    const defaultVariant = (product) =>
        product.variants?.find((v) => v.isDefault && !v.isDelete) || product.variants?.[0];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium text-stone-800">Products</h1>
                    <p className="mt-1 text-sm text-stone-500">Apne saare products manage karo</p>
                </div>
                <button
                    onClick={openCreate}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    + Product Add Karo
                </button>
            </div>

            {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loading && <p className="text-sm text-stone-400">Loading...</p>}

                {!loading && items.length === 0 && (
                    <p className="text-sm text-stone-400">Abhi tak koi product add nahi hua</p>
                )}

                {items.map((product) => {
                    const variant = defaultVariant(product);
                    return (
                        <div
                            key={product.id}
                            className={`rounded-lg border bg-white p-4 ${
                                product.isDelete ? "border-red-200 opacity-70" : "border-stone-200"
                            }`}
                        >
                            <div className="flex gap-3">
                                <img
                                    src={product.imageUrl || "https://placehold.co/64x64?text=Item"}
                                    alt=""
                                    className="h-16 w-16 rounded-md object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-stone-800">{product.productName}</p>
                                    <p className="mt-0.5 text-xs text-stone-500">
                                        {product.category?.productCategoryName} •{" "}
                                        {product.subCategory?.productSubCategoryName}
                                    </p>
                                    {variant && (
                                        <p className="mt-1 text-sm text-stone-600">
                                            Vendor Price: {formatINR(variant.vendorMinPrice)} · Stock:{" "}
                                            {variant.stock}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        product.isApprove
                                            ? "bg-green-50 text-green-700"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    {product.isApprove ? "Approved" : "Pending Approval"}
                                </span>

                                <div className="flex gap-3 text-sm">
                                    <button
                                        onClick={() => openEdit(product.id)}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        disabled={actionLoadingId === product.id}
                                        onClick={() => dispatch(toggleProductDelete(product.id))}
                                        className="text-red-600 hover:underline"
                                    >
                                        {product.isDelete ? "Restore" : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-md border border-stone-300 px-3 py-1 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-stone-500">
                        Page {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-md border border-stone-300 px-3 py-1 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}

            {modalOpen && <ProductFormModal isEditMode={isEditMode} onClose={closeModal} />}
        </div>
    );
};

export default ProductsPage;