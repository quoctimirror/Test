import { useEffect, useRef } from "react";
import "./ProductsLeft.css";

const ProductsLeftDrive = ({ modelId }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  useEffect(() => {
    let isCancelled = false; // Flag to prevent state updates after unmount

    // Load iJewel mini-viewer SDK script
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

        if (isCancelled) return; // Exit if component unmounted during async operation

        // Clear container completely before loading new viewer
        if (containerRef.current) {
          containerRef.current.innerHTML = '';

          // Remove any existing iframes/canvases that might be lingering
          const existingViewers = containerRef.current.querySelectorAll('iframe, canvas');
          existingViewers.forEach(el => el.remove());
        }

        const driveBasename = 'drive';
        const modelFileId = modelId || 'bvWdCTwORE2wavn2XZc8Hw';

        if (!isCancelled && containerRef.current) {
          window.ijewelViewer.loadModelById(
            modelFileId,
            driveBasename,
            containerRef.current,
            {
              showCard: false,
              showLogo: true,
            }
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
      isCancelled = true; // Prevent any pending async operations from updating state
      window.removeEventListener("ijewel-viewer-ready", handleViewerReady);

      // Dispose viewer instance if exists
      if (viewerInstanceRef.current && viewerInstanceRef.current.dispose) {
        try {
          viewerInstanceRef.current.dispose();
        } catch (err) {
          console.warn('Error disposing viewer:', err);
        }
        viewerInstanceRef.current = null;
      }

      // Clean up container completely
      if (containerRef.current) {
        containerRef.current.innerHTML = '';

        // Remove any lingering iframes/canvases
        const existingViewers = containerRef.current.querySelectorAll('iframe, canvas');
        existingViewers.forEach(el => {
          try {
            el.remove();
          } catch (err) {
            console.warn('Error removing viewer element:', err);
          }
        });
      }
    };
  }, [modelId]);

  return (
    <div id="pv2-viewer-root" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default ProductsLeftDrive;
