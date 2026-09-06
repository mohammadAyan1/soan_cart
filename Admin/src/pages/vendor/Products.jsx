import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchVendorProducts,
    toggleProductDelete,
} from "../../redux/slices/productSlice";

const Products = ({ Role }) => {
    const dispatch = useDispatch();
    const { products, loading, pagination, error } = useSelector((s) => s.product);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (Role == "ADMIN") {
            dispatch(fetchVendorProducts({ page, limit: 10 }));

        } else {
            dispatch(fetchVendorProducts({ page, limit: 10 }));
        }
    }, [dispatch, page]);

    const handleToggleDelete = (product) => {
        const action = product.isDelete ? "restore" : "delete";
        if (!window.confirm(`Kya tum is product ko ${action} karna chahte ho?`)) return;
        dispatch(toggleProductDelete(product.id));
    };

    // Product ka price range + image nikalne ke liye default/pehla active variant dhundo
    const getDisplayVariant = (product) => {
        const activeVariants = product.variants?.filter((v) => !v.isDelete) || [];
        return activeVariants.find((v) => v.isDefault) || activeVariants[0] || product.variants?.[0];
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Mere Products</h2>
                <Link
                    to="/vendor/products/new"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                    + Naya Product Add Karo
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-500">
                    Abhi tak koi product add nahi kiya. Upar wale button se shuru karo.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Variants</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => {
                                const displayVariant = getDisplayVariant(product);
                                const activeVariantCount =
                                    product.variants?.filter((v) => !v.isDelete).length || 0;
                                const deletedVariantCount =
                                    product.variants?.filter((v) => v.isDelete).length || 0;

                                return (
                                    <tr
                                        key={product.id}
                                        className={`border-b last:border-0 ${product.isDelete ? "bg-red-50/40" : ""
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        product.imageUrl ||
                                                        displayVariant?.images?.[0]?.imageUrl ||
                                                        "https://placehold.co/60x60?text=No+Img"
                                                    }
                                                    alt={product.productName}
                                                    className="w-12 h-12 rounded-lg object-cover border"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {product.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {product.isApprove
                                                            ? "Approved"
                                                            : "Approval pending"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {product.category?.productCategoryName || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {activeVariantCount} active
                                            {deletedVariantCount > 0 && (
                                                <span className="text-red-500">
                                                    {" "}
                                                    / {deletedVariantCount} deleted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {displayVariant
                                                ? `₹${displayVariant.actualPrice}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {product.isDelete ? (
                                                <span className="inline-block bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                                                    Deleted
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </td>


                                        <td className="px-4 py-3">
                                            {!product.isApprove ?
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/vendor/products/edit/${product.id}`}
                                                        className="text-indigo-600 hover:underline text-xs font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleDelete(product)}
                                                        className={`text-xs font-medium hover:underline ${product.isDelete
                                                            ? "text-emerald-600"
                                                            : "text-red-600"
                                                            }`}
                                                    >
                                                        {product.isDelete ? "Restore" : "Delete"}
                                                    </button>
                                                </div>
                                                :
                                                <div className="flex items-center justify-end gap-2">
                                                    --
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )
            }

            {
                pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            disabled={!pagination.hasPreviousPage}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1 text-sm rounded-lg border disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            disabled={!pagination.hasNextPage}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1 text-sm rounded-lg border disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default Products;