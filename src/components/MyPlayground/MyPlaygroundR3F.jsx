import { useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, MeshRefractionMaterial, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { XR, createXRStore } from '@react-three/xr'
import './MyPlayground2.css'

const store = createXRStore({
  emulate: {
    inject: false // Tắt emulator khi test trên Quest thật
  }
})

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
      {/* Background color - Bright gray for better visibility */}
      <color attach="background" args={['#cccccc']} />

      {/* Lighting - VERY BRIGHT for VR debugging */}
      <ambientLight intensity={3} />
      <directionalLight position={[0, 5, 0]} intensity={5} />
      <pointLight position={[0, 0, 2]} intensity={10} color="#ffffff" />

      {/* TEST CUBE - Bright red to verify VR is working */}
      <mesh position={[0, 1.6, -1]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>

      {/* Model - Bigger and closer for VR */}
      <group position={[0, 1.4, -1.5]}>
        <Ring frame={frame} diamonds={diamonds} env={env} scale={0.5} />
      </group>

      {/* Camera Controls - Only for desktop */}
      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />

      {/* Simpler effects for VR performance */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom luminanceThreshold={2.5} intensity={0.5} levels={5} mipmapBlur />
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
      {/* VR Entry Button */}
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
          antialias: true,
          xrCompatible: true  // CRITICAL: Enable WebXR compatibility
        }}
        camera={{ position: [0, 1.6, 5], fov: 50 }}
      >
        <XR store={store}>
          <Scene shadow={shadow} frame={frame} diamonds={diamonds} />
        </XR>
      </Canvas>
    </div>
  )
}
