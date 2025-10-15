import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore, useXRInputSourceState } from '@react-three/xr'
import { useState, Suspense, useRef } from 'react'
import { useGLTF, Environment, MeshRefractionMaterial, useEnvironment, OrbitControls, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import './MyPlayground2.css'

// Tạo XR store để quản lý VR session
const store = createXRStore()

// ============================================
// COMPONENT: Hiển thị VR Controllers (tay cầm)
// ============================================
function VRControllers() {
  // Lấy trạng thái của controller trái và phải
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  return (
    <>
      {/* TỐI ƯU: Tay trái - giảm segments từ 16x16 → 8x8 */}
      {leftController && (
        <mesh position={leftController.position} rotation={leftController.rotation} frustumCulled>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}

      {/* TỐI ƯU: Tay phải - giảm segments từ 16x16 → 8x8 */}
      {rightController && (
        <mesh position={rightController.position} rotation={rightController.rotation} frustumCulled>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      )}
    </>
  )
}

// ============================================
// COMPONENT: Nhẫn 3D với controls đầy đủ
// ============================================
function Ring3D({
  modelPath = '/models/nhanMirror.glb',
  env,
  position,
  rotation,
  scale,
  autoRotate
}) {
  // BƯỚC 1: Load model 3D từ file GLB
  const { nodes } = useGLTF(modelPath)
  const groupRef = useRef()

  // Lấy trạng thái VR controllers (tay phải - controller chính)
  const rightController = useXRInputSourceState('controller', 'right')

  // State cho VR interaction
  const previousControllerPos = useRef(null)
  const vrRotation = useRef([0, 0, 0]) // Rotation riêng cho VR mode

  // BƯỚC 2: Animation loop - chạy mỗi frame
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // ===== VR MODE =====
    if (rightController && rightController.inputSource.gamepad) {
      const gamepad = rightController.inputSource.gamepad

      // --- TRIGGER PRESSED: Di chuyển nhẫn ---
      // Button 0 = trigger button
      const triggerPressed = gamepad.buttons[0]?.pressed

      if (triggerPressed) {
        // Lấy vị trí controller hiện tại
        const controllerPos = new THREE.Vector3()
        controllerPos.setFromMatrixPosition(rightController.object.matrixWorld)

        if (previousControllerPos.current) {
          // Tính delta movement = vị trí mới - vị trí cũ
          const deltaMove = new THREE.Vector3().subVectors(
            controllerPos,
            previousControllerPos.current
          )

          // Di chuyển nhẫn theo delta
          groupRef.current.position.add(deltaMove)
        }

        // Lưu vị trí hiện tại cho frame tiếp theo
        previousControllerPos.current = controllerPos.clone()
      } else {
        // Reset khi thả trigger
        previousControllerPos.current = null
      }

      // --- THUMBSTICK: Rotate nhẫn ---
      // Axes[2] = thumbstick X (trái/phải)
      // Axes[3] = thumbstick Y (lên/xuống)
      const thumbstickX = gamepad.axes[2] || 0
      const thumbstickY = gamepad.axes[3] || 0

      // Rotation speed
      const rotSpeed = 2.0

      // Thumbstick trái/phải -> xoay theo trục Y (quay ngang)
      if (Math.abs(thumbstickX) > 0.1) {
        vrRotation.current[1] += thumbstickX * delta * rotSpeed
        groupRef.current.rotation.y = vrRotation.current[1]
      }

      // Thumbstick lên/xuống -> xoay theo trục X (ngửa/nghiêng)
      if (Math.abs(thumbstickY) > 0.1) {
        vrRotation.current[0] -= thumbstickY * delta * rotSpeed
        groupRef.current.rotation.x = vrRotation.current[0]
      }
    }
    // ===== DESKTOP MODE =====
    else {
      // Auto-rotate: Tự động xoay nhẫn theo trục Y
      if (autoRotate) {
        groupRef.current.rotation.y += delta * 0.5
      }
    }
  })

  return (
    <>
      {/* Group chứa toàn bộ nhẫn - áp dụng position, rotation, scale */}
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
          {/* BƯỚC 3: Duyệt qua tất cả nodes trong model và render */}
          {Object.keys(nodes).map(key => {
            const node = nodes[key]
            if (!node.geometry) return null

            // Kiểm tra xem node có phải là kim cương/gem không
            const isGem = key.toLowerCase().includes('gem') ||
                         key.toLowerCase().includes('diamond') ||
                         key.toLowerCase().includes('stone') ||
                         key.toLowerCase().includes('crystal')

            // TRƯỜNG HỢP 1: Instanced Mesh (nhiều instances cùng geometry)
            if (node.isInstancedMesh) {
              return (
                <instancedMesh
                  key={key}
                  args={[node.geometry, undefined, node.count]}
                  instanceMatrix={node.instanceMatrix}
                  position={node.position}
                  rotation={node.rotation}
                  scale={node.scale}
                  frustumCulled
                >
                  {isGem ? (
                    // TỐI ƯU CỰC MẠNH: Material cho KIM CƯƠNG
                    <MeshRefractionMaterial
                      color="#b5cbdd"           // Màu xanh nhạt
                      envMap={env}              // Environment map để phản chiếu
                      aberrationStrength={0}    // TỐI ƯU: TẮT chromatic aberration
                      toneMapped={false}        // Tắt tone mapping
                      samples={1}               // TỐI ƯU CỰC MẠNH: Chỉ 1 sample!
                      resolution={128}          // TỐI ƯU CỰC MẠNH: Xuống 128
                      fresnel={0.5}             // TỐI ƯU: Giảm fresnel xuống 0.5
                      fastChroma={true}         // TỐI ƯU: Bật fast chroma
                    />
                  ) : (
                    // TỐI ƯU: Material cho DẢI NHẪN - kim loại vàng hồng
                    <meshStandardMaterial
                      color="#ffaf83"           // Màu vàng hồng (rose gold)
                      roughness={0.15}          // Độ nhám thấp = bóng
                      metalness={1.0}           // Kim loại 100%
                      envMap={env}              // Environment map để phản chiếu
                      envMapIntensity={0.7}     // TỐI ƯU: Giảm từ 1.5 → 0.7
                    />
                  )}
                </instancedMesh>
              )
            }

            // TRƯỜNG HỢP 2: Mesh thường
            if (node.isMesh) {
              return (
                <mesh
                  key={key}
                  geometry={node.geometry}
                  position={node.position}
                  rotation={node.rotation}
                  scale={node.scale}
                  frustumCulled
                >
                  {isGem ? (
                    // TỐI ƯU CỰC MẠNH: Material cho KIM CƯƠNG
                    <MeshRefractionMaterial
                      color="#b5cbdd"
                      envMap={env}
                      aberrationStrength={0}    // TỐI ƯU: TẮT chromatic aberration
                      toneMapped={false}
                      samples={1}               // TỐI ƯU CỰC MẠNH: Chỉ 1 sample!
                      resolution={128}          // TỐI ƯU CỰC MẠNH: Xuống 128
                      fresnel={0.5}             // TỐI ƯU: Giảm fresnel xuống 0.5
                      fastChroma={true}         // TỐI ƯU: Bật fast chroma
                    />
                  ) : (
                    // TỐI ƯU: Material cho DẢI NHẪN
                    <meshStandardMaterial
                      color="#ffaf83"
                      roughness={0.15}
                      metalness={1.0}
                      envMap={env}
                      envMapIntensity={0.7}     // TỐI ƯU: Giảm từ 1.5 → 0.7
                    />
                  )}
                </mesh>
              )
            }

            return null
          })}
        </group>
    </>
  )
}

