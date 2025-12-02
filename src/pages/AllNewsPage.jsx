import React, { useState, useEffect } from "react";
import "./AllNewsPage.css";
import NewsHero from "@components/news/NewsHero";
import NewsGrid from "@components/news/NewsGrid";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

const AllNewsPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleImmersiveClick = () => {
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

  return (
    <div className="all-news-page">
      <div data-navbar-theme="white">
        <NewsHero />
      </div>
      <div data-navbar-theme="black">
        <NewsGrid />
      </div>

      <div className="fixed-immersive-container">
        <ImmersiveButton
          theme={arrowTheme}
          isCollapsed={isImmersiveCollapsed}
          onClick={handleImmersiveClick}
        />
      </div>

      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow theme={arrowTheme} onClick={handleArrowClick} />
        </div>
      )}

      <div className={`fixed-scroll-top-container ${showScrollTop ? 'visible' : ''}`}>
        <ScrollToTopArrow theme={arrowTheme} />
      </div>
    </div>
  );
};

export default AllNewsPage;
