import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import VendorLayout from "./layouts/VendorLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp"; // 👈 naya import
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";

import VendorDashboard from "./pages/vendor/Dashboard";
import Products from "./pages/vendor/Products";

import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { me } from "./redux/slices/authSlice";
import { useDispatch } from "react-redux";
import ProductForm from "./pages/vendor/ProductForm";
import Order from "./pages/vendor/Order";


function App() {

  const dispatch = useDispatch()


  useEffect(() => {
    dispatch(me())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Guest - sirf logged-out users hi access kar sakte hain */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} /> {/* 👈 naya route */}
        </Route>

        {/* Login Required */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<h1>Profile</h1>} />
        </Route>

        {/* Admin only */}
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/order" element={<Order Role={"ADMIN"} />} />
            <Route path="/admin/product" element={<Products Role={"ADMIN"} />} />
          </Route>
        </Route>

        {/* Vendor only */}
        <Route element={<RoleRoute allowedRoles={["VENDOR"]} />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<Products />} />
            <Route path="/vendor/products/new" element={<ProductForm />} />       {/* 👈 naya */}
            <Route path="/vendor/products/edit/:id" element={<ProductForm />} /> {/* 👈 naya */}
            <Route path="/vendor/order" element={<Order />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;