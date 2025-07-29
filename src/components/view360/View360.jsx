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

    // Initialize Three.js viewer with default configuration
    // For customization, pass config object as second parameter:
    // const viewer = createViewer(containerRef.current, {
    //   modelPath: "/view360/custom-ring.glb",
    //   modelScale: 3.0,
    //   cameraPosition: { x: 0, y: 6, z: 12 },
    //   bloomStrength: 0.3
    // });
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

  // Unified material change handler - more maintainable and extensible
  const handleMaterialChange = (materialType) => {
    if (!viewerRef.current) return;

    switch (materialType) {
      case "gold":
        viewerRef.current.setGoldMaterial();
        setActiveMaterial("gold");
        break;
      case "silver":
        viewerRef.current.setSilverMaterial();
        setActiveMaterial("silver");
        break;
      case "platinum":
        viewerRef.current.setPlatinumMaterial();
        setActiveMaterial("platinum");
        break;
      case "rose-gold":
        viewerRef.current.setRoseGoldMaterial();
        setActiveMaterial("rose-gold");
        break;
      case "diamond":
        viewerRef.current.setDiamondMaterial();
        // Diamond doesn't change activeMaterial state
        break;
      case "force-diamond-uniform":
        viewerRef.current.forceAllDiamondsUniform();
        // Force diamond doesn't change activeMaterial state
        break;
      case "reset":
        viewerRef.current.resetToOriginalMaterials();
        setActiveMaterial("default");
        break;
      default:
        console.warn(`Unknown material type: ${materialType}`);
    }
  };

  // Backward compatibility - keep original function names but use new handler
  const handleGoldMaterial = () => handleMaterialChange("gold");
  const handleSilverMaterial = () => handleMaterialChange("silver");
  const handlePlatinumMaterial = () => handleMaterialChange("platinum");
  const handleRoseGoldMaterial = () => handleMaterialChange("rose-gold");
  const handleDiamondMaterial = () => handleMaterialChange("diamond");
  const handleForceAllDiamondsUniform = () =>
    handleMaterialChange("force-diamond-uniform");
  const handleResetMaterials = () => handleMaterialChange("reset");

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
            className={`color-btn gold ${
              activeMaterial === "gold" ? "active" : ""
            }`}
            onClick={() => handleMaterialChange("gold")}
            title="Gold"
          >
            Gold
          </button>
          <button
            className={`color-btn silver ${
              activeMaterial === "silver" ? "active" : ""
            }`}
            onClick={() => handleMaterialChange("silver")}
            title="Silver"
          >
            Silver
          </button>
          <button
            className={`color-btn platinum ${
              activeMaterial === "platinum" ? "active" : ""
            }`}
            onClick={() => handleMaterialChange("platinum")}
            title="Platinum"
          >
            Platinum
          </button>
          <button
            className={`color-btn rose-gold ${
              activeMaterial === "rose-gold" ? "active" : ""
            }`}
            onClick={() => handleMaterialChange("rose-gold")}
            title="Rose Gold"
          >
            Rose Gold
          </button>
          <button
            className={`color-btn reset ${
              activeMaterial === "default" ? "active" : ""
            }`}
            onClick={() => handleMaterialChange("reset")}
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
