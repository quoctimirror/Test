import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore, useXRInputSourceState } from '@react-three/xr'
import { useState, Suspense, useRef } from 'react'
import { useGLTF, Environment, MeshRefractionMaterial, useEnvironment, OrbitControls, Html, Text, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import './MyPlayground2.css'

// Tạo XR store để quản lý VR session
const store = createXRStore()

// Danh sách models từ thư mục public/models
const AVAILABLE_MODELS = [
  { name: 'nhanMirror', path: '/models/nhanMirror.glb', displayName: 'Mirror Ring' },
  { name: 'heart_ring', path: '/models/mirror_heart_ring.glb', displayName: 'Mirror Heart Ring' },
  { name: 'oval_ring', path: '/models/mirror_oval_ring.glb', displayName: 'Mirror Oval Ring' },
  { name: 'pear_ring', path: '/models/mirror_pear_ring.glb', displayName: 'Mirror Pear Ring' },
  { name: 'myfav', path: '/models/mirror_myfav.glb', displayName: 'Mirror My Favorite' },
  { name: 'lumex91', path: '/models/mirror_lumex91.glb', displayName: 'Mirror Lumex 91' },
]

// ============================================
// COMPONENT: Hiển thị VR Controllers (tay cầm)
// ============================================
function VRControllers() {
  // Lấy trạng thái của controller trái và phải
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  return (
    <>
      {/* Tay trái với laser pointer */}
      {leftController && (
        <group position={leftController.position} rotation={leftController.rotation}>
          {/* Controller ball */}
          <mesh frustumCulled>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          {/* Laser ray - dài 5m, offset về phía trước */}
          <mesh position={[0, 0, -2.5]}>
            <boxGeometry args={[0.003, 0.003, 5]} />
            <meshBasicMaterial color="#00ff00" opacity={0.5} transparent />
          </mesh>
        </group>
      )}

      {/* Tay phải với laser pointer */}
      {rightController && (
        <group position={rightController.position} rotation={rightController.rotation}>
          {/* Controller ball */}
          <mesh frustumCulled>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>
          {/* Laser ray - dài 5m, offset về phía trước */}
          <mesh position={[0, 0, -2.5]}>
            <boxGeometry args={[0.003, 0.003, 5]} />
            <meshBasicMaterial color="#0000ff" opacity={0.5} transparent />
          </mesh>
        </group>
      )}
    </>
  )
}

// ============================================
// COMPONENT: Sparkle Effect - Hiệu ứng kim cương lấp lánh khi attach
// ============================================
function SparkleEffect({ position, show, onComplete }) {
  const particlesRef = useRef()
  const [particles, setParticles] = useState([])

  // Generate particles khi show = true
  useFrame((state, delta) => {
    if (!show) return

    if (particles.length === 0) {
      // Tạo 30 particles bay ra xung quanh
      const newParticles = []
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          position: [position[0], position[1], position[2]],
          velocity: [
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ],
          life: 1.0,
          scale: Math.random() * 0.02 + 0.01
        })
      }
      setParticles(newParticles)
    } else {
      // Update particles
      const updatedParticles = particles.map(p => ({
        ...p,
        position: [
          p.position[0] + p.velocity[0] * delta,
          p.position[1] + p.velocity[1] * delta,
          p.position[2] + p.velocity[2] * delta
        ],
        life: p.life - delta * 2
      })).filter(p => p.life > 0)

      setParticles(updatedParticles)

      // Khi hết particles, gọi onComplete
      if (updatedParticles.length === 0 && onComplete) {
        onComplete()
      }
    }
  })

  if (!show || particles.length === 0) return null

  return (
    <group ref={particlesRef}>
      {particles.map(p => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[p.scale, 6, 6]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={p.life}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================
// COMPONENT: Draggable & Rotatable Panel - Panel có thể kéo và xoay được
// Panel CHỈ ĐƯỢC KÉO VÀ XOAY, KHÔNG ĐƯỢC CHỌN ĐỂ ĐIỀU KHIỂN
// ============================================
function DraggablePanel({ children, initialPosition, onPositionChange, name = "Panel", visible = true }) {
  const groupRef = useRef()
  const [position, setPosition] = useState(initialPosition)
  const [rotation, setRotation] = useState([0, 0, 0])  // Rotation state
  const [isHovered, setIsHovered] = useState(false)
  const [isGrabbed, setIsGrabbed] = useState(false)
  const previousControllerPos = useRef(null)
  const activeController = useRef(null)  // Track which controller is grabbing

  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  useFrame((state, delta) => {
    // Check both controllers for grip button
    const controllers = [
      { controller: leftController, name: 'left' },
      { controller: rightController, name: 'right' }
    ]

    for (const { controller, name: controllerName } of controllers) {
      if (!controller || !controller.inputSource.gamepad) continue

      const gamepad = controller.inputSource.gamepad
      const gripPressed = gamepad.buttons[1]?.pressed  // Grip button (side button)

      // If this controller is grabbing this panel
      if (gripPressed && isGrabbed && activeController.current === controllerName) {
        const controllerPos = new THREE.Vector3()
        controllerPos.setFromMatrixPosition(controller.object.matrixWorld)

        if (previousControllerPos.current) {
          const deltaMove = new THREE.Vector3().subVectors(
            controllerPos,
            previousControllerPos.current
          )

          deltaMove.multiplyScalar(3)  // Sensitivity - có thể điều chỉnh

          const newPos = [
            position[0] + deltaMove.x,
            position[1] + deltaMove.y,
            position[2] + deltaMove.z
          ]
          setPosition(newPos)
          if (onPositionChange) onPositionChange(newPos)
        }

        previousControllerPos.current = controllerPos.clone()

        // --- THUMBSTICK: Rotate panel khi đang grab ---
        const thumbstickX = gamepad.axes[2] || 0
        const thumbstickY = gamepad.axes[3] || 0
        const rotSpeed = 1.5

        // Thumbstick trái/phải -> xoay theo trục Y (quay ngang)
        if (Math.abs(thumbstickX) > 0.1) {
          const newRot = [...rotation]
          newRot[1] += thumbstickX * delta * rotSpeed
          setRotation(newRot)
          if (groupRef.current) {
            groupRef.current.rotation.y = newRot[1]
          }
        }

        // Thumbstick lên/xuống -> xoay theo trục X (ngửa/nghiêng)
        if (Math.abs(thumbstickY) > 0.1) {
          const newRot = [...rotation]
          newRot[0] -= thumbstickY * delta * rotSpeed
          setRotation(newRot)
          if (groupRef.current) {
            groupRef.current.rotation.x = newRot[0]
          }
        }

        return  // Exit early if we found the active controller
      }
    }

    // Reset if no controller is pressing grip
    if (!isGrabbed || !activeController.current) {
      previousControllerPos.current = null
    }
  })

  // Không hiển thị panel nếu visible = false
  if (!visible) return null

  return (
    <group
      ref={groupRef}
      position={position}
    >
      {/* Drag handle - CHỈ Ở HEADER AREA, KHÔNG CHE TOÀN BỘ PANEL */}
      <mesh
        position={[0, 0.35, 0.01]}  // Chỉ ở vùng header phía trên
        onPointerEnter={(e) => {
          e.stopPropagation()
          setIsHovered(true)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setIsHovered(false)
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          setIsGrabbed(true)
          // Determine which controller triggered this
          activeController.current = e.nativeEvent?.inputSource?.handedness || 'right'
        }}
        onPointerUp={(e) => {
          e.stopPropagation()
          setIsGrabbed(false)
          activeController.current = null
        }}
      >
        {/* Drag handle nhỏ - chỉ ở header - INVISIBLE */}
        <boxGeometry args={[0.6, 0.1, 0.02]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={0}
          transparent
        />
      </mesh>

      {children}
    </group>
  )
}

// ============================================
// COMPONENT: Nhẫn 3D - CÓ THỂ CHỌN VÀ ĐIỀU KHIỂN
// Ring là object DUY NHẤT có thể được chọn để điều khiển từ CONTROLS panel
// ============================================
function Ring3D({
  modelPath = '/models/nhanMirror.glb',
  env,
  position,
  rotation,
  scale,
  autoRotate,
  autoRotateY,  // Auto rotate Y trong VR
  sharedRef,  // Ref được share từ parent để INFO panel có thể đọc
  onSelect,   // Callback khi ring được select
  modelName,  // Tên model
  setPosition,  // Setter để control từ CONTROLS panel
  setRotation,  // Setter để control từ CONTROLS panel
  setScale,      // Setter để control từ CONTROLS panel
  tryOnMode,    // Try-On mode flag
  setShowSparkles  // Trigger sparkle effect
}) {
  // BƯỚC 1: Load model 3D từ file GLB
  const { nodes } = useGLTF(modelPath)
  const groupRef = sharedRef || useRef()  // Sử dụng shared ref nếu có

  // Lấy trạng thái VR controllers (CẢ HAI TAY)
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  // State cho VR interaction
  const previousControllerPos = useRef(null)
  const vrRotation = useRef([0, 0, 0]) // Rotation riêng cho VR mode

  // State cho two-handed scaling (pinch to zoom)
  const initialDistance = useRef(null)  // Khoảng cách ban đầu giữa 2 controllers
  const initialScale = useRef(null)     // Scale ban đầu của ring

  // State cho Try-On mode
  const tryOnModeActive = useRef(false)
  const targetScale = useRef(scale)

  // Function để phát âm thanh "ting" khi attach
  const playAttachSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Tạo âm thanh "ting" - nốt cao, ngắn
      oscillator.frequency.value = 1200 // Frequency cao = âm thanh sáng
      oscillator.type = 'sine'

      // Envelope: fade in nhanh, fade out nhanh
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Audio not supported:', error)
    }
  }

  // BƯỚC 2: Animation loop - chạy mỗi frame
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // ===== TRY-ON MODE: Follow left controller (ngón tay ảo) =====
    if (tryOnMode && leftController) {
      // Lần đầu tiên vào try-on mode
      if (!tryOnModeActive.current) {
        tryOnModeActive.current = true
        // Trigger sparkle effect
        if (setShowSparkles) {
          setShowSparkles(true)
          setTimeout(() => setShowSparkles(false), 1000)
        }
        // Play attach sound
        playAttachSound()
        // Scale nhỏ lại để vừa ngón tay (khoảng 1/3 size ban đầu)
        targetScale.current = scale * 0.3
      }

      // Follow left controller position (offset một chút để trông như đeo trên ngón)
      const leftPos = new THREE.Vector3()
      leftPos.setFromMatrixPosition(leftController.object.matrixWorld)

      // Offset để nhẫn nằm ở đầu ngón tay controller
      const offset = new THREE.Vector3(0, 0, -0.05)
      offset.applyQuaternion(leftController.object.quaternion)
      leftPos.add(offset)

      // Smooth transition đến vị trí mới
      groupRef.current.position.lerp(leftPos, 0.2)

      // Rotation theo tay
      groupRef.current.quaternion.slerp(leftController.object.quaternion, 0.2)

      // Smooth scale animation
      const currentScale = groupRef.current.scale.x
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale.current, 0.1)
      groupRef.current.scale.set(newScale, newScale, newScale)

      return // Khi ở try-on mode, không cho phép tương tác khác
    } else {
      // Reset try-on mode flag khi thoát
      if (tryOnModeActive.current) {
        tryOnModeActive.current = false
        // Scale về bình thường
        targetScale.current = scale
      }

      // Smooth scale về bình thường khi thoát try-on mode
      if (groupRef.current.scale.x !== scale) {
        const currentScale = groupRef.current.scale.x
        const newScale = THREE.MathUtils.lerp(currentScale, scale, 0.1)
        groupRef.current.scale.set(newScale, newScale, newScale)
      }
    }

    // ===== TWO-HANDED SCALING (PINCH TO ZOOM) =====
    // Kiểm tra nếu CẢ HAI controllers đang nhấn trigger
    if (
      leftController && leftController.inputSource.gamepad &&
      rightController && rightController.inputSource.gamepad
    ) {
      const leftGamepad = leftController.inputSource.gamepad
      const rightGamepad = rightController.inputSource.gamepad
      const leftTrigger = leftGamepad.buttons[0]?.pressed
      const rightTrigger = rightGamepad.buttons[0]?.pressed

      // Nếu CẢ HAI triggers đều đang nhấn
      if (leftTrigger && rightTrigger) {
        // Lấy vị trí 2 controllers
        const leftPos = new THREE.Vector3()
        const rightPos = new THREE.Vector3()
        leftPos.setFromMatrixPosition(leftController.object.matrixWorld)
        rightPos.setFromMatrixPosition(rightController.object.matrixWorld)

        // Tính khoảng cách giữa 2 controllers
        const currentDistance = leftPos.distanceTo(rightPos)

        // Lần đầu tiên grab bằng 2 tay → lưu khoảng cách ban đầu
        if (initialDistance.current === null) {
          initialDistance.current = currentDistance
          initialScale.current = groupRef.current.scale.x
        } else {
          // Tính tỷ lệ thay đổi khoảng cách
          const scaleRatio = currentDistance / initialDistance.current

          // Áp dụng scale mới
          const newScale = initialScale.current * scaleRatio
          if (setScale) {
            setScale(newScale)
          }

          // Notify selection khi scaling
          if (onSelect && groupRef.current) {
            onSelect({
              name: modelName || 'Ring',
              type: 'ring',
              ref: groupRef,
              setPosition: setPosition,
              setRotation: setRotation,
              setScale: setScale
            })
          }
        }

        // Khi đang scale bằng 2 tay, KHÔNG cho phép di chuyển/xoay bằng 1 tay
        return
      } else {
        // Reset khi thả một trong 2 triggers
        initialDistance.current = null
        initialScale.current = null
      }
    } else {
      // Reset khi không có đủ 2 controllers
      initialDistance.current = null
      initialScale.current = null
    }

    // ===== ONE-HANDED CONTROL (DI CHUYỂN/XOAY) =====
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

          // TỐI ƯU: Tăng khoảng cách di chuyển (thay đổi số này để điều chỉnh độ nhạy)
          // Số càng lớn = di chuyển càng nhanh/xa. Ví dụ: 3, 5, 10, 20...
          deltaMove.multiplyScalar(5)

          // Di chuyển nhẫn theo delta
          groupRef.current.position.add(deltaMove)

          // Notify parent that ring is being moved (selected)
          if (onSelect && groupRef.current) {
            onSelect({
              name: modelName || 'Ring',
              type: 'ring',
              ref: groupRef,
              setPosition: setPosition,
              setRotation: setRotation,
              setScale: setScale
            })
          }
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

        // Notify selection when rotating
        if (onSelect && groupRef.current) {
          onSelect({
            name: modelName || 'Ring',
            type: 'ring',
            ref: groupRef,
            setPosition: setPosition,
            setRotation: setRotation,
            setScale: setScale
          })
        }
      }

      // Thumbstick lên/xuống -> xoay theo trục X (ngửa/nghiêng)
      if (Math.abs(thumbstickY) > 0.1) {
        vrRotation.current[0] -= thumbstickY * delta * rotSpeed
        groupRef.current.rotation.x = vrRotation.current[0]

        // Notify selection when rotating
        if (onSelect && groupRef.current) {
          onSelect({
            name: modelName || 'Ring',
            type: 'ring',
            ref: groupRef,
            setPosition: setPosition,
            setRotation: setRotation,
            setScale: setScale
          })
        }
      }

      // --- AUTO ROTATE Y: Tự động xoay theo trục Y trong VR ---
      if (autoRotateY) {
        vrRotation.current[1] += delta * 0.5
        groupRef.current.rotation.y = vrRotation.current[1]
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
// COMPONENT: VR Info Panel - Bảng thông tin 3D (REALTIME)
// Hiển thị thông tin của RING đang được chọn/interact
// ============================================
function VRInfoPanel({ selectedObject }) {
  // State để lưu giá trị realtime
  const [realtimeInfo, setRealtimeInfo] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  })

  // Update realtime từ selected ring ref mỗi frame
  useFrame(() => {
    if (selectedObject && selectedObject.ref && selectedObject.ref.current) {
      const obj = selectedObject.ref.current
      const pos = obj.position
      const rot = obj.rotation
      const scl = obj.scale.x // Uniform scale

      setRealtimeInfo({
        position: [pos.x, pos.y, pos.z],
        rotation: [rot.x, rot.y, rot.z],
        scale: scl
      })
    }
  })

  // Tên ring và icon
  const objectName = selectedObject ? selectedObject.name : 'None'
  const objectType = selectedObject ? selectedObject.type : 'none'
  const icon = objectType === 'ring' ? '💍' : '❓'

  const infoText = `POS: ${realtimeInfo.position[0].toFixed(2)}, ${realtimeInfo.position[1].toFixed(2)}, ${realtimeInfo.position[2].toFixed(2)}
ROT: ${(realtimeInfo.rotation[0] * 180 / Math.PI).toFixed(0)}°, ${(realtimeInfo.rotation[1] * 180 / Math.PI).toFixed(0)}°, ${(realtimeInfo.rotation[2] * 180 / Math.PI).toFixed(0)}°
SCALE: ${realtimeInfo.scale.toFixed(3)}`

  return (
    <group>
      {/* Background - Tăng chiều cao để chứa tên model */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.55, 0.5]} />
        <meshBasicMaterial color="#000000" opacity={0.85} transparent />
      </mesh>
      {/* TỐI ƯU: Chỉ 1 outline thay vì 4 boxes */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.55, 0.5)]} />
        <lineBasicMaterial attach="material" color="#1976d2" linewidth={2} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.025}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        MONITOR
      </Text>

      {/* Tên object - Header */}
      <Text
        position={[0, 0.16, 0]}
        fontSize={0.032}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.52}
        fontWeight="bold"
      >
        {icon} {objectName}
      </Text>

      {/* Divider line */}
      <mesh position={[0, 0.11, 0.001]}>
        <planeGeometry args={[0.5, 0.002]} />
        <meshBasicMaterial color="#1976d2" />
      </mesh>

      {/* Text - TỐI ƯU: Font nhỏ hơn - REALTIME UPDATE */}
      <Text
        position={[0, -0.03, 0]}
        fontSize={0.026}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.52}
        textAlign="left"
        lineHeight={1.3}
      >
        {infoText}
      </Text>

      {/* Type badge */}
      <Text
        position={[-0.23, -0.21, 0.001]}
        fontSize={0.02}
        color="#1976d2"
        anchorX="left"
        anchorY="middle"
      >
        TYPE: {objectType.toUpperCase()}
      </Text>

      {/* REALTIME indicator */}
      <mesh position={[0.25, -0.21, 0.001]}>
        <circleGeometry args={[0.01, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      <Text
        position={[0.18, -0.21, 0.001]}
        fontSize={0.018}
        color="#00ff00"
        anchorX="right"
        anchorY="middle"
      >
        LIVE
      </Text>
    </group>
  )
}

