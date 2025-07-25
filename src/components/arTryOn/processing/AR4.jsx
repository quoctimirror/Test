// src/components/arTryOn/AR4.jsx

// --- PHẦN 1: KHAI BÁO VÀ IMPORT ---
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom'; // *** MỚI: Import hook để lấy tham số từ URL
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import './AR3.css';

// *** MỚI: Định nghĩa map ánh xạ ID nhẫn từ URL đến file model thực tế ***
// Điều này giúp dễ dàng quản lý và thêm các mẫu nhẫn mới.
// Các ID này ('vang-do', 'vang-tron', 'xam') phải khớp với :ringId trong Route của bạn.
const ringModelMap = {
    'nhan-cua-ti': '/arTryOn/ring_meshes_yellow_red.glb', // Dùng cho URL: /ar/rings/yellow-red
    'nhan-vang': '/arTryOn/nhanVang.glb',               // Dùng cho URL: /ar/rings/vang-tron
    'nhan-xam': '/arTryOn/nhanXam.glb',                      // Dùng cho URL: /ar/rings/xam
};


// --- PHẦN 1.5: HÀM TIỆN ÍCH (HELPER FUNCTION) ---
/**
 * Tách và lấy góc xoay (twist) quanh trục Z từ một quaternion tổng.
 * @param {THREE.Quaternion} totalRotation - Quaternion tổng hợp (hướng + xoay).
 * @param {THREE.Quaternion} baseRotation - Quaternion chỉ chứa hướng cơ bản (hướng ngón tay).
 * @returns {number} Góc xoay (radian).
 */
const getTwistAngleFromQuaternion = (totalRotation, baseRotation) => {
    const inverseBase = baseRotation.clone().invert();
    const twistQuaternion = totalRotation.clone().premultiply(inverseBase);
    let angle = 2 * Math.acos(twistQuaternion.w);
    if (twistQuaternion.z < 0) {
        angle = -angle;
    }
    if (angle > Math.PI) {
        angle -= 2 * Math.PI;
    }
    return angle;
};