// ============================================
// COMPONENT: VR Control Panel - Điều khiển trong VR như desktop
// ============================================
function VRControlPanel({ position, setPosition, rotation, setRotation, scale, setScale }) {
  return (
    <Html
      position={[-1, 1.5, -0.5]}  // Bên trái user
      transform
      distanceFactor={0.5}
      occlude={false}
      style={{
        width: '350px',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '11px',
        border: '2px solid #1976d2',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1976d2' }}>🎮 VR CONTROLS</h3>

        {/* Position */}
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#4CAF50' }}>📍 Position</strong>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>X: {position[0].toFixed(2)}</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.05"
              value={position[0]}
              onChange={(e) => setPosition([parseFloat(e.target.value), position[1], position[2]])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>Y: {position[1].toFixed(2)}</label>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.05"
              value={position[1]}
              onChange={(e) => setPosition([position[0], parseFloat(e.target.value), position[2]])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>Z: {position[2].toFixed(2)}</label>
            <input
              type="range"
              min="-10"
              max="5"
              step="0.05"
              value={position[2]}
              onChange={(e) => setPosition([position[0], position[1], parseFloat(e.target.value)])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Rotation */}
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#FF9800' }}>🔄 Rotation</strong>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>X: {(rotation[0] * 180 / Math.PI).toFixed(0)}°</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step="0.05"
              value={rotation[0]}
              onChange={(e) => setRotation([parseFloat(e.target.value), rotation[1], rotation[2]])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>Y: {(rotation[1] * 180 / Math.PI).toFixed(0)}°</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step="0.05"
              value={rotation[1]}
              onChange={(e) => setRotation([rotation[0], parseFloat(e.target.value), rotation[2]])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
          <div style={{ marginTop: '3px' }}>
            <label style={{ fontSize: '10px' }}>Z: {(rotation[2] * 180 / Math.PI).toFixed(0)}°</label>
            <input
              type="range"
              min={-Math.PI}
              max={Math.PI}
              step="0.05"
              value={rotation[2]}
              onChange={(e) => setRotation([rotation[0], rotation[1], parseFloat(e.target.value)])}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Scale */}
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#E91E63' }}>📏 Scale: {scale.toFixed(3)}</strong>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '3px', cursor: 'pointer' }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => {
              setPosition([0, 1.6, -1.0])
              setRotation([-Math.PI / 2, 0, 0])
              setScale(0.01)
            }}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🔄 Reset
          </button>
          <button
            onClick={() => {
              setPosition([0, 1.6, -0.5])
            }}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            👁️ To Eye
          </button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '9px', color: '#888', borderTop: '1px solid #333', paddingTop: '5px' }}>
          💡 Trigger = Move | Thumbstick = Rotate
        </div>
      </div>
    </Html>
  )
}

// ============================================
// COMPONENT: Scene - chứa toàn bộ 3D scene
// ============================================
function Scene({ ringPosition, ringRotation, ringScale, autoRotate, setRingPosition, setRingRotation, setRingScale }) {
  // Load environment map cho materials (phản chiếu môi trường)
  const env = useEnvironment({ preset: 'apartment' })

  return (
    <>
      {/* Hiển thị VR Controllers */}
      <VRControllers />

      {/* VR Control Panel - Bảng điều khiển trong VR */}
      <VRControlPanel
        position={ringPosition}
        setPosition={setRingPosition}
        rotation={ringRotation}
        setRotation={setRingRotation}
        scale={ringScale}
        setScale={setRingScale}
      />

      {/* TỐI ƯU: Giảm ánh sáng xuống - chỉ giữ đủ để nhìn rõ */}
      <ambientLight intensity={0.8} />

      {/* TỐI ƯU: 1 directional light thay vì nhiều light sources */}
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow={false} />

      {/* TỐI ƯU: Environment với intensity thấp hơn */}
      <Environment preset="apartment" environmentIntensity={0.25} background={false} />

      {/* TỐI ƯU: Mặt phẳng nền - giảm segments */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled>
        <planeGeometry args={[20, 20, 1, 1]} />
        <meshStandardMaterial
          color="#7a7a7a"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* TỐI ƯU: Grid helper - giảm từ 50x50 → 20x20 ô */}
      <gridHelper args={[20, 20, '#444444', '#222222']} position={[0, 0.01, 0]} />

      {/* NHẪN 3D - component chính */}
      <Suspense fallback={null}>
        <Ring3D
          env={env}
          position={ringPosition}
          rotation={ringRotation}
          scale={ringScale}
          autoRotate={autoRotate}
        />
      </Suspense>
    </>
  )
}

// ============================================
// COMPONENT: Control Panel - UI điều khiển
// ============================================
function ControlPanel({
  position,
  setPosition,
  rotation,
  setRotation,
  scale,
  setScale,
  autoRotate,
  setAutoRotate
}) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      minWidth: '300px',
      zIndex: 999
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>Điều khiển nhẫn</h3>

      {/* Auto Rotate Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: autoRotate ? '#4CAF50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {autoRotate ? '⏸ Tắt Auto Rotate' : '▶ Bật Auto Rotate'}
        </button>
      </div>

      {/* Position Controls */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Vị trí (Position)</strong>
        <div style={{ marginTop: '5px' }}>
          <label>X: {position[0].toFixed(2)}</label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={position[0]}
            onChange={(e) => setPosition([parseFloat(e.target.value), position[1], position[2]])}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Y: {position[1].toFixed(2)}</label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={position[1]}
            onChange={(e) => setPosition([position[0], parseFloat(e.target.value), position[2]])}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Z: {position[2].toFixed(2)}</label>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={position[2]}
            onChange={(e) => setPosition([position[0], position[1], parseFloat(e.target.value)])}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Rotation Controls */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Góc xoay (Rotation)</strong>
        <div style={{ marginTop: '5px' }}>
          <label>X: {(rotation[0] * 180 / Math.PI).toFixed(0)}°</label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.1"
            value={rotation[0]}
            onChange={(e) => setRotation([parseFloat(e.target.value), rotation[1], rotation[2]])}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Y: {(rotation[1] * 180 / Math.PI).toFixed(0)}°</label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.1"
            value={rotation[1]}
            onChange={(e) => setRotation([rotation[0], parseFloat(e.target.value), rotation[2]])}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <label>Z: {(rotation[2] * 180 / Math.PI).toFixed(0)}°</label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.1"
            value={rotation[2]}
            onChange={(e) => setRotation([rotation[0], rotation[1], parseFloat(e.target.value)])}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Scale Control */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Kích thước (Scale): {scale.toFixed(2)}</strong>
        <input
          type="range"
          min="0.05"
          max="0.5"
          step="0.01"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setPosition([0, 1.6, -1.0])  // Cách 1m, tầm mắt 1.6m
          setRotation([-Math.PI / 2, 0, 0])  // Nằm ngang -90°
          setScale(0.01)
          setAutoRotate(false)
        }}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        🔄 Reset về mặc định
      </button>
    </div>
  )
}

