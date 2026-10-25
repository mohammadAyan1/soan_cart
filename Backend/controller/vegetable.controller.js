import prisma from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";


export const createVegetableProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
            category,
            subCategory,
            tags,
            unit,
            price
        } = req.body;




        if (!productName || !category || !subCategory || !unit || !price) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const files = req.files || [];




        const productImageFile = req.files?.find(
            (file) => file.fieldname === "productImage"
        );









        let productImageResult = null;

        if (productImageFile) {
            productImageResult = await uploadToCloudinary(productImageFile);
        }

        const vegetableProduct = await prisma.vegetableProduct.create({
            data: {
                productName: productName.trim(),

                description: description?.trim() || null,

                categoryId: Number(category),
                subCategoryId: Number(subCategory),
                unitId: Number(unit),

                imageUrl: productImageResult?.secure_url || null,
                imageId: productImageResult?.public_id || null,

                price: Number(price),

                tags: tags
                    ? tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    : [],
            },
        });

        return res.status(201).json({
            success: true,
            message: "Vegetable Product Created Successfully",
            vegetableProduct
        });


    } catch (error) {
        try {
            if (productImageResult) {
                await cloudinary.uploader.destroy(productImageResult.public_id, {
                    resource_type: productImageResult.resource_type
                });
            }

            if (vegetableProduct) {
                await prisma.productCategory.delete({
                    where: {
                        id: productCat.id
                    }
                });
            }
        } catch (cleanupError) {

        }

        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}



export const fetchVegetableProduct = async (req, res) => {
    try {

        const { status = false, page, limit } = req.query;




        const vegetableProducts = await prisma.vegetableProduct.findMany({
            where: {
                isDelete: status == "false" ? false : true,
            },

            include: {
                category: true,
                subCategory: true,
                unit: true,
            },

            orderBy: {
                id: "desc",
            },
        });

        return res.status(201).json({
            success: true,
            message: "Vegetable Product Fetch Successfully",
            vegetableProducts
        });


    } catch (error) {

        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}



export const updateVegetableProduct = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(401).json({
                message: "ID is required",
                success: false
            })
        }


        const {
            productName,
            description,
            category,
            subCategory,
            tags,
            unit,
            price,
            imageId,
            imageUrl
        } = req.body;

        if (!productName || !category || !subCategory || !unit || !price) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const productImageFile = req.files?.find(
            (file) => file.fieldname === "productImage"
        );


        let productImageResult = null;

        if (productImageFile) {
            productImageResult = await uploadToCloudinary(productImageFile);
        }

        const vegetableProduct = await prisma.vegetableProduct.update({

            where: {
                id: Number(id),
            },
            data: {
                productName: productName.trim(),

                description: description?.trim() || null,

                categoryId: Number(category),
                subCategoryId: Number(subCategory),
                unitId: Number(unit),

                imageUrl: productImageResult?.secure_url || imageUrl,
                imageId: productImageResult?.public_id || imageId,

                price: Number(price),

                tags: tags
                    ? tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    : [],
            },
        });

        return res.status(201).json({
            success: true,
            message: "Vegetable Product Updated Successfully",
            vegetableProduct
        });


    } catch (error) {
        try {
            if (productImageResult) {
                await cloudinary.uploader.destroy(productImageResult.public_id, {
                    resource_type: productImageResult.resource_type
                });
            }

            if (vegetableProduct) {
                await prisma.productCategory.delete({
                    where: {
                        id: productCat.id
                    }
                });
            }
        } catch (cleanupError) {

        }

        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}




export const toggleVegetableProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "ID is required",
                success: false,
            });
        }

        const vegetableProduct = await prisma.vegetableProduct.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!vegetableProduct) {
            return res.status(404).json({
                message: "Vegetable Product not found",
                success: false,
            });
        }

        const updatedVegetableProduct =
            await prisma.vegetableProduct.update({
                where: {
                    id: Number(id),
                },
                data: {
                    isDelete: !vegetableProduct.isDelete,
                },
            });

        return res.status(200).json({
            success: true,
            message: `Vegetable Product ${vegetableProduct.isDelete
                ? "Un Deleted"
                : "Deleted"
                } Successfully`,
            vegetableProduct: updatedVegetableProduct,
        });

    } catch (error) {


        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};