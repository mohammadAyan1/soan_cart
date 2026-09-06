import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, clearAuthError } from "../redux/slices/authSlice";

const UpdateProfile = () => {
    const dispatch = useDispatch();
    const { user, profileLoading, profileError } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ fullName: "", phone: "", email: "" });
    const [imageFile, setImageFile] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ fullName: user.fullName || "", phone: user.phone || "", email: user.email || "" });
        }
    }, [user]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearAuthError());
        setSuccess(false);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        if (imageFile) formData.append("image", imageFile);

        const result = await dispatch(updateProfile(formData));
        if (updateProfile.fulfilled.match(result)) {
            setSuccess(true);
        }
    };

    return (
        <div>
            <h1 className="text-xl font-medium text-stone-800">Update Profile</h1>
            <p className="mt-1 text-sm text-stone-500">Apni account details update karo</p>

            <div className="mt-6 max-w-md rounded-lg border border-stone-200 bg-white p-6">
                {profileError && (
                    <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {profileError}
                    </p>
                )}
                {success && (
                    <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                        Profile update ho gayi
                    </p>
                )}

                <div className="mb-5 flex items-center gap-4">
                    <img
                        src={user?.imageUrl || "https://placehold.co/80x80?text=Vendor"}
                        alt="profile"
                        className="h-16 w-16 rounded-full object-cover"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="text-sm"
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;