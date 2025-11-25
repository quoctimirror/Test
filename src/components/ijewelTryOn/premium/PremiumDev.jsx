import { useEffect, useRef, useState } from 'react';
// REMOVED: useDeviceCamera causes performance overhead on low-end Androids
// import { useDeviceCamera } from '../ijewel_useDeviceCamera';
import styles from './premium_dev.module.css';

const MODELS = [
  { id: 'Cs9yFentQsiL9VOyTa8Rdw', name: 'Fistion', basename: 'drive' },
  { id: 'dY4BIhDDQNmCVTRrEpV2QQ', name: 'Twin', basename: 'drive' },
  { id: 'MKyTIlEyRbi89oT6bH76yA', name: 'Pear', basename: 'drive' }
];

const getModelFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const modelName = params.get('model');
  if (modelName) {
    const found = MODELS.find(m => m.name.toLowerCase() === modelName.toLowerCase());
    if (found) return found.id;
  }
  return MODELS[0].id;
};

// Config rotation constants
const ROTATION_CONFIG = {
  backCamera: {
    right: {
      3: { y: 5, z: 0 },
      4: { y: 10, z: 0 },
      1: { y: 42, z: 0 },
      2: { y: 42, z: 0 }
    },
    left: {
      1: { y: 15, z: 0 }
    }
  },
  frontCamera: {
    right: {
      1: { y: 50, z: 350 },
      2: { y: 60, z: 350 },
    },
  }
};

