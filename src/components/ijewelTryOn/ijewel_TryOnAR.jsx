import React, { useRef, useState, useEffect } from 'react';
import styles from './ijewel_TryOnAR.module.css';
import { useIJewelARTryOn } from './ijewel_useARTryOn';
import { useIJewelDebugControls } from './ijewel_useDebugControls';
import { useMediaPipeHands } from './ijewel_useMediaPipeHands';

/**
 * IJewel TryOnAR Component - Component chính cho AR Try-On nhẫn
 * Clean loading - load thẳng vào AR try-on
 */
const IJewelTryOnAR = ({
  modelName = 'pear',
  onError,
  onModelLoad
}) => {
  // ==========================================
  // REFS
  // ==========================================
  const canvasRef = useRef(null);
  const debugPanelRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [currentFinger, setCurrentFinger] = useState(0);
  const [currentCamera, setCurrentCamera] = useState(0);
  const [currentHand, setCurrentHand] = useState(-1);
  const [deviceType, setDeviceType] = useState('Unknown');

  // ==========================================
  // CUSTOM HOOKS
  // ==========================================
  const {
    isARRunning,
    error,
    startAR,
    stopAR,
    flipCamera,
    switchFinger,
    saveImage,
    tryon
  } = useIJewelARTryOn({
    canvasRef,
    modelName,
    onError,
    onModelLoad
  });

  const {
    position,
    rotation,
    scale,
    updatePosition,
    updateRotation,
    updateScale,
    exportConfig,
    copyToClipboard
  } = useIJewelDebugControls({
    tryon,
    modelName,
    currentHand,
    currentCamera,
    currentFinger,
    deviceType
  });

  const { detectedHand } = useMediaPipeHands({
    canvasRef,
    isARRunning
  });

  // ==========================================
  // DETECT DEVICE TYPE
  // ==========================================
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'Mobile' : 'Desktop');
  }, []);

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const getFingerName = (index) => {
    const fingerNames = ['Ngón áp út', 'Ngón út', 'Ngón cái', 'Ngón trỏ', 'Ngón giữa'];
    return fingerNames[index] || 'Unknown';
  };

  const getCameraName = () => {
    const isMobile = deviceType === 'Mobile';
    if (isMobile) {
      return currentCamera === 0 ? 'Cam sau' : 'Cam trước';
    } else {
      return 'Cam trước';
    }
  };

  const getHandName = () => {
    if (currentHand === -1) return 'Chưa phát hiện';
    return currentHand === 0 ? 'Tay trái' : 'Tay phải';
  };

  // ==========================================
  // SYNC MEDIAPIPE HAND DETECTION
  // ==========================================
  useEffect(() => {
    setCurrentHand(detectedHand);
  }, [detectedHand]);

  const handleSwitchFinger = () => {
    const newFinger = (currentFinger + 1) % 5;
    setCurrentFinger(newFinger);
    switchFinger();
  };

  const handleFlipCamera = () => {
    const newCamera = (currentCamera + 1) % 2;
    setCurrentCamera(newCamera);
    flipCamera();
  };

  // ==========================================
  // CLICK OUTSIDE TO CLOSE DEBUG PANEL
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (debugPanelOpen &&
          debugPanelRef.current &&
          !debugPanelRef.current.contains(event.target)) {
        const debugToggle = document.querySelector(`.${styles.debugToggle}`);
        if (debugToggle && !debugToggle.contains(event.target)) {
          setDebugPanelOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [debugPanelOpen]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className={styles.container}>
      {/* Canvas Container - No loading screen */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          id="webgi-canvas"
          className={styles.canvas}
        />
      </div>

      {/* Debug Toggle Button */}
      <ShineButton
        className={styles.debugToggle}
        onClick={() => setDebugPanelOpen(!debugPanelOpen)}
      >
        🔧 Debug
      </ShineButton>

      {/* Debug Panel */}
      {debugPanelOpen && (
        <DebugPanel
          ref={debugPanelRef}
          position={position}
          rotation={rotation}
          scale={scale}
          currentFinger={currentFinger}
          fingerName={getFingerName(currentFinger)}
          onPositionChange={updatePosition}
          onRotationChange={updateRotation}
          onScaleChange={updateScale}
          onExport={exportConfig}
          onCopy={copyToClipboard}
        />
      )}

      {/* Main Try-On Button */}
      <div className={styles.shineButtonWrap}>
        <ShineButton onClick={isARRunning ? stopAR : startAR}>
          {isARRunning ? 'Stop' : 'TryOn'}
        </ShineButton>
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Thiết bị:</span>
          <span className={styles.infoValue}>{deviceType}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Camera:</span>
          <span className={styles.infoValue}>{getCameraName()}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Bàn tay:</span>
          <span className={styles.infoValue}>{getHandName()}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Ngón tay:</span>
          <span className={styles.infoValue}>{getFingerName(currentFinger)}</span>
        </div>
      </div>

      {/* Try-On Control Buttons */}
      {isARRunning && (
        <div className={styles.tryonOptions}>
          <ShineButton onClick={handleFlipCamera} small>
            Flip Camera
          </ShineButton>
          <ShineButton onClick={handleSwitchFinger} small>
            Switch Finger
          </ShineButton>
          <ShineButton onClick={saveImage} small>
            Save Image
          </ShineButton>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorMessage message={error} />
      )}
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

// ==========================================
// DEBUG PANEL COMPONENT
// ==========================================
const DebugPanel = React.forwardRef(({
  position,
  rotation,
  scale,
  currentFinger,
  fingerName,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onExport,
  onCopy
}, ref) => {
  return (
    <div ref={ref} className={styles.debugPanel}>
      <DebugSection title="👆 Current Finger">
        <div className={styles.fingerDisplay}>
          <span className={styles.fingerName}>{fingerName}</span>
          <span className={styles.fingerIndex}>(Index: {currentFinger})</span>
        </div>
      </DebugSection>
      <DebugSection title="📍 Position">
        <AxisControl
          label="X Axis"
          value={position.x}
          step={0.01}
          onChange={(val) => onPositionChange('x', val)}
        />
        <AxisControl
          label="Y Axis"
          value={position.y}
          step={0.01}
          onChange={(val) => onPositionChange('y', val)}
        />
        <AxisControl
          label="Z Axis"
          value={position.z}
          step={0.1}
          onChange={(val) => onPositionChange('z', val)}
        />
      </DebugSection>

      <DebugSection title="🔄 Rotation">
        <AxisControl
          label="X Axis (degrees)"
          value={rotation.x}
          step={0.01}
          onChange={(val) => onRotationChange('x', val)}
        />
        <AxisControl
          label="Y Axis (degrees)"
          value={rotation.y}
          step={0.01}
          onChange={(val) => onRotationChange('y', val)}
        />
        <AxisControl
          label="Z Axis (degrees)"
          value={rotation.z}
          step={0.1}
          onChange={(val) => onRotationChange('z', val)}
        />
      </DebugSection>

      <DebugSection title="📏 Scale">
        <AxisControl
          label="Uniform Scale"
          value={scale}
          step={0.001}
          onChange={onScaleChange}
        />
      </DebugSection>

      <DebugSection title="💾 Export">
        <button className={styles.exportBtn} onClick={onExport}>
          Export Configuration
        </button>
        <button className={styles.exportBtn} onClick={onCopy}>
          Copy to Clipboard
        </button>
      </DebugSection>
    </div>
  );
});

const DebugSection = ({ title, children }) => (
  <div className={styles.debugSection}>
    <h3>{title}</h3>
    {children}
  </div>
);

const AxisControl = ({ label, value, step, onChange }) => {
  const [inputValue, setInputValue] = React.useState(value.toFixed(3));
  const handleDecrease = () => onChange(value - step);
  const handleIncrease = () => onChange(value + step);

  React.useEffect(() => {
    setInputValue(value.toFixed(3));
  }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      setInputValue(value.toFixed(3));
    }
  };

  return (
    <div className={styles.controlGroup}>
      <label className={styles.controlLabel}>{label}</label>
      <div className={styles.controlRow}>
        <button className={styles.controlBtn} onClick={handleDecrease}>
          -
        </button>
        <input
          type="number"
          className={styles.controlInput}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
          step={step}
        />
        <button className={styles.controlBtn} onClick={handleIncrease}>
          +
        </button>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }) => (
  <div className={styles.errorMessage}>
    <span>❌ {message}</span>
  </div>
);

export default IJewelTryOnAR;
