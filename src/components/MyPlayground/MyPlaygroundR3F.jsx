import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useState } from 'react'
import { Sky, OrbitControls } from '@react-three/drei'
import './MyPlayground2.css'

const store = createXRStore()

function Scene() {
  const [red, setRed] = useState(false)

  return (
    <>
      {/* Lighting - cải thiện ánh sáng */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Sky - bầu trời để định hướng */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Ground plane - sàn nhà */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid helper - lưới để dễ nhìn */}
      <gridHelper args={[50, 50, '#444444', '#222222']} position={[0, 0.01, 0]} />

      {/* Interactive box */}
      <mesh
        onClick={() => setRed(!red)}
        position={[0, 1, -2]}
        castShadow
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={red ? 'red' : 'blue'}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Thêm các object khác để test */}
      <mesh position={[-1.5, 1, -2]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>

      <mesh position={[1.5, 1, -2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
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
        shadows
        camera={{ position: [0, 1.6, 3], fov: 75 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <XR store={store}>
          <Scene />
        </XR>
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
