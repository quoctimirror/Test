// Hybrid: Occluder.jsx positioning logic + QuocTiar.jsx R3F materials
import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, MeshRefractionMaterial, useEnvironment } from '@react-three/drei';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import { useParams } from 'react-router-dom';

// Config
import { getRingById, DEFAULT_RING_ID } from "@config/models/rings.js";

// CSS
import './TryOnRing.css';

// ==================== CONSTANTS ====================
const FINGER_DATA_2D = [
    { name: "Thumb", indices: [2, 3], color: "red" },
    { name: "Index", indices: [5, 6], color: "#00BFFF" },
    { name: "Middle", indices: [9, 10], color: "#FFD700" },
    { name: "Ring", indices: [13, 14], color: "#32CD32" },
    { name: "Pinky", indices: [17, 18], color: "#FF1493" },
];

const FINGER_GEOMETRY_DATA = {
    "Ring": {
        positionLandmarks: [13, 14],
        widthLandmarks: [13, 9]
    },
    "Middle": {
        positionLandmarks: [9, 10],
        widthLandmarks: [9, 5]
    },
    "Index": {
        positionLandmarks: [5, 6],
        widthLandmarks: [9, 5]
    },
    "Pinky": {
        positionLandmarks: [17, 18],
        widthLandmarks: [17, 13]
    },
    "Thumb": {
        positionLandmarks: [2, 3],
        widthLandmarks: [2, 3]
    }
};

const SMOOTHING_FACTOR = 0.35;
const TARGET_FPS = 20;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// ==================== RING WITH OCCLUDER (R3F - CHỈ LÀM ĐẸP) ====================
function RingWithOccluder({
    modelPath,
    ringTransform,
    occluderTransform,
    isVisible,
    cameraAspect
}) {
    const { nodes, materials } = useGLTF(modelPath);
    const ringGroupRef = useRef();
    const occluderRef = useRef();
    const { camera } = useThree();

    // Sync camera với video aspect VÀ ĐẢM BẢO POSITION ĐÚNG
    useEffect(() => {
        if (camera) {
            // Đảm bảo camera ở đúng vị trí
            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);

            if (cameraAspect) {
                camera.aspect = cameraAspect;
            }
            camera.updateProjectionMatrix();
        }
    }, [cameraAspect, camera]);

    // Load environment map - TỪ QUOCTIAR.JSX (KHÔNG ĐƯỢC WRAP TRONG TRY-CATCH)
    const env = useEnvironment({ files: '/studio_env/env_metal_1.exr' });

    // Geometry cho occluder - tạo một lần
    const occluderGeometry = useMemo(() => {
        const geo = new THREE.CylinderGeometry(1, 1, 1, 16);
        geo.rotateX(Math.PI / 2);
        return geo;
    }, []);

    // Track if this is first frame to avoid initial lerp delay
    const isFirstFrameRef = useRef(true);

    // ÁP DỤNG SMOOTHING TRONG USEFRAME - GIỐNG OCCLUDER.JSX
    useFrame(() => {
        if (!ringGroupRef.current || !occluderRef.current) return;

        if (isVisible && ringTransform && occluderTransform) {
            // Nếu là frame đầu tiên, set trực tiếp không lerp
            if (isFirstFrameRef.current) {
                ringGroupRef.current.position.copy(ringTransform.position);
                ringGroupRef.current.scale.copy(ringTransform.scale);
                ringGroupRef.current.quaternion.copy(ringTransform.quaternion);

                occluderRef.current.position.copy(occluderTransform.position);
                occluderRef.current.scale.copy(occluderTransform.scale);
                occluderRef.current.quaternion.copy(occluderTransform.quaternion);

                isFirstFrameRef.current = false;
            } else {
                // Apply ring transform với SMOOTHING (giống Occluder.jsx)
                ringGroupRef.current.position.lerp(ringTransform.position, SMOOTHING_FACTOR);
                ringGroupRef.current.scale.lerp(ringTransform.scale, SMOOTHING_FACTOR);
                ringGroupRef.current.quaternion.slerp(ringTransform.quaternion, SMOOTHING_FACTOR);

                // Apply occluder transform với SMOOTHING
                occluderRef.current.position.lerp(occluderTransform.position, SMOOTHING_FACTOR);
                occluderRef.current.scale.copy(occluderTransform.scale); // Scale không cần smooth
                occluderRef.current.quaternion.slerp(occluderTransform.quaternion, SMOOTHING_FACTOR);
            }

            ringGroupRef.current.visible = true;
            occluderRef.current.visible = true;
        } else {
            ringGroupRef.current.visible = false;
            occluderRef.current.visible = false;
            isFirstFrameRef.current = true; // Reset để lần sau lại set trực tiếp
        }
    });

    return (
        <>
            {/* Occluder - render first */}
            <mesh ref={occluderRef} renderOrder={0} visible={false}>
                <primitive object={occluderGeometry} />
                <meshBasicMaterial
                    colorWrite={false}
                    depthWrite={true}
                />
            </mesh>

            {/* Ring model - render after - MATERIALS TỪ QUOCTIAR.JSX */}
            <group ref={ringGroupRef} renderOrder={1} dispose={null} visible={false}>
                {Object.keys(nodes).map(key => {
                    const node = nodes[key];
                    const material = node.material;


                    if (node.isInstancedMesh) {
                        return (
                            <instancedMesh
                                key={key}
                                castShadow={false}
                                receiveShadow={false}
                                args={[node.geometry, null, node.count]}
                                instanceMatrix={node.instanceMatrix}
                            >
                                {env ? (
                                    <MeshRefractionMaterial
                                        color='#b5cbdd'
                                        side={THREE.DoubleSide}
                                        envMap={env}
                                        envMapIntensity={10.0}
                                        aberrationStrength={0.02}
                                        toneMapped={false}
                                    />
                                ) : (
                                    <meshStandardMaterial
                                        color='#b5cbdd'
                                        roughness={0.15}
                                        metalness={1}
                                        envMap={env}
                                        envMapIntensity={2}
                                        side={THREE.DoubleSide}
                                    />
                                )}
                            </instancedMesh>
                        );
                    }

                    if (node.isMesh) {
                        // Detect gem meshes by name - TỪ QUOCTIAR.JSX
                        const isGemMesh = key.toLowerCase().includes('gem') ||
                            key.toLowerCase().includes('diamond') ||
                            key.toLowerCase().includes('stone');

                        return (
                            <mesh
                                key={key}
                                castShadow={false}
                                receiveShadow={false}
                                geometry={node.geometry}
                            >
                                {isGemMesh && env ? (
                                    <MeshRefractionMaterial
                                        color='#b5cbdd'
                                        envMap={env}
                                        envMapIntensity={10.0}
                                        aberrationStrength={0.02}
                                        toneMapped={false}
                                    />
                                ) : (
                                    <meshStandardMaterial
                                        color='#ffaf83'
                                        roughness={0.15}
                                        metalness={1}
                                        envMap={env}
                                        envMapIntensity={1.5}
                                        transparent={material?.transparent}
                                        opacity={material?.opacity ?? 1}
                                    />
                                )}
                            </mesh>
                        );
                    }
                    return null;
                })}
            </group>
        </>
    );
}

