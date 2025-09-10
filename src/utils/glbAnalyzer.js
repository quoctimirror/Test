// GLB Analyzer Utility
// Trích xuất và phân tích thông tin từ file GLB

export class GLBAnalyzer {
  constructor() {
    this.meshData = [];
    this.materialData = [];
    this.sceneGraph = {};
  }

  // Phân tích toàn bộ GLB model
  analyzeGLB(gltfScene, modelName = 'Unknown') {
    if (!gltfScene) {
      console.error('❌ No GLTF scene provided');
      return null;
    }

    console.log(`🔍 Analyzing GLB: ${modelName}`);
    
    // Reset data
    this.meshData = [];
    this.materialData = [];
    this.sceneGraph = {};

    // Analyze scene hierarchy
    this.analyzeSceneHierarchy(gltfScene, '', 0);
    
    // Analyze meshes
    this.analyzeMeshes(gltfScene);
    
    // Analyze materials
    this.analyzeMaterials(gltfScene);

    const analysis = {
      modelName,
      totalVertices: this.getTotalVertices(),
      totalTriangles: this.getTotalTriangles(),
      meshCount: this.meshData.length,
      materialCount: this.materialData.length,
      sceneGraph: this.sceneGraph,
      meshes: this.meshData,
      materials: this.materialData,
      suggestions: this.generateSuggestions()
    };

    this.printAnalysis(analysis);
    return analysis;
  }

  // Phân tích hierarchy của scene
  analyzeSceneHierarchy(object, parentPath = '', depth = 0) {
    const indent = '  '.repeat(depth);
    const objectName = object.name || `Unnamed_${object.type || 'Object'}`;
    const currentPath = parentPath ? `${parentPath}/${objectName}` : objectName;
    
    const nodeInfo = {
      name: objectName,
      type: object.type,
      position: object.position ? object.position.toArray() : [0, 0, 0],
      rotation: object.rotation ? [object.rotation.x, object.rotation.y, object.rotation.z] : [0, 0, 0],
      scale: object.scale ? object.scale.toArray() : [1, 1, 1],
      isMesh: object.isMesh || false,
      children: []
    };

    console.log(`${indent}📁 ${objectName} (${object.type || 'Object'})`);
    
    if (object.isMesh) {
      console.log(`${indent}  └─ 📐 Mesh: ${object.geometry?.attributes.position.count || 0} vertices`);
    }

    // Recursively analyze children
    if (object.children && object.children.length > 0) {
      object.children.forEach(child => {
        const childInfo = this.analyzeSceneHierarchy(child, currentPath, depth + 1);
        nodeInfo.children.push(childInfo);
      });
    }

    if (depth === 0) {
      this.sceneGraph = nodeInfo;
    }

    return nodeInfo;
  }

  // Phân tích tất cả meshes
  analyzeMeshes(gltfScene) {
    let meshIndex = 0;
    
    gltfScene.traverse((object) => {
      if (object.isMesh && object.geometry) {
        const meshInfo = this.analyzeSingleMesh(object, meshIndex);
        this.meshData.push(meshInfo);
        meshIndex++;
      }
    });
  }

  // Phân tích một mesh cụ thể
  analyzeSingleMesh(mesh, index) {
    const geometry = mesh.geometry;
    const material = mesh.material;
    
    const meshInfo = {
      index,
      name: mesh.name || `Mesh_${index}`,
      vertices: geometry.attributes.position?.count || 0,
      triangles: geometry.index ? geometry.index.count / 3 : (geometry.attributes.position?.count || 0) / 3,
      hasNormals: !!geometry.attributes.normal,
      hasUV: !!geometry.attributes.uv,
      hasVertexColors: !!geometry.attributes.color,
      materialName: material?.name || 'No Material',
      materialType: material?.type || 'Unknown',
      boundingBox: this.calculateBoundingBox(geometry),
      
      // Mesh classification
      classification: this.classifyMesh(mesh.name, material?.name),
      
      // Performance metrics
      complexity: this.calculateComplexity(geometry),
      
      // Optimization suggestions
      canOptimize: this.canOptimize(geometry)
    };

    return meshInfo;
  }

