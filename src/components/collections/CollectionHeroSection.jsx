import React, { useRef } from "react";
import CollectionVideoSection from "./CollectionVideoSection";
import "./Collections.css";

const CollectionHeroSection = ({ onScrollToSection2 }) => {
  const handleScrollDown = () => {
    if (onScrollToSection2) {
      onScrollToSection2();
    }
  };

  return (
    <div className="hero-section-wrapper">
      {/* Background Video */}
      <CollectionVideoSection />

      {/* Text và Button Overlay */}
      <div className="hero-overlay-content">
        <div className="hero-text-container">
          <div className="text-treasure">TREASURE</div>
          <div className="text-of-the">of the</div>
          <div className="text-orient">ORIENT</div>
        </div>

        <button
          className="scroll-down-arrow"
          onClick={handleScrollDown}
          aria-label="Scroll down"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 9L12 16L5 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CollectionHeroSection;
