import React, { useEffect, useRef } from 'react';
import './MyPlayground.css';

// Import VR interaction components will be loaded in useEffect

const MyPlayground = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    
    // Import VR components after A-Frame is ready
    const loadVRComponents = async () => {
      try {
        await import('../../utils/meta-touch-controls.js');
        await import('../../utils/grabbable.js'); 
        await import('../../utils/tracked-controls/components/grab.js');
        console.log('✅ VR interaction components loaded');
      } catch (error) {
        console.error('❌ Failed to load VR components:', error);
      }
    };
    
    loadVRComponents();
    
    // VR Debug function
    let debugLines = ['🌐 Vercel HTTPS deployment', '🔍 Initializing...'];
    window.vrDebug = function(message) {
      console.log(message); // Still log to console
      
      // Add to VR display
      debugLines.push(message);
      if (debugLines.length > 5) {
        debugLines.shift(); // Keep only last 5 messages
      }
      
      // Update VR debug panel immediately if elements exist
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          const debugEl = document.querySelector(`#debug-line-${i + 1}`);
          if (debugEl) {
            const text = debugLines[i] || '';
            debugEl.setAttribute('value', text);
            
            // Color based on message type
            if (text.includes('✅')) {
              debugEl.setAttribute('color', '#00ff00');
            } else if (text.includes('❌')) {
              debugEl.setAttribute('color', '#ff0000');
            } else if (text.includes('🎯')) {
              debugEl.setAttribute('color', '#ffff00');
            } else {
              debugEl.setAttribute('color', '#ffffff');
            }
          }
        }
      }, 100);
    };
    
    // Initial debug message
    setTimeout(() => {
      window.vrDebug('🎮 VR System loading...');
      window.vrDebug(`🌍 URL: ${window.location.hostname}`);
    }, 500);
    
    // Wait for A-Frame to initialize first
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.AFRAME) {
        window.vrDebug('🚀 VR Debug System Active');
        
        // Check VR capabilities
        if (navigator.xr) {
          window.vrDebug('✅ WebXR supported');
          navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            window.vrDebug(supported ? '✅ VR session supported' : '❌ VR session not supported');
          });
        } else {
          window.vrDebug('❌ WebXR not supported');
        }
        
        // Check if in VR mode
        const scene = document.querySelector('a-scene');
        if (scene) {
          scene.addEventListener('enter-vr', () => {
            window.vrDebug('🥽 Entered VR mode');
          });
          
          scene.addEventListener('exit-vr', () => {
            window.vrDebug('🚪 Exited VR mode');
          });
        }
        
        // Check HTTPS
        if (location.protocol === 'https:') {
          window.vrDebug('🔒 HTTPS active');
        } else {
          window.vrDebug('⚠️ Need HTTPS for VR');
        }
      }
    }, 1000);

    // VR Controller - ONLY trigger selection
    if (window.AFRAME && !window.AFRAME.components['touch-plus-controller']) {
      window.AFRAME.registerComponent('touch-plus-controller', {
        init: function() {
          // Bind trigger events
          this.onTriggerDown = this.onTriggerDown.bind(this);
          this.el.addEventListener('triggerdown', this.onTriggerDown);
        },
        
        onTriggerDown: function() {
          const raycaster = this.el.components.raycaster;
          
          window.vrDebug(`🔫 TRIGGER: ${this.el.id}`);
          
          if (raycaster && raycaster.intersectedEls && raycaster.intersectedEls.length > 0) {
            const intersectedEl = raycaster.intersectedEls[0];
            window.vrDebug(`🎯 Hit: ${intersectedEl.id}`);
            
            // Check if object has interactive classes
            if (intersectedEl.classList.contains('interactive') || intersectedEl.classList.contains('grabbable')) {
              window.vrDebug(`✅ Clicking: ${intersectedEl.id}`);
              // Emit click event to entity
              intersectedEl.emit('click');
            } else {
              window.vrDebug(`❌ No interactive class: ${intersectedEl.id}`);
            }
          } else {
            window.vrDebug('❌ No objects hit');
          }
        },
        
      });
    }

    // Component để chọn và tương tác với entity - Desktop + Touch Plus
    if (window.AFRAME && !window.AFRAME.components['vr-selectable']) {
      window.AFRAME.registerComponent('vr-selectable', {
        init: function() {
          this.el.classList.add('interactive');
          this.originalColor = null;
          this.isSelected = false;
          
          // Lưu scale ban đầu
          this.originalScale = this.el.getAttribute('scale') || {x: 1, y: 1, z: 1};
          
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
          
          // === VR SELECTION ONLY - No hover effects ===
          
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
          
          // Click để chọn (từ VR trigger hoặc Desktop mouse)
          this.el.addEventListener('click', (evt) => {
            window.vrDebug(`🖱️ CLICK: ${this.el.id}`);
            
            // Prevent click khi đang drag
            if (this.isDragging) {
              evt.stopPropagation();
              return;
            }
            
            window.vrDebug(`🎯 Selecting: ${this.el.id}`);
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
          // Simple highlight without scaling
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();
          
          // Store original color for restoration
          if (!this.originalColor) {
            if (tagName === 'a-box') {
              this.originalColor = this.el.getAttribute('color') || '#FF0000';
            }
          }
          
          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            // Primitive shapes - change main color dramatically
            this.el.setAttribute('color', '#00FFFF'); // Bright cyan
            this.el.setAttribute('material', 'emissive', '#00ff00');
            this.el.setAttribute('material', 'emissiveIntensity', 0.5);
          } else if (mesh) {
            // GLB models như nhẫn
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x00ffff); // Cyan emissive
                child.material.emissiveIntensity = 0.5;
                child.material.needsUpdate = true;
              }
            });
          }
        },
        
        unhighlight: function() {
          // Reset về trạng thái ban đầu
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();
          
          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            // Reset color về ban đầu
            if (this.originalColor) {
              this.el.setAttribute('color', this.originalColor);
            }
            
            // Reset emissive
            this.el.setAttribute('material', 'emissive', '#000000');
            this.el.setAttribute('material', 'emissiveIntensity', 0);
          } else if (mesh) {
            // Reset GLB models
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
                child.material.needsUpdate = true;
              }
            });
          }
        },
        
        toggleSelection: function() {
          this.isSelected = !this.isSelected;
          const tagName = this.el.tagName.toLowerCase();
          
          if (this.isSelected) {
            // Đổi màu test-box thành vàng khi select
            if (this.el.id === 'test-box' && tagName === 'a-box') {
              this.el.setAttribute('color', '#FFFF00'); // Màu vàng
              this.el.setAttribute('material', 'emissive', '#FFFF00');
              this.el.setAttribute('material', 'emissiveIntensity', 0.3);
            } else {
              // Các entity khác (như ring) - dùng outline xanh lá
              const mesh = this.el.getObject3D('mesh');
              if (mesh) {
                mesh.traverse(child => {
                  if (child.material) {
                    child.material.emissive = new window.THREE.Color(0x00FF00);
                    child.material.emissiveIntensity = 0.5;
                  }
                });
              }
            }
          } else {
            // Reset test-box về màu đỏ
            if (this.el.id === 'test-box' && tagName === 'a-box') {
              this.el.setAttribute('color', '#FF0000'); // Màu đỏ ban đầu
              this.el.setAttribute('material', 'emissive', '#000000');
              this.el.setAttribute('material', 'emissiveIntensity', 0);
            } else {
              // Reset các entity khác
              this.unhighlight();
            }
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
          hide-on-enter-vr
          geometry="primitive: sphere; radius: 500"
          material="color: #ffffff; wireframe: true; transparent: true; opacity: 0.1; side: back">
        </a-entity>

        {/* Ground base - nền đen */}
        <a-entity
          hide-on-enter-ar
          hide-on-enter-vr
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
                hide-on-enter-vr
                position={`${pos} 0.01 0`}
                geometry="primitive: plane; width: 0.1; height: 100;"
                rotation="-90 0 0"
                material="color: #ffffff; transparent: true; opacity: 0.8;">
              </a-entity>
              {/* Đường ngang */}
              <a-entity
                hide-on-enter-ar
                hide-on-enter-vr
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

        {/* Test Box - có thể grab và manipulate */}
        <a-box
          id="test-box"
          vr-selectable
          grabbable
          position="0 1.6 -3"
          rotation="0 45 0"
          color="#FF0000"
          scale="0.5 0.5 0.5"
          class="interactive grabbable"
        ></a-box>
        
        {/* NHẪN 3D - Có thể grab và manipulate */}
        <a-entity
          id="ring-entity"
          vr-selectable
          grabbable
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
          // Thêm collision box để raycaster detect được tốt hơn
          geometry="primitive: box; width: 2; height: 2; depth: 2"
          material="opacity: 0; transparent: true"
          // Thêm class interactive và grabbable để có thể tương tác với controllers
          class="interactive grabbable"
        >
        </a-entity>
        
        {/* Additional grabbable objects for testing */}
        <a-sphere
          id="test-sphere"
          grabbable
          position="2 1.6 -2"
          color="#00FF00"
          radius="0.3"
          class="grabbable"
        ></a-sphere>
        
        <a-cylinder
          id="test-cylinder"
          grabbable
          position="-2 1.6 -2"
          color="#0000FF" 
          height="0.6"
          radius="0.2"
          class="grabbable"
        ></a-cylinder>
        
        {/* VR Controllers with grab functionality */}
        <a-entity
          id="rightController" 
          meta-touch-controls="hand: right; model: true"
          grab
          laser-controls="hand: right"
          touch-plus-controller
          raycaster="objects: .interactive,.grabbable; showLine: true; lineColor: #00ff00; lineOpacity: 1.0; far: 50; lineHeight: 0.005"
        >
          {/* Visual indicator for right hand */}
          <a-text
            value="R"
            position="0 0.1 0"
            align="center"
            color="#00ff00"
            scale="0.3 0.3 0.3"
            look-at="[camera]"
          ></a-text>
        </a-entity>
        
        <a-entity
          id="leftController" 
          meta-touch-controls="hand: left; model: true"
          grab
          laser-controls="hand: left" 
          touch-plus-controller
          raycaster="objects: .interactive,.grabbable; showLine: true; lineColor: #ff0000; lineOpacity: 1.0; far: 50; lineHeight: 0.005"
        >
          {/* Visual indicator for left hand */}
          <a-text
            value="L"
            position="0 0.1 0"
            align="center"
            color="#ff0000"
            scale="0.3 0.3 0.3"
            look-at="[camera]"
          ></a-text>
        </a-entity>
        
        {/* VR Debug Display */}
        <a-entity
          id="vr-debug-panel"
          position="2 2 -2"
          rotation="0 -30 0"
        >
          {/* Background */}
          <a-plane
            width="4"
            height="3"
            color="#000000"
            opacity="0.8"
            material="transparent: true"
          ></a-plane>
          
          {/* Title */}
          <a-text
            value="🔧 VR DEBUG"
            position="0 1.2 0.01"
            align="center"
            color="#00ff00"
            scale="0.5 0.5 0.5"
          ></a-text>
          
          {/* Debug messages */}
          <a-text
            id="debug-line-1"
            value="🌐 Vercel HTTPS deployment"
            position="0 0.8 0.01"
            align="center"
            color="#00ff00"
            scale="0.3 0.3 0.3"
          ></a-text>
          
          <a-text
            id="debug-line-2"
            value="🔍 Initializing..."
            position="0 0.5 0.01"
            align="center"
            color="#ffff00"
            scale="0.3 0.3 0.3"
          ></a-text>
          
          <a-text
            id="debug-line-3"
            value=""
            position="0 0.2 0.01"
            align="center"
            color="#ffffff"
            scale="0.3 0.3 0.3"
          ></a-text>
          
          <a-text
            id="debug-line-4"
            value=""
            position="0 -0.1 0.01"
            align="center"
            color="#ffffff"
            scale="0.3 0.3 0.3"
          ></a-text>
          
          <a-text
            id="debug-line-5"
            value=""
            position="0 -0.4 0.01"
            align="center"
            color="#ffffff"
            scale="0.3 0.3 0.3"
          ></a-text>
        </a-entity>

      </a-scene>
    </div>
  );
};

export default MyPlayground;