  // Phân tích materials
  analyzeMaterials(gltfScene) {
    const materialsMap = new Map();
    
    gltfScene.traverse((object) => {
      if (object.isMesh && object.material) {
        const material = object.material;
        const materialId = material.uuid;
        
        if (!materialsMap.has(materialId)) {
          const materialInfo = {
            name: material.name || 'Unnamed Material',
            type: material.type,
            uuid: materialId,
            usedByMeshes: [],
            properties: this.extractMaterialProperties(material),
            
            // Material classification
            classification: this.classifyMaterial(material.name, material.type),
            
            // Optimization potential
            canEnhance: this.canEnhanceMaterial(material)
          };
          
          materialsMap.set(materialId, materialInfo);
        }
        
        materialsMap.get(materialId).usedByMeshes.push(object.name || 'Unnamed Mesh');
      }
    });

    this.materialData = Array.from(materialsMap.values());
  }

  // Classify mesh dựa trên tên
  classifyMesh(meshName, materialName) {
    const name = (meshName + ' ' + materialName).toLowerCase();
    
    if (name.includes('gem') || name.includes('round') || name.includes('diamond') || name.includes('stone')) {
      return 'diamond';
    }
    if (name.includes('layer') || name.includes('object') || name.includes('band') || name.includes('ring')) {
      return 'gold_band';
    }
    if (name.includes('prong') || name.includes('setting')) {
      return 'setting';
    }
    
    return 'unknown';
  }

  // Classify material
  classifyMaterial(materialName, materialType) {
    const name = (materialName || '').toLowerCase();
    
    if (name.includes('diamond') || name.includes('gem') || name.includes('crystal')) {
      return 'diamond_material';
    }
    if (name.includes('gold') || name.includes('metal') || name.includes('band')) {
      return 'gold_material';
    }
    
    return materialType === 'MeshStandardMaterial' ? 'standard' : 'unknown';
  }

  // Tính bounding box
  calculateBoundingBox(geometry) {
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    
    if (geometry.boundingBox) {
      const box = geometry.boundingBox;
      return {
        min: box.min.toArray(),
        max: box.max.toArray(),
        size: box.getSize(new window.THREE.Vector3()).toArray()
      };
    }
    
    return null;
  }

  // Tính độ phức tạp
  calculateComplexity(geometry) {
    const vertices = geometry.attributes.position?.count || 0;
    
    if (vertices < 100) return 'low';
    if (vertices < 1000) return 'medium';
    if (vertices < 5000) return 'high';
    return 'very_high';
  }

  // Extract material properties - COMPLETE extraction
  extractMaterialProperties(material) {
    const props = {
      // Basic properties
      name: material.name || 'Unnamed',
      type: material.type,
      uuid: material.uuid,
      
      // Color properties
      color: material.color ? {
        hex: `#${material.color.getHexString()}`,
        rgb: [material.color.r, material.color.g, material.color.b]
      } : null,
      
      // PBR properties
      metalness: material.metalness ?? null,
      roughness: material.roughness ?? null,
      
      // Transparency
      transparent: material.transparent || false,
      opacity: material.opacity ?? 1,
      alphaTest: material.alphaTest ?? 0,
      
      // Maps/Textures
      maps: {
        map: material.map ? this.extractTextureInfo(material.map) : null,
        normalMap: material.normalMap ? this.extractTextureInfo(material.normalMap) : null,
        roughnessMap: material.roughnessMap ? this.extractTextureInfo(material.roughnessMap) : null,
        metalnessMap: material.metalnessMap ? this.extractTextureInfo(material.metalnessMap) : null,
        aoMap: material.aoMap ? this.extractTextureInfo(material.aoMap) : null,
        emissiveMap: material.emissiveMap ? this.extractTextureInfo(material.emissiveMap) : null
      },
      
      // Emissive
      emissive: material.emissive ? {
        hex: `#${material.emissive.getHexString()}`,
        rgb: [material.emissive.r, material.emissive.g, material.emissive.b]
      } : null,
      emissiveIntensity: material.emissiveIntensity ?? null,
      
      // Side rendering
      side: material.side === 0 ? 'FrontSide' : 
            material.side === 1 ? 'BackSide' : 
            material.side === 2 ? 'DoubleSide' : 'Unknown',
      
      // Depth
      depthTest: material.depthTest ?? null,
      depthWrite: material.depthWrite ?? null
    };

    // MeshPhysicalMaterial specific
    if (material.type === 'MeshPhysicalMaterial') {
      props.physicalProperties = {
        clearcoat: material.clearcoat ?? null,
        clearcoatRoughness: material.clearcoatRoughness ?? null,
        transmission: material.transmission ?? null,
        thickness: material.thickness ?? null,
        ior: material.ior ?? null,
        reflectivity: material.reflectivity ?? null,
        sheen: material.sheen ?? null,
        sheenRoughness: material.sheenRoughness ?? null,
        sheenColor: material.sheenColor ? {
          hex: `#${material.sheenColor.getHexString()}`,
          rgb: [material.sheenColor.r, material.sheenColor.g, material.sheenColor.b]
        } : null
      };
    }

    // MeshStandardMaterial specific
    if (material.type === 'MeshStandardMaterial') {
      props.standardProperties = {
        envMapIntensity: material.envMapIntensity ?? null,
        refractionRatio: material.refractionRatio ?? null
      };
    }

    // MeshBasicMaterial specific  
    if (material.type === 'MeshBasicMaterial') {
      props.basicProperties = {
        wireframe: material.wireframe || false,
        wireframeLinewidth: material.wireframeLinewidth ?? null
      };
    }

    return props;
  }

