// src/components/jsx/CameraTest.jsx (Refactored)
import React, { useRef, useState } from 'react';
import RealWorldCamera from './RealWorldCamera'; // Import component camera chung
import '../css/FingerDetector.css'; // Tái sử dụng CSS để hiển thị message

const styles = {
    container: {
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '4 / 3',
        position: 'relative',
        border: '5px solid #007bff',
        overflow: 'hidden',
        backgroundColor: '#000',
    }
};

const CameraTest = () => {
    const videoRef = useRef(null);
    const [message, setMessage] = useState('Đang yêu cầu quyền truy cập camera...');

    return (
        <div style={styles.container}>
            {message && <div className="loading-message">{message}</div>}
            
            <RealWorldCamera 
                ref={videoRef}
                onVideoLoaded={() => setMessage('')} // Khi video sẵn sàng, xóa message
                onCameraError={setMessage}          // Khi có lỗi, hiển thị lỗi
            />
        </div>
    );
};

export default CameraTest;