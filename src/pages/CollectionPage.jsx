import React, { useEffect } from "react";
import Collection from "@components/collections/Collections";
import ViewAllProduct from "@components/viewAllProduct/ViewAllProduct";
import ContactUs from "@components/contactUs/ContactUs";

const CollectionPage = () => {
  useEffect(() => {
  }, []);

  return (
    <div className="collection-page-wrapper">
      {/* Section 1-3: Collection component */}
      <Collection />

      {/* Section 4: View All Products */}
      <ViewAllProduct showViewProductButton={true} />

      {/* Section 5: Contact Us */}
      <ContactUs />
    </div>
  );
};

export default CollectionPage;
