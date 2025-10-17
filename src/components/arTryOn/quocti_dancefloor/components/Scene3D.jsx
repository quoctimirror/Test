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

import { useEffect, useRef, useCallback } from 'react';
import { useGLTF, useEnvironment, Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, ToneMapping, SMAA } from '@react-three/postprocessing';
import { Ring3D } from './Ring3D';
import { SpotLightHelper } from 'three';

export function Scene3D({ modelPath, selectedMesh, onMeshListLoad, transform, meshColors, meshVisibility, renderMode = 'smooth', diamondScale = 1, showDebugHelpers = false, enableBloom = true }) {
  // Load model GLTF
  const { nodes } = useGLTF(modelPath);

  // Load environment map (HDR) để tạo phản chiếu
  const env = useEnvironment({ files: '/studio_env/brown_photostudio_02_4k.exr' });

  // Ref cho spotlight helper
  const spotLightRef = useRef();

  // Trích xuất danh sách mesh từ model khi model được load
  const handleMeshListLoad = useCallback((list) => {
    if (onMeshListLoad) {
      onMeshListLoad(list);
    }
  }, [onMeshListLoad]);

  useEffect(() => {
    if (nodes) {
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
      handleMeshListLoad(list);
    }
  }, [nodes, handleMeshListLoad]);

  return (
    <>
      {/* === BACKGROUND COLOR === */}
      <color attach="background" args={['#ffffff']} /> {/* Background màu trắng */}

      {/* === LIGHTING === */}
      {/* SpotLight chính chiếu từ phía trên */}
      <spotLight
        ref={spotLightRef}
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI * 3}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0001}
      />

      {/* ⚡ ÁNH SÁNG PHÍA SAU - để ánh sáng đi xuyên qua kim cương tạo khúc xạ */}
      <pointLight position={[0, -2, -3]} intensity={Math.PI * 2} color="#ffffff" />
      <pointLight position={[3, 0, -3]} intensity={Math.PI * 1.5} color="#ffffff" />
      <pointLight position={[-3, 0, -3]} intensity={Math.PI * 1.5} color="#ffffff" />

      {/* Ambient light nhẹ */}
      <ambientLight intensity={0.2} />

      {/* 🔦 DEBUG: SpotLight Helper - Vẽ hình nón ánh sáng chiếu vào nhẫn */}
      {showDebugHelpers && spotLightRef.current && (
        <primitive object={new SpotLightHelper(spotLightRef.current, '#ffff00')} />
      )}

      {/* 💡 DEBUG: Quả cầu đỏ đánh dấu vị trí nguồn sáng */}
      {showDebugHelpers && (
        <mesh position={[10, 10, 10]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}

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
          renderMode={renderMode}
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
        multisampling={renderMode === 'fullTopping' ? 8 : 4}
        enabled={true}
      >
        {/* SMAA: Anti-aliasing mạnh, chống răng cưa tốt hơn FXAA */}
        <SMAA />

        {/* N8AO: Ambient Occlusion - Chỉ bật ở fullTopping mode */}
        {renderMode === 'fullTopping' && (
          <N8AO
            aoRadius={0.15}
            intensity={4}
            distanceFalloff={2}
          />
        )}

        {/* Bloom: hiệu ứng lấp lánh - Tăng cường cho kim cương */}
        {enableBloom && (
          <Bloom
            luminanceThreshold={renderMode === 'fullTopping' ? 0.9 : 1.2}
            intensity={renderMode === 'fullTopping' ? 1.8 : 1.2}
            levels={renderMode === 'fullTopping' ? 9 : 8}
            mipmapBlur
          />
        )}

        {/* ToneMapping: ánh xạ màu HDR - TẮT để background trắng không bị xám */}
        {/* <ToneMapping /> */}
      </EffectComposer>

      {/* === ENVIRONMENT === */}
      {/* Environment map để phản chiếu và ánh sáng */}
      {/* background={false} → KHÔNG hiển thị HDRI làm background, chỉ dùng cho phản chiếu */}
      <Environment map={env} background={false} />
    </>
  );
}
