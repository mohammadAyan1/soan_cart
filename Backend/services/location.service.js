import prisma from "../config/prisma.js";
import { calculateDistance } from "../utils/calculateDistance.js";

export const verifyUserLocation = async ({
    userId,
    latitude,
    longitude,
    accuracyMeters,
    platform,
    checkSource
}) => {

    const zones = await prisma.serviceZone.findMany({
        where: {
            isActive: true
        }
    });

    // ================= OLD CODE (COMMENTED) =================
    // if (!zones.length) {
    //     throw new Error("No active service zones found");
    // }
    // ========================================================
    if (!zones.length) {
        return {
            available: false,
            message: "No active service zones configured",
            selectedZone: null,
            distanceKm: 0,
            allowedRadiusKm: 0,
            outsideByKm: 0,
            locationLogId: null
        };
    }

    // Calculate distance from every active zone
    const calculatedZones = zones.map(zone => {

        const distance = calculateDistance(
            latitude,
            longitude,
            Number(zone.centerLatitude),
            Number(zone.centerLongitude)
        );

        const radius = Number(zone.radiusKm);

        return {
            zone,
            distance,
            radius,
            available: distance <= radius
        };

    });

    // Find nearest zone where user is inside radius
    const matchingZones = calculatedZones
        .filter(item => item.available)
        .sort((a, b) => a.distance - b.distance);

    // If no zone matches, select the nearest active zone
    const nearestZone = calculatedZones
        .sort((a, b) => a.distance - b.distance)[0];

    const selected = matchingZones[0] || nearestZone;

    const {
        zone,
        distance,
        radius,
        available
    } = selected;

    // Save analytics
    const log = await prisma.locationCheckLog.create({
        data: {
            userId: userId ?? null,

            serviceZoneId: zone.id,

            latitude,
            longitude,

            distanceKm: distance,
            allowedRadiusKm: radius,

            accuracyMeters: accuracyMeters ?? null,

            isWithinRange: available,

            platform: platform ?? null,
            checkSource: checkSource ?? "APP_OPEN"
        }
    });

    return {

        available,

        message: available
            ? "Service available"
            : "Out of Service Range",

        selectedZone: {
            id: zone.id,
            zoneName: zone.zoneName,
            district: zone.district,
            state: zone.state
        },

        distanceKm: Number(distance.toFixed(3)),

        allowedRadiusKm: radius,

        outsideByKm: Number(
            Math.max(0, distance - radius).toFixed(3)
        ),

        locationLogId: log.id

    };
};