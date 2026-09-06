import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = () => {
    const { isLoggedIn } = useSelector((state) => state.auth);

    return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
};

export default GuestRoute;