import React, { useEffect, useRef } from "react";
import "./AtMirror.css";

const AtMirror = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const textRef = useRef(null);

  const fullText =
    "At Mirror, our team is a constellation of creators, engineers, and storytellers. Together, we weave emotion and precision into every detail — shaping experiences that reflect not just who we are, but the future we believe in.";

  useEffect(() => {
    let ticking = false;
    let lastProgress = -1;

    const updateScroll = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start animation when section top enters viewport from bottom
      const scrolled = viewportHeight - rect.top;
      const totalScrollDistance = container.offsetHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));

      // Skip update if progress hasn't changed significantly
      if (Math.abs(progress - lastProgress) < 0.001) {
        ticking = false;
        return;
      }
      lastProgress = progress;

      // Phase 1 (0-20% scroll): Move entire content to fixed position
      const moveProgress =
        progress <= 0.2 ? Math.max(0, Math.min(1, progress / 0.2)) : 1;

      if (contentRef.current) {
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5;
        const currentTranslateY = initialTranslateY - moveProgress * initialTranslateY;
        contentRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Phase 2 (20-100% scroll): Text fade in + move up
      if (textRef.current) {
        let textY = 30;
        let textOpacity = 0;

        if (progress < 0.2) {
          textY = 30;
          textOpacity = 0;
        } else if (progress <= 0.5) {
          const fadeProgress = (progress - 0.2) / 0.3;
          textY = (1 - fadeProgress) * 30;
          textOpacity = fadeProgress;
        } else {
          textY = 0;
          textOpacity = 1;
        }

        textRef.current.style.transform = `translate3d(0, ${textY}%, 0)`;
        textRef.current.style.opacity = textOpacity;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="at-mirror-section" ref={containerRef}>
      <div className="at-mirror-sticky-wrapper" ref={stickyRef}>
        <div className="at-mirror-content" ref={contentRef}>
          {/* Text */}
          <div className="at-mirror-text" ref={textRef}>
            <p className="bodytext-1--no-margin">{fullText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtMirror;