// --- PHẦN 2: ĐỊNH NGHĨA COMPONENT ---
const AR4 = () => {
    // --- 2.0: LẤY DỮ LIỆU TỪ ROUTE ---
    const { ringId } = useParams(); // Lấy 'ringId' từ URL, ví dụ: "yellow-red"
    const modelPath = ringModelMap[ringId]; // Tra cứu đường dẫn model từ map

    // --- 2.1: KHỞI TẠO REF VÀ STATE ---
    const videoRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");

    // --- 2.2: CÁC HẰNG SỐ ĐIỀU CHỈNH ---
    const SCALE_ADJUSTMENT_FACTOR = 0.2;
    const BASE_RING_SCALE = 0.48;
    const PALM_FACING_THRESHOLD = 0.3;
    const USE_OCCLUDER = true;
    const OCCLUDER_RADIUS_FACTOR = 0.1;
    const SMOOTHING_FACTOR = 0.8;
    const AUTO_ROTATION_SPEED = 0.02;
    const TILT_THRESHOLD = 0.2;

    const appState = useRef({
        handLandmarker: null,
        animationFrameId: null,
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000),
        renderer: null,
        ringModel: null,
        ringParts: { diamond: null, band: null },
        fingerOccluder: null,
        math: {
            p0: new THREE.Vector3(),
            p5: new THREE.Vector3(),
            p9: new THREE.Vector3(),
            p13: new THREE.Vector3(),
            p14: new THREE.Vector3(),
            p17: new THREE.Vector3(),
            fingerDir: new THREE.Vector3(),
            palmDirX: new THREE.Vector3(),
            palmDirY: new THREE.Vector3(),
            palmNormal: new THREE.Vector3(),
            fingerX: new THREE.Vector3(),
            fingerY: new THREE.Vector3(),
            fingerZ: new THREE.Vector3(),
            midPoint: new THREE.Vector3(),
            targetScale: new THREE.Vector3(),
            targetQuaternion: new THREE.Quaternion(),
            targetMatrix: new THREE.Matrix4(),
            targetOccluderScale: new THREE.Vector3(),
            targetOccluderQuaternion: new THREE.Quaternion(),
            yAxis: new THREE.Vector3(0, 1, 0),
            rotationAngle: 0,
            autoRotationQuaternion: new THREE.Quaternion(),
            finalRingQuaternion: new THREE.Quaternion(),
            localZAxis: new THREE.Vector3(0, 0, 1)
        }
    }).current;

    // --- PHẦN 3: useEffect - LOGIC CHÍNH ---
    useEffect(() => {
        // *** MỚI: Kiểm tra xem ID nhẫn có hợp lệ không trước khi bắt đầu ***
        if (!modelPath) {
            setLoadingMessage(`Lỗi: Không tìm thấy mẫu nhẫn "${ringId}".`);
            return; // Dừng việc khởi tạo
        }

        const initialize = async () => {
            await setupMediaPipe();
            await setupThreeScene();
            await startWebcam();
            startAnimationLoop();
        };

        const setupMediaPipe = async () => {
            setLoadingMessage("Tải mô hình nhận diện bàn tay...");
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
            appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU",
                },
                runningMode: "VIDEO",
                numHands: 1,
            });
        };

        const setupThreeScene = async () => {
            setLoadingMessage(`Đang tải mẫu nhẫn...`); // Cập nhật thông báo
            appState.camera.position.z = 5;
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
            appState.scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(5, 5, 5);
            appState.scene.add(directionalLight);

            if (USE_OCCLUDER) {
                const occluderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
                const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
                appState.fingerOccluder = new THREE.Mesh(occluderGeometry, occluderMaterial);
                appState.fingerOccluder.renderOrder = -1;
                appState.fingerOccluder.visible = false;
                appState.scene.add(appState.fingerOccluder);
            }

            // *** THAY ĐỔI: Sử dụng modelPath động thay vì hard-code ***
            const loader = new GLTFLoader();
            return new Promise((resolve, reject) => {
                loader.load(
                    modelPath, // Sử dụng đường dẫn đã tra cứu
                    (gltf) => {
                        // Nếu đã có model cũ, xóa nó khỏi scene trước
                        if (appState.ringModel) {
                            appState.scene.remove(appState.ringModel);
                        }

                        appState.ringModel = gltf.scene;
                        appState.ringModel.visible = true;
                        appState.ringParts.diamond = null; // Reset
                        appState.ringParts.band = null;    // Reset
                        appState.ringModel.traverse(child => {
                            if (child.isMesh) {
                                if (child.name === 'diamond') appState.ringParts.diamond = child;
                                else if (child.name === 'band') appState.ringParts.band = child;
                                child.visible = false;
                            }
                        });
                        appState.scene.add(appState.ringModel);
                        resolve();
                    },
                    undefined,
                    (error) => {
                        console.error(`Lỗi khi tải model từ ${modelPath}:`, error);
                        reject(error);
                    }
                );
            });
        };

        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
            if (!videoRef.current) return;
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'environment' } });
            videoRef.current.srcObject = stream;
            return new Promise((resolve) => {
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    const { videoWidth: vWidth, videoHeight: vHeight } = videoRef.current;
                    threeCanvasRef.current.width = vWidth;
                    threeCanvasRef.current.height = vHeight;
                    appState.camera.aspect = vWidth / vHeight;
                    appState.camera.updateProjectionMatrix();
                    appState.renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, alpha: true, antialias: true });
                    appState.renderer.setSize(vWidth, vHeight);
                    appState.renderer.setPixelRatio(window.devicePixelRatio);
                    resolve();
                };
            });
        };

        const startAnimationLoop = () => {
            setLoadingMessage("");
            const animate = () => {
                appState.animationFrameId = requestAnimationFrame(animate);
                if (videoRef.current?.readyState >= 4) {
                    const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                    processFrame(results);
                    appState.renderer.render(appState.scene, appState.camera);
                }
            };
            animate();
        };

        const getWorldVector = (landmark, distance, targetVector) => {
            const fovInRadians = (appState.camera.fov * Math.PI) / 180;
            const height = 2 * Math.tan(fovInRadians / 2) * distance;
            const width = height * appState.camera.aspect;
            targetVector.set(
                (landmark.x - 0.5) * width,
                -(landmark.y - 0.5) * height,
                -distance
            );
        };

        const processFrame = (results) => {
            const { math, ringModel, fingerOccluder, ringParts } = appState;

            if (results.landmarks?.length > 0 && ringModel) {
                const landmarks = results.landmarks[0];
                const handedness = results.handedness?.[0]?.[0]?.categoryName;

                if (landmarks[13] && landmarks[14] && landmarks[0] && landmarks[5] && landmarks[17] && landmarks[9] && handedness) {
                    const distance = appState.camera.position.z - 1.5;

                    getWorldVector(landmarks[0], distance, math.p0);
                    getWorldVector(landmarks[5], distance, math.p5);
                    getWorldVector(landmarks[9], distance, math.p9);
                    getWorldVector(landmarks[13], distance, math.p13);
                    getWorldVector(landmarks[14], distance, math.p14);
                    getWorldVector(landmarks[17], distance, math.p17);

                    const fingerWidth = math.p9.distanceTo(math.p13);
                    const requiredScale = fingerWidth * SCALE_ADJUSTMENT_FACTOR * BASE_RING_SCALE;
                    math.targetScale.set(requiredScale, requiredScale, requiredScale);
                    ringModel.scale.lerp(math.targetScale, SMOOTHING_FACTOR);

                    math.fingerDir.subVectors(math.p14, math.p13).normalize();
                    math.palmDirX.subVectors(math.p5, math.p17).normalize();
                    math.palmDirY.subVectors(math.p5, math.p0).normalize();
                    math.palmNormal.crossVectors(math.palmDirX, math.palmDirY).normalize();
                    if (handedness === 'Right') math.palmNormal.negate();

                    math.fingerZ.copy(math.palmNormal);
                    math.fingerX.crossVectors(math.fingerDir, math.fingerZ).normalize();
                    math.fingerY.crossVectors(math.fingerZ, math.fingerX).normalize();
                    math.midPoint.addVectors(math.p13, math.p14).multiplyScalar(0.5);
                    ringModel.position.lerp(math.midPoint, SMOOTHING_FACTOR);

                    math.targetMatrix.makeBasis(math.fingerX, math.fingerZ, math.fingerY.negate());
                    math.targetQuaternion.setFromRotationMatrix(math.targetMatrix);

                    const isPalmFacingCamera = math.palmNormal.z < -PALM_FACING_THRESHOLD;
                    if (!isPalmFacingCamera) {
                        if (math.palmNormal.x > TILT_THRESHOLD) {
                            math.rotationAngle += AUTO_ROTATION_SPEED;
                        } else if (math.palmNormal.x < -TILT_THRESHOLD) {
                            math.rotationAngle -= AUTO_ROTATION_SPEED;
                        }
                    }
                    math.autoRotationQuaternion.setFromAxisAngle(math.localZAxis, math.rotationAngle);

                    math.finalRingQuaternion
                        .copy(math.targetQuaternion)
                        .multiply(math.autoRotationQuaternion);

                    ringModel.quaternion.slerp(math.finalRingQuaternion, SMOOTHING_FACTOR);

                    // Logic hiển thị và occluder
                    if (USE_OCCLUDER && fingerOccluder) {
                        fingerOccluder.visible = true;
                        const occluderRadius = fingerWidth * OCCLUDER_RADIUS_FACTOR;
                        const occluderHeight = fingerWidth * 2.0;
                        math.targetOccluderScale.set(occluderRadius, occluderHeight, occluderRadius);
                        fingerOccluder.scale.lerp(math.targetOccluderScale, SMOOTHING_FACTOR);
                        fingerOccluder.position.lerp(math.midPoint, SMOOTHING_FACTOR);
                        math.targetOccluderQuaternion.setFromUnitVectors(math.yAxis, math.fingerDir);
                        fingerOccluder.quaternion.slerp(math.targetOccluderQuaternion, SMOOTHING_FACTOR);
                    }

                    if (ringParts.band) ringParts.band.visible = true;
                    // Chỉ hiển thị kim cương nếu có và lòng bàn tay không hướng về camera
                    if (ringParts.diamond) ringParts.diamond.visible = !isPalmFacingCamera;

                } else { // Nếu không phát hiện đủ các điểm mốc cần thiết
                    if (ringParts.band) ringParts.band.visible = false;
                    if (ringParts.diamond) ringParts.diamond.visible = false;
                    if (fingerOccluder) fingerOccluder.visible = false;
                }
            } else { // Nếu không phát hiện tay hoặc chưa tải model
                if (ringParts.band) ringParts.band.visible = false;
                if (ringParts.diamond) ringParts.diamond.visible = false;
                if (fingerOccluder) fingerOccluder.visible = false;
            }
        };

        initialize().catch(error => {
            console.error("Lỗi khởi tạo:", error);
            setLoadingMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
        });

        return () => { // Hàm cleanup
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [ringId, appState, modelPath]); // *** THAY ĐỔI: Thêm ringId vào dependency array

    // --- PHẦN 4: RENDER GIAO DIỆN (JSX) ---
    return (
        <main className="ar-page-container">
            <header className="page-header">
                {/* Tiêu đề có thể cập nhật động */}
                <h1>Trải nghiệm AR: {ringId}</h1>
            </header>

            <div className="ar-jewelry-container">
                {loadingMessage && (<div className="loading-overlay"><p>{loadingMessage}</p></div>)}
                <video ref={videoRef} className="ar-layer ar-video" autoPlay playsInline muted></video>
                <canvas ref={threeCanvasRef} className="ar-layer three-canvas"></canvas>
            </div>
        </main>
    );
};

export default AR4;