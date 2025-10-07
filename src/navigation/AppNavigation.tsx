import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Carts from "../pages/Carts";
import Users from "../pages/Users";
import Auth from "../pages/Auth";



const AppNavigation = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/carts" element={<Carts />} />
        <Route path="/users" element={<Users />} />
        <Route path="/auth" element={<Auth />} />
      
      </Route>
    </Routes>
  );
};

export default AppNavigation;
