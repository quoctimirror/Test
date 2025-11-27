import "./Lumex91.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import ShinyText from "@components/common/shiny-text/ShinyText";
import { MediaImage } from "@components/common/media";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNewsDetailRoute } from "@/constants/routes";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";

const TOTAL_FRAMES = 200;
const FRAME_PATH = "/home-page/lumex91-frames/frame_";

const Lumex91 = () => {
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [shouldLoadFrames, setShouldLoadFrames] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const videoBoxRef = useRef(null);
  const imagesRef = useRef([]);
  const rafRef = useRef(null);
  const navigate = useNavigate();

  // Preload all frames when in viewport
  useEffect(() => {
    if (!videoBoxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadFrames(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(videoBoxRef.current);

    return () => observer.disconnect();
  }, []);

  // Preload all frame images
  useEffect(() => {
    if (!shouldLoadFrames) return;

    let loadedCount = 0;
    const images = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, "0");
      img.src = `${FRAME_PATH}${frameNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setFramesLoaded(true);
        }
      };
      images.push(img);
    }

    imagesRef.current = images;
  }, [shouldLoadFrames]);

  // Scroll-controlled frame display
  const updateFrame = useCallback(() => {
    if (!videoBoxRef.current || !framesLoaded) return;

    const rect = videoBoxRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Start: top of box enters bottom of viewport
    // End: bottom of box reaches top of viewport
    const scrollStart = windowHeight;
    const scrollEnd = -rect.height;
    const scrollRange = scrollStart - scrollEnd;
    const currentPosition = rect.top;

    const progress = Math.max(0, Math.min(1, (scrollStart - currentPosition) / scrollRange));
    const frameIndex = Math.min(TOTAL_FRAMES, Math.max(1, Math.ceil(progress * TOTAL_FRAMES)));

    setCurrentFrame(frameIndex);
    rafRef.current = requestAnimationFrame(updateFrame);
  }, [framesLoaded]);

  // Start animation loop when frames ready
  useEffect(() => {
    if (!framesLoaded) return;

    rafRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [framesLoaded, updateFrame]);

  const handleExploreClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      getNewsDetailRoute("milan")
    );
  };

  // Generate current frame src
  const currentFrameSrc = `${FRAME_PATH}${String(currentFrame).padStart(3, "0")}.jpg`;

  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box" ref={videoBoxRef}>
          {/* Placeholder image - shown while frames loading */}
          <MediaImage
            className={`lumex91-video lumex91-placeholder ${
              framesLoaded ? "lumex91-placeholder-hide" : ""
            }`}
            src="home-page/Mirror-Lumex 91.jpg"
            alt="Mirror-Lumex 91"
          />

          {/* Scroll-controlled frame display */}
          {framesLoaded && (
            <img
              className="lumex91-video lumex91-frame"
              src={currentFrameSrc}
              alt="Mirror-Lumex 91"
            />
          )}
        </div>

        <div className="lumex91-content">
          <h1 className="heading-1--no-margin">
            <ShinyText text="Mirror Lumex - 91™" speed={2} />
          </h1>
          <ShineGlassButton theme="footer" onClick={handleExploreClick}>
            Explore more
          </ShineGlassButton>
        </div>
      </div>
    </section>
  );
};

export default Lumex91;
