import { useState, useMemo } from 'react';
import './RingColorPicker.css';

// Màu cho band/ring
const BAND_COLORS = [
  { name: 'Rose Gold 1', color: '#f2af83' },
  { name: 'Rose Gold 2', color: '#ffaf83' },
  { name: 'Platinum', color: '#b9bbbc' },
  { name: 'Silver', color: '#dedede' },
  // { name: 'Silver 2', color: '#d5d5d5' }
];

// Màu cho diamond/stone/gem
const DIAMOND_COLORS = [
  // { name: 'White', color: '#ffffff' },
  { name: 'Red', color: '#9b111e' },
  { name: 'Pink', color: '#CA1F3D' },
  { name: 'Blue 1', color: '#b5cbdd' },
  { name: 'Blue 2', color: '#bce6fe' }
];

export default function RingColorPicker({ meshList = [], onColorChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tách meshes thành 2 nhóm: band và diamond
  const { bandMeshes, diamondMeshes } = useMemo(() => {
    const bands = [];
    const diamonds = [];

    meshList.forEach(mesh => {
      const name = mesh.name.toLowerCase();
      if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
        diamonds.push(mesh.name);
      } else if (name.includes('ring') || mesh.type === 'Mesh') {
        bands.push(mesh.name);
      }
    });

    return { bandMeshes: bands, diamondMeshes: diamonds };
  }, [meshList]);

  const [selectedBandColor, setSelectedBandColor] = useState(BAND_COLORS[1].color);
  const [selectedDiamondColor, setSelectedDiamondColor] = useState(DIAMOND_COLORS[0].color);

  const handleBandColorClick = (color) => {
    setSelectedBandColor(color);
    // Apply color to all band meshes
    bandMeshes.forEach(meshName => {
      onColorChange?.(meshName, color);
    });
  };

  const handleDiamondColorClick = (color) => {
    setSelectedDiamondColor(color);
    // Apply color to all diamond meshes
    diamondMeshes.forEach(meshName => {
      onColorChange?.(meshName, color);
    });
  };

  if (meshList.length === 0) return null;

  return (
    <div className={`ring-color-picker ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Collapsed State - mũi tên trên, text dưới */}
      {!isExpanded && (
        <>
          <button
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Mở rộng"
          >
            <span className="toggle-icon">▲</span>
          </button>
          <div className="collapsed-content">
            <span className="collapsed-text">Band • Diamond</span>
          </div>
        </>
      )}

      {/* Expanded State - color picker trên, mũi tên dưới */}
      {isExpanded && (
        <>
          <div className="expanded-content">
            {/* Band Section */}
            <div className="color-section">
              <div className="section-title">Band</div>
              <div className="color-swatches">
                {BAND_COLORS.map(({ name, color }) => (
                  <button
                    key={color}
                    className={`color-swatch ${selectedBandColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleBandColorClick(color)}
                    title={name}
                  />
                ))}
              </div>
            </div>

            {/* Diamond Section */}
            <div className="color-section">
              <div className="section-title">Diamond</div>
              <div className="color-swatches">
                {DIAMOND_COLORS.map(({ name, color }) => (
                  <button
                    key={color}
                    className={`color-swatch ${selectedDiamondColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleDiamondColorClick(color)}
                    title={name}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Thu gọn"
          >
            <span className="toggle-icon">▼</span>
          </button>
        </>
      )}
    </div>
  );
}
