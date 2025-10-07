import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, MeshRefractionMaterial, useEnvironment } from '@react-three/drei'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { useControls } from 'leva'
import * as THREE from 'three'

// ==================== CONSTANTS ====================
const FINGER_GEOMETRY_DATA = {
  Ring: {
    positionLandmarks: [13, 14],
    widthLandmarks: [13, 9]
  },
  Middle: {
    positionLandmarks: [9, 10],
    widthLandmarks: [9, 5]
  },
  Index: {
    positionLandmarks: [5, 6],
    widthLandmarks: [9, 5]
  },
  Pinky: {
    positionLandmarks: [17, 18],
    widthLandmarks: [17, 13]
  },
  Thumb: {
    positionLandmarks: [2, 3],
    widthLandmarks: [2, 3]
  }
}

const SMOOTHING_FACTOR = 0.3  // Tăng smoothing để giảm jitter
const TARGET_FPS = 15  // Giảm xuống 15 FPS để tối ưu mạnh
const FRAME_INTERVAL = 1000 / TARGET_FPS
const MEDIAPIPE_SKIP_FRAMES = 2  // Chỉ chạy MediaPipe mỗi 2 frames

// ==================== RING AXES DEBUG (TẮTT TEXT ĐỂ TĂNG FPS) ====================
function RingAxesDebug({ ringPosition, ringRotation, ringScale }) {
  const arrowGroupRef = useRef()
  const arrowsRef = useRef([])  // Cache arrows để không tạo mới

  useFrame(() => {
    if (!arrowGroupRef.current) return

    // Update position của group
    arrowGroupRef.current.position.copy(ringPosition)
    arrowGroupRef.current.rotation.copy(ringRotation)

    // Chỉ tạo arrows 1 lần
    if (arrowsRef.current.length === 0) {
      const arrowLength = 0.5
      const axisX = new THREE.Vector3(1, 0, 0)
      const axisY = new THREE.Vector3(0, 1, 0)
      const axisZ = new THREE.Vector3(0, 0, 1)

      const arrowX = new THREE.ArrowHelper(axisX, new THREE.Vector3(), arrowLength, 0xff0000)
      const arrowY = new THREE.ArrowHelper(axisY, new THREE.Vector3(), arrowLength, 0x00ff00)
      const arrowZ = new THREE.ArrowHelper(axisZ, new THREE.Vector3(), arrowLength, 0x0000ff)

      arrowGroupRef.current.add(arrowX)
      arrowGroupRef.current.add(arrowY)
      arrowGroupRef.current.add(arrowZ)

      arrowsRef.current = [arrowX, arrowY, arrowZ]
    }
  })

  return <group ref={arrowGroupRef} />
  // Text bị XÓA để tăng FPS - Text rendering rất nặng!
}

