import "./Navbar.css";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="navbar">
      <div className="menu-container">
        <div 
          className="menu-button"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <span className="menu-text">Menu</span>
        </div>
        <div 
          className={`menu-popup ${isMenuOpen ? 'active' : ''}`}
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
      <img src={MirrorLogo} alt="Mirror Logo" className="navbar-logo" />
      <div className="navbar-right">
        <a href="#account" className="account-link">
          Account
        </a>
        <button className="immersive-button">Immersive Showroom</button>
      </div>
    </div>
  );
}
