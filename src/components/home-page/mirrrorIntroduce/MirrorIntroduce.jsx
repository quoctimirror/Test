import React, { useState, useEffect, useRef } from "react";
import "./MirrorIntroduce.css";

const MirrorIntroduce = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);

  const numFrames = 300;
  const scrollHeight = 800; // vh units

  // Text slides data
  const textSlides = [
    {
      title: "The Universe is built upon a single, powerful element: ",
      highlight: "reflection.",
      subtitle:
        "It begins with the way light dances across a diamond's surface - but goes far beyond...",
    },
    {
      title: "The Reflection of Beauty",
      subtitle:
        "From the sparkle on the surface to the brilliance within, Mirror celebrates the harmony between outer elegance and inner light.",
    },
    {
      title: "The Reflection of Self",
      subtitle:
        "A moment of stillness where you meet yourself - past, present, and becoming.",
    },
    {
      title: "The Reflection of\nArtistry and Innovation",
      subtitle:
        "Each piece is crafted with the precision of technology and the soul of human touch — a seamless harmony between machine intelligence and human intuition.",
    },
  ];

  // Function to get frame path
  function getFramePath(index) {
    return `/home-page/frames/frame_${index.toString().padStart(4, "0")}.jpg`;
  }

  // Preload all images
  function preloadImages() {
    const imagePromises = [];

    for (let i = 1; i <= numFrames; i++) {
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = getFramePath(i);
      });
      imagePromises.push(promise);
    }

    Promise.all(imagePromises)
      .then((loadedImages) => {
        setImages(loadedImages);
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load images:", error);
      });
  }


  // Handle scroll for frame calculation - simple natural scrolling
  const handleScroll = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollRange = containerHeight - windowHeight;

    if (rect.top <= 0 && rect.bottom > windowHeight) {
      // Calculate progress (0 to 1)
      const scrolled = Math.abs(rect.top);
      const progress = Math.min(Math.max(scrolled / scrollRange, 0), 1);

      // Calculate frame index for video
      const index = Math.min(numFrames - 1, Math.floor(progress * numFrames));
      setFrameIndex(index);

      // Calculate text slide progress
      const totalSlides = textSlides.length;
      const slideProgress = progress * totalSlides;
      const currentSlideIndex = Math.floor(slideProgress);
      const slideInternalProgress = slideProgress - currentSlideIndex;

      setCurrentSlide(Math.min(currentSlideIndex, totalSlides - 1));
      setSlideProgress(slideInternalProgress);
    } else if (rect.top > 0) {
      // Before section
      setFrameIndex(0);
      setCurrentSlide(0);
      setSlideProgress(0);
    } else if (rect.bottom <= windowHeight) {
      // After section
      setFrameIndex(numFrames - 1);
      setCurrentSlide(textSlides.length - 1);
      setSlideProgress(1);
    }
  };


  // Update canvas when frame changes
  useEffect(() => {
    if (!canvasRef.current || !images.length || !isLoaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = images[frameIndex];

    if (image) {
      // Simple full screen canvas rendering
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear and draw image to cover entire screen
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scaling to cover entire canvas (like object-fit: cover)
      const scaleX = canvas.width / image.width;
      const scaleY = canvas.height / image.height;
      const scale = Math.max(scaleX, scaleY);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    }
  }, [frameIndex, images, isLoaded]);

  // Initialize
  useEffect(() => {
    preloadImages();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Also listen for isLoaded change to trigger initial scroll check
  useEffect(() => {
    if (isLoaded) {
      handleScroll();
    }
  }, [isLoaded]);

  return (
    <section
      className="mirror-introduce-section"
      ref={containerRef}
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="mirror-introduce-sticky">
        <div className="canvas-container">
          <canvas ref={canvasRef} className="sequence-canvas" />

          {!isLoaded && (
            <div className="loading-overlay">
              <div className="loading-spinner">Loading...</div>
            </div>
          )}

          {/* Overlay content with sliding text */}
          <div className="video-overlay">
            <div className="text-slides-container">
              {textSlides.map((slide, index) => {
                let transform = "translateY(100%)"; // Start below
                let opacity = 0;

                // Calculate scroll progress (0 to 1)
                const rect = containerRef.current?.getBoundingClientRect();
                const containerHeight = containerRef.current?.offsetHeight || 1;
                const windowHeight = window.innerHeight;
                const scrollRange = containerHeight - windowHeight;
                const scrolled = rect ? Math.abs(Math.min(rect.top, 0)) : 0;
                const scrollProgress = Math.min(Math.max(scrolled / scrollRange, 0), 1);

                // Text 1: pause (0-15%), fade out (15-25%)
                if (index === 0) {
                  if (scrollProgress <= 0.15) {
                    // Fully visible from 0% to 15% (pause)
                    transform = `translateY(0%)`;
                    opacity = 1;
                  } else if (scrollProgress <= 0.25) {
                    // Fade out from 15% to 25%
                    const fadeProgress = (scrollProgress - 0.15) / 0.10;
                    transform = `translateY(${-fadeProgress * 100}%)`;
                    opacity = 1 - fadeProgress * 0.5;
                  } else {
                    transform = "translateY(-100%)";
                    opacity = 0;
                  }
                }
                // Text 2: fade in (15-25%), pause (25-35%), fade out (35-45%)
                else if (index === 1) {
                  if (scrollProgress < 0.15) {
                    transform = "translateY(100%)";
                    opacity = 0;
                  } else if (scrollProgress <= 0.25) {
                    // Fade in from 15% to 25%
                    const fadeProgress = (scrollProgress - 0.15) / 0.10;
                    transform = `translateY(${(1 - fadeProgress) * 100}%)`;
                    opacity = fadeProgress;
                  } else if (scrollProgress <= 0.35) {
                    // Fully visible from 25% to 35% (pause 10%)
                    transform = `translateY(0%)`;
                    opacity = 1;
                  } else if (scrollProgress <= 0.45) {
                    // Fade out from 35% to 45%
                    const fadeProgress = (scrollProgress - 0.35) / 0.10;
                    transform = `translateY(${-fadeProgress * 100}%)`;
                    opacity = 1 - fadeProgress * 0.5;
                  } else {
                    transform = "translateY(-100%)";
                    opacity = 0;
                  }
                }
                // Text 3: fade in (35-40%), pause (40-75%), fade out (75-80%)
                else if (index === 2) {
                  if (scrollProgress < 0.35) {
                    transform = "translateY(100%)";
                    opacity = 0;
                  } else if (scrollProgress <= 0.40) {
                    // Fade in from 35% to 40%
                    const fadeProgress = (scrollProgress - 0.35) / 0.05;
                    transform = `translateY(${(1 - fadeProgress) * 100}%)`;
                    opacity = fadeProgress;
                  } else if (scrollProgress <= 0.75) {
                    // Fully visible from 40% to 75% (pause 35%)
                    transform = `translateY(0%)`;
                    opacity = 1;
                  } else if (scrollProgress <= 0.80) {
                    // Fade out from 75% to 80%
                    const fadeProgress = (scrollProgress - 0.75) / 0.05;
                    transform = `translateY(${-fadeProgress * 100}%)`;
                    opacity = 1 - fadeProgress * 0.5;
                  } else {
                    transform = "translateY(-100%)";
                    opacity = 0;
                  }
                }
                // Text 4: fade in (80-85%), pause (85-100%) - no fade out
                else if (index === 3) {
                  if (scrollProgress < 0.80) {
                    transform = "translateY(100%)";
                    opacity = 0;
                  } else if (scrollProgress <= 0.85) {
                    // Fade in from 80% to 85%
                    const fadeProgress = (scrollProgress - 0.80) / 0.05;
                    transform = `translateY(${(1 - fadeProgress) * 100}%)`;
                    opacity = fadeProgress;
                  } else {
                    // Fully visible from 85% to 100% (pause 15% - no fade out)
                    transform = `translateY(0%)`;
                    opacity = 1;
                  }
                }

                return (
                  <div
                    key={index}
                    className="text-slide"
                    style={{
                      transform,
                      opacity,
                      transition: "none", // We control animation via scroll
                    }}
                  >
                    <div className="slide-content">
                      <h1 className="heading-1--no-margin slide-title">
                        {slide.title}
                        {slide.highlight && (
                          <span className="slide-highlight">
                            {slide.highlight}
                          </span>
                        )}
                      </h1>
                      <p
                        className={
                          index === 0
                            ? "heading-1--no-margin slide-subtitle"
                            : "bodytext-3--no-margin slide-subtitle"
                        }
                      >
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MirrorIntroduce;
