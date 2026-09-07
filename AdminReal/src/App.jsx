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

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<DashboardLayout />}
      >
        <Route
          index
          element={<Home />}
        />
        <Route
          path="users"
          element={<Users />}
        />

        <Route
          path="orders"
          element={<Order />}
        />
        <Route
          path="products"
          element={<Product />}
        />

        <Route
          path="categories"
          element={<Category />}
        />

        <Route
          path="subcategories"
          element={<SubCategory />}
        />

        <Route path="product/update/:id"
          element={<UpdateProduct />} />
        <Route
          path="login"
          element={<Login />}
        />
      </Route>
    </Routes>

  );
}

export default App;