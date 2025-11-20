import "./Lumex91.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import ShinyText from "@components/common/shiny-text/ShinyText";
import { MediaImage, MediaVideo } from "@components/common/media";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNewsDetailRoute } from "@/constants/routes";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";

const Lumex91 = () => {
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoBoxRef = useRef(null);
  const navigate = useNavigate();

  // Lazy load video when in viewport (IntersectionObserver)
  useEffect(() => {
    if (!videoBoxRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(videoBoxRef.current);

    return () => observer.disconnect();
  }, []);

  const handleExploreClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(
      navigate,
      getNewsDetailRoute("milan")
    );
  };

  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  // Show image while loading, switch to video when loaded
  const showVideo = shouldLoadVideo && !videoError;

  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box" ref={videoBoxRef}>
          {/* Image placeholder - fades out when video loads */}
          <MediaImage
            className={`lumex91-video lumex91-placeholder ${
              videoLoaded && !videoError ? "lumex91-placeholder-hide" : ""
            }`}
            src="home-page/Mirror-Lumex 91.jpg"
            alt="Mirror-Lumex 91"
          />

          {/* Load video when in viewport, hide until ready */}
          {shouldLoadVideo && !videoError && (
            <MediaVideo
              className={`lumex91-video ${
                videoLoaded ? "lumex91-video-loaded" : "lumex91-video-loading"
              }`}
              src="home-page/MIRROR-LUMEX 91.mp4"
              poster="home-page/Mirror-Lumex 91.jpg"
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={handleVideoCanPlay}
              onError={() => setVideoError(true)}
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
