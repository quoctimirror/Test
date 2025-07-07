// src/components/jsx/ARJewelryTryOn.jsx
import React, { useEffect, useRef, useState } from 'react';
// SỬA LỖI: Dòng import bị lỗi đã được thay thế bằng dòng đúng dưới đây.
import * as THREE from 'three'; 
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import '../css/ARJewelryTryOn.css';

/**
 * Component ARJewelryTryOn:
 * Tạo ra trải nghiệm thử trang sức (nhẫn) bằng công nghệ Augmented Reality.
 * Sử dụng MediaPipe HandLandmarker để nhận diện các điểm mốc trên bàn tay từ webcam.
 * Sử dụng Three.js để hiển thị mô hình 3D của chiếc nhẫn lên ngón tay tương ứng trong thời gian thực.
 */
const ARJewelryTryOn = () => {
    // Refs để truy cập các phần tử DOM và giữ các đối tượng không cần re-render
    const containerRef = useRef(null); // Ref cho container chính để theo dõi kích thước
    const videoRef = useRef(null);     // Ref cho thẻ <video> hiển thị webcam
    const canvasRef = useRef(null);    // Ref cho thẻ <canvas> nơi Three.js sẽ render
    
    // State để quản lý và hiển thị thông báo loading cho người dùng
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo...");

    // Sử dụng ref để lưu trữ các đối tượng Three.js và MediaPipe.
    // Điều này ngăn chúng được khởi tạo lại mỗi khi component re-render, giúp tối ưu hiệu suất.
    const appState = useRef({
        handLandmarker: null,
        scene: null,
        camera: null,
        renderer: null,
        ringModel: null,
        animationFrameId: null,
    }).current;

    // useEffect chính, chỉ chạy một lần sau khi component được mount để thiết lập toàn bộ ứng dụng.
    useEffect(() => {
        // --- 1. KHỞI TẠO TỔNG THỂ ---
        // Hàm async để điều phối việc thiết lập MediaPipe, Three.js và webcam.
        const initialize = async () => {
            // Chạy song song việc thiết lập MediaPipe và Three.js để tiết kiệm thời gian
            await Promise.all([setupMediaPipe(), setupThreeJS()]);
            // Sau khi các thư viện đã sẵn sàng, khởi động webcam
            await startWebcam();
            // Cuối cùng, bắt đầu vòng lặp nhận diện và render
            startDetectionLoop();
        };

        // --- 2. THIẾT LẬP MEDIAPIPE ---
        const setupMediaPipe = async () => {
            setLoadingMessage("Tải mô hình nhận diện tay...");
            // Tải các tài nguyên cần thiết cho MediaPipe Vision
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
            // Tạo một đối tượng HandLandmarker
            appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU", // Sử dụng GPU để tăng tốc xử lý
                },
                runningMode: "VIDEO", // Chế độ xử lý video stream liên tục
                numHands: 2,          // Cho phép nhận diện tối đa 2 bàn tay
            });
            console.log("MediaPipe đã sẵn sàng.");
        };

        // --- 3. THIẾT LẬP THREE.JS ---
        const setupThreeJS = async () => {
            setLoadingMessage("Tải mô hình nhẫn 3D...");
            // Tạo scene, camera và renderer cơ bản của Three.js
            appState.scene = new THREE.Scene();
            appState.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000); // Góc nhìn 75 độ
            appState.camera.position.z = 5; // Đặt camera lùi lại một chút để thấy được vật thể
            
            // Renderer sẽ vẽ lên canvas với nền trong suốt (alpha: true)
            appState.renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                antialias: true, // Khử răng cưa cho hình ảnh mượt hơn
                alpha: true,     // Nền trong suốt để thấy được video phía sau
            });
            appState.renderer.setPixelRatio(window.devicePixelRatio); // Đảm bảo hình ảnh sắc nét trên màn hình HiDPI

            // Thêm ánh sáng vào scene để mô hình 3D không bị tối đen
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Ánh sáng môi trường, tỏa đều
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Ánh sáng có hướng, giống mặt trời
            directionalLight.position.set(0, 10, 10);
            appState.scene.add(ambientLight, directionalLight);

            // Tải mô hình nhẫn từ file .glb
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync('/models/ring_test_model.glb'); // Đảm bảo file này có trong thư mục /public/models
            appState.ringModel = gltf.scene;
            appState.ringModel.visible = false; // Ẩn nhẫn đi cho đến khi phát hiện được tay
            appState.scene.add(appState.ringModel);
            console.log("Mô hình nhẫn đã sẵn sàng.");
        };

        // --- 4. KHỞI ĐỘNG CAMERA ---
        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' } // Ưu tiên camera trước (selfie)
            });
            videoRef.current.srcObject = stream;
            
            // Chờ cho đến khi metadata của video được tải xong để có được kích thước chính xác
            return new Promise((resolve) => {
                videoRef.current.onloadedmetadata = () => resolve();
            });
        };

        // --- 5. VÒNG LẶP CHÍNH (NHẬN DIỆN VÀ RENDER) ---
        const startDetectionLoop = () => {
            // Sử dụng ResizeObserver để tự động cập nhật kích thước renderer và camera
            // khi kích thước của container thay đổi. Đây là cách làm responsive hiệu quả.
            const observer = new ResizeObserver(entries => {
                const { width, height } = entries[0].contentRect;
                if (appState.renderer && appState.camera) {
                    appState.renderer.setSize(width, height);
                    appState.camera.aspect = width / height;
                    appState.camera.updateProjectionMatrix();
                }
            });
            if (containerRef.current) observer.observe(containerRef.current);
            setLoadingMessage(""); // Xóa thông báo loading, ứng dụng đã sẵn sàng

            const detect = () => {
                // Chỉ chạy khi video đã sẵn sàng để tránh lỗi
                if (videoRef.current && videoRef.current.readyState >= 3) {
                    // Nhận diện các điểm mốc tay từ frame video hiện tại
                    const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                    
                    if (results.landmarks && results.landmarks.length > 0) {
                        // Chỉ xử lý bàn tay đầu tiên được phát hiện
                        const landmarks = results.landmarks[0]; 
                        updateRingOnFinger(landmarks, videoRef.current);
                    } else {
                        // Nếu không thấy tay, ẩn nhẫn đi
                        appState.ringModel.visible = false;
                    }
                }
                // Render scene của Three.js trong mọi frame
                appState.renderer.render(appState.scene, appState.camera);
                // Gọi lại hàm detect ở frame tiếp theo, tạo thành một vòng lặp
                appState.animationFrameId = requestAnimationFrame(detect);
            };
            detect();
        };

        // --- 6. LOGIC CẬP NHẬT NHẪN TRÊN NGÓN TAY ---
        // --- 6. LOGIC CẬP NHẬT NHẪN TRÊN NGÓN TAY (PHIÊN BẢN HOÀN CHỈNH) ---
