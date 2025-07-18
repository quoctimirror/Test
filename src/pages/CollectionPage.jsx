import View360 from "@components/view360/View360";
import SelectOptionSection from "@components/selectOptionSection/SelectOptionSection";
import "@styles/collection.css";

const CollectionPage = () => {
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

      {/* Section 3: Placeholder for additional content */}
      <section className="collection-section-3">
        <div className="section-content">
          <h2>Related Products</h2>
          <p>This section will show related products or recommendations.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="collection-footer">
        <div className="footer-content">
          <p>&copy; 2024 Mirror Diamond. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CollectionPage;
