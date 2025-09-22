import React from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./DiscoverSection.css";

const DiscoverSection = () => {
  return (
    <div className="discover-section">
      {/* Abstract geometric shapes */}
      <div className="discover-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
        <div className="shape shape-7"></div>
        <div className="shape shape-8"></div>
      </div>

      {/* Button */}
      <div className="discover-button-container">
        <ShineGlassButton theme="light">
          Discover the Mirror Network
        </ShineGlassButton>
      </div>
    </div>
  );
};

export default DiscoverSection;
