import { useEffect, useRef, useState, useCallback } from 'react';
import { useDeviceCamera } from '../ijewel_useDeviceCamera';
import { useMediaPipeHands } from '../ijewel_useMediaPipeHands';
import styles from './premium.module.css';

const MODELS = [
  { id: 'Cs9yFentQsiL9VOyTa8Rdw', name: 'Fistion', basename: 'drive' },
  { id: 'dY4BIhDDQNmCVTRrEpV2QQ', name: 'Twin', basename: 'drive' },
  { id: 'MKyTIlEyRbi89oT6bH76yA', name: 'Pear', basename: 'drive' }
];

// Rotation config constant - moved outside component to prevent recreation on every render
const ROTATION_CONFIG = {
  backCamera: {
    right: {
      0: { y: 5, z: 0 },
      1: { y: 10, z: 0 },
      3: { y: 42, z: 0 },
      4: { y: 42, z: 0 }
    },
    left: {
      3: { y: 15, z: 0 }
    }
  },
  frontCamera: {
    right: {
      3: { y: 50, z: 350 },
      4: { y: 60, z: 350 }
    },
  }
};

const Premium = () => {
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  const isInitializedRef = useRef(false);
  const arCanvasRef = useRef(null); // Canvas for MediaPipe hand detection

  // Track previous values to prevent unnecessary rotation config updates
  const prevDetectedHandRef = useRef(-1);
  const prevFingerRef = useRef(0);
  const prevCameraRef = useRef(true);

  const {
    deviceType,
    isMobile,
    cameraType,
    isBackCamera,
    getCameraName,
    updateCamera,
    toggleCamera
  } = useDeviceCamera();

  // State declarations - must come before useMediaPipeHands
  const [currentModelId, setCurrentModelId] = useState(MODELS[0].id);
  const [inAR, setInAR] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);
  // const [currentHand, setCurrentHand] = useState(0); // Removed - using detectedHand from MediaPipe
  const [currentFinger, setCurrentFinger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  const [isRotationExpanded, setIsRotationExpanded] = useState(true);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [isManualRotation, setIsManualRotation] = useState(false); // Track manual rotation adjustments

  // MediaPipe hand detection
  const { detectedHand } = useMediaPipeHands({
    canvasRef: arCanvasRef,
    isARRunning: inAR
  });

  /**
   * Gets initial rotation from config when entering AR
   * Assumes right hand by default (most common case)
   * Returns {y: 0, z: 0} if no config found
   */
  const getInitialRotationFromConfig = useCallback(() => {
    // Select config based on camera type
    const cameraConfig = isBackCamera ? ROTATION_CONFIG.backCamera : ROTATION_CONFIG.frontCamera;

    // Assume right hand (most common)
    const fingerConfig = cameraConfig?.right?.[currentFinger];

    if (fingerConfig) {
      return { y: fingerConfig.y, z: fingerConfig.z };
    } else {
      return { y: 0, z: 0 };
    }
  }, [currentFinger, isBackCamera]);

  /**
   * Applies rotation config based on detected hand and finger
   * Uses detectedHand from MediaPipe (auto-detection)
   *
   * Retrieves rotation angles from rotationConfig and applies to ring model.
   * Supports both front and back camera configs.
   * Skips auto-apply when user is manually adjusting rotation.
   */
  const applyRotationConfig = useCallback(() => {
    // Skip auto-apply when user is manually adjusting rotation
    if (isManualRotation) {
      return;
    }

    // No hand detected - keep current rotation (don't reset)
    if (detectedHand === -1) {
      return;
    }

    // Use detected hand directly (MediaPipe already handles mirroring correctly)
    const handNames = ['left', 'right'];
    const handType = handNames[detectedHand];

    // Select config based on camera type
    const cameraConfig = isBackCamera ? ROTATION_CONFIG.backCamera : ROTATION_CONFIG.frontCamera;
    const fingerConfig = cameraConfig?.[handType]?.[currentFinger];

    if (fingerConfig) {
      setRotationY(fingerConfig.y);
      setRotationZ(fingerConfig.z);

      // Apply rotation immediately (don't wait for useEffect)
      if (arPluginRef.current?.modelRotation) {
        const rotationYRad = (fingerConfig.y * Math.PI) / 180;
        const rotationZRad = (fingerConfig.z * Math.PI) / 180;
        arPluginRef.current.modelRotation.y = rotationYRad;
        arPluginRef.current.modelRotation.z = rotationZRad;
      }
    } else {
      // No config found - reset to 0 (default)
      setRotationY(0);
      setRotationZ(0);

      // Apply rotation immediately
      if (arPluginRef.current?.modelRotation) {
        arPluginRef.current.modelRotation.y = 0;
        arPluginRef.current.modelRotation.z = 0;
      }
    }
  }, [detectedHand, currentFinger, isBackCamera, isManualRotation]);

  // Auto-apply rotation config when hand detected, camera changed, or finger switched
  useEffect(() => {
    if (!inAR) return;

    // Check if values actually changed
    const handChanged = detectedHand !== prevDetectedHandRef.current;
    const fingerChanged = currentFinger !== prevFingerRef.current;
    const cameraChanged = isBackCamera !== prevCameraRef.current;

    // Only apply config when there's an actual change
    if (handChanged || fingerChanged || cameraChanged) {
      // Reset manual mode when hand/finger/camera changes
      setIsManualRotation(false);
      applyRotationConfig();

      // Update refs to current values
      prevDetectedHandRef.current = detectedHand;
      prevFingerRef.current = currentFinger;
      prevCameraRef.current = isBackCamera;
    }
  }, [detectedHand, isBackCamera, currentFinger, inAR, applyRotationConfig]);

  // apply rotation when rotationY or rotationZ changes when user slides the slider
  useEffect(() => {
    if (inAR && arPluginRef.current?.modelRotation) {
      const rotationYRad = (rotationY * Math.PI) / 180;
      const rotationZRad = (rotationZ * Math.PI) / 180;

      arPluginRef.current.modelRotation.y = rotationYRad;
      arPluginRef.current.modelRotation.z = rotationZRad;
    }
  }, [inAR, rotationY, rotationZ]);

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
        const viewer = event.detail.viewer;

        // Try multiple ways to find canvas
        let foundCanvas = null;

        if (viewer?.canvas) {
          foundCanvas = viewer.canvas;
        } else if (viewer?.renderer?.domElement) {
          foundCanvas = viewer.renderer.domElement;
        } else if (viewer?.renderer?.canvas) {
          foundCanvas = viewer.renderer.canvas;
        }

        if (foundCanvas) {
          arCanvasRef.current = foundCanvas;
        } else {
          console.error('❌ Could not find canvas from viewer object!');
        }
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
        updateCamera(0);
      }

      // Assign canvas for MediaPipe hand detection
      const assignCanvas = () => {
        return new Promise((resolve, reject) => {
          if (arCanvasRef.current) {
            resolve(true);
            return;
          }

          const error = new Error('Canvas not found from viewer object');
          console.error('❌', error.message);
          reject(error);
        });
      };

      await assignCanvas();

      // Read and apply initial rotation from config (assume right hand)
      const initialRotation = getInitialRotationFromConfig();
      setRotationY(initialRotation.y);
      setRotationZ(initialRotation.z);

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
   * - Updates camera type state
   * - Rotation config auto-applied by useEffect
   */
  const handleFlipCamera = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    try {
      await arPlugin.flipCamera();
      toggleCamera();
      // Rotation config auto-applied by useEffect when isBackCamera changes
    } catch (error) {
      console.error('Flip camera error:', error);
    }
  };

  // ============================================================================
  // RING CONTROLS
  // ============================================================================

  /**
   * Cycles to next finger (0-4: ring finger, pinky, thumb, index, middle)
   * - Updates state and AR plugin finger
   * - Reapplies rotation config for new finger
   */
  const handleSwitchFinger = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    const newFinger = (currentFinger + 1) % 5;
    setCurrentFinger(newFinger);

    arPlugin.finger = (arPlugin.finger + 1) % 5;
    // Rotation config auto-applied by useEffect when currentFinger changes
  };

  // ============================================================================
  // ROTATION HELPERS
  // ============================================================================

  const adjustRotation = (degrees) => {
    setIsManualRotation(true); // Enter manual mode
    const newValue = (rotationY + degrees + 360) % 360;
    setRotationY(newValue);
  };

  const adjustRotationZ = (degrees) => {
    setIsManualRotation(true); // Enter manual mode
    const newValue = (rotationZ + degrees + 360) % 360;
    setRotationZ(newValue);
  };

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
  // UI HANDLERS
  // ============================================================================

  const handleContainerClick = () => {
    if (isDebugExpanded) {
      setIsDebugExpanded(false);
    }
    if (isRotationExpanded) {
      setIsRotationExpanded(false);
    }
  };

  const handleDebugPanelClick = (e) => {
    e.stopPropagation();
    setIsDebugExpanded(!isDebugExpanded);
  };

  const handleRotationPanelClick = (e) => {
    e.stopPropagation();
    setIsRotationExpanded(!isRotationExpanded);
  };

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const getFingerName = (index) => {
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    return fingerNames[index] || 'Unknown';
  };

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <div
        ref={containerRef}
        className={styles.viewerContainer}
      >
        <canvas
          id="webgi-canvas"
          style={{
            width: '100%',
            height: '100%'
          }}
        ></canvas>
      </div>

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

      <div className={styles.controls} onClick={(e) => e.stopPropagation()}>
        <ShineButton onClick={handleToggleAR} disabled={isLoading}>
          {isLoading ? 'Loading...' : inAR ? 'Exit AR' : 'Start AR'}
        </ShineButton>
        {inAR && (
          <>
            <ShineButton onClick={handleFlipCamera}>
              Flip Camera
            </ShineButton>
            <ShineButton onClick={handleSwitchFinger}>
              Switch Finger
            </ShineButton>
          </>
        )}
      </div>

      <div
        className={isDebugExpanded ? styles.debugInfoPanel : styles.debugInfoPanelCollapsed}
        onClick={handleDebugPanelClick}
      >
        <div className={isDebugExpanded ? styles.debugInfoTitle : styles.debugInfoTitleCollapsed}>
          🔍 Debug Info
        </div>
        {isDebugExpanded && (
          <>
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>Thiết bị:</span>
              <span className={styles.debugInfoValue}>{deviceType}</span>
            </div>
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>Camera:</span>
              <span className={styles.debugInfoValue}>{getCameraName()}</span>
            </div>
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>Camera Type:</span>
              <span className={styles.debugInfoValue}>{cameraType}</span>
            </div>
            {inAR && (
              <div className={styles.debugInfoItem}>
                <span className={styles.debugInfoLabel}>Bàn tay (Auto):</span>
                <span className={styles.debugInfoValue}>
                  {detectedHand === -1
                    ? '⚠️ Không phát hiện'
                    : `✅ ${detectedHand === 0 ? 'Trái' : 'Phải'}`}
                </span>
              </div>
            )}
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>Ngón tay:</span>
              <span className={styles.debugInfoValue}>{getFingerName(currentFinger)}</span>
            </div>
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>AR Status:</span>
              <span className={styles.debugInfoValue}>{inAR ? '✅ Running' : '⭕ Stopped'}</span>
            </div>
          </>
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
