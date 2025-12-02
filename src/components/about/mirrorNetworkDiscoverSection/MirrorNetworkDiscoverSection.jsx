import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { MediaImage } from "@components/common/media";
import "@styles/grid-system.css";
import "./MirrorNetworkDiscoverSection.css";

const MirrorNetworkDiscoverSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const headerText = "THE MIRROR NETWORK";
  const titleText = "A LIVING SYSTEM OF MODERN LUXURY";
  const descriptionText =
    "Mirror is not a place - it's a presence.\nOur Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal - amplifying presence, creativity, and connection.\n\nWe collaborate with artists, hotels, creators, and technologists to make luxury fluid - flowing through Sense, Time, Space, and Presence.";

  const handleDiscoverClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.LOCATIONS);
  };

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
        const initialTranslateY = viewportHeight * 0.5;
        const currentTranslateY =
          initialTranslateY - moveProgress * initialTranslateY;
        contentRef.current.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
        contentRef.current.style.opacity = moveProgress;
      }

      // Phase 2 (20-35% scroll): Header fade in + move up
      if (headerRef.current) {
        let headerY = 30;
        let headerOpacity = 0;

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

      // Phase 3 (35-50% scroll): Title fade in + move up
      if (titleRef.current) {
        let titleY = 30;
        let titleOpacity = 0;

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

      // Phase 4 (50-65% scroll): Description fade in + move up
      if (descriptionRef.current) {
        let descY = 30;
        let descOpacity = 0;

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
    <div className="mirror-network-discover-wrapper">
      {/* Mirror Network Section - Sticky text with scroll animations */}
      <div className="mirror-network-section" ref={containerRef}>
        <div className="mirror-network-sticky-wrapper">
          <div className="mirror-network-content" ref={contentRef}>
            {/* Header */}
            <div className="mirror-network-header" ref={headerRef}>
              <p className="bodytext-4--no-margin">{headerText}</p>
            </div>

            {/* Main Title */}
            <div className="mirror-network-title" ref={titleRef}>
              <h1 className="heading-1--no-margin">{titleText}</h1>
            </div>

            {/* Description */}
            <div className="mirror-network-description" ref={descriptionRef}>
              <p className="bodytext-4--no-margin">
                {descriptionText.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < descriptionText.split("\n").length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Discover Section - Separate section below */}
      <div className="discover-section-wrapper">
        <div className="grid-container">
          {/* Images positioned using grid system */}
          <div className="shape shape-1">
            <MediaImage src="about/discover-section/img_1.webp" alt="Discover 1" />
          </div>
          <div className="shape shape-2">
            <MediaImage src="about/discover-section/img_2.webp" alt="Discover 2" />
          </div>
          <div className="shape shape-3">
            <MediaImage src="about/discover-section/img_3.webp" alt="Discover 3" />
          </div>
          <div className="shape shape-4">
            <MediaImage src="about/discover-section/img_4.webp" alt="Discover 4" />
          </div>
          <div className="shape shape-5">
            <MediaImage src="about/discover-section/img_5.webp" alt="Discover 5" />
          </div>
          <div className="shape shape-6">
            <MediaImage src="about/discover-section/img_6.webp" alt="Discover 6" />
          </div>

          {/* Button */}
          <div className="discover-button-container">
            <ShineGlassButton theme="light" onClick={handleDiscoverClick}>
              Discover the Mirror Network
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorNetworkDiscoverSection;
