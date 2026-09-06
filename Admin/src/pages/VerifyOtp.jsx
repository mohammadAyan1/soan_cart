import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../redux/slices/authSlice"; // apna path daal dena

const VerifyOtp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Register page se navigate karte waqt email state me pass kiya tha
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const { verifyOtpLoading, verifyOtpError, resendOtpLoading } = useSelector(
        (state) => state.auth
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(verifyOtp({ email, otp })).unwrap();
            navigate("/login", { replace: true });
        } catch (err) {
            // error redux state me already hai
        }
    };

    const handleResend = () => {
        dispatch(resendOtp({ email }));
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-sm text-gray-500 mb-6">
                {email} pe bheja gaya OTP daalo.
            </p>

            {verifyOtpError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {verifyOtpError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    placeholder="6-digit OTP"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                    type="submit"
                    disabled={verifyOtpLoading}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                    {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                </button>
            </form>

            <button
                onClick={handleResend}
                disabled={resendOtpLoading}
                className="w-full text-sm text-indigo-600 mt-4 hover:underline"
            >
                {resendOtpLoading ? "Sending..." : "Resend OTP"}
            </button>
        </div>
    );
};

export default VerifyOtp;