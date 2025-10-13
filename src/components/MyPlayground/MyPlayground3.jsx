/* global THREE */
/* eslint-disable-next-line no-unused-vars */
/* global AFRAME */
import React, { useEffect, useRef } from 'react';
import './MyPlayground2.css';

const MyPlayground3 = () => {
  const sceneRef = useRef(null);
  const webgiViewerRef = useRef(null);

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

    // Use WebGI Viewer Element approach (like your working HTML)
    const initializeWebGIViewer = () => {
      console.log('🎨 Setting up WebGI Viewer Element...');

      // Create webgi-viewer element dynamically (same as your HTML)
      const webgiViewer = document.createElement('webgi-viewer');
      webgiViewer.id = 'viewer-3d-react';
      webgiViewer.src = '/models/nhanMirror.glb';
      webgiViewer.environment = 'https://releases.ijewel3d.com/webgi/assets/hdr/gem_2.hdr';
      webgiViewer.style.cssText = 'width: 100%; height: 100%; z-index: 10; display: block; position: absolute; top: 0; left: 0;';

      // Add to container
      const container = webgiViewerRef.current?.parentElement;
      if (container) {
        container.appendChild(webgiViewer);
        console.log('✅ WebGI Viewer element added to DOM');

        // Store reference
        window.webgiViewerElement = webgiViewer;

        // Hide the canvas we don't need
        if (webgiViewerRef.current) {
          webgiViewerRef.current.style.display = 'none';
        }
      } else {
        console.error('❌ Container not found for WebGI viewer');
      }
    };

    // Check if WebGI script is loaded by looking for custom elements
    const checkWebGILoaded = () => {
      // WebGI script defines the webgi-viewer custom element
      return customElements.get('webgi-viewer') !== undefined;
    };

    console.log('🔍 Checking WebGI custom element:', checkWebGILoaded());

    // Wait for WebGI to load (check for custom element instead of window.webgi)
    if (checkWebGILoaded()) {
      console.log('✅ WebGI custom element available');
      setTimeout(initializeWebGIViewer, 100); // Small delay
    } else {
      console.log('⏳ Waiting for WebGI custom element to load...');
      let attempts = 0;
      const checkWebGI = setInterval(() => {
        attempts++;
        console.log(`🔄 WebGI check attempt ${attempts}:`, checkWebGILoaded());

        if (checkWebGILoaded()) {
          clearInterval(checkWebGI);
          console.log('✅ WebGI loaded after', attempts, 'attempts');
          setTimeout(initializeWebGIViewer, 100); // Small delay
        } else if (attempts > 50) { // Stop after 5 seconds
          clearInterval(checkWebGI);
          console.error('❌ WebGI failed to load after 5 seconds');
          console.log('🔄 Falling back to A-Frame for desktop...');
          // Fallback: Show A-Frame scene
          const aframeScene = document.querySelector('a-scene');
          if (aframeScene) {
            aframeScene.style.display = 'block';
          }
        }
      }, 100);
    }

    // Check WebXR support and force VR button
    setTimeout(() => {
      if (navigator.xr) {
        console.log('✅ WebXR supported');
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          console.log(supported ? '✅ VR session supported' : '❌ VR session not supported');

          const vrButton = document.querySelector('.a-enter-vr-button');
          if (vrButton) {
            vrButton.style.display = 'block';
            console.log('🥽 VR button found and shown');
          } else {
            console.log('❌ VR button not found');
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
            // Show WebGI canvas when exiting VR
            if (webgiViewerRef.current) {
              webgiViewerRef.current.style.display = 'block';
            }
          } else if (scene) {
            await scene.enterVR();
            vrButton.innerHTML = '🚪 Exit VR';
            // Hide WebGI canvas when entering VR
            if (webgiViewerRef.current) {
              webgiViewerRef.current.style.display = 'none';
            }
          }
        } catch (error) {
          console.error('VR Error:', error);
          alert('VR not available: ' + error.message);
        }
      };

      document.body.appendChild(vrButton);
      console.log('✅ Custom VR button created');
    }

    // WebGI-A-Frame Bridge Component
    if (window.AFRAME && !window.AFRAME.components['webgi-ring']) {
      window.AFRAME.registerComponent('webgi-ring', {
        init: function() {
          this.webgiMesh = null;

          // Wait for WebGI viewer to load
          const waitForWebGI = () => {
            if (window.webgiViewer && window.webgiViewer.scene && window.webgiViewer.scene.modelRoot) {
              this.setupWebGIBridge();
            } else {
              setTimeout(waitForWebGI, 1000);
            }
          };

          waitForWebGI();
        },

        setupWebGIBridge: function() {
          try {
            // Get the loaded model from WebGI
            const modelRoot = window.webgiViewer.scene.modelRoot;

            if (modelRoot) {
              // Clone the WebGI model for use in A-Frame VR
              this.webgiMesh = modelRoot.clone();

              // Add the cloned mesh to this A-Frame entity
              this.el.setObject3D('mesh', this.webgiMesh);

              console.log('🔗 WebGI model bridged to A-Frame VR successfully');

              // Apply VR-optimized materials
              this.optimizeForVR();
            }
          } catch (error) {
            console.error('❌ Failed to bridge WebGI to A-Frame:', error);
          }
        },

        optimizeForVR: function() {
          if (!this.webgiMesh) return;

          // Optimize materials for VR performance
          this.webgiMesh.traverse(child => {
            if (child.material) {
              // Reduce material complexity for VR
              if (child.material.map) {
                child.material.map.generateMipmaps = false;
                child.material.map.minFilter = THREE.LinearFilter;
              }

              // Maintain visual quality but optimize performance
              if (child.material.roughnessMap) {
                child.material.roughnessMap.generateMipmaps = false;
              }

              if (child.material.normalMap) {
                child.material.normalMap.generateMipmaps = false;
              }

              child.material.needsUpdate = true;
            }
          });

          console.log('🚀 WebGI model optimized for VR');
        },

        tick: function(time) {
          // Sync with WebGI animations if needed
          if (this.webgiMesh && window.webgiViewer) {
            // Update any dynamic properties from WebGI
            const isVR = this.el.sceneEl.is('vr-mode');

            if (isVR && time % 100 < 50) { // Reduced update frequency in VR
              // Sync position, rotation if needed
            }
          }
        }
      });
    }

    // Working Thumbstick Rotation Component - Same as MyPlayground2
    if (window.AFRAME && !window.AFRAME.components['working-thumbstick']) {
      window.AFRAME.registerComponent('working-thumbstick', {
        schema: {
          rotationSpeed: {default: 3.0}
        },

        init: function() {
          this.GRABBED_STATE = 'grabbed';
          this.MOVING_STATE = 'moving';
          this.grabbing = false;
          this.movingObject = false;
          this.selectedObject = null;
          this.rotationSpeed = this.data.rotationSpeed;
          this.triggerDownTime = 0;
          this.HOLD_THRESHOLD = 300;

          this.previousPosition = new THREE.Vector3();
          this.currentPosition = new THREE.Vector3();
          this.deltaPosition = new THREE.Vector3();

          this.onTriggerDown = this.onTriggerDown.bind(this);
          this.onTriggerUp = this.onTriggerUp.bind(this);
          this.onThumbstickMoved = this.onThumbstickMoved.bind(this);
          this.selectObject = this.selectObject.bind(this);

          console.log('Working thumbstick component initialized for', this.el.id);
        },

        play: function() {
          this.el.addEventListener('triggerdown', this.onTriggerDown);
          this.el.addEventListener('triggerup', this.onTriggerUp);
          this.el.addEventListener('thumbstickmoved', this.onThumbstickMoved);

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🎮 Working Controller: ${this.el.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
        },

        onTriggerDown: function(/* evt */) {
          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🔴 TRIGGER DOWN: ${this.el.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }

          console.log('Trigger pressed!');
          this.triggerDownTime = Date.now();
          this.grabbing = true;

          if (this.selectedObject) {
            this.startMoving();
          } else {
            this.selectObject();
          }
        },

        onTriggerUp: function(/* evt */) {
          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🟢 TRIGGER UP: ${this.el.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }

          console.log('Trigger released!');
          var holdDuration = Date.now() - this.triggerDownTime;
          this.grabbing = false;

          if (this.movingObject) {
            this.stopMoving();
          } else if (holdDuration < this.HOLD_THRESHOLD && this.selectedObject) {
            this.deselectObject();
          }
        },

        selectObject: function() {
          var raycaster = this.el.components.raycaster;
          if (!raycaster) {
            console.log('No raycaster found!');
            return;
          }

          var intersectedEls = raycaster.intersectedEls;
          console.log('Intersected elements:', intersectedEls);

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🔍 Found ${intersectedEls.length} objects`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }

          if (intersectedEls.length > 0) {
            var hitEl = intersectedEls[0];

            if (!hitEl.classList.contains('rotatable')) {
              console.log('Object is not rotatable');
              return;
            }

            this.selectedObject = hitEl;
            hitEl.addState(this.GRABBED_STATE);
            hitEl.emit('rotationstart');
            console.log('Object selected for rotation:', hitEl.tagName);

            this.setObjectColor(hitEl, '#ff4444');

            if (debugText) {
              const msg = `✅ SELECTED: ${hitEl.id}`;
              const currentValue = debugText.getAttribute('value') || '';
              const lines = currentValue.split('\n').slice(-8);
              lines.push(msg);
              debugText.setAttribute('value', lines.join('\n'));
            }
          } else {
            console.log('No objects intersected by raycaster');
          }
        },

        deselectObject: function() {
          if (!this.selectedObject) return;

          this.selectedObject.removeState(this.GRABBED_STATE);
          this.selectedObject.removeState(this.MOVING_STATE);
          this.selectedObject.emit('rotationend');
          console.log('Object deselected');

          this.resetObjectColor(this.selectedObject);

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `❌ DESELECTED: ${this.selectedObject.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }

          this.selectedObject = null;
          this.movingObject = false;
        },

        startMoving: function() {
          if (!this.selectedObject) return;

          this.movingObject = true;
          this.selectedObject.addState(this.MOVING_STATE);
          this.selectedObject.emit('movestart');
          console.log('Started moving object');

          this.el.object3D.updateMatrixWorld();
          this.previousPosition.setFromMatrixPosition(this.el.object3D.matrixWorld);

          this.setObjectColor(this.selectedObject, '#44ff44');

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🟢 MOVING: ${this.selectedObject.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
        },

        stopMoving: function() {
          if (!this.selectedObject || !this.movingObject) return;

          this.movingObject = false;
          this.selectedObject.removeState(this.MOVING_STATE);
          this.selectedObject.emit('moveend');
          console.log('Stopped moving object');

          this.setObjectColor(this.selectedObject, '#ff4444');

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🔴 STOP MOVING: ${this.selectedObject.id}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
        },

        setObjectColor: function(el, color) {
          if (el.setAttribute) {
            el.setAttribute('material', 'color', color);
          }
        },

        resetObjectColor: function(el) {
          if (el.setAttribute) {
            el.setAttribute('material', 'color', '#ffffff');
          }
        },

        onThumbstickMoved: function(evt) {
          if (!this.selectedObject || this.movingObject) return;

          var thumbstickX = evt.detail.x;
          var thumbstickY = evt.detail.y;

          if (Math.abs(thumbstickX) < 0.1 && Math.abs(thumbstickY) < 0.1) {
            return;
          }

          const debugText = document.getElementById('debug-text');
          if (debugText) {
            const msg = `🕹️ THUMBSTICK: X=${thumbstickX.toFixed(2)} Y=${thumbstickY.toFixed(2)}`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }

          var currentRotation = this.selectedObject.getAttribute('rotation');

          var deltaY = thumbstickX * this.rotationSpeed;
          var deltaX = -thumbstickY * this.rotationSpeed;

          this.selectedObject.setAttribute('rotation', {
            x: currentRotation.x + deltaX,
            y: currentRotation.y + deltaY,
            z: currentRotation.z
          });

          if (debugText) {
            const msg = `🔄 ROTATING: X=${(currentRotation.x + deltaX).toFixed(0)}° Y=${(currentRotation.y + deltaY).toFixed(0)}°`;
            const currentValue = debugText.getAttribute('value') || '';
            const lines = currentValue.split('\n').slice(-8);
            lines.push(msg);
            debugText.setAttribute('value', lines.join('\n'));
          }
        },

        tick: function() {
          if (!this.selectedObject || !this.movingObject) {
            return;
          }

          this.el.object3D.updateMatrixWorld();
          this.currentPosition.setFromMatrixPosition(this.el.object3D.matrixWorld);

          this.deltaPosition.subVectors(this.currentPosition, this.previousPosition);

          var currentPos = this.selectedObject.getAttribute('position');
          this.selectedObject.setAttribute('position', {
            x: currentPos.x + this.deltaPosition.x,
            y: currentPos.y + this.deltaPosition.y,
            z: currentPos.z + this.deltaPosition.z
          });

          this.previousPosition.copy(this.currentPosition);
        }
      });
    }

    // VR Selectable Component - Same as MyPlayground2
    if (window.AFRAME && !window.AFRAME.components['vr-selectable']) {
      window.AFRAME.registerComponent('vr-selectable', {
        init: function() {
          this.el.classList.add('interactive');
          this.originalColor = null;
          this.isSelected = false;

          this.originalScale = this.el.getAttribute('scale') || {x: 1, y: 1, z: 1};

          this.isDragging = false;
          this.mouseX = 0;
          this.mouseY = 0;

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

          this.el.addEventListener('click', (evt) => {
            if (this.isDragging) {
              evt.stopPropagation();
              return;
            }

            this.toggleSelection();
          });

          this.el.addEventListener('mousedown', (evt) => {
            if (this.isSelected) {
              this.isDragging = true;
              this.mouseX = evt.clientX;
              this.mouseY = evt.clientY;
              document.body.style.cursor = 'grabbing';
              evt.stopPropagation();
            }
          });

          this.handleKeyboard = (evt) => {
            if (!this.isSelected) return;

            const position = this.el.getAttribute('position');
            const rotation = this.el.getAttribute('rotation');
            const moveSpeed = 0.1;
            const rotateSpeed = 5;

            switch(evt.key) {
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
              case 'q':
              case 'Q':
                this.el.setAttribute('position', {x: position.x, y: position.y - moveSpeed, z: position.z});
                break;
              case 'e':
              case 'E':
                this.el.setAttribute('position', {x: position.x, y: position.y + moveSpeed, z: position.z});
                break;
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
              case 'r':
              case 'R':
                this.el.setAttribute('position', '0 1.6 -1');
                this.el.setAttribute('rotation', '0 0 0');
                break;
              case 'Escape':
                this.toggleSelection();
                break;
            }
          };

          this.handleMouseMove = (evt) => {
            if (this.isDragging && this.isSelected) {
              const deltaX = evt.clientX - this.mouseX;
              const deltaY = evt.clientY - this.mouseY;

              const rotation = this.el.getAttribute('rotation');

              this.el.setAttribute('rotation', {
                x: rotation.x - deltaY * 0.5,
                y: rotation.y + deltaX * 0.5,
                z: rotation.z
              });

              this.mouseX = evt.clientX;
              this.mouseY = evt.clientY;
            }
          };

          this.handleMouseUp = () => {
            if (this.isDragging) {
              this.isDragging = false;
              document.body.style.cursor = 'pointer';
            }
          };

          document.addEventListener('keydown', this.handleKeyboard);
          document.addEventListener('mousemove', this.handleMouseMove);
          document.addEventListener('mouseup', this.handleMouseUp);
        },

        highlight: function() {
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();

          if (!this.originalColor) {
            if (tagName === 'a-box') {
              this.originalColor = this.el.getAttribute('color') || '#FF0000';
            }
          }

          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            this.el.setAttribute('color', '#00FFFF');
            this.el.setAttribute('material', 'emissive', '#00ff00');
            this.el.setAttribute('material', 'emissiveIntensity', 0.5);
          } else if (mesh) {
            mesh.traverse(child => {
              if (child.material) {
                child.material.emissive = new window.THREE.Color(0x00ffff);
                child.material.emissiveIntensity = 0.5;
                child.material.needsUpdate = true;
              }
            });
          }
        },

        unhighlight: function() {
          const mesh = this.el.getObject3D('mesh');
          const tagName = this.el.tagName.toLowerCase();

          if (tagName === 'a-box' || tagName === 'a-sphere' || tagName === 'a-cylinder') {
            if (this.originalColor) {
              this.el.setAttribute('color', this.originalColor);
            }

            this.el.setAttribute('material', 'emissive', '#000000');
            this.el.setAttribute('material', 'emissiveIntensity', 0);
          } else if (mesh) {
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

          const rightController = document.getElementById('rightController')?.components?.['working-thumbstick'];
          const leftController = document.getElementById('leftController')?.components?.['working-thumbstick'];

          if (this.isSelected) {
            if (rightController) rightController.selectedObject = this.el;
            if (leftController) leftController.selectedObject = this.el;

            this.el.setAttribute('data-selected', 'true');
            this.el.classList.add('selected');

            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  child.material.emissive = new window.THREE.Color(0x00FF00);
                  child.material.emissiveIntensity = 0.5;
                }
              });
            }

            const debugText = document.getElementById('debug-text');
            if (debugText) {
              const msg = '🎯 RING SELECTED - Thumbstick Ready';
              const currentValue = debugText.getAttribute('value') || '';
              const lines = currentValue.split('\n').slice(-8);
              lines.push(msg);
              debugText.setAttribute('value', lines.join('\n'));
            }
          } else {
            if (rightController) rightController.selectedObject = null;
            if (leftController) leftController.selectedObject = null;

            this.el.removeAttribute('data-selected');
            this.el.classList.remove('selected');

            this.unhighlight();

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

        remove: function() {
          document.removeEventListener('keydown', this.handleKeyboard);
          document.removeEventListener('mousemove', this.handleMouseMove);
          document.removeEventListener('mouseup', this.handleMouseUp);
        }
      });
    }

    // VR Performance Optimizer
    if (window.AFRAME && !window.AFRAME.components['vr-performance']) {
      window.AFRAME.registerComponent('vr-performance', {
        init: function() {
          this.isVR = false;

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

          const RENDERER = this.el.sceneEl.renderer;
          if (RENDERER) {
            RENDERER.setPixelRatio(0.8);
            RENDERER.antialias = false;
            RENDERER.shadowMap.enabled = false;
            RENDERER.physicallyCorrectLights = false;
            RENDERER.outputEncoding = window.THREE.sRGBEncoding;
          }

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

    return () => {
      // Cleanup WebGI viewer
      if (window.webgiViewer) {
        // Cleanup WebGI resources if needed
      }
    };
  }, []);

  return (
    <div className="myplayground2-container">
      {/* WebGI Canvas for High-Quality Desktop Rendering */}
      <canvas
        ref={webgiViewerRef}
        id="webgi-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10
        }}
      />

      {/* VR Button */}
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
              // Show WebGI element when exiting VR
              if (window.webgiViewerElement) {
                window.webgiViewerElement.style.display = 'block';
              }
              // Hide A-Frame scene
              scene.style.display = 'none';
            } else if (scene) {
              console.log('🥽 Entering VR...');
              // Show A-Frame scene for VR
              scene.style.display = 'block';
              await scene.enterVR();
              // Hide WebGI element when entering VR
              if (window.webgiViewerElement) {
                window.webgiViewerElement.style.display = 'none';
              }
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

      {/* A-Frame VR Scene */}
      <a-scene
        ref={sceneRef}
        obb-collider="showColliders: false"
        renderer="colorManagement: true; sortTransparentObjects: false; antialias: false; powerPreference: high-performance; precision: lowp; logarithmicDepthBuffer: false"
        vr-mode-ui="enabled: true"
        webxr="referenceSpaceType: local-floor"
        vr-performance
        className="myplayground2-scene"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          display: 'none' // Hide A-Frame initially, show only in VR mode
        }}
      >
        {/* Environment */}
        <a-sky color="#87CEEB"></a-sky>
        <a-light type="ambient" color="#404040" intensity="0.4"></a-light>
        <a-light type="directional" position="2 4 2" color="#ffffff" intensity="0.8"></a-light>

        {/* Camera with boundary checking */}
        <a-entity
          id="cameraRig"
          look-controls
          position="0 2.0 0"
        >
          {/* Mouse cursor for desktop */}
          <a-entity
            cursor="rayOrigin: mouse; fuse: false"
            raycaster="objects: .rotatable"
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
            value="DEBUG INFO:\n- WebGI + VR Hybrid Mode\n- Desktop: WebGI High Quality\n- VR: A-Frame Optimized"
            color="#00ff00"
            position="0 0 0.01"
            align="center"
            width="4"
            font="monoid"
          ></a-text>
        </a-entity>

        {/* RING 3D - Both WebGI Bridge and A-Frame fallback */}
        <a-entity
          id="ring-entity"
          vr-selectable
          grabbable
          webgi-ring
          gltf-model="/models/nhanMirror.glb"
          position="0 1.6 -1"
          scale="0.01 0.01 0.01"
          rotation="0 0 0"
          class="interactive grabbable rotatable"
        >
        </a-entity>

        {/* VR Controllers */}
        <a-entity
          id="rightController"
          tracked-controls="hand: right; idPrefix: meta-quest"
          meta-touch-controls="hand: right; model: true"
          laser-controls="hand: right"
          working-thumbstick
          raycaster="objects: .rotatable; showLine: false; far: 3; interval: 100"
        >
        </a-entity>

        <a-entity
          id="leftController"
          tracked-controls="hand: left; idPrefix: meta-quest"
          meta-touch-controls="hand: left; model: true"
          laser-controls="hand: left"
          working-thumbstick
          raycaster="objects: .rotatable; showLine: false; far: 3; interval: 100"
        >
        </a-entity>
      </a-scene>
    </div>
  );
};

export default MyPlayground3;