import React from "react";
import "./SloganSection.css";

const SloganSection = () => {
  return (
    <div className="slogan-section">
      <video
        className="slogan-background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/about/section1/1.mp4" type="video/mp4" />
      </video>
      
      <div className="slogan-content">
        {/* Add slogan content here */}
      </div>
    </div>
  );
};

export default SloganSection;