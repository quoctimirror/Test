import React, { useEffect, useRef, useState } from 'react';
import styles from './premium.module.css';

/**
 * Premium Component - Simple 3D Viewer (NO AR)
 * Chỉ load model và hiển thị 360° viewer
 */

// ==========================================
// MODELS CONFIG
// ==========================================
const MODELS = [
  { id: "Cs9yFentQsiL9VOyTa8Rdw", name: "Fistion", basename: 'drive' },
  { id: "bTfEBf0fSHaflMHTd4scxw", name: "Myfav", basename: 'drive' },
  { id: "MKyTIlEyRbi89oT6bH76yA", name: "Pear", basename: 'drive' },
];

const Premium = () => {
  // ==========================================
  // REFS
  // ==========================================
  const containerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ==========================================
  // STATES
  // ==========================================
  const [currentModelId, setCurrentModelId] = useState(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // INITIALIZE VIEWER
  // ==========================================
  useEffect(() => {
    const initViewer = async () => {
      // Prevent double initialization
      if (isInitializedRef.current || !containerRef.current) {
        return;
      }

      // Get current model config
      const currentModel = MODELS.find(m => m.id === currentModelId);
      if (!currentModel) {
        console.error('❌ Model not found:', currentModelId);
        return;
      }

      isInitializedRef.current = true;
      setIsLoading(true);
      console.log(`🚀 Loading model: ${currentModel.name}`);

      try {
        // Load model by ID
        await window.ijewelViewer.loadModelById(
          currentModel.id,
          currentModel.basename,
          containerRef.current,
          {
            showUiButtons: false,
            hideTryOn: true
          }
        );

        console.log('✅ Model loaded successfully');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading model:', error);
        setIsLoading(false);
      }
    };

    initViewer();
  }, [currentModelId]);

  // ==========================================
  // HANDLE MODEL CHANGE
  // ==========================================
  const handleModelChange = (newModelId) => {
    if (newModelId === currentModelId) return;

    const newModel = MODELS.find(m => m.id === newModelId);
    console.log(`🔄 Switching to model: ${newModel?.name}`);

    // Reset initialization flag to allow reload
    isInitializedRef.current = false;

    // Update model ID → will trigger useEffect to reload
    setCurrentModelId(newModelId);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className={styles.container}>
      {/* Viewer Container */}
      <div ref={containerRef} className={styles.viewerContainer}></div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingText}>Loading model...</div>
        </div>
      )}

      {/* Model Selector */}
      <div className={styles.modelSelectorContainer}>
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

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoTitle}>🎨 Premium 3D Viewer</div>
        <div className={styles.infoText}>
          Drag để xoay • Scroll để zoom • Right-click để pan
        </div>
      </div>
    </div>
  );
};

export default Premium;
