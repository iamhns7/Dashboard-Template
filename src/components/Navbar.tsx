import "../index.css";
import type { NavbarProps } from "../interfaces/NavbarInterfaces";
import { useAuth } from "../utils/hooks/useAuth";
import { useCart } from "../utils/hooks/useCart";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isOpen }) => {
  const { logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar bg-white shadow-sm d-flex align-items-center justify-content-between py-2">
      <div className="d-flex align-items-center gap-2">
        <button 
          className="btn btn-sm btn-outline-secondary position-fixed top-0 m-2" 
          style={{ 
            left: isOpen ? '260px' : '10px',
            zIndex: 9999,
            transition: 'left 0.3s ease'
          }}
          aria-label="Toggle sidebar" 
          onClick={onToggleSidebar}
        >
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
    </nav>
  );
};

export default Navbar;
