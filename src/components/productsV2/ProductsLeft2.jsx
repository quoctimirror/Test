/**
 * ProductsLeft2.jsx
 *
 * NHIỆM VỤ: Hiển thị 3D model nhẫn thật sử dụng quocti_dancefloor
 * - Thay thế iJewel viewer bằng React Three Fiber
 * - Load model nhẫn với vật liệu realistic (MeshRefractionMaterial)
 * - Không có UI controls - chỉ hiển thị nhẫn
 */

import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Scene3D } from '@components/arTryOn/quocti_dancefloor/components/Scene3D';
import { ErrorBoundary } from '@components/arTryOn/quocti_dancefloor/components/ErrorBoundary';
import "./ProductsLeft.css";

// Component để điều chỉnh camera target
function CameraAdjuster() {
  const { camera } = useThree();

  useEffect(() => {
    // Điều chỉnh camera nhìn xuống thấp hơn
    camera.position.set(0, 0, 10);
    camera.lookAt(0, -2, 0); // Nhìn vào điểm thấp hơn
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

const ProductsLeft2 = () => {
  // State cho transform - giá trị mặc định tốt để hiển thị nhẫn
  const [transform] = useState({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: -2,    // Dịch xuống thấp hơn để center
    posZ: 0,
    scale: 0.1,     // Scale nhỏ lại (model gốc to)
    autoRotate: true // Tự động xoay nhẹ
  });

  // State cho mesh colors - SET MÀU VÀNG HỒNG CHO ĐAI NHẪN
  const [meshColors] = useState({
    'ring': '#ffaf83',        // Rose Gold 2
    'band': '#ffaf83',        // Rose Gold 2
    'Ring': '#ffaf83',        // Rose Gold 2
    'Band': '#ffaf83',        // Rose Gold 2
    'RING': '#ffaf83',        // Rose Gold 2
    'BAND': '#ffaf83'         // Rose Gold 2
  });
  const [meshVisibility] = useState({});

  // Callback khi mesh list được load (không cần xử lý gì)
  const handleMeshListLoad = useCallback(() => {
    // Không cần làm gì - chỉ để Scene3D không báo lỗi
  }, []);

  return (
    <div id="pv2-viewer-root" style={{ width: '100%', height: '100%', background: '#ffffff' }}>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#ffffff',
              color: '#333333'
            }}>
              Loading Model...
            </div>
          }
        >
          <Canvas
            shadows
            dpr={[1, 1.5]} // Device pixel ratio - quality
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              stencil: false,
              alpha: false
            }}
            camera={{ position: [0, 0, 10], fov: 50 }}
            style={{
              width: '100%',
              height: '100%',
              background: '#ffffff',
              backgroundColor: '#ffffff'
            }}
          >
            <CameraAdjuster />
            <Scene3D
              modelPath="/models/rings/myfav.glb"
              selectedMesh={null}
              onMeshListLoad={handleMeshListLoad}
              transform={transform}
              meshColors={meshColors}
              meshVisibility={meshVisibility}
              renderMode="smooth" // Chế độ mượt, hiệu suất cao
              diamondScale={1.0}   // Kích thước kim cương mặc định
              showDebugHelpers={false} // Không hiển thị debug
              enableBloom={false}   // TẮT hiệu ứng lấp lánh
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default ProductsLeft2;
