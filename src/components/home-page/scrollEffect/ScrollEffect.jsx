import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Logo from "@assets/images/Logo.svg";
import { ROUTES } from "@/constants/routes";
import ScrollDownArrow from "@/components/common/button/ScrollDownArrow";
import SoundButton from "@/components/common/button/SoundButton";
import "./ScrollEffect.css";

export default function ScrollEffect() {
  const location = useLocation();
  const isImmersiveShowroomPage =
    location.pathname === ROUTES.IMMERSIVE_SHOWROOM;

  // Original ScrollEffect refs
  const finalGradientRef = useRef(null);
  const finalGradientTopRef = useRef(null);
  const finalGradientBottomRef = useRef(null);
  const gradientInitialRef = useRef(null);
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
  const [text1AutoProgress, setText1AutoProgress] = useState(0);
  const [hasStartedScrolling, setHasStartedScrolling] = useState(false);
  const lastRenderedFrameRef = useRef(-1);
  const [isArrowVisible, setIsArrowVisible] = useState(true);
  const [isSoundActive, setIsSoundActive] = useState(false);

  const numFrames = 249; // Actual frames from Landscape_3D.mp4 (8.3s * 30fps)
  const scrollEffectHeight = 250; // vh for scroll effect - reduced to make mirror introduce start earlier
  const mirrorIntroduceHeight = 780; // vh for mirror introduce

  // Handle sound button click - toggle sound state
  const handleSoundClick = () => {
    setIsSoundActive((prev) => !prev);
  };

  // Handle arrow click - scroll to next section
  const handleArrowClick = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollEffectEnd = (scrollEffectHeight / 100) * windowHeight;
    const totalHeight =
      ((scrollEffectHeight + mirrorIntroduceHeight) / 100) * windowHeight;

    // Determine which section we're in and scroll to next
    if (scrollY < scrollEffectEnd) {
      // Currently in ScrollEffect section -> scroll to where first text appears
      // Text 1 starts auto-appearing right after split (250vh), so scroll a bit further to see text
      const textStartPosition = scrollEffectEnd + windowHeight * 0.1; // 250vh + 10vh buffer
      window.scrollTo({
        top: textStartPosition,
        behavior: "smooth",
      });
    } else if (scrollY < totalHeight - 100) {
      // Currently in MirrorIntroduce section -> scroll to next page section (after this component)
      // Add 100px buffer so that once we're near the end, we switch to section-based navigation
      window.scrollTo({
        top: totalHeight,
        behavior: "smooth",
      });
    } else {
      // Already past ScrollEffect component -> find all sections and scroll to next one
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      let nextSection = null;

      // Find the first section that starts below current scroll position
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();

        // If section top is more than 50px below viewport top, it's the next section
        if (rect.top > 50) {
          nextSection = section;
          break;
        }
      }

      // If found next section, scroll to it; otherwise scroll one viewport
      if (nextSection) {
        const rect = nextSection.getBoundingClientRect();
        const targetPosition = scrollY + rect.top;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      } else {
        // No next section found, scroll one viewport
        window.scrollTo({
          top: scrollY + windowHeight,
          behavior: "smooth",
        });
      }
    }
  };

  // Text slides data
  const textSlides = [
    {
      title: "The Universe is built upon a single, powerful element: ",
      highlight: "reflection.",
      subtitle:
        "It begins with the way light dances across a diamond's surface - but goes far beyond...",
    },
    {
      title: "Reflection of Beauty",
      subtitle:
        "From the sparkle on the surface to the brilliance within, Mirror celebrates the harmony between outer elegance and inner light.",
    },
    {
      title: "Reflection of Self",
      subtitle:
        "A moment of stillness where you meet yourself - past, present, and becoming.",
    },
    {
      title: "Reflection of\nArtistry and Innovation",
      subtitle:
        "Each piece is crafted with the precision of technology and the soul of human touch - a seamless harmony between machine intelligence and human intuition.",
    },
  ];

  // Function to get frame path
  function getFramePath(index) {
    return `/home-page/frames/frame_${index.toString().padStart(4, "0")}.jpg`;
  }

  // Progressive preload images - load in batches
  function preloadImages() {
    const batchSize = 20;
    const loadedImagesArray = new Array(numFrames);
    let loadedCount = 0;

    const loadBatch = (startIndex, endIndex) => {
      const promises = [];
      for (let i = startIndex; i <= Math.min(endIndex, numFrames); i++) {
        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loadedImagesArray[i - 1] = img;
            loadedCount++;
            resolve(img);
          };
          img.onerror = reject;
          img.src = getFramePath(i);
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    };

    // Load first batch immediately
    loadBatch(1, batchSize)
      .then(() => {
        setImages([...loadedImagesArray]);
        setIsLoaded(true);

        // Progressively load remaining batches in background
        let nextBatch = batchSize + 1;
        const intervalId = setInterval(() => {
          if (nextBatch <= numFrames) {
            loadBatch(nextBatch, nextBatch + batchSize - 1)
              .then(() => {
                setImages([...loadedImagesArray]);
              })
              .catch((error) => {
                console.error(`Failed to load batch ${nextBatch}:`, error);
              });
            nextBatch += batchSize;
          } else {
            clearInterval(intervalId);
          }
        }, 300);
      })
      .catch((error) => {
        console.error("Failed to load initial images:", error);
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

            // Much slower mirror introduce fade in - very gradual
            if (mirrorIntroduceSectionRef.current) {
              // Use stronger easing function to make opacity fade much slower
              const easedOpacity = Math.pow(splitProgress, 4); // Higher power = much slower start
              mirrorIntroduceSectionRef.current.style.opacity = easedOpacity;
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-animation for Text 1 when user starts scrolling
  useEffect(() => {
    const handleScrollStart = () => {
      const scrollY = window.scrollY;
      const scrollEffectEnd = (scrollEffectHeight / 100) * window.innerHeight;

      // Check if user has scrolled into mirror introduce section
      if (scrollY > scrollEffectEnd && !hasStartedScrolling) {
        setHasStartedScrolling(true);

        // Start auto animation - only fade in and pause (not move up)
        let startTime = null;
        const duration = 400; // 0.4 second to reach pause state

        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Only animate to pause state (0.5 = shorter pause phase)
          setText1AutoProgress(Math.min(progress * 0.5, 0.5));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    };

    window.addEventListener("scroll", handleScrollStart, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollStart);
  }, [hasStartedScrolling, scrollEffectHeight]);

  // Hide arrow button when scrolled to footer (ContactUs section)
  useEffect(() => {
    const handleArrowVisibility = () => {
      const footerSection = document.querySelector(
        '[data-section="contact-us"]'
      );

      if (footerSection) {
        const rect = footerSection.getBoundingClientRect();
        const scrollY = window.scrollY;
        const footerTop = scrollY + rect.top;

        // Hide arrow when we're within 100px of footer top
        if (scrollY >= footerTop - 100) {
          setIsArrowVisible(false);
        } else {
          setIsArrowVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleArrowVisibility, { passive: true });
    handleArrowVisibility(); // Initial check

    return () => window.removeEventListener("scroll", handleArrowVisibility);
  }, []);

  // Update canvas when frame changes - only render if frame is different
  useEffect(() => {
    if (!canvasRef.current || !images.length || !isLoaded) return;

    // Skip if same frame already rendered
    if (frameIndex === lastRenderedFrameRef.current) return;

    const image = images[frameIndex];
    if (!image) return; // Image not loaded yet

    lastRenderedFrameRef.current = frameIndex;

    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d", { alpha: false });

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const scaleX = canvas.width / image.width;
      const scaleY = canvas.height / image.height;
      const scale = Math.max(scaleX, scaleY);

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    });
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
      let transform = "translateY(30%)";
      let opacity = 0;

      // Text timing logic with new animation schedule
      if (index === 0) {
        // Text 1: Hybrid animation - auto fade in + scroll-controlled move up
        if (hasStartedScrolling) {
          if (text1AutoProgress <= 0.375) {
            // Auto fade in phase (0-37.5% of auto animation) - back to longer fade in
            const fadeProgress = text1AutoProgress / 0.375;
            transform = `translateY(${(1 - fadeProgress) * 30}%)`;
            opacity = fadeProgress;
          } else if (text1AutoProgress < 0.5) {
            // Auto pause phase (25-50% of auto animation) - shorter pause
            transform = `translateY(0%)`;
            opacity = 1;
          } else {
            // Auto animation complete, now use scroll progress for move up
            if (scrollProgress <= 0.15) {
              // Stay in pause state until user scrolls more - earlier trigger
              transform = `translateY(0%)`;
              opacity = 1;
            } else {
              // Move up phase controlled by scroll (15%+) - earlier move up
              const moveProgress = Math.min((scrollProgress - 0.15) / 0.1, 1);
              transform = `translateY(${-moveProgress * 60}%)`;
              opacity = 1; // Keep full opacity, no fade
            }
          }
        } else {
          // Not started scrolling yet, hide text
          transform = `translateY(30%)`;
          opacity = 0;
        }
      } else if (index === 1) {
        // Text 2: fade in after Text 1 fade out complete (25-35%), pause (35-42%), fade out (42-52%)
        if (scrollProgress < 0.25) {
          transform = "translateY(30%)";
          opacity = 0;
        } else if (scrollProgress <= 0.35) {
          // Fade in phase (starts after Text 1 fade out completes)
          const fadeProgress = (scrollProgress - 0.25) / 0.1;
          transform = `translateY(${(1 - fadeProgress) * 30}%)`;
          opacity = fadeProgress;
        } else if (scrollProgress <= 0.42) {
          // Pause phase
          transform = `translateY(0%)`;
          opacity = 1;
        } else if (scrollProgress <= 0.52) {
          // Fade out phase
          const fadeProgress = (scrollProgress - 0.42) / 0.1;
          transform = `translateY(${-fadeProgress * 60}%)`;
          opacity = 1 - fadeProgress;
        } else {
          transform = "translateY(-60%)";
          opacity = 0;
        }
      } else if (index === 2) {
        // Text 3: fade in after Text 2 fade out complete (52-62%), pause (62-69%), fade out (69-79%)
        if (scrollProgress < 0.52) {
          transform = "translateY(30%)";
          opacity = 0;
        } else if (scrollProgress <= 0.62) {
          // Fade in phase (starts after Text 2 fade out completes)
          const fadeProgress = (scrollProgress - 0.52) / 0.1;
          transform = `translateY(${(1 - fadeProgress) * 30}%)`;
          opacity = fadeProgress;
        } else if (scrollProgress <= 0.69) {
          // Pause phase
          transform = `translateY(0%)`;
          opacity = 1;
        } else if (scrollProgress <= 0.79) {
          // Fade out phase
          const fadeProgress = (scrollProgress - 0.69) / 0.1;
          transform = `translateY(${-fadeProgress * 60}%)`;
          opacity = 1 - fadeProgress;
        } else {
          transform = "translateY(-60%)";
          opacity = 0;
        }
      } else if (index === 3) {
        // Text 4: fade in after Text 3 fade out complete (79-89%), pause (89-100%)
        if (scrollProgress < 0.79) {
          transform = "translateY(30%)";
          opacity = 0;
        } else if (scrollProgress <= 0.89) {
          // Fade in phase (starts after Text 3 fade out completes)
          const fadeProgress = (scrollProgress - 0.79) / 0.1;
          transform = `translateY(${(1 - fadeProgress) * 30}%)`;
          opacity = fadeProgress;
        } else {
          // Pause phase (no fade out, stays visible)
          transform = `translateY(0%)`;
          opacity = 1;
        }
      }

      // Staggered fade for title and subtitle
      let titleOpacity = 0;
      let titleTransform = "translateY(30%)";
      let subtitleOpacity = 0;
      let subtitleTransform = "translateY(30%)";

      // Title appears first (starts 0.02 earlier than container fade in)
      const titleProgress = Math.min(
        Math.max(
          (scrollProgress -
            (index === 0
              ? 0
              : index === 1
              ? 0.23 // Text 2 container starts at 25%, title at 23%
              : index === 2
              ? 0.5 // Text 3 container starts at 52%, title at 50%
              : 0.77)) / // Text 4 container starts at 79%, title at 77%
            0.03,
          0
        ),
        1
      );
      titleOpacity = titleProgress;
      titleTransform = `translateY(${(1 - titleProgress) * 30}%)`;

      // Subtitle appears after title (starts 0.02 later)
      const subtitleProgress = Math.min(
        Math.max(
          (scrollProgress -
            (index === 0
              ? 0.02
              : index === 1
              ? 0.27 // Text 2 title at 23%, subtitle at 27%
              : index === 2
              ? 0.54 // Text 3 title at 50%, subtitle at 54%
              : 0.81)) / // Text 4 title at 77%, subtitle at 81%
            0.03,
          0
        ),
        1
      );
      subtitleOpacity = subtitleProgress;
      subtitleTransform = `translateY(${(1 - subtitleProgress) * 30}%)`;

      return (
        <div
          key={index}
          className="text-slide"
          style={{
            transform,
            opacity:
              index === 0
                ? opacity // Text 1: Use container opacity (whole text fade out together)
                : Math.max(titleOpacity, subtitleOpacity) > 0
                ? 1
                : 0, // Other texts: Use staggered
            transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
          }}
        >
          <div
            className={`slide-content ${
              index === 0 ? "slide-content-wide" : "slide-content-narrow"
            }`}
          >
            <h1
              className="heading-1--no-margin slide-title"
              style={{
                opacity: index === 0 ? 1 : titleOpacity, // Text 1: No individual fade, Others: Staggered
                transform: index === 0 ? "translateY(0%)" : titleTransform,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
              }}
            >
              {slide.title}
              {slide.highlight && (
                <span className="slide-highlight">{slide.highlight}</span>
              )}
            </h1>
            <p
              className={
                index === 0
                  ? "heading-1--no-margin slide-subtitle"
                  : "bodytext-4--no-margin slide-subtitle"
              }
              style={{
                opacity: index === 0 ? 1 : subtitleOpacity, // Text 1: No individual fade, Others: Staggered
                transform: index === 0 ? "translateY(0%)" : subtitleTransform,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
                marginTop: index === 0 ? 0 : "24px", // Gap 24px only for slides 2, 3, 4
              }}
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
          </div>
        </div>
      </div>

      {/* Fixed Sound Button - visible except in Immersive Showroom */}
      {!isImmersiveShowroomPage && (
        <div className="fixed-sound-container">
          <SoundButton isActive={isSoundActive} onClick={handleSoundClick} />
        </div>
      )}

      {/* Fixed Arrow Button - visible except in footer */}
      {!isImmersiveShowroomPage && isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow onClick={handleArrowClick} />
        </div>
      )}

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
