import { useState, useEffect } from 'react';

/**
 * useDeviceCamera Hook - Detect device type and camera
 *
 * Returns:
 * - deviceType: 'Mobile' | 'Desktop'
 * - cameraType: 'front' | 'back'
 * - isFrontCamera: boolean
 * - isBackCamera: boolean
 * - updateCamera: function to update camera state
 *
 * Default:
 * - Desktop: front camera
 * - Mobile: back camera
 */
export const useDeviceCamera = () => {
  // ==========================================
  // STATES
  // ==========================================
  const [deviceType, setDeviceType] = useState('Unknown');
  const [currentCamera, setCurrentCamera] = useState(0); // 0 = back (mobile) / front (desktop), 1 = front (mobile)

  // ==========================================
  // DETECT DEVICE TYPE ON MOUNT
  // ==========================================
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const type = isMobile ? 'Mobile' : 'Desktop';
    setDeviceType(type);
    console.log('📱 Device type detected:', type);
  }, []);

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  const isMobile = deviceType === 'Mobile';
  const isDesktop = deviceType === 'Desktop';

  // Desktop: always front camera (currentCamera is ignored)
  // Mobile: 0 = back camera, 1 = front camera
  const isFrontCamera = isDesktop || (isMobile && currentCamera === 1);
  const isBackCamera = isMobile && currentCamera === 0;

  const cameraType = isFrontCamera ? 'front' : 'back';

  // ==========================================
  // CAMERA NAME
  // ==========================================
  const getCameraName = () => {
    if (isDesktop) return 'Cam trước';
    return currentCamera === 0 ? 'Cam sau' : 'Cam trước';
  };

  // ==========================================
  // UPDATE CAMERA
  // ==========================================
  const updateCamera = (newCameraIndex) => {
    setCurrentCamera(newCameraIndex);
    console.log('📷 Camera updated:', newCameraIndex === 0 ? 'Back/Default' : 'Front');
  };

  const toggleCamera = () => {
    const newCamera = (currentCamera + 1) % 2;
    updateCamera(newCamera);
  };

  // ==========================================
  // RETURN
  // ==========================================
  return {
    // Device info
    deviceType,
    isMobile,
    isDesktop,

    // Camera info
    currentCamera,
    cameraType,
    isFrontCamera,
    isBackCamera,
    getCameraName,

    // Actions
    updateCamera,
    toggleCamera
  };
};
