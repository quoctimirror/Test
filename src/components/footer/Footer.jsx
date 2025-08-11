import React, { useState } from "react";
import "./Footer.css";
import GlassButton from '../common/GlassButton';

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSignUp = () => {
    if (email) {
      console.log("Sign up with email:", email);
      setEmail("");
    }
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
                  <a className="bodytext-3" href="/">Homepage</a>
                </li>
                <li>
                  <a className="bodytext-3" href="/collections">Product</a>
                </li>
                <li>
                  <a className="bodytext-3" href="/services">Service & Support</a>
                </li>
                <li>
                  <a className="bodytext-3" href="/about">About Mirror</a>
                </li>
                <li>
                  <a className="bodytext-3" href="/news">News</a>
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
                <li><a className="bodytext-3" href="#">Contact us</a></li>
                <li><a className="bodytext-3" href="mailto:support@mirrorfuturediamond.com">support@mirrorfuturediamond.com</a></li>
                <li><a className="bodytext-3" href="tel:+97.130.0938">+97.130.0938</a></li>
                <li><a className="bodytext-3" href="#">Book an appointment</a></li>
                <li><a className="bodytext-3" href="#">Location</a></li>
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