// ============================================
// COMPONENT: VR Control Buttons - Nút điều khiển 3D
// Điều khiển RING đang được chọn (position, rotation, scale, auto rotate)
// ============================================
function VRControlButtons({ activeObject, autoRotateY, setAutoRotateY }) {
  const [hovered, setHovered] = useState(null)

  // Lấy thông tin từ activeObject (CHỈ RING)
  const objectName = activeObject ? activeObject.name : 'None'
  const hasActiveObject = activeObject && activeObject.ref && activeObject.ref.current
  const isRing = activeObject && activeObject.type === 'ring'  // Luôn true vì chỉ ring mới được chọn

  // Lấy position/rotation/scale hiện tại từ ref
  const getCurrentPosition = () => {
    if (!hasActiveObject) return [0, 0, 0]
    const pos = activeObject.ref.current.position
    return [pos.x, pos.y, pos.z]
  }

  const getCurrentRotation = () => {
    if (!hasActiveObject) return [0, 0, 0]
    const rot = activeObject.ref.current.rotation
    return [rot.x, rot.y, rot.z]
  }

  const getCurrentScale = () => {
    if (!hasActiveObject) return 1
    return activeObject.ref.current.scale.x
  }

  return (
    <group>
      {/* Background - Tăng chiều cao để chứa thêm rotation controls */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.45, 1.1]} />
        <meshBasicMaterial color="#000000" opacity={0.85} transparent />
      </mesh>
      {/* TỐI ƯU: Chỉ 1 outline */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.45, 1.1)]} />
        <lineBasicMaterial attach="material" color="#4CAF50" linewidth={2} />
      </lineSegments>

      {/* Tên object - Header */}
      <Text
        position={[0, 0.52, 0]}
        fontSize={0.028}
        color={hasActiveObject ? "#4CAF50" : "#888888"}
        anchorX="center"
        anchorY="middle"
        maxWidth={0.42}
      >
        🎯 {objectName}
      </Text>

      {/* Divider line */}
      <mesh position={[0, 0.47, 0.001]}>
        <planeGeometry args={[0.4, 0.002]} />
        <meshBasicMaterial color="#4CAF50" />
      </mesh>

      {/* Title - TỐI ƯU: Font nhỏ hơn */}
      <Text
        position={[0, 0.41, 0]}
        fontSize={0.025}
        color="#4CAF50"
        anchorX="center"
        anchorY="middle"
      >
        CONTROLS
      </Text>

      {/* Reset Button */}
      <group position={[0, 0.3, 0]}>
        <mesh
          onPointerEnter={() => setHovered('reset')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject) return
            activeObject.setPosition([0, 1.2, -1.0])
            if (activeObject.setRotation) activeObject.setRotation([-Math.PI / 2, 0, 0])
            if (activeObject.setScale) activeObject.setScale(0.01)
          }}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'reset' ? '#42A5F5' : '#2196F3'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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
      <group position={[0, 0.2, 0]}>
        <mesh
          onPointerEnter={() => setHovered('eye')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject) return
            activeObject.setPosition([0, 1.2, -0.5])
          }}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'eye' ? '#66BB6A' : '#4CAF50'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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
      <group position={[0, 0.1, 0]}>
        <mesh
          onPointerEnter={() => setHovered('forward')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject) return
            const pos = getCurrentPosition()
            activeObject.setPosition([pos[0], pos[1], pos[2] - 0.2])
          }}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'forward' ? '#FFA726' : '#FF9800'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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
      <group position={[0, 0.0, 0]}>
        <mesh
          onPointerEnter={() => setHovered('back')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject) return
            const pos = getCurrentPosition()
            activeObject.setPosition([pos[0], pos[1], pos[2] + 0.2])
          }}
        >
          <planeGeometry args={[0.4, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'back' ? '#EF5350' : '#F44336'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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

      {/* Rotation Controls - ROT X */}
      <group position={[-0.1, -0.1, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotXMinus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0] - 0.1, rot[1], rot[2]])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotXMinus' ? '#64B5F6' : '#2196F3'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          X -
        </Text>
      </group>

      <group position={[0.1, -0.1, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotXPlus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0] + 0.1, rot[1], rot[2]])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotXPlus' ? '#64B5F6' : '#2196F3'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          X +
        </Text>
      </group>

      {/* Rotation Controls - ROT Y */}
      <group position={[-0.1, -0.18, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotYMinus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0], rot[1] - 0.1, rot[2]])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotYMinus' ? '#81C784' : '#4CAF50'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Y -
        </Text>
      </group>

      <group position={[0.1, -0.18, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotYPlus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0], rot[1] + 0.1, rot[2]])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotYPlus' ? '#81C784' : '#4CAF50'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Y +
        </Text>
      </group>

      {/* Rotation Controls - ROT Z */}
      <group position={[-0.1, -0.26, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotZMinus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0], rot[1], rot[2] - 0.1])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotZMinus' ? '#FFB74D' : '#FF9800'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Z -
        </Text>
      </group>

      <group position={[0.1, -0.26, 0]}>
        <mesh
          onPointerEnter={() => setHovered('rotZPlus')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setRotation) return
            const rot = getCurrentRotation()
            activeObject.setRotation([rot[0], rot[1], rot[2] + 0.1])
          }}
        >
          <planeGeometry args={[0.13, 0.07]} />
          <meshBasicMaterial
            color={hovered === 'rotZPlus' ? '#FFB74D' : '#FF9800'}
            opacity={hasActiveObject ? 0.9 : 0.3}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.018}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Z +
        </Text>
      </group>

      {/* Scale Buttons */}
      <group position={[-0.1, -0.36, 0]}>
        <mesh
          onPointerEnter={() => setHovered('smaller')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setScale) return
            const currentScale = getCurrentScale()
            activeObject.setScale(Math.max(0.001, currentScale * 0.8))
          }}
        >
          <planeGeometry args={[0.18, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'smaller' ? '#AB47BC' : '#9C27B0'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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

      <group position={[0.1, -0.36, 0]}>
        <mesh
          onPointerEnter={() => setHovered('bigger')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => {
            if (!hasActiveObject || !activeObject.setScale) return
            const currentScale = getCurrentScale()
            activeObject.setScale(Math.min(10, currentScale * 1.25))
          }}
        >
          <planeGeometry args={[0.18, 0.08]} />
          <meshBasicMaterial
            color={hovered === 'bigger' ? '#EC407A' : '#E91E63'}
            opacity={hasActiveObject ? 0.9 : 0.3}
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

      {/* Auto Rotate Y Button - CHỈ HIỆN KHI RING ĐƯỢC CHỌN */}
      {isRing && (
        <group position={[0, -0.46, 0]}>
          <mesh
            onPointerEnter={() => setHovered('autoRotateY')}
            onPointerLeave={() => setHovered(null)}
            onClick={() => {
              if (setAutoRotateY) setAutoRotateY(!autoRotateY)
            }}
          >
            <planeGeometry args={[0.4, 0.08]} />
            <meshBasicMaterial
              color={autoRotateY ? '#00E676' : (hovered === 'autoRotateY' ? '#26A69A' : '#00897B')}
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
            {autoRotateY ? '⏸ AUTO ROT Y' : '▶ AUTO ROT Y'}
          </Text>
        </group>
      )}
    </group>
  )
}

