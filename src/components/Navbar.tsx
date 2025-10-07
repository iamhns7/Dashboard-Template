import logoLight from "../assets/images/logo.png";
import logoLightSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";

const Navbar = () => {
  return (
    <div className="navbar-custom">
      <div className="topbar container-fluid">
        <div className="d-flex align-items-center gap-lg-2 gap-1">
          {/* Topbar Brand Logo */}
          <div className="logo-topbar">
            {/* Logo light */}
            <a href="/" className="logo-light">
              <span className="logo-lg">
                <img src={logoLight} alt="logo" />
              </span>
              <span className="logo-sm">
                <img src={logoLightSm} alt="small logo" />
              </span>
            </a>

            {/* Logo Dark */}
            <a href="/" className="logo-dark">
              <span className="logo-lg">
                <img src={logoDark} alt="dark logo" />
              </span>
              <span className="logo-sm">
                <img src={logoLightSm} alt="small logo" />
              </span>
            </a>
          </div>

          {/* Sidebar Menu Toggle Button */}
          <button className="button-toggle-menu">
            <i className="ri-menu-2-fill"></i>
          </button>
        </div>

        <ul className="topbar-menu d-flex align-items-center gap-3">
          <li className="d-none d-sm-inline-block">
            <div className="nav-link" id="light-dark-mode">
              <i className="ri-moon-line fs-22"></i>
            </div>
          </li>

          <li className="nav-link">
            <span className="badge bg-success fs-16">v1.0</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
