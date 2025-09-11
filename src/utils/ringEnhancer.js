// Ring Enhancement Utility
// Tối ưu hiệu suất và thẩm mỹ cho nhẫn kim cương

export class RingEnhancer {
  constructor() {
    this.diamondMaterial = null;
    this.emeraldMaterial = null;
    this.goldMaterial = null;
    this.animationMixer = null;
    this.diamondMeshes = [];
    this.emeraldMeshes = [];
    this.sparkleTime = 0;
  }

  // Tạo material kim cương trắng trong suốt đơn giản
  createDiamondMaterial() {
    if (!window.THREE) return null;

    // Kim cương trắng đơn giản, trong suốt, lấp lánh
    this.diamondMaterial = new window.THREE.MeshPhysicalMaterial({
      // Kim cương trắng trong suốt
      color: 0xFFFFFF,            // Trắng tinh khiết
      
      // Không phải kim loại
      metalness: 0.0,             
      roughness: 0.0,             // Hoàn toàn mịn
      
      // Trong suốt như kim cương thật
      transmission: 0.9,          // Rất trong suốt
      thickness: 0.5,             // Mỏng để không bị tối
      
      // Bóng loáng
      clearcoat: 1.0,             
      clearcoatRoughness: 0.0,    
      
      // IOR kim cương
      ior: 2.4,                   
      reflectivity: 0.9,          
      
      // Phản chiếu môi trường
      envMapIntensity: 8.0,       
      
      // Không có emissive - tự nhiên
      emissive: new window.THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      
      // Trong suốt
      transparent: true,
      opacity: 0.3,               // Trong suốt nhưng thấy được
      
      // Render cả 2 mặt
      side: window.THREE.DoubleSide,
      
      // Hiệu ứng lấp lánh đơn giản
      sheen: 0.5,
      sheenRoughness: 0.0,
      sheenColor: new window.THREE.Color(0xFFFFFF),
      
      // Rainbow effect nhẹ
      iridescence: 0.3,           
      iridescenceIOR: 1.3,        
      iridescenceThicknessRange: [100, 300], 
      
      fog: true
    });

    return this.diamondMaterial;
  }

