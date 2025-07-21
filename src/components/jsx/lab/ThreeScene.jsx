// src/components/jsx/ThreeScene.jsx

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const ThreeScene = ({
    onSceneReady,
    backgroundColor = 0x222222,
    cameraPosition = [0, 2, 8],
    cameraFov = 75,
    enableControls = true,
    enableGrid = true,
    enableAxes = true,
    axisLength = 5,
    gridSize = 10,
    children,
    style = { width: '100%', height: '100vh' }
}) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const frameId = useRef(null);

    // Simple mouse controls
    const mouseControls = useRef({
        isDragging: false,
        previousMousePosition: { x: 0, y: 0 },
        spherical: new THREE.Spherical(),
        isAnimating: false
    });

    // Animation system
    const animationCallbacks = useRef([]);

    const addAnimationCallback = useCallback((callback) => {
        animationCallbacks.current.push(callback);
        return () => {
            const index = animationCallbacks.current.indexOf(callback);
            if (index > -1) {
                animationCallbacks.current.splice(index, 1);
            }
        };
    }, []);

    const animateCameraTo = useCallback((targetPosition, duration = 700) => {
        if (mouseControls.current.isAnimating) return;

        mouseControls.current.isAnimating = true;
        const startPosition = cameraRef.current.position.clone();
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (QuadraticInOut)
            const easeProgress = progress < 0.5 ?
                2 * progress * progress :
                1 - Math.pow(-2 * progress + 2, 2) / 2;

            cameraRef.current.position.lerpVectors(startPosition, targetPosition, easeProgress);
            cameraRef.current.lookAt(0, 0, 0);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                mouseControls.current.isAnimating = false;
                // Update spherical coordinates
                mouseControls.current.spherical.setFromVector3(cameraRef.current.position);
            }
        };

        animate();
    }, []);

    // Create coordinate axes
    const createAxes = useCallback((length) => {
        const axesGroup = new THREE.Group();

        const createAxis = (color, direction, label) => {
            // Line
            const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
            const points = [new THREE.Vector3(0, 0, 0), direction.clone().multiplyScalar(length)];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);

            // Arrow
            const arrowGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: color });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.copy(points[1]);
            arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

            // Label
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
            context.font = 'bold 90px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(label, canvas.width / 2, canvas.height / 2);
            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
            const labelOffset = 0.7;
            sprite.position.copy(points[1]).add(direction.clone().multiplyScalar(labelOffset));
            sprite.scale.set(0.8, 0.8, 1);

            const group = new THREE.Group();
            group.add(line);
            group.add(arrow);
            group.add(sprite);
            return group;
        };

        axesGroup.add(createAxis(0xff0000, new THREE.Vector3(1, 0, 0), 'X'));
        axesGroup.add(createAxis(0x00ff00, new THREE.Vector3(0, 1, 0), 'Y'));
        axesGroup.add(createAxis(0x0000ff, new THREE.Vector3(0, 0, 1), 'Z'));

        return axesGroup;
    }, []);

    // Mouse event handlers
    const onMouseDown = useCallback((event) => {
        if (mouseControls.current.isAnimating) return;
        mouseControls.current.isDragging = true;
        mouseControls.current.previousMousePosition = { x: event.clientX, y: event.clientY };
    }, []);

    const onMouseMove = useCallback((event) => {
        if (!mouseControls.current.isDragging || mouseControls.current.isAnimating) return;

        const deltaMove = {
            x: event.clientX - mouseControls.current.previousMousePosition.x,
            y: event.clientY - mouseControls.current.previousMousePosition.y
        };

        mouseControls.current.spherical.theta -= deltaMove.x * 0.01;
        mouseControls.current.spherical.phi += deltaMove.y * 0.01;
        mouseControls.current.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, mouseControls.current.spherical.phi));

        cameraRef.current.position.setFromSpherical(mouseControls.current.spherical);
        cameraRef.current.lookAt(0, 0, 0);

        mouseControls.current.previousMousePosition = { x: event.clientX, y: event.clientY };
    }, []);

    const onMouseUp = useCallback(() => {
        mouseControls.current.isDragging = false;
    }, []);

    // Resize handler
    const handleResize = useCallback(() => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
    }, []);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- 1. SETUP SCENE ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(backgroundColor);
        sceneRef.current = scene;

        // --- 2. SETUP RENDERER ---
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // --- 3. SETUP CAMERA ---
        const camera = new THREE.PerspectiveCamera(
            cameraFov,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(...cameraPosition);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Setup spherical coordinates for mouse controls
        mouseControls.current.spherical.setFromVector3(camera.position);

        // --- 4. SETUP LIGHTS ---
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // --- 5. SETUP HELPERS ---
        if (enableGrid) {
            const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x888888, 0x444444);
            scene.add(gridHelper);
        }

        if (enableAxes) {
            const axes = createAxes(axisLength);
            scene.add(axes);
        }

        // --- 6. SETUP CONTROLS ---
        if (enableControls) {
            currentMount.addEventListener('mousedown', onMouseDown);
            currentMount.addEventListener('mousemove', onMouseMove);
            currentMount.addEventListener('mouseup', onMouseUp);
            currentMount.addEventListener('mouseleave', onMouseUp);
        }

        // --- 7. SETUP RESIZE LISTENER ---
        window.addEventListener('resize', handleResize);

        // --- 8. ANIMATION LOOP ---
        const animate = () => {
            frameId.current = requestAnimationFrame(animate);

            // Run animation callbacks
            animationCallbacks.current.forEach(callback => callback());

            renderer.render(scene, camera);
        };
        animate();

        // --- 9. CALLBACK TO PARENT ---
        if (onSceneReady) {
            onSceneReady({
                scene,
                camera,
                renderer,
                animateCameraTo,
                addAnimationCallback
            });
        }

        // --- 10. CLEANUP ---
        return () => {
            if (frameId.current) {
                cancelAnimationFrame(frameId.current);
            }

            window.removeEventListener('resize', handleResize);

            if (enableControls) {
                currentMount.removeEventListener('mousedown', onMouseDown);
                currentMount.removeEventListener('mousemove', onMouseMove);
                currentMount.removeEventListener('mouseup', onMouseUp);
                currentMount.removeEventListener('mouseleave', onMouseUp);
            }

            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }

            // Dispose of Three.js objects
            scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });

            renderer.dispose();
        };
    }, [
        backgroundColor,
        cameraPosition,
        cameraFov,
        enableControls,
        enableGrid,
        enableAxes,
        axisLength,
        gridSize,
        onSceneReady,
        createAxes,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        handleResize,
        animateCameraTo,
        addAnimationCallback
    ]);

    return (
        <div
            ref={mountRef}
            style={{
                cursor: enableControls ? 'grab' : 'default',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default ThreeScene;