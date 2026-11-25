import { verifyUserLocation } from "../services/location.service.js";

export const checkUserLocation = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            accuracyMeters,
            platform,
            checkSource
        } = req.body;

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            latitude === undefined ||
            longitude === undefined ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid latitude or longitude"
            });

        }

        const result = await verifyUserLocation({

            userId: req.user?.id ?? null,

            latitude: lat,
            longitude: lng,

            accuracyMeters:
                accuracyMeters != null &&
                    Number.isFinite(Number(accuracyMeters))
                    ? Number(accuracyMeters)
                    : null,

            platform,
            checkSource

        });

        return res.status(200).json({

            success: true,
            ...result

        });

    } catch (error) {

        console.error("Location Check Error:", error);

        return res.status(500).json({

            success: false,
            message: "Unable to verify service availability"

        });

    }

};