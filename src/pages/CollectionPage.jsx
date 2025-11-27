import React, { useEffect, useState } from "react";
import Collection from "@components/collections/Collections";
import ViewAllProduct from "@components/viewAllProduct/ViewAllProduct";
import ContactUs from "@components/contactUs/ContactUs";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css"; // Import CSS for arrow styling

const CollectionPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '[data-section="contact-us"], .footer', // Check both ContactUs section and global footer
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);

  // Handle immersive button click
  const handleImmersiveClick = () => {
    // TODO: Navigate to immersive showroom or open immersive experience
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
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="collection-page-wrapper">
      {/* Section 1-3: Collection component with internal sections */}
      <div data-section="collection">
        <Collection />
      </div>

      {/* Section 4: View All Products */}
      <div data-section="view-all-product" data-navbar-theme="black">
        <ViewAllProduct showViewProductButton={true} />
      </div>

      {/* Section 5: Contact Us */}
      <div data-section="contact-us">
        <ContactUs />
      </div>

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

export default CollectionPage;
