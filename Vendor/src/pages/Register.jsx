import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { vendorRegister, verifyOtp, resendOtp, clearAuthError } from "../redux/slices/authSlice";

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { registerLoading, registerError, otpLoading, otpError, otpSuccessMessage } =
        useSelector((state) => state.auth);

    const [step, setStep] = useState("form"); // "form" | "otp"
    const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
    const [imageFile, setImageFile] = useState(null);
    const [otp, setOtp] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        if (imageFile) formData.append("image", imageFile);

        const result = await dispatch(vendorRegister(formData));
        if (vendorRegister.fulfilled.match(result)) {
            setStep("otp");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const result = await dispatch(verifyOtp({ email: form.email, otp }));
        if (verifyOtp.fulfilled.match(result)) {
            navigate("/login");
        }
    };

    const handleResend = () => dispatch(resendOtp({ email: form.email }));

    if (step === "otp") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
                <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
                    <h1 className="text-xl font-medium text-stone-800">Email Verify Karo</h1>
                    <p className="mt-1 text-sm text-stone-500">
                        {form.email} pe bheja gaya OTP daalo
                    </p>

                    {otpError && (
                        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                            {otpError}
                        </p>
                    )}
                    {otpSuccessMessage && (
                        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                            {otpSuccessMessage}
                        </p>
                    )}

                    <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                        <input
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={otpLoading}
                            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {otpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <button
                        onClick={handleResend}
                        className="mt-4 text-sm text-indigo-600 hover:underline"
                    >
                        OTP dobara bhejo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
            <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
                <h1 className="text-xl font-medium text-stone-800">Vendor Register</h1>
                <p className="mt-1 text-sm text-stone-500">Naya vendor account banao</p>

                {registerError && (
                    <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {registerError}
                    </p>
                )}

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Full Name</label>
                        <input
                            name="fullName"
                            required
                            value={form.fullName}
                            onChange={handleChange}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Phone</label>
                        <input
                            name="phone"
                            required
                            maxLength={10}
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-stone-400">
                            Kam se kam 8 characters, ek capital letter, ek number, ek special character
                        </p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Profile Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="w-full text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={registerLoading}
                        className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {registerLoading ? "Creating..." : "Register"}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm">
                    Pehle se account hai?{" "}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Login karo
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;