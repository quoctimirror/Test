import { useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, AccumulativeShadows, RandomizedLight, MeshRefractionMaterial, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import { XR, createXRStore } from '@react-three/xr'
import './MyPlayground2.css'

const store = createXRStore()

function Ring({ frame, diamonds, env, ...props }) {
  const { nodes } = useGLTF('/models/nhanMirror.glb')

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map(key => {
        const node = nodes[key]

        // Bỏ qua các node không có geometry
        if (!node.geometry) return null

        const material = node.material

        // ===== XỬ LÝ INSTANCED MESH =====
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
              <MeshRefractionMaterial
                color={diamonds}
                side={THREE.DoubleSide}
                envMap={env}
                aberrationStrength={0.02}
                toneMapped={false}
              />
            </instancedMesh>
          )
        }

        // ===== XỬ LÝ MESH THƯỜNG =====
        if (node.isMesh) {
          // Kiểm tra xem có phải là đá quý không
          const isGem = key.toLowerCase().includes('gem') ||
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
              {isGem && env ? (
                <MeshRefractionMaterial
                  color={diamonds}
                  envMap={env}
                  aberrationStrength={0.02}
                  toneMapped={false}
                />
              ) : (
                <meshStandardMaterial
                  color={frame}
                  roughness={0.15}
                  metalness={1}
                />
              )}
            </mesh>
          )
        }

        return null
      })}
    </group>
  )
}

function Scene({ shadow, frame, diamonds }) {
  const env = useEnvironment({ files: '/studio_small_03_4k.hdr' })

  return (
    <>
      {/* Background color */}
      <color attach="background" args={['#ffffff']} />

      {/* Lighting */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />

      {/* Model - Scale 0.1 và position như SimpleMeshInspector */}
      <group position={[0, -0.25, 0]}>
        <Center top>
          <Ring frame={frame} diamonds={diamonds} env={env} scale={0.1} position={[0, -0.12, 0]} />
        </Center>
      </group>

      {/* Camera Controls */}
      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />

      {/* Post-processing Effects */}
      <EffectComposer disableNormalPass={false} multisampling={4}>
        {/* N8AO: Ambient Occlusion */}
        <N8AO aoRadius={0.15} intensity={4} distanceFalloff={2} />

        {/* Bloom: Hiệu ứng lấp lánh */}
        <Bloom luminanceThreshold={1.5} intensity={1.2} levels={9} mipmapBlur />

        {/* ToneMapping */}
        <ToneMapping />
      </EffectComposer>

      {/* Environment map */}
      <Environment map={env} background={false} />
    </>
  )
}

export default function MyPlaygroundR3F() {
  const [shadow] = useState('#000000')
  const [frame] = useState('#ffaf83')      // Rose Gold 2
  const [diamonds] = useState('#b5cbdd')   // Màu xanh nhạt cho kim cương
  const [isEnteringVR, setIsEnteringVR] = useState(false)

  const handleEnterVR = async () => {
    if (isEnteringVR) return // Prevent multiple clicks

    try {
      setIsEnteringVR(true)
      await store.enterVR()
    } catch (error) {
      console.error('Failed to enter VR:', error)
      alert('Cannot enter VR mode. Please check if your device supports WebXR.')
    } finally {
      setIsEnteringVR(false)
    }
  }

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
        <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>React Three Fiber + XR</h3>
        <p style={{ margin: 0, fontSize: '12px' }}>Drag to rotate, scroll to zoom</p>
      </div>

      {/* VR Entry Button - theo docs @react-three/xr */}
      <button
        onClick={handleEnterVR}
        disabled={isEnteringVR}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '15px 30px',
          backgroundColor: isEnteringVR ? '#666' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isEnteringVR ? 'not-allowed' : 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          opacity: isEnteringVR ? 0.6 : 1
        }}
      >
        {isEnteringVR ? '⏳ Entering VR...' : '🥽 Enter VR'}
      </button>

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          xrCompatible: true  // CRITICAL: Enable WebXR compatibility
        }}
        camera={{ position: [-5, 5, 14], fov: 20 }}
      >
        <XR store={store}>
          <Scene shadow={shadow} frame={frame} diamonds={diamonds} />
        </XR>
      </Canvas>
    </div>
  )
}
