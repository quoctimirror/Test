import React, { useEffect, useRef } from 'react';
import './MyPlayground2.css';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ringEnhancer } from '../../utils/ringEnhancer.js';
import { glbAnalyzer } from '../../utils/glbAnalyzer.js';

const MyPlayground2 = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Import VR components after A-Frame is ready
    const loadVRComponents = async () => {
      try {
        await import('../../utils/meta-touch-controls.js');
        await import('../../utils/grabbable.js'); 
        await import('../../utils/tracked-controls/components/grab.js');
        await import('../../utils/thumbstick-rotation.js');
        console.log('✅ VR interaction components loaded');
      } catch (error) {
        console.error('❌ Failed to load VR components:', error);
      }
    };
    
    loadVRComponents();
    
    // Check WebXR support and force VR button
    setTimeout(() => {
      if (navigator.xr) {
        console.log('✅ WebXR supported');
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          console.log(supported ? '✅ VR session supported' : '❌ VR session not supported');
          
          // Force show VR button even if detection fails
          const vrButton = document.querySelector('.a-enter-vr-button');
          if (vrButton) {
            vrButton.style.display = 'block';
            console.log('🥽 VR button found and shown');
          } else {
            console.log('❌ VR button not found');
            // Create custom VR button if A-Frame doesn't show one
            setTimeout(() => {
              if (!document.querySelector('.a-enter-vr-button')) {
                console.log('🔧 Creating custom VR button');
                createCustomVRButton();
              }
            }, 2000);
          }
        });
      } else {
        console.log('❌ WebXR not supported');
      }
      
      if (location.protocol !== 'https:') {
        console.log('⚠️ Need HTTPS for VR');
      }
    }, 1000);

    // Custom VR button creator
    function createCustomVRButton() {
      const vrButton = document.createElement('button');
      vrButton.innerHTML = '🥽 Enter VR';
      vrButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;
      
      vrButton.onclick = async () => {
        try {
          const scene = document.querySelector('a-scene');
          if (scene && scene.is && scene.is('vr-mode')) {
            scene.exitVR();
            vrButton.innerHTML = '🥽 Enter VR';
          } else if (scene) {
            await scene.enterVR();
            vrButton.innerHTML = '🚪 Exit VR';
          }
        } catch (error) {
          console.error('VR Error:', error);
          alert('VR not available: ' + error.message);
        }
      };
      
      document.body.appendChild(vrButton);
      console.log('✅ Custom VR button created');
    }

    // Register HDR environment component
    if (window.AFRAME && !window.AFRAME.components['hdr-environment']) {
      window.AFRAME.registerComponent('hdr-environment', {
        init: function() {
          const scene = this.el.sceneEl;
          
          // Load HDR environment using Three.js
          if (window.THREE) {
            const loader = new RGBELoader();
            // Load HDR cho cả desktop và VR nhưng với optimizations khác nhau
            const isQuest = navigator.userAgent.includes('Quest');
            
            loader.load('/rustig_koppie_puresky_4k.hdr', 
              (texture) => {
                texture.mapping = window.THREE.EquirectangularReflectionMapping;
                
                // VR optimizations - giảm quality nhưng vẫn giữ HDR
                if (isQuest) {
                  console.log('🥽 Quest detected - optimizing HDR for VR');
                  texture.minFilter = window.THREE.LinearFilter;
                  texture.magFilter = window.THREE.LinearFilter;
                  texture.generateMipmaps = false;
                  // Giảm intensity cho VR để tăng performance
                  texture.intensity = 0.6; 
                } else {
                  // Desktop - full quality
                  texture.generateMipmaps = true;
                  texture.intensity = 1.0;
                }
                
                // Set as scene environment
                scene.object3D.environment = texture;
                scene.object3D.background = texture;
                
                // Store environment texture for ring materials
                window.environmentTexture = texture;
                window.isVROptimized = isQuest;
                
                console.log('✅ HDR Environment loaded successfully' + (isQuest ? ' (VR optimized)' : ''));
              },
              (progress) => {
                console.log(`📦 Loading HDR: ${Math.round(progress.loaded / progress.total * 100)}%`);
              },
              (error) => {
                console.error('❌ Failed to load HDR environment:', error);
                // Fallback cho VR nếu HDR load fail
                if (isQuest) {
                  scene.object3D.background = new window.THREE.Color(0x87CEEB);
                  const pmremGenerator = new window.THREE.PMREMGenerator(scene.renderer);
                  const envTexture = pmremGenerator.fromScene(new window.THREE.Scene()).texture;
                  scene.object3D.environment = envTexture;
                  window.environmentTexture = envTexture;
                }
              }
            );
          }
        }
      });
    }

    // Enhanced VR Controller với thumbstick rotation utility
    if (window.AFRAME && !window.AFRAME.components['quest-controller']) {
      window.AFRAME.registerComponent('quest-controller', {
        init: function() {
          this.onTriggerDown = this.onTriggerDown.bind(this);
          this.onTriggerUp = this.onTriggerUp.bind(this);
          this.el.addEventListener('triggerdown', this.onTriggerDown);
          this.el.addEventListener('triggerup', this.onTriggerUp);
          
          // Grab functionality
          this.grabbedObject = null;
          this.grabOffset = new window.THREE.Vector3();
          
          // Thumbstick rotation functionality
          this.selectedObject = null;
          
          // Initialize thumbstick rotation utility
          console.log('🎮 quest-controller init for:', this.el.id);
          
          if (window.ThumbstickRotation) {
            console.log('✅ ThumbstickRotation available, configuring...');
            window.ThumbstickRotation.configure({
              rotationSpeed: 200,
              deadzone: 0.15,
              debugMode: true,
              smoothing: 0.1
            });
            
            // Wait for meta-touch-controls to fully initialize
            setTimeout(() => {
              console.log('⏰ Delayed init of ThumbstickRotation for:', this.el.id);
              window.ThumbstickRotation.init(this.el);
              
              // Add direct thumbstick rotation handler
              this.el.addEventListener('thumbstickmoved', (evt) => {
                const debugText = document.getElementById('debug-text');
                if (debugText) {
                  const msg = `🧪 thumbstick: X=${evt.detail.x.toFixed(2)} Y=${evt.detail.y.toFixed(2)}`;
                  const currentValue = debugText.getAttribute('value') || '';
                  const lines = currentValue.split('\n').slice(-8);
                  lines.push(msg);
                  debugText.setAttribute('value', lines.join('\n'));
                }
                
                // Simple direct rotation like the working HTML example
                this.rotateSelectedObject(evt.detail.x, evt.detail.y);
                
                // Also try direct rotation on ring if selected
                const ringEntity = document.getElementById('ring-entity');
                if (ringEntity && ringEntity.hasAttribute('data-selected')) {
                  this.directRotateRing(ringEntity, evt.detail.x, evt.detail.y);
                }
              });
              
              this.el.addEventListener('axismove', (evt) => {
                const debugText = document.getElementById('debug-text');
                if (debugText) {
                  const msg = `🧪 axis: ${this.el.id}`;
                  const currentValue = debugText.getAttribute('value') || '';
                  const lines = currentValue.split('\n').slice(-8);
                  lines.push(msg);
                  debugText.setAttribute('value', lines.join('\n'));
                }
              });
            }, 1000);
          } else {
            console.error('❌ ThumbstickRotation not available!');
          }
        },
        
        onTriggerDown: function() {
          const raycaster = this.el.components.raycaster;
          
          if (raycaster && raycaster.intersectedEls && raycaster.intersectedEls.length > 0) {
            const intersectedEl = raycaster.intersectedEls[0];
            
            if (intersectedEl.classList.contains('interactive') || intersectedEl.classList.contains('grabbable')) {
              
              // Primary function: GRAB and MOVE object
              if (!this.grabbedObject) {
                this.grabbedObject = intersectedEl;
                
                // Calculate grab offset for smooth movement
                const controllerPos = new window.THREE.Vector3();
                const objectPos = new window.THREE.Vector3();
                
                this.el.object3D.getWorldPosition(controllerPos);
                intersectedEl.object3D.getWorldPosition(objectPos);
                
                this.grabOffset.subVectors(objectPos, controllerPos);
                
                // Visual feedback for grabbed state
                const mesh = intersectedEl.getObject3D('mesh');
                if (mesh) {
                  mesh.traverse(child => {
                    if (child.material && child.material.emissiveIntensity !== undefined) {
                      child.material.originalEmissiveIntensity = child.material.emissiveIntensity;
                      child.material.emissiveIntensity = 0.4; // Grabbed glow
                      child.material.needsUpdate = true;
                    }
                  });
                } else {
                  // Fallback for simple materials
                  intersectedEl.setAttribute('material', 'emissive', '#ffff00');
                  intersectedEl.setAttribute('material', 'emissiveIntensity', 0.5);
                }
                
                console.log('🤏 Grabbed object:', intersectedEl.id);
                
                // Also set as rotation target for thumbstick
                if (window.ThumbstickRotation) {
                  window.ThumbstickRotation.setTarget(this.el.id, intersectedEl);
                  console.log('🎯 Object set as thumbstick rotation target');
                }
              }
            }
          }
        },
        
        onTriggerUp: function() {
          if (this.grabbedObject) {
            console.log('✋ Releasing object:', this.grabbedObject.id);
            
            // Reset visual feedback
            const mesh = this.grabbedObject.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material && child.material.originalEmissiveIntensity !== undefined) {
                  child.material.emissiveIntensity = child.material.originalEmissiveIntensity;
                  child.material.needsUpdate = true;
                }
              });
            } else {
              // Fallback reset
              this.grabbedObject.setAttribute('material', 'emissive', '#000000');
              this.grabbedObject.setAttribute('material', 'emissiveIntensity', 0);
            }
            
            // Clear rotation target
            if (window.ThumbstickRotation) {
              window.ThumbstickRotation.clearTarget(this.el.id);
              console.log('🎯 Object cleared as rotation target');
            }
            
            this.grabbedObject = null;
          }
        },
        
        tick: function(/* time, timeDelta */) {
          // Handle grabbed object movement
          if (this.grabbedObject) {
            const controllerPos = new window.THREE.Vector3();
            this.el.object3D.getWorldPosition(controllerPos);
            
            const newPos = controllerPos.add(this.grabOffset);
            
            this.grabbedObject.setAttribute('position', {
              x: newPos.x,
              y: newPos.y,
              z: newPos.z
            });
          }
          
          // Thumbstick rotation is handled automatically by ThumbstickRotation utility
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
          
          // Get the controller that triggered this (from both controllers)
          const rightController = document.getElementById('rightController')?.components?.['quest-controller'];
          const leftController = document.getElementById('leftController')?.components?.['quest-controller'];
          
          if (this.isSelected) {
            // Set as selected object for both controllers
            if (rightController) rightController.selectedObject = this.el;
            if (leftController) leftController.selectedObject = this.el;
            // Đánh dấu selected state cho thumbstick rotation
            this.el.setAttribute('data-selected', 'true');
            this.el.classList.add('selected');
            
            // Ring - dùng outline xanh lá
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  child.material.emissive = new window.THREE.Color(0x00FF00);
                  child.material.emissiveIntensity = 0.5;
                }
              });
            }
            
            // Set as thumbstick rotation target for both controllers
            if (window.ThumbstickRotation) {
              // Ensure controllers are initialized first
              const rightController = document.getElementById('rightController');
              const leftController = document.getElementById('leftController');
              
              if (rightController) {
                // Force init if not already done
                if (!window.ThumbstickRotation.activeRotations.has('rightController')) {
                  window.ThumbstickRotation.init(rightController);
                }
                window.ThumbstickRotation.setTarget('rightController', this.el);
                
                const debugText = document.getElementById('debug-text');
                if (debugText) {
                  const msg = '✅ RIGHT Controller Ready';
                  const currentValue = debugText.getAttribute('value') || '';
                  const lines = currentValue.split('\n').slice(-8);
                  lines.push(msg);
                  debugText.setAttribute('value', lines.join('\n'));
                }
              }
              
              if (leftController) {
                // Force init if not already done
                if (!window.ThumbstickRotation.activeRotations.has('leftController')) {
                  window.ThumbstickRotation.init(leftController);
                }
                window.ThumbstickRotation.setTarget('leftController', this.el);
                
                const debugText = document.getElementById('debug-text');
                if (debugText) {
                  const msg = '✅ LEFT Controller Ready';
                  const currentValue = debugText.getAttribute('value') || '';
                  const lines = currentValue.split('\n').slice(-8);
                  lines.push(msg);
                  debugText.setAttribute('value', lines.join('\n'));
                }
              }
            } else {
              console.error('❌ ThumbstickRotation not available during target setting!');
            }
            
            // Update debug display
            const debugText = document.getElementById('debug-text');
            if (debugText) {
              const msg = '🎯 RING SELECTED - Thumbstick Ready';
              const currentValue = debugText.getAttribute('value') || '';
              const lines = currentValue.split('\n').slice(-8);
              lines.push(msg);
              debugText.setAttribute('value', lines.join('\n'));
            }
          } else {
            // Clear selected object for both controllers
            const rightController = document.getElementById('rightController')?.components?.['quest-controller'];
            const leftController = document.getElementById('leftController')?.components?.['quest-controller'];
            if (rightController) rightController.selectedObject = null;
            if (leftController) leftController.selectedObject = null;
            
            // Remove selected state
            this.el.removeAttribute('data-selected');
            this.el.classList.remove('selected');
            
            // Reset ring
            this.unhighlight();
            
            // Update debug display
            const debugText = document.getElementById('debug-text');
            if (debugText) {
              const msg = '🎯 RING DESELECTED';
              const currentValue = debugText.getAttribute('value') || '';
              const lines = currentValue.split('\n').slice(-8);
              lines.push(msg);
              debugText.setAttribute('value', lines.join('\n'));
            }
          }
        },
        
        directRotateRing: function(ringEntity, thumbstickX, thumbstickY) {
          // Skip if thumbstick barely moved
          if (Math.abs(thumbstickX) < 0.1 && Math.abs(thumbstickY) < 0.1) {
            return;
          }
          
          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🔄 DIRECT Ring Rotate: X=${thumbstickX.toFixed(2)} Y=${thumbstickY.toFixed(2)}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
          
          // Get current rotation
          const currentRotation = ringEntity.getAttribute('rotation');
          
          // Enhanced rotation with Z-axis support
          const rotationSpeed = 3.0;
          
          // X thumbstick = Y rotation (left/right turn)
          // Y thumbstick = X rotation (up/down tilt)  
          // For Z rotation, we can use both axes together
          const deltaY = thumbstickX * rotationSpeed;  // Yaw (left/right)
          const deltaX = -thumbstickY * rotationSpeed; // Pitch (up/down, inverted)
          
          // Z rotation: combine both axes for roll effect
          const deltaZ = (thumbstickX * thumbstickY) * rotationSpeed * 0.5; // Roll (diagonal movement)
          
          // Apply rotation
          ringEntity.setAttribute('rotation', {
            x: currentRotation.x + deltaX,
            y: currentRotation.y + deltaY,
            z: currentRotation.z + deltaZ
          });
          
          if (debugText) {
            const msg = `📐 Ring Rot: X=${(currentRotation.x + deltaX).toFixed(0)}° Y=${(currentRotation.y + deltaY).toFixed(0)}° Z=${(currentRotation.z + deltaZ).toFixed(0)}°`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
        },
        
        rotateSelectedObject: function(thumbstickX, thumbstickY) {
          // Skip if no object selected or thumbstick barely moved
          if (!this.selectedObject || (Math.abs(thumbstickX) < 0.1 && Math.abs(thumbstickY) < 0.1)) {
            return;
          }
          
          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🔄 Rotating: X=${thumbstickX.toFixed(2)} Y=${thumbstickY.toFixed(2)}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
          
          // Get current rotation
          const currentRotation = this.selectedObject.getAttribute('rotation');
          
          // Calculate rotation deltas (same as working HTML)
          const rotationSpeed = 3.0;
          const deltaY = thumbstickX * rotationSpeed;  // Left/right rotation
          const deltaX = -thumbstickY * rotationSpeed; // Up/down rotation (inverted)
          
          // Apply rotation directly
          this.selectedObject.setAttribute('rotation', {
            x: currentRotation.x + deltaX,
            y: currentRotation.y + deltaY,
            z: currentRotation.z
          });
          
          if (debugText) {
            const msg = `📐 New Rotation: Y=${(currentRotation.y + deltaY).toFixed(0)}°`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
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

    // VR Performance Optimizer Component
    if (window.AFRAME && !window.AFRAME.components['vr-performance']) {
      window.AFRAME.registerComponent('vr-performance', {
        init: function() {
          this.isVR = false;
          
          // Listen for VR mode changes
          this.el.sceneEl.addEventListener('enter-vr', () => {
            this.isVR = true;
            this.optimizeForVR();
          });
          
          this.el.sceneEl.addEventListener('exit-vr', () => {
            this.isVR = false;
            this.restoreQuality();
          });
        },
        
        optimizeForVR: function() {
          console.log('🚀 Optimizing for VR performance...');
          
          // Disable expensive renderer features
          const RENDERER = this.el.sceneEl.renderer;
          if (RENDERER) {
            RENDERER.setPixelRatio(0.8); // Quest optimized pixel ratio
            RENDERER.antialias = false;
            RENDERER.shadowMap.enabled = false;
            // Quest specific optimizations
            RENDERER.physicallyCorrectLights = false;
            RENDERER.outputEncoding = window.THREE.sRGBEncoding;
          }
          
          // Optimize scene settings for VR
          this.el.sceneEl.setAttribute('stats', 'false');
          this.el.sceneEl.setAttribute('vr-mode-ui', 'enabled: false');
          
          console.log('✅ VR optimizations applied');
        },
        
        restoreQuality: function() {
          console.log('📈 Restoring desktop quality...');
          
          const RENDERER = this.el.sceneEl.renderer;
          if (RENDERER) {
            RENDERER.setPixelRatio(window.devicePixelRatio);
            RENDERER.antialias = true;
            RENDERER.shadowMap.enabled = true;
          }
        }
      });
    }

    // Ring enhancer component
    if (window.AFRAME && !window.AFRAME.components['ring-enhancer']) {
      window.AFRAME.registerComponent('ring-enhancer', {
        init: function() {
          this.enhanced = false;
          
          // Listen for model load
          this.el.addEventListener('model-loaded', () => {
            if (!this.enhanced) {
              this.enhanceRing();
            }
          });
          
          // If model already loaded
          if (this.el.getObject3D('mesh')) {
            setTimeout(() => {
              if (!this.enhanced) {
                this.enhanceRing();
              }
            }, 100);
          }
        },
        
        enhanceRing: function() {
          const mesh = this.el.getObject3D('mesh');
          console.log('🔍 Checking mesh:', mesh);
          console.log('🌍 Environment texture:', window.environmentTexture);
          
          if (mesh) {
            // Analyze GLB structure first
            console.log('📊 Analyzing GLB structure...');
            const analysis = glbAnalyzer.analyzeGLB(mesh, 'nhanAnhKhanhLam.glb');
            
            // Store analysis globally for inspection
            window.ringAnalysis = analysis;
            
            console.log('💍 Enhancing ring with materials...');
            
            // Apply diamond and gold materials based on analysis
            ringEnhancer.applyRingMaterials(mesh, window.environmentTexture);
            this.enhanced = true;
            
            console.log('✨ Ring enhancement complete!');
            console.log('🔗 Access full analysis with: window.ringAnalysis');
          } else {
            console.log('❌ No mesh found yet, will retry...');
            // Retry after delay
            setTimeout(() => {
              const retryMesh = this.el.getObject3D('mesh');
              if (retryMesh && !this.enhanced) {
                console.log('🔄 Retrying enhancement...');
                this.enhanceRing();
              }
            }, 1000);
          }
        },
        
        tick: function(time) {
          // Tối ưu: chỉ update animation mỗi 100ms thay vì mọi frame
          if (!this.lastUpdate) this.lastUpdate = 0;
          
          if (time - this.lastUpdate > 100) { // 100ms = 10 FPS cho animation
            const camera = this.el.sceneEl.camera;
            const isVR = this.el.sceneEl.is('vr-mode');
            
            // Giảm animation effects trong VR để tăng performance
            if (camera && this.enhanced && (!isVR || time % 200 < 100)) {
              ringEnhancer.updateAnimation(camera, (time - this.lastUpdate) / 1000);
            }
            
            this.lastUpdate = time;
          }
        }
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="myplayground2-container">
      {/* Force VR Button - always visible */}
      <button 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
        onClick={async () => {
          try {
            const scene = document.querySelector('a-scene');
            console.log('🔄 Attempting to enter VR...');
            
            if (scene && scene.is && scene.is('vr-mode')) {
              console.log('🚪 Exiting VR...');
              scene.exitVR();
            } else if (scene) {
              console.log('🥽 Entering VR...');
              await scene.enterVR();
              console.log('✅ VR entered successfully');
            }
          } catch (error) {
            console.error('❌ VR Error:', error);
            console.log('Browser:', navigator.userAgent);
            console.log('WebXR available:', !!navigator.xr);
            alert('VR Error: ' + error.message);
          }
        }}
      >
        🥽 Enter VR
      </button>
      <a-scene
        ref={sceneRef}
        obb-collider="showColliders: false"
        renderer="colorManagement: true; sortTransparentObjects: false; antialias: false; powerPreference: high-performance; precision: lowp; logarithmicDepthBuffer: false"
        vr-mode-ui="enabled: true"
        webxr="referenceSpaceType: local-floor"
        vr-performance
        className="myplayground2-scene"
      >
        {/* HDR Environment - using custom HDR loader */}
        <a-entity 
          hdr-environment
        ></a-entity>

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

        {/* Debug Display Panel */}
        <a-entity
          id="debug-panel"
          geometry="primitive: plane; width: 2; height: 1.5"
          material="color: #000000; opacity: 0.8"
          position="-2 2 -2"
          rotation="0 30 0"
        >
          <a-text
            id="debug-text"
            value="DEBUG INFO:\n- Initializing...\n- Waiting for controllers..."
            color="#00ff00"
            position="0 0 0.01"
            align="center"
            width="4"
            font="monoid"
          ></a-text>
        </a-entity>

        {/* NHẪN 3D - Enhanced với kim cương lấp lánh và vàng bóng */}
        <a-entity
          id="ring-entity"
          vr-selectable
          grabbable
          ring-enhancer
          gltf-model="/models/nhanAnhKhanhLam.glb"
          position="0 1.6 -1"
          scale="0.01 0.01 0.01"
          rotation="0 0 0"
          class="interactive grabbable"
        >
        </a-entity>

        {/* VR Controllers with grab functionality */}
        <a-entity
          id="rightController" 
          tracked-controls="hand: right; idPrefix: meta-quest"
          meta-touch-controls="hand: right; model: true"
          laser-controls="hand: right"
          quest-controller
          thumbstick-rotation
          raycaster="objects: .interactive; showLine: false; far: 3; interval: 100"
        >
        </a-entity>
        
        <a-entity
          id="leftController" 
          tracked-controls="hand: left; idPrefix: meta-quest"
          meta-touch-controls="hand: left; model: true"
          laser-controls="hand: left" 
          quest-controller
          thumbstick-rotation
          raycaster="objects: .interactive; showLine: false; far: 3; interval: 100"
        >
        </a-entity>


      </a-scene>
    </div>
  );
};

export default MyPlayground2;