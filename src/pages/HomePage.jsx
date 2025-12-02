import { useState, useEffect } from "react";
import TopBanner from "@components/topBanner/TopBanner";
import ScrollEffect from "@components/home-page/scrollEffect/ScrollEffect";
import ImmersiveShowroom from "@components/home-page/immersiveShowroom/ImmersiveShowroom";
import BrandPillars from "@components/home-page/brandPillars/BrandPillars";
// import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import FutureDiamond from "@components/home-page/futureDiamond/FutureDiamond";
import HoverExpandSection from "@components/home-page/hoverExpandSection/HoverExpandSection";
import ContactUs from "@components/contactUs/ContactUs";
import MirrorQuote from "@components/home-page/mirrorQuote/MirrorQuote";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

export default function HomePage() {
  // Overlay state management - lifted up from MirrorExp
  const [showSenseOverlay, setShowSenseOverlay] = useState(false);
  const [showPresenceOverlay, setShowPresenceOverlay] = useState(false);
  const [showSpaceOverlay, setShowSpaceOverlay] = useState(false);
  const [showTimeOverlay, setShowTimeOverlay] = useState(false);
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Check if any overlay is open
  const isAnyOverlayOpen = showSenseOverlay || showPresenceOverlay || showSpaceOverlay || showTimeOverlay;

  // Hooks for scroll buttons
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '[data-section="contact-us"], .footer',
  });
  const { theme: arrowTheme } = useBottomTheme();

  // Handle immersive button click
  const handleImmersiveClick = () => {
    console.log("Immersive button clicked");
  };

  // Detect scroll to collapse immersive button and show scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsImmersiveCollapsed(scrollY > 100);
      setShowScrollTop(scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <TopBanner /> */}

      <div data-section="scroll-effect" data-navbar-theme="white">
        <ScrollEffect isAnyOverlayOpen={isAnyOverlayOpen} />
      </div>

      <div data-section="future-diamond" data-navbar-theme="white">
        <FutureDiamond />
      </div>

      {/* <div data-section="mirror-quote">
        <MirrorQuote />
      </div> */}

      <div data-section="brand-pillars" data-navbar-theme="white">
        <BrandPillars />
      </div>

      <div data-section="universe-section" data-navbar-theme="white">
        <UniverseSection
          showSenseOverlay={showSenseOverlay}
          setShowSenseOverlay={setShowSenseOverlay}
          showPresenceOverlay={showPresenceOverlay}
          setShowPresenceOverlay={setShowPresenceOverlay}
          showSpaceOverlay={showSpaceOverlay}
          setShowSpaceOverlay={setShowSpaceOverlay}
          showTimeOverlay={showTimeOverlay}
          setShowTimeOverlay={setShowTimeOverlay}
        />
      </div>

      <div data-section="immersive-showroom" data-navbar-theme="white">
        <ImmersiveShowroom />
      </div>

      <div data-section="hover-expand" data-navbar-theme="white">
        <HoverExpandSection />
      </div>

      <div data-section="contact-us" data-navbar-theme="white">
        <ContactUs />
      </div>

      {/* Fixed Scroll to Top Button - only show when scroll-down arrow is hidden */}
      {/* Note: ImmersiveButton and ScrollDownArrow are already rendered by ScrollEffect component */}
      <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
        <ScrollToTopArrow theme={arrowTheme} />
      </div>
    </>
  );
}
