import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { vendorRegister } from "../redux/slices/authSlice"; // apna path daal dena

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { vendorRegisterLoading, vendorRegisterError } = useSelector(
        (state) => state.auth
    );

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullName", form.fullName);
        formData.append("phone", form.phone);
        formData.append("email", form.email);
        formData.append("password", form.password);
        // type "user" bhejte hi nahi - isliye thunk hamesha /vendor-register pe hi jayega
        if (image) formData.append("image", image);

        try {
            await dispatch(vendorRegister(formData)).unwrap();
            // Register ho gaya, ab OTP verify screen pe bhejo
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            // error already redux state me hai
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Registration</h1>
            <p className="text-sm text-gray-500 mb-6">
                Yahan sirf vendor account hi banaya ja sakta hai.
            </p>

            {vendorRegisterError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {vendorRegisterError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={10}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

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
                    <p className="text-xs text-gray-400 mt-1">
                        Min 8 characters, 1 uppercase, 1 number, 1 special character.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image (optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={vendorRegisterLoading}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                    {vendorRegisterLoading ? "Registering..." : "Register as Vendor"}
                </button>
            </form>

            <p className="text-sm text-gray-600 mt-4 text-center">
                Already a vendor/admin?{" "}
                <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
};

export default Register;