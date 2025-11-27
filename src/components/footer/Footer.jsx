import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import fbIcon from "@assets/images/icons/fb_icon.svg";
import instaIcon from "@assets/images/icons/insta_icon.svg";
import tiktokIcon from "@assets/images/icons/tiktok_icon.svg";
import PrismaticBurst from "@components/common/prismatic-burst/PrismaticBurst";

const Footer = () => {
  const navigate = useNavigate();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [shouldRenderBurst, setShouldRenderBurst] = useState(false);
  const footerRef = useRef(null);

  const handleHomeClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.HOME) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.HOME);
  };

  const handleProductsClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.COLLECTIONS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      ROUTES.COLLECTIONS
    );
  };

  const handleServicesClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.SERVICES) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.SERVICES);
  };

  const handleSupportClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.SUPPORT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.SUPPORT);
  };

  const handleAboutClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.ABOUT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.ABOUT);
  };

  const handleNewsClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.NEWS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.NEWS);
  };

  const handleContactClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.CONTACT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.CONTACT);
  };

  const handleLocationClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.LOCATIONS) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      ROUTES.LOCATIONS
    );
  };

  const handleBookAppointmentClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === ROUTES.BOOK_APPOINTMENT) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      ROUTES.BOOK_APPOINTMENT
    );
  };

  useEffect(() => {
    let rafId = null;

    // Detect when footer is visible on screen
    const handleScroll = () => {
      if (rafId) return; // Throttle with RAF

      rafId = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Footer is visible when user is within 1.2 viewport heights from bottom
        const threshold = documentHeight - window.innerHeight * 1.2;
        const footerVisible = scrollPosition >= threshold;

        // Update visibility state
        setIsFooterVisible(footerVisible);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Don't check on mount - wait for user to scroll
    // This prevents animation from running on page load

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Handle mount/unmount - fade in only
  useEffect(() => {
    if (isFooterVisible) {
      // Mount component immediately for fade-in
      setShouldRenderBurst(true);
    } else {
      // Unmount immediately (no fade-out)
      setShouldRenderBurst(false);
    }
  }, [isFooterVisible]);

  return (
    <footer className="footer" data-navbar-theme="white" ref={footerRef}>
      {/* Prismatic Burst Background Effect */}
      <div
        className={`footer-background-effect ${
          isFooterVisible ? "active" : ""
        }`}
      >
        {shouldRenderBurst && (
          <PrismaticBurst
            animationType="hover"
            intensity={3.1}
            speed={0.15}
            distort={10}
            paused={false}
            offset={{ x: 0, y: 0 }}
            hoverDampness={0.6}
            rayCount={0}
            mixBlendMode="lighten"
            colors={["#bc224c", "#140039", "#0B0B0B"]}
          />
        )}
      </div>

      <div className="footer-container">
        <div className="footer-content">
          <div className={`footer-left ${isFooterVisible ? "visible" : ""}`}>
            <div className="footer-section">
              <ul className="footer-links">
                <li>
                  <UnderlineButton
                    onClick={handleHomeClick}
                    className="footer-link-button"
                  >
                    Home
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleProductsClick}
                    className="footer-link-button"
                  >
                    Products
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleServicesClick}
                    className="footer-link-button"
                  >
                    Services
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleSupportClick}
                    className="footer-link-button"
                  >
                    Support
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleAboutClick}
                    className="footer-link-button"
                  >
                    About
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleNewsClick}
                    className="footer-link-button"
                  >
                    News
                  </UnderlineButton>
                </li>
              </ul>
            </div>
          </div>

          <div className={`footer-right ${isFooterVisible ? "visible" : ""}`}>
            <div className="footer-section">
              <ul className="contact-info">
                <li>
                  <UnderlineButton
                    onClick={handleLocationClick}
                    className="contact-link-button"
                    textClassName="bodytext-4--no-margin"
                  >
                    Location
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleContactClick}
                    className="contact-link-button"
                    textClassName="bodytext-4--no-margin"
                  >
                    Contact us
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleBookAppointmentClick}
                    className="contact-link-button"
                    textClassName="bodytext-4--no-margin"
                  >
                    Book an appointment
                  </UnderlineButton>
                </li>
                <li>
                  <a href="mailto:support@mirrorfuturediamond.com">
                    <UnderlineButton
                      className="contact-link-button"
                      textClassName="bodytext-4--no-margin"
                    >
                      support@mirrorfuturediamond.com
                    </UnderlineButton>
                  </a>
                </li>
                <li>
                  <a href="tel:+97.130.0938">
                    <UnderlineButton
                      className="contact-link-button"
                      textClassName="bodytext-4--no-margin"
                    >
                      +97.130.0938
                    </UnderlineButton>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`footer-center ${isFooterVisible ? "visible" : ""}`}>
          <div className="newsletter-section">
            <p className="bodytext-4--no-margin newsletter-tagline">
              COLLECT. REFLECT. AWAKEN
            </p>
            <h2 className="heading-1--no-margin newsletter-title">
              JOIN OUR
              <br />
              MIRROR PASSPORT
            </h2>
            <p className="bodytext-4--no-margin newsletter-subtitle">
              Your gateway into the Mirrorverse where your journey, your taste,
              and your stories shape the luxury you receive.
            </p>
            <div className="newsletter-buttons">
              <ShineGlassButton
                onClick={() => console.log("Explore more clicked")}
                className="newsletter-btn-explore"
                theme="footer"
              >
                Explore more
              </ShineGlassButton>
              <ShineGlassButton
                onClick={() => console.log("Sign in clicked")}
                className="newsletter-btn-signin"
                theme="light"
              >
                Sign in
              </ShineGlassButton>
            </div>
          </div>
        </div>

        <div className={`footer-bottom ${isFooterVisible ? "visible" : ""}`}>
          <div className="footer-bottom-center">
            <div className="social-icons">
              <a
                href="https://www.facebook.com/mirrorfuturediamond"
                className="social-icon facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={fbIcon} alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com/mirrorfuturediamond"
                className="social-icon instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={instaIcon} alt="Instagram" />
              </a>
              <a
                href="https://www.tiktok.com/@mirrorfuturediamond?_r=1&_t=ZS-916kE9BBDoC"
                className="social-icon tiktok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={tiktokIcon} alt="TikTok" />
              </a>
            </div>
          </div>

          {/* Footer Bottom Left & Right - Inside footer-bottom */}
          <div className="footer-bottom-row">
            <div className="footer-bottom-left">
              <p className="bodytext-6--no-margin">
                All rights reserved © 2025
              </p>
            </div>

            <div className="footer-bottom-right">
              <a className="bodytext-6--no-margin legal-link">Legal mentions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
