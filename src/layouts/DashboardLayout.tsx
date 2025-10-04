import Sidebar from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <> 
    <Navbar />
        <Sidebar />
        <Outlet />     
  </>

  );
};

export default DashboardLayout;
