import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>
            <p className="text-gray-600 mb-6">Ye page exist nahi karta.</p>
            <Link
                to="/"
                className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700"
            >
                Home Jao
            </Link>
        </div>
    );
};

export default NotFound;