import * as THREE from 'three'
import { useEffect } from 'react'
import { useGLTF, MeshRefractionMaterial } from '@react-three/drei'

// Component Ring - render nhẫn kim cương 3D
// Code y hệt như example: https://discourse.threejs.org/t/threejs-gltf-meshes-rendering-position-issue/59997/1
export function Ring({ frame, diamonds, env, selectedMesh, onMaterialsLoad, ...props }) {
  // Load file GLTF và lấy ra nodes (các mesh) và materials (chất liệu)
  const { nodes, materials } = useGLTF('/3-stone-transformed.glb')

  // Đọc materials từ GLTF và gửi lên parent component (để hiển thị trong sidebar)
  useEffect(() => {
    if (onMaterialsLoad && nodes) {
      const meshMaterials = {}

      // Lặp qua tất cả nodes để lấy materials
      Object.keys(nodes).forEach(key => {
        const node = nodes[key]

        // Chỉ xử lý các node là Mesh hoặc InstancedMesh
        if (node.isMesh || node.isInstancedMesh) {
          const material = node.material

          // Tạo object chứa thông tin material
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

      onMaterialsLoad(meshMaterials)
    }
  }, [nodes, onMaterialsLoad])

  // Render 3 meshes chính: mesh_0 (khung), mesh_9 (kim loại trắng), mesh_4 (kim cương)
  return (
    <group {...props} dispose={null}>
      {/* mesh_0: Khung nhẫn chính */}
      <mesh castShadow geometry={nodes.mesh_0.geometry}>
        {selectedMesh === 'mesh_0' ? (
          // Khi được chọn → highlight màu đỏ
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={1}
          />
        ) : (
          // Bình thường → dùng màu frame từ Leva controls
          <meshStandardMaterial
            color={frame}
            roughness={0.15}
            metalness={1}
            envMapIntensity={1.5}
          />
        )}
      </mesh>

      {/* mesh_9: Kim loại trắng */}
      <mesh castShadow geometry={nodes.mesh_9.geometry} material={materials.WhiteMetal}>
        {selectedMesh === 'mesh_9' && (
          // Override material bằng màu đỏ khi được chọn
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={1}
          />
        )}
      </mesh>

      {/* mesh_4: Kim cương (InstancedMesh - 65 viên) */}
      <instancedMesh
        castShadow
        args={[nodes.mesh_4.geometry, null, 65]}
        instanceMatrix={nodes.mesh_4.instanceMatrix}
      >
        {selectedMesh === 'mesh_4' ? (
          // Khi được chọn → màu đỏ
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={1}
            side={THREE.DoubleSide}
          />
        ) : (
          // Bình thường → MeshRefractionMaterial để lấp lánh như kim cương thật
          <MeshRefractionMaterial
            color={diamonds}
            side={THREE.DoubleSide}
            envMap={env}
            aberrationStrength={0.02}
            toneMapped={false}
          />
        )}
      </instancedMesh>
    </group>
  )
}
