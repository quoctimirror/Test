import React, { useEffect, useRef, useState } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./MirrorverseSection.css";

const MirrorverseSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const [headerRevealProgress, setHeaderRevealProgress] = useState(0);
  const [titleRevealProgress, setTitleRevealProgress] = useState(0);
  const [descriptionRevealProgress, setDescriptionRevealProgress] = useState(0);

  const headerText = "ENTER THE MIRRORVERSE";
  const titleText = "WHERE LUXURY BECOMES AN EXPERIENCE";
  const descriptionText =
    "Mirror is more than a brand. It's a world.\n\nThrough AR try-ons, immersive showrooms, sensorial storytelling, we invite you to experience jewelry in a way that awakens every sense - from the flicker of a candlelight to the touch of velvet trays, from curated soundscapes to mirror illusions. This is luxury you don't just wear — you step into it.";

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
    <div className="mirrorverse-section" ref={containerRef}>
      <div className="mirrorverse-sticky-wrapper" ref={stickyRef}>
        <div className="mirrorverse-content" ref={contentRef}>
          {/* Header */}
          <div className="mirrorverse-header" ref={headerRef}>
            <p className="bodytext-3--no-margin">
              {headerText.split("").map((char, index) => {
                const charProgress = (index + 1) / headerText.length;
                const isRevealed = headerRevealProgress >= charProgress;

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

          {/* Main Title */}
          <div className="mirrorverse-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">
              {titleText.split("").map((char, index) => {
                const charProgress = (index + 1) / titleText.length;
                const isRevealed = titleRevealProgress >= charProgress;

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
            </h1>
          </div>

          {/* Description */}
          <div className="mirrorverse-description" ref={descriptionRef}>
            <p className="bodytext-1--no-margin">
              {descriptionText.split("").map((char, index) => {
                const charProgress = (index + 1) / descriptionText.length;
                const isRevealed = descriptionRevealProgress >= charProgress;

                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? "#fff" : "rgba(255, 255, 255, 0.25)",
                      transition: "color 0.05s ease",
                    }}
                  >
                    {char === "\n" ? <br /> : char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Buttons */}
          <div className="mirrorverse-buttons">
            <ShineGlassButton theme="shine" width={136} height={57} fontSize={14}>
              AR Try on
            </ShineGlassButton>
            <ShineGlassButton theme="shine" width={221} height={57} fontSize={14}>
              Immersive Showroom
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorverseSection;