const Premium = () => {
  // --- REFS (No re-renders) ---
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  const isInitializedRef = useRef(false);
  const rafIdRef = useRef(null);

  // Camera state refs for logic loop
  const isBackCameraRef = useRef(false);

  // Logic tracking refs to prevent redundant calculations
  const prevHandRef = useRef(-1);
  const prevFingerRef = useRef(-1);
  const prevCameraRef = useRef(false);
  const isManualRotationRef = useRef(false); // Flag if user manually rotates (future proof)

  // --- STATE (UI Only) ---
  const [currentModelId, setCurrentModelId] = useState(() => getModelFromURL());
  const [inAR, setInAR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);

  // --- UTILS ---
  const checkIsMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // --- CORE LOGIC: Hand Detection Reader ---
  // Reads directly from SDK memory, avoiding overhead
  const getDetectedHand = (plugin) => {
    // Safety check sequence to avoid crashing on weak devices
    const result = plugin?.handDetector?.lastResult;
    if (!result?.handedness?.length) return -1;

    const handData = result.handedness[0][0];
    if (!handData) return -1;

    // 0 = Left, 1 = Right
    const label = handData.categoryName || handData.label || handData.displayName;
    return label === 'Left' ? 0 : 1;
  };

  // --- CORE LOGIC: The High Performance Loop ---
  // This runs 60 times per second. ABSOLUTELY NO STATE UPDATES HERE.
  const runARLoop = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !arPlugin.modelRotation) {
        rafIdRef.current = requestAnimationFrame(runARLoop);
        return;
    }

    // 1. Get current state from SDK & Refs
    const currentHand = getDetectedHand(arPlugin);
    const finger = arPlugin.finger; // SDK is source of truth
    const isBack = isBackCameraRef.current;

    // 2. Optimization: Skip if nothing changed relevant to rotation config
    // (Unless hand is lost, then we might want to reset, but here we just hold)
    if (currentHand !== -1 &&
        (currentHand !== prevHandRef.current ||
         finger !== prevFingerRef.current ||
         isBack !== prevCameraRef.current)) {

      // Update tracking refs
      prevHandRef.current = currentHand;
      prevFingerRef.current = finger;
      prevCameraRef.current = isBack;

      // 3. Apply Config
      if (!isManualRotationRef.current) {
        const handType = currentHand === 0 ? 'left' : 'right';
        const cameraConfig = isBack ? ROTATION_CONFIG.backCamera : ROTATION_CONFIG.frontCamera;
        const fingerConfig = cameraConfig?.[handType]?.[finger];

        console.log('🔄 Rotation Config:', { handType, finger, isBack, fingerConfig });

        if (fingerConfig) {
          arPlugin.modelRotation.y = (fingerConfig.y * Math.PI) / 180;
          arPlugin.modelRotation.z = (fingerConfig.z * Math.PI) / 180;
          console.log('✅ Applied rotation:', { y: fingerConfig.y, z: fingerConfig.z });
        } else {
          // Optional: Reset to 0 or keep last known good position
          arPlugin.modelRotation.y = 0;
          arPlugin.modelRotation.z = 0;
          console.log('⚠️ No config for this finger/hand combo, reset to 0');
        }
      }
    }

    rafIdRef.current = requestAnimationFrame(runARLoop);
  };

  // --- AR CONTROL ---
  const startAR = async () => {
    if (!window.ij_vto || !viewerAppRef.current) {
      console.error('❌ Resources not ready');
      return;
    }

    // Prevent double-start
    if (arPluginRef.current) {
      console.warn('AR already running');
      return;
    }

    setIsLoading(true);

    try {
      const viewerApp = viewerAppRef.current;
      const arPlugin = await viewerApp.addPlugin(window.ij_vto.RingTryonPlugin);
      arPluginRef.current = arPlugin;

      // Config SDK (properties that work before start)
      arPlugin.modelScaleFactor = 0.5;
      arPlugin.occluderScaleFactor = 1.0;

      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
      }

      // *** CRITICAL PERFORMANCE FIX ***
      // Don't start the loop immediately. Wait for the camera to actually deliver frames.
      const onARStarted = (event) => {
        console.log('🚀 AR Started - Event Received', event);
        // Set finger AFTER AR is started (SDK requires this)
        arPlugin.finger = 3; // Default Ring Finger
        // Start the logic loop only now
        runARLoop();
        // Remove listener to avoid duplicates
        arPlugin.removeEventListener('AR_STARTED', onARStarted);
      };

      arPlugin.addEventListener('AR_STARTED', onARStarted);

      await arPlugin.start();

      // Mobile Optimization: Force back camera on mobile start usually
      const isMobile = checkIsMobile();
      if (isMobile) {
        await arPlugin.flipCamera();
        isBackCameraRef.current = true;
      } else {
        isBackCameraRef.current = false;
      }

      setInAR(true);
    } catch (error) {
      console.error('AR error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAR = async () => {
    // 1. Kill Loop First
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // 2. Stop Plugin
    const arPlugin = arPluginRef.current;
    if (arPlugin) {
      try {
        await arPlugin.stop();
      } catch (e) { console.warn(e); }
      arPluginRef.current = null;
    }

    setInAR(false);

    // Reset Refs
    prevHandRef.current = -1;
    prevFingerRef.current = -1;
  };

  // --- ACTIONS ---
  const handleFlipCamera = async () => {
    if (!arPluginRef.current) return;
    try {
      await arPluginRef.current.flipCamera();
      isBackCameraRef.current = !isBackCameraRef.current;
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchFinger = () => {
    if (!arPluginRef.current) return;
    // Just update SDK, the loop handles the rest
    arPluginRef.current.finger = (arPluginRef.current.finger + 1) % 5;
    // Trigger loop check immediately in next frame by resetting prevFinger
    prevFingerRef.current = -1;
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const initViewer = async () => {
      if (isInitializedRef.current || !containerRef.current) return;

      const currentModel = MODELS.find(m => m.id === currentModelId);
      if (!currentModel) return;

      isInitializedRef.current = true;

      // Listen for Config
      const handleFileData = (e) => {
        const fileData = e.detail.iJewelFileData?.config;
        if(fileData) setFileConfig(JSON.parse(fileData));
      };
      window.addEventListener('ijewel-file-data', handleFileData);

      // Load Model
      await window.ijewelViewer.loadModelById(currentModel.id, currentModel.basename, containerRef.current, {
        showUiButtons: false,
        hideTryOn: false
      });

      // Capture Viewer Instance
      const handleViewerReady = (e) => {
        viewerAppRef.current = e.detail.viewer;
      };
      window.addEventListener('ijewel-viewer-ready', handleViewerReady);

      // Cleanup
      return () => {
        window.removeEventListener('ijewel-file-data', handleFileData);
        window.removeEventListener('ijewel-viewer-ready', handleViewerReady);
        if (viewerAppRef.current) {
            viewerAppRef.current.dispose?.();
            viewerAppRef.current = null;
        }
        isInitializedRef.current = false;
      };
    };

    initViewer();
  }, [currentModelId]);

  // Clean up AR on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.viewerContainer} />

      {/* SVG Filter for Glass Effect - Keep UI lightweight */}
      <svg className={styles.svgFilter} aria-hidden="true">
        <filter id="liquidGlass" primitiveUnits="objectBoundingBox">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feDisplacementMap in="blur" in2="blur" scale="0.3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className={styles.footer}>
        {inAR ? (
          <div className={styles.footerControls}>
            <button className={styles.circleButton} onClick={stopAR} aria-label="Exit">
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <button className={styles.pillButton} onClick={handleSwitchFinger}>
              Switch Finger
            </button>

            <button className={styles.circleButton} onClick={handleFlipCamera} aria-label="Flip">
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <button className={styles.pillButton} onClick={startAR} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Start AR'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;
