import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resendOtp, forgetPassword, resetForgetPasswordState } from "../redux/slices/authSlice";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { otpLoading, otpError, otpSuccessMessage, forgetPasswordLoading, forgetPasswordError, forgetPasswordSuccess } =
        useSelector((state) => state.auth);

    const [step, setStep] = useState("email"); // "email" | "reset"
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const result = await dispatch(resendOtp({ email }));
        if (resendOtp.fulfilled.match(result)) {
            setStep("reset");
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        dispatch(resetForgetPasswordState());
        const result = await dispatch(forgetPassword({ email, otp, password }));
        if (forgetPassword.fulfilled.match(result)) {
            setTimeout(() => navigate("/login"), 1200);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
                <h1 className="text-xl font-medium text-stone-800">Password Reset Karo</h1>

                {step === "email" ? (
                    <>
                        <p className="mt-1 text-sm text-stone-500">
                            Apna registered email daalo, hum OTP bhej denge
                        </p>

                        {otpError && (
                            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                {otpError}
                            </p>
                        )}

                        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={otpLoading}
                                className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {otpLoading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <p className="mt-1 text-sm text-stone-500">
                            {email} pe bheja gaya OTP aur naya password daalo
                        </p>

                        {otpSuccessMessage && (
                            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                                {otpSuccessMessage}
                            </p>
                        )}
                        {forgetPasswordError && (
                            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                                {forgetPasswordError}
                            </p>
                        )}
                        {forgetPasswordSuccess && (
                            <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                                Password reset ho gaya, login page pe bhej rahe hai...
                            </p>
                        )}

                        <form onSubmit={handleReset} className="mt-6 space-y-4">
                            <input
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="OTP"
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Naya Password"
                                className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={forgetPasswordLoading}
                                className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {forgetPasswordLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>

                        <button
                            onClick={() => dispatch(resendOtp({ email }))}
                            className="mt-4 text-sm text-indigo-600 hover:underline"
                        >
                            OTP dobara bhejo
                        </button>
                    </>
                )}

                <p className="mt-5 text-center text-sm">
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Login page pe wapas jao
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;