// import { Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import Users from "./pages/User";

// import DashboardLayout from "./components/sidebar/Sidebar";
// import Login from "./pages/Login";
// import Order from "./pages/Order";
// import Product from "./pages/Product";
// import UpdateProduct from "./pages/UpdateProduct";
// import Category from "./pages/Category";
// import SubCategory from "./pages/SubCategory";
// import VegetableProduct from "./pages/VegetableProduct";
// import Unit from "./pages/Unit";
// import AdminCouponsRewards from "./pages/AdminCouponsRewards";
// import ServiceZones from "./pages/ServiceZones";
// import Banners from "./pages/Banners";
// import DeleteAccount from "./pages/public/DeleteAccount";
// import PrivacyPolicy from "./pages/public/PrivacyPolicy";




// function App() {

//   return (

//     <Routes>

//       <Route
//         path="/"
//         element={<DashboardLayout />}
//       >
//         <Route
//           index
//           element={<Home />}
//         />
//         <Route
//           path="users"
//           element={<Users />}
//         />

//         <Route
//           path="orders"
//           element={<Order />}
//         />
//         <Route
//           path="products"
//           element={<Product />}
//         />

//         <Route
//           path="categories"
//           element={<Category />}
//         />

//         <Route
//           path="subcategories"
//           element={<SubCategory />}
//         />

//         <Route path="product/update/:id"
//           element={<UpdateProduct />} />
//         <Route
//           path="login"
//           element={<Login />}
//         />

//         <Route
//           path="vegetable"
//           element={<VegetableProduct />}
//         />

//         <Route
//           path="unit"
//           element={<Unit />}
//         />
//         <Route path="admin/discounts" element={<AdminCouponsRewards />} />
//         <Route path="service-zones" element={<ServiceZones />} />
//         <Route path="banners" element={<Banners />} />
//       </Route>

//       {/* Public routes */}
//       <Route
//         path="/privacy-policy"
//         element={<PrivacyPolicy />}
//       />

//       <Route
//         path="/delete-account"
//         element={<DeleteAccount />}
//       />
//     </Routes>

//   );
// }

// export default App;





import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Users from "./pages/User";

import DashboardLayout from "./components/sidebar/Sidebar";
import Login from "./pages/Login";
import Order from "./pages/Order";
import Product from "./pages/Product";
import UpdateProduct from "./pages/UpdateProduct";
import Category from "./pages/Category";
import SubCategory from "./pages/SubCategory";
import VegetableProduct from "./pages/VegetableProduct";
import Unit from "./pages/Unit";
import AdminCouponsRewards from "./pages/AdminCouponsRewards";
import ServiceZones from "./pages/ServiceZones";
import Banners from "./pages/Banners";

import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import DeleteAccount from "./pages/public/DeleteAccount";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES - NO ADMIN LOGIN REQUIRED */}

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      <Route
        path="/delete-account"
        element={<DeleteAccount />}
      />

      {/* PROTECTED ADMIN PANEL LAYOUT */}

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Home />} />

        <Route path="users" element={<Users />} />

        <Route path="orders" element={<Order />} />

        <Route path="products" element={<Product />} />

        <Route path="categories" element={<Category />} />

        <Route path="subcategories" element={<SubCategory />} />

        <Route
          path="product/update/:id"
          element={<UpdateProduct />}
        />

        <Route path="login" element={<Login />} />

        <Route
          path="vegetable"
          element={<VegetableProduct />}
        />

        <Route path="unit" element={<Unit />} />

        <Route
          path="admin/discounts"
          element={<AdminCouponsRewards />}
        />

        <Route
          path="service-zones"
          element={<ServiceZones />}
        />

        <Route path="banners" element={<Banners />} />
      </Route>
    </Routes>
  );
}

export default App;
