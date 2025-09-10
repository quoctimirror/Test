import React, { useEffect, useRef } from 'react';
import './MyPlayground2.css';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const MyPlayground2 = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Initialize VR debug system
    window.vrDebug = function(message) {
      console.log(message);
    };
    
    // Initial debug message
    setTimeout(() => {
      window.vrDebug('🎮 VR Environment Loading...');
      
      // Check VR capabilities
      if (navigator.xr) {
        window.vrDebug('✅ WebXR supported');
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          window.vrDebug(supported ? '✅ VR session supported' : '❌ VR session not supported');
        });
      } else {
        window.vrDebug('❌ WebXR not supported');
      }
      
      // Check HTTPS
      if (location.protocol === 'https:') {
        window.vrDebug('🔒 HTTPS active');
      } else {
        window.vrDebug('⚠️ Need HTTPS for VR - VR button won\'t appear');
      }
    }, 500);

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
                
                window.vrDebug('✅ HDR Environment loaded successfully');
              },
              (progress) => {
                window.vrDebug(`📦 Loading HDR: ${Math.round(progress.loaded / progress.total * 100)}%`);
              },
              (error) => {
                window.vrDebug('❌ Failed to load HDR environment');
                console.error('HDR loading error:', error);
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
          
          window.vrDebug(`🔫 TRIGGER DOWN: ${this.el.id}`);
          
          if (raycaster && raycaster.intersectedEls && raycaster.intersectedEls.length > 0) {
            const intersectedEl = raycaster.intersectedEls[0];
            window.vrDebug(`🎯 Hit: ${intersectedEl.id}`);
            
            if (intersectedEl.classList.contains('grabbable') || intersectedEl.classList.contains('interactive')) {
              this.grabbedObject = intersectedEl;
              
              const controllerPos = new window.THREE.Vector3();
              const objectPos = new window.THREE.Vector3();
              
              this.el.object3D.getWorldPosition(controllerPos);
              intersectedEl.object3D.getWorldPosition(objectPos);
              
              this.grabOffset.subVectors(objectPos, controllerPos);
              
              window.vrDebug(`✅ GRABBED: ${intersectedEl.id}`);
              
              intersectedEl.setAttribute('material', 'emissive', '#ffff00');
              intersectedEl.setAttribute('material', 'emissiveIntensity', 0.5);
            }
          }
        },
        
        onTriggerUp: function() {
          if (this.grabbedObject) {
            window.vrDebug(`✋ RELEASED: ${this.grabbedObject.id}`);
            
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

    // VR Selectable component for ring interaction
    if (window.AFRAME && !window.AFRAME.components['vr-selectable']) {
      window.AFRAME.registerComponent('vr-selectable', {
        init: function() {
          this.el.classList.add('interactive');
          this.originalColor = null;
          this.isSelected = false;
          
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
          
          this.el.addEventListener('click', (evt) => {
            window.vrDebug(`🎯 Selecting: ${this.el.id}`);
            this.toggleSelection();
          });
        },
        
        toggleSelection: function() {
          this.isSelected = !this.isSelected;
          
          if (this.isSelected) {
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  child.material.emissive = new window.THREE.Color(0x00FF00);
                  child.material.emissiveIntensity = 0.5;
                  child.material.needsUpdate = true;
                }
              });
            }
          } else {
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
              mesh.traverse(child => {
                if (child.material) {
                  child.material.emissive = new window.THREE.Color(0x000000);
                  child.material.emissiveIntensity = 0;
                  child.material.needsUpdate = true;
                }
              });
            }
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
      {/* Custom VR Enter Button */}
      <button 
        id="enterVRButton"
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
        onClick={() => {
          const scene = document.querySelector('a-scene');
          if (scene) {
            scene.enterVR();
          }
        }}
      >
        🥽 Enter VR
      </button>
      <a-scene
        ref={sceneRef}
        renderer="colorManagement: true; sortTransparentObjects: true"
        vr-mode-ui="enabled: true; enterVRButton: #enterVRButton"
        webxr="requiredFeatures: hit-test,local-floor; optionalFeatures: hand-tracking,layers"
        className="myplayground2-scene"
      >
        {/* HDR Environment - using custom HDR loader */}
        <a-entity 
          hdr-environment
        ></a-entity>

        {/* Camera */}
        <a-entity 
          id="cameraRig"
          look-controls
          position="0 1.6 0"
        >
        </a-entity>

        {/* NHẪN 3D - Có thể grab và manipulate */}
        <a-entity
          id="ring-entity"
          vr-selectable
          grabbable
          gltf-model="/models/nhanAnhKhanhLam.glb"
          position="0 1.6 -1"
          scale="0.01 0.01 0.01"
          rotation="0 0 0"
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