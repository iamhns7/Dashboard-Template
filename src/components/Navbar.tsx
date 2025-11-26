import "../index.css";
import type { NavbarProps } from "../interfaces/NavbarInterfaces";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isOpen }) => {
  const { logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const cartItemCount = getCartItemCount();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar bg-dark text-white shadow-sm d-flex align-items-center justify-content-between py-3 px-4 position-sticky top-0" style={{ zIndex: 1030 }}>
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
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${i18n.language === 'en' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => changeLanguage('en')}
          >
            EN
          </button>
          <button 
            className={`btn btn-sm ${i18n.language === 'tr' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => changeLanguage('tr')}
          >
            TR
          </button>
        </div>
        <button 
          className="btn btn-sm btn-outline-light position-relative" 
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
        <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
          <i className="ri-logout-box-r-line me-1"></i>
          {t('navbar.logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
