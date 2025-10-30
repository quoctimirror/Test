import React, { useEffect } from "react";
import Collection from "@components/collections/Collections";
import ViewAllProduct from "@components/viewAllProduct/ViewAllProduct";
import ContactUs from "@components/contactUs/ContactUs";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import "@components/home-page/scrollEffect/ScrollEffect.css"; // Import CSS for arrow styling

const CollectionPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '[data-section="contact-us"], .footer', // Check both ContactUs section and global footer
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="collection-page-wrapper">
      {/* Section 1-3: Collection component with internal sections */}
      <Collection />

      {/* Section 4: View All Products */}
      <div data-section="view-all-product">
        <ViewAllProduct showViewProductButton={true} />
      </div>

      {/* Section 5: Contact Us */}
      <div data-section="contact-us">
        <ContactUs />
      </div>

      {/* Fixed Arrow Button */}
      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow onClick={handleArrowClick} />
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
