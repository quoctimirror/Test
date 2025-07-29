import React, { useRef, useEffect, useState } from "react";
import { createViewer } from "@utils/AR/Three";
import QRPopup from "@components/qrPopup/QRPopup";
import "./View360.css";

const View360 = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showColorControls, setShowColorControls] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState("default"); // Track active material

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Initialize Three.js viewer
    const viewer = createViewer(containerRef.current);
    viewerRef.current = viewer;

    // Initialize the 3D scene
    viewer.init();

    // Set loading to false after a short delay to allow model to load
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimer);
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
    };
  }, []);

  // Handle auto-rotate toggle
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.setAutoRotate(autoRotate);
    }
  }, [autoRotate]);

  // Handle rotation speed change
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.setAutoRotateSpeed(rotationSpeed);
    }
  }, [rotationSpeed]);

  const handleAutoRotateToggle = () => {
    setAutoRotate(!autoRotate);
  };

  const handleSpeedChange = (newSpeed) => {
    setRotationSpeed(newSpeed);
  };

  const handleResetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.resetCamera();
    }
  };

  const handleARTryOnClick = () => {
    setShowQRPopup(true);
  };

  const handleCloseQRPopup = () => {
    setShowQRPopup(false);
  };

  // Color control handlers (ORIGINAL)
  const handleGoldMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setGoldMaterial();
      setActiveMaterial("gold");
    }
  };

  const handleSilverMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setSilverMaterial();
      setActiveMaterial("silver");
    }
  };

  const handlePlatinumMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setPlatinumMaterial();
      setActiveMaterial("platinum");
    }
  };

  const handleRoseGoldMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setRoseGoldMaterial();
      setActiveMaterial("rose-gold");
    }
  };

  const handleDiamondMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setDiamondMaterial();
    }
  };

  const handleForceAllDiamondsUniform = () => {
    if (viewerRef.current) {
      viewerRef.current.forceAllDiamondsUniform();
    }
  };

  const handleResetMaterials = () => {
    if (viewerRef.current) {
      viewerRef.current.resetToOriginalMaterials();
      setActiveMaterial("default");
    }
  };

  const toggleColorControls = () => {
    setShowColorControls(!showColorControls);
  };

  return (
    <div className="view-360-section">
      {/* Main Content */}
      <div className="view-360-main">
        <div className="view-360-viewer" ref={containerRef}>
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading 3D Model...</div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="view-360-bottom-controls">
          <button className="ar-try-btn" onClick={handleARTryOnClick}>
            AR Try on
          </button>
          <button
<<<<<<< HEAD
            className={`color-btn gold ${
              activeMaterial === "gold" ? "active" : ""
            }`}
=======
            className={`color-btn gold ${activeMaterial === "gold" ? "active" : ""
              }`}
>>>>>>> quoctimirror
            onClick={handleGoldMaterial}
            title="Gold"
          >
            Gold
          </button>
          <button
<<<<<<< HEAD
            className={`color-btn silver ${
              activeMaterial === "silver" ? "active" : ""
            }`}
=======
            className={`color-btn silver ${activeMaterial === "silver" ? "active" : ""
              }`}
>>>>>>> quoctimirror
            onClick={handleSilverMaterial}
            title="Silver"
          >
            Silver
          </button>
          <button
<<<<<<< HEAD
            className={`color-btn platinum ${
              activeMaterial === "platinum" ? "active" : ""
            }`}
=======
            className={`color-btn platinum ${activeMaterial === "platinum" ? "active" : ""
              }`}
>>>>>>> quoctimirror
            onClick={handlePlatinumMaterial}
            title="Platinum"
          >
            Platinum
          </button>
          <button
<<<<<<< HEAD
            className={`color-btn rose-gold ${
              activeMaterial === "rose-gold" ? "active" : ""
            }`}
=======
            className={`color-btn rose-gold ${activeMaterial === "rose-gold" ? "active" : ""
              }`}
>>>>>>> quoctimirror
            onClick={handleRoseGoldMaterial}
            title="Rose Gold"
          >
            Rose Gold
          </button>
          <button
<<<<<<< HEAD
            className={`color-btn reset ${
              activeMaterial === "default" ? "active" : ""
            }`}
=======
            className={`color-btn reset ${activeMaterial === "default" ? "active" : ""
              }`}
>>>>>>> quoctimirror
            onClick={handleResetMaterials}
            title="Reset to Original"
          >
            Reset
          </button>
        </div>

        {/* Hidden Controls for Development */}
        <div className="dev-controls" style={{ display: "none" }}>
          <button
            className={`control-btn ${autoRotate ? "active" : ""}`}
            onClick={handleAutoRotateToggle}
            title="Toggle auto-rotation"
          >
            {autoRotate ? "⏸" : "▶"}
          </button>

          <button
            className="control-btn"
            onClick={handleResetCamera}
            title="Reset camera view"
          >
            🎯
          </button>

          <div className="speed-control">
            <label>Speed:</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            />
            <span>{rotationSpeed.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      {/* QR Popup */}
      <QRPopup
        isOpen={showQRPopup}
        onClose={handleCloseQRPopup}
        ringId="nhanBase"
      />
    </div>
  );
};

export default View360;