// ============================================
// COMPONENT: VR Model Selector - Chọn model trong VR
// ============================================
function VRModelSelector({ selectedModel, onSelectModel }) {
  const [hovered, setHovered] = useState(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  const itemsPerPage = 5
  const totalPages = Math.ceil(AVAILABLE_MODELS.length / itemsPerPage)
  const currentPage = Math.floor(scrollOffset / itemsPerPage)
  const visibleModels = AVAILABLE_MODELS.slice(scrollOffset, scrollOffset + itemsPerPage)

  return (
    <group>
      {/* Background */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.6, 0.7]} />
        <meshBasicMaterial color="#000000" opacity={0.9} transparent />
      </mesh>
      {/* Border */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.6, 0.7)]} />
        <lineBasicMaterial attach="material" color="#FFC107" linewidth={2} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 0.32, 0]}
        fontSize={0.035}
        color="#FFC107"
        anchorX="center"
        anchorY="middle"
      >
        MODEL SELECTOR
      </Text>

      {/* Scroll Up Button */}
      {scrollOffset > 0 && (
        <group position={[0, 0.26, 0]}>
          <mesh
            onPointerEnter={() => setHovered('scrollUp')}
            onPointerLeave={() => setHovered(null)}
            onClick={() => setScrollOffset(Math.max(0, scrollOffset - 1))}
          >
            <planeGeometry args={[0.55, 0.05]} />
            <meshBasicMaterial
              color={hovered === 'scrollUp' ? '#FFD54F' : '#FFC107'}
              opacity={0.8}
              transparent
            />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.022}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            ▲ UP
          </Text>
        </group>
      )}

      {/* Page indicator */}
      <Text
        position={[0, 0.19, 0]}
        fontSize={0.018}
        color="#FFC107"
        anchorX="center"
        anchorY="middle"
      >
        {`Page ${currentPage + 1} / ${totalPages}`}
      </Text>

      {/* Model list - 5 items visible */}
      {visibleModels.map((model, index) => {
        const yPos = 0.1 - (index * 0.07)
        const isSelected = selectedModel === model.path

        return (
          <group key={model.name} position={[0, yPos, 0]}>
            <mesh
              onPointerEnter={() => setHovered(model.name)}
              onPointerLeave={() => setHovered(null)}
              onClick={() => onSelectModel(model.path)}
            >
              <planeGeometry args={[0.55, 0.06]} />
              <meshBasicMaterial
                color={
                  isSelected ? '#4CAF50' :
                  hovered === model.name ? '#FFD54F' : '#FFA726'
                }
                opacity={0.9}
                transparent
              />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.02}
              color={isSelected ? 'white' : 'black'}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.5}
            >
              {isSelected ? '✓ ' : ''}{model.displayName}
            </Text>
          </group>
        )
      })}

      {/* Scroll Down Button */}
      {scrollOffset + itemsPerPage < AVAILABLE_MODELS.length && (
        <group position={[0, -0.22, 0]}>
          <mesh
            onPointerEnter={() => setHovered('scrollDown')}
            onPointerLeave={() => setHovered(null)}
            onClick={() => setScrollOffset(Math.min(AVAILABLE_MODELS.length - itemsPerPage, scrollOffset + 1))}
          >
            <planeGeometry args={[0.55, 0.05]} />
            <meshBasicMaterial
              color={hovered === 'scrollDown' ? '#FFD54F' : '#FFC107'}
              opacity={0.8}
              transparent
            />
          </mesh>
          <Text
            position={[0, 0, 0.001]}
            fontSize={0.022}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            ▼ DOWN
          </Text>
        </group>
      )}
    </group>
  )
}

