import React, { useEffect, useRef, useState } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./StartingPlaceSection.css";

const StartingPlaceSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const [headerRevealProgress, setHeaderRevealProgress] = useState(0);
  const [titleRevealProgress, setTitleRevealProgress] = useState(0);
  const [descRevealProgress, setDescRevealProgress] = useState(0);

  const headerText = "WHERE IT ALL BEGAN";
  const titleText = "FROM RARITY TO RESONANCE";
  const descText =
    "In a world where diamond mines scar the earth, Mirror offers a different reflection - one where rare science becomes soul, and beauty carries meaning. Our Love-Grown Diamonds™ are created through cutting-edge science — a process that honors both planet and person. Each gem is shaped not by rarity, but by responsibility, intention, and the desire to connect.";

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Phase 1 (0-30% scroll): Move entire content to fixed position
      const moveProgress =
        progress <= 0.3 ? Math.max(0, Math.min(1, progress / 0.3)) : 1;

      if (contentRef.current) {
        // Calculate initial position (bottom of viewport) to final position (center)
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5; // Start from bottom

        const currentTranslateY =
          initialTranslateY - moveProgress * initialTranslateY;
        contentRef.current.style.transform = `translateY(${currentTranslateY}px)`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Phase 2 (30-50% scroll): Header text reveal
      if (progress > 0.3 && progress <= 0.5) {
        const revealProgress = (progress - 0.3) / 0.2;
        setHeaderRevealProgress(revealProgress);
      } else if (progress > 0.5) {
        setHeaderRevealProgress(1);
      } else {
        setHeaderRevealProgress(0);
      }

      // Phase 3 (50-70% scroll): Title text reveal
      if (progress > 0.5 && progress <= 0.7) {
        const revealProgress = (progress - 0.5) / 0.2;
        setTitleRevealProgress(revealProgress);
      } else if (progress > 0.7) {
        setTitleRevealProgress(1);
      } else {
        setTitleRevealProgress(0);
      }

      // Phase 4 (70-100% scroll): Description text reveal
      if (progress > 0.7) {
        const revealProgress = (progress - 0.7) / 0.3;
        setDescRevealProgress(Math.min(1, revealProgress));
      } else {
        setDescRevealProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="starting-place-section" ref={containerRef}>
      <div className="starting-sticky-wrapper" ref={stickyRef}>
        <div className="starting-content" ref={contentRef}>
          {/* Header */}
          <div className="starting-header" ref={headerRef}>
            <span className="bodytext-3--no-margin">
              {headerText.split("").map((char, index) => {
                const charProgress = (index + 1) / headerText.length;
                const isRevealed = headerRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#fff" : "rgba(255, 255, 255, 0.25)",
                      transition: "color 0.1s ease",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </span>
          </div>

          {/* Main Title */}
          <div className="starting-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">
              {titleText.split("").map((char, index) => {
                const charProgress = (index + 1) / titleText.length;
                const isRevealed = titleRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#fff" : "rgba(255, 255, 255, 0.25)",
                      transition: "color 0.1s ease",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </h1>
          </div>

          {/* Description */}
          <div className="starting-description" ref={descRef}>
            <p className="bodytext-1--no-margin">
              {descText.split("").map((char, index) => {
                const charProgress = (index + 1) / descText.length;
                const isRevealed = descRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#fff" : "rgba(255, 255, 255, 0.25)",
                      transition: "color 0.05s ease",
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Explore Button */}
          <div className="starting-button">
            <ShineGlassButton width={189} height={57} fontSize={14} theme="shine">Explore Our Drops</ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartingPlaceSection;
