import { useState, useCallback, useEffect } from 'react';

/**
 * useIJewelDebugControls Hook - Custom hook quản lý debug controls
 *
 * Chức năng:
 * - Quản lý position, rotation, scale của model
 * - Cập nhật transform qua tryon plugin API
 * - Export configuration ra JSON
 * - Copy configuration vào clipboard
 * - Override rotation Y cho các trường hợp đặc biệt
 */
export const useIJewelDebugControls = ({ tryon, modelName, currentHand, currentCamera, currentFinger, deviceType }) => {
  // ==========================================
  // STATES
  // ==========================================
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(1);

  // ==========================================
  // LOAD TRANSFORMS
  // ==========================================
  useEffect(() => {
    if (!tryon) return;

    // Delay để đảm bảo config đã load xong
    const loadTransforms = () => {
      const pos = tryon.modelPosition || { x: 0, y: 0, z: 0 };
      let rot = tryon.modelRotation || { x: 0, y: 0, z: 0 };
      const scl = tryon.modelScaleFactor !== undefined ? tryon.modelScaleFactor : 1;

      setPosition({ x: pos.x, y: pos.y, z: pos.z });
      setRotation({ x: rot.x, y: rot.y, z: rot.z });
      setScale(scl);

      console.log('📊 Loaded transforms for', modelName);
      console.log('   Position:', pos);
      console.log('   Rotation:', rot);
      console.log('   Scale:', scl);
    };

    // Load ngay lập tức và sau 500ms để đảm bảo config đã load
    loadTransforms();
    const timer = setTimeout(loadTransforms, 500);

    return () => clearTimeout(timer);
  }, [tryon, modelName]);

  // ==========================================
  // OVERRIDE ROTATION Y - Special Cases
  // ==========================================
  useEffect(() => {
    if (!tryon || !tryon.modelRotation) return;

    const isMobile = deviceType === 'Mobile';
    const isFrontCamera = isMobile ? currentCamera === 1 : true; // Desktop luôn là cam trước
    const isRightHand = currentHand === 1;

    // Chỉ apply cho: Tay phải + Cam trước
    if (isRightHand) {
      let newRotationY = null;

      // Ngón áp út (0) → rotation Y = -0.080
      if (currentFinger === 0) {
        newRotationY = -0.080;
      }
      // Ngón trỏ (3) → rotation Y = 0.8
      else if (currentFinger === 3) {
        newRotationY = 0.8;
      }
      // Ngón giữa (4) → rotation Y = 0.8
      else if (currentFinger === 4) {
        newRotationY = 0.8;
      }

      if (newRotationY !== null) {
        setRotation(prev => ({ ...prev, y: newRotationY }));
        tryon.modelRotation.y = newRotationY;
        console.log(`🔄 Override rotation Y for finger ${currentFinger}: ${newRotationY}`);
      }
    }
    // Tay trái → rotation Y = 0 cho tất cả các ngón
    else if (!isRightHand) {
      setRotation(prev => ({ ...prev, y: 0 }));
      tryon.modelRotation.y = 0;
      console.log(`🔄 Reset rotation Y for left hand: 0`);
    }
  }, [currentHand, currentCamera, currentFinger, deviceType, tryon]);

  // ==========================================
  // OVERRIDE POSITION X - Left Hand Back Camera
  // ==========================================
  useEffect(() => {
    if (!tryon || !tryon.modelPosition) return;

    const isMobile = deviceType === 'Mobile';
    const isBackCamera = isMobile ? currentCamera === 0 : false;
    const isLeftHand = currentHand === 0;

    // Tay trái + Cam sau + Ngón áp út (0) → position X = 0.060
    if (isLeftHand && currentFinger === 0) {
      setPosition(prev => ({ ...prev, x: 0.060 }));
      tryon.modelPosition.x = 0.060;
      console.log(`📍 Override position X for left hand back camera finger 0: 0.060`);
    }
    // Các trường hợp khác → reset position X về 0
    else {
      setPosition(prev => ({ ...prev, x: 0 }));
      tryon.modelPosition.x = 0;
      console.log(`📍 Reset position X to default: 0`);
    }
  }, [currentHand, currentCamera, currentFinger, deviceType, tryon]);

  // ==========================================
  // UPDATE FUNCTIONS
  // ==========================================

  const updatePosition = useCallback((axis, value) => {
    if (!tryon) return;

    const newPosition = { ...position, [axis]: value };
    setPosition(newPosition);

    if (tryon.modelPosition) {
      tryon.modelPosition[axis] = value;
    }

    console.log(`📍 Position ${axis.toUpperCase()}: ${value.toFixed(3)}`);
  }, [tryon, position]);

  const updateRotation = useCallback((axis, value) => {
    if (!tryon) return;

    const newRotation = { ...rotation, [axis]: value };
    setRotation(newRotation);

    if (tryon.modelRotation) {
      tryon.modelRotation[axis] = value;
    }

    console.log(`🔄 Rotation ${axis.toUpperCase()}: ${value.toFixed(0)}°`);
  }, [tryon, rotation]);

  const updateScale = useCallback((value) => {
    if (!tryon) return;

    setScale(value);

    if (tryon.modelScaleFactor !== undefined) {
      tryon.modelScaleFactor = value;
    }

    console.log(`📏 Scale: ${value.toFixed(2)}`);
  }, [tryon]);

  // ==========================================
  // EXPORT FUNCTIONS
  // ==========================================

  const exportConfig = useCallback(() => {
    const config = {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      scale: scale
    };

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName}_config.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('💾 Configuration exported:', config);
  }, [position, rotation, scale, modelName]);

  const copyToClipboard = useCallback(async () => {
    const config = {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      scale: scale
    };

    const json = JSON.stringify(config, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      alert('Configuration copied to clipboard!');
      console.log('📋 Configuration copied');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy configuration');
    }
  }, [position, rotation, scale]);

  return {
    position,
    rotation,
    scale,
    updatePosition,
    updateRotation,
    updateScale,
    exportConfig,
    copyToClipboard
  };
};
