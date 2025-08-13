import React, { useEffect, useRef } from "react";
import "./NewCutComponent.css";

const NewCutComponent = () => {
  const heroRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    let scrollTimeout;
    let lastScrollPosition = 0;

    const smoothScrollTo = (targetPosition, duration = 800) => {
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let start = null;

      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function for smooth acceleration/deceleration
        const easeInOutCubic =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easeInOutCubic);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          isScrolling.current = false;
        }
      };

      requestAnimationFrame(animation);
    };

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const scrollDirection = scrolled > lastScrollPosition ? "down" : "up";

      // Fade effect for hero
      if (heroRef.current) {
        const opacity = Math.max(0, 1 - scrolled / (windowHeight * 0.7)); // Fade nhanh hơn cho sync với 700ms
        const scale = 1 - (scrolled / windowHeight) * 0.08; // Scale nhẹ hơn

        heroRef.current.style.opacity = opacity;
        heroRef.current.style.transform = `scale(${scale})`;
      }

      // Auto-scroll DOWN to article when user scrolls down just a little
      if (
        !isScrolling.current &&
        scrollDirection === "down" &&
        scrolled > 30 &&
        scrolled < windowHeight * 0.5
      ) {
        isScrolling.current = true;
        smoothScrollTo(windowHeight, 700); // Article trượt lên trong 1 giây
      }

      // Auto-scroll UP to hero when user scrolls up just a little
      if (
        !isScrolling.current &&
        scrollDirection === "up" &&
        scrolled < windowHeight &&
        scrolled > windowHeight * 0.5
      ) {
        isScrolling.current = true;
        smoothScrollTo(0, 700); // Quay về hero trong 0.8 giây
      }

      // Update last scroll position
      lastScrollPosition = scrolled;

      // Clear timeout
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="new-cut-page">
      {/* Hero Section */}
      <section className="new-cut-hero" ref={heroRef}>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-text-main">
              <span className="hero-date bodytext-4--no-margin">June 2024</span>
              <h1 className="hero-title heading-1--no-margin">
                Lumex-91™ - The Next
                <br />
                Star Has Arrived
              </h1>
            </div>
            <p className="hero-description bodytext-5--no-margin">
              From the heart of the Mirrorverse comes a diamond unlike any
              other. Lumex-91™ is our
              <br />
              most advanced proprietary cut — a living geometry where light
              becomes structure, and
              <br />
              every facet holds a story.
            </p>
          </div>
          <div className="hero-image">
            <img src="/news/new-cut.svg" alt="Lumex-9 Ring" />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="article-content">
        <div className="article-container">
          {/* Section 1 */}
          <div className="article-section">
            <h2 className="section-title heading-3--no-margin">
              Born from Luminax
            </h2>
            <p className="section-text bodytext-3--no-margin">
              At the center of the Mirrorverse lies Luminax™, the symbolic
              epicenter of purity
              <br />
              and energy. It is here that Lumex-91™ was conceived — a vision
              shaped
              <br />
              in light, sculpted in precision, and charged with emotion. Its 91
              ultra-fine facets
              <br />
              are engineered to refract light with absolute mastery, creating a
              display of
              <br />
              brilliance that feels almost alive.
            </p>
          </div>

          {/* Image Grid Section */}
          <div className="image-grid">
            <div className="grid-item placeholder">
              {/* Placeholder for first image */}
            </div>
            <div className="grid-item placeholder">
              {/* Placeholder for second image */}
            </div>
          </div>

          {/* Section 2 */}
          <div className="article-section">
            <h2 className="section-title heading-3--no-margin">
              The Legacy of the Stars
            </h2>
            <p className="section-text bodytext-3--no-margin">
              Inspired by the celestial artistry of the Optica Stelo, Lumex-91™
              carries forward
              <br />
              the spirit of human exploration. It honors the moment humanity
              reached
              <br />
              beyond our planet — and reminds us that the stars are not distant;
              they live in
              <br />
              our hands. This is a diamond that does not simply sparkle. It
              guides.
            </p>
            <p className="section-text bodytext-3--no-margin">
              Each facet is a portal of light. Individually, they capture and
              bend illumination;
              <br />
              together, they create a performance of symmetry and radiance
              visible from
              <br />
              afar. This is not just a cut — it is light, perfected.
            </p>
          </div>

          {/* Section 3 */}
          <div className="article-section">
            <h2 className="section-title heading-3--no-margin">
              Hold the Future in Your Hands
            </h2>
            <p className="section-text bodytext-3--no-margin">
              With Lumex-91™, we redefine what a diamond can be: a symbol of
              progress, a<br />
              piece of the cosmos, a reflection of your own inner light. The
              stars are no
              <br />
              longer above you — they are with you.
            </p>
          </div>

          {/* Bottom Image */}
          <div className="bottom-image placeholder">
            {/* Placeholder for bottom image */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewCutComponent;
