import React, { useEffect, useRef } from "react";
import "./ProductsLeft.css";

const ProductsLeft = () => {
  // Create ref to reference DOM element containing viewer
  const viewerRootRef = useRef(null);

  useEffect(() => {
    // Check if DOM element has rendered and SDK has loaded
    if (!viewerRootRef.current || !window.ijewelViewer) return;

    // Local 3D model URL from public/models
    const model = "/models/rings/refine-mirror-fiston.glb";

    // Initialize iJewel3D Viewer
    // Param 1: DOM element to render viewer
    // Param 2: project config - contains modelUrl and basePath
    // Param 3: viewer options - display options
    new window.ijewelViewer.Viewer(
      viewerRootRef.current,
      { modelUrl: model }, // project
      { showCard: false } // viewer options - hide info card
    );

    // Event listener when viewer is ready
    const handleViewerReady = async (ev) => {
      const viewer = ev.detail.viewer; // Get viewer instance
      // Can use viewer instance to control viewer (zoom, rotate, etc.)
    };

    // Register event listener
    window.addEventListener("webgi-viewer-ready", handleViewerReady);

    // Cleanup function - remove event listener when component unmounts
    return () => {
      window.removeEventListener("webgi-viewer-ready", handleViewerReady);
    };
  }, []); // Empty dependency array - run only once when component mounts

  return (
    // Element to render viewer into
    <div id="pv2-viewer-root" ref={viewerRootRef}></div>
  );
};

export default ProductsLeft;
