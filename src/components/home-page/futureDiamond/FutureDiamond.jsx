import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Logo from "@assets/images/Logo.svg";
import "./FutureDiamond.css";

const FutureDiamond = () => {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const descriptionRef = useRef(null);
  const [visibleSegments, setVisibleSegments] = useState([]);
  const lastScrollTimeRef = useRef(performance.now());
  const lastProgressRef = useRef(0);
  const isPausedRef = useRef(false);
  const rafIdRef = useRef(null);
  const segment1CompleteRef = useRef(false);
  const segment1StartTimeRef = useRef(null);
  const segment1AnimationSpeedRef = useRef({ duration: 0.4, delay: 1 });
  const segment2AnimationSpeedRef = useRef({ duration: 0.4, delay: 1 });

  // Memoize segments - split into 2 parts
  const segments = useMemo(() => {
    return [
      "The world's newest diamond cut, a new star is born. Its 91 facets sparkle the brightest,",
      "emitting a fire like no other in a celebration of the constellations and the extraordinary potential of mankind."
    ];
  }, []);

  // Listen for page transition events to pause animations
  useEffect(() => {
    const handleTransitionStart = () => {
      isPausedRef.current = true;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const handleTransitionComplete = () => {
      isPausedRef.current = false;
    };

    // Listen for custom transition events
    window.addEventListener("pageTransitionStart", handleTransitionStart);
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);
    window.addEventListener("beforeunload", handleTransitionStart);

    return () => {
      window.removeEventListener("pageTransitionStart", handleTransitionStart);
      window.removeEventListener("pageTransitionComplete", handleTransitionComplete);
      window.removeEventListener("beforeunload", handleTransitionStart);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Scroll handler - use CSS variables for speed, no re-renders
  useEffect(() => {
    let lastVisibleSegmentsRef = [];

    const handleScroll = () => {
      // Quick exit if paused (during page transition)
      if (isPausedRef.current || !containerRef.current || !stickyRef.current || !descriptionRef.current) {
        return;
      }

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scrollHeight = container.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollHeight));

      // Calculate scroll velocity with performance.now() for better accuracy
      const now = performance.now();
      const timeDelta = now - lastScrollTimeRef.current;
      const progressDelta = Math.abs(progress - lastProgressRef.current);
      const scrollVelocity = timeDelta > 0 ? progressDelta / timeDelta : 0;

      lastScrollTimeRef.current = now;
      lastProgressRef.current = progress;

      // Dynamic animation duration based on scroll speed - aggressive scaling for fast scrolls
      let animationDuration = 0.4;
      let charDelayMultiplier = 1;

      if (scrollVelocity > 0.003) {
        // EXTREMELY fast scroll - instant reveal
        animationDuration = 0.05;
        charDelayMultiplier = 0.1;
      } else if (scrollVelocity > 0.002) {
        // VERY fast scroll
        animationDuration = 0.1;
        charDelayMultiplier = 0.3;
      } else if (scrollVelocity > 0.001) {
        // Fast scroll
        animationDuration = 0.15;
        charDelayMultiplier = 0.5;
      } else if (scrollVelocity > 0.0005) {
        // Medium scroll
        animationDuration = 0.25;
        charDelayMultiplier = 0.7;
      }

      // Near end - force faster animation to ensure completion
      if (progress > 0.6) {
        animationDuration = Math.min(animationDuration, 0.1);
        charDelayMultiplier = Math.min(charDelayMultiplier, 0.3);
      }

      // Very near end - almost instant
      if (progress > 0.75) {
        animationDuration = 0.05;
        charDelayMultiplier = 0.1;
      }

      // Store animation speed settings but DON'T apply yet
      // Only apply when segment becomes visible to prevent jitter
      const currentSpeed = { duration: animationDuration, delay: charDelayMultiplier };

      // Progressive reveal - segments can only be added, never removed
      const newVisibleSegments = [...lastVisibleSegmentsRef];

      // Check if segment 1 animation is complete
      if (newVisibleSegments.includes(0) && !segment1CompleteRef.current) {
        // Mark start time when segment 1 first becomes visible
        if (!segment1StartTimeRef.current) {
          segment1StartTimeRef.current = now;
        }

        // Calculate total animation duration for segment 1
        // Count characters in segment 1
        const segment1Text = segments[0];
        const words = segment1Text.split(" ");

        // Calculate max delay: (lastWordIndex * 5 + lastCharIndex) * 0.03 * charDelayMultiplier
        const maxDelay = ((words.length - 1) * 5 + words[words.length - 1].length - 1) * 0.03 * segment1AnimationSpeedRef.current.delay;
        const totalAnimTime = (maxDelay + segment1AnimationSpeedRef.current.duration) * 1000; // Convert to ms

        // Check if enough time has passed
        if (now - segment1StartTimeRef.current >= totalAnimTime) {
          segment1CompleteRef.current = true;
        }
      }

      // Sequential segment timing - segment 2 ONLY starts after segment 1 animation is COMPLETE
      // Scroll speed does NOT affect timing, only animation speed
      segments.forEach((_, index) => {
        if (!newVisibleSegments.includes(index)) {
          if (index === 0) {
            // First segment: starts at 0.2 (20% scroll) - always same timing
            if (progress > 0.2) {
              newVisibleSegments.push(index);
              // Lock animation speed for segment 1 when it first appears
              segment1AnimationSpeedRef.current = currentSpeed;
            }
          } else if (index === 1) {
            // Second segment: ONLY starts if first segment animation is COMPLETE AND scroll >= 50%
            if (segment1CompleteRef.current && progress > 0.5) {
              newVisibleSegments.push(index);
              // Lock animation speed for segment 2 when it first appears
              segment2AnimationSpeedRef.current = currentSpeed;
            }
          }
        }
      });

      // Only update if segments actually changed
      if (newVisibleSegments.length !== lastVisibleSegmentsRef.length) {
        lastVisibleSegmentsRef = newVisibleSegments;
        setVisibleSegments(newVisibleSegments);
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [segments]);

  return (
    <section className="future-diamond" ref={containerRef}>
      <div className="future-diamond-content">
        <div className="future-diamond-logo-container">
          <img src={Logo} alt="Mirror Logo" className="future-diamond-logo" />
        </div>

        <h1 className="future-diamond-title">Love-Grown Diamond™</h1>

        <div className="future-diamond-description-container">
          <div className="future-diamond-sticky-wrapper" ref={stickyRef}>
            <div
              className="future-diamond-description"
              ref={descriptionRef}
            >
              <h1 className="heading-1--no-margin">
                {segments.map((segment, segmentIndex) => {
                  const isSegmentVisible = visibleSegments.includes(segmentIndex);
                  const words = segment.split(" ");

                  // Use locked animation speed for each segment
                  const segmentSpeed = segmentIndex === 0
                    ? segment1AnimationSpeedRef.current
                    : segment2AnimationSpeedRef.current;

                  return (
                    <span key={segmentIndex} className="segment">
                      {words.map((word, wordIndex) => (
                        <span key={wordIndex} className="word">
                          {word.split("").map((char, charIndex) => {
                            // Calculate delay with locked speed for this segment
                            const baseDelay = (wordIndex * 5 + charIndex) * 0.03;
                            const finalDelay = baseDelay * segmentSpeed.delay;

                            return (
                              <span
                                key={charIndex}
                                className={`char ${isSegmentVisible ? "reveal" : ""}`}
                                style={{
                                  '--animation-duration': `${segmentSpeed.duration}s`,
                                  animationDelay: isSegmentVisible ? `${finalDelay}s` : "0s",
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
