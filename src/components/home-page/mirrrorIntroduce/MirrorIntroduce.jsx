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

  const numFrames = 200;
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

  // Handle scroll for frame calculation
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

  // Render canvas
  const renderCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size to match viewport
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Update canvas when frame changes
  useEffect(() => {
    if (!canvasRef.current || !images.length || !isLoaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = images[frameIndex];

    if (image) {
      // Set canvas size to match viewport
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Calculate scaling to cover entire canvas (like object-fit: cover)
      const scaleX = canvas.width / image.width;
      const scaleY = canvas.height / image.height;
      const scale = Math.max(scaleX, scaleY);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      // Clear and draw scaled image
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    }
  }, [frameIndex, images, isLoaded]);

  // Initialize
  useEffect(() => {
    preloadImages();
    renderCanvas();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Add resize listener to update canvas size
    const handleResize = () => {
      renderCanvas();
      // Redraw current frame after resize
      if (isLoaded && images.length > 0) {
        // This will trigger the canvas redraw with new size
        setFrameIndex((prev) => prev);
      }
    };
    window.addEventListener("resize", handleResize);

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
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
                // Special handling for first slide
                if (index === 0) {
                  // First slide - always visible, uses fade-in text effect
                  let transform = "translateY(0%)";
                  let opacity = 1;

                  // When moving to next slide
                  if (currentSlide > 0) {
                    transform = "translateY(-100%)";
                    opacity = 0;
                  }

                  return (
                    <div
                      key={index}
                      className="text-slide"
                      style={{
                        transform,
                        opacity,
                        transition: "none",
                      }}
                    >
                      <div className="slide-content">
                        <h1 className="heading-1--no-margin slide-title fade-in-text">
                          {slide.title.split("").map((char, index) => {
                            const titleLength = slide.title.length;
                            const charProgress = (index + 1) / titleLength;
                            const titleRevealProgress =
                              currentSlide === 0 && slideProgress > 0.1
                                ? Math.min(1, (slideProgress - 0.1) / 0.2)
                                : 0;
                            const isRevealed =
                              titleRevealProgress >= charProgress;

                            return (
                              <span
                                key={index}
                                style={{
                                  color: isRevealed
                                    ? "rgba(0, 0, 0, 1)"
                                    : "rgba(0, 0, 0, 0.3)",
                                  transition: "color 0.1s ease",
                                }}
                              >
                                {char}
                              </span>
                            );
                          })}
                          {slide.highlight && (
                            <>
                              {slide.highlight.split("").map((char, index) => {
                                const highlightLength = slide.highlight.length;
                                const charProgress =
                                  (index + 1) / highlightLength;
                                const highlightRevealProgress =
                                  currentSlide === 0 && slideProgress > 0.4
                                    ? Math.min(1, (slideProgress - 0.4) / 0.2)
                                    : 0;
                                const isRevealed =
                                  highlightRevealProgress >= charProgress;

                                return (
                                  <span
                                    key={`highlight-${index}`}
                                    className="slide-highlight"
                                    style={{
                                      color: isRevealed
                                        ? "rgba(0, 0, 0, 1)"
                                        : "rgba(0, 0, 0, 0.3)",
                                      transition: "color 0.1s ease",
                                    }}
                                  >
                                    {char}
                                  </span>
                                );
                              })}
                            </>
                          )}
                        </h1>
                        <h1 className="heading-1--no-margin slide-subtitle">
                          {(() => {
                            const lines = slide.subtitle.split("\n");
                            const totalLength = slide.subtitle.replace(
                              /\n/g,
                              ""
                            ).length;
                            let charCount = 0;

                            return lines.map((line, lineIndex) => (
                              <React.Fragment key={lineIndex}>
                                {lineIndex > 0 && <br />}
                                {line.split("").map((char, charIndex) => {
                                  charCount++;
                                  const charProgress = charCount / totalLength;
                                  const subtitleRevealProgress =
                                    currentSlide === 0 && slideProgress > 0.7
                                      ? Math.min(1, (slideProgress - 0.7) / 0.3)
                                      : 0;
                                  const isRevealed =
                                    subtitleRevealProgress >= charProgress;

                                  return (
                                    <span
                                      key={`${lineIndex}-${charIndex}`}
                                      style={{
                                        color: isRevealed
                                          ? "rgba(0, 0, 0, 1)"
                                          : "rgba(0, 0, 0, 0.3)",
                                        transition: "color 0.05s ease",
                                      }}
                                    >
                                      {char}
                                    </span>
                                  );
                                })}
                              </React.Fragment>
                            ));
                          })()}
                        </h1>
                      </div>
                    </div>
                  );
                }

                // Other slides - normal slide behavior
                let transform = "translateY(100%)"; // Start below
                let opacity = 0;

                if (index === currentSlide) {
                  // Current slide - animate in from bottom, then stay for fade-in
                  let progress = slideProgress;

                  // First 50% of slideProgress: move to position
                  if (progress <= 0.5) {
                    const moveProgress = progress / 0.5;
                    transform = `translateY(${(1 - moveProgress) * 100}%)`;
                    opacity = moveProgress;
                  } else {
                    // After 50%: stay in position for fade-in effects
                    transform = `translateY(0%)`;
                    opacity = 1;
                  }
                } else if (index < currentSlide) {
                  // Previous slides - move up and out
                  transform = "translateY(-100%)";
                  opacity = 0;
                } else {
                  // Future slides - stay below
                  transform = "translateY(100%)";
                  opacity = 0;
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
                        {(() => {
                          const lines = slide.title.split("\n");
                          const totalLength = slide.title.replace(
                            /\n/g,
                            ""
                          ).length;
                          let charCount = 0;

                          return lines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                              {lineIndex > 0 && <br />}
                              {line.split("").map((char, charIndex) => {
                                charCount++;
                                const charProgress = charCount / totalLength;
                                const titleRevealProgress =
                                  index === currentSlide && slideProgress > 0.5
                                    ? Math.min(1, (slideProgress - 0.5) / 0.15)
                                    : 0;
                                const isRevealed =
                                  titleRevealProgress >= charProgress;

                                return (
                                  <span
                                    key={`${lineIndex}-${charIndex}`}
                                    style={{
                                      color: isRevealed
                                        ? "rgba(0, 0, 0, 1)"
                                        : "rgba(0, 0, 0, 0.3)",
                                      transition: "color 0.1s ease",
                                    }}
                                  >
                                    {char}
                                  </span>
                                );
                              })}
                            </React.Fragment>
                          ));
                        })()}
                        {slide.highlight && (
                          <>
                            <span style={{ color: "rgba(0, 0, 0, 1)" }}> </span>
                            {slide.highlight
                              .split("")
                              .map((char, charIndex) => {
                                const highlightLength = slide.highlight.length;
                                const charProgress =
                                  (charIndex + 1) / highlightLength;
                                const highlightRevealProgress =
                                  index === currentSlide && slideProgress > 0.65
                                    ? Math.min(1, (slideProgress - 0.65) / 0.15)
                                    : 0;
                                const isRevealed =
                                  highlightRevealProgress >= charProgress;

                                return (
                                  <span
                                    key={`highlight-${charIndex}`}
                                    className="slide-highlight"
                                    style={{
                                      color: isRevealed
                                        ? "rgba(0, 0, 0, 1)"
                                        : "rgba(0, 0, 0, 0.3)",
                                      transition: "color 0.1s ease",
                                    }}
                                  >
                                    {char}
                                  </span>
                                );
                              })}
                          </>
                        )}
                        {slide.title.includes(":") &&
                          slide.title.split(":")[1] === "" && (
                            <span
                              style={{
                                color:
                                  index === currentSlide && slideProgress > 0.8
                                    ? "rgba(0, 0, 0, 1)"
                                    : "rgba(0, 0, 0, 0.3)",
                                transition: "color 0.1s ease",
                              }}
                            >
                              .
                            </span>
                          )}
                      </h1>
                      <h1
                        className={
                          index === 0
                            ? "heading-1--no-margin slide-subtitle"
                            : "bodytext-3--no-margin slide-subtitle"
                        }
                      >
                        {(() => {
                          const lines = slide.subtitle.split("\n");
                          const totalLength = slide.subtitle.replace(
                            /\n/g,
                            ""
                          ).length;
                          let charCount = 0;

                          return lines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                              {lineIndex > 0 && <br />}
                              {line.split("").map((char, charIndex) => {
                                charCount++;
                                const charProgress = charCount / totalLength;
                                const subtitleRevealProgress =
                                  index === currentSlide && slideProgress > 0.85
                                    ? Math.min(1, (slideProgress - 0.85) / 0.15)
                                    : 0;
                                const isRevealed =
                                  subtitleRevealProgress >= charProgress;

                                return (
                                  <span
                                    key={`${lineIndex}-${charIndex}`}
                                    style={{
                                      color: isRevealed
                                        ? "rgba(0, 0, 0, 1)"
                                        : "rgba(0, 0, 0, 0.3)",
                                      transition: "color 0.05s ease",
                                    }}
                                  >
                                    {char}
                                  </span>
                                );
                              })}
                            </React.Fragment>
                          ));
                        })()}
                      </h1>
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