// ============================================
// COMPONENT: VR Panel Toggle Buttons - Toggle visibility của panels + Try-On
// ============================================
function VRPanelToggleButtons({ showMonitorPanel, setShowMonitorPanel, showControlsPanel, setShowControlsPanel, tryOnMode, setTryOnMode }) {
  const [hovered, setHovered] = useState(null)

  return (
    <group>
      {/* Background - Tăng chiều cao để chứa Try-On button */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.4, 0.48]} />
        <meshBasicMaterial color="#000000" opacity={0.9} transparent />
      </mesh>
      {/* Border */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.4, 0.48)]} />
        <lineBasicMaterial attach="material" color="#FF5722" linewidth={2} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 0.21, 0]}
        fontSize={0.028}
        color="#FF5722"
        anchorX="center"
        anchorY="middle"
      >
        QUICK ACTIONS
      </Text>

      {/* Divider */}
      <mesh position={[0, 0.16, 0.001]}>
        <planeGeometry args={[0.35, 0.002]} />
        <meshBasicMaterial color="#FF5722" />
      </mesh>

      {/* Try-On Mode Button - HIGHLIGHT */}
      <group position={[0, 0.1, 0]}>
        <mesh
          onPointerEnter={() => setHovered('tryon')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setTryOnMode(!tryOnMode)}
        >
          <planeGeometry args={[0.35, 0.09]} />
          <meshBasicMaterial
            color={tryOnMode ? (hovered === 'tryon' ? '#FFD700' : '#FFC107') : (hovered === 'tryon' ? '#AB47BC' : '#9C27B0')}
            opacity={0.95}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.025}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {tryOnMode ? '💍 TRY-ON: ON' : '👋 TRY-ON'}
        </Text>
      </group>

      {/* Monitor Panel Toggle Button */}
      <group position={[0, -0.01, 0]}>
        <mesh
          onPointerEnter={() => setHovered('monitor')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setShowMonitorPanel(!showMonitorPanel)}
        >
          <planeGeometry args={[0.35, 0.07]} />
          <meshBasicMaterial
            color={showMonitorPanel ? (hovered === 'monitor' ? '#66BB6A' : '#4CAF50') : (hovered === 'monitor' ? '#EF5350' : '#F44336')}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.02}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {showMonitorPanel ? '✓ MONITOR' : '✗ MONITOR'}
        </Text>
      </group>

      {/* Controls Panel Toggle Button */}
      <group position={[0, -0.09, 0]}>
        <mesh
          onPointerEnter={() => setHovered('controls')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setShowControlsPanel(!showControlsPanel)}
        >
          <planeGeometry args={[0.35, 0.07]} />
          <meshBasicMaterial
            color={showControlsPanel ? (hovered === 'controls' ? '#66BB6A' : '#4CAF50') : (hovered === 'controls' ? '#EF5350' : '#F44336')}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.02}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {showControlsPanel ? '✓ CONTROLS' : '✗ CONTROLS'}
        </Text>
      </group>

      {/* Hint text */}
      <Text
        position={[0, -0.19, 0.001]}
        fontSize={0.015}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        {tryOnMode ? 'Left hand = Ring finger' : 'Click TRY-ON to wear ring!'}
      </Text>
    </group>
  )
}

