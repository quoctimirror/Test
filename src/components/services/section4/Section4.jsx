import React, { useEffect, useRef, useState } from "react";
import "./Section4.css";

const Section4 = () => {
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

      // Add buffer zones: 20% buffer at start, 60% transition zone, 20% buffer at end
      const startBuffer = 0.2;
      const endBuffer = 0.8; // transitions complete at 80%, leaving 20% buffer at end

      let adjustedProgress = 0;
      if (rawProgress < startBuffer) {
        adjustedProgress = 0; // Buffer zone before transitions
      } else if (rawProgress > endBuffer) {
        adjustedProgress = 1; // Buffer zone after transitions complete
      } else {
        // Active transition zone (20% to 80% of total scroll)
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
    <div ref={sectionRef} className="section4-wrapper">
      <div className="section4-sticky-container">
        {/* Sticky Image Area */}
        <div className="section4-sticky-images">
          <div
            className="section4-image-layer section4-image-1"
            style={{
              transform: `translateY(${
                scrollProgress < 0.5 ? scrollProgress * 2 * -100 : -100
              }%)`,
              opacity: scrollProgress < 0.5 ? 1 - scrollProgress * 1 : 0.5,
            }}
          >
            <img
              src="/public/services/img_1_section_3.jpg"
              alt="Return & Exchange"
            />
          </div>
          <div
            className="section4-image-layer section4-image-2"
            style={{
              transform: `translateY(${
                scrollProgress < 0.5
                  ? (1 - scrollProgress * 2) * 100
                  : (scrollProgress - 0.5) * 2 * -100
              }%)`,
              opacity:
                scrollProgress < 0.5
                  ? scrollProgress * 2
                  : 1 - (scrollProgress - 0.5) * 1,
            }}
          >
            <img
              src="/public/services/img_2_section_3.jpg"
              alt="Sizing Guide"
            />
          </div>
          <div
            className="section4-image-layer section4-image-3"
            style={{
              transform: `translateY(${
                scrollProgress < 0.5 ? 100 : (1 - scrollProgress) * 200
              }%)`,
              opacity: scrollProgress > 0.5 ? (scrollProgress - 0.5) * 2 : 0,
            }}
          >
            <img
              src="/public/services/img_2_section_2.jpg"
              alt="Warranty & Info"
            />
          </div>
        </div>

        {/* Sticky Content Area */}
        <div className="section4-sticky-content">
          <div
            className="section4-content-layer section4-content-1"
            style={{
              opacity: scrollProgress < 0.33 ? 1 - scrollProgress * 3 : 0,
              transform: `translateY(${
                scrollProgress < 1 ? scrollProgress * -100 : -100
              }px)`,
              pointerEvents: scrollProgress < 0.33 ? "auto" : "none",
            }}
          >
            <div className="section4-content">
              <div className="section4-header">
                <span className="section4-subtitle">EXPLORE OUR</span>
                <h2 className="section4-title">RETURN & EXCHANGE</h2>
              </div>
              <p className="section4-description">
                Extend the life and brilliance of your jewelry with Mirror's
                professional care and repair services, tailored to keep each
                piece as radiant as the day you received it.
              </p>
              <button className="section4-cta">See more</button>
            </div>
          </div>

          <div
            className="section4-content-layer section4-content-2"
            style={{
              opacity:
                scrollProgress > 0.33 && scrollProgress < 0.67
                  ? (scrollProgress - 0.33) * 3
                  : 0,
              transform: `translateY(${
                scrollProgress < 1 ? scrollProgress * -100 : -100
              }px)`,
              pointerEvents:
                scrollProgress > 0.33 && scrollProgress < 0.67
                  ? "auto"
                  : "none",
            }}
          >
            <div className="section4-content">
              <div className="section4-header">
                <span className="section4-subtitle">EXPLORE OUR</span>
                <h2 className="section4-title">SIZING GUIDE</h2>
              </div>
              <p className="section4-description">
                Elevate your gift with our signature wrapping — a carefully
                crafted presentation that captures the essence of refined
                giving.
              </p>
              <button className="section4-cta">See more</button>
            </div>
          </div>

          <div
            className="section4-content-layer section4-content-3"
            style={{
              opacity: scrollProgress > 0.67 ? (scrollProgress - 0.67) * 3 : 0,
              transform: `translateY(${
                scrollProgress < 1 ? scrollProgress * -100 : -100
              }px)`,
              pointerEvents: scrollProgress > 0.67 ? "auto" : "none",
            }}
          >
            <div className="section4-content">
              <div className="section4-header">
                <span className="section4-subtitle">EXPLORE OUR</span>
                <h2 className="section4-title">WARRANTY & INFO</h2>
              </div>
              <p className="section4-description">
                Elevate your gift with our signature wrapping — a carefully
                crafted presentation that captures the essence of refined
                giving.
              </p>
              <button className="section4-cta">See more</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section4;
