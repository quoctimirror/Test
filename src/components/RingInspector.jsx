import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { SmoothPerformance } from '@scenes/SmoothPerformance'
import { FullTopping } from '@scenes/FullTopping'
import './RingInspector.css'

export function RingInspector() {
  // State lưu mesh nào đang được chọn để highlight màu đỏ
  const [selectedMesh, setSelectedMesh] = useState(null)

  // State chọn chế độ hiển thị: 'smooth' (mượt) hoặc 'full' (đồ họa cao)
  const [sceneMode, setSceneMode] = useState('smooth')

  // State lưu materials data từ Ring component
  const [meshMaterials, setMeshMaterials] = useState(null)

  // Chỉ giữ lại 3 mesh chính
  const meshes = [
    { name: 'mesh_0', type: 'Mesh' },
    { name: 'mesh_9', type: 'Mesh' },
    { name: 'mesh_4', type: 'InstancedMesh' }
  ]

  return (
    <div className="container">
      {/* Sidebar bên trái chứa controls */}
      <div className="sidebar">
        <h3 className="sidebarTitle">Scene Mode</h3>

        {/* 2 nút toggle giữa chế độ Smooth và Full Topping */}
        <div className="sceneModeButtons">
          <button
            onClick={() => setSceneMode('smooth')} // Chuyển sang chế độ mượt
            className={`modeButton ${sceneMode === 'smooth' ? 'active' : ''}`}
          >
            Smooth
          </button>
          <button
            onClick={() => setSceneMode('full')} // Chuyển sang chế độ đồ họa cao
            className={`modeButton ${sceneMode === 'full' ? 'active' : ''}`}
          >
            Full Topping
          </button>
        </div>

        <h3 className="nodeTitle">Meshes</h3>
        <p className="nodeInfo">
          {meshes.length} mesh chính
        </p>

        {/* Render danh sách 3 mesh chính */}
        {meshes.map(mesh => (
          <div
            key={mesh.name}
            // Click để toggle selected: nếu đang chọn thì bỏ chọn, chưa chọn thì chọn
            onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
            className={`nodeItem ${selectedMesh === mesh.name ? 'selected' : ''}`}
          >
            <div className="nodeName">{mesh.name}</div>
            <div className="nodeType">{mesh.type}</div>
          </div>
        ))}

        {/* Hiển thị materials của mesh được chọn */}
        {selectedMesh && meshMaterials && (
          <div className="materialsPanel">
            <h3 className="materialsTitle">Materials</h3>
            <div className="materialsContent">
              <pre>{JSON.stringify(meshMaterials[selectedMesh], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Container chứa Canvas 3D */}
      <div className="canvasContainer">
        <Canvas
          shadows // Bật shadows
          dpr={[1, 1.5]} // Device pixel ratio: min 1, max 1.5
          gl={{ antialias: false }} // Tắt antialias để tăng performance
          camera={{ position: [-5, 5, 14], fov: 20 }} // Vị trí camera và field of view
        >
          {/* Render scene tùy theo mode đang chọn */}
          {sceneMode === 'smooth' ? (
            <SmoothPerformance
              selectedMesh={selectedMesh}
              onMaterialsLoad={setMeshMaterials}
            />
          ) : (
            <FullTopping
              selectedMesh={selectedMesh}
              onMaterialsLoad={setMeshMaterials}
            />
          )}
        </Canvas>
      </div>
    </div>
  )
}
