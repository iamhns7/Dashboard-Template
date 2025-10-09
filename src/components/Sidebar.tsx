import React from "react";
import { Link } from "react-router-dom";
import logoLight from "../assets/images/logo.png";
import logoLightSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";
import avatar from "../assets/images/users/avatar-1.jpg";
import type { SidebarProps } from "../interfaces/SidebarInterfaces";
import "../index.css"


const Sidebar: React.FC<SidebarProps> = ({ darkMode }) => {
 const menuItems = [
  { title: "Dashboard", icon: "ri-dashboard-line", path: "/" },
  { title: "Products", icon: "ri-shopping-bag-3-line", path: "/products" },
  { title: "Carts", icon: "ri-shopping-cart-2-line", path: "/carts" },
  { title: "Users", icon: "ri-user-3-line", path: "/users" },
  { title: "Auth", icon: "ri-shield-user-line", path: "/auth" },
];


  return (
    <div className={`leftside-menu ${darkMode ? "dark" : "light"}`}>
      {/* Brand Logo */}
      <Link to="/" className="logo logo-light">
        <span className="logo-lg">
          <img src={logoLight} alt="logo" />
        </span>
        <span className="logo-sm">
          <img src={logoLightSm} alt="small logo" />
        </span>
      </Link>

      <Link to="/" className="logo logo-dark">
        <span className="logo-lg">
          <img src={logoDark} alt="dark logo" />
        </span>
        <span className="logo-sm">
          <img src={logoLightSm} alt="small logo" />
        </span>
      </Link>

      {/* Sidebar Hover Menu Toggle Button */}
      <div className="button-sm-hover" title="Show Full Sidebar">
        <i className="ri-checkbox-blank-circle-line align-middle" />
      </div>

      {/* Full Sidebar Menu Close Button */}
      <div className="button-close-fullsidebar">
        <i className="ri-close-fill align-middle" />
      </div>

      {/* Sidebar Content */}
      <div className="h-100" id="leftside-menu-container" data-simplebar>
        {/* Leftbar User */}
        <div className="leftbar-user">
          <Link to="/profile">
            <img src={avatar} alt="user-image" height={42} className="rounded-circle shadow-sm" />
            <span className="leftbar-user-name mt-2">Tosha Minner</span>
          </Link>
        </div>

        {/* Side Menu */}
        <ul className="side-nav">
          {menuItems.map((item) => (
            <li key={item.path} className="side-nav-item">
              <Link to={item.path} className="side-nav-link">
                <i className={item.icon} />
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
