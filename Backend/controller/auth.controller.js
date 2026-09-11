import jwt from "jsonwebtoken"
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt"
import { sendOTPEmail } from "../utils/sendMail.js";
import { json } from "express";
import { uploadToCloudinary } from "../helper/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
import { mergeGuestWishlistIntoUser } from "../utils/wishlistMerge.service.js"; // 👈 badla hua import
import { mergeGuestCartIntoUser } from "../utils/cartMerge.service.js";
import { getRequestContext } from "../utils/requestContext.util.js";
import { createOrUpdateSession } from "./session.controller.js";

// Aur auth.controller.js ke andar wala purana createOrUpdateSession
// function + getClientIp function - DONO DELETE kar do, ab session.controller.js
// wala use hoga


import { v4 as uuidv4 } from "uuid";
import geoip from "geoip-lite";


// apne existing auth controller me is function ko add kar do
export const savePushToken = async (req, res) => {
    try {
        const userId = req.user.id; // requiredAuth middleware se aa raha hai
        const { pushToken } = req.body;

        if (!pushToken) {
            return res.status(400).json({
                message: "Push token required hai",
                success: false,
            });
        }

        await prisma.pushToken.upsert({
            where: { token: pushToken },
            update: { userId },
            create: { token: pushToken, userId },
        });

        return res.status(200).json({
            message: "Push token saved successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};


export const register = async (req, res) => {
    let result = null;
    let user = null;
    try {

        const { phone, fullName, email, password } = req.body

        if (!phone || !fullName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        if (phone.length > 10 || phone.length < 10) {
            return res.status(400).json({
                message: "Phone number must be 10 digit",
                success: false
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }



        const nameRegex = /^[A-Za-z ]{2,50}$/;

        if (!nameRegex.test(fullName)) {
            return res.status(400).json({
                message: "Please enter a valid full name.",
                success: false
            });
        }

        const isValidPhone = /^\d{10}$/.test(phone);

        if (!isValidPhone) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits only.",
                success: false
            });
        }



        if (password.length < 8) {
            return res.status(400).json({
                message: "Password Must be 8 digit aur greater",
                success: false
            })
        }

        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

        // const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;


        const checkPasswordStrong = regex.test(password)

        if (!checkPasswordStrong) {
            return res.status(400).json({
                message: "Password Must be Contain at least one Capital character and some of  digit and also One Special character",
                success: false
            })
        }

        const findUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone },
                    { email }
                ]
            }
        });


        if (findUser) {
            return res.status(400).json({
                message: "User Already existed with phone or email",
                success: false
            })
        }


        const otp = Math.floor(100000 + Math.random() * 900000)
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);


        if (req.file) {
            result = await uploadToCloudinary(req.file);

        }



        const hashPassword = await bcrypt.hash(password, 10)

        user = await prisma.user.create({
            data: {
                fullName,
                phone,
                email,
                password: hashPassword,      // Abhi plain text, baad me hash karenge
                actual_password: password,
                otp: otp.toString(),
                otpExpiry: otpExpires,
                imageUrl: result?.secure_url ?? null,
                imageId: result?.public_id ?? null
            }
        });


        const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;


        await sendOTPEmail(
            email,
            "Email Verification OTP",
            html
        );

        return res.status(201).json({
            message: "Please check your email to verify your account.",
            success: true
        });


    } catch (error) {

        try {
            if (result) {
                await cloudinary.uploader.destroy(result.public_id, {
                    resource_type: result.resource_type
                });
            }

            if (user) {
                await prisma.user.delete({
                    where: {
                        id: user.id
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

export const VendorRegister = async (req, res) => {
    let result = null;
    let user = null;
    try {

        const { phone, fullName, email, password } = req.body

        if (!phone || !fullName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        if (phone.length > 10 || phone.length < 10) {
            return res.status(400).json({
                message: "Phone number must be 10 digit",
                success: false
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }



        const nameRegex = /^[A-Za-z ]{2,50}$/;

        if (!nameRegex.test(fullName)) {
            return res.status(400).json({
                message: "Please enter a valid full name.",
                success: false
            });
        }

        const isValidPhone = /^\d{10}$/.test(phone);

        if (!isValidPhone) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits only.",
                success: false
            });
        }



        if (password.length < 8) {
            return res.status(400).json({
                message: "Password Must be 8 digit aur greater",
                success: false
            })
        }

        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

        // const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;


        const checkPasswordStrong = regex.test(password)

        if (!checkPasswordStrong) {
            return res.status(400).json({
                message: "Password Must be Contain at least one Capital character and some of  digit and also One Special character",
                success: false
            })
        }

        const findUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone },
                    { email }
                ]
            }
        });


        if (findUser) {
            return res.status(400).json({
                message: "User Already existed with phone or email",
                success: false
            })
        }


        const otp = Math.floor(100000 + Math.random() * 900000)
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);


        if (req.file) {
            result = await uploadToCloudinary(req.file);

        }



        const hashPassword = await bcrypt.hash(password, 10)

        user = await prisma.user.create({
            data: {
                fullName,
                phone,
                email,
                password: hashPassword,      // Abhi plain text, baad me hash karenge
                actual_password: password,
                otp: otp.toString(),
                otpExpiry: otpExpires,
                imageUrl: result?.secure_url ?? null,
                imageId: result?.public_id ?? null,
                role: "VENDOR",
            }
        });


        const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;


        await sendOTPEmail(
            email,
            "Email Verification OTP",
            html
        );

        return res.status(201).json({
            message: "Please check your email to verify your account.",
            success: true
        });


    } catch (error) {

        try {
            if (result) {
                await cloudinary.uploader.destroy(result.public_id, {
                    resource_type: result.resource_type
                });
            }

            if (user) {
                await prisma.user.delete({
                    where: {
                        id: user.id
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

export const verifyOtp = async (req, res) => {
    try {

        const { otp, email } = req.body



        if (!otp || !email) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }


        const findUser = await prisma.user.findFirst({
            where: {
                email
            }
        });


        if (!findUser) {
            return res.status(400).json({
                message: "User did not found with this email",
                success: false
            })
        }

        const currentTime = new Date(Date.now());

        if (findUser?.otpExpiry < currentTime) {
            return res.status(400).json({
                message: `OTP Expired Please Click to  Resend Button To generate a new OTP`,
                success: false
            })
        }


        if (findUser?.otp != otp) {
            return res.status(400).json({
                message: `Invalid OTP`,
                success: false
            })
        }


        const user = await prisma.user.update({
            where: {
                email
            },
            data: {
                otp: null,
                otpExpiry: null,
                isVerified: true
            }
        });

        return res.status(200).json({
            message: "OTP Verified Successfully",
            success: true
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

export const resendOtp = async (req, res) => {
    try {

        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }

        const findUser = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!findUser) {
            return res.status(400).json({
                message: "User did not found with this email",
                success: false
            })
        }


        const otp = Math.floor(100000 + Math.random() * 900000)
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);


        const user = await prisma.user.update({
            where: {
                email
            },
            data: {
                otp: otp.toString(),
                otpExpiry: otpExpires
            }
        });



        const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;


        await sendOTPEmail(
            email,
            "Email Verification OTP",
            html
        );

        res.status(200).json({
            message: "OTP resend Successfully",
            status: true
        })



    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body

        if (!email || !password || !otp) {
            return res.status(400).json({
                message: "All fielsd are required",
                success: false
            })
        }



        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }



        if (password.length < 8) {
            return res.status(400).json({
                message: "Password Must be 8 digit aur greater",
                success: false
            })
        }

        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

        // const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;


        const checkPasswordStrong = regex.test(password)

        if (!checkPasswordStrong) {
            return res.status(400).json({
                message: "Password Must be Contain at least one Capital character and some of  digit and also One Special character",
                success: false
            })
        }


        const findUser = await prisma.user.findFirst({
            where: {
                email
            }
        })



        if (!findUser) {
            return res.status(400).json({
                message: "User did not found with this number",
                success: false
            })
        }

        if (findUser?.otp != otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                success: false
            });
        }


        if (findUser.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            })
        }

        const isPasswordMatch = await bcrypt.compare(
            password,          // User ka entered password
            findUser.password      // Database me stored hashed password
        );

        if (isPasswordMatch) {
            return res.status(400).json({
                message: "You'r inserting the Same password",
                success: false
            });
        }


        const hash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hash,
                otp: null,
                otpExpiry: null,
                actual_password: password
            }
        })


        res.status(200).json({
            message: "Password Forget Successfully",
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false,
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false,
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password Must be 8 digit aur greater",
                success: false,
            });
        }

        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;
        const checkPasswordStrong = regex.test(password);

        if (!checkPasswordStrong) {
            return res.status(400).json({
                message: "Password Must be Contain at least one Capital character and some of  digit and also One Special character",
                success: false,
            });
        }

        const findUser = await prisma.user.findUnique({ where: { email } });

        if (!findUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        if (!findUser.isVerified) {
            return res.status(400).json({
                message: "Please verify your email first",
                success: false,
            });
        }

        if (findUser.isDelete) {
            return res.status(400).json({
                message: "Your account has been deleted",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, findUser.password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
            });
        }

        const token = jwt.sign(
            { id: findUser.id, email: findUser.email, role: findUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // 👇 NAYI LINE - session create/update karo
        const session = await createOrUpdateSession(req, findUser.id);


        // ---------------- 👇 GUEST CART + WISHLIST MERGE (sirf header ho tabhi) ----------------
        const guestId = req.headers["x-guest-id"];
        let guestCartMerged = false;
        let guestWishlistMerged = false;

        if (guestId) {
            const context = getRequestContext(req);

            try {
                const cartMergeResult = await mergeGuestCartIntoUser(findUser.id, guestId, context, "AUTO");
                guestCartMerged = cartMergeResult.merged;
            } catch (mergeError) {
                console.error("Guest cart merge error:", mergeError);
                guestCartMerged = false;
            }

            try {
                const wishlistMergeResult = await mergeGuestWishlistIntoUser(findUser.id, guestId, context, "AUTO");
                guestWishlistMerged = wishlistMergeResult.merged;
            } catch (mergeError) {
                console.error("Guest wishlist merge error:", mergeError);
                guestWishlistMerged = false;
            }
        }


        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: findUser.id,
                fullName: findUser.fullName,
                email: findUser.email,
                phone: findUser.phone,
                role: findUser.role,
                imageUrl: findUser?.imageUrl,
            },
            token,
            sessionId: session?.sessionId || null, // 👈 NAYI LINE
            guestCartMerged, // 👈 frontend isi flag se decide karega guestId remove karni hai ya nahi (cart)
            guestWishlistMerged, // 👈 same, wishlist ke liye
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};




export const logout = async (req, res) => {
    try {
        // 👇 NAYA - current device ka session bhi database me inactive
        // mark ho jaye, taaki Manage Devices list se bhi hat jaye
        const sessionId = req.headers["x-session-id"];
        if (sessionId) {
            await prisma.userSession.updateMany({
                where: { sessionId },
                data: {
                    isActive: false,
                    endedAt: new Date(),
                    endedBy: "USER",
                },
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            message: "Logout successful",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
};


export const updateProfile = async (req, res) => {
    let result = null;
    try {
        const { phone, fullName, email } = req.body

        const { id, imageId, imageUrl } = req.user




        if (!phone || !fullName || !email) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        if (phone.length > 10 || phone.length < 10) {
            return res.status(400).json({
                message: "Phone number must be 10 digit",
                success: false
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                success: false
            });
        }

        const nameRegex = /^[A-Za-z ]{2,50}$/;

        if (!nameRegex.test(fullName)) {
            return res.status(400).json({
                message: "Please enter a valid full name.",
                success: false
            });
        }

        const isValidPhone = /^\d{10}$/.test(phone);

        if (!isValidPhone) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits only.",
                success: false
            });
        }

        if (req.file) {

            if (imageId) {
                await cloudinary.uploader.destroy(imageId);
            }

            result = await uploadToCloudinary(req.file);
        }


        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ],
                NOT: {
                    id: req.user.id
                }
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User Already existed with phone or email",
                success: false
            })
        }

        const updateUser = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                fullName,
                phone,
                email,
                imageUrl: result ? result?.secure_url : imageUrl,
                imageId: result ? result?.public_id : imageId
            }
        })




        return res.status(200).json({
            message: `User Profile Updated Successfully`,
            success: true,
            user: {
                id: updateUser.id,
                fullName: updateUser.fullName,
                email: updateUser.email,
                phone: updateUser.phone,
                role: updateUser.role,
                imageUrl: updateUser.imageUrl
            }
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
}

// apne existing auth controller me is function ko add kar do
export const getMe = async (req, res) => {
    try {
        const user = req.user; // requiredAuth middleware se already mil raha hai




        return res.status(200).json({
            message: "User fetched successfully",
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                imageUrl: user.imageUrl,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};