// ==================== FINGER AXES DEBUG (TỐI ƯU TỐI ĐA) ====================
function FingerAxesDebug({ landmarks, selectedFinger, camera }) {
  const arrowGroupRef = useRef()
  const arrowsRef = useRef([])  // Cache arrows
  const dotRef = useRef()  // Cache dot
  const frameCount = useRef(0)

  useFrame(() => {
    if (!landmarks || !arrowGroupRef.current) {
      // Ẩn arrows
      if (arrowsRef.current.length > 0) {
        arrowsRef.current.forEach(arrow => arrow.visible = false)
      }
      if (dotRef.current) dotRef.current.visible = false
      return
    }

    const fingerData = FINGER_GEOMETRY_DATA[selectedFinger]
    if (!fingerData) {
      if (arrowsRef.current.length > 0) {
        arrowsRef.current.forEach(arrow => arrow.visible = false)
      }
      if (dotRef.current) dotRef.current.visible = false
      return
    }

    const posLm1 = landmarks[fingerData.positionLandmarks[0]]
    const posLm2 = landmarks[fingerData.positionLandmarks[1]]
    const widthLm1 = landmarks[fingerData.widthLandmarks[0]]
    const widthLm2 = landmarks[fingerData.widthLandmarks[1]]

    if (!posLm1 || !posLm2 || !widthLm1 || !widthLm2) {
      if (arrowsRef.current.length > 0) {
        arrowsRef.current.forEach(arrow => arrow.visible = false)
      }
      if (dotRef.current) dotRef.current.visible = false
      return
    }

    // Convert landmark to world space
    const RING_PLANE_Z = 0
    const distance = camera.position.z - RING_PLANE_Z
    const fovInRadians = (camera.fov * Math.PI) / 180
    const viewHeight = 2 * Math.tan(fovInRadians / 2) * distance
    const viewWidth = viewHeight * camera.aspect

    const landmarkToWorld = (lm) => {
      const worldX = (lm.x - 0.5) * viewWidth
      const worldY = -(lm.y - 0.5) * viewHeight + 0.1
      const worldZ = lm.z * viewWidth * -1.3
      return new THREE.Vector3(worldX, worldY, worldZ)
    }

    const worldPos1 = landmarkToWorld(posLm1)
    const worldPos2 = landmarkToWorld(posLm2)
    const fingerPosition = new THREE.Vector3().addVectors(worldPos1, worldPos2).multiplyScalar(0.5)

    // Tính các trục tọa độ với orthonormalization
    const fingerDirection = new THREE.Vector3().subVectors(worldPos2, worldPos1).normalize()
    const sideDirectionRaw = new THREE.Vector3().subVectors(landmarkToWorld(widthLm1), landmarkToWorld(widthLm2))
    let handUp = new THREE.Vector3().crossVectors(sideDirectionRaw, fingerDirection).normalize()

    // Kiểm tra tay trái hay phải và palm/back
    const wrist = landmarks[0]
    const middleMCP = landmarks[9] // Middle finger base
    let handType = 'Unknown'
    let palmOrBack = 'Unknown'
    let isPalm = false
    let fyBeforeNegate = handUp.z

    let debugInfo = {}
    if (wrist && middleMCP) {
      const wristWorld = landmarkToWorld(wrist)
      const middleMCPWorld = landmarkToWorld(middleMCP)
      const thumbTip = landmarks[4] // Thumb tip

      // 1. Phát hiện PALM vs BACK (chỉ cho BACK CAMERA + TAY TRÁI)
      // BACK CAMERA: fyBeforeNegate > 0 = PALM (lòng), < 0 = BACK (mu)
      isPalm = fyBeforeNegate > 0
      palmOrBack = isPalm ? 'PALM (lòng)' : 'BACK (mu)'

      // 2. Phát hiện TAY TRÁI
      let thumbRight = false
      if (thumbTip) {
        const thumbWorld = landmarkToWorld(thumbTip)
        thumbRight = thumbWorld.x > middleMCPWorld.x
      }
      handType = 'LEFT'

      // Xác định hướng của Fy
      const fyDirectionBefore = fyBeforeNegate > 0 ? 'RA NGOÀI (+Z)' : 'VÀO NGƯỜI (-Z)'
      const willNegate = !isPalm

      // Tính Fz direction (TRƯỚC KHI negate Fy)
      const fzBeforeNegate = new THREE.Vector3().crossVectors(fingerDirection, handUp)
      const fzDirectionX = fzBeforeNegate.x > 0 ? 'PHẢI (+X)' : 'TRÁI (-X)'
      const fzDirectionY = fzBeforeNegate.y > 0 ? 'TRÊN (+Y)' : 'DƯỚI (-Y)'
      const fzDirectionZ = fzBeforeNegate.z > 0 ? 'RA NGOÀI (+Z)' : 'VÀO NGƯỜI (-Z)'

      // Debug info
      debugInfo = {
        fyBefore: fyBeforeNegate.toFixed(3),
        fyDirectionBefore: fyDirectionBefore,
        willNegate: willNegate ? 'YES' : 'NO',
        fyAfterNegate: willNegate ? (-fyBeforeNegate).toFixed(3) : fyBeforeNegate.toFixed(3),
        fzX: fzBeforeNegate.x.toFixed(3),
        fzY: fzBeforeNegate.y.toFixed(3),
        fzZ: fzBeforeNegate.z.toFixed(3),
        fzDirectionX: fzDirectionX,
        fzDirectionY: fzDirectionY,
        fzDirectionZ: fzDirectionZ
      }

      // Log chi tiết trong console - BỎ để tối ưu hiệu suất
      // console.log chạy mỗi frame (20-60fps) gây lag!

      // 3. Đảm bảo Fy LUÔN chỉ từ lòng bàn tay → mu bàn tay (móng)
      // PALM (lòng) trước camera: handUp tự nhiên chỉ ra xa (lòng→mu) → GIỮ NGUYÊN
      // BACK (mu) trước camera: handUp tự nhiên chỉ vào gần (mu→lòng) → NEGATE để thành (lòng→mu)
      if (!isPalm) {
        handUp.negate()
      }
    }

    // Tính lại sideDirection để đảm bảo orthonormal
    const sideDirection = new THREE.Vector3().crossVectors(fingerDirection, handUp).normalize()

    // Update position của group
    arrowGroupRef.current.position.copy(fingerPosition)

    // Chỉ tạo arrows + dot 1 LẦN
    if (arrowsRef.current.length === 0) {
      const arrowLength = 0.3
      const arrowX = new THREE.ArrowHelper(fingerDirection, new THREE.Vector3(), arrowLength, 0xff0000)
      const arrowY = new THREE.ArrowHelper(handUp, new THREE.Vector3(), arrowLength, 0x00ff00)
      const arrowZ = new THREE.ArrowHelper(sideDirection, new THREE.Vector3(), arrowLength, 0x0000ff)

      arrowGroupRef.current.add(arrowX)
      arrowGroupRef.current.add(arrowY)
      arrowGroupRef.current.add(arrowZ)

      // Dot đỏ
      const dotGeometry = new THREE.SphereGeometry(0.02, 8, 8)  // Giảm segments
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
      const dot = new THREE.Mesh(dotGeometry, dotMaterial)
      arrowGroupRef.current.add(dot)

      arrowsRef.current = [arrowX, arrowY, arrowZ]
      dotRef.current = dot
    } else {
      // Update hướng của arrows (không tạo mới)
      arrowsRef.current[0].setDirection(fingerDirection)
      arrowsRef.current[1].setDirection(handUp)
      arrowsRef.current[2].setDirection(sideDirection)

      arrowsRef.current.forEach(arrow => arrow.visible = true)
      if (dotRef.current) dotRef.current.visible = true
    }
  })

  return <group ref={arrowGroupRef} />
  // TẤT CẢ Text đã bị XÓA để tăng FPS tối đa!
  // Text rendering là nguyên nhân chính gây lag!
}

