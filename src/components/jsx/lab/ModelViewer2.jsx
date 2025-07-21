// src/components/jsx/SimpleRingViewer.jsx
import React, { useRef, useEffect, useState } from 'react';
import { createViewerWithPreset } from '../../../utils/enhancedThree.js';

const ModelViewer2 = ({ modelPath = '/models/demo-ring.glb' }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (containerRef.current && !viewerRef.current) {
            initializeViewer();
        }

        return () => {
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
        };
    }, [modelPath]);

    const initializeViewer = async () => {
        try {
            setLoading(true);
            setError(null);

            // Tạo viewer với cấu hình tối ưu cho full screen
            viewerRef.current = createViewerWithPreset(
                containerRef.current,
                'GOLD_RING',
                {
                    modelPath: modelPath,
                    hdrPath: '/hdr/studio_small_03_4k.hdr',
                    modelScale: 3.5, // Tăng kích thước để nhẫn lớn hơn
                    modelPosition: { x: 0, y: 0, z: 0 }, // Đưa về giữa màn hình
                    cameraPosition: { x: 0, y: 0, z: 4 }, // Camera gần hơn
                    backgroundColor: 0xf0f0f0, // Màu nền sáng đẹp
                    enableMirror: true,
                    renderQuality: 'high'
                }
            );

            await viewerRef.current.init();

            console.log('Simple ring viewer initialized!');
            setLoading(false);

        } catch (err) {
            console.error('Failed to initialize viewer:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div style={errorStyle}>
                <h2>❌ Error Loading Ring</h2>
                <p>{error}</p>
                <button onClick={initializeViewer} style={retryButtonStyle}>
                    🔄 Retry
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* 3D Viewer - Full Screen */}
            <div
                ref={containerRef}
                style={canvasStyle}
            />

            {/* Loading Overlay */}
            {loading && (
                <div style={loadingOverlayStyle}>
                    <div style={spinnerStyle}></div>
                    <p style={loadingTextStyle}>Loading beautiful ring...</p>
                </div>
            )}

            {/* Subtle Instructions Overlay */}
            <div style={instructionsStyle}>
                <p>🖱️ Drag to rotate • 📱 Touch & drag on mobile</p>
            </div>
        </div>
    );
};

// Inline styles để tránh phụ thuộc CSS
const containerStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const canvasStyle = {
    width: '90vw',
    height: '80vh',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    background: '#f0f0f0',
    border: '4px solid white'
};

const loadingOverlayStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    zIndex: 1000
};

const spinnerStyle = {
    width: '60px',
    height: '60px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
};

const loadingTextStyle = {
    color: '#666',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const instructionsStyle = {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '10px 20px',
    borderRadius: '25px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
};

const instructionsStyle_p = {
    margin: '0',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const errorStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: 'center',
    padding: '20px'
};

const retryButtonStyle = {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease'
};

// CSS Animation (cần thêm vào global CSS hoặc styled-components)
const globalStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

${retryButtonStyle}:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}
`;

// Inject styles vào head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
}

export default ModelViewer2;