import React, { useEffect, useRef } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { MediaImage } from "@components/common/media";
import ProductCarouselItem from "@components/collections/ProductCarouselItem";
import "./AllGems.css";

const AllGems = () => {
  const largeItem1Ref = useRef(null);
  const largeItem2Ref = useRef(null);

  // Parallax effect for large items
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      [largeItem1Ref, largeItem2Ref].forEach((ref) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const scrollDistance = windowHeight - rect.top;
        const totalDistance = windowHeight + rect.height;
        const scrollRatio = Math.max(0, Math.min(1, scrollDistance / totalDistance));

        // Image moves DOWN slowly (0% → 30%)
        const imgParallax = scrollRatio * 30;

        ref.current.style.setProperty("--parallax-img-offset", `${imgParallax}%`);
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Each gem has multiple images for carousel
  const gemImages = [
    "products/allGems/product_card_1.webp",
    "products/allGems/product_card_1.webp",
    "products/allGems/product_card_1.webp",
  ];
  const productCards = Array(24).fill(gemImages);
  const modelImage1 = "products/allGems/earrings-heart.webp";
  const modelImage2 = "products/allGems/flower.webp";

  return (
    <div className="all-gems-page">
      <div
        className="gems-header"
        data-navbar-theme="white"
        data-navbar-theme-mobile="black"
        data-navbar-theme-tablet="black"
      >
        <p className="gems-explore bodytext-4--no-margin">EXPLORE</p>
        <h1 className="gems-title heading-1--no-margin">OUR GEMS</h1>
        <p className="gems-subtitle bodytext-4--no-margin">
          Mirror invites you to step into the era of personalized luxury. Each
          piece is a reflection of your unique style and a signpost to endless
          possibilities. Every gem has a story, and that story awaits your
          personal touch to shine.
        </p>
      </div>

      <div className="gems-grid-container" data-navbar-theme="black">
        {/* First row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(0, 4).map((images, index) => (
            <ProductCarouselItem
              key={`row1-${index}`}
              images={images}
              label="Lumina"
              className="gem-item"
            />
          ))}
        </div>

        {/* Second row - 3 columns (2 columns with 2x2 grid + 1 large) */}
        <div className="gems-row gems-row-3-special">
          <div className="gem-grid-2x2">
            {productCards.slice(4, 8).map((images, index) => (
              <ProductCarouselItem
                key={`row2-${index}`}
                images={images}
                label="Lumina"
                className="gem-item"
              />
            ))}
          </div>
          <div ref={largeItem1Ref} className="gem-item gem-item-large">
            <MediaImage src={modelImage1} alt="Model showcase 1" />
          </div>
        </div>

        {/* Third row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(8, 12).map((images, index) => (
            <ProductCarouselItem
              key={`row3-${index}`}
              images={images}
              label="Lumina"
              className="gem-item"
            />
          ))}
        </div>

        {/* Fourth row - 3 columns (1 large + 2 columns with 2x2 grid) */}
        <div className="gems-row gems-row-3-reverse-special">
          <div ref={largeItem2Ref} className="gem-item gem-item-large">
            <MediaImage src={modelImage2} alt="Model showcase 2" />
          </div>
          <div className="gem-grid-2x2">
            {productCards.slice(12, 16).map((images, index) => (
              <ProductCarouselItem
                key={`row4-${index}`}
                images={images}
                label="Lumina"
                className="gem-item"
              />
            ))}
          </div>
        </div>

        {/* Fifth row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(16, 20).map((images, index) => (
            <ProductCarouselItem
              key={`row5-${index}`}
              images={images}
              label="Lumina"
              className="gem-item"
            />
          ))}
        </div>

        {/* Sixth row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(20, 24).map((images, index) => (
            <ProductCarouselItem
              key={`row6-${index}`}
              images={images}
              label="Lumina"
              className="gem-item"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllGems;
