
import React from "react";
import { Link } from "react-router-dom";

import {
    ShieldCheck,
    Mail,
    ShoppingBag,
    ArrowRight,
    LockKeyhole,
    Trash2,
    MapPin,
    CreditCard,
    UserRound,
    Database,
    FileText,
} from "lucide-react";

const SUPPORT_EMAIL = "support@sounkart.com";

const sections = [
    {
        title: "1. Information We Collect",
        icon: UserRound,
        content: (
            <>
                <p>
                    Depending on the features you use, SounKart may collect
                    the following information:
                </p>
                <ul>
                    <li>Name and account information.</li>
                    <li>Mobile number and email address.</li>
                    <li>Delivery and billing addresses.</li>
                    <li>Order history and purchased product information.</li>
                    <li>Payment transaction references and payment status.</li>
                    <li>Device and technical information necessary for app functionality.</li>
                    <li>
                        Location information when permission is granted and
                        a relevant feature uses it.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "2. How We Use Your Information",
        icon: Database,
        content: (
            <>
                <p>We may use your information for the following purposes:</p>
                <ul>
                    <li>To create and manage customer accounts.</li>
                    <li>To authenticate users.</li>
                    <li>To process customer orders.</li>
                    <li>To coordinate product deliveries.</li>
                    <li>To provide customer support.</li>
                    <li>To send order and payment updates.</li>
                    <li>To improve application performance and security.</li>
                    <li>To prevent fraud and unauthorised activities.</li>
                </ul>
            </>
        ),
    },
    {
        title: "3. Payment Information",
        icon: CreditCard,
        content: (
            <>
                <p>
                    SounKart supports online payments through Razorpay and
                    Cash on Delivery (COD), where available.
                </p>
                <p>
                    Online payments are processed through Razorpay according
                    to its applicable security and privacy practices.
                    We may receive payment confirmation, transaction
                    references and payment status to manage your orders.
                </p>
                <p>
                    Users should only enter sensitive payment credentials,
                    such as UPI PINs and card PINs, through the authorised
                    payment provider interface.
                </p>
            </>
        ),
    },
    {
        title: "4. Location Permission",
        icon: MapPin,
        content: (
            <>
                <p>
                    SounKart may request access to your device location for
                    relevant location-based features, such as delivery-related
                    services.
                </p>
                <p>
                    You can manage or revoke location permissions through
                    your Android device settings. Features requiring location
                    access may not work when permission is disabled.
                </p>
            </>
        ),
    },
    {
        title: "5. Sharing of Information",
        icon: UserRound,
        content: (
            <>
                <p>We may share necessary information with:</p>
                <ul>
                    <li>
                        <strong>Vendors:</strong> Information required to
                        fulfil your orders.
                    </li>
                    <li>
                        <strong>Payment Providers:</strong> Razorpay for
                        processing online payments.
                    </li>
                    <li>
                        <strong>Service Providers:</strong> Hosting,
                        infrastructure and technical service providers.
                    </li>
                    <li>
                        <strong>Legal Authorities:</strong> When disclosure
                        is required by applicable law.
                    </li>
                </ul>
                <p>We do not sell your personal information.</p>
            </>
        ),
    },
    {
        title: "6. Data Security",
        icon: LockKeyhole,
        content: (
            <p>
                We take reasonable technical and organisational measures
                to protect your information against unauthorised access,
                misuse, loss or disclosure. However, no method of
                electronic transmission or storage is completely secure.
            </p>
        ),
    },
    {
        title: "7. Data Retention",
        icon: Database,
        content: (
            <p>
                We retain information for as long as necessary to provide
                our services, fulfil orders, resolve disputes and comply
                with applicable legal requirements. Certain order,
                transaction and payment records may need to be retained
                where required by law.
            </p>
        ),
    },
    {
        title: "8. Account and Data Deletion",
        icon: Trash2,
        content: (
            <>
                <p>
                    If you no longer wish to use SounKart, you can contact
                    our support team to request deletion of your account
                    and associated personal information.
                </p>
                <p>
                    Our support team may verify your identity before
                    processing your request.
                </p>
                <p>
                    Account deactivation alone does not mean that all
                    personal information has been deleted. Eligible
                    personal information will be handled according to
                    applicable deletion and retention requirements.
                </p>
                <p>
                    Certain order, payment, transaction, security or
                    legally required records may be retained where
                    required or permitted by applicable law.
                </p>
            </>
        ),
    },
    {
        title: "9. Children's Privacy",
        icon: ShieldCheck,
        content: (
            <p>
                SounKart is a general shopping application and is not
                intended to knowingly collect personal information
                from children without appropriate consent where
                required by applicable law.
            </p>
        ),
    },
    {
        title: "10. Changes to This Privacy Policy",
        icon: FileText,
        content: (
            <p>
                We may update this Privacy Policy from time to time.
                Updated versions will be published on this page with
                a revised update date.
            </p>
        ),
    },
];

function Header() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

                <Link
                    to="/privacy-policy"
                    className="flex shrink-0 items-center gap-2.5"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-200">
                        S
                    </span>

                    <span className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                        SounKart
                    </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-5">

                    <span className="hidden items-center gap-2 text-sm font-semibold text-emerald-700 md:flex">
                        <ShieldCheck size={19} />
                        Privacy Center
                    </span>

                    <Link
                        to="/delete-account"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 sm:gap-2 sm:px-4 sm:text-sm"
                    >
                        <Trash2 size={16} />
                        Delete Account
                    </Link>

                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white px-5 py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">

                <div className="flex items-center gap-2 font-bold text-slate-700">
                    <ShoppingBag size={19} className="text-blue-600" />
                    SounKart
                </div>

                <div className="flex flex-wrap justify-center gap-5 text-sm font-medium text-slate-500">
                    <Link to="/privacy-policy" className="hover:text-blue-600">
                        Privacy Policy
                    </Link>

                    <Link to="/delete-account" className="hover:text-blue-600">
                        Delete Account
                    </Link>

                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="hover:text-blue-600"
                    >
                        Contact Us
                    </a>
                </div>

                <p className="text-xs text-slate-400">
                    © 2026 SounKart. All rights reserved.
                </p>

            </div>
        </footer>
    );
}

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-800">

            <Header />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-5 py-16 text-center sm:py-20">

                <div className="mx-auto max-w-3xl">

                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg shadow-blue-100">
                        <ShieldCheck size={35} />
                    </div>

                    <span className="text-xs font-extrabold tracking-[3px] text-blue-600">
                        SOUNKART PRIVACY CENTER
                    </span>

                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                        Privacy Policy
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                        Your privacy matters to us. Learn how SounKart
                        collects, uses and protects your information.
                    </p>

                    <p className="mt-5 text-xs font-medium text-slate-500">
                        Last updated: November 27, 2026
                    </p>

                    {/* Hero Navigation Buttons */}
                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">

                        <Link
                            to="/delete-account"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                            <Trash2 size={18} />
                            Request Account Deletion
                            <ArrowRight size={17} />
                        </Link>

                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            <Mail size={18} />
                            Contact Support
                        </a>

                    </div>
                </div>
            </section>

            {/* Policy Content */}
            <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:py-16">

                <div className="mb-8 flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <LockKeyhole className="mt-1 shrink-0 text-blue-600" size={23} />

                    <p className="text-sm leading-7 text-blue-900">
                        This Privacy Policy applies to the SounKart Android
                        application and its related services.
                    </p>
                </div>

                <div className="space-y-3">

                    {sections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <section
                                key={section.title}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-100 sm:p-8"
                            >
                                <div className="mb-4 flex items-center gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Icon size={20} />
                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                                        {section.title}
                                    </h2>

                                </div>

                                <div className="space-y-3 text-sm leading-8 text-slate-600 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:pl-1 [&_strong]:font-bold [&_strong]:text-slate-800">
                                    {section.content}
                                </div>

                                {section.title.startsWith("8.") && (
                                    <Link
                                        to="/delete-account"
                                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                    >
                                        <Trash2 size={17} />
                                        Go to Account Deletion Page
                                        <ArrowRight size={16} />
                                    </Link>
                                )}

                            </section>
                        );
                    })}

                </div>

                {/* Contact Section */}
                <section className="mt-8 rounded-2xl border border-blue-100 bg-white p-7 shadow-sm sm:p-9">

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Mail size={24} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Contact Us
                            </h2>

                            <p className="text-sm text-slate-500">
                                We are here to help you.
                            </p>
                        </div>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-600">
                        If you have questions about this Privacy Policy,
                        your personal information or account deletion,
                        contact our support team.
                    </p>

                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="mt-4 inline-flex items-center gap-2 font-bold text-blue-600 hover:underline"
                    >
                        <Mail size={17} />
                        {SUPPORT_EMAIL}
                    </a>

                </section>

            </main>

            <Footer />

        </div>
    );
}
