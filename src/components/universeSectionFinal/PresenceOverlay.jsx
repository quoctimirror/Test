// PresenceOverlay.jsx - Responsive Structure

import React from "react";
import "./BaseOverlay.css";
import "./PresenceOverlay.css";

const PresenceOverlay = ({ isActive, overlayStyle, onClose }) => {
  // Prevent click event propagation when clicking on inner content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`base-overlay presence-overlay ${isActive ? "show" : ""}`}
      style={overlayStyle}
      onMouseLeave={onClose}
      onClick={onClose}
    >
      {/* Cross-lines pattern */}
      <div className="cross-lines">
        <div className="line line-vertical"></div>
        <div className="line line-horizontal"></div>
        <div className="line line-diagonal-1"></div>
        <div className="line line-diagonal-2"></div>
      </div>

      {/* Content wrapper - sử dụng CSS Grid layout */}
      <div className="presence-content-wrapper" onClick={handleContentClick}>
        {/* Title */}
        <h2 className="presence-title">Presence</h2>

        {/* Text top */}
        <div className="presence-text-top">
          <p>
            Mirror evolves with you - reflecting your presence
            <br />
            as it grows, shifts, and becomes.
          </p>
        </div>

        {/* Text bottom */}
        <div className="presence-text-bottom">
          <p>
            We remember your milestones.
            <br />
            We grow with your journey.
            <br />
            Each piece becomes part of your story.
            <br />
            From a ring that catches the light to a necklace
            <br />
            that moves as you do - we're there, quietly shining with you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresenceOverlay;
