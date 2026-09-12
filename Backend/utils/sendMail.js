

import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (toEmail, subject, html) => {
    try {
        const data = await resend.emails.send({
            // Jab tak aap apna khud ka domain verify nahi karte, 
            // tab tak 'onboarding@resend.dev' ka use karein (testing ke liye best hai)
            // from: 'onboarding@resend.dev',
            from: 'support@sounkart.com', // Ya aap 'no-reply@sounkart.com' bhi rakh sakte hain
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

