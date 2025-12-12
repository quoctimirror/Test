/**
 * SimpleMeshInspector.jsx - COMPONENT CHÍNH
 *
 * NHIỆM VỤ TỔNG QUAN:
 * Công cụ để inspect và customize 3D model (nhẫn, trang sức)
 * - Upload model GLB/GLTF
 * - Xem danh sách mesh trong model
 * - Đổi màu từng mesh (color picker + HEX input)
 * - Điều chỉnh transform (rotation, position, scale)
 * - Auto-rotate model
 * - Highlight mesh khi click
 *
 * CÁCH DÙNG:
 * 1. Upload file GLB/GLTF hoặc dùng model mặc định
 * 2. Điều chỉnh transform (rotation, scale, v.v.)
 * 3. Click vào mesh trong danh sách để highlight
 * 4. Đổi màu mesh bằng color picker hoặc nhập HEX
 *
 * TƯƠNG THÍCH: React 19 (không dùng Leva)
 */

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Import các component con
import { Scene3D } from './components/Scene3D';
import { ModelUploader } from './components/ModelUploader';
import { TransformControls } from './components/TransformControls';
import { MeshList } from './components/MeshList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiamondCustomizer } from './components/DiamondCustomizer';

export default function SimpleMeshInspector() {
  // ===== STATE MANAGEMENT =====

  // Mesh đang được chọn (highlight màu đỏ)
  const [selectedMesh, setSelectedMesh] = useState(null);

  // Danh sách tất cả mesh trong model
  const [meshList, setMeshList] = useState([]);

  // Đường dẫn file model hiện tại
  const [modelPath, setModelPath] = useState('/models/rings/myfav.glb');

  // Màu của từng mesh (key: tên mesh, value: HEX color)
  const [meshColors, setMeshColors] = useState({});

  // Trạng thái hiển thị của từng mesh (key: tên mesh, value: boolean)
  const [meshVisibility, setMeshVisibility] = useState({});

  // Render mode: 'smooth' (mượt, hiệu suất cao) hoặc 'fullTopping' (đẹp, lấp lánh)
  const [renderMode, setRenderMode] = useState('smooth');

  // Debug mode: Hiển thị/ẩn các helpers (tia sáng, quả cầu)
  const [showDebugHelpers, setShowDebugHelpers] = useState(false);

  // Bloom effect: Bật/tắt hiệu ứng lấp lánh (vùng sáng tỏa ra)
  const [enableBloom, setEnableBloom] = useState(true);

  // Diamond customization states
  const [selectedShape, setSelectedShape] = useState('Round');
  const [selectedSize, setSelectedSize] = useState('1 ct');
  const [selectedHead, setSelectedHead] = useState('4-Prong Nouveau');
  const [selectedMetal, setSelectedMetal] = useState('Rose Gold 2');
  const [selectedBand, setSelectedBand] = useState('Solitaire');
  const [selectedBandMetal, setSelectedBandMetal] = useState('Rose Gold 2');

  // Transform controls (rotation, position, scale, auto-rotate)
  // MẶC ĐỊNH: scale=0.1, posY=-0.12 để hiển thị đẹp
  // Nếu muốn xem ORIGINAL: scale=1, posY=0
  const [transform, setTransform] = useState({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: -0.12,    // Dịch xuống để center
    posZ: 0,
    scale: 0.1,     // Thu nhỏ 10 lần (model gốc quá to)
    autoRotate: false,
  });

  // ===== KHỞI TẠO MÀU VÀ VISIBILITY MẶC ĐỊNH CHO MESH =====
  // Khi danh sách mesh thay đổi, tự động set màu và visibility mặc định
  useEffect(() => {
    if (meshList.length === 0) return;

    setMeshColors(prev => {
      const colors = { ...prev };

      meshList.forEach(mesh => {
        // Nếu mesh chưa có màu, set màu mặc định theo tên
        if (!colors[mesh.name]) {
          const name = mesh.name.toLowerCase();

          if (name.includes('ring')) {
            // Ring → Rose Gold 2 (mặc định)
            colors[mesh.name] = '#ffaf83';
          } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
            // Đá quý → Xanh nhạt
            colors[mesh.name] = '#b5cbdd';
          } else {
            // Khác → Trắng
            colors[mesh.name] = '#ffffff';
          }
        }
      });

      return colors;
    });

    // Khởi tạo visibility cho mesh mới (mặc định là hiển thị)
    setMeshVisibility(prev => {
      const visibility = { ...prev };
      meshList.forEach(mesh => {
        if (visibility[mesh.name] === undefined) {
          visibility[mesh.name] = true; // Mặc định hiển thị
        }
      });
      return visibility;
    });
  }, [meshList]);

  // ===== KHI CHỌN BAND METAL → THAY ĐỔI MÀU BAND/RING =====
  useEffect(() => {
    if (meshList.length === 0) return;

    // Map metal name to hex color
    const metalColorMap = {
      'Rose Gold 1': '#f2af83',
      'Rose Gold 2': '#ffaf83',
      'Platinum': '#b9bbbc',
      'Silver': '#dedede'
    };

    const newColor = metalColorMap[selectedBandMetal];
    if (!newColor) return;

    // Tìm mesh có tên chứa "ring" hoặc "band" và update màu
    setMeshColors(prev => {
      const colors = { ...prev };
      meshList.forEach(mesh => {
        const name = mesh.name.toLowerCase();
        if (name.includes('ring') || name.includes('band')) {
          colors[mesh.name] = newColor;
        }
      });
      return colors;
    });
  }, [selectedBandMetal, meshList]);

  // ===== CONVERT SELECTED SIZE → DIAMOND SCALE =====
  const diamondScale = useMemo(() => {
    const sizeMap = {
      '1 ct': 1.0,    // Original size
      '1.5 ct': 1.15, // 15% lớn hơn
      '2 ct': 1.3,    // 30% lớn hơn
      '2.5 ct': 1.45  // 45% lớn hơn
    };
    const scale = sizeMap[selectedSize] || 1.0;
    console.log('🔍 Diamond Scale:', selectedSize, '→', scale);
    return scale;
  }, [selectedSize]);

  // ===== XỬ LÝ UPLOAD FILE =====
  const handleFileUpload = useCallback(async (url) => {
    try {
      // Clear GLTF cache để tránh conflict
      useGLTF.clear();

      // Preload model để kiểm tra lỗi trước khi render
      await useGLTF.preload(url);

      setModelPath(url);
      setSelectedMesh(null);
      setMeshList([]);
      setMeshColors({});
      setMeshVisibility({});

      // Reset transform về giá trị tốt cho model mới
      setTransform({
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        posX: 0,
        posY: -0.12,
        posZ: 0,
        scale: 0.1,
        autoRotate: false,
      });
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Không thể load model này. Vui lòng chọn file GLB/GLTF hợp lệ.');
    }
  }, []);

  // ===== RENDER UI =====
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#000' }}>
      {/* ===== SIDEBAR TRÁI ===== */}
      <div style={{
        width: '300px',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        fontSize: '14px'
      }}>
        {/* Upload Model */}
        <ModelUploader
          modelPath={modelPath}
          onFileUpload={handleFileUpload}
        />

        {/* Transform Controls */}
        <TransformControls
          transform={transform}
          setTransform={setTransform}
        />

        {/* Render Mode Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
            Render Mode
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={renderMode === 'fullTopping'}
                onChange={(e) => setRenderMode(e.target.checked ? 'fullTopping' : 'smooth')}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {renderMode === 'smooth' ? '⚡ Smooth Mode (Fast)' : '✨ FullTopping Mode (Beautiful)'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {renderMode === 'smooth'
                ? 'Hiệu suất cao, mượt mà'
                : 'Hiệu ứng đầy đủ, sáng lấp lánh'}
            </div>
          </div>
        </div>

        {/* Debug Helpers Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #FFA500', paddingBottom: '10px' }}>
            Debug Mode
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDebugHelpers}
                onChange={(e) => setShowDebugHelpers(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {showDebugHelpers ? '🔦 Debug Helpers ON' : '🔦 Debug Helpers OFF'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {showDebugHelpers
                ? 'Hiển thị tia sáng và vị trí nguồn sáng'
                : 'Ẩn các debug helpers'}
            </div>
          </div>
        </div>

        {/* Bloom Effect Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px' }}>
            Bloom Effect
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableBloom}
                onChange={(e) => setEnableBloom(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {enableBloom ? '✨ Bloom ON (Lấp lánh)' : '🚫 Bloom OFF (Không lấp lánh)'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {enableBloom
                ? 'Hiệu ứng vùng sáng tỏa ra (2 vùng sáng)'
                : 'Tắt bloom, không có vùng sáng'}
            </div>
          </div>
        </div>

        {/* Danh sách Mesh + Color Picker + Visibility Toggle */}
        <MeshList
          meshList={meshList}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          meshColors={meshColors}
          setMeshColors={setMeshColors}
          meshVisibility={meshVisibility}
          setMeshVisibility={setMeshVisibility}
        />
      </div>

      {/* ===== 3D CANVAS (GIỮA) ===== */}
      <div style={{ flex: 1, background: renderMode === 'smooth' ? '#000000' : '#ffffff' }}>
        {/* ErrorBoundary: Bắt lỗi khi load model */}
        <ErrorBoundary key={modelPath}>
          {/* Suspense: Hiển thị "Loading..." khi đang load model */}
          <Suspense
            fallback={
              <div style={{
                color: renderMode === 'smooth' ? '#fff' : '#333',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                Loading Model...
              </div>
            }
          >
            <Canvas
              shadows
              dpr={renderMode === 'fullTopping' ? [1.5, 2] : [1, 1.5]}
              gl={{
                antialias: renderMode === 'fullTopping',
                powerPreference: 'high-performance',
                stencil: false,
                alpha: false
              }}
              camera={{ position: [0, 0, 10], fov: 50 }}
            >
              <Scene3D
                modelPath={modelPath}
                selectedMesh={selectedMesh}
                onMeshListLoad={setMeshList}
                transform={transform}
                meshColors={meshColors}
                meshVisibility={meshVisibility}
                renderMode={renderMode}
                diamondScale={diamondScale}
                showDebugHelpers={showDebugHelpers}
                enableBloom={enableBloom}
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* ===== SIDEBAR PHẢI: DIAMOND CUSTOMIZER ===== */}
      <div style={{
        width: '350px',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        fontSize: '14px'
      }}>
        <DiamondCustomizer
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedHead={selectedHead}
          selectedMetal={selectedMetal}
          selectedBand={selectedBand}
          selectedBandMetal={selectedBandMetal}
          onShapeChange={setSelectedShape}
          onSizeChange={setSelectedSize}
          onHeadChange={setSelectedHead}
          onMetalChange={setSelectedMetal}
          onBandChange={setSelectedBand}
          onBandMetalChange={setSelectedBandMetal}
        />
      </div>
    </div>
  );
}
