import prisma from "../config/prisma.js";

/**
 * CREATE UNIT
 * POST /api/unit
 */
export const createUnit = async (req, res) => {
    try {
        const { name, shortName } = req.body;

        console.log(name);
        console.log(shortName);


        // Validation
        if (!name || !shortName) {
            return res.status(400).json({
                success: false,
                message: "unitName and shortName are required"
            });
        }

        // Check duplicate name
        const existingName = await prisma.unit.findUnique({
            where: {
                name: name.trim()
            }
        });

        if (existingName) {
            return res.status(409).json({
                success: false,
                message: "Unit name already exists"
            });
        }

        // Check duplicate short name
        const existingShortName = await prisma.unit.findUnique({
            where: {
                shortName: shortName.trim()
            }
        });

        if (existingShortName) {
            return res.status(409).json({
                success: false,
                message: "Unit short name already exists"
            });
        }

        const unit = await prisma.unit.create({
            data: {
                name: name.trim(),
                shortName: shortName.trim()
            }
        });

        return res.status(201).json({
            success: true,
            message: "Unit created successfully",
            data: unit
        });

    } catch (error) {
        console.error("Create Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * GET ALL UNITS
 * GET /api/unit
 */
export const getAllUnits = async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            where: {
                isDelete: false
            },
            orderBy: {
                id: "desc"
            }
        });

        return res.status(200).json({
            success: true,
            message: "Units fetched successfully",
            count: units.length,
            data: units
        });

    } catch (error) {
        console.error("Get All Units Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * GET UNIT BY ID
 * GET /api/unit/:id
 */
export const getUnitById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID"
            });
        }

        const unit = await prisma.unit.findFirst({
            where: {
                id,
                isDelete: false
            }
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Unit fetched successfully",
            data: unit
        });

    } catch (error) {
        console.error("Get Unit By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * UPDATE UNIT
 * PUT /api/unit/:id
 */
export const updateUnit = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { unitName, shortName } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID"
            });
        }

        if (!unitName || !shortName) {
            return res.status(400).json({
                success: false,
                message: "unitName and shortName are required"
            });
        }

        // Check unit exists
        const existingUnit = await prisma.unit.findFirst({
            where: {
                id,
                isDelete: false
            }
        });

        if (!existingUnit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        // Check duplicate name
        const duplicateName = await prisma.unit.findFirst({
            where: {
                name: unitName.trim(),
                NOT: {
                    id
                }
            }
        });

        if (duplicateName) {
            return res.status(409).json({
                success: false,
                message: "Unit name already exists"
            });
        }

        // Check duplicate short name
        const duplicateShortName = await prisma.unit.findFirst({
            where: {
                shortName: shortName.trim(),
                NOT: {
                    id
                }
            }
        });

        if (duplicateShortName) {
            return res.status(409).json({
                success: false,
                message: "Unit short name already exists"
            });
        }

        const unit = await prisma.unit.update({
            where: {
                id
            },
            data: {
                name: unitName.trim(),
                shortName: shortName.trim()
            }
        });

        return res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: unit
        });

    } catch (error) {
        console.error("Update Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * SOFT DELETE UNIT
 * DELETE /api/unit/:id
 */
export const deleteUnit = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID"
            });
        }

        const unit = await prisma.unit.findFirst({
            where: {
                id,
                isDelete: false
            }
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        const deletedUnit = await prisma.unit.update({
            where: {
                id
            },
            data: {
                isDelete: true,
                isActive: false
            }
        });

        return res.status(200).json({
            success: true,
            message: "Unit deleted successfully",
            data: deletedUnit
        });

    } catch (error) {
        console.error("Delete Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * RESTORE UNIT
 * PATCH /api/unit/:id/restore
 */
export const restoreUnit = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID"
            });
        }

        const unit = await prisma.unit.findFirst({
            where: {
                id,
                isDelete: true
            }
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Deleted unit not found"
            });
        }

        const restoredUnit = await prisma.unit.update({
            where: {
                id
            },
            data: {
                isDelete: false,
                isActive: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Unit restored successfully",
            data: restoredUnit
        });

    } catch (error) {
        console.error("Restore Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


/**
 * ACTIVATE / DEACTIVATE UNIT
 * PATCH /api/unit/:id/status
 */
export const toggleUnitStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid unit ID"
            });
        }

        const unit = await prisma.unit.findFirst({
            where: {
                id,
                isDelete: false
            }
        });

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        const updatedUnit = await prisma.unit.update({
            where: {
                id
            },
            data: {
                isActive: !unit.isActive
            }
        });

        return res.status(200).json({
            success: true,
            message: `Unit ${updatedUnit.isActive ? "activated" : "deactivated"
                } successfully`,
            data: updatedUnit
        });

    } catch (error) {
        console.error("Toggle Unit Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};