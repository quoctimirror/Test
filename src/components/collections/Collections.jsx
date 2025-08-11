// Thêm 'useState', 'useRef' từ React
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CollectionHeroSection from "./CollectionHeroSection";
import GlassButton from '../common/GlassButton';
import "./Collections.css";

const products = [
  {
    id: 1,
    title: "AURORA",
    image: "/collections/pendant.png",
    description:
      "More than a ring, AURORA is a \ncelebration of light, geometry, and the \nfuture you're building together.",
  },
  {
    id: 2,
    title: "SOLARIS",
    image: "/collections/ring1.png",
    description:
      "A testament to the sun's eternal brilliance, \ncaptured in a timeless design that radiates \nwarmth and elegance.",
  },
  {
    id: 3,
    title: "LUNA",
    image: "/collections/earings.png",
    description:
      "Capturing the serene glow of the moonlight, \nLUNA reflects a story of mystique and \nprofound beauty.",
  },
];

function Collection({ collectionId = "treasure-of-the-orient" }) {
  const section2Ref = useRef(null);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScrollToSection2 = () => {
    section2Ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // MỚI: Hàm handleNext được đơn giản hóa tối đa
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  // MỚI: Hàm handlePrevious được đơn giản hóa tối đa
  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + products.length) % products.length
    );
  };

  const currentProduct = products[currentIndex];

  const handleExploreCollection = () => {
    navigate(`/collections/${collectionId}`);
  };

  return (
    <div className="collection-page">
      {/* --- SECTION 1 --- */}
      <CollectionHeroSection onScrollToSection2={handleScrollToSection2} />

      {/* --- SECTION 2 --- */}
      <div className="section-2" ref={section2Ref}>
        <div className="collection-hero-content">
          <div className="collection-hero-subtitle">THE NEWEST COLLECTION</div>
          <div className="collection-hero-title">
            <div className="text-treasure">TREASURE OF THE ORIENT</div>
          </div>
          <div className="collection-hero-description">
            Step into a world where ancient splendor meets modern elegance. The
            <br />
            <strong>TREASURE OF THE ORIENT</strong> collection draws inspiration
            from the rich cultural
            <br />
            heritage, vibrant artistry, and timeless mystique of the East.
          </div>
          <GlassButton
            width={221}
            height={57}
            theme="white"
            onClick={handleExploreCollection}
            className="collection-hero-explore-button"
          >
            Explore this collection
          </GlassButton>
        </div>

        <div className="collection-content-panel full-width">
          <div className="product-slider">
            <div className="slider-main-row">
              <button
                className="slider-arrow"
                aria-label="Previous Product"
                onClick={handlePrevious}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23.75 15L6.25 15M6.25 15L13.75 7.5M6.25 15L13.75 22.5"
                    stroke="#797979"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </button>

              {/* MỚI: Áp dụng class 'slide-effect' và quan trọng nhất là 'key' */}
              <div
                className="product-image-container slide-effect"
                key={currentProduct.id}
              >
                <img
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  className="product-image"
                />
              </div>

              <button
                className="slider-arrow"
                aria-label="Next Product"
                onClick={handleNext}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.25 15L23.75 15M23.75 15L16.25 22.5M23.75 15L16.25 7.5"
                    stroke="#797979"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </button>
            </div>

            {/* MỚI: Áp dụng tương tự cho phần thông tin sản phẩm */}
            <div
              className="product-info slide-effect"
              key={currentProduct.id + "-info"}
            >
              <h2 className="product-title">{currentProduct.title}</h2>
              <button className="shop-now-button">
                <span className="hover-underline">Shop now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 3 --- */}
      <div className="section-3">
        <div className="other-collections-content">
          <div className="other-collections-subtitle">OTHER COLLECTION</div>
          <div className="collection-names">
            <div className="collection-name">Whispers of Kyoto</div>
            <div className="collection-name">Ocean's Embrace</div>
            <div className="collection-name">Nile Reverie</div>
            <div className="collection-name">Byzantine Bloom</div>
            <div className="collection-name">Sands of Samarkand</div>
            <div className="collection-name">Echoes of Eternity</div>
            <div className="collection-name">The Alchemist's Touch</div>
            <div className="collection-name">Lunar Veil</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collection;
