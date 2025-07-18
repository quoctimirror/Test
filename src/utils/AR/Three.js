// Three.js utilities for 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

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

    // Model settings
    this.modelPath = "/view360/ring.glb";
    this.modelScale = 3;
    this.modelPosition = { x: 8, y: 0, z: 0 };
    this.initialYRotation = Math.PI;

    // Camera settings
    this.cameraPosition = { x: 0, y: 0, z: 5 };
  }

  init() {
    if (this.isInitialized) return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf3b1c1); // Pink background around mirror

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
    this.renderer.toneMappingExposure = 1;

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Rotation control variables
    this.isMouseDown = false;
    this.mouseX = 0;
    // === FIX: Start rotation from initial angle ===
    this.targetRotationY = this.initialYRotation;
    this.currentRotationY = this.initialYRotation;

    this.addMouseEvents();

    // Setup lighting
    this.setupLighting();

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
    // Enhanced lighting setup from 3d-viewer-color
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light with enhanced intensity
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = false;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Secondary directional light for fill lighting
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-10, -10, -5);
    this.scene.add(directionalLight2);
    this.lights.push(directionalLight2);

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
          console.log(
            `🔍 Mesh: "${child.name}" | Material: "${materialName}" | IsDiamond: ${isDiamond}`
          );

          // Store material type information
          child.userData.isDiamond = isDiamond;
          child.userData.isMetal = !isDiamond;

          if (isDiamond) {
            console.log(
              `💎 Applying ENHANCED DIAMOND material to: "${child.name}"`
            );
            // Enhanced diamond material with transmission and sparkle
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
              ior: 2.42, // Diamond's refractive index
              thickness: 0.1, // Very thin for maximum clarity
              attenuationDistance: 0.1,
              attenuationColor: new THREE.Color(0xffffff), // Pure white attenuation
              side: THREE.DoubleSide,
            });
            child.material.needsUpdate = true;
          } else {
            // Apply default gold material to metal parts
            console.log(`🔧 Applying GOLD material to: "${child.name}"`);
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffd700, // Gold color
              metalness: 0.8,
              roughness: 0.2,
              envMapIntensity: 1.0,
            });
            child.material.needsUpdate = true;
          }
        }
      });

      // SUPER AGGRESSIVE FINAL PASS - Force ALL diamonds to be identical
      console.log("🔧 SUPER AGGRESSIVE: Final pass to ensure ALL diamonds are identical...");
      
      // First pass: Identify ALL potential diamond meshes with extensive logging
      const diamondMeshes = [];
      this.model.traverse((child) => {
        if (child.isMesh) {
          const name = child.name ? child.name.toLowerCase() : "";
          const materialName = child.material && child.material.name ? child.material.name.toLowerCase() : "";
          
          console.log(`🔎 DETAILED MESH ANALYSIS: "${child.name}"`);
          console.log(`   - Material name: "${materialName}"`);
          console.log(`   - Current material type: ${child.material ? child.material.constructor.name : 'none'}`);
          console.log(`   - Material color: ${child.material && child.material.color ? child.material.color.getHex() : 'none'}`);
          console.log(`   - Material transparent: ${child.material ? child.material.transparent : 'none'}`);
          console.log(`   - Material opacity: ${child.material ? child.material.opacity : 'none'}`);
          
          // Check if name contains diamond/gem keywords
          if (name.includes("diamond") || name.includes("gem") || name.includes("stone") || name.includes("crystal")) {
            diamondMeshes.push(child);
            console.log(`✅ ADDED TO DIAMOND LIST: "${child.name}"`);
            
            // GEOMETRY DEBUGGING
            if (child.geometry) {
              console.log(`🔍 GEOMETRY INFO for "${child.name}":`);
              console.log(`   - Vertices count: ${child.geometry.attributes.position ? child.geometry.attributes.position.count : 'none'}`);
              console.log(`   - Has UV: ${child.geometry.attributes.uv ? 'yes' : 'no'}`);
              console.log(`   - Has normals: ${child.geometry.attributes.normal ? 'yes' : 'no'}`);
              console.log(`   - Has colors: ${child.geometry.attributes.color ? 'yes' : 'no'}`);
              console.log(`   - Geometry type: ${child.geometry.constructor.name}`);
              
              // Check if geometry has vertex colors
              if (child.geometry.attributes.color) {
                console.log(`⚠️  WARNING: "${child.name}" has vertex colors that might override material!`);
                console.log(`   - Color attribute array length: ${child.geometry.attributes.color.array.length}`);
              }
            }
          }
        }
      });
      
      console.log(`📊 Found ${diamondMeshes.length} diamond meshes total`);
      
      // Second pass: Force identical material on ALL identified diamonds
      diamondMeshes.forEach((diamondMesh, index) => {
        console.log(`💎 FORCING identical material on diamond ${index + 1}: "${diamondMesh.name}"`);
        console.log(`   - BEFORE: Material type: ${diamondMesh.material.constructor.name}`);
        console.log(`   - BEFORE: Color: ${diamondMesh.material.color.getHex()}`);
        
        // REMOVE vertex colors that might be causing the issue
        if (diamondMesh.geometry && diamondMesh.geometry.attributes.color) {
          console.log(`🧹 REMOVING vertex colors from "${diamondMesh.name}"`);
          diamondMesh.geometry.deleteAttribute('color');
        }
        
        // APPLY EXACT SAME MATERIAL AS 3D-VIEWER-COLOR INDEX.HTML
        diamondMesh.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.0,
          transmission: 0.98,
          transparent: true,
          opacity: 0.95,
          reflectivity: 1.0,
          envMapIntensity: 3.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          ior: 2.42,
          thickness: 0.3,
          attenuationDistance: 0.3,
          attenuationColor: new THREE.Color(0xffffff),
          side: THREE.DoubleSide
        });
        
        console.log(`💎 APPLIED 3D-VIEWER-COLOR DIAMOND MATERIAL to "${diamondMesh.name}"`);
        
        diamondMesh.material.needsUpdate = true;
        diamondMesh.userData.isDiamond = true;
        diamondMesh.userData.isMetal = false;
        
        // Log final material properties
        console.log(`   - AFTER: Material type: ${diamondMesh.material.constructor.name}`);
        console.log(`   - AFTER: Color: ${diamondMesh.material.color.getHex()}`);
        console.log(`   - AFTER: Transmission: ${diamondMesh.material.transmission}`);
        console.log(`   - AFTER: Opacity: ${diamondMesh.material.opacity}`);
        console.log(`   - AFTER: Transparent: ${diamondMesh.material.transparent}`);
      });
      
      // THIRD PASS: Double-check all meshes after material application
      console.log("🔍 VERIFICATION PASS: Checking all meshes after material application...");
      this.model.traverse((child) => {
        if (child.isMesh) {
          const name = child.name ? child.name.toLowerCase() : "";
          if (name.includes("diamond") || name.includes("gem") || name.includes("stone") || name.includes("crystal")) {
            console.log(`🔍 VERIFICATION - "${child.name}":`, {
              materialType: child.material.constructor.name,
              color: child.material.color.getHex(),
              transmission: child.material.transmission,
              opacity: child.material.opacity,
              transparent: child.material.transparent
            });
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

  // Material control methods
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
          console.log(`💎 FORCING diamond material on: "${child.name}"`);
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
