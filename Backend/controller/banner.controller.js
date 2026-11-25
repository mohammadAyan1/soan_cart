import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";

const adminOnly = (req, res) => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "You don't have authority" });
        return false;
    }
    return true;
};

// ==========================================
// POST /api/banners - Create new banner
// ==========================================
export const createBanner = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Banner image is required"
            });
        }

        const {
            title,
            subtitle,
            text,
            textSize,
            isBold,
            textColor,
            textPosition,
            targetType,
            targetId,
            productId,
            targetName,
            orderIndex
        } = req.body;

        if (!targetType || !targetId) {
            return res.status(400).json({
                success: false,
                message: "Target type and Target ID are required"
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file);

        const banner = await prisma.banner.create({
            data: {
                title: title || null,
                subtitle: subtitle || null,
                imageUrl: uploadResult.secure_url,
                imageId: uploadResult.public_id,
                text: text || null,
                textSize: textSize ? Number(textSize) : 18,
                isBold: isBold === "true" || isBold === true,
                textColor: textColor || "#FFFFFF",
                textPosition: textPosition || "BOTTOM_LEFT",
                targetType,
                targetId: Number(targetId),
                productId: productId ? Number(productId) : null,
                targetName: targetName || null,
                orderIndex: orderIndex ? Number(orderIndex) : 0
            }
        });

        return res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner
        });
    } catch (error) {
        console.error("createBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create banner"
        });
    }
};

// ==========================================
// GET /api/banners - Public (App Home Carousel)
// ==========================================
export const getActiveBanners = async (req, res) => {
    try {
        const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: [
                { orderIndex: "asc" },
                { createdAt: "desc" }
            ]
        });

        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        console.error("getActiveBanners error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch banners"
        });
    }
};

// ==========================================
// GET /api/banners/admin - Admin List all
// ==========================================
export const getAllBannersAdmin = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const banners = await prisma.banner.findMany({
            orderBy: [
                { orderIndex: "asc" },
                { createdAt: "desc" }
            ]
        });

        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        console.error("getAllBannersAdmin error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch banners"
        });
    }
};

// ==========================================
// DELETE /api/banners/:id - Delete banner
// ==========================================
export const deleteBanner = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const id = Number(req.params.id);
        const banner = await prisma.banner.findUnique({ where: { id } });

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Delete image from Cloudinary
        if (banner.imageId) {
            try {
                await cloudinary.uploader.destroy(banner.imageId);
            } catch (cloudErr) {
                console.warn("Cloudinary delete error:", cloudErr);
            }
        }

        await prisma.banner.delete({ where: { id } });

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        console.error("deleteBanner error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete banner"
        });
    }
};

// ==========================================
// PATCH /api/banners/:id/status - Toggle status
// ==========================================
export const toggleBannerStatus = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const id = Number(req.params.id);
        const banner = await prisma.banner.findUnique({ where: { id } });

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        const updated = await prisma.banner.update({
            where: { id },
            data: { isActive: !banner.isActive }
        });

        return res.status(200).json({
            success: true,
            message: `Banner ${updated.isActive ? "activated" : "deactivated"}`,
            data: updated
        });
    } catch (error) {
        console.error("toggleBannerStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to toggle banner status"
        });
    }
};
