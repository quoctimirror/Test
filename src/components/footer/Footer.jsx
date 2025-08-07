import React, { useState } from "react";
import "./Footer.css";

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
              <h3 className="footer-title">DISCOVER</h3>
              <ul className="footer-links">
                <li>
                  <a href="/">Homepage</a>
                </li>
                <li>
                  <a href="/collection">Our Gems</a>
                </li>
                <li>
                  <a href="/services">Mirror Care</a>
                </li>
                <li>
                  <a href="/about">The Mirrorverse</a>
                </li>
                <li>
                  <a href="/news">News</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-center">
            <div className="newsletter-section">
              <h2 className="newsletter-title">
                ENTER <br />
                THE UNIVERSE
              </h2>
              <p className="newsletter-subtitle">
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
                <button onClick={handleSignUp} className="signup-button">
                  Sign up
                </button>
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-section">
              <h3 className="footer-title">CONTACT</h3>
              <div className="contact-info">
                <p>Contact us</p>
                <p>support@mirrorfuturediamond.com</p>
                <p>+97.130.0938</p>
                <p>Book an appointment</p>
                <p>Location</p>
              </div>
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
        </div>
      </div>

      {/* Footer Bottom Left & Right - Outside container for full width */}
      <div className="footer-bottom-left">
        <p>All rights reserved © 2025</p>
      </div>

      <div className="footer-bottom-right">
        <a className="legal-link">Legal mentions</a>
      </div>
    </footer>
  );
};

export default Footer;