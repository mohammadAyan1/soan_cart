import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";

/**
 * ROUTE SETUP NOTE (multer):
 * ---------------------------------
 * createReview aur addReviewImage dono upload.any() expect karte hain.
 *
 * router.post("/", requiredAuth, upload.any(), createReview);
 * router.post("/:reviewId/images", requiredAuth, upload.any(), addReviewImage);
 *
 * FIELD NAME CONVENTION (frontend se aise bhejna):
 * ---------------------------------
 * - "reviewImage" -> review ki photo(s). Same fieldname multiple baar
 *   bhej sakte ho (FormData.append("reviewImage", file) loop me), kyunki
 *   upload.any() sab files pakad leta hai chahe fieldname same ho ya alag.
 *
 * BODY (multipart/form-data):
 * ---------------------------------
 * - orderItemId, rating, comment
 */

// ---------- Helper: cloudinary se multiple images upload ----------
const uploadMultiple = async (files) => {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((f) => uploadToCloudinary(f)));
};

// ---------- Helper: rating validate karta hai (1 to 5, integer) ----------
const isValidRating = (rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5;

// ==================================================================
// CREATE REVIEW (rating + comment + optional images)
// ==================================================================
export const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderItemId, rating, comment } = req.body;

        if (!orderItemId) {
            return res.status(400).json({
                success: false,
                message: "orderItemId is required"
            });
        }

        const parsedRating = Number(rating);

        if (!isValidRating(parsedRating)) {
            return res.status(400).json({
                success: false,
                message: "rating must be an integer between 1 and 5"
            });
        }

        // OrderItem fetch karo saath me order (ownership) aur existing review
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: Number(orderItemId) },
            include: {
                order: true,
                review: true
            }
        });

        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: "Order item not found"
            });
        }

        // Ownership check - ye order item isi user ke order ka hona chahiye
        if (orderItem.order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can review only your own purchased items"
            });
        }

        // Sirf DELIVERED item pe hi review allowed
        if (orderItem.deliveryStatus !== "DELIVERED") {
            return res.status(400).json({
                success: false,
                message: "You can review only after the product is delivered"
            });
        }

        // Already reviewed check
        if (orderItem.review) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this item"
            });
        }

        // ---------------- Images upload BEFORE transaction (jaise product controller me) ----------------
        const files = req.files || [];
        const reviewImageFiles = files.filter((f) => f.fieldname === "reviewImage");
        const uploadedImages = await uploadMultiple(reviewImageFiles);

        // ---------------- Database Transaction ----------------
        const review = await prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    userId,
                    productId: orderItem.productId,
                    variantId: orderItem.variantId,
                    orderId: orderItem.orderId,
                    orderItemId: orderItem.id,
                    rating: parsedRating,
                    comment: comment ? String(comment).trim() : null
                }
            });

            if (uploadedImages.length) {
                await tx.reviewImage.createMany({
                    data: uploadedImages.map((img) => ({
                        imageUrl: img.secure_url,
                        imageId: img.public_id,
                        reviewId: newReview.id
                    }))
                });
            }

            return tx.review.findUnique({
                where: { id: newReview.id },
                include: { images: true }
            });
        });

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });

    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this item"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================================================================
// UPDATE REVIEW (sirf rating/comment - images alag endpoint se)
// ==================================================================
export const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const { rating, comment } = req.body;

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview || existingReview.isDelete) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (existingReview.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can edit only your own review"
            });
        }

        const dataToUpdate = {};

        if (rating !== undefined) {
            const parsedRating = Number(rating);
            if (!isValidRating(parsedRating)) {
                return res.status(400).json({
                    success: false,
                    message: "rating must be an integer between 1 and 5"
                });
            }
            dataToUpdate.rating = parsedRating;
        }

        if (comment !== undefined) {
            dataToUpdate.comment = comment ? String(comment).trim() : null;
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: dataToUpdate,
            include: { images: true }
        });

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review: updatedReview
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
// DELETE REVIEW (soft delete - khud user ya ADMIN)
// ==================================================================
export const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const reviewId = Number(req.params.id);

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview || existingReview.isDelete) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const isOwner = existingReview.userId === userId;
        const isAdmin = userRole === "ADMIN";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You don't have authority to delete this review"
            });
        }

        await prisma.review.update({
            where: { id: reviewId },
            data: { isDelete: true }
        });

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
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
// GET REVIEWS OF A VARIANT (public - listing + average rating)
// ==================================================================
export const getVariantReviews = async (req, res) => {
    try {
        const variantId = Number(req.params.variantId);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const where = { variantId, isDelete: false };

        const [reviews, totalReviews, aggregate] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    images: true,
                    user: { select: { id: true, fullName: true, imageUrl: true } }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.review.count({ where }),
            prisma.review.aggregate({
                where,
                _avg: { rating: true },
                _count: { rating: true }
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalReviews,
            totalPages: Math.ceil(totalReviews / limit),
            hasNextPage: page < Math.ceil(totalReviews / limit),
            hasPreviousPage: page > 1,
            averageRating: aggregate._avg.rating || 0,
            ratingCount: aggregate._count.rating,
            reviews
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
// GET MY REVIEWS (logged-in user ke apne diye hue saare reviews)
// ==================================================================
export const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await prisma.review.findMany({
            where: { userId, isDelete: false },
            include: {
                images: true,
                product: { select: { id: true, productName: true, imageUrl: true } },
                variant: {
                    select: {
                        id: true, attributes: true, images: {
                            where: {
                                isPrimary: true,
                            },
                            select: {
                                imageUrl: true,
                                imageId: true,
                                isPrimary: true,
                            },
                            take: 1,
                        },
                    }
                },
                order: { select: { id: true, orderNumber: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({
            success: true,
            reviews
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
// GET REVIEWABLE ORDER ITEMS
// (delivered ho chuke, par abhi tak review nahi hue - "Rate this" prompt ke liye)
// ==================================================================
export const getReviewableOrderItems = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviewableItems = await prisma.orderItem.findMany({
            where: {
                deliveryStatus: "DELIVERED",
                review: null,
                order: { userId, isDelete: false }
            },
            include: {
                product: { select: { id: true, productName: true, imageUrl: true } },
                variant: { select: { id: true, attributes: true } },
                order: { select: { id: true, orderNumber: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({
            success: true,
            reviewableItems
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
// STANDALONE: ADD IMAGE(S) TO AN EXISTING REVIEW
// ==================================================================
export const addReviewImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.reviewId);

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: "Review id is required."
            });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review || review.isDelete) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can add images only to your own review."
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

        await prisma.reviewImage.createMany({
            data: uploaded.map((img) => ({
                imageUrl: img.secure_url,
                imageId: img.public_id,
                reviewId
            }))
        });

        const images = await prisma.reviewImage.findMany({
            where: { reviewId },
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

// ==================================================================
// STANDALONE: DELETE A SINGLE REVIEW IMAGE
// ==================================================================
export const deleteReviewImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.reviewId);
        const imageId = Number(req.params.imageId);

        if (!reviewId || !imageId) {
            return res.status(400).json({
                success: false,
                message: "Review id and image id are required."
            });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review || review.isDelete) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }

        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can delete images only from your own review."
            });
        }

        const image = await prisma.reviewImage.findFirst({
            where: { id: imageId, reviewId }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Image not found."
            });
        }

        if (image.imageId) {
            await cloudinary.uploader.destroy(image.imageId);
        }

        await prisma.reviewImage.delete({ where: { id: image.id } });

        const images = await prisma.reviewImage.findMany({
            where: { reviewId },
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