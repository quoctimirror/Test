import { useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, AccumulativeShadows, RandomizedLight, MeshRefractionMaterial, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import './MyPlayground2.css'

function Ring({ frame, diamonds, env, ...props }) {
  const { nodes, materials } = useGLTF('/models/nhanMirror.glb')

  // Find meshes from the model
  const meshes = []
  if (nodes) {
    Object.keys(nodes).forEach(key => {
      if (nodes[key].geometry) {
        meshes.push(nodes[key])
      }
    })
  }

  return (
    <group {...props} dispose={null}>
      {meshes.map((mesh, idx) => {
        // Check if it's likely a diamond (small, many instances) or metal frame
        const isDiamond = mesh.name?.toLowerCase().includes('diamond') ||
                         mesh.name?.toLowerCase().includes('stone') ||
                         mesh.instanceMatrix

        if (mesh.instanceMatrix) {
          // Instanced mesh (diamonds)
          return (
            <instancedMesh
              key={idx}
              castShadow
              args={[mesh.geometry, null, mesh.instanceMatrix.count]}
              instanceMatrix={mesh.instanceMatrix}
            >
              <MeshRefractionMaterial
                color={diamonds}
                side={THREE.DoubleSide}
                envMap={env}
                aberrationStrength={0.02}
                toneMapped={false}
              />
            </instancedMesh>
          )
        } else if (isDiamond) {
          // Single diamond mesh
          return (
            <mesh key={idx} castShadow geometry={mesh.geometry}>
              <MeshRefractionMaterial
                color={diamonds}
                side={THREE.DoubleSide}
                envMap={env}
                aberrationStrength={0.02}
                toneMapped={false}
              />
            </mesh>
          )
        } else {
          // Metal frame
          return (
            <mesh key={idx} castShadow geometry={mesh.geometry}>
              <meshStandardMaterial
                color={frame}
                roughness={0.15}
                metalness={1}
                envMapIntensity={1.5}
              />
            </mesh>
          )
        }
      })}
    </group>
  )
}

function Scene({ shadow, frame, diamonds }) {
  const env = useEnvironment({
    files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr'
  })

  return (
    <>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />

      <group position={[0, -0.25, 0]}>
        <Center top position={[0, -0.12, 0]} rotation={[-0.1, 0, 0.085]}>
          <Ring frame={frame} diamonds={diamonds} env={env} scale={10} />
        </Center>

        <AccumulativeShadows temporal frames={100} color={shadow} opacity={1.05}>
          <RandomizedLight radius={5} position={[10, 5, -5]} />
        </AccumulativeShadows>
      </group>

      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} />

      <EffectComposer>
        <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />
        <Bloom luminanceThreshold={3.5} intensity={0.85} levels={9} mipmapBlur />
        <ToneMapping />
      </EffectComposer>

      <Environment map={env} background blur={1} />
    </>
  )
}

export default function MyPlaygroundR3F() {
  const [shadow] = useState('#000000')
  const [frame] = useState('#fff0f0')
  const [diamonds] = useState('#ffffff')

  return (
    <div className="myplayground2-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Desktop Control Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 999,
        fontFamily: 'monospace'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>React Three Fiber</h3>
        <p style={{ margin: 0, fontSize: '12px' }}>Drag to rotate, scroll to zoom</p>
      </div>

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
        camera={{ position: [-5, 5, 14], fov: 20 }}
      >
        <Scene shadow={shadow} frame={frame} diamonds={diamonds} />
      </Canvas>
    </div>
  )
}
