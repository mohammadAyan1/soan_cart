import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendorReviews } from "../redux/slices/reviewSlice";
import StarRating from "../components/StarRating";
import { formatDate } from "../utils/dateHelpers";

const ReviewsPage = () => {
    const dispatch = useDispatch();
    const { products, totalReviews, todayReviews, loading, error } = useSelector(
        (state) => state.review
    );

    useEffect(() => {
        dispatch(fetchVendorReviews());
    }, [dispatch]);

    return (
        <div>
            <h1 className="text-xl font-medium text-stone-800">Reviews</h1>
            <p className="mt-1 text-sm text-stone-500">
                Sirf rating aur comment dikhta hai - kisne diya ye pata nahi chalta
            </p>

            <div className="mt-4 flex gap-4">
                <div className="rounded-lg border border-stone-200 bg-white px-5 py-3">
                    <p className="text-xs text-stone-400">Total Reviews</p>
                    <p className="text-lg font-medium text-stone-800">{totalReviews}</p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white px-5 py-3">
                    <p className="text-xs text-stone-400">Aaj Ke Reviews</p>
                    <p className="text-lg font-medium text-stone-800">{todayReviews}</p>
                </div>
            </div>

            {error && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            {loading && <p className="mt-6 text-sm text-stone-400">Loading...</p>}

            <div className="mt-6 space-y-6">
                {!loading && products.length === 0 && (
                    <p className="text-sm text-stone-400">Abhi tak koi review nahi aaya</p>
                )}

                {products.map((product) => (
                    <div key={product.productId} className="rounded-lg border border-stone-200 bg-white p-4">
                        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                            <img
                                src={product.productImage || "https://placehold.co/48x48?text=Item"}
                                alt=""
                                className="h-12 w-12 rounded-md object-cover"
                            />
                            <div>
                                <p className="font-medium text-stone-800">{product.productName}</p>
                                <div className="mt-0.5 flex items-center gap-2 text-sm text-stone-500">
                                    <StarRating rating={product.averageRating} size="text-sm" />
                                    <span>({product.totalReviews})</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-3">
                            {product.variants.flatMap((v) => v.reviews).length === 0 && (
                                <p className="text-sm text-stone-400">Is product pe abhi review nahi hai</p>
                            )}

                            {product.variants.flatMap((v) =>
                                v.reviews.map((r) => (
                                    <div key={r.id} className="rounded-md bg-stone-50 p-3">
                                        <div className="flex items-center justify-between">
                                            <StarRating rating={r.rating} size="text-sm" />
                                            <span className="text-xs text-stone-400">
                                                {formatDate(r.createdAt)}
                                            </span>
                                        </div>
                                        {r.comment && (
                                            <p className="mt-1 text-sm text-stone-700">{r.comment}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsPage;