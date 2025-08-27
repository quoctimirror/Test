import "./Navbar.css";
import { useState, useRef, useEffect } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Initialize optimized transition system
    optimizedTransitionUtils.init();
  }, []);


  const performTransition = async (route, options = {}) => {
    // Sử dụng optimized transition system
    await optimizedTransitionUtils.transitionToRoute(navigate, route, options);
  };

  const handleLogoClick = async () => {
    if (window.location.pathname === "/") {
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition("/");
    }
  };

  const handleProductsClick = async () => {
    if (window.location.pathname === "/collections") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/collections", {
      onStart: () => console.log('Starting transition to collections...'),
      onComplete: () => console.log('Collections page transition completed!')
    });
  };

  const handleServicesClick = async () => {
    if (window.location.pathname === "/services") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/services");
  };


  const handleSupportClick = async () => {
    if (window.location.pathname === "/support") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/support");
  };

  const handleAboutClick = async () => {
    if (window.location.pathname === "/about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/about");
  };

  const handleNewsClick = async () => {
    if (window.location.pathname === "/news") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/news");
  };

  const handleContactClick = async () => {
    if (window.location.pathname === "/contact") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/contact");
  };

  const handleAccountClick = async () => {
    // Enhanced check: also verify token exists as fallback
    const hasToken = localStorage.getItem("accessToken");
    const isLoggedIn = (isAuthenticated && user) || hasToken;

    if (isLoggedIn) {
      if (window.location.pathname === "/user-profile") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition("/user-profile");
    } else {
      console.log("Navigating to login");
      if (window.location.pathname === "/auth/login") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition("/auth/login");
    }
  };

  const handleLocationClick = async () => {
    if (window.location.pathname === "/locations") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    sessionStorage.setItem('scrollToTop', 'true');
    await performTransition("/locations");
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
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/collections')}
                >
                  Products
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleServicesClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/services')}
                >
                  Services</li>
                <li 
                  className="bodytext-3--no-margin" 
                  onClick={handleSupportClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/support')}
                >Support
                </li>
                <li 
                  className="bodytext-3--no-margin" 
                  onClick={handleAboutClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/about')}
                >About Mirror</li>
                <li 
                  className="bodytext-3--no-margin" 
                  onClick={handleNewsClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/news')}
                >
                  News
                </li>
              </ul>
              <ul className="menu-list">
                <li 
                  className="bodytext-3--no-margin" 
                  onClick={handleLocationClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/locations')}
                >Location</li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleContactClick}
                  onMouseEnter={() =>  optimizedTransitionUtils.prefetch('/contact')}
                >
                  Contact us
                </li>
                <li className="bodytext-3--no-margin" onClick={handleAccountClick}>Account</li>
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
