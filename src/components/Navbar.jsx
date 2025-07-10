import "../styles/home.css";
import { IoMdMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import MirrorLogo from "../assets/images/Mirror_Logo_new.svg";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="menu-wrapper">
        <div className="menu-button">
          <div className="icon-container">
            <IoMdMenu className="menu-icon" />
            <RxCross2 className="menu-icon-close" />
          </div>
          <span className="menu-text">Menu</span>
        </div>
        <div className="menu-popup">
          <div className="menu-section-1">
            <ul>
              <li>Homepage</li>
              <li>The gems</li>
              <li>Services</li>
              <li>About</li>
            </ul>
          </div>
          <div className="menu-section-2">
            <ul>
              <li>Location</li>
              <li>Contact</li>
              <li>Account</li>
            </ul>
          </div>
        </div>
      </div>
      <img src={MirrorLogo} alt="Mirror Logo" className="navbar-logo" />
      <a href="#contact" className="contact-link">
        Contact us
      </a>
    </div>
  );
}
