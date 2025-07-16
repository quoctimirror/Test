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

    // === THAY ĐỔI: Thêm pivot vào thuộc tính lớp ===
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
    this.modelPath = "/view360/0.glb";
    this.modelScale = 6;
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
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Biến điều khiển xoay
    this.isMouseDown = false;
    this.mouseX = 0;
    // === SỬA LỖI: Bắt đầu xoay từ góc ban đầu ===
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
    // Giữ nguyên logic điều khiển chuột của bạn, nó đã tốt rồi
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
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Main directional light for clear reflections
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = false; // Disable shadows for mirror effect
    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Secondary light for better ring illumination
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.8);
    secondaryLight.position.set(-5, 8, -5);
    secondaryLight.castShadow = false;
    this.scene.add(secondaryLight);
    this.lights.push(secondaryLight);

    // Point light for enhanced reflections
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(0, 15, 0);
    this.scene.add(pointLight);
    this.lights.push(pointLight);
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
    this.mirror.position.y = -2.9;
    this.mirror.rotation.x = -Math.PI / 2; // Keep horizontal rotation

    mirrorSurface.position.y = -2.89; // Slightly above reflector
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

      // === THAY ĐỔI QUAN TRỌNG NHẤT: SỬ DỤNG PIVOT ===

      // 1. Tạo một Object3D vô hình để làm "bệ xoay" (pivot)
      this.pivot = new THREE.Object3D();

      // 2. ĐÚNG: Đặt PIVOT tại vị trí tâm xoay mong muốn của chiếc nhẫn
      this.pivot.position.set(
        this.modelPosition.x,
        this.modelPosition.y,
        this.modelPosition.z
      );

      // 3. ĐÚNG: Áp dụng góc xoay ban đầu cho PIVOT
      this.pivot.rotation.y = this.initialYRotation;

      // 4. Thêm pivot vào scene
      this.scene.add(this.pivot);

      // 5. Cấu hình model
      this.model.scale.setScalar(this.modelScale);

      // 6. ĐÚNG: Đặt MODEL tại tâm của PIVOT (0,0,0) so với PIVOT
      this.model.position.set(0, 0, 0);

      // 7. Áp dụng độ nghiêng (trục X, Z) cho model
      this.model.rotation.x = -Math.PI / 20;
      this.model.rotation.z = -Math.PI / 2.2;
      // Không cần đặt rotation.y cho model nữa, vì pivot sẽ xử lý việc đó

      // 7. Thêm model vào làm CON của pivot
      this.pivot.add(this.model);

      // ===============================================

      // Configure ring materials - keep original appearance
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false; // Disable shadow casting
          child.receiveShadow = false; // Disable shadow receiving

          // Keep original material properties for authentic look
          if (child.material) {
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

    // === THAY ĐỔI: Áp dụng xoay cho PIVOT, không phải model ===
    if (this.pivot) {
      // Làm mượt chuyển động
      this.currentRotationY +=
        (this.targetRotationY - this.currentRotationY) * 0.1;

      // Áp dụng góc xoay cho bệ xoay (pivot)
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
    // Sửa lại để reset về góc xoay ban đầu
    this.targetRotationY = this.initialYRotation;
    // this.currentRotationY sẽ tự động cập nhật trong vòng lặp animate

    // Camera và gương không đổi
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
