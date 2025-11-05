import React, { useRef, useState, useEffect } from 'react';
import styles from './ijewel_TryOnAR.module.css';
import { useIJewelARTryOn } from './ijewel_useARTryOn';
import { useIJewelDebugControls } from './ijewel_useDebugControls';

/**
 * IJewel TryOnAR Component - Component chính cho AR Try-On nhẫn
 *
 * Props:
 * - modelName: Tên model cần load (vd: "heart", "oval", "refined_mirror_heart")
 * - onError: Callback khi có lỗi
 * - onModelLoad: Callback khi model load xong
 */
const IJewelTryOnAR = ({
  modelName = 'oval',
  onError,
  onModelLoad
}) => {
  // ==========================================
  // REFS - Tham chiếu đến DOM elements
  // ==========================================
  const canvasRef = useRef(null);
  const debugPanelRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  // ==========================================
  // CUSTOM HOOKS - Logic AR Try-On
  // ==========================================
  const {
    isLoading,
    loadingProgress,
    loadingText,
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

  // ==========================================
  // CUSTOM HOOKS - Debug Controls
  // ==========================================
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
    modelName
  });

  // ==========================================
  // CLICK OUTSIDE TO CLOSE DEBUG PANEL
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (debugPanelOpen &&
          debugPanelRef.current &&
          !debugPanelRef.current.contains(event.target)) {
        // Check if click is not on debug toggle button
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
      {/* Canvas Container */}
      <div className={styles.canvasContainer}>
        {/* Header */}
        <div className={styles.headerText}>
          <span className={styles.modelName}>
            {modelName.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          id="webgi-canvas"
          className={styles.canvas}
        />

        {/* Loading Screen */}
        {isLoading && (
          <LoadingScreen
            progress={loadingProgress}
            text={loadingText}
          />
        )}
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
          onPositionChange={updatePosition}
          onRotationChange={updateRotation}
          onScaleChange={updateScale}
          onExport={exportConfig}
          onCopy={copyToClipboard}
        />
      )}

      {/* Main Try-On Button */}
      <div className={styles.shineButtonWrap}>
        <ShineButton
          onClick={isARRunning ? stopAR : startAR}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isARRunning ? 'Stop' : 'TryOn'}
        </ShineButton>
      </div>

      {/* Try-On Control Buttons */}
      {isARRunning && (
        <div className={styles.tryonOptions}>
          <ShineButton onClick={flipCamera} small>
            Flip Camera
          </ShineButton>
          <ShineButton onClick={switchFinger} small>
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
// LOADING SCREEN COMPONENT
// ==========================================
const LoadingScreen = ({ progress, text }) => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <h1 className={styles.loadingTitle}>Loading...</h1>
        <p className={styles.loadingText}>{text}</p>
        <div className={styles.loadingProgressContainer}>
          <div
            className={styles.loadingProgressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DEBUG PANEL COMPONENT
// ==========================================
const DebugPanel = React.forwardRef(({
  position,
  rotation,
  scale,
  onPositionChange,
  onRotationChange,
  onScaleChange,
  onExport,
  onCopy
}, ref) => {
  const [positionStep, setPositionStep] = useState(0.01);
  const [rotationStep, setRotationStep] = useState(0.01);
  const [scaleStep, setScaleStep] = useState(0.001);

  return (
    <div ref={ref} className={styles.debugPanel}>
      <DebugSection title="📍 Position">
        <AxisControl
          label="X Axis"
          value={position.x}
          step={positionStep}
          onChange={(val) => onPositionChange('x', val)}
        />
        <AxisControl
          label="Y Axis"
          value={position.y}
          step={positionStep}
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
          step={rotationStep}
          onChange={(val) => onRotationChange('x', val)}
        />
        <AxisControl
          label="Y Axis (degrees)"
          value={rotation.y}
          step={rotationStep}
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
          step={scaleStep}
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

const StepSizeControl = ({ value, onChange, label }) => (
  <div className={styles.controlGroup}>
    <label className={styles.controlLabel}>{label}</label>
    <input
      type="number"
      className={styles.controlInput}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      step="0.001"
      min="0.0001"
    />
  </div>
);

const AxisControl = ({ label, value, step, onChange }) => {
  const handleDecrease = () => onChange(value - step);
  const handleIncrease = () => onChange(value + step);

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
          value={value.toFixed(3)}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