// ==================== RING WITH OCCLUDER (R3F) ====================
function RingWithOccluder({
  landmarks,
  selectedFinger,
  modelPath = '/myfav.glb',
  meshColors = {},
  isVisible = true,
  onMeshListLoad,
  debugFingerAxes = false,
  debugRingAxes = false,
  autoRotate = false,
  rotationSpeed = 0.5,
  alignRingToFinger = false,
  correctionX = 0,
  correctionY = 0,
  correctionZ = 0
}) {
  const { nodes, materials } = useGLTF(modelPath)
  const ringGroupRef = useRef()
  const occluderRef = useRef()
  const { camera } = useThree()

  // Load environment map with error handling
  let env
  try {
    env = useEnvironment({ files: '/studio_env/env_metal_1.exr' })
  } catch (error) {
    env = null
  }

  // State để lưu ring transform cho debug
  const [ringTransform, setRingTransform] = useState({
    position: new THREE.Vector3(-2.5, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(0.08, 0.08, 0.08)
  })

  // State để lưu góc xoay auto rotate
  const autoRotationY = useRef(0)

  // Đọc danh sách meshes từ GLTF
  useEffect(() => {
    if (nodes && onMeshListLoad) {
      const meshList = []
      Object.keys(nodes).forEach(key => {
        const node = nodes[key]
        if (node.isMesh || node.isInstancedMesh) {
          meshList.push({
            name: key,
            type: node.type
          })
        }
      })
      onMeshListLoad(meshList)
    }
  }, [nodes, onMeshListLoad])

  // Geometry cho occluder - tạo một lần
  const occluderGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 1, 16)
    geo.rotateX(Math.PI / 2) // Xoay để chiều dài theo trục X
    return geo
  }, [])

  // Nhẫn luôn đứng yên ở góc trái màn hình
  useFrame((state, delta) => {
    if (!ringGroupRef.current || !occluderRef.current) return

    // Auto rotate
    if (autoRotate && !alignRingToFinger) {
      autoRotationY.current += delta * rotationSpeed
    }

    // Vị trí nhẫn ở GIỮA màn hình
    const ringPosX = 0
    const ringPosY = 0
    const ringPosZ = 0

    ringGroupRef.current.visible = true
    ringGroupRef.current.position.set(ringPosX, ringPosY, ringPosZ)
    ringGroupRef.current.scale.set(0.08, 0.08, 0.08)

    // Nếu align to finger, tính rotation từ finger axes
    if (alignRingToFinger && landmarks) {
      const fingerData = FINGER_GEOMETRY_DATA[selectedFinger]
      if (fingerData) {
        const posLm1 = landmarks[fingerData.positionLandmarks[0]]
        const posLm2 = landmarks[fingerData.positionLandmarks[1]]
        const widthLm1 = landmarks[fingerData.widthLandmarks[0]]
        const widthLm2 = landmarks[fingerData.widthLandmarks[1]]

        if (posLm1 && posLm2 && widthLm1 && widthLm2) {
          // Convert landmark to world space (same logic as FingerAxesDebug)
          const RING_PLANE_Z = 0
          const distance = camera.position.z - RING_PLANE_Z
          const fovInRadians = (camera.fov * Math.PI) / 180
          const viewHeight = 2 * Math.tan(fovInRadians / 2) * distance
          const viewWidth = viewHeight * camera.aspect

          const landmarkToWorld = (lm) => {
            const worldX = (lm.x - 0.5) * viewWidth
            const worldY = -(lm.y - 0.5) * viewHeight + 0.1
            const worldZ = lm.z * viewWidth * -1.3
            return new THREE.Vector3(worldX, worldY, worldZ)
          }

          const worldPos1 = landmarkToWorld(posLm1)
          const worldPos2 = landmarkToWorld(posLm2)
          const fingerPosition = new THREE.Vector3().addVectors(worldPos1, worldPos2).multiplyScalar(0.5)

          // Tính Fx, Fy, Fz với orthonormalization để đảm bảo 3D rotation đúng
          const fingerDirection = new THREE.Vector3().subVectors(worldPos2, worldPos1).normalize() // Fx - trục chính
          const sideDirectionRaw = new THREE.Vector3().subVectors(landmarkToWorld(widthLm1), landmarkToWorld(widthLm2))

          // Orthogonalize: loại bỏ component của fingerDirection khỏi sideDirection
          let handUp = new THREE.Vector3().crossVectors(sideDirectionRaw, fingerDirection).normalize() // Fy

          // Phát hiện PALM vs BACK (BACK CAMERA + TAY TRÁI)
          const handUpInitialZ = handUp.z
          const isPalm = handUpInitialZ > 0

          // Đảm bảo Fy LUÔN chỉ từ lòng bàn tay → mu bàn tay (móng)
          // PALM (lòng) trước camera: handUp chỉ ra xa (lòng→mu) → GIỮ NGUYÊN
          // BACK (mu) trước camera: handUp chỉ vào gần (mu→lòng) → NEGATE để thành (lòng→mu)
          if (!isPalm) {
            handUp.negate()
          }

          // Tạo rotation matrix dựa trên finger axes:
          // Ry (nhẫn) = Fy (ngón tay) = handUp ✓
          // Rz (nhẫn) = Fx (ngón tay) = fingerDirection
          // Rx (nhẫn) = Ry × Rz để đảm bảo orthonormal
          const Ry = handUp
          const Rz = fingerDirection
          const Rx = new THREE.Vector3().crossVectors(Ry, Rz).normalize()

          const rotationMatrix = new THREE.Matrix4()
          rotationMatrix.makeBasis(Rx, Ry, Rz)

          const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix)

          // Apply correction rotation (để điều chỉnh alignment)
          const correctionEuler = new THREE.Euler(correctionX, correctionY, correctionZ, 'XYZ')
          const correctionQuaternion = new THREE.Quaternion().setFromEuler(correctionEuler)
          quaternion.multiply(correctionQuaternion)

          ringGroupRef.current.quaternion.copy(quaternion)
        }
      }
    } else {
      // Rotation bình thường - GÓC CỐ ĐỊNH (không phụ thuộc vị trí)
      // Chỉ cộng thêm autoRotation nếu bật
      const totalAngleY = 0 + autoRotationY.current
      ringGroupRef.current.rotation.set(0, totalAngleY, 0)
    }

    occluderRef.current.visible = false

    // Update ring transform cho debug - CHỈ KHI CẦN (debug mode ON)
    if (debugRingAxes) {
      setRingTransform({
        position: ringGroupRef.current.position.clone(),
        rotation: ringGroupRef.current.rotation.clone(),
        scale: ringGroupRef.current.scale.clone()
      })
    }
  })

  return (
    <>
      {/* Debug Finger Axes */}
      {debugFingerAxes && <FingerAxesDebug landmarks={landmarks} selectedFinger={selectedFinger} camera={camera} />}

      {/* Debug Ring Axes */}
      {debugRingAxes && <RingAxesDebug ringPosition={ringTransform.position} ringRotation={ringTransform.rotation} ringScale={ringTransform.scale} />}

      {/* Occluder - render trước */}
      <mesh ref={occluderRef} renderOrder={0} visible={false}>
        <primitive object={occluderGeometry} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={true}
        />
      </mesh>

      {/* Ring model - render sau */}
      <group ref={ringGroupRef} renderOrder={1} dispose={null} visible={true}>
        {Object.keys(nodes).map(key => {
          const node = nodes[key]
          const material = node.material

          if (node.isInstancedMesh) {
            return (
              <instancedMesh
                key={key}
                castShadow={false}
                receiveShadow={false}
                args={[node.geometry, null, node.count]}
                instanceMatrix={node.instanceMatrix}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              >
                {env ? (
                  <MeshRefractionMaterial
                    color={meshColors[key] || material?.color || '#b5cbdd'}
                    side={THREE.DoubleSide}
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  <meshStandardMaterial
                    color={meshColors[key] || material?.color || '#b5cbdd'}
                    roughness={0.15}
                    metalness={1}
                    envMap={env}
                    envMapIntensity={2}
                    side={THREE.DoubleSide}
                  />
                )}
              </instancedMesh>
            )
          }

          if (node.isMesh) {
            const isGemMesh = key.toLowerCase().includes('gem') ||
                             key.toLowerCase().includes('diamond') ||
                             key.toLowerCase().includes('stone')

            return (
              <mesh
                key={key}
                castShadow={false}
                receiveShadow={false}
                geometry={node.geometry}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              >
                {isGemMesh && env ? (
                  <MeshRefractionMaterial
                    color={meshColors[key] || material?.color || '#b5cbdd'}
                    envMap={env}
                    aberrationStrength={0.02}
                    toneMapped={false}
                  />
                ) : (
                  <meshStandardMaterial
                    color={meshColors[key] || material?.color || '#ffaf83'}
                    roughness={0.15}
                    metalness={1}
                    envMap={env}
                    envMapIntensity={1.5}
                    transparent={material?.transparent}
                    opacity={material?.opacity ?? 1}
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

// ==================== SCENE SETUP ====================
const Scene = React.memo(function Scene({ landmarks, selectedFinger, modelPath, isHandVisible, meshColors, onMeshListLoad, debugFingerAxes, debugRingAxes, autoRotate, rotationSpeed, alignRingToFinger, correctionX, correctionY, correctionZ }) {
  const { camera } = useThree()

  // Đặt camera về vị trí gốc - CHỈ SETUP 1 LẦN
  useEffect(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 10, 7]} intensity={2.0} castShadow={false} />
      <RingWithOccluder
        landmarks={landmarks}
        selectedFinger={selectedFinger}
        modelPath={modelPath}
        isVisible={isHandVisible}
        meshColors={meshColors}
        onMeshListLoad={onMeshListLoad}
        debugFingerAxes={debugFingerAxes}
        debugRingAxes={debugRingAxes}
        autoRotate={autoRotate}
        rotationSpeed={rotationSpeed}
        alignRingToFinger={alignRingToFinger}
        correctionX={correctionX}
        correctionY={correctionY}
        correctionZ={correctionZ}
      />
    </>
  )
})

// ==================== PRELOAD MODEL ====================
// Preload the model to avoid loading delays
useGLTF.preload('/myfav.glb')

// ==================== MAIN COMPONENT ====================
export default function QuocTiar({ modelPath = '/myfav.glb' }) {

  const [landmarks, setLandmarks] = useState(null)
  const [isHandVisible, setIsHandVisible] = useState(false)
  const [selectedFinger, setSelectedFinger] = useState('Ring')
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo...')
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [meshList, setMeshList] = useState([])

  // Debug controls - MẶC ĐỊNH TẮT HẾT để tối ưu
  const { debugFingerAxes, debugRingAxes, alignRingToFinger } = useControls('Debug', {
    debugFingerAxes: { value: false, label: 'Show Finger Axes (LAG!)' },
    debugRingAxes: { value: false, label: 'Show Ring Axes (LAG!)' },
    alignRingToFinger: { value: false, label: 'Align Ring to Finger' }
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handLandmarkerRef = useRef(null)
  const animationFrameIdRef = useRef(null)
  const lastFrameTimeRef = useRef(0)
  const frameSkipCounter = useRef(0)  // Đếm frames để skip

  // Ring controls
  const { autoRotate, rotationSpeed, correctionX, correctionY, correctionZ } = useControls('Ring', {
    autoRotate: { value: false, label: 'Auto Rotate' },
    rotationSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1, label: 'Speed' },
    correctionX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1, label: 'Correction X' },
    correctionY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1, label: 'Correction Y' },
    correctionZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1, label: 'Correction Z' }
  })

  // Tạo color schema cho từng mesh với màu mặc định
  const colorSchema = useMemo(() => {
    const schema = {}
    meshList.forEach(mesh => {
      const name = mesh.name.toLowerCase()
      let defaultColor = '#ffffff'

      // Set màu mặc định theo tên mesh
      if (name.includes('ring')) {
        defaultColor = '#ffaf83' // ring band color
      } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
        defaultColor = '#b5cbdd' // diamond color
      }

      schema[mesh.name] = { value: defaultColor, label: mesh.name }
    })
    return schema
  }, [meshList])

  // Tạo color controls động cho từng mesh
  const colorControls = useControls('Mesh Colors', colorSchema, [colorSchema])

  // Khởi tạo MediaPipe
  useEffect(() => {
    let isCancelled = false

    const initMediaPipe = async () => {
      try {
        setLoadingMessage('Tải mô hình nhận diện bàn tay...')
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
        )

        if (isCancelled) return

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1
        })

        setLoadingMessage('Khởi động camera...')
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 640, max: 960 },    // Giảm thêm: 640x360
            height: { ideal: 360, max: 540 },
            frameRate: { ideal: 15, max: 20 }   // Giảm xuống 15 FPS
          }
        })

        if (isCancelled) {
          mediaStream.getTracks().forEach(track => track.stop())
          return
        }

        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          await videoRef.current.play()
        }

        setLoadingMessage('')
        startDetection()
      } catch (err) {
        if (!isCancelled) {
          console.error('Lỗi khởi tạo:', err)
          setError(err.message || 'Không thể khởi tạo camera/MediaPipe')
          setLoadingMessage('')
        }
      }
    }

    const startDetection = () => {
      const detect = (currentTime) => {
        if (isCancelled) return

        if (currentTime - lastFrameTimeRef.current >= FRAME_INTERVAL) {
          lastFrameTimeRef.current = currentTime

          // Skip frames cho MediaPipe - CHỈ CHẠY mỗi N frames
          frameSkipCounter.current++
          const shouldProcessFrame = frameSkipCounter.current % MEDIAPIPE_SKIP_FRAMES === 0

          if (shouldProcessFrame && videoRef.current?.readyState >= 4 && handLandmarkerRef.current) {
            const results = handLandmarkerRef.current.detectForVideo(
              videoRef.current,
              performance.now()
            )

            if (results.landmarks?.length > 0) {
              // Apply smoothing to reduce jitter
              setLandmarks(prevLandmarks => {
                const rawLandmarks = results.landmarks[0]

                if (!prevLandmarks) return rawLandmarks

                return rawLandmarks.map((newLm, i) => ({
                  x: prevLandmarks[i].x + (newLm.x - prevLandmarks[i].x) * SMOOTHING_FACTOR,
                  y: prevLandmarks[i].y + (newLm.y - prevLandmarks[i].y) * SMOOTHING_FACTOR,
                  z: prevLandmarks[i].z + (newLm.z - prevLandmarks[i].z) * SMOOTHING_FACTOR
                }))
              })
              setIsHandVisible(true)
            } else {
              setLandmarks(null)
              setIsHandVisible(false)
            }
          }
        }

        animationFrameIdRef.current = requestAnimationFrame(detect)
      }

      animationFrameIdRef.current = requestAnimationFrame(detect)
    }

    initMediaPipe()

    return () => {
      isCancelled = true
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    // Vẽ video
    ctx.drawImage(video, 0, 0)

    // Vẽ canvas R3F lên trên
    ctx.drawImage(canvasRef.current, 0, 0)

    // Download
    const link = document.createElement('a')
    link.download = `ring-tryon-${Date.now()}.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.9)
    link.click()
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Video camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* R3F Canvas overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <Suspense fallback={
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '18px',
            background: 'rgba(0,0,0,0.7)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            Đang tải mô hình 3D...
          </div>
        }>
          <Canvas
            ref={canvasRef}
            gl={{
              alpha: true,
              preserveDrawingBuffer: true,
              antialias: false,  // Tắt antialiasing để tăng FPS
              powerPreference: 'high-performance'  // Dùng GPU mạnh hơn
            }}
            camera={{ fov: 50, position: [0, 0, 5] }}
            frameloop="always"  // Cần render liên tục cho AR
            dpr={[1, 1.5]}  // Giới hạn pixel ratio để tăng FPS
            performance={{ min: 0.5 }}  // Giảm chất lượng nếu FPS thấp
          >
            <Scene
              landmarks={landmarks}
              selectedFinger={selectedFinger}
              modelPath={modelPath}
              isHandVisible={isHandVisible}
              meshColors={colorControls}
              onMeshListLoad={setMeshList}
              debugFingerAxes={debugFingerAxes}
              debugRingAxes={debugRingAxes}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              alignRingToFinger={alignRingToFinger}
              correctionX={correctionX}
              correctionY={correctionY}
              correctionZ={correctionZ}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* UI Controls */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <select
          value={selectedFinger}
          onChange={(e) => setSelectedFinger(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid white',
            background: 'rgba(0,0,0,0.7)',
            color: 'white'
          }}
        >
          {Object.keys(FINGER_GEOMETRY_DATA).map(finger => (
            <option key={finger} value={finger}>
              {finger === 'Thumb' ? 'Ngón cái' :
               finger === 'Index' ? 'Ngón trỏ' :
               finger === 'Middle' ? 'Ngón giữa' :
               finger === 'Ring' ? 'Ngón áp út' :
               finger === 'Pinky' ? 'Ngón út' : finger}
            </option>
          ))}
        </select>
      </div>

      {/* Capture button */}
      {!loadingMessage && !error && (
        <button
          onClick={handleCapture}
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: 70,
            height: 70,
            borderRadius: '50%',
            border: '4px solid white',
            background: 'rgba(255,255,255,0.3)',
            cursor: 'pointer'
          }}
        />
      )}

      {/* Loading/Error overlay */}
      {(loadingMessage || error) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          color: 'white',
          fontSize: '20px'
        }}>
          {error || loadingMessage}
        </div>
      )}

      {/* Hand status indicator */}
      {!loadingMessage && !error && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          padding: '10px 20px',
          background: isHandVisible ? 'rgba(0,255,0,0.3)' : 'rgba(204, 70, 70, 0.3)',
          borderRadius: '8px',
          color: 'white',
          border: `2px solid ${isHandVisible ? 'lime' : 'red'}`
        }}>
          {isHandVisible ? '✓ Phát hiện bàn tay' : '✗ Không thấy bàn tay'}
        </div>
      )}
    </div>
  )
}
