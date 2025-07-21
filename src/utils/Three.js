// Three.js utilities for 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

export class ThreeJSViewer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // === CHANGE: Add pivot to class properties ===
        this.pivot = null;
        this.model = null;

        this.mixer = null;
        this.animationId = null;
        this.isInitialized = false;

        // Lighting setup
        this.lights = [];

        // Mirror reflector
        this.mirror = null;

        // Model settings - optimized for target image
        this.modelPath = "/models/demo-ring.glb";
        this.modelScale = 3; // Increased scale for more presence
        this.modelPosition = { x: 8, y: 0, z: 0 }; // Centered, slightly raised
        this.initialYRotation = Math.PI; // Better starting angle

        // Camera settings
        this.cameraPosition = { x: 0, y: 0, z: 5 }; // Adjusted for better view
    }

    init() {
        if (this.isInitialized) return;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xd4859a); // Much darker pink background

        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(
            this.cameraPosition.x,
            this.cameraPosition.y,
            this.cameraPosition.z
        );
        // Make camera look at model position
        this.camera.lookAt(
            this.modelPosition.x,
            this.modelPosition.y,
            this.modelPosition.z
        );

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = false; // Disable shadows for mirror effect
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8; // Reduced exposure for softer lighting

        // Add renderer to container
        this.container.appendChild(this.renderer.domElement);

        // Rotation control variables
        this.isMouseDown = false;
        this.mouseX = 0;
        // === FIX: Start rotation from initial angle ===
        this.targetRotationY = this.initialYRotation;
        this.currentRotationY = this.initialYRotation;

        this.addMouseEvents();

        // Setup lighting and environment
        this.setupLighting();
        this.setupEnvironment();

        // Add mirror reflector
        this.addMirrorGround();

        // Load model
        this.loadModel();

        // Start animation loop
        this.animate();

        // Handle resize
        this.handleResize();

        this.isInitialized = true;
    }

    addMouseEvents() {
        // Keep your mouse control logic as is, it's already good
        this.container.style.cursor = "grab";

        this.onMouseDown = (event) => {
            this.isMouseDown = true;
            this.mouseX = event.clientX;
            this.container.style.cursor = "grabbing";
        };

        this.onMouseMove = (event) => {
            if (!this.isMouseDown) return;
            const deltaX = event.clientX - this.mouseX;
            this.targetRotationY += deltaX * 0.01;
            this.mouseX = event.clientX;
        };

        this.onMouseUp = () => {
            this.isMouseDown = false;
            this.container.style.cursor = "grab";
        };

        this.container.addEventListener("mousedown", this.onMouseDown);
        this.container.addEventListener("mousemove", this.onMouseMove);
        this.container.addEventListener("mouseup", this.onMouseUp);
        this.container.addEventListener("mouseleave", this.onMouseUp);

        // Touch events
        this.onTouchStart = (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            this.isMouseDown = true;
            this.mouseX = touch.clientX;
        };
        this.onTouchMove = (event) => {
            event.preventDefault();
            if (!this.isMouseDown) return;
            const touch = event.touches[0];
            const deltaX = touch.clientX - this.mouseX;
            this.targetRotationY += deltaX * 0.01;
            this.mouseX = touch.clientX;
        };
        this.onTouchEnd = () => {
            this.isMouseDown = false;
        };

        this.container.addEventListener("touchstart", this.onTouchStart, {
            passive: false,
        });
        this.container.addEventListener("touchmove", this.onTouchMove, {
            passive: false,
        });
        this.container.addEventListener("touchend", this.onTouchEnd);
    }

    setupLighting() {
        // Minimal ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // Brighter key light focused on model
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = false;
        this.scene.add(keyLight);
        this.lights.push(keyLight);

        // Additional focused light for ring highlights
        const ringLight = new THREE.DirectionalLight(0xffffff, 0.8);
        ringLight.position.set(-3, 8, 3);
        ringLight.castShadow = false;
        this.scene.add(ringLight);
        this.lights.push(ringLight);

        // Subtle fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-5, -5, -5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        // Enhanced HDR environment mapping for better reflections
        const envMapLoader = new THREE.CubeTextureLoader();
        const envMap = envMapLoader.load([
            "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
            "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
            "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
            "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
            "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
            "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
        ]);
        this.scene.environment = envMap;
        // Keep the pink background instead of environment background
        // this.scene.background = envMap;

        // Store environment map for material usage
        this.envMap = envMap;
    }

    async setupEnvironment() {
        // Load bright photo studio HDRI for maximum diamond sparkle
        const rgbeLoader = new RGBELoader();
        try {
            // Load the bright photo studio .hdr file
            const envMap = await rgbeLoader.loadAsync("/hdr/studio_small_03_4k.hdr");
            envMap.mapping = THREE.EquirectangularReflectionMapping;

            // Apply the environment map to the scene for lighting and reflections
            this.scene.environment = envMap;

            // Store for material usage
            this.envMap = envMap;
        } catch (error) {
            error;
            // Fallback to existing cube texture
            const envMapLoader = new THREE.CubeTextureLoader();
            const envMap = envMapLoader.load([
                "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
                "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
                "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
                "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
                "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
                "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
            ]);
            this.scene.environment = envMap;
            this.envMap = envMap;
        }
    }

    addMirrorGround() {
        // Create mirror geometry - much larger for bigger mirror
        const mirrorGeometry = new THREE.PlaneGeometry(50, 25);

        // Create reflector for mirror functionality (invisible/transparent)
        this.mirror = new Reflector(mirrorGeometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0xffffff, // Keep reflection neutral
            recursion: 1,
        });

        // Create colored mirror surface - much larger for bigger mirror
        const mirrorSurfaceGeometry = new THREE.PlaneGeometry(50, 25);
        const mirrorSurfaceMaterial = new THREE.MeshStandardMaterial({
            color: 0xc67589, // Pink mirror surface color
            metalness: 0.3,
            roughness: 0.2,
            transparent: true,
            opacity: 0.7, // Higher opacity to show true color
            emissive: 0xc67589, // Add emissive to make color more vibrant
            emissiveIntensity: 0.2,
        });

        const mirrorSurface = new THREE.Mesh(
            mirrorSurfaceGeometry,
            mirrorSurfaceMaterial
        );

        // Position both mirror and surface horizontally like in reference image
        this.mirror.position.y = -3.7;
        this.mirror.rotation.x = -Math.PI / 2; // Keep horizontal rotation

        mirrorSurface.position.y = -3.69; // Slightly above reflector
        mirrorSurface.rotation.x = -Math.PI / 2; // Keep horizontal rotation

        this.scene.add(this.mirror);
        this.scene.add(mirrorSurface);
        this.mirrorSurface = mirrorSurface;
    }

    async loadModel() {
        const loader = new GLTFLoader();
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(this.modelPath, resolve, null, reject);
            });

            this.model = gltf.scene;

            // === MOST IMPORTANT CHANGE: USING PIVOT ===

            // 1. Create an invisible Object3D to act as a "rotation base" (pivot)
            this.pivot = new THREE.Object3D();

            // 2. CORRECT: Place PIVOT at the desired rotation center of the ring
            this.pivot.position.set(
                this.modelPosition.x,
                this.modelPosition.y,
                this.modelPosition.z
            );

            // 3. CORRECT: Apply initial rotation angle to PIVOT
            this.pivot.rotation.y = this.initialYRotation;

            // 4. Add pivot to scene
            this.scene.add(this.pivot);

            // 5. Configure model
            this.model.scale.setScalar(this.modelScale);

            // 6. CORRECT: Place MODEL at the center of PIVOT (0,0,0) relative to PIVOT
            this.model.position.set(0, 0, 0);

            // 7. Apply tilt angles (X, Z axes) to model
            this.model.rotation.x = -Math.PI / 20;
            this.model.rotation.z = -Math.PI / 2.2;
            // No need to set rotation.y for model anymore, as pivot will handle that

            // 7. Add model as a CHILD of pivot
            this.pivot.add(this.model);

            // ===============================================

            // Configure ring materials - only enhance diamonds
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false; // Disable shadow casting
                    child.receiveShadow = false; // Disable shadow receiving

                    // Enhanced diamond detection logic
                    const name = child.name ? child.name.toLowerCase() : "";
                    const materialName =
                        child.material && child.material.name
                            ? child.material.name.toLowerCase()
                            : "";

                    const isDiamond =
                        name.includes("diamond") ||
                        name.includes("gem") ||
                        name.includes("stone") ||
                        name.includes("crystal") ||
                        materialName.includes("diamond") ||
                        materialName.includes("gem") ||
                        materialName.includes("crystal") ||
                        // Additional checks for common diamond naming patterns
                        name.includes("brilliant") ||
                        name.includes("round") ||
                        name.includes("cut") ||
                        // Check if material has transparency properties (likely diamond)
                        (child.material && child.material.transparent) ||
                        (child.material && child.material.opacity < 1.0);

                    // Debug logging to identify all meshes

                    // Store material type information
                    child.userData.isDiamond = isDiamond;
                    child.userData.isMetal = !isDiamond;

                    // ❗❗❗ ALWAYS CHECK FOR VERTEX COLORS AND REMOVE THEM ❗❗❗
                    if (child.geometry.attributes.color) {
                        child.geometry.deleteAttribute("color");
                    }

                    if (isDiamond) {
                        // FORCE GEOMETRY CONSISTENCY
                        if (child.geometry) {
                            // Force recompute normals
                            child.geometry.computeVertexNormals();
                            // Force flat shading off
                            child.material = null; // Clear any existing material first
                        }

                        // Opal/Moonstone material - milky white, translucent stone
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: 0xffffff, // Pure white
                            metalness: 0.0,
                            roughness: 0.2, // KEY CHANGE: Blurs reflections for milky look
                            transmission: 0.9, // Allows light to enter
                            transparent: true,
                            opacity: 1.0,
                            ior: 1.45, // IOR of Opal/Moonstone (not diamond)
                            reflectivity: 0.5, // Moderate reflectivity
                            envMapIntensity: 1.5, // Increased for better light interaction
                            clearcoat: 0.3, // Minimal clearcoat
                            clearcoatRoughness: 0.2,
                            // CRITICAL: These create internal light scattering (milky effect)
                            thickness: 2.0, // Thick for light scattering
                            attenuationColor: new THREE.Color(0xffffff), // Light inside stays white
                            attenuationDistance: 0.5, // Light scatters quickly
                            side: THREE.DoubleSide,
                            // FORCE CONSISTENT RENDERING
                            flatShading: false,
                            vertexColors: false,
                        });
                        child.material.needsUpdate = true;

                        // FORCE GEOMETRY UPDATE
                        child.geometry.attributes.position.needsUpdate = true;
                        if (child.geometry.attributes.normal) {
                            child.geometry.attributes.normal.needsUpdate = true;
                        }
                        if (child.geometry.attributes.uv) {
                            child.geometry.attributes.uv.needsUpdate = true;
                        }
                    } else {
                        // Apply enhanced gold material to metal parts
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: 0xeecdae, // Correct rose gold color
                            metalness: 1.0,
                            roughness: 0.15, // Slightly less rough for more shine
                            clearcoat: 1.0, // Strong clearcoat for deep shine
                            clearcoatRoughness: 0.1,
                            envMapIntensity: 2.0, // Increased for better light reflection
                        });
                        child.material.needsUpdate = true;
                    }
                }
            });

            // Setup animations if any
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    const action = this.mixer.clipAction(clip);
                    action.play();
                });
            }
        } catch (error) {
            console.error("Error loading model:", error);
            this.showErrorMessage();
        }
    }

    fitCameraToModel() {
        if (!this.model) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());

        // Fixed camera position for consistent model size - like reference
        const distance = 4; // Increased fixed distance for better view
        this.camera.position.set(distance * 0.8, distance * 0.2, distance * 0.8);
        this.controls.target.copy(center);

        // Rotate the view to the right position (equivalent to dragging mouse right)
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position.clone().sub(center));
        spherical.theta -= Math.PI / 2;
        this.camera.position.setFromSpherical(spherical).add(center);
        this.controls.update();

        // Disable auto-rotate after fitting camera
        this.controls.autoRotate = false;
    }

    showErrorMessage() {
        // Create error message element
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ff6b6b;
      font-family: Arial, sans-serif;
      text-align: center;
      font-size: 16px;
    `;
        errorDiv.innerHTML = `
      <div>Failed to load 3D model</div>
      <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">
        Please ensure the model file exists at: ${this.modelPath}
      </div>
    `;
        this.container.appendChild(errorDiv);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // === CHANGE: Apply rotation to PIVOT, not model ===
        if (this.pivot) {
            // Smooth movement
            this.currentRotationY +=
                (this.targetRotationY - this.currentRotationY) * 0.1;

            // Apply rotation angle to the rotation base (pivot)
            this.pivot.rotation.y = this.currentRotationY;
        }
        // ========================================================

        // Update GLTF animations if any
        if (this.mixer) {
            this.mixer.update(0.016); // ~60fps
        }

        // Render the scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;

                if (this.camera && this.renderer) {
                    this.camera.aspect = width / height;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(width, height);
                }
            }
        });

        resizeObserver.observe(this.container);
        this.resizeObserver = resizeObserver;
    }

    // Material control methods (ORIGINAL)
    setGoldMaterial() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xffd700, // Gold color
                    metalness: 0.8,
                    roughness: 0.2,
                    envMapIntensity: 1.0,
                });
                child.material.needsUpdate = true;
            }
        });
    }

    setSilverMaterial() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xc0c0c0, // Silver color
                    metalness: 0.9,
                    roughness: 0.1,
                    envMapIntensity: 1.2,
                });
                child.material.needsUpdate = true;
            }
        });
    }

    setPlatinumMaterial() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xe5e4e2, // Platinum color
                    metalness: 0.9,
                    roughness: 0.15,
                    envMapIntensity: 1.1,
                });
                child.material.needsUpdate = true;
            }
        });
    }

    setRoseGoldMaterial() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xe8b4a0, // Rose gold color
                    metalness: 0.8,
                    roughness: 0.2,
                    envMapIntensity: 1.0,
                });
                child.material.needsUpdate = true;
            }
        });
    }

    setDiamondMaterial() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh && child.userData.isDiamond) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff, // Pure white
                    metalness: 0.0,
                    roughness: 0.0,
                    transmission: 0.99, // Maximum transparency
                    transparent: true,
                    opacity: 0.98, // Nearly transparent
                    reflectivity: 1.0,
                    envMapIntensity: 2.0, // Moderate reflection
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.0,
                    ior: 2.42, // Diamond refractive index
                    thickness: 0.1, // Very thin for maximum clarity
                    attenuationDistance: 0.1,
                    attenuationColor: new THREE.Color(0xffffff), // Pure white attenuation
                    side: THREE.DoubleSide,
                });
                child.material.needsUpdate = true;
            }
        });
    }

    // Force all diamonds to have the same material - for troubleshooting
    forceAllDiamondsUniform() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh) {
                const name = child.name ? child.name.toLowerCase() : "";
                const materialName =
                    child.material && child.material.name
                        ? child.material.name.toLowerCase()
                        : "";

                // Force any mesh that might be diamond to have diamond material
                const couldBeDiamond =
                    name.includes("diamond") ||
                    name.includes("gem") ||
                    name.includes("stone") ||
                    name.includes("crystal") ||
                    materialName.includes("diamond") ||
                    materialName.includes("gem") ||
                    materialName.includes("crystal") ||
                    name.includes("brilliant") ||
                    name.includes("round") ||
                    name.includes("cut") ||
                    // Check material color - if it's very bright/white, likely diamond
                    (child.material &&
                        child.material.color &&
                        child.material.color.r > 0.8 &&
                        child.material.color.g > 0.8 &&
                        child.material.color.b > 0.8) ||
                    // Check if material has transparency
                    (child.material && child.material.transparent) ||
                    (child.material && child.material.opacity < 1.0);

                if (couldBeDiamond) {
                    child.userData.isDiamond = true;
                    child.userData.isMetal = false;

                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        metalness: 0.0,
                        roughness: 0.0,
                        transmission: 0.98,
                        transparent: true,
                        opacity: 0.95,
                        reflectivity: 1.0,
                        envMapIntensity: 3.5,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.0,
                        ior: 2.42,
                        thickness: 0.3,
                        attenuationDistance: 0.3,
                        attenuationColor: new THREE.Color(0xffffff),
                        side: THREE.DoubleSide,
                    });
                    child.material.needsUpdate = true;
                }
            }
        });
    }

    resetToOriginalMaterials() {
        if (!this.model) return;

        // Reset to gold material as default
        this.setGoldMaterial();
    }

    // Control methods
    setAutoRotate(enabled) {
        // Placeholder for auto-rotate functionality
        this.autoRotateEnabled = enabled;
    }

    setAutoRotateSpeed(speed) {
        // Placeholder for auto-rotate speed
        this.autoRotateSpeed = speed || 0.5;
    }

    resetCamera() {
        // Fix to reset to initial rotation angle
        this.targetRotationY = this.initialYRotation;
        // this.currentRotationY will automatically update in the animate loop

        // Camera and mirror remain unchanged
    }

    // Cleanup
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.mixer) {
            this.mixer.stopAllAction();
        }

        // Remove mouse event listeners
        if (this.container) {
            this.container.removeEventListener("mousedown", this.onMouseDown);
            this.container.removeEventListener("mousemove", this.onMouseMove);
            this.container.removeEventListener("mouseup", this.onMouseUp);
            this.container.removeEventListener("mouseleave", this.onMouseUp);
            this.container.removeEventListener("touchstart", this.onTouchStart, {
                passive: false,
            });
            this.container.removeEventListener("touchmove", this.onTouchMove, {
                passive: false,
            });
            this.container.removeEventListener("touchend", this.onTouchEnd);
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.container.contains(this.renderer.domElement)) {
                this.container.removeChild(this.renderer.domElement);
            }
        }

        // Clean up mirror
        if (this.mirror) {
            this.mirror.geometry.dispose();
            this.mirror.material.dispose();
            if (this.mirror.getRenderTarget) {
                this.mirror.getRenderTarget().dispose();
            }
        }

        // Clean up mirror surface
        if (this.mirrorSurface) {
            this.mirrorSurface.geometry.dispose();
            this.mirrorSurface.material.dispose();
        }

        // Clean up scene
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        this.isInitialized = false;
    }
}

// Utility function to create a viewer instance
export const createViewer = (container) => {
    return new ThreeJSViewer(container);
};

// Export Three.js for direct use
export { THREE };