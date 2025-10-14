import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { useState } from 'react'
import './MyPlayground2.css'

const store = createXRStore()

export default function MyPlaygroundR3F() {
  const [red, setRed] = useState(false)

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

      <Canvas style={{ width: '100%', height: '100%' }}>
        <XR store={store}>
          <ambientLight intensity={2} />
          <mesh
            onClick={() => setRed(!red)}
            position={[0, 1.6, -1]}
          >
            <boxGeometry />
            <meshBasicMaterial color={red ? 'red' : 'blue'} />
          </mesh>
        </XR>
      </Canvas>
    </div>
  )
}
