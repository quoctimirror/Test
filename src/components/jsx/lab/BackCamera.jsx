import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import { modelLoader } from '../../../utils/modelLoader.js';
import './BackCamera.css';

// --- CÁC HÀM HỖ TRỢ TÍNH TOÁN VECTOR ---
const subtract = (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
const crossProduct = (v1, v2) => ({ x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x });
const normalize = (v) => { const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); if (len === 0) return { x: 0, y: 0, z: 0 }; return { x: v.x / len, y: v.y / len, z: v.z / len }; };
const toThreeVector = (v) => new THREE.Vector3(v.x, v.y, v.z);
const distance = (v1, v2) => Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));

// --- CÁC HẰNG SỐ CẤU HÌNH ---
const AXIS_LENGTH = 50;
const AXIS_THICKNESS = 5;
const ORIGIN_POINT_SIZE = 6;
const LABEL_SIZE = 16;
const LABEL_OFFSET = 10;
const RING_BASE_SCALE = 30; // Hằng số để điều chỉnh tỷ lệ của nhẫn
const PIXELS_PER_MM = 10; // Giả định: 10 pixel tương ứng 1mm (cần hiệu chỉnh thực tế)
const RING_INNER_DIAMETER_MM = 18; // Đường kính trong của nhẫn trong model (mm, cần đo từ file GLB)

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

    const appState = useRef({
        handLandmarker: null,
        animationFrameId: null,
        videoStream: null,
        scene: null,
        camera: null,
        renderer: null,
        ringModel: null,
    }).current;

    useEffect(() => {
        if (capturedImage) {
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            return;
        }

        const initialize = async () => {
            setLoadingMessage("Loading 3D Ring Model...");
            try {
                const modelContainer = await modelLoader('/models/demo-ring.glb');
                const axesGroup = modelContainer.children[1];
                if (axesGroup) {
                    axesGroup.visible = true; // Luôn hiển thị trục
                }
                appState.ringModel = modelContainer;
            } catch (error) {
                console.error("Failed to load 3D model:", error);
                setLoadingMessage("Error loading 3D model. Please reload.");
                return;
            }
            await setupMediaPipe();
            await startWebcam();
        };

        const setupMediaPipe = async () => {
            setLoadingMessage("Loading hand model...");
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
                appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    }, runningMode: "VIDEO", numHands: 1,
                });
            } catch (error) {
                console.error("Error loading MediaPipe:", error);
                setLoadingMessage("Error loading model. Please reload.");
            }
        };

        const startWebcam = async () => {
            setLoadingMessage("Starting camera...");
            if (!navigator.mediaDevices?.getUserMedia) {
                setLoadingMessage("Camera not supported.");
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
                appState.videoStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setupCanvasesAndStartDetection();
                    };
                }
            } catch (error) {
                console.error("Error starting camera:", error);
                setLoadingMessage("Could not access camera. Please grant permission.");
            }
        };

        const setupCanvasesAndStartDetection = () => {
            if (videoRef.current && threeCanvasRef.current && debugCanvasRef.current) {
                setupThreeJS();
                startDetectionLoop();
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
            const detect = () => {
                if (videoRef.current?.readyState >= 4 && appState.handLandmarker) {
                    const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                    processDetections(results);
                }
                appState.animationFrameId = requestAnimationFrame(detect);
            };
            detect();
        };

        initialize().catch(console.error);

        return () => {
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            if (appState.videoStream) appState.videoStream.getTracks().forEach(track => track.stop());
            if (appState.renderer) appState.renderer.dispose();
        };
    }, [capturedImage]);

    const processDetections = (results) => {
        const { ringModel, camera, renderer } = appState;
        const debugCtx = debugCanvasRef.current.getContext('2d');

        renderer.clear();
        debugCtx.clearRect(0, 0, debugCanvasRef.current.width, debugCanvasRef.current.height);

        const isHandVisible = results.landmarks?.length > 0 && results.handedness?.length > 0;
        setHandDetected(isHandVisible);

        if (ringModel) ringModel.visible = isHandVisible;

        if (isHandVisible) {
            const landmarks = results.landmarks[0];
            const hand = results.handedness[0][0].categoryName;
            const canvasWidth = debugCanvasRef.current.width;
            const canvasHeight = debugCanvasRef.current.height;

            // --- TÍNH TOÁN HỆ TRỤC TỌA ĐỘ ---
            const yVec = normalize(subtract(landmarks[16], landmarks[13]));
            let zVecRaw = crossProduct(subtract(landmarks[5], landmarks[0]), subtract(landmarks[17], landmarks[0]));
            if (hand === 'Left') zVecRaw = { x: -zVecRaw.x, y: -zVecRaw.y, z: -zVecRaw.z };
            const zVec = normalize(zVecRaw);
            const xVec = normalize(crossProduct(yVec, zVec));

            // --- TÍNH TOÁN VỊ TRÍ ---
            const p13 = landmarks[13];
            const p14 = landmarks[14];
            const midpoint = { x: (p13.x + p14.x) / 2, y: (p13.y + p14.y) / 2, z: (p13.z + p14.z) / 2 };
            const worldPosition = new THREE.Vector3((midpoint.x - 0.5) * 2, -(midpoint.y - 0.5) * 2, 0.5).unproject(camera);
            worldPosition.z = -(midpoint.z + 0.5) * 100;

            // --- TÍNH TOÁN TỶ LỆ DỰA TRÊN CHIỀU RỘNG NGÓN TAY ---
            const fingerWidthPx = distance({ x: p13.x * canvasWidth, y: p13.y * canvasHeight, z: 0 }, { x: p14.x * canvasWidth, y: p14.y * canvasHeight, z: 0 });
            const fingerWidthMm = fingerWidthPx / PIXELS_PER_MM;
            const scale = fingerWidthMm / RING_INNER_DIAMETER_MM; // Tỷ lệ để đường kính trong của nhẫn khớp với ngón tay
            setFingerWidth(fingerWidthMm.toFixed(1));
            setRingDiameter(fingerWidthMm.toFixed(1));
            setRingSize(getRingSize(fingerWidthMm));

            // --- ÁP DỤNG VÀO MÔ HÌNH 3D ---
            if (ringModel) {
                ringModel.position.copy(worldPosition);
                ringModel.scale.set(scale, scale, scale);
                const rotationMatrix = new THREE.Matrix4().makeBasis(toThreeVector(xVec), toThreeVector(yVec), toThreeVector(zVec));
                ringModel.quaternion.setFromRotationMatrix(rotationMatrix);
            }

            // --- VẼ DEBUG 2D ---
            const originPx = { x: midpoint.x * canvasWidth, y: midpoint.y * canvasHeight };
            debugCtx.lineWidth = AXIS_THICKNESS;
            debugCtx.lineCap = 'round';
            const drawAxis = (vec, color) => {
                debugCtx.strokeStyle = color;
                debugCtx.beginPath();
                debugCtx.moveTo(originPx.x, originPx.y);
                debugCtx.lineTo(originPx.x + vec.x * AXIS_LENGTH, originPx.y + vec.y * AXIS_LENGTH);
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

    // Hàm ánh xạ chiều rộng ngón tay (mm) sang kích cỡ nhẫn (theo chuẩn US)
    const getRingSize = (diameterMm) => {
        const ringSizes = [
            { size: 5, diameter: 15.7 },
            { size: 6, diameter: 16.5 },
            { size: 7, diameter: 17.3 },
            { size: 8, diameter: 18.1 },
            { size: 9, diameter: 18.9 },
            { size: 10, diameter: 19.8 },
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
        ctx.drawImage(debugCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

        const imageData = tempCanvas.toDataURL('image/png');
        setCapturedImage(imageData);
    };

    const retakePhoto = () => setCapturedImage(null);
    const downloadPhoto = () => {
        if (!capturedImage) return;
        const link = document.createElement('a');
        link.download = `ring-try-on-${Date.now()}.png`;
        link.href = capturedImage;
        link.click();
    };
    const handleClose = () => { /* Logic đóng component */ };

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
                    <p className={`instruction-text ${handDetected || loadingMessage || capturedImage ? 'instruction-text--hidden' : ''}`}>
                        Position your hand to start
                    </p>
                    {handDetected && !capturedImage && (
                        <div className="measurements" style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px', borderRadius: '8px' }}>
                            <p>Finger Width: {fingerWidth ? `${fingerWidth} mm` : 'Calculating...'}</p>
                            <p>Ring Inner Diameter: {ringDiameter ? `${ringDiameter} mm` : 'Calculating...'}</p>
                            <p>Ring Size (US): {ringSize ? ringSize : 'Calculating...'}</p>
                        </div>
                    )}
                </main>
                <footer className="mirror-footer">
                    {!capturedImage ? (
                        <button onClick={capturePhoto} className="capture-button" aria-label="Capture photo" />
                    ) : (
                        <>
                            <button onClick={retakePhoto} className="action-button">Chụp lại</button>
                            <button onClick={downloadPhoto} className="action-button">Tải về</button>
                        </>
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