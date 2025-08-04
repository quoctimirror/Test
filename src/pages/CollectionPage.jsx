import React from "react";
import Collection from "../components/collections/Collections";
import SameCollection from "../components/sameCollection/SameCollection";
import Section5Products from "../components/section5Products/Section5Products";

const CollectionPage = () => {
  return (
    <div className="collection-page-wrapper">
      {/* Section 1-3: Collection component */}
      <Collection />

      {/* Section 4: Same Collection */}
      <SameCollection showViewProductButton={true} />

      {/* Section 5: Section5Products */}
      <Section5Products />
    </div>
  );
};

export default CollectionPage;
