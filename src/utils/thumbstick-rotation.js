/* global AFRAME */

/**
 * Thumbstick Rotation Utility
 * Xử lý việc xoay đối tượng 360° bằng thumbstick của Meta Quest controllers
 */

// Debug display helper
const updateDebugDisplay = (message) => {
  if (typeof document !== 'undefined') {
    const debugText = document.getElementById('debug-text');
    if (debugText) {
      const currentTime = new Date().toLocaleTimeString();
      const currentValue = debugText.getAttribute('value') || '';
      const lines = currentValue.split('\n').slice(-8); // Keep last 8 lines
      lines.push(`[${currentTime}] ${message}`);
      debugText.setAttribute('value', lines.join('\n'));
    }
  }
  console.log(message);
};

export const ThumbstickRotation = {
  // Configuration
  config: {
    rotationSpeed: 180,        // degrees per second
    deadzone: 0.15,           // thumbstick deadzone
    debugMode: false,         // enable debug logging
    smoothing: 0.1,           // rotation smoothing factor
    maxRotationPerFrame: 5    // max degrees per frame to prevent jerkiness
  },

  // Active rotation states
  activeRotations: new Map(),

  /**
   * Initialize thumbstick rotation for a controller
   * @param {Element} controllerEl - Controller element 
   * @param {Element} targetEl - Target element to rotate (optional, can be set dynamically)
   */
  init(controllerEl, targetEl = null) {
    const controllerId = controllerEl.id;
    
    updateDebugDisplay(`🎮 Init: ${controllerId}`);
    
    // Store rotation state
    this.activeRotations.set(controllerId, {
      controller: controllerEl,
      target: targetEl,
      lastThumbstick: { x: 0, y: 0 },
      accumulatedRotation: { x: 0, y: 0, z: 0 },
      isRotating: false,
      handedness: controllerEl.getAttribute('meta-touch-controls')?.hand || 'right'
    });

    // Add event listeners
    this.addEventListeners(controllerEl);

    updateDebugDisplay(`✅ Ready: ${controllerId}`);
  },

  /**
   * Add event listeners to controller
   */
  addEventListeners(controllerEl) {
    console.log(`🔌 Adding event listeners to controller: ${controllerEl.id}`);
    
    // Listen for thumbstick events
    controllerEl.addEventListener('thumbstickmoved', this.onThumbstickMoved.bind(this));
    controllerEl.addEventListener('axismove', this.onAxisMove.bind(this));
    
    // Add test event listener to verify events are firing
    controllerEl.addEventListener('buttondown', (evt) => {
      console.log(`🎮 Button down event on ${controllerEl.id}:`, evt.detail);
    });
    
    console.log(`✅ Event listeners added to controller: ${controllerEl.id}`);
  },

  /**
   * Set target object to rotate
   * @param {string} controllerId - Controller ID
   * @param {Element} targetEl - Target element
   */
  setTarget(controllerId, targetEl) {
    updateDebugDisplay(`🎯 Target: ${targetEl?.id || 'null'}`);
    
    const state = this.activeRotations.get(controllerId);
    if (state) {
      state.target = targetEl;
      updateDebugDisplay(`✅ ${controllerId} → ${targetEl?.id}`);
    } else {
      updateDebugDisplay(`❌ No state: ${controllerId}`);
    }
  },

  /**
   * Clear target for controller
   * @param {string} controllerId - Controller ID
   */
  clearTarget(controllerId) {
    const state = this.activeRotations.get(controllerId);
    if (state) {
      state.target = null;
      state.isRotating = false;
      if (this.config.debugMode) {
        console.log(`🎯 Target cleared for controller ${controllerId}`);
      }
    }
  },

  /**
   * Handle thumbstick moved event
   */
  onThumbstickMoved(evt) {
    const controllerId = evt.target.id;
    const state = this.activeRotations.get(controllerId);
    
    const { x, y } = evt.detail;
    updateDebugDisplay(`🕹️ Stick: X=${x.toFixed(2)} Y=${y.toFixed(2)}`);
    
    if (!state || !state.target) {
      return;
    }

    this.processThumbstickInput(controllerId, x, y);
  },

  /**
   * Handle axis move event (fallback)
   */
  onAxisMove(evt) {
    const controllerId = evt.target.id;
    const state = this.activeRotations.get(controllerId);
    
    if (!state || !state.target) return;

    // Get axes directly from event
    if (evt.detail && evt.detail.axis) {
      const axes = evt.detail.axis;
      
      // For Meta Quest, axes 2 and 3 are thumbstick for both hands
      const thumbstickX = axes[2] || axes[0] || 0;
      const thumbstickY = axes[3] || axes[1] || 0;
      
      if (Math.abs(thumbstickX) > 0.01 || Math.abs(thumbstickY) > 0.01) {
        updateDebugDisplay(`📊 Axis: X=${thumbstickX.toFixed(2)} Y=${thumbstickY.toFixed(2)}`);
        this.processThumbstickInput(controllerId, thumbstickX, thumbstickY);
      }
    }
  },

  /**
   * Process thumbstick input and apply rotation
   * @param {string} controllerId - Controller ID
   * @param {number} thumbstickX - X axis value (-1 to 1)
   * @param {number} thumbstickY - Y axis value (-1 to 1)
   */
  processThumbstickInput(controllerId, thumbstickX, thumbstickY) {
    const state = this.activeRotations.get(controllerId);
    if (!state || !state.target) {
      return;
    }

    // Apply deadzone
    if (Math.abs(thumbstickX) < this.config.deadzone && 
        Math.abs(thumbstickY) < this.config.deadzone) {
      
      if (state.isRotating) {
        state.isRotating = false;
        this.stopRotationFeedback(state.target);
      }
      return;
    }

    // Start rotation feedback if not already rotating
    if (!state.isRotating) {
      state.isRotating = true;
      this.startRotationFeedback(state.target);
      updateDebugDisplay(`▶️ Rotating ${state.target.id}`);
    }

    // Calculate rotation delta
    const deltaTime = 1 / 60; // Assume 60 FPS
    const rotationAmount = this.config.rotationSpeed * deltaTime;

    // Apply rotation with smoothing
    const targetRotation = state.target.getAttribute('rotation');
    
    const deltaX = -thumbstickY * rotationAmount; // Pitch (up/down)
    const deltaY = thumbstickX * rotationAmount;  // Yaw (left/right)

    // Limit max rotation per frame to prevent jerkiness
    const clampedDeltaX = Math.max(-this.config.maxRotationPerFrame, 
                                   Math.min(this.config.maxRotationPerFrame, deltaX));
    const clampedDeltaY = Math.max(-this.config.maxRotationPerFrame, 
                                   Math.min(this.config.maxRotationPerFrame, deltaY));

    const newRotation = {
      x: (targetRotation.x + clampedDeltaX) % 360,
      y: (targetRotation.y + clampedDeltaY) % 360,
      z: targetRotation.z
    };

    // Apply rotation
    state.target.setAttribute('rotation', newRotation);
    
    // Update debug display with rotation values
    updateDebugDisplay(`📐 Rot: Y=${newRotation.y.toFixed(0)}°`);

    // Store for debugging
    state.lastThumbstick = { x: thumbstickX, y: thumbstickY };
    state.accumulatedRotation = newRotation;
  },

  /**
   * Visual feedback when rotation starts
   */
  startRotationFeedback(targetEl) {
    const mesh = targetEl.getObject3D('mesh');
    if (mesh) {
      mesh.traverse(child => {
        if (child.material && child.material.emissiveIntensity !== undefined) {
          child.material.originalEmissiveIntensity = child.material.emissiveIntensity;
          child.material.emissiveIntensity = Math.max(child.material.emissiveIntensity, 0.4);
          child.material.needsUpdate = true;
        }
      });
    }
  },

  /**
   * Visual feedback when rotation stops
   */
  stopRotationFeedback(targetEl) {
    const mesh = targetEl.getObject3D('mesh');
    if (mesh) {
      mesh.traverse(child => {
        if (child.material && child.material.originalEmissiveIntensity !== undefined) {
          child.material.emissiveIntensity = child.material.originalEmissiveIntensity;
          child.material.needsUpdate = true;
        }
      });
    }
  },

  /**
   * Get current thumbstick values for a controller
   * @param {string} controllerId - Controller ID
   * @returns {Object} Thumbstick values {x, y}
   */
  getThumbstickValues(controllerId) {
    const state = this.activeRotations.get(controllerId);
    return state ? state.lastThumbstick : { x: 0, y: 0 };
  },

  /**
   * Check if controller is currently rotating an object
   * @param {string} controllerId - Controller ID
   * @returns {boolean}
   */
  isRotating(controllerId) {
    const state = this.activeRotations.get(controllerId);
    return state ? state.isRotating : false;
  },

  /**
   * Reset rotation for target
   * @param {string} controllerId - Controller ID
   */
  resetRotation(controllerId) {
    const state = this.activeRotations.get(controllerId);
    if (state && state.target) {
      state.target.setAttribute('rotation', '0 0 0');
      state.accumulatedRotation = { x: 0, y: 0, z: 0 };
    }
  },

  /**
   * Configure rotation settings
   * @param {Object} newConfig - Configuration object
   */
  configure(newConfig) {
    Object.assign(this.config, newConfig);
  },

  /**
   * Cleanup controller
   * @param {string} controllerId - Controller ID
   */
  cleanup(controllerId) {
    const state = this.activeRotations.get(controllerId);
    if (state) {
      if (state.target && state.isRotating) {
        this.stopRotationFeedback(state.target);
      }
      this.activeRotations.delete(controllerId);
    }
  },

  /**
   * Cleanup all controllers
   */
  cleanupAll() {
    this.activeRotations.clear();
  }
};

