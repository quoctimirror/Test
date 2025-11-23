import { useEffect, useRef, useState } from 'react';
import { useDeviceCamera } from '../ijewel_useDeviceCamera';
import { useMediaPipeHands } from '../ijewel_useMediaPipeHands';
import styles from './premium.module.css';

const MODELS = [
  { id: 'Cs9yFentQsiL9VOyTa8Rdw', name: 'Fistion', basename: 'drive' },
  { id: 'dY4BIhDDQNmCVTRrEpV2QQ', name: 'Twin', basename: 'drive' },
  { id: 'MKyTIlEyRbi89oT6bH76yA', name: 'Pear', basename: 'drive' }
];

const Premium = () => {
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  const isInitializedRef = useRef(false);
  const arCanvasRef = useRef(null); // Canvas for MediaPipe hand detection

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
  const [currentHand, setCurrentHand] = useState(0);
  const [currentFinger, setCurrentFinger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  const [isRotationExpanded, setIsRotationExpanded] = useState(true);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);

  // MediaPipe hand detection - now inAR is available
  const { detectedHand, isInitialized: isMediaPipeReady } = useMediaPipeHands({
    canvasRef: arCanvasRef,
    isARRunning: inAR
  });

  // cái này là config rotation theo camera, tay, ngón
  const rotationConfig = {
    backCamera: {
      right: {
        0: { y: 5, z: 0 },
        1: { y: 10, z: 0 },
        3: { y: 42, z: 0 },
        4: { y: 42, z: 350 }
      },
      left: {
        3: { y: 15, z: 0 }
      }
    }
  };


  // Sync MediaPipe hand detection to state (with camera flip logic)
  useEffect(() => {
    if (detectedHand === -1) {
      // No hand detected - handled in debug panel
      return;
    }

    // Camera flip logic: Front camera needs reverse
    let finalHand = detectedHand;
    if (!isBackCamera) {
      // Front camera (selfie mode): reverse detection
      // MediaPipe says "Left" → actually Right hand, vice versa
      finalHand = detectedHand === 0 ? 1 : 0;
    }

    if (finalHand !== currentHand) {
      setCurrentHand(finalHand);
      // Apply rotation config for the detected hand
      applyRotationConfig(finalHand, currentFinger);
    }
  }, [detectedHand, isBackCamera, currentHand, currentFinger]);

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
        console.log('⏭️ Skipping initViewer - initialized:', isInitializedRef.current, 'container:', !!containerRef.current);
        return;
      }

      const currentModel = MODELS.find(m => m.id === currentModelId);
      if (!currentModel) {
        alert(`❌ Model not found: ${currentModelId}`);
        return;
      }

      console.log('🎬 initViewer starting for model:', currentModel.name);
      console.log('📦 Container element:', containerRef.current);
      console.log('📦 Container HTML before load:', containerRef.current.innerHTML);

      isInitializedRef.current = true;

      const handleFileData = (event) => {
        const fileData = event.detail.iJewelFileData?.config;
        setFileConfig(JSON.parse(fileData));
      };

      window.addEventListener('ijewel-file-data', handleFileData);

      await window.ijewelViewer.loadModelById(currentModel.id, currentModel.basename, containerRef.current, {
        showUiButtons: false,
        hideTryOn: false  // Changed to false - need canvas for AR
      });

      console.log('✅ loadModelById completed');
      console.log('📦 Container HTML after load:', containerRef.current.innerHTML);
      console.log('🔍 Canvas in container?', containerRef.current.querySelector('canvas'));
      console.log('📹 Video in container?', containerRef.current.querySelector('video'));

      const handleViewerReady = (event) => {
        viewerAppRef.current = event.detail.viewer;
        console.log('✅ Viewer ready event received:', event.detail.viewer);

        // Try to find canvas from viewer
        const viewer = event.detail.viewer;
        console.log('🔍 Viewer object:', viewer);
        console.log('🔍 Viewer.renderer:', viewer?.renderer);
        console.log('🔍 Viewer.renderer.domElement:', viewer?.renderer?.domElement);
        console.log('🔍 Viewer.canvas:', viewer?.canvas);
        console.log('🔍 Viewer.renderer.canvas:', viewer?.renderer?.canvas);

        // Try multiple ways to find canvas
        let foundCanvas = null;

        if (viewer?.canvas) {
          foundCanvas = viewer.canvas;
          console.log('✅ Found canvas via viewer.canvas');
        } else if (viewer?.renderer?.domElement) {
          foundCanvas = viewer.renderer.domElement;
          console.log('✅ Found canvas via viewer.renderer.domElement');
        } else if (viewer?.renderer?.canvas) {
          foundCanvas = viewer.renderer.canvas;
          console.log('✅ Found canvas via viewer.renderer.canvas');
        }

        if (foundCanvas) {
          arCanvasRef.current = foundCanvas;
          console.log('✅ Canvas saved to arCanvasRef:', foundCanvas);
          console.log('✅ Canvas tag name:', foundCanvas.tagName);
          console.log('✅ Canvas id:', foundCanvas.id);
          console.log('✅ Canvas width x height:', foundCanvas.width, 'x', foundCanvas.height);
        } else {
          console.error('❌ Could not find canvas from viewer object!');
        }
      };

      window.addEventListener('ijewel-viewer-ready', handleViewerReady);

      return () => {
        console.log('🧹 Cleanup function called');

        // Remove listeners
        window.removeEventListener('ijewel-file-data', handleFileData);
        window.removeEventListener('ijewel-viewer-ready', handleViewerReady);

        // Dispose viewer cũ nếu có
        if (viewerAppRef.current) {
          try {
            viewerAppRef.current.dispose?.();
            console.log('✅ Viewer disposed in cleanup');
          } catch (err) {
            console.warn('⚠️ Viewer dispose error:', err);
          }
          viewerAppRef.current = null;
        }

        // DON'T clear container innerHTML - it removes the canvas we need!
        // The canvas is part of JSX and should persist

        // Reset flag để cho phép init lại
        isInitializedRef.current = false;
        console.log('✅ Cleanup completed');
      };
    };

    initViewer();
  }, [currentModelId]);

  const startAR = async () => {
    console.log('🎬 startAR called');

    if (!window.ij_vto) {
      console.error('❌ WebVTO is not loaded');
      return;
    }

    const viewerApp = viewerAppRef.current;
    if (!viewerApp) {
      console.error('❌ Viewer not ready');
      return;
    }

    console.log('✅ Viewer ready, adding AR plugin...');
    setIsLoading(true);

    try {
      const arPlugin = await viewerApp.addPlugin(window.ij_vto.RingTryonPlugin);
      arPluginRef.current = arPlugin;
      console.log('✅ AR plugin added:', arPlugin);

      arPlugin.modelScaleFactor = 0.5;
      arPlugin.occluderScaleFactor = 1.0;
      // console.log('✅ Applied scale factors');

      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
        // console.log('✅ Applied Drive config (override)');
      }

      console.log('🚀 Starting AR plugin...');
      console.log('🔍 arCanvasRef.current BEFORE AR start:', arCanvasRef.current);
      await arPlugin.start();
      console.log('✅ AR plugin started successfully');
      console.log('🔍 arCanvasRef.current AFTER AR start:', arCanvasRef.current);

      if (isMobile) {
        console.log('📱 Mobile detected - flipping camera...');
        await arPlugin.flipCamera();
        updateCamera(0);
        console.log('✅ Camera flipped');
      }

      // Assign canvas for MediaPipe hand detection
      // PRIORITY: Use canvas saved from viewer.canvas if available
      const assignCanvas = () => {
        return new Promise((resolve, reject) => {
          // First check if we already have canvas from viewer ready event
          if (arCanvasRef.current) {
            console.log('✅ Using canvas already saved from viewer.canvas:', arCanvasRef.current);
            console.log('📐 Canvas size:', arCanvasRef.current.width, 'x', arCanvasRef.current.height);
            resolve(true);
            return;
          }

          // Fallback: Try to find canvas/video in DOM (old method)
          console.log('⚠️ Canvas not saved from viewer, trying DOM search...');
          let attempts = 0;
          const maxAttempts = 50; // 5 second timeout (50 * 100ms)

          const tryAssign = () => {
            // Debug: Log all canvas AND video elements on page
            const allCanvases = document.querySelectorAll('canvas');
            const allVideos = document.querySelectorAll('video');
            const containerCanvases = containerRef.current?.querySelectorAll('canvas');
            const containerVideos = containerRef.current?.querySelectorAll('video');

            console.log(`🔍 Found ${allCanvases.length} canvas(es) in document:`, allCanvases);
            console.log(`📹 Found ${allVideos.length} video(s) in document:`, allVideos);
            console.log(`🔍 Found ${containerCanvases?.length || 0} canvas(es) in container:`, containerCanvases);
            console.log(`📹 Found ${containerVideos?.length || 0} video(s) in container:`, containerVideos);

            // Try to find video element first (AR might use video instead of canvas)
            const video = document.querySelector('video');
            if (video && video.readyState >= 2) {
              arCanvasRef.current = video;
              console.log('✅ Video element found and assigned for MediaPipe');
              console.log('📐 Video size:', video.videoWidth, 'x', video.videoHeight);
              console.log('📹 Video element:', video);
              resolve(true);
              return;
            }

            // AR plugin creates canvas at document level, not inside containerRef
            const canvas = document.querySelector('canvas');
            if (canvas) {
              arCanvasRef.current = canvas;
              console.log('✅ Canvas found and assigned for MediaPipe');
              console.log('📐 Canvas size:', canvas.width, 'x', canvas.height);
              console.log('🎨 Canvas element:', canvas);
              resolve(true);
            } else if (attempts < maxAttempts) {
              attempts++;
              console.log(`⏳ Canvas not found yet (attempt ${attempts}/${maxAttempts}), retrying...`);
              setTimeout(tryAssign, 100);
            } else {
              const error = new Error('Canvas not found after 5 seconds');
              console.error('❌', error.message);
              reject(error);
            }
          };

          tryAssign();
        });
      };

      // Wait for canvas to be ready before enabling AR
      await assignCanvas();
      setInAR(true);
    } catch (error) {
      console.error('AR error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFlipCamera = async () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    try {
      await arPlugin.flipCamera();
      toggleCamera();

      setTimeout(() => {
        applyRotationConfig();
      }, 100);
    } catch (error) {
      console.error('Flip camera error:', error);
    }
  };

  const handleSwitchFinger = () => {
    const arPlugin = arPluginRef.current;
    if (!arPlugin || !inAR) return;

    const newFinger = (currentFinger + 1) % 5;
    setCurrentFinger(newFinger);

    arPlugin.finger = (arPlugin.finger + 1) % 5;

    applyRotationConfig(currentHand, newFinger);
  };

  // Manual hand switch - commented out, using auto-detection instead
  // const handleSwitchHand = () => {
  //   if (!inAR) return;
  //
  //   const newHand = currentHand === 0 ? 1 : 0;
  //   setCurrentHand(newHand);
  //
  //   const handNames = ['Tay trái', 'Tay phải'];
  //   console.log('✋ Switched to:', handNames[newHand]);
  //
  //   applyRotationConfig(newHand, currentFinger);
  // };

  const getFingerName = (index) => {
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    return fingerNames[index] || 'Unknown';
  };

  const adjustRotation = (degrees) => {
    const newValue = (rotationY + degrees + 360) % 360;
    setRotationY(newValue);
  };

  const adjustRotationZ = (degrees) => {
    const newValue = (rotationZ + degrees + 360) % 360;
    setRotationZ(newValue);
  };

  const applyRotationConfig = (hand = currentHand, finger = currentFinger) => {
    const handNames = ['left', 'right'];
    const handType = handNames[hand];
    const fingerConfig = rotationConfig.backCamera?.[handType]?.[finger];

    if (isBackCamera && fingerConfig) {
      setRotationY(fingerConfig.y);
      setRotationZ(fingerConfig.z);
    } else {
      setRotationY(0);
      setRotationZ(0);
    }
  };

  const handleModelChange = async (newModelId) => {
    if (newModelId === currentModelId) {
      return;
    }

    if (inAR) {
      await stopAR();
    }

    // Manual cleanup BEFORE setting new model
    // Dispose viewer
    if (viewerAppRef.current) {
      try {
        viewerAppRef.current.dispose?.();
        console.log('✅ Viewer disposed in handleModelChange');
      } catch (err) {
        console.warn('⚠️ Viewer dispose error:', err);
      }
      viewerAppRef.current = null;
    }

    // DON'T clear container innerHTML - canvas needs to persist!
    // Viewer will reuse the existing canvas

    // Reset flag
    isInitializedRef.current = false;

    setCurrentModelId(newModelId);
  };

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

  console.log('🎨 RENDER Premium component');
  console.log('🎨 containerRef:', containerRef.current);
  console.log('🎨 styles:', styles);

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <div
        ref={containerRef}
        className={styles.viewerContainer}
        style={{
          border: '5px solid red',  // Debug: Red border to see if visible
          background: 'blue'         // Debug: Blue background
        }}
      >
        <canvas
          id="webgi-canvas"
          style={{
            width: '100%',
            height: '100%',
            border: '3px solid yellow'  // Debug: Yellow border
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
                  onChange={(e) => setRotationY(Number(e.target.value))}
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
                  onChange={(e) => setRotationZ(Number(e.target.value))}
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
        <button
          onClick={handleToggleAR}
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? 'Loading...' : inAR ? 'Exit AR' : 'Start AR'}
        </button>
        {inAR && (
          <>
            <button onClick={handleFlipCamera} className={styles.button}>
              Flip Camera
            </button>
            <button onClick={handleSwitchFinger} className={styles.button}>
              Switch Finger
            </button>
            {/* Manual hand switch - commented out, using auto-detection instead
            <button onClick={handleSwitchHand} className={styles.button}>
              {currentHand === 0 ? 'Left Hand' : 'Right Hand'}
            </button>
            */}
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
            <div className={styles.debugInfoItem}>
              <span className={styles.debugInfoLabel}>Bàn tay:</span>
              <span className={styles.debugInfoValue}>
                {currentHand === 0 ? 'Tay trái' : 'Tay phải'}
              </span>
            </div>
            {inAR && (
              <div className={styles.debugInfoItem}>
                <span className={styles.debugInfoLabel}>Hand Detection:</span>
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

export default Premium;
