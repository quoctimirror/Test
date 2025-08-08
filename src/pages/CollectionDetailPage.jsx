import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import CollectionVideoSection from "@components/collections/CollectionVideoSection";
import Section2CollectionDetail from "@components/collections/Section2CollectionDetail";
import Section3CollectionDetail from "@components/collections/Section3CollectionDetail";
import Section4CollectionDetail from "@components/collections/Section4CollectionDetail";
import ContactUs from "@components/contactUs/ContactUs";

const CollectionDetailPage = () => {
  const { collectionId } = useParams();

  return (
    <div className="collection-page-wrapper">
      {/* Section 1: Video Section Only */}
      <CollectionVideoSection />

      {/* Section 2: Collection Detail Information */}
      <Section2CollectionDetail />

      {/* Section 3: Auto-Slider Gallery */}
      <Section3CollectionDetail />

      {/* Section 4: Same Collection */}
      <Section4CollectionDetail showViewProductButton={true} />

      {/* Section 5: Contact Us */}
      <ContactUs />
    </div>
  );
};

export default CollectionDetailPage;