// ============================================
// COMPONENT: VR Lighting Panel - Điều chỉnh ánh sáng trong VR
// ============================================
function VRLightingPanel({
  environmentIntensity,
  setEnvironmentIntensity,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  debugMode,
  setDebugMode
}) {
  const [hovered, setHovered] = useState(null)

  // Helper function to render a slider with +/- buttons
  const renderSlider = (label, value, setValue, min, max, step, color, hoveredId) => {
    return (
      <group>
        {/* Label */}
        <Text
          position={[0, 0.06, 0]}
          fontSize={0.022}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {label}: {value.toFixed(2)}
        </Text>

        {/* Minus Button */}
        <group position={[-0.15, 0, 0]}>
          <mesh
            onPointerEnter={() => setHovered(hoveredId + '_minus')}
            onPointerLeave={() => setHovered(null)}
            onClick={() => setValue(Math.max(min, value - step))}
          >
            <planeGeometry args={[0.08, 0.05]} />
            <meshBasicMaterial
              color={hovered === hoveredId + '_minus' ? '#FFD54F' : '#FFA726'}
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
            -
          </Text>
        </group>

        {/* Plus Button */}
        <group position={[0.15, 0, 0]}>
          <mesh
            onPointerEnter={() => setHovered(hoveredId + '_plus')}
            onPointerLeave={() => setHovered(null)}
            onClick={() => setValue(Math.min(max, value + step))}
          >
            <planeGeometry args={[0.08, 0.05]} />
            <meshBasicMaterial
              color={hovered === hoveredId + '_plus' ? '#66BB6A' : '#4CAF50'}
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
            +
          </Text>
        </group>

        {/* Value Bar (visual indicator) */}
        <mesh position={[0, -0.03, 0]}>
          <planeGeometry args={[0.3 * (value - min) / (max - min), 0.01]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.03, -0.001]}>
          <planeGeometry args={[0.3, 0.01]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      {/* Background */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[0.5, 0.75]} />
        <meshBasicMaterial color="#000000" opacity={0.9} transparent />
      </mesh>
      {/* Border */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(0.5, 0.75)]} />
        <lineBasicMaterial attach="material" color="#FFC107" linewidth={2} />
      </lineSegments>

      {/* Title */}
      <Text
        position={[0, 0.35, 0]}
        fontSize={0.032}
        color="#FFC107"
        anchorX="center"
        anchorY="middle"
      >
        💡 LIGHTING
      </Text>

      {/* Divider */}
      <mesh position={[0, 0.3, 0.001]}>
        <planeGeometry args={[0.45, 0.002]} />
        <meshBasicMaterial color="#FFC107" />
      </mesh>

      {/* Debug Mode Toggle */}
      <group position={[0, 0.23, 0]}>
        <mesh
          onPointerEnter={() => setHovered('debug')}
          onPointerLeave={() => setHovered(null)}
          onClick={() => setDebugMode(!debugMode)}
        >
          <planeGeometry args={[0.4, 0.06]} />
          <meshBasicMaterial
            color={debugMode ? '#00E676' : (hovered === 'debug' ? '#666' : '#444')}
            opacity={0.9}
            transparent
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.02}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {debugMode ? '👁️ DEBUG: ON' : '👁️ DEBUG: OFF'}
        </Text>
      </group>

      {/* Environment Intensity Slider */}
      <group position={[0, 0.12, 0]}>
        {renderSlider('ENV', environmentIntensity, setEnvironmentIntensity, 0, 2.0, 0.05, '#FFC107', 'env')}
      </group>

      {/* Ambient Intensity Slider */}
      <group position={[0, -0.02, 0]}>
        {renderSlider('AMBIENT', ambientIntensity, setAmbientIntensity, 0, 2.0, 0.05, '#4CAF50', 'ambient')}
      </group>

      {/* Directional Intensity Slider */}
      <group position={[0, -0.16, 0]}>
        {renderSlider('DIRECT', directionalIntensity, setDirectionalIntensity, 0, 3.0, 0.1, '#2196F3', 'direct')}
      </group>

      {/* Hint text */}
      <Text
        position={[0, -0.32, 0.001]}
        fontSize={0.015}
        color="#888"
        anchorX="center"
        anchorY="middle"
      >
        Use +/- to adjust
      </Text>
    </group>
  )
}

