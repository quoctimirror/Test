import React, { useEffect, useRef, useState } from 'react';
import { useDeviceCamera } from './ijewel_useDeviceCamera';

/**
 * IJewel AR Simple Component - Converted from example-loadModelById-with-ar.html
 * Clean AR viewer using loadModelById
 */
const IJewelARSimple = ({ fileId = 'Cs9yFentQsiL9VOyTa8Rdw', basename = 'drive' }) => {
  // ==========================================
  // REFS
  // ==========================================
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  // const mediaPipeHandsRef = useRef(null); // COMMENTED OUT - MediaPipe disabled

  // ==========================================
  // CUSTOM HOOKS
  // ==========================================
  const {
    deviceType,
    isMobile,
    isDesktop,
    currentCamera,
    cameraType,
    isFrontCamera,
    isBackCamera,
    getCameraName,
    updateCamera,
    toggleCamera
  } = useDeviceCamera();

  // ==========================================
  // STATES
  // ==========================================
  const [inAR, setInAR] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);
  const [currentHand, setCurrentHand] = useState(0); // 0 = left hand (default), 1 = right hand
  const [currentFinger, setCurrentFinger] = useState(0); // 0: áp út, 1: út, 2: cái, 3: trỏ, 4: giữa
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true); // Debug panel expanded state
  const [rotationY, setRotationY] = useState(0); // Manual rotation Y in degrees (0-360)
  const [rotationZ, setRotationZ] = useState(0); // Manual rotation Z in degrees (0-360)

  // ==========================================
  // ROTATION CONFIG (HARDCODED - DEGREES)
  // ==========================================
  const rotationConfig = {
    backCamera: {
      right: {
        0: { y: 5, z: 0 },      // Ngón áp út
        1: { y: 10, z: 0 },     // Ngón út
        3: { y: 45, z: 0 },     // Ngón trỏ
        4: { y: 48, z: 350 }    // Ngón giữa
      }
    }
  };

  // ==========================================
  // CALCULATE ROTATION Y - COMMENTED OUT (not overriding rotation)
  // ==========================================
  /*
  const calculateRotationY = useCallback(() => {
    const fingerRotationConfig = {
      frontCamera: {
        right: {
          3: 0.9,
          4: 0.9
        }
      },
      backCamera: {
        right: {
          3: 0.9,
          4: 0.9
        },
        left: {
          0: 0.19,
          1: 0.19,
          3: 0.19,
          4: 0.19
        }
      }
    };

    const currentCameraType = isFrontCamera ? 'frontCamera' : 'backCamera';
    const handType = currentHand === 0 ? 'left' : 'right';

    let rotationY = 0;

    const cameraConfig = fingerRotationConfig[currentCameraType];
    if (cameraConfig && cameraConfig[handType]) {
      // Default to finger 3 (ring finger)
      const fingerConfig = cameraConfig[handType][3];
      if (fingerConfig !== undefined) {
        rotationY = fingerConfig;
      }
    }

    console.log(`🔄 Rotation.y: ${rotationY.toFixed(2)} (${currentCameraType}, ${handType})`);
    return rotationY;
  }, [currentHand, isFrontCamera]);
  */

  // ==========================================
  // APPLY ROTATION Y - COMMENTED OUT (not overriding rotation)
  // ==========================================
  /*
  const applyRotationY = useCallback(() => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !arPlugin.modelRotation) return;

    const rotationY = calculateRotationY();
    arPlugin.modelRotation.y = rotationY;
  }, [calculateRotationY]);
  */

  // ==========================================
  // AUTO-APPLY ROTATION WHEN HAND OR CAMERA CHANGES - COMMENTED OUT
  // ==========================================
  /*
  useEffect(() => {
    if (inAR && arPluginRef.current) {
      applyRotationY();
    }
  }, [inAR, currentHand, isFrontCamera, applyRotationY]);
  */

  // ==========================================
  // APPLY ROTATION Y & Z (SIMPLE, NO CRASH)
  // ==========================================
  useEffect(() => {
    if (inAR && arPluginRef.current?.modelRotation) {
      // Convert degrees to radians
      const rotationYRad = (rotationY * Math.PI) / 180;
      const rotationZRad = (rotationZ * Math.PI) / 180;

      arPluginRef.current.modelRotation.y = rotationYRad;
      arPluginRef.current.modelRotation.z = rotationZRad;

      console.log(`🔄 Applied rotation - Y: ${rotationY}°, Z: ${rotationZ}°`);
    }
  }, [inAR, rotationY, rotationZ]); // Simple dependencies - no crash

  // ==========================================
  // INITIALIZE MEDIAPIPE HANDS - COMMENTED OUT (causes crash on iPhone)
  // ==========================================
  /*
  const initMediaPipeHands = async () => {
    if (!window.Hands) {
      console.warn('⚠️ MediaPipe Hands not loaded');
      return;
    }

    try {
      const hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        // MediaPipe hand detection disabled - using manual hand selection instead
        // Uncomment below if you want to re-enable auto detection

        if (results.multiHandedness && results.multiHandedness.length > 0) {
          const handLabel = results.multiHandedness[0].label;
          const handIndex = handLabel === 'Left' ? 0 : 1;

          if (currentHand !== handIndex) {
            setCurrentHand(handIndex);
            console.log('✋ Detected hand:', handLabel, '→', handIndex);
            applyRotationY();
          }
        }

      });

      await hands.initialize();
      mediaPipeHandsRef.current = hands;
      console.log('✅ MediaPipe Hands initialized');

      // Start detecting from canvas
      const detect = async () => {
        if (!inAR || !mediaPipeHandsRef.current) return;

        const canvas = document.querySelector('canvas');
        if (canvas) {
          try {
            await mediaPipeHandsRef.current.send({ image: canvas });
          } catch (err) {
            console.error('MediaPipe detect error:', err);
          }
        }

        if (inAR) {
          requestAnimationFrame(detect);
        }
      };

      detect();
    } catch (err) {
      console.error('❌ MediaPipe Hands init error:', err);
    }
  };
  */

  // ==========================================
  // INITIALIZE VIEWER
  // ==========================================
  useEffect(() => {
    const initViewer = async () => {
      if (!containerRef.current) return;

      // Listen for file data
      const handleFileData = (event) => {
        const fileData = event.detail.iJewelFileData?.config;
        setFileConfig(JSON.parse(fileData));
      };

      window.addEventListener('ijewel-file-data', handleFileData);

      // Load model by ID
      await window.ijewelViewer.loadModelById(fileId, basename, containerRef.current, {
        showUiButtons: false,
        hideTryOn: true
      });

      // Listen for viewer ready
      const handleViewerReady = (event) => {
        viewerAppRef.current = event.detail.viewer;
        console.log('Viewer ready');
      };

      window.addEventListener('ijewel-viewer-ready', handleViewerReady);

      return () => {
        window.removeEventListener('ijewel-file-data', handleFileData);
        window.removeEventListener('ijewel-viewer-ready', handleViewerReady);
      };
    };

    initViewer();
  }, [fileId, basename]);

  // ==========================================
  // START AR
  // ==========================================
  const startAR = async () => {
    if (!window.ij_vto) {
      console.error('WebVTO is not loaded');
      return;
    }

    const viewerApp = viewerAppRef.current;
    if (!viewerApp) {
      console.error('Viewer not ready');
      return;
    }

    setIsLoading(true);

    try {
      // Load AR plugin
      const arPlugin = await viewerApp.addPlugin(window.ij_vto.RingTryonPlugin);
      arPluginRef.current = arPlugin;

      // Set scale factors directly
      arPlugin.modelScaleFactor = 0.6;
      arPlugin.occluderScaleFactor = 0.9;
      console.log('✅ Applied scale factors');

      // Load saved tryon config from editor (override nếu có)
      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
        console.log('✅ Applied Drive config (override)');
      }

      // Start AR
      await arPlugin.start();

      // Mobile: Flip to back camera immediately after start (SDK defaults to front camera)
      if (isMobile) {
        console.log('📱 Mobile detected - flipping to back camera...');
        await arPlugin.flipCamera();
        updateCamera(0); // Update state to back camera (0)
        console.log('✅ Flipped to back camera');
      }

      // Initialize MediaPipe for hand detection - COMMENTED OUT (causes crash)
      // await initMediaPipeHands();

      // Apply initial rotation.y - COMMENTED OUT (not overriding rotation)
      // applyRotationY();

      setInAR(true);
    } catch (error) {
      console.error('AR error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STOP AR
  // ==========================================
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

  // ==========================================
  // TOGGLE AR
  // ==========================================
  const handleToggleAR = async () => {
    if (inAR) {
      await stopAR();
    } else {
      await startAR();
    }
  };

  // ==========================================
  // FLIP CAMERA
  // ==========================================
  const handleFlipCamera = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    try {
      await arPlugin.flipCamera();

      // Update camera state using hook
      toggleCamera();

      // Apply rotation config if applicable (back camera + right hand)
      // Note: toggleCamera() updates state asynchronously, so we use a small delay
      setTimeout(() => {
        applyRotationConfig();
      }, 100);
    } catch (error) {
      console.error('Flip camera error:', error);
    }
  };

  // ==========================================
  // SWITCH FINGER
  // ==========================================
  const handleSwitchFinger = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    // Update local state first (cycle through 0-4)
    const newFinger = (currentFinger + 1) % 5;
    setCurrentFinger(newFinger);

    // Update SDK using current SDK finger value (like ijewel_useARTryOn.js)
    arPlugin.finger = (arPlugin.finger + 1) % 5;

    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    console.log('👆 Switched to:', fingerNames[newFinger], '(Index:', newFinger, ')');

    // Apply rotation config if applicable
    applyRotationConfig(currentHand, newFinger);
  };

  // ==========================================
  // SWITCH HAND (LEFT/RIGHT)
  // ==========================================
  const handleSwitchHand = () => {
    if (!inAR) return;

    // Toggle between 0 (left) and 1 (right)
    const newHand = currentHand === 0 ? 1 : 0;
    setCurrentHand(newHand);

    const handNames = ['Tay trái', 'Tay phải'];
    console.log('✋ Switched to:', handNames[newHand]);

    // Apply rotation config if applicable
    applyRotationConfig(newHand, currentFinger);
  };

  // ==========================================
  // GET FINGER NAME
  // ==========================================
  const getFingerName = (index) => {
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    return fingerNames[index] || 'Unknown';
  };

  // ==========================================
  // ADJUST ROTATION Y
  // ==========================================
  const adjustRotation = (degrees) => {
    const newValue = (rotationY + degrees + 360) % 360;
    setRotationY(newValue);
  };

  // ==========================================
  // ADJUST ROTATION Z
  // ==========================================
  const adjustRotationZ = (degrees) => {
    const newValue = (rotationZ + degrees + 360) % 360;
    setRotationZ(newValue);
  };

  // ==========================================
  // APPLY ROTATION CONFIG
  // ==========================================
  const applyRotationConfig = (hand = currentHand, finger = currentFinger) => {
    // Only apply for back camera + right hand
    if (!isBackCamera || hand !== 1) {
      console.log('⏭️ Skipping config - not (back camera + right hand)');
      return;
    }

    // Check if config exists for current finger
    const fingerConfig = rotationConfig.backCamera?.right?.[finger];

    if (!fingerConfig) {
      console.log(`⏭️ No config for finger ${finger}`);
      return;
    }

    // Apply config to state (useEffect will apply to SDK)
    setRotationY(fingerConfig.y);
    setRotationZ(fingerConfig.z);

    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    console.log(`✅ Applied config for ${fingerNames[finger]}: Y=${fingerConfig.y}°, Z=${fingerConfig.z}°`);
  };

  // ==========================================
  // TOGGLE DEBUG PANEL
  // ==========================================
  const handleContainerClick = () => {
    // Click anywhere on container -> collapse debug panel
    if (isDebugExpanded) {
      setIsDebugExpanded(false);
    }
  };

  const handleDebugPanelClick = (e) => {
    e.stopPropagation(); // Prevent container click
    // Toggle panel state
    setIsDebugExpanded(!isDebugExpanded);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={styles.container} onClick={handleContainerClick}>
      {/* Viewer Container */}
      <div ref={containerRef} style={styles.viewerContainer}></div>

      {/* Rotation Y Slider */}
      {inAR && (
        <div style={styles.rotationSliderPanel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.rotationLabel}>
            🔄 Rotation Y: {rotationY}°
          </div>
          <div style={styles.sliderRow}>
            <button onClick={() => adjustRotation(-5)} style={styles.smallButton}>
              -5°
            </button>
            <button onClick={() => adjustRotation(-1)} style={styles.smallButton}>
              -1°
            </button>
            <input
              type="range"
              min="0"
              max="360"
              value={rotationY}
              onChange={(e) => setRotationY(Number(e.target.value))}
              style={styles.rotationSlider}
            />
            <button onClick={() => adjustRotation(1)} style={styles.smallButton}>
              +1°
            </button>
            <button onClick={() => adjustRotation(5)} style={styles.smallButton}>
              +5°
            </button>
          </div>
        </div>
      )}

      {/* Rotation Z Slider */}
      {inAR && (
        <div style={styles.rotationSliderPanelZ} onClick={(e) => e.stopPropagation()}>
          <div style={styles.rotationLabel}>
            🔄 Rotation Z: {rotationZ}°
          </div>
          <div style={styles.sliderRow}>
            <button onClick={() => adjustRotationZ(-5)} style={styles.smallButton}>
              -5°
            </button>
            <button onClick={() => adjustRotationZ(-1)} style={styles.smallButton}>
              -1°
            </button>
            <input
              type="range"
              min="0"
              max="360"
              value={rotationZ}
              onChange={(e) => setRotationZ(Number(e.target.value))}
              style={styles.rotationSlider}
            />
            <button onClick={() => adjustRotationZ(1)} style={styles.smallButton}>
              +1°
            </button>
            <button onClick={() => adjustRotationZ(5)} style={styles.smallButton}>
              +5°
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleToggleAR}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? 'Loading...' : inAR ? 'Exit AR' : 'Start AR'}
        </button>
        {inAR && (
          <>
            <button onClick={handleFlipCamera} style={styles.button}>
              Flip Camera
            </button>
            <button onClick={handleSwitchFinger} style={styles.button}>
              Switch Finger
            </button>
            <button onClick={handleSwitchHand} style={styles.button}>
              {currentHand === 0 ? 'Left Hand' : 'Right Hand'}
            </button>
          </>
        )}
      </div>

      {/* Debug Info Panel */}
      <div
        style={isDebugExpanded ? styles.debugInfoPanel : styles.debugInfoPanelCollapsed}
        onClick={handleDebugPanelClick}
      >
        <div style={isDebugExpanded ? styles.debugInfoTitle : styles.debugInfoTitleCollapsed}>
          🔍 Debug Info
        </div>
        {isDebugExpanded && (
          <>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>Thiết bị:</span>
              <span style={styles.debugInfoValue}>{deviceType}</span>
            </div>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>Camera:</span>
              <span style={styles.debugInfoValue}>{getCameraName()}</span>
            </div>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>Camera Type:</span>
              <span style={styles.debugInfoValue}>{cameraType}</span>
            </div>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>Bàn tay:</span>
              <span style={styles.debugInfoValue}>
                {currentHand === 0 ? 'Tay trái' : 'Tay phải'}
              </span>
            </div>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>Ngón tay:</span>
              <span style={styles.debugInfoValue}>{getFingerName(currentFinger)}</span>
            </div>
            <div style={styles.debugInfoItem}>
              <span style={styles.debugInfoLabel}>AR Status:</span>
              <span style={styles.debugInfoValue}>{inAR ? '✅ Running' : '⭕ Stopped'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// STYLES
// ==========================================
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    position: 'relative',
    margin: 0,
    padding: 0,
    fontFamily: 'Arial, sans-serif'
  },
  viewerContainer: {
    width: '100vw',
    height: '100vh'
  },
  controls: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 1000
  },
  button: {
    fontSize: '20px',
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white'
  },
  rotationSliderPanel: {
    position: 'absolute',
    bottom: '90px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    zIndex: 1000,
    minWidth: '300px',
    textAlign: 'center'
  },
  rotationSliderPanelZ: {
    position: 'absolute',
    bottom: '170px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    zIndex: 1000,
    minWidth: '300px',
    textAlign: 'center'
  },
  rotationLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  rotationSlider: {
    flex: 1,
    height: '8px',
    cursor: 'pointer',
    accentColor: '#007bff'
  },
  smallButton: {
    fontSize: '14px',
    padding: '5px 10px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    minWidth: '45px'
  },
  fingerInfo: {
    position: 'absolute',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
    zIndex: 1000
  },
  debugInfoPanel: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    zIndex: 1000,
    minWidth: '250px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  debugInfoPanelCollapsed: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '10px',
    fontSize: '14px',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  debugInfoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
    paddingBottom: '8px',
    cursor: 'pointer'
  },
  debugInfoTitleCollapsed: {
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: 0,
    paddingBottom: 0
  },
  debugInfoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  debugInfoLabel: {
    fontWeight: '600',
    color: '#aaa'
  },
  debugInfoValue: {
    fontWeight: 'bold',
    color: '#fff'
  }
};

export default IJewelARSimple;
