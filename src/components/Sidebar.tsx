import React from "react";
import { Link } from "react-router-dom";
import logoLight from "../assets/images/logo.png";
import type { SidebarProps } from "../interfaces/SidebarInterfaces";
import "../index.css";

interface SidebarExtendedProps extends SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarExtendedProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { title: "Dashboard", icon: "ri-dashboard-line", path: "/dashboard" },
    { title: "Products", icon: "ri-shopping-bag-3-line", path: "/products" },
    { title: "Carts", icon: "ri-shopping-cart-2-line", path: "/carts" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      <aside 
        className="bg-dark text-white position-fixed top-0 start-0 h-100" 
        style={{ 
          width: 250, 
          zIndex: 1050,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="p-3 border-bottom border-secondary d-flex align-items-center">
          <img src={logoLight} alt="Logo" className="img-fluid" />
        </div>

        <nav className="p-3">
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  title={item.title} 
                  className="nav-link text-white d-flex align-items-center py-2 rounded"
                  style={{ transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={onClose}
                >
                  <i className={`${item.icon} me-2`}></i>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
