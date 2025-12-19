/**
 * DiamondCustomizer.jsx
 *
 * NHIỆM VỤ: UI để tuỳ chỉnh kim cương và nhẫn với grid layout
 * - Chọn Diamond Shape (với placeholder images)
 * - Chọn Size (button style)
 * - Chọn Head Style (với placeholder images)
 * - Chọn Metal type (với icon circles)
 * - Chọn Band Style (với placeholder images)
 */

export function DiamondCustomizer({
  selectedShape,
  selectedSize,
  selectedHead,
  selectedMetal,
  selectedBand,
  selectedBandMetal,
  onShapeChange,
  onSizeChange,
  onHeadChange,
  onMetalChange,
  onBandChange,
  onBandMetalChange
}) {
  const SHAPES = [
    'Round',
    'Princess',
    'Radiant',
    'Emerald',
    'Marquise',
    'Oval',
    'Pear',
    'Heart',
    'Asscher',
    'Cushion'
  ];

  const SIZES = ['1 ct', '1.5 ct', '2 ct', '2.5 ct'];

  const HEAD_STYLES = [
    '4-Prong Nouveau',
    '6-Prong Nouveau',
    'Classic Basket',
    'Diamond Basket',
    'Surprise Diamond',
    '6-Prong Diamond',
    'Diamond Tulip',
    'Classic Halo',
    'Floral Halo',
    'Hidden Halo',
    'Dual Halo',
    'Fancy Halo',
    'Clustered Diamond',
    'Vintage Trefoil',
    'Classic Bezel'
  ];

  const METALS = [
    { name: 'Rose Gold 1', label: 'RG1', color: '#f2af83', hex: '#f2af83' },
    { name: 'Rose Gold 2', label: 'RG2', color: '#ffaf83', hex: '#ffaf83' },
    { name: 'Platinum', label: 'PT', color: '#b9bbbc', hex: '#b9bbbc' },
    { name: 'Silver', label: 'SV', color: '#dedede', hex: '#dedede' }
  ];

  const BAND_STYLES = [
    'Solitaire',
    'Knife Edge Solitaire',
    'Split Ring Solitaire',
    'French Pavé',
    'Cathedral Pavé',
    'Triple Row Pavé',
    'Round Channel',
    'Baguette Channel',
    'Floating Station',
    'Alternating Marquise',
    'Three Stone',
    'Knife Edge Pavé',
    'Floral Bypass',
    'Twist Pavé',
    'Alternating Baguette'
  ];

  // Style cho grid item
  const gridItemStyle = (isSelected) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: isSelected ? '#3a3a3a' : '#2a2a2a',
    border: isSelected ? '2px solid #4CAF50' : '2px solid #444',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '80px'
  });

  const placeholderImageStyle = {
    width: '50px',
    height: '50px',
    background: '#444',
    borderRadius: '4px',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: '10px'
  };

  return (
    <div>
      <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px', marginTop: '25px' }}>
        Diamond Customizer
      </h3>

      {/* === DIAMOND SHAPE === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Preview Shape:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {SHAPES.map(shape => (
            <div
              key={shape}
              style={gridItemStyle(selectedShape === shape)}
              onClick={() => onShapeChange(shape)}
            >
              <div style={placeholderImageStyle}>
                {shape.slice(0, 1)}
              </div>
              <span style={{ fontSize: '10px', color: '#ccc', textAlign: 'center' }}>{shape}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === SIZE === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Preview Size:
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedSize === size ? '#3a3a3a' : '#2a2a2a',
                color: 'white',
                border: selectedSize === size ? '2px solid #4CAF50' : '2px solid #444',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* === HEAD STYLE === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Head - Select Style:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {HEAD_STYLES.map(head => (
            <div
              key={head}
              style={gridItemStyle(selectedHead === head)}
              onClick={() => onHeadChange(head)}
            >
              <div style={placeholderImageStyle}>
                {head.slice(0, 2)}
              </div>
              <span style={{ fontSize: '9px', color: '#ccc', textAlign: 'center', lineHeight: '1.2' }}>{head}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === HEAD METAL === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Head - Select Metal:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {METALS.map(metal => (
            <div
              key={metal.name}
              onClick={() => onMetalChange(metal.name)}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: metal.color,
                border: selectedMetal === metal.name ? '3px solid #4CAF50' : '2px solid #666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#333',
                transition: 'all 0.2s'
              }}
            >
              {metal.label}
            </div>
          ))}
        </div>
      </div>

      {/* === BAND STYLE === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Band - Select Style:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {BAND_STYLES.map(band => (
            <div
              key={band}
              style={gridItemStyle(selectedBand === band)}
              onClick={() => onBandChange(band)}
            >
              <div style={placeholderImageStyle}>
                {band.slice(0, 2)}
              </div>
              <span style={{ fontSize: '9px', color: '#ccc', textAlign: 'center', lineHeight: '1.2' }}>{band}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === BAND METAL === */}
      <div style={{ marginTop: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
          Band - Select Metal:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {METALS.map(metal => (
            <div
              key={metal.name}
              onClick={() => onBandMetalChange(metal.name)}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: metal.color,
                border: selectedBandMetal === metal.name ? '3px solid #4CAF50' : '2px solid #666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#333',
                transition: 'all 0.2s'
              }}
            >
              {metal.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
