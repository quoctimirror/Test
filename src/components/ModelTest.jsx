import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { loadModel } from '../utils/glbLoader.js';

function ModelViewer() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNhanAnhKhanhLam = async () => {
      try {
        setLoading(true);
        const gltf = await loadModel('nhanAnhKhanhLam');
        setModel(gltf.scene);
        console.log('Model loaded successfully:', gltf);
      } catch (err) {
        setError(err.message);
        console.error('Error loading model:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNhanAnhKhanhLam();
  }, []);

  if (loading) return <div>Loading model...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {model && <primitive object={model} />}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      
      <Environment preset="studio" />
    </Canvas>
  );
}

export default ModelViewer;