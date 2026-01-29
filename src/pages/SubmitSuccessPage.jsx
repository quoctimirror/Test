import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";
import "./SubmitSuccessPage.css";
import { ROUTES } from "@/constants/routes";
import { useImmersiveModal } from "@/contexts/ImmersiveModalContext";

const SubmitSuccessPage = () => {
  const navigate = useNavigate();
  const { openModal } = useImmersiveModal();

  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleImmersiveButtonClick = () => {
    console.log("Immersive button clicked");
  };

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

  const handleImmersiveShowroom = () => {
    openModal();
  };

  const handleBackToSubmit = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="submit-success-page">
      <div className="submit-success-content">
        <h1 className="submit-success-title heading-1--no-margin">
          SUBMITTED!
        </h1>
        <p className="submit-success-description bodytext-3--no-margin">
          You will receive a confirmation email with your submission.
        </p>

        <div className="submit-success-buttons">
          <ShineGlassButton theme="light" onClick={handleImmersiveShowroom}>
            Immersive Showroom
          </ShineGlassButton>
          <UnderlineButton
            className="submit-success-back-btn"
            textClassName="bodytext-6--no-margin"
            onClick={handleBackToSubmit}
          >
            Back to submission page
          </UnderlineButton>
        </div>
      </div>

      {/* Fixed Immersive Button */}
      <div className="fixed-immersive-container">
        <ImmersiveButton
          theme={arrowTheme}
          isCollapsed={isImmersiveCollapsed}
          onClick={handleImmersiveButtonClick}
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

export default SubmitSuccessPage;
