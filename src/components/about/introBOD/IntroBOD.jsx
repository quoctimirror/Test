import React, { useEffect, useRef } from "react";
import "./IntroBOD.css";

const IntroBOD = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  const headerText = "WHO WE ARE";
  const titleText = "THE MINDS BEHIND MIRROR";
  const descText = "Mirror is led by a collective of visionaries - blending innovation, design, and purpose. From strategy to storytelling, we shape a brand that's equal parts emotional and engineered.";

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

      if (Math.abs(progress - lastProgress) < 0.001) {
        ticking = false;
        return;
      }
      lastProgress = progress;

      // Phase 1 (0-20%): Move entire content to fixed position
      const moveProgress =
        progress <= 0.2 ? Math.max(0, Math.min(1, progress / 0.2)) : 1;

      if (contentRef.current) {
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5;
        const currentTranslateY = initialTranslateY - moveProgress * initialTranslateY;
        contentRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Phase 2 (20-35%): Header fade in + move up
      if (headerRef.current) {
        let headerY = 30, headerOpacity = 0;
        if (progress < 0.2) {
          headerY = 30; headerOpacity = 0;
        } else if (progress <= 0.35) {
          const fadeProgress = (progress - 0.2) / 0.15;
          headerY = (1 - fadeProgress) * 30;
          headerOpacity = fadeProgress;
        } else {
          headerY = 0; headerOpacity = 1;
        }
        headerRef.current.style.transform = `translate3d(0, ${headerY}%, 0)`;
        headerRef.current.style.opacity = headerOpacity;
      }

      // Phase 3 (35-50%): Title fade in + move up
      if (titleRef.current) {
        let titleY = 30, titleOpacity = 0;
        if (progress < 0.35) {
          titleY = 30; titleOpacity = 0;
        } else if (progress <= 0.5) {
          const fadeProgress = (progress - 0.35) / 0.15;
          titleY = (1 - fadeProgress) * 30;
          titleOpacity = fadeProgress;
        } else {
          titleY = 0; titleOpacity = 1;
        }
        titleRef.current.style.transform = `translate3d(0, ${titleY}%, 0)`;
        titleRef.current.style.opacity = titleOpacity;
      }

      // Phase 4 (50-65%): Description fade in + move up
      if (descRef.current) {
        let descY = 30, descOpacity = 0;
        if (progress < 0.5) {
          descY = 30; descOpacity = 0;
        } else if (progress <= 0.65) {
          const fadeProgress = (progress - 0.5) / 0.15;
          descY = (1 - fadeProgress) * 30;
          descOpacity = fadeProgress;
        } else {
          descY = 0; descOpacity = 1;
        }
        descRef.current.style.transform = `translate3d(0, ${descY}%, 0)`;
        descRef.current.style.opacity = descOpacity;
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
    <div className="intro-bod-section" ref={containerRef}>
      <div className="intro-sticky-wrapper" ref={stickyRef}>
        <div className="intro-content" ref={contentRef}>
          {/* Header */}
          <div className="intro-header" ref={headerRef}>
            <span className="bodytext-3--no-margin">{headerText}</span>
          </div>

          {/* Main Title */}
          <div className="intro-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">{titleText}</h1>
          </div>

          {/* Description */}
          <div className="intro-description" ref={descRef}>
            <p className="bodytext-4--no-margin">{descText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroBOD;