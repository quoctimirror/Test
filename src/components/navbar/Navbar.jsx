import "./Navbar.css";
import { useState, useRef } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

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

  const handleAccountClick = () => {
    // Enhanced check: also verify token exists as fallback
    const hasToken = localStorage.getItem("accessToken");
    const isLoggedIn = (isAuthenticated && user) || hasToken;

    // Debug logs to see what's happening
    console.log("=== Account Click Debug ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user exists:", !!user);
    console.log("hasToken:", !!hasToken);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("========================");

    if (isLoggedIn) {
      console.log("Navigating to profile");
      navigate("/user-profile");
    } else {
      console.log("Navigating to login");
      navigate("/auth/login");
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
                  Service & Support
                </li>
                <li className="bodytext-3--no-margin">About Mirror</li>
                <li className="bodytext-3--no-margin" onClick={handleNewsClick}>
                  News
                </li>
              </ul>
              <ul className="menu-list">
                <li className="bodytext-3--no-margin">Location</li>
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
        <button
          onClick={handleAccountClick}
          className="account-link bodytext-3--no-margin"
        >
          Account
        </button>
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
