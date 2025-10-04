import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { DynamicSceneSmooth, DynamicSceneFull } from '@scenes/DynamicScene'
import './DynamicMeshInspector.css'

export function DynamicMeshInspector() {
  // State lưu mesh nào đang được chọn để highlight màu đỏ
  const [selectedMesh, setSelectedMesh] = useState(null)

  // State chọn chế độ hiển thị: 'smooth' (mượt) hoặc 'full' (đồ họa cao)
  const [sceneMode, setSceneMode] = useState('smooth')

  // State lưu danh sách meshes từ GLTF (đọc dynamic)
  const [meshList, setMeshList] = useState([])

  // State lưu materials data từ Ring component
  const [meshMaterials, setMeshMaterials] = useState(null)

  // State lưu đường dẫn file model (default hoặc uploaded)
  const [modelPath, setModelPath] = useState('/myfav.glb')

  // Xử lý upload file GLB/GLTF
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        // Tạo URL từ file
        const url = URL.createObjectURL(file)
        setModelPath(url)
        // Reset selections
        setSelectedMesh(null)
        setMeshList([])
        setMeshMaterials(null)
      } else {
        alert('Vui lòng chọn file .glb hoặc .gltf')
      }
    }
  }

  return (
    <div className="container">
      {/* Sidebar bên trái chứa controls */}
      <div className="sidebar">
        <h3 className="sidebarTitle">Upload Model</h3>
        {/* Input upload file GLB/GLTF */}
        <input
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileUpload}
          className="fileUpload"
        />
        <p className="nodeInfo">File: {modelPath.split('/').pop()}</p>

        <h3 className="sidebarTitle">Scene Mode</h3>

        {/* 2 nút toggle giữa chế độ Smooth và Full Topping */}
        <div className="sceneModeButtons">
          <button
            onClick={() => setSceneMode('smooth')}
            className={`modeButton ${sceneMode === 'smooth' ? 'active' : ''}`}
          >
            Smooth
          </button>
          <button
            onClick={() => setSceneMode('full')}
            className={`modeButton ${sceneMode === 'full' ? 'active' : ''}`}
          >
            Full Topping
          </button>
        </div>

        <h3 className="nodeTitle">Meshes (Dynamic)</h3>
        <p className="nodeInfo">
          {meshList.length > 0 ? `${meshList.length} meshes` : 'Loading...'}
        </p>

        {/* Render danh sách meshes được đọc từ GLTF */}
        {meshList.map(mesh => (
          <div
            key={mesh.name}
            onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
            className={`nodeItem ${selectedMesh === mesh.name ? 'selected' : ''}`}
          >
            <div className="nodeName">{mesh.name}</div>
            <div className="nodeType">{mesh.type}</div>
          </div>
        ))}

        {/* Hiển thị materials của mesh được chọn */}
        {selectedMesh && meshMaterials && meshMaterials[selectedMesh] && (
          <div className="materialsPanel">
            <h3 className="materialsTitle">Materials: {selectedMesh}</h3>
            <div className="materialsContent">
              <pre>{JSON.stringify(meshMaterials[selectedMesh], null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Container chứa Canvas 3D */}
      <div className="canvasContainer">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
          camera={{ position: [-5, 5, 14], fov: 20 }}
        >
          {sceneMode === 'smooth' ? (
            <DynamicSceneSmooth
              selectedMesh={selectedMesh}
              onMaterialsLoad={setMeshMaterials}
              onMeshListLoad={setMeshList}
              modelPath={modelPath}
            />
          ) : (
            <DynamicSceneFull
              selectedMesh={selectedMesh}
              onMaterialsLoad={setMeshMaterials}
              onMeshListLoad={setMeshList}
              modelPath={modelPath}
            />
          )}
        </Canvas>
      </div>
    </div>
  )
}
