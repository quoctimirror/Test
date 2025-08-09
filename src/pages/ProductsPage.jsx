import { useEffect } from "react";
import View360 from "@components/view360/View360";
import SelectOptionSection from "@components/selectOptionSection/SelectOptionSection";
import ParallaxScrolling from "@components/parallaxScrolling/ParallaxScrolling";
import ViewAllProduct from "@components/viewAllProduct/ViewAllProduct";
import ContactUs from "@components/contactUs/ContactUs";
import "./products.css";

const ProductsPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="collection-page">
      {/* Section 1: View360 Component */}
      {/* <section className="collection-section-1">
        <View360 />
      </section> */}

      {/* Section 2: SelectOptionSection */}
      <section className="collection-section-2">
        <SelectOptionSection />
      </section>
      {/* Section 3 */}
      <ParallaxScrolling />

      {/* Section 4: View All Products */}
      <ViewAllProduct showViewProductButton={true} />

      {/* Section 5: Reach Out */}
      <ContactUs />
    </div>
  );
};

export default ProductsPage;
