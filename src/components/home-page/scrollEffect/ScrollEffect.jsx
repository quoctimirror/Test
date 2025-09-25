import { useState, useEffect, useRef } from "react";
import Logo from "@assets/images/Logo.svg";
import SoundIcon from "@assets/images/button/sound.svg";
import ArrowButton from "@assets/images/button/arrow-button.svg";
import "./ScrollEffect.css";

export default function ScrollEffect() {
  // Original ScrollEffect refs
  const finalGradientRef = useRef(null);
  const finalGradientTopRef = useRef(null);
  const finalGradientBottomRef = useRef(null);
  const gradientInitialRef = useRef(null);
  const elementsToFadeRef = useRef(null);
  const mainLogoRef = useRef(null);
  const futureDiamondTextRef = useRef(null);
  const containerRef = useRef(null);

  // Split animation refs
  const splitTopRef = useRef(null);
  const splitBottomRef = useRef(null);

  // MirrorIntroduce state and refs
  const canvasRef = useRef(null);
  const mirrorIntroduceSectionRef = useRef(null);
  const [images, setImages] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const numFrames = 249; // Actual frames from Landscape_3D.mp4 (8.3s * 30fps)
  const scrollEffectHeight = 250; // vh for scroll effect - reduced to make mirror introduce start earlier
  const mirrorIntroduceHeight = 780; // vh for mirror introduce

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

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo(0, 0);
      sessionStorage.removeItem("scrollToTop");
    }

    // Preload images
    preloadImages();
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Calculate which section we're in
      const scrollEffectEnd = (scrollEffectHeight / 100) * windowHeight; // Use scrollEffectHeight variable

      // Phase 1: ScrollEffect (0 to scrollEffectHeight vh)
      if (scrollY <= scrollEffectEnd) {
        const progress = scrollY / scrollEffectEnd;

        // Original scroll effect animations
        if (finalGradientRef.current) {
          // Complete gradient wipe by 60% progress instead of 100%
          const wipeProgress = Math.min(progress / 0.6, 1);
          const wipePosition = 400 - wipeProgress * 350;
          finalGradientRef.current.style.setProperty(
            "--wipe-progress",
            `${wipePosition}%`
          );
        }
        if (finalGradientTopRef.current) {
          const wipeProgress = Math.min(progress / 0.6, 1);
          const wipePosition = 400 - wipeProgress * 350;
          finalGradientTopRef.current.style.setProperty(
            "--wipe-progress",
            `${wipePosition}%`
          );
        }
        if (finalGradientBottomRef.current) {
          const wipeProgress = Math.min(progress / 0.6, 1);
          const wipePosition = 400 - wipeProgress * 350;
          finalGradientBottomRef.current.style.setProperty(
            "--wipe-progress",
            `${wipePosition}%`
          );
        }

        if (elementsToFadeRef.current) {
          const fadeProgress = Math.min(1, Math.max(0, (progress - 0.5) * 2));
          elementsToFadeRef.current.style.opacity = 1 - fadeProgress;
        }

        if (mainLogoRef.current) {
          let logoOpacity = 1;

          if (progress >= 0.5 && progress <= 0.6) {
            // Logo fade out from 50% to 60% (175vh to 210vh) - earlier
            const logoFadeProgress = (progress - 0.5) / 0.1;
            logoOpacity = 1 - logoFadeProgress;
          } else if (progress > 0.6) {
            logoOpacity = 0;
          } else if (progress < 0.5) {
            logoOpacity = 1;
          }

          mainLogoRef.current.style.opacity = logoOpacity;
        }

        if (futureDiamondTextRef.current) {
          let textOpacity = 0;

          if (progress < 0.6) {
            // Before 60%, always hidden (wait for gradient final to complete)
            textOpacity = 0;
          } else if (progress >= 0.6 && progress <= 0.65) {
            // Text fade in from 60% to 65% (210vh to 227.5vh)
            const fadeInProgress = (progress - 0.6) / 0.05;
            textOpacity = fadeInProgress;
          } else if (progress > 0.65 && progress <= 0.9) {
            // Stay visible from 65% to 90% (162.5vh to 225vh) - long display
            textOpacity = 1;
          } else if (progress > 0.9 && progress <= 0.95) {
            // Fade out from 90% to 95% (225vh to 237.5vh) - fade before split
            const fadeOutProgress = (progress - 0.9) / 0.05;
            textOpacity = 1 - fadeOutProgress;
          } else if (progress > 0.95) {
            textOpacity = 0;
          }

          futureDiamondTextRef.current.style.opacity = textOpacity;
        }

        // Split animation at end of scroll effect (95-100% progress)
        if (splitTopRef.current && splitBottomRef.current) {
          if (progress >= 0.95) {
            const splitProgress = (progress - 0.95) / 0.05; // 0 to 1
            const splitAmount = splitProgress * 50; // 0 to 50vh

            splitTopRef.current.style.transform = `translateY(-${splitAmount}vh)`;
            splitBottomRef.current.style.transform = `translateY(${splitAmount}vh)`;

            // Sync mirror introduce fade in with split animation
            if (mirrorIntroduceSectionRef.current) {
              mirrorIntroduceSectionRef.current.style.opacity = splitProgress;
            }

            // Show split sections, hide combined sections
            splitTopRef.current.style.display = "block";
            splitBottomRef.current.style.display = "block";
            if (finalGradientRef.current) {
              finalGradientRef.current.style.display = "none";
            }
            if (gradientInitialRef.current) {
              gradientInitialRef.current.style.display = "none";
            }
          } else {
            splitTopRef.current.style.transform = "translateY(0)";
            splitBottomRef.current.style.transform = "translateY(0)";

            // Hide mirror introduce when split is closed
            if (mirrorIntroduceSectionRef.current) {
              mirrorIntroduceSectionRef.current.style.opacity = 0;
            }

            // Hide split sections, show combined sections
            splitTopRef.current.style.display = "none";
            splitBottomRef.current.style.display = "none";
            if (finalGradientRef.current) {
              finalGradientRef.current.style.display = "block";
            }
            if (gradientInitialRef.current) {
              gradientInitialRef.current.style.display = "block";
            }
          }
        }

        // Reset mirror introduce elements
        setFrameIndex(0);
      }
      // Phase 2: MirrorIntroduce (after scrollEffectHeight vh)
      else {
        const mirrorScrolled = scrollY - scrollEffectEnd;
        const mirrorScrollRange =
          (mirrorIntroduceHeight / 100) * windowHeight - windowHeight;
        const mirrorProgress = Math.min(
          Math.max(mirrorScrolled / mirrorScrollRange, 0),
          1
        );

        // Calculate frame index for video
        const index = Math.min(
          numFrames - 1,
          Math.floor(mirrorProgress * numFrames)
        );
        setFrameIndex(index);

        // Ensure all phase 1 elements are properly hidden
        if (mainLogoRef.current) {
          mainLogoRef.current.style.opacity = 0;
        }
        if (futureDiamondTextRef.current) {
          futureDiamondTextRef.current.style.opacity = 0;
        }
        if (elementsToFadeRef.current) {
          elementsToFadeRef.current.style.opacity = 0;
        }

        // Ensure split is fully opened and mirror introduce is fully visible
        if (splitTopRef.current && splitBottomRef.current) {
          splitTopRef.current.style.transform = "translateY(-50vh)";
          splitBottomRef.current.style.transform = "translateY(50vh)";
          splitTopRef.current.style.display = "block";
          splitBottomRef.current.style.display = "block";
          if (finalGradientRef.current) {
            finalGradientRef.current.style.display = "none";
          }
          if (gradientInitialRef.current) {
            gradientInitialRef.current.style.display = "none";
          }
        }

        // Ensure mirror introduce is fully visible
        if (mirrorIntroduceSectionRef.current) {
          mirrorIntroduceSectionRef.current.style.opacity = 1;
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update canvas when frame changes
  useEffect(() => {
    if (!canvasRef.current || !images.length || !isLoaded) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = images[frameIndex];

    if (image) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);

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

  const renderTextSlides = () => {
    const scrollY = window.scrollY;
    const scrollEffectEnd = (scrollEffectHeight / 100) * window.innerHeight;

    if (scrollY <= scrollEffectEnd) return null;

    const mirrorScrolled = scrollY - scrollEffectEnd;
    const mirrorScrollRange =
      (mirrorIntroduceHeight / 100) * window.innerHeight - window.innerHeight;
    const scrollProgress = Math.min(
      Math.max(mirrorScrolled / mirrorScrollRange, 0),
      1
    );

    return textSlides.map((slide, index) => {
      let transform = "translateY(100%)";
      let opacity = 0;

      // Text timing logic with new animation schedule
      if (index === 0) {
        // Text 1: fade in (0-5%), pause (5-15%), fade out (15-36%)
        if (scrollProgress <= 0.05) {
          // Fade in phase
          const fadeProgress = scrollProgress / 0.05;
          transform = `translateY(${(1 - fadeProgress) * 100}%)`;
          opacity = fadeProgress;
        } else if (scrollProgress <= 0.15) {
          // Pause phase
          transform = `translateY(0%)`;
          opacity = 1;
        } else if (scrollProgress <= 0.36) {
          // Fade out phase
          const fadeProgress = (scrollProgress - 0.15) / 0.21;
          transform = `translateY(${-fadeProgress * 100}%)`;
          opacity = 1 - fadeProgress;
        } else {
          transform = "translateY(-100%)";
          opacity = 0;
        }
      } else if (index === 1) {
        // Text 2: fade in 3s (15-36%), pause (36-46%), fade out (46-64%)
        if (scrollProgress < 0.15) {
          transform = "translateY(100%)";
          opacity = 0;
        } else if (scrollProgress <= 0.36) {
          // Fade in phase
          const fadeProgress = (scrollProgress - 0.15) / 0.21;
          transform = `translateY(${(1 - fadeProgress) * 100}%)`;
          opacity = fadeProgress;
        } else if (scrollProgress <= 0.46) {
          // Pause phase
          transform = `translateY(0%)`;
          opacity = 1;
        } else if (scrollProgress <= 0.64) {
          // Fade out phase
          const fadeProgress = (scrollProgress - 0.46) / 0.18;
          transform = `translateY(${-fadeProgress * 100}%)`;
          opacity = 1 - fadeProgress;
        } else {
          transform = "translateY(-100%)";
          opacity = 0;
        }
      } else if (index === 2) {
        // Text 3: fade in 5.3s (35-64%), pause (64-74%), fade out (74-90%)
        if (scrollProgress < 0.35) {
          transform = "translateY(100%)";
          opacity = 0;
        } else if (scrollProgress <= 0.64) {
          // Fade in phase
          const fadeProgress = (scrollProgress - 0.35) / 0.29;
          transform = `translateY(${(1 - fadeProgress) * 100}%)`;
          opacity = fadeProgress;
        } else if (scrollProgress <= 0.74) {
          // Pause phase
          transform = `translateY(0%)`;
          opacity = 1;
        } else if (scrollProgress <= 0.90) {
          // Fade out phase
          const fadeProgress = (scrollProgress - 0.74) / 0.16;
          transform = `translateY(${-fadeProgress * 100}%)`;
          opacity = 1 - fadeProgress;
        } else {
          transform = "translateY(-100%)";
          opacity = 0;
        }
      } else if (index === 3) {
        // Text 4: fade in 8.3s (74-90%), pause (90-100%)
        if (scrollProgress < 0.74) {
          transform = "translateY(100%)";
          opacity = 0;
        } else if (scrollProgress <= 0.90) {
          // Fade in phase
          const fadeProgress = (scrollProgress - 0.74) / 0.16;
          transform = `translateY(${(1 - fadeProgress) * 100}%)`;
          opacity = fadeProgress;
        } else {
          // Pause phase (no fade out, stays visible)
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
            transition: "none",
          }}
        >
          <div className="slide-content">
            <h1 className="heading-1--no-margin slide-title">
              {slide.title}
              {slide.highlight && (
                <span className="slide-highlight">{slide.highlight}</span>
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
    });
  };

  return (
    <div
      className="unified-scroll-container"
      ref={containerRef}
      style={{ height: `${scrollEffectHeight + mirrorIntroduceHeight}vh` }}
    >
      {/* Original ScrollEffect Section */}
      <div className="scroll-effect-section">
        <div className="scroll-container">
          <div className="homepage">
            {/* Split sections for animation */}
            <div className="split-section split-top" ref={splitTopRef}>
              <div className="gradient-initial">
                <div className="gradient-top"></div>
              </div>
              <div className="gradient-final" ref={finalGradientTopRef}></div>
            </div>

            <div className="split-section split-bottom" ref={splitBottomRef}>
              <div className="gradient-initial">
                <div className="gradient-bottom"></div>
              </div>
              <div
                className="gradient-final"
                ref={finalGradientBottomRef}
              ></div>
            </div>

            {/* Original combined sections for normal scroll effect */}
            <div className="gradient-initial" ref={gradientInitialRef}>
              <div className="gradient-top"></div>
              <div className="gradient-bottom"></div>
            </div>

            <div className="gradient-final" ref={finalGradientRef}></div>

            <div className="logo-center" ref={mainLogoRef}>
              <img src={Logo} alt="Mirror Logo" className="main-logo" />
            </div>

            <div className="future-diamond-text" ref={futureDiamondTextRef}>
              <div className="tagline-section">
                <span className="heading-3--no-margin">Future Diamond</span>
              </div>
            </div>

            <div className="elements-to-fade" ref={elementsToFadeRef}>
              <div className="scroll-down">
                <button>
                  <img src={ArrowButton} alt="Arrow Button" />
                </button>
              </div>
              <div className="vetor-button">
                <button>
                  <img src={SoundIcon} alt="Sound" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MirrorIntroduce Section */}
      <div className="mirror-introduce-section" ref={mirrorIntroduceSectionRef}>
        <div className="mirror-introduce-sticky">
          <div className="canvas-container">
            <canvas ref={canvasRef} className="sequence-canvas" />

            {!isLoaded && (
              <div className="loading-overlay">
                <div className="loading-spinner">Loading...</div>
              </div>
            )}

            <div className="video-overlay">
              <div className="text-slides-container">{renderTextSlides()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
