import "../styles/home.css";
import { IoMdMenu } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

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
          <ul>
            <li>Homepage</li>
            <li>The gems</li>
            <li>Services</li>
            <li>About</li>
            <li>Location</li>
            <li>Contact</li>
            <li>Account</li>
          </ul>
        </div>
      </div>
      <div className="title">MIRROR</div>
      <a href="#contact" className="contact-link">
        Contact us
      </a>
    </div>
  );
}
