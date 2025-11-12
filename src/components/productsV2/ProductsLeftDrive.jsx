import { useEffect, useRef } from "react";
import { PRODUCT_CONFIG } from "./productConfig";
import "./ProductsLeft.css";

const ProductsLeftDrive = ({ modelId }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    // Load iJewel mini-viewer SDK script from CDN
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already loaded
        if (window.ijewelViewer && window.ijewelViewer.loadModelById) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load iJewel mini-viewer SDK'));
        document.body.appendChild(script);
      });
    };

    // Load model from iJewel Drive
    const loadModel = async () => {
      if (!containerRef.current || isCancelled) return;

      try {
        // Load SDK script
        await loadScript();

        if (isCancelled) return;

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const driveBasename = PRODUCT_CONFIG.driveBasename;
        const modelFileId = modelId || PRODUCT_CONFIG.defaultModelId;

        if (!isCancelled && containerRef.current) {
          window.ijewelViewer.loadModelById(
            modelFileId,
            driveBasename,
            containerRef.current,
            PRODUCT_CONFIG.viewerOptions
          );
        }

      } catch (err) {
        if (!isCancelled) {
          console.error('❌ Error loading model:', err);
        }
      }
    };

    // Listen for viewer ready event
    const handleViewerReady = (event) => {
      if (!isCancelled) {
        console.log("✅ Viewer is ready:", event.detail.viewer);
        viewerInstanceRef.current = event.detail.viewer;
      }
    };

    window.addEventListener("ijewel-viewer-ready", handleViewerReady);
    loadModel();

    // Cleanup
    return () => {
      isCancelled = true;
      window.removeEventListener("ijewel-viewer-ready", handleViewerReady);

      if (viewerInstanceRef.current && viewerInstanceRef.current.dispose) {
        try {
          viewerInstanceRef.current.dispose();
        } catch (err) {
          console.warn('Error disposing viewer:', err);
        }
        viewerInstanceRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [modelId]);

  return (
    <div id="pv2-viewer-root" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default ProductsLeftDrive;