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

  // Color control handlers
  const handleGoldMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setGoldMaterial();
    }
  };

  const handleSilverMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setSilverMaterial();
    }
  };

  const handlePlatinumMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setPlatinumMaterial();
    }
  };

  const handleRoseGoldMaterial = () => {
    if (viewerRef.current) {
      viewerRef.current.setRoseGoldMaterial();
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
          <button className="color-controls-btn" onClick={toggleColorControls}>
            🎨 Colors
          </button>
        </div>

        {/* Color Controls Panel */}
        {showColorControls && (
          <div className="color-controls-panel">
            <div className="color-controls-header">
              <h3>Customize Ring</h3>
              <button className="close-btn" onClick={toggleColorControls}>×</button>
            </div>
            
            <div className="color-section">
              <h4>Metal Colors</h4>
              <div className="color-buttons">
                <button 
                  className="color-btn gold" 
                  onClick={handleGoldMaterial}
                  title="Gold"
                >
                  Gold
                </button>
                <button 
                  className="color-btn silver" 
                  onClick={handleSilverMaterial}
                  title="Silver"
                >
                  Silver
                </button>
                <button 
                  className="color-btn platinum" 
                  onClick={handlePlatinumMaterial}
                  title="Platinum"
                >
                  Platinum
                </button>
                <button 
                  className="color-btn rose-gold" 
                  onClick={handleRoseGoldMaterial}
                  title="Rose Gold"
                >
                  Rose Gold
                </button>
              </div>
            </div>

            <div className="color-section">
              <h4>Diamond Enhancement</h4>
              <div className="color-buttons">
                <button 
                  className="color-btn diamond" 
                  onClick={handleDiamondMaterial}
                  title="Enhanced Diamonds"
                >
                  💎 Enhance
                </button>
                <button 
                  className="color-btn uniform" 
                  onClick={handleForceAllDiamondsUniform}
                  title="Make All Diamonds Uniform"
                >
                  🔧 Fix All
                </button>
                <button 
                  className="color-btn reset" 
                  onClick={handleResetMaterials}
                  title="Reset to Original"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        )}

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
        ringId="nhanXam"
      />
    </div>
  );
};

export default View360;
