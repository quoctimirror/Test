/**
 * Ring3D.jsx
 *
 * NHIỆM VỤ: Render 3D model của nhẫn/trang sức
 * - Nhận danh sách nodes từ GLTF model
 * - Hiển thị từng mesh với material tương ứng
 * - Hỗ trợ highlight mesh được chọn (màu đỏ)
 * - Hỗ trợ đổi màu từng mesh qua meshColors
 * - Auto-rotate nếu được bật
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center, MeshRefractionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function Ring3D({ nodes, env, selectedMesh, transform, meshColors, meshVisibility, diamondScale = 1 }) {
  const groupRef = useRef();

  // Auto rotate nếu được bật
  useFrame((state, delta) => {
    if (transform.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center top>
      <group
        ref={groupRef}
        dispose={null}
        position={[transform.posX, transform.posY, transform.posZ]}
        rotation={[transform.rotX, transform.rotY, transform.rotZ]}
        scale={transform.scale}
      >
        {Object.keys(nodes).map(key => {
          const node = nodes[key];

          // Bỏ qua các node không có geometry
          if (!node.geometry) return null;

          // Kiểm tra trạng thái visibility - nếu bị ẩn thì không render
          const isVisible = meshVisibility?.[key] !== false; // Mặc định true nếu undefined
          if (!isVisible) return null;

          const material = node.material;

          // ===== XỬ LÝ INSTANCED MESH =====
          // (Mesh được duplicate nhiều lần, hiệu năng cao)
          if (node.isInstancedMesh) {
            // Áp dụng diamondScale cho InstancedMesh (viên kim cương chính)
            const originalScale = node.scale;
            const finalScale = originalScale.clone().multiplyScalar(diamondScale);

            console.log(`💎 InstancedMesh "${key}":`, {
              originalScale: originalScale.toArray(),
              diamondScale,
              finalScale: finalScale.toArray()
            });

            return (
              <instancedMesh
                key={key}
                castShadow
                receiveShadow
                args={[node.geometry, undefined, node.count]}
                instanceMatrix={node.instanceMatrix}
                position={node.position}
                rotation={node.rotation}
                scale={finalScale}
              >
                {/* Nếu mesh đang được chọn → highlight màu đỏ */}
                {selectedMesh === key ? (
                  <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                ) : env ? (
                  // Có environment map → dùng MeshRefractionMaterial (thủy tinh/kim cương)
                  <MeshRefractionMaterial
                    color={meshColors[key] || '#b5cbdd'}
                    envMap={env}
                    bounces={4}  // Tăng số lần khúc xạ để lấp lánh hơn
                    ior={2.417}  // Index of Refraction - Kim cương thật: 2.417
                    fresnel={0.1}  // Giảm fresnel để ánh sáng đi qua nhiều hơn
                    aberrationStrength={0.02}  // Hiệu ứng tách màu như kim cương thật
                    fastChroma={true}
                    toneMapped={false}
                    transmission={0.95}  // Gần như trong suốt hoàn toàn
                    thickness={0.2}  // Độ dày mỏng để ánh sáng khúc xạ tốt
                    envMapIntensity={1.5}  // Tăng cường độ phản chiếu môi trường
                  />
                ) : (
                  // Không có env → dùng material thường
                  <meshStandardMaterial
                    color={meshColors[key] || '#b5cbdd'}
                    roughness={0.15}
                    metalness={1}
                  />
                )}
              </instancedMesh>
            );
          }

          // ===== XỬ LÝ MESH THƯỜNG =====
          if (node.isMesh) {
            // Kiểm tra xem có phải là đá quý không (dựa vào tên)
            const isGem = key.toLowerCase().includes('gem') ||
                         key.toLowerCase().includes('diamond') ||
                         key.toLowerCase().includes('stone');

            // Áp dụng diamondScale cho gem meshes (scale mesh transform)
            const originalScale = node.scale;
            const finalScale = isGem
              ? originalScale.clone().multiplyScalar(diamondScale)
              : originalScale;

            if (isGem) {
              console.log(`💎 Gem Mesh "${key}":`, {
                originalScale: originalScale.toArray(),
                diamondScale,
                finalScale: finalScale.toArray()
              });
            }

            return (
              <mesh
                key={key}
                castShadow
                receiveShadow
                geometry={node.geometry}
                position={node.position}
                rotation={node.rotation}
                scale={finalScale}
              >
                {/* Nếu mesh đang được chọn → highlight màu đỏ */}
                {selectedMesh === key ? (
                  <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                ) : isGem && env ? (
                  // Là đá quý + có env → dùng MeshRefractionMaterial
                  <MeshRefractionMaterial
                    color={meshColors[key] || '#b5cbdd'}
                    envMap={env}
                    bounces={4}
                    ior={2.417}  // Kim cương thật
                    fresnel={0.1}
                    aberrationStrength={0.02}
                    fastChroma={true}
                    toneMapped={false}
                    transmission={0.95}
                    thickness={0.2}
                    envMapIntensity={1.5}
                  />
                ) : (
                  // Mesh thường (đai nhẫn) → giữ nguyên material gốc
                  <meshStandardMaterial
                    color={meshColors[key] || material?.color || '#ffaf83'}
                    roughness={material?.roughness ?? 0.3}
                    metalness={material?.metalness ?? 0.8}
                  />
                )}
              </mesh>
            );
          }

          return null;
        })}
      </group>
    </Center>
  );
}
