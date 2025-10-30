import { useEffect, useRef } from "react";
import "./ProductsLeft.css";

const ProductsLeftDrive = ({ modelId }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load iJewel mini-viewer SDK script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already loaded
        if (window.ijewelViewer && window.ijewelViewer.loadModelById) {
          resolve();
          return;
        }

        // Check if script tag already exists
        if (scriptLoadedRef.current) {
          const checkInterval = setInterval(() => {
            if (window.ijewelViewer && window.ijewelViewer.loadModelById) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js';
        script.async = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load iJewel mini-viewer SDK'));
        };
        document.body.appendChild(script);
      });
    };

    // Load model from iJewel Drive with fallback to local
    const loadModel = async () => {
      if (!containerRef.current) return;

      try {
        console.log('Loading iJewel Drive SDK...');

        // Load SDK script
        await loadScript();

        console.log('SDK loaded, loading local model...');

        // Wait a bit for container to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const containerElement = containerRef.current;

        // Load model from iJewel Drive
        const driveBasename = 'drive';
        const modelFileId = modelId || 'eOcY7UV6TMWbra25hv9dwQ'; // Default model

        window.ijewelViewer.loadModelById(
          modelFileId,
          driveBasename,
          containerElement,
          {
            showCard: false,
            showLogo: false
          }
        );

        console.log('✅ Loading model from iJewel Drive:', modelFileId);

      } catch (err) {
        console.error('❌ Error loading model:', err);
      }
    };

    // Event listener for viewer ready
    const handleViewerReady = (event) => {
      console.log("✅ iJewel Drive Viewer is ready:", event.detail.viewer);
      viewerInstanceRef.current = event.detail.viewer;
    };

    window.addEventListener("ijewel-viewer-ready", handleViewerReady);

    loadModel();

    // Cleanup
    return () => {
      window.removeEventListener("ijewel-viewer-ready", handleViewerReady);
      if (viewerInstanceRef.current) {
        try {
          if (viewerInstanceRef.current.dispose) {
            viewerInstanceRef.current.dispose();
          }
        } catch (e) {
          console.warn('Error disposing viewer:', e);
        }
        viewerInstanceRef.current = null;
      }
    };
  }, [modelId]);

  return (
    <div id="pv2-viewer-root" ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default ProductsLeftDrive;
