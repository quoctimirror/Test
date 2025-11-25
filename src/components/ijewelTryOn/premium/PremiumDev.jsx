import { useEffect, useRef, useState, useCallback } from 'react';
import { useDeviceCamera } from '../ijewel_useDeviceCamera';
// REMOVED - Now reading directly from SDK in rAF loop for better performance
// import { useSDKHandDetection } from '../useSDKHandDetection';
import styles from './premium_dev.module.css';

const MODELS = [
  { id: 'Cs9yFentQsiL9VOyTa8Rdw', name: 'Fistion', basename: 'drive' },
  { id: 'dY4BIhDDQNmCVTRrEpV2QQ', name: 'Twin', basename: 'drive' },
  { id: 'MKyTIlEyRbi89oT6bH76yA', name: 'Pear', basename: 'drive' }
];

// Đọc model từ URL param (?model=Fistion, ?model=Twin, ?model=Pear)
const getModelFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const modelName = params.get('model');
  if (modelName) {
    const found = MODELS.find(m => m.name.toLowerCase() === modelName.toLowerCase());
    if (found) return found.id;
  }
  return MODELS[0].id; // Default: model đầu tiên
};

// Rotation config constant - moved outside component to prevent recreation on every render
// Finger index theo SDK: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
const ROTATION_CONFIG = {
  backCamera: {
    right: {
      3: { y: 5, z: 0 },    // ring finger
      4: { y: 10, z: 0 },   // pinky
      1: { y: 42, z: 0 },   // index finger
      2: { y: 42, z: 0 }    // middle finger
    },
    left: {
      1: { y: 15, z: 0 }    // index finger
    }
  },
  frontCamera: {
    right: {
      1: { y: 50, z: 350 }, // index finger
      2: { y: 60, z: 350 },  // middle finger
    },
  }
};

