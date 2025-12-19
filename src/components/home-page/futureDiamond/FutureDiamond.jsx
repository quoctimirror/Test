import { useRef, useMemo, useState, useEffect } from "react";
import Logo from "@assets/images/Logo.svg";
import Lumex91 from "@components/home-page/lumex91/Lumex91";
import "./FutureDiamond.css";

const FutureDiamond = () => {
  const containerRef = useRef(null);
  const descriptionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Memoize segments - split into 2 parts
  const segments = useMemo(() => {
    return [
      "The world's newest diamond cut, a new star is born. Its 91 facets sparkle the brightest,",
      "emitting a fire like no other in a celebration of the constellations and the extraordinary potential of mankind.",
    ];
  }, []);

  // Calculate total characters for progress calculation
  const totalChars = useMemo(() => {
    return segments.reduce((total, segment) => total + segment.length, 0);
  }, [segments]);

  // Scroll-based animation - reveal characters based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!descriptionRef.current) return;

      const rect = descriptionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress when element enters viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Adjust scroll distance for faster reveal speed
        const scrollDistance = windowHeight * 0.6 + rect.height;
        const scrollProgress = (windowHeight - rect.top) / scrollDistance;
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress * 1.3));

        setScrollProgress(clampedProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="future-diamond" ref={containerRef}>
      <div className="future-diamond-content">
        <div className="future-diamond-logo-container">
          <img src={Logo} alt="Mirror Logo" className="future-diamond-logo" />
        </div>

        <h1 className="future-diamond-title">Love-Grown Diamond™</h1>

        <div className="future-diamond-description-container">
          <div className="future-diamond-description" ref={descriptionRef}>
            <h1 className="heading-1--no-margin">
              {segments.map((segment, segmentIndex) => {
                const words = segment.split(" ");
                let charIndex = 0;

                // Calculate character offset for this segment
                let segmentCharOffset = 0;
                for (let i = 0; i < segmentIndex; i++) {
                  segmentCharOffset += segments[i].length;
                }

                return (
                  <span key={segmentIndex} className="segment">
                    {words.map((word, wordIndex) => (
                      <span key={wordIndex} className="word">
                        {word.split("").map((char) => {
                          const currentCharIndex = segmentCharOffset + charIndex;
                          const charProgress = currentCharIndex / totalChars;
                          const isVisible = scrollProgress > charProgress;
                          charIndex++;

                          return (
                            <span
                              key={currentCharIndex}
                              className={`char ${isVisible ? "reveal-instant" : ""}`}
                            >
                              {char}
                            </span>
                          );
                        })}
                        {wordIndex < words.length - 1 && "\u00A0"}
                      </span>
                    ))}
                    {segmentIndex < segments.length - 1 && "\u00A0"}
                  </span>
                );
              })}
            </h1>
          </div>
        </div>

        {/* Lumex91 Section with 120px gap */}
        <div style={{ marginTop: "0px" }}>
          <Lumex91 />
        </div>
      </div>
    </section>
  );
};

export default FutureDiamond;
