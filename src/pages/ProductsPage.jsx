import View360 from "@components/view360/View360";
import SelectOptionSection from "@components/selectOptionSection/SelectOptionSection";
import ParallaxScrolling from "@components/parallaxScrolling/ParallaxScrolling";
import SameCollection from "@components/sameCollection/SameCollection";
import Section5Products from "@components/section5Products/Section5Products";
import "./products.css";

const ProductsPage = () => {
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

      {/* Section 4: Same Collection */}
      <SameCollection />

      {/* Section 5: Reach Out */}
      <Section5Products />
    </div>
  );
};

export default ProductsPage;
