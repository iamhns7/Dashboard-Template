import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  // initialize sidebar closed on all screens
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="container-fluid d-flex min-vh-100">
      <Sidebar darkMode={false} isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="d-flex flex-column flex-grow-1">
        <Navbar onToggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
        <main className="flex-grow-1 p-3">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
