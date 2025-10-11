import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
  <div className="dashboard-layout">
  <Sidebar darkMode={false} isOpen={isSidebarOpen} />
  <div className="main-content">
    <Navbar onToggleSidebar={toggleSidebar} />
    <main className="p-3">
      <Outlet />
    </main>
    <Footer />
  </div>
</div>

  );
};

export default DashboardLayout;
