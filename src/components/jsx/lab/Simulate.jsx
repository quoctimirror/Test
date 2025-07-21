// --- PHẦN 1: IMPORT CÁC THƯ VIỆN CẦN THIẾT ---

// Import các thành phần cốt lõi từ thư viện React.
// - React: Thư viện nền tảng.
// - useRef: Hook để tạo một tham chiếu (reference) đến một phần tử DOM, giúp ta truy cập nó trong code JavaScript.
// - useEffect: Hook để thực thi các "tác dụng phụ" (side effects) sau khi component đã được render, ví dụ như khởi tạo một cảnh 3D.
import React, { useRef, useEffect } from 'react';

// Import toàn bộ thư viện Three.js dưới tên đối tượng là `THREE`.
import * as THREE from 'three';

// Import một "loader" (trình tải) cụ thể từ Three.js để tải các file ảnh môi trường định dạng .hdr.
// Điều này giúp tạo ra ánh sáng và phản chiếu chân thực trên các vật thể.
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';



// --- PHẦN 2: ĐỊNH NGHĨA COMPONENT REACT ---

// Khai báo một functional component của React tên là `Simulate`.
const Simulate = () => {
    // Tạo một tham chiếu (ref) tên là `mountRef`. Ref này sẽ được gắn vào thẻ `div` bên dưới.
    // Nó hoạt động như một "cái neo" để chúng ta có thể "bắt" lấy thẻ `div` đó và vẽ cảnh 3D vào bên trong.
    const mountRef = useRef(null);

    // Sử dụng `useEffect` để chứa toàn bộ logic của Three.js.
    // Cặp ngoặc vuông `[]` ở cuối đảm bảo rằng code bên trong chỉ chạy MỘT LẦN DUY NHẤT sau khi component được hiển thị lần đầu.
    useEffect(() => {
        // --- PHẦN 3: KHỞI TẠO CÁC THÀNH PHẦN CỐT LÕI CỦA THREE.JS ---

        // Lấy ra phần tử DOM thực sự (thẻ `div`) mà `mountRef` đang trỏ tới.
        const mount = mountRef.current;
        // Một bước kiểm tra an toàn: nếu `div` chưa tồn tại, hãy dừng lại.
        if (!mount) return;

        // 1. Scene (Sân khấu): Tạo một "sân khấu" 3D, là nơi chứa tất cả các đối tượng, ánh sáng và camera.
        const scene = new THREE.Scene();

        // 2. Camera (Máy quay): Tạo một máy quay phối cảnh, mô phỏng mắt người.
        // - 75: Góc nhìn (field of view) theo độ.
        // - mount.clientWidth / mount.clientHeight: Tỷ lệ khung hình, để hình ảnh không bị méo.
        // - 0.1, 1000: Khoảng cách gần nhất và xa nhất mà camera có thể "nhìn thấy".
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);

        // 3. Renderer (Người họa sĩ): Tạo "người họa sĩ", chịu trách nhiệm vẽ cảnh 3D lên một thẻ <canvas>.
        // - antialias: true: Bật tính năng khử răng cưa, làm cho các cạnh của vật thể mượt hơn.
        // - alpha: true: Cho phép nền của canvas trong suốt.
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // Khai báo một biến để lưu ID của vòng lặp animation, giúp ta có thể hủy nó khi cần.
        let animationFrameId;


        // --- PHẦN 4: CẤU HÌNH RENDERER, CAMERA VÀ ÁNH SÁNG ---

        // Đặt màu nền cho toàn bộ sân khấu.
        scene.background = new THREE.Color(0x1a1a1a);
        // Đặt kích thước của canvas vẽ bằng với kích thước của thẻ `div` chứa nó.
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        // Đặt tỷ lệ pixel để đảm bảo hình ảnh sắc nét trên các màn hình có độ phân giải cao (Retina).
        renderer.setPixelRatio(window.devicePixelRatio);
        // Bật tính năng đổ bóng trong renderer.
        renderer.shadowMap.enabled = true;
        // Chọn loại thuật toán đổ bóng (PCFSoftShadowMap tạo ra bóng mềm, trông tự nhiên hơn).
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Bật Tone Mapping để xử lý màu sắc và ánh sáng trông chân thực hơn, tránh bị cháy sáng.
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // **QUAN TRỌNG**: Gắn thẻ <canvas> mà renderer tạo ra vào bên trong thẻ `div` của chúng ta.
        mount.appendChild(renderer.domElement);

        // Di chuyển camera ra xa một chút để có thể nhìn thấy các vật thể.
        camera.position.set(0, 1, 5);
        // Hướng camera nhìn vào tâm của sân khấu (tọa độ 0,0,0).
        camera.lookAt(0, 0, 0);

        // --- ÁNH SÁNG VÀ MÔI TRƯỜNG ---
        // Thêm ánh sáng môi trường: một nguồn sáng yếu, chiếu đều lên mọi thứ, làm cho các vùng tối không bị đen hoàn toàn.
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        // Thêm ánh sáng định hướng: giống như ánh sáng mặt trời, chiếu từ một hướng cụ thể và tạo ra bóng đổ.
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        // Đặt vị trí của nguồn sáng.
        dirLight.position.set(5, 10, 7.5);
        // Cho phép nguồn sáng này tạo ra bóng.
        dirLight.castShadow = true;
        // Tăng độ phân giải của "bản đồ bóng" để bóng trông sắc nét hơn.
        dirLight.shadow.mapSize.set(2048, 2048);
        // Thêm nguồn sáng này vào sân khấu.
        scene.add(dirLight);

        // Sử dụng ảnh môi trường để tạo phản chiếu
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        // Tải một file ảnh .hdr.
        new RGBELoader().load(
            'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr',
            // Hàm callback này sẽ chạy khi ảnh được tải xong.
            (texture) => {
                // Chuyển đổi texture vừa tải thành một bản đồ môi trường.
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                // Áp dụng bản đồ này cho toàn bộ sân khấu, các vật thể có tính kim loại sẽ phản chiếu nó.
                scene.environment = envMap;
                // Giải phóng bộ nhớ của các đối tượng không cần dùng nữa.
                texture.dispose();
                pmremGenerator.dispose();
            }
        );

        // --- PHẦN 5: TẠO CÁC VẬT THỂ (MESH) ---
        // Một Mesh = Geometry (Hình khối) + Material (Vật liệu).

        // --- Tạo ngón tay ---
        // Tạo hình khối trụ cho ngón tay.
        const fingerGeom = new THREE.CylinderGeometry(0.4, 0.38, 4, 32);
        // Tạo vật liệu màu da cho ngón tay, có độ nhám cao để không bị bóng.
        const fingerMat = new THREE.MeshStandardMaterial({ color: 0xe0a993, roughness: 0.8, metalness: 0.1 });
        // Kết hợp hình khối và vật liệu để tạo ra vật thể ngón tay.
        const finger = new THREE.Mesh(fingerGeom, fingerMat);
        // Cho phép các vật thể khác có thể đổ bóng LÊN ngón tay.
        finger.receiveShadow = true;
        // Đặt một góc nghiêng ban đầu cho ngón tay.
        finger.rotation.x = -Math.PI / 2;
        // Thêm ngón tay vào sân khấu.
        scene.add(finger);

        // --- Tạo nhẫn ---
        // Tạo một hình 2D tròn.
        const ringShape = new THREE.Shape().absarc(0, 0, 0.5, 0, Math.PI * 2, false);
        // Tạo một "cái lỗ" cũng là hình tròn nhưng nhỏ hơn.
        const holePath = new THREE.Path().absarc(0, 0, 0.41, 0, Math.PI * 2, true);
        // Đục lỗ vào trong hình tròn lớn, tạo ra một hình vành khuyên 2D.
        ringShape.holes.push(holePath);
        // "Đùn" hình 2D vành khuyên đó lên để tạo thành một khối 3D (chiếc nhẫn).
        const ringGeom = new THREE.ExtrudeGeometry(ringShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 8 });
        // Đưa tâm của hình khối về gốc tọa độ, sau đó xoay nó 90 độ để nó "đứng thẳng" lên.
        ringGeom.center().rotateX(Math.PI / 2);
        // Tạo vật liệu màu vàng, có tính kim loại cao để trông bóng bẩy.
        const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1, clearcoat: 1.0 });
        // Kết hợp hình khối và vật liệu để tạo ra vật thể nhẫn.
        const ring = new THREE.Mesh(ringGeom, ringMat);
        // Cho phép chiếc nhẫn đổ bóng LÊN vật thể khác (như ngón tay).
        ring.castShadow = true;
        // Thêm nhẫn vào sân khấu.
        scene.add(ring);

        // --- Tạo kim cương ---
        // Tạo hình khối bát diện (8 mặt) để giả lập viên kim cương. (Lưu ý: kích thước 0.5 là khá lớn so với nhẫn).
        const diamondGeom = new THREE.OctahedronGeometry(0.5, 0);
        // Tạo vật liệu màu đỏ cho viên kim cương.
        const diamondMat = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            roughness: 0.1,
            metalness: 0.2,
            reflectivity: 0.9
        });
        // Kết hợp hình khối và vật liệu để tạo ra vật thể kim cương.
        const diamond = new THREE.Mesh(diamondGeom, diamondMat);
        // Cho phép viên kim cương đổ bóng.
        diamond.castShadow = true;

        // Định vị viên kim cương so với TÂM của chiếc nhẫn.
        // Ta di chuyển nó dọc theo trục Z CỤC BỘ của nhẫn, vì đây là hướng "ra ngoài" của mặt nhẫn sau khi đã xoay geometry.
        diamond.position.set(0, 0, 0.55);

        // **QUAN TRỌNG**: Gắn kim cương vào nhẫn, biến nó thành "con" của nhẫn.
        // Từ giờ, mọi di chuyển hay xoay của nhẫn sẽ được tự động áp dụng cho cả viên kim cương.
        ring.add(diamond);


        // --- PHẦN 6: LOGIC ĐIỀU KHIỂN BẰNG CHUỘT ---

        // Biến cờ để kiểm tra xem chuột có đang được nhấn giữ hay không.
        let isMouseDown = false;
        // Biến để lưu vị trí cuối cùng của chuột.
        let lastMousePosition = { x: 0, y: 0 };
        // Tốc độ xoay của mô hình.
        const rotationSpeed = 0.005;

        // Hàm được gọi khi người dùng nhấn chuột xuống.
        const onMouseDown = (event) => {
            isMouseDown = true; // Bật cờ "đang nhấn".
            lastMousePosition = { x: event.clientX, y: event.clientY }; // Lưu vị trí bắt đầu nhấn.
            mount.style.cursor = 'grabbing'; // Đổi con trỏ chuột thành hình "nắm tay" để báo hiệu đang kéo.
        };
        // Hàm được gọi khi người dùng thả chuột ra.
        const onMouseUp = () => {
            isMouseDown = false; // Tắt cờ "đang nhấn".
            mount.style.cursor = 'grab'; // Trả con trỏ chuột về hình "bàn tay mở".
        };
        // Hàm được gọi khi người dùng di chuyển chuột.
        const onMouseMove = (event) => {
            if (!isMouseDown) return; // Nếu không đang nhấn chuột thì không làm gì cả.

            // Tính toán khoảng cách chuột đã di chuyển so với lần cuối.
            const deltaX = event.clientX - lastMousePosition.x;
            const deltaY = event.clientY - lastMousePosition.y;

            // Tạo các phép xoay (Quaternion) dựa trên sự di chuyển của chuột.
            const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * rotationSpeed); // Kéo ngang -> xoay quanh trục Y.
            const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * rotationSpeed); // Kéo dọc -> xoay quanh trục X.

            // Áp dụng các phép xoay mới vào góc xoay hiện tại của ngón tay.
            finger.quaternion.premultiply(yawQuat).premultiply(pitchQuat);

            // Cập nhật lại vị trí cuối của chuột.
            lastMousePosition = { x: event.clientX, y: event.clientY };
        };

        // Gắn các hàm xử lý sự kiện vào thẻ div và cửa sổ trình duyệt.
        mount.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);


        // --- PHẦN 7: VÒNG LẶP ANIMATION ---

        // Hàm `animate` sẽ được gọi lặp đi lặp lại ở mỗi khung hình.
        const animate = () => {
            // Yêu cầu trình duyệt gọi lại hàm `animate` ở khung hình tiếp theo, tạo ra một vòng lặp vô tận.
            animationFrameId = requestAnimationFrame(animate);

            // Sao chép vị trí của ngón tay cho nhẫn.
            ring.position.copy(finger.position);
            // **CỐT LÕI 1**: Sao chép góc xoay của ngón tay cho nhẫn, tạo hiệu ứng "đâm xuyên".
            ring.quaternion.copy(finger.quaternion);

            // **CỐT LÕI 2**: Sau khi đồng bộ, trượt chiếc nhẫn dọc theo thân ngón tay (trục Y cục bộ của nó) để tạo hiệu ứng "ôm trọn".
            // (Lưu ý: giá trị -1.2 sẽ đặt nhẫn ở một vị trí cụ thể trên thân ngón tay).
            ring.translateY(-1.2);

            // Ra lệnh cho "người họa sĩ" vẽ lại sân khấu từ góc nhìn của camera.
            renderer.render(scene, camera);
        };
        // Bắt đầu vòng lặp animation.
        animate();


        // --- PHẦN 8: XỬ LÝ RESIZE CỬA SỔ VÀ DỌN DẸP ---

        // Hàm được gọi khi kích thước cửa sổ trình duyệt thay đổi.
        const handleResize = () => {
            // Cập nhật lại tỷ lệ khung hình của camera để tránh hình bị méo.
            camera.aspect = mount.clientWidth / mount.clientHeight;
            // Áp dụng thay đổi cho camera.
            camera.updateProjectionMatrix();
            // Cập nhật lại kích thước của renderer.
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        // Gắn hàm `handleResize` vào sự kiện `resize` của cửa sổ.
        window.addEventListener('resize', handleResize);

        // Hàm `return` trong `useEffect` là hàm DỌN DẸP. Nó sẽ chạy khi component bị "unmount" (gỡ khỏi trang).
        // Điều này cực kỳ quan trọng để tránh rò rỉ bộ nhớ.
        return () => {
            // Gỡ bỏ các event listener đã thêm.
            window.removeEventListener('resize', handleResize);
            mount.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);

            // Dừng vòng lặp animation.
            cancelAnimationFrame(animationFrameId);

            // Duyệt qua tất cả các đối tượng trong sân khấu để giải phóng bộ nhớ.
            scene.traverse(object => {
                if (object.isMesh) {
                    object.geometry.dispose(); // Giải phóng hình khối.
                    // Giải phóng vật liệu (xử lý cả trường hợp một vật liệu hoặc mảng vật liệu).
                    if (object.material.isMaterial) {
                        object.material.dispose();
                    } else if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    }
                }
            });

            // Giải phóng bộ nhớ của chính renderer.
            renderer.dispose();
            // Xóa thẻ <canvas> khỏi DOM nếu nó vẫn còn tồn tại.
            if (renderer.domElement.parentElement) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []); // `[]` đảm bảo toàn bộ useEffect này chỉ chạy một lần.


    // --- PHẦN 9: KẾT QUẢ RENDER CỦA COMPONENT ---

    // Component sẽ trả về một thẻ `div` duy nhất.
    return (
        <div
            // Gắn tham chiếu `mountRef` vào thẻ `div` này.
            ref={mountRef}
            // Các thuộc tính CSS để `div` chiếm toàn bộ màn hình và có con trỏ chuột hình bàn tay.
            style={{
                width: '100vw',
                height: '100vh',
                cursor: 'grab'
            }}
        />
    );
};

// Xuất component `Simulate` để có thể sử dụng ở nơi khác trong ứng dụng.
export default Simulate;