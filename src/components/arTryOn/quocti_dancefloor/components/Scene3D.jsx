/**
 * Scene3D.jsx
 *
 * PURPOSE: Manage entire 3D scene
 * - Load GLTF model
 * - Load environment map (HDR)
 * - Add lighting (spotlight)
 * - Add OrbitControls to rotate camera
 * - Extract mesh list from model and send to parent
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGLTF, useEnvironment, Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, ToneMapping, SMAA } from '@react-three/postprocessing';
import { Ring3D } from './Ring3D';
import { SpotLightHelper } from 'three';

export function Scene3D({ modelPath, selectedMesh, onMeshListLoad, transform, meshColors, meshVisibility, renderMode = 'smooth', diamondScale = 1, showDebugHelpers = false, enableBloom = true }) {
  // Load model GLTF
  const { nodes } = useGLTF(modelPath);

  // Load environment map (HDR) for reflections
  const env = useEnvironment({ files: '/studio_env/brown_photostudio_02_4k.exr' });

  // Ref cho spotlight helper
  const spotLightRef = useRef();

  // Extract mesh list from model when model is loaded
  const handleMeshListLoad = useCallback((list) => {
    if (onMeshListLoad) {
      onMeshListLoad(list);
    }
  }, [onMeshListLoad]);

  useEffect(() => {
    if (nodes) {
      const list = [];

      Object.keys(nodes).forEach(key => {
        const node = nodes[key];

        // Only get nodes that are Mesh or InstancedMesh
        if (node.isMesh || node.isInstancedMesh) {
          list.push({
            name: key,        // Mesh name
            type: node.type   // Type: Mesh or InstancedMesh
          });
        }
      });

      // Send mesh list to parent component
      handleMeshListLoad(list);
    }
  }, [nodes, handleMeshListLoad]);

  return (
    <>
      {/* === BACKGROUND COLOR === */}
      <color attach="background" args={['#ffffff']} /> {/* White background */}

      {/* === LIGHTING === */}
      {/* Main SpotLight shining from above */}
      <spotLight
        ref={spotLightRef}
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI * 3}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0001}
      />

      {/* Back lighting - to create light refraction through diamond */}
      <pointLight position={[0, -2, -3]} intensity={Math.PI * 2} color="#ffffff" />
      <pointLight position={[3, 0, -3]} intensity={Math.PI * 1.5} color="#ffffff" />
      <pointLight position={[-3, 0, -3]} intensity={Math.PI * 1.5} color="#ffffff" />

      {/* Soft ambient light */}
      <ambientLight intensity={0.2} />

      {/* DEBUG: SpotLight Helper - Draw light cone shining on ring */}
      {showDebugHelpers && spotLightRef.current && (
        <primitive object={new SpotLightHelper(spotLightRef.current, '#ffff00')} />
      )}

      {/* DEBUG: Red sphere marking light source position */}
      {showDebugHelpers && (
        <mesh position={[10, 10, 10]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}

      {/* === MODEL === */}
      <group position={[0, -0.25, 0]}>
        <Ring3D
          nodes={nodes}
          env={env}
          selectedMesh={selectedMesh}
          transform={transform}
          meshColors={meshColors}
          meshVisibility={meshVisibility}
          diamondScale={diamondScale}
          renderMode={renderMode}
        />
      </group>

      {/* === CAMERA CONTROLS === */}
      {/* OrbitControls: Left click to rotate, scroll to zoom */}
      <OrbitControls
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.25}
        makeDefault
      />

      {/* === POST-PROCESSING EFFECTS === */}
      {/* EffectComposer: conditional rendering based on renderMode */}
      <EffectComposer
        disableNormalPass={renderMode === 'smooth'}
        multisampling={renderMode === 'fullTopping' ? 8 : 4}
        enabled={true}
      >
        {/* SMAA: Strong anti-aliasing, better than FXAA */}
        <SMAA />

        {/* N8AO: Ambient Occlusion - Only enabled in fullTopping mode */}
        {renderMode === 'fullTopping' && (
          <N8AO
            aoRadius={0.15}
            intensity={4}
            distanceFalloff={2}
          />
        )}

        {/* Bloom: sparkle effect - Enhanced for diamond */}
        {enableBloom && (
          <Bloom
            luminanceThreshold={renderMode === 'fullTopping' ? 0.9 : 1.2}
            intensity={renderMode === 'fullTopping' ? 1.8 : 1.2}
            levels={renderMode === 'fullTopping' ? 9 : 8}
            mipmapBlur
          />
        )}

        {/* ToneMapping: HDR color mapping - DISABLED to keep white background from turning gray */}
        {/* <ToneMapping /> */}
      </EffectComposer>

      {/* === ENVIRONMENT === */}
      {/* Environment map for reflections and lighting */}
      {/* background={false} -> DO NOT display HDRI as background, only use for reflections */}
      <Environment map={env} background={false} />
    </>
  );
}
