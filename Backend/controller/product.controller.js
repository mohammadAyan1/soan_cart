import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";

/**
 * ROUTE SETUP NOTE (multer):
 * ---------------------------------
 * Ye controller multer.any() expect karta hai, kyunki file field names
 * dynamic hain (har variant ke liye alag fieldname).
 *
 * router.post("/product", requiredAuth, upload.any(), createProduct);
 * router.put("/product/:id", requiredAuth, upload.any(), updateProduct);
 *
 * FIELD NAME CONVENTIONS (frontend se aise bhejna):
 * ---------------------------------
 * - "productImage"              -> Product ki apni image (single file)
 * - "variant_image_<variantId>" -> existing variant me naya image add karna ho
 * - "variant_image_new_<index>" -> naya variant add karte waqt uski images
 *
 * BODY (multipart/form-data, non-file fields as string/JSON string):
 * ---------------------------------
 * - productName, description, categoryId, subCategoryId, tags (JSON string array)
 * - categoryId/subCategoryId = "other" -> categoryRemark/subCategoryRemark required
 * - deleteProductImage: "true" | "false"  -> product ki apni image sirf delete karni ho
 * - deleteImageIds: JSON string array of ProductImage.id -> variant images delete karne ke liye
 * - variants: JSON string array, har item:
 *     { id?, tempId?, description?, actualPrice, mrp, showMrp?, vendorMinPrice, stock?, tags?, attributes? }
 *     - "id" ho -> existing variant update
 *     - "id" na ho -> naya variant create, tempId use hoga image mapping ke liye (ya index se new_<i>)
 */

// ---------- Helper: cloudinary se multiple images upload ----------
const uploadMultiple = async (files) => {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((f) => uploadToCloudinary(f)));
};

// ---------- Helper: agar deleted image primary thi to next image ko primary banao ----------
const reassignPrimaryIfNeeded = async (tx, variantId, deletedImageWasPrimary) => {
    if (!deletedImageWasPrimary) return;

    const nextImage = await tx.productImage.findFirst({
        where: { productVariantId: variantId },
        orderBy: { createdAt: "asc" }
    });

    if (nextImage) {
        await tx.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true }
        });
    }
};




function validateCategoryPayload({
    categoryId,
    subCategoryId,
    categoryRemark,
    subCategoryRemark,
}) {
    const isEmpty = (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "");

    const isOther = (value) =>
        typeof value === "string" &&
        value.trim().toLowerCase() === "other";

    // Category = Other
    if (isOther(categoryId)) {
        if (isEmpty(categoryRemark)) {
            return {
                success: false,
                message: "Category remark is required when category is Other.",
            };
        }

        if (isEmpty(subCategoryRemark)) {
            return {
                success: false,
                message:
                    "Sub-category remark is required when category is Other.",
            };
        }
    }

    // Sub-category = Other
    if (isOther(subCategoryId)) {
        if (isEmpty(subCategoryRemark)) {
            return {
                success: false,
                message:
                    "Sub-category remark is required when sub-category is Other.",
            };
        }
    }

    return {
        success: true,
    };
}

