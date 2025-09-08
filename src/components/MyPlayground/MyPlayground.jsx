import React, { useEffect, useRef, useState } from 'react';
import './MyPlayground.css';
// Import utils GLB loader để load model 3D
import { loadModel } from '../../utils/glbLoader';

const MyPlayground = () => {
  const sceneRef = useRef(null);
  const [ringModel, setRingModel] = useState(null);

  useEffect(() => {
    // Load model nhẫn khi component mount
    const loadRingModel = async () => {
      try {
        // Sử dụng glbLoader.js để load file nhẫn
        const model = await loadModel('nhanAnhKhanhLam'); // Load file nhanAnhKhanhLam.glb từ public/models/
        
        // Đăng ký model với window để A-Frame component có thể truy cập
        if (model && model.scene) {
          window.ringModelScene = model.scene;
          setRingModel(true); // Chỉ set true để trigger re-render
          console.log('✅ Đã load xong model nhẫn:', model);
          
          // Debug: Xem cấu trúc của model
          console.log('Model scene:', model.scene);
          console.log('Model animations:', model.animations);
        }
      } catch (error) {
        console.error('❌ Lỗi khi load model nhẫn:', error);
      }
    };

    loadRingModel();

    // Register component để load GLB model vào A-Frame
    if (window.AFRAME && !window.AFRAME.components['ring-model-loader']) {
      window.AFRAME.registerComponent('ring-model-loader', {
        init: function() {
          console.log('🔄 Initializing ring-model-loader component...');
          
          const tryLoadModel = () => {
            if (window.ringModelScene) {
              console.log('✅ Model found, adding to scene...');
              
              // Clone và thêm Three.js model vào A-Frame entity
              const clonedScene = window.ringModelScene.clone();
              
              // Đảm bảo model visible
              clonedScene.traverse((child) => {
                if (child.isMesh) {
                  child.visible = true;
                  // Log mesh info để debug
                  console.log('Mesh found:', child.name, child.geometry, child.material);
                }
              });
              
              this.el.setObject3D('mesh', clonedScene);
              console.log('✅ Đã thêm nhẫn vào A-Frame scene');
              
              // Force update
              this.el.emit('model-loaded');
            } else {
              console.log('⏳ Model chưa sẵn sàng, retry sau 500ms...');
              setTimeout(tryLoadModel, 500);
            }
          };
          
          tryLoadModel();
        },
        
        remove: function() {
          // Cleanup khi component bị remove
          this.el.removeObject3D('mesh');
        }
      });
    }

    // Component để chọn và tương tác với entity bằng VR controllers và Desktop
    if (window.AFRAME && !window.AFRAME.components['vr-selectable']) {
      window.AFRAME.registerComponent('vr-selectable', {
        init: function() {
          this.el.classList.add('interactive');
          this.originalColor = null;
          this.isSelected = false;
          
          // Desktop interaction
          this.isDragging = false;
          this.mouseX = 0;
          this.mouseY = 0;
          
          // Lưu màu gốc
          this.el.addEventListener('model-loaded', () => {
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  this.originalColor = child.material.color ? child.material.color.clone() : null;
                }
              });
            }
          });
          
          // === VR INTERACTIONS ===
          // Khi controller chỉ vào (hover)
          this.el.addEventListener('raycaster-intersected', (evt) => {
            if (evt.detail.el.id === 'rightController' || evt.detail.el.id === 'leftController') {
              this.highlight();
            }
          });
          
          // Khi controller không chỉ vào nữa
          this.el.addEventListener('raycaster-intersected-cleared', () => {
            if (!this.isSelected) {
              this.unhighlight();
            }
          });
          
          // === DESKTOP INTERACTIONS ===
          // Mouse hover
          this.el.addEventListener('mouseenter', () => {
            this.highlight();
            document.body.style.cursor = 'pointer';
          });
          
          this.el.addEventListener('mouseleave', () => {
            if (!this.isSelected) {
              this.unhighlight();
            }
            if (!this.isDragging) {
              document.body.style.cursor = 'default';
            }
          });
          
          // Click để chọn (cả VR và Desktop)
          this.el.addEventListener('click', (evt) => {
            // Prevent click khi đang drag
            if (this.isDragging) {
              evt.stopPropagation();
              return;
            }
            this.toggleSelection();
          });
          
          // Desktop drag với chuột
          this.el.addEventListener('mousedown', (evt) => {
            if (this.isSelected) {
              this.isDragging = true;
              this.mouseX = evt.clientX;
              this.mouseY = evt.clientY;
              document.body.style.cursor = 'grabbing';
              evt.stopPropagation();
            }
          });
          
          // Desktop keyboard controls khi đã select
          this.handleKeyboard = (evt) => {
            if (!this.isSelected) return;
            
            const position = this.el.getAttribute('position');
            const rotation = this.el.getAttribute('rotation');
            const moveSpeed = 0.1;
            const rotateSpeed = 5;
            
            switch(evt.key) {
              // Di chuyển với Arrow Keys
              case 'ArrowUp':
                this.el.setAttribute('position', {x: position.x, y: position.y, z: position.z - moveSpeed});
                break;
              case 'ArrowDown':
                this.el.setAttribute('position', {x: position.x, y: position.y, z: position.z + moveSpeed});
                break;
              case 'ArrowLeft':
                this.el.setAttribute('position', {x: position.x - moveSpeed, y: position.y, z: position.z});
                break;
              case 'ArrowRight':
                this.el.setAttribute('position', {x: position.x + moveSpeed, y: position.y, z: position.z});
                break;
              
              // Di chuyển lên/xuống với Q/E
              case 'q':
              case 'Q':
                this.el.setAttribute('position', {x: position.x, y: position.y - moveSpeed, z: position.z});
                break;
              case 'e':
              case 'E':
                this.el.setAttribute('position', {x: position.x, y: position.y + moveSpeed, z: position.z});
                break;
              
              // Xoay với A/D (trục Y) và W/S (trục X)
              case 'a':
              case 'A':
                this.el.setAttribute('rotation', {x: rotation.x, y: rotation.y - rotateSpeed, z: rotation.z});
                break;
              case 'd':
              case 'D':
                this.el.setAttribute('rotation', {x: rotation.x, y: rotation.y + rotateSpeed, z: rotation.z});
                break;
              case 'w':
              case 'W':
                this.el.setAttribute('rotation', {x: rotation.x - rotateSpeed, y: rotation.y, z: rotation.z});
                break;
              case 's':
              case 'S':
                this.el.setAttribute('rotation', {x: rotation.x + rotateSpeed, y: rotation.y, z: rotation.z});
                break;
              
              // Reset position với R
              case 'r':
              case 'R':
                this.el.setAttribute('position', '0 1.6 -1');
                this.el.setAttribute('rotation', '0 0 0');
                break;
              
              // Deselect với ESC
              case 'Escape':
                this.toggleSelection();
                break;
            }
          };
          
          // Mouse move handler
          this.handleMouseMove = (evt) => {
            if (this.isDragging && this.isSelected) {
              const deltaX = evt.clientX - this.mouseX;
              const deltaY = evt.clientY - this.mouseY;
              
              const rotation = this.el.getAttribute('rotation');
              
              // Xoay entity khi drag chuột
              this.el.setAttribute('rotation', {
                x: rotation.x - deltaY * 0.5,
                y: rotation.y + deltaX * 0.5,
                z: rotation.z
              });
              
              this.mouseX = evt.clientX;
              this.mouseY = evt.clientY;
            }
          };
          
          // Mouse up handler
          this.handleMouseUp = () => {
            if (this.isDragging) {
              this.isDragging = false;
              document.body.style.cursor = 'pointer';
            }
          };
          
          // Add document-level event listeners
          document.addEventListener('keydown', this.handleKeyboard);
          document.addEventListener('mousemove', this.handleMouseMove);
          document.addEventListener('mouseup', this.handleMouseUp);
        },
        
        highlight: function() {
          // Tạo hiệu ứng highlight màu vàng
          const mesh = this.el.getObject3D('mesh');
          if (mesh) {
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0xFFFF00);
                child.material.emissiveIntensity = 0.3;
              }
            });
          }
        },
        
        unhighlight: function() {
          // Xóa hiệu ứng highlight
          const mesh = this.el.getObject3D('mesh');
          if (mesh) {
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
              }
            });
          }
        },
        
        toggleSelection: function() {
          this.isSelected = !this.isSelected;
          
          if (this.isSelected) {
            console.log('✅ Entity đã được chọn:', this.el.id);
            // Kích hoạt orbit controls
            this.el.setAttribute('vr-orbit-controls', '');
            
            // Thêm outline
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  child.material.emissive = new window.THREE.Color(0x00FF00);
                  child.material.emissiveIntensity = 0.5;
                }
              });
            }
          } else {
            console.log('❌ Bỏ chọn entity:', this.el.id);
            // Tắt orbit controls
            this.el.removeAttribute('vr-orbit-controls');
            this.unhighlight();
          }
        },
        
        remove: function() {
          // Cleanup desktop event listeners
          document.removeEventListener('keydown', this.handleKeyboard);
          document.removeEventListener('mousemove', this.handleMouseMove);
          document.removeEventListener('mouseup', this.handleMouseUp);
        }
      });
    }

    // Component orbit controls cho VR
    if (window.AFRAME && !window.AFRAME.components['vr-orbit-controls']) {
      window.AFRAME.registerComponent('vr-orbit-controls', {
        init: function() {
          this.rightController = document.querySelector('#rightController');
          this.leftController = document.querySelector('#leftController');
          
          this.isGrabbing = false;
          this.isRotating = false;
          this.previousControllerPosition = new window.THREE.Vector3();
          this.previousControllerRotation = new window.THREE.Euler();
          
          // Lắng nghe grip button để di chuyển
          this.onGripDown = this.onGripDown.bind(this);
          this.onGripUp = this.onGripUp.bind(this);
          this.onControllerMove = this.onControllerMove.bind(this);
          
          // Lắng nghe thumbstick để xoay
          this.onThumbstickMove = this.onThumbstickMove.bind(this);
          
          if (this.rightController) {
            this.rightController.addEventListener('gripdown', this.onGripDown);
            this.rightController.addEventListener('gripup', this.onGripUp);
            this.rightController.addEventListener('thumbstickmoved', this.onThumbstickMove);
          }
          
          if (this.leftController) {
            this.leftController.addEventListener('gripdown', this.onGripDown);
            this.leftController.addEventListener('gripup', this.onGripUp);
            this.leftController.addEventListener('thumbstickmoved', this.onThumbstickMove);
          }
          
          console.log('🎮 VR Orbit Controls đã kích hoạt cho:', this.el.id);
        },
        
        onGripDown: function(evt) {
          this.isGrabbing = true;
          const controller = evt.target;
          controller.object3D.getWorldPosition(this.previousControllerPosition);
          console.log('✊ Đang grab entity');
        },
        
        onGripUp: function() {
          this.isGrabbing = false;
          console.log('✋ Thả entity');
        },
        
        onControllerMove: function() {
          if (!this.isGrabbing) return;
          
          // Di chuyển entity theo controller
          const controller = this.rightController.object3D.visible ? 
                           this.rightController : this.leftController;
          
          const currentPosition = new window.THREE.Vector3();
          controller.object3D.getWorldPosition(currentPosition);
          
          const delta = currentPosition.sub(this.previousControllerPosition);
          
          // Di chuyển entity
          const currentEntityPos = this.el.getAttribute('position');
          this.el.setAttribute('position', {
            x: currentEntityPos.x + delta.x,
            y: currentEntityPos.y + delta.y,
            z: currentEntityPos.z + delta.z
          });
          
          controller.object3D.getWorldPosition(this.previousControllerPosition);
        },
        
        onThumbstickMove: function(evt) {
          // Xoay entity với thumbstick
          const x = evt.detail.x; // -1 đến 1
          const y = evt.detail.y; // -1 đến 1
          
          if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
            const currentRotation = this.el.getAttribute('rotation');
            
            // Xoay theo trục Y (quay ngang) với thumbstick X
            // Xoay theo trục X (quay dọc) với thumbstick Y
            this.el.setAttribute('rotation', {
              x: currentRotation.x + (y * 2), // Tốc độ xoay
              y: currentRotation.y + (x * 2),
              z: currentRotation.z
            });
            
            console.log(`🔄 Xoay: X=${y * 2}°, Y=${x * 2}°`);
          }
        },
        
        tick: function() {
          // Update di chuyển liên tục khi grab
          if (this.isGrabbing) {
            this.onControllerMove();
          }
        },
        
        remove: function() {
          // Cleanup event listeners
          if (this.rightController) {
            this.rightController.removeEventListener('gripdown', this.onGripDown);
            this.rightController.removeEventListener('gripup', this.onGripUp);
            this.rightController.removeEventListener('thumbstickmoved', this.onThumbstickMove);
          }
          
          if (this.leftController) {
            this.leftController.removeEventListener('gripdown', this.onGripDown);
            this.leftController.removeEventListener('gripup', this.onGripUp);
            this.leftController.removeEventListener('thumbstickmoved', this.onThumbstickMove);
          }
        }
      });
    }

    // Hide on enter AR component
    if (window.AFRAME && !window.AFRAME.components['hide-on-enter-ar']) {
      window.AFRAME.registerComponent('hide-on-enter-ar', {
        init: function () {
          this.el.addEventListener('enter-ar', () => {
            this.el.object3D.visible = false;
          });
          this.el.addEventListener('exit-ar', () => {
            this.el.object3D.visible = true;
          });
        }
      });
    }

    // Hide on enter VR component  
    if (window.AFRAME && !window.AFRAME.components['hide-on-enter-vr']) {
      window.AFRAME.registerComponent('hide-on-enter-vr', {
        init: function () {
          this.el.addEventListener('enter-vr', () => {
            this.el.object3D.visible = false;
          });
          this.el.addEventListener('exit-vr', () => {
            this.el.object3D.visible = true;
          });
        }
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="myplayground-container">
      <a-scene
        ref={sceneRef}
        obb-collider="showColliders: false"
        renderer="colorManagement: true; sortTransparentObjects: true"
        xr-mode-ui="XRMode: xr"
        className="myplayground-scene"
      >

        {/* Sky - Wireframe sphere */}
        <a-entity
          hide-on-enter-ar
          geometry="primitive: sphere; radius: 500"
          material="color: #ffffff; wireframe: true; transparent: true; opacity: 0.1; side: back">
        </a-entity>

        {/* Ground base - nền đen */}
        <a-entity
          hide-on-enter-ar
          rotation="-90 0 0"
          position="0 0 0"
          geometry="primitive: plane; width: 100; height: 100;"
          material="color: #000000;">
        </a-entity>

        {/* Grid lines - đường kẻ ô vuông nhỏ */}
        {Array.from({length: 51}, (_, i) => {
          const pos = (i - 25) * 2;
          return (
            <React.Fragment key={`grid-${i}`}>
              {/* Đường dọc */}
              <a-entity
                hide-on-enter-ar
                position={`${pos} 0.01 0`}
                geometry="primitive: plane; width: 0.1; height: 100;"
                rotation="-90 0 0"
                material="color: #ffffff; transparent: true; opacity: 0.8;">
              </a-entity>
              {/* Đường ngang */}
              <a-entity
                hide-on-enter-ar
                position={`0 0.01 ${pos}`}
                geometry="primitive: plane; width: 100; height: 0.1;"
                rotation="-90 0 0"
                material="color: #ffffff; transparent: true; opacity: 0.8;">
              </a-entity>
            </React.Fragment>
          );
        })}

        {/* Camera với boundary checking */}
        <a-entity 
          id="cameraRig"
          look-controls
          position="0 2.0 0"
        >
          {/* Mouse cursor cho desktop - chỉ hiện khi không trong VR */}
          <a-entity 
            cursor="rayOrigin: mouse; fuse: false"
            raycaster="objects: .interactive"
            hide-on-enter-vr
          >
          </a-entity>
        </a-entity>

        {/* Test Box - để kiểm tra A-Frame hoạt động */}
        <a-box
          id="test-box"
          vr-selectable
          position="0 1.6 -3"
          rotation="0 45 0"
          color="#FF0000"
          scale="0.5 0.5 0.5"
          class="interactive"
        ></a-box>
        
        {/* NHẪN 3D - Sử dụng A-Frame's gltf-model trực tiếp */}
        <a-entity
          id="ring-entity"
          vr-selectable
          gltf-model="/models/nhanAnhKhanhLam.glb"
          // VỊ TRÍ NHẪN CHO VR META QUEST 3:
          // - Y = 1.6: Đặt ở độ cao tầm mắt người dùng VR (eye level)
          //   (Camera ở Y=2.0, mắt thường thấp hơn ~40cm)
          // - Z = -1: Đặt cách mắt 1 mét về phía trước (negative Z là hướng nhìn)
          // - X = 0: Căn giữa theo chiều ngang
          position="0 1.6 -1"
          // Scale cho nhẫn - bắt đầu với scale nhỏ
          scale="0.01 0.01 0.01"
          // Rotation để nhẫn quay đúng hướng
          rotation="0 0 0"
          // Thêm class interactive để có thể tương tác với controllers
          class="interactive"
        >
        </a-entity>
        
        {/* Phương án 2: Load bằng custom component (backup) */}
        {ringModel && (
          <a-entity
            id="ring-entity-custom"
            vr-selectable
            ring-model-loader
            position="0 1.6 -2"
            scale="0.01 0.01 0.01"
            rotation="0 0 0"
            class="interactive"
          >
          </a-entity>
        )}
        
        {/* VR Controllers cho Quest 3 */}
        <a-entity
          id="rightController" 
          oculus-touch-controls="hand: right"
          laser-controls
          raycaster="objects: .interactive">
        </a-entity>
        <a-entity
          id="leftController" 
          oculus-touch-controls="hand: left"
          laser-controls
          raycaster="objects: .interactive">
        </a-entity>

      </a-scene>
    </div>
  );
};

export default MyPlayground;