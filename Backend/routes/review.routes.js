import express from "express";
import upload from "../middleware/upload.js";
import { requiredAuth } from "../middleware/auth.middleware.js";

import {
    createReview,
    updateReview,
    deleteReview,
    getVariantReviews,
    getMyReviews,
    getReviewableOrderItems,
    addReviewImage,
    deleteReviewImage
} from "../controller/review.controller.js";

const reviewRouter = express.Router();

/* ============================
   Review
============================ */

// Create Review (rating + comment + optional images)
reviewRouter.post(
    "/",
    requiredAuth,
    upload.any(),
    createReview
);

// Get Reviews Of A Variant (public - listing + average rating)
reviewRouter.get(
    "/variant/:variantId",
    getVariantReviews
);

// Get My Reviews
reviewRouter.get(
    "/my",
    requiredAuth,
    getMyReviews
);

// Get Reviewable Order Items (delivered but not yet reviewed)
reviewRouter.get(
    "/reviewable",
    requiredAuth,
    getReviewableOrderItems
);

// Update Review (rating/comment)
reviewRouter.put(
    "/:id",
    requiredAuth,
    updateReview
);

// Soft Delete Review
reviewRouter.delete(
    "/:id",
    requiredAuth,
    deleteReview
);

/* ============================
   Review Images
============================ */

// Add Images
reviewRouter.post(
    "/:reviewId/images",
    requiredAuth,
    upload.any(),
    addReviewImage
);

// Delete Image
reviewRouter.delete(
    "/:reviewId/image/:imageId",
    requiredAuth,
    deleteReviewImage
);

export default reviewRouter;