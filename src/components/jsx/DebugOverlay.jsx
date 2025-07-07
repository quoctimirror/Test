// src/components/jsx/DebugOverlay.jsx
import React from 'react';
import * as THREE from 'three';
import '../css/DebugOverlay.css';

// Component giờ nhận 2 props: handData và ringModel
const DebugOverlay = ({ handData, ringModel }) => {
  // --- Dữ liệu Tay (từ MediaPipe) ---
  const renderHandData = () => {
    if (!handData) {
      return <pre>Hand: Not Detected</pre>;
    }
    // handData là mảng landmarks, chúng ta lấy điểm gốc cổ tay (index 0) làm đại diện
    const wrist = handData[0]; 
    return (
      <pre>
        {`Hand (Raw MediaPipe):\n`}
        {`  X: ${wrist.x.toFixed(3)} (normalized)\n`}
        {`  Y: ${wrist.y.toFixed(3)} (normalized)\n`}
        {`  Z: ${wrist.z.toFixed(3)} (relative depth)`}
      </pre>
    );
  };

  // --- Dữ liệu Nhẫn (từ Three.js) ---
  const renderRingData = () => {
    if (!ringModel) {
      return <pre>{`\nRing: Not Loaded`}</pre>;
    }
    const pos = ringModel.position;
    const rot = new THREE.Euler().setFromQuaternion(ringModel.quaternion);
    return (
      <pre>
        {`\nRing (3D World):\n`}
        {`  Pos X: ${pos.x.toFixed(2)}\n`}
        {`  Pos Y: ${pos.y.toFixed(2)}\n`}
        {`  Pos Z: ${pos.z.toFixed(2)}\n`}
        {`  Rot X: ${THREE.MathUtils.radToDeg(rot.x).toFixed(1)}°\n`}
        {`  Rot Y: ${THREE.MathUtils.radToDeg(rot.y).toFixed(1)}°\n`}
        {`  Rot Z: ${THREE.MathUtils.radToDeg(rot.z).toFixed(1)}°`}
      </pre>
    );
  };

  return (
    <div className="debug-overlay">
      <strong>Real-time Data</strong>
      {renderHandData()}
      {renderRingData()}
    </div>
  );
};

export default DebugOverlay;