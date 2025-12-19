/**
 * MeshList.jsx
 *
 * NHIỆM VỤ: Hiển thị danh sách mesh và color picker
 * - Hiển thị từng mesh với tên và type
 * - Click vào mesh để select/deselect (highlight)
 * - Color picker (visual) để chọn màu
 * - Text input để nhập mã HEX trực tiếp
 * - Toggle visibility (ẩn/hiện mesh) bằng icon con mắt
 */

export function MeshList({ meshList, selectedMesh, setSelectedMesh, meshColors, setMeshColors, meshVisibility, setMeshVisibility }) {
  return (
    <div>
      <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px', marginTop: '25px' }}>
        Meshes ({meshList.length})
      </h3>

      {meshList.map(mesh => {
        const isVisible = meshVisibility[mesh.name] !== false; // Mặc định true nếu undefined

        return (
          <div
            key={mesh.name}
            style={{
              padding: '10px',
              margin: '5px 0',
              background: selectedMesh === mesh.name ? '#ff0000' : '#2a2a2a',
              borderRadius: '5px',
              transition: 'all 0.2s',
              opacity: isVisible ? 1 : 0.5
            }}
          >
            {/* === MESH INFO (Click để select) === */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Visibility Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMeshVisibility(prev => ({ ...prev, [mesh.name]: !isVisible }));
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isVisible ? '#4CAF50' : '#666',
                  transition: 'color 0.2s'
                }}
                title={isVisible ? 'Ẩn mesh' : 'Hiện mesh'}
              >
                {isVisible ? '👁️' : '👁️‍🗨️'}
              </button>

              <div
                onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <div style={{ fontWeight: 'bold' }}>{mesh.name}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  {mesh.type}
                </div>
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
        );
      })}
    </div>
  );
}
