import { useState, useEffect, useRef } from "react";
import { getRingImageKey } from "./ringConfig";

export default function RingPreview({ diamondId, headId, bandId }) {
  const [baseImage, setBaseImage] = useState(`/ptest/${getRingImageKey(diamondId, headId, bandId)}.jpg`);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState(null); // 'diamond' | 'head' | 'band'

  const prevSelectionRef = useRef({ diamondId, headId, bandId });
  const newLayerRef = useRef(null);

  // Generate current image path
  const currentImageKey = getRingImageKey(diamondId, headId, bandId);
  const currentImage = `/ptest/${currentImageKey}.jpg`;

  useEffect(() => {
    const prev = prevSelectionRef.current;

    // Detect which part changed
    let changeType = null;
    if (prev.diamondId !== diamondId) {
      changeType = "diamond";
    } else if (prev.headId !== headId) {
      changeType = "head";
    } else if (prev.bandId !== bandId) {
      changeType = "band";
    }

    if (!changeType || isAnimating) {
      prevSelectionRef.current = { diamondId, headId, bandId };
      return;
    }

    // Start animation
    setIsAnimating(true);
    setAnimationType(changeType);

    // After animation completes, update base image
    const timer = setTimeout(() => {
      setBaseImage(currentImage);
      setIsAnimating(false);
      setAnimationType(null);
      prevSelectionRef.current = { diamondId, headId, bandId };
    }, 650);

    return () => clearTimeout(timer);
  }, [diamondId, headId, bandId, currentImage, isAnimating]);

  // Handle image error - fallback to default
  const handleImageError = (e) => {
    e.target.src = "/ptest/d1h1b1.jpg";
  };

  // Get initial clip-path based on animation type
  const getInitialClipPath = (type) => {
    switch (type) {
      case "diamond":
      case "head":
        // Reveal from top to bottom
        return "inset(0 0 100% 0)";
      case "band":
        // Reveal from bottom to top
        return "inset(100% 0 0 0)";
      default:
        return "inset(0 0 0 0)";
    }
  };

  // Get animation class based on type
  const getAnimationClass = (type) => {
    switch (type) {
      case "diamond":
      case "head":
        return "ring-preview__new--reveal-top";
      case "band":
        return "ring-preview__new--reveal-bottom";
      default:
        return "";
    }
  };

  return (
    <div className="ring-preview">
      {/* Base layer: current/old image */}
      <img
        src={baseImage}
        alt="Ring"
        className="ring-preview__base"
        onError={handleImageError}
      />

      {/* New layer: reveals with animation */}
      {isAnimating && animationType && (
        <img
          ref={newLayerRef}
          src={currentImage}
          alt="Ring New"
          className={`ring-preview__new ${getAnimationClass(animationType)}`}
          style={{ clipPath: getInitialClipPath(animationType) }}
          onError={handleImageError}
        />
      )}

      {/* Change indicator */}
      {isAnimating && animationType && (
        <div className="ring-preview__indicator">
          <span className="ring-preview__indicator-text">
            {animationType === "diamond" && "Diamond"}
            {animationType === "head" && "Head"}
            {animationType === "band" && "Band"}
          </span>
        </div>
      )}
    </div>
  );
}
