import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore, Interactive } from '@react-three/xr'
import { useState, Suspense, useRef } from 'react'
import { useGLTF, Environment, MeshRefractionMaterial, useEnvironment, Center, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import './MyPlayground2.css'

const store = createXRStore()

// Component nhẫn tối ưu cho VR - ĐẦY ĐỦ TẤT CẢ
function Ring3D({ modelPath = '/models/nhanMirror.glb', env, autoRotate = false }) {
  const { nodes } = useGLTF(modelPath)
  const groupRef = useRef()

  // Auto-rotate (TẮT mặc định để tương tác được)
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Center top>
      <Interactive onSelect={() => console.log('Ring selected in VR!')}>
        <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.15}>
          {Object.keys(nodes).map(key => {
          const node = nodes[key]
          if (!node.geometry) return null

          // Kiểm tra xem có phải gem/diamond không
          const isGem = key.toLowerCase().includes('gem') ||
                       key.toLowerCase().includes('diamond') ||
                       key.toLowerCase().includes('stone') ||
                       key.toLowerCase().includes('crystal')

          // ===== INSTANCED MESH =====
          if (node.isInstancedMesh) {
            return (
              <instancedMesh
                key={key}
                args={[node.geometry, undefined, node.count]}
                instanceMatrix={node.instanceMatrix}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              >
                {isGem ? (
                  // MeshRefractionMaterial - Khúc xạ như kim cương thật
                  <MeshRefractionMaterial
                    color="#b5cbdd"
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  // Ring Band - ĐẸP với envMap
                  <meshStandardMaterial
                    color="#ffaf83"
                    roughness={0.15}
                    metalness={1.0}
                    envMap={env}
                    envMapIntensity={1.5}
                  />
                )}
              </instancedMesh>
            )
          }

          // ===== MESH THƯỜNG =====
          if (node.isMesh) {
            return (
              <mesh
                key={key}
                geometry={node.geometry}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              >
                {isGem ? (
                  // MeshRefractionMaterial - Khúc xạ như kim cương thật
                  <MeshRefractionMaterial
                    color="#b5cbdd"
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  // Ring Band - ĐẸP với envMap
                  <meshStandardMaterial
                    color="#ffaf83"
                    roughness={0.15}
                    metalness={1.0}
                    envMap={env}
                    envMapIntensity={1.5}
                  />
                )}
              </mesh>
            )
          }

          return null
        })}
        </group>
      </Interactive>
    </Center>
  )
}

function Scene() {
  // Load environment map cho MeshRefractionMaterial
  const env = useEnvironment({ preset: 'apartment' })

  return (
    <>
      {/* Lighting tối ưu cho VR */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[-3, 3, -3]} intensity={1} />

      {/* Environment NHẸ cho VR - vẫn đẹp */}
      <Environment preset="apartment" environmentIntensity={0.4} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0.01, 0]} />

      {/* Ring 3D - NHẪN ĐÃ ĐƯỢC LÀM ĐẸP */}
      <Suspense fallback={null}>
        <Ring3D env={env} />
      </Suspense>
    </>
  )
}

export default function MyPlaygroundR3F() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={() => store.enterVR()}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '20px 40px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        Enter VR
      </button>

      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false
        }}
      >
        {/* OrbitControls cho Desktop - tự động tắt trong VR */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />

        <XR store={store}>
          <Scene />
        </XR>
      </Canvas>
    </div>
  )
}
