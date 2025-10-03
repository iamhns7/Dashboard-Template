import { Link, useLocation } from "react-router-dom";
import "../index.css"; 


const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Products", path: "/products" },
    { name: "Carts", path: "/carts" },
    { name: "Users", path: "/users" },
    { name: "Auth", path: "/auth"}
  ];

  return (
    <div className="sidebar-custom d-flex flex-column flex-shrink-0">
      <span className="sidebar-tittle fs-4 mb-3">Rename again</span>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li className="nav-item" key={item.path}>
            <Link
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "active" : "text-white"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
