// --- PHẦN 1: KHAI BÁO VÀ IMPORT ---
// Import các thư viện cần thiết.
import React, { useEffect, useRef, useState } from 'react'; // Thư viện React cơ bản để xây dựng component.
import * as THREE from 'three'; // Thư viện chính để xử lý đồ họa 3D (Three.js).
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Một module của Three.js để tải các model 3D có định dạng .glb.
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"; // Thư viện của Google để nhận diện và theo dõi các điểm mốc trên bàn tay.
import '../css/AR1.css'; // Import file CSS để tạo kiểu cho giao diện.

// --- PHẦN 2: ĐỊNH NGHĨA COMPONENT AR1 ---
const AR1 = () => {
    // --- 2.1: KHỞI TẠO CÁC "REF" VÀ "STATE" ---
    // useRef được dùng để tham chiếu đến các phần tử DOM (như video, canvas) mà không gây re-render component.
    const videoRef = useRef(null); // Tham chiếu đến thẻ <video> để hiển thị hình ảnh từ webcam.
    const threeCanvasRef = useRef(null); // Tham chiếu đến canvas để vẽ cảnh 3D (nhẫn).
    const debugCanvasRef = useRef(null); // Tham chiếu đến canvas để vẽ các đường debug (nếu cần).
    
    // useState được dùng để quản lý trạng thái của component. Khi state thay đổi, component sẽ re-render.
    const [loadingMessage, setLoadingMessage] = useState("Đang khởi tạo..."); // Lưu và hiển thị thông báo tải cho người dùng.

    // --- 2.2: CÁC HẰNG SỐ ĐIỀU CHỈNH ---
    // Đây là các "nút vặn" để bạn tinh chỉnh trải nghiệm AR.
    const SCALE_ADJUSTMENT_FACTOR = 0.2; // Hệ số điều chỉnh thêm cho kích thước nhẫn.
    const BASE_RING_SCALE = 0.48; // Kích thước cơ bản của nhẫn, giúp nó không quá to hoặc quá nhỏ.
    const PALM_FACING_THRESHOLD = 0.3; // Ngưỡng độ nhạy để xác định lòng bàn tay đang ngửa hay úp.

    // Hằng số để bật/tắt chức năng che khuất thực tế hơn.
    const USE_OCCLUDER = true; // Đặt là `true` để bật vật thể che ngón tay. `false` để tắt.
    
    // Hệ số điều chỉnh độ dày của vật thể che ngón tay.
    // Giảm số này sẽ làm cho "vật che" mỏng hơn, khớp với ngón tay hơn.
    const OCCLUDER_RADIUS_FACTOR = 0.1; 

    // --- 2.3: KHỞI TẠO TRẠNG THÁI CỦA ỨNG DỤNG (appState) ---
    // Dùng useRef để lưu trữ các đối tượng phức tạp (như scene, renderer của Three.js).
    // Việc này giúp chúng không bị khởi tạo lại mỗi lần component re-render.
    const appState = useRef({
        handLandmarker: null, // Đối tượng của MediaPipe để nhận diện tay.
        animationFrameId: null, // ID của vòng lặp animation, dùng để hủy khi cần.
        scene: null, // Cảnh 3D, chứa tất cả các vật thể (nhẫn, đèn, camera).
        camera: null, // Camera ảo, quyết định góc nhìn vào cảnh 3D.
        renderer: null, // Công cụ để "vẽ" cảnh 3D lên canvas.
        ringModel: null, // Toàn bộ model 3D của chiếc nhẫn.
        ringParts: { // Một đối tượng để lưu các mesh (bộ phận) riêng của nhẫn.
            diamond: null, // Mesh của viên kim cương.
            band: null // Mesh của đai nhẫn.
        },
        fingerAxisHelper: null, // Một công cụ debug để hiển thị các trục tọa độ của ngón tay.
        fingerOccluder: null, // Một vật thể 3D vô hình, dùng để che đi phần nhẫn bị ngón tay che khuất.
    }).current; // .current để truy cập trực tiếp vào giá trị của ref.

    // --- PHẦN 3: useEffect - LOGIC CHÍNH CỦA COMPONENT ---
    // Toàn bộ code trong đây sẽ chỉ chạy một lần sau khi component được render lần đầu tiên.
    useEffect(() => {
        // --- 3.1: HÀM KHỞI TẠO TỔNG ---
        // Hàm này gọi tuần tự các bước thiết lập.
        const initialize = async () => {
            await setupMediaPipe(); // Bước 1: Cài đặt thư viện nhận diện tay.
            await setupThreeScene(); // Bước 2: Dựng cảnh 3D.
            await startWebcam(); // Bước 3: Mở camera và kết nối.
            startAnimationLoop(); // Bước 4: Bắt đầu vòng lặp xử lý và vẽ liên tục.
        };

        // --- 3.2: CÀI ĐẶT MEDIAPIPE ---
        const setupMediaPipe = async () => {
            setLoadingMessage("Tải mô hình nhận diện bàn tay...");
            // Tải các file cần thiết cho thư viện MediaPipe.
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
            // Tạo một đối tượng HandLandmarker với các tùy chọn.
            appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, // Đường dẫn đến model AI.
                    delegate: "GPU", // Yêu cầu sử dụng GPU để tăng tốc xử lý.
                },
                runningMode: "VIDEO", // Chế độ xử lý cho video thời gian thực.
                numHands: 1, // Chỉ nhận diện 1 bàn tay để tối ưu hiệu năng.
            });
            console.log("✅ MediaPipe đã sẵn sàng.");
        };

        // --- 3.3: CÁC HÀM TIỆN ÍCH CHO 3D ---
        // Hàm này tạo một công cụ debug (3 trục X, Y, Z với 3 màu khác nhau).
        const createCustomAxesHelper = (size, colors) => {
            // Code Three.js để tạo các đường thẳng đại diện cho các trục.
            const group = new THREE.Group();
            const { xColor, yColor, zColor } = colors;
            const createAxis = (vector, color) => {
                const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
                const points = [new THREE.Vector3(0, 0, 0), vector];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                return new THREE.Line(geometry, material);
            };
            group.add(createAxis(new THREE.Vector3(size, 0, 0), xColor));
            group.add(createAxis(new THREE.Vector3(0, size, 0), yColor));
            group.add(createAxis(new THREE.Vector3(0, 0, size), zColor));
            return group;
        };

        // --- 3.4: CÀI ĐẶT CẢNH 3D (THREE.JS) ---
        const setupThreeScene = async () => {
            setLoadingMessage("Chuẩn bị không gian 3D...");
            // Tạo các thành phần cơ bản của một cảnh 3D.
            appState.scene = new THREE.Scene(); // Tạo cảnh.
            appState.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000); // Tạo camera phối cảnh.
            appState.camera.position.z = 5; // Đặt camera ở xa một chút để nhìn thấy vật thể.

            // Thêm ánh sáng để model không bị tối đen.
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Ánh sáng môi trường, tỏa đều khắp nơi.
            appState.scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Ánh sáng có hướng, giống như mặt trời.
            directionalLight.position.set(5, 5, 5);
            appState.scene.add(directionalLight);

            // Tạo và thêm công cụ debug trục tọa độ vào cảnh.
            appState.fingerAxisHelper = createCustomAxesHelper(2, { xColor: 0xffff00, yColor: 0xff00ff, zColor: 0x00ffff });
            appState.fingerAxisHelper.visible = false; // Ẩn nó đi lúc đầu.
            appState.scene.add(appState.fingerAxisHelper);

            // --- PHẦN QUAN TRỌNG: TẠO VẬT THỂ CHE (OCCLUDER) ---
            // Chỉ tạo vật thể này nếu hằng số USE_OCCLUDER là true.
            if (USE_OCCLUDER) {
                // Tạo một hình trụ. Hình dạng này sẽ mô phỏng ngón tay.
                const occluderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
                // Tạo một vật liệu đặc biệt: `colorWrite: false` có nghĩa là vật liệu này VÔ HÌNH.
                // Tuy nhiên, nó vẫn ghi vào bộ đệm chiều sâu (depth buffer), "đục một cái lỗ" trong không gian 3D.
                // Bất cứ vật thể nào nằm sau "cái lỗ" này sẽ không được vẽ.
                const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
                appState.fingerOccluder = new THREE.Mesh(occluderGeometry, occluderMaterial);
                // `renderOrder = -1` là một thiết lập CỰC KỲ QUAN TRỌNG. Nó buộc Three.js phải vẽ vật thể này
                // TRƯỚC KHI vẽ chiếc nhẫn. Điều này đảm bảo "cái lỗ" được tạo ra trước khi nhẫn được vẽ lên.
                appState.fingerOccluder.renderOrder = -1;
                appState.fingerOccluder.visible = false; // Ẩn đi lúc đầu.
                appState.scene.add(appState.fingerOccluder); // Thêm vào cảnh.
            }

            // Tải model 3D của chiếc nhẫn.
            const loader = new GLTFLoader();
            return new Promise((resolve, reject) => {
                // Đường dẫn đến file model đã được tách mesh.
                loader.load('/models/ring_meshes_yellow_red.glb', (gltf) => {
                    appState.ringModel = gltf.scene; // Lấy toàn bộ cảnh từ file glb.
                    appState.ringModel.visible = true; 
                    // Duyệt qua tất cả các bộ phận (mesh) bên trong model.
                    appState.ringModel.traverse(child => {
                        if (child.isMesh) {
                            // Nếu tên của mesh là 'diamond', lưu nó vào ringParts.diamond.
                            if (child.name === 'diamond') appState.ringParts.diamond = child;
                            // Nếu tên là 'band', lưu nó vào ringParts.band.
                            else if (child.name === 'band') appState.ringParts.band = child;
                            child.visible = false; // Ẩn từng bộ phận đi lúc đầu.
                        }
                    });
                    appState.scene.add(appState.ringModel); // Thêm toàn bộ model vào cảnh.
                    resolve(); // Báo cho Promise biết là đã tải xong.
                }, undefined, (error) => {
                    console.error("❌ Lỗi tải model:", error);
                    reject(error);
                });
            });
        };

        // --- 3.5: MỞ WEBCAM ---
        const startWebcam = async () => {
            setLoadingMessage("Mở camera...");
            try {
                // Xin quyền truy cập và lấy luồng video từ camera sau của điện thoại.
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'environment' } });
                videoRef.current.srcObject = stream; // Gán luồng video vào thẻ <video>.
                return new Promise((resolve) => {
                    // Chờ đến khi video đã có đủ dữ liệu để chạy.
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play(); // Bắt đầu chạy video.
                        // Lấy kích thước thực tế của video.
                        const vWidth = videoRef.current.videoWidth;
                        const vHeight = videoRef.current.videoHeight;
                        // Cài đặt kích thước cho các canvas để khớp với video.
                        threeCanvasRef.current.width = vWidth;
                        threeCanvasRef.current.height = vHeight;
                        debugCanvasRef.current.width = vWidth;
                        debugCanvasRef.current.height = vHeight;
                        // Cập nhật tỷ lệ khung hình của camera 3D.
                        appState.camera.aspect = vWidth / vHeight;
                        appState.camera.updateProjectionMatrix();
                        // Khởi tạo renderer để vẽ lên canvas 3D.
                        appState.renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, alpha: true, antialias: true });
                        appState.renderer.setSize(vWidth, vHeight);
                        appState.renderer.setPixelRatio(window.devicePixelRatio);
                        resolve();
                    };
                });
            } catch (error) { console.error("❌ Lỗi Webcam:", error); setLoadingMessage("Không thể truy cập camera."); }
        };

        // --- 3.6: BẮT ĐẦU VÒNG LẶP ANIMATION ---
        const startAnimationLoop = () => {
            setLoadingMessage(""); // Xóa thông báo tải.
            const animate = () => {
                // Kiểm tra xem video đã sẵn sàng chưa.
                if (videoRef.current?.readyState >= 4) {
                    // Nhận diện tay trong khung hình video hiện tại.
                    const results = appState.handLandmarker.detectForVideo(videoRef.current, performance.now());
                    // Gửi kết quả đến hàm xử lý.
                    processFrame(results);
                    // Vẽ cảnh 3D lên canvas.
                    if (appState.renderer) appState.renderer.render(appState.scene, appState.camera);
                }
                // Yêu cầu trình duyệt gọi lại hàm `animate` ở khung hình tiếp theo.
                appState.animationFrameId = requestAnimationFrame(animate);
            };
            animate(); // Bắt đầu vòng lặp.
        };

        // --- 3.7: CÁC HÀM TÍNH TOÁN TỌA ĐỘ ---
        // Hàm tính kích thước của khung nhìn camera ở một khoảng cách nhất định.
        const getCameraViewSize = (distance) => {
            const fovInRadians = (appState.camera.fov * Math.PI) / 180;
            const height = 2 * Math.tan(fovInRadians / 2) * distance;
            return { width: height * appState.camera.aspect, height };
        };

        // Hàm chuyển đổi tọa độ 2D của landmark (từ 0.0 đến 1.0) sang tọa độ 3D trong thế giới ảo.
        const getWorldVector = (landmark, distance) => {
            const viewSize = getCameraViewSize(distance);
            const worldX = (landmark.x - 0.5) * viewSize.width;
            const worldY = -(landmark.y - 0.5) * viewSize.height;
            return new THREE.Vector3(worldX, worldY, -distance);
        };

        // --- 3.8: HÀM XỬ LÝ MỖI KHUNG HÌNH (PROCESS FRAME) ---
        // Đây là nơi tất cả logic AR diễn ra.
        const processFrame = (results) => {
            // Xóa canvas debug ở mỗi khung hình.
            const debugCtx = debugCanvasRef.current.getContext('2d');
            debugCtx.clearRect(0, 0, debugCtx.canvas.width, debugCtx.canvas.height);

            // Kiểm tra xem có nhận diện được bàn tay không và model đã được tải chưa.
            if (results.landmarks?.length > 0 && appState.ringModel) {
                const landmarks = results.landmarks[0]; // Lấy danh sách các điểm mốc của bàn tay đầu tiên.
                const handedness = results.handedness?.[0]?.[0]?.categoryName; // Xác định là tay trái hay tay phải.

                // Kiểm tra xem các điểm mốc cần thiết có tồn tại không.
                if (landmarks[13] && landmarks[14] && landmarks[0] && landmarks[5] && landmarks[17] && landmarks[9] && handedness) {
                    appState.fingerAxisHelper.visible = true; // Hiện công cụ debug.

                    const distance = appState.camera.position.z - 1.5; // Khoảng cách ước tính từ camera đến bàn tay.

                    // Lấy tọa độ 3D của các điểm mốc quan trọng.
                    const p0 = getWorldVector(landmarks[0], distance);  // Cổ tay
                    const p5 = getWorldVector(landmarks[5], distance);  // Gốc ngón trỏ
                    const p9 = getWorldVector(landmarks[9], distance);  // Gốc ngón giữa
                    const p13 = getWorldVector(landmarks[13], distance); // Gốc ngón áp út
                    const p14 = getWorldVector(landmarks[14], distance); // Khớp thứ hai ngón áp út
                    const p17 = getWorldVector(landmarks[17], distance); // Gốc ngón út

                    // B1: TÍNH KÍCH THƯỚC NHẪN
                    // Đo khoảng cách giữa gốc ngón giữa và ngón áp út để ước lượng chiều rộng ngón tay.
                    const fingerWidth = p9.distanceTo(p13);
                    // Tính toán kích thước cuối cùng cho model nhẫn.
                    const requiredScale = fingerWidth * SCALE_ADJUSTMENT_FACTOR * BASE_RING_SCALE;
                    appState.ringModel.scale.set(requiredScale, requiredScale, requiredScale);

                    // B2: TÍNH HỆ TRỤC TỌA ĐỘ CỦA NGÓN TAY
                    // Vector chỉ hướng của ngón tay (từ gốc đến khớp thứ hai).
                    const fingerDir = new THREE.Vector3().subVectors(p14, p13).normalize();
                    // Vector chỉ chiều ngang của lòng bàn tay.
                    const palmDirX = new THREE.Vector3().subVectors(p5, p17).normalize();
                    // Vector chỉ chiều dọc của lòng bàn tay.
                    const palmDirY = new THREE.Vector3().subVectors(p5, p0).normalize();
                    // Vector pháp tuyến (vuông góc) với lòng bàn tay, tính bằng tích có hướng.
                    let palmNormal = new THREE.Vector3().crossVectors(palmDirX, palmDirY).normalize();

                    // Điều chỉnh cho tay phải vì quy tắc bàn tay phải trong toán học.
                    if (handedness === 'Right') palmNormal.negate();
                    
                    // Tạo một hệ trục tọa độ hoàn chỉnh cho ngón tay.
                    const fingerZ = palmNormal; // Trục Z của ngón tay là vector pháp tuyến của lòng bàn tay.
                    const fingerX = new THREE.Vector3().crossVectors(fingerDir, fingerZ).normalize(); // Trục X.
                    const fingerY = new THREE.Vector3().crossVectors(fingerZ, fingerX).normalize(); // Trục Y.
                    // Vị trí trung điểm của khớp ngón tay, nơi đặt nhẫn.
                    const midPoint = new THREE.Vector3().addVectors(p13, p14).multiplyScalar(0.5);

                    // Cập nhật vị trí và hướng cho công cụ debug.
                    appState.fingerAxisHelper.position.copy(midPoint);
                    appState.fingerAxisHelper.matrix.makeBasis(fingerX, fingerY, fingerZ);
                    appState.fingerAxisHelper.quaternion.setFromRotationMatrix(appState.fingerAxisHelper.matrix);

                    // B3: CẬP NHẬT VỊ TRÍ VÀ HƯỚNG CỦA NHẪN
                    appState.ringModel.position.copy(midPoint); // Đặt nhẫn vào vị trí.
                    // Tính toán các trục của nhẫn để nó xoay đúng hướng.
                    const ringTargetX = fingerX;
                    const ringTargetY = fingerZ;
                    const ringTargetZ = new THREE.Vector3().crossVectors(ringTargetX, ringTargetY).normalize();
                    // Cập nhật ma trận xoay của nhẫn.
                    appState.ringModel.matrix.makeBasis(ringTargetX, ringTargetY, ringTargetZ);
                    appState.ringModel.quaternion.setFromRotationMatrix(appState.ringModel.matrix);

                    // B4: CẬP NHẬT VẬT THỂ CHE (OCCLUDER)
                    // Chỉ thực hiện nếu chức năng này được bật.
                    if (USE_OCCLUDER && appState.fingerOccluder) {
                        appState.fingerOccluder.visible = true; // Hiện vật thể che.
                        // Tính toán kích thước cho vật thể che.
                        const occluderRadius = fingerWidth * OCCLUDER_RADIUS_FACTOR; // Bán kính (độ dày)
                        const occluderHeight = fingerWidth * 2.0; // Chiều dài (phải đủ dài để che ngón tay)
                        appState.fingerOccluder.scale.set(occluderRadius, occluderHeight, occluderRadius);
                        appState.fingerOccluder.position.copy(midPoint); // Đặt nó vào đúng vị trí của nhẫn.
                        // Xoay hình trụ để nó nằm dọc theo hướng của ngón tay (fingerDir).
                        const yAxis = new THREE.Vector3(0, 1, 0); // Trục Y mặc định của hình trụ.
                        appState.fingerOccluder.quaternion.setFromUnitVectors(yAxis, fingerDir);
                    }
                    
                    // B5: XỬ LÝ ẨN/HIỆN KIM CƯƠNG KHI LẬT BÀN TAY
                    // Camera nhìn theo trục -Z. Nếu lòng bàn tay hướng về camera, vector pháp tuyến của nó (palmNormal)
                    // sẽ có thành phần z là số ÂM.
                    const isPalmFacingCamera = palmNormal.z < -PALM_FACING_THRESHOLD;
                    
                    // Luôn hiện đai nhẫn khi thấy tay.
                    if (appState.ringParts.band) {
                        appState.ringParts.band.visible = true;
                    }
                    // Chỉ hiện kim cương khi lòng bàn tay KHÔNG ngửa về phía camera.
                    if (appState.ringParts.diamond) {
                        appState.ringParts.diamond.visible = !isPalmFacingCamera;
                    }

                } else {
                    // Nếu không thấy đủ các điểm mốc cần thiết, ẩn mọi thứ đi.
                    if (appState.ringParts.band) appState.ringParts.band.visible = false;
                    if (appState.ringParts.diamond) appState.ringParts.diamond.visible = false;
                    appState.fingerAxisHelper.visible = false;
                    if (USE_OCCLUDER && appState.fingerOccluder) appState.fingerOccluder.visible = false;
                }
            } else {
                // Nếu không thấy tay nào cả, ẩn mọi thứ đi.
                if (appState.ringParts.band) appState.ringParts.band.visible = false;
                if (appState.ringParts.diamond) appState.ringParts.diamond.visible = false;
                if (appState.fingerAxisHelper) appState.fingerAxisHelper.visible = false;
                if (USE_OCCLUDER && appState.fingerOccluder) appState.fingerOccluder.visible = false;
            }
        };

        // --- 3.9: CHẠY HÀM KHỞI TẠO ---
        initialize();

        // --- 3.10: HÀM DỌN DẸP (CLEANUP) ---
        // Hàm này sẽ được gọi khi component bị gỡ bỏ khỏi cây DOM.
        return () => {
            // Dừng vòng lặp animation để tránh rò rỉ bộ nhớ.
            if (appState.animationFrameId) cancelAnimationFrame(appState.animationFrameId);
            // Dừng luồng video từ webcam.
            if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        };
    }, [appState]); // Mảng phụ thuộc rỗng đảm bảo useEffect chỉ chạy một lần.

    // --- PHẦN 4: RENDER GIAO DIỆN (JSX) ---
    // Đây là phần định nghĩa cấu trúc HTML của component.
    return (
        <div className="ar-jewelry-container">
            {/* Hiển thị thông báo tải nếu loadingMessage có nội dung */}
            {loadingMessage && (<div className="loading-overlay"><p>{loadingMessage}</p></div>)}
            {/* Thẻ video để hiển thị webcam, người dùng không nhìn thấy trực tiếp */}
            <video ref={videoRef} className="ar-layer ar-video" autoPlay playsInline muted></video>
            {/* Canvas để vẽ các đường debug, nằm trên cùng */}
            <canvas ref={debugCanvasRef} className="ar-layer debug-canvas"></canvas>
            {/* Canvas để vẽ cảnh 3D, nằm bên dưới canvas debug */}
            <canvas ref={threeCanvasRef} className="ar-layer three-canvas"></canvas>
        </div>
    );
};

export default AR1; // Xuất component để có thể sử dụng ở nơi khác.