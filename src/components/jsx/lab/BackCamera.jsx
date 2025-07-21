import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import { modelLoader } from '../../../utils/modelLoader.js';
import './BackCamera.css';

// --- CÁC HÀM HỖ TRỢ TÍNH TOÁN VECTOR (Không đổi) ---
const subtract = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const crossProduct = (v1, v2) => ({ x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x });
const normalize = (v) => {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
};
const toThreeVector = (v) => new THREE.Vector3(v.x, v.y, v.z);
const distance = (v1, v2) => Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));

// --- CÁC HẰNG SỐ CẤU HÌNH (Không đổi) ---
const AXIS_THICKNESS = 5;
const ORIGIN_POINT_SIZE = 6;
const RING_INNER_DIAMETER_MM = 18.1;

const BackCamera = () => {
    const videoRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const debugCanvasRef = useRef(null);

    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [handDetected, setHandDetected] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [fingerWidth, setFingerWidth] = useState(null);
    const [ringDiameter, setRingDiameter] = useState(null);
    const [ringSize, setRingSize] = useState(null);
    const [error, setError] = useState(null);

    const appState = useRef({
        handLandmarker: null,
        animationFrameId: null,
        videoStream: null,
        scene: null,
        camera: null,
        renderer: null,
        ringModel: null,
        isInitialized: false,
    }).current;

    // --- CÁC HÀM KHỞI TẠO ĐƯỢC TÁCH RIÊNG ---

    const setupMediaPipe = async () => {
        setLoadingMessage("Loading hand model...");
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
        appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
            outputWorldLandmarks: true,
        });
    };

    const startWebcam = async () => {
        setLoadingMessage("Starting camera...");
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera not supported by this browser.");
        }
        // Đây là nơi trình duyệt sẽ hiển thị hộp thoại xin quyền
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        appState.videoStream = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await new Promise((resolve) => {
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    resolve();
                };
            });
        }
    };

    const setupThreeJS = () => {
        const video = videoRef.current;
        const canvas = threeCanvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        debugCanvasRef.current.width = video.videoWidth;
        debugCanvasRef.current.height = video.videoHeight;

        appState.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        appState.renderer.setSize(canvas.width, canvas.height);
        appState.renderer.setPixelRatio(window.devicePixelRatio);
        appState.renderer.outputEncoding = THREE.sRGBEncoding;
        appState.scene = new THREE.Scene();

        const verticalFovDegrees = 55;
        const aspect = canvas.width / canvas.height;
        appState.camera = new THREE.PerspectiveCamera(verticalFovDegrees, aspect, 0.1, 1000);
        appState.camera.position.set(0, 0, 0);

        appState.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(0, 5, 5);
        appState.scene.add(dirLight);

        if (appState.ringModel) {
            appState.scene.add(appState.ringModel);
            appState.ringModel.visible = false;
        }
    };

    const startDetectionLoop = () => {
        setLoadingMessage("");
        setError(null);

        const detect = () => {
            if (!appState.videoStream?.active) {
                console.error("Camera stream lost.");
                setError("Camera stream was lost. Please try again.");
                if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
                return;
            }

            if (videoRef.current?.readyState >= 4 && appState.handLandmarker) {
                const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                processDetections(results);
            }
            appState.animationFrameId = requestAnimationFrame(detect);
        };
        detect();
    };

    // Hàm khởi tạo chính, có khả năng xử lý lỗi
    const initialize = async () => {
        setError(null);
        setLoadingMessage("Initializing...");

        try {
            if (!appState.ringModel) {
                setLoadingMessage("Loading 3D Ring Model...");
                const modelContainer = await modelLoader('/models/demo-ring.glb');
                const axesGroup = modelContainer.children[1];
                if (axesGroup) { axesGroup.visible = true; }
                appState.ringModel = modelContainer;
            }
            if (!appState.handLandmarker) { await setupMediaPipe(); }
            await startWebcam();
            if (!appState.renderer) { setupThreeJS(); }
            startDetectionLoop();
            appState.isInitialized = true;
        } catch (err) {
            console.error("Initialization failed:", err);
            // Xử lý các loại lỗi khác nhau để đưa ra thông báo phù hợp
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera access was denied. Please allow camera permission in your browser settings and try again.");
            } else {
                setError(err.message || "Could not access camera. Please check connection and try again.");
            }
            setLoadingMessage("");
        }
    };

    useEffect(() => {
        if (!appState.isInitialized && !capturedImage) {
            initialize();
        }
        return () => {
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            if (appState.videoStream) {
                appState.videoStream.getTracks().forEach(track => track.stop());
                appState.videoStream = null;
            }
        };
    }, [capturedImage]);

    // Hàm này và các hàm tính toán bên dưới không có thay đổi
    const processDetections = (results) => {
        const { ringModel, camera, renderer } = appState;
        const debugCtx = debugCanvasRef.current.getContext('2d');

        renderer.clear();
        debugCtx.clearRect(0, 0, debugCanvasRef.current.width, debugCanvasRef.current.height);

        const isHandVisible = results.landmarks?.length > 0 && results.handedness?.length > 0;
        setHandDetected(isHandVisible);

        if (ringModel) ringModel.visible = isHandVisible;

        // Kiểm tra có đầy đủ dữ liệu cần thiết không
        if (isHandVisible && results.worldLandmarks?.length > 0) {
            const landmarks = results.landmarks[0]; // Tọa độ trên màn hình (để định vị và xoay)
            const worldLandmarks = results.worldLandmarks[0]; // Tọa độ thế giới thực (để đo kích thước)
            const hand = results.handedness[0][0].categoryName;
            const canvasWidth = debugCanvasRef.current.width;
            const canvasHeight = debugCanvasRef.current.height;

            // --- 1. TÍNH TOÁN HỆ TRỤC TỌA ĐỘ ---
            const yVec = normalize(subtract(landmarks[16], landmarks[13]));
            let zVecRaw = crossProduct(subtract(landmarks[5], landmarks[0]), subtract(landmarks[17], landmarks[0]));
            if (hand === 'Left') zVecRaw = { x: -zVecRaw.x, y: -zVecRaw.y, z: -zVecRaw.z };
            const zVec = normalize(zVecRaw);
            const xVec = normalize(crossProduct(yVec, zVec));

            // --- 2. TÍNH TOÁN VỊ TRÍ ---
            const midpoint = { x: (landmarks[13].x + landmarks[14].x) / 2, y: (landmarks[13].y + landmarks[14].y) / 2, z: (landmarks[13].z + landmarks[14].z) / 2 };
            const worldPosition = new THREE.Vector3((midpoint.x - 0.5) * 2, -(midpoint.y - 0.5) * 2, 0.5).unproject(camera);
            worldPosition.z = -(midpoint.z + 0.5) * 100;

            // --- 3. TÍNH TOÁN KÍCH THƯỚC VÀ TỶ LỆ CHÍNH XÁC ---
            const w13 = worldLandmarks[13];
            const w14 = worldLandmarks[14];
            const fingerWidthMeters = distance(w13, w14);
            const fingerWidthMm = fingerWidthMeters * 1000;

            const scale = fingerWidthMm / RING_INNER_DIAMETER_MM;

            setFingerWidth(fingerWidthMm.toFixed(1));
            setRingDiameter(fingerWidthMm.toFixed(1));
            setRingSize(getRingSize(fingerWidthMm));

            // --- 4. ÁP DỤNG VÀO MÔ HÌNH 3D ---
            if (ringModel) {
                ringModel.position.copy(worldPosition);
                ringModel.scale.set(scale, scale, scale);
                const rotationMatrix = new THREE.Matrix4().makeBasis(toThreeVector(xVec), toThreeVector(yVec), toThreeVector(zVec));
                ringModel.quaternion.setFromRotationMatrix(rotationMatrix);
            }

            // --- 5. VẼ DEBUG 2D ---
            const originPx = { x: midpoint.x * canvasWidth, y: midpoint.y * canvasHeight };
            debugCtx.lineWidth = AXIS_THICKNESS;
            debugCtx.lineCap = 'round';
            const drawAxis = (vec, color) => {
                debugCtx.strokeStyle = color;
                debugCtx.beginPath();
                debugCtx.moveTo(originPx.x, originPx.y);
                // Trục tọa độ 2D không cần phải lớn, chỉ cần đủ để nhìn
                debugCtx.lineTo(originPx.x + vec.x * 30, originPx.y + vec.y * 30);
                debugCtx.stroke();
            };
            drawAxis(xVec, 'rgb(255, 0, 0)');
            drawAxis(yVec, 'rgb(0, 255, 0)');
            drawAxis(zVec, 'rgb(0, 0, 255)');

            debugCtx.fillStyle = 'yellow';
            debugCtx.beginPath();
            debugCtx.arc(originPx.x, originPx.y, ORIGIN_POINT_SIZE, 0, 2 * Math.PI);
            debugCtx.fill();
        }

        renderer.render(appState.scene, camera);
    };
    const getRingSize = (diameterMm) => {
        const ringSizes = [
            { size: 3, diameter: 14.1 }, { size: 3.5, diameter: 14.5 },
            { size: 4, diameter: 14.9 }, { size: 4.5, diameter: 15.3 },
            { size: 5, diameter: 15.7 }, { size: 5.5, diameter: 16.1 },
            { size: 6, diameter: 16.5 }, { size: 6.5, diameter: 16.9 },
            { size: 7, diameter: 17.3 }, { size: 7.5, diameter: 17.7 },
            { size: 8, diameter: 18.1 }, { size: 8.5, diameter: 18.5 },
            { size: 9, diameter: 18.9 }, { size: 9.5, diameter: 19.4 },
            { size: 10, diameter: 19.8 }, { size: 10.5, diameter: 20.2 },
            { size: 11, diameter: 20.6 }, { size: 11.5, diameter: 21.0 },
            { size: 12, diameter: 21.4 },
        ];
        const closest = ringSizes.reduce((prev, curr) =>
            Math.abs(curr.diameter - diameterMm) < Math.abs(prev.diameter - diameterMm) ? curr : prev
        );
        return closest.size;
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const threeCanvas = threeCanvasRef.current;
        const debugCanvas = debugCanvasRef.current;
        if (!video || !threeCanvas || !debugCanvas || !appState.renderer) return;

        if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(threeCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

        // Vẽ hộp thông tin đo đạc lên ảnh chụp
        if (handDetected) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(20, 20, 250, 100);
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Finger Width: ${fingerWidth ? `${fingerWidth} mm` : 'N/A'}`, 30, 50);
            ctx.fillText(`Ring Inner Diameter: ${ringDiameter ? `${ringDiameter} mm` : 'N/A'}`, 30, 80);
            ctx.fillText(`Ring Size (US): ${ringSize ? ringSize : 'N/A'}`, 30, 110);
        }

        const imageData = tempCanvas.toDataURL('image/png');
        setCapturedImage(imageData);
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    const downloadPhoto = () => {
        if (!capturedImage) return;
        const link = document.createElement('a');
        link.download = `ring-try-on-${Date.now()}.png`;
        link.href = capturedImage;
        link.click();
    };

    const handleClose = () => {
        // Thêm logic để đóng component, ví dụ: gọi một hàm từ props
    };
    const handleRetry = () => { initialize(); };

    return (
        <div className="mirror-container">
            <div className="camera-feed">
                {!capturedImage ? (
                    <>
                        <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                        <canvas ref={threeCanvasRef} className="detection-canvas" />
                        <canvas ref={debugCanvasRef} className="detection-canvas" />
                    </>
                ) : (
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                )}
            </div>

            <div className="ui-overlay">
                <header className="mirror-header">
                    <button onClick={handleClose} className="close-button" aria-label="Close">×</button>
                    <h1 className="mirror-title">MIRROR</h1>
                </header>
                <main className="mirror-main">
                    {!capturedImage && (<div className="scanner-frame"><div className="scanner-frame-bottom-corners" /></div>)}

                    <p className={`instruction-text ${handDetected || loadingMessage || capturedImage || error ? 'instruction-text--hidden' : ''}`}>
                        Position your hand to start
                    </p>

                    {handDetected && !capturedImage && (
                        <div className="measurements-box">
                            <p>Finger Width: {fingerWidth ? `${fingerWidth} mm` : 'Calculating...'}</p>
                            <p>Ring Inner Diameter: {ringDiameter ? `${ringDiameter} mm` : 'Calculating...'}</p>
                            <p>Ring Size (US): {ringSize ? ringSize : 'Calculating...'}</p>
                        </div>
                    )}
                </main>
                <footer className="mirror-footer">
                    {/* Giao diện xử lý lỗi chuyên nghiệp */}
                    {error && !capturedImage && (
                        <div className="error-container">
                            <p className="error-text">{error}</p>
                            <button onClick={handleRetry} className="action-button">Try Again</button>
                        </div>
                    )}

                    {!error && !capturedImage && (
                        <button onClick={capturePhoto} className="capture-button" aria-label="Capture photo" />
                    )}

                    {capturedImage && (
                        <div className="action-buttons-container">
                            <button onClick={retakePhoto} className="action-button">Retake</button>
                            <button onClick={downloadPhoto} className="action-button">Download</button>
                        </div>
                    )}
                </footer>
            </div>

            {loadingMessage && (
                <div className="loading-overlay">
                    <p className="loading-text">{loadingMessage}</p>
                </div>
            )}
        </div>
    );
};

export default BackCamera;