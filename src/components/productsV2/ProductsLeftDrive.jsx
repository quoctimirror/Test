import { useEffect, useRef } from "react";
import "./ProductsLeft.css";

const ProductsLeftDrive = ({ modelId }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  useEffect(() => {
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
      if (!containerRef.current) return;

      try {
        // Load SDK script
        await loadScript();

        // Clear container
        containerRef.current.innerHTML = '';

        const driveBasename = 'drive';
        const modelFileId = modelId || 'HB3RidmJSdezIO1T2hdXcQ';

        window.ijewelViewer.loadModelById(
          modelFileId,
          driveBasename,
          containerRef.current,
          {
            showCard: true,
            showLogo: true,
          }
        );

      } catch (err) {
        console.error('❌ Error loading model:', err);
      }
    };

    // Listen for viewer ready event
    const handleViewerReady = (event) => {
      console.log("✅ Viewer is ready:", event.detail.viewer);
      viewerInstanceRef.current = event.detail.viewer;
    };

    window.addEventListener("ijewel-viewer-ready", handleViewerReady);

    loadModel();

    // Cleanup
    return () => {
      window.removeEventListener("ijewel-viewer-ready", handleViewerReady);
      if (viewerInstanceRef.current && viewerInstanceRef.current.dispose) {
        viewerInstanceRef.current.dispose();
      }
    };
  }, [modelId]);

  return (
    <div id="pv2-viewer-root" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default ProductsLeftDrive;
