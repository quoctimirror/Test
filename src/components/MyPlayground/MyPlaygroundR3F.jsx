import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Center, OrbitControls, MeshRefractionMaterial, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './MyPlayground2.css'

const store = createXRStore({
  emulate: {
    inject: false // Tắt emulator khi test trên Quest thật
  }
})

function Ring({ frame, diamonds, useRefraction = false, ...props }) {
  const { nodes } = useGLTF('/models/nhanMirror.glb')
  const { scene } = useThree()
  const envMap = scene.environment  // Get environment map từ scene

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map(key => {
        const node = nodes[key]

        // Bỏ qua các node không có geometry
        if (!node.geometry) return null

        // ===== XỬ LÝ INSTANCED MESH (Kim cương nhiều viên) =====
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
              {useRefraction && envMap ? (
                // Desktop: MeshRefractionMaterial (kim cương thật, khúc xạ ánh sáng)
                <MeshRefractionMaterial
                  color={diamonds}
                  envMap={envMap}
                  side={THREE.DoubleSide}
                  aberrationStrength={0.05}      // Tăng hiệu ứng lăng kính
                  ior={2.4}                      // Index of Refraction của kim cương
                  fresnel={0.1}                  // Fresnel effect
                  toneMapped={false}
                />
              ) : (
                // VR: Standard material nhẹ hơn nhưng vẫn đẹp
                <meshStandardMaterial
                  color={diamonds}
                  roughness={0.05}
                  metalness={0.95}
                  envMapIntensity={1.5}
                  emissive={diamonds}
                  emissiveIntensity={0.15}
                />
              )}
            </instancedMesh>
          )
        }

        // ===== XỬ LÝ MESH THƯỜNG =====
        if (node.isMesh) {
          // Kiểm tra xem có phải là đá quý không (gem, diamond, stone)
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
              {isGem && useRefraction && envMap ? (
                // Kim cương đơn lẻ: MeshRefractionMaterial
                <MeshRefractionMaterial
                  color={diamonds}
                  envMap={envMap}
                  aberrationStrength={0.05}      // Hiệu ứng lăng kính mạnh hơn
                  ior={2.4}                      // Index of Refraction kim cương
                  fresnel={0.1}                  // Fresnel effect
                  toneMapped={false}
                />
              ) : (
                // Kim loại hoặc VR mode: Standard material
                <meshStandardMaterial
                  color={isGem ? diamonds : frame}
                  roughness={isGem ? 0.05 : 0.15}
                  metalness={isGem ? 0.95 : 1}
                  envMapIntensity={1.5}
                  emissive={isGem ? diamonds : undefined}
                  emissiveIntensity={isGem ? 0.15 : 0}
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
  const xrState = useXR()
  const isVR = xrState.isPresenting

  return (
    <>
      <VRDebugLogger />

      {/* Background - Meta Quest style with hex number */}
      <color args={[0xffffff]} attach="background" />

      {/* Camera - Explicit position for VR (Meta Quest style) */}
      <PerspectiveCamera makeDefault position={[0, 1.6, 2]} fov={75} />

      {/* Lighting - Brighter for better visibility */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-5, 3, -3]} intensity={1} />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} />

      {/* Environment - Must come BEFORE Ring to be available */}
      <Environment preset="city" background={false} />

      {/* Ring Model - Close to camera for VR */}
      <group position={[0, 1.4, -1]}>
        <Ring frame={frame} diamonds={diamonds} scale={0.3} useRefraction={!isVR} />
      </group>

      {/* Camera Controls - Only for desktop */}
      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />

      {/* VR-Optimized Effects */}
      <EffectComposer disableNormalPass multisampling={isVR ? 0 : 2}>
        {/* Bloom effect - lighter settings for VR */}
        <Bloom
          luminanceThreshold={isVR ? 2.5 : 1.5}
          intensity={isVR ? 0.6 : 1.2}
          levels={isVR ? 5 : 7}
          mipmapBlur
        />
      </EffectComposer>
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
