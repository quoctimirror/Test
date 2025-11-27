import React, { useEffect, useRef } from "react";
import "./MirrorNetworkV2.css";
import "@styles/grid-system.css";
import ArrowButton from "@components/common/button/ArrowButton";
import MediaImage from "@components/common/media/MediaImage";

const MirrorNetworkV2 = () => {
  // Carousel refs
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isLooping = useRef(false);
  const targetScrollLeft = useRef(0);
  const animationFrameId = useRef(null);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const isArrowScrolling = useRef(false);

  const headerText = "THE MIRROR NETWORK";
  const titleText = "A LIVING SYSTEM OF MODERN LUXURY";
  const descriptionText =
    "Mirror is not a place - it's a presence.\nOur Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal - amplifying presence, creativity, and connection.\n\nWe collaborate with artists, hotels, creators, and technologists to make luxury fluid - flowing through Sense, Time, Space, and Presence.";

  // Carousel images - duplicate for infinite loop
  const carouselImages = [
    { src: "about/network-section/Art gallery.png", alt: "Art Gallery" },
    { src: "about/network-section/Enscape_2025-10-09-10-15-51.png", alt: "Enscape 1" },
    { src: "about/network-section/Enscape_2025-10-09-10-21-27.png", alt: "Enscape 2" },
    { src: "about/network-section/Gym.png", alt: "Gym" },
    { src: "about/network-section/Hotel lobby.png", alt: "Hotel Lobby" },
    { src: "about/network-section/Restaurants_01.png", alt: "Restaurant 1" },
    { src: "about/network-section/Restaurants_02.png", alt: "Restaurant 2" },
    { src: "about/network-section/Spa.png", alt: "Spa" },
  ];

  // Carousel drag-to-scroll functionality with infinite loop
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const smoothScroll = () => {
      const current = carousel.scrollLeft;
      const target = targetScrollLeft.current;
      const diff = target - current;

      if (isDragging.current) {
        if (Math.abs(diff) > 0.1) {
          carousel.scrollLeft = current + diff * 0.25;
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          carousel.scrollLeft = target;
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        }
      } else {
        if (Math.abs(velocity.current) > 0.5) {
          carousel.scrollLeft = current + velocity.current;
          velocity.current *= 0.94;
          animationFrameId.current = requestAnimationFrame(smoothScroll);
        } else {
          velocity.current = 0;
          if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
          }
          checkLoop();
        }
      }
    };

    const handleMouseDown = (e) => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      isDragging.current = true;
      carousel.style.cursor = "grabbing";
      carousel.style.scrollBehavior = "auto";
      startX.current = e.pageX;
      scrollLeft.current = carousel.scrollLeft;
      targetScrollLeft.current = carousel.scrollLeft;
      velocity.current = 0;
      lastX.current = e.pageX;
      lastTime.current = Date.now();

      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseLeave = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      carousel.style.cursor = "grab";
      targetScrollLeft.current = carousel.scrollLeft;
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      carousel.style.cursor = "grab";
      targetScrollLeft.current = carousel.scrollLeft;
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();

      const currentX = e.pageX;
      const currentTime = Date.now();
      const deltaX = currentX - lastX.current;
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime > 0) {
        velocity.current = -(deltaX / deltaTime) * 8;
      }

      const walk = (currentX - startX.current) * 1.2;
      targetScrollLeft.current = scrollLeft.current - walk;

      lastX.current = currentX;
      lastTime.current = currentTime;
    };

    const checkLoop = () => {
      if (isLooping.current || isDragging.current) return;

      const scrollWidth = carousel.scrollWidth;
      const currentScroll = carousel.scrollLeft;
      const clientWidth = carousel.clientWidth;

      const items = carousel.querySelectorAll(".network-carousel-item");
      if (!items.length) return;

      const itemWidth = items[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      const itemWithGap = itemWidth + gap;
      const setSize = itemWithGap * 8; // 8 items per set
      const threshold = setSize * 2;

      if (currentScroll < threshold) {
        isLooping.current = true;
        velocity.current = 0;
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = currentScroll + setSize * 3;
        targetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLooping.current = false;
        }, 50);
        return;
      }

      const maxScroll = scrollWidth - clientWidth;
      if (currentScroll > maxScroll - threshold) {
        isLooping.current = true;
        velocity.current = 0;
        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = currentScroll - setSize * 3;
        targetScrollLeft.current = carousel.scrollLeft;
        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
          isLooping.current = false;
        }, 50);
        return;
      }
    };

    const handleScroll = () => {
      if (
        !isDragging.current &&
        !isLooping.current &&
        !isArrowScrolling.current
      ) {
        checkLoop();
      }
    };

    carousel.addEventListener("mousedown", handleMouseDown);
    carousel.addEventListener("mouseleave", handleMouseLeave);
    carousel.addEventListener("mouseup", handleMouseUp);
    carousel.addEventListener("mousemove", handleMouseMove);
    carousel.addEventListener("scroll", handleScroll);

    // Set initial position in the middle for bidirectional scrolling
    setTimeout(() => {
      const items = carousel.querySelectorAll(".network-carousel-item");
      if (items.length) {
        const itemWidth = items[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
        const setSize = (itemWidth + gap) * 8;

        carousel.style.scrollBehavior = "auto";

        // Center an image in the middle of carousel
        const screenWidth = window.innerWidth;
        // Get actual position of a middle image
        const targetIndex = 40; // Middle of 80 items (10 sets * 8 images)
        const targetItem = items[targetIndex];
        // Offset as percentage of screen width (adjust this value to center)
        const offsetPercent = 25; // 25% of screen width
        carousel.scrollLeft = targetItem.offsetLeft - (screenWidth * offsetPercent / 100);

        velocity.current = 0;
        isDragging.current = false;
        isLooping.current = false;
        isArrowScrolling.current = false;
        targetScrollLeft.current = carousel.scrollLeft;

        setTimeout(() => {
          carousel.style.scrollBehavior = "smooth";
        }, 50);
      }
    }, 100);

    return () => {
      carousel.removeEventListener("mousedown", handleMouseDown);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
      carousel.removeEventListener("mouseup", handleMouseUp);
      carousel.removeEventListener("mousemove", handleMouseMove);
      carousel.removeEventListener("scroll", handleScroll);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Arrow navigation handlers
  const handlePrevious = (e) => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector("button");
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".network-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 8;
    const threshold = setSize * 2.5;

    isArrowScrolling.current = true;

    const currentScroll = carousel.scrollLeft;

    if (currentScroll - scrollAmount < threshold) {
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll + setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft -= scrollAmount;
        setTimeout(() => {
          isArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft -= scrollAmount;
      setTimeout(() => {
        isArrowScrolling.current = false;
      }, 400);
    }
  };

  const handleNext = (e) => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector("button");
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll(".network-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 8;
    const threshold = setSize * 2.5;

    isArrowScrolling.current = true;

    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (currentScroll + scrollAmount > maxScroll - threshold) {
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = currentScroll - setSize * 3;
      setTimeout(() => {
        carousel.style.scrollBehavior = "smooth";
        carousel.scrollLeft += scrollAmount;
        setTimeout(() => {
          isArrowScrolling.current = false;
        }, 400);
      }, 50);
    } else {
      carousel.style.scrollBehavior = "smooth";
      carousel.scrollLeft += scrollAmount;
      setTimeout(() => {
        isArrowScrolling.current = false;
      }, 400);
    }
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
      <div className="network-v2-carousel-wrapper">
        <ArrowButton
          direction="left"
          className="network-v2-slider-arrow network-v2-slider-arrow-left"
          onClick={handlePrevious}
          ariaLabel="Previous image"
        />

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

        <ArrowButton
          direction="right"
          className="network-v2-slider-arrow network-v2-slider-arrow-right"
          onClick={handleNext}
          ariaLabel="Next image"
        />
      </div>
    </section>
  );
};

export default MirrorNetworkV2;
