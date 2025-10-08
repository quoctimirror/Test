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

export function Ring3D({ nodes, env, selectedMesh, transform, meshColors }) {
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

          const material = node.material;

          // ===== XỬ LÝ INSTANCED MESH =====
          // (Mesh được duplicate nhiều lần, hiệu năng cao)
          if (node.isInstancedMesh) {
            return (
              <instancedMesh
                key={key}
                castShadow
                receiveShadow
                args={[node.geometry, undefined, node.count]}
                instanceMatrix={node.instanceMatrix}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
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
                    color={meshColors[key] || material?.color || '#b5cbdd'}
                    side={THREE.DoubleSide}
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  // Không có env → dùng material thường
                  <meshStandardMaterial
                    color={meshColors[key] || material?.color || '#b5cbdd'}
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

            return (
              <mesh
                key={key}
                castShadow
                receiveShadow
                geometry={node.geometry}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
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
                    color={meshColors[key] || material?.color || '#b5cbdd'}
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  // Mesh thường → dùng meshStandardMaterial
                  <meshStandardMaterial
                    color={meshColors[key] || material?.color || '#ffaf83'}
                    roughness={0.15}
                    metalness={1}
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