// ============================================
// COMPONENT: Scene - chứa toàn bộ 3D scene
// ============================================
function Scene({
  ringPosition,
  ringRotation,
  ringScale,
  autoRotate,
  autoRotateY,
  setAutoRotateY,
  setRingPosition,
  setRingRotation,
  setRingScale,
  selectedModel,
  setSelectedModel,
  showMonitorPanel,
  setShowMonitorPanel,
  showControlsPanel,
  setShowControlsPanel,
  tryOnMode,
  setTryOnMode,
  showSparkles,
  setShowSparkles,
  environmentIntensity,
  setEnvironmentIntensity,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  debugMode,
  setDebugMode
}) {
  // Load environment map cho materials (phản chiếu môi trường)
  const env = useEnvironment({ preset: 'apartment' })

  // Shared ref cho ring
  const ringGroupRef = useRef()

  // Ref cho directional light (để hiển thị helper)
  const directionalLightRef = useRef()

  // State để track RING được chọn (CHỈ RING MỚI CÓ THỂ CHỌN)
  const [activeObject, setActiveObject] = useState(null)

  // Show DirectionalLight helper khi debugMode = true
  useHelper(debugMode ? directionalLightRef : null, THREE.DirectionalLightHelper, 1, 'yellow')

  // Handler khi RING được grab/interact
  const handleSelectRing = (ringInfo) => {
    setActiveObject(ringInfo)
  }

  // Tìm tên model từ path
  const modelInfo = AVAILABLE_MODELS.find(m => m.path === selectedModel)
  const modelName = modelInfo ? modelInfo.displayName : 'Unknown'

  return (
    <>
      {/* Hiển thị VR Controllers */}
      <VRControllers />

      {/* MONITOR Panel - Hiển thị thông tin ring - CHỈ KÉO/XOAY, KHÔNG ĐIỀU KHIỂN */}
      <DraggablePanel
        initialPosition={[-1.8, 1.4, -2.0]}
        name="MONITOR"
        visible={showMonitorPanel}
      >
        <VRInfoPanel selectedObject={activeObject} />
      </DraggablePanel>

      {/* CONTROLS Panel - Điều khiển ring - CHỈ KÉO/XOAY, KHÔNG ĐIỀU KHIỂN */}
      <DraggablePanel
        initialPosition={[1.8, 1.3, -2.0]}
        name="CONTROLS"
        visible={showControlsPanel}
      >
        <VRControlButtons
          activeObject={activeObject}
          autoRotateY={autoRotateY}
          setAutoRotateY={setAutoRotateY}
        />
      </DraggablePanel>

      {/* MODELS Panel - Chọn model ring - CHỈ KÉO/XOAY, KHÔNG ĐIỀU KHIỂN */}
      <DraggablePanel
        initialPosition={[0, 1.3, -2.5]}
        name="MODELS"
      >
        <VRModelSelector
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </DraggablePanel>

      {/* PANEL TOGGLE BUTTONS - Toggle Monitor và Controls panels + Try-On */}
      <DraggablePanel
        initialPosition={[-0.8, 1.5, -0.8]}
        name="PANEL_TOGGLE"
      >
        <VRPanelToggleButtons
          showMonitorPanel={showMonitorPanel}
          setShowMonitorPanel={setShowMonitorPanel}
          showControlsPanel={showControlsPanel}
          setShowControlsPanel={setShowControlsPanel}
          tryOnMode={tryOnMode}
          setTryOnMode={setTryOnMode}
        />
      </DraggablePanel>

      {/* LIGHTING PANEL - Điều chỉnh ánh sáng trong VR */}
      <DraggablePanel
        initialPosition={[0.8, 1.5, -0.8]}
        name="LIGHTING"
      >
        <VRLightingPanel
          environmentIntensity={environmentIntensity}
          setEnvironmentIntensity={setEnvironmentIntensity}
          ambientIntensity={ambientIntensity}
          setAmbientIntensity={setAmbientIntensity}
          directionalIntensity={directionalIntensity}
          setDirectionalIntensity={setDirectionalIntensity}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
        />
      </DraggablePanel>

      {/* AMBIENT LIGHT - Ánh sáng xung quanh */}
      <ambientLight intensity={ambientIntensity} />

      {/* DIRECTIONAL LIGHT - Ánh sáng chính */}
      <directionalLight
        ref={directionalLightRef}
        position={[5, 5, 5]}
        intensity={directionalIntensity}
        castShadow={false}
      />

      {/* Environment với background đẹp */}
      <Environment preset="apartment" environmentIntensity={environmentIntensity} background={true} />

      {/* TỐI ƯU CỰC MẠNH: Mặt phẳng nền nhỏ hơn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled>
        <planeGeometry args={[10, 10, 1, 1]} />
        <meshBasicMaterial
          color="#555555"
        />
      </mesh>

      {/* TỐI ƯU CỰC MẠNH: Grid nhỏ hơn - 10x10 ô */}
      <gridHelper args={[10, 10, '#333333', '#111111']} position={[0, 0.01, 0]} />

      {/* NHẪN 3D - component chính - CHỈ RING MỚI CÓ THỂ CHỌN ĐỂ ĐIỀU KHIỂN */}
      <Suspense fallback={null}>
        <Ring3D
          key={selectedModel}  // Force remount when model changes
          modelPath={selectedModel}
          env={env}
          position={ringPosition}
          rotation={ringRotation}
          scale={ringScale}
          autoRotate={autoRotate}
          autoRotateY={autoRotateY}  // Auto rotate Y trong VR
          sharedRef={ringGroupRef}  // Pass ref để INFO panel đọc realtime
          onSelect={handleSelectRing}  // Callback khi ring được grab
          modelName={modelName}  // Tên model hiện tại
          setPosition={setRingPosition}  // Setter để CONTROLS điều khiển
          setRotation={setRingRotation}  // Setter để CONTROLS điều khiển
          setScale={setRingScale}  // Setter để CONTROLS điều khiển
          tryOnMode={tryOnMode}  // Try-On mode flag
          setShowSparkles={setShowSparkles}  // Trigger sparkle effect
        />
      </Suspense>

      {/* Sparkle Effect - Hiển thị khi attach nhẫn */}
      {ringGroupRef.current && (
        <SparkleEffect
          position={[
            ringGroupRef.current.position.x,
            ringGroupRef.current.position.y,
            ringGroupRef.current.position.z
          ]}
          show={showSparkles}
          onComplete={() => setShowSparkles(false)}
        />
      )}
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
  setAutoRotate,
  selectedModel,
  setSelectedModel,
  environmentIntensity,
  setEnvironmentIntensity,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  debugMode,
  setDebugMode
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

      {/* Model Selector */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Model</strong>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #666',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {AVAILABLE_MODELS.map(model => (
            <option key={model.name} value={model.path}>
              {model.displayName}
            </option>
          ))}
        </select>
      </div>

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

      {/* LIGHTING CONTROLS - Điều chỉnh ánh sáng */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderRadius: '8px',
        border: '1px solid #FFC107'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#FFC107', fontSize: '16px' }}>
          💡 LIGHTING DEBUG
        </h4>

        {/* Debug Mode Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={() => setDebugMode(!debugMode)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: debugMode ? '#00E676' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {debugMode ? '👁️ Debug Mode: ON' : '👁️ Debug Mode: OFF'}
          </button>
        </div>

        {/* Environment Intensity */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: '#FFC107' }}>
            <strong>Environment Intensity: {environmentIntensity.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="2.0"
            step="0.05"
            value={environmentIntensity}
            onChange={(e) => setEnvironmentIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '5px' }}
          />
          <small style={{ color: '#AAA' }}>Ánh sáng môi trường phản chiếu</small>
        </div>

        {/* Ambient Intensity */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: '#4CAF50' }}>
            <strong>Ambient Light: {ambientIntensity.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="2.0"
            step="0.05"
            value={ambientIntensity}
            onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '5px' }}
          />
          <small style={{ color: '#AAA' }}>Ánh sáng xung quanh (tổng thể)</small>
        </div>

        {/* Directional Intensity */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ color: '#2196F3' }}>
            <strong>Directional Light: {directionalIntensity.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="3.0"
            step="0.1"
            value={directionalIntensity}
            onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '5px' }}
          />
          <small style={{ color: '#AAA' }}>Ánh sáng chính (từ góc trên)</small>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setPosition([0, 1.2, -1.0])  // Cách 1m, thấp hơn 1.2m
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
  // VR: Đặt nhẫn cách user 1m, thấp hơn (1.2m)
  const [ringPosition, setRingPosition] = useState([0, 1.2, -1.0])

  // State quản lý góc xoay nhẫn (X, Y, Z) - tính bằng radian
  // TỐI ƯU: Nhẫn nằm ngang ban đầu (xoay -90° theo trục X)
  const [ringRotation, setRingRotation] = useState([-Math.PI / 2, 0, 0])

  // State quản lý kích thước nhẫn
  const [ringScale, setRingScale] = useState(0.01)

  // State quản lý auto-rotate (bật/tắt)
  const [autoRotate, setAutoRotate] = useState(false)

  // State quản lý auto-rotate Y cho VR
  const [autoRotateY, setAutoRotateY] = useState(false)

  // State quản lý model đang được chọn
  const [selectedModel, setSelectedModel] = useState('/models/nhanMirror.glb')

  // State quản lý visibility của panels trong VR
  const [showMonitorPanel, setShowMonitorPanel] = useState(true)
  const [showControlsPanel, setShowControlsPanel] = useState(true)

  // State quản lý Try-On mode
  const [tryOnMode, setTryOnMode] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  // State quản lý lighting
  const [environmentIntensity, setEnvironmentIntensity] = useState(0.15)
  const [ambientIntensity, setAmbientIntensity] = useState(0.5)
  const [directionalIntensity, setDirectionalIntensity] = useState(1.0)
  const [debugMode, setDebugMode] = useState(false)

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

      {/* Control Panel - BỎ ĐI - CHỈ VR THÔI */}

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
            autoRotateY={autoRotateY}
            setAutoRotateY={setAutoRotateY}
            setRingPosition={setRingPosition}
            setRingRotation={setRingRotation}
            setRingScale={setRingScale}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            showMonitorPanel={showMonitorPanel}
            setShowMonitorPanel={setShowMonitorPanel}
            showControlsPanel={showControlsPanel}
            setShowControlsPanel={setShowControlsPanel}
            tryOnMode={tryOnMode}
            setTryOnMode={setTryOnMode}
            showSparkles={showSparkles}
            setShowSparkles={setShowSparkles}
            environmentIntensity={environmentIntensity}
            setEnvironmentIntensity={setEnvironmentIntensity}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            directionalIntensity={directionalIntensity}
            setDirectionalIntensity={setDirectionalIntensity}
            debugMode={debugMode}
            setDebugMode={setDebugMode}
          />
        </XR>
      </Canvas>
    </div>
  )
}
