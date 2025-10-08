/**
 * Scene3D.jsx
 *
 * NHIỆM VỤ: Quản lý toàn bộ 3D scene
 * - Load model GLTF
 * - Load environment map (HDR)
 * - Thêm lighting (spotlight)
 * - Thêm OrbitControls để xoay camera
 * - Trích xuất danh sách mesh từ model và gửi lên parent
 */

import { useEffect } from 'react';
import { useGLTF, useEnvironment, Environment, OrbitControls } from '@react-three/drei';
import { Ring3D } from './Ring3D';

export function Scene3D({ modelPath, selectedMesh, onMeshListLoad, transform, meshColors }) {
  // Load model GLTF
  const { nodes } = useGLTF(modelPath);

  // Load environment map (HDR) để tạo phản chiếu
  const env = useEnvironment({ files: '/studio_env/env_metal_1.exr' });

  // Trích xuất danh sách mesh từ model khi model được load
  useEffect(() => {
    if (nodes && onMeshListLoad) {
      const list = [];

      Object.keys(nodes).forEach(key => {
        const node = nodes[key];

        // Chỉ lấy các node là Mesh hoặc InstancedMesh
        if (node.isMesh || node.isInstancedMesh) {
          list.push({
            name: key,        // Tên mesh
            type: node.type   // Loại: Mesh hoặc InstancedMesh
          });
        }
      });

      // Gửi danh sách mesh lên component cha
      onMeshListLoad(list);
    }
  }, [nodes, onMeshListLoad]);

  return (
    <>
      {/* === LIGHTING === */}
      {/* SpotLight chiếu từ phía trên */}
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />

      {/* === MODEL === */}
      <group position={[0, -0.25, 0]}>
        <Ring3D
          nodes={nodes}
          env={env}
          selectedMesh={selectedMesh}
          transform={transform}
          meshColors={meshColors}
        />
      </group>

      {/* === CAMERA CONTROLS === */}
      {/* OrbitControls: Click chuột trái để xoay, scroll để zoom */}
      <OrbitControls makeDefault />

      {/* === ENVIRONMENT === */}
      {/* Hiển thị environment map làm background và phản chiếu */}
      <Environment map={env} background />
    </>
  );
}
