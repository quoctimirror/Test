import { useEffect, useRef } from "react";
import Navbar from "../components/navbar/Navbar";
import HoverExpandSection from "../components/HoverExpandSection";
import Logo from "../assets/images/Logo.svg";
import Vector2 from "../assets/images/Vector_2.svg";
import ArrowRight from "../assets/images/arrow-right.svg";
import "../styles/home.css";

export default function HomePage() {
  const finalGradientRef = useRef(null);
  const elementsToFadeRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const animationStart = 0;
      const animationEnd = window.innerHeight;

      let progress = 0;
      if (scrollY >= animationStart && scrollY <= animationEnd) {
        progress = (scrollY - animationStart) / (animationEnd - animationStart);
      } else if (scrollY > animationEnd) {
        progress = 1;
      }

      if (finalGradientRef.current) {
        // Calculation MUST go from POSITIVE to NEGATIVE (120 -> -20)
        const wipePosition = 400 - progress * 350;
        console.log(
          "Scrolling! Progress:",
          progress,
          "Wipe Position:",
          wipePosition
        );
        finalGradientRef.current.style.setProperty(
          "--wipe-progress",
          `${wipePosition}%`
        );
      }

      if (elementsToFadeRef.current) {
        const fadeProgress = Math.min(1, Math.max(0, (progress - 0.5) * 2));
        elementsToFadeRef.current.style.opacity = 1 - fadeProgress;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="scroll-container">
        <div className="homepage">
          <div className="gradient-initial">
            <div className="gradient-top"></div>
            <div className="gradient-bottom"></div>
          </div>

          <div className="gradient-final" ref={finalGradientRef}></div>

          <div className="logo-center">
            <img src={Logo} alt="Mirror Logo" className="main-logo" />
          </div>

          <div className="elements-to-fade" ref={elementsToFadeRef}>
            <Navbar />
            <div className="tagline-section">
              <div className="tagline-top">Exploring The Universe Of</div>
              <div className="tagline-bottom">
                <span className="future-text">Future</span>
                <span className="diamond-text">Diamond</span>
              </div>
            </div>
            <div className="scroll-down">
              <button>
                <img src={ArrowRight} alt="Arrow Right" />
              </button>
            </div>
            <div className="vetor-button">
              <button>
                <img src={Vector2} alt="Vetor 2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="next-section">
        <h1>Welcome to the Main Content</h1>
        <p>
          This content will now scroll up from underneath the sticky hero
          section.
        </p>
      </div>
    </>
  );
}
