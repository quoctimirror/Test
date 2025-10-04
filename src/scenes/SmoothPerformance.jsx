import { Center, OrbitControls, useEnvironment, Environment } from '@react-three/drei'
import { useControls } from 'leva'
import { Ring } from '@components/Ring'

export function SmoothPerformance({ selectedMesh, onMaterialsLoad }) {
  // Tạo controls (GUI) để thay đổi màu frame và diamonds real-time
  const { frame, diamonds } = useControls({
    frame: '#fff0f0',      // Màu khung nhẫn mặc định
    diamonds: '#ffffff'    // Màu kim cương mặc định
  })

  // Load environment map (HDR) từ Poly Haven để phản chiếu môi trường
  const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  return (
    <>
      {/* Đèn spotlight chiếu sáng từ trên */}
      <spotLight
        position={[10, 10, 10]}  // Vị trí đèn
        angle={0.15}             // Góc chiếu
        penumbra={1}             // Độ mờ viền bóng
        decay={0}                // Không giảm sáng theo khoảng cách
        intensity={Math.PI}      // Cường độ sáng
      />

      {/* Group chứa model, dịch xuống dưới một chút */}
      <group position={[0, -0.25, 0]}>
        {/* Center: tự động căn giữa model */}
        <Center
          top                              // Căn theo đỉnh
          position={[0, -0.12, 0]}         // Vị trí
          rotation={[-0.1, 0, 0.085]}      // Xoay một chút cho đẹp
        >
          <Ring
            frame={frame}
            diamonds={diamonds}
            env={env}
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            scale={0.1}                    // Scale nhỏ lại 10 lần
          />
        </Center>
      </group>

      {/* OrbitControls: điều khiển camera bằng chuột */}
      <OrbitControls
        enablePan={false}                  // Tắt pan (kéo camera)
        minPolarAngle={0}                  // Góc quay dọc tối thiểu
        maxPolarAngle={Math.PI / 2.25}     // Góc quay dọc tối đa (không xoay quá thấp)
        makeDefault                        // Đặt làm controls mặc định
      />

      {/* Environment: môi trường phản chiếu + background */}
      <Environment
        map={env}                          // Dùng HDR map đã load
        background                         // Dùng làm background
        blur={1}                           // Làm mờ background
      />
    </>
  )
}
