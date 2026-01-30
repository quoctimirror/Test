/**
 * Ring3D.jsx
 *
 * PURPOSE: Render 3D model of ring/jewelry
 * - Receives list of nodes from GLTF model
 * - Displays each mesh with corresponding material
 * - Supports highlighting selected mesh (red color)
 * - Supports changing color of each mesh via meshColors
 * - Auto-rotate if enabled
 */

import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center, MeshRefractionMaterial } from '@react-three/drei';

export const Ring3D = memo(function Ring3D({ nodes, env, selectedMesh, transform, meshColors, meshVisibility, diamondScale = 1, renderMode = 'smooth' }) {
  const groupRef = useRef();

  // Auto rotate if enabled
  useFrame((_state, delta) => {
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

          // Skip nodes without geometry
          if (!node.geometry) return null;

          // Check visibility state - if hidden, don't render
          const isVisible = meshVisibility?.[key] !== false; // Default true if undefined
          if (!isVisible) return null;

          const material = node.material;

          // ===== HANDLE INSTANCED MESH =====
          // (Mesh duplicated multiple times, high performance)
          if (node.isInstancedMesh) {
            // Apply diamondScale for InstancedMesh (main diamond)
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
                {/* If mesh is selected -> highlight with red color */}
                {selectedMesh === key ? (
                  <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                ) : env ? (
                  // Has environment map -> use MeshRefractionMaterial (glass/diamond)
                  // Converted from diamond-material.dmat (iJewel3D DiamondMaterial)
                  <MeshRefractionMaterial
                    color="#ffffff"  // color: 16777215 from .dmat
                    envMap={env}
                    bounces={5}  // rayBounces: 5 from .dmat
                    ior={2.6}  // refractiveIndex: 2.6 from .dmat
                    fresnel={0.5}  // reflectivity: 0.5 from .dmat
                    aberrationStrength={0}  // Completely DISABLE dispersion/chromatic aberration
                    fastChroma={false}  // High quality
                    toneMapped={false}
                    transmission={1.0}  // Fully transparent (fix transmission: 0 in .dmat)
                    thickness={0.2}  // Moderate thickness
                    envMapIntensity={1.3}  // envMapIntensity: 1.3 from .dmat
                    clearcoat={1}
                    clearcoatRoughness={0}
                  />
                ) : (
                  // No env -> use standard material
                  <meshStandardMaterial
                    color={meshColors[key] || '#b5cbdd'}
                    roughness={0.15}
                    metalness={1}
                  />
                )}
              </instancedMesh>
            );
          }

          // ===== HANDLE REGULAR MESH =====
          if (node.isMesh) {
            // Check if this is a gemstone (based on name)
            const isGem = key.toLowerCase().includes('gem') ||
                         key.toLowerCase().includes('diamond') ||
                         key.toLowerCase().includes('stone');

            // Apply diamondScale for gem meshes (scale mesh transform)
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
                {/* If mesh is selected -> highlight with red color */}
                {selectedMesh === key ? (
                  <meshStandardMaterial
                    color="#ff0000"
                    emissive="#ff0000"
                    emissiveIntensity={0.5}
                  />
                ) : isGem && env ? (
                  // Is gemstone + has env -> use MeshRefractionMaterial
                  // Converted from diamond-material.dmat
                  <MeshRefractionMaterial
                    color="#ffffff"
                    envMap={env}
                    bounces={5}
                    ior={2.6}
                    fresnel={0.5}
                    aberrationStrength={0}  // Completely DISABLED
                    fastChroma={false}
                    toneMapped={false}
                    transmission={1.0}
                    thickness={0.2}
                    envMapIntensity={1.3}
                    clearcoat={1}
                    clearcoatRoughness={0}
                  />
                ) : (
                  // Regular mesh (ring band) -> keep original material
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
});
