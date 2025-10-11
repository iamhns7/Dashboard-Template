import "../index.css";
import type { NavbarProps } from "../interfaces/NavbarInterfaces";

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <div className="navbar-custom d-flex align-items-center justify-content-between py-2">
      <div className="d-flex align-items-center gap-2">
        <button className="burger-btn btn btn-light" onClick={onToggleSidebar}>
          <i className="ri-menu-2-line fs-4"></i>
        </button>
        
      </div>
    </div>
  );
};

export default Navbar;
