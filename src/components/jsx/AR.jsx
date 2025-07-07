// src/components/jsx/AR.jsx

// --- IMPORT CÁC THƯ VIỆN VÀ MODULE CẦN THIẾT ---
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import '../css/AR.css';

// --- ĐỊNH NGHĨA COMPONENT AR ---
const AR = () => {
    // --- KHAI BÁO CÁC REF ĐỂ TRUY CẬP CÁC PHẦN TỬ DOM ---
    const videoRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const debugCanvasRef = useRef(null);
    
    // --- KHAI BÁO CÁC STATE CỦA COMPONENT ---
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");

    // --- SỬ DỤNG useRef ĐỂ LƯU TRỮ CÁC ĐỐI TƯỢNG KHÔNG GÂY RENDER LẠI ---
    const appState = useRef({
        handLandmarker: null,
        drawingUtils: null,
        animationFrameId: null,
        scene: null,
        camera: null,
        renderer: null,
        ringModel: null,
    }).current;

    // --- SỬ DỤNG useEffect ĐỂ KHỞI TẠO VÀ DỌN DẸP ---
    useEffect(() => {
        const initialize = async () => {
            await Promise.all([
                setupMediaPipe(),
                setupThreeScene(),
            ]);
            await startWebcam();
            startAnimationLoop();
        };

        const setupMediaPipe = async () => {
            setLoadingMessage("Tải mô hình nhận diện tay...");
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
            appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 1,
            });
            console.log("MediaPipe đã sẵn sàng.");
        };
        
        const setupThreeScene = async () => {
            setLoadingMessage("Chuẩn bị không gian 3D...");
            appState.scene = new THREE.Scene();
            appState.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
            appState.camera.position.z = 5;

            const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
            appState.scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(5, 5, 5);
            appState.scene.add(directionalLight);

            const loader = new GLTFLoader();
            return new Promise((resolve) => {
                loader.load('/models/ring_test_model.glb', 
                    (gltf) => {
                        console.log("✅ Model 3D đã được tải.");
                        appState.ringModel = gltf.scene;
                        
                        // **SỬA LỖI**: Đặt một kích thước ban đầu hợp lý. 
                        // Bạn có thể chỉnh sửa 3 số này để nhẫn to/nhỏ hơn.
                        appState.ringModel.scale.set(0.3, 0.3, 0.3); 
                        
                        appState.ringModel.visible = false;
                        appState.scene.add(appState.ringModel);
                        resolve();
                    }, 
                    undefined,
                    (error) => {
                        console.error("❌ Lỗi tải model:", error);
                        setLoadingMessage("Lỗi: Không tải được model.");
                    }
                );
            });
        };
        
        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: 'environment' } 
                });
                videoRef.current.srcObject = stream;
                
                return new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        const vWidth = videoRef.current.videoWidth;
                        const vHeight = videoRef.current.videoHeight;

                        threeCanvasRef.current.width = vWidth;
                        threeCanvasRef.current.height = vHeight;
                        debugCanvasRef.current.width = vWidth;
                        debugCanvasRef.current.height = vHeight;

                        appState.camera.aspect = vWidth / vHeight;
                        appState.camera.updateProjectionMatrix();

                        appState.renderer = new THREE.WebGLRenderer({
                            canvas: threeCanvasRef.current,
                            alpha: true,
                            antialias: true,
                        });
                        appState.renderer.setSize(vWidth, vHeight);
                        appState.renderer.setPixelRatio(window.devicePixelRatio);
                        console.log("Webcam và Renderer đã sẵn sàng.");
                        resolve();
                    };
                });
            } catch (error) {
                 console.error("Lỗi Webcam:", error);
                 setLoadingMessage("Không thể truy cập camera. Vui lòng cấp quyền.");
            }
        };
        
        const startAnimationLoop = () => {
            setLoadingMessage("");
            const debugCtx = debugCanvasRef.current.getContext('2d');
            appState.drawingUtils = new DrawingUtils(debugCtx);
            
            const animate = () => {
                if (videoRef.current && videoRef.current.readyState >= 4) {
                    const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                    processFrame(results, debugCtx);

                    if (appState.renderer) {
                        appState.renderer.render(appState.scene, appState.camera);
                    }
                }
                appState.animationFrameId = requestAnimationFrame(animate);
            };
            animate();
        };
        
        // **SỬA LỖI**: Hàm tính toán kích thước của khung nhìn camera ở một khoảng cách z nhất định
        const getCameraViewSize = (distance) => {
            const fovInRadians = (appState.camera.fov * Math.PI) / 180;
            const height = 2 * Math.tan(fovInRadians / 2) * distance;
            const width = height * appState.camera.aspect;
            return { width, height };
        };
        
        const processFrame = (results, ctx) => {
            drawHandLandmarks(ctx, results);

            if (results.landmarks && results.landmarks.length > 0 && appState.ringModel) {
                const landmarks = results.landmarks[0];
                
                if (landmarks[13] && landmarks[14]) {
                    appState.ringModel.visible = true;

                    const midX = (landmarks[13].x + landmarks[14].x) / 2;
                    const midY = (landmarks[13].y + landmarks[14].y) / 2;

                    // **SỬA LỖI**: Sử dụng phương pháp tính toán vị trí mới và đáng tin cậy hơn
                    // Đặt nhẫn ở một khoảng cách cố định trước camera
                    const distance = appState.camera.position.z - 1; 
                    const viewSize = getCameraViewSize(distance);

                    // Chuyển tọa độ [0,1] của màn hình sang tọa độ thế giới 3D
                    const worldX = (midX - 0.4) * viewSize.width;
                    const worldY = -(midY - 0.5) * viewSize.height; // Trục Y bị ngược

                    appState.ringModel.position.set(worldX, worldY, -distance);
                    
                } else {
                    appState.ringModel.visible = false;
                }
            } else {
                if (appState.ringModel) appState.ringModel.visible = false;
            }
        };

        // **CẬP NHẬT**: Hàm vẽ được nâng cấp để thêm các yêu cầu mới
        const drawHandLandmarks = (ctx, results) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (results.landmarks && results.landmarks.length > 0) {
                // Vẽ bộ xương
                for (const landmarks of results.landmarks) {
                    appState.drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: 'lime', lineWidth: 2 });
                }

                const firstHandLandmarks = results.landmarks[0];
                
                // **THÊM MỚI**: Đánh số cho từng landmark
                ctx.fillStyle = 'red';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < firstHandLandmarks.length; i++) {
                    const landmark = firstHandLandmarks[i];
                    const x = landmark.x * ctx.canvas.width;
                    const y = landmark.y * ctx.canvas.height;
                    
                    // Vẽ chấm tròn đỏ
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Viết số lên trên
                    ctx.fillStyle = 'white'; // Chữ màu trắng để nổi bật trên nền đỏ
                    ctx.fillText(i, x, y);
                    ctx.fillStyle = 'red'; // Reset lại màu cho vòng lặp tiếp theo
                }

                // **THÊM MỚI**: Hiển thị tay phải/trái
                if (results.handedness && results.handedness.length > 0) {
                    const handedness = results.handedness[0][0];
                    const handSide = handedness.displayName === 'Left' ? 'Tay Phải' : 'Tay Trái'; // MediaPipe nhìn từ camera, nên sẽ bị ngược
                    
                    const wrist = firstHandLandmarks[0]; // Landmark 0 là cổ tay
                    ctx.fillStyle = 'cyan';
                    ctx.font = 'bold 24px Arial';
                    ctx.fillText(handSide, wrist.x * ctx.canvas.width, wrist.y * ctx.canvas.height + 40);
                }
                
                // **CẬP NHẬT**: Vẽ điểm trung tâm với viền cyan
                if (firstHandLandmarks[13] && firstHandLandmarks[14]) {
                    const midpointX = ((firstHandLandmarks[13].x + firstHandLandmarks[14].x) / 2) * ctx.canvas.width;
                    const midpointY = ((firstHandLandmarks[13].y + firstHandLandmarks[14].y) / 2) * ctx.canvas.height;
                    
                    ctx.beginPath();
                    ctx.arc(midpointX, midpointY, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    ctx.strokeStyle = 'cyan';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
        };

        initialize();
        
        return () => {
             if (appState.animationFrameId) {
                cancelAnimationFrame(appState.animationFrameId);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [appState]);

    return (
        <>
            <div className="ar-jewelry-container">
                {loadingMessage && (
                    <div className="loading-overlay"><p>{loadingMessage}</p></div>
                )}
                <video ref={videoRef} className="ar-video" autoPlay playsInline muted></video>
                <canvas ref={debugCanvasRef} className="ar-canvas debug-canvas"></canvas>
                <canvas ref={threeCanvasRef} className="ar-canvas three-canvas"></canvas>
            </div>
        </>
    );
};

export default AR;