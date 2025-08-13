import { useEffect, useRef } from "react";
import Logo from "@assets/images/Logo.svg";
import SoundIcon from "@assets/images/button/sound.svg";
import ArrowButton from "@assets/images/button/arrow-button.svg";
import TopBanner from "@components/topBanner/TopBanner";
import ImmersiveShowroom from "@components/immersiveShowroom/ImmersiveShowroom";
import HoverExpandSection from "@components/hoverExpandSection/HoverExpandSection";
import ContactUs from "@components/contactUs/ContactUs";
import "./home.css";

export default function HomePage() {
  const finalGradientRef = useRef(null);
  const elementsToFadeRef = useRef(null);

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo(0, 0);
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

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
      <TopBanner />
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
            {/* <div className="tagline-section">
              <div className="tagline-top">Exploring The Universe Of</div>
              <div className="tagline-bottom">
                <span className="future-text">Future</span>
                <span className="diamond-text">Diamond</span>
              </div>
            </div> */}
            <div className="scroll-down">
              <button>
                <img src={ArrowButton} alt="Arrow Button" />
              </button>
            </div>
            <div className="vetor-button">
              <button>
                <img src={SoundIcon} alt="Sound" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImmersiveShowroom />

      <HoverExpandSection />

      <ContactUs />
    </>
  );
}
