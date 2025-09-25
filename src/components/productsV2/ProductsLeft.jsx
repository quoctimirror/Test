import React, { useRef, useEffect, useState } from "react";
import "./ProductsLeft.css";

const ProductsLeft = () => {
  const viewerRootRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [models] = useState([
    { name: 'Refine Mirror Ring 1', path: '/models/refine-mirror-ring-1.glb' },
    { name: 'Refine Mirror Ring', path: '/models/refine-mirror-ring.glb' },
    { name: 'Refine Mirror Ring 2', path: '/models/refine-mirror-ring-2.glb' },
    { name: 'Ring WebGi', path: '/models/ring_webgi.glb' },
    { name: 'Ring WebGi 2', path: '/models/ring2_webgi.glb' },
    { name: 'Lumex Ring', path: '/models/lumex91.glb' }
  ]);

  useEffect(() => {
    if (!viewerRootRef.current) return;

    const initializeViewer = async () => {
      try {
        // Load iJewel3D script dynamically
        const script = document.createElement('script');
        script.src = 'https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js';

        script.onload = () => {
          if (window.ijewelViewer) {
            loadCurrentModel();
          } else {
            setError("iJewel3D viewer not available");
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          setError("Failed to load iJewel3D script");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("Error setting up iJewel3D:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    const loadCurrentModel = () => {
      const currentModel = models[currentModelIndex];

      // Clear previous viewer and cleanup observer
      if (viewerRootRef.current) {
        // Cleanup previous observer if exists
        if (viewerRootRef.current._trademarkObserver) {
          viewerRootRef.current._trademarkObserver.disconnect();
          delete viewerRootRef.current._trademarkObserver;
        }
        viewerRootRef.current.innerHTML = '';
      }

      // Initialize viewer with current model
      new window.ijewelViewer.Viewer(
        viewerRootRef.current,
        {
          modelUrl: currentModel.path,
          basePath: "/models/"
        },
        {
          showCard: false,
          enableStats: false,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          powerPreference: "low-power",
          quality: "medium"
        }
      );

      // Listen for viewer ready event
      const handleViewerReady = async (ev) => {
        console.log("iJewel3D viewer ready with model:", currentModel.name);
        const viewer = ev.detail.viewer;
        setIsLoading(false);
        console.log("Viewer instance:", viewer);

        // Hide trademarks after viewer is ready
        setTimeout(() => {
          hideTrademark();
        }, 1000);
      };

      // Function to hide trademark elements
      const hideTrademark = () => {
        if (!viewerRootRef.current) return;

        // Hide trademark elements by various selectors
        const hideSelectors = [
          '[class*="watermark"]',
          '[class*="trademark"]',
          '[class*="ijewel"]',
          '[class*="powered"]',
          '[class*="logo"]',
          '[data-testid*="watermark"]',
          '[data-testid*="trademark"]',
          '[data-testid*="logo"]',
          'div[style*="position: absolute"][style*="bottom"]',
          'div[style*="position: fixed"][style*="bottom"]'
        ];

        hideSelectors.forEach(selector => {
          const elements = viewerRootRef.current.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          });
        });

        // Hide elements containing trademark text
        const allDivs = viewerRootRef.current.querySelectorAll('div, span');
        allDivs.forEach(el => {
          if (el.textContent && (
            el.textContent.toLowerCase().includes('ijewel') ||
            el.textContent.toLowerCase().includes('powered by') ||
            el.textContent.toLowerCase().includes('watermark')
          )) {
            el.style.display = 'none';
          }
        });

        console.log('🚫 Trademark elements hidden');

        // Set up MutationObserver to continuously hide trademarks
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Check if the added node is a trademark
                  hideSelectors.forEach(selector => {
                    if (node.matches && node.matches(selector)) {
                      node.style.display = 'none';
                    }
                    const elements = node.querySelectorAll && node.querySelectorAll(selector);
                    if (elements) {
                      elements.forEach(el => {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                      });
                    }
                  });

                  // Check text content
                  if (node.textContent && (
                    node.textContent.toLowerCase().includes('ijewel') ||
                    node.textContent.toLowerCase().includes('powered by')
                  )) {
                    node.style.display = 'none';
                  }
                }
              });
            }
          });
        });

        observer.observe(viewerRootRef.current, {
          childList: true,
          subtree: true
        });

        // Store observer for cleanup
        viewerRootRef.current._trademarkObserver = observer;
      };

      window.addEventListener("webgi-viewer-ready", handleViewerReady);

      // Fallback in case event doesn't fire
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 3000);

      // Cleanup function for event listener
      return () => {
        window.removeEventListener("webgi-viewer-ready", handleViewerReady);
      };
    };

    initializeViewer();

    // Cleanup
    return () => {
      const handler = () => {
        console.log("Viewer ready cleanup");
      };
      window.removeEventListener("webgi-viewer-ready", handler);

      // Cleanup observer on unmount
      if (viewerRootRef.current?._trademarkObserver) {
        viewerRootRef.current._trademarkObserver.disconnect();
      }
    };
  }, [currentModelIndex]); // Re-run when model changes

  const switchModel = (newModelIndex) => {
    if (newModelIndex !== currentModelIndex) {
      setIsLoading(true);
      setError(null);
      setCurrentModelIndex(newModelIndex);
    }
  };

  if (error) {
    return (
      <div className="products-left-container">
        <div className="products-left-viewer">
          <div className="error-overlay">
            <div className="error-text">
              <h3>Failed to load 3D viewer</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-left-container">
      <div className="products-left-viewer">
        <div className="viewer-wrapper">
          <div className="viewer-root" ref={viewerRootRef}></div>
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading 3D Ring Experience...</div>
            </div>
          )}
        </div>

        {/* Model Selector */}
        <div className="model-selector-overlay">
          <select
            value={currentModelIndex}
            onChange={(e) => switchModel(parseInt(e.target.value))}
            disabled={isLoading}
            className="model-dropdown"
          >
            {models.map((model, index) => (
              <option key={index} value={index}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bottom-left-frame"></div>
    </div>
  );
};

export default ProductsLeft;