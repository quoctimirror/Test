# 💎 REACT THREE FIBER - RING BEAUTY CODE COLLECTION

Tất cả code làm đẹp nhẫn bằng R3F (React Three Fiber) - Tối ưu cho VR

---

## 🎯 I. MATERIALS - LÀM ĐẸP VẬT LIỆU

### 1. MeshRefractionMaterial - Kim cương lấp lánh (Gems)

**File:** `Ring3D.jsx:77-87, 138-145`

```jsx
import { MeshRefractionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Áp dụng cho DIAMOND/GEM meshes
<MeshRefractionMaterial
  color={meshColors[key] || material?.color || '#b5cbdd'}  // Màu kim cương
  side={THREE.DoubleSide}           // Render cả 2 mặt
  envMap={env}                      // Environment map cho phản chiếu
  aberrationStrength={0.02}         // Độ lệch màu (chromatic aberration)
  toneMapped={false}                // Giữ nguyên màu gốc, không ánh xạ
/>
```

**Thuộc tính quan trọng:**
- `color`: Màu của kim cương (#b5cbdd = blue, #9b111e = ruby)
- `envMap`: HDR environment map tạo phản chiếu chân thực
- `aberrationStrength`: Hiệu ứng tán sắc ánh sáng (như lăng kính)
- `toneMapped={false}`: Giữ màu sáng chói không bị nén

---

### 2. meshStandardMaterial - Vàng/Bạch kim bóng (Ring Band)

**File:** `Ring3D.jsx:147-152`

```jsx
// Áp dụng cho RING BAND (vàng, bạch kim, bạc)
<meshStandardMaterial
  color={meshColors[key] || material?.color || '#ffaf83'}  // Rose Gold 2
  roughness={0.15}                  // Độ nhám thấp = bóng
  metalness={1}                     // Kim loại 100%
  envMap={env}                      // Environment map
  envMapIntensity={1.5}             // Cường độ phản chiếu
/>
```

**Thuộc tính quan trọng:**
- `color`: Màu kim loại (#ffaf83 = rose gold, #b9bbbc = platinum)
- `roughness`: 0.15 = rất bóng, 1.0 = nhám hoàn toàn
- `metalness`: 1.0 = kim loại hoàn toàn
- `envMapIntensity`: Cường độ phản chiếu môi trường

---

### 3. Highlight Material - Mesh được chọn (Debugging)

**File:** `Ring3D.jsx:73-77, 132-137`

```jsx
// Khi mesh được chọn → hiển thị màu đỏ
{selectedMesh === key ? (
  <meshStandardMaterial
    color="#ff0000"                 // Đỏ chói
    emissive="#ff0000"              // Phát sáng đỏ
    emissiveIntensity={0.5}         // Độ phát sáng
  />
) : (
  // ... material bình thường
)}
```

---

## 🌟 II. ENVIRONMENT MAP - MÔI TRƯỜNG PHẢN CHIẾU

### 4. useEnvironment - Load HDR Environment Map

**File:** `Scene3D.jsx:22`

```jsx
import { useEnvironment, Environment } from '@react-three/drei';

// Load HDR environment map
const env = useEnvironment({
  files: '/studio_env/env_metal_1.exr'  // File HDR/EXR
});

// Áp dụng vào scene (đặt ở cuối Scene component)
<Environment
  map={env}           // Sử dụng env map đã load
  background={false}  // Không dùng làm background (chỉ phản chiếu)
/>
```

**Giải thích:**
- **EXR file**: Định dạng HDR (High Dynamic Range) chứa thông tin ánh sáng
- **Environment map**: Tạo phản chiếu 360° trên bề mặt kim loại/kim cương
- **background={false}**: Chỉ dùng cho phản chiếu, không thay đổi background

---

## 💡 III. LIGHTING - ÁNH SÁNG

### 5. SpotLight - Ánh sáng điểm tập trung

**File:** `Scene3D.jsx:52-59`

```jsx
<spotLight
  position={[10, 10, 10]}  // Vị trí: trên cao, bên phải
  angle={0.15}             // Góc chiếu (radian) - hẹp
  penumbra={1}             // Độ mờ viền (0-1)
  decay={0}                // Suy giảm ánh sáng theo khoảng cách
  intensity={Math.PI}      // Cường độ (≈3.14)
/>
```

**Tác dụng:**
- Tạo điểm sáng tập trung trên nhẫn
- `angle` nhỏ = tia sáng hẹp, tập trung
- `penumbra=1` = viền mờ tự nhiên

---

### 6. Lighting cho AR (Vanilla Three.js style)

**File:** `TryOnRing.jsx:187-190`

```jsx
// Trong R3F, viết như JSX:
<ambientLight
  intensity={1.5}       // Ánh sáng tổng thể
  color={0xffffff}      // Màu trắng
/>

<directionalLight
  position={[3, 10, 7]} // Vị trí
  intensity={2.0}       // Cường độ
  castShadow={false}    // Không tạo bóng (tối ưu hiệu suất)
/>
```

---

## ✨ IV. POST-PROCESSING - HIỆU ỨNG HẬU KỲ

### 7. EffectComposer - Bloom + AO + Anti-aliasing

**File:** `Scene3D.jsx:84-111`

```jsx
import { EffectComposer, Bloom, N8AO, ToneMapping, FXAA } from '@react-three/postprocessing';

<EffectComposer
  disableNormalPass={renderMode === 'smooth'}              // Tắt normal pass khi smooth mode
  multisampling={renderMode === 'fullTopping' ? 4 : 2}    // Anti-aliasing samples
>
  {/* 1. FXAA - Anti-aliasing nhẹ */}
  <FXAA />

  {/* 2. N8AO - Ambient Occlusion (bóng đổ tự nhiên) */}
  <N8AO
    aoRadius={renderMode === 'fullTopping' ? 0.15 : 0.1}
    intensity={renderMode === 'fullTopping' ? 4 : 2}
    distanceFalloff={renderMode === 'fullTopping' ? 2 : 1}
    quality={renderMode === 'smooth' ? 'performance' : undefined}
    halfRes={renderMode === 'smooth'}  // Render ở độ phân giải thấp hơn
  />

  {/* 3. Bloom - Hiệu ứng lấp lánh */}
  <Bloom
    luminanceThreshold={renderMode === 'fullTopping' ? 1.5 : 2.0}  // Ngưỡng sáng
    intensity={renderMode === 'fullTopping' ? 1.2 : 0.8}           // Cường độ
    levels={renderMode === 'fullTopping' ? 9 : 7}                  // Số layers
    mipmapBlur                                                      // Blur mượt
  />

  {/* 4. ToneMapping - Ánh xạ màu HDR */}
  <ToneMapping />
</EffectComposer>
```

**Giải thích từng effect:**

#### a) **FXAA (Fast Approximate Anti-Aliasing)**
- Làm mịn cạnh, chống răng cưa
- Nhẹ hơn MSAA, phù hợp VR

#### b) **N8AO (Ambient Occlusion)**
- Tạo bóng đổ tự nhiên ở góc khuất
- `aoRadius`: Bán kính tính bóng
- `intensity`: Độ đậm của bóng
- `halfRes={true}`: Tối ưu cho VR (giảm 50% tải)

#### c) **Bloom**
- Hiệu ứng lấp lánh cho kim cương
- `luminanceThreshold`: Chỉ áp dụng cho vùng sáng
- `intensity`: Độ mạnh hiệu ứng
- `levels`: Độ lan tỏa

#### d) **ToneMapping**
- Chuyển đổi màu HDR → SDR
- Giữ chi tiết vùng sáng/tối

---

### 8. Render Mode Switch - Smooth vs FullTopping

**File:** `SimpleMeshInspector.jsx:215-238`

```jsx
const [renderMode, setRenderMode] = useState('smooth');

// UI Toggle
<label>
  <input
    type="checkbox"
    checked={renderMode === 'fullTopping'}
    onChange={(e) => setRenderMode(e.target.checked ? 'fullTopping' : 'smooth')}
  />
  {renderMode === 'smooth' ? '⚡ Smooth Mode (Fast)' : '✨ FullTopping Mode (Beautiful)'}
</label>
```

**Smooth Mode (VR tối ưu):**
- `multisampling={2}`
- `aoRadius={0.1}`, `intensity={2}`
- `halfRes={true}` cho N8AO
- `luminanceThreshold={2.0}` (ít bloom hơn)

**FullTopping Mode (Desktop đẹp):**
- `multisampling={4}`
- `aoRadius={0.15}`, `intensity={4}`
- `halfRes={false}`
- `luminanceThreshold={1.5}` (nhiều bloom)

---

## 🎨 V. CAMERA & CONTROLS

### 9. OrbitControls - Xoay camera quanh nhẫn

**File:** `Scene3D.jsx:76-81`

```jsx
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  enablePan={false}                  // Tắt di chuyển (chỉ xoay + zoom)
  minPolarAngle={0}                  // Góc tối thiểu (0 = nhìn từ trên)
  maxPolarAngle={Math.PI / 2.25}     // Góc tối đa (≈80° = gần ngang)
  makeDefault                        // Đặt làm controls mặc định
/>
```

**Tối ưu cho VR:**
- `enablePan={false}`: Giảm input handling
- Giới hạn góc xoay để tránh mất phương hướng

---

### 10. Camera Setup

**File:** `SimpleMeshInspector.jsx:279`

```jsx
<Canvas
  camera={{
    position: [0, 0, 10],  // Vị trí camera (xa 10 units)
    fov: 50                // Field of view (độ)
  }}
>
```

---

## 🏗️ VI. MODEL RENDERING

### 11. Center Component - Tự động căn giữa

**File:** `Ring3D.jsx:28`

```jsx
import { Center } from '@react-three/drei';

<Center top>  {/* top: Căn theo cạnh trên */}
  <group
    position={[transform.posX, transform.posY, transform.posZ]}
    rotation={[transform.rotX, transform.rotY, transform.rotZ]}
    scale={transform.scale}
  >
    {/* Meshes */}
  </group>
</Center>
```

**Tác dụng:**
- Tự động tính bounding box
- Căn giữa model trong viewport

---

### 12. useFrame - Animation Loop (Auto-rotate)

**File:** `Ring3D.jsx:21-25`

```jsx
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const groupRef = useRef();

useFrame((state, delta) => {
  if (transform.autoRotate && groupRef.current) {
    groupRef.current.rotation.y += delta * 0.5;  // Xoay 0.5 radian/giây
  }
});

// Áp dụng ref vào group
<group ref={groupRef}>
  {/* ... */}
</group>
```

**Giải thích:**
- `useFrame`: Hook chạy mỗi frame (~60fps)
- `delta`: Thời gian giữa 2 frame (seconds)
- `rotation.y += delta * 0.5`: Xoay đều đặn

---

## 🔧 VII. INSTANCE RENDERING - TỐI ƯU HIỆU SUẤT

### 13. InstancedMesh - Render nhiều kim cương cùng lúc

**File:** `Ring3D.jsx:62-97`

```jsx
// Khi node.isInstancedMesh (nhiều viên kim cương giống nhau)
<instancedMesh
  key={key}
  castShadow
  receiveShadow
  args={[
    node.geometry,        // Geometry dùng chung
    undefined,            // Material (sẽ define bên dưới)
    node.count            // Số lượng instances
  ]}
  instanceMatrix={node.instanceMatrix}  // Matrix transform của từng instance
  position={node.position}
  rotation={node.rotation}
  scale={finalScale}
>
  <MeshRefractionMaterial {...} />
</instancedMesh>
```

**Tại sao dùng InstancedMesh?**
- Render 100 viên kim cương = 1 draw call duy nhất
- Tiết kiệm GPU memory
- **Quan trọng cho VR** (cần 90fps+)

---

## 🎯 VIII. DIAMOND SCALE - THAY ĐỔI KÍCH THƯỚC KIM CƯƠNG

### 14. Diamond Scale Logic

**File:** `Ring3D.jsx:51-59, 108-119`

```jsx
// Convert size (1ct, 1.5ct, 2ct) → scale multiplier
const diamondScale = (() => {
  const sizeMap = {
    '1 ct': 1.0,
    '1.5 ct': 1.15,
    '2 ct': 1.3,
    '2.5 ct': 1.45
  };
  return sizeMap[selectedSize] || 1.0;
})();

// Áp dụng vào scale
const originalScale = node.scale;
const finalScale = isGem
  ? originalScale.clone().multiplyScalar(diamondScale)  // Nhân scale cho gem
  : originalScale;                                      // Giữ nguyên cho band

<mesh scale={finalScale}>
  {/* ... */}
</mesh>
```

**Luồng:**
1. User chọn "2 ct" → `diamondScale = 1.3`
2. Tìm mesh có tên chứa "diamond/gem/stone"
3. Scale mesh đó lên 1.3x (lớn hơn 30%)

---

## 🚀 IX. CANVAS CONFIGURATION - TỐI ƯU VR

### 15. Canvas Setup cho 3D Viewer

**File:** `SimpleMeshInspector.jsx:270-279`

```jsx
<Canvas
  shadows                           // Bật shadow rendering
  dpr={[1, 2]}                      // Device pixel ratio: min=1, max=2
  gl={{
    antialias: true,
    preserveDrawingBuffer: true,   // Cho phép screenshot
    powerPreference: 'high-performance',  // Ưu tiên GPU mạnh
    stencil: false                 // Tắt stencil buffer (tối ưu)
  }}
  camera={{ position: [0, 0, 10], fov: 50 }}
>
```

---

### 16. Canvas Setup cho VR/AR (Overlay)

**File:** `QuocTiar.jsx:779-790`

```jsx
<Canvas
  gl={{
    alpha: true,                    // Trong suốt (overlay lên video)
    preserveDrawingBuffer: true,
    antialias: false,               // TẮT antialias để tăng FPS
    powerPreference: 'high-performance'
  }}
  camera={{ fov: 50, position: [0, 0, 5] }}
  frameloop="always"                // Render liên tục (cần cho AR)
  dpr={[1, 1.5]}                   // Giới hạn pixel ratio (tối ưu)
  performance={{ min: 0.5 }}        // Tự động giảm chất lượng nếu FPS < 0.5
>
```

**Khác biệt cho VR:**
- `alpha={true}`: Canvas trong suốt
- `antialias={false}`: Tắt AA (FXAA thay thế)
- `dpr={[1, 1.5]}`: Giới hạn resolution
- `performance={{ min: 0.5 }}`: Adaptive quality

---

## 📦 X. PRELOAD MODEL - GIẢM LAG

### 17. useGLTF.preload() - Preload model trước khi render

**File:** `QuocTiar.jsx:542`

```jsx
import { useGLTF } from '@react-three/drei';

// Preload model khi app khởi động
useGLTF.preload('/myfav.glb');

// Hoặc trong component:
useEffect(() => {
  useGLTF.preload('/models/ring1.glb');
  useGLTF.preload('/models/ring2.glb');
}, []);
```

**Tác dụng:**
- Load model vào cache trước
- Không bị lag khi user chọn model

---

## 🎨 XI. COLOR SYSTEM - CUSTOM MÀU

### 18. Mesh Color Management

**File:** `SimpleMeshInspector.jsx:79-116`

```jsx
const [meshColors, setMeshColors] = useState({});

// Khởi tạo màu mặc định khi load model
useEffect(() => {
  if (meshList.length === 0) return;

  setMeshColors(prev => {
    const colors = { ...prev };

    meshList.forEach(mesh => {
      if (!colors[mesh.name]) {
        const name = mesh.name.toLowerCase();

        if (name.includes('ring')) {
          colors[mesh.name] = '#ffaf83';  // Rose Gold 2
        } else if (name.includes('diamond') || name.includes('gem')) {
          colors[mesh.name] = '#b5cbdd';  // Blue diamond
        } else {
          colors[mesh.name] = '#ffffff';
        }
      }
    });

    return colors;
  });
}, [meshList]);

// Sử dụng trong material:
<meshStandardMaterial
  color={meshColors[meshName] || '#ffffff'}
/>
```

---

### 19. Color Picker UI (MeshList.jsx)

**File:** `MeshList.jsx:75-112`

```jsx
{/* Visual Color Picker */}
<input
  type="color"
  value={meshColors[mesh.name] || '#ffffff'}
  onChange={(e) => setMeshColors(prev => ({
    ...prev,
    [mesh.name]: e.target.value
  }))}
  style={{
    width: '40px',
    height: '25px',
    cursor: 'pointer'
  }}
/>

{/* HEX Input */}
<input
  type="text"
  value={meshColors[mesh.name] || '#ffffff'}
  onChange={(e) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setMeshColors(prev => ({ ...prev, [mesh.name]: value }));
    }
  }}
  placeholder="#ffffff"
/>
```

---

## 🎭 XII. VISIBILITY TOGGLE - ẨN/HIỆN MESH

### 20. Mesh Visibility System

**File:** `Ring3D.jsx:42-44`

```jsx
const [meshVisibility, setMeshVisibility] = useState({});

// Check visibility trước khi render
const isVisible = meshVisibility?.[key] !== false;  // Mặc định true
if (!isVisible) return null;  // Không render mesh này

// Toggle visibility (UI)
<button
  onClick={() => setMeshVisibility(prev => ({
    ...prev,
    [mesh.name]: !isVisible
  }))}
>
  {isVisible ? '👁️' : '👁️‍🗨️'}
</button>
```

---

## 🏆 XIII. BEST PRACTICES - TỐI ƯU CHO VR

### 21. Checklist tối ưu VR

```jsx
// ✅ 1. Canvas settings
<Canvas
  dpr={[1, 1.5]}              // Giới hạn resolution
  gl={{
    antialias: false,         // Dùng FXAA thay thế
    powerPreference: 'high-performance'
  }}
  performance={{ min: 0.5 }}  // Adaptive quality
>

// ✅ 2. Post-processing
<EffectComposer
  multisampling={2}           // Giảm từ 4 → 2
>
  <FXAA />                    // Nhẹ hơn SMAA/MSAA
  <N8AO halfRes={true} />     // Render ở 50% resolution
  <Bloom
    intensity={0.8}           // Giảm intensity
    levels={7}                // Giảm levels từ 9 → 7
  />
</EffectComposer>

// ✅ 3. Lighting
<directionalLight
  castShadow={false}          // Tắt shadows
/>

// ✅ 4. Materials
<meshStandardMaterial />      // Dùng Standard thay Physical
```

---

## 📊 XIV. PERFORMANCE COMPARISON

| Feature | Desktop (FullTopping) | VR (Smooth) |
|---------|----------------------|-------------|
| Multisampling | 4 | 2 |
| AO Resolution | Full (1x) | Half (0.5x) |
| AO Intensity | 4 | 2 |
| Bloom Intensity | 1.2 | 0.8 |
| Bloom Levels | 9 | 7 |
| Canvas DPR | [1, 2] | [1, 1.5] |
| Antialias | true | false (FXAA) |
| Shadows | true | false |

---

## 🎯 XV. COMPLETE EXAMPLE - TẤT CẢ KẾT HỢP

### 22. Full Scene với tất cả techniques

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  useEnvironment,
  Environment,
  Center,
  MeshRefractionMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, FXAA, ToneMapping } from '@react-three/postprocessing';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Preload
useGLTF.preload('/ring.glb');

function Ring({ modelPath, meshColors, renderMode }) {
  const { nodes } = useGLTF(modelPath);
  const env = useEnvironment({ files: '/studio.exr' });
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center top>
      <group ref={groupRef}>
        {Object.keys(nodes).map(key => {
          const node = nodes[key];
          if (!node.geometry) return null;

          const isGem = key.toLowerCase().includes('diamond');

          return (
            <mesh
              key={key}
              geometry={node.geometry}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            >
              {isGem ? (
                <MeshRefractionMaterial
                  color={meshColors[key] || '#b5cbdd'}
                  envMap={env}
                  aberrationStrength={0.02}
                  toneMapped={false}
                />
              ) : (
                <meshStandardMaterial
                  color={meshColors[key] || '#ffaf83'}
                  roughness={0.15}
                  metalness={1}
                  envMap={env}
                  envMapIntensity={1.5}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </Center>
  );
}

function Scene({ modelPath, meshColors, renderMode }) {
  const env = useEnvironment({ files: '/studio.exr' });

  return (
    <>
      <color attach="background" args={['#ffffff']} />

      <spotLight position={[10, 10, 10]} angle={0.15} intensity={Math.PI} />

      <Ring modelPath={modelPath} meshColors={meshColors} renderMode={renderMode} />

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.25} />

      <EffectComposer multisampling={renderMode === 'smooth' ? 2 : 4}>
        <FXAA />
        <N8AO
          aoRadius={renderMode === 'smooth' ? 0.1 : 0.15}
          intensity={renderMode === 'smooth' ? 2 : 4}
          halfRes={renderMode === 'smooth'}
        />
        <Bloom
          intensity={renderMode === 'smooth' ? 0.8 : 1.2}
          levels={renderMode === 'smooth' ? 7 : 9}
          luminanceThreshold={renderMode === 'smooth' ? 2.0 : 1.5}
          mipmapBlur
        />
        <ToneMapping />
      </EffectComposer>

      <Environment map={env} background={false} />
    </>
  );
}

export default function App() {
  const [renderMode, setRenderMode] = useState('smooth');
  const [meshColors, setMeshColors] = useState({});

  return (
    <Canvas
      dpr={[1, renderMode === 'smooth' ? 1.5 : 2]}
      gl={{
        antialias: renderMode !== 'smooth',
        powerPreference: 'high-performance',
        stencil: false
      }}
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <Scene modelPath="/ring.glb" meshColors={meshColors} renderMode={renderMode} />
    </Canvas>
  );
}
```

---

## 🎓 XVI. TÓM TẮT CÔNG THỨC LÀM ĐẸP

### Công thức hoàn chỉnh:

```
NHẪN ĐẸP =
  Environment Map (HDR)
  + MeshRefractionMaterial (Gems)
  + meshStandardMaterial (Band)
  + SpotLight + AmbientLight
  + Post-processing (Bloom + N8AO + FXAA)
  + OrbitControls
  + Auto-rotate (useFrame)
  + Center (căn giữa)
  + Color customization
```

### Độ ưu tiên tối ưu VR:

1. **Cao nhất:** Tắt shadows, dùng FXAA, halfRes N8AO
2. **Cao:** Giảm multisampling, bloom levels, dpr
3. **Trung bình:** Giảm light intensity, AO radius
4. **Thấp:** Đơn giản hóa geometry (nếu cần)

---

✅ **HOÀN TẤT!** Tất cả code làm đẹp nhẫn bằng R3F đã được trích xuất!