  // Tạo material emerald đặc ruột với màu ruby đỏ
  createEmeraldMaterial() {
    if (!window.THREE) return null;

    // Emerald material đặc ruột với màu ruby đỏ đậm
    this.emeraldMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu ruby đỏ đậm đà
      color: 0xCC1122,            // Ruby đỏ đậm
      
      // Không phải kim loại - ruby là dielectric
      metalness: 0.0,             
      roughness: 0.08,            // Hơi rough để có màu đậm
      
      // Giảm transmission để đặc ruột hơn
      transmission: 0.1,          // Rất ít transmission - gần như đặc
      thickness: 2.0,             
      
      // Lớp phủ cho độ bóng ruby
      clearcoat: 1.0,             
      clearcoatRoughness: 0.05,   
      
      // Ruby properties
      ior: 1.76,                  // IOR của ruby thật
      reflectivity: 0.8,          
      
      // Environment reflection
      envMapIntensity: 8.0,       // Vừa phải cho ruby đặc
      
      // Emissive cho inner glow đỏ
      emissive: new window.THREE.Color(0x440011), // Đỏ đậm phát sáng
      emissiveIntensity: 0.4,     // Tăng độ sáng để thấy ruột
      
      // Opacity cao để đặc ruột
      transparent: true,
      opacity: 0.9,               // Gần như đặc hoàn toàn
      
      // Render both sides
      side: window.THREE.DoubleSide,
      
      // Ruby dispersion effect
      attenuationDistance: 0.2,   // Ngắn để màu đậm
      attenuationColor: new window.THREE.Color(0.8, 0.1, 0.2),  // Tint đỏ đậm
      
      // Sheen effect cho ruby
      sheen: 0.8,
      sheenRoughness: 0.1,
      sheenColor: new window.THREE.Color(0xAA4444),
      
      // Giảm iridescence cho ruby tự nhiên hơn
      iridescence: 0.3,           // Ít iridescence hơn ruby chính
      iridescenceIOR: 1.3,        
      iridescenceThicknessRange: [100, 400],  // Range nhỏ hơn
      
      // Enable fog
      fog: true
    });

    return this.emeraldMaterial;
  }

  // VR Materials - Kim cương trắng VR optimized
  createVRDiamondMaterial() {
    if (!window.THREE) return null;
    
    // Kim cương trắng VR optimized - đơn giản và mượt
    return new window.THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,        // Trắng tinh khiết
      metalness: 0.0,
      roughness: 0.02,        // Hơi rough cho VR
      
      // Transmission vừa phải cho VR
      transmission: 0.6,      // Giảm từ 0.9 cho performance
      thickness: 0.3,         // Mỏng cho VR
      
      clearcoat: 0.8,         // Giảm từ 1.0
      clearcoatRoughness: 0.02,
      
      ior: 2.4,              // Giữ IOR kim cương
      reflectivity: 0.7,      // Giảm cho VR
      
      envMapIntensity: 6.0,   // Giảm cho VR
      
      emissive: new window.THREE.Color(0x000000), // Không emissive
      emissiveIntensity: 0.0,
      
      transparent: true,
      opacity: 0.5,          // Tăng opacity cho VR
      
      iridescence: 0.2,       // Giảm rainbow cho VR
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [100, 200],
      
      sheen: 0.3,
      sheenRoughness: 0.0,
      sheenColor: new window.THREE.Color(0xFFFFFF),
      
      fog: true
    });
  }

  createVREmeraldMaterial() {
    if (!window.THREE) return null;
    
    return new window.THREE.MeshPhysicalMaterial({
      color: 0xCC1122,
      metalness: 0.0,
      roughness: 0.1,
      
      transmission: 0.05,  // Giảm từ 0.1
      thickness: 1.5,      // Giảm từ 2.0
      
      clearcoat: 0.8,      // Giảm từ 1.0
      clearcoatRoughness: 0.08,
      
      ior: 1.76,
      reflectivity: 0.6,   // Giảm từ 0.8
      
      envMapIntensity: 6.0, // Giảm từ 8.0
      
      emissive: new window.THREE.Color(0x440011),
      emissiveIntensity: 0.3,
      
      transparent: true,
      opacity: 0.92,      // Tăng từ 0.9
      
      side: window.THREE.DoubleSide,
      
      attenuationDistance: 0.25,
      attenuationColor: new window.THREE.Color(0.8, 0.1, 0.2),
      
      iridescence: 0.2,    // Giảm từ 0.3
      iridescenceIOR: 1.25,
      iridescenceThicknessRange: [150, 300],
      
      fog: true
    });
  }

  createVRGoldMaterial() {
    if (!window.THREE) return null;
    
    // Vàng 18k VR optimized nhưng vẫn ấm áp sang trọng
    return new window.THREE.MeshPhysicalMaterial({
      color: 0xFFD700,     // Giữ màu vàng 18k chân thực
      metalness: 1.0,
      roughness: 0.04,     // Tăng một chút cho VR
      
      clearcoat: 0.9,      // Giảm từ 1.0
      clearcoatRoughness: 0.03,
      
      reflectivity: 0.9,   // Giảm từ 0.98
      envMapIntensity: 6.0, // Giảm từ 8.0
      
      emissive: new window.THREE.Color(0x332200), // Giữ warm emissive
      emissiveIntensity: 0.06, // Giảm từ 0.08
      
      transparent: false,
      side: window.THREE.FrontSide,
      depthWrite: true,
      
      sheen: 0.7,          // Giảm từ 0.9
      sheenRoughness: 0.03,
      sheenColor: new window.THREE.Color(0xFFE55C), // Giữ bright gold sheen
      
      ior: 0.47,           // Giữ IOR chính xác của vàng
      
      fog: true
    });
  }

  // Tạo material vàng ấm áp sang trọng chân thực
  createGoldMaterial() {
    if (!window.THREE) return null;

    // Vàng 18k chân thực với màu ấm áp sang trọng
    this.goldMaterial = new window.THREE.MeshPhysicalMaterial({
      // Màu vàng 18k ấm áp chân thực - Yellow Gold 18k
      color: 0xFFD700,        // Classic 18k gold color
      
      // Kim loại properties hoàn hảo
      metalness: 1.0,         // 100% metallic
      roughness: 0.03,        // Slight roughness cho realistic look
      
      // Clearcoat cho độ bóng jewelry premium 
      clearcoat: 1.0,         // Perfect clear coating
      clearcoatRoughness: 0.02, // Very smooth with slight texture
      
      // Reflection properties cho luxury feel
      reflectivity: 0.98,     // High reflectivity như vàng thật
      envMapIntensity: 8.0,   // Strong environment reflection
      
      // Warm glow tự nhiên của vàng
      emissive: new window.THREE.Color(0x332200), // Warm golden emissive
      emissiveIntensity: 0.08, // Subtle inner warmth
      
      // Solid gold properties
      transparent: false,
      side: window.THREE.FrontSide,
      depthWrite: true,
      
      // Sheen cho premium jewelry finish
      sheen: 0.9,             // High sheen
      sheenRoughness: 0.02,   // Very smooth sheen
      sheenColor: new window.THREE.Color(0xFFE55C), // Bright gold sheen
      
      // IOR của vàng thật
      ior: 0.47,              // Gold's actual IOR (complex number, using real part)
      
      // Enable fog để có depth realism
      fog: true
    });

    return this.goldMaterial;
  }

  // Áp dụng materials cho nhẫn dựa trên tên mesh
  applyRingMaterials(gltfScene, environmentTexture = null) {
    if (!gltfScene || !window.THREE) return;

    // Detect VR mode để balance materials
    const isQuest = navigator.userAgent.includes('Quest');
    console.log('🥽 Quest Mode detected:', isQuest);

    // Tạo materials - VR optimized nhưng vẫn đẹp
    const diamondMat = isQuest ? this.createVRDiamondMaterial() : this.createDiamondMaterial();
    // const emeraldMat = isQuest ? this.createVREmeraldMaterial() : this.createEmeraldMaterial();
    const goldMat = isQuest ? this.createVRGoldMaterial() : this.createGoldMaterial();

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

        // Material mapping cho nhanAnhKhanhLam.glb
        // Sẽ được phân tích bởi GLB analyzer để xác định chính xác
        // Nhưng dùng pattern matching thông minh
        
        // Check for diamond/gem patterns
        if (this.isDiamond(meshName, materialName)) {
          // Apply diamond material cho các gem
          if (diamondMat) {
            child.material = diamondMat.clone();
            this.optimizeDiamondGeometry(child);
            // Lưu diamond meshes để animate
            this.diamondMeshes.push(child);
            
            console.log('💎 Applied WHITE DIAMOND material to:', child.name, '(Kim cương trắng trong suốt)');
            appliedDiamond = true;
          }
          
        // Check for gold/metal patterns  
        } else if (this.isGold(meshName, materialName)) {
          // Apply gold material cho band
          if (goldMat) {
            child.material = goldMat.clone();
            this.optimizeGoldGeometry(child);
            console.log('🥇 Applied 18K GOLD material to:', child.name, '(Vàng 18K ấm áp sang trọng)');
            appliedGold = true;
          }
        
        // Fallback cho các mesh không xác định được
        } else {
          // Try to guess based on geometry complexity và position
          const vertices = child.geometry?.attributes?.position?.count || 0;
          
          if (vertices < 500) {
            // Low poly likely = diamond
            if (diamondMat) {
              child.material = diamondMat.clone();
              this.optimizeDiamondGeometry(child);
              this.diamondMeshes.push(child);
              console.log('💎 Applied PINK RUBY (guessed) to:', child.name, '(Ruby hồng - đoán từ geometry)');
              appliedDiamond = true;
            }
          } else {
            // High poly likely = gold band
            if (goldMat) {
              child.material = goldMat.clone();
              this.optimizeGoldGeometry(child);
              console.log('🥇 Applied 18K GOLD (guessed) to:', child.name, '(Vàng - đoán từ geometry)');
              appliedGold = true;
            }
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

  // Update animation cho kim cương và emerald lấp lánh
  updateAnimation(camera, deltaTime = 0.016) {
    this.sparkleTime += deltaTime;
    
    // Detect VR mode
    const isQuest = navigator.userAgent.includes('Quest');
    
    // Animate diamond sparkle 
    this.diamondMeshes.forEach((diamondMesh, index) => {
      if (diamondMesh && diamondMesh.material) {
        const material = diamondMesh.material;
        
        // VR: Giảm complexity, Desktop: Full effects
        if (isQuest) {
          // VR - simplified animation
          const sparkle = Math.sin(this.sparkleTime * 2.0 + index * 1.0) * 0.3 + 0.7;
          
          material.envMapIntensity = 8.0 + sparkle * 4.0;
          material.emissiveIntensity = 0.2 + sparkle * 0.1;
          
          if (material.iridescence !== undefined) {
            material.iridescence = 0.5 + sparkle * 0.2;
          }
        } else {
          // Desktop - full animation cho kim cương trắng
          const sparkle1 = Math.sin(this.sparkleTime * 3.0 + index * 1.2) * 0.3;
          const sparkle2 = Math.sin(this.sparkleTime * 6.0 + index * 0.8) * 0.25;
          const sparkle3 = Math.sin(this.sparkleTime * 9.0 + index * 1.8) * 0.2;
          const sparkle4 = Math.sin(this.sparkleTime * 12.0 + index * 1.5) * 0.15;
          
          const sparkleIntensity = (sparkle1 + sparkle2 + sparkle3 + sparkle4) * 0.5 + 0.5;
          
          // Kim cương trắng animation - tập trung vào fire và brilliance
          material.envMapIntensity = 15.0 + sparkleIntensity * 8.0;  // Strong reflection
          
          if (material.iridescence !== undefined) {
            material.iridescence = 0.6 + sparkleIntensity * 0.2;     // Rainbow fire
          }
          if (material.sheen !== undefined) {
            material.sheen = 0.8 + sparkleIntensity * 0.15;          // Surface sparkle  
          }
          if (material.clearcoat !== undefined) {
            material.clearcoat = 1.0;                                // Always perfect
          }
          if (material.opacity !== undefined) {
            material.opacity = 0.15 + sparkleIntensity * 0.05;      // Breathing transparency
          }
          if (material.thickness !== undefined) {
            material.thickness = 2.0 + sparkleIntensity * 0.5;      // Subtle dispersion
          }
          // IOR remains constant cho kim cương - không thay đổi
        }
        
        material.needsUpdate = true;
      }
    });
    
    // Animate emerald với hiệu ứng nhẹ nhàng hơn
    this.emeraldMeshes.forEach((emeraldMesh, index) => {
      if (emeraldMesh && emeraldMesh.material) {
        const material = emeraldMesh.material;
        
        // VR và Desktop đều dùng animation nhẹ cho emerald
        const glow = Math.sin(this.sparkleTime * 1.5 + index * 0.8) * 0.15 + 0.85;
        
        if (isQuest) {
          material.envMapIntensity = 6.0 + glow * 2.0;
          material.emissiveIntensity = 0.3 + glow * 0.1;
        } else {
          material.envMapIntensity = 8.0 + glow * 4.0;
          material.emissiveIntensity = 0.4 + glow * 0.2;
          material.sheen = 0.8 + glow * 0.1;
        }
        
        material.needsUpdate = true;
      }
    });
  }

  // Cleanup resources
  dispose() {
    if (this.diamondMaterial) {
      this.diamondMaterial.dispose();
    }
    if (this.emeraldMaterial) {
      this.emeraldMaterial.dispose();
    }
    if (this.goldMaterial) {
      this.goldMaterial.dispose();
    }
  }
}

// Export singleton instance
export const ringEnhancer = new RingEnhancer();