  // Extract texture information
  extractTextureInfo(texture) {
    if (!texture) return null;
    
    return {
      uuid: texture.uuid,
      name: texture.name || 'Unnamed Texture',
      image: texture.image ? {
        width: texture.image.width,
        height: texture.image.height,
        src: texture.image.src || 'Data URL'
      } : null,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
      repeat: texture.repeat ? [texture.repeat.x, texture.repeat.y] : null,
      offset: texture.offset ? [texture.offset.x, texture.offset.y] : null,
      rotation: texture.rotation ?? null,
      flipY: texture.flipY ?? null
    };
  }

  // Check if mesh can be optimized
  canOptimize(geometry) {
    const vertices = geometry.attributes.position?.count || 0;
    return vertices > 1000; // High vertex count suggests optimization potential
  }

  // Check if material can be enhanced
  canEnhanceMaterial(material) {
    return material.type === 'MeshStandardMaterial' || 
           material.type === 'MeshBasicMaterial';
  }

  // Calculate total vertices
  getTotalVertices() {
    return this.meshData.reduce((total, mesh) => total + mesh.vertices, 0);
  }

  // Calculate total triangles
  getTotalTriangles() {
    return this.meshData.reduce((total, mesh) => total + mesh.triangles, 0);
  }

  // Generate optimization suggestions
  generateSuggestions() {
    const suggestions = [];
    
    // Mesh suggestions
    const highComplexityMeshes = this.meshData.filter(m => m.complexity === 'high' || m.complexity === 'very_high');
    if (highComplexityMeshes.length > 0) {
      suggestions.push({
        type: 'performance',
        message: `${highComplexityMeshes.length} high-complexity meshes found. Consider LOD or decimation.`
      });
    }

    // Material suggestions
    const enhanceableMaterials = this.materialData.filter(m => m.canEnhance);
    if (enhanceableMaterials.length > 0) {
      suggestions.push({
        type: 'visual',
        message: `${enhanceableMaterials.length} materials can be enhanced with PBR properties.`
      });
    }

    // Diamond-specific suggestions
    const diamondMeshes = this.meshData.filter(m => m.classification === 'diamond');
    if (diamondMeshes.length > 0) {
      suggestions.push({
        type: 'enhancement',
        message: `Found ${diamondMeshes.length} diamond mesh(es). Apply crystal/glass materials.`
      });
    }

    // Gold-specific suggestions  
    const goldMeshes = this.meshData.filter(m => m.classification === 'gold_band');
    if (goldMeshes.length > 0) {
      suggestions.push({
        type: 'enhancement',
        message: `Found ${goldMeshes.length} gold band mesh(es). Apply metallic materials.`
      });
    }

    return suggestions;
  }

