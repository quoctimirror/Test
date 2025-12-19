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
    "In a world where diamond mines scar the earth, Mirror offers a different reflection - one where rare science becomes soul, and beauty carries meaning. Our Love-Grown Diamonds™ are created through cutting-edge science - a process that honors both planet and person. Each gem is shaped not by rarity, but by responsibility, intention, and the desire to connect.";

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start animation when section top enters viewport from bottom
      // progress = 0 when section top is at viewport bottom
      // progress = 1 when section fully scrolled through
      const scrolled = viewportHeight - rect.top;
      const totalScrollDistance = container.offsetHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollDistance));

      // Phase 1 (0-15% scroll): Content fade in BEFORE blur finishes
      const contentFadeProgress =
        progress <= 0.15 ? Math.max(0, Math.min(1, progress / 0.15)) : 1;

      if (contentRef.current) {
        // Content stays centered, fades in quickly before blur completes
        contentRef.current.style.transform = `translateY(0)`;
        contentRef.current.style.opacity = contentFadeProgress;
      }

      // Header animation (15-30% scroll): fade in + move up, then pause
      if (headerRef.current) {
        let headerTransform = "translateY(30%)";
        let headerOpacity = 0;

        if (progress < 0.15) {
          headerTransform = "translateY(30%)";
          headerOpacity = 0;
        } else if (progress <= 0.3) {
          // Fade in phase
          const fadeProgress = (progress - 0.15) / 0.15;
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

      // Title animation (30-45% scroll): fade in + move up, then pause
      if (titleRef.current) {
        let titleTransform = "translateY(30%)";
        let titleOpacity = 0;

        if (progress < 0.3) {
          titleTransform = "translateY(30%)";
          titleOpacity = 0;
        } else if (progress <= 0.45) {
          // Fade in phase
          const fadeProgress = (progress - 0.3) / 0.15;
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

      // Description animation (45-60% scroll): fade in + move up, then pause
      if (descRef.current) {
        let descTransform = "translateY(30%)";
        let descOpacity = 0;

        if (progress < 0.45) {
          descTransform = "translateY(30%)";
          descOpacity = 0;
        } else if (progress <= 0.6) {
          // Fade in phase
          const fadeProgress = (progress - 0.45) / 0.15;
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

      // Button animation (60-70% scroll): fade in + move up, then pause
      if (buttonRef.current) {
        let buttonTransform = "translateY(30%)";
        let buttonOpacity = 0;

        if (progress < 0.6) {
          buttonTransform = "translateY(30%)";
          buttonOpacity = 0;
        } else if (progress <= 0.7) {
          // Fade in phase
          const fadeProgress = (progress - 0.6) / 0.1;
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
            <span className="bodytext-4--no-margin">{headerText}</span>
          </div>

          {/* Main Title */}
          <div className="starting-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">{titleText}</h1>
          </div>

          {/* Description */}
          <div className="starting-description" ref={descRef}>
            <p className="bodytext-4--no-margin">{descText}</p>
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
