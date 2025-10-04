import { Link, useLocation } from "react-router-dom";
import "../index.css"; 
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(true);

const menuItems = [
  { name: "Products", path: "/products", icon: "bi-box" },
  { name: "Carts", path: "/carts", icon: "bi-cart" },
  { name: "Users", path: "/users", icon: "bi-people" },
  { name: "Auth", path: "/auth", icon: "bi-lock"}
];

  return (
    <aside
      className={`sidebar-custom d-flex flex-column ${
        open ? "open" : "closed"
      }`}
    >
      <div className="d-flex align-items-center justify-content-between mb-3 px-2">
        <span className="sidebar-tittle fs-5 text-white ms-1">
          {open ? "Admin Panel" : ""}
        </span>

       <button
  className="hamburger-btn"
  onClick={() => setOpen((s) => !s)}
  aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
>
  <span className="line"></span>
  <span className="line"></span>
  <span className="line"></span>
</button>
      </div>

      <hr className="text-white-10" />

      <ul className="nav nav-pills flex-column mb-auto px-1">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
           <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  location.pathname === item.path ? "active" : "text-white"
                }`}
              >
                <i className={`bi ${item.icon} me-2`}></i>  
                <span className="label ms-1">{item.name}</span>
              </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
