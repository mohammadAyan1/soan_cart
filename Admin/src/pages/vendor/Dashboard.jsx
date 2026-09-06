import { useSelector } from "react-redux";

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Vendor Dashboard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="text-lg font-semibold text-gray-800">{user?.fullName}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-lg font-semibold text-gray-800">{user?.role}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;