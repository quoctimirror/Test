// ============================================================= //
//                    SensesOverlay.jsx (UPDATED)                //
// ============================================================= //
import React, { useState } from "react";
import BaseOverlay from "./BaseOverlay";
import "./SensesOverlay.css";

const SensesOverlay = ({ isActive, overlayStyle, onClose }) => {
  const [activeSense, setActiveSense] = useState(null);

  const senseData = {
    sight: (
      <>
        The dance of light through faceted stones,
        <br />
        the glow of Viva Magenta reflecting off mirrored surfaces.
        <br />
        Each display is a painting.
        <br />
        Each showroom, a moving gallery
      </>
    ),
    touch: (
      <>
        The weight of gold,the chill of glass,
        <br />
        the softness of velvet beneath your fingers.
        <br />
        Every texture, a whisper of refinement.
      </>
    ),
    scent: (
      <>
        Our signature fragrance lingers in the air.
        <br />
        A memory waiting to be written.
        <br />
        Candles, co-creations, and collaborations
        <br /> - designed to be felt through breath.
      </>
    ),
    sound: (
      <>
        Curated melodies.
        <br />
        Ambient echoes that ground you in the now.
        <br />
        The hum of craftsmanship, the pulse of elegance.
      </>
    ),
    taste: (
      <>
        Not in food, but in aftertaste.
        <br />
        The lingering feeling of a moment made beautiful.
      </>
    ),
  };

  const handleSenseInteraction = (senseType) => {
    // On mobile/tablet, click to toggle
    if (window.innerWidth <= 1024) {
      setActiveSense(activeSense === senseType ? null : senseType);
    }
  };

  const handleMouseEnter = (senseType) => {
    // On desktop, hover to show
    if (window.innerWidth > 1024) {
      setActiveSense(senseType);
    }
  };

  const handleMouseLeave = () => {
    // On desktop, hover out to hide
    if (window.innerWidth > 1024) {
      setActiveSense(null);
    }
  };

  return (
    <BaseOverlay
      isActive={isActive}
      overlayStyle={overlayStyle}
      onClose={onClose}
      customClassName="senses-overlay"
      disableDefaultClose={true}
      closeOnMouseLeave={true}
    >
      <div className="senses-content-wrapper">
        <div className="senses-container">
          <div
            className="sense-item sense-sight"
            onClick={() => handleSenseInteraction("sight")}
            onMouseEnter={() => handleMouseEnter("sight")}
            onMouseLeave={handleMouseLeave}
          >
            Sight
            {activeSense === "sight" && (
              <div className="sense-tooltip">{senseData.sight}</div>
            )}
          </div>
          <div
            className="sense-item sense-touch"
            onClick={() => handleSenseInteraction("touch")}
            onMouseEnter={() => handleMouseEnter("touch")}
            onMouseLeave={handleMouseLeave}
          >
            Touch
            {activeSense === "touch" && (
              <div className="sense-tooltip">{senseData.touch}</div>
            )}
          </div>
          <div className="senses-title">Senses</div>
          <div
            className="sense-item sense-scent"
            onClick={() => handleSenseInteraction("scent")}
            onMouseEnter={() => handleMouseEnter("scent")}
            onMouseLeave={handleMouseLeave}
          >
            Scent
            {activeSense === "scent" && (
              <div className="sense-tooltip">{senseData.scent}</div>
            )}
          </div>
          <div
            className="sense-item sense-sound"
            onClick={() => handleSenseInteraction("sound")}
            onMouseEnter={() => handleMouseEnter("sound")}
            onMouseLeave={handleMouseLeave}
          >
            Sound
            {activeSense === "sound" && (
              <div className="sense-tooltip">{senseData.sound}</div>
            )}
          </div>
          <div
            className="sense-item sense-taste"
            onClick={() => handleSenseInteraction("taste")}
            onMouseEnter={() => handleMouseEnter("taste")}
            onMouseLeave={handleMouseLeave}
          >
            Taste
            {activeSense === "taste" && (
              <div className="sense-tooltip">{senseData.taste}</div>
            )}
          </div>
        </div>
      </div>
    </BaseOverlay>
  );
};

export default SensesOverlay;
