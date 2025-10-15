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
      {/* TỐI ƯU CỰC MẠNH: Tay trái - giảm xuống 6x6 segments */}
      {leftController && (
        <mesh position={leftController.position} rotation={leftController.rotation} frustumCulled>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}

      {/* TỐI ƯU CỰC MẠNH: Tay phải - giảm xuống 6x6 segments */}
      {rightController && (
        <mesh position={rightController.position} rotation={rightController.rotation} frustumCulled>
          <sphereGeometry args={[0.04, 6, 6]} />
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
                    // TỐI ƯU CỰC MẠNH: Material cho DẢI NHẪN
                    <meshStandardMaterial
                      color="#ffaf83"           // Màu vàng hồng (rose gold)
                      roughness={0.15}          // Độ nhám thấp = bóng
                      metalness={1.0}           // Kim loại 100%
                      envMap={env}              // Environment map để phản chiếu
                      envMapIntensity={0.5}     // TỐI ƯU CỰC MẠNH: Giảm xuống 0.5
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
                    // TỐI ƯU CỰC MẠNH: Material cho DẢI NHẪN
                    <meshStandardMaterial
                      color="#ffaf83"
                      roughness={0.15}
                      metalness={1.0}
                      envMap={env}
                      envMapIntensity={0.5}     // TỐI ƯU CỰC MẠNH: Giảm xuống 0.5
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
// COMPONENT: VR Info Panel - Bảng thông tin 3D
// ============================================
function VRInfoPanel({ position, rotation, scale }) {
  // TỐI ƯU: Chỉ update text mỗi 100ms thay vì mỗi frame
  const infoText = `POS: ${position[0].toFixed(1)}, ${position[1].toFixed(1)}, ${position[2].toFixed(1)}
ROT: ${(rotation[0] * 180 / Math.PI).toFixed(0)}°, ${(rotation[1] * 180 / Math.PI).toFixed(0)}°, ${(rotation[2] * 180 / Math.PI).toFixed(0)}°
SCALE: ${scale.toFixed(3)}`

  return (
    <group position={[-1.2, 1.8, -0.8]}>
      {/* Background - TỐI ƯU: Nhỏ hơn */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.5, 0.35]} />
        <meshBasicMaterial color="#000000" opacity={0.85} transparent />
      </mesh>
      {/* TỐI ƯU: Chỉ 1 outline thay vì 4 boxes */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.5, 0.35)]} />
        <lineBasicMaterial attach="material" color="#1976d2" linewidth={2} />
      </lineSegments>
      {/* Text - TỐI ƯU: Font nhỏ hơn */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.028}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.48}
        textAlign="left"
        lineHeight={1.3}
      >
        {infoText}
      </Text>
    </group>
  )
}

// ============================================
// COMPONENT: VR Control Buttons - Nút điều khiển 3D
// ============================================
function VRControlButtons({ position, setPosition, setRotation, setScale, scale }) {
  const buttonMaterial = useRef()
  const [hovered, setHovered] = useState(null)

  return (
    <group position={[1.2, 1.5, -0.8]}>
      {/* Background - TỐI ƯU: Nhỏ hơn */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.45, 0.6]} />
        <meshBasicMaterial color="#000000" opacity={0.85} transparent />
      </mesh>
      {/* TỐI ƯU: Chỉ 1 outline */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.45, 0.6)]} />
        <lineBasicMaterial attach="material" color="#4CAF50" linewidth={2} />
      </lineSegments>

      {/* Title - TỐI ƯU: Font nhỏ hơn */}
      <Text
        position={[0, 0.26, 0]}
        fontSize={0.032}
        color="#4CAF50"
        anchorX="center"
        anchorY="middle"
      >
        CONTROLS
      </Text>

      {/* Reset Button */}
      <group position={[0, 0.15, 0]}>
        <mesh
          onPointerEnter={() => setHovered('reset')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            setPosition([0, 1.6, -1.0])
            setRotation([-Math.PI / 2, 0, 0])
            setScale(0.01)
          }}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'reset' ? '#42A5F5' : '#2196F3'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.025}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          RESET
        </Text>
      </group>

      {/* To Eye Button */}
      <group position={[0, 0.05, 0]}>
        <mesh
          onPointerEnter={() => setHovered('eye')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setPosition([0, 1.6, -0.5])}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'eye' ? '#66BB6A' : '#4CAF50'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.025}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          TO EYE
        </Text>
      </group>

      {/* Move Forward Button */}
      <group position={[0, -0.05, 0]}>
        <mesh
          onPointerEnter={() => setHovered('forward')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setPosition([position[0], position[1], position[2] - 0.2])}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'forward' ? '#FFA726' : '#FF9800'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.025}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          CLOSER
        </Text>
      </group>

      {/* Move Back Button */}
      <group position={[0, -0.15, 0]}>
        <mesh
          onPointerEnter={() => setHovered('back')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setPosition([position[0], position[1], position[2] + 0.2])}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'back' ? '#EF5350' : '#F44336'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.025}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          FARTHER
        </Text>
      </group>

      {/* Scale Buttons */}
      <group position={[-0.1, -0.25, 0]}>
        <mesh
          onPointerEnter={() => setHovered('smaller')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setScale(Math.max(0.001, scale * 0.8))}
        >
          <planeGeometry args={[0.18, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'smaller' ? '#AB47BC' : '#9C27B0'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.022}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          SIZE -
        </Text>
      </group>

      <group position={[0.1, -0.25, 0]}>
        <mesh
          onPointerEnter={() => setHovered('bigger')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setScale(Math.min(0.1, scale * 1.25))}
        >
          <planeGeometry args={[0.18, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'bigger' ? '#EC407A' : '#E91E63'}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.022}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          SIZE +
        </Text>
      </group>
    </group>
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

      {/* VR Info Panel - Bảng thông tin bên trái */}
      <VRInfoPanel
        position={ringPosition}
        rotation={ringRotation}
        scale={ringScale}
      />

      {/* VR Control Buttons - Bảng điều khiển bên phải */}
      <VRControlButtons
        position={ringPosition}
        setPosition={setRingPosition}
        setRotation={setRingRotation}
        scale={ringScale}
        setScale={setRingScale}
      />

      {/* TỐI ƯU CỰC MẠNH: Ánh sáng tối thiểu */}
      <ambientLight intensity={0.5} />

      {/* TỐI ƯU CỰC MẠNH: Giảm directional light */}
      <directionalLight position={[5, 5, 5]} intensity={1.0} castShadow={false} />

      {/* TỐI ƯU CỰC MẠNH: Environment rất thấp */}
      <Environment preset="apartment" environmentIntensity={0.15} background={false} />

      {/* TỐI ƯU CỰC MẠNH: Mặt phẳng nền nhỏ hơn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled>
        <planeGeometry args={[10, 10, 1, 1]} />
        <meshBasicMaterial
          color="#555555"
        />
      </mesh>

      {/* TỐI ƯU CỰC MẠNH: Grid nhỏ hơn - 10x10 ô */}
      <gridHelper args={[10, 10, '#333333', '#111111']} position={[0, 0.01, 0]} />

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
        dpr={0.8}                 // TỐI ƯU CỰC MẠNH: Giảm DPR xuống 0.8 cho VR
        performance={{ min: 0.05 }} // TỐI ƯU CỰC MẠNH: Cho phép giảm quality rất mạnh
        gl={{
          antialias: false,       // TỐI ƯU CỰC MẠNH: Tắt AA (VR có AA tự nhiên)
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
