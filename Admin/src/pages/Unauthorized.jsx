import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-3">403 - Unauthorized</h1>
            <p className="text-gray-600 mb-6">
                Aapke paas is page ko access karne ki permission nahi hai.
            </p>
            <Link
                to="/"
                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
            >
                Home Jao
            </Link>
        </div>
    );
};

export default Unauthorized;