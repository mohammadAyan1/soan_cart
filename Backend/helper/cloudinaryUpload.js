import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (file) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder: "onlineMarket",
                resource_type: "auto"
            },

            (error, result) => {

                if (error) return reject(error);

                resolve(result);
            }

        );

        streamifier.createReadStream(file.buffer).pipe(stream);

    });

};