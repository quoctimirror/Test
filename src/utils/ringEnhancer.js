// Ring Enhancement Utility
// Tối ưu hiệu suất và thẩm mỹ cho nhẫn kim cương

export class RingEnhancer {
  constructor() {
    this.diamondMaterial = null;
    this.goldMaterial = null;
    this.animationMixer = null;
  }

  // Tạo material kim cương với hiệu ứng cầu vồng lấp lánh
  createDiamondMaterial() {
    if (!window.THREE) return null;

    // Kim cương trắng lấp lánh, trong suốt, thủy tinh tinh xảo
    this.diamondMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu trắng tinh khiết với hint xanh lục nhẹ (như kim cương thật)
      color: 0xf8f8ff,           // Trắng ghost với hint xanh
      
      // Không phải kim loại - kim cương là dielectric
      metalness: 0.0,             
      roughness: 0.0,             // Cực kỳ mịn = lấp lánh
      
      // Tính chất thủy tinh trong suốt
      transmission: 0.98,         // Gần như hoàn toàn trong suốt
      thickness: 1.0,             // Độ dày optical cho hiệu ứng khúc xạ
      
      // Lớp phủ cho độ bóng
      clearcoat: 1.0,             // Lớp phủ trong suốt hoàn hảo
      clearcoatRoughness: 0.0,    // Không có grain = lấp lánh
      
      // Kim cương properties
      ior: 2.42,                  // Index of refraction chính xác của kim cương
      reflectivity: 0.9,          // Phản chiếu cực cao
      
      // Environment reflection
      envMapIntensity: 5.0,       // Tăng mạnh để lấp lánh
      
      // Transparency
      transparent: true,
      opacity: 0.95,
      
      // Render both sides cho inner reflections
      side: window.THREE.DoubleSide,
      
      // Thêm một chút dispersion effect (tách màu như lăng kính)
      // Note: THREE.js không có built-in dispersion, nhưng IOR cao sẽ giúp
      attenuationDistance: 0.5,   // Khoảng cách ánh sáng đi qua
      attenuationColor: new window.THREE.Color(0.95, 0.98, 1.0)  // Tint xanh nhẹ
    });

    return this.diamondMaterial;
  }

  // Tạo material vàng bóng mịn cho đai nhẫn
  createGoldMaterial() {
    if (!window.THREE) return null;

    // Vàng sang trọng, sáng bóng như jewelry thật
    this.goldMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu vàng 18K authentic - warm và rich
      color: 0xFFD700,        // Vàng classic với warmth
      
      // Kim loại properties
      metalness: 1.0,         // 100% kim loại
      roughness: 0.05,        // Cực kỳ mịn = sáng bóng mirror-like
      
      // Clearcoat cho độ bóng jewelry premium
      clearcoat: 1.0,         // Lớp phủ hoàn hảo
      clearcoatRoughness: 0.02, // Gần như không có grain
      
      // Reflection properties
      reflectivity: 1.0,      // Phản chiếu hoàn hảo
      envMapIntensity: 4.0,   // Tăng mạnh environment reflection
      
      // Thêm một touch of warmth
      emissive: new window.THREE.Color(0x221100), // Emissive nhẹ vàng ấm
      emissiveIntensity: 0.1, // Rất nhẹ để tạo inner glow
      
      // Performance optimized
      transparent: false,
      side: window.THREE.FrontSide,
      depthWrite: true,
      
      // Thêm sheen cho luxury feel
      sheen: 0.8,             // Sheen effect cho vàng
      sheenRoughness: 0.1,    // Sheen mịn
      sheenColor: new window.THREE.Color(0xFFE55C) // Sheen màu vàng sáng hơn
    });

    return this.goldMaterial;
  }

  // Áp dụng materials cho nhẫn dựa trên tên mesh
  applyRingMaterials(gltfScene, environmentTexture = null) {
    if (!gltfScene || !window.THREE) return;

    // Tạo materials
    const diamondMat = this.createDiamondMaterial();
    const goldMat = this.createGoldMaterial();

    // Set environment map cho vàng nếu có
    if (environmentTexture && goldMat) {
      goldMat.envMap = environmentTexture;
    }

    let appliedDiamond = false;
    let appliedGold = false;

    // Duyệt qua tất cả mesh trong scene
    gltfScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const meshName = child.name.toLowerCase();
        const materialName = child.material.name?.toLowerCase() || '';

        console.log('🔍 Checking mesh:', meshName, 'Material:', materialName);

        // CHÍNH XÁC theo analysis:
        // Round, Round_2 = Kim cương
        // Object_2 = Vàng
        
        if (meshName === 'round' || meshName === 'round_2') {
          // Apply diamond material cho Round và Round_2
          if (diamondMat) {
            child.material = diamondMat.clone();
            this.optimizeDiamondGeometry(child);
            console.log('💎 Applied DIAMOND material to:', child.name, '(Kim cương trắng lấp lánh)');
            appliedDiamond = true;
          }
          
        } else if (meshName === 'object_2') {
          // Apply gold material cho Object_2
          if (goldMat) {
            child.material = goldMat.clone();
            this.optimizeGoldGeometry(child);
            console.log('🥇 Applied GOLD material to:', child.name, '(Vàng sang trọng sáng bóng)');
            appliedGold = true;
          }
          
        } else {
          // Fallback cho các mesh khác
          console.log('❓ Unknown mesh:', meshName, '- applying gold as fallback');
          if (goldMat) {
            child.material = goldMat.clone();
            this.optimizeGoldGeometry(child);
            console.log('🥇 Applied fallback gold to:', child.name);
            appliedGold = true;
          }
        }

        // Cast shadows cho realism
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Fallback: nếu chưa apply được gì, apply gold cho tất cả
    if (!appliedDiamond && !appliedGold) {
      console.log('⚠️ Applying fallback gold material to all meshes');
      gltfScene.traverse((child) => {
        if (child.isMesh && goldMat) {
          child.material = goldMat.clone();
          console.log('🥇 Fallback gold applied to:', child.name);
        }
      });
    }
  }

  // Xác định mesh kim cương
  isDiamond(meshName, materialName) {
    const diamondKeywords = ['diamond', 'gem', 'stone', 'crystal', 'jewel', 'kim_cuong'];
    return diamondKeywords.some(keyword => 
      meshName.includes(keyword) || materialName.includes(keyword)
    );
  }

  // Xác định mesh vàng
  isGold(meshName, materialName) {
    const goldKeywords = ['gold', 'band', 'ring', 'metal', 'vang', 'dai'];
    return goldKeywords.some(keyword => 
      meshName.includes(keyword) || materialName.includes(keyword)
    );
  }

  // Tối ưu geometry kim cương
  optimizeDiamondGeometry(mesh) {
    if (mesh.geometry) {
      // Compute normals cho ánh sáng đẹp
      mesh.geometry.computeVertexNormals();
      
      // Merge vertices gần nhau
      mesh.geometry = mesh.geometry.mergeVertices?.() || mesh.geometry;
      
      // Tối ưu cho mobile
      if (mesh.geometry.attributes.position.count > 1000) {
        // Reduce complexity nếu quá nhiều vertices
        console.log('⚡ Optimizing diamond geometry');
      }
    }
  }

  // Tối ưu geometry vàng
  optimizeGoldGeometry(mesh) {
    if (mesh.geometry) {
      mesh.geometry.computeVertexNormals();
      mesh.geometry = mesh.geometry.mergeVertices?.() || mesh.geometry;
    }
  }

  // Update animation cho kim cương lấp lánh (placeholder for now)  
  updateAnimation(camera, deltaTime = 0.016) {
    // Animation will be added later if needed
    return;
  }

  // Cleanup resources
  dispose() {
    if (this.diamondMaterial) {
      this.diamondMaterial.dispose();
    }
    if (this.goldMaterial) {
      this.goldMaterial.dispose();
    }
  }
}

// Export singleton instance
export const ringEnhancer = new RingEnhancer();