import React from "react";
import "./SloganSection.css";

const SloganSection = () => {
  return (
    <div className="slogan-section-wrapper">
      <div className="slogan-section">
        <video
          className="slogan-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/about/section1/Top_video.mp4" type="video/mp4" />
        </video>
        
        <div className="slogan-content">
          {/* Add slogan content here */}
        </div>

        <button className="scroll-down-arrow" aria-label="Scroll down">
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
      <div className="slogan-spacer"></div>
    </div>
  );
};

export default SloganSection;