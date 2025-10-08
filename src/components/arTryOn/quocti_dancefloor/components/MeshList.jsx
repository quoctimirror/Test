/**
 * MeshList.jsx
 *
 * NHIỆM VỤ: Hiển thị danh sách mesh và color picker
 * - Hiển thị từng mesh với tên và type
 * - Click vào mesh để select/deselect (highlight)
 * - Color picker (visual) để chọn màu
 * - Text input để nhập mã HEX trực tiếp
 */

export function MeshList({ meshList, selectedMesh, setSelectedMesh, meshColors, setMeshColors }) {
  return (
    <div>
      <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px', marginTop: '25px' }}>
        Meshes ({meshList.length})
      </h3>

      {meshList.map(mesh => (
        <div
          key={mesh.name}
          style={{
            padding: '10px',
            margin: '5px 0',
            background: selectedMesh === mesh.name ? '#ff0000' : '#2a2a2a',
            borderRadius: '5px',
            transition: 'all 0.2s'
          }}
        >
          {/* === MESH INFO (Click để select) === */}
          <div
            onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ fontWeight: 'bold' }}>{mesh.name}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {mesh.type}
            </div>
          </div>

          {/* === COLOR PICKER === */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Color:</label>

            {/* Color Picker (visual) */}
            <input
              type="color"
              value={meshColors[mesh.name] || '#ffffff'}
              onChange={(e) => setMeshColors(prev => ({ ...prev, [mesh.name]: e.target.value }))}
              style={{
                width: '40px',
                height: '25px',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Text Input (HEX code) */}
            <input
              type="text"
              value={meshColors[mesh.name] || '#ffffff'}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ chấp nhận HEX hợp lệ: #RRGGBB
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setMeshColors(prev => ({ ...prev, [mesh.name]: value }));
                }
              }}
              placeholder="#ffffff"
              style={{
                width: '80px',
                padding: '4px 8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
