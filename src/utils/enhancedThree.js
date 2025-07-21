// Enhanced Three.js utilities for photorealistic 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

export class EnhancedThreeJSViewer {
    constructor(container, options = {}) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.pivot = null;
        this.model = null;
        this.mixer = null;
        this.animationId = null;
        this.isInitialized = false;

        // Enhanced lighting setup
        this.lights = [];
        this.mirror = null;
        this.envMap = null;

        // Configuration options
        this.config = {
            modelPath: options.modelPath || "/models/demo-ring.glb",
            hdrPath: options.hdrPath || "/hdr/studio_small_03_4k.hdr", // Default HDR
            modelScale: options.modelScale || 3,
            modelPosition: options.modelPosition || { x: 8, y: 0, z: 0 },
            initialYRotation: options.initialYRotation || Math.PI,
            cameraPosition: options.cameraPosition || { x: 0, y: 0, z: 5 },
            backgroundColor: options.backgroundColor || 0xd4859a,
            enableMirror: options.enableMirror !== false, // Default true
            renderQuality: options.renderQuality || 'high', // 'low', 'medium', 'high', 'ultra'
            ...options
        };

        // Mouse/touch controls
        this.isMouseDown = false;
        this.mouseX = 0;
        this.targetRotationY = this.config.initialYRotation;
        this.currentRotationY = this.config.initialYRotation;

