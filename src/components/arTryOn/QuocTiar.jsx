import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, MeshRefractionMaterial, useEnvironment, Text } from '@react-three/drei'
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

const SMOOTHING_FACTOR = 0.25
const TARGET_FPS = 30
const FRAME_INTERVAL = 1000 / TARGET_FPS

// ==================== RING AXES DEBUG ====================
function RingAxesDebug({ ringPosition, ringRotation, ringScale }) {
  const arrowGroupRef = useRef()
  const [axesData, setAxesData] = useState(null)

  useFrame(() => {
    if (!arrowGroupRef.current) return

    // Update position của group
    arrowGroupRef.current.position.copy(ringPosition)
    arrowGroupRef.current.rotation.copy(ringRotation)

    // Clear children và tạo mới
    arrowGroupRef.current.children = []

    // Tạo 3 trục tọa độ của nhẫn (local coordinate system)
    const arrowLength = 0.5
    const axisX = new THREE.Vector3(1, 0, 0) // Rx - đỏ
    const axisY = new THREE.Vector3(0, 1, 0) // Ry - xanh lá
    const axisZ = new THREE.Vector3(0, 0, 1) // Rz - xanh dương

    const arrowX = new THREE.ArrowHelper(axisX, new THREE.Vector3(), arrowLength, 0xff0000)
    const arrowY = new THREE.ArrowHelper(axisY, new THREE.Vector3(), arrowLength, 0x00ff00)
    const arrowZ = new THREE.ArrowHelper(axisZ, new THREE.Vector3(), arrowLength, 0x0000ff)

    arrowGroupRef.current.add(arrowX)
    arrowGroupRef.current.add(arrowY)
    arrowGroupRef.current.add(arrowZ)

    // Lưu data để render text labels
    setAxesData({
      position: ringPosition,
      rx: axisX.clone().multiplyScalar(arrowLength + 0.1),
      ry: axisY.clone().multiplyScalar(arrowLength + 0.1),
      rz: axisZ.clone().multiplyScalar(arrowLength + 0.1)
    })
  })

  return (
    <>
      <group ref={arrowGroupRef} />
      {axesData && (
        <group position={axesData.position} rotation={ringRotation}>
          <Text position={axesData.rx} fontSize={0.1} color="red" anchorX="center" anchorY="middle">
            Rx
          </Text>
          <Text position={axesData.ry} fontSize={0.1} color="lime" anchorX="center" anchorY="middle">
            Ry
          </Text>
          <Text position={axesData.rz} fontSize={0.1} color="blue" anchorX="center" anchorY="middle">
            Rz
          </Text>
        </group>
      )}
    </>
  )
}

