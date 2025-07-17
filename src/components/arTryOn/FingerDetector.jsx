// src/components/jsx/FingerDetector.jsx (Refactored & Fixed)
import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import '../css/FingerDetector.css';
import RealWorldCamera from './RealWorldCamera'; // Import camera chung

const FINGER_TIPS = {
    THUMB: 4, INDEX_FINGER: 8, MIDDLE_FINGER: 12, RING_FINGER: 16, PINKY: 20
};

const FingerDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const appState = useRef({
        handLandmarker: null,
        animationFrameId: null,
    }).current;
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");

    useEffect(() => {
        const init = async () => {
            setLoadingMessage("Đang tải mô hình nhận diện tay...");
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
                appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numHands: 2,
                });
                setLoadingMessage("Đang chờ cấp quyền camera...");
            } catch (error) {
                console.error("Lỗi khi khởi tạo MediaPipe:", error);
                setLoadingMessage("Không thể tải mô hình nhận diện.");
            }
        };
        init();
        return () => {
            cancelAnimationFrame(appState.animationFrameId);
        };
    }, [appState]);

    const startDetectionLoop = () => {
        if (!appState.handLandmarker) return;
        setLoadingMessage("");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const detect = () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
                appState.animationFrameId = requestAnimationFrame(detect);
                return;
            }
            const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (results.landmarks && results.landmarks.length > 0) {
                // Lặp qua mỗi bàn tay được phát hiện
                for (let i = 0; i < results.landmarks.length; i++) {
                    const landmarks = results.landmarks[i];
                    // Lấy thông tin tay trái/phải từ results.handedness
                    const handedness = results.handedness[i][0].displayName; 

                    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
                    drawLandmarks(ctx, landmarks, { color: '#FF0000', radius: 5 });
                    // Truyền handedness vào hàm vẽ nhãn
                    drawFingerLabels(ctx, landmarks, handedness); 
                }
            }
            appState.animationFrameId = requestAnimationFrame(detect);
        };
        detect();
    };
    
    // Các hàm vẽ không bị lật tọa độ X nữa
    const drawConnectors = (ctx, landmarks, connections, style) => {
        ctx.strokeStyle = style.color; ctx.lineWidth = style.lineWidth;
        for (const connection of connections) {
            const start = landmarks[connection[0]]; const end = landmarks[connection[1]];
            ctx.beginPath();
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            ctx.stroke();
        }
    };
    const drawLandmarks = (ctx, landmarks, style) => {
        ctx.fillStyle = style.color;
        for (const landmark of landmarks) {
            ctx.beginPath();
            ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, style.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    // *** THÊM LẠI HÀM VẼ NHÃN ***
    const drawFingerLabels = (ctx, landmarks, handedness) => {
        ctx.fillStyle = "white"; ctx.font = "bold 18px Arial"; ctx.textAlign = "center";
        
        // Hiển thị tên bàn tay (Tay Phải / Tay Trái)
        // Vì video không bị lật, 'Left' là tay trái và 'Right' là tay phải.
        const handLabel = handedness === 'Left' ? 'Tay Trái' : 'Tay Phải';
        ctx.fillText(handLabel, landmarks[0].x * ctx.canvas.width, landmarks[0].y * ctx.canvas.height - 30);

        // Hiển thị tên các ngón tay
        for (const [finger, tipIndex] of Object.entries(FINGER_TIPS)) {
            let fingerName = '';
            switch (finger) {
                case 'THUMB': fingerName = 'Ngón Cái'; break;
                case 'INDEX_FINGER': fingerName = 'Ngón Trỏ'; break;
                case 'MIDDLE_FINGER': fingerName = 'Ngón Giữa'; break;
                case 'RING_FINGER': fingerName = 'Ngón Áp Út'; break;
                case 'PINKY': fingerName = 'Ngón Út'; break;
                default: break;
            }
            if (fingerName) {
                ctx.fillText(fingerName, landmarks[tipIndex].x * ctx.canvas.width, landmarks[tipIndex].y * ctx.canvas.height - 15);
            }
        }
    };

    return (
        <div className="detector-container">
            {loadingMessage && <div className="loading-message">{loadingMessage}</div>}
            
            <RealWorldCamera
                ref={videoRef}
                onVideoLoaded={startDetectionLoop}
                onCameraError={setLoadingMessage}
            />
            
            <canvas ref={canvasRef} className="detector-canvas" width="640" height="480"></canvas>
        </div>
    );
};
export default FingerDetector;