// ==================== MAIN COMPONENT ====================
const Occluder2 = () => {
    const { ringId } = useParams();

    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFinger, setSelectedFinger] = useState("Ring");
    const [isProcessing, setIsProcessing] = useState(false);

    // Transform states để truyền vào R3F
    const [ringTransform, setRingTransform] = useState(null);
    const [occluderTransform, setOccluderTransform] = useState(null);
    const [isHandVisible, setIsHandVisible] = useState(false);
    const [cameraAspect, setCameraAspect] = useState(16 / 9);

    const videoRef = useRef(null);
    const debugCanvasRef = useRef(null);
    const r3fCanvasRef = useRef(null);
    const handLandmarkerRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const selectedFingerRef = useRef(selectedFinger);
    const lastFrameTimeRef = useRef(0);
    const isInitializedRef = useRef(false);
    const streamRef = useRef(null);
    const frameCounterRef = useRef(0);

    // Camera ref để tính toán positioning
    const virtualCameraRef = useRef({
        position: { z: 5 },
        fov: 50,
        aspect: 16 / 9
    });

    // Determine ring config
    const selectedRingId = ringId || DEFAULT_RING_ID;
    const ringConfig = getRingById(selectedRingId);

    useEffect(() => { selectedFingerRef.current = selectedFinger; }, [selectedFinger]);

    // Cleanup function
    const cleanup = useCallback(() => {
        console.log("🧹 Cleanup được gọi");
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        isInitializedRef.current = false;
        handLandmarkerRef.current = null;
        console.log("✅ Cleanup hoàn tất");
    }, []);

    useEffect(() => {
        let isCancelled = false;

        if (!ringConfig) {
            setError(`Không tìm thấy sản phẩm với ID: "${selectedRingId}"`);
            setLoadingMessage('');
            return;
        }

        const initialize = async () => {
            if (isInitializedRef.current || isProcessing) return;
            setIsProcessing(true);
            setError(null);
            try {
                console.log("🚀 Bắt đầu khởi tạo");
                await setupMediaPipe();
                if (isCancelled) return;
                await startWebcam();
                if (isCancelled) return;
                startAnimationLoop();
                isInitializedRef.current = true;
                setLoadingMessage('');
                console.log("✅ Khởi tạo thành công");
            } catch (err) {
                if (isCancelled) return;
                console.error("❌ Khởi tạo thất bại:", err);
                setError(err.message || "Không thể khởi tạo ứng dụng.");
                setLoadingMessage("");
            } finally {
                setIsProcessing(false);
            }
        };

        const setupMediaPipe = async () => {
            setLoadingMessage("Tải mô hình nhận diện...");
            console.log("📡 Tải MediaPipe...");
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
                );
                handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                console.log("✅ MediaPipe loaded");
            } catch (error) {
                console.error("❌ MediaPipe failed:", error);
                throw new Error("Không thể tải mô hình AI. Kiểm tra kết nối mạng.");
            }
        };

        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
            console.log("📹 Khởi động camera...");
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280, max: 1280 },
                        height: { ideal: 720, max: 720 },
                        frameRate: { ideal: 30, max: 30 },
                        resizeMode: 'crop-and-scale'
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                return new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => reject(new Error("Timeout khi tải camera")), 10000);
                    videoRef.current.onloadedmetadata = () => {
                        clearTimeout(timeoutId);
                        videoRef.current.play();

                        const { videoWidth: vW, videoHeight: vH } = videoRef.current;
                        console.log(`📐 Video size: ${vW}x${vH}`);

                        debugCanvasRef.current.width = vW;
                        debugCanvasRef.current.height = vH;

                        // Update virtual camera aspect
                        const aspect = vW / vH;
                        virtualCameraRef.current.aspect = aspect;
                        setCameraAspect(aspect);
                        console.log('📐 Camera aspect set:', aspect);

                        console.log("✅ Camera ready");
                        resolve();
                    };
                    videoRef.current.onerror = (err) => {
                        clearTimeout(timeoutId);
                        reject(new Error("Lỗi camera: " + err.message));
                    };
                });
            } catch (error) {
                console.error("❌ Camera failed:", error);
                throw new Error("Không thể truy cập camera. Kiểm tra quyền camera.");
            }
        };

        const startAnimationLoop = () => {
            const animate = (currentTime) => {
                if (isCancelled || !isInitializedRef.current) {
                    return;
                }
                if (currentTime - lastFrameTimeRef.current < FRAME_INTERVAL) {
                    animationFrameIdRef.current = requestAnimationFrame(animate);
                    return;
                }
                lastFrameTimeRef.current = currentTime;
                try {
                    if (videoRef.current?.readyState >= 4) {
                        processFrame();
                    }
                } catch (error) {
                    console.error("❌ Frame processing error:", error);
                }
                animationFrameIdRef.current = requestAnimationFrame(animate);
            };
            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        // ===== PROCESSFRAME - Y CHANG OCCLUDER.JSX =====
        const processFrame = () => {
            if (!handLandmarkerRef.current || !videoRef.current) {
                return;
            }

            // Skip frames để tăng performance
            frameCounterRef.current++;
            if (frameCounterRef.current % 2 !== 0) {
                return; // Chỉ chạy mỗi 2 frames
            }

            try {
                const results = handLandmarkerRef.current.detectForVideo(
                    videoRef.current,
                    performance.now()
                );

                const debugCtx = debugCanvasRef.current.getContext('2d');
                debugCtx.clearRect(0, 0, debugCanvasRef.current.width, debugCanvasRef.current.height);

                const isHandVisibleNow = results.landmarks?.length > 0;

                if (isHandVisibleNow) {
                    const landmarks = results.landmarks[0];
                    const handedness = results.handedness[0][0].categoryName;
                    const camera = virtualCameraRef.current;

                    const RING_PLANE_Z = 0;
                    const distance = camera.position.z - RING_PLANE_Z;
                    const fovInRadians = (camera.fov * Math.PI) / 180;
                    const viewHeight = 2 * Math.tan(fovInRadians / 2) * distance;
                    const viewWidth = viewHeight * camera.aspect;

                    const landmarkToWorld = (lm) => {
                        const worldX = (lm.x - 0.5) * viewWidth;
                        const worldY = -(lm.y - 0.5) * viewHeight + 0.1;
                        const worldZ = lm.z * viewWidth * -1.3;
                        return new THREE.Vector3(worldX, worldY, worldZ);
                    };

                    const fingerName = selectedFingerRef.current;
                    const fingerData = FINGER_GEOMETRY_DATA[fingerName];
                    if (!fingerData) return;

                    const posLm1 = landmarks[fingerData.positionLandmarks[0]];
                    const posLm2 = landmarks[fingerData.positionLandmarks[1]];
                    const widthLm1 = landmarks[fingerData.widthLandmarks[0]];
                    const widthLm2 = landmarks[fingerData.widthLandmarks[1]];

                    if (!posLm1 || !posLm2 || !widthLm1 || !widthLm2) {
                        setIsHandVisible(false);
                        return;
                    }

                    const worldPos1 = landmarkToWorld(posLm1);
                    const worldPos2 = landmarkToWorld(posLm2);

                    const targetPosition = new THREE.Vector3().addVectors(worldPos1, worldPos2).multiplyScalar(0.5);

                    // Tính chiều rộng ngón tay
                    const fingerWidthInWorld = landmarkToWorld(widthLm1).distanceTo(landmarkToWorld(widthLm2));
                    const SCALE_ADJUSTMENT_FACTOR = 0.06;  // GIảM SCALE XUỐNG
                    const targetScaleValue = fingerWidthInWorld * SCALE_ADJUSTMENT_FACTOR;
                    const targetScale = new THREE.Vector3(targetScaleValue, targetScaleValue, targetScaleValue);

                    const fingerDirection = new THREE.Vector3().subVectors(worldPos2, worldPos1).normalize();
                    const sideDirection = new THREE.Vector3().subVectors(landmarkToWorld(widthLm1), landmarkToWorld(widthLm2)).normalize();
                    const handUp = handedness === "Left"
                        ? new THREE.Vector3().crossVectors(fingerDirection, sideDirection).normalize()
                        : new THREE.Vector3().crossVectors(sideDirection, fingerDirection).normalize();

                    const rotationMatrix = new THREE.Matrix4();
                    rotationMatrix.lookAt(new THREE.Vector3(), fingerDirection, handUp);
                    const baseTargetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
                    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

                    // Correction rotation
                    const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -(Math.PI / 2));
                    targetQuaternion.multiply(correctionQuaternion);

                    // Update ring transform - KHÔNG SMOOTHING Ở ĐÂY (smoothing trong useFrame)
                    setRingTransform({
                        position: targetPosition,
                        scale: targetScale,
                        quaternion: targetQuaternion
                    });

                    // Update occluder transform - KHÔNG SMOOTHING Ở ĐÂY
                    const occluderRadius = fingerWidthInWorld / 2.1;
                    const occluderLength = fingerWidthInWorld * 2;
                    setOccluderTransform({
                        position: targetPosition,
                        scale: new THREE.Vector3(occluderRadius, occluderRadius, occluderLength),
                        quaternion: baseTargetQuaternion
                    });

                    setIsHandVisible(true);
                } else {
                    setIsHandVisible(false);
                }

            } catch (error) {
                console.error("❌ Process frame error:", error);
            }
        };

        if (!capturedImage && !isInitializedRef.current) {
            initialize();
        }

        return () => {
            isCancelled = true;
            cleanup();
        };
    }, [capturedImage, cleanup, ringId, ringConfig, selectedRingId]);

    const capturePhoto = useCallback(() => {
        try {
            const video = videoRef.current;
            const r3fCanvas = r3fCanvasRef.current;
            const debugCanvas = debugCanvasRef.current;

            if (!video || !r3fCanvas || !debugCanvas) {
                console.error("Một trong các element chưa sẵn sàng.");
                setError("Không thể chụp ảnh. Vui lòng thử lại.");
                return;
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            const ctx = tempCanvas.getContext('2d');

            // Layer 1: Video
            ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

            // Layer 2: R3F Canvas
            ctx.drawImage(r3fCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

            // Layer 3: Debug canvas
            ctx.drawImage(debugCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

            setCapturedImage(tempCanvas.toDataURL('image/jpeg', 0.9));
            console.log("📸 Photo captured with all layers");

        } catch (error) {
            console.error("❌ Capture photo error:", error);
            setError("Không thể chụp ảnh. Có lỗi xảy ra.");
        }
    }, []);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        console.log("🔄 Retaking photo");
    }, []);

    const downloadPhoto = useCallback(() => {
        if (!capturedImage) return;
        try {
            const link = document.createElement('a');
            link.download = `thankyourbelovedcustomer-${Date.now()}.png`;
            link.href = capturedImage;
            link.click();
            console.log("💾 Photo downloaded");
        } catch (error) {
            console.error("❌ Download error:", error);
        }
    }, [capturedImage]);

    const handleRetry = useCallback(() => {
        setError(null);
        setCapturedImage(null);
        isInitializedRef.current = false;
        console.log("🔄 Retrying initialization");
    }, []);

    const handleClose = useCallback(() => {
        window.history.back();
        console.log("🚪 Closing app");
        cleanup();
    }, [cleanup]);

    return (
        <div className="mirror-container">
            <div className="camera-feed">
                {!capturedImage ? (
                    <>
                        <video ref={videoRef} className="camera-video" autoPlay playsInline muted />

                        {/* R3F Canvas overlay - CHỈ RENDER, KHÔNG TÍNH TOÁN */}
                        <div className="three-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {!loadingMessage && ringConfig && (
                                <Suspense fallback={
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontSize: '18px',
                                        background: 'rgba(0,0,0,0.7)',
                                        padding: '20px',
                                        borderRadius: '10px'
                                    }}>
                                        Đang tải mô hình 3D...
                                    </div>
                                }>
                                    <Canvas
                                        ref={r3fCanvasRef}
                                        style={{ width: '100%', height: '100%' }}
                                        gl={{
                                            alpha: true,
                                            preserveDrawingBuffer: true,
                                            antialias: true,
                                            powerPreference: 'high-performance'
                                        }}
                                        camera={{ fov: 50, position: [0, 0, 5] }}
                                        frameloop="always"
                                        dpr={[1, 2]}
                                        performance={{ min: 0.5 }}
                                    >
                                        <ambientLight intensity={6.0} />
                                        <directionalLight position={[0, 5, 0]} intensity={12.0} castShadow={false} />
                                        <pointLight position={[0, 1, 0]} intensity={8.0} distance={10} decay={2} />
                                        <RingWithOccluder
                                            modelPath={ringConfig.modelPath}
                                            ringTransform={ringTransform}
                                            occluderTransform={occluderTransform}
                                            isVisible={isHandVisible}
                                            cameraAspect={cameraAspect}
                                        />
                                    </Canvas>
                                </Suspense>
                            )}
                        </div>

                        <canvas ref={debugCanvasRef} className="debug-canvas" />
                    </>
                ) : (
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                )}
            </div>

            <div className="ui-overlay">
                <header className="mirror-header">
                    <button onClick={handleClose} className="close-button">×</button>
                    <h1 className="mirror-title">MIRROR</h1>
                </header>

                {!capturedImage && !error && !loadingMessage && (
                    <div className="focus-frame">
                        <div className="focus-corner top-left"></div>
                        <div className="focus-corner top-right"></div>
                        <div className="focus-corner bottom-left"></div>
                        <div className="focus-corner bottom-right"></div>
                        <p className="instruction-text">Position your hand in the frame</p>
                    </div>
                )}

                <footer className="mirror-footer">
                    {error && !capturedImage && (
                        <div className="error-container">
                            <p className="error-text">{error}</p>
                            <button onClick={handleRetry} className="action-button">Thử lại</button>
                        </div>
                    )}

                    {!error && !capturedImage && !loadingMessage && !isProcessing && (
                        <button onClick={capturePhoto} className="capture-button" />
                    )}

                    {capturedImage && (
                        <div className="action-buttons-container">
                            <button onClick={retakePhoto} className="action-button">Chụp lại</button>
                            <button onClick={downloadPhoto} className="action-button">Tải xuống</button>
                        </div>
                    )}
                </footer>

                {!error && !capturedImage && !loadingMessage && (
                    <div className="finger-select-container">
                        <select
                            className="finger-select"
                            value={selectedFinger}
                            onChange={(e) => setSelectedFinger(e.target.value)}
                            disabled={isProcessing}
                        >
                            {Object.keys(FINGER_GEOMETRY_DATA).map(fingerName => (
                                <option key={fingerName} value={fingerName}>
                                    {fingerName === 'Thumb' ? 'Ngón cái' :
                                        fingerName === 'Index' ? 'Ngón trỏ' :
                                            fingerName === 'Middle' ? 'Ngón giữa' :
                                                fingerName === 'Ring' ? 'Ngón áp út' :
                                                    fingerName === 'Pinky' ? 'Ngón út' : fingerName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {(loadingMessage || isProcessing) && (
                <div className="loading-overlay">
                    <p className="loading-text">{loadingMessage || "Đang xử lý..."}</p>
                </div>
            )}
        </div>
    );
};

export default Occluder2;
