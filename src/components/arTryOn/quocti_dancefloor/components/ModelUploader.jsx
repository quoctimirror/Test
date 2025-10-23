/**
 * ModelUploader.jsx
 *
 * NHIỆM VỤ: Chọn model từ danh sách hoặc upload file
 * - Dropdown để chọn model có sẵn trong public/models/rings
 * - Input file để upload model từ máy
 * - Validate chỉ chấp nhận .glb và .gltf
 */

// Danh sách models có sẵn trong public/models/rings
const AVAILABLE_MODELS = [
  { name: 'Mirror Default', path: '/models/rings/mirror-default.glb' },
  { name: 'My Favorite', path: '/models/rings/myfav.glb' },
  { name: 'Heart Ring', path: '/models/rings/heart_ring.glb' },
  { name: 'Oval Ring', path: '/models/rings/oval_ring.glb' },
  // { name: 'Pear Ring', path: '/models/rings/pear_ring.glb' },
  { name: 'Emerald Ring', path: '/models/rings/refine-mirror-fiston.glb' },
  { name: 'Pear Ring', path: '/models/rings/refine-mirror-pear.glb' },
  { name: 'Refine Mirror Ring 1', path: '/models/rings/refine-mirror-ring-1.glb' },
  { name: 'Refine Mirror Ring 2', path: '/models/rings/refine-mirror-ring-2.glb' },
  { name: 'Ring WebGI', path: '/models/rings/ring_webgi.glb' },
  { name: 'Ring 2 WebGI', path: '/models/rings/ring2_webgi.glb' },
  { name: 'Oval', path: '/models/rings/oval.glb' },
  { name: 'Lumex91', path: '/models/rings/lumex91.glb' },


];

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

  const handleModelSelect = (e) => {
    const selectedPath = e.target.value;
    if (selectedPath) {
      onFileUpload(selectedPath);
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        Choose Model
      </h3>

      {/* Dropdown chọn model có sẵn */}
      <select
        value={modelPath}
        onChange={handleModelSelect}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px',
          background: '#2a2a2a',
          color: 'white',
          border: '1px solid #444',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.path} value={model.path}>
            {model.name}
          </option>
        ))}
      </select>

      {/* Hoặc upload file từ máy */}
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
        Or upload your own:
      </p>
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
