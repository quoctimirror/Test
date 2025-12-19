import { useState, useEffect, useRef } from "react";
import { getVideoUrl } from "@utils/cloudflareMediaUtil";
import "./SloganSection.css";

// Video from CDN, poster from public folder
const VIDEO_SRC = getVideoUrl("about/section1/Top_video.mp4");
const POSTER_SRC = "/about/media_about_section1_Top_video_poster.jpg";

const SloganSection = () => {
  const [isNearFooter, setIsNearFooter] = useState(false);
  const videoRef = useRef(null);

  // Handle video playback - only start after transition complete
  useEffect(() => {
    let mounted = true;

    const startVideo = () => {
      if (!mounted || !videoRef.current) return;
      videoRef.current.play().catch(() => {
        // Autoplay blocked - video will show poster
      });
    };

    const handleTransitionComplete = () => {
      // Delay slightly to ensure DOM is stable
      setTimeout(startVideo, 150);
    };

    // Start video on initial mount
    setTimeout(startVideo, 100);

    // Also listen for transition complete
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);

    return () => {
      mounted = false;
      window.removeEventListener(
        "pageTransitionComplete",
        handleTransitionComplete
      );
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = documentHeight - window.innerHeight * 3;
      setIsNearFooter(scrollPosition >= threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="slogan-section-wrapper">
      <div className={`slogan-section ${isNearFooter ? "hidden" : ""}`}>
        <video
          ref={videoRef}
          className="slogan-background-video"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="slogan-content">
          <p className="bodytext-4--no-margin slogan-text">
            In a world where diamond mines scar the earth, Mirror offers a
            different reflection - one where science becomes soul, and beauty
            carries meaning.
          </p>
        </div>
      </div>
      <div className="slogan-spacer"></div>
    </div>
  );
};

export default SloganSection;
