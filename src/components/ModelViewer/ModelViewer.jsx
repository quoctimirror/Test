import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import 'aframe';
import './ModelViewer.css';

const AFrameModel = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Đăng ký grabbable component cho drag & rotate
    if (window.AFRAME && !window.AFRAME.components['grabbable']) {
      window.AFRAME.registerComponent('grabbable', {
        init: function() {
          this.el.addEventListener('mousedown', this.startDrag.bind(this));
          this.el.addEventListener('mouseup', this.endDrag.bind(this));
          
          // VR controller events
          this.el.addEventListener('triggerdown', this.startDrag.bind(this));
          this.el.addEventListener('triggerup', this.endDrag.bind(this));
          
          // Hand tracking pinch events
          this.el.addEventListener('pinchstarted', this.startDrag.bind(this));
          this.el.addEventListener('pinchended', this.endDrag.bind(this));
          
          this.isDragging = false;
          this.initialRotation = null;
        },
        
        startDrag: function() {
          this.isDragging = true;
          this.initialRotation = this.el.getAttribute('rotation');
          // Pause auto rotation khi grab
          this.el.removeAttribute('animation');
        },
        
        endDrag: function() {
          this.isDragging = false;
          // Resume auto rotation
          this.el.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear');
        },
        
        tick: function() {
          if (this.isDragging) {
            // Logic xoay model khi drag
            // Có thể thêm logic phức tạp hơn ở đây
          }
        }
      });
    }
    
    // Đăng ký FBX loader component cho A-Frame
    if (window.AFRAME && !window.AFRAME.components['fbx-model']) {
      window.AFRAME.registerComponent('fbx-model', {
        schema: {
          src: { type: 'string' }
        },
        
        init: function() {
          const el = this.el;
          const AFRAME_THREE = window.AFRAME.THREE;
          const loader = new FBXLoader();
          
          console.log('Loading FBX from:', this.data.src);
          console.log('A-Frame THREE version:', AFRAME_THREE.REVISION);
          
          loader.load(
            this.data.src,
            (fbx) => {
              console.log('FBX loaded successfully!', fbx);
              
              // Create a new Group using A-Frame's THREE
              const aframeGroup = new AFRAME_THREE.Group();
              
              // Copy FBX content to A-Frame compatible group
              fbx.traverse((child) => {
                if (child.isMesh) {
                  const aframeMesh = new AFRAME_THREE.Mesh(child.geometry, child.material);
                  aframeGroup.add(aframeMesh);
                }
              });
              
              // Scale and position
              aframeGroup.scale.set(0.1, 0.1, 0.1);
              
              el.setObject3D('mesh', aframeGroup);
              console.log('FBX converted to A-Frame compatible group');
            },
            (progress) => {
              console.log('Loading FBX:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
              console.error('Error loading FBX:', error);
            }
          );
        }
      });
    }
    
    return () => {
      // Cleanup nếu cần
    };
  }, []);

  return (
    <div className="model-viewer-container">
      <a-scene 
        ref={sceneRef}
        background="color: #ECECEC"
        embedded
        className="aframe-scene"
      >
        {/* Chỉ load model FBX - không có model nào khác */}
        
        {/* Container cho model với grabbable component */}
        <a-entity
          id="model-container"
          position="0 1.5 -2"
        >
          {/* Model FBX nhẫn với animation xoay */}
          <a-entity 
            fbx-model="src: /models/nhanAnhKhanhLam.fbx"
            position="0 0 0"
            rotation="0 0 0"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
            class="grabbable"
            grabbable
          >
          </a-entity>
        </a-entity>
        
        {/* Camera với look-controls cho desktop và VR */}
        <a-entity position="0 1.6 0">
          <a-camera 
            look-controls="pointerLockEnabled: true"
            wasd-controls="enabled: true"
          >
            {/* Cursor cho desktop interaction */}
            <a-cursor
              animation__click="property: scale; startEvents: click; from: 0.1 0.1 0.1; to: 1 1 1; dur: 150"
              animation__fusing="property: scale; startEvents: fusing; from: 1 1 1; to: 0.1 0.1 0.1; dur: 1500"
              raycaster="objects: .grabbable"
              geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
              material="color: white; shader: flat"
            ></a-cursor>
          </a-camera>
        </a-entity>

        {/* VR Controllers cho Meta Quest 3 */}
        <a-entity 
          id="leftController"
          hand-controls="hand: left; handModelStyle: lowPoly; color: #ffcccc"
          laser-controls="hand: left"
          raycaster="objects: .grabbable; far: 2"
          line="color: #ff0000; opacity: 0.75"
        ></a-entity>
        
        <a-entity 
          id="rightController"
          hand-controls="hand: right; handModelStyle: lowPoly; color: #ccccff"
          laser-controls="hand: right"
          raycaster="objects: .grabbable; far: 2"
          line="color: #0000ff; opacity: 0.75"
        ></a-entity>

        {/* Hand Tracking cho Meta Quest 3 */}
        <a-entity 
          hand-tracking-controls="hand: left"
          hand-tracking-grab-controls="hand: left"
        ></a-entity>
        <a-entity 
          hand-tracking-controls="hand: right"
          hand-tracking-grab-controls="hand: right"
        ></a-entity>

        {/* Ánh sáng */}
        <a-light type="ambient" color="#404040"></a-light>
        <a-light type="point" position="2 4 4" color="#ffffff"></a-light>
        <a-light type="point" position="-2 4 -4" color="#ffffff"></a-light>
        
        {/* Floor để có reference */}
        <a-plane 
          position="0 0 -4" 
          rotation="-90 0 0" 
          width="10" 
          height="10" 
          color="#7BC8A4"
          shadow
        ></a-plane>
      </a-scene>
    </div>
  );
};

export default AFrameModel;