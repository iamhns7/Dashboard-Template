import { Route, Routes, Navigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Dashboard from "../../pages/Dashboard";
import Products from "../../pages/Products";
import Carts from "../../pages/Carts";
import Auth from "../../pages/Auth";
import { useAuth } from "../../hooks/useAuth";

const AppNavigation = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root: yönlendir - auth'a göre dashboard veya login */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />

      {/* Login route (explicit) - zaten giriş yapılmışsa dashboard'a yönlendir */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />

      {/* Protected Routes - Giriş yapılmamışsa login'e yönlendir */}
      <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/carts" element={<Carts />} />
      </Route>

    </Routes>
  );
};

export default AppNavigation;
