import React, { useEffect, useRef } from 'react';
import './MyPlayground.css';

const MyPlayground = () => {
  const sceneRef = useRef(null);

  useEffect(() => {

    // Touch Plus Controller component cho VR với tất cả buttons
    if (window.AFRAME && !window.AFRAME.components['touch-plus-controller']) {
      window.AFRAME.registerComponent('touch-plus-controller', {
        init: function() {
          this.isGrabbing = false;
          this.grabbedEntity = null;
          this.initialDistance = null;
          
          // Bind all button events cho Touch Plus
          this.onTriggerDown = this.onTriggerDown.bind(this);
          this.onTriggerUp = this.onTriggerUp.bind(this);
          this.onGripDown = this.onGripDown.bind(this);
          this.onGripUp = this.onGripUp.bind(this);
          this.onAButtonDown = this.onAButtonDown.bind(this);
          this.onBButtonDown = this.onBButtonDown.bind(this);
          this.onXButtonDown = this.onXButtonDown.bind(this);
          this.onYButtonDown = this.onYButtonDown.bind(this);
          this.onMetaButtonDown = this.onMetaButtonDown.bind(this);
          this.onMenuButtonDown = this.onMenuButtonDown.bind(this);
          this.onThumbstickDown = this.onThumbstickDown.bind(this);
          this.onThumbstickChanged = this.onThumbstickChanged.bind(this);
          
          // Listen for all Touch Plus controller events
          this.el.addEventListener('triggerdown', this.onTriggerDown);
          this.el.addEventListener('triggerup', this.onTriggerUp);
          this.el.addEventListener('gripdown', this.onGripDown);           // Nút bên hông
          this.el.addEventListener('gripup', this.onGripUp);
          this.el.addEventListener('abuttondown', this.onAButtonDown);     // A button (tay phải)
          this.el.addEventListener('bbuttondown', this.onBButtonDown);     // B button (tay phải)
          this.el.addEventListener('xbuttondown', this.onXButtonDown);     // X button (tay trái)
          this.el.addEventListener('ybuttondown', this.onYButtonDown);     // Y button (tay trái)
          this.el.addEventListener('surfacedown', this.onMetaButtonDown);  // Meta logo button
          this.el.addEventListener('menudown', this.onMenuButtonDown);     // Menu/hamburger button (tay trái)
          this.el.addEventListener('thumbstickdown', this.onThumbstickDown);  // Thumbstick click
          this.el.addEventListener('thumbstickmoved', this.onThumbstickChanged); // Thumbstick move
          
          console.log(`👆 Touch Plus Controller initialized: ${this.el.id}`);
        },
        
        getIntersectedEntity: function() {
          const raycaster = this.el.components.raycaster;
          return raycaster && raycaster.intersectedEls[0];
        },
        
        onTriggerDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            console.log(`👆 ${hand} Touch Plus TRIGGER on:`, intersectedEl.id);
            
            // Nếu chưa grab entity nào thì start grab
            if (!this.isGrabbing) {
              this.startGrab(intersectedEl);
            }
          } else {
            console.log(`👆 ${hand} Touch Plus TRIGGER (no target)`);
          }
        },
        
        onTriggerUp: function(evt) {
          if (this.isGrabbing && this.grabbedEntity) {
            this.endGrab();
          }
        },
        
        // === GRIP BUTTON (NÚT BÊN HÔNG) ===
        onGripDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            console.log(`✊ ${hand} GRIP: Force grab ${intersectedEl.id}`);
            
            if (intersectedEl.id === 'test-box') {
              // Box: Scale up dramatically khi grip
              const currentScale = intersectedEl.getAttribute('scale');
              intersectedEl.setAttribute('scale', {
                x: currentScale.x * 2,
                y: currentScale.y * 2,
                z: currentScale.z * 2
              });
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Spin nhanh khi grip
              intersectedEl.setAttribute('animation__spin', {
                property: 'rotation',
                to: '0 720 0',
                dur: 2000,
                loop: true,
                easing: 'linear'
              });
            }
          } else {
            console.log(`✊ ${hand} GRIP pressed (no target)`);
          }
        },
        
        onGripUp: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          console.log(`✋ ${hand} GRIP released`);
          
          if (intersectedEl) {
            if (intersectedEl.id === 'ring-entity') {
              // Stop spinning
              intersectedEl.removeAttribute('animation__spin');
            }
          }
        },
        
        // === A BUTTON (TAY PHẢI) ===
        onAButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          console.log('🅰️ A Button: Reset/Restore');
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            if (intersectedEl.id === 'test-box') {
              // Box: Reset position và scale
              intersectedEl.setAttribute('position', '0 1.6 -3');
              intersectedEl.setAttribute('scale', '0.5 0.5 0.5');
              intersectedEl.setAttribute('rotation', '0 45 0');
              intersectedEl.setAttribute('color', '#FF0000');
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Reset position và rotation
              intersectedEl.setAttribute('position', '0 1.6 -1');
              intersectedEl.setAttribute('scale', '0.01 0.01 0.01');
              intersectedEl.setAttribute('rotation', '0 0 0');
              intersectedEl.removeAttribute('animation__spin');
            }
            
            // Flash effect
            intersectedEl.setAttribute('animation__flash', {
              property: 'material.emissiveIntensity',
              from: 1.0,
              to: 0,
              dur: 500,
              easing: 'easeOutQuad'
            });
          }
        },
        
        // === B BUTTON (TAY PHẢI) ===
        onBButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          console.log('🅱️ B Button: Color/Material change');
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            if (intersectedEl.id === 'test-box') {
              // Box: Random color
              const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ffa500'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              intersectedEl.setAttribute('color', randomColor);
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Toggle wireframe
              const currentMaterial = intersectedEl.getAttribute('material') || {};
              intersectedEl.setAttribute('material', {
                ...currentMaterial,
                wireframe: !currentMaterial.wireframe
              });
            }
          }
        },
        
        // === X BUTTON (TAY TRÁI) ===
        onXButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          console.log('❌ X Button: Scale up/Duplicate');
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            if (intersectedEl.id === 'test-box') {
              // Box: Scale up
              const currentScale = intersectedEl.getAttribute('scale');
              intersectedEl.setAttribute('scale', {
                x: Math.min(currentScale.x * 1.3, 3),  // Max scale 3
                y: Math.min(currentScale.y * 1.3, 3),
                z: Math.min(currentScale.z * 1.3, 3)
              });
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Scale up
              const currentScale = intersectedEl.getAttribute('scale');
              intersectedEl.setAttribute('scale', {
                x: Math.min(currentScale.x * 1.5, 0.1),  // Max 0.1 cho ring
                y: Math.min(currentScale.y * 1.5, 0.1),
                z: Math.min(currentScale.z * 1.5, 0.1)
              });
            }
          }
        },
        
        // === Y BUTTON (TAY TRÁI) ===
        onYButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          console.log('🇾 Y Button: Scale down/Delete');
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            if (intersectedEl.id === 'test-box') {
              // Box: Scale down
              const currentScale = intersectedEl.getAttribute('scale');
              intersectedEl.setAttribute('scale', {
                x: Math.max(currentScale.x * 0.7, 0.1),  // Min scale 0.1
                y: Math.max(currentScale.y * 0.7, 0.1),
                z: Math.max(currentScale.z * 0.7, 0.1)
              });
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Scale down
              const currentScale = intersectedEl.getAttribute('scale');
              intersectedEl.setAttribute('scale', {
                x: Math.max(currentScale.x * 0.5, 0.001), // Min 0.001 cho ring
                y: Math.max(currentScale.y * 0.5, 0.001),
                z: Math.max(currentScale.z * 0.5, 0.001)
              });
            }
          }
        },
        
        // === META LOGO BUTTON ===
        onMetaButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          console.log(`🔘 ${hand} META BUTTON: Special action`);
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            if (intersectedEl.id === 'test-box') {
              // Box: Teleport to random position
              const randomX = (Math.random() - 0.5) * 10;
              const randomZ = (Math.random() - 0.5) * 10;
              const randomY = Math.random() * 3 + 1;
              
              intersectedEl.setAttribute('animation__teleport', {
                property: 'position',
                to: `${randomX} ${randomY} ${randomZ}`,
                dur: 1000,
                easing: 'easeInOutQuad'
              });
            } else if (intersectedEl.id === 'ring-entity') {
              // Ring: Orbit around center
              intersectedEl.setAttribute('animation__orbit', {
                property: 'rotation',
                to: '0 360 0',
                dur: 3000,
                loop: true,
                easing: 'linear'
              });
            }
          }
        },
        
        // === MENU/HAMBURGER BUTTON (TAY TRÁI) ===
        onMenuButtonDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          console.log('☰ MENU BUTTON: Toggle visibility/info');
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            // Toggle visibility
            const isVisible = intersectedEl.getAttribute('visible') !== false;
            intersectedEl.setAttribute('visible', !isVisible);
            
            // Log entity info
            const position = intersectedEl.getAttribute('position');
            const rotation = intersectedEl.getAttribute('rotation');
            const scale = intersectedEl.getAttribute('scale');
            
            console.log(`📊 Entity ${intersectedEl.id} info:`, {
              position, rotation, scale, visible: !isVisible
            });
          }
        },
        
        // === THUMBSTICK CLICK ===
        onThumbstickDown: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          console.log(`🕹️ ${hand} THUMBSTICK CLICK: Select/Deselect`);
          
          if (intersectedEl && intersectedEl.classList.contains('interactive')) {
            // Toggle selection
            intersectedEl.emit('click');
          }
        },
        
        // === THUMBSTICK MOVEMENT ===
        onThumbstickChanged: function(evt) {
          const intersectedEl = this.getIntersectedEntity();
          const hand = this.el.id === 'rightTouchPlus' ? 'RIGHT' : 'LEFT';
          const x = evt.detail.x; // -1 to 1
          const y = evt.detail.y; // -1 to 1
          
          // Only process significant movements
          if (Math.abs(x) > 0.2 || Math.abs(y) > 0.2) {
            if (intersectedEl && intersectedEl.classList.contains('interactive')) {
              const position = intersectedEl.getAttribute('position');
              const moveSpeed = 0.05;
              
              // Move entity based on thumbstick
              intersectedEl.setAttribute('position', {
                x: position.x + (x * moveSpeed),
                y: position.y,
                z: position.z + (y * moveSpeed) // Forward/backward
              });
              
              console.log(`🕹️ ${hand} THUMBSTICK: Moving ${intersectedEl.id} x=${x.toFixed(2)}, y=${y.toFixed(2)}`);
            }
          }
        },
        
        startGrab: function(entity) {
          console.log('✊ Touch Plus grab started on:', entity.id);
          this.isGrabbing = true;
          this.grabbedEntity = entity;
          
          // Visual feedback
          const tagName = entity.tagName.toLowerCase();
          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            entity.setAttribute('material', 'emissive', '#ff0000');
            entity.setAttribute('material', 'emissiveIntensity', 0.8);
          }
          
          // Store initial distance for movement
          const controllerPos = this.el.getAttribute('position');
          const entityPos = entity.getAttribute('position');
          this.initialDistance = {
            x: entityPos.x - controllerPos.x,
            y: entityPos.y - controllerPos.y,
            z: entityPos.z - controllerPos.z
          };
        },
        
        endGrab: function() {
          if (this.grabbedEntity) {
            console.log('✋ Touch Plus grab ended on:', this.grabbedEntity.id);
            
            // Reset visual
            const tagName = this.grabbedEntity.tagName.toLowerCase();
            if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
              this.grabbedEntity.setAttribute('material', 'emissive', '#000000');
              this.grabbedEntity.setAttribute('material', 'emissiveIntensity', 0);
            }
            
            this.grabbedEntity = null;
          }
          this.isGrabbing = false;
          this.initialDistance = null;
        },
        
        tick: function() {
          // Move grabbed entity to follow controller
          if (this.isGrabbing && this.grabbedEntity && this.initialDistance) {
            const controllerPos = this.el.getAttribute('position');
            
            this.grabbedEntity.setAttribute('position', {
              x: controllerPos.x + this.initialDistance.x,
              y: controllerPos.y + this.initialDistance.y,
              z: controllerPos.z + this.initialDistance.z
            });
          }
        }
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
          
          // === VR INTERACTIONS - Touch Plus Only ===
          // VR hover với Touch Plus controllers
          this.el.addEventListener('raycaster-intersected', (evt) => {
            const controller = evt.detail.el;
            console.log('🎯 Raycaster intersected:', this.el.id, 'by:', controller.id);
            
            // Chỉ xử lý cho Touch Plus controllers
            if (controller.id === 'rightTouchPlus' || controller.id === 'leftTouchPlus') {
              this.highlight();
              
              // Hiển thị tooltip hover
              const existingTooltip = this.el.querySelector(`#tooltip-${this.el.id}`);
              if (!existingTooltip) {
                const tooltipEl = document.createElement('a-text');
                tooltipEl.setAttribute('id', `tooltip-${this.el.id}`);
                tooltipEl.setAttribute('value', this.el.id || 'Object');
                tooltipEl.setAttribute('align', 'center');
                tooltipEl.setAttribute('color', '#ffffff');
                tooltipEl.setAttribute('scale', '0.5 0.5 0.5');
                tooltipEl.setAttribute('position', '0 0.6 0');
                tooltipEl.setAttribute('look-at', '[camera]');
                this.el.appendChild(tooltipEl);
              }
              
              console.log('✨ Touch Plus Hover on:', this.el.id);
            }
          });
          
          // Khi không hover nữa
          this.el.addEventListener('raycaster-intersected-cleared', (evt) => {
            if (!this.isSelected && !this.isGrabbed) {
              this.unhighlight();
              
              // Xóa tooltip
              const tooltip = this.el.querySelector(`#tooltip-${this.el.id}`);
              if (tooltip) {
                tooltip.remove();
              }
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
          // Hiệu ứng highlight khác nhau cho từng loại object
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();
          
          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            // Cho primitive shapes của A-Frame
            this.el.setAttribute('material', 'emissive', '#00ff00');
            this.el.setAttribute('material', 'emissiveIntensity', 0.4);
            
            // Animation scale khi hover
            const currentScale = this.el.getAttribute('scale');
            this.el.setAttribute('animation__scaleup', {
              property: 'scale',
              to: `${currentScale.x * 1.1} ${currentScale.y * 1.1} ${currentScale.z * 1.1}`,
              dur: 200,
              easing: 'easeOutElastic'
            });
          } else if (mesh) {
            // Cho GLB models như nhẫn
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x00ff00);
                child.material.emissiveIntensity = 0.4;
                child.material.needsUpdate = true;
              }
            });
            
            // Animation scale cho model
            const currentScale = this.el.getAttribute('scale');
            this.el.setAttribute('animation__scaleup', {
              property: 'scale',
              to: `${currentScale.x * 1.2} ${currentScale.y * 1.2} ${currentScale.z * 1.2}`,
              dur: 200,
              easing: 'easeOutElastic'
            });
          }
        },
        
        unhighlight: function() {
          // Xóa hiệu ứng highlight
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();
          
          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            // Reset primitive shapes
            this.el.setAttribute('material', 'emissive', '#000000');
            this.el.setAttribute('material', 'emissiveIntensity', 0);
            
            // Animation scale về ban đầu
            const originalScale = this.originalScale || {x: 1, y: 1, z: 1};
            this.el.setAttribute('animation__scaledown', {
              property: 'scale',
              to: `${originalScale.x} ${originalScale.y} ${originalScale.z}`,
              dur: 200,
              easing: 'easeOutQuad'
            });
          } else if (mesh) {
            // Reset GLB models
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
                child.material.needsUpdate = true;
              }
            });
            
            // Animation scale về ban đầu cho model
            const originalScale = this.originalScale || {x: 0.01, y: 0.01, z: 0.01};
            this.el.setAttribute('animation__scaledown', {
              property: 'scale',
              to: `${originalScale.x} ${originalScale.y} ${originalScale.z}`,
              dur: 200,
              easing: 'easeOutQuad'
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
        
        
        {/* Touch Plus Controllers cho VR */}
        <a-entity
          id="rightTouchPlus" 
          touch-plus-controls="hand: right"
          laser-controls="hand: right"
          touch-plus-controller
          raycaster="objects: .interactive; showLine: true; lineColor: #00ff88; lineOpacity: 0.9; far: 20"
        >
          {/* Laser pointer cho Touch Plus */}
          <a-entity
            line="start: 0 0 0; end: 0 0 -3; color: #00ff88; opacity: 0.8"
          ></a-entity>
          
          {/* Touch indicator */}
          <a-sphere 
            radius="0.015" 
            color="#00ff88"
            position="0 0 -0.03"
            material="emissive: #00ff88; emissiveIntensity: 0.5"
          ></a-sphere>
        </a-entity>
        
        <a-entity
          id="leftTouchPlus" 
          touch-plus-controls="hand: left"
          laser-controls="hand: left"
          touch-plus-controller
          raycaster="objects: .interactive; showLine: true; lineColor: #ff8800; lineOpacity: 0.9; far: 20"
        >
          {/* Laser pointer cho Touch Plus */}
          <a-entity
            line="start: 0 0 0; end: 0 0 -3; color: #ff8800; opacity: 0.8"
          ></a-entity>
          
          {/* Touch indicator */}
          <a-sphere 
            radius="0.015" 
            color="#ff8800"
            position="0 0 -0.03"
            material="emissive: #ff8800; emissiveIntensity: 0.5"
          ></a-sphere>
        </a-entity>

      </a-scene>
    </div>
  );
};

export default MyPlayground;