import React, { useEffect, useRef, useState } from "react";
import "./AtMirror.css";

const AtMirror = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const [textRevealProgress, setTextRevealProgress] = useState(0);

  const fullText =
    "At Mirror, our team is a constellation of creators, engineers, and storytellers. Together, we weave emotion and precision into every detail — shaping experiences that reflect not just who we are, but the future we believe in.";

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

      // Phase 2 (30-100% scroll): Text reveal
      if (progress > 0.3) {
        const revealProgress = (progress - 0.3) / 0.7;
        setTextRevealProgress(Math.min(1, revealProgress));
      } else {
        setTextRevealProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="at-mirror-section" ref={containerRef}>
      <div className="at-mirror-sticky-wrapper" ref={stickyRef}>
        <div className="at-mirror-content" ref={contentRef}>
          {/* Text */}
          <div className="at-mirror-text" ref={textRef}>
            <p className="bodytext-1--no-margin">
              {fullText.split("").map((char, index) => {
                const charProgress = (index + 1) / fullText.length;
                const isRevealed = textRevealProgress >= charProgress;

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
        </div>
      </div>
    </div>
  );
};

export default AtMirror;
