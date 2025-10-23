import { useEffect, useRef, useState } from "react";
import Logo from "@assets/images/Logo.svg";
import "./FutureDiamond.css";

const FutureDiamond = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const [visibleSegments, setVisibleSegments] = useState([]);
  const [isFastScroll, setIsFastScroll] = useState(false);
  const lastVisibleCountRef = useRef(0);

  const descText =
    "The world's newest diamond cut, a new star is born. Its 91 facets sparkle the brightest, emitting a fire like no other in a celebration of the constellations and the extraordinary potential of mankind.";

  // Split text into segments by . or ,
  const segments = descText.split(/([.,])/g).reduce((acc, part, index, array) => {
    if (part === "." || part === ",") {
      if (acc.length > 0) {
        acc[acc.length - 1] += part;
      }
    } else if (part.trim()) {
      acc.push(part.trim());
    }
    return acc;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !stickyRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Show segments progressively based on scroll
      // Segment 0: 30-45%, Segment 1: 45-60%, Segment 2: 60-75%
      const newVisibleSegments = [];
      segments.forEach((_, index) => {
        const segmentStart = 0.3 + (index * 0.15);
        if (progress > segmentStart) {
          newVisibleSegments.push(index);
        }
      });

      // Detect fast scroll: if more than 1 segment becomes visible at once
      const previousCount = lastVisibleCountRef.current;
      const currentCount = newVisibleSegments.length;

      if (currentCount > previousCount + 1) {
        setIsFastScroll(true);
        // Reset after animation completes
        setTimeout(() => setIsFastScroll(false), 1000);
      } else if (currentCount > previousCount) {
        setIsFastScroll(false);
      }

      lastVisibleCountRef.current = currentCount;
      setVisibleSegments(newVisibleSegments);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

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
          <div className="future-diamond-sticky-wrapper" ref={stickyRef}>
            <div className="future-diamond-description">
              <h1 className="heading-1--no-margin">
                {segments.map((segment, segmentIndex) => {
                  const isSegmentVisible = visibleSegments.includes(segmentIndex);
                  const words = segment.split(" ");

                  // Use faster animation if fast scrolling
                  const baseDelay = isFastScroll ? 0.01 : 0.03;
                  const wordMultiplier = isFastScroll ? 2 : 5;

                  return (
                    <span key={segmentIndex} className="segment">
                      {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="word">
                          {word.split("").map((char, charIndex) => {
                            return (
                              <span
                                key={charIndex}
                                className={`char ${isSegmentVisible ? "reveal" : ""} ${isFastScroll ? "fast" : ""}`}
                                style={{
                                  animationDelay: isSegmentVisible
                                    ? `${(wordIndex * wordMultiplier + charIndex) * baseDelay}s`
                                    : "0s",
                                }}
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
        </div>
      </div>
    </section>
  );
};

export default FutureDiamond;
