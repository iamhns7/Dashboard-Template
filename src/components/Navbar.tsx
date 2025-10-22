import "../index.css";
import type { NavbarProps } from "../interfaces/NavbarInterfaces";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="navbar-custom d-flex align-items-center justify-content-between py-2">
      <div className="d-flex align-items-center gap-2">
        <button className="burger-btn" onClick={onToggleSidebar}>
          <i className="ri-menu-2-line fs-4"></i>
        </button>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-sm btn-outline-primary position-relative" 
          onClick={() => navigate("/carts")}
        >
          <i className="ri-shopping-cart-2-line"></i>
          {cartItemCount > 0 && (
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.65rem' }}
            >
              {cartItemCount}
            </span>
          )}
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
          <i className="ri-logout-box-r-line me-1"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
