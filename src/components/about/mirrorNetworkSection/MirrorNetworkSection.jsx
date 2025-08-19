import React, { useEffect, useRef, useState } from "react";
import "./MirrorNetworkSection.css";

const MirrorNetworkSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const [headerRevealProgress, setHeaderRevealProgress] = useState(0);
  const [titleRevealProgress, setTitleRevealProgress] = useState(0);
  const [descriptionRevealProgress, setDescriptionRevealProgress] = useState(0);

  const headerText = "THE MIRROR NETWORK";
  const titleText = "A LIVING SYSTEM OF MODERN LUXURY";
  const descriptionText =
    "Mirror is not a place — it's a presence.\nOur Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal — amplifying presence, creativity, and connection.\n\nWe collaborate with artists, hotels, creators, and technologists to make luxury fluid — flowing through Sense, Time, Space, and Presence.";

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

      // Phase 2 (30-50% scroll): Header reveal
      if (progress > 0.3 && progress <= 0.5) {
        const headerProgress = (progress - 0.3) / 0.2;
        setHeaderRevealProgress(Math.min(1, headerProgress));
      } else if (progress <= 0.3) {
        setHeaderRevealProgress(0);
      } else {
        setHeaderRevealProgress(1);
      }

      // Phase 3 (50-70% scroll): Title reveal
      if (progress > 0.5 && progress <= 0.7) {
        const titleProgress = (progress - 0.5) / 0.2;
        setTitleRevealProgress(Math.min(1, titleProgress));
      } else if (progress <= 0.5) {
        setTitleRevealProgress(0);
      } else {
        setTitleRevealProgress(1);
      }

      // Phase 4 (70-100% scroll): Description reveal
      if (progress > 0.7) {
        const descProgress = (progress - 0.7) / 0.3;
        setDescriptionRevealProgress(Math.min(1, descProgress));
      } else {
        setDescriptionRevealProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="mirror-network-section" ref={containerRef}>
      <div className="mirror-network-sticky-wrapper" ref={stickyRef}>
        <div className="mirror-network-content" ref={contentRef}>
          {/* Header */}
          <div className="mirror-network-header" ref={headerRef}>
            <p className="bodytext-3--no-margin">
              {headerText.split("").map((char, index) => {
                const charProgress = (index + 1) / headerText.length;
                const isRevealed = headerRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#000" : "rgba(0, 0, 0, 0.1)",
                      transition: "color 0.05s ease",
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Main Title */}
          <div className="mirror-network-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">
              {titleText.split("").map((char, index) => {
                const charProgress = (index + 1) / titleText.length;
                const isRevealed = titleRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#000" : "rgba(0, 0, 0, 0.1)",
                      transition: "color 0.05s ease",
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </h1>
          </div>

          {/* Description */}
          <div className="mirror-network-description" ref={descriptionRef}>
            <p className="bodytext-1--no-margin">
              {descriptionText.split("").map((char, index) => {
                const charProgress = (index + 1) / descriptionText.length;
                const isRevealed = descriptionRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#000" : "rgba(0, 0, 0, 0.1)",
                      transition: "color 0.05s ease",
                    }}
                  >
                    {char === "\n" ? <br /> : char}
                  </span>
                );
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorNetworkSection;
