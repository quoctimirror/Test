import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ArrowButton from "@components/common/button/ArrowButton";
import { MediaImage } from "@components/common/media";
import "./Section3CollectionDetail.css";

const Section3CollectionDetail = () => {
  const images = [
    "collections/collectionDetail/bong_hoa.webp",
    "collections/collectionDetail/earrings-heart.webp",
    "collections/collectionDetail/model_3.webp",
    "collections/collectionDetail/model_6.webp",
    "collections/collectionDetail/pink_diamond.webp",
    "collections/collectionDetail/product_10.webp",
    "collections/collectionDetail/product-6.webp",
    "collections/collectionDetail/product-11.webp",
    "collections/collectionDetail/product-8.webp",
    "collections/collectionDetail/product-15-opt2.webp",
    "collections/collectionDetail/product-17.webp",
    "collections/collectionDetail/product-23.webp",
    "collections/collectionDetail/uynhu._httpss.mj.runYccCkEmimOY_A_luxury_editorial_close-up_p_d2e70813-b2a6-48c4-840f-26f53cd18a22_2 copy.webp",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImage, setMainImage] = useState(images[0]);
  const carouselTrackRef = useRef(null);
  const isAnimating = useRef(false);

  // Mobile/Tablet carousel ref
  const mobileCarouselRef = useRef(null);

  useEffect(() => {
    let interval;

    const checkAndSetInterval = () => {
      // Clear existing interval if any
      if (interval) {
        clearInterval(interval);
      }

      // Check if viewport is desktop (> 1023px)
      const isDesktop = window.innerWidth > 1023;

      // Only set interval for auto-slide on desktop
      if (isDesktop) {
        interval = setInterval(() => {
          updateCarousel();
        }, 5000);
      }
    };

    // Initial check
    checkAndSetInterval();

    // Add resize listener
    window.addEventListener("resize", checkAndSetInterval);

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener("resize", checkAndSetInterval);
    };
  }, [currentIndex]);

  const updateCarousel = () => {
    if (isAnimating.current || !carouselTrackRef.current) return;

    isAnimating.current = true;
    const track = carouselTrackRef.current;
    const firstImage = track.firstElementChild;
    const imageWidth = firstImage.offsetWidth + 12; // width + gap

    // Animate sliding left
    gsap.to(track, {
      x: -imageWidth,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        // After animation, move first image to end and reset position
        track.appendChild(firstImage);
        gsap.set(track, { x: 0 });
        isAnimating.current = false;
      },
    });

    // Update main image
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setMainImage(images[nextIndex]);
  };

  const moveCarouselToIndex = (targetIndex) => {
    if (isAnimating.current || !carouselTrackRef.current || targetIndex === currentIndex) return;

    isAnimating.current = true;
    const track = carouselTrackRef.current;
    const firstImage = track.firstElementChild;
    const imageWidth = firstImage.offsetWidth + 12; // width + gap

    // Calculate how many positions to move
    const steps = targetIndex < currentIndex
      ? images.length - currentIndex + targetIndex
      : targetIndex - currentIndex;

    // Calculate total distance to move
    const totalDistance = steps * imageWidth;

    // Animate sliding left in one go
    gsap.to(track, {
      x: -totalDistance,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        // Move all passed images to the end
        for (let i = 0; i < steps; i++) {
          const firstChild = track.firstElementChild;
          track.appendChild(firstChild);
        }

        // Reset position
        gsap.set(track, { x: 0 });

        // Update current index and main image
        setCurrentIndex(targetIndex);
        setMainImage(images[targetIndex]);

        isAnimating.current = false;
      },
    });
  };

  const handleImageClick = (imageSrc, index) => {
    setMainImage(imageSrc);
    moveCarouselToIndex(index);
  };

  // Arrow handlers for mobile/tablet carousel
  const handlePrevious = (e) => {
    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    // Remove focus to prevent sticky active state
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll('img');
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;

    carousel.scrollLeft -= scrollAmount;
  };

  const handleNext = (e) => {
    const carousel = mobileCarouselRef.current;
    if (!carousel) return;

    // Remove focus to prevent sticky active state
    if (e && e.currentTarget) {
      const button = e.currentTarget.querySelector('button');
      if (button) button.blur();
      e.currentTarget.blur();
    }

    const items = carousel.querySelectorAll('img');
    if (!items.length) return;

    const itemWidth = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    const scrollAmount = itemWidth + gap;

    carousel.scrollLeft += scrollAmount;
  };

  return (
    <div className="section3-collection-detail" data-navbar-theme="white">
      <div className="gallery-container">
        <div className="main-display">
          <MediaImage src={mainImage} alt="Main display" />
        </div>
        <div className="carousel-wrapper">
          <ArrowButton
            direction="left"
            className="collection-slider-arrow collection-slider-arrow-left"
            onClick={handlePrevious}
            ariaLabel="Previous image"
          />

          <div className="carousel" ref={mobileCarouselRef}>
            <div className="carousel-track" ref={carouselTrackRef}>
              {images.map((image, index) => (
                <MediaImage
                  key={index}
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className={currentIndex === index ? "active" : ""}
                  onClick={() => handleImageClick(image, index)}
                />
              ))}
            </div>
          </div>

          <ArrowButton
            direction="right"
            className="collection-slider-arrow collection-slider-arrow-right"
            onClick={handleNext}
            ariaLabel="Next image"
          />
        </div>
      </div>
    </div>
  );
};

export default Section3CollectionDetail;
