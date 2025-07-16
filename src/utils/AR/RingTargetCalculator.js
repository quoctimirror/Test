import * as THREE from "three";

/**
 * Calculate position and rotation of target point for ring
 * based on hand landmarks.
 * @param {Array<Object>} handLandmarks - Array of landmarks for ONE hand from MediaPipe.
 * @returns {Object|null} - Returns an object containing { position, rotation } or null if cannot calculate.
 */
export function calculateRingTarget(handLandmarks) {
  // Need at least landmark points 9, 13, 14 to calculate accurately
  if (
    !handLandmarks ||
    !handLandmarks[9] ||
    !handLandmarks[13] ||
    !handLandmarks[14]
  ) {
    return null;
  }

  const p9 = handLandmarks[9]; // Middle finger base joint (MIDDLE_FINGER_MCP)
  const p13 = handLandmarks[13]; // Ring finger middle joint (RING_FINGER_PIP)
  const p14 = handLandmarks[14]; // Ring finger top joint (RING_FINGER_DIP)

  // --- 1. CALCULATE POSITION (POSITION XYZ) ---
  // This is the midpoint of the finger segment between 13 and 14.
  const position = {
    x: (p13.x + p14.x) / 2,
    y: (p13.y + p14.y) / 2,
    z: (p13.z + p14.z) / 2, // Also get z coordinate from MediaPipe
  };

  // --- 2. CALCULATE ROTATION (ROTATION XYZ) ---
  // Use Three.js vector math to make this easier.
  const p9Vec = new THREE.Vector3(p9.x, p9.y, p9.z);
  const p13Vec = new THREE.Vector3(p13.x, p13.y, p13.z);
  const p14Vec = new THREE.Vector3(p14.x, p14.y, p14.z);

  // a. Z-axis (forward): Direction of finger, from joint 13 to 14.
  const forwardDir = new THREE.Vector3().subVectors(p14Vec, p13Vec).normalize();
  // b. X-axis (sideways): Horizontal direction on palm, from middle finger (9) to ring finger (13).
  const sidewaysDir = new THREE.Vector3().subVectors(p13Vec, p9Vec).normalize();
  // c. Y-axis (up): Perpendicular to both axes above, using cross product.
  const upDir = new THREE.Vector3()
    .crossVectors(forwardDir, sidewaysDir)
    .normalize();

  // Create rotation matrix from these 3 direction vectors
  const rotationMatrix = new THREE.Matrix4().makeBasis(
    sidewaysDir,
    upDir,
    forwardDir
  );
  const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix, "XYZ");

  const rotation = {
    x: THREE.MathUtils.radToDeg(euler.x), // Convert from radians to degrees
    y: THREE.MathUtils.radToDeg(euler.y),
    z: THREE.MathUtils.radToDeg(euler.z),
  };

  return { position, rotation };
}
