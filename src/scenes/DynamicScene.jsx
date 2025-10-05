import { Center, OrbitControls, AccumulativeShadows, RandomizedLight, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { DynamicRing } from '@components/DynamicRing'
import { useRingTransform } from '../hooks/useRingTransform'
import { useState, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function DynamicSceneSmooth({ selectedMesh, onMaterialsLoad, onMeshListLoad, modelPath }) {
  const [meshList, setMeshList] = useState([])
  const env = useEnvironment({ files: '/studio_env/env_metal_1.exr' })
  // const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  // Hook để kiểm soát rotation, position, scale của nhẫn
  const ringTransform = useRingTransform()

  // Ref cho group để auto rotate
  const centerRef = useRef()

  // Auto rotate quanh trục Z
  useFrame((state, delta) => {
    if (ringTransform.autoRotateY && centerRef.current) {
      centerRef.current.rotation.y += delta * 0.5 // 0.5 rad/s
    }
  })

  // Tạo color schema cho từng mesh với màu mặc định
  const colorSchema = useMemo(() => {
    const schema = {}
    meshList.forEach(mesh => {
      const name = mesh.name.toLowerCase()
      let defaultColor = '#ffffff'

      // Set màu mặc định theo tên mesh
      if (name.includes('ring')) {
        defaultColor = '#ffaf83' // ring band color
      } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
        defaultColor = '#b5cbdd' // diamond color
      }

      schema[mesh.name] = { value: defaultColor, label: mesh.name }
    })
    return schema
  }, [meshList])

  // Tạo color controls động cho từng mesh
  const colorControls = useControls('Mesh Colors', colorSchema, [colorSchema])

  // Callback để nhận danh sách mesh và tạo color controls
  const handleMeshListLoad = (list) => {
    setMeshList(list)
    if (onMeshListLoad) onMeshListLoad(list)
  }

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <group position={[0, -0.25, 0]}>
        {/* Center với rotation, position, scale từ Leva controls */}
        <Center ref={centerRef} top position={ringTransform.position} rotation={ringTransform.rotation}>
          <DynamicRing
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            onMeshListLoad={handleMeshListLoad}
            modelPath={modelPath}
            env={env}
            scale={ringTransform.scale}
            meshColors={colorControls}
            debugMode={ringTransform.debugMode}
          />
        </Center>
      </group>
      {/* OrbitControls: xoay camera bằng chuột trái, pan bằng chuột phải */}
      <OrbitControls makeDefault />
      {/* Environment: dùng cho phản chiếu và hiển thị background */}
      <Environment map={env} background/>
    </>
  )
}

export function DynamicSceneFull({ selectedMesh, onMaterialsLoad, onMeshListLoad, modelPath }) {
  const [meshList, setMeshList] = useState([])
  const { shadow } = useControls({
    shadow: '#000000'
  })
  // const env = useEnvironment({ files: '/studio_env/env_metal.hdr' })

  const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  // Hook để kiểm soát rotation, position, scale của nhẫn
  const ringTransform = useRingTransform()

  // Ref cho group để auto rotate
  const centerRef = useRef()

  // Auto rotate quanh trục Y
  useFrame((state, delta) => {
    if (ringTransform.autoRotateY && centerRef.current) {
      centerRef.current.rotation.y += delta * 0.5 // 0.5 rad/s
    }
  })

  // Tạo color schema cho từng mesh với màu mặc định
  const colorSchema = useMemo(() => {
    const schema = {}
    meshList.forEach(mesh => {
      const name = mesh.name.toLowerCase()
      let defaultColor = '#ffffff'

      // Set màu mặc định theo tên mesh
      if (name.includes('ring')) {
        defaultColor = '#ffaf83' // ring band color
      } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
        defaultColor = '#b5cbdd' // diamond color
      }

      schema[mesh.name] = { value: defaultColor, label: mesh.name }
    })
    return schema
  }, [meshList])

  // Tạo color controls động cho từng mesh
  const colorControls = useControls('Mesh Colors', colorSchema, [colorSchema])

  // Callback để nhận danh sách mesh và tạo color controls
  const handleMeshListLoad = (list) => {
    setMeshList(list)
    if (onMeshListLoad) onMeshListLoad(list)
  }

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <group position={[0, -0.25, 0]}>
        {/* Center với rotation, position, scale từ Leva controls */}
        <Center ref={centerRef} top position={ringTransform.position} rotation={ringTransform.rotation}>
          <DynamicRing
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            onMeshListLoad={handleMeshListLoad}
            modelPath={modelPath}
            env={env}
            scale={ringTransform.scale}
            meshColors={colorControls}
            debugMode={ringTransform.debugMode}
          />
        </Center>
        <AccumulativeShadows temporal frames={100} color={shadow} opacity={1.05}>
          <RandomizedLight radius={5} position={[10, 5, -5]} />
        </AccumulativeShadows>
      </group>
      {/* OrbitControls: xoay camera bằng chuột trái, pan bằng chuột phải */}
      <OrbitControls makeDefault />
      <EffectComposer>
        <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />
        <Bloom luminanceThreshold={3.5} intensity={0.85} levels={9} mipmapBlur />
        <ToneMapping />
      </EffectComposer>
      {/* Environment: dùng cho phản chiếu và hiển thị background */}
      <Environment map={env} background />
    </>
  )
}
