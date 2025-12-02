import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CollectionVideoSection from "@components/collections/CollectionVideoSection";
import Section2CollectionDetail from "@components/collections/Section2CollectionDetail";
import Section3CollectionDetail from "@components/collections/Section3CollectionDetail";
import Section4CollectionDetail from "@components/collections/Section4CollectionDetail";
import ContactUs from "@components/contactUs/ContactUs";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ScrollToTopArrow from "@components/common/button/ScrollToTopArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: ".footer",
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
    <div className="collection-page-wrapper">
      {/* Section 1: Video Section Only */}
      <CollectionVideoSection />

      {/* Section 2: Collection Detail Information */}
      <Section2CollectionDetail collectionId={collectionId} />

      {/* Section 3: Auto-Slider Gallery */}
      <Section3CollectionDetail />

      {/* Section 4: Same Collection */}
      <Section4CollectionDetail
        collectionId={collectionId}
        showViewProductButton={true}
      />

      {/* Section 5: Contact Us */}
      <ContactUs />

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
      <div
        className={`fixed-scroll-top-container ${
          showScrollTop ? "visible" : ""
        }`}
      >
        <ScrollToTopArrow theme={arrowTheme} />
      </div>
    </div>
  );
};

export default CollectionDetailPage;
