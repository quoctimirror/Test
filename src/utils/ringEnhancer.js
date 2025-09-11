// Ring Enhancement Utility
// Tối ưu hiệu suất và thẩm mỹ cho nhẫn kim cương

export class RingEnhancer {
  constructor() {
    this.diamondMaterial = null;
    this.goldMaterial = null;
    this.animationMixer = null;
    this.diamondMeshes = [];
    this.sparkleTime = 0;
  }

  // Tạo material kim cương với hiệu ứng cầu vồng lấp lánh
  createDiamondMaterial() {
    if (!window.THREE) return null;

    // Enhanced diamond material với custom properties
    this.diamondMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu đỏ ruby/sapphire đỏ rực
      color: 0xFF2222,            // Đỏ ruby sáng hơn
      
      // Không phải kim loại - ruby là dielectric
      metalness: 0.0,             
      roughness: 0.05,            // Hơi rough để có màu rõ hơn
      
      // Vừa trong suốt vừa có màu
      transmission: 0.4,          // Giảm transmission để thấy màu rõ hơn
      thickness: 1.5,             
      
      // Lớp phủ cho độ bóng ruby
      clearcoat: 1.0,             
      clearcoatRoughness: 0.0,    
      
      // Ruby properties
      ior: 1.76,                  // IOR của ruby thật
      reflectivity: 0.9,          
      
      // Environment reflection
      envMapIntensity: 12.0,      // Tăng để lấp lánh
      
      // Emissive cho inner glow - tạo viền sáng từ bên trong
      emissive: new window.THREE.Color(0xFF0000), // Đỏ phát sáng
      emissiveIntensity: 0.3,     // Độ sáng vừa phải
      
      // Opacity vừa phải để vừa trong suốt vừa thấy rõ
      transparent: true,
      opacity: 0.7,               // Vừa trong suốt vừa thấy được
      
      // Render both sides cho inner reflections
      side: window.THREE.DoubleSide,
      
      // Ruby dispersion effect
      attenuationDistance: 0.3,   // Tăng để có màu đỏ đậm hơn
      attenuationColor: new window.THREE.Color(0.9, 0.1, 0.1),  // Tint đỏ
      
      // Thêm sheen cho sparkle effect cực mạnh với màu đỏ
      sheen: 1.0,
      sheenRoughness: 0.0,
      sheenColor: new window.THREE.Color(0xFF4444),
      
      // Thêm iridescence cho rainbow effect mạnh hơn
      iridescence: 1.0,           // Maximum iridescence
      iridescenceIOR: 1.5,        // Tăng IOR cho hiệu ứng mạnh hơn
      iridescenceThicknessRange: [50, 1000],  // Range rộng hơn cho màu cầu vồng đẹp
      
      // Enable fog để có depth
      fog: true
    });

    return this.diamondMaterial;
  }

  // Tạo material vàng bóng mịn cho đai nhẫn
  createGoldMaterial() {
    if (!window.THREE) return null;

    // Vàng sang trọng giống hệt như trong hình tham khảo
    this.goldMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu vàng ấm áp như trong hình - rich gold tone
      color: 0xFFB000,        // Vàng đậm ấm áp như reference image
      
      // Kim loại properties
      metalness: 1.0,         // 100% kim loại
      roughness: 0.02,        // Cực kỳ mịn = mirror finish
      
      // Clearcoat cho độ bóng jewelry premium như trong hình
      clearcoat: 1.0,         // Lớp phủ hoàn hảo
      clearcoatRoughness: 0.01, // Gần như không có grain
      
      // Reflection properties tăng mạnh
      reflectivity: 1.0,      // Phản chiếu hoàn hảo
      envMapIntensity: 6.0,   // Tăng mạnh hơn environment reflection
      
      // Thêm warmth như vàng thật
      emissive: new window.THREE.Color(0x331100), // Emissive vàng ấm hơn
      emissiveIntensity: 0.15, // Tăng inner glow
      
      // Performance optimized
      transparent: false,
      side: window.THREE.FrontSide,
      depthWrite: true,
      
      // Thêm sheen cho luxury feel
      sheen: 1.0,             // Maximum sheen effect
      sheenRoughness: 0.05,   // Sheen rất mịn
      sheenColor: new window.THREE.Color(0xFFC040) // Sheen màu vàng tươi
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
        // Emerald_Custom = Kim cương trắng (như yêu cầu)
        
        if (meshName === 'round' || meshName === 'round_2' || meshName === 'emerald_custom') {
          // Apply diamond material cho Round, Round_2 và Emerald_Custom
          if (diamondMat) {
            child.material = diamondMat.clone();
            this.optimizeDiamondGeometry(child);
            // Lưu diamond meshes để animate
            this.diamondMeshes.push(child);
            
            
            console.log('💎 Applied RUBY material with outline to:', child.name, '(Ruby đỏ với viền)');
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

  // Tạo hiệu ứng viền cho ruby
  createOutlineEffect(mesh) {
    if (!window.THREE || !mesh.geometry) return;

    // Tạo wireframe outline
    const outlineGeometry = mesh.geometry.clone();
    const outlineMaterial = new window.THREE.MeshBasicMaterial({
      color: 0xFF6666,           // Đỏ sáng cho viền
      wireframe: true,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
      side: window.THREE.BackSide  // Render từ phía sau
    });

    // Tạo outline mesh
    const outlineMesh = new window.THREE.Mesh(outlineGeometry, outlineMaterial);
    outlineMesh.scale.multiplyScalar(1.005);  // Scale nhẹ để tạo viền
    outlineMesh.renderOrder = mesh.renderOrder - 1;  // Render trước main mesh
    
    // Add outline vào parent
    if (mesh.parent) {
      mesh.parent.add(outlineMesh);
      console.log('✨ Created outline effect for ruby');
    }

    // Tạo thêm inner glow effect bằng duplicate mesh
    const glowGeometry = mesh.geometry.clone();
    const glowMaterial = new window.THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.2,
      side: window.THREE.BackSide
    });

    const glowMesh = new window.THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.multiplyScalar(0.98);  // Scale nhỏ hơn một chút
    glowMesh.renderOrder = mesh.renderOrder + 1;  // Render sau main mesh

    if (mesh.parent) {
      mesh.parent.add(glowMesh);
      console.log('💫 Created inner glow effect for ruby');
    }
  }

  // Update animation cho kim cương lấp lánh cực mạnh
  updateAnimation(camera, deltaTime = 0.016) {
    this.sparkleTime += deltaTime;
    
    // Animate diamond sparkle với nhiều frequency khác nhau
    this.diamondMeshes.forEach((diamondMesh, index) => {
      if (diamondMesh && diamondMesh.material) {
        const material = diamondMesh.material;
        
        // Tạo hiệu ứng lấp lánh phức tạp với multiple sine waves
        const sparkle1 = Math.sin(this.sparkleTime * 4.0 + index * 1.5) * 0.4;
        const sparkle2 = Math.sin(this.sparkleTime * 7.0 + index * 0.7) * 0.3;
        const sparkle3 = Math.sin(this.sparkleTime * 11.0 + index * 2.1) * 0.2;
        const sparkle4 = Math.sin(this.sparkleTime * 13.0 + index * 1.8) * 0.1;
        
        const sparkleIntensity = (sparkle1 + sparkle2 + sparkle3 + sparkle4) * 0.5 + 0.5;
        
        // Animate environment map intensity với range lớn hơn
        material.envMapIntensity = 12.0 + sparkleIntensity * 10.0;
        
        // Animate iridescence cực mạnh cho rainbow effect
        material.iridescence = 0.8 + sparkleIntensity * 0.2;
        
        // Animate sheen intensity
        material.sheen = 0.9 + sparkleIntensity * 0.1;
        
        // Animate clearcoat với subtle changes
        material.clearcoat = 0.95 + sparkleIntensity * 0.05;
        
        // Animate opacity với breathing effect nhẹ
        material.opacity = 0.06 + sparkleIntensity * 0.04;
        
        // Animate thickness cho dispersion effect
        material.thickness = 2.5 + sparkleIntensity * 1.0;
        
        // Animate IOR subtly cho refractive changes
        material.ior = 2.40 + sparkleIntensity * 0.04;
        
        // Mark material for update
        material.needsUpdate = true;
      }
    });
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