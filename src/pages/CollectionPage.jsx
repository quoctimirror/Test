import React, { useEffect } from "react";
import Collection from "@components/collections/Collections";
import SameCollection from "@components/sameCollection/SameCollection";
import Section5Products from "@components/section5Products/Section5Products";

const CollectionPage = () => {
  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Delayed scroll to ensure it works after render
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    // Also check sessionStorage flag for hard refresh cases
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

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
