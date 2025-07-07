// --- PHẦN 1: KHAI BÁO VÀ IMPORT ---
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import '../css/AR1.css'; // Giả sử bạn vẫn dùng chung CSS

// --- PHẦN 2: ĐỊNH NGHĨA COMPONENT ---
const AR2_SmoothlyMotion = () => {
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

    // --- CẢI TIẾN 1: HỆ SỐ LÀM MƯỢT ---
    // Giảm giá trị này để chuyển động mượt hơn (nhưng sẽ có độ trễ nhẹ, tạo cảm giác điện ảnh).
    // 0.1 là một giá trị tốt cho độ mượt cao.
    const SMOOTHING_FACTOR = 0.8 ;

    // --- CẢI TIẾN 2: TỐI ƯU HÓA BỘ NHỚ ---
    // Khởi tạo các đối tượng Three.js MỘT LẦN DUY NHẤT để tái sử dụng trong vòng lặp animation.
    // Điều này tránh việc tạo object mới mỗi frame, giảm áp lực lên bộ nhớ và tránh giật lag.
    const appState = useRef({
        handLandmarker: null,
        animationFrameId: null,
        scene: new THREE.Scene(),
        camera: new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000),
        renderer: null,
        ringModel: null,
        ringParts: { diamond: null, band: null },
        fingerOccluder: null,
        // Nhóm các đối tượng tái sử dụng cho việc tính toán
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
        }
    }).current;

    // --- PHẦN 3: useEffect - LOGIC CHÍNH ---
    useEffect(() => {
        // --- 3.1: HÀM KHỞI TẠO TỔNG ---
        const initialize = async () => {
            await setupMediaPipe();
            await setupThreeScene();
            await startWebcam();
            startAnimationLoop();
        };

        // --- 3.2: CÀI ĐẶT MEDIAPIPE ---
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

        // --- 3.3: CÀI ĐẶT CẢNH 3D ---
        const setupThreeScene = async () => {
            setLoadingMessage("Chuẩn bị không gian 3D...");
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

            const loader = new GLTFLoader();
            return new Promise((resolve, reject) => {
                loader.load('/models/ring_meshes_yellow_red.glb', (gltf) => {
                    appState.ringModel = gltf.scene;
                    appState.ringModel.visible = true;
                    appState.ringModel.traverse(child => {
                        if (child.isMesh) {
                            if (child.name === 'diamond') appState.ringParts.diamond = child;
                            else if (child.name === 'band') appState.ringParts.band = child;
                            child.visible = false;
                        }
                    });
                    appState.scene.add(appState.ringModel);
                    resolve();
                }, undefined, reject);
            });
        };

        // --- 3.4: MỞ WEBCAM ---
        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
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

        // --- 3.5: VÒNG LẶP ANIMATION ---
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

        // TỐI ƯU HÓA: Hàm này giờ sẽ ghi kết quả vào một vector có sẵn thay vì tạo mới.
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
        
        // --- 3.6: HÀM XỬ LÝ MỖI KHUNG HÌNH ---
        const processFrame = (results) => {
            // TỐI ƯU HÓA: Lấy các đối tượng tính toán từ appState để tái sử dụng
            const { math } = appState;

            if (results.landmarks?.length > 0 && appState.ringModel) {
                const landmarks = results.landmarks[0];
                const handedness = results.handedness?.[0]?.[0]?.categoryName;

                if (landmarks[13] && landmarks[14] && landmarks[0] && landmarks[5] && landmarks[17] && landmarks[9] && handedness) {
                    const distance = appState.camera.position.z - 1.5;

                    // TỐI ƯU HÓA: Cập nhật các vector có sẵn thay vì tạo mới
                    getWorldVector(landmarks[0], distance, math.p0);
                    getWorldVector(landmarks[5], distance, math.p5);
                    getWorldVector(landmarks[9], distance, math.p9);
                    getWorldVector(landmarks[13], distance, math.p13);
                    getWorldVector(landmarks[14], distance, math.p14);
                    getWorldVector(landmarks[17], distance, math.p17);

                    // B1: TÍNH TOÁN KÍCH THƯỚC
                    const fingerWidth = math.p9.distanceTo(math.p13);
                    const requiredScale = fingerWidth * SCALE_ADJUSTMENT_FACTOR * BASE_RING_SCALE;
                    math.targetScale.set(requiredScale, requiredScale, requiredScale);
                    appState.ringModel.scale.lerp(math.targetScale, SMOOTHING_FACTOR);

                    // B2: TÍNH TOÁN HƯỚNG
                    math.fingerDir.subVectors(math.p14, math.p13).normalize();
                    math.palmDirX.subVectors(math.p5, math.p17).normalize();
                    math.palmDirY.subVectors(math.p5, math.p0).normalize();
                    math.palmNormal.crossVectors(math.palmDirX, math.palmDirY).normalize();
                    if (handedness === 'Right') math.palmNormal.negate();
                    
                    math.fingerZ.copy(math.palmNormal);
                    math.fingerX.crossVectors(math.fingerDir, math.fingerZ).normalize();
                    math.fingerY.crossVectors(math.fingerZ, math.fingerX).normalize();
                    math.midPoint.addVectors(math.p13, math.p14).multiplyScalar(0.5);

                    // B3: CẬP NHẬT NHẪN
                    appState.ringModel.position.lerp(math.midPoint, SMOOTHING_FACTOR);
                    math.targetMatrix.makeBasis(math.fingerX, math.fingerZ, math.fingerY.negate()); // Trục Y của nhẫn hướng vào trong
                    math.targetQuaternion.setFromRotationMatrix(math.targetMatrix);
                    appState.ringModel.quaternion.slerp(math.targetQuaternion, SMOOTHING_FACTOR);
                    
                    // B4: CẬP NHẬT VẬT CHE
                    if (USE_OCCLUDER && appState.fingerOccluder) {
                        appState.fingerOccluder.visible = true;
                        const occluderRadius = fingerWidth * OCCLUDER_RADIUS_FACTOR;
                        const occluderHeight = fingerWidth * 2.0;
                        math.targetOccluderScale.set(occluderRadius, occluderHeight, occluderRadius);
                        appState.fingerOccluder.scale.lerp(math.targetOccluderScale, SMOOTHING_FACTOR);
                        appState.fingerOccluder.position.lerp(math.midPoint, SMOOTHING_FACTOR);
                        math.targetOccluderQuaternion.setFromUnitVectors(math.yAxis, math.fingerDir);
                        appState.fingerOccluder.quaternion.slerp(math.targetOccluderQuaternion, SMOOTHING_FACTOR);
                    }
                    
                    // B5: HIỂN THỊ CÁC BỘ PHẬN
                    const isPalmFacingCamera = math.palmNormal.z < -PALM_FACING_THRESHOLD;
                    appState.ringParts.band.visible = true;
                    appState.ringParts.diamond.visible = !isPalmFacingCamera;

                } else {
                    appState.ringParts.band.visible = false;
                    appState.ringParts.diamond.visible = false;
                    if (appState.fingerOccluder) appState.fingerOccluder.visible = false;
                }
            } else {
                appState.ringParts.band.visible = false;
                appState.ringParts.diamond.visible = false;
                if (appState.fingerOccluder) appState.fingerOccluder.visible = false;
            }
        };

        // --- 3.7: KHỞI TẠO VÀ DỌN DẸP ---
        initialize().catch(error => {
            console.error("Lỗi khởi tạo:", error);
            setLoadingMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
        });

        return () => {
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        };
    }, [appState]);

    // --- PHẦN 4: RENDER GIAO DIỆN (JSX) ---
    return (
        <div className="ar-jewelry-container">
            {loadingMessage && (<div className="loading-overlay"><p>{loadingMessage}</p></div>)}
            <video ref={videoRef} className="ar-layer ar-video" autoPlay playsInline muted></video>
            {/* Canvas debug có thể được ẩn đi nếu không cần */}
            {/* <canvas ref={debugCanvasRef} className="ar-layer debug-canvas"></canvas> */}
            <canvas ref={threeCanvasRef} className="ar-layer three-canvas"></canvas>
        </div>
    );
};

export default AR2_SmoothlyMotion;