  // Print detailed analysis
  printAnalysis(analysis) {
    console.log('\n📊 ===== GLB ANALYSIS REPORT =====');
    console.log(`📁 Model: ${analysis.modelName}`);
    console.log(`🔢 Total Vertices: ${analysis.totalVertices.toLocaleString()}`);
    console.log(`🔺 Total Triangles: ${analysis.totalTriangles.toLocaleString()}`);
    console.log(`📐 Mesh Count: ${analysis.meshCount}`);
    console.log(`🎨 Material Count: ${analysis.materialCount}`);

    console.log('\n📐 MESH BREAKDOWN:');
    analysis.meshes.forEach((mesh, index) => {
      console.log(`  ${index + 1}. ${mesh.name}`);
      console.log(`     └─ Vertices: ${mesh.vertices}, Triangles: ${Math.floor(mesh.triangles)}`);
      console.log(`     └─ Classification: ${mesh.classification}`);
      console.log(`     └─ Complexity: ${mesh.complexity}`);
    });

    console.log('\n🎨 MATERIAL BREAKDOWN:');
    analysis.materials.forEach((material, index) => {
      console.log(`  ${index + 1}. ${material.name} (${material.type})`);
      console.log(`     └─ Classification: ${material.classification}`);
      console.log(`     └─ Used by: ${material.usedByMeshes.join(', ')}`);
    });

    if (analysis.suggestions.length > 0) {
      console.log('\n💡 SUGGESTIONS:');
      analysis.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. [${suggestion.type.toUpperCase()}] ${suggestion.message}`);
      });
    }

    console.log('\n================================\n');
  }

  // Export analysis to JSON
  exportAnalysis(analysis) {
    return JSON.stringify(analysis, null, 2);
  }

  // Generate THREE.js material recreation code
  generateMaterialCode(analysis) {
    let code = '// Generated Material Recreation Code\n\n';
    
    analysis.materials.forEach((mat, index) => {
      const props = mat.properties;
      code += `// Material ${index + 1}: ${props.name}\n`;
      code += `const material${index + 1} = new THREE.${props.type}({\n`;
      
      // Add properties
      if (props.color) {
        code += `  color: 0x${props.color.hex.replace('#', '')},\n`;
      }
      
      if (props.metalness !== null && props.metalness !== undefined) {
        code += `  metalness: ${props.metalness},\n`;
      }
      
      if (props.roughness !== null && props.roughness !== undefined) {
        code += `  roughness: ${props.roughness},\n`;
      }
      
      if (props.transparent) {
        code += `  transparent: true,\n`;
      }
      
      if (props.opacity !== null && props.opacity !== 1) {
        code += `  opacity: ${props.opacity},\n`;
      }
      
      if (props.emissive && (props.emissive.rgb[0] > 0 || props.emissive.rgb[1] > 0 || props.emissive.rgb[2] > 0)) {
        code += `  emissive: 0x${props.emissive.hex.replace('#', '')},\n`;
      }
      
      if (props.emissiveIntensity !== null && props.emissiveIntensity > 0) {
        code += `  emissiveIntensity: ${props.emissiveIntensity},\n`;
      }
      
      // Physical properties
      if (props.physicalProperties) {
        const phys = props.physicalProperties;
        if (phys.clearcoat !== null && phys.clearcoat > 0) {
          code += `  clearcoat: ${phys.clearcoat},\n`;
        }
        if (phys.clearcoatRoughness !== null) {
          code += `  clearcoatRoughness: ${phys.clearcoatRoughness},\n`;
        }
        if (phys.transmission !== null && phys.transmission > 0) {
          code += `  transmission: ${phys.transmission},\n`;
        }
        if (phys.ior !== null && phys.ior !== 1.5) {
          code += `  ior: ${phys.ior},\n`;
        }
        if (phys.reflectivity !== null && phys.reflectivity !== 0.5) {
          code += `  reflectivity: ${phys.reflectivity},\n`;
        }
      }
      
      // Standard properties
      if (props.standardProperties) {
        const std = props.standardProperties;
        if (std.envMapIntensity !== null && std.envMapIntensity !== 1) {
          code += `  envMapIntensity: ${std.envMapIntensity},\n`;
        }
      }
      
      code += '});\n\n';
    });
    
    return code;
  }

  // Get original materials for preservation
  getOriginalMaterials(analysis) {
    const originalMaterials = {};
    
    analysis.materials.forEach((mat, index) => {
      originalMaterials[mat.properties.name] = mat.properties;
    });
    
    return originalMaterials;
  }
}

// Export singleton
export const glbAnalyzer = new GLBAnalyzer();