import Navbar from "../components/Navbar";
import LogoReflection from "../components/LogoReflection";
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
      <Navbar />
      <div className="scroll-down">
        <button>
          <GoArrowDown size={24} />
        </button>
      </div>
    </div>
  );
}
