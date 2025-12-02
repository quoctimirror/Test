import React, { useEffect, useState } from "react";
import BookAppointment from "@components/bookAppointment/BookAppointment";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

const BookAppointmentPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    <div className="book-appointment-page">
      <BookAppointment />

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

      {/* Fixed Scroll to Top Button - only show when scroll-down arrow is hidden */}
      <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
        <ScrollToTopArrow theme={arrowTheme} />
      </div>
    </div>
  );
};

export default BookAppointmentPage;
