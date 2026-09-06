import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const { user, isAuthChecked, loading } = useSelector((state) => state.auth);

    if (!isAuthChecked || loading) {
        return (
            <div className="flex h-screen items-center justify-center text-stone-500">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;