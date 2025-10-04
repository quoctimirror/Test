import * as THREE from 'three'
import { useEffect } from 'react'
import { useGLTF, MeshRefractionMaterial } from '@react-three/drei'

export function DynamicRing({ selectedMesh, onMaterialsLoad, onMeshListLoad, modelPath, env, ...props }) {
  // Load file GLTF và lấy ra nodes (các mesh) và materials (chất liệu)
  const { nodes, materials } = useGLTF(modelPath || '/myfav.glb')

  // console.log('DynamicRing - env:', env)
  console.log('DynamicRing - nodes:', Object.keys(nodes))

  // Đọc danh sách meshes và materials DYNAMIC từ GLTF
  useEffect(() => {
    if (nodes) {
      const meshList = []
      const meshMaterials = {}

      // Lặp qua tất cả nodes
      Object.keys(nodes).forEach(key => {
        const node = nodes[key]

        // Chỉ xử lý các node là Mesh hoặc InstancedMesh
        if (node.isMesh || node.isInstancedMesh) {
          // Thêm vào danh sách meshes
          meshList.push({
            name: key,
            type: node.type
          })

          // Lấy material info
          const material = node.material

          meshMaterials[key] = {
            nodeType: node.type,
            materialType: material?.type || 'No material',
            // Lấy tất cả properties của material
            ...(material && {
              color: material.color ? `#${material.color.getHexString()}` : undefined,
              roughness: material.roughness,
              metalness: material.metalness,
              opacity: material.opacity,
              transparent: material.transparent,
              side: material.side === 0 ? 'FrontSide' : material.side === 1 ? 'BackSide' : 'DoubleSide',
              emissive: material.emissive ? `#${material.emissive.getHexString()}` : undefined,
              emissiveIntensity: material.emissiveIntensity,
              envMapIntensity: material.envMapIntensity,
              wireframe: material.wireframe,
              vertexColors: material.vertexColors,
              fog: material.fog,
            }),
            // Nếu là InstancedMesh, thêm instance count
            ...(node.isInstancedMesh && {
              instanceCount: node.count
            })
          }

          // Loại bỏ các properties undefined
          Object.keys(meshMaterials[key]).forEach(k => {
            if (meshMaterials[key][k] === undefined) {
              delete meshMaterials[key][k]
            }
          })
        }
      })

      // Gửi data lên parent
      if (onMeshListLoad) onMeshListLoad(meshList)
      if (onMaterialsLoad) onMaterialsLoad(meshMaterials)
    }
  }, [nodes, onMeshListLoad, onMaterialsLoad])

  // Render tất cả meshes từ GLTF
  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map(key => {
        const node = nodes[key]
        const material = node.material

        // console.log(`Node: ${key}, type: ${node.type}, isMesh: ${node.isMesh}, isInstancedMesh: ${node.isInstancedMesh}, material:`, material?.color)

        // Check InstancedMesh TRƯỚC (vì InstancedMesh cũng có isMesh = true)
        if (node.isInstancedMesh) {
          return (
            <instancedMesh
              key={key}
              castShadow
              receiveShadow
              args={[node.geometry, null, node.count]}
              instanceMatrix={node.instanceMatrix}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            >
              {selectedMesh === key ? (
                <meshStandardMaterial
                  color="#ff0000"
                  emissive="#ff0000"
                  emissiveIntensity={0.5}
                  roughness={0.15}
                  metalness={1}
                  side={THREE.DoubleSide}
                />
              ) : env ? (
                <MeshRefractionMaterial
                  color={material?.color || '#ffffff'}
                  side={THREE.DoubleSide}
                  envMap={env}
                  aberrationStrength={0.02}
                  toneMapped={false}
                />
              ) : (
                <meshStandardMaterial
                  color={material?.color || '#ffffff'}
                  roughness={0.15}
                  metalness={1}
                  envMapIntensity={2}
                  side={THREE.DoubleSide}
                />
              )}
            </instancedMesh>
          )
        }

        // Sau đó mới check Mesh thường
        if (node.isMesh) {
          // Kiểm tra xem mesh có phải là kim cương/gem không (theo tên)
          const isGemMesh = key.toLowerCase().includes('gem') ||
                           key.toLowerCase().includes('diamond') ||
                           key.toLowerCase().includes('stone')

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
              {/* Render material đẹp dựa vào loại material gốc */}
              {selectedMesh === key ? (
                // Highlight màu đỏ khi được chọn
                <meshStandardMaterial
                  color="#ff0000"
                  emissive="#ff0000"
                  emissiveIntensity={0.5}
                  roughness={0.15}
                  metalness={1}
                />
              ) : isGemMesh && env ? (
                // Nếu là gem/diamond và có env → dùng MeshRefractionMaterial
                <MeshRefractionMaterial
                  color={material?.color || '#ffffff'}
                  envMap={env}
                  aberrationStrength={0.02}
                  toneMapped={false}
                />
              ) : (
                // Render material đẹp - LUÔN override roughness/metalness (giống code mẫu)
                <meshStandardMaterial
                  color={material?.color ? material.color : '#f0f0f0'}
                  roughness={0.15}        // Giống code mẫu: roughness={0.15}
                  metalness={1}           // Kim loại 100%
                  envMapIntensity={1.5}   // Giống code mẫu: envMapIntensity={1.5}
                  transparent={material?.transparent}
                  opacity={material?.opacity ?? 1}
                />
              )}
            </mesh>
          )
        }
        return null;
      })}
    </group>
  )
}
