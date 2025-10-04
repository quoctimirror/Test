import { Center, OrbitControls, AccumulativeShadows, RandomizedLight, useEnvironment, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, ToneMapping } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { Ring } from '@components/Ring'

export function FullTopping({ selectedMesh, onMaterialsLoad }) {
  // Tạo controls với thêm màu shadow (màu bóng đổ)
  const { shadow, frame, diamonds } = useControls({
    shadow: '#000000',     // Màu bóng đổ
    frame: '#fff0f0',      // Màu khung nhẫn
    diamonds: '#ffffff'    // Màu kim cương
  })

  // Load environment map (HDR) từ Poly Haven
  const env = useEnvironment({ files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr' })

  return (
    <>
      {/* Đèn spotlight chiếu sáng */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />

      {/* Group chứa model và shadows */}
      <group position={[0, -0.25, 0]}>
        {/* Center: tự động căn giữa model */}
        <Center top position={[0, -0.12, 0]} rotation={[-0.1, 0, 0.085]}>
          <Ring
            frame={frame}
            diamonds={diamonds}
            env={env}
            selectedMesh={selectedMesh}
            onMaterialsLoad={onMaterialsLoad}
            scale={0.1}
          />
        </Center>

        {/* AccumulativeShadows: tạo bóng đổ mềm, chất lượng cao */}
        <AccumulativeShadows
          temporal              // Accumulate qua nhiều frames để giảm noise
          frames={100}          // Render 100 frames để tạo bóng mịn (càng nhiều càng đẹp nhưng lag)
          color={shadow}        // Màu bóng
          opacity={1.05}        // Độ đậm bóng
        >
          {/* RandomizedLight: tạo nhiều nguồn sáng ngẫu nhiên để bóng mềm tự nhiên */}
          <RandomizedLight
            radius={5}           // Bán kính vùng random lights
            position={[10, 5, -5]} // Vị trí trung tâm của lights
          />
        </AccumulativeShadows>
      </group>

      {/* OrbitControls: điều khiển camera */}
      <OrbitControls enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />

      {/* EffectComposer: post-processing effects (hiệu ứng sau khi render) */}
      <EffectComposer>
        {/* N8AO: Ambient Occlusion (tạo bóng tối ở kẽ hở) */}
        <N8AO
          aoRadius={0.15}      // Bán kính tính AO
          intensity={4}        // Cường độ đậm của AO
          distanceFalloff={2}  // AO giảm dần theo khoảng cách
        />

        {/* Bloom: hiệu ứng phát sáng (glow) */}
        <Bloom
          luminanceThreshold={3.5}  // Chỉ những vùng sáng > 3.5 mới glow
          intensity={0.85}          // Cường độ glow
          levels={9}                // Số levels blur
          mipmapBlur                // Dùng mipmap để blur mượt hơn
        />

        {/* ToneMapping: ánh xạ màu từ HDR sang màn hình */}
        <ToneMapping />
      </EffectComposer>

      {/* Environment: môi trường phản chiếu + background */}
      <Environment map={env} background blur={1} />
    </>
  )
}
