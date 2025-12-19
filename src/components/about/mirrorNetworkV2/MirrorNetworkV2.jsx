import React, { useEffect, useRef, useState } from "react";
import "./MirrorNetworkV2.css";
import "@styles/grid-system.css";
import MediaImage from "@components/common/media/MediaImage";
import ArrowButton from "@components/common/button/ArrowButton";

const MirrorNetworkV2 = () => {
  // Carousel refs
  const carouselRef = useRef(null);
  const wrapperRef = useRef(null);
  const isLooping = useRef(false);

  // Arrow navigation refs
  const arrowTargetScroll = useRef(0);
  const arrowAnimationId = useRef(null);
  const isArrowAnimating = useRef(false);

  // Cursor follower state
  const [cursorState, setCursorState] = useState({
    x: 0,
    y: 0,
    direction: null, // 'left' | 'right' | null
    visible: false,
    isLeaving: false, // For zoom-out animation
    isClicking: false, // For click state
  });
  const hideTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 }); // Track last mouse position for scroll detection

  const headerText = "THE MIRROR NETWORK";
  const titleText = "A LIVING SYSTEM OF MODERN LUXURY";
  const descriptionText =
    "Mirror is not a place - it's a presence.\nOur Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal - amplifying presence, creativity, and connection.\n\nWe collaborate with artists, hotels, creators, and technologists to make luxury fluid - flowing through Sense, Time, Space, and Presence.";

  // Carousel images - duplicate for infinite loop
  const carouselImages = [
    { src: "about/network-section/Art gallery.webp", alt: "Art Gallery" },
    { src: "about/network-section/Enscape_2025-10-09-10-15-51.webp", alt: "Enscape 1" },
    { src: "about/network-section/Enscape_2025-10-09-10-21-27.webp", alt: "Enscape 2" },
    { src: "about/network-section/Gym.webp", alt: "Gym" },
    { src: "about/network-section/Hotel lobby.webp", alt: "Hotel Lobby" },
    { src: "about/network-section/Restaurants_01.webp", alt: "Restaurant 1" },
    { src: "about/network-section/Restaurants_02.webp", alt: "Restaurant 2" },
    { src: "about/network-section/Spa.webp", alt: "Spa" },
  ];

  // Carousel initialization - no drag, only arrow navigation
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Prevent horizontal wheel/trackpad scrolling but allow vertical page scroll
    const preventHorizontalWheel = (e) => {
      // Only prevent if it's primarily a horizontal scroll attempt
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
      // Vertical scroll (deltaY) passes through to allow page scrolling
    };

    carousel.addEventListener("wheel", preventHorizontalWheel, { passive: false });

    // Set initial position in the middle for bidirectional scrolling
    setTimeout(() => {
      const items = carousel.querySelectorAll(".network-carousel-item");
      if (items.length) {
        carousel.style.scrollBehavior = "auto";

        // Center an image in the middle of carousel
        const screenWidth = window.innerWidth;
        // Get actual position of a middle image
        const targetIndex = 40; // Middle of 80 items (10 sets * 8 images)
        const targetItem = items[targetIndex];
        // Offset as percentage of screen width (adjust this value to center)
        const offsetPercent = 25; // 25% of screen width
        carousel.scrollLeft = targetItem.offsetLeft - (screenWidth * offsetPercent / 100);

        isLooping.current = false;
        arrowTargetScroll.current = carousel.scrollLeft;
      }
    }, 100);

    return () => {
      carousel.removeEventListener("wheel", preventHorizontalWheel);
      if (arrowAnimationId.current) {
        cancelAnimationFrame(arrowAnimationId.current);
      }
    };
  }, []);

  // Cursor follower effect
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Check if device supports hover (not touch device)
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return;

    // Check if mouse is within wrapper bounds
    const isWithinBounds = (e) => {
      const rect = wrapper.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    };

    // Hide cursor with zoom-out animation
    const hideCursor = () => {
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Start leaving animation
      setCursorState(prev => ({ ...prev, isLeaving: true }));

      // Remove after animation completes
      hideTimeoutRef.current = setTimeout(() => {
        setCursorState(prev => ({ ...prev, visible: false, isLeaving: false }));
        // Restore normal cursor
        wrapper.classList.remove('cursor-hidden');
      }, 150); // Match zoom-out animation duration
    };

    // Show cursor (cancel any pending hide)
    const showCursor = (x, y, direction) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Hide native cursor
      wrapper.classList.add('cursor-hidden');

      setCursorState({
        x,
        y,
        direction,
        visible: true,
        isLeaving: false,
      });
    };

    // Global mouse move handler - track everywhere
    const handleGlobalMouseMove = (e) => {
      // Store last mouse position
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Check if within wrapper bounds
      if (!isWithinBounds(e)) {
        if (cursorState.visible && !cursorState.isLeaving) {
          hideCursor();
        }
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const midpoint = rect.width / 2;
      const direction = x < midpoint ? "left" : "right";

      showCursor(e.clientX, e.clientY, direction);
    };

    // Handle scroll - re-check bounds with last known mouse position
    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const { x: mouseX, y: mouseY } = lastMousePos.current;

      // Check if last known mouse position is still within wrapper bounds
      const withinBounds = (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );

      if (withinBounds) {
        // Still within bounds - update cursor position and direction
        const x = mouseX - rect.left;
        const midpoint = rect.width / 2;
        const direction = x < midpoint ? "left" : "right";
        showCursor(mouseX, mouseY, direction);
      } else {
        // Outside bounds - hide cursor
        if (cursorState.visible && !cursorState.isLeaving) {
          hideCursor();
        }
      }
    };

    const handleMouseDown = (e) => {
      if (!isWithinBounds(e)) return;

      // Show click state immediately (before drag starts)
      setCursorState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = (e) => {
      if (!isWithinBounds(e)) {
        setCursorState(prev => ({ ...prev, isClicking: false }));
        return;
      }

      // Clear any existing click timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Reset click state after short delay
      clickTimeoutRef.current = setTimeout(() => {
        setCursorState(prev => ({ ...prev, isClicking: false }));
      }, 150);

      // Navigate based on click position
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const midpoint = rect.width / 2;

      if (x < midpoint) {
        handlePrevious();
      } else {
        handleNext();
      }
    };

    // Listen on document for better tracking
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      // Restore normal cursor on cleanup
      wrapper.classList.remove('cursor-hidden');
    };
  }, [cursorState.visible, cursorState.isLeaving]);

  // Custom smooth scroll animation for arrow navigation
  const animateArrowScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const current = carousel.scrollLeft;
    const target = arrowTargetScroll.current;
    const diff = target - current;

    // Easing factor - higher = faster
    const easing = 0.12;
    const threshold = 1;

    if (Math.abs(diff) > threshold) {
      carousel.scrollLeft = current + diff * easing;
      arrowAnimationId.current = requestAnimationFrame(animateArrowScroll);
    } else {
      // Snap to target
      carousel.scrollLeft = target;
      isArrowAnimating.current = false;
      arrowAnimationId.current = null;

      // Check for loop after animation completes
      checkArrowLoop();
    }
  };

  // Check and handle loop for arrow navigation
  const checkArrowLoop = () => {
    const carousel = carouselRef.current;
    if (!carousel || isLooping.current) return;

    const items = carousel.querySelectorAll(".network-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const setSize = (itemWidth + gap) * 8;
    const threshold = setSize * 2;

    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (currentScroll < threshold) {
      isLooping.current = true;
      carousel.scrollLeft = currentScroll + setSize * 3;
      arrowTargetScroll.current = carousel.scrollLeft;
      setTimeout(() => {
        isLooping.current = false;
      }, 50);
    } else if (currentScroll > maxScroll - threshold) {
      isLooping.current = true;
      carousel.scrollLeft = currentScroll - setSize * 3;
      arrowTargetScroll.current = carousel.scrollLeft;
      setTimeout(() => {
        isLooping.current = false;
      }, 50);
    }
  };

  // Start or update arrow scroll animation
  const startArrowScroll = (delta) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Initialize target from current position if not animating
    if (!isArrowAnimating.current) {
      arrowTargetScroll.current = carousel.scrollLeft;
    }

    // Accumulate the scroll delta
    arrowTargetScroll.current += delta;

    // Start animation if not already running
    if (!isArrowAnimating.current) {
      isArrowAnimating.current = true;
      carousel.style.scrollBehavior = "auto";
      arrowAnimationId.current = requestAnimationFrame(animateArrowScroll);
    }
  };

  // Arrow navigation handlers - allow rapid clicking
  const handlePrevious = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const items = carousel.querySelectorAll(".network-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;

    startArrowScroll(-scrollAmount);
  };

  const handleNext = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const items = carousel.querySelectorAll(".network-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;

    startArrowScroll(scrollAmount);
  };

  return (
    <section className="mirror-network-v2-section">
      {/* Content */}
      <div className="network-v2-content">
        <div className="network-v2-header">
          <p className="bodytext-4--no-margin">{headerText}</p>
        </div>

        <div className="network-v2-title">
          <h1 className="heading-1--no-margin">{titleText}</h1>
        </div>

        <div className="network-v2-description">
          <p className="bodytext-4--no-margin">
            {descriptionText.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < descriptionText.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div className="network-v2-carousel-wrapper" ref={wrapperRef}>
        {/* Cursor follower arrow button */}
        {cursorState.visible && cursorState.direction && (
          <div
            key={cursorState.direction} /* Re-mount on direction change for zoom animation */
            className={`network-v2-cursor-follower ${cursorState.isLeaving ? 'zoom-out' : ''} ${cursorState.isClicking ? 'is-clicking' : ''}`}
            style={{
              left: cursorState.x,
              top: cursorState.y,
            }}
          >
            <ArrowButton
              direction={cursorState.direction}
              ariaLabel={cursorState.direction === "left" ? "Previous" : "Next"}
            />
          </div>
        )}

        <div className="network-v2-carousel-container" ref={carouselRef}>
          {/* Duplicate 10 times for infinite loop buffer */}
          {[...Array(10)].map((_, setIndex) => (
            <React.Fragment key={setIndex}>
              {carouselImages.map((image, imgIndex) => (
                <div
                  key={`${setIndex}-${imgIndex}`}
                  className="network-carousel-item"
                >
                  <MediaImage src={image.src} alt={image.alt} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MirrorNetworkV2;
