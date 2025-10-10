import React, { useEffect, useRef } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./StartingPlaceSection.css";

const StartingPlaceSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const buttonRef = useRef(null);

  const headerText = "WHERE IT ALL BEGAN";
  const titleText = "FROM RARITY TO RESONANCE";
  const descText =
    "In a world where diamond mines scar the earth, Mirror offers a different reflection - one where rare science becomes soul, and beauty carries meaning. Our Love-Grown Diamonds™ are created through cutting-edge science — a process that honors both planet and person. Each gem is shaped not by rarity, but by responsibility, intention, and the desire to connect.";

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Phase 1 (0-20% scroll): Move entire content to fixed position
      const moveProgress =
        progress <= 0.2 ? Math.max(0, Math.min(1, progress / 0.2)) : 1;

      if (contentRef.current) {
        // Calculate initial position (bottom of viewport) to final position (center)
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5; // Start from bottom

        const currentTranslateY =
          initialTranslateY - moveProgress * initialTranslateY;
        contentRef.current.style.transform = `translateY(${currentTranslateY}px)`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Header animation (20-35% scroll): fade in + move up, then pause
      if (headerRef.current) {
        let headerTransform = "translateY(30%)";
        let headerOpacity = 0;

        if (progress < 0.2) {
          headerTransform = "translateY(30%)";
          headerOpacity = 0;
        } else if (progress <= 0.35) {
          // Fade in phase
          const fadeProgress = (progress - 0.2) / 0.15;
          headerTransform = `translateY(${(1 - fadeProgress) * 30}%)`;
          headerOpacity = fadeProgress;
        } else {
          // Pause phase (stay visible)
          headerTransform = "translateY(0%)";
          headerOpacity = 1;
        }

        headerRef.current.style.transform = headerTransform;
        headerRef.current.style.opacity = headerOpacity;
      }

      // Title animation (35-50% scroll): fade in + move up, then pause
      if (titleRef.current) {
        let titleTransform = "translateY(30%)";
        let titleOpacity = 0;

        if (progress < 0.35) {
          titleTransform = "translateY(30%)";
          titleOpacity = 0;
        } else if (progress <= 0.5) {
          // Fade in phase
          const fadeProgress = (progress - 0.35) / 0.15;
          titleTransform = `translateY(${(1 - fadeProgress) * 30}%)`;
          titleOpacity = fadeProgress;
        } else {
          // Pause phase (stay visible)
          titleTransform = "translateY(0%)";
          titleOpacity = 1;
        }

        titleRef.current.style.transform = titleTransform;
        titleRef.current.style.opacity = titleOpacity;
      }

      // Description animation (50-65% scroll): fade in + move up, then pause
      if (descRef.current) {
        let descTransform = "translateY(30%)";
        let descOpacity = 0;

        if (progress < 0.5) {
          descTransform = "translateY(30%)";
          descOpacity = 0;
        } else if (progress <= 0.65) {
          // Fade in phase
          const fadeProgress = (progress - 0.5) / 0.15;
          descTransform = `translateY(${(1 - fadeProgress) * 30}%)`;
          descOpacity = fadeProgress;
        } else {
          // Pause phase (stay visible)
          descTransform = "translateY(0%)";
          descOpacity = 1;
        }

        descRef.current.style.transform = descTransform;
        descRef.current.style.opacity = descOpacity;
      }

      // Button animation (65-75% scroll): fade in + move up, then pause
      if (buttonRef.current) {
        let buttonTransform = "translateY(30%)";
        let buttonOpacity = 0;

        if (progress < 0.65) {
          buttonTransform = "translateY(30%)";
          buttonOpacity = 0;
        } else if (progress <= 0.75) {
          // Fade in phase
          const fadeProgress = (progress - 0.65) / 0.1;
          buttonTransform = `translateY(${(1 - fadeProgress) * 30}%)`;
          buttonOpacity = fadeProgress;
        } else {
          // Pause phase (stay visible)
          buttonTransform = "translateY(0%)";
          buttonOpacity = 1;
        }

        buttonRef.current.style.transform = buttonTransform;
        buttonRef.current.style.opacity = buttonOpacity;
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
    <div className="starting-place-section" ref={containerRef}>
      <div className="starting-sticky-wrapper" ref={stickyRef}>
        <div className="starting-content" ref={contentRef}>
          {/* Header */}
          <div className="starting-header" ref={headerRef}>
            <span className="bodytext-3--no-margin">{headerText}</span>
          </div>

          {/* Main Title */}
          <div className="starting-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">{titleText}</h1>
          </div>

          {/* Description */}
          <div className="starting-description" ref={descRef}>
            <p className="bodytext-1--no-margin">{descText}</p>
          </div>

          {/* Explore Button */}
          <div className="starting-button" ref={buttonRef}>
            <ShineGlassButton theme="footer">
              Explore Our Drops
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartingPlaceSection;
