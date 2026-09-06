import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, logoutUser, clearAuthError } from "../redux/slices/authSlice"; // apna path daal dena

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [roleError, setRoleError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRoleError("");
        dispatch(clearAuthError());



        try {


            // unwrap() se fulfilled payload seedha milta hai, rejected pe throw hoga
            const result = await dispatch(loginUser(form)).unwrap();




            const role = result?.user?.role;

            // 👇 Yahi restriction hai - sirf VENDOR aur ADMIN login kar sakte hain
            if (role !== "ADMIN" && role !== "VENDOR") {
                await dispatch(logoutUser()); // cookie/session turant clear kar do
                setRoleError("Is app mein sirf Vendor aur Admin hi login kar sakte hain.");
                return;
            }

            if (role === "ADMIN") {
                navigate("/admin/dashboard", { replace: true });
            } else {
                navigate("/vendor/dashboard", { replace: true });
            }
        } catch (err) {
            console.log("Catch run", err);

            // error already authSlice ke `error` state me store ho chuka hai
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

            {(error || roleError) && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {roleError || error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-sm text-gray-600 mt-4 text-center">
                Vendor bannana hai?{" "}
                <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    );
};

export default Login;