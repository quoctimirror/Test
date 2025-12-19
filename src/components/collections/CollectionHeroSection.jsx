import React from "react";
import CollectionVideoSection from "./CollectionVideoSection";
import "./Collections.css";

const CollectionHeroSection = () => {
  return (
    <div className="hero-section-wrapper">
      {/* Background Video */}
      <CollectionVideoSection />

      {/* Text và Button Overlay */}
      <div className="hero-overlay-content">
        {/* <div className="hero-text-container">
          <div className="text-treasure">TREASURE</div>
          <div className="text-of-the">of the</div>
          <div className="text-orient">ORIENT</div>
        </div> */}
      </div>
    </div>
  );
};

export default CollectionHeroSection;
