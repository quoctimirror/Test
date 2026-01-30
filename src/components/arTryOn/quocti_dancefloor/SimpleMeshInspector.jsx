/**
 * SimpleMeshInspector.jsx - MAIN COMPONENT
 *
 * OVERVIEW:
 * Tool to inspect and customize 3D model (ring, jewelry)
 * - Upload GLB/GLTF model
 * - View mesh list in model
 * - Change color of each mesh (color picker + HEX input)
 * - Adjust transform (rotation, position, scale)
 * - Auto-rotate model
 * - Highlight mesh on click
 *
 * HOW TO USE:
 * 1. Upload GLB/GLTF file or use default model
 * 2. Adjust transform (rotation, scale, etc.)
 * 3. Click on mesh in list to highlight
 * 4. Change mesh color using color picker or enter HEX
 *
 * COMPATIBLE: React 19 (no Leva)
 */

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

// Import child components
import { Scene3D } from './components/Scene3D';
import { ModelUploader } from './components/ModelUploader';
import { TransformControls } from './components/TransformControls';
import { MeshList } from './components/MeshList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiamondCustomizer } from './components/DiamondCustomizer';

export default function SimpleMeshInspector() {
  // ===== STATE MANAGEMENT =====

  // Currently selected mesh (highlight with red)
  const [selectedMesh, setSelectedMesh] = useState(null);

  // List of all meshes in model
  const [meshList, setMeshList] = useState([]);

  // Current model file path
  const [modelPath, setModelPath] = useState('/models/rings/myfav.glb');

  // Color of each mesh (key: mesh name, value: HEX color)
  const [meshColors, setMeshColors] = useState({});

  // Visibility state of each mesh (key: mesh name, value: boolean)
  const [meshVisibility, setMeshVisibility] = useState({});

  // Render mode: 'smooth' (smooth, high performance) or 'fullTopping' (beautiful, sparkling)
  const [renderMode, setRenderMode] = useState('smooth');

  // Debug mode: Show/hide helpers (light rays, spheres)
  const [showDebugHelpers, setShowDebugHelpers] = useState(false);

  // Bloom effect: Enable/disable sparkle effect (bright areas glow)
  const [enableBloom, setEnableBloom] = useState(true);

  // Diamond customization states
  const [selectedShape, setSelectedShape] = useState('Round');
  const [selectedSize, setSelectedSize] = useState('1 ct');
  const [selectedHead, setSelectedHead] = useState('4-Prong Nouveau');
  const [selectedMetal, setSelectedMetal] = useState('Rose Gold 2');
  const [selectedBand, setSelectedBand] = useState('Solitaire');
  const [selectedBandMetal, setSelectedBandMetal] = useState('Rose Gold 2');

  // Transform controls (rotation, position, scale, auto-rotate)
  // DEFAULT: scale=0.1, posY=-0.12 for nice display
  // For ORIGINAL view: scale=1, posY=0
  const [transform, setTransform] = useState({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: -0.12,    // Move down to center
    posZ: 0,
    scale: 0.1,     // Scale down 10x (original model too large)
    autoRotate: false,
  });

  // ===== INITIALIZE DEFAULT COLOR AND VISIBILITY FOR MESH =====
  // When mesh list changes, automatically set default color and visibility
  useEffect(() => {
    if (meshList.length === 0) return;

    setMeshColors(prev => {
      const colors = { ...prev };

      meshList.forEach(mesh => {
        // If mesh has no color, set default color based on name
        if (!colors[mesh.name]) {
          const name = mesh.name.toLowerCase();

          if (name.includes('ring')) {
            // Ring -> Rose Gold 2 (default)
            colors[mesh.name] = '#ffaf83';
          } else if (name.includes('diamond') || name.includes('gem') || name.includes('stone')) {
            // Gemstone -> Light blue
            colors[mesh.name] = '#b5cbdd';
          } else {
            // Other -> White
            colors[mesh.name] = '#ffffff';
          }
        }
      });

      return colors;
    });

    // Initialize visibility for new mesh (default is visible)
    setMeshVisibility(prev => {
      const visibility = { ...prev };
      meshList.forEach(mesh => {
        if (visibility[mesh.name] === undefined) {
          visibility[mesh.name] = true; // Default visible
        }
      });
      return visibility;
    });
  }, [meshList]);

  // ===== WHEN SELECTING BAND METAL -> CHANGE BAND/RING COLOR =====
  useEffect(() => {
    if (meshList.length === 0) return;

    // Map metal name to hex color
    const metalColorMap = {
      'Rose Gold 1': '#f2af83',
      'Rose Gold 2': '#ffaf83',
      'Platinum': '#b9bbbc',
      'Silver': '#dedede'
    };

    const newColor = metalColorMap[selectedBandMetal];
    if (!newColor) return;

    // Find mesh with name containing "ring" or "band" and update color
    setMeshColors(prev => {
      const colors = { ...prev };
      meshList.forEach(mesh => {
        const name = mesh.name.toLowerCase();
        if (name.includes('ring') || name.includes('band')) {
          colors[mesh.name] = newColor;
        }
      });
      return colors;
    });
  }, [selectedBandMetal, meshList]);

  // ===== CONVERT SELECTED SIZE -> DIAMOND SCALE =====
  const diamondScale = useMemo(() => {
    const sizeMap = {
      '1 ct': 1.0,    // Original size
      '1.5 ct': 1.15, // 15% larger
      '2 ct': 1.3,    // 30% larger
      '2.5 ct': 1.45  // 45% larger
    };
    const scale = sizeMap[selectedSize] || 1.0;
    console.log('🔍 Diamond Scale:', selectedSize, '→', scale);
    return scale;
  }, [selectedSize]);

  // ===== HANDLE FILE UPLOAD =====
  const handleFileUpload = useCallback(async (url) => {
    try {
      // Clear GLTF cache to avoid conflict
      useGLTF.clear();

      // Preload model to check for errors before rendering
      await useGLTF.preload(url);

      setModelPath(url);
      setSelectedMesh(null);
      setMeshList([]);
      setMeshColors({});
      setMeshVisibility({});

      // Reset transform to good values for new model
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
      alert('Cannot load this model. Please select a valid GLB/GLTF file.');
    }
  }, []);

  // ===== RENDER UI =====
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#000' }}>
      {/* ===== LEFT SIDEBAR ===== */}
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

        {/* Render Mode Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
            Render Mode
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={renderMode === 'fullTopping'}
                onChange={(e) => setRenderMode(e.target.checked ? 'fullTopping' : 'smooth')}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {renderMode === 'smooth' ? '⚡ Smooth Mode (Fast)' : '✨ FullTopping Mode (Beautiful)'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {renderMode === 'smooth'
                ? 'High performance, smooth'
                : 'Full effects, sparkling bright'}
            </div>
          </div>
        </div>

        {/* Debug Helpers Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #FFA500', paddingBottom: '10px' }}>
            Debug Mode
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDebugHelpers}
                onChange={(e) => setShowDebugHelpers(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {showDebugHelpers ? '🔦 Debug Helpers ON' : '🔦 Debug Helpers OFF'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {showDebugHelpers
                ? 'Show light rays and light source position'
                : 'Hide debug helpers'}
            </div>
          </div>
        </div>

        {/* Bloom Effect Toggle */}
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ borderBottom: '2px solid #FFD700', paddingBottom: '10px' }}>
            Bloom Effect
          </h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableBloom}
                onChange={(e) => setEnableBloom(e.target.checked)}
                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>
                {enableBloom ? '✨ Bloom ON (Lấp lánh)' : '🚫 Bloom OFF (Không lấp lánh)'}
              </span>
            </label>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginLeft: '28px' }}>
              {enableBloom
                ? 'Bright areas glow effect (2 light zones)'
                : 'Bloom off, no glow effect'}
            </div>
          </div>
        </div>

        {/* Mesh List + Color Picker + Visibility Toggle */}
        <MeshList
          meshList={meshList}
          selectedMesh={selectedMesh}
          setSelectedMesh={setSelectedMesh}
          meshColors={meshColors}
          setMeshColors={setMeshColors}
          meshVisibility={meshVisibility}
          setMeshVisibility={setMeshVisibility}
        />
      </div>

      {/* ===== 3D CANVAS (CENTER) ===== */}
      <div style={{ flex: 1, background: renderMode === 'smooth' ? '#000000' : '#ffffff' }}>
        {/* ErrorBoundary: Catch errors when loading model */}
        <ErrorBoundary key={modelPath}>
          {/* Suspense: Show "Loading..." while loading model */}
          <Suspense
            fallback={
              <div style={{
                color: renderMode === 'smooth' ? '#fff' : '#333',
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
              dpr={renderMode === 'fullTopping' ? [1.5, 2] : [1, 1.5]}
              gl={{
                antialias: renderMode === 'fullTopping',
                powerPreference: 'high-performance',
                stencil: false,
                alpha: false
              }}
              camera={{ position: [0, 0, 10], fov: 50 }}
            >
              <Scene3D
                modelPath={modelPath}
                selectedMesh={selectedMesh}
                onMeshListLoad={setMeshList}
                transform={transform}
                meshColors={meshColors}
                meshVisibility={meshVisibility}
                renderMode={renderMode}
                diamondScale={diamondScale}
                showDebugHelpers={showDebugHelpers}
                enableBloom={enableBloom}
              />
            </Canvas>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* ===== RIGHT SIDEBAR: DIAMOND CUSTOMIZER ===== */}
      <div style={{
        width: '350px',
        background: '#1a1a1a',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        fontSize: '14px'
      }}>
        <DiamondCustomizer
          selectedShape={selectedShape}
          selectedSize={selectedSize}
          selectedHead={selectedHead}
          selectedMetal={selectedMetal}
          selectedBand={selectedBand}
          selectedBandMetal={selectedBandMetal}
          onShapeChange={setSelectedShape}
          onSizeChange={setSelectedSize}
          onHeadChange={setSelectedHead}
          onMetalChange={setSelectedMetal}
          onBandChange={setSelectedBand}
          onBandMetalChange={setSelectedBandMetal}
        />
      </div>
    </div>
  );
}
