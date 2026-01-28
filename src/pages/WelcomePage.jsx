import { useEffect, useState } from "react";
import { getImageUrl } from "@utils/cloudflareMediaUtil";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";
import "./WelcomePage.css";

const WelcomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { theme: arrowTheme } = useBottomTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Set page title
    document.title = "MIRROR FUTURE DIAMOND | Premium Diamond Jewelry";

    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className={`welcome-page ${isLoaded ? "loaded" : ""}`}>
      {/* Background Image */}
      <div className="welcome-background-image"></div>

      {/* Logo */}
      <div className="welcome-logo">
        <img
          src={getImageUrl("welcome/welcome_logo.svg")}
          alt="MIRROR FUTURE DIAMOND"
        />
      </div>

      {/* Bottom text content */}
      <div className="welcome-bottom-text">
        <h2 className="bottom-text-line1 bodytext-1--no-margin">
          Awakening Luxury through Your Senses, in Every Time, Space, and
          Presence.
        </h2>
      </div>

      {/* Fixed Scroll to Top Button - only show when scroll-down arrow is hidden */}
      <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
        <ScrollToTopArrow theme={arrowTheme} />
      </div>
    </div>
  );
};

export default WelcomePage;
