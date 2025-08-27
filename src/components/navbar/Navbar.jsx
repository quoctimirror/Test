import "./Navbar.css";
import { useState, useRef } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Debug log - remove in production
  // console.log('Navbar - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/";
    }
  };

  const handleProductsClick = () => {
    if (window.location.pathname === "/collections") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/collections";
    }
  };

  const handleServicesClick = () => {
    if (window.location.pathname === "/services") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/services";
    }
  };


  const handleSupportClick = () => {
    if (window.location.pathname === "/support") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/support";
    }
  };

  const handleAboutClick = () => {
    if (window.location.pathname === "/about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/about";
    }
  };

  const handleNewsClick = () => {
    if (window.location.pathname === "/news") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/news";
    }
  };

  const handleContactClick = () => {
    if (window.location.pathname === "/contact") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      window.location.href = "/contact";
    }
  };

  // Helper function to check if user is admin
  const isUserAdmin = () => {
    return user && user.roles && user.roles.includes("ADMIN");
  };

  const handleAccountClick = () => {
    // Enhanced check: also verify token exists as fallback
    const hasToken = localStorage.getItem("accessToken");
    const isLoggedIn = (isAuthenticated && user) || hasToken;

    if (isLoggedIn) {
      // If user is logged in, toggle account menu instead of direct navigation
      setIsAccountMenuOpen(!isAccountMenuOpen);
    } else {
      // Show dropdown menu for non-authenticated users too
      setIsAccountMenuOpen(!isAccountMenuOpen);
    }
  };

  const handleProfileClick = () => {
    setIsAccountMenuOpen(false);
    navigate("/user-profile");
  };

  const handleAdminDashboardClick = () => {
    setIsAccountMenuOpen(false);
    navigate("/dashboard/admin");
  };

  const handleLogoutClick = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleLoginClick = () => {
    setIsAccountMenuOpen(false);
    navigate("/auth/login");
  };

  const handleLocationClick = () => {
    if (window.location.pathname === "/locations") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sessionStorage.setItem('scrollToTop', 'true');
      window.location.href = "/locations";
    }
  };

  return (
    <>
      {/* DIV RIÊNG CHỈ DÀNH CHO LOGO BLEND */}
      <div className="logo-fixed-container" onClick={handleLogoClick}>
        <img
          ref={logoRef}
          src={MirrorLogo}
          alt="Mirror Logo"
          className="navbar-logo-svg"
        />
      </div>

      {/* MENU VÀ ACCOUNT LINK VỚI BLEND MODE */}
      <div className="menu-fixed-container">
        <div className="menu-container">
          <div
            className="menu-button"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <span className="menu-text bodytext-3--no-margin">Menu</span>
          </div>
          <div
            className={`menu-popup ${isMenuOpen ? "active" : ""}`}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div className="menu-groups">
              <ul className="menu-list">
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleProductsClick}
                >
                  Products
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleServicesClick}
                >
                  Services</li>
                <li className="bodytext-3--no-margin" onClick={handleSupportClick}>Support
                </li>
                <li className="bodytext-3--no-margin" onClick={handleAboutClick}>About Mirror</li>
                <li className="bodytext-3--no-margin" onClick={handleNewsClick}>
                  News
                </li>
              </ul>
              <ul className="menu-list">
                <li className="bodytext-3--no-margin" onClick={handleLocationClick}>Location</li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleContactClick}
                >
                  Contact us
                </li>
                <li className="bodytext-3--no-margin">Account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="account-fixed-container">
        <div className="account-container">
          <div
            className="account-button"
            onMouseEnter={() => setIsAccountMenuOpen(true)}
            onMouseLeave={() => setIsAccountMenuOpen(false)}
          >
            <span className="account-text bodytext-3--no-margin">Account</span>
          </div>
          
          {/* Account Dropdown Menu - Shows for both authenticated and non-authenticated users */}
          <div
            className={`account-popup ${isAccountMenuOpen ? "active" : ""}`}
            onMouseEnter={() => setIsAccountMenuOpen(true)}
            onMouseLeave={() => setIsAccountMenuOpen(false)}
          >
            <div className="account-groups">
              {isAuthenticated ? (
                <>
                  <div className="account-user-info">
                    <span className="bodytext-4--no-margin">
                      {user?.username || "User"}
                    </span>
                  </div>
                  
                  <ul className="account-list">
                    <li
                      className="bodytext-3--no-margin"
                      onClick={handleProfileClick}
                    >
                      My Profile
                    </li>
                    
                    {isUserAdmin() && (
                      <li
                        className="bodytext-3--no-margin"
                        onClick={handleAdminDashboardClick}
                      >
                        Admin Dashboard
                      </li>
                    )}
                    
                    <li
                      className="bodytext-3--no-margin logout-item"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </li>
                  </ul>
                </>
              ) : (
                <ul className="account-list">
                  <li
                    className="bodytext-3--no-margin"
                    onClick={handleLoginClick}
                  >
                    Login
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IMMERSIVE BUTTON - chỉ glassmorphism */}
      <div className="immersive-fixed-container">
        <button className="immersive-button"></button>
      </div>

      {/* BORDER RIÊNG BIỆT - chỉ mix-blend-mode */}
      <div className="immersive-border-container">
        <div className="immersive-border"></div>
      </div>

      {/* TEXT RIÊNG BIỆT - chỉ mix-blend-mode */}
      <div className="immersive-text-container">
        <span className="immersive-text bodytext-4--no-margin">
          Immersive Showroom
        </span>
      </div>
    </>
  );
}
