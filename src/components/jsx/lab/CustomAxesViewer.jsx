// src/components/jsx/lab/CustomAxesViewer.jsx

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CustomAxesViewer = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        // --- 1. THIẾT LẬP SCENE, RENDERER ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // --- 2. THIẾT LẬP CAMERA VÀ GÓC NHÌN BAN ĐẦU ---
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // --- 3. TỰ TẠO CÁC TRỤC TỌA ĐỘ VỚI MÀU SẮC TÙY CHỈNH ---
        const axisLength = 5;

        const createAxis = (color, direction) => {
            const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
            const points = [new THREE.Vector3(0, 0, 0), direction.clone().multiplyScalar(axisLength)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);

            const arrowGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: color });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.copy(points[1]);
            arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

            const group = new THREE.Group();
            group.add(line);
            group.add(arrow);
            return group;
        };

        const xAxis = createAxis(0xff0000, new THREE.Vector3(1, 0, 0));
        scene.add(xAxis);

        const yAxis = createAxis(0x0000ff, new THREE.Vector3(0, 1, 0));
        scene.add(yAxis);

        const zAxis = createAxis(0x00ff00, new THREE.Vector3(0, 0, 1));
        scene.add(zAxis);

        // --- 4. TẠO NHÃN 'X', 'Y', 'Z' ---
        const createLabel = (text, color, position) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = color;
            context.font = 'bold 90px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
            sprite.position.copy(position);
            sprite.scale.set(0.8, 0.8, 1);
            return sprite;
        };

        const labelOffset = 0.7;
        scene.add(createLabel('X', '#ff0000', new THREE.Vector3(axisLength + labelOffset, 0, 0)));
        scene.add(createLabel('Y', '#0000ff', new THREE.Vector3(0, axisLength + labelOffset, 0)));
        scene.add(createLabel('Z', '#00ff00', new THREE.Vector3(0, 0, axisLength + labelOffset)));

        // Thêm lưới để dễ quan sát
        scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));

        // --- 5. TẠO HÌNH KHỐI VỚI CÁC MẶT ĐƯỢC ĐÁNH DẤU ---

        // Hàm này tạo ra một material có chữ trên đó
        const createFaceMaterial = (text) => {
            const canvas = document.createElement('canvas');
            // THAY ĐỔI: Tăng kích thước canvas để viền và chữ nét hơn
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');

            // Vẽ nền
            context.fillStyle = '#CCCCCC'; // Màu xám nhạt
            context.fillRect(0, 0, canvas.width, canvas.height);

            // THAY ĐỔI: Thêm viền cho mặt của cube
            context.strokeStyle = '#000000'; // Màu viền: đen
            context.lineWidth = 15; // Độ dày của viền
            context.strokeRect(0, 0, canvas.width, canvas.height);

            // Vẽ chữ
            // THAY ĐỔI: Giảm cỡ chữ xuống
            context.font = 'Bold 80px Arial';
            context.fillStyle = '#000000'; // Màu đen
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            return new THREE.MeshBasicMaterial({ map: texture });
        };

        const materials = [
            createFaceMaterial('Right'),
            createFaceMaterial('Left'),
            createFaceMaterial('Top'),
            createFaceMaterial('Bottom'),
            createFaceMaterial('Front'),
            createFaceMaterial('Back'),
        ];

        // THAY ĐỔI: Giảm kích thước khối hộp từ 3x3x3 xuống 2x2x2
        const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        const cube = new THREE.Mesh(cubeGeometry, materials);
        scene.add(cube);

        // --- 6. VÒNG LẶP RENDER VÀ DỌN DẸP ---
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
            currentMount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh', display: 'block' }} />;
};

export default CustomAxesViewer;