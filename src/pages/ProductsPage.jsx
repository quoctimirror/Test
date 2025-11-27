import { useEffect, useState } from "react";
import View360 from "@components/view360/View360";
import SelectOptionSection from "@components/selectOptionSection/SelectOptionSection";
import ParallaxScrolling from "@components/parallaxScrolling/ParallaxScrolling";
import ViewAllProduct from "@components/viewAllProduct/ViewAllProduct";
import ContactUs from "@components/contactUs/ContactUs";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";
import "./products.css";

const ProductsPage = () => {
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
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo({ top: 0, behavior: "instant" });
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

  return (
    <div className="products-page">
      {/* Section 1: View360 Component */}
      {/* <section className="products-section-1"><View360 /></section> */}

      {/* Section 2: SelectOptionSection */}
      <section className="products-section-2">
        <SelectOptionSection />
      </section>
      {/* Section 3 */}
      <ParallaxScrolling />

      {/* Section 4: View All Products */}
      <ViewAllProduct showViewProductButton={true} />

      {/* Section 5: Reach Out */}
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
    </div>
  );
};

export default ProductsPage;
