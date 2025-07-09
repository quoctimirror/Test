import Navbar from "../components/Navbar";
import { GoArrowDown } from "react-icons/go";
import Logo from "../assets/images/Logo.svg";
import "../styles/home.css";

export default function HomePage() {
  return (
    <div className="homepage">
      <div className="gradient-top"></div>
      <div className="gradient-bottom"></div>
      <div className="logo-center">
        <img src={Logo} alt="Mirror Logo" className="main-logo" />
      </div>
      <div className="tagline-section">
        <div className="tagline-top">Exploring The Universe Of</div>
        <div className="tagline-bottom">
          <span className="future-text">Future</span>
          <span className="diamond-text">Diamond</span>
        </div>
      </div>
      <Navbar />
      <div className="scroll-down">
        <button>
          <img src="/src/assets/images/arrow-right.svg" alt="Arrow Right" />
        </button>
      </div>
    </div>
  );
}
