import React, { useRef, useEffect, useState } from "react";
import { createViewer } from "../../utils/AR/Three";
import "./View360.css";

const View360 = () => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

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
          <button className="ar-try-btn">
            <span className="ar-icon">📱</span>
            AR Try on
          </button>
          <button className="customize-btn">
            Customize your own
            <span className="arrow-icon">↓</span>
          </button>
        </div>

        {/* Hidden Controls for Development */}
        <div className="dev-controls" style={{display: 'none'}}>
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
    </div>
  );
};

export default View360;
