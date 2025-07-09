import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../css/ModelViewer.css';

// Component con không thay đổi
const CoordinateInput = ({ label, axis, value, onChange }) => (
    <div className="input-group">
        <input
            id={`${label}-${axis}`}
            type="number"
            step={label === 'pos' ? 0.1 : 1}
            value={value}
            onChange={(e) => onChange(axis, e.target.value)}
        />
    </div>
);

const ModelViewer = () => {
    const mountRef = useRef(null);
    const modelRef = useRef();

    // =================================================================
    // THAY ĐỔI CHÍNH NẰM Ở ĐÂY
    // =================================================================
    const [modelCoords, setModelCoords] = useState({
        pos: { x: '0.0', y: '-0.5', z: '0.0' }, // Dịch nhẫn xuống trục Y
        rot: { x: '90.0', y: '0.0', z: '0.0' }  // Xoay nhẫn 90 độ quanh trục Y
    });
    // =================================================================

    // Hàm xử lý khi người dùng thay đổi giá trị input
    const handleModelChange = (type, axis, value) => {
        setModelCoords(prev => ({
            ...prev,
            [type]: { ...prev[type], [axis]: value }
        }));
    };

    // useEffect để đồng bộ state từ React -> đối tượng Three.js
    useEffect(() => {
        if (!modelRef.current) return;

        const pos_x = parseFloat(modelCoords.pos.x) || 0;
        const pos_y = parseFloat(modelCoords.pos.y) || 0;
        const pos_z = parseFloat(modelCoords.pos.z) || 0;

        const rot_x_deg = parseFloat(modelCoords.rot.x) || 0;
        const rot_y_deg = parseFloat(modelCoords.rot.y) || 0;
        const rot_z_deg = parseFloat(modelCoords.rot.z) || 0;

        modelRef.current.position.set(pos_x, pos_y, pos_z);
        modelRef.current.rotation.set(
            THREE.MathUtils.degToRad(rot_x_deg),
            THREE.MathUtils.degToRad(rot_y_deg),
            THREE.MathUtils.degToRad(rot_z_deg)
        );
    }, [modelCoords]);

    // useEffect chính để setup scene, chỉ chạy một lần
    useEffect(() => {
        const currentMount = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const handleControlsChange = () => {
            if (!modelRef.current) return;
            const newPos = modelRef.current.position;
            const newRot = modelRef.current.rotation;
            setModelCoords({
                pos: {
                    x: newPos.x.toFixed(2),
                    y: newPos.y.toFixed(2),
                    z: newPos.z.toFixed(2)
                },
                rot: {
                    x: THREE.MathUtils.radToDeg(newRot.x).toFixed(1),
                    y: THREE.MathUtils.radToDeg(newRot.y).toFixed(1),
                    z: THREE.MathUtils.radToDeg(newRot.z).toFixed(1)
                }
            });
        };
        controls.addEventListener('end', handleControlsChange);

        const loader = new GLTFLoader();
        loader.load('/models/cryring.glb', (gltf) => {
            const model = gltf.scene;
            modelRef.current = model;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            model.scale.set(10, 10, 10);
            
            const scaledBox = new THREE.Box3().setFromObject(model);
            const size = scaledBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            
            camera.position.z = cameraZ * 1.2;
            controls.update();
            scene.add(model);
        });
        
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            controls.removeEventListener('end', handleControlsChange);
            controls.dispose();
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={mountRef} className="viewer-container">
            <div className="info-overlay">
                <div className="info-box interactive-box">
                    <strong>Model (Nhẫn)</strong>
                    <div className="controls-grid">
                        <span></span><span>X</span><span>Y</span><span>Z</span>
                        <strong>Pos</strong>
                        <CoordinateInput label="pos" axis="x" value={modelCoords.pos.x} onChange={(axis, val) => handleModelChange('pos', axis, val)} />
                        <CoordinateInput label="pos" axis="y" value={modelCoords.pos.y} onChange={(axis, val) => handleModelChange('pos', axis, val)} />
                        <CoordinateInput label="pos" axis="z" value={modelCoords.pos.z} onChange={(axis, val) => handleModelChange('pos', axis, val)} />
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