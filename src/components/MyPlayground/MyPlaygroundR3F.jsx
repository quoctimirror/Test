import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, MeshRefractionMaterial, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { XR, createXRStore, useXR } from '@react-three/xr'
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

// Debug VR Status Component
function VRDebugLogger() {
  const xrState = useXR()
  const frameCountRef = { current: 0 }

  useEffect(() => {
    console.log('🎮 [VR DEBUG] XR State Changed:', {
      isPresenting: xrState.isPresenting,
      isHandTracking: xrState.isHandTracking,
      session: xrState.session ? 'Active' : 'None',
      mode: xrState.session?.mode || 'N/A'
    })

    if (xrState.isPresenting) {
      console.log('✅ [VR DEBUG] VR MODE IS ACTIVE!')
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
  const env = useEnvironment({ files: '/studio_small_03_4k.hdr' })

  return (
    <>
      <VRDebugLogger />
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
