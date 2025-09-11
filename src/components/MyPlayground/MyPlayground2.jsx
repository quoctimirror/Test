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
          const renderer = scene.renderer;
          
          // Load HDR environment using Three.js
          if (window.THREE) {
            const loader = new RGBELoader();
            loader.load('/rustig_koppie_puresky_4k.hdr', 
              (texture) => {
                texture.mapping = window.THREE.EquirectangularReflectionMapping;
                
                // Set as scene environment
                scene.object3D.environment = texture;
                scene.object3D.background = texture;
                
                // Store environment texture for ring materials
                window.environmentTexture = texture;
                
                console.log('✅ HDR Environment loaded successfully');
              },
              (progress) => {
                console.log(`📦 Loading HDR: ${Math.round(progress.loaded / progress.total * 100)}%`);
              },
              (error) => {
                console.error('❌ Failed to load HDR environment:', error);
              }
            );
          }
        }
      });
    }

    // VR Controller - grab functionality
    if (window.AFRAME && !window.AFRAME.components['touch-plus-controller']) {
      window.AFRAME.registerComponent('touch-plus-controller', {
        init: function() {
          this.onTriggerDown = this.onTriggerDown.bind(this);
          this.onTriggerUp = this.onTriggerUp.bind(this);
          this.el.addEventListener('triggerdown', this.onTriggerDown);
          this.el.addEventListener('triggerup', this.onTriggerUp);
          
          this.grabbedObject = null;
          this.grabOffset = new window.THREE.Vector3();
        },
        
        onTriggerDown: function() {
          const raycaster = this.el.components.raycaster;
          
          if (raycaster && raycaster.intersectedEls && raycaster.intersectedEls.length > 0) {
            const intersectedEl = raycaster.intersectedEls[0];
            
            if (intersectedEl.classList.contains('grabbable') || intersectedEl.classList.contains('interactive')) {
              this.grabbedObject = intersectedEl;
              
              const controllerPos = new window.THREE.Vector3();
              const objectPos = new window.THREE.Vector3();
              
              this.el.object3D.getWorldPosition(controllerPos);
              intersectedEl.object3D.getWorldPosition(objectPos);
              
              this.grabOffset.subVectors(objectPos, controllerPos);
              
              intersectedEl.setAttribute('material', 'emissive', '#ffff00');
              intersectedEl.setAttribute('material', 'emissiveIntensity', 0.5);
            }
          }
        },
        
        onTriggerUp: function() {
          if (this.grabbedObject) {
            this.grabbedObject.setAttribute('material', 'emissive', '#000000');
            this.grabbedObject.setAttribute('material', 'emissiveIntensity', 0);
            
            this.grabbedObject = null;
          }
        },
        
        tick: function() {
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
          const tagName = this.el.tagName.toLowerCase();
          
          if (this.isSelected) {
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
          } else {
            // Reset ring
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
            const analysis = glbAnalyzer.analyzeGLB(mesh, 'ti2.glb');
            
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
        
        tick: function() {
          // Update animation cho kim cương lấp lánh
          const camera = this.el.sceneEl.camera;
          if (camera && this.enhanced) {
            ringEnhancer.updateAnimation(camera);
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
        renderer="colorManagement: true; sortTransparentObjects: true"
        vr-mode-ui="enabled: true"
        webxr="referenceSpaceType: local-floor"
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

        {/* NHẪN 3D - Enhanced với kim cương lấp lánh và vàng bóng */}
        <a-entity
          id="ring-entity"
          vr-selectable
          grabbable
          ring-enhancer
          gltf-model="/models/ti2.glb"
          position="0 1.6 -1"
          scale="0.01 0.01 0.01"
          rotation="180 0 0"
          geometry="primitive: box; width: 2; height: 2; depth: 2"
          material="opacity: 0; transparent: true"
          class="interactive grabbable"
        >
        </a-entity>

        {/* VR Controllers with grab functionality */}
        <a-entity
          id="rightController" 
          meta-touch-controls="hand: right; model: true"
          laser-controls="hand: right"
          touch-plus-controller
          raycaster="objects: .interactive,.grabbable; showLine: true; lineColor: #00ff00; lineOpacity: 1.0; far: 50; lineHeight: 0.005"
        >
          <a-text
            value="R"
            position="0 0.1 0"
            align="center"
            color="#00ff00"
            scale="0.3 0.3 0.3"
            look-at="[camera]"
          ></a-text>
          
          <a-sphere
            radius="0.02"
            color="#00ff00"
            position="0 0 -0.1"
          ></a-sphere>
        </a-entity>
        
        <a-entity
          id="leftController" 
          meta-touch-controls="hand: left; model: true"
          laser-controls="hand: left" 
          touch-plus-controller
          raycaster="objects: .interactive,.grabbable; showLine: true; lineColor: #ff0000; lineOpacity: 1.0; far: 50; lineHeight: 0.005"
        >
          <a-text
            value="L"
            position="0 0.1 0"
            align="center"
            color="#ff0000"
            scale="0.3 0.3 0.3"
            look-at="[camera]"
          ></a-text>
          
          <a-sphere
            radius="0.02"
            color="#ff0000"
            position="0 0 -0.1"
          ></a-sphere>
        </a-entity>


      </a-scene>
    </div>
  );
};

export default MyPlayground2;