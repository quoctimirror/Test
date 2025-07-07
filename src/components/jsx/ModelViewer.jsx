// ModelViewer.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../css/ModelViewer.css';

// Component con cho các ô input, có thể tái sử dụng
const CoordinateInput = ({ label, axis, value, onChange }) => (
    <div className="input-group">
        {/* Label được hiển thị một lần ở ngoài, không cần lặp lại */}
        {/* <label htmlFor={`${label}-${axis}`}>{axis.toUpperCase()}:</label> */}
        <input
            id={`${label}-${axis}`}
            type="number"
            // Bước nhảy nhỏ cho position, lớn hơn cho rotation
            step={label === 'pos' ? 0.1 : 1}
            value={value}
            onChange={(e) => onChange(axis, e.target.value)}
        />
    </div>
);


const ModelViewer = () => {
    const mountRef = useRef(null);
    const cameraRef = useRef();
    const controlsRef = useRef();
    const modelRef = useRef(); // Ref để lưu model
    const inputTimeoutRef = useRef(null); // Ref để quản lý timeout khi người dùng nhập

    // State chỉ tập trung vào tọa độ của model, camera sẽ được cập nhật bởi OrbitControls
    const [modelCoords, setModelCoords] = useState({
        pos: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 }
    });

    // Hàm xử lý khi người dùng thay đổi giá trị input của MODEL
    const handleModelChange = (type, axis, value) => {
        const val = parseFloat(value);
        if (isNaN(val)) {
            // Cho phép người dùng xóa input hoặc nhập dấu '-'
            // Chỉ cập nhật giá trị string trong state
            setModelCoords(prev => ({
                ...prev,
                [type]: { ...prev[type], [axis]: value }
            }));
            return;
        };

        // Vô hiệu hóa tạm thời OrbitControls để tránh xung đột
        if (controlsRef.current) {
            controlsRef.current.enabled = false;
        }

        // Xóa timeout cũ nếu người dùng đang nhập liên tục
        clearTimeout(inputTimeoutRef.current);

        // Cập nhật state của React ngay lập tức
        setModelCoords(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [axis]: value // Giữ giá trị string để cho phép nhập số thập phân
            }
        }));

        // Kích hoạt lại OrbitControls sau 1.5 giây không nhập
        inputTimeoutRef.current = setTimeout(() => {
            if (controlsRef.current) {
                controlsRef.current.enabled = true;
            }
        }, 1500);
    };

    // useEffect để đồng bộ state từ React (do người dùng nhập) vào Three.js MODEL
    useEffect(() => {
        if (!modelRef.current) return;

        // Chuyển đổi giá trị string từ state sang số float
        const pos_x = parseFloat(modelCoords.pos.x) || 0;
        const pos_y = parseFloat(modelCoords.pos.y) || -1;
        const pos_z = parseFloat(modelCoords.pos.z) || 0;

        const rot_x_deg = parseFloat(modelCoords.rot.x) || 0;
        const rot_y_deg = parseFloat(modelCoords.rot.y) || 0;
        const rot_z_deg = parseFloat(modelCoords.rot.z) || 0;

        // Cập nhật vị trí và góc quay của model trong scene
        modelRef.current.position.set(pos_x, pos_y, pos_z);
        modelRef.current.rotation.set(
            THREE.MathUtils.degToRad(rot_x_deg),
            THREE.MathUtils.degToRad(rot_y_deg),
            THREE.MathUtils.degToRad(rot_z_deg)
        );

    }, [modelCoords]); // Chạy lại mỗi khi modelCoords thay đổi

    // Vòng lặp animation
    const animate = useCallback(() => {
        requestAnimationFrame(animate);

        if (controlsRef.current) {
            controlsRef.current.update();
        }

        // Áp dụng animation tự động cho model
        if (modelRef.current) {
            // 1. Tự động xoay model quanh trục Y
            // modelRef.current.rotation.z += 0.001;

            // 2. Tự động di chuyển model theo quỹ đạo hình sin trên trục X
            // const time = Date.now() * 0.001; // Thời gian tính bằng giây
            // modelRef.current.position.x = Math.sin(time * 0.7) * 0.5;
        }

        // Chỉ cập nhật state từ Three.js khi OrbitControls được kích hoạt
        // Điều này ngăn vòng lặp ghi đè lên giá trị người dùng đang nhập
        if (modelRef.current && controlsRef.current && controlsRef.current.enabled) {
            const formatVector = (vec) => ({
                x: vec.x.toFixed(2),
                y: vec.y.toFixed(2),
                z: vec.z.toFixed(2)
            });
            const formatEuler = (euler) => ({
                x: THREE.MathUtils.radToDeg(euler.x).toFixed(1),
                y: THREE.MathUtils.radToDeg(euler.y).toFixed(1),
                z: THREE.MathUtils.radToDeg(euler.z).toFixed(1),
            });
            
            // Cập nhật state từ model để hiển thị chính xác
            setModelCoords({
                pos: formatVector(modelRef.current.position),
                rot: formatEuler(modelRef.current.rotation)
            });
        }
        
        // Render scene
        if (mountRef.current && cameraRef.current) {
            const renderer = mountRef.current.renderer;
            if(renderer) {
                const scene = mountRef.current.scene;
                renderer.render(scene, cameraRef.current);
            }
        }
    }, []); // Dependencies rỗng để hàm animate không bị tạo lại

    // useEffect để setup scene Three.js
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        
        // Sử dụng FOV 60, gần với camera điện thoại hơn là 75
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 5;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        // Gán scene và renderer vào ref để truy cập trong animate
        currentMount.scene = scene;
        currentMount.renderer = renderer;

        // Thêm ánh sáng
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        // Tải model
        const loader = new GLTFLoader();
        loader.load('/models/ring_test_model.glb', (gltf) => {
            const model = gltf.scene;
            modelRef.current = model; 
            
            // Căn giữa model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            scene.add(model);

            // Khởi tạo giá trị ban đầu sau khi model được tải
            if (controlsRef.current) controlsRef.current.enabled = true;
        });

        // Thêm OrbitControls để tương tác
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;

        // Xử lý resize
        const resizeObserver = new ResizeObserver(entries => {
            const newWidth = entries[0].contentRect.width;
            const newHeight = entries[0].contentRect.height;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });
        resizeObserver.observe(currentMount);

        // Bắt đầu vòng lặp render
        animate();

        return () => {
            // Dọn dẹp khi component unmount
            clearTimeout(inputTimeoutRef.current);
            resizeObserver.disconnect();
            if (renderer.domElement && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
            // Hủy các đối tượng Three.js để giải phóng bộ nhớ (nếu cần)
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, [animate]);

    return (
        <div ref={mountRef} className="viewer-container">
            <div className="info-overlay">
                <div className="info-box interactive-box">
                    <strong>Model (Nhẫn)</strong>
                    <div className="controls-grid">
                        {/* Header */}
                        <span></span><span>X</span><span>Y</span><span>Z</span>
                        
                        {/* Position Inputs */}
                        <strong>Pos</strong>
                        <CoordinateInput label="pos" axis="x" value={modelCoords.pos.x} onChange={(axis, val) => handleModelChange('pos', axis, val)} />
                        <CoordinateInput label="pos" axis="y" value={modelCoords.pos.y} onChange={(axis, val) => handleModelChange('pos', axis, val)} />
                        <CoordinateInput label="pos" axis="z" value={modelCoords.pos.z} onChange={(axis, val) => handleModelChange('pos', axis, val)} />

                        {/* Rotation Inputs */}
                        <strong>Rot°</strong>
                        <CoordinateInput label="rot" axis="x" value={modelCoords.rot.x} onChange={(axis, val) => handleModelChange('rot', axis, val)} />
                        <CoordinateInput label="rot" axis="y" value={modelCoords.rot.y} onChange={(axis, val) => handleModelChange('rot', axis, val)} />
                        <CoordinateInput label="rot" axis="z" value={modelCoords.rot.z} onChange={(axis, val) => handleModelChange('rot', axis, val)} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelViewer;