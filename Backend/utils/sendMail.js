// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export const sendOTPEmail = async (toEmail, subject, html) => {
//     await transporter.sendMail({
//         from: process.env.EMAIL_FROM,
//         to: toEmail,
//         subject: subject,
//         html: html,
//     });
// };


import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (toEmail, subject, html) => {
    try {
        const data = await resend.emails.send({
            // Jab tak aap apna khud ka domain verify nahi karte, 
            // tab tak 'onboarding@resend.dev' ka use karein (testing ke liye best hai)
            from: 'onboarding@resend.dev',
            to: toEmail,
            subject: subject,
            html: html,
        });

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     secure: true,

//     family: 4, // Force IPv4

//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export const sendOTPEmail = async (toEmail, subject, html) => {
//     await transporter.sendMail({
//         from: process.env.EMAIL_FROM,
//         to: toEmail,
//         subject,
//         html,
//     });
// };