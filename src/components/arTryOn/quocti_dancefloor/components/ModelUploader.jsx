/**
 * ModelUploader.jsx
 *
 * NHIỆM VỤ: Upload file GLB/GLTF model
 * - Input file để chọn model từ máy
 * - Validate chỉ chấp nhận .glb và .gltf
 * - Tạo URL object từ file và update modelPath
 */

export function ModelUploader({ modelPath, onFileUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Kiểm tra extension
    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      // Tạo URL từ file để load model
      const url = URL.createObjectURL(file);
      onFileUpload(url);
    } else {
      alert('Chỉ chấp nhận file .glb hoặc .gltf');
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        Upload Model
      </h3>

      {/* Input file */}
      <input
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px',
          background: '#2a2a2a',
          color: 'white',
          border: '1px solid #444',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      />

      {/* Hiển thị tên file hiện tại */}
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
        📁 {modelPath.split('/').pop()}
      </p>
    </div>
  );
}
