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
  // STATES - Hoàn toàn độc lập, KHÔNG đọc từ SDK
  // ==========================================
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState(0.8); // Default từ standard_1.json

  // ==========================================
  // AUTO APPLY ROTATION Y khi thay đổi camera/hand/finger
  // ==========================================
  useEffect(() => {
    if (!tryon || !tryon.modelRotation) return;

    // Config rotation.y cho mu bàn tay
    const fingerRotationConfig = {
      frontCamera: {
        right: {
          3: 0.9,
          4: 0.9
        }
      },
      backCamera: {
        right: {
          3: 0.4,
          4: 0.4
        },
        left: {
          0: 0.19,
          1: 0.19,
          3: 0.19,
          4: 0.19
        }
      }
    };

    // Xác định cam trước hay cam sau
    const isFrontCamera = (deviceType === 'Desktop') || (currentCamera === 1);
    const cameraType = isFrontCamera ? 'frontCamera' : 'backCamera';

    // Xác định tay trái/phải
    const handType = currentHand === 0 ? 'left' : currentHand === 1 ? 'right' : null;

    // Mặc định rotation.y = 0
    let rotationY = 0;

    if (handType) {
      const cameraConfig = fingerRotationConfig[cameraType];

      if (cameraConfig && cameraConfig[handType]) {
        const fingerConfig = cameraConfig[handType][currentFinger];

        if (fingerConfig !== undefined) {
          rotationY = fingerConfig;
        }
      }
    }

    // Apply rotation.y vào SDK
    tryon.modelRotation.y = rotationY;

    // Update debug state để hiển thị
    setRotation(prev => ({ ...prev, y: rotationY }));

    console.log(`🔄 Auto rotation.y: ${rotationY} (${cameraType}, ${handType}, finger ${currentFinger})`);

  }, [tryon, currentCamera, currentHand, currentFinger, deviceType]);

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
