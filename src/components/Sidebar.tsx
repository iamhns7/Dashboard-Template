import React from "react";
import { Link } from "react-router-dom";
import logoLight from "../assets/images/logo.png";
import type { SidebarProps } from "../interfaces/SidebarInterfaces";
import "../index.css";

interface SidebarExtendedProps extends SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarExtendedProps> = ({ darkMode, isOpen }) => {
  const menuItems = [
    { title: "Dashboard", icon: "ri-dashboard-line", path: "dashboard" },
    { title: "Products", icon: "ri-shopping-bag-3-line", path: "/products" },
    { title: "Carts", icon: "ri-shopping-cart-2-line", path: "/carts" },
    { title: "Users", icon: "ri-user-3-line", path: "/users" },
    { title: "Auth", icon: "ri-shield-user-line", path: "/" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"} ${darkMode ? "dark" : "light"}`}>
      <div className="sidebar-header ">
        <img src={logoLight} alt="Logo" className="img-fluid" />
      </div>

      <div className="sidebar-menu">
        <ul className="list-unstyled">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} title={item.title}>
                <i className={`${item.icon} me-2`}></i>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      
    </div>
  );
};

export default Sidebar;
