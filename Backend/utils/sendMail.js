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


import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,

    family: 4, // Force IPv4

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (toEmail, subject, html) => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject,
        html,
    });
};