// ==================================================================
// CREATE PRODUCT
// ==================================================================
export const createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role } = req.user;

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const {
            productName,
            description,
            categoryId,
            subCategoryId,
            tags,
            variants,
            categoryRemark,
            subCategoryRemark
        } = req.body;

        if (!productName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const validation = validateCategoryPayload(req.body);

        if (!validation.success) {
            return res.status(400).json(validation);
        }

        const files = req.files || [];

        // -----------------------------
        // Product Image Upload
        // -----------------------------
        const productImageFile = files.find(
            (f) => f.fieldname === "productImage"
        );

        let productImageResult = null;

        if (productImageFile) {
            productImageResult = await uploadToCloudinary(productImageFile);
        }

        // -----------------------------
        // Parse Variants
        // -----------------------------
        let parsedVariants = [];

        if (variants) {
            parsedVariants =
                typeof variants === "string"
                    ? JSON.parse(variants)
                    : variants;
        }

        // -----------------------------
        // Upload Variant Images BEFORE Transaction
        // -----------------------------

        const uploadedVariantImages = {};

        for (let i = 0; i < parsedVariants.length; i++) {

            const variant = parsedVariants[i];

            const tempKey = variant.tempId ?? `new_${i}`;

            const variantFiles = files.filter(
                (f) =>
                    f.fieldname === `variant_image_${tempKey}` ||
                    f.fieldname === `variant_image_new_${i}`
            );

            if (variantFiles.length > 0) {

                const uploaded = await uploadMultiple(variantFiles);

                uploadedVariantImages[tempKey] = uploaded;
            }
        }

        // -----------------------------
        // Database Transaction
        // -----------------------------

        const product = await prisma.$transaction(
            async (tx) => {

                const newProduct = await tx.product.create({
                    data: {
                        productName,
                        description,
                        userId,

                        // "other" select kiya to categoryId null jayega aur remark save hoga
                        categoryId: categoryId === "other" ? null : Number(categoryId),
                        categoryRemark: categoryId === "other" ? categoryRemark : null,

                        subCategoryId: subCategoryId === "other" ? null : Number(subCategoryId),
                        subCategoryRemark: subCategoryId === "other" ? subCategoryRemark : null,

                        tags: tags
                            ? typeof tags === "string"
                                ? JSON.parse(tags)
                                : tags
                            : null,
                        imageUrl: productImageResult?.secure_url ?? null,
                        imageId: productImageResult?.public_id ?? null
                    }
                });

                for (let i = 0; i < parsedVariants.length; i++) {

                    const v = parsedVariants[i];

                    const tempKey = v.tempId ?? `new_${i}`;

                    const newVariant = await tx.productVariant.create({
                        data: {
                            description: v.description ?? null,
                            actualPrice: v.actualPrice ? Number(v.actualPrice) : 0,
                            mrp: Number(v.mrp),
                            showMrp:
                                v.showMrp === undefined
                                    ? true
                                    : v.showMrp,
                            isDefault: Boolean(v.isDefault),
                            vendorMinPrice: Number(v.vendorMinPrice),
                            stock: Number(v.stock ?? 0),
                            tags: v.tags ?? null,
                            attributes: v.attributes ?? null,
                            productId: newProduct.id
                        }
                    });

                    const uploaded = uploadedVariantImages[tempKey];

                    if (uploaded?.length) {

                        await tx.productImage.createMany({
                            data: uploaded.map((img, index) => ({
                                imageUrl: img.secure_url,
                                imageId: img.public_id,
                                isPrimary: index === 0,
                                productVariantId: newVariant.id
                            }))
                        });

                    }
                }

                return tx.product.findUnique({
                    where: {
                        id: newProduct.id
                    },
                    include: {
                        category: true,
                        subCategory: true,
                        variants: {
                            include: {
                                images: true
                            }
                        }
                    }
                });
            },
            {
                timeout: 20000,
                maxWait: 10000
            }
        );

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==================================================================
// GET ALL PRODUCTS
// ==================================================================

export const getAllProduct = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const whereCondition = {
            isDelete: false,
            variants: {
                some: {
                    isDelete: false,
                    isDefault: true
                }
            }
        };

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where: whereCondition,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit,

                select: {
                    id: true,
                    productName: true,
                    description: true,

                    variants: {
                        where: {
                            isDelete: false,
                            isDefault: true
                        },
                        take: 1,
                        select: {
                            id: true,
                            actualPrice: true,
                            mrp: true,
                            showMrp: true,

                            images: {
                                where: {
                                    isPrimary: true
                                },
                                take: 1,
                                select: {
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.product.count({
                where: whereCondition
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: page < Math.ceil(totalProducts / limit),
            hasPreviousPage: page > 1,
            products
        });

    } catch (error) {


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};






//================================================================
// GET ALL PRODUCTS WITH ALL DETAILS FOR ADMIN
//================================================================
export const getAllProductForAdmin = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status === "true";

        // Puraane aur naye query params
        const {
            vendorId, categoryId, subCategoryId, isApprove, fromDate, toDate, sortBy,
            hasOrdered, hasCart, hasWishlist, hasReview
        } = req.query;

        const dateFilter = {};
        if (fromDate) dateFilter.gte = new Date(fromDate);
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }
        const hasDateFilter = Object.keys(dateFilter).length > 0;

        // 👇 Naye checkboxes ke liye dynamic Prisma conditions
        const variantConditions = { isDelete: false };

        if (hasOrdered === "true") {
            variantConditions.orderItems = { some: {} };
        }
        if (hasCart === "true") {
            variantConditions.cartItems = { some: {} };
        }
        if (hasWishlist === "true") {
            variantConditions.wishlistItems = { some: {} };
        }
        if (hasReview === "true") {
            variantConditions.reviews = { some: {} };
        }

        const whereCondition = {
            isDelete: status,
            ...(vendorId && { userId: Number(vendorId) }),
            ...(categoryId && { categoryId: Number(categoryId) }),
            ...(subCategoryId && { subCategoryId: Number(subCategoryId) }),
            ...(isApprove !== undefined && isApprove !== "" && { isApprove: isApprove === "true" }),
            ...(hasDateFilter && { createdAt: dateFilter }),
            // Agar inme se koi bhi checkbox true hai, toh product ke variants me match hona chahiye
            ...((hasOrdered === "true" || hasCart === "true" || hasWishlist === "true" || hasReview === "true") && {
                variants: { some: variantConditions }
            })
        };

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true, phone: true, role: true, imageUrl: true }
                    },
                    category: { select: { id: true, productCategoryName: true } },
                    subCategory: { select: { id: true, productSubCategoryName: true } },
                    variants: {
                        where: { isDelete: false },
                        include: {
                            images: true,
                            cartItems: {
                                select: {
                                    id: true,
                                    quantity: true,
                                    createdAt: true, // 👈 Cart date/time ke liye
                                    cart: {
                                        select: {
                                            id: true,
                                            userId: true,
                                            user: { select: { id: true, fullName: true, email: true, phone: true, role: true, imageUrl: true } }
                                        }
                                    }
                                }
                            },
                            wishlistItems: {
                                select: {
                                    id: true,
                                    createdAt: true, // 👈 Wishlist date/time ke liye
                                    wishlist: {
                                        select: {
                                            id: true,
                                            userId: true,
                                            user: { select: { id: true, fullName: true, email: true, phone: true, role: true, imageUrl: true } }
                                        }
                                    }
                                }
                            },
                            orderItems: {
                                select: {
                                    id: true,
                                    quantity: true,
                                    deliveryStatus: true,
                                    price: true,
                                    order: {
                                        select: {
                                            id: true,
                                            orderNumber: true,
                                            createdAt: true,
                                            userId: true,
                                            user: { select: { id: true, fullName: true, email: true, phone: true, role: true, imageUrl: true } }
                                        }
                                    }
                                }
                            },
                            reviews: {
                                select: {
                                    id: true,
                                    rating: true,
                                    comment: true,
                                    createdAt: true, // 👈 Review date/time ke liye
                                    user: { select: { id: true, fullName: true, email: true, phone: true, role: true, imageUrl: true } },
                                    images: { select: { id: true, imageUrl: true, imageId: true } }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.product.count({ where: whereCondition })
        ]);

        const formattedProducts = products.map((product) => {
            let productTotalStock = 0;
            let productCartUsersCount = 0;
            let productCartTotalQuantity = 0;
            let productWishlistCount = 0;
            let productTotalSoldQuantity = 0;
            let productTotalReviews = 0;
            let ratingSum = 0;

            const variants = product.variants.map((variant) => {
                // Cart items with Date/Time/Day formatting
                const cartUsersCount = variant.cartItems.length;
                const cartTotalQuantity = variant.cartItems.reduce((sum, item) => sum + item.quantity, 0);
                const cartUsers = variant.cartItems
                    .filter((item) => item.cart?.user)
                    .map((item) => {
                        const cartAt = item.createdAt || null;
                        return {
                            user: item.cart.user,
                            quantity: item.quantity,
                            cartDate: cartAt ? new Date(cartAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null,
                            cartTime: cartAt ? new Date(cartAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null,
                            cartDay: cartAt ? new Date(cartAt).toLocaleDateString("en-IN", { weekday: "long" }) : null,
                        };
                    });

                // Wishlist items with Date/Time/Day formatting
                const wishlistCount = variant.wishlistItems.length;
                const wishlistUsers = variant.wishlistItems
                    .filter((item) => item.wishlist?.user)
                    .map((item) => {
                        const wishAt = item.createdAt || null;
                        return {
                            user: item.wishlist.user,
                            wishDate: wishAt ? new Date(wishAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null,
                            wishTime: wishAt ? new Date(wishAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null,
                            wishDay: wishAt ? new Date(wishAt).toLocaleDateString("en-IN", { weekday: "long" }) : null,
                        };
                    });

                // Buyers / Orders with Date/Time/Day formatting
                const buyers = variant.orderItems.map((item) => {
                    const orderedAt = item.order?.createdAt || null;
                    return {
                        userId: item.order?.user?.id || null,
                        user: item.order?.user || null,
                        orderId: item.order?.id,
                        orderNumber: item.order?.orderNumber,
                        quantity: item.quantity,
                        price: item.price,
                        deliveryStatus: item.deliveryStatus,
                        orderedDate: orderedAt ? new Date(orderedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null,
                        orderedTime: orderedAt ? new Date(orderedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null,
                        orderedDay: orderedAt ? new Date(orderedAt).toLocaleDateString("en-IN", { weekday: "long" }) : null,
                    };
                });

                const uniqueBuyerIds = [...new Set(buyers.map((b) => b.userId).filter(Boolean))];
                const uniqueBuyersCount = uniqueBuyerIds.length;

                const soldQuantity = variant.orderItems
                    .filter((item) => item.deliveryStatus !== "CANCELLED")
                    .reduce((sum, item) => sum + item.quantity, 0);

                const reviewsCount = variant.reviews.length;
                const variantRatingSum = variant.reviews.reduce((sum, r) => sum + r.rating, 0);

                // Reviews with Date/Time/Day formatting
                const reviews = variant.reviews.map((r) => {
                    const revAt = r.createdAt || null;
                    return {
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        user: r.user,
                        images: r.images,
                        createdAt: r.createdAt,
                        reviewDate: revAt ? new Date(revAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null,
                        reviewTime: revAt ? new Date(revAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null,
                        reviewDay: revAt ? new Date(revAt).toLocaleDateString("en-IN", { weekday: "long" }) : null,
                    };
                });

                productTotalStock += variant.stock;
                productCartUsersCount += cartUsersCount;
                productCartTotalQuantity += cartTotalQuantity;
                productWishlistCount += wishlistCount;
                productTotalSoldQuantity += soldQuantity;
                productTotalReviews += reviewsCount;
                ratingSum += variantRatingSum;

                return {
                    id: variant.id,
                    description: variant.description,
                    actualPrice: variant.actualPrice,
                    mrp: variant.mrp,
                    showMrp: variant.showMrp,
                    vendorMinPrice: variant.vendorMinPrice,
                    stock: variant.stock,
                    tags: variant.tags,
                    attributes: variant.attributes,
                    isDefault: variant.isDefault,
                    images: variant.images,
                    currentlyInCart: { usersCount: cartUsersCount, totalQuantity: cartTotalQuantity, users: cartUsers },
                    currentlyInWishlist: { count: wishlistCount, users: wishlistUsers },
                    buyers,
                    uniqueBuyersCount,
                    totalSold: soldQuantity,
                    reviewsCount,
                    avgRating: reviewsCount > 0 ? Number((variantRatingSum / reviewsCount).toFixed(1)) : 0,
                    reviews,
                    createdAt: variant.createdAt,
                    updatedAt: variant.updatedAt
                };
            });

            const productAvgRating = productTotalReviews > 0 ? Number((ratingSum / productTotalReviews).toFixed(1)) : 0;

            return {
                id: product.id,
                productName: product.productName,
                description: product.description,
                tags: product.tags,
                imageUrl: product.imageUrl,
                imageId: product.imageId,
                isApprove: product.isApprove,
                isDelete: product.isDelete,
                vendor: product.user,
                category: product.category,
                subCategory: product.subCategory,
                categoryRemark: product.categoryRemark,
                subCategoryRemark: product.subCategoryRemark,
                totalVariants: variants.length,
                totalStock: productTotalStock,
                currentlyInCart: { usersCount: productCartUsersCount, totalQuantity: productCartTotalQuantity },
                currentlyInWishlist: productWishlistCount,
                totalSold: productTotalSoldQuantity,
                totalReviews: productTotalReviews,
                avgRating: productAvgRating,
                variants,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };
        });

        let finalProducts = formattedProducts;
        if (sortBy === "mostSold") {
            finalProducts = [...formattedProducts].sort((a, b) => b.totalSold - a.totalSold);
        } else if (sortBy === "leastSold") {
            finalProducts = [...formattedProducts].sort((a, b) => a.totalSold - b.totalSold);
        }

        const [vendors, categories, subCategories] = await Promise.all([
            prisma.user.findMany({
                where: { role: "VENDOR", isDelete: false },
                select: { id: true, fullName: true, email: true, phone: true, imageUrl: true },
                orderBy: { fullName: "asc" },
            }),
            prisma.productCategory.findMany({
                where: { isDelete: false },
                select: { id: true, productCategoryName: true },
                orderBy: { productCategoryName: "asc" },
            }),
            prisma.productSubCategory.findMany({
                where: { isDelete: false },
                select: { id: true, productSubCategoryName: true, categoryId: true },
                orderBy: { productSubCategoryName: "asc" },
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: finalProducts,
            pagination: { totalProducts, totalPages: Math.ceil(totalProducts / limit), currentPage: page, limit },
            filters: { vendors, categories, subCategories },
        });

    } catch (error) {
        console.error("getAllProductForAdmin error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching products",
            error: error.message
        });
    }
};


// ==================================================================
// GET PRODUCT BY ID
// ==================================================================
export const getProductById = async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "product id is required"
            });
        }

        const product = await prisma.product.findFirst({
            where: { id: productId, isDelete: false },
            include: {
                category: true,
                subCategory: true,
                user: { select: { id: true, fullName: true, email: true } },
                variants: {
                    where: { isDelete: false },
                    include: { images: true }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==================================================================
// SEARCH PRODUCTS (debounced search se call hota hai, paginated)
// ==================================================================
export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!q || !q.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // ⚠️ NOTE: MySQL me by default collation case-insensitive hoti hai,
        // isliye "mode: insensitive" nahi lagaya (ye sirf Postgres/Mongo me
        // support hota hai, MySQL me error dega)
        const whereCondition = {
            isDelete: false,
            productName: {
                contains: q.trim()
            },
            variants: {
                some: {
                    isDelete: false,
                    isDefault: true
                }
            }
        };

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where: whereCondition,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit,

                select: {
                    id: true,
                    productName: true,
                    description: true,

                    variants: {
                        where: {
                            isDelete: false,
                            isDefault: true
                        },
                        take: 1,
                        select: {
                            id: true,
                            actualPrice: true,
                            mrp: true,
                            showMrp: true,

                            images: {
                                where: {
                                    isPrimary: true
                                },
                                take: 1,
                                select: {
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.product.count({
                where: whereCondition
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: page < Math.ceil(totalProducts / limit),
            hasPreviousPage: page > 1,
            products
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllProductByVendor = async (req, res) => {
    try {
        const { id: userId } = req.user;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 👇 NOTE: yaha isDelete: false filter jaan-bujh kar NAHI hai —
        // vendor ko apne deleted products bhi dikhne chahiye (status badge ke saath)
        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where: { userId },
                include: {
                    category: true,
                    subCategory: true,
                    user: { select: { id: true, fullName: true, email: true } },
                    // 👇 variants me bhi filter hataya — deleted variants bhi aayenge
                    variants: {
                        include: { images: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.product.count({ where: { userId } })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: page < Math.ceil(totalProducts / limit),
            hasPreviousPage: page > 1,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// UPDATE PRODUCT
// (Product image aur Variant images dono independently handle hote hain)
// ==================================================================
export const updateProduct = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const productId = Number(req.params.id);

        if (!productId || isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: "product id is required"
            });
        }

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const {
            productName,
            description,
            categoryId,
            subCategoryId,
            tags,
            deleteProductImage,
            deleteImageIds,
            variants,
            categoryRemark,
            subCategoryRemark
        } = req.body;

        if (!productName || !categoryId || !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const validation = validateCategoryPayload(req.body);

        if (!validation.success) {
            return res.status(400).json(validation);
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (role === "VENDOR" && existingProduct.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can update only your own product."
            });
        }

        const files = req.files || [];

        // ---------------- 1. PRODUCT KI APNI IMAGE ----------------
        // Ye sirf tab touch hogi jab productImage file aaye YA deleteProductImage true ho.
        // Variants ki images se iska koi lena dena nahi.
        const productImageFile = files.find((f) => f.fieldname === "productImage");

        let productImageData = {
            imageUrl: existingProduct.imageUrl,
            imageId: existingProduct.imageId
        };

        // Cloudinary calls yaha transaction ke BAHAR ho rahi hain (jaise create controller mein)
        if (productImageFile) {
            // Naya upload -> purani delete karo, nayi lagao
            if (existingProduct.imageId) {
                await cloudinary.uploader.destroy(existingProduct.imageId);
            }
            const uploaded = await uploadToCloudinary(productImageFile);
            productImageData = {
                imageUrl: uploaded.secure_url,
                imageId: uploaded.public_id
            };
        } else if (deleteProductImage === "true" || deleteProductImage === true) {
            // Sirf delete karni hai, naya upload nahi
            if (existingProduct.imageId) {
                await cloudinary.uploader.destroy(existingProduct.imageId);
            }
            productImageData = { imageUrl: null, imageId: null };
        }
        // Agar dono me se kuch nahi bheja -> product image bilkul untouched rahegi

        // ---------------- 2. VARIANTS PARSE ----------------
        let parsedVariants = [];
        if (variants) {
            parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        }

        let parsedDeleteImageIds = [];
        if (deleteImageIds) {
            parsedDeleteImageIds = typeof deleteImageIds === "string" ? JSON.parse(deleteImageIds) : deleteImageIds;
            parsedDeleteImageIds = parsedDeleteImageIds.map(Number);
        }

        // ---------------- 3. VARIANT IMAGE DELETES — CLOUDINARY PEHLE (transaction ke bahar) ----------------
        // Security: sirf isi product ke variants ki images fetch/delete hongi
        let imagesToDelete = [];
        if (parsedDeleteImageIds.length > 0) {
            imagesToDelete = await prisma.productImage.findMany({
                where: {
                    id: { in: parsedDeleteImageIds },
                    variant: { productId }
                }
            });

            for (const img of imagesToDelete) {
                if (img.imageId) {
                    await cloudinary.uploader.destroy(img.imageId);
                }
            }
        }

        // ---------------- 4. VARIANT KI NAYI IMAGES — UPLOAD PEHLE (transaction ke bahar) ----------------
        // Key: existing variant ke liye uska id (number), naye variant ke liye tempKey (string)
        const uploadedVariantImages = {};

        for (let i = 0; i < parsedVariants.length; i++) {
            const v = parsedVariants[i];

            if (v.id) {
                // Existing variant ki nayi image (agar bheji ho)
                const newVariantFiles = files.filter(
                    (f) => f.fieldname === `variant_image_${v.id}`
                );

                if (newVariantFiles.length > 0) {
                    uploadedVariantImages[`existing_${v.id}`] = await uploadMultiple(newVariantFiles);
                }
            } else {
                // Naya variant ki image
                const tempKey = v.tempId ?? `new_${i}`;
                const variantFiles = files.filter(
                    (f) => f.fieldname === `variant_image_${tempKey}` || f.fieldname === `variant_image_new_${i}`
                );

                if (variantFiles.length > 0) {
                    uploadedVariantImages[tempKey] = await uploadMultiple(variantFiles);
                }
            }
        }

        // ---------------- 5. DATABASE TRANSACTION — sirf DB writes, koi external call nahi ----------------
        const skippedVariantIds = []; // ownership mismatch track karne ke liye

        const updatedProduct = await prisma.$transaction(async (tx) => {

            // ---- Product ke basic fields + apni image update ----
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    productName,
                    description,

                    // "other" select kiya to categoryId null jayega aur remark save hoga
                    categoryId: categoryId === "other" ? null : Number(categoryId),
                    categoryRemark: categoryId === "other" ? categoryRemark : null,

                    subCategoryId: subCategoryId === "other" ? null : Number(subCategoryId),
                    subCategoryRemark: subCategoryId === "other" ? subCategoryRemark : null,

                    isApprove: true,
                    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : null,
                    ...productImageData
                }
            });

            // ---- Variant images DB delete (Cloudinary already destroy ho chuka hai upar) ----
            for (const img of imagesToDelete) {
                await tx.productImage.delete({ where: { id: img.id } });
                await reassignPrimaryIfNeeded(tx, img.productVariantId, img.isPrimary);
            }

            // ---- VARIANTS UPDATE / CREATE + NAYI IMAGES ADD (already uploaded, sirf DB record banana hai) ----
            for (let i = 0; i < parsedVariants.length; i++) {
                const v = parsedVariants[i];

                if (v.id) {
                    // Existing variant belongs to this product? verify
                    const existingVariant = await tx.productVariant.findFirst({
                        where: { id: Number(v.id), productId }
                    });

                    if (!existingVariant) {
                        skippedVariantIds.push(v.id); // ownership mismatch, silently skip nahi — track karo
                        continue;
                    }

                    await tx.productVariant.update({
                        where: { id: existingVariant.id },
                        data: {
                            description: v.description ?? existingVariant.description,
                            actualPrice: v.actualPrice !== undefined ? Number(v.actualPrice) : existingVariant.actualPrice,
                            mrp: v.mrp !== undefined ? Number(v.mrp) : existingVariant.mrp,
                            showMrp: v.showMrp ?? existingVariant.showMrp,
                            vendorMinPrice: v.vendorMinPrice !== undefined ? Number(v.vendorMinPrice) : existingVariant.vendorMinPrice,
                            stock: v.stock !== undefined ? Number(v.stock) : existingVariant.stock,
                            tags: v.tags ?? existingVariant.tags,
                            attributes: v.attributes ?? existingVariant.attributes
                        }
                    });

                    // Is existing variant ke liye naya image add hua ho to (already uploaded hai upar)
                    const uploaded = uploadedVariantImages[`existing_${v.id}`];

                    if (uploaded?.length) {
                        const currentImageCount = await tx.productImage.count({
                            where: { productVariantId: existingVariant.id }
                        });

                        await tx.productImage.createMany({
                            data: uploaded.map((img, idx) => ({
                                imageUrl: img.secure_url,
                                imageId: img.public_id,
                                isPrimary: currentImageCount === 0 && idx === 0,
                                productVariantId: existingVariant.id
                            }))
                        });
                    }

                } else {
                    // Naya variant create ho raha hai
                    const tempKey = v.tempId ?? `new_${i}`;

                    const newVariant = await tx.productVariant.create({
                        data: {
                            description: v.description ?? null,
                            actualPrice: Number(v.actualPrice),
                            mrp: Number(v.mrp),
                            showMrp: v.showMrp ?? true,
                            vendorMinPrice: Number(v.vendorMinPrice),
                            stock: Number(v.stock ?? 0),
                            tags: v.tags ?? null,
                            attributes: v.attributes ?? null,
                            productId
                        }
                    });

                    const uploaded = uploadedVariantImages[tempKey];

                    if (uploaded?.length) {
                        await tx.productImage.createMany({
                            data: uploaded.map((img, idx) => ({
                                imageUrl: img.secure_url,
                                imageId: img.public_id,
                                isPrimary: idx === 0,
                                productVariantId: newVariant.id
                            }))
                        });
                    }
                }
            }

            return tx.product.findUnique({
                where: { id: productId },
                include: {
                    category: true,
                    subCategory: true,
                    variants: {
                        where: { isDelete: false },
                        include: { images: true }
                    }
                }
            });
        }, {
            timeout: 20000,
            maxWait: 10000
        });

        return res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
            product: updatedProduct,
            ...(skippedVariantIds.length > 0 && {
                warning: `In variant IDs ka ownership match nahi hua, skip kar diya: ${skippedVariantIds.join(", ")}`
            })
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// DELETE PRODUCT (soft delete, variants bhi saath me soft delete)
// ==================================================================
export const deletProduct = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const productId = Number(req.params.id);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "product id is required"
            });
        }

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (role === "VENDOR" && product.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can update only your own product."
            });
        }

        const toggledStatus = !product.isDelete;

        await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: productId },
                data: { isDelete: toggledStatus }
            });

            // Variants ko bhi product ke saath hi toggle karo (consistent state)
            await tx.productVariant.updateMany({
                where: { productId },
                data: { isDelete: toggledStatus }
            });
        });

        return res.status(200).json({
            success: true,
            message: toggledStatus ? "Product deleted successfully" : "Product restored successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// STANDALONE: DELETE A SINGLE VARIANT IMAGE
// (update flow ke bahar bhi quick delete karna ho to ye use karo)
// ==================================================================
export const deleteVariantImage = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        const variantId = Number(req.params.variantId);
        const imageId = Number(req.params.imageId);

        if (!variantId || !imageId) {
            return res.status(400).json({
                success: false,
                message: "Variant Id and Image Id are required."
            });
        }

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority."
            });
        }

        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found."
            });
        }

        if (role === "VENDOR" && variant.product.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can delete only your own product images."
            });
        }

        const image = await prisma.productImage.findFirst({
            where: { id: imageId, productVariantId: variantId }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found."
            });
        }

        await prisma.$transaction(async (tx) => {
            if (image.imageId) {
                await cloudinary.uploader.destroy(image.imageId);
            }
            await tx.productImage.delete({ where: { id: image.id } });
            await reassignPrimaryIfNeeded(tx, variantId, image.isPrimary);
        });

        const images = await prisma.productImage.findMany({
            where: { productVariantId: variantId },
            orderBy: { createdAt: "asc" }
        });

        return res.status(200).json({
            success: true,
            message: "Image deleted successfully.",
            images
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// STANDALONE: ADD IMAGE(S) TO AN EXISTING VARIANT
// (update flow ke bahar bhi quick add karna ho to ye use karo)
// ==================================================================
export const addVariantImage = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const variantId = Number(req.params.variantId);

        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: "Variant id is required."
            });
        }

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority."
            });
        }

        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found."
            });
        }

        if (role === "VENDOR" && variant.product.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can add images only to your own product."
            });
        }

        const files = req.files || [];
        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required."
            });
        }

        const uploaded = await uploadMultiple(files);

        const currentImageCount = await prisma.productImage.count({
            where: { productVariantId: variantId }
        });

        await prisma.productImage.createMany({
            data: uploaded.map((img, idx) => ({
                imageUrl: img.secure_url,
                imageId: img.public_id,
                isPrimary: currentImageCount === 0 && idx === 0,
                productVariantId: variantId
            }))
        });

        const images = await prisma.productImage.findMany({
            where: { productVariantId: variantId },
            orderBy: { createdAt: "asc" }
        });

        return res.status(200).json({
            success: true,
            message: "Image(s) added successfully.",
            images
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// export const getProductsByCategory = async (req, res) => {
//     try {
//         const page = Number(req.query.page) || 1;
//         const limit = Number(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const { categoryId, subCategoryId } = req.query;

//         if (!categoryId && !subCategoryId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "categoryId ya subCategoryId me se ek to dena hi padega"
//             });
//         }

//         const whereCondition = {
//             isDelete: false,
//             variants: {
//                 some: {
//                     isDelete: false,
//                     isDefault: true
//                 }
//             },
//             ...(categoryId && { categoryId: Number(categoryId) }),
//             ...(subCategoryId && { subCategoryId: Number(subCategoryId) })
//         };

//         const [products, totalProducts] = await Promise.all([
//             prisma.product.findMany({
//                 where: whereCondition,
//                 orderBy: {
//                     createdAt: "desc"
//                 },
//                 skip,
//                 take: limit,

//                 select: {
//                     id: true,
//                     productName: true,
//                     description: true,

//                     variants: {
//                         where: {
//                             isDelete: false,
//                             isDefault: true
//                         },
//                         take: 1,
//                         select: {
//                             id: true,
//                             actualPrice: true,
//                             mrp: true,
//                             showMrp: true,

//                             images: {
//                                 where: {
//                                     isPrimary: true
//                                 },
//                                 take: 1,
//                                 select: {
//                                     imageUrl: true
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }),

