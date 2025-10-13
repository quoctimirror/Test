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
import { EffectComposer, Bloom, N8AO, ToneMapping, FXAA } from '@react-three/postprocessing';
import { Ring3D } from './Ring3D';

export function Scene3D({ modelPath, selectedMesh, onMeshListLoad, transform, meshColors, meshVisibility, renderMode = 'smooth', diamondScale = 1 }) {
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
      {/* === BACKGROUND COLOR === */}
      <color attach="background" args={['#ffffff']} />

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
          meshVisibility={meshVisibility}
          diamondScale={diamondScale}
        />
      </group>

      {/* === CAMERA CONTROLS === */}
      {/* OrbitControls: Click chuột trái để xoay, scroll để zoom */}
      <OrbitControls
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.25}
        makeDefault
      />

      {/* === POST-PROCESSING EFFECTS === */}
      {/* EffectComposer: conditional rendering dựa trên renderMode */}
      <EffectComposer
        disableNormalPass={renderMode === 'smooth'}
        multisampling={renderMode === 'fullTopping' ? 4 : 2}
      >
        {/* FXAA: Anti-aliasing nhẹ, hiệu quả - thay thế SMAA để tránh conflict */}
        <FXAA />

        {/* N8AO: Ambient Occlusion */}
        <N8AO
          aoRadius={renderMode === 'fullTopping' ? 0.15 : 0.1}
          intensity={renderMode === 'fullTopping' ? 4 : 2}
          distanceFalloff={renderMode === 'fullTopping' ? 2 : 1}
          quality={renderMode === 'smooth' ? 'performance' : undefined}
          halfRes={renderMode === 'smooth'}
        />

        {/* Bloom: hiệu ứng lấp lánh - Giảm intensity để không quá sáng */}
        <Bloom
          luminanceThreshold={renderMode === 'fullTopping' ? 1.5 : 2.0}
          intensity={renderMode === 'fullTopping' ? 1.2 : 0.8}
          levels={renderMode === 'fullTopping' ? 9 : 7}
          mipmapBlur
        />

        {/* ToneMapping: ánh xạ màu HDR */}
        <ToneMapping />
      </EffectComposer>

      {/* === ENVIRONMENT === */}
      {/* Environment map để phản chiếu và ánh sáng, background trắng ở trên */}
      <Environment map={env} background={false} />
    </>
  );
}
