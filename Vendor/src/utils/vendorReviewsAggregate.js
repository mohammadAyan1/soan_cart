import axiosInstance from "../api/axiosInstance";
import { isToday } from "./dateHelpers";

/**
 * NOTE (assumption):
 * ---------------------------------------------------------
 * Backend me abhi "sirf vendor ke products ke reviews" dene wala
 * koi dedicated endpoint nahi hai. Jo endpoints hai:
 *   - GET /api/product/vendor/products   (vendor ke apne products + variants)
 *   - GET /api/reviews/variant/:variantId (public - ek variant ke reviews)
 *
 * Isliye ye helper pehle vendor ke saare products/variants nikalta hai,
 * fir har variant ke reviews fetch karke aggregate karta hai.
 *
 * Ye kaam chalu rakhega, lekin agar products/variants bahut zyada ho jaye
 * (100+) to ye thoda slow ho sakta hai (N API calls). Behtar hoga ki
 * future me backend pe ek "GET /api/reviews/vendor" endpoint bana diya jaye
 * jo seedha vendorId se saare reviews de de - tab ye helper hata sakte ho.
 *
 * IMPORTANT: getVariantReviews review.user bhi bhejta hai - hum yaha
 * jaan-bujh kar use response me se hata rahe hai, kyuki vendor ko sirf
 * rating/comment/count dikhna chahiye, "kisne diya" nahi dikhna chahiye.
 */

export const fetchVendorReviewsAggregate = async () => {
    // 1) Vendor ke saare products (variants ke saath) le aao
    const productsRes = await axiosInstance.get("/product/vendor/products", {
        params: { page: 1, limit: 500 },
    });

    const products = productsRes.data?.products || [];

    // 2) Har active variant ke reviews fetch karo (parallel)
    const variantTasks = [];

    products.forEach((product) => {
        (product.variants || [])
            .filter((v) => !v.isDelete)
            .forEach((variant) => {
                variantTasks.push(
                    axiosInstance
                        .get(`/reviews/variant/${variant.id}`, {
                            params: { page: 1, limit: 100 },
                        })
                        .then((res) => ({
                            productId: product.id,
                            productName: product.productName,
                            productImage: product.imageUrl,
                            variantId: variant.id,
                            variantDescription: variant.description,
                            averageRating: res.data?.averageRating || 0,
                            ratingCount: res.data?.ratingCount || 0,
                            reviews: (res.data?.reviews || []).map((r) => ({
                                id: r.id,
                                rating: r.rating,
                                comment: r.comment,
                                images: r.images,
                                createdAt: r.createdAt,
                                // 👈 user field jaan-bujh kar nahi bheja - anonymous rakhna hai
                            })),
                        }))
                        .catch(() => null)
                );
            });
    });

    const variantResults = (await Promise.all(variantTasks)).filter(Boolean);

    // 3) Product-wise group karo taaki UI me "product -> uske reviews" dikha sake
    const productMap = new Map();

    variantResults.forEach((v) => {
        if (!productMap.has(v.productId)) {
            productMap.set(v.productId, {
                productId: v.productId,
                productName: v.productName,
                productImage: v.productImage,
                variants: [],
                totalReviews: 0,
                ratingSum: 0,
            });
        }
        const entry = productMap.get(v.productId);
        entry.variants.push(v);
        entry.totalReviews += v.ratingCount;
        entry.ratingSum += v.reviews.reduce((s, r) => s + r.rating, 0);
    });

    const groupedProducts = Array.from(productMap.values()).map((p) => ({
        ...p,
        averageRating: p.totalReviews > 0 ? Number((p.ratingSum / p.totalReviews).toFixed(1)) : 0,
    }));

    // 4) Overall summary counts
    let totalReviews = 0;
    let todayReviews = 0;

    variantResults.forEach((v) => {
        totalReviews += v.reviews.length;
        todayReviews += v.reviews.filter((r) => isToday(r.createdAt)).length;
    });

    return { products: groupedProducts, totalReviews, todayReviews };
};