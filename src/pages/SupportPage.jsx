import React, { useEffect, useState } from "react";
import Section3 from "@components/services/section3/Section3";
import Section4 from "@components/services/section4/Section4";
import Section5 from "@components/services/section5/Section5";
import ContactUs from "@components/contactUs/ContactUs";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

const SupportPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);

  // Handle immersive button click
  const handleImmersiveClick = () => {
    console.log("Immersive button clicked");
  };

  // Detect scroll to collapse immersive button
  useEffect(() => {
    const handleScroll = () => {
      setIsImmersiveCollapsed(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="support-page">
      <main>
        <div data-section="section-3" data-navbar-theme="white">
          <Section3 />
        </div>
        <div data-section="section-4" data-navbar-theme="black">
          <Section4 />
        </div>
        <div data-section="section-5" data-navbar-theme="black">
          <Section5 />
        </div>
        <ContactUs />
      </main>

      {/* Fixed Immersive Button */}
      <div className="fixed-immersive-container">
        <ImmersiveButton
          theme={arrowTheme}
          isCollapsed={isImmersiveCollapsed}
          onClick={handleImmersiveClick}
        />
      </div>

      {/* Fixed Arrow Button */}
      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow theme={arrowTheme} onClick={handleArrowClick} />
        </div>
      )}
    </div>
  );
};

export default SupportPage;
