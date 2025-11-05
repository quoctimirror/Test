// OCCLUDER 4 - STUDIO QUALITY RENDERING
// Based on Occluder3.jsx + SimpleMeshInspector rendering techniques
// MAXIMUM VISUAL QUALITY - Studio Mode with Clearcoat, Bloom, N8AO
import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useEnvironment, Environment, MeshRefractionMaterial } from '@react-three/drei';
import { EffectComposer, ToneMapping, SMAA, Bloom, N8AO } from '@react-three/postprocessing';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from 'three';
import { useParams } from 'react-router-dom';

// Config
import { getRingById, DEFAULT_RING_ID } from "@config/models/rings.js";

// Components
import RingColorPicker from './RingColorPicker';

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

const SMOOTHING_FACTOR = 0.25;
const TARGET_FPS = isMobile ? 20 : 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// ==================== RING WITH OCCLUDER - STUDIO QUALITY ====================
function RingWithOccluder({
    modelPath,
    ringTransform,
    occluderTransform,
    isVisible,
    cameraAspect,
    meshColors = {},
    onMeshListLoad,
    isMobile
}) {
    const { nodes } = useGLTF(modelPath);
    const ringGroupRef = useRef();
    const occluderRef = useRef();
    const { camera } = useThree();

    // Sync camera với video aspect
    useEffect(() => {
        if (camera) {
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

    // ⭐ STUDIO HDR - brown_photostudio_02_4k.exr
    const env = useEnvironment({ files: '/studio_env/brown_photostudio_02_4k.exr' });

    // Geometry cho occluder
    const occluderGeometry = useMemo(() => {
        const geo = new THREE.CylinderGeometry(1, 1, 1, 16);
        geo.rotateX(Math.PI / 2);
        return geo;
    }, []);

    const isFirstFrameRef = useRef(true);

    useEffect(() => {
        isFirstFrameRef.current = true;
    }, [cameraAspect]);

    // Smoothing trong useFrame
    useFrame(() => {
        if (!ringGroupRef.current || !occluderRef.current) return;

        if (isVisible && ringTransform && occluderTransform) {
            if (isFirstFrameRef.current) {
                ringGroupRef.current.position.copy(ringTransform.position);
                ringGroupRef.current.scale.copy(ringTransform.scale);
                ringGroupRef.current.quaternion.copy(ringTransform.quaternion);

                occluderRef.current.position.copy(occluderTransform.position);
                occluderRef.current.scale.copy(occluderTransform.scale);
                occluderRef.current.quaternion.copy(occluderTransform.quaternion);

                isFirstFrameRef.current = false;
            } else {
                ringGroupRef.current.position.lerp(ringTransform.position, SMOOTHING_FACTOR);
                ringGroupRef.current.scale.lerp(ringTransform.scale, SMOOTHING_FACTOR);
                ringGroupRef.current.quaternion.slerp(ringTransform.quaternion, SMOOTHING_FACTOR);

                occluderRef.current.position.lerp(occluderTransform.position, SMOOTHING_FACTOR);
                occluderRef.current.scale.copy(occluderTransform.scale);
                occluderRef.current.quaternion.slerp(occluderTransform.quaternion, SMOOTHING_FACTOR);
            }

            ringGroupRef.current.visible = true;
            occluderRef.current.visible = true;
        } else {
            ringGroupRef.current.visible = false;
            occluderRef.current.visible = false;
            isFirstFrameRef.current = true;
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

            {/* Ring model - STUDIO QUALITY MATERIALS */}
            <group ref={ringGroupRef} renderOrder={1} dispose={null} visible={false}>
                {Object.keys(nodes).map(key => {
                    const node = nodes[key];
                    const material = node.material;

                    if (node.isInstancedMesh) {
                        const isGemInstance = key.toLowerCase().includes('gem') ||
                            key.toLowerCase().includes('diamond') ||
                            key.toLowerCase().includes('stone');

                        return (
                            <instancedMesh
                                key={key}
                                castShadow={false}      // TẮT shadow cho tất cả
                                receiveShadow={false}   // TẮT shadow cho tất cả
                                args={[node.geometry, null, node.count]}
                                instanceMatrix={node.instanceMatrix}
                            >
                                {isGemInstance && env ? (
                                    // ⭐ STUDIO DIAMOND MATERIAL
                                    <MeshRefractionMaterial
                                        color={meshColors[key] || '#ffffff'}
                                        envMap={env}
                                        bounces={5}                    // ⭐ 5 bounces for sparkle
                                        ior={2.6}                      // ⭐ High IOR
                                        fresnel={0.5}
                                        aberrationStrength={0}          // ⭐ NO chromatic aberration
                                        fastChroma={false}
                                        toneMapped={false}              // ⭐ Keep natural brightness
                                        transmission={1.0}
                                        thickness={0.2}
                                        envMapIntensity={1.3}
                                        clearcoat={1}                   // ⭐ WET LOOK
                                        clearcoatRoughness={0}          // ⭐ Perfect gloss
                                    />
                                ) : (
                                    // ⭐ STUDIO METAL MATERIAL
                                    <meshStandardMaterial
                                        color={meshColors[key] || '#ffaf83'}
                                        roughness={0.15}                // ⭐ More glossy (0.15 vs 0.3)
                                        metalness={1}                   // ⭐ 100% metal
                                        envMap={env}
                                        envMapIntensity={1.5}           // ⭐ Strong reflection
                                        side={THREE.DoubleSide}
                                    />
                                )}
                            </instancedMesh>
                        );
                    }

                    if (node.isMesh) {
                        const isGemMesh = key.toLowerCase().includes('gem') ||
                            key.toLowerCase().includes('diamond') ||
                            key.toLowerCase().includes('stone');

                        return (
                            <mesh
                                key={key}
                                castShadow={false}      // TẮT shadow cho tất cả
                                receiveShadow={false}   // TẮT shadow cho tất cả
                                geometry={node.geometry}
                            >
                                {isGemMesh && env ? (
                                    // ⭐ STUDIO DIAMOND MATERIAL
                                    <MeshRefractionMaterial
                                        color={meshColors[key] || '#ffffff'}
                                        envMap={env}
                                        bounces={5}
                                        ior={2.6}
                                        fresnel={0.5}
                                        aberrationStrength={0}
                                        fastChroma={false}
                                        toneMapped={false}
                                        transmission={1.0}
                                        thickness={0.2}
                                        envMapIntensity={1.3}
                                        clearcoat={1}
                                        clearcoatRoughness={0}
                                    />
                                ) : (
                                    // ⭐ STUDIO METAL MATERIAL
                                    <meshStandardMaterial
                                        color={meshColors[key] || '#ffaf83'}
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
const Occluder4 = () => {
    const { ringId } = useParams();

    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [selectedFinger, setSelectedFinger] = useState("Ring");
    const [isProcessing, setIsProcessing] = useState(false);

    const [ringTransform, setRingTransform] = useState(null);
    const [occluderTransform, setOccluderTransform] = useState(null);
    const [isHandVisible, setIsHandVisible] = useState(false);
    const [cameraAspect, setCameraAspect] = useState(16 / 9);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [meshList, setMeshList] = useState([]);
    const [meshColors, setMeshColors] = useState({});

    const videoRef = useRef(null);
    const debugCanvasRef = useRef(null);
    const r3fCanvasRef = useRef(null);
    const handLandmarkerRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const selectedFingerRef = useRef(selectedFinger);
    const lastFrameTimeRef = useRef(0);
    const isInitializedRef = useRef(false);
    const streamRef = useRef(null);

    const virtualCameraRef = useRef({
        position: { z: 5 },
        fov: 50,
        aspect: 16 / 9
    });

    const selectedRingId = ringId || DEFAULT_RING_ID;
    const ringConfig = getRingById(selectedRingId);

    const handleColorChange = useCallback((meshName, color) => {
        setMeshColors(prev => ({
            ...prev,
            [meshName]: color
        }));
    }, []);

    useEffect(() => { selectedFingerRef.current = selectedFinger; }, [selectedFinger]);

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
        setIsCameraReady(false);
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
                console.log("🚀 Bắt đầu khởi tạo (Studio Mode)");
                await setupMediaPipe();
                if (isCancelled) return;
                await startWebcam();
                if (isCancelled) return;
                startAnimationLoop();
                isInitializedRef.current = true;
                setLoadingMessage('');
                console.log("✅ Khởi tạo thành công (Studio Mode)");
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
                    minHandDetectionConfidence: isMobile ? 0.7 : 0.5,
                    minHandPresenceConfidence: isMobile ? 0.7 : 0.5,
                    minTrackingConfidence: isMobile ? 0.6 : 0.5
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

                        const aspect = vW / vH;
                        virtualCameraRef.current.aspect = aspect;
                        setCameraAspect(aspect);
                        setIsCameraReady(true);
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

                    const fingerWidthInWorld = landmarkToWorld(widthLm1).distanceTo(landmarkToWorld(widthLm2));
                    const SCALE_ADJUSTMENT_FACTOR = 0.06;
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

                    setRingTransform({
                        position: targetPosition,
                        scale: targetScale,
                        quaternion: targetQuaternion
                    });

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

            ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(r3fCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
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

                        {/* R3F Canvas overlay - STUDIO QUALITY */}
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
                                        Loading 3D model (Studio Mode)...
                                    </div>
                                }>
                                    <Canvas
                                        ref={r3fCanvasRef}
                                        style={{ width: '100%', height: '100%' }}
                                        gl={{
                                            alpha: true,
                                            preserveDrawingBuffer: true,
                                            antialias: true,
                                            powerPreference: 'high-performance',
                                            // Tất cả dùng mediump - cân bằng tốt nhất
                                            precision: 'mediump',
                                            stencil: false,
                                        }}
                                        // TẮT shadows cho TẤT CẢ - tốn performance mà ít ảnh hưởng
                                        shadows={false}
                                        camera={{ fov: 50, position: [0, 0, 5] }}
                                        frameloop="always"
                                        // DPR tối ưu: [1, 1.5] cho TẤT CẢ
                                        // Lý do: Đủ sắc nét mà vẫn mượt
                                        dpr={[1, 1.5]}
                                        performance={{ min: 0.5 }}
                                    >
                                        {/* ⭐ LIGHTING - TỐI ƯU CHO iOS */}

                                        {/* ⭐ LIGHTING TỐI ƯU: 3 LIGHTS (cân bằng đẹp + mượt) */}

                                        {/* 1. Directional Light - Ánh sáng chính */}
                                        <directionalLight
                                            position={[5, 8, 5]}
                                            intensity={isMobile ? 4 : 5}
                                            castShadow={false}
                                        />

                                        {/* 2. ⭐ 1 BACKLIGHT phía sau - tạo sparkle xuyên qua gem */}
                                        <pointLight
                                            position={[0, -2, -3]}
                                            intensity={Math.PI * 2}
                                            color="#ffffff"
                                        />

                                        {/* 3. Ambient light - ánh sáng nền */}
                                        <ambientLight intensity={isMobile ? 2.5 : 1.5} />

                                        <RingWithOccluder
                                            modelPath={ringConfig.modelPath}
                                            ringTransform={ringTransform}
                                            occluderTransform={occluderTransform}
                                            isVisible={isHandVisible}
                                            cameraAspect={cameraAspect}
                                            meshColors={meshColors}
                                            onMeshListLoad={setMeshList}
                                            isMobile={isMobile}
                                        />

                                        {/* ⭐ STUDIO HDR ENVIRONMENT */}
                                        <Environment
                                            files="/studio_env/brown_photostudio_02_4k.exr"
                                            background={false}
                                        />

                                        {/* ⭐ POST-PROCESSING - CHUẨN CHẤT LƯỢNG CAO NHƯNG VẪN MƯỢT */}
                                        <EffectComposer
                                            // Multisampling: 0 cho TẤT CẢ để tăng FPS tối đa
                                            // Vì đã có SMAA rồi (nhẹ hơn và đủ đẹp)
                                            multisampling={0}
                                            enabled={true}
                                        >
                                            {/*
                                            ========================================
                                            CHIẾN LƯỢC: ĐẸP + MƯỢT
                                            ========================================

                                            ✅ SMAA - NHẸ, ĐẸP, GIỮ LẠI
                                               - Anti-aliasing quality cao
                                               - Performance: Rất nhẹ (1-2ms)
                                               - Kết quả: Viền mượt mà

                                            ❌ N8AO - NẶNG, TẮT HOÀN TOÀN
                                               - Chi phí: 10-20ms per frame
                                               - Ảnh hưởng: Chỉ bóng nhẹ trong góc
                                               - Quyết định: TẮT - không đáng để mất FPS

                                            ❌ Multisampling - NẶNG, TẮT
                                               - SMAA đã đủ tốt
                                               - Multisampling tốn 2-3x performance

                                            ❌ Bloom - Không cần (gây lóa)

                                            ❌ ToneMapping - Conflict với toneMapped={false}

                                            KẾT QUẢ: Nhẫn vẫn ĐẸP nhờ:
                                            - Clearcoat (wet look) ⭐
                                            - Studio HDR 4K ⭐
                                            - MeshRefraction bounces=5 ⭐
                                            - SMAA mượt mà ⭐
                                            - 5 lights (desktop) / 2 lights (mobile) ⭐
                                            */}

                                            {/* SMAA - Khử răng cưa (NHẸ + ĐẸP) */}
                                            <SMAA />

                                            {/* N8AO - TẮT HOÀN TOÀN để tăng FPS */}
                                            {/* Lý do: Chi phí 10-20ms, chỉ tạo bóng nhẹ không đáng kể */}
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
                    <h1 className="mirror-title">MIRROR (Studio)</h1>
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

                {!error && !capturedImage && !loadingMessage && (
                    <RingColorPicker
                        meshList={meshList}
                        onColorChange={handleColorChange}
                    />
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

export default Occluder4;
