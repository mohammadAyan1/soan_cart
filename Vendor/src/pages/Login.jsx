import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginVendor, clearAuthError } from "../redux/slices/authSlice";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());
        const result = await dispatch(loginVendor({ email, password }));
        if (loginVendor.fulfilled.match(result)) {
            navigate("/");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
            <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
                <h1 className="text-xl font-medium text-stone-800">Vendor Login</h1>
                <p className="mt-1 text-sm text-stone-500">Apne vendor account me login karo</p>

                {error && (
                    <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-stone-600">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-5 flex justify-between text-sm">
                    <Link to="/forgot-password" className="text-indigo-600 hover:underline">
                        Password bhool gaye?
                    </Link>
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        Naya vendor account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;