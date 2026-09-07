import prisma from "../config/prisma.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

export const createProductCategory = async (req, res) => {
    let result = null;
    let productCat = null;

    try {

        const { id, role } = req.user
        const { productCategoryName, tags } = req.body

        const categoryName = productCategoryName.trim().toLowerCase();


        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }


        if (!categoryName) {
            return res.status(400).json({
                success: false,
                message: "Category Name is Required"
            });
        }

        if (req.file) {
            result = await uploadToCloudinary(req.file);

        }


        const exists = await prisma.productCategory.findFirst({
            where: {
                productCategoryName: categoryName,
                isDelete: false
            }
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        productCat = await prisma.productCategory.create({
            data: {
                productCategoryName: categoryName,
                tags: tags ? JSON.parse(tags) : null,
                userId: id,
                imageUrl: result?.secure_url ?? null,
                imageId: result?.public_id ?? null
            }
        })


        return res.status(201).json({
            success: true,
            message: "Product Category Created Successfully",
            productCat
        });


    } catch (error) {
        try {
            if (result) {
                await cloudinary.uploader.destroy(result.public_id, {
                    resource_type: result.resource_type
                });
            }

            if (productCat) {
                await prisma.productCategory.delete({
                    where: {
                        id: productCat.id
                    }
                });
            }
        } catch (cleanupError) {
            console.error("Cleanup Error:", cleanupError);
        }

        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// 👇 UPDATED - ab `status` query param support karta hai: active | inactive | all
export const getAllProductCategory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const { status } = req.query; // "active" | "inactive" | "all"

        const skip = (page - 1) * limit;

        let whereClause = {};

        if (status === "inactive") {
            whereClause.isDelete = true;
        } else if (status === "all") {
            // isDelete par koi filter nahi - dono aayenge
        } else {
            // default - "active"
            whereClause.isDelete = false;
        }


        const [productsCat, totalProductsCat] = await Promise.all([
            prisma.productCategory.findMany({
                where: whereClause,
                include: {
                    _count: {
                        select: {
                            products: true,
                            subCategories: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),

            prisma.productCategory.count({
                where: whereClause
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProductsCat,
            totalPages: Math.ceil(totalProductsCat / limit),
            hasNextPage: page < Math.ceil(totalProductsCat / limit),
            hasPreviousPage: page > 1,
            productsCat
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

export const updateProductCat = async (req, res) => {
    let result = null;
    try {

        const { productCategoryName, tags } = req.body
        const { id, role } = req.user
        const productCatId = Number(req.params.id);

        const categoryName = productCategoryName.trim().toLowerCase();


        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }


        if (!categoryName) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }


        if (!productCatId) {
            return res.status(400).json({
                message: "Product cat is required",
                success: false
            })
        }


        const category = await prisma.productCategory.findUnique({
            where: {
                id: productCatId
            }
        });

        const duplicate = await prisma.productCategory.findFirst({
            where: {
                productCategoryName: categoryName,
                NOT: {
                    id: productCatId
                }
            }
        });


        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }



        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }


        if (role === "VENDOR" && id !== category.userId) {
            return res.status(400).json({
                message: "You cant't Update this category"
            })
        }

        if (req.file) {

            result = await uploadToCloudinary(req.file);
        }



        const productCatUpdate = await prisma.productCategory.update({
            where: {
                id: productCatId
            },
            data: {
                productCategoryName: categoryName,
                tags: tags ? JSON.parse(tags) : category.tags,
                userId: id,
                imageUrl: result ? result?.secure_url : category.imageUrl,
                imageId: result ? result?.public_id : category.imageId

            }
        })


        if (req.file) {



            if (category.imageId) {
                await cloudinary.uploader.destroy(category.imageId);
            }

        }


        return res.status(200).json({
            message: `Product Category Updated Successfully`,
            success: true
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

export const deleteProductCat = async (req, res) => {
    try {
        const { id, role } = req.user
        const productCatId = Number(req.params.id);


        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }


        const findProductCat = await prisma.productCategory.findFirst({
            where: {
                id: productCatId
            }
        })


        if (!findProductCat) {
            return res.status(404).json({
                success: false,
                message: "Product Category Not foynd"
            });
        }

        if (role === "VENDOR" && id !== findProductCat.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this category."
            });
        }



        const productCatDelete = await prisma.productCategory.update({
            where: {
                id: findProductCat?.id
            },
            data: {
                isDelete: !findProductCat?.isDelete
            }
        })


        return res.status(200).json({
            success: true,
            message: `Category ${!findProductCat?.isDelete ? "deleted" : "active"} successfully`
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}


export const getAllProductCategoryByVendor = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const { id: userId, role } = req.user;



        const skip = (page - 1) * limit;



        if (role !== "ADMIN" && role !== "VENDOR") {
            return res.status(403).json({
                success: false,
                message: "You don't have authority"
            });
        }

        const [productsCat, totalProductsCat] = await Promise.all([
            prisma.productCategory.findMany({
                where: {
                    isDelete: false,
                    userId: userId,
                },
                include: {
                    _count: {
                        select: {
                            products: true,
                            subCategories: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),

            prisma.productCategory.count({
                where: {
                    isDelete: false,
                    userId: userId,

                }
            })
        ]);

        return res.status(200).json({
            success: true,
            currentPage: page,
            perPage: limit,
            totalProductsCat,
            totalPages: Math.ceil(totalProductsCat / limit),
            hasNextPage: page < Math.ceil(totalProductsCat / limit),
            hasPreviousPage: page > 1,
            productsCat
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}


export const getCategoryTree = async (req, res) => {
    try {
        const categories = await prisma.productCategory.findMany({
            where: {
                isDelete: false
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                subCategories: {
                    where: {
                        isDelete: false
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};