import React from "react";
import { MediaVideo } from "@components/common/media";
import "./SloganSection.css";

const SloganSection = () => {
  return (
    <div className="slogan-section-wrapper">
      <div className="slogan-section">
        <MediaVideo
          className="slogan-background-video"
          src="about/section1/Top_video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="slogan-content">
          {/* Add slogan content here */}
        </div>
      </div>
      <div className="slogan-spacer"></div>
    </div>
  );
};

export default SloganSection;