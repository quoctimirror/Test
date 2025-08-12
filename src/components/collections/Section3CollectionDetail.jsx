import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "./Section3CollectionDetail.css";

const Section3CollectionDetail = () => {
  const images = [
    "/collections/collectionDetail/collectionDetail_1.gif",
    "/collections/collectionDetail/collectionDetail_2.png",
    "/collections/collectionDetail/collectionDetail_3.gif",
    "/collections/collectionDetail/collectionDetail_4.png",
    "/collections/collectionDetail/collectionDetail_5.png",
    "/collections/collectionDetail/collectionDetail_6.png",
    "/collections/collectionDetail/collectionDetail_7.png",
    "/collections/collectionDetail/collectionDetail_8.png",
    "/collections/collectionDetail/collectionDetail_9.png",
    "/collections/collectionDetail/collectionDetail_10.png"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImage, setMainImage] = useState(images[0]);
  const carouselTrackRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCarousel();
    }, 5000);

    return () => clearInterval(interval);
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
      }
    });
    
    // Update main image
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setMainImage(images[nextIndex]);
  };

  const handleImageClick = (imageSrc, index) => {
    setMainImage(imageSrc);
    setCurrentIndex(index);
  };

  return (
    <div className="section3-collection-detail">
      <div className="gallery-container">
        <div className="main-display">
          <img src={mainImage} alt="Main display" />
        </div>
        <div className="carousel-wrapper">
          <div className="carousel">
            <div className="carousel-track" ref={carouselTrackRef}>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className={currentIndex === index ? "active" : ""}
                  onClick={() => handleImageClick(image, index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section3CollectionDetail;