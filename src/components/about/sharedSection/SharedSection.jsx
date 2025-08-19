import React, { useEffect, useRef, useState } from "react";
import GlassButton from "../../common/GlassButton";
import "./SharedSection.css";

const SharedSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  
  const [headerRevealProgress, setHeaderRevealProgress] = useState(0);
  const [titleRevealProgress, setTitleRevealProgress] = useState(0);
  const [descriptionRevealProgress, setDescriptionRevealProgress] = useState(0);

  const headerText = "THE FUTURE IS SHARED";
  const titleText = "YOU DON'T JUST WEAR MIRROR.\nYOU BECOME PART OF IT.";
  const descriptionText = "We invite you not just to own - but to belong.\nTo co-create, to grow, to reflect.\n\nEvery interaction with Mirror - a try-on, a purchase, a story - becomes a part of the Mirrorverse. Because luxury doesn't begin in the box. It begins with you.";

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));
      
      // Phase 1 (0-30% scroll): Move entire content to fixed position
      const moveProgress = progress <= 0.3 ? Math.max(0, Math.min(1, progress / 0.3)) : 1;
      
      if (contentRef.current) {
        // Calculate initial position (bottom of viewport) to final position (center)
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5; // Start from bottom
        
        const currentTranslateY = initialTranslateY - (moveProgress * initialTranslateY);
        const currentScale = 0.8 + (moveProgress * 0.2); // Scale from 0.8 to 1.0
        contentRef.current.style.transform = `translateY(${currentTranslateY}px) scale(${currentScale})`;
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
    <div className="shared-section" ref={containerRef}>
      <div className="shared-sticky-wrapper" ref={stickyRef}>
        <div className="shared-content" ref={contentRef}>
          {/* Header */}
          <div className="shared-header" ref={headerRef}>
            <p className="bodytext-3--no-margin">
              {headerText.split("").map((char, index) => {
                const charProgress = (index + 1) / headerText.length;
                const isRevealed = headerRevealProgress >= charProgress;
                
                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? '#fff' : 'rgba(255, 255, 255, 0.25)',
                      transition: 'color 0.05s ease'
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Main Title */}
          <div className="shared-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">
              {titleText.split("").map((char, index) => {
                const charProgress = (index + 1) / titleText.length;
                const isRevealed = titleRevealProgress >= charProgress;
                
                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? '#fff' : 'rgba(255, 255, 255, 0.25)',
                      transition: 'color 0.05s ease'
                    }}
                  >
                    {char === '\n' ? <br /> : char}
                  </span>
                );
              })}
            </h1>
          </div>

          {/* Description */}
          <div className="shared-description" ref={descriptionRef}>
            <p className="bodytext-1--no-margin">
              {descriptionText.split("").map((char, index) => {
                const charProgress = (index + 1) / descriptionText.length;
                const isRevealed = descriptionRevealProgress >= charProgress;
                
                return (
                  <span
                    key={index}
                    style={{
                      color: isRevealed ? '#fff' : 'rgba(255, 255, 255, 0.25)',
                      transition: 'color 0.05s ease'
                    }}
                  >
                    {char === '\n' ? <br /> : char}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Buttons */}
          <div className="shared-buttons">
            <GlassButton theme="glass" width={136} height={57}>AR Try on</GlassButton>
            <GlassButton theme="glass" width={221} height={57}>Immersive Showroom</GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSection;