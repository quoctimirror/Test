import "./NavbarV3.css";
import { useState, useRef, useEffect } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import MenuIcon from "@assets/images/icons/3gach.svg";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import UnderlineButton from "@/components/common/button/UnderlineButton";
import { ROUTES } from "@/constants/routes";
import { useNavbarTheme } from "@/hooks/useNavbarTheme";

export default function NavbarV3() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 425 && window.innerWidth <= 1023
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isInScrollContainer, setIsInScrollContainer] = useState(false);
  const [isInIntroSubmitSection, setIsInIntroSubmitSection] = useState(false);
  const logoRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();

  // Get current navbar theme from hook
  const { theme: navbarTheme } = useNavbarTheme();

  // Check if current page is home, welcome, or immersive showroom (pages with white navbar)
  const isHomePage =
    location.pathname === ROUTES.HOME_PAGE ||
    location.pathname === ROUTES.HOME ||
    location.pathname === ROUTES.WELCOME ||
    location.pathname === ROUTES.IMMERSIVE_SHOWROOM;

  // Check if current page is Milan submission page or Submit Success page
  const isMilanPage = location.pathname.startsWith(ROUTES.MILAN_SUBMIT);

  // Check if current page is submit page (not success page)
  const isSubmitPage = location.pathname === ROUTES.MILAN_SUBMIT;

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
      if (!event.target.closest(".menu-v3-container")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Reset menu state when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open on mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && isMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isMenuOpen, isMobile, isTablet]);

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
      const introSubmitSection = document.querySelector(
        ".intro-submit-section"
      );
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
    await performTransition(ROUTES.COLLECTIONS);
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

  const handleProfileClick = async (tab = "My Passport") => {
    setIsAccountMenuOpen(false);

    // If already on profile page, force navigation with replace to update state
    if (location.pathname === ROUTES.USER_PROFILE) {
      navigate(ROUTES.USER_PROFILE, {
        state: { activeTab: tab, timestamp: Date.now() },
        replace: true
      });
    } else {
      await performTransition(ROUTES.USER_PROFILE, { state: { activeTab: tab, timestamp: Date.now() } });
    }
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

  const handleAccountMenuClick = async () => {
    // Check if user is authenticated
    const hasToken = localStorage.getItem("accessToken");
    const isLoggedIn = (isAuthenticated && user) || hasToken;

    if (isLoggedIn) {
      // If logged in, navigate to profile
      if (window.location.pathname === ROUTES.USER_PROFILE) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition(ROUTES.USER_PROFILE);
    } else {
      // If not logged in, navigate to login
      if (window.location.pathname === ROUTES.AUTH_LOGIN) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      sessionStorage.setItem("scrollToTop", "true");
      await performTransition(ROUTES.AUTH_LOGIN);
    }
  };

  return (
    <>
      {/* Navbar Liquid Glass Background */}
      <div
        className={`navbar-v3-glass-background navbar-v3-theme-${navbarTheme} ${
          isMenuOpen || isAccountMenuOpen ? "expanded" : ""
        }`}
      >
        <div className="liquidGlass-v3-effect"></div>
        <div className="liquidGlass-v3-tint"></div>
        <div className="liquidGlass-v3-shine"></div>
      </div>

      {/* SVG Filter for Liquid Glass Distortion */}
      <svg style={{ display: "none" }}>
        <filter
          id="navbar-glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.000 0.000"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />

          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>

          <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />

          <feSpecularLighting
            in="softMap"
            surfaceScale="3"
            specularConstant="0.9"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>

          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Mobile/Tablet menu overlay */}
      {(isMobile || isTablet) && isMenuOpen && (
        <div
          className="mobile-v3-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* DIV RIÊNG CHỈ DÀNH CHO LOGO BLEND */}
      <div
        className={`logo-v3-fixed-container navbar-v3-theme-${navbarTheme} ${
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
          className="navbar-v3-logo-svg"
        />
      </div>

      {/* MENU VÀ ACCOUNT LINK VỚI BLEND MODE */}
      {!shouldHideButtons && (
        <div
          className={`menu-v3-fixed-container navbar-v3-theme-${navbarTheme} ${
            isHomePage && !isMenuOpen ? "no-blend" : ""
          } ${
            isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
          }`}
        >
          <div
            className={`menu-v3-container ${
              isMenuOpen ? "menu-v3-open" : ""
            }`}
          >
            <div
              className="menu-v3-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <div className="menu-v3-icon-container">
                <img className="menu-v3-icon" src={MenuIcon} alt="Menu" />
                <svg
                  className="menu-v3-icon-close"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <span className="menu-v3-text">
                <UnderlineButton>Menu</UnderlineButton>
              </span>
            </div>
            <div
              className={`menu-v3-popup ${
                isMenuOpen ? "active" : ""
              }`}
            >
              <div className="menu-v3-groups">
                <ul className="menu-v3-list">
                  <li
                    className={location.pathname === ROUTES.COLLECTIONS ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleProductsClick}>
                      Products
                    </UnderlineButton>
                  </li>
                  <li
                    className={location.pathname === ROUTES.SERVICES ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleServicesClick}>
                      Services
                    </UnderlineButton>
                  </li>
                  <li
                    className={location.pathname === ROUTES.SUPPORT ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleSupportClick}>
                      Support
                    </UnderlineButton>
                  </li>
                  <li
                    className={location.pathname === ROUTES.ABOUT ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleAboutClick}>
                      About Mirror
                    </UnderlineButton>
                  </li>
                  <li
                    className={location.pathname === ROUTES.NEWS ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleNewsClick}>
                      News
                    </UnderlineButton>
                  </li>
                  <li className={`immersive-v3-menu-item ${location.pathname === ROUTES.IMMERSIVE_SHOWROOM ? "active" : ""}`}>
                    <UnderlineButton>Immersive Showroom</UnderlineButton>
                  </li>
                </ul>
                <div className="menu-v3-divider"></div>
                <ul className="menu-v3-list">
                  <li
                    className={location.pathname === ROUTES.LOCATIONS ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleLocationClick}>
                      Location
                    </UnderlineButton>
                  </li>
                  <li
                    className={location.pathname === ROUTES.CONTACT ? "active" : ""}
                  >
                    <UnderlineButton onClick={handleContactClick}>
                      Contact us
                    </UnderlineButton>
                  </li>
                  <li className="account-v3-menu-item">
                    <UnderlineButton onClick={handleAccountMenuClick}>
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
          className={`account-v3-fixed-container navbar-v3-theme-${navbarTheme} ${
            isHomePage && !isMenuOpen ? "no-blend" : ""
          } ${
            isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
          }`}
        >
          <div className="account-v3-container">
            {isAuthenticated ? (
              // Logged in: Show "Account" with hover dropdown
              <>
                <div
                  className="account-v3-button-wrapper"
                  onMouseEnter={() => setIsAccountMenuOpen(true)}
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  <UnderlineButton>Account</UnderlineButton>
                </div>

                {/* Account Dropdown Menu - Only for authenticated users */}
                <div
                  className={`account-v3-popup ${isAccountMenuOpen ? "active" : ""}`}
                  onMouseEnter={() => setIsAccountMenuOpen(true)}
                  onMouseLeave={() => setIsAccountMenuOpen(false)}
                >
                  <div className="account-v3-groups">
                    <div className="account-v3-user-info">
                      <span className="bodytext-4--no-margin">
                        {user?.username || "User"}
                      </span>
                    </div>
                    <div className="menu-v3-divider"></div>

                    <ul className="account-v3-list">
                      <li>
                        <UnderlineButton onClick={() => handleProfileClick("My Passport")}>
                          My Passport
                        </UnderlineButton>
                      </li>
                      <li>
                        <UnderlineButton onClick={() => handleProfileClick("Orders")}>
                          Orders
                        </UnderlineButton>
                      </li>
                      <li>
                        <UnderlineButton onClick={() => handleProfileClick("Services")}>
                          Services
                        </UnderlineButton>
                      </li>
                      <li>
                        <UnderlineButton onClick={() => handleProfileClick("Wishlist")}>
                          Wishlist
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

                      {isUserDesigner() && (
                        <li>
                          <UnderlineButton
                            onClick={handleDesignerDashboardClick}
                          >
                            Designer Dashboard
                          </UnderlineButton>
                        </li>
                      )}
                    </ul>

                    <div className="menu-v3-divider"></div>

                    <ul className="account-v3-list">
                      <li className="logout-v3-item">
                        <UnderlineButton onClick={handleLogoutClick}>
                          Logout
                        </UnderlineButton>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              // Not logged in: Show "Login" button, no dropdown
              <div className="account-v3-button-wrapper">
                <UnderlineButton onClick={handleLoginClick}>
                  Login
                </UnderlineButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMMERSIVE BUTTON - chỉ glassmorphism */}
      {!shouldHideButtons && (
        <>
          <div className="immersive-v3-fixed-container">
            <button className="immersive-v3-button"></button>
          </div>

          {/* BORDER RIÊNG BIỆT - chỉ mix-blend-mode */}
          <div
            className={`immersive-v3-border-container navbar-v3-theme-${navbarTheme} ${
              isHomePage && !isMenuOpen ? "no-blend" : ""
            } ${
              isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
            }`}
          >
            <div className="immersive-v3-border"></div>
          </div>

          {/* TEXT RIÊNG BIỆT - chỉ mix-blend-mode */}
          <div
            className={`immersive-v3-text-container navbar-v3-theme-${navbarTheme} ${
              isHomePage && !isMenuOpen ? "no-blend" : ""
            } ${
              isHomePage && isInScrollContainer && !isMenuOpen ? "scrolled" : ""
            }`}
          >
            <span className="immersive-v3-text bodytext-4--no-margin">
              Immersive Showroom
            </span>
          </div>
        </>
      )}
    </>
  );
}
