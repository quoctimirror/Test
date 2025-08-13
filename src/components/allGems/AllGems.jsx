import React from "react";
import GlassButton from "../common/GlassButton";
import "./AllGems.css";

const AllGems = () => {
  const productCards = Array(24).fill("/products/allGems/product_card_1.svg");
  const modelImage = "/products/allGems/model_1.svg";

  return (
    <div className="all-gems-page">
      <div className="gems-header">
        <h1 className="gems-title heading-1">OUR GEMS</h1>
        <p className="gems-subtitle bodytext-3">
          Mirror invites you to step into the era of personalized luxury. Each
          piece is a reflection of your unique style and a signpost to endless
          possibilities. Every gem has a story, and that story awaits your
          personal touch to shine.
        </p>
      </div>

      <div className="gems-grid-container">
        {/* First row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(0, 4).map((src, index) => (
            <div key={`row1-${index}`} className="gem-item">
              <img src={src} alt={`Gem ${index + 1}`} />
              <span className="gem-label heading-3">Lumina</span>
            </div>
          ))}
        </div>

        {/* Second row - 3 columns (2 columns with 2x2 grid + 1 large) */}
        <div className="gems-row gems-row-3-special">
          <div className="gem-grid-2x2">
            {productCards.slice(4, 8).map((src, index) => (
              <div key={`row2-${index}`} className="gem-item">
                <img src={src} alt={`Gem ${index + 5}`} />
                <span className="gem-label heading-3">Lumina</span>
              </div>
            ))}
          </div>
          <div className="gem-item gem-item-large">
            <img src={modelImage} alt="Model showcase" />
          </div>
        </div>

        {/* Third row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(8, 12).map((src, index) => (
            <div key={`row3-${index}`} className="gem-item">
              <img src={src} alt={`Gem ${index + 9}`} />
              <span className="gem-label heading-3">Lumina</span>
            </div>
          ))}
        </div>

        {/* Fourth row - 3 columns (1 large + 2 columns with 2x2 grid) */}
        <div className="gems-row gems-row-3-reverse-special">
          <div className="gem-item gem-item-large">
            <img src={modelImage} alt="Model showcase" />
          </div>
          <div className="gem-grid-2x2">
            {productCards.slice(12, 16).map((src, index) => (
              <div key={`row4-${index}`} className="gem-item">
                <img src={src} alt={`Gem ${index + 13}`} />
                <span className="gem-label heading-3">Lumina</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fifth row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(16, 20).map((src, index) => (
            <div key={`row5-${index}`} className="gem-item">
              <img src={src} alt={`Gem ${index + 17}`} />
              <span className="gem-label heading-3">Lumina</span>
            </div>
          ))}
        </div>

        {/* Sixth row - 4 items */}
        <div className="gems-row gems-row-4">
          {productCards.slice(20, 24).map((src, index) => (
            <div key={`row6-${index}`} className="gem-item">
              <img src={src} alt={`Gem ${index + 21}`} />
              <span className="gem-label heading-3">Lumina</span>
            </div>
          ))}
        </div>
      </div>

      <div className="gems-footer">
        <GlassButton theme="default" width={190} height={57} fontSize={14}>
          View more
        </GlassButton>
      </div>
    </div>
  );
};

export default AllGems;
