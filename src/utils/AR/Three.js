// Three.js utilities for 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { RingEnhancer } from "./RingEnhancer.js";

// --- NHẬP CÁC MODULE HẬU KỲ ---
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export class ThreeJSViewer {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // === POST-PROCESSING ===
    this.composer = null;

    // === REFLECTION CONTROL ===
    this.reflectionScene = null; // Separate scene for non-sparkle reflections
    this.originalScene = null; // Reference to main scene
    this.reflectionModel = null; // Model clone for reflection
    this.reflectionPivot = null; // Pivot clone for reflection

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

    // Ring enhancer instance
    this.ringEnhancer = null;

    // Model settings - optimized for target image
    this.modelPath = "/view360/ring.glb";
    this.modelScale = 2.5; // Increased scale for more presence
    this.modelPosition = { x: 0, y: 0, z: 0 }; // Centered, slightly raised
    this.initialYRotation = Math.PI; // Better starting angle

    // Camera settings
    this.cameraPosition = { x: 0, y: 5.3, z: 10.5 }; // Adjusted for better view
  }

  init() {
    if (this.isInitialized) return;

    // Create scene
    this.scene = new THREE.Scene();
    // Create gradient background like in reference image
    this.createGradientBackground();

    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);
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
    this.renderer.toneMappingExposure = 1.2; // Tăng exposure để nhẫn sáng hơn

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // === ADD SELECTIVE POST-PROCESSING ===
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Create selective bloom - exclude mirror reflection from bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        this.container.clientWidth,
        this.container.clientHeight
      ),
      0.2, // Strength: Giảm từ 0.4 xuống 0.2 - rất nhẹ
      0.08, // Radius: Giảm từ 0.1 xuống 0.05 - ánh sáng nhỏ hơn
      0.9 // Threshold: Tăng từ 0.85 lên 0.9 - ít vật phát sáng hơn
    );
    this.composer.addPass(bloomPass);

    // Store reference to bloom pass for selective rendering
    this.bloomPass = bloomPass;
    // ===========================

    // Rotation control variables
    this.isMouseDown = false;
    this.mouseX = 0;
    // === FIX: Start rotation from initial angle ===
    this.targetRotationY = this.initialYRotation;
    this.currentRotationY = this.initialYRotation;

    this.addMouseEvents();

    // Setup lighting and environment
    // this.setupLighting(); // Comment out - let HDR be the only light source
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

  createGradientBackground() {
    // Create gradient background matching exact CSS values
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // CSS: linear-gradient(180deg, #4F1E2B -20.93%, #BB234C 45.58%, #000000 100%)
    // Create exact gradient matching CSS values
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    // Recreate the exact CSS gradient behavior
    gradient.addColorStop(0, "#4F1E2B"); // Dark red-brown at top
    gradient.addColorStop(0.4558, "#BB234C"); // Bright red-pink at 45.58%
    gradient.addColorStop(1, "#000000"); // Pure black at bottom 100%

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.scene.background = texture;
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
    // No ambient light to avoid affecting background/mirror

    // Create lights that will only affect the ring
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = false;
    // Don't add to scene yet - will be added after ring is loaded
    this.keyLight = keyLight;
    this.lights.push(keyLight);

    // Highlight light for metal parts
    const highlightLight = new THREE.DirectionalLight(0xffffff, 0.6);
    highlightLight.position.set(-2, 4, 2);
    highlightLight.castShadow = false;
    // Don't add to scene yet - will be added after ring is loaded
    this.highlightLight = highlightLight;
    this.lights.push(highlightLight);

    // Ring light for diamond sparkle
    const ringLight = new THREE.DirectionalLight(0xffffff, 0.8);
    ringLight.position.set(-3, 8, 3);
    ringLight.castShadow = false;
    // Don't add to scene yet - will be added after ring is loaded
    this.ringLight = ringLight;
    this.lights.push(ringLight);

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
    // Keep the custom background instead of environment background
    // this.scene.background = envMap;

    // Store environment map for material usage
    this.envMap = envMap;
  }

  async setupEnvironment() {
    // Load basic environment for fallback, but DON'T apply to scene
    // Scene will keep gradient background, ring will have separate HDR
    const envMapLoader = new THREE.CubeTextureLoader();
    const basicEnvMap = envMapLoader.load([
      "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
    ]);

    // Store basic env map for fallback
    this.envMap = basicEnvMap;

    // DON'T apply to scene - keep gradient background
    // this.scene.environment = null;
  }

  /**
   * Create separate HDR environment specifically for ring materials
   * This won't affect the background gradient
   */
  async createRingEnvironment() {
    const rgbeLoader = new RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    try {
      console.log("🔄 Loading HDR environment for ring sparkle...");
      const hdrTexture = await rgbeLoader.loadAsync(
        "/hdr/studio_small_03_4k.hdr"
      );
      const ringEnvMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

      // Áp dụng HDR cho toàn bộ scene
      this.scene.environment = ringEnvMap; // <-- Áp dụng HDR cho toàn bộ scene

      // Clean up
      hdrTexture.dispose();
      pmremGenerator.dispose();

      console.log("✨ HDR environment applied to entire scene!");
      return ringEnvMap;
    } catch (error) {
      console.warn("Failed to load HDR, using fallback:", error);
      return this.envMap; // Return basic cube texture as fallback
    }
  }

  addMirrorGround() {
    // Create trapezoid mirror geometry using Shape and ShapeGeometry
    const createTrapezoidGeometry = () => {
      const shape = new THREE.Shape();

      // Define trapezoid vertices (wider at bottom, narrower at top)
      const width = 10;
      const height = 9;
      const narrowFactor = 0.6; // Top is 60% width of bottom

      // Start from bottom left, go clockwise
      shape.moveTo(-width, -height); // Bottom left
      shape.lineTo(width, -height); // Bottom right
      shape.lineTo(width * narrowFactor, height); // Top right (narrower)
      shape.lineTo(-width * narrowFactor, height); // Top left (narrower)
      shape.lineTo(-width, -height); // Back to start

      const geometry = new THREE.ShapeGeometry(shape);
      return geometry;
    };

    const mirrorGeometry = createTrapezoidGeometry();

    // Create separate reflection scene without sparkle effects
    this.reflectionScene = new THREE.Scene();
    this.originalScene = this.scene;

    // Create reflector for mirror functionality with custom reflection scene
    this.mirror = new Reflector(mirrorGeometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xe6e6e6, // 90% độ sáng - sáng như hồi nãy
      recursion: 0, // No recursive reflections to avoid bloom accumulation
    });

    // Override mirror's render method to use non-sparkle reflection scene
    const originalOnBeforeRender = this.mirror.onBeforeRender;
    this.mirror.onBeforeRender = (renderer, scene, camera) => {
      // Create non-sparkle reflection scene on first render
      if (!this.reflectionScene.children.length && this.model) {
        this.setupNonSparkleReflectionScene();
      }

      // Always use reflection scene if it has content, fallback to main scene
      if (this.reflectionScene && this.reflectionScene.children.length > 0) {
        originalOnBeforeRender.call(
          this.mirror,
          renderer,
          this.reflectionScene,
          camera
        );
      } else {
        originalOnBeforeRender.call(this.mirror, renderer, scene, camera);
      }
    };

    // Create colored mirror surface with gradient reflection
    const mirrorSurfaceGeometry = createTrapezoidGeometry();

    // Create gradient texture for the trapezoid mirror (updated colors)
    const createGradientTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      // Create vertical gradient từ đỉnh hình thang đến đáy (top to bottom)
      // Gradient mượt mà từ trắng đến tối dần - các màu cách đều nhau để smooth
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#821834"); // Đỉnh - trắng sáng nhất
      gradient.addColorStop(0.25, "#821834"); // 25% - hồng
      gradient.addColorStop(0.65, "#821834"); // 65% - đỏ sẫm
      gradient.addColorStop(1.0, "#821834"); // Đáy - tối nhất

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return new THREE.CanvasTexture(canvas);
    };

    const gradientTexture = createGradientTexture();
    gradientTexture.colorSpace = THREE.SRGBColorSpace;
    gradientTexture.needsUpdate = true; // Force texture update

    const mirrorSurfaceMaterial = new THREE.MeshBasicMaterial({
      map: gradientTexture, // Apply gradient texture
      transparent: true, // Remove transparency to show full gradient colors
      opacity: 0, // Full opacity for vibrant colors
      side: THREE.DoubleSide, // Ensure visibility from both sides
    });
    mirrorSurfaceMaterial.needsUpdate = true; // Force material update

    const mirrorSurface = new THREE.Mesh(
      mirrorSurfaceGeometry,
      mirrorSurfaceMaterial
    );

    // Configure mirror reflection properties - no bloom, darker reflection
    this.mirror.position.z = 2;

    // Ensure reflection material doesn't contribute to bloom
    this.mirror.material.transparent = true;
    this.mirror.material.opacity = 1; // Reduce reflection intensity for darker look

    // Mark mirror as non-bloomable by setting low emissive
    this.mirror.material.emissive = new THREE.Color(0x000000);
    this.mirror.material.emissiveIntensity = 0;

    mirrorSurface.position.z = 2;

    // Position both mirror and surface horizontally like in reference image
    this.mirror.position.y = -2.5;
    this.mirror.rotation.x = -Math.PI / 2; // Keep horizontal rotation

    mirrorSurface.position.y = -2.49; // Higher above reflector to ensure visibility
    mirrorSurface.rotation.x = -Math.PI / 2; // Keep horizontal rotation

    this.scene.add(this.mirror); // Re-enable reflector with gradient surface
    this.scene.add(mirrorSurface);
    this.mirrorSurface = mirrorSurface;
  }

  /**
   * Setup reflection scene without sparkle effects
   * This scene will only be used for what appears in mirror reflections
   */
  setupNonSparkleReflectionScene() {
    if (!this.model || !this.reflectionScene) return;

    console.log("🪞 Setting up non-sparkle reflection scene...");

    // Copy model to reflection scene
    const modelClone = this.model.clone();
    const pivotClone = new THREE.Object3D();

    // Copy pivot properties
    pivotClone.position.copy(this.pivot.position);
    pivotClone.rotation.copy(this.pivot.rotation);
    pivotClone.scale.copy(this.pivot.scale);

    // Add cloned model to cloned pivot
    pivotClone.add(modelClone);

    // Replace all materials with simple non-sparkle materials
    modelClone.traverse((child) => {
      if (child.isMesh) {
        if (child.userData.isDiamond) {
          // Simple glass material for diamonds in reflection - no iridescence
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true,
            opacity: 0.8,
            ior: 1.5, // Lower IOR for less refraction
            // NO iridescence effects
            envMapIntensity: 0.3, // Much lower env map intensity
          });
        } else {
          // Simple metal material for metal parts in reflection
          const originalColor =
            child.material.color || new THREE.Color(0xeecdae);
          child.material = new THREE.MeshPhysicalMaterial({
            color: originalColor,
            metalness: 0.8,
            roughness: 0.3,
            envMapIntensity: 0.5, // Lower env map intensity
            // NO clearcoat or special effects
          });
        }
        child.material.needsUpdate = true;
      }
    });

    this.reflectionScene.add(pivotClone);

    // Copy background from main scene to reflection scene
    if (this.scene.background) {
      this.reflectionScene.background = this.scene.background;
    }

    // Copy environment from main scene but with lower intensity
    if (this.scene.environment) {
      this.reflectionScene.environment = this.scene.environment;
    }

    // Add basic lighting to reflection scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.reflectionScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(3, 6, 4);
    this.reflectionScene.add(directionalLight);

    // Store references for updates
    this.reflectionModel = modelClone;
    this.reflectionPivot = pivotClone;

    console.log("✨ Non-sparkle reflection scene setup complete");
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

      // 7. Set ring to lie flat horizontally like in reference image
      this.model.rotation.x = -Math.PI / 1.8; // Rotate 90 degrees to lay flat
      this.model.rotation.z = -Math.PI / 3; // No Z rotation needed
      this.model.rotation.y = Math.PI / 18;
      // No need to set rotation.y for model anymore, as pivot will handle that

      // 7. Add model as a CHILD of pivot
      this.pivot.add(this.model);

      // ===============================================

      // Save original materials before RingEnhancer processes them
      this.saveOriginalMaterials();

      // Let RingEnhancer handle ALL material processing

      // Create HDR environment specifically for ring
      const ringEnvMap = await this.createRingEnvironment();

      // Use RingEnhancer with separate HDR environment
      this.ringEnhancer = new RingEnhancer(ringEnvMap);
      this.ringEnhancer.enhanceRingModel(this.model, ringEnvMap);

      // Add lights to scene only after ring is loaded, and configure them to only affect the ring
      this.scene.add(this.keyLight);
      this.scene.add(this.highlightLight);
      this.scene.add(this.ringLight);

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

      // Sync reflection pivot rotation if it exists
      if (this.reflectionPivot) {
        this.reflectionPivot.rotation.y = this.currentRotationY;
      }
    }
    // ========================================================

    // Update GLTF animations if any
    if (this.mixer) {
      this.mixer.update(0.016); // ~60fps
    }

    // Render the scene with post-processing
    if (this.composer) {
      this.composer.render();
    }
  }

  handleResize() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;

        if (this.camera && this.renderer && this.composer) {
          // Thêm composer vào
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
          this.composer.setSize(width, height); // <-- Thêm dòng này
        }
      }
    });

    resizeObserver.observe(this.container);
    this.resizeObserver = resizeObserver;
  }

  // Material control methods - Updated for RingEnhancer compatibility
  setGoldMaterial() {
    if (!this.model) return;

    const goldConfig = {
      color: 0xffd700, // Gold color
      metalness: 1.0,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.0,
    };

    // Apply to main model
    this.model.traverse((child) => {
      if (child.isMesh && !child.userData.isDiamond) {
        child.material = new THREE.MeshPhysicalMaterial({
          ...goldConfig,
          envMap: this.ringEnhancer ? this.ringEnhancer.envMap : this.envMap,
        });
        child.material.needsUpdate = true;
        child.userData.isMetal = true;
      }
    });

    // Apply to reflection model
    this.updateReflectionMaterial(goldConfig);
    console.log("🥇 Đã áp dụng vật liệu vàng cho cả main và reflection");
  }

  setSilverMaterial() {
    if (!this.model) return;

    const silverConfig = {
      color: 0xc0c0c0, // Silver color
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.2,
    };

    // Apply to main model
    this.model.traverse((child) => {
      if (child.isMesh && !child.userData.isDiamond) {
        child.material = new THREE.MeshPhysicalMaterial({
          ...silverConfig,
          envMap: this.ringEnhancer ? this.ringEnhancer.envMap : this.envMap,
        });
        child.material.needsUpdate = true;
        child.userData.isMetal = true;
      }
    });

    // Apply to reflection model
    this.updateReflectionMaterial(silverConfig);
    console.log("🥈 Đã áp dụng vật liệu bạc cho cả main và reflection");
  }

  setPlatinumMaterial() {
    if (!this.model) return;

    const platinumConfig = {
      color: 0xe5e4e2, // Platinum color
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.1,
    };

    // Apply to main model
    this.model.traverse((child) => {
      if (child.isMesh && !child.userData.isDiamond) {
        child.material = new THREE.MeshPhysicalMaterial({
          ...platinumConfig,
          envMap: this.ringEnhancer ? this.ringEnhancer.envMap : this.envMap,
        });
        child.material.needsUpdate = true;
        child.userData.isMetal = true;
      }
    });

    // Apply to reflection model
    this.updateReflectionMaterial(platinumConfig);
    console.log("🤍 Đã áp dụng vật liệu bạch kim cho cả main và reflection");
  }

  setRoseGoldMaterial() {
    if (!this.model) return;

    const roseGoldConfig = {
      color: 0xeecdae, // Rose gold color (corrected)
      metalness: 1.0,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
    };

    // Apply to main model
    this.model.traverse((child) => {
      if (child.isMesh && !child.userData.isDiamond) {
        child.material = new THREE.MeshPhysicalMaterial({
          ...roseGoldConfig,
          envMap: this.ringEnhancer ? this.ringEnhancer.envMap : this.envMap,
        });
        child.material.needsUpdate = true;
        child.userData.isMetal = true;
      }
    });

    // Apply to reflection model
    this.updateReflectionMaterial(roseGoldConfig);
    console.log("🌹 Đã áp dụng vật liệu vàng hồng cho cả main và reflection");
  }

  setDiamondMaterial() {
    if (this.ringEnhancer) {
      this.ringEnhancer.setStandardDiamondMaterial();
    }
  }

  // Force all diamonds to have the same material - for troubleshooting
  forceAllDiamondsUniform() {
    if (this.ringEnhancer) {
      this.ringEnhancer.forceAllPotentialDiamondsUniform();
    }
  }

  // Save original materials from GLB file before any modifications
  saveOriginalMaterials() {
    if (!this.model) return;

    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone and save the original material from GLB file
        child.userData.originalMaterial = child.material.clone();
        console.log(`💾 Saved original material for: ${child.name || 'mesh'}`);
      }
    });
    console.log("✅ All original materials saved");
  }

  // Helper method to update reflection model materials
  updateReflectionMaterial(materialConfig) {
    if (!this.reflectionModel) return;

    this.reflectionModel.traverse((child) => {
      if (child.isMesh && !child.userData.isDiamond) {
        // Apply simpler material for reflection (no clearcoat, lower env intensity)
        child.material = new THREE.MeshPhysicalMaterial({
          color: materialConfig.color,
          metalness: materialConfig.metalness || 0.8,
          roughness: materialConfig.roughness || 0.3,
          envMapIntensity: (materialConfig.envMapIntensity || 1.0) * 0.5, // Lower intensity for reflection
          // NO clearcoat or special effects for reflection
        });
        child.material.needsUpdate = true;
      }
    });
  }

  resetToOriginalMaterials() {
    if (!this.model) return;

    console.log("🔄 Starting reset to original materials...");

    // Reset main model to original materials
    this.model.traverse((child) => {
      if (child.isMesh) {
        if (child.userData.originalMaterial) {
          // Reset to the original GLB material
          child.material = child.userData.originalMaterial.clone();
          child.material.needsUpdate = true;
          console.log(`🔄 Reset material for: ${child.name || 'mesh'}`);
        } else {
          console.warn(`⚠️ No original material found for: ${child.name || 'mesh'}`);
        }
      }
    });

    // Reset reflection model to match original materials
    if (this.reflectionModel) {
      this.reflectionModel.traverse((child) => {
        if (child.isMesh && !child.userData.isDiamond) {
          // Find corresponding mesh in main model to get original color
          let originalColor = new THREE.Color(0xeecdae); // Default fallback
<<<<<<< HEAD
          
=======

>>>>>>> quoctimirror
          // Try to find matching mesh in main model
          this.model.traverse((mainChild) => {
            if (mainChild.name === child.name && mainChild.userData.originalMaterial) {
              originalColor = mainChild.userData.originalMaterial.color || originalColor;
            }
          });

          child.material = new THREE.MeshPhysicalMaterial({
            color: originalColor,
            metalness: 0.8,
            roughness: 0.3,
            envMapIntensity: 0.5,
          });
          child.material.needsUpdate = true;
        }
      });
    }

    // Reset diamond materials via RingEnhancer
    if (this.ringEnhancer) {
      this.ringEnhancer.resetToOriginalMaterials();
    }

    console.log("✅ Reset to original materials completed for both main and reflection");
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

    // Clean up ring enhancer
    if (this.ringEnhancer) {
      this.ringEnhancer.dispose();
      this.ringEnhancer = null;
    }

    // Clean up reflection scene
    if (this.reflectionScene) {
      this.reflectionScene.traverse((object) => {
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
      this.reflectionScene.clear();
      this.reflectionScene = null;
    }

    // Clean up reflection references
    this.reflectionModel = null;
    this.reflectionPivot = null;

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
