import { Center, OrbitControls, AccumulativeShadows, RandomizedLight, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { DynamicRing } from '@components/DynamicRing'
import { useRingTransform } from '../hooks/useRingTransform'

export function DynamicSceneSmooth({ selectedMesh, onMaterialsLoad, onMeshListLoad, modelPath }) {
  const { frame, diamonds } = useControls({
    frame: '#fff0f0',
    diamonds: '#ffffff'
  })
  const env = useEnvironment({ files: '/studio_env/provence_studio_4k.hdr' })
  // const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  // Hook để kiểm soát rotation, position, scale của nhẫn
  const ringTransform = useRingTransform()

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <group position={[0, -0.25, 0]}>
        {/* Center với rotation, position, scale từ Leva controls */}
        <Center top position={ringTransform.position} rotation={ringTransform.rotation}>
          <DynamicRing
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            onMeshListLoad={onMeshListLoad}
            modelPath={modelPath}
            env={env}
            scale={ringTransform.scale}
          />
        </Center>
      </group>
      {/* OrbitControls: xoay camera bằng chuột trái, pan bằng chuột phải */}
      <OrbitControls makeDefault />
      {/* Environment: dùng cho phản chiếu và hiển thị background */}
      <Environment map={env}  />
    </>
  )
}

export function DynamicSceneFull({ selectedMesh, onMaterialsLoad, onMeshListLoad, modelPath }) {
  const { shadow, frame, diamonds } = useControls({
    shadow: '#000000',
    frame: '#fff0f0',
    diamonds: '#ffffff'
  })
  const env = useEnvironment({ files: '/studio_env/provence_studio_4k.hdr' })

  // Hook để kiểm soát rotation, position, scale của nhẫn
  const ringTransform = useRingTransform()

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <group position={[0, -0.25, 0]}>
        {/* Center với rotation, position, scale từ Leva controls */}
        <Center top position={ringTransform.position} rotation={ringTransform.rotation}>
          <DynamicRing
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            onMeshListLoad={onMeshListLoad}
            modelPath={modelPath}
            env={env}
            scale={ringTransform.scale}
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
