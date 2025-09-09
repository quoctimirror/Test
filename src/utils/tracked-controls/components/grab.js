/* global AFRAME, THREE */

/**
* Handles events coming from the hand-controls.
* Determines if the entity is grabbed or released.
* Updates its position to move along the controller.
*/
// Only register if component doesn't already exist
if (!AFRAME.components.grab) {
  AFRAME.registerComponent('grab', {
  after: ['tracked-controls-webxr'],
  before: ['aabb-collider'],
  init: function () {
    this.GRABBED_STATE = 'grabbed';
    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
    this.currentPosition = new THREE.Vector3();
  },

  play: function () {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('buttondown', this.onGripClose);
    el.addEventListener('buttonup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.addEventListener('buttondown', this.onGripClose);
    el.addEventListener('buttonup', this.onGripOpen);
  },

  onGripClose: function (evt) {
    console.log('🤏 GRIP DOWN detected, button:', evt.detail.id);
    if (this.grabbing) { return; }
    this.grabbing = true;
    this.pressedButtonId = evt.detail.id;
    delete this.previousPosition;
    console.log('🤏 Started grabbing mode');
  },

  onGripOpen: function (evt) {
    console.log('✋ GRIP UP detected, button:', evt.detail.id);
    var hitEl = this.hitEl;
    if (this.pressedButtonId !== evt.detail.id) { return; }
    this.grabbing = false;
    if (!hitEl) { 
      console.log('✋ No hitEl to release');
      return; 
    }
    console.log('✋ Releasing object:', hitEl.id);
    hitEl.removeState(this.GRABBED_STATE);
    hitEl.emit('grabend');
    this.hitEl = undefined;
  },

  onHit: function (evt) {
    var hitEl = evt.detail.el;
    console.log('🎯 HIT detected on:', hitEl?.id, 'grabbing mode:', this.grabbing);
    
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { 
      console.log('🚫 Cannot grab:', {
        noHitEl: !hitEl,
        alreadyGrabbed: hitEl?.is(this.GRABBED_STATE),
        notGrabbing: !this.grabbing,
        alreadyHasHitEl: !!this.hitEl
      });
      return; 
    }
    
    console.log('✅ GRABBED object:', hitEl.id);
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
  },

  tick: function () {
    var hitEl = this.hitEl;
    var position;
    if (!hitEl) { return; }
    this.updateDelta();
    position = hitEl.getAttribute('position');
    hitEl.setAttribute('position', {
      x: position.x + this.deltaPosition.x,
      y: position.y + this.deltaPosition.y,
      z: position.z + this.deltaPosition.z
    });
    hitEl.object3D.updateMatrixWorld();
  },

  updateDelta: function () {
    var currentPosition = this.currentPosition;
    this.el.object3D.updateMatrixWorld();
    currentPosition.setFromMatrixPosition(this.el.object3D.matrixWorld);
    if (!this.previousPosition) {
      this.previousPosition = new THREE.Vector3();
      this.previousPosition.copy(currentPosition);
    }
    var previousPosition = this.previousPosition;
    var deltaPosition = {
      x: currentPosition.x - previousPosition.x,
      y: currentPosition.y - previousPosition.y,
      z: currentPosition.z - previousPosition.z
    };
    this.previousPosition.copy(currentPosition);
    this.deltaPosition = deltaPosition;
  }
});
}
