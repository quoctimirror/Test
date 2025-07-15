import * as THREE from "three";

/**
 * Tính toán vị trí và hướng (rotation) của điểm mục tiêu cho chiếc nhẫn
 * dựa trên các điểm mốc của bàn tay.
 * @param {Array<Object>} handLandmarks - Mảng các điểm mốc cho MỘT bàn tay từ MediaPipe.
 * @returns {Object|null} - Trả về một object chứa { position, rotation } hoặc null nếu không tính được.
 */
export function calculateRingTarget(handLandmarks) {
  // Cần ít nhất các điểm mốc 9, 13, 14 để tính toán chính xác
  if (
    !handLandmarks ||
    !handLandmarks[9] ||
    !handLandmarks[13] ||
    !handLandmarks[14]
  ) {
    return null;
  }

  const p9 = handLandmarks[9]; // Khớp gốc ngón giữa (MIDDLE_FINGER_MCP)
  const p13 = handLandmarks[13]; // Khớp giữa ngón áp út (RING_FINGER_PIP)
  const p14 = handLandmarks[14]; // Khớp trên ngón áp út (RING_FINGER_DIP)

  // --- 1. TÍNH TOÁN VỊ TRÍ (POSITION XYZ) ---
  // Đây là trung điểm của đốt ngón tay giữa 13 và 14.
  const position = {
    x: (p13.x + p14.x) / 2,
    y: (p13.y + p14.y) / 2,
    z: (p13.z + p14.z) / 2, // Lấy cả tọa độ z từ MediaPipe
  };

  // --- 2. TÍNH TOÁN HƯỚNG XOAY (ROTATION XYZ) ---
  // Dùng vector math của Three.js để việc này dễ dàng hơn.
  const p9Vec = new THREE.Vector3(p9.x, p9.y, p9.z);
  const p13Vec = new THREE.Vector3(p13.x, p13.y, p13.z);
  const p14Vec = new THREE.Vector3(p14.x, p14.y, p14.z);

  // a. Trục Z (forward): Hướng của ngón tay, đi từ khớp 13 đến 14.
  const forwardDir = new THREE.Vector3().subVectors(p14Vec, p13Vec).normalize();
  // b. Trục X (sideways): Hướng ngang trên mu bàn tay, đi từ ngón giữa (9) đến ngón áp út (13).
  const sidewaysDir = new THREE.Vector3().subVectors(p13Vec, p9Vec).normalize();
  // c. Trục Y (up): Vuông góc với cả 2 trục trên, dùng phép tích có hướng (cross product).
  const upDir = new THREE.Vector3()
    .crossVectors(forwardDir, sidewaysDir)
    .normalize();

  // Tạo ma trận xoay từ 3 vector hướng này
  const rotationMatrix = new THREE.Matrix4().makeBasis(
    sidewaysDir,
    upDir,
    forwardDir
  );
  const euler = new THREE.Euler().setFromRotationMatrix(rotationMatrix, "XYZ");

  const rotation = {
    x: THREE.MathUtils.radToDeg(euler.x), // Đổi từ radian sang độ
    y: THREE.MathUtils.radToDeg(euler.y),
    z: THREE.MathUtils.radToDeg(euler.z),
  };

  return { position, rotation };
}
