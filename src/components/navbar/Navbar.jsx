import "./Navbar.css";
import { useState, useRef, useEffect } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import MenuIcon from "@assets/images/icons/3gach.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 425 && window.innerWidth <= 1023
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isInScrollContainer, setIsInScrollContainer] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Check if current page is home or welcome
  const isHomePage =
    location.pathname === "/home" ||
    location.pathname === "/" ||
    location.pathname === "/welcome";

  useEffect(() => {
    // Initialize optimized transition system
    optimizedTransitionUtils.init();
  }, []);

  // Set initial state for homepage on mount
  useEffect(() => {
    if (isHomePage) {
      // On homepage, when at top of page, we should be in scroll-container
      setIsInScrollContainer(true);
    } else {
      setIsInScrollContainer(false);
    }
  }, [isHomePage]);

  // Add scroll detection to properly detect when user is within scroll-container section
  // Track mobile and tablet state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
      setIsTablet(window.innerWidth > 425 && window.innerWidth <= 1023);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".menu-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset menu state when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMenuHovered(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollContainer = document.querySelector(".scroll-container");
      if (!scrollContainer) return;

      const rect = scrollContainer.getBoundingClientRect();
      // Check if we're within the scroll-container bounds:
      // - At top of page: rect.top = 0, should be true
      // - Scrolling within: rect.top < 0 but rect.bottom > 0, should be true
      // - Past scroll-container: rect.bottom < 0, should be false
      const isViewportInScrollContainer = rect.top <= 50 && rect.bottom >= 0;

      // Debug log

      setIsInScrollContainer(isViewportInScrollContainer);
    };

    // Initial check with delay to ensure DOM is ready
    const initialCheck = () => {
      setTimeout(() => {
        handleScroll();
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    // Run multiple times to catch initial state
    handleScroll();
    initialCheck();

    // Also check on window load
    window.addEventListener("load", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", handleScroll);
    };
  }, [isHomePage]);

  const performTransition = async (route, options = {}) => {
    // Sử dụng optimized transition system
    await optimizedTransitionUtils.transitionToRoute(navigate, route, options);
  };

  const handleLogoClick = async () => {
    if (window.location.pathname === "/home") {
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition("/home");
    }
  };

  const handleProductsClick = async () => {
    if (window.location.pathname === "/collections") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/collections", {
      onStart: () => console.log("Starting transition to collections..."),
      onComplete: () => console.log("Collections page transition completed!"),
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Helper function to check if user is admin
  const isUserAdmin = () => {
    return user && user.roles && user.roles.includes("ADMIN");
  };

  // Helper function to check if user is vendor
  const isUserVendor = () => {
    return user && user.roles && user.roles.includes("VENDOR");
  };

  const handleAccountClick = async () => {
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

  const handleProfileClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition("/user-profile");
  };

  const handleAdminDashboardClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition("/dashboard/admin");
  };

  const handleVendorDashboardClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition("/dashboard/vendor");
  };

  const handleLogoutClick = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleLoginClick = async () => {
    setIsAccountMenuOpen(false);
    navigate("/auth/login");
    console.log("Navigating to login");
    if (window.location.pathname === "/auth/login") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/auth/login");
  };

  const handleLocationClick = async () => {
    if (window.location.pathname === "/locations") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition("/locations");
  };

  return (
    <>
      {/* Mobile/Tablet menu overlay */}
      {(isMobile || isTablet) && isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* DIV RIÊNG CHỈ DÀNH CHO LOGO BLEND */}
      <div
        className={`logo-fixed-container ${
          isHomePage && !isMenuOpen ? "no-blend" : ""
        } ${
          isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
        }`}
        onClick={handleLogoClick}
      >
        <img
          ref={logoRef}
          src={MirrorLogo}
          alt="Mirror Logo"
          className="navbar-logo-svg"
        />
      </div>

      {/* MENU VÀ ACCOUNT LINK VỚI BLEND MODE */}
      <div
        className={`menu-fixed-container ${
          isHomePage && !isMenuOpen ? "no-blend" : ""
        } ${
          isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
        }`}
      >
        <div
          className={`menu-container ${
            isMenuOpen || isMenuHovered ? "menu-open" : ""
          }`}
        >
          <div
            className="menu-button"
            onMouseEnter={() =>
              !isMobile && !isTablet && setIsMenuHovered(true)
            }
            onMouseLeave={() =>
              !isMobile && !isTablet && setIsMenuHovered(false)
            }
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <div className="menu-icon-container">
              <img className="menu-icon" src={MenuIcon} alt="Menu" />
              <svg
                className="menu-icon-close"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <span className="menu-text bodytext-3--no-margin">Menu</span>
          </div>
          <div
            className={`menu-popup ${
              isMenuOpen || isMenuHovered ? "active" : ""
            }`}
            onMouseEnter={() =>
              !isMobile && !isTablet && setIsMenuHovered(true)
            }
            onMouseLeave={() =>
              !isMobile && !isTablet && setIsMenuHovered(false)
            }
          >
            <div className="menu-groups">
              <ul className="menu-list">
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleProductsClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/collections")
                  }
                >
                  Products
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleServicesClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/services")
                  }
                >
                  Services
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleSupportClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/support")
                  }
                >
                  Support
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleAboutClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/about")
                  }
                >
                  About Mirror
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleNewsClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/news")
                  }
                >
                  News
                </li>
                <li className="immersive-menu-item bodytext-3--no-margin">
                  Immersive Showroom
                </li>
              </ul>
              <ul className="menu-list">
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleLocationClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/locations")
                  }
                >
                  Location
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleContactClick}
                  onMouseEnter={() =>
                    optimizedTransitionUtils.prefetch("/contact")
                  }
                >
                  Contact us
                </li>
                <li
                  className="bodytext-3--no-margin"
                  onClick={handleAccountClick}
                >
                  Account
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`account-fixed-container ${
          isHomePage && !isMenuOpen ? "no-blend" : ""
        } ${
          isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
        }`}
      >
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

                    {isUserVendor() && (
                      <li
                        className="bodytext-3--no-margin"
                        onClick={handleVendorDashboardClick}
                      >
                        Vendor Dashboard
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
      <div
        className={`immersive-border-container ${
          isHomePage && !isMenuOpen ? "no-blend" : ""
        } ${
          isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
        }`}
      >
        <div className="immersive-border"></div>
      </div>

      {/* TEXT RIÊNG BIỆT - chỉ mix-blend-mode */}
      <div
        className={`immersive-text-container ${
          isHomePage && !isMenuOpen ? "no-blend" : ""
        } ${
          isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
        }`}
      >
        <span className="immersive-text bodytext-4--no-margin">
          Immersive Showroom
        </span>
      </div>
    </>
  );
}
