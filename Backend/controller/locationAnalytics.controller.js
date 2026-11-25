import prisma from "../config/prisma.js";
const adminOnly = (req, res) => {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "You don't have authority" });
        return false;
    }
    return true;
};

export const getLocationAnalytics = async (req, res) => {

    try {

        if (!adminOnly(req, res)) return;


        const totalChecks = await prisma.locationCheckLog.count();

        const insideCount = await prisma.locationCheckLog.count({
            where: {
                isWithinRange: true
            }
        });

        const outsideCount = await prisma.locationCheckLog.count({
            where: {
                isWithinRange: false
            }
        });

        const distanceStats = await prisma.locationCheckLog.aggregate({

            _avg: {
                distanceKm: true
            },

            _max: {
                distanceKm: true
            }

        });

        const outsideUsers = await prisma.locationCheckLog.findMany({

            where: {
                isWithinRange: false
            },

            orderBy: {
                checkedAt: "desc"
            },

            take: 50,

            select: {
                id: true,
                userId: true,
                latitude: true,
                longitude: true,
                distanceKm: true,
                allowedRadiusKm: true,
                checkedAt: true,
                platform: true,
                checkSource: true
            }

        });

        return res.status(200).json({

            success: true,

            analytics: {

                totalChecks,
                insideCount,
                outsideCount,

                averageDistanceKm:
                    Number(distanceStats._avg.distanceKm ?? 0),

                maximumDistanceKm:
                    Number(distanceStats._max.distanceKm ?? 0)

            },

            outsideUsers: outsideUsers.map(user => ({

                ...user,

                latitude: Number(user.latitude),
                longitude: Number(user.longitude),
                distanceKm: Number(user.distanceKm),
                allowedRadiusKm: Number(user.allowedRadiusKm)

            }))

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch location analytics"
        });

    }

};