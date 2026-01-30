import React, { useEffect, useRef } from "react";
import { MediaImage } from "@components/common/media";
import "./Section3.css";
import ArrowButton from "@components/common/button/ArrowButton";

const Section3 = () => {
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

      const items = carousel.querySelectorAll(".pv2-section3-carousel-item");
      if (!items.length) return;

      const itemWidth = items[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      const itemWithGap = itemWidth + gap;
      const setSize = itemWithGap * 3; // 3 items per set
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

    setTimeout(() => {
      const items = carousel.querySelectorAll(".pv2-section3-carousel-item");
      if (items.length) {
        const itemWidth = items[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
        const setSize = (itemWidth + gap) * 3;

        carousel.style.scrollBehavior = "auto";
        carousel.scrollLeft = setSize * 5;

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
  const handlePrevious = () => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    const items = carousel.querySelectorAll(".pv2-section3-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 3;
    const threshold = setSize * 2.5;

    isArrowScrolling.current = true;

    const currentScroll = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;

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

  const handleNext = () => {
    const carousel = carouselRef.current;
    if (!carousel || isArrowScrolling.current) return;

    const items = carousel.querySelectorAll(".pv2-section3-carousel-item");
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;
    const setSize = scrollAmount * 3;
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
    <section className="pv2-section3-container">
      <div className="pv2-section3-wrapper">
        {/* Large Image Carousel */}
        <div className="pv2-section3-carousel-wrapper">
          <ArrowButton
            direction="left"
            className="pv2-section3-slider-arrow pv2-section3-slider-arrow-left"
            onClick={handlePrevious}
            ariaLabel="Previous image"
          />

          <div className="pv2-section3-carousel-container" ref={carouselRef}>
            {/* Duplicate 10 times for larger buffer for arrow scrolling */}
            {[...Array(10)].map((_, setIndex) => (
              <React.Fragment key={setIndex}>
                <div className="pv2-section3-carousel-item">
                  <MediaImage
                    src="products/placeholder1.webp"
                    alt="Product Image 1"
                  />
                </div>
                <div className="pv2-section3-carousel-item">
                  <MediaImage
                    src="products/placeholder2.webp"
                    alt="Product Image 2"
                  />
                </div>
                <div className="pv2-section3-carousel-item">
                  <MediaImage
                    src="products/placeholder3.webp"
                    alt="Product Image 3"
                  />
                </div>
                <div className="pv2-section3-carousel-item">
                  <MediaImage
                    src="products/placeholder4.webp"
                    alt="Product Image 4"
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          <ArrowButton
            direction="right"
            className="pv2-section3-slider-arrow pv2-section3-slider-arrow-right"
            onClick={handleNext}
            ariaLabel="Next image"
          />
        </div>
      </div>
    </section>
  );
};

export default Section3;
