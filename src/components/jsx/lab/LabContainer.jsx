import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const LabContainer = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        // --- 1. THIẾT LẬP SCENE, RENDERER, CAMERA ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 2, 8);
        camera.lookAt(0, 0, 0);

        // Simple controls without OrbitControls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);

        // --- 2. TẠO CÁC TRỤC TỌA ĐỘ VÀ NHÃN ---
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

        scene.add(createAxis(0xff0000, new THREE.Vector3(1, 0, 0)));
        scene.add(createAxis(0x0000ff, new THREE.Vector3(0, 1, 0)));
        scene.add(createAxis(0x00ff00, new THREE.Vector3(0, 0, 1)));

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
        scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));

        // --- 3. TẠO HÌNH KHỐI ---
        const createFaceMaterial = (text, bgColor = '#CCCCCC') => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const context = canvas.getContext('2d');
            context.fillStyle = bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = '#000000';
            context.lineWidth = 15;
            context.strokeRect(0, 0, canvas.width, canvas.height);
            context.font = 'Bold 80px Arial';
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            const texture = new THREE.CanvasTexture(canvas);
            return new THREE.MeshBasicMaterial({ map: texture });
        };

        const materials = [
            createFaceMaterial('Right', '#ffcccc'), // +X - Red tint
            createFaceMaterial('Left', '#ccccff'),  // -X - Blue tint  
            createFaceMaterial('Top', '#ccffcc'),   // +Y - Green tint
            createFaceMaterial('Bottom', '#ffccff'), // -Y - Magenta tint
            createFaceMaterial('Front', '#ffffcc'), // +Z - Yellow tint
            createFaceMaterial('Back', '#ccffff'),  // -Z - Cyan tint
        ];

        const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
        const cube = new THREE.Mesh(cubeGeometry, materials);
        scene.add(cube);

        // --- 4. ANIMATION FUNCTIONS ---
        const viewDistance = 8;
        let animationId = null;
        let isAnimating = false;

        const animateCameraTo = (targetPosition) => {
            if (isAnimating) return;

            isAnimating = true;
            const startPosition = camera.position.clone();
            const duration = 700;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (QuadraticInOut)
                const easeProgress = progress < 0.5 ?
                    2 * progress * progress :
                    1 - Math.pow(-2 * progress + 2, 2) / 2;

                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                camera.lookAt(0, 0, 0);

                if (progress < 1) {
                    animationId = requestAnimationFrame(animate);
                } else {
                    isAnimating = false;
                    // Update spherical coordinates for manual controls
                    spherical.setFromVector3(camera.position);
                }
            };

            animate();
        };

        // --- 5. MOUSE EVENTS ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseClick = (event) => {
            if (isAnimating) return;

            // Chuẩn hóa tọa độ chuột (-1 to +1)
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(cube);

            if (intersects.length > 0) {
                const materialIndex = intersects[0].face.materialIndex;
                console.log('Clicked face:', materialIndex); // Debug log

                switch (materialIndex) {
                    case 0: // Right (+X)
                        animateCameraTo(new THREE.Vector3(viewDistance, 0, 0));
                        break;
                    case 1: // Left (-X)
                        animateCameraTo(new THREE.Vector3(-viewDistance, 0, 0));
                        break;
                    case 2: // Top (+Y)
                        animateCameraTo(new THREE.Vector3(0, viewDistance, 0));
                        break;
                    case 3: // Bottom (-Y)
                        animateCameraTo(new THREE.Vector3(0, -viewDistance, 0));
                        break;
                    case 4: // Front (+Z)
                        animateCameraTo(new THREE.Vector3(0, 0, viewDistance));
                        break;
                    case 5: // Back (-Z)
                        animateCameraTo(new THREE.Vector3(0, 0, -viewDistance));
                        break;
                    default:
                        break;
                }
            }
        };

        // Simple mouse controls for rotation
        const onMouseDown = (event) => {
            if (isAnimating) return;
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseMove = (event) => {
            if (!isDragging || isAnimating) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            spherical.theta -= deltaMove.x * 0.01;
            spherical.phi += deltaMove.y * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);

            previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        // Add event listeners
        currentMount.addEventListener('click', onMouseClick);
        currentMount.addEventListener('mousedown', onMouseDown);
        currentMount.addEventListener('mousemove', onMouseMove);
        currentMount.addEventListener('mouseup', onMouseUp);

        // --- 6. RENDER LOOP ---
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // --- 7. CLEANUP ---
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', onMouseClick);
            currentMount.removeEventListener('mousedown', onMouseDown);
            currentMount.removeEventListener('mousemove', onMouseMove);
            currentMount.removeEventListener('mouseup', onMouseUp);
            currentMount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <h1 style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'white',
                zIndex: 10,
                fontFamily: 'sans-serif',
                fontSize: '24px'
            }}>
                Click vào một mặt của khối hộp để xem góc nhìn
            </h1>
            <div
                ref={mountRef}
                style={{
                    width: '100%',
                    height: '100vh',
                    display: 'block',
                    cursor: 'pointer'
                }}
            />
        </div>
    );
};

export default LabContainer;