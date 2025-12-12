import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lumex91 from "@components/home-page/lumex91/Lumex91";
import GlassThemeButton from "@components/common/button/GlassThemeButton";
import ShinyText from "@components/common/shiny-text/ShinyText";
import { getNewsDetailRoute } from "@/constants/routes";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import "./FutureDiamondV2.css";

const FutureDiamondV2 = () => {
  const containerRef = useRef(null);
  const stickyWrapperRef = useRef(null);
  const navigate = useNavigate();
  const [introState, setIntroState] = useState(""); // empty = visible, faded = fade out
  const [titleState, setTitleState] = useState("hidden"); // hidden, visible, faded
  const [descState, setDescState] = useState("hidden"); // hidden, visible, faded
  const [lumexState, setLumexState] = useState("hidden"); // hidden, visible, faded
  const [videoBoxState, setVideoBoxState] = useState("hidden"); // hidden, visible
  const [frameProgress, setFrameProgress] = useState(0);

  const introText =
    "Because every reflection starts somewhere - and ours begins with";

  const descriptionHeading =
    "The world's newest diamond cut, a new star is born.";
  const descriptionBody =
    "Its 91 facets sparkle the brightest, emitting a fire like no other in a celebration of the constellations and the extraordinary potential of mankind.";

  const handleExploreClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      getNewsDetailRoute("milan")
    );
  };

  // Scroll-based animation - fade in, hold, fade out sequence
  useEffect(() => {
    const handleScroll = () => {
      if (!stickyWrapperRef.current) return;

      const rect = stickyWrapperRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const wrapperHeight = stickyWrapperRef.current.offsetHeight;

      // Calculate scroll progress within the sticky wrapper (0 to 1)
      const scrollProgress = (windowHeight - rect.top) / wrapperHeight;

      // Frame progress for Lumex91 - starts at 25% scroll, maps 25%-100% to 0-1
      const lumexStartProgress = 0.25;
      const lumexProgress =
        (scrollProgress - lumexStartProgress) / (1 - lumexStartProgress);
      const clampedFrameProgress = Math.max(0, Math.min(1, lumexProgress));
      setFrameProgress(clampedFrameProgress);

      // Video box: Fade in together with title (25%)
      if (scrollProgress < 0.25) {
        setVideoBoxState("hidden");
      } else {
        setVideoBoxState("visible");
      }

      // Intro: visible by default, fade out after 35%
      if (scrollProgress < 0.22) {
        setIntroState("");
      } else {
        setIntroState("faded");
      }

      // Title: Fade in 25-30%, hold 30-40%, fade out 40-45%
      if (scrollProgress < 0.25) {
        setTitleState("hidden");
      } else if (scrollProgress >= 0.25 && scrollProgress < 0.45) {
        setTitleState("visible");
      } else {
        setTitleState("faded");
      }

      // Description: Fade in 50-55%, hold 55-70%, fade out 70-75%
      if (scrollProgress < 0.5) {
        setDescState("hidden");
      } else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
        setDescState("visible");
      } else {
        setDescState("faded");
      }

      // Lumex content: Fade in at 80%, stay visible (no fade out)
      if (scrollProgress < 0.8) {
        setLumexState("hidden");
      } else {
        setLumexState("visible");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Delay initial check to ensure CSS is applied first
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="future-diamond-v2" ref={containerRef}>
      {/* Sticky scroll section - all content inside */}
      <div className="future-diamond-v2-sticky-wrapper" ref={stickyWrapperRef}>
        <div className="future-diamond-v2-sticky-content">
          {/* Lumex box - stays sticky */}
          <div
            className={`future-diamond-v2-lumex-container future-diamond-v2-lumex--${lumexState} future-diamond-v2-videobox--${videoBoxState}`}
          >
            <Lumex91 externalProgress={frameProgress} />
          </div>

          {/* Intro - visible by default, only fades out */}
          <div
            className={`future-diamond-v2-intro-overlay${
              introState
                ? ` future-diamond-v2-intro-overlay--${introState}`
                : ""
            }`}
          >
            <h2 className="heading-2--no-margin">{introText}</h2>
          </div>

          {/* Title - centered, fades in/out second */}
          <div
            className={`future-diamond-v2-title-overlay future-diamond-v2-title-overlay--${titleState}`}
          >
            <h1 className="future-diamond-v2-title">Love-Grown Diamond™</h1>
          </div>

          {/* Description - bottom left, fades in/out third */}
          <div
            className={`future-diamond-v2-description-overlay future-diamond-v2-description-overlay--${descState}`}
          >
            <h1 className="heading-1--no-margin">{descriptionHeading}</h1>
            <p className="bodytext-4--no-margin">{descriptionBody}</p>
          </div>

          {/* Lumex Content - 20% from top, fades in/out last */}
          <div
            className={`future-diamond-v2-lumex-content-overlay future-diamond-v2-lumex-content-overlay--${lumexState}`}
          >
            <h1 className="heading-1--no-margin">
              <ShinyText text="Mirror Lumex - 91™" speed={2} />
            </h1>
            <GlassThemeButton theme="dark" onClick={handleExploreClick}>
              <span className="bodytext-6--no-margin">Explore more</span>
            </GlassThemeButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FutureDiamondV2;
