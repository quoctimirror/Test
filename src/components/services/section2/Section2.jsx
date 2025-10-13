import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import "./Section2.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const Section2 = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleProductCareClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `${ROUTES.SERVICES_DETAIL}?tab=product-care-repair`
    );
  };

  const handleTradeInClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      `${ROUTES.SERVICES_DETAIL}?tab=trade-in-upgrade`
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

      // Add buffer zones: 25% buffer at start, 50% transition zone, 25% buffer at end
      const startBuffer = 0.25;
      const endBuffer = 0.75; // transitions complete at 75%, leaving 25% buffer at end

      let adjustedProgress = 0;
      if (rawProgress < startBuffer) {
        adjustedProgress = 0; // Buffer zone before transitions
      } else if (rawProgress > endBuffer) {
        adjustedProgress = 1; // Buffer zone after transitions complete
      } else {
        // Active transition zone (25% to 75% of total scroll)
        adjustedProgress =
          (rawProgress - startBuffer) / (endBuffer - startBuffer);
      }

      setScrollProgress(adjustedProgress);

      // Mobile parallax effect - only on mobile screens (<=480px)
      if (window.innerWidth <= 480) {
        const mobileScreen1 = document.querySelector('.section2-mobile-screen-1');
        const mobileScreen2 = document.querySelector('.section2-mobile-screen-2');

        if (mobileScreen1) {
          const rect1 = mobileScreen1.getBoundingClientRect();
          const scrollDistance1 = windowHeight - rect1.top;
          const totalDistance1 = windowHeight + rect1.height;
          const scrollRatio1 = Math.max(0, Math.min(1, scrollDistance1 / totalDistance1));

          // Dual-layer parallax: background and text move at different speeds (EXTREME)
          const bgParallax1 = scrollRatio1 * 100; // Background moves DOWN slowly (100px)
          const textParallax1 = scrollRatio1 * -80; // Text moves UP fast (80px) - opposite direction

          mobileScreen1.style.setProperty('--parallax-bg-offset', `${bgParallax1}px`);
          mobileScreen1.style.setProperty('--parallax-text-offset', `${textParallax1}px`);
        }

        if (mobileScreen2) {
          const rect2 = mobileScreen2.getBoundingClientRect();
          const scrollDistance2 = windowHeight - rect2.top;
          const totalDistance2 = windowHeight + rect2.height;
          const scrollRatio2 = Math.max(0, Math.min(1, scrollDistance2 / totalDistance2));

          // Dual-layer parallax: background and text move at different speeds (EXTREME)
          const bgParallax2 = scrollRatio2 * 100; // Background moves DOWN slowly (100px)
          const textParallax2 = scrollRatio2 * -80; // Text moves UP fast (80px) - opposite direction

          mobileScreen2.style.setProperty('--parallax-bg-offset', `${bgParallax2}px`);
          mobileScreen2.style.setProperty('--parallax-text-offset', `${textParallax2}px`);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={sectionRef} className="section2-wrapper">
      <div className="section2-sticky-container">
        {/* Mobile Layout - only visible on mobile */}
        <div className="section2-mobile-screen-1">
          <div className="section2-content-layer">
            <div className="section2-content">
              <div className="section2-full-content">
                <div className="section2-header-description">
                  <div className="section2-header">
                    <span className="section2-subtitle bodytext-3--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section2-title heading-1--no-margin">
                      PRODUCT CARE & REPAIR
                    </h2>
                  </div>
                  <p className="section2-description bodytext-6--no-margin">
                    Extend the life and brilliance of your jewelry with Mirror's
                    professional care and repair services, tailored to keep each
                    piece as radiant as the day you received it.
                  </p>
                </div>
                <ShineGlassButton
                  className="section2-cta"
                  theme="footer"
                  onClick={handleProductCareClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        <div className="section2-mobile-screen-2">
          <div className="section2-content-layer">
            <div className="section2-content">
              <div className="section2-full-content">
                <div className="section2-header-description">
                  <div className="section2-header">
                    <span className="section2-subtitle bodytext-3--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section2-title heading-1--no-margin">
                      TRADE IN
                    </h2>
                  </div>
                  <p className="section2-description bodytext-6--no-margin">
                    Mirror's "Reclaim & Renew" program allows you to trade in
                    eligible pieces in the future toward upgraded designs— a
                    promise of continuous evolution in your jewelry journey.
                  </p>
                </div>
                <ShineGlassButton
                  className="section2-cta"
                  theme="footer"
                  onClick={handleTradeInClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout - Sticky Image Area */}
        <div className="section2-sticky-images">
          <div
            className="section2-image-layer section2-image-1"
            style={{
              transform: `translateY(${scrollProgress * -100}%)`,
              opacity: 1 - scrollProgress * 0.5,
            }}
          >
            <img
              src="/services/Product care & Repair_960x1080.jpg"
              alt="Product Care"
            />
          </div>
          <div
            className="section2-image-layer section2-image-2"
            style={{
              transform: `translateY(${(1 - scrollProgress) * 100}%)`,
              opacity: scrollProgress,
            }}
          >
            <img src="/services/Trade in_960x1080.jpg" alt="Trade In" />
          </div>
        </div>

        {/* Sticky Content Area */}
        <div className="section2-sticky-content">
          <div
            className="section2-content-layer section2-content-1"
            style={{
              opacity: scrollProgress < 0.5 ? 1 - scrollProgress * 2 : 0,
              transform: `translateY(${
                scrollProgress < 0.5 ? scrollProgress * -20 : -20
              }px)`,
              pointerEvents: scrollProgress < 0.5 ? "auto" : "none",
              zIndex: scrollProgress < 0.5 ? 100 : 10,
            }}
          >
            <div className="section2-content">
              <div className="section2-full-content">
                <div className="section2-header-description">
                  <div className="section2-header">
                    <span className="section2-subtitle bodytext-3--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section2-title heading-1--no-margin">
                      PRODUCT CARE & REPAIR
                    </h2>
                  </div>
                  <p className="section2-description bodytext-6--no-margin">
                    Extend the life and brilliance of your jewelry with Mirror's
                    professional care and repair services, tailored to keep each
                    piece as radiant as the day you received it.
                  </p>
                </div>
                <ShineGlassButton
                  className="section2-cta"
                  theme="light"
                  onClick={handleProductCareClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>

          <div
            className="section2-content-layer section2-content-2"
            style={{
              opacity: scrollProgress > 0.5 ? (scrollProgress - 0.5) * 2 : 0,
              transform: `translateY(${
                scrollProgress > 0.5
                  ? (1 - (scrollProgress - 0.5) * 2) * 50
                  : 50
              }px)`,
              pointerEvents: scrollProgress > 0.5 ? "auto" : "none",
              zIndex: scrollProgress > 0.5 ? 100 : 10,
            }}
          >
            <div className="section2-content">
              <div className="section2-full-content">
                <div className="section2-header-description">
                  <div className="section2-header">
                    <span className="section2-subtitle bodytext-3--no-margin">
                      EXPLORE OUR
                    </span>
                    <h2 className="section2-title heading-1--no-margin">
                      TRADE IN
                    </h2>
                  </div>
                  <p className="section2-description bodytext-6--no-margin">
                    Mirror’s “Reclaim & Renew” program allows you to trade in
                    eligible pieces in the future toward upgraded designs— a
                    promise of continuous evolution in your jewelry journey.
                  </p>
                </div>
                <ShineGlassButton
                  className="section2-cta"
                  theme="light"
                  onClick={handleTradeInClick}
                >
                  See more
                </ShineGlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2;