// ============================================
// COMPONENT CHÍNH: MyPlaygroundR3F
// ============================================
export default function MyPlaygroundR3F() {
  // State quản lý vị trí nhẫn (X, Y, Z)
  // VR: Đặt nhẫn cách user 1m, cao 1.6m (tầm mắt)
  const [ringPosition, setRingPosition] = useState([0, 1.6, -1.0])

  // State quản lý góc xoay nhẫn (X, Y, Z) - tính bằng radian
  // TỐI ƯU: Nhẫn nằm ngang ban đầu (xoay -90° theo trục X)
  const [ringRotation, setRingRotation] = useState([-Math.PI / 2, 0, 0])

  // State quản lý kích thước nhẫn
  const [ringScale, setRingScale] = useState(0.01)

  // State quản lý auto-rotate (bật/tắt)
  const [autoRotate, setAutoRotate] = useState(false)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Nút Enter VR - hiển thị ở góc dưới bên phải */}
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
        🥽 Enter VR
      </button>

      {/* Control Panel - bảng điều khiển */}
      <ControlPanel
        position={ringPosition}
        setPosition={setRingPosition}
        rotation={ringRotation}
        setRotation={setRingRotation}
        scale={ringScale}
        setScale={setRingScale}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
      />

      {/* Canvas - vùng render 3D */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{
          position: [0, 1.6, 3],  // Vị trí camera (giống chiều cao mắt người)
          fov: 75                 // Field of view
        }}
        dpr={1}                   // TỐI ƯU VR: Fix DPR = 1 (Quest 3 đã có độ phân giải cao)
        performance={{ min: 0.1 }} // TỐI ƯU: Cho phép giảm quality mạnh khi lag
        gl={{
          antialias: true,        // Giữ khử răng cưa
          alpha: false,           // Không cần nền trong suốt
          powerPreference: 'high-performance', // Ưu tiên hiệu suất
          stencil: false,         // Tắt stencil buffer
          depth: true,            // Giữ depth buffer
          logarithmicDepthBuffer: false, // TỐI ƯU: Tắt log depth
          preserveDrawingBuffer: false   // TỐI ƯU: Không lưu buffer
        }}
        frameloop="always"        // TỐI ƯU: Render liên tục cho VR smooth
      >
        {/* TỐI ƯU: OrbitControls - điều khiển camera cho desktop (tự tắt trong VR) */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          enableDamping={false}  // TỐI ƯU: Tắt damping để giảm tính toán
        />

        {/* XR - wrapper cho VR mode */}
        <XR store={store}>
          <Scene
            ringPosition={ringPosition}
            ringRotation={ringRotation}
            ringScale={ringScale}
            autoRotate={autoRotate}
            setRingPosition={setRingPosition}
            setRingRotation={setRingRotation}
            setRingScale={setRingScale}
          />
        </XR>
      </Canvas>
    </div>
  )
}
