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
    <div className="d-flex flex-column min-vh-100">
      <Navbar onToggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
      <div className="d-flex flex-grow-1">
        <Sidebar darkMode={false} isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-grow-1 p-3">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
