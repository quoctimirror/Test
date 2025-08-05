import "./Navbar.css";
import MirrorLogo from "@assets/images/Mirror_Logo_new.svg";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="menu-wrapper">
        <div className="menu-button">
          <span className="menu-text">Menu</span>
        </div>
        <div className="menu-popup">
          <ul className="menu-list">
            <li>Products</li>
            <li>Service & Support</li>
            <li>About Mirror</li>
            <li>News</li>
            <li className="menu-divider"></li>
            <li>Location</li>
            <li>Contact us</li>
            <li>Account</li>
          </ul>
        </div>
      </div>
      <img src={MirrorLogo} alt="Mirror Logo" className="navbar-logo" />
      <div className="navbar-right">
        <a href="#account" className="account-link">
          Account
        </a>
        <button className="immersive-button">
          Immersive Showroom
        </button>
      </div>
    </div>
  );
}
