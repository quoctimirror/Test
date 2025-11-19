import React, { useEffect, useRef, useState } from 'react';

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
  const mediaPipeHandsRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================
  const [inAR, setInAR] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);
  const [currentCamera, setCurrentCamera] = useState(0); // 0 = back camera (mobile) / front camera (desktop), 1 = front camera (mobile)
  const [currentHand, setCurrentHand] = useState(-1); // -1 = not detected, 0 = left hand, 1 = right hand
  const [currentFinger, setCurrentFinger] = useState(0); // 0: áp út, 1: út, 2: cái, 3: trỏ, 4: giữa
  const [deviceType, setDeviceType] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // DETECT DEVICE TYPE
  // ==========================================
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const type = isMobile ? 'Mobile' : 'Desktop';
    setDeviceType(type);
    console.log('📱 Device type:', type);
  }, []);

  // ==========================================
  // CALCULATE ROTATION Y
  // ==========================================
  const calculateRotationY = () => {
    const fingerRotationConfig = {
      frontCamera: {
        right: {
          3: 0.9,
          4: 0.9
        }
      },
      backCamera: {
        right: {
          3: 0.5,
          4: 0.5
        },
        left: {
          0: 0.19,
          1: 0.19,
          3: 0.19,
          4: 0.19
        }
      }
    };

    const isFrontCamera = (deviceType === 'Desktop') || (currentCamera === 1);
    const cameraType = isFrontCamera ? 'frontCamera' : 'backCamera';
    const handType = currentHand === 0 ? 'left' : currentHand === 1 ? 'right' : null;

    let rotationY = 0;

    if (handType) {
      const cameraConfig = fingerRotationConfig[cameraType];
      if (cameraConfig && cameraConfig[handType]) {
        // Default to finger 3 (ring finger)
        const fingerConfig = cameraConfig[handType][3];
        if (fingerConfig !== undefined) {
          rotationY = fingerConfig;
        }
      }
    }

    console.log(`🔄 Rotation.y: ${rotationY} (${cameraType}, ${handType})`);
    return rotationY;
  };

  // ==========================================
  // APPLY ROTATION Y
  // ==========================================
  const applyRotationY = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !arPlugin.modelRotation) return;

    const rotationY = calculateRotationY();
    arPlugin.modelRotation.y = rotationY;
  };

  // ==========================================
  // INITIALIZE MEDIAPIPE HANDS
  // ==========================================
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
        if (results.multiHandedness && results.multiHandedness.length > 0) {
          const handLabel = results.multiHandedness[0].label;
          const handIndex = handLabel === 'Left' ? 0 : 1;

          if (currentHand !== handIndex) {
            setCurrentHand(handIndex);
            console.log('✋ Detected hand:', handLabel, '→', handIndex);
            applyRotationY();
          }
        } else {
          if (currentHand !== -1) {
            setCurrentHand(-1);
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

      // Load standard_1.json config
      try {
        const response = await fetch('/arTryOn/standard_1.json');
        const standard1Config = await response.json();
        console.log('📦 Loaded standard_1.json:', standard1Config);

        if (standard1Config) {
          if (standard1Config.modelScaleFactor !== undefined) {
            arPlugin.modelScaleFactor = standard1Config.modelScaleFactor;
          }
          if (standard1Config.occluderScaleFactor !== undefined) {
            arPlugin.occluderScaleFactor = standard1Config.occluderScaleFactor;
          }
          console.log('✅ Applied standard_1.json config');
        }
      } catch (error) {
        console.error('❌ Failed to load standard_1.json:', error);
      }

      // Load saved tryon config from editor (override nếu có)
      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
        console.log('✅ Applied Drive config (override)');
      }

      // Start AR
      await arPlugin.start();

      // Initialize MediaPipe for hand detection
      await initMediaPipeHands();

      // Apply initial rotation.y
      applyRotationY();

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

      // Update camera state
      const newCamera = (currentCamera + 1) % 2;
      setCurrentCamera(newCamera);
      console.log('📷 Camera flipped:', newCamera === 0 ? 'Back/Default' : 'Front');

      // Apply rotation.y with new camera
      applyRotationY();
    } catch (error) {
      console.error('Flip camera error:', error);
    }
  };

  // ==========================================
  // SWITCH FINGER
  // ==========================================
  const handleSwitchFinger = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    try {
      await arPlugin.switchFinger();

      // Update finger state (cycle through 0-4)
      const newFinger = (currentFinger + 1) % 5;
      setCurrentFinger(newFinger);

      const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
      console.log('👆 Switched to:', fingerNames[newFinger]);
    } catch (error) {
      console.error('Switch finger error:', error);
    }
  };

  // ==========================================
  // GET FINGER NAME
  // ==========================================
  const getFingerName = (index) => {
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    return fingerNames[index] || 'Unknown';
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={styles.container}>
      {/* Viewer Container */}
      <div ref={containerRef} style={styles.viewerContainer}></div>

      {/* Controls */}
      <div style={styles.controls}>
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
          </>
        )}
      </div>

      {/* Finger Info */}
      {inAR && (
        <div style={styles.fingerInfo}>
          <span>👆 {getFingerName(currentFinger)}</span>
        </div>
      )}
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
    top: '20px',
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
  }
};

export default IJewelARSimple;
