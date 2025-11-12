import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { MediaImage } from "@components/common/media";
import { ROUTES } from "@/constants/routes";
import "./Section4.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const Section4 = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleReturnExchangeClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `${ROUTES.SUPPORT_DETAIL}?tab=return-exchange`
    );
  };

  const handleSizingGuideClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `${ROUTES.SUPPORT_DETAIL}?tab=sizing-guide`
    );
  };

  const handleWarrantyInfoClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `${ROUTES.SUPPORT_DETAIL}?tab=warranty-info`
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress within this section
      const scrollTop = -rect.top;
      const scrollHeight = sectionHeight - windowHeight;
      const rawProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

      // Add buffer zones: 30% buffer at start, 40% transition zone, 30% buffer at end
      const startBuffer = 0.3;
      const endBuffer = 0.7; // transitions complete at 70%, leaving 30% buffer at end

      let adjustedProgress = 0;
      if (rawProgress < startBuffer) {
        adjustedProgress = 0; // Buffer zone before transitions
      } else if (rawProgress > endBuffer) {
        adjustedProgress = 1; // Buffer zone after transitions complete
      } else {
        // Active transition zone (30% to 70% of total scroll)
        adjustedProgress =
          (rawProgress - startBuffer) / (endBuffer - startBuffer);
      }

      setScrollProgress(adjustedProgress);

      // Mobile parallax effect - only on mobile screens (<=480px)
      if (window.innerWidth <= 480) {
        const mobileScreen1 = document.querySelector(
          ".section4-mobile-screen-1"
        );
        const mobileScreen2 = document.querySelector(
          ".section4-mobile-screen-2"
        );
        const mobileScreen3 = document.querySelector(
          ".section4-mobile-screen-3"
        );

        if (mobileScreen1) {
          const rect1 = mobileScreen1.getBoundingClientRect();
          const scrollDistance1 = windowHeight - rect1.top;
          const totalDistance1 = windowHeight + rect1.height;
          const scrollRatio1 = Math.max(
            0,
            Math.min(1, scrollDistance1 / totalDistance1)
          );

          // Dual-layer parallax: background and text move at different speeds (EXTREME)
          const bgParallax1 = scrollRatio1 * 100; // Background moves DOWN slowly (100px)
          const textParallax1 = scrollRatio1 * -80; // Text moves UP fast (80px) - opposite direction

          mobileScreen1.style.setProperty(
            "--parallax-bg-offset",
            `${bgParallax1}px`
          );
          mobileScreen1.style.setProperty(
            "--parallax-text-offset",
            `${textParallax1}px`
          );
        }

        if (mobileScreen2) {
          const rect2 = mobileScreen2.getBoundingClientRect();
          const scrollDistance2 = windowHeight - rect2.top;
          const totalDistance2 = windowHeight + rect2.height;
          const scrollRatio2 = Math.max(
            0,
            Math.min(1, scrollDistance2 / totalDistance2)
          );

          // Dual-layer parallax: background and text move at different speeds (EXTREME)
          const bgParallax2 = scrollRatio2 * 100; // Background moves DOWN slowly (100px)
          const textParallax2 = scrollRatio2 * -80; // Text moves UP fast (80px) - opposite direction

          mobileScreen2.style.setProperty(
            "--parallax-bg-offset",
            `${bgParallax2}px`
          );
          mobileScreen2.style.setProperty(
            "--parallax-text-offset",
            `${textParallax2}px`
          );
        }

        if (mobileScreen3) {
          const rect3 = mobileScreen3.getBoundingClientRect();
          const scrollDistance3 = windowHeight - rect3.top;
          const totalDistance3 = windowHeight + rect3.height;
          const scrollRatio3 = Math.max(
            0,
            Math.min(1, scrollDistance3 / totalDistance3)
          );

          // Dual-layer parallax: background and text move at different speeds (EXTREME)
          const bgParallax3 = scrollRatio3 * 100; // Background moves DOWN slowly (100px)
          const textParallax3 = scrollRatio3 * -80; // Text moves UP fast (80px) - opposite direction

          mobileScreen3.style.setProperty(
            "--parallax-bg-offset",
            `${bgParallax3}px`
          );
          mobileScreen3.style.setProperty(
            "--parallax-text-offset",
            `${textParallax3}px`
          );
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="section4-wrapper">
      <div className="section4-sticky-container">
        {/* Mobile Layout - only visible on mobile */}
        <div className="section4-mobile-screen-1">
          <div className="section4-content-layer">
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      RETURN & EXCHANGE
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Extend the life and brilliance of your jewelry with Mirror's
                    professional care and repair services, tailored to keep each
                    piece as radiant as the day you received it.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="footer"
                  onClick={handleReturnExchangeClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        <div className="section4-mobile-screen-2">
          <div className="section4-content-layer">
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      SIZING GUIDE
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Elevate your gift with our signature wrapping - a carefully
                    crafted presentation that captures the essence of refined
                    giving.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="footer"
                  onClick={handleSizingGuideClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        <div className="section4-mobile-screen-3">
          <div className="section4-content-layer">
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      WARRANTY & INFO
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Activate your warranty to ensure your Future Diamond is
                    protected under our care.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="footer"
                  onClick={handleWarrantyInfoClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Sticky Image Area */}
        <div className="section4-sticky-images">
          <div
            className="section4-image-layer section4-image-1"
            style={{
              transform: `translateY(${
                scrollProgress < 0.35 ? scrollProgress * 2.86 * -100 : -100
              }%)`,
              opacity: scrollProgress < 0.35 ? 1 - scrollProgress * 2.86 : 0,
            }}
          >
            <MediaImage
              src="services/b2f5b664-7235-4fe3-b721-c19450d3518a.png"
              alt="Return & Exchange"
            />
          </div>
          <div
            className="section4-image-layer section4-image-2"
            style={{
              transform: `translateY(${
                scrollProgress < 0.35
                  ? (1 - scrollProgress * 2.86) * 100
                  : scrollProgress < 0.7
                  ? 0
                  : (scrollProgress - 0.7) * 3.33 * -100
              }%)`,
              opacity:
                scrollProgress < 0.35
                  ? scrollProgress * 2.86
                  : scrollProgress < 0.7
                  ? 1
                  : 1 - (scrollProgress - 0.7) * 3.33,
            }}
          >
            <MediaImage src="services/img_2_section_3.jpg" alt="Sizing Guide" />
          </div>
          <div
            className="section4-image-layer section4-image-3"
            style={{
              transform: `translateY(${
                scrollProgress < 0.7 ? 100 : (1 - scrollProgress) * 333
              }%)`,
              opacity: scrollProgress > 0.7 ? (scrollProgress - 0.7) * 3.33 : 0,
            }}
          >
            <MediaImage src="services/img_2_section_2.jpg" alt="Warranty & Info" />
          </div>
        </div>

        {/* Sticky Content Area */}
        <div className="section4-sticky-content">
          <div
            className="section4-content-layer section4-content-1"
            style={{
              opacity: scrollProgress < 0.35 ? 1 - scrollProgress * 2.86 : 0,
              transform: `translateY(${
                scrollProgress < 0.35 ? scrollProgress * 2.86 * -20 : -20
              }px)`,
              pointerEvents: scrollProgress < 0.35 ? "auto" : "none",
              zIndex: scrollProgress < 0.35 ? 100 : 10,
            }}
          >
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      RETURN & EXCHANGE
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Extend the life and brilliance of your jewelry with Mirror's
                    professional care and repair services, tailored to keep each
                    piece as radiant as the day you received it.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="light"
                  onClick={handleReturnExchangeClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>

          <div
            className="section4-content-layer section4-content-2"
            style={{
              opacity:
                scrollProgress > 0.3 && scrollProgress < 0.75
                  ? (scrollProgress - 0.3) * 2.22
                  : 0,
              transform: `translateY(${
                scrollProgress > 0.3 && scrollProgress < 0.75
                  ? (scrollProgress - 0.525) * 20
                  : scrollProgress <= 0.525
                  ? -10
                  : 10
              }px)`,
              pointerEvents:
                scrollProgress > 0.3 && scrollProgress < 0.75 ? "auto" : "none",
              zIndex: scrollProgress > 0.3 && scrollProgress < 0.75 ? 100 : 10,
            }}
          >
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      SIZING GUIDE
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Elevate your gift with our signature wrapping - a carefully
                    crafted presentation that captures the essence of refined
                    giving.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="light"
                  onClick={handleSizingGuideClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>

          <div
            className="section4-content-layer section4-content-3"
            style={{
              opacity: scrollProgress > 0.75 ? (scrollProgress - 0.75) * 4 : 0,
              transform: `translateY(${
                scrollProgress > 0.75 ? (1 - scrollProgress) * 20 : 20
              }px)`,
              pointerEvents: scrollProgress > 0.75 ? "auto" : "none",
              zIndex: scrollProgress > 0.75 ? 100 : 10,
            }}
          >
            <div className="section4-content">
              <div className="section4-full-content">
                <div className="section4-header-description">
                  <div className="section4-header">
                    <span className="section4-subtitle bodytext-4--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section4-title heading-1--no-margin">
                      WARRANTY & INFO
                    </h2>
                  </div>
                  <p className="section4-description bodytext-4--no-margin">
                    Activate your warranty to ensure your Future Diamond is
                    protected under our care.
                  </p>
                </div>
                <ShineGlassButton
                  className="section4-cta"
                  theme="light"
                  onClick={handleWarrantyInfoClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        {/* Third screen div for tablet responsive only */}
        <div className="section4-screen-3"></div>
      </div>
    </div>
  );
};

export default Section4;
