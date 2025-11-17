import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import fbIcon from "@assets/images/icons/fb_icon.svg";
import instaIcon from "@assets/images/icons/insta_icon.svg";
import tiktokIcon from "@assets/images/icons/tiktok_icon.svg";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    if (email) {
      setEmail("");
    }
  };

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

  return (
    <footer className="footer" data-navbar-theme="white">
      <div className="footer-container">
        <div className="footer-content">
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

        <div className="footer-center">
          <div className="newsletter-section">
            <h2 className="heading-1--no-margin newsletter-title">
              ENTER <br />
              THE UNIVERSE
            </h2>
            <p className="bodytext-4--no-margin newsletter-subtitle">
              For a more personalized experience and exclusive news.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input bodytext-4--no-margin"
              />
              <ShineGlassButton
                onClick={handleSignUp}
                className="signup-button"
                theme="footer"
              >
                Sign up
              </ShineGlassButton>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
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