const Premium = () => {
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  const isInitializedRef = useRef(false);
  // COMMENTED - Not needed anymore, SDK handles hand detection internally
  // const arCanvasRef = useRef(null); // Canvas for MediaPipe hand detection

  // Ref for camera state (avoid re-renders)
  const isBackCameraRef = useRef(false);

  const {
    deviceType,
    isMobile,
    cameraType,
    isBackCamera,
    getCameraName,
    updateCamera,
    toggleCamera
  } = useDeviceCamera();

  // State declarations - minimized to avoid re-renders
  const [currentModelId, setCurrentModelId] = useState(() => getModelFromURL());
  const [inAR, setInAR] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // COMMENTED FOR PERFORMANCE - These don't need to trigger re-renders
  // const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  // const [isRotationExpanded, setIsRotationExpanded] = useState(true);
  // const [rotationY, setRotationY] = useState(0);
  // const [rotationZ, setRotationZ] = useState(0);
  // const [isManualRotation, setIsManualRotation] = useState(false);

  // Use refs instead - no re-render overhead
  const rotationYRef = useRef(0);
  const rotationZRef = useRef(0);
  const isManualRotationRef = useRef(false);

  // FPS counter - use ref instead of state to avoid re-renders (like sample2.html)
  const fpsRef = useRef(null);

  // OPTIMIZED: Read hand detection directly from SDK in rAF loop (no state, no re-renders)
  // Returns: -1 (no hand), 0 (left), 1 (right)
  const getDetectedHand = useCallback(() => {
    const handedness = arPluginRef.current?.handDetector?.lastResult?.handedness;
    if (handedness?.[0]?.[0]) {
      const handData = handedness[0][0];
      const label = handData.categoryName || handData.label || handData.displayName;
      return label === 'Left' ? 0 : 1;
    }
    return -1;
  }, []);

  /**
   * Gets initial rotation from config when entering AR
   * Assumes right hand by default (most common case)
   * Returns {y: 0, z: 0} if no config found
   */
  const getInitialRotationFromConfig = useCallback(() => {
    // Select config based on camera type (using ref)
    const cameraConfig = isBackCameraRef.current ? ROTATION_CONFIG.backCamera : ROTATION_CONFIG.frontCamera;

    // Assume right hand (most common), read finger from SDK
    const finger = arPluginRef.current?.finger ?? 3;
    const fingerConfig = cameraConfig?.right?.[finger];

    if (fingerConfig) {
      return { y: fingerConfig.y, z: fingerConfig.z };
    } else {
      return { y: 0, z: 0 };
    }
  }, []);

  // Track previous values to avoid unnecessary updates
  const prevHandRef = useRef(-1);
  const prevFingerRef = useRef(-1);
  const prevCameraRef = useRef(false);

  /**
   * OPTIMIZED: Applies rotation config based on detected hand and finger
   * - Reads directly from SDK (no state, no re-renders)
   * - Only updates when values actually change (avoid unnecessary work)
   */
  const applyRotationConfig = useCallback(() => {
    // Skip auto-apply when user is manually adjusting rotation
    if (isManualRotationRef.current) return;

    const arPlugin = arPluginRef.current;
    if (!arPlugin?.modelRotation) return;

    // Read values directly from SDK
    const currentHand = getDetectedHand();
    const finger = arPlugin.finger;
    const isBackCamera = isBackCameraRef.current;

    // No hand detected - keep current rotation
    if (currentHand === -1) return;

    // PERFORMANCE: Only update if something changed
    if (currentHand === prevHandRef.current &&
      finger === prevFingerRef.current &&
      isBackCamera === prevCameraRef.current) {
      return; // Nothing changed, skip update
    }

    // Update previous values
    prevHandRef.current = currentHand;
    prevFingerRef.current = finger;
    prevCameraRef.current = isBackCamera;

    const handType = currentHand === 0 ? 'left' : 'right';
    const cameraConfig = isBackCamera ? ROTATION_CONFIG.backCamera : ROTATION_CONFIG.frontCamera;
    const fingerConfig = cameraConfig?.[handType]?.[finger];

    if (fingerConfig) {
      // Có config → dùng custom rotation
      rotationYRef.current = fingerConfig.y;
      rotationZRef.current = fingerConfig.z;
      arPlugin.modelRotation.y = (fingerConfig.y * Math.PI) / 180;
      arPlugin.modelRotation.z = (fingerConfig.z * Math.PI) / 180;
    } else {
      // Không có config → reset về 0 để SDK tự handle
      rotationYRef.current = 0;
      rotationZRef.current = 0;
      arPlugin.modelRotation.y = 0;
      arPlugin.modelRotation.z = 0;
    }
  }, [getDetectedHand]);

  // FPS counter only - DOM manipulation like sample2.html (no React re-render)
  useEffect(() => {
    if (!inAR) return;

    let rafId;
    let frameCount = 0;
    let lastTime = performance.now();

    const loop = () => {
      frameCount++;
      const now = performance.now();

      // Cập nhật FPS mỗi giây - DOM manipulation trực tiếp, không dùng setState
      if (now - lastTime >= 1000) {
        if (fpsRef.current) {
          let color = '#4ade80'; // green >= 50
          if (frameCount < 30) color = '#ef4444'; // red
          else if (frameCount < 50) color = '#fbbf24'; // yellow

          fpsRef.current.style.color = color;
          fpsRef.current.textContent = `${frameCount} FPS`;
        }
        frameCount = 0;
        lastTime = now;
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [inAR]);

  // Rotation config check - low frequency (every 500ms) to detect hand change (left/right)
  useEffect(() => {
    if (!inAR) return;

    const intervalId = setInterval(() => {
      applyRotationConfig();
    }, 500); // 500ms = 2 checks/second, minimal overhead

    return () => clearInterval(intervalId);
  }, [inAR, applyRotationConfig]);

  // COMMENTED FOR PERFORMANCE - Rotation applied directly in applyRotationConfig now
  // No need for useEffect that triggers on state changes
  // useEffect(() => {
  //   if (inAR && arPluginRef.current?.modelRotation) {
  //     const rotationYRad = (rotationY * Math.PI) / 180;
  //     const rotationZRad = (rotationZ * Math.PI) / 180;
  //     arPluginRef.current.modelRotation.y = rotationYRad;
  //     arPluginRef.current.modelRotation.z = rotationZRad;
  //   }
  // }, [inAR, rotationY, rotationZ]);

  useEffect(() => {
    const initViewer = async () => {
      if (isInitializedRef.current || !containerRef.current) {
        return;
      }

      const currentModel = MODELS.find(m => m.id === currentModelId);
      if (!currentModel) {
        alert(`❌ Model not found: ${currentModelId}`);
        return;
      }

      isInitializedRef.current = true;

      const handleFileData = (event) => {
        const fileData = event.detail.iJewelFileData?.config;
        setFileConfig(JSON.parse(fileData));
      };

      window.addEventListener('ijewel-file-data', handleFileData);

      await window.ijewelViewer.loadModelById(currentModel.id, currentModel.basename, containerRef.current, {
        showUiButtons: false,
        hideTryOn: false
      });

      const handleViewerReady = (event) => {
        viewerAppRef.current = event.detail.viewer;

        // COMMENTED - Canvas ref not needed, SDK handles hand detection internally
        // const viewer = event.detail.viewer;
        // let foundCanvas = null;
        // if (viewer?.canvas) {
        //   foundCanvas = viewer.canvas;
        // } else if (viewer?.renderer?.domElement) {
        //   foundCanvas = viewer.renderer.domElement;
        // } else if (viewer?.renderer?.canvas) {
        //   foundCanvas = viewer.renderer.canvas;
        // }
        // if (foundCanvas) {
        //   arCanvasRef.current = foundCanvas;
        // } else {
        //   console.error('❌ Could not find canvas from viewer object!');
        // }
      };

      window.addEventListener('ijewel-viewer-ready', handleViewerReady);

      return () => {
        // Remove listeners
        window.removeEventListener('ijewel-file-data', handleFileData);
        window.removeEventListener('ijewel-viewer-ready', handleViewerReady);

        // Dispose viewer
        if (viewerAppRef.current) {
          try {
            viewerAppRef.current.dispose?.();
          } catch (err) {
            console.warn('⚠️ Viewer dispose error:', err);
          }
          viewerAppRef.current = null;
        }

        // Reset flag
        isInitializedRef.current = false;
      };
    };

    initViewer();
  }, [currentModelId]);

  // ============================================================================
  // AR CONTROLS
  // ============================================================================

  /**
   * Starts AR Try-On session
   * - Adds AR plugin to viewer
   * - Configures ring scale and tryon settings
   * - Flips camera to front on mobile
   * - Validates canvas for MediaPipe hand detection
   */
  const startAR = async () => {
    if (!window.ij_vto) {
      console.error('❌ WebVTO is not loaded');
      return;
    }

    const viewerApp = viewerAppRef.current;
    if (!viewerApp) {
      console.error('❌ Viewer not ready');
      return;
    }

    setIsLoading(true);

    try {
      const arPlugin = await viewerApp.addPlugin(window.ij_vto.RingTryonPlugin);
      arPluginRef.current = arPlugin;

      arPlugin.modelScaleFactor = 0.5;
      arPlugin.occluderScaleFactor = 1.0;

      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
      }

      await arPlugin.start();

      if (isMobile) {
        await arPlugin.flipCamera();
        isBackCameraRef.current = true; // Mobile starts with back camera after flip
        updateCamera(0);
      } else {
        isBackCameraRef.current = false; // Desktop uses front camera
      }

      // Set default finger = 3 (ring finger)
      arPlugin.finger = 3;

      // COMMENTED - Canvas assignment not needed, SDK handles hand detection internally
      // const assignCanvas = () => {
      //   return new Promise((resolve, reject) => {
      //     if (arCanvasRef.current) {
      //       resolve(true);
      //       return;
      //     }
      //     const error = new Error('Canvas not found from viewer object');
      //     console.error('❌', error.message);
      //     reject(error);
      //   });
      // };
      // await assignCanvas();

      // Read and apply initial rotation from config (assume right hand)
      const initialRotation = getInitialRotationFromConfig();
      rotationYRef.current = initialRotation.y;
      rotationZRef.current = initialRotation.z;

      // Apply initial rotation to model
      if (arPlugin.modelRotation) {
        arPlugin.modelRotation.y = (initialRotation.y * Math.PI) / 180;
        arPlugin.modelRotation.z = (initialRotation.z * Math.PI) / 180;
      }

      setInAR(true);
    } catch (error) {
      console.error('AR error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stops AR Try-On session and cleans up AR plugin
   */
  const stopAR = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin) return;

    try {
      await arPlugin.stop();
      setInAR(false);
    } catch (error) {
      console.error('Stop AR error:', error);
    }
  };

  const handleToggleAR = async () => {
    if (inAR) {
      await stopAR();
    } else {
      await startAR();
    }
  };

  // ============================================================================
  // CAMERA CONTROLS
  // ============================================================================

  /**
   * Flips between front and back camera
   * - Toggles camera via AR plugin
   * - Updates camera ref (for rotation config)
   * - Updates camera state (for UI)
   */
  const handleFlipCamera = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    try {
      await arPlugin.flipCamera();
      // Toggle ref (for rotation config - no re-render)
      isBackCameraRef.current = !isBackCameraRef.current;
      // Toggle state (for UI - useDeviceCamera)
      toggleCamera();
      // Apply rotation config for new camera
      applyRotationConfig();
    } catch (error) {
      console.error('Flip camera error:', error);
    }
  };

  // ============================================================================
  // RING CONTROLS
  // ============================================================================

  /**
   * Cycles to next finger (SDK order: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky)
   * - Uses arPlugin.finger as source of truth
   * - Syncs React state from SDK
   * - Reapplies rotation config for new finger
   */
  const handleSwitchFinger = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    // Dùng SDK làm source of truth
    arPlugin.finger = (arPlugin.finger + 1) % 5;

    // Apply rotation config for new finger
    applyRotationConfig();
  };

  // ============================================================================
  // ROTATION HELPERS - COMMENTED (not needed without rotation UI)
  // ============================================================================

  // const adjustRotation = (degrees) => {
  //   isManualRotationRef.current = true;
  //   const newValue = (rotationYRef.current + degrees + 360) % 360;
  //   rotationYRef.current = newValue;
  //   if (arPluginRef.current?.modelRotation) {
  //     arPluginRef.current.modelRotation.y = (newValue * Math.PI) / 180;
  //   }
  // };

  // const adjustRotationZ = (degrees) => {
  //   isManualRotationRef.current = true;
  //   const newValue = (rotationZRef.current + degrees + 360) % 360;
  //   rotationZRef.current = newValue;
  //   if (arPluginRef.current?.modelRotation) {
  //     arPluginRef.current.modelRotation.z = (newValue * Math.PI) / 180;
  //   }
  // };

  // ============================================================================
  // MODEL MANAGEMENT
  // ============================================================================

  const handleModelChange = async (newModelId) => {
    if (newModelId === currentModelId) {
      return;
    }

    if (inAR) {
      await stopAR();
    }

    if (viewerAppRef.current) {
      try {
        viewerAppRef.current.dispose?.();
      } catch (err) {
        console.warn('⚠️ Viewer dispose error:', err);
      }
      viewerAppRef.current = null;
    }

    isInitializedRef.current = false;
    setCurrentModelId(newModelId);
  };

  // ============================================================================
  // UI HANDLERS - COMMENTED (not needed without debug/rotation panels)
  // ============================================================================

  // const handleContainerClick = () => {
  //   // Collapsed - not needed
  // };

  // const handleDebugPanelClick = (e) => {
  //   e.stopPropagation();
  //   // Toggle debug panel
  // };

  // const handleRotationPanelClick = (e) => {
  //   e.stopPropagation();
  //   // Toggle rotation panel
  // };

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getFingerName = (index) => {
    // Thứ tự theo SDK: 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
    const fingerNames = ['Ngón cái', 'Ngón trỏ', 'Ngón giữa', 'Ngón áp út', 'Ngón út'];
    return fingerNames[index] || 'Unknown';
  };

  return (
    <div className={styles.container}>
      <div
        ref={containerRef}
        className={styles.viewerContainer}
      >
        {/* SDK will create canvas here automatically */}
      </div>

      {/* COMMENTED FOR PERFORMANCE - Uncomment to show model selector
      <div className={styles.modelSelectorContainer} onClick={(e) => e.stopPropagation()}>
        <label className={styles.modelLabel}>Model:</label>
        <select
          value={currentModelId}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={isLoading}
          className={styles.modelSelector}
        >
          {MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      */}

      {/* COMMENTED FOR PERFORMANCE - Uncomment to show rotation controls
      {inAR && (
        <div
          className={isRotationExpanded ? styles.rotationSliderPanel : styles.rotationSliderPanelCollapsed}
          onClick={handleRotationPanelClick}
        >
          <div className={isRotationExpanded ? styles.rotationPanelTitle : styles.rotationPanelTitleCollapsed}>
            🔄 Rotation Controls
          </div>
          {isRotationExpanded && (
            <>
              <div className={styles.rotationLabel}>
                Rotation Y: {rotationY}°
              </div>
              <div className={styles.sliderRow} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => adjustRotation(-5)} className={styles.smallButton}>
                  -5°
                </button>
                <button onClick={() => adjustRotation(-1)} className={styles.smallButton}>
                  -1°
                </button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotationY}
                  onChange={(e) => {
                    setIsManualRotation(true); // Enter manual mode
                    setRotationY(Number(e.target.value));
                  }}
                  className={styles.rotationSlider}
                />
                <button onClick={() => adjustRotation(1)} className={styles.smallButton}>
                  +1°
                </button>
                <button onClick={() => adjustRotation(5)} className={styles.smallButton}>
                  +5°
                </button>
              </div>

              <div className={styles.rotationLabel} style={{ marginTop: '15px' }}>
                Rotation Z: {rotationZ}°
              </div>
              <div className={styles.sliderRow} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => adjustRotationZ(-5)} className={styles.smallButton}>
                  -5°
                </button>
                <button onClick={() => adjustRotationZ(-1)} className={styles.smallButton}>
                  -1°
                </button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotationZ}
                  onChange={(e) => {
                    setIsManualRotation(true); // Enter manual mode
                    setRotationZ(Number(e.target.value));
                  }}
                  className={styles.rotationSlider}
                />
                <button onClick={() => adjustRotationZ(1)} className={styles.smallButton}>
                  +1°
                </button>
                <button onClick={() => adjustRotationZ(5)} className={styles.smallButton}>
                  +5°
                </button>
              </div>
            </>
          )}
        </div>
      )}
      */}

      {/* FPS Counter - hiển thị khi đang AR, dùng ref để tránh re-render */}
      {inAR && (
        <div className={styles.fpsCounter}>
          <span ref={fpsRef}>0 FPS</span>
        </div>
      )}

      {/* SVG Filter for Liquid Glass Effect */}
      <svg className={styles.svgFilter} aria-hidden="true">
        <filter id="liquidGlass" primitiveUnits="objectBoundingBox">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2="blur" scale="0.3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Footer with liquid glass buttons */}
      <div className={styles.footer}>
        {inAR ? (
          <div className={styles.footerControls}>
            {/* Exit button - left */}
            <button
              className={styles.circleButton}
              onClick={stopAR}
              aria-label="Exit AR"
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Switch Finger - center */}
            <button
              className={styles.pillButton}
              onClick={handleSwitchFinger}
            >
              Switch Finger
            </button>

            {/* Camera flip - right */}
            <button
              className={styles.circleButton}
              onClick={handleFlipCamera}
              aria-label="Flip Camera"
            >
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                <circle cx="12" cy="12" r="3" />
                <path d="m18 22-3-3 3-3" />
                <path d="m6 2 3 3-3 3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className={styles.footerControlsCenter}>
            {/* Start AR button - center only when not in AR */}
            <button
              className={styles.pillButton}
              onClick={startAR}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Start AR'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// SHINE BUTTON COMPONENT
// ==========================================
const ShineButton = ({
  children,
  onClick,
  disabled = false,
  className = '',
  small = false
}) => {
  const buttonRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <button
      ref={buttonRef}
      className={`${styles.shineButton} ${small ? styles.small : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.glassLayer} />
      <div
        className={styles.shineLayer}
        style={{
          '--mouse-x': `${mousePos.x}%`,
          '--mouse-y': `${mousePos.y}%`
        }}
      />
      <span className={styles.buttonText}>{children}</span>
      <div className={styles.borderLayer} />
    </button>
  );
};

export default Premium;