// OCCLUDER 3 - WITH BLOOM & POST-PROCESSING EFFECTS
// Hybrid: Occluder2.jsx positioning + RingInspector.jsx sparkle effects
// OPTIMIZED FOR MOBILE & LOW-END DEVICES
import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, MeshRefractionMaterial, useEnvironment, Environment } from '@react-three/drei';
import { EffectComposer, N8AO, ToneMapping, SMAA } from '@react-three/postprocessing';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useControls } from 'leva';
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

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Detect low-end devices (tối ưu cực mạnh)
const isLowEnd = (() => {
    // Check hardware concurrency (số cores)
    const cores = navigator.hardwareConcurrency || 2;
    // Check memory (nếu có API)
    const memory = navigator.deviceMemory || 4;
    // Low-end: <= 4 cores hoặc <= 4GB RAM
    return cores <= 4 || memory <= 4;
})();

const SMOOTHING_FACTOR = 0.25;
const TARGET_FPS = isMobile ? 20 : 30;  // Mobile: 20fps, Desktop: 30fps
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// ==================== RING WITH OCCLUDER ====================
function RingWithOccluder({
    modelPath,
    ringTransform,
    occluderTransform,
    isVisible,
    cameraAspect,
    meshColors = {},
    onMeshListLoad
}) {
    const { nodes } = useGLTF(modelPath);
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

    // Đọc danh sách meshes từ GLTF
    useEffect(() => {
        if (nodes && onMeshListLoad) {
            const meshList = [];
            Object.keys(nodes).forEach(key => {
                const node = nodes[key];
                if (node.isMesh || node.isInstancedMesh) {
                    meshList.push({
                        name: key,
                        type: node.type
                    });
                }
            });
            onMeshListLoad(meshList);
        }
    }, [nodes, onMeshListLoad]);

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

    // Reset isFirstFrameRef khi cameraAspect thay đổi để recalculate transform
    useEffect(() => {
        isFirstFrameRef.current = true;
    }, [cameraAspect]);

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
                        // Detect nếu InstancedMesh là kim cương
                        const isGemInstance = key.toLowerCase().includes('gem') ||
                            key.toLowerCase().includes('diamond') ||
                            key.toLowerCase().includes('stone');

                        return (
                            <instancedMesh
                                key={key}
                                castShadow={false}
                                receiveShadow={false}
                                args={[node.geometry, null, node.count]}
                                instanceMatrix={node.instanceMatrix}
                            >
                                {isGemInstance && env ? (
                                    <MeshRefractionMaterial
                                        color={meshColors[key] || material?.color || '#ffffff'}
                                        side={THREE.DoubleSide}
                                        envMap={env}
                                        envMapIntensity={30.0}  // TĂNG CAO CHO KIM CƯƠNG
                                        aberrationStrength={0.08}  // Tăng aberration mạnh
                                        toneMapped={false}
                                    />
                                ) : (
                                    <meshStandardMaterial
                                        color={meshColors[key] || material?.color || '#ffaf83'}
                                        roughness={0.2}  // Tăng roughness cho band
                                        metalness={1}
                                        envMap={env}
                                        envMapIntensity={1.5}  // GIẢM xuống 1.5 cho band
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
                                        color={meshColors[key] || material?.color || '#ffffff'}
                                        envMap={env}
                                        envMapIntensity={30.0}  // TĂNG CAO CHO KIM CƯƠNG
                                        aberrationStrength={0.08}  // Tăng aberration mạnh
                                        toneMapped={false}
                                    />
                                ) : (
                                    <meshStandardMaterial
                                        color={meshColors[key] || material?.color || '#ffaf83'}
                                        roughness={0.2}  // Tăng roughness cho band
                                        metalness={1}
                                        envMap={env}
                                        envMapIntensity={1.5}  // GIẢM xuống 1.5 cho band
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
const Occluder3 = () => {
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
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [meshList, setMeshList] = useState([]);

    const videoRef = useRef(null);
    const debugCanvasRef = useRef(null);
    const r3fCanvasRef = useRef(null);
    const handLandmarkerRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const selectedFingerRef = useRef(selectedFinger);
    const lastFrameTimeRef = useRef(0);
    const isInitializedRef = useRef(false);
    const streamRef = useRef(null);

    // Camera ref để tính toán positioning
    const virtualCameraRef = useRef({
        position: { z: 5 },
        fov: 50,
        aspect: 16 / 9
    });

    // Determine ring config
    const selectedRingId = ringId || DEFAULT_RING_ID;
    const ringConfig = getRingById(selectedRingId);

    // Tạo color schema cho từng mesh với màu mặc định
    const colorSchema = useMemo(() => {
        const schema = {};
        meshList.forEach(mesh => {
            const name = mesh.name.toLowerCase();
            let defaultColor = '#ffffff';

            // Set màu mặc định theo tên mesh
            if (name.includes('ring')) {
                defaultColor = '#ffaf83'; // ring band color
            } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
                defaultColor = '#b5cbdd'; // diamond color
            }

            schema[mesh.name] = { value: defaultColor, label: mesh.name };
        });
        return schema;
    }, [meshList]);

    // Tạo color controls động cho từng mesh
    const colorControls = useControls('Mesh Colors', colorSchema, [colorSchema]);

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
        setIsCameraReady(false); // Reset camera ready state
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
            setLoadingMessage("Loading fingers model...");
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
                    numHands: 1,
                    minHandDetectionConfidence: isMobile ? 0.7 : 0.5,  // Mobile: cao hơn để giảm tính toán
                    minHandPresenceConfidence: isMobile ? 0.7 : 0.5,   // Mobile: cao hơn
                    minTrackingConfidence: isMobile ? 0.6 : 0.5        // Mobile: tracking chặt hơn
                });
                console.log("✅ MediaPipe loaded");
            } catch (error) {
                console.error("❌ MediaPipe failed:", error);
                throw new Error("Không thể tải mô hình AI. Kiểm tra kết nối mạng.");
            }
        };

        const startWebcam = async () => {
            setLoadingMessage("Starting camera...");
            console.log("📹 Starting camera...");
            try {
                const constraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: isMobile ? 640 : 1280, max: isMobile ? 640 : 1280 },
                        height: { ideal: isMobile ? 480 : 720, max: isMobile ? 480 : 720 },
                        frameRate: { ideal: isMobile ? 20 : 30, max: isMobile ? 20 : 30 },
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
                        setIsCameraReady(true); // Camera ready, có thể render Canvas
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

            setCapturedImage(tempCanvas.toDataURL('image/jpeg', 1.0));
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

                        {/* R3F Canvas overlay - CHỈ RENDER KHI CAMERA READY */}
                        <div className="three-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            {!loadingMessage && ringConfig && isCameraReady && (
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
                                        Loading 3D model...
                                    </div>
                                }>
                                    <Canvas
                                        ref={r3fCanvasRef}
                                        style={{ width: '100%', height: '100%' }}
                                        gl={{
                                            alpha: true,
                                            preserveDrawingBuffer: true,
                                            antialias: true,  // BẬT antialias cho mọi devices
                                            powerPreference: 'high-performance',
                                            // Giảm precision trên mobile/low-end
                                            precision: isLowEnd ? 'lowp' : isMobile ? 'mediump' : 'highp',
                                            // Tắt stencil buffer nếu không dùng
                                            stencil: false,
                                        }}
                                        camera={{ fov: 50, position: [0, 0, 5] }}
                                        frameloop="always"
                                        // DPR cao để khử răng cưa tốt hơn:
                                        // - Low-end: max 1.0 (tăng từ 0.75)
                                        // - Mobile: max 1.5 (tăng từ 1.0)
                                        // - Desktop: max 2.0 (tăng từ 1.5)
                                        dpr={isLowEnd ? [0.75, 1.0] : isMobile ? [1.0, 1.5] : [1.5, 2.0]}
                                        // Performance mode: tự động giảm chất lượng khi FPS thấp
                                        performance={{ min: 0.5 }}
                                    >
                                        {/* ============================================ */}
                                        {/* LIGHTS - ÁNH SÁNG VỪA PHẢI, KHÔNG CHÓI */}
                                        {/* ============================================ */}
                                        <ambientLight intensity={isMobile ? 2.5 : 4.0} />

                                        {/* Đèn phụ 1 - chiếu từ góc phải */}
                                        <directionalLight
                                            position={[5, 5, 5]}
                                            intensity={isMobile ? 4 : 6}
                                            castShadow={false}
                                        />

                                        {/* Đèn phụ 2 - chiếu từ góc trái */}
                                        <directionalLight
                                            position={[-5, 5, 5]}
                                            intensity={isMobile ? 4 : 6}
                                            castShadow={false}
                                        />

                                        <RingWithOccluder
                                            modelPath={ringConfig.modelPath}
                                            ringTransform={ringTransform}
                                            occluderTransform={occluderTransform}
                                            isVisible={isHandVisible}
                                            cameraAspect={cameraAspect}
                                            meshColors={colorControls}
                                            onMeshListLoad={setMeshList}
                                        />

                                        {/* Environment - HDR môi trường cho kim cương phản chiếu */}
                                        <Environment
                                            files="/studio_env/env_metal_1.exr"
                                            background={false}
                                        />

                                        {/* ============================================ */}
                                        {/* EFFECT COMPOSER - POST-PROCESSING EFFECTS */}
                                        {/* KHỬ RĂNG CƯA + ĐỘ SÂU */}
                                        {/* ============================================ */}
                                        <EffectComposer
                                            multisampling={0}
                                            enabled={true}
                                        >
                                            {/* N8AO - Ambient Occlusion cho độ sâu */}
                                            {!isLowEnd && (
                                                <N8AO
                                                    aoRadius={isMobile ? 0.08 : 0.15}
                                                    intensity={isMobile ? 1.5 : 4}
                                                    distanceFalloff={2}
                                                    aoSamples={isMobile ? 4 : 16}
                                                    denoiseSamples={isMobile ? 1 : 4}
                                                    denoiseRadius={isMobile ? 6 : 12}
                                                />
                                            )}

                                            <ToneMapping />

                                            {/* SMAA - Khử răng cưa (Anti-Aliasing) */}
                                            <SMAA />
                                        </EffectComposer>
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
                            <button onClick={handleRetry} className="action-button">Try again</button>
                        </div>
                    )}

                    {!error && !capturedImage && !loadingMessage && !isProcessing && (
                        <button onClick={capturePhoto} className="capture-button" />
                    )}

                    {capturedImage && (
                        <div className="action-buttons-container">
                            <button onClick={retakePhoto} className="action-button">Retake</button>
                            <button onClick={downloadPhoto} className="action-button">Download</button>
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
                                    {fingerName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {(loadingMessage || isProcessing) && (
                <div className="loading-overlay">
                    <p className="loading-text">{loadingMessage || "Loading..."}</p>
                </div>
            )}
        </div>
    );
};

export default Occluder3;
