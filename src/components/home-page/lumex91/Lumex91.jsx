import "./Lumex91.css";
import GlassThemeButton from "@components/common/button/GlassThemeButton";
import ShinyText from "@components/common/shiny-text/ShinyText";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNewsDetailRoute } from "@/constants/routes";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";

const TOTAL_FRAMES = 456;
const FRAME_PATH = "/home-page/lumex91-ani-frames/frame_";

const Lumex91 = ({ externalProgress = null }) => {
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [shouldLoadFrames, setShouldLoadFrames] = useState(false);
  const videoBoxRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const lastRenderedFrameRef = useRef(-1);
  const navigate = useNavigate();

  // Preload all frames when approaching viewport (earlier trigger)
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
        rootMargin: "1500px", // Load much earlier - when ~1500px away from viewport
        threshold: 0,
      }
    );

    observer.observe(videoBoxRef.current);

    return () => observer.disconnect();
  }, []);

  // Preload all frame images in parallel using Promise.all
  useEffect(() => {
    if (!shouldLoadFrames) return;

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameNum = String(index).padStart(3, "0");
        img.src = `${FRAME_PATH}${frameNum}.webp`;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // Return null for failed loads
      });
    };

    // Load all frames in parallel
    const imagePromises = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      imagePromises.push(loadImage(i));
    }

    Promise.all(imagePromises).then((loadedImages) => {
      imagesRef.current = loadedImages;
      setFramesLoaded(true);
    });
  }, [shouldLoadFrames]);

  // Draw frame to canvas - optimized to only redraw when frame changes
  const drawFrame = (frameIndex) => {
    if (!canvasRef.current || !imagesRef.current.length) return;

    // Skip if same frame already rendered
    if (frameIndex === lastRenderedFrameRef.current) return;

    const image = imagesRef.current[frameIndex - 1]; // frames are 1-indexed
    if (!image) return;

    lastRenderedFrameRef.current = frameIndex;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });

    // Set canvas size to match container
    const container = videoBoxRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }

    // Clear canvas before drawing new frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate cover sizing (like object-fit: cover)
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    const scale = Math.max(scaleX, scaleY);

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
  };

  // Update frame based on external progress - only on scroll, not continuous RAF
  useEffect(() => {
    if (!framesLoaded || externalProgress === null) return;

    const frameIndex = Math.min(
      TOTAL_FRAMES,
      Math.max(1, Math.ceil(externalProgress * TOTAL_FRAMES))
    );

    requestAnimationFrame(() => {
      drawFrame(frameIndex);
    });
  }, [framesLoaded, externalProgress]);

  // Handle resize - redraw current frame
  useEffect(() => {
    if (!framesLoaded) return;

    const handleResize = () => {
      // Force redraw by resetting last rendered frame
      const currentFrame = lastRenderedFrameRef.current;
      lastRenderedFrameRef.current = -1;
      if (currentFrame > 0) {
        requestAnimationFrame(() => {
          drawFrame(currentFrame);
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [framesLoaded]);

  // Draw first frame when loaded
  useEffect(() => {
    if (framesLoaded && imagesRef.current.length > 0) {
      requestAnimationFrame(() => {
        drawFrame(1);
      });
    }
  }, [framesLoaded]);

  const handleExploreClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      getNewsDetailRoute("milan")
    );
  };

  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box" ref={videoBoxRef}>
          {/* Placeholder image - shown while frames loading */}
          <img
            className={`lumex91-video lumex91-placeholder ${
              framesLoaded ? "lumex91-placeholder-hide" : ""
            }`}
            src={`${FRAME_PATH}001.webp`}
            alt="Mirror-Lumex 91"
          />

          {/* Canvas for smooth frame rendering */}
          <canvas
            ref={canvasRef}
            className={`lumex91-video lumex91-canvas ${
              framesLoaded ? "lumex91-canvas-visible" : ""
            }`}
          />
        </div>

        <div className="lumex91-content">
          <h1 className="heading-1--no-margin">
            <ShinyText text="Mirror Lumex - 91™" speed={2} />
          </h1>
          <GlassThemeButton theme="dark" onClick={handleExploreClick}>
            <span className="bodytext-6--no-margin">Explore more</span>
          </GlassThemeButton>
        </div>
      </div>
    </section>
  );
};

export default Lumex91;