const updateRingOnFinger = (landmarks, video) => {
    // ---- CÁC HỆ SỐ TINH CHỈNH ----
    // Bạn có thể thay đổi các giá trị này để nhẫn vừa vặn hơn
    const SCALE_ADJUSTMENT = 0.85;     // Điều chỉnh độ lớn tổng thể của nhẫn
    const POSITION_LERP_FACTOR = 0.35; // Vị trí của nhẫn trên ngón tay (0.0 = gốc, 1.0 = khớp giữa)

    // ---- LẤY CÁC ĐIỂM MỐC CẦN THIẾT ----
    const RING_MCP = landmarks[13];  // Khớp gốc ngón áp út
    const RING_PIP = landmarks[14];  // Khớp giữa ngón áp út
    const MIDDLE_MCP = landmarks[9]; // Khớp gốc ngón giữa (để xác định hướng tay)
    
    // ---- HÀM TIỆN ÍCH CHUẨN: CHUYỂN ĐỔI TỌA ĐỘ 2D -> 3D ----
    // Sử dụng lại hàm to3D đã được kiểm chứng, đơn giản và chính xác.
    const getLandmark3D = (landmark) => {
        const vec = new THREE.Vector3(
            (1 - landmark.x) * video.videoWidth, // Lật X để tạo hiệu ứng gương
            landmark.y * video.videoHeight,
            landmark.z
        );
        const canvas = appState.renderer.domElement;
        // Chuẩn hóa tọa độ về khoảng [-1, 1]
        vec.x = (vec.x / canvas.width) * 2 - 1;
        vec.y = -(vec.y / canvas.height) * 2 + 1;
        
        // Dùng unproject để Three.js tự tính toán vị trí trong không gian 3D
        vec.unproject(appState.camera);
        
        const dir = vec.sub(appState.camera.position).normalize();
        const distance = -appState.camera.position.z / dir.z;
        return appState.camera.position.clone().add(dir.multiplyScalar(distance));
    };

    // 1. TÍNH TOÁN TỌA ĐỘ 3D CỦA CÁC ĐIỂM
    const ringMcp3D = getLandmark3D(RING_MCP);
    const ringPip3D = getLandmark3D(RING_PIP);
    const middleMcp3D = getLandmark3D(MIDDLE_MCP);

    // 2. TÍNH TOÁN VỊ TRÍ ĐẶT NHẪN
    // Đặt nhẫn ở vị trí gần khớp gốc hơn cho tự nhiên
    const ringPosition = new THREE.Vector3().lerpVectors(ringMcp3D, ringPip3D, POSITION_LERP_FACTOR);
    appState.ringModel.position.copy(ringPosition);

    // 3. TÍNH TOÁN GÓC XOAY ĐỂ NHẪN "ÔM" VÀO NGÓN TAY
    // Trục Y của nhẫn (lỗ nhẫn) sẽ hướng dọc theo ngón tay
    const axisY = new THREE.Vector3().subVectors(ringPip3D, ringMcp3D).normalize();
    
    // Vector phụ để xác định mặt phẳng bàn tay
    const auxVec = new THREE.Vector3().subVectors(middleMcp3D, ringMcp3D).normalize();
    
    // Trục Z của nhẫn sẽ hướng ra khỏi mặt trên của ngón tay
    const axisZ = new THREE.Vector3().crossVectors(axisY, auxVec).normalize();
    
    // Trục X của nhẫn sẽ hướng ngang qua ngón tay
    const axisX = new THREE.Vector3().crossVectors(axisY, axisZ).normalize();

    // Tạo ma trận xoay từ 3 trục cơ sở vừa tính
    const rotationMatrix = new THREE.Matrix4().makeBasis(axisX, axisY, axisZ);
    appState.ringModel.quaternion.setFromRotationMatrix(rotationMatrix);

    // 4. HIỆU CHỈNH HƯỚNG CỦA MODEL 3D
    // Đây là bước quan trọng nhất để nhẫn "đeo" vào ngón tay thay vì "nằm" trên đó.
    // Giả sử lỗ của model nhẫn mặc định nằm dọc theo trục Y của nó.
    // Chúng ta cần xoay nó 90 độ quanh trục X (trục ngang) để lỗ nhẫn hướng đúng.
    const correction = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    appState.ringModel.quaternion.multiply(correction);

    // 5. TÍNH TOÁN KÍCH THƯỚC NHẪN
    // Kích thước tỉ lệ với khoảng cách giữa 2 khớp ngón tay trên màn hình
    const distance = ringMcp3D.distanceTo(ringPip3D);
    const scale = distance * SCALE_ADJUSTMENT;
    appState.ringModel.scale.set(scale, scale, scale);
    
    // 6. HIỂN THỊ NHẪN
    appState.ringModel.visible = true;
};
        
        // ---- THÊM HÀM ĐIỀU CHỈNH NHẪN ----
        const adjustRingOrientation = (correctionX = 0, correctionY = 0, correctionZ = 0) => {
            // Hàm này để điều chỉnh hướng nhẫn nếu cần
            // Gọi hàm này trong updateRingOnFinger nếu nhẫn vẫn xoay sai
            
            const additionalRotation = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(correctionX, correctionY, correctionZ));
            
            if (appState.ringModel) {
                appState.ringModel.quaternion.multiply(additionalRotation);
            }
        };
        
        // ---- HÀM KHỞI TẠO ----
        const initializeRing = () => {
            if (appState.ringModel) {
                appState.ringModel.visible = false;
                appState.ringModel.position.set(0, 0, -1000);
                appState.ringModel.rotation.set(0, 0, 0);
                appState.ringModel.scale.set(1, 1, 1);
                
                appState.ringModel.userData = {
                    lastPosition: null,
                    lastQuaternion: null
                };
                
                console.log("💍 Ring initialized for finger wrapping");
            }
        };
        
        

        // Bắt đầu toàn bộ quá trình
        initialize().catch(error => {
            console.error("Lỗi khởi tạo ứng dụng AR:", error);
            setLoadingMessage("Đã xảy ra lỗi. Vui lòng làm mới trang.");
        });

        // Hàm dọn dẹp (cleanup) sẽ chạy khi component bị unmount
        return () => {
            // Dừng vòng lặp animation để tránh rò rỉ bộ nhớ
            if (appState.animationFrameId) {
                cancelAnimationFrame(appState.animationFrameId);
            }
            // Dừng stream video từ webcam
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [appState]); // Phụ thuộc vào appState để đảm bảo nó không thay đổi giữa các lần render

    return (
        <div ref={containerRef} className="ar-jewelry-container">
            {/* Hiển thị lớp phủ loading khi cần */}
            {loadingMessage && (
                <div className="loading-overlay">
                    <p>{loadingMessage}</p>
                </div>
            )}
            {/* Thẻ video ẩn đi, chỉ dùng để lấy dữ liệu cho MediaPipe */}
            <video ref={videoRef} className="ar-video" autoPlay playsInline muted></video>
            {/* Thẻ canvas nơi Three.js vẽ cảnh 3D */}
            <canvas ref={canvasRef} className="ar-canvas"></canvas>
        </div>
    );
};

export default ARJewelryTryOn;