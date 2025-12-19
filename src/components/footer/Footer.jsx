import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import GlassThemeButton from "@components/common/button/GlassThemeButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import fbIcon from "@assets/images/icons/fb_icon.svg";
import instaIcon from "@assets/images/icons/insta_icon.svg";
import tiktokIcon from "@assets/images/icons/tiktok_icon.svg";
import PrismaticBurst from "@components/common/prismatic-burst/PrismaticBurst";
import BookingModal from "@components/booking/BookingModal";

const Footer = () => {
  const navigate = useNavigate();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [shouldRenderBurst, setShouldRenderBurst] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const footerRef = useRef(null);

  // Refs for scroll-linked animation elements
  const footerContentRef = useRef(null);
  const footerCenterRef = useRef(null);
  const footerBottomRef = useRef(null);

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

  const handleBookAppointmentClick = (e) => {
    e.preventDefault();
    setIsBookingModalOpen(true);
  };

  // Use IntersectionObserver on the spacer element (not fixed footer)
  useEffect(() => {
    // Find the spacer element that reveals the footer
    const spacer = document.querySelector(".footer-reveal-spacer");
    if (!spacer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of spacer is visible
    );

    observer.observe(spacer);

    return () => observer.disconnect();
  }, []);

  // Scroll-linked animation for footer elements
  useEffect(() => {
    let rafId = null;

    // Apply scroll-linked transform to an element
    const applyScrollTransform = (
      element,
      progress,
      maxTranslate = 50,
      isCenter = false
    ) => {
      if (!element) return;
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const translateY = maxTranslate * (1 - clampedProgress);
      // Only apply translate(-50%, -50%) on desktop (> 1023px)
      if (isCenter && window.innerWidth > 1023) {
        element.style.transform = `translate(-50%, -50%) translateY(${translateY}px)`;
      } else {
        element.style.transform = `translateY(${translateY}px)`;
      }
      element.style.opacity = clampedProgress;
    };

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        if (document.body.style.position === "fixed") {
          rafId = null;
          return;
        }

        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const footerHeight = window.innerHeight;
        const footerStart = documentHeight - footerHeight;
        const scrollIntoFooter = Math.max(0, scrollPosition - footerStart);

        const elementAnimationRange = footerHeight * 0.35;
        const bottomStart = footerHeight * 0.25;
        const centerStart = footerHeight * 0.35;
        const contentStart = footerHeight * 0.45;

        const bottomProgress =
          (scrollIntoFooter - bottomStart) / elementAnimationRange;
        const centerProgress =
          (scrollIntoFooter - centerStart) / elementAnimationRange;
        const contentProgress =
          (scrollIntoFooter - contentStart) / elementAnimationRange;

        applyScrollTransform(footerBottomRef.current, bottomProgress, 80);
        applyScrollTransform(
          footerCenterRef.current,
          centerProgress,
          100,
          true
        );
        applyScrollTransform(footerContentRef.current, contentProgress, 120);

        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

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
        <div className="footer-content" ref={footerContentRef}>
          <div className="footer-left">
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

          <div className="footer-right">
            <div className="footer-section">
              <ul className="contact-info">
                <li>
                  <UnderlineButton
                    onClick={handleLocationClick}
                    className="contact-link-button"
                    textClassName="bodytext-6--no-margin"
                  >
                    Location
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleContactClick}
                    className="contact-link-button"
                    textClassName="bodytext-6--no-margin"
                  >
                    Contact us
                  </UnderlineButton>
                </li>
                <li>
                  <UnderlineButton
                    onClick={handleBookAppointmentClick}
                    className="contact-link-button"
                    textClassName="bodytext-6--no-margin"
                  >
                    Book an appointment
                  </UnderlineButton>
                </li>
                <li>
                  <a href="mailto:support@mirrorfuturediamond.com">
                    <UnderlineButton
                      className="contact-link-button"
                      textClassName="bodytext-6--no-margin"
                    >
                      support@mirrorfuturediamond.com
                    </UnderlineButton>
                  </a>
                </li>
                <li>
                  <a href="tel:+97.130.0938">
                    <UnderlineButton
                      className="contact-link-button"
                      textClassName="bodytext-6--no-margin"
                    >
                      +97.130.0938
                    </UnderlineButton>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-center" ref={footerCenterRef}>
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
              <GlassThemeButton
                onClick={() => console.log("Explore more clicked")}
                className="newsletter-btn-explore"
                theme="dark"
              >
                <span className="bodytext-6--no-margin">Explore more</span>
              </GlassThemeButton>
              <GlassThemeButton
                onClick={() => console.log("Sign in clicked")}
                className="newsletter-btn-signin"
                theme="spec_dark"
              >
                <span className="bodytext-6--no-margin">Sign in</span>
              </GlassThemeButton>
            </div>
          </div>
        </div>

        <div className="footer-bottom" ref={footerBottomRef}>
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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
