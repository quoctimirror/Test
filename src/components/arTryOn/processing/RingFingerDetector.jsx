import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import '../css/RingFingerDetector.css';
import RealWorldCamera from './RealWorldCamera';

// --- Các Hằng số (Không thay đổi) ---
const RING_FINGER_LANDMARKS = [0, 13, 14, 15, 16];
const RING_FINGER_TIP_INDEX = 16;
const RING_FINGER_BASE_INDEX = 13;
const RING_FINGER_NEXT_JOINT_INDEX = 14;
const RING_FINGER_CONNECTIONS = [[0, 13], [13, 14], [14, 15], [15, 16]];


// --- Component con để hiển thị dữ liệu (Không thay đổi) ---
const HandDataOverlay = ({ data }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="data-overlay-container">
            {data.map(hand => (
                <div key={hand.id} className="hand-data-box">
                    <strong>{hand.handedness === 'Left' ? 'Tay Trái' : 'Tay Phải'}</strong>
                    <div className="data-group">
                        <span>Position:</span>
                        <pre> X: {hand.position.x.toFixed(2)}{'\n'} Y: {hand.position.y.toFixed(2)}{'\n'} Z: {hand.position.z.toFixed(2)}</pre>
                    </div>
                    <div className="data-group">
                        <span>Rotation (°):</span>
                        <pre> Pitch(X): {hand.rotation.x.toFixed(1)}{'\n'} Yaw(Y):   {hand.rotation.y.toFixed(1)}{'\n'} Roll(Z):  {hand.rotation.z.toFixed(1)}</pre>
                    </div>
                </div>
            ))}
        </div>
    );
};


const RingFingerDetector = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");
    const [handData, setHandData] = useState([]);
    
    // SỬA LỖI 1: Dùng useRef đúng cách. `detectorState` là một đối tượng ổn định qua các lần render.
    const detectorState = useRef({
        handLandmarker: null,
        animationFrameId: null
    });

    // SỬA LỖI 2: Dependency array rỗng `[]` để `useEffect` chỉ chạy một lần.
    useEffect(() => {
        const init = async () => {
            setLoadingMessage("Tải mô hình nhận diện...");
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
            
            // Truy cập qua `detectorState.current`
            detectorState.current.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU",
                },
                runningMode: "VIDEO", numHands: 2,
            });
            setLoadingMessage("Mở camera...");
        };

        init().catch(err => {
            console.error("Lỗi khởi tạo HandLandmarker:", err);
            setLoadingMessage("Không thể khởi tạo mô hình nhận diện.");
        });

        // Hàm dọn dẹp cũng truy cập qua ref
        return () => {
            if (detectorState.current.animationFrameId) {
                cancelAnimationFrame(detectorState.current.animationFrameId);
            }
        };
    }, []); // Dependency array rỗng `[]` là mấu chốt để sửa lỗi.

    // TỐI ƯU 1: Bọc các hàm tính toán và vẽ trong `useCallback` để chúng không bị tạo lại.
    const calculateRingFingerTransform = useCallback((landmarks) => {
        const basePoint = landmarks[RING_FINGER_BASE_INDEX];
        const nextJointPoint = landmarks[RING_FINGER_NEXT_JOINT_INDEX];
        const position = { x: basePoint.x, y: basePoint.y, z: basePoint.z * -100 };
        const direction = new THREE.Vector3(
            nextJointPoint.x - basePoint.x,
            nextJointPoint.y - basePoint.y,
            nextJointPoint.z - basePoint.z
        ).normalize();
        const yaw = Math.atan2(direction.x, -direction.z);
        const pitch = Math.asin(-direction.y);
        const rotation = {
            x: THREE.MathUtils.radToDeg(pitch),
            y: THREE.MathUtils.radToDeg(yaw),
            z: 0
        };
        return { position, rotation };
    }, []);

    const highlightRingFinger = useCallback((ctx, landmarks, handedness) => {
        const canvasWidth = ctx.canvas.width; const canvasHeight = ctx.canvas.height;
        ctx.strokeStyle = '#00FF00'; ctx.lineWidth = 6;
        for (const connection of RING_FINGER_CONNECTIONS) {
            const start = landmarks[connection[0]]; const end = landmarks[connection[1]];
            ctx.beginPath(); ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
            ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight); ctx.stroke();
        }
        for (const index of RING_FINGER_LANDMARKS) {
            const landmark = landmarks[index]; const x = landmark.x * canvasWidth; const y = landmark.y * canvasHeight;
            if (index === RING_FINGER_TIP_INDEX) { ctx.fillStyle = '#e60073'; }
            else if (index === RING_FINGER_BASE_INDEX) { ctx.fillStyle = '#61dafb'; }
            else { ctx.fillStyle = '#FF4136'; }
            ctx.beginPath(); ctx.arc(x, y, 8, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(index, x, y + 15);
        }
        const tip = landmarks[RING_FINGER_TIP_INDEX];
        const handLabel = handedness === 'Left' ? 'Tay Trái' : 'Tay Phải';
        ctx.fillStyle = "white"; ctx.font = "bold 20px Arial"; ctx.textAlign = "center"; ctx.textBaseline = 'bottom';
        ctx.fillText(handLabel, tip.x * canvasWidth, tip.y * canvasHeight - 20);
    }, []);

    // TỐI ƯU 2: Bọc hàm chính trong useCallback để truyền vào RealWorldCamera một cách ổn định.
    const startDetectionLoop = useCallback(() => {
        const landmarker = detectorState.current.handLandmarker;
        if (!landmarker) {
            console.log("Chờ HandLandmarker khởi tạo xong...");
            return;
        }
        
        setLoadingMessage("");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const detect = () => {
            const video = videoRef.current;
            // Kiểm tra kỹ hơn: video phải tồn tại và có dữ liệu để xử lý
            if (!video || video.paused || video.ended || video.readyState < 2) {
                detectorState.current.animationFrameId = requestAnimationFrame(detect);
                return;
            }

            const results = landmarker.detectForVideo(video, performance.now());
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentFrameHandData = [];
            if (results.landmarks) {
                for (const [index, landmarks] of results.landmarks.entries()) {
                    const handedness = results.handedness[index][0].displayName;
                    highlightRingFinger(ctx, landmarks, handedness);
                    const transform = calculateRingFingerTransform(landmarks);
                    currentFrameHandData.push({ id: index, handedness, ...transform });
                }
            }
            setHandData(currentFrameHandData);
            detectorState.current.animationFrameId = requestAnimationFrame(detect);
        };
        detect();
    }, [calculateRingFingerTransform, highlightRingFinger]); // Phụ thuộc vào các hàm đã được memoize

    return (
        <div className="ring-detector-container">
            {loadingMessage && <div className="loading-message">{loadingMessage}</div>}
            
            <RealWorldCamera
                ref={videoRef}
                onVideoLoaded={startDetectionLoop}
                onCameraError={setLoadingMessage}
            />
            <canvas ref={canvasRef} className="ring-detector-canvas" width="640" height="480"></canvas>
            
            <HandDataOverlay data={handData} />
        </div>
    );
};

export default RingFingerDetector;
