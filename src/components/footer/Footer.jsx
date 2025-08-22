import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import GlassButton from "../common/button/GlassButton";
import { reactTransitionUtils } from "../../utils/reactTransitionUtils";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    if (email) {
      console.log("Sign up with email:", email);
      setEmail("");
    }
  };

  const handleHomeClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/");
  };

  const handleProductsClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/collections") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/collections");
  };

  const handleServicesClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/services") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/services");
  };

  const handleAboutClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/about");
  };

  const handleNewsClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/news") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/news");
  };

  const handleContactClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/contact") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/contact");
  };

  const handleLocationClick = async (e) => {
    e.preventDefault();
    if (window.location.pathname === "/locations") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    sessionStorage.setItem("scrollToTop", "true");
    await reactTransitionUtils.transitionToRoute(navigate, "/locations");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-section">
              <h3 className="heading-3 footer-title">DISCOVER</h3>
              <ul className="footer-links">
                <li>
                  <a className="bodytext-3" href="/" onClick={handleHomeClick}>
                    Homepage
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="/collections" onClick={handleProductsClick}>
                    Product
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="/services" onClick={handleServicesClick}>
                    Service & Support
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="/about" onClick={handleAboutClick}>
                    About Mirror
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="/news" onClick={handleNewsClick}>
                    News
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-center">
            <div className="newsletter-section">
              <h2 className="heading-1 newsletter-title">
                ENTER <br />
                THE UNIVERSE
              </h2>
              <p className="bodytext-6 newsletter-subtitle">
                For a more personalized experience and exclusive news.
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input"
                />
                <GlassButton
                  onClick={handleSignUp}
                  className="signup-button"
                  width={123}
                  height={57}
                >
                  Sign up
                </GlassButton>
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-section">
              <h3 className="heading-3 footer-title">CONTACT</h3>
              <ul className="contact-info">
                <li>
                  <a className="bodytext-3" href="/contact" onClick={handleContactClick}>
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    className="bodytext-3"
                    href="mailto:support@mirrorfuturediamond.com"
                  >
                    support@mirrorfuturediamond.com
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="tel:+97.130.0938">
                    +97.130.0938
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="#">
                    Book an appointment
                  </a>
                </li>
                <li>
                  <a className="bodytext-3" href="/locations" onClick={handleLocationClick}>
                    Location
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-center">
            <div className="social-icons">
              <a className="social-icon facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="social-icon instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a className="social-icon youtube">
                <i className="fab fa-youtube"></i>
              </a>
              <a className="social-icon linkedin">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a className="social-icon pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>

          {/* Footer Bottom Left & Right - Inside footer-bottom */}
          <div className="footer-bottom-row">
            <div className="footer-bottom-left">
              <p>All rights reserved © 2025</p>
            </div>

            <div className="footer-bottom-right">
              <a className="legal-link">Legal mentions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
