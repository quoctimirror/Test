import { useState, useCallback, useEffect } from "react";
import {
  diamonds,
  heads,
  bands,
  isValidPair,
  getDisabledHeadsForDiamond,
  getDisabledDiamondsForHead,
  defaultSelection,
} from "./ringConfig";
import RingPreview from "./RingPreview";
import "./RingCustomizer.css";

export default function RingCustomizer() {
  const [selection, setSelection] = useState(defaultSelection);
  const [transitioning, setTransitioning] = useState({
    diamond: false,
    head: false,
    band: false,
  });

  // Get list of disabled items
  const disabledHeads = getDisabledHeadsForDiamond(selection.diamond);
  const disabledDiamonds = getDisabledDiamondsForHead(selection.head);

  // Handle selection changes with animation
  const handleDiamondChange = useCallback((diamondId) => {
    // Check if current head is invalid with the new diamond
    setSelection((prev) => {
      const newSelection = { ...prev, diamond: diamondId };
      // If current head is invalid, reset to head 1 or the first valid head
      if (!isValidPair(diamondId, prev.head)) {
        const validHead = heads.find((h) => isValidPair(diamondId, h.id));
        newSelection.head = validHead ? validHead.id : 1;
      }
      return newSelection;
    });
    setTransitioning((prev) => ({ ...prev, diamond: true }));
    setTimeout(() => setTransitioning((prev) => ({ ...prev, diamond: false })), 300);
  }, []);

  const handleHeadChange = useCallback((headId) => {
    // Check if current diamond is invalid with the new head
    setSelection((prev) => {
      const newSelection = { ...prev, head: headId };
      // If current diamond is invalid, reset to the first valid diamond
      if (!isValidPair(prev.diamond, headId)) {
        const validDiamond = diamonds.find((d) => isValidPair(d.id, headId));
        newSelection.diamond = validDiamond ? validDiamond.id : 1;
      }
      return newSelection;
    });
    setTransitioning((prev) => ({ ...prev, head: true }));
    setTimeout(() => setTransitioning((prev) => ({ ...prev, head: false })), 300);
  }, []);

  const handleBandChange = useCallback((bandId) => {
    setSelection((prev) => ({ ...prev, band: bandId }));
    setTransitioning((prev) => ({ ...prev, band: true }));
    setTimeout(() => setTransitioning((prev) => ({ ...prev, band: false })), 300);
  }, []);

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    const preloadImages = [];

    // Preload images for other diamonds (with current head/band)
    diamonds.forEach((d) => {
      if (isValidPair(d.id, selection.head)) {
        const img = new Image();
        img.src = `/ptest/d${d.id}h${selection.head}b${selection.band}.jpg`;
        preloadImages.push(img);
      }
    });

    // Preload images for other heads (with current diamond/band)
    heads.forEach((h) => {
      if (isValidPair(selection.diamond, h.id)) {
        const img = new Image();
        img.src = `/ptest/d${selection.diamond}h${h.id}b${selection.band}.jpg`;
        preloadImages.push(img);
      }
    });

    // Preload images for other bands (with current diamond/head)
    bands.forEach((b) => {
      const img = new Image();
      img.src = `/ptest/d${selection.diamond}h${selection.head}b${b.id}.jpg`;
      preloadImages.push(img);
    });
  }, [selection]);

  return (
    <div className="ring-customizer">
      {/* Left Panel - Options (40%) */}
      <div className="ring-customizer__options">
        <div className="ring-customizer__header">
          <h1>Solitaire Engagement Ring</h1>
          <p className="ring-customizer__price">$1,350 <span>(Setting Price)</span></p>
        </div>

        {/* Diamond Selection */}
        <section className="ring-customizer__section">
          <h2>Diamond Preview</h2>
          <p className="ring-customizer__label">Preview Shape: <strong>{diamonds.find(d => d.id === selection.diamond)?.name}</strong></p>
          <div className="ring-customizer__grid ring-customizer__grid--diamond">
            {diamonds.map((diamond) => {
              const isDisabled = disabledDiamonds.includes(diamond.id);
              const isSelected = selection.diamond === diamond.id;
              return (
                <button
                  key={diamond.id}
                  className={`ring-customizer__option ${isSelected ? "ring-customizer__option--selected" : ""} ${isDisabled ? "ring-customizer__option--disabled" : ""}`}
                  onClick={() => !isDisabled && handleDiamondChange(diamond.id)}
                  disabled={isDisabled}
                  title={isDisabled ? "Không khả dụng với Head đã chọn" : diamond.name}
                >
                  <div className="ring-customizer__option-icon">
                    <DiamondIcon shape={diamond.icon} />
                  </div>
                  <span className="ring-customizer__option-name">{diamond.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Head Selection */}
        <section className="ring-customizer__section">
          <h2>Head</h2>
          <p className="ring-customizer__label">Select Style: <strong>{heads.find(h => h.id === selection.head)?.name}</strong></p>
          <div className="ring-customizer__grid ring-customizer__grid--head">
            {heads.map((head) => {
              const isDisabled = disabledHeads.includes(head.id);
              const isSelected = selection.head === head.id;
              return (
                <button
                  key={head.id}
                  className={`ring-customizer__option ${isSelected ? "ring-customizer__option--selected" : ""} ${isDisabled ? "ring-customizer__option--disabled" : ""}`}
                  onClick={() => !isDisabled && handleHeadChange(head.id)}
                  disabled={isDisabled}
                  title={isDisabled ? "Không khả dụng với Diamond đã chọn" : head.name}
                >
                  <div className="ring-customizer__option-icon">
                    <HeadIcon type={head.icon} />
                  </div>
                  <span className="ring-customizer__option-name">{head.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Band Selection */}
        <section className="ring-customizer__section">
          <h2>Band</h2>
          <p className="ring-customizer__label">Select Style: <strong>{bands.find(b => b.id === selection.band)?.name}</strong></p>
          <div className="ring-customizer__grid ring-customizer__grid--band">
            {bands.map((band) => {
              const isSelected = selection.band === band.id;
              return (
                <button
                  key={band.id}
                  className={`ring-customizer__option ${isSelected ? "ring-customizer__option--selected" : ""}`}
                  onClick={() => handleBandChange(band.id)}
                  title={band.name}
                >
                  <div className="ring-customizer__option-icon">
                    <BandIcon type={band.icon} />
                  </div>
                  <span className="ring-customizer__option-name">{band.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right Panel - Ring Preview (60%) */}
      <div className="ring-customizer__preview">
        <div className="ring-customizer__image-container">
          <RingPreview
            diamondId={selection.diamond}
            headId={selection.head}
            bandId={selection.band}
          />
        </div>
        <div className="ring-customizer__selection-info">
          <p><strong>Current Selection:</strong></p>
          <p>Diamond: {diamonds.find(d => d.id === selection.diamond)?.name}</p>
          <p>Head: {heads.find(h => h.id === selection.head)?.name}</p>
          <p>Band: {bands.find(b => b.id === selection.band)?.name}</p>
        </div>
      </div>
    </div>
  );
}

// Simple Diamond Shape Icons
function DiamondIcon({ shape }) {
  const shapes = {
    round: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="15" />
      </svg>
    ),
    princess: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="8" width="24" height="24" />
      </svg>
    ),
    radiant: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="8,12 12,8 28,8 32,12 32,28 28,32 12,32 8,28" />
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10,10 30,10 33,13 33,27 30,30 10,30 7,27 7,13" />
      </svg>
    ),
    marquise: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="20" cy="20" rx="8" ry="16" />
      </svg>
    ),
    oval: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="20" cy="20" rx="12" ry="16" />
      </svg>
    ),
    pear: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 5 C10 15 8 25 20 35 C32 25 30 15 20 5" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 35 L8 22 C4 18 4 12 10 10 C14 8 18 10 20 14 C22 10 26 8 30 10 C36 12 36 18 32 22 Z" />
      </svg>
    ),
    asscher: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12,8 28,8 32,12 32,28 28,32 12,32 8,28 8,12" />
        <rect x="14" y="14" width="12" height="12" />
      </svg>
    ),
    cushion: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="8" width="24" height="24" rx="6" />
      </svg>
    ),
  };
  return shapes[shape] || shapes.round;
}

// Simple Head Icons
function HeadIcon({ type }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="15" r="8" />
      <path d="M12 20 L8 35 M28 20 L32 35 M20 23 L20 35" />
    </svg>
  );
}

// Simple Band Icons
function BandIcon({ type }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="20" cy="25" rx="15" ry="8" />
      <path d="M5 25 L5 20 C5 15 12 12 20 12 C28 12 35 15 35 20 L35 25" />
    </svg>
  );
}
