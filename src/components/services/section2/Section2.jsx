import React, { useEffect, useRef, useState } from "react";
import "./Section2.css";

const Section2 = () => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress within this section
      const scrollTop = -rect.top;
      const scrollHeight = sectionHeight - windowHeight;
      const rawProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

      // Add buffer zones: 25% buffer at start, 50% transition zone, 25% buffer at end
      const startBuffer = 0.25;
      const endBuffer = 0.75; // transitions complete at 75%, leaving 25% buffer at end

      let adjustedProgress = 0;
      if (rawProgress < startBuffer) {
        adjustedProgress = 0; // Buffer zone before transitions
      } else if (rawProgress > endBuffer) {
        adjustedProgress = 1; // Buffer zone after transitions complete
      } else {
        // Active transition zone (25% to 75% of total scroll)
        adjustedProgress =
          (rawProgress - startBuffer) / (endBuffer - startBuffer);
      }

      setScrollProgress(adjustedProgress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="section2-wrapper">
      <div className="section2-sticky-container">
        {/* Sticky Image Area */}
        <div className="section2-sticky-images">
          <div
            className="section2-image-layer section2-image-1"
            style={{
              transform: `translateY(${scrollProgress * -100}%)`,
              opacity: 1 - scrollProgress * 0.5,
            }}
          >
            <img src="/public/services/img_section_2.jpg" alt="Product Care" />
          </div>
          <div
            className="section2-image-layer section2-image-2"
            style={{
              transform: `translateY(${(1 - scrollProgress) * 100}%)`,
              opacity: scrollProgress,
            }}
          >
            <img src="/public/services/img_3_section_2.jpg" alt="Trade In" />
          </div>
        </div>

        {/* Sticky Content Area */}
        <div className="section2-sticky-content">
          <div
            className="section2-content-layer section2-content-1"
            style={{
              opacity: scrollProgress < 0.5 ? 1 - scrollProgress * 2 : 0,
              transform: `translateY(${
                scrollProgress < 1 ? scrollProgress * -100 : -100
              }px)`,
              pointerEvents: scrollProgress < 0.5 ? "auto" : "none",
            }}
          >
            <div className="section2-content">
              <div className="section2-header">
                <span className="section2-subtitle">EXPLORE OUR</span>
                <h2 className="section2-title">PRODUCT CARE & REPAIR</h2>
              </div>
              <p className="section2-description">
                Extend the life and brilliance of your jewelry with
                <br /> Mirror's professional care and repair services,
                <br /> tailored to keep each piece as radiant as the day
                <br /> you received it.
              </p>
              <button className="section2-cta">See more</button>
            </div>
          </div>

          <div
            className="section2-content-layer section2-content-2"
            style={{
              opacity: scrollProgress > 0.5 ? (scrollProgress - 0.5) * 2 : 0,
              transform: `translateY(${
                scrollProgress < 1 ? scrollProgress * -100 : -100
              }px)`,
              pointerEvents: scrollProgress > 0.5 ? "auto" : "none",
            }}
          >
            <div className="section2-content">
              <div className="section2-header">
                <span className="section2-subtitle">EXPLORE OUR</span>
                <h2 className="section2-title">TRADE IN</h2>
              </div>
              <p className="section2-description">
                Elevate your gift with our signature wrapping — a carefully
                crafted presentation that captures the essence of refined
                giving.
              </p>
              <button className="section2-cta">See more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2;
