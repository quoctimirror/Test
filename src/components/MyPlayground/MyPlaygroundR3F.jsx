import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, MeshRefractionMaterial, Environment, PerspectiveCamera } from '@react-three/drei'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './MyPlayground2.css'

const store = createXRStore({
  emulate: {
    inject: false // Tắt emulator khi test trên Quest thật
  }
})

function Ring({ frame, diamonds, ...props }) {
  const { nodes } = useGLTF('/models/nhanMirror.glb')

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map(key => {
        const node = nodes[key]

        // Bỏ qua các node không có geometry
        if (!node.geometry) return null

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
              <meshStandardMaterial
                color={diamonds}
                roughness={0.1}
                metalness={0.9}
                envMapIntensity={1}
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
              <meshStandardMaterial
                color={isGem ? diamonds : frame}
                roughness={isGem ? 0.05 : 0.15}
                metalness={isGem ? 0.95 : 1}
                envMapIntensity={1.5}
              />
            </mesh>
          )
        }

        return null
      })}
    </group>
  )
}

// Debug VR Status Component
function VRDebugLogger() {
  const xrState = useXR()
  const frameCountRef = { current: 0 }

  useEffect(() => {
    const presenting = xrState.isPresenting
    console.log('🎮 [VR DEBUG] XR State Changed:', {
      isPresenting: presenting,
      isHandTracking: xrState.isHandTracking,
      session: xrState.session ? 'Active' : 'None',
      mode: xrState.session?.mode || 'N/A'
    })

    if (presenting) {
      console.log('✅ [VR DEBUG] ============== VR MODE IS ACTIVE! ==============')
      console.log('✅ [VR DEBUG] You should see objects now!')
    } else {
      console.log('⚪ [VR DEBUG] Desktop mode (not in VR)')
    }
  }, [xrState.isPresenting, xrState.session])

  useFrame(({ camera, gl }) => {
    frameCountRef.current++

    // Log every 60 frames (roughly once per second at 60fps)
    if (frameCountRef.current % 60 === 0) {
      console.log('🔄 [VR DEBUG] Frame #' + frameCountRef.current, {
        isPresenting: xrState.isPresenting,
        cameraPos: `(${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`,
        renderer: gl.xr?.isPresenting ? 'XR' : 'Regular'
      })
    }
  })

  return null
}

function Scene({ shadow, frame, diamonds }) {
  return (
    <>
      <VRDebugLogger />

      {/* Background - Meta Quest style with hex number */}
      <color args={[0xcccccc]} attach="background" />

      {/* Camera - Explicit position for VR (Meta Quest style) */}
      <PerspectiveCamera makeDefault position={[0, 1.6, 2]} fov={75} />

      {/* Simple ambient lighting */}
      <ambientLight intensity={2} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      {/* TEST CUBE - Red cube at eye level */}
      <mesh position={[0, 1.6, -1]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </mesh>

      {/* Ring Model - Close to camera for VR */}
      <group position={[0.5, 1.4, -1.5]}>
        <Ring frame={frame} diamonds={diamonds} scale={0.3} />
      </group>

      {/* Camera Controls - Only for desktop */}
      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />

      {/* Environment - Use preset instead of HDR file (faster loading) */}
      <Environment preset="city" background={false} />
    </>
  )
}

export default function MyPlaygroundR3F() {
  const [shadow] = useState('#000000')
  const [frame] = useState('#ffaf83')      // Rose Gold 2
  const [diamonds] = useState('#b5cbdd')   // Màu xanh nhạt cho kim cương
  const [isEnteringVR, setIsEnteringVR] = useState(false)
  const [debugLogs, setDebugLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const newLog = { timestamp, message, type }
    console.log(`[${timestamp}] ${message}`)
    setDebugLogs(prev => [...prev.slice(-8), newLog]) // Keep last 9 logs
  }

  useEffect(() => {
    addLog('🚀 MyPlaygroundR3F mounted!', 'success')
    addLog('🔍 WebXR available: ' + ('xr' in navigator), 'info')

    if (!('xr' in navigator)) {
      addLog('⚠️ WebXR NOT supported in this browser!', 'error')
    }
  }, [])

  const handleEnterVR = async () => {
    addLog('🔵 Enter VR button clicked!', 'info')

    if (isEnteringVR) {
      addLog('⚠️ Already entering VR...', 'warning')
      return
    }

    try {
      addLog('🟢 Starting VR session...', 'info')
      setIsEnteringVR(true)

      await store.enterVR()

      addLog('✅ VR session started!', 'success')
    } catch (error) {
      addLog('❌ VR Failed: ' + error.message, 'error')
      console.error('Full error:', error)
    } finally {
      setIsEnteringVR(false)
      addLog('🟡 Process completed', 'info')
    }
  }

  return (
    <div className="myplayground2-container" style={{ width: '100vw', height: '100vh' }}>
      {/* Debug Logs Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        zIndex: 1000,
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#00ff00' }}>
          🔍 VR DEBUG LOGS
        </div>
        {debugLogs.map((log, i) => (
          <div key={i} style={{
            marginBottom: '5px',
            padding: '5px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
            color: log.type === 'error' ? '#ff5555' :
                   log.type === 'success' ? '#55ff55' :
                   log.type === 'warning' ? '#ffaa00' : '#aaaaaa'
          }}>
            <span style={{ opacity: 0.6 }}>[{log.timestamp}]</span> {log.message}
          </div>
        ))}
        {debugLogs.length === 0 && (
          <div style={{ opacity: 0.5 }}>Waiting for events...</div>
        )}
      </div>

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
          xrCompatible: true  // Enable WebXR
        }}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh'
        }}
      >
        <XR store={store}>
          <Scene shadow={shadow} frame={frame} diamonds={diamonds} />
        </XR>
      </Canvas>
    </div>
  )
}
