import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  // initialize sidebar open state based on viewport width (mobile: closed)
  const getInitialSidebar = () => {
    try {
      return window.innerWidth >= 768; // open on md and larger
    } catch {
      return true;
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(getInitialSidebar);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // keep sidebar responsive to window resizes: auto-close on small screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);
      if (window.innerWidth >= 768 && !isSidebarOpen) setIsSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isSidebarOpen]);

  return (
  <div className="dashboard-layout">
  <Sidebar darkMode={false} isOpen={isSidebarOpen} onClose={closeSidebar} />
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
