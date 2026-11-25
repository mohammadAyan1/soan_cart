import prisma from "../config/prisma.js";

const adminOnly = (req, res) => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "You don't have authority" });
        return false;
    }
    return true;
};

export const createServiceZone = async (req, res) => {
    try {


        if (!adminOnly(req, res)) return;

        const {
            zoneName,
            district,
            state,
            city,
            village,
            centerLatitude,
            centerLongitude,
            radiusKm
        } = req.body;

        const lat = Number(centerLatitude);
        const lng = Number(centerLongitude);
        const radius = Number(radiusKm);

        if (
            !zoneName ||
            !district ||
            !state ||
            !Number.isFinite(lat) ||
            lat < -90 || lat > 90 ||
            !Number.isFinite(lng) ||
            lng < -180 || lng > 180 ||
            !Number.isFinite(radius) ||
            radius <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid service zone details"
            });
        }

        const zone = await prisma.serviceZone.create({
            data: {
                zoneName,
                district,
                state,
                city,
                village,
                centerLatitude: lat,
                centerLongitude: lng,
                radiusKm: radius
            }
        });

        return res.status(201).json({
            success: true,
            message: "Service zone created successfully",
            data: zone
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to create service zone"
        });
    }
};

// ==========================================
// GET /api/service-zones - Admin List all zones
// ==========================================
export const getServiceZones = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const zones = await prisma.serviceZone.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { locationLogs: true }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: zones
        });
    } catch (error) {
        console.error("getServiceZones error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch service zones"
        });
    }
};

// ==========================================
// PUT /api/service-zones/:id - Update zone
// ==========================================
export const updateServiceZone = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const id = Number(req.params.id);
        const {
            zoneName,
            district,
            state,
            city,
            village,
            centerLatitude,
            centerLongitude,
            radiusKm,
            isActive
        } = req.body;

        const updateData = {};
        if (zoneName) updateData.zoneName = zoneName;
        if (district) updateData.district = district;
        if (state) updateData.state = state;
        if (city !== undefined) updateData.city = city;
        if (village !== undefined) updateData.village = village;
        if (centerLatitude !== undefined) updateData.centerLatitude = Number(centerLatitude);
        if (centerLongitude !== undefined) updateData.centerLongitude = Number(centerLongitude);
        if (radiusKm !== undefined) updateData.radiusKm = Number(radiusKm);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const updated = await prisma.serviceZone.update({
            where: { id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Service zone updated successfully",
            data: updated
        });
    } catch (error) {
        console.error("updateServiceZone error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update service zone"
        });
    }
};

// ==========================================
// DELETE /api/service-zones/:id - Delete zone
// ==========================================
export const deleteServiceZone = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const id = Number(req.params.id);

        // Delete logs first if required or delete zone
        await prisma.locationCheckLog.deleteMany({
            where: { serviceZoneId: id }
        });

        await prisma.serviceZone.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Service zone deleted successfully"
        });
    } catch (error) {
        console.error("deleteServiceZone error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete service zone"
        });
    }
};

// ==========================================
// PATCH /api/service-zones/:id/status - Toggle active
// ==========================================
export const toggleServiceZoneStatus = async (req, res) => {
    try {
        if (!adminOnly(req, res)) return;

        const id = Number(req.params.id);
        const existing = await prisma.serviceZone.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Zone not found" });
        }

        const updated = await prisma.serviceZone.update({
            where: { id },
            data: { isActive: !existing.isActive }
        });

        return res.status(200).json({
            success: true,
            message: `Service zone ${updated.isActive ? "activated" : "deactivated"}`,
            data: updated
        });
    } catch (error) {
        console.error("toggleServiceZoneStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to toggle status"
        });
    }
};