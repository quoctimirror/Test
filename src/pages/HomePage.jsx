import { useEffect, useRef } from "react";
import Logo from "@assets/images/Logo.svg";
import SoundIcon from "@assets/images/button/sound.svg";
import ArrowButton from "@assets/images/button/arrow-button.svg";
import TopBanner from "@components/topBanner/TopBanner";
import ImmersiveShowroom from "@components/home-page/immersiveShowroom/ImmersiveShowroom";
import BrandPillars from "@components/home-page/brandPillars/BrandPillars";
import Lumex91 from "@components/home-page/lumex91/Lumex91";
import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import FutureDiamond from "@components/home-page/futureDiamond/FutureDiamond";
import HoverExpandSection from "@components/home-page/hoverExpandSection/HoverExpandSection";
import MirrorIntroduce from "@components/home-page/mirrrorIntroduce/MirrorIntroduce";
import ContactUs from "@components/contactUs/ContactUs";
import "./home.css";

export default function HomePage() {
  const finalGradientRef = useRef(null);
  const elementsToFadeRef = useRef(null);
  const mainLogoRef = useRef(null);
  const futureDiamondTextRef = useRef(null);

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
      const animationEnd = window.innerHeight; // Extended to match 300vh container

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

      // Main logo fade out at 60% progress (earlier)
      if (mainLogoRef.current) {
        const logoFadeProgress = Math.min(
          1,
          Math.max(0, (progress - 0.6) * 2.5)
        ); // 0.6 to 1.0 progress
        mainLogoRef.current.style.opacity = 1 - logoFadeProgress;
      }

      // Future Diamond text fade in from 70% to 95% progress
      if (futureDiamondTextRef.current) {
        const textFadeProgress = Math.min(
          1,
          Math.max(0, (progress - 0.7) / (0.95 - 0.7))
        ); // 0.7 to 0.95 progress
        futureDiamondTextRef.current.style.opacity = textFadeProgress;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <TopBanner /> */}
      <div className="scroll-container">
        <div className="homepage">
          <div className="gradient-initial">
            <div className="gradient-top"></div>
            <div className="gradient-bottom"></div>
          </div>

          <div className="gradient-final" ref={finalGradientRef}></div>

          <div className="logo-center" ref={mainLogoRef}>
            <img src={Logo} alt="Mirror Logo" className="main-logo" />
          </div>

          <div className="future-diamond-text" ref={futureDiamondTextRef}>
            <div className="tagline-section">
              <span className="bodytext-1--no-margin">
                Exploring The Universe Of
              </span>
              <br />
              <span className="future-text heading-1--no-margin">
                Future Diamond
              </span>
            </div>
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

      <MirrorIntroduce />

      <FutureDiamond />

      <Lumex91 />

      <BrandPillars />

      <UniverseSection />

      <ImmersiveShowroom />

      <HoverExpandSection />

      <ContactUs />
    </>
  );
}
