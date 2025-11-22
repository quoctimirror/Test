import { useEffect, useRef, useState } from 'react';
import { useDeviceCamera } from '../ijewel_useDeviceCamera';
import styles from './IJewelARSimple_Clean.module.css';

const MODELS = [
  { id: 'Cs9yFentQsiL9VOyTa8Rdw', name: 'Fistion', basename: 'drive' },
  { id: 'bTfEBf0fSHaflMHTd4scxw', name: 'Myfav', basename: 'drive' },
  { id: 'MKyTIlEyRbi89oT6bH76yA', name: 'Pear', basename: 'drive' }
];

const IJewelARSimple = () => {
  const containerRef = useRef(null);
  const viewerAppRef = useRef(null);
  const arPluginRef = useRef(null);
  const isInitializedRef = useRef(false);

  const {
    deviceType,
    isMobile,
    cameraType,
    isBackCamera,
    getCameraName,
    updateCamera,
    toggleCamera
  } = useDeviceCamera();

  const [currentModelId, setCurrentModelId] = useState(MODELS[0].id);
  const [inAR, setInAR] = useState(false);
  const [fileConfig, setFileConfig] = useState(null);
  const [currentHand, setCurrentHand] = useState(0);
  const [currentFinger, setCurrentFinger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugExpanded, setIsDebugExpanded] = useState(true);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);

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

  useEffect(() => {
    if (inAR && arPluginRef.current?.modelRotation) {
      const rotationYRad = (rotationY * Math.PI) / 180;
      const rotationZRad = (rotationZ * Math.PI) / 180;

      arPluginRef.current.modelRotation.y = rotationYRad;
      arPluginRef.current.modelRotation.z = rotationZRad;

      console.log(`🔄 Applied rotation - Y: ${rotationY}°, Z: ${rotationZ}°`);
    }
  }, [inAR, rotationY, rotationZ]);

  useEffect(() => {
    const initViewer = async () => {
      if (isInitializedRef.current || !containerRef.current) {
        console.log('⏭️ Skipping initialization - already initialized or no container');
        return;
      }

      const currentModel = MODELS.find(m => m.id === currentModelId);
      if (!currentModel) {
        console.error('❌ Model not found:', currentModelId);
        return;
      }

      isInitializedRef.current = true;
      console.log(`🚀 Initializing iJewel Viewer with model: ${currentModel.name}`);

      const handleFileData = (event) => {
        const fileData = event.detail.iJewelFileData?.config;
        setFileConfig(JSON.parse(fileData));
      };

      window.addEventListener('ijewel-file-data', handleFileData);

      await window.ijewelViewer.loadModelById(currentModel.id, currentModel.basename, containerRef.current, {
        showUiButtons: false,
        hideTryOn: true
      });

      const handleViewerReady = (event) => {
        viewerAppRef.current = event.detail.viewer;
        console.log('✅ Viewer ready');
      };

      window.addEventListener('ijewel-viewer-ready', handleViewerReady);

      return () => {
        window.removeEventListener('ijewel-file-data', handleFileData);
        window.removeEventListener('ijewel-viewer-ready', handleViewerReady);
      };
    };

    initViewer();
  }, [currentModelId]);

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
      const arPlugin = await viewerApp.addPlugin(window.ij_vto.RingTryonPlugin);
      arPluginRef.current = arPlugin;

      arPlugin.modelScaleFactor = 0.6;
      arPlugin.occluderScaleFactor = 0.9;
      console.log('✅ Applied scale factors');

      if (fileConfig?.tryonConfig) {
        fileConfig.tryonConfig.type = 'RingTryonPlugin';
        arPlugin.fromJSON(fileConfig?.tryonConfig);
        console.log('✅ Applied Drive config (override)');
      }

      await arPlugin.start();

      if (isMobile) {
        console.log('📱 Mobile detected - flipping to back camera...');
        await arPlugin.flipCamera();
        updateCamera(0);
        console.log('✅ Flipped to back camera');
      }

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

    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    console.log('👆 Switched to:', fingerNames[newFinger], '(Index:', newFinger, ')');

    applyRotationConfig(currentHand, newFinger);
  };

  const handleSwitchHand = () => {
    if (!inAR) return;

    const newHand = currentHand === 0 ? 1 : 0;
    setCurrentHand(newHand);

    const handNames = ['Tay trái', 'Tay phải'];
    console.log('✋ Switched to:', handNames[newHand]);

    applyRotationConfig(newHand, currentFinger);
  };

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
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    const handNames = ['left', 'right'];
    const handType = handNames[hand];
    const fingerConfig = rotationConfig.backCamera?.[handType]?.[finger];

    if (isBackCamera && fingerConfig) {
      setRotationY(fingerConfig.y);
      setRotationZ(fingerConfig.z);
      const handLabel = hand === 0 ? 'Tay trái' : 'Tay phải';
      console.log(`✅ Applied config (${handLabel}, ${fingerNames[finger]}): Y=${fingerConfig.y}°, Z=${fingerConfig.z}°`);
    } else {
      setRotationY(0);
      setRotationZ(0);
      console.log('🔄 Reset rotation to default: Y=0°, Z=0°');
    }
  };

  const handleModelChange = async (newModelId) => {
    if (newModelId === currentModelId) return;

    const newModel = MODELS.find(m => m.id === newModelId);
    console.log(`🔄 Switching to model: ${newModel?.name}`);

    if (inAR) {
      console.log('⏸️ Stopping AR before model change...');
      await stopAR();
    }

    isInitializedRef.current = false;
    setCurrentModelId(newModelId);
  };

  const handleContainerClick = () => {
    if (isDebugExpanded) {
      setIsDebugExpanded(false);
    }
  };

  const handleDebugPanelClick = (e) => {
    e.stopPropagation();
    setIsDebugExpanded(!isDebugExpanded);
  };

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <div ref={containerRef} className={styles.viewerContainer}></div>

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
        <div className={styles.rotationSliderPanel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.rotationLabel}>
            🔄 Rotation Y: {rotationY}°
          </div>
          <div className={styles.sliderRow}>
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
        </div>
      )}

      {inAR && (
        <div className={styles.rotationSliderPanelZ} onClick={(e) => e.stopPropagation()}>
          <div className={styles.rotationLabel}>
            🔄 Rotation Z: {rotationZ}°
          </div>
          <div className={styles.sliderRow}>
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
            <button onClick={handleSwitchHand} className={styles.button}>
              {currentHand === 0 ? 'Left Hand' : 'Right Hand'}
            </button>
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

export default IJewelARSimple;
