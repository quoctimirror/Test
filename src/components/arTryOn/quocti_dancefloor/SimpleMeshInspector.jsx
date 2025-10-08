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

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Import các component con
import { Scene3D } from './components/Scene3D';
import { ModelUploader } from './components/ModelUploader';
import { TransformControls } from './components/TransformControls';
import { MeshList } from './components/MeshList';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function SimpleMeshInspector() {
  // ===== STATE MANAGEMENT =====

  // Mesh đang được chọn (highlight màu đỏ)
  const [selectedMesh, setSelectedMesh] = useState(null);

  // Danh sách tất cả mesh trong model
  const [meshList, setMeshList] = useState([]);

  // Đường dẫn file model hiện tại
  const [modelPath, setModelPath] = useState('/models/myfav.glb');

  // Màu của từng mesh (key: tên mesh, value: HEX color)
  const [meshColors, setMeshColors] = useState({});

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

  // ===== KHỞI TẠO MÀU MẶC ĐỊNH CHO MESH =====
  // Khi danh sách mesh thay đổi, tự động set màu mặc định
  useEffect(() => {
    if (meshList.length === 0) return;

    setMeshColors(prev => {
      const colors = { ...prev };

      meshList.forEach(mesh => {
        // Nếu mesh chưa có màu, set màu mặc định theo tên
        if (!colors[mesh.name]) {
          const name = mesh.name.toLowerCase();

          if (name.includes('ring')) {
            // Ring → Vàng hồng
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
  }, [meshList]);

  // ===== XỬ LÝ UPLOAD FILE =====
  const handleFileUpload = async (url) => {
    try {
      // Clear GLTF cache để tránh conflict
      useGLTF.clear();

      // Preload model để kiểm tra lỗi trước khi render
      await useGLTF.preload(url);

      setModelPath(url);
      setSelectedMesh(null);
      setMeshList([]);
      setMeshColors({});

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
  };

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

        {/* Danh sách Mesh + Color Picker */}
        <MeshList
          meshList={meshList}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          meshColors={meshColors}
          setMeshColors={setMeshColors}
        />
      </div>

      {/* ===== 3D CANVAS (BÊN PHẢI) ===== */}
      <div style={{ flex: 1, background: '#333' }}>
        {/* ErrorBoundary: Bắt lỗi khi load model */}
        <ErrorBoundary key={modelPath}>
          {/* Suspense: Hiển thị "Loading..." khi đang load model */}
          <Suspense
            fallback={
              <div style={{
                color: 'white',
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
              dpr={[1, 1.5]}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
              camera={{ position: [0, 0, 3], fov: 25 }}
            >
              <Scene3D
                modelPath={modelPath}
                selectedMesh={selectedMesh}
                onMeshListLoad={setMeshList}
                transform={transform}
                meshColors={meshColors}
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