// ==================== FINGER AXES DEBUG ====================
function FingerAxesDebug({ landmarks, selectedFinger, camera, flipLogic }) {
  const arrowGroupRef = useRef()
  const [axesData, setAxesData] = useState(null)

  useFrame(() => {
    if (!landmarks || !arrowGroupRef.current) {
      // Ẩn axes khi không có landmarks
      setAxesData(null)
      arrowGroupRef.current.children = []
      return
    }

    const fingerData = FINGER_GEOMETRY_DATA[selectedFinger]
    if (!fingerData) {
      setAxesData(null)
      arrowGroupRef.current.children = []
      return
    }

    const posLm1 = landmarks[fingerData.positionLandmarks[0]]
    const posLm2 = landmarks[fingerData.positionLandmarks[1]]
    const widthLm1 = landmarks[fingerData.widthLandmarks[0]]
    const widthLm2 = landmarks[fingerData.widthLandmarks[1]]

    if (!posLm1 || !posLm2 || !widthLm1 || !widthLm2) {
      setAxesData(null)
      arrowGroupRef.current.children = []
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

      // 1. Phát hiện PALM vs BACK: dùng fyBeforeNegate (handUp.z gốc)
      // Nếu flipLogic (front cam) thì đảo logic
      isPalm = flipLogic ? (fyBeforeNegate < 0) : (fyBeforeNegate > 0)
      palmOrBack = isPalm ? 'PALM (lòng)' : 'BACK (mu)'

      // 2. Phát hiện TAY TRÁI: thumb detection cũng phải flip khi front cam
      let thumbRight = false
      if (thumbTip) {
        const thumbWorld = landmarkToWorld(thumbTip)
        thumbRight = thumbWorld.x > middleMCPWorld.x
      }
      handType = 'LEFT'

      // Debug info
      debugInfo = {
        fyBefore: fyBeforeNegate.toFixed(2),
        thumbRight: thumbRight ? 'YES' : 'NO',
        thumbX: thumbTip ? landmarkToWorld(thumbTip).x.toFixed(2) : 'N/A',
        mcpX: middleMCPWorld.x.toFixed(2)
      }

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

    // Clear children và tạo mới
    arrowGroupRef.current.children = []

    // Tạo 3 arrow helpers
    const arrowLength = 0.3
    const arrowX = new THREE.ArrowHelper(fingerDirection, new THREE.Vector3(), arrowLength, 0xff0000) // Fx - đỏ
    const arrowY = new THREE.ArrowHelper(handUp, new THREE.Vector3(), arrowLength, 0x00ff00) // Fy - xanh lá
    const arrowZ = new THREE.ArrowHelper(sideDirection, new THREE.Vector3(), arrowLength, 0x0000ff) // Fz - xanh dương

    arrowGroupRef.current.add(arrowX)
    arrowGroupRef.current.add(arrowY)
    arrowGroupRef.current.add(arrowZ)

    // Lưu data để render text labels
    setAxesData({
      position: fingerPosition,
      fx: fingerDirection.clone().multiplyScalar(arrowLength + 0.1),
      fy: handUp.clone().multiplyScalar(arrowLength + 0.1),
      fz: sideDirection.clone().multiplyScalar(arrowLength + 0.1),
      fyDirection: handUp.clone(), // Lưu vector gốc để kiểm tra hướng Z
      handType: handType,
      palmOrBack: palmOrBack,
      fyBeforeNegate: fyBeforeNegate,
      debugInfo: debugInfo
    })
  })

  return (
    <>
      <group ref={arrowGroupRef} />
      {axesData && (
        <>
          {/* Chấm đỏ đánh dấu vị trí đeo nhẫn */}
          <mesh position={axesData.position}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="red" />
          </mesh>

          <group position={axesData.position}>
            <Text position={axesData.fx} fontSize={0.08} color="red" anchorX="center" anchorY="middle">
              Fx
            </Text>
            <Text position={axesData.fy} fontSize={0.08} color="lime" anchorX="center" anchorY="middle">
              Fy
            </Text>
            <Text position={axesData.fz} fontSize={0.08} color="blue" anchorX="center" anchorY="middle">
              Fz
            </Text>

            {/* Hiển thị debug info */}
            <Text
              position={[0, -0.35, 0]}
              fontSize={0.09}
              color="cyan"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="black"
            >
              {`${axesData.handType} | ${axesData.palmOrBack}`}
            </Text>
            <Text
              position={[0, -0.50, 0]}
              fontSize={0.09}
              color="yellow"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="black"
            >
              {`Fy: lòng→mu (Z=${axesData.fyDirection.z.toFixed(2)})`}
            </Text>
            {axesData.debugInfo && Object.keys(axesData.debugInfo).length > 0 && (
              <>
                <Text
                  position={[0, -0.65, 0]}
                  fontSize={0.07}
                  color="orange"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="black"
                >
                  {`Fy Before: ${axesData.debugInfo.fyBefore} | Thumb Right: ${axesData.debugInfo.thumbRight}`}
                </Text>
                <Text
                  position={[0, -0.75, 0]}
                  fontSize={0.07}
                  color="orange"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.01}
                  outlineColor="black"
                >
                  {`ThumbX: ${axesData.debugInfo.thumbX} | McpX: ${axesData.debugInfo.mcpX}`}
                </Text>
              </>
            )}

          </group>
        </>
      )}
    </>
  )
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
  correctionZ = 0,
  flipLogic = false
}) {
  const { nodes, materials } = useGLTF(modelPath)
  const ringGroupRef = useRef()
  const occluderRef = useRef()
  const { camera } = useThree()
  const env = useEnvironment({ files: '/studio_env/env_metal_1.exr' })

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

    // Vị trí nhẫn ở góc trái
    const ringPosX = -2.5
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

          // Phát hiện PALM vs BACK
          const handUpInitialZ = handUp.z
          // Nếu flipLogic (front cam) thì đảo logic
          const isPalm = flipLogic ? (handUpInitialZ < 0) : (handUpInitialZ > 0)

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
      // Rotation bình thường
      const angleY = Math.atan2(ringPosX - 0, ringPosZ - 5)
      const totalAngleY = angleY + autoRotationY.current
      ringGroupRef.current.rotation.set(0, totalAngleY, 0)
    }

    occluderRef.current.visible = false

    // Update ring transform cho debug
    setRingTransform({
      position: ringGroupRef.current.position.clone(),
      rotation: ringGroupRef.current.rotation.clone(),
      scale: ringGroupRef.current.scale.clone()
    })
  })

  return (
    <>
      {/* Debug Finger Axes */}
      {debugFingerAxes && <FingerAxesDebug landmarks={landmarks} selectedFinger={selectedFinger} camera={camera} flipLogic={flipLogic} />}

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
                castShadow
                receiveShadow
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
                castShadow
                receiveShadow
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
function Scene({ landmarks, selectedFinger, modelPath, isHandVisible, meshColors, onMeshListLoad, debugFingerAxes, debugRingAxes, autoRotate, rotationSpeed, alignRingToFinger, correctionX, correctionY, correctionZ, flipLogic }) {
  const { camera } = useThree()

  // Đặt camera về vị trí gốc để finger tracking hoạt động đúng
  useFrame(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  })

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 10, 7]} intensity={2.0} />
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
        flipLogic={flipLogic}
      />
    </>
  )
}

// ==================== MAIN COMPONENT ====================
export default function QuocTiar({ modelPath = '/myfav.glb' }) {
  const [landmarks, setLandmarks] = useState(null)
  const [isHandVisible, setIsHandVisible] = useState(false)
  const [selectedFinger, setSelectedFinger] = useState('Ring')
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo...')
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [meshList, setMeshList] = useState([])

  // Debug controls
  const { debugFingerAxes, debugRingAxes, alignRingToFinger, flipLogic } = useControls('Debug', {
    debugFingerAxes: { value: false, label: 'Show Finger Axes' },
    debugRingAxes: { value: false, label: 'Show Ring Axes' },
    alignRingToFinger: { value: false, label: 'Align Ring to Finger' },
    flipLogic: { value: false, label: 'Flip Logic for Front Cam (default: Back Cam)' }
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handLandmarkerRef = useRef(null)
  const animationFrameIdRef = useRef(null)
  const lastFrameTimeRef = useRef(0)

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
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 },
            frameRate: { ideal: 30, max: 30 }
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

          if (videoRef.current?.readyState >= 4 && handLandmarkerRef.current) {
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
        <Canvas
          ref={canvasRef}
          gl={{
            alpha: true,
            preserveDrawingBuffer: true,
            antialias: true
          }}
          camera={{ fov: 50, position: [0, 0, 5] }}
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
            flipLogic={flipLogic}
          />
        </Canvas>
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
            bottom: 40,
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
