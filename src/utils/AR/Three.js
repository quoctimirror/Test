// Three.js utilities for 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { RingEnhancer } from "./RingEnhancer.js";

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

    // Create reflector for mirror functionality (invisible/transparent)
    this.mirror = new Reflector(mirrorGeometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xffffff, // Keep reflection neutral
      recursion: 1,
    });

    // Create colored mirror surface with gradient reflection
    const mirrorSurfaceGeometry = createTrapezoidGeometry();

    // Create gradient texture for the trapezoid mirror (updated colors)
    const createGradientTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      // Create vertical gradient (top to bottom) since mirror is rotated horizontally
      // This will become front-to-back gradient when rotated
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(236, 54, 103, 0.6)"); // Front edge - đậm nhất (hồng nhạt)
      gradient.addColorStop(0.5, "#B22148"); // Center - sáng nhất (đỏ sẫm)
      gradient.addColorStop(1.0, "rgba(236, 54, 103, 0.6)"); // Back edge - đậm nhất (hồng nhạt)

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return new THREE.CanvasTexture(canvas);
    };

    const gradientTexture = createGradientTexture();
    gradientTexture.colorSpace = THREE.SRGBColorSpace;
    gradientTexture.needsUpdate = true; // Force texture update

    const mirrorSurfaceMaterial = new THREE.MeshBasicMaterial({
      map: gradientTexture, // Apply gradient texture
      transparent: false, // Remove transparency to show full gradient colors
      opacity: 1.0, // Full opacity for vibrant colors
      side: THREE.DoubleSide, // Ensure visibility from both sides
    });
    mirrorSurfaceMaterial.needsUpdate = true; // Force material update

    const mirrorSurface = new THREE.Mesh(
      mirrorSurfaceGeometry,
      mirrorSurfaceMaterial
    );

    this.mirror.position.z = 2;
    mirrorSurface.position.z = 2;

    // Position both mirror and surface horizontally like in reference image
    this.mirror.position.y = -2.5;
    this.mirror.rotation.x = -Math.PI / 2; // Keep horizontal rotation

    mirrorSurface.position.y = -3; // Higher above reflector to ensure visibility
    mirrorSurface.rotation.x = -Math.PI / 2; // Keep horizontal rotation

    this.scene.add(this.mirror); // Temporarily hide reflector to see gradient surface
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

      // 7. Set ring to lie flat horizontally like in reference image
      this.model.rotation.x = -Math.PI / 1.8; // Rotate 90 degrees to lay flat
      this.model.rotation.z = -Math.PI / 3; // No Z rotation needed
      this.model.rotation.y = Math.PI / 18;
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
            // ❗❗❗ Xóa các thuộc tính không cần thiết và đảm bảo hình học sạch sẽ
            if (child.geometry.attributes.color) {
              child.geometry.deleteAttribute("color");
            }
            child.geometry.computeVertexNormals();

            // ❗❗❗ Xóa các thuộc tính không cần thiết và đảm bảo hình học sạch sẽ
            if (child.geometry.attributes.color) {
              child.geometry.deleteAttribute("color");
            }
            child.geometry.computeVertexNormals();

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
          } else {
            // Apply enhanced rose gold material to metal parts
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

      // Use RingEnhancer to enhance only diamond meshes
      this.ringEnhancer = new RingEnhancer(this.envMap);
      this.ringEnhancer.enhanceRingModel(this.model, this.envMap);

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

  resetToOriginalMaterials() {
    // Reset metal materials to gold
    this.setGoldMaterial();

    // Reset diamond materials via RingEnhancer
    if (this.ringEnhancer) {
      this.ringEnhancer.resetToOriginalMaterials();
    }
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