        // Quality settings based on device
        this.qualitySettings = this.getQualitySettings();
    }

    getQualitySettings() {
        const quality = this.config.renderQuality;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const settings = {
            low: {
                pixelRatio: 1,
                antialias: false,
                shadowMapSize: 512,
                envMapSize: 256,
                toneMappingExposure: 0.8,
                samples: 4
            },
            medium: {
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                antialias: true,
                shadowMapSize: 1024,
                envMapSize: 512,
                toneMappingExposure: 0.9,
                samples: 8
            },
            high: {
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                antialias: true,
                shadowMapSize: 2048,
                envMapSize: 1024,
                toneMappingExposure: 1.0,
                samples: 16
            },
            ultra: {
                pixelRatio: Math.min(window.devicePixelRatio, 3),
                antialias: true,
                shadowMapSize: 4096,
                envMapSize: 2048,
                toneMappingExposure: 1.1,
                samples: 32
            }
        };

        // Auto-adjust for mobile
        if (isMobile && quality === 'high') return settings.medium;
        if (isMobile && quality === 'ultra') return settings.high;
        
        return settings[quality] || settings.high;
    }

    async init() {
        if (this.isInitialized) return;

        // Create scene with enhanced settings
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);

        // Setup camera with better FOV for jewelry
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000); // Reduced FOV for less distortion
        this.camera.position.set(
            this.config.cameraPosition.x,
            this.config.cameraPosition.y,
            this.config.cameraPosition.z
        );

        // Enhanced renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.qualitySettings.antialias,
            alpha: true,
            powerPreference: "high-performance",
            logarithmicDepthBuffer: true // Better depth precision for small objects
        });
        
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
        
        // Enhanced rendering settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = this.qualitySettings.toneMappingExposure;
        
        // Enable advanced features for photorealism
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaFactor = 2.2;

        this.container.appendChild(this.renderer.domElement);

        // Setup all components
        this.addMouseEvents();
        await this.setupEnvironment(); // Load HDR first
        this.setupLighting();
        
        if (this.config.enableMirror) {
            this.addMirrorGround();
        }
        
        await this.loadModel();
        this.animate();
        this.handleResize();

        this.isInitialized = true;
        console.log('Enhanced Three.js Viewer initialized with quality:', this.config.renderQuality);
    }

    async setupEnvironment() {
        const rgbeLoader = new RGBELoader();
        const exrLoader = new EXRLoader();
        
        try {
            let envMap;
            
            // Try to load HDR/EXR environment map
            if (this.config.hdrPath.endsWith('.hdr')) {
                envMap = await rgbeLoader.loadAsync(this.config.hdrPath);
            } else if (this.config.hdrPath.endsWith('.exr')) {
                envMap = await exrLoader.loadAsync(this.config.hdrPath);
            }
            
            if (envMap) {
                envMap.mapping = THREE.EquirectangularReflectionMapping;
                
                // Resize environment map based on quality settings
                if (this.qualitySettings.envMapSize < 1024) {
                    // For lower quality, you might want to resize the HDR
                    // This is more complex and might need server-side processing
                }
                
                this.scene.environment = envMap;
                this.envMap = envMap;
                
                console.log(`HDR environment loaded: ${this.config.hdrPath}`);
                return envMap;
            }
        } catch (error) {
            console.warn('Failed to load HDR environment:', error);
        }

        // Fallback to cube texture environment
        return this.setupFallbackEnvironment();
    }

    setupFallbackEnvironment() {
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
        console.log('Fallback cube environment loaded');
        return envMap;
    }

    setupLighting() {
        // Clear existing lights
        this.lights.forEach(light => this.scene.remove(light));
        this.lights = [];

        // Enhanced lighting setup for jewelry photography
        
        // 1. Soft ambient light (simulates scattered light)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        // 2. Main key light (primary illumination)
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(10, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = this.qualitySettings.shadowMapSize;
        keyLight.shadow.mapSize.height = this.qualitySettings.shadowMapSize;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        keyLight.shadow.bias = -0.001;
        this.scene.add(keyLight);
        this.lights.push(keyLight);

        // 3. Ring highlight light (creates sparkle on metals and gems)
        const ringLight = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI / 6, 0.5);
        ringLight.position.set(-5, 12, 8);
        ringLight.target.position.set(this.config.modelPosition.x, this.config.modelPosition.y, this.config.modelPosition.z);
        ringLight.castShadow = true;
        ringLight.shadow.mapSize.width = this.qualitySettings.shadowMapSize / 2;
        ringLight.shadow.mapSize.height = this.qualitySettings.shadowMapSize / 2;
        this.scene.add(ringLight);
        this.scene.add(ringLight.target);
        this.lights.push(ringLight);

        // 4. Fill light (reduces harsh shadows)
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-8, -3, -8);
        this.scene.add(fillLight);
        this.lights.push(fillLight);

        // 5. Rim light (creates outline/separation)
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
        this.lights.push(rimLight);

        // 6. Additional point lights for gem sparkle
        const sparkleLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
        sparkleLight1.position.set(5, 8, 10);
        this.scene.add(sparkleLight1);
        this.lights.push(sparkleLight1);

        const sparkleLight2 = new THREE.PointLight(0xffffff, 0.3, 15);
        sparkleLight2.position.set(-8, 6, -5);
        this.scene.add(sparkleLight2);
        this.lights.push(sparkleLight2);
    }

    async loadModel() {
        const loader = new GLTFLoader();
        
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(this.config.modelPath, resolve, 
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
                    }, 
                    reject
                );
            });

            this.model = gltf.scene;

            // Create pivot for rotation
            this.pivot = new THREE.Object3D();
            this.pivot.position.set(
                this.config.modelPosition.x,
                this.config.modelPosition.y,
                this.config.modelPosition.z
            );
            this.pivot.rotation.y = this.config.initialYRotation;
            this.scene.add(this.pivot);

            // Configure model
            this.model.scale.setScalar(this.config.modelScale);
            this.model.position.set(0, 0, 0);
            this.model.rotation.x = -Math.PI / 20;
            this.model.rotation.z = -Math.PI / 2.2;
            
            this.pivot.add(this.model);

            // Enhanced material processing
            await this.enhanceMaterials();

            // Setup animations if any
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.model);
                gltf.animations.forEach((clip) => {
                    const action = this.mixer.clipAction(clip);
                    action.play();
                });
            }

            console.log('Model loaded and enhanced successfully');
            
        } catch (error) {
            console.error("Error loading model:", error);
            this.showErrorMessage();
        }
    }

    async enhanceMaterials() {
        if (!this.model) return;

        this.model.traverse((child) => {
            if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;

                // Remove vertex colors that might interfere
                if (child.geometry.attributes.color) {
                    child.geometry.deleteAttribute("color");
                }

                // Force geometry updates
                child.geometry.computeVertexNormals();

                // Enhanced material detection
                const name = child.name ? child.name.toLowerCase() : "";
                const materialName = child.material && child.material.name ? child.material.name.toLowerCase() : "";
                
                // More sophisticated material detection
                const isDiamond = this.detectDiamondMaterial(child, name, materialName);
                const isGem = this.detectGemMaterial(child, name, materialName);
                const isMetal = !isDiamond && !isGem;

                // Store material type
                child.userData.isDiamond = isDiamond;
                child.userData.isGem = isGem;
                child.userData.isMetal = isMetal;

                // Apply appropriate material
                if (isDiamond) {
                    this.applyDiamondMaterial(child);
                } else if (isGem) {
                    this.applyGemMaterial(child);
                } else {
                    this.applyMetalMaterial(child);
                }

                console.log(`Material applied to ${child.name}: ${isDiamond ? 'Diamond' : isGem ? 'Gem' : 'Metal'}`);
            }
        });
    }

    detectDiamondMaterial(child, name, materialName) {
        const diamondKeywords = ['diamond', 'brilliant', 'cut', 'clear', 'crystal'];
        const hasKeyword = diamondKeywords.some(keyword => 
            name.includes(keyword) || materialName.includes(keyword)
        );
        
        // Check material properties
        const hasTransparency = child.material && (
            child.material.transparent || 
            child.material.opacity < 1.0 ||
            child.material.transmission > 0
        );
        
        // Check color - diamonds are usually clear/white
        const isNearWhite = child.material && child.material.color && 
            child.material.color.r > 0.8 && 
            child.material.color.g > 0.8 && 
            child.material.color.b > 0.8;

        return hasKeyword || (hasTransparency && isNearWhite);
    }

    detectGemMaterial(child, name, materialName) {
        const gemKeywords = ['gem', 'stone', 'ruby', 'emerald', 'sapphire', 'opal', 'pearl'];
        return gemKeywords.some(keyword => 
            name.includes(keyword) || materialName.includes(keyword)
        );
    }

    applyDiamondMaterial(child) {
        child.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.05, // Slightly rough for more realistic look
            transmission: 0.95, // High transmission for transparency
            transparent: true,
            opacity: 0.1, // Very transparent
            reflectivity: 1.0,
            envMapIntensity: 3.0, // Strong environment reflections
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            ior: 2.42, // Diamond's refractive index
            thickness: 0.5,
            attenuationDistance: 0.5,
            attenuationColor: new THREE.Color(0xffffff),
            side: THREE.DoubleSide,
            // Add subtle dispersion effect
            sheen: 0.8,
            sheenRoughness: 0.1,
            sheenColor: new THREE.Color(0xffffff)
        });
        child.material.needsUpdate = true;
    }

    applyGemMaterial(child) {
        // Colored gemstone material (customizable)
        child.material = new THREE.MeshPhysicalMaterial({
            color: 0xff6b6b, // Default red (ruby-like)
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.7,
            transparent: true,
            opacity: 0.8,
            reflectivity: 0.8,
            envMapIntensity: 2.0,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
            ior: 1.76, // Typical gemstone IOR
            thickness: 1.0,
            attenuationDistance: 1.0,
            attenuationColor: new THREE.Color(0xff6b6b),
            side: THREE.DoubleSide
        });
        child.material.needsUpdate = true;
    }

    applyMetalMaterial(child, metalType = 'rose_gold') {
        const metalConfigs = {
            gold: { color: 0xffd700, metalness: 0.9, roughness: 0.15 },
            silver: { color: 0xc0c0c0, metalness: 0.95, roughness: 0.1 },
            platinum: { color: 0xe5e4e2, metalness: 0.95, roughness: 0.12 },
            rose_gold: { color: 0xe8b4a0, metalness: 0.85, roughness: 0.18 }
        };

        const config = metalConfigs[metalType] || metalConfigs.rose_gold;

        child.material = new THREE.MeshPhysicalMaterial({
            color: config.color,
            metalness: config.metalness,
            roughness: config.roughness,
            envMapIntensity: 2.5, // Strong environment reflections for metals
            clearcoat: 0.8,
            clearcoatRoughness: 0.15,
            // Add subtle anisotropy for brushed metal effect
            anisotropy: 0.3,
            anisotropyRotation: 0,
            // Enhance reflectivity
            reflectivity: 0.9
        });
        child.material.needsUpdate = true;
    }

    // Material switching methods with enhanced materials
    setGoldMaterial() {
        this.model?.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                this.applyMetalMaterial(child, 'gold');
            }
        });
    }

    setSilverMaterial() {
        this.model?.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                this.applyMetalMaterial(child, 'silver');
            }
        });
    }

    setPlatinumMaterial() {
        this.model?.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                this.applyMetalMaterial(child, 'platinum');
            }
        });
    }

    setRoseGoldMaterial() {
        this.model?.traverse((child) => {
            if (child.isMesh && child.userData.isMetal) {
                this.applyMetalMaterial(child, 'rose_gold');
            }
        });
    }

    // Method to change HDR environment on the fly
    async changeEnvironment(hdrPath) {
        this.config.hdrPath = hdrPath;
        await this.setupEnvironment();
        console.log(`Environment changed to: ${hdrPath}`);
    }

    // Quality adjustment method
    setRenderQuality(quality) {
        this.config.renderQuality = quality;
        this.qualitySettings = this.getQualitySettings();
        
        // Update renderer settings
        this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
        this.renderer.toneMappingExposure = this.qualitySettings.toneMappingExposure;
        
        // Update shadow map sizes
        this.lights.forEach(light => {
            if (light.shadow) {
                light.shadow.mapSize.width = this.qualitySettings.shadowMapSize;
                light.shadow.mapSize.height = this.qualitySettings.shadowMapSize;
                light.shadow.map?.dispose();
                light.shadow.map = null;
            }
        });
        
        console.log(`Render quality changed to: ${quality}`);
    }

    addMouseEvents() {
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

        // Add all event listeners
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

        this.container.addEventListener("touchstart", this.onTouchStart, { passive: false });
        this.container.addEventListener("touchmove", this.onTouchMove, { passive: false });
        this.container.addEventListener("touchend", this.onTouchEnd);
    }

    addMirrorGround() {
        // Enhanced mirror setup
        const mirrorGeometry = new THREE.PlaneGeometry(50, 25);

        this.mirror = new Reflector(mirrorGeometry, {
            clipBias: 0.003,
            textureWidth: Math.min(window.innerWidth * window.devicePixelRatio, 2048),
            textureHeight: Math.min(window.innerHeight * window.devicePixelRatio, 2048),
            color: 0xffffff,
            recursion: 1,
        });

        // Enhanced mirror surface
        const mirrorSurfaceGeometry = new THREE.PlaneGeometry(50, 25);
        const mirrorSurfaceMaterial = new THREE.MeshPhysicalMaterial({
            color: this.config.backgroundColor,
            metalness: 0.1,
            roughness: 0.15,
            transparent: true,
            opacity: 0.8,
            envMapIntensity: 0.5,
        });

        const mirrorSurface = new THREE.Mesh(mirrorSurfaceGeometry, mirrorSurfaceMaterial);

        // Position mirror
        this.mirror.position.y = -3.7;
        this.mirror.rotation.x = -Math.PI / 2;

        mirrorSurface.position.y = -3.69;
        mirrorSurface.rotation.x = -Math.PI / 2;

        this.scene.add(this.mirror);
        this.scene.add(mirrorSurface);
        this.mirrorSurface = mirrorSurface;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Smooth rotation
        if (this.pivot) {
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;
            this.pivot.rotation.y = this.currentRotationY;
        }

        // Update animations
        if (this.mixer) {
            this.mixer.update(0.016);
        }

        // Render
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

    resetCamera() {
        this.targetRotationY = this.config.initialYRotation;
    }

    showErrorMessage() {
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
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 8px;
        `;
        errorDiv.innerHTML = `
            <div>Failed to load 3D model</div>
            <div style="font-size: 14px; opacity: 0.7; margin-top: 8px;">
                Please ensure the model file exists at: ${this.config.modelPath}
            </div>
        `;
        this.container.appendChild(errorDiv);
    }

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

        // Remove event listeners
        if (this.container) {
            this.container.removeEventListener("mousedown", this.onMouseDown);
            this.container.removeEventListener("mousemove", this.onMouseMove);
            this.container.removeEventListener("mouseup", this.onMouseUp);
            this.container.removeEventListener("mouseleave", this.onMouseUp);
            this.container.removeEventListener("touchstart", this.onTouchStart);
            this.container.removeEventListener("touchmove", this.onTouchMove);
            this.container.removeEventListener("touchend", this.onTouchEnd);
        }

        // Dispose renderer and resources
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

        if (this.mirrorSurface) {
            this.mirrorSurface.geometry.dispose();
            this.mirrorSurface.material.dispose();
        }

        // Clean up environment map
        if (this.envMap) {
            this.envMap.dispose();
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

// Utility function to create enhanced viewer
export const createEnhancedViewer = (container, options = {}) => {
    return new EnhancedThreeJSViewer(container, options);
};

// Preset configurations for different jewelry types
export const JEWELRY_PRESETS = {
    DIAMOND_RING: {
        renderQuality: 'ultra',
        hdrPath: '/hdr/studio_small_03_4k.hdr',
        modelScale: 3,
        backgroundColor: 0xf8f8f8, // Light gray for diamonds
        enableMirror: true
    },
    GOLD_RING: {
        renderQuality: 'high',
        hdrPath: '/hdr/photo_studio_01_4k.hdr',
        modelScale: 3,
        backgroundColor: 0xd4859a, // Pink background
        enableMirror: true
    },
    GEMSTONE_RING: {
        renderQuality: 'high',
        hdrPath: '/hdr/studio_small_03_4k.hdr',
        modelScale: 3,
        backgroundColor: 0x2c2c2c, // Dark background for colored gems
        enableMirror: true
    },
    PREVIEW_MODE: {
        renderQuality: 'medium',
        hdrPath: '/hdr/studio_small_03_4k.hdr',
        modelScale: 2.5,
        backgroundColor: 0xffffff,
        enableMirror: false
    }
};

// HDR Environment options
export const HDR_ENVIRONMENTS = {
    PHOTO_STUDIO: '/hdr/photo_studio_01_4k.hdr',
    STUDIO_SMALL: '/hdr/studio_small_03_4k.hdr',
    // Add more HDR options as you get them
    BRIGHT_STUDIO: '/hdr/studio_small_03_4k.hdr', // Fallback
};

// Helper function to create viewer with preset
export const createViewerWithPreset = (container, presetName, overrides = {}) => {
    const preset = JEWELRY_PRESETS[presetName] || JEWELRY_PRESETS.GOLD_RING;
    const options = { ...preset, ...overrides };
    return new EnhancedThreeJSViewer(container, options);
};

// Export Three.js for direct use
export { THREE };