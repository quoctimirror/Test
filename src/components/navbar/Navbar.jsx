import "./Navbar.css";
import { useState, useRef } from "react";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = useRef(null);

  return (
    <>
      {/* DIV RIÊNG CHỈ DÀNH CHO LOGO BLEND */}
      <div className="logo-fixed-container">
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
            <span className="menu-text">Menu</span>
          </div>
          <div
            className={`menu-popup ${isMenuOpen ? "active" : ""}`}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div className="menu-groups">
              <ul className="menu-list">
                <li>Products</li>
                <li>Service & Support</li>
                <li>About Mirror</li>
                <li>News</li>
              </ul>
              <ul className="menu-list">
                <li>Location</li>
                <li>Contact us</li>
                <li>Account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="account-fixed-container">
        <a href="#account" className="account-link">
          Account
        </a>
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
        <span className="immersive-text">Immersive Showroom</span>
      </div>
    </>
  );
}
