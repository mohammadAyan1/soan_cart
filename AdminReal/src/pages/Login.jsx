import React, { useState } from 'react';
import { loginUser } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector((state) => state.auth || { loading: false, error: null });

    const [form, setForm] = useState({ email: "", password: "" });
    const [eyeOpen, setEyeOpen] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError("");

        if (!form.email || !form.password) {
            setLocalError("Please enter both email and password.");
            return;
        }

        try {
            const resultAction = await dispatch(loginUser(form));
            if (loginUser.fulfilled.match(resultAction)) {
                navigate("/");
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">

                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
                    <p className="text-sm text-gray-500">Sign in to your admin dashboard</p>
                </div>

                {(localError || error) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                placeholder="example@gmail.com"
                                name="email"
                                value={form.email || ""}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                type={eyeOpen ? "text" : "password"}
                                placeholder="••••••••"
                                name="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setEyeOpen(!eyeOpen)}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {eyeOpen ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;