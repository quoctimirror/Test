/**
 * TransformControls.jsx
 *
 * NHIỆM VỤ: UI controls để điều chỉnh transform của model
 * - Rotation X, Y, Z (góc xoay)
 * - Position Y (vị trí theo trục Y)
 * - Scale (kích thước)
 * - Auto Rotate checkbox
 */

export function TransformControls({ transform, setTransform }) {
  return (
    <div>
      <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
        Transform Controls
      </h3>

      {/* === ROTATION X === */}
      <label style={{ display: 'block', marginTop: '10px', color: '#aaa' }}>
        Rotation X: {transform.rotX.toFixed(2)}
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={transform.rotX}
          onChange={(e) => setTransform(t => ({ ...t, rotX: parseFloat(e.target.value) }))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </label>

      {/* === ROTATION Y === */}
      <label style={{ display: 'block', marginTop: '10px', color: '#aaa' }}>
        Rotation Y: {transform.rotY.toFixed(2)}
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={transform.rotY}
          onChange={(e) => setTransform(t => ({ ...t, rotY: parseFloat(e.target.value) }))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </label>

      {/* === ROTATION Z === */}
      <label style={{ display: 'block', marginTop: '10px', color: '#aaa' }}>
        Rotation Z: {transform.rotZ.toFixed(2)}
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={0.01}
          value={transform.rotZ}
          onChange={(e) => setTransform(t => ({ ...t, rotZ: parseFloat(e.target.value) }))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </label>

      {/* === POSITION Y === */}
      <label style={{ display: 'block', marginTop: '10px', color: '#aaa' }}>
        Position Y: {transform.posY.toFixed(2)}
        <input
          type="range"
          min={-5}
          max={5}
          step={0.1}
          value={transform.posY}
          onChange={(e) => setTransform(t => ({ ...t, posY: parseFloat(e.target.value) }))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </label>

      {/* === SCALE === */}
      <label style={{ display: 'block', marginTop: '10px', color: '#aaa' }}>
        Scale: {transform.scale.toFixed(2)}
        <input
          type="range"
          min={0.01}
          max={1}
          step={0.01}
          value={transform.scale}
          onChange={(e) => setTransform(t => ({ ...t, scale: parseFloat(e.target.value) }))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </label>

      {/* === AUTO ROTATE === */}
      <label style={{ display: 'block', marginTop: '15px', color: '#aaa', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={transform.autoRotate}
          onChange={(e) => setTransform(t => ({ ...t, autoRotate: e.target.checked }))}
          style={{ marginRight: '8px' }}
        />
        Auto Rotate
      </label>

      {/* === RESET BUTTON === */}
      <button
        onClick={() => setTransform({
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          posX: 0,
          posY: -0.12,
          posZ: 0,
          scale: 0.1,
          autoRotate: false
        })}
        style={{
          width: '100%',
          marginTop: '15px',
          padding: '8px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#ff5252'}
        onMouseOut={(e) => e.target.style.background = '#ff6b6b'}
      >
        🔄 Reset Transform
      </button>
    </div>
  );
}