//             prisma.product.count({
//                 where: whereCondition
//             })
//         ]);

//         return res.status(200).json({
//             success: true,
//             currentPage: page,
//             perPage: limit,
//             totalProducts,
//             totalPages: Math.ceil(totalProducts / limit),
//             hasNextPage: page < Math.ceil(totalProducts / limit),
//             hasPreviousPage: page > 1,
//             products
//         });

//     } catch (error) {

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };



// ==================================================================
// GET PRODUCT BY ID — VENDOR EDIT VIEW
// (Public getProductById se alag — isme DELETED variants bhi aayenge,
// taaki vendor apne deleted variants dekh/restore kar sake)
// ==================================================================




export const getProductsByCategory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { categoryId, subCategoryId } = req.query;

        if (!categoryId && !subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "categoryId ya subCategoryId me se ek to dena hi padega"
            });
        }

        const whereCondition = {
            isDelete: false,
            variants: {
                some: {
                    isDelete: false,
                    isDefault: true
                }
            },
            ...(categoryId && { categoryId: Number(categoryId) }),
            ...(subCategoryId && { subCategoryId: Number(subCategoryId) })
        };

        const [products, totalProducts, subCategories] = await Promise.all([
            prisma.product.findMany({
                where: whereCondition,
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit,

                select: {
                    id: true,
                    productName: true,
                    description: true,

                    variants: {
                        where: {
                            isDelete: false,
                            isDefault: true
                        },
                        take: 1,
                        select: {
                            id: true,
                            actualPrice: true,
                            mrp: true,
                            showMrp: true,

                            images: {
                                where: {
                                    isPrimary: true
                                },
                                take: 1,
                                select: {
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            }),

            prisma.product.count({
                where: whereCondition
            }),

            categoryId
                ? prisma.productSubCategory.findMany({
                    where: {
                        categoryId: Number(categoryId),
                        isDelete: false
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id: true,
                        productSubCategoryName: true,
                        imageUrl: true
                    }
                })
                : Promise.resolve([])
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            hasNextPage: page < Math.ceil(totalProducts / limit),
            hasPreviousPage: page > 1,
            subCategories,
            products
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const getProductByIdForVendor = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const productId = Number(req.params.id);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "product id is required"
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                subCategory: true,
                // 👇 yaha isDelete filter NAHI hai — sab variants aayenge (deleted bhi)
                variants: {
                    include: { images: true },
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (role === "VENDOR" && product.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can view only your own product."
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// TOGGLE VARIANT SOFT DELETE / RESTORE
// (Single variant ko delete/restore karna, poora product delete kiye bina)
// ==================================================================
export const toggleVariantDelete = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const variantId = Number(req.params.variantId);

        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: "Variant id is required."
            });
        }

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority."
            });
        }

        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found."
            });
        }

        if (role === "VENDOR" && variant.product.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can modify only your own product's variants."
            });
        }

        // Agar ye variant hi isDefault tha aur delete ho raha hai,
        // to koi aur active variant ko default banana zaroori hai
        // (warna product listing pe price/image dikhna band ho jayega)
        const toggledStatus = !variant.isDelete;

        await prisma.$transaction(async (tx) => {
            await tx.productVariant.update({
                where: { id: variantId },
                data: { isDelete: toggledStatus }
            });

            if (toggledStatus && variant.isDefault) {
                // isko delete kar rahe hai aur ye default tha -> next active variant ko default banao
                const nextVariant = await tx.productVariant.findFirst({
                    where: {
                        productId: variant.productId,
                        isDelete: false,
                        id: { not: variantId }
                    },
                    orderBy: { createdAt: "asc" }
                });

                if (nextVariant) {
                    await tx.productVariant.update({
                        where: { id: variantId },
                        data: { isDefault: false }
                    });
                    await tx.productVariant.update({
                        where: { id: nextVariant.id },
                        data: { isDefault: true }
                    });
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: toggledStatus
                ? "Variant deleted successfully"
                : "Variant restored successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//TOGGLE APPRIVE OR DISAPPROVE PRODUCT BY ADMIN
export const toggleProductApprove = async (req, res) => {
    try {

        const { role } = req.user;
        const productId = Number(req.params.productId);

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "product id is required."
            });
        }

        if (role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority."
            });
        }


        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "product not found."
            });
        }

        const toggledStatus = !product.isApprove;
        await prisma.product.update({
            where: { id: productId },
            data: { isApprove: toggledStatus }
        })


        return res.status(200).json({
            success: true,
            message: toggledStatus
                ? "product approved successfully"
                : "product approval pending successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}