// Export to global window for easy access
if (typeof window !== 'undefined') {
  window.ThumbstickRotation = ThumbstickRotation;
}

// Auto-register as A-Frame component
if (typeof AFRAME !== 'undefined') {
  console.log('🔧 Registering thumbstick-rotation A-Frame component...');
  AFRAME.registerComponent('thumbstick-rotation', {
    schema: {
      rotationSpeed: { default: 180 },
      deadzone: { default: 0.15 },
      debugMode: { default: false },
      smoothing: { default: 0.1 }
    },

    init: function() {
      console.log(`🔧 thumbstick-rotation A-Frame component init for: ${this.el.id}`, this.data);
      
      // Configure ThumbstickRotation with schema values
      ThumbstickRotation.configure(this.data);
      
      // Initialize for this controller
      ThumbstickRotation.init(this.el);
      
      console.log(`✅ thumbstick-rotation A-Frame component initialized for: ${this.el.id}`);
    },
    
    tick: function() {
      // Direct gamepad polling as backup
      const controllerId = this.el.id;
      const state = ThumbstickRotation.activeRotations.get(controllerId);
      
      if (!state || !state.target) return;
      
      // Try to get gamepad directly
      const trackedControls = this.el.components['tracked-controls'];
      const metaTouch = this.el.components['meta-touch-controls'];
      
      let gamepad = null;
      if (trackedControls && trackedControls.controller) {
        gamepad = trackedControls.controller.gamepad;
      } else if (metaTouch && metaTouch.controller) {
        gamepad = metaTouch.controller.gamepad;
      }
      
      if (gamepad && gamepad.axes && gamepad.axes.length >= 2) {
        // Get thumbstick axes - try all possible mappings
        let thumbstickX = 0, thumbstickY = 0;
        
        // Try different axis mappings for Meta Quest
        if (gamepad.axes.length >= 4) {
          // Standard mapping: right hand uses axes 2,3, left uses 0,1
          const isRight = this.el.id.includes('right');
          if (isRight) {
            thumbstickX = gamepad.axes[2] || 0;
            thumbstickY = gamepad.axes[3] || 0;
          } else {
            thumbstickX = gamepad.axes[0] || 0;
            thumbstickY = gamepad.axes[1] || 0;
          }
        } else {
          // Fallback to first available axes
          thumbstickX = gamepad.axes[0] || 0;
          thumbstickY = gamepad.axes[1] || 0;
        }
        
        if (Math.abs(thumbstickX) > 0.01 || Math.abs(thumbstickY) > 0.01) {
          updateDebugDisplay(`🎮 ${controllerId.slice(-5)}: X=${thumbstickX.toFixed(2)} Y=${thumbstickY.toFixed(2)}`);
          ThumbstickRotation.processThumbstickInput(controllerId, thumbstickX, thumbstickY);
        }
      } else {
        // Show gamepad status periodically for debugging
        if (Math.floor(Date.now() / 2000) % 2 === 0 && Date.now() % 1000 < 50) {
          updateDebugDisplay(`🎮 ${controllerId.slice(-5)}: No gamepad axes (${gamepad ? gamepad.axes?.length || 0 : 'no gamepad'})`);
        }
      }
    },

    remove: function() {
      ThumbstickRotation.cleanup(this.el.id);
    },

    // Public methods accessible via component
    setTarget: function(targetEl) {
      ThumbstickRotation.setTarget(this.el.id, targetEl);
    },

    clearTarget: function() {
      ThumbstickRotation.clearTarget(this.el.id);
    },

    resetRotation: function() {
      ThumbstickRotation.resetRotation(this.el.id);
    }
  });

  // Helper component for objects that can be rotated
  AFRAME.registerComponent('thumbstick-rotatable', {
    schema: {
      controllerId: { default: '' }
    },

    init: function() {
      this.el.classList.add('thumbstick-rotatable');
    },

    // Set this as target for specified controller
    setAsTarget: function(controllerId) {
      ThumbstickRotation.setTarget(controllerId, this.el);
    },

    // Clear as target
    clearAsTarget: function(controllerId) {
      ThumbstickRotation.clearTarget(controllerId);
    }
  });
}

export default ThumbstickRotation;