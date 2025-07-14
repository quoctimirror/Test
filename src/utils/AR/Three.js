// Three.js utilities for 3D model viewing
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class ThreeJSViewer {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.mixer = null;
    this.animationId = null;
    this.isInitialized = false;

    // Lighting setup
    this.lights = [];

    // Model settings
    this.modelPath = "/view-360/0.glb";
    this.modelScale = 6;
    this.modelPosition = { x: 10, y: 0, z: 0 };

    // Camera settings
    this.cameraPosition = { x: 0, y: 0, z: 5 };
    this.cameraTarget = { x: 0, y: 0, z: 0 };
  }

  init() {
    if (this.isInitialized) return;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(
      this.cameraPosition.x,
      this.cameraPosition.y,
      this.cameraPosition.z
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
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(
      this.cameraTarget.x,
      this.cameraTarget.y,
      this.cameraTarget.z
    );
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;

    // Disable zoom to keep fixed size
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    // Limit rotation to horizontal only (left/right)
    this.controls.minPolarAngle = Math.PI / 2; // 90 degrees
    this.controls.maxPolarAngle = Math.PI / 2; // 90 degrees

    // Setup lighting
    this.setupLighting();

    // Add shadow ground
    this.addShadowGround();

    // Load model
    this.loadModel();

    // Start animation loop
    this.animate();

    // Handle resize
    this.handleResize();

    this.isInitialized = true;
  }

  setupLighting() {
    // Ambient light to maintain original brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light with shadow mapping
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(2, 10, 6); // Light from above to cast shadow downward
    mainLight.castShadow = true;

    // High resolution shadow map for better quality
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;

    // Expand shadow camera to ensure shadow visibility
    const shadowCameraSize = 15; // Increase size to capture ring
    mainLight.shadow.camera.left = -shadowCameraSize;
    mainLight.shadow.camera.right = shadowCameraSize;
    mainLight.shadow.camera.top = shadowCameraSize;
    mainLight.shadow.camera.bottom = -shadowCameraSize;
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 25; // Increase to capture ring
    mainLight.shadow.bias = -0.001; // Increase bias to avoid artifacts
    mainLight.shadow.normalBias = 0.1; // Increase to handle curved surfaces better

    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Add fill light to restore original brightness
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-8, 3, -8);
    fillLight.castShadow = false;
    this.scene.add(fillLight);
    this.lights.push(fillLight);
  }

  addShadowGround() {
    // Create ground plane to receive shadows
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.8,
      transparent: true,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -2.5; // Position further away to extend shadow from ring bottom
    ground.receiveShadow = true; // Receive shadows from directional light

    this.scene.add(ground);
    this.shadowGround = ground;
  }

  async loadModel() {
    const loader = new GLTFLoader();

    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          this.modelPath,
          resolve,
          (progress) => {
            console.log(
              "Loading progress:",
              (progress.loaded / progress.total) * 100 + "%"
            );
          },
          reject
        );
      });

      this.model = gltf.scene;

      // Scale and position model
      this.model.scale.setScalar(this.modelScale);
      this.model.position.set(
        this.modelPosition.x,
        this.modelPosition.y,
        this.modelPosition.z
      );

      // Rotate model to match reference image orientation
      // Ring face pointing towards viewer (like in the reference image)
      this.model.rotation.x = -Math.PI / 4; // Tilt slightly down (-30 degrees)
      this.model.rotation.y = Math.PI / 3; // Rotate 45 degrees to show angle
      this.model.rotation.z = -Math.PI / 8;

      // Enable shadow casting for ring
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true; // Ring casts shadow
          child.receiveShadow = false; // Ring doesn't receive shadow

          // Ensure materials are properly set up
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });

      // Add model to scene
      this.scene.add(this.model);

      // Setup animations if any
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach((clip) => {
          const action = this.mixer.clipAction(clip);
          action.play();
        });
      }

      // Auto-fit camera to model
      this.fitCameraToModel();
    } catch (error) {
      console.error("Error loading model:", error);
      this.showErrorMessage();
    }
  }

  fitCameraToModel() {
    if (!this.model) return;

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());

    // Fixed camera position for consistent model size
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

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Update animations
    if (this.mixer) {
      this.mixer.update(0.016); // ~60fps
    }

    // Render scene
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

  // Control methods
  setAutoRotate(enabled) {
    if (this.controls) {
      this.controls.autoRotate = enabled;
    }
  }

  setAutoRotateSpeed(speed) {
    if (this.controls) {
      this.controls.autoRotateSpeed = speed;
    }
  }

  resetCamera() {
    if (this.model) {
      this.fitCameraToModel();
    } else {
      this.camera.position.set(
        this.cameraPosition.x,
        this.cameraPosition.y,
        this.cameraPosition.z
      );
      this.controls.target.set(
        this.cameraTarget.x,
        this.cameraTarget.y,
        this.cameraTarget.z
      );
      this.controls.update();
    }
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

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    // Clean up shadow ground
    if (this.shadowGround) {
      this.shadowGround.geometry.dispose();
      this.shadowGround.material.dispose();
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
