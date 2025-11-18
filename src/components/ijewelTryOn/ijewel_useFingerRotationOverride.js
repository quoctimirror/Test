import { useEffect } from 'react';

/**
 * useFingerRotationOverride Hook - Tự động override rotation.y cho mu bàn tay
 *
 * Chức năng:
 * - Đọc config fingerRotationY từ JSON (đã load vào tryon object)
 * - Tự động apply rotation.y khi camera/hand/finger thay đổi
 * - Mặc định rotation.y = 0 nếu không match điều kiện
 */
export const useFingerRotationOverride = ({ tryon, currentCamera, currentHand, currentFinger, deviceType }) => {

  useEffect(() => {
    if (!tryon || !tryon.modelRotation) return;

    // Xác định cam trước hay cam sau
    const isFrontCamera = (deviceType === 'Desktop') || (currentCamera === 1);
    const cameraType = isFrontCamera ? 'frontCamera' : 'backCamera';

    // Xác định tay trái/phải
    const handType = currentHand === 0 ? 'left' : currentHand === 1 ? 'right' : null;

    // Mặc định rotation.y = 0
    let rotationY = 0;

    // Đọc config từ tryon object (đã load từ JSON)
    const fingerRotationConfig = tryon.fingerRotationY;

    if (fingerRotationConfig && handType) {
      const cameraConfig = fingerRotationConfig[cameraType];

      if (cameraConfig && cameraConfig[handType]) {
        const fingerConfig = cameraConfig[handType][currentFinger.toString()];

        if (fingerConfig !== undefined) {
          rotationY = fingerConfig;
        }
      }
    }

    // Apply rotation.y
    tryon.modelRotation.y = rotationY;

    console.log(`🔄 Auto rotation.y applied: ${rotationY} (Camera: ${cameraType}, Hand: ${handType}, Finger: ${currentFinger})`);

  }, [tryon, currentCamera, currentHand, currentFinger, deviceType]);

};
