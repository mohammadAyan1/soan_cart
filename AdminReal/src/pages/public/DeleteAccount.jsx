
import React from "react";
import { Link } from "react-router-dom";

import {
    Trash2,
    Mail,
    ShieldCheck,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const SUPPORT_EMAIL = "support@sounkart.com";

export default function DeleteAccount() {

    const subject = encodeURIComponent(
        "SounKart Account Deletion Request"
    );

    const body = encodeURIComponent(
        "Hello SounKart Support,\n\n" +
        "I would like to request deletion of my SounKart account.\n\n" +
        "Registered Mobile Number:\n" +
        "Registered Email:\n\n" +
        "Please verify my identity and process my account deletion request.\n\n" +
        "Thank you."
    );

    const deletionMail = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-800">

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">

                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

                    <Link
                        to="/privacy-policy"
                        className="flex items-center gap-2.5"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-200">
                            S
                        </span>

                        <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                            SounKart
                        </span>
                    </Link>

                    <Link
                        to="/privacy-policy"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 sm:text-sm"
                    >
                        <ArrowLeft size={17} />
                        <span>Privacy Policy</span>
                    </Link>

                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:py-20">

                {/* Hero */}
                <div className="text-center">

                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-sm">
                        <Trash2 size={38} />
                    </div>

                    <span className="text-xs font-extrabold tracking-[3px] text-blue-600">
                        SOUNKART ACCOUNT MANAGEMENT
                    </span>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                        Request Account Deletion
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-slate-600">
                        If you no longer wish to use SounKart, you can
                        contact our support team to request deletion
                        of your account and associated personal information.
                    </p>

                </div>

                {/* Deletion Request Card */}
                <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">

                    <h2 className="text-xl font-bold text-slate-900">
                        How to request account deletion
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        Follow these steps to submit your request.
                    </p>

                    <div className="mt-8 space-y-7">

                        {[
                            "Click the Send Deletion Request button below.",
                            "Enter your registered mobile number and email address.",
                            "Our support team may verify your identity.",
                            "After verification, your request will be reviewed and processed.",
                        ].map((step, index) => (

                            <div key={index} className="flex gap-4">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-extrabold text-blue-600">
                                    {index + 1}
                                </div>

                                <p className="pt-1 text-sm leading-7 text-slate-600">
                                    {step}
                                </p>

                            </div>

                        ))}

                    </div>

                    <a
                        href={deletionMail}
                        className="mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 text-center text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                        <Mail size={19} />
                        Send Account Deletion Request
                    </a>

                    <p className="mt-4 text-center text-xs leading-6 text-slate-400">
                        Your email application will open with a pre-filled
                        deletion request.
                    </p>

                </section>

                {/* Information Cards */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">

                        <ShieldCheck size={28} className="text-blue-600" />

                        <h3 className="mt-4 font-bold text-slate-900">
                            Identity Verification
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            We may verify your registered account details
                            before processing your deletion request.
                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">

                        <Clock size={28} className="text-blue-600" />

                        <h3 className="mt-4 font-bold text-slate-900">
                            Request Processing
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            Our support team will review your request
                            and communicate the next steps.
                        </p>

                    </div>

                </div>

                {/* Data Retention Notice */}
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">

                    <div className="flex items-center gap-3">

                        <AlertCircle className="shrink-0 text-amber-600" size={22} />

                        <h3 className="font-bold text-amber-900">
                            Important Information
                        </h3>

                    </div>

                    <p className="mt-3 text-sm leading-7 text-amber-800">
                        Certain order, payment, transaction, security and
                        legally required records may be retained where
                        required or permitted by applicable law.
                        Account deactivation alone does not mean that
                        all personal data has been deleted.
                    </p>

                </div>

                {/* Support */}
                <div className="mt-10 text-center">

                    <p className="text-sm text-slate-500">
                        Need help with your request?
                    </p>

                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="mt-3 inline-flex items-center gap-2 font-bold text-blue-600 hover:underline"
                    >
                        <Mail size={17} />
                        {SUPPORT_EMAIL}
                    </a>

                </div>

                {/* Back Button */}
                <div className="mt-10 text-center">

                    <Link
                        to="/privacy-policy"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                        <ArrowLeft size={17} />
                        Back to Privacy Policy
                    </Link>

                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white px-5 py-8">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">

                    <span className="text-sm font-bold text-slate-700">
                        © 2026 SounKart. All rights reserved.
                    </span>

                    <Link
                        to="/privacy-policy"
                        className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                        Privacy Policy
                    </Link>

                </div>

            </footer>

        </div>
    );
}
