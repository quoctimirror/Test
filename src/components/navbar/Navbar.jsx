import "./Navbar.css";
import { useState, useRef, useEffect } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import MenuIcon from "@assets/images/icons/3gach.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import UnderlineButton from "@/components/common/button/UnderlineButton";
import { ROUTES } from "@/constants/routes";
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
  const [isInIntroSubmitSection, setIsInIntroSubmitSection] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Check if current page is home, welcome, or immersive showroom (pages with white navbar)
  const isHomePage =
    location.pathname === ROUTES.HOME_PAGE ||
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.IMMERSIVE_SHOWROOM;

  // Check if current page is Milan submission page or Submit Success page
  const isMilanPage =
    location.pathname.startsWith(ROUTES.MILAN_SUBMIT);

  // Check if current page is submit page (not success page)
  const isSubmitPage =
    location.pathname === ROUTES.MILAN_SUBMIT;

  // Check if should hide menu, account, and immersive button (Milan and Immersive Showroom)
  const shouldHideButtons =
    isMilanPage || location.pathname === ROUTES.IMMERSIVE_SHOWROOM;

  // Check if logo click should be disabled (Milan and Immersive Showroom)
  const shouldDisableLogoClick = shouldHideButtons;

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

  // Detect when IntroSubmit section is in view (for immersive showroom page)
  useEffect(() => {
    const isImmersiveShowroom = location.pathname === ROUTES.IMMERSIVE_SHOWROOM;
    if (!isImmersiveShowroom) {
      setIsInIntroSubmitSection(false);
      return;
    }

    const handleScroll = () => {
      const introSubmitSection = document.querySelector(".intro-submit-section");
      if (!introSubmitSection) return;

      const rect = introSubmitSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only trigger when section top is very close to or past the top of viewport
      // This ensures logo only changes when user has actually scrolled to the section
      const isInView = rect.top <= 50 && rect.bottom > windowHeight * 0.2;

      setIsInIntroSubmitSection(isInView);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const performTransition = async (route, options = {}) => {
    // Sử dụng optimized transition system
    await optimizedTransitionUtils.transitionToRoute(navigate, route, options);
  };

  const handleLogoClick = async () => {
    // Disable logo click on Milan and Immersive Showroom pages
    if (shouldDisableLogoClick) {
      return;
    }

    if (window.location.pathname === ROUTES.HOME_PAGE) {
      window.scrollTo(0, 0);
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } else {
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition(ROUTES.HOME_PAGE);
    }
  };

  const handleProductsClick = async () => {
    if (window.location.pathname === ROUTES.COLLECTIONS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.COLLECTIONS, {
      onStart: () => console.log("Starting transition to collections..."),
      onComplete: () => console.log("Collections page transition completed!"),
    });
  };

  const handleServicesClick = async () => {
    if (window.location.pathname === ROUTES.SERVICES) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.SERVICES);
  };

  const handleSupportClick = async () => {
    if (window.location.pathname === ROUTES.SUPPORT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.SUPPORT);
  };

  const handleAboutClick = async () => {
    if (window.location.pathname === ROUTES.ABOUT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.ABOUT);
  };

  const handleNewsClick = async () => {
    if (window.location.pathname === ROUTES.NEWS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.NEWS);
  };

  const handleContactClick = async () => {
    if (window.location.pathname === ROUTES.CONTACT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.CONTACT);
  };

  // Helper function to check if user is admin
  const isUserAdmin = () => {
    return user && user.roles && user.roles.includes("ADMIN");
  };

  // Helper function to check if user is vendor
  const isUserVendor = () => {
    return user && user.roles && user.roles.includes("VENDOR");
  };

  // Helper function to check if user is designer
  const isUserDesigner = () => {
    return user && user.roles && user.roles.includes("DESIGNER");
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
    await performTransition(ROUTES.USER_PROFILE);
  };

  const handleAdminDashboardClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition(ROUTES.DASHBOARD_ADMIN);
  };

  const handleVendorDashboardClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition(ROUTES.DASHBOARD_VENDOR);
  };

  const handleDesignerDashboardClick = async () => {
    setIsAccountMenuOpen(false);
    await performTransition(ROUTES.DASHBOARD_DESIGNER);
  };

  const handleLogoutClick = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  const handleLoginClick = async () => {
    setIsAccountMenuOpen(false);
    navigate(ROUTES.AUTH_LOGIN);
    console.log("Navigating to login");
    if (window.location.pathname === ROUTES.AUTH_LOGIN) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.AUTH_LOGIN);
  };

  const handleLocationClick = async () => {
    if (window.location.pathname === ROUTES.LOCATIONS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    sessionStorage.setItem("scrollToTop", "true");
    await performTransition(ROUTES.LOCATIONS);
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
        } ${shouldDisableLogoClick ? "no-click" : ""} ${
          isSubmitPage ? "submit-page-logo" : ""
        } ${isInIntroSubmitSection ? "intro-submit-logo" : ""}`}
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
      {!shouldHideButtons && (
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
              <span className="menu-text">
                <UnderlineButton>Menu</UnderlineButton>
              </span>
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
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.COLLECTIONS)
                    }
                  >
                    <UnderlineButton onClick={handleProductsClick}>
                      Products
                    </UnderlineButton>
                  </li>
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.SERVICES)
                    }
                  >
                    <UnderlineButton onClick={handleServicesClick}>
                      Services
                    </UnderlineButton>
                  </li>
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.SUPPORT)
                    }
                  >
                    <UnderlineButton onClick={handleSupportClick}>
                      Support
                    </UnderlineButton>
                  </li>
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.ABOUT)
                    }
                  >
                    <UnderlineButton onClick={handleAboutClick}>
                      About Mirror
                    </UnderlineButton>
                  </li>
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.NEWS)
                    }
                  >
                    <UnderlineButton onClick={handleNewsClick}>
                      News
                    </UnderlineButton>
                  </li>
                  <li className="immersive-menu-item">
                    <UnderlineButton>Immersive Showroom</UnderlineButton>
                  </li>
                </ul>
                <ul className="menu-list">
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.LOCATIONS)
                    }
                  >
                    <UnderlineButton onClick={handleLocationClick}>
                      Location
                    </UnderlineButton>
                  </li>
                  <li
                    onMouseEnter={() =>
                      optimizedTransitionUtils.prefetch(ROUTES.CONTACT)
                    }
                  >
                    <UnderlineButton onClick={handleContactClick}>
                      Contact us
                    </UnderlineButton>
                  </li>
                  <li>
                    <UnderlineButton onClick={handleAccountClick}>
                      Account
                    </UnderlineButton>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!shouldHideButtons && (
        <div
          className={`account-fixed-container ${
            isHomePage && !isMenuOpen ? "no-blend" : ""
          } ${
            isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
          }`}
        >
          <div className="account-container">
            <div
              className="account-button-wrapper"
              onMouseEnter={() => setIsAccountMenuOpen(true)}
              onMouseLeave={() => setIsAccountMenuOpen(false)}
            >
              <UnderlineButton>Account</UnderlineButton>
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
                      <li>
                        <UnderlineButton onClick={handleProfileClick}>
                          My Profile
                        </UnderlineButton>
                      </li>

                      {isUserAdmin() && (
                        <li>
                          <UnderlineButton onClick={handleAdminDashboardClick}>
                            Admin Dashboard
                          </UnderlineButton>
                        </li>
                      )}

                      {isUserVendor() && (
                        <li>
                          <UnderlineButton onClick={handleVendorDashboardClick}>
                            Vendor Dashboard
                          </UnderlineButton>
                        </li>
                      )}

                      <li className="logout-item">
                        <UnderlineButton onClick={handleLogoutClick}>
                          Logout
                        </UnderlineButton>
                      </li>
                    </ul>
                  </>
                ) : (
                  <ul className="account-list">
                    <li>
                      <UnderlineButton onClick={handleLoginClick}>
                        Login
                      </UnderlineButton>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMMERSIVE BUTTON - chỉ glassmorphism */}
      {!shouldHideButtons && (
        <>
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
      )}
    </>
  );
}
