import prisma from "../config/prisma.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";


export const createProductSubCategory = async (req, res) => {
    let result = null;
    let subCategory = null;

    try {
        const { id, role } = req.user;
        const { productSubCategoryName, categoryId, tags } = req.body;

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        if (!productSubCategoryName || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Product Sub Category Name and Category Id are required"
            });
        }

        const subCategoryName = productSubCategoryName.trim().toLowerCase();

        // Category exists?
        const category = await prisma.productCategory.findFirst({
            where: {
                id: Number(categoryId),
                isDelete: false
            }
        });



        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Duplicate check
        const exists = await prisma.productSubCategory.findFirst({
            where: {
                categoryId: Number(categoryId),
                productSubCategoryName: subCategoryName,
                isDelete: false
            }
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Sub Category already exists in this category"
            });
        }

        // Upload image
        if (req.file) {
            result = await uploadToCloudinary(req.file);
        }

        // Tags parse
        let parsedTags = null;

        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags;
            } else {
                parsedTags = JSON.parse(tags);
            }
        }

        subCategory = await prisma.productSubCategory.create({
            data: {
                productSubCategoryName: subCategoryName,
                categoryId: Number(categoryId),
                userId: id,
                tags: parsedTags,
                imageUrl: result?.secure_url ?? null,
                imageId: result?.public_id ?? null
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product Sub Category Created Successfully",
            data: subCategory
        });

    } catch (error) {

        try {
            if (result) {
                await cloudinary.uploader.destroy(result.public_id, {
                    resource_type: result.resource_type
                });
            }

            if (subCategory) {
                await prisma.productSubCategory.delete({
                    where: {
                        id: subCategory.id
                    }
                });
            }

        } catch (cleanupError) {
            console.error("Cleanup Error:", cleanupError);
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 👇 UPDATED - ab `status` query param support karta hai: active | inactive | all
export const getAllProductSubCategory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const { status } = req.query; // "active" | "inactive" | "all"

        const skip = (page - 1) * limit;

        let whereClause = {};

        if (status === "inactive") {
            whereClause.isDelete = true;
        } else if (status === "all") {
            // isDelete par koi filter nahi
        } else {
            whereClause.isDelete = false;
        }

        const [subCategories, totalSubCategories] = await Promise.all([
            prisma.productSubCategory.findMany({
                where: whereClause,
                include: {
                    category: {
                        select: {
                            id: true,
                            productCategoryName: true
                        }
                    },
                    _count: {
                        select: {
                            products: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),

            prisma.productSubCategory.count({
                where: whereClause
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalSubCategories,
            totalPages: Math.ceil(totalSubCategories / limit),
            hasNextPage: page < Math.ceil(totalSubCategories / limit),
            hasPreviousPage: page > 1,
            subCategories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getAllProductSubCategoryByCategory = async (req, res) => {
    try {
        const { cat } = req.query;

        // ✅ Agar cat nahi aaya toh 400 bhejo
        if (!cat) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }

        const categoryId = Number(cat);
        if (isNaN(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Category ID"
            });
        }

        const subCategories = await prisma.productSubCategory.findMany({
            where: {
                categoryId: categoryId,      // 👈 YAHI condition missing thi
                isDelete: false
            },
            include: {
                category: {
                    select: {
                        id: true,
                        productCategoryName: true
                    }
                },
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            success: true,
            subCategories
        });

    } catch (error) {
        console.error("Error in get-by-category:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProductSubCategory = async (req, res) => {
    let uploadedImage = null;

    try {
        const { id: userId, role } = req.user;
        const { id } = req.params;

        const {
            productSubCategoryName,
            categoryId,
            tags
        } = req.body;

        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const subCategory = await prisma.productSubCategory.findFirst({
            where: {
                id: Number(id),
                isDelete: false
            }
        });

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        let updateData = {};

        // Update Name
        if (productSubCategoryName) {
            const name = productSubCategoryName.trim().toLowerCase();

            const duplicate = await prisma.productSubCategory.findFirst({
                where: {
                    id: {
                        not: Number(id)
                    },
                    categoryId: Number(categoryId ?? subCategory.categoryId),
                    productSubCategoryName: name,
                    isDelete: false
                }
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Sub Category already exists in this category"
                });
            }

            updateData.productSubCategoryName = name;
        }

        // Update Category
        if (categoryId) {

            const category = await prisma.productCategory.findFirst({
                where: {
                    id: Number(categoryId),
                    isDelete: false
                }
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            updateData.categoryId = Number(categoryId);
        }

        // Update Tags
        if (tags !== undefined) {
            if (Array.isArray(tags)) {
                updateData.tags = tags;
            } else {
                updateData.tags = JSON.parse(tags);
            }
        }

        // Upload New Image
        if (req.file) {
            uploadedImage = await uploadToCloudinary(req.file);

            updateData.imageUrl = uploadedImage.secure_url;
            updateData.imageId = uploadedImage.public_id;
        }

        updateData.userId = userId;

        const updatedSubCategory = await prisma.productSubCategory.update({
            where: {
                id: Number(id)
            },
            data: updateData
        });

        // Delete old image after successful update
        if (req.file && subCategory.imageId) {
            await cloudinary.uploader.destroy(subCategory.imageId);
        }

        return res.status(200).json({
            success: true,
            message: "Product Sub Category updated successfully",
            data: updatedSubCategory
        });

    } catch (error) {

        // Delete newly uploaded image if update failed
        if (uploadedImage) {
            await cloudinary.uploader.destroy(uploadedImage.public_id);
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteProductSubCat = async (req, res) => {
    try {
        const { id, role } = req.user
        const productSubCatId = Number(req.params.id);


        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }


        const findProductSubCat = await prisma.productSubCategory.findFirst({
            where: {
                id: productSubCatId
            }
        })


        if (!findProductSubCat) {
            return res.status(404).json({
                success: false,
                message: "Product Sub Category Not foynd"
            });
        }

        if (role === "VENDOR" && id !== findProductSubCat.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this Sub category."
            });
        }



        const productCatDelete = await prisma.productSubCategory.update({
            where: {
                id: findProductSubCat?.id
            },
            data: {
                isDelete: !findProductSubCat?.isDelete
            }
        })


        return res.status(200).json({
            success: true,
            message: `Sub Category ${!findProductSubCat?.isDelete ? "deleted" : "active"} successfully`
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}