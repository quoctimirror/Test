import React, { useEffect, useRef } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import "./SharedSection.css";

const SharedSection = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);

  const headerText = "THE FUTURE IS SHARED";
  const titleText = "YOU DON'T JUST WEAR MIRROR. YOU BECOME PART OF IT.";
  const descriptionText =
    "We invite you not just to own - but to belong. To co-create, to grow, to reflect. Every interaction with Mirror - a try-on, a purchase, a story - becomes a part of the Mirrorverse. Because luxury doesn’t begin in the box. It begins with you.";

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

      // Phase 1 (0-20%): Move entire content to fixed position with scale
      const moveProgress =
        progress <= 0.2 ? Math.max(0, Math.min(1, progress / 0.2)) : 1;

      if (contentRef.current) {
        const viewportHeight = window.innerHeight;
        const initialTranslateY = viewportHeight * 0.5;
        const currentTranslateY =
          initialTranslateY - moveProgress * initialTranslateY;
        const currentScale = 0.8 + moveProgress * 0.2; // Scale from 0.8 to 1.0
        contentRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0) scale(${currentScale})`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Phase 2 (20-35%): Header fade in + move up
      if (headerRef.current) {
        let headerY = 30,
          headerOpacity = 0;
        if (progress < 0.2) {
          headerY = 30;
          headerOpacity = 0;
        } else if (progress <= 0.35) {
          const fadeProgress = (progress - 0.2) / 0.15;
          headerY = (1 - fadeProgress) * 30;
          headerOpacity = fadeProgress;
        } else {
          headerY = 0;
          headerOpacity = 1;
        }
        headerRef.current.style.transform = `translate3d(0, ${headerY}%, 0)`;
        headerRef.current.style.opacity = headerOpacity;
      }

      // Phase 3 (35-50%): Title fade in + move up
      if (titleRef.current) {
        let titleY = 30,
          titleOpacity = 0;
        if (progress < 0.35) {
          titleY = 30;
          titleOpacity = 0;
        } else if (progress <= 0.5) {
          const fadeProgress = (progress - 0.35) / 0.15;
          titleY = (1 - fadeProgress) * 30;
          titleOpacity = fadeProgress;
        } else {
          titleY = 0;
          titleOpacity = 1;
        }
        titleRef.current.style.transform = `translate3d(0, ${titleY}%, 0)`;
        titleRef.current.style.opacity = titleOpacity;
      }

      // Phase 4 (50-65%): Description fade in + move up
      if (descriptionRef.current) {
        let descY = 30,
          descOpacity = 0;
        if (progress < 0.5) {
          descY = 30;
          descOpacity = 0;
        } else if (progress <= 0.65) {
          const fadeProgress = (progress - 0.5) / 0.15;
          descY = (1 - fadeProgress) * 30;
          descOpacity = fadeProgress;
        } else {
          descY = 0;
          descOpacity = 1;
        }
        descriptionRef.current.style.transform = `translate3d(0, ${descY}%, 0)`;
        descriptionRef.current.style.opacity = descOpacity;
      }

      // Phase 5 (65-75%): Buttons fade in + move up
      if (buttonsRef.current) {
        let btnY = 30,
          btnOpacity = 0;
        if (progress < 0.65) {
          btnY = 30;
          btnOpacity = 0;
        } else if (progress <= 0.75) {
          const fadeProgress = (progress - 0.65) / 0.1;
          btnY = (1 - fadeProgress) * 30;
          btnOpacity = fadeProgress;
        } else {
          btnY = 0;
          btnOpacity = 1;
        }
        buttonsRef.current.style.transform = `translate3d(0, ${btnY}%, 0)`;
        buttonsRef.current.style.opacity = btnOpacity;
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
    <div className="shared-section" ref={containerRef}>
      <div className="shared-sticky-wrapper" ref={stickyRef}>
        <div className="shared-content" ref={contentRef}>
          {/* Header */}
          <div className="shared-header" ref={headerRef}>
            <p className="bodytext-4--no-margin">{headerText}</p>
          </div>

          {/* Main Title */}
          <div className="shared-title" ref={titleRef}>
            <h1 className="heading-1--no-margin">
              {titleText.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < titleText.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </h1>
          </div>

          {/* Description */}
          <div className="shared-description" ref={descriptionRef}>
            <p className="bodytext-4--no-margin">
              {descriptionText.split("\n").map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < descriptionText.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* Buttons */}
          <div className="shared-buttons" ref={buttonsRef}>
            <ShineGlassButton theme="footer">AR Try on</ShineGlassButton>
            <ShineGlassButton theme="footer">
              Immersive Showroom
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSection;
