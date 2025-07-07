// src/App.jsx
import React, { useState } from 'react';

// Import tất cả các component cần thiết
import FingerDetector from './components/jsx/FingerDetector';
import RingFingerDetector from './components/jsx/RingFingerDetector';
import ModelViewer from './components/jsx/ModelViewer';
// Bỏ comment dòng này nếu bạn có component CameraTest
// import CameraTest from './components/jsx/CameraTest'; 
// --- BƯỚC 1.1: IMPORT COMPONENT MỚI ---
import ARJewelryTryOn from './components/jsx/ARJewelryTryOn';
import AR from './components/jsx/AR';
import AR1 from './components/jsx/AR1';
import AR2_SmoothlyMotion from './components/jsx/AR2_SmoothlyMotion';
import AR3_rotateRingZ from './components/jsx/AR3_rotateRingZ';
import './App.css';


function App() {
  // Đặt chế độ mặc định là 'ar_tryon' để dễ dàng kiểm tra ngay
  const [mode, setMode] = useState('ar_tryon');

  return (
    <div className="App">
      <header className="app-header-custom">
        <h1>💍 Virtual Ring Try-On</h1>
        <p>Select a feature to test below.</p>
      </header>

      {/* <AR1 /> */}
      {/* <AR2_SmoothlyMotion /> */}
      <AR3_rotateRingZ />
      
      
      {/* Sử dụng <nav> cho ngữ nghĩa tốt hơn */}
      {/* <nav className="mode-switcher">
        <button 
          className={`mode-button ${mode === 'ar_tryon' ? 'active' : ''}`}
          onClick={() => setMode('ar_tryon')}
        >
          ✨ AR Try-On
        </button>
        <button 
          className={`mode-button ${mode === 'full_detector' ? 'active' : ''}`}
          onClick={() => setMode('full_detector')}
        >
          Full Hand Detector
        </button>
        <button 
          className={`mode-button ${mode === 'ring_detector' ? 'active' : ''}`}
          onClick={() => setMode('ring_detector')}
        >
          Ring Finger Only
        </button>
        <button 
          className={`mode-button ${mode === 'viewer' ? 'active' : ''}`}
          onClick={() => setMode('viewer')}
        >
          3D Model Viewer
        </button>
      </nav> */}
      
      <main className="app-main">
        {/* --- BƯỚC 1.3: THÊM LOGIC RENDER CHO COMPONENT AR --- */}
        {/* {mode === 'ar_tryon' && <ARJewelryTryOn />}
        {mode === 'full_detector' && <FingerDetector />}
        {mode === 'ring_detector' && <RingFingerDetector />}
        {mode === 'viewer' && <ModelViewer />} */}
      </main>
    </div>
  );
}

export default App;