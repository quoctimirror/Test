import React, { useState, useEffect } from "react";
import { MediaVideo } from "@components/common/media";
import "./SloganSection.css";

const SloganSection = () => {
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Hide slogan very early - when within 3 viewport heights from bottom
      // This ensures slogan disappears well before footer reveal, even with extremely fast scrolling
      const threshold = documentHeight - (window.innerHeight * 3);
      const nearFooter = scrollPosition >= threshold;

      setIsNearFooter(nearFooter);
    };

    // Check immediately on mount
    handleScroll();

    // Listen to scroll without throttle for immediate response on fast scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="slogan-section-wrapper">
      <div className={`slogan-section ${isNearFooter ? 'hidden' : ''}`}>
        <MediaVideo
          className="slogan-background-video"
          src="about/section1/Top_video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="slogan-content">
          <p className="bodytext-4--no-margin slogan-text">
            In a world where diamond mines scar the earth, Mirror offers a different reflection - one where science becomes soul, and beauty carries meaning.
          </p>
        </div>
      </div>
      <div className="slogan-spacer"></div>
    </div>
  );
};

export default SloganSection;