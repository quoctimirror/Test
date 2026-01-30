// Ring Enhancement Utilities for 3D Model Beautification
import * as THREE from "three";

/**
 * Enhance and beautify 3D ring model
 *
 * Main features:
 * - Auto detect and classify metal and diamond parts
 * - Apply high quality physical materials for each type
 * - Optimize lighting and reflections for realistic appearance
 * - Remove unnecessary attributes that may affect display quality
 */
export class RingEnhancer {
  constructor(envMap = null) {
    this.envMap = envMap;
    this.enhancedMeshes = new Set(); // Track enhanced meshes
  }

  /**
   * Enhance diamond meshes in ring model
   * Only process detected diamond meshes, leave metal untouched
   * @param {THREE.Object3D} model - Ring model to enhance
   * @param {THREE.Texture} envMap - Environment map for reflections (optional)
   */
  enhanceRingModel(model, envMap = null) {
    if (!model) {
      console.warn("RingEnhancer: No model to enhance");
      return;
    }

    if (envMap) {
      this.envMap = envMap;
    }

    console.log("🔧 Starting diamond enhancement in ring...");

    model.traverse((child) => {
      if (child.isMesh) {
        // Only enhance diamond meshes, skip metal
        const materialType = this._detectMaterialType(child);
        if (materialType === "diamond") {
          this._enhanceDiamondMesh(child);
        }
      }
    });

    console.log(
      `✨ Completed enhancing ${this.enhancedMeshes.size} diamond meshes`
    );
  }

  /**
   * Enhance a specific diamond mesh
   * @private
   */
  _enhanceDiamondMesh(mesh) {
    // Prepare mesh for enhancement
    this._prepareMeshGeometry(mesh);

    // Apply diamond material
    this._applyDiamondMaterial(mesh);
    mesh.userData.isDiamond = true;
    mesh.userData.isMetal = false;

    // Optimize rendering
    this._optimizeMeshRendering(mesh);

    this.enhancedMeshes.add(mesh);

    console.log(`💎 Enhanced diamond: ${mesh.name || "mesh"}`);
  }

  /**
   * Prepare mesh geometry
   * @private
   */
  _prepareMeshGeometry(mesh) {
    // Remove vertex colors that may cause conflicts
    if (mesh.geometry.attributes.color) {
      mesh.geometry.deleteAttribute("color");
    }

    // Recalculate normals for accurate lighting
    mesh.geometry.computeVertexNormals();

    // Disable shadows for better performance with mirror effect
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  }

  /**
   * Detect material type based on name and properties
   * @private
   */
  _detectMaterialType(mesh) {
    const name = mesh.name ? mesh.name.toLowerCase() : "";
    const materialName =
      mesh.material && mesh.material.name
        ? mesh.material.name.toLowerCase()
        : "";

    // Check diamond keywords
    const diamondKeywords = [
      "diamond",
      "gem",
      "stone",
      "crystal",
      "brilliant",
      "round",
      "cut",
      "jewel",
      "precious",
    ];

    const isDiamondByName = diamondKeywords.some(
      (keyword) => name.includes(keyword) || materialName.includes(keyword)
    );

    // Check material properties (diamonds are usually transparent)
    const isDiamondByProperties =
      mesh.material &&
      (mesh.material.transparent ||
        mesh.material.opacity < 1.0 ||
        (mesh.material.color &&
          mesh.material.color.r > 0.8 &&
          mesh.material.color.g > 0.8 &&
          mesh.material.color.b > 0.8));

    return isDiamondByName || isDiamondByProperties ? "diamond" : "metal";
  }

  /**
   * Apply high quality diamond material with iridescence effect
   * Creates realistic diamond effect with dispersion and sparkle
   * @private
   */
  _applyDiamondMaterial(mesh) {
    console.log(
      `💎🔥 Applying FIRE diamond material for: ${mesh.name || "mesh"}`
    );

    mesh.material = new THREE.MeshPhysicalMaterial({
      // Pure white color
      color: 0xffffff,

      // Not metallic
      metalness: 0.0,

      // Low roughness for real diamond
      roughness: 0.0,

      // High transmission for transparency effect
      transmission: 1.0,
      transparent: true,
      opacity: 1.0,

      // Real diamond IOR
      ior: 2.417,

      // Thickness for light effects
      thickness: 1.5,

      // --- IRIDESCENCE DISPERSION EFFECT - Reduced glare ---
      iridescence: 0.4, // Reduced from 1.0 to 0.6 - moderate sparkle
      iridescenceIOR: 1.2, // Reduced from 1.8 to 1.5 - gentler
      iridescenceThicknessRange: [200, 300], // Smaller range for less glare

      // IMPORTANT: Use separate HDR environment instead of scene.environment
      envMap: this.envMap, // Separate HDR for diamond
      envMapIntensity: 1.3, // Increased to 1.3 for slightly brighter

      // Render both sides
      side: THREE.DoubleSide,

      // Ensure consistent rendering
      flatShading: false,
      vertexColors: false,
    });

    // Apply environment map if available
    if (this.envMap) {
      mesh.material.envMap = this.envMap;
    }

    mesh.material.needsUpdate = true;

    console.log(
      `💎 Applied opal diamond material for: ${mesh.name || "mesh"}`
    );
  }

  /**
   * Apply high quality metal material (rose gold default)
   * @private
   */
  _applyMetalMaterial(mesh, metalType = "rose-gold") {
    const metalConfigs = {
      "rose-gold": {
        color: 0xeecdae,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0,
      },
      gold: {
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.0,
      },
      silver: {
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2,
      },
      platinum: {
        color: 0xe5e4e2,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.1,
      },
    };

    const config = metalConfigs[metalType] || metalConfigs["rose-gold"];

    mesh.material = new THREE.MeshPhysicalMaterial({
      color: config.color,
      metalness: config.metalness,
      roughness: config.roughness,
      clearcoat: config.clearcoat,
      clearcoatRoughness: config.clearcoatRoughness,
      envMapIntensity: config.envMapIntensity,
    });

    // Apply environment map if available
    if (this.envMap) {
      mesh.material.envMap = this.envMap;
    }

    mesh.material.needsUpdate = true;

    console.log(`🥇 Applied ${metalType} material for: ${mesh.name || "mesh"}`);
  }

  /**
   * Optimize rendering for mesh
   * @private
   */
  _optimizeMeshRendering(mesh) {
    // Disable shadows for mirror effect compatibility
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    // Ensure mesh is rendered with appropriate priority
    mesh.renderOrder = mesh.userData.isDiamond ? 1 : 0;
  }

  /**
   * Note: RingEnhancer only processes diamonds
   * To change metal material, use other methods in ThreeJSViewer
   */
  setMetalMaterial(metalType = "rose-gold") {
    console.warn(
      "RingEnhancer only processes diamonds. Use ThreeJSViewer methods to change metal."
    );
  }

  /**
   * Apply standard diamond material (fully transparent)
   */
  setStandardDiamondMaterial() {
    this.enhancedMeshes.forEach((mesh) => {
      if (mesh.userData.isDiamond) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.0,
          transmission: 0.99,
          transparent: true,
          opacity: 0.98,
          reflectivity: 1.0,
          envMapIntensity: 2.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          ior: 2.42, // Diamond IOR
          thickness: 0.1,
          attenuationDistance: 0.1,
          attenuationColor: new THREE.Color(0xffffff),
          side: THREE.DoubleSide,
        });

        if (this.envMap) {
          mesh.material.envMap = this.envMap;
        }

        mesh.material.needsUpdate = true;
      }
    });

    console.log("💎 Applied standard diamond material");
  }

  /**
   * Force all potential diamond meshes to become diamonds
   */
  forceAllPotentialDiamondsUniform() {
    // Find all meshes that could be diamonds
    const potentialDiamonds = Array.from(this.enhancedMeshes).filter((mesh) => {
      const name = mesh.name ? mesh.name.toLowerCase() : "";
      const materialName =
        mesh.material && mesh.material.name
          ? mesh.material.name.toLowerCase()
          : "";

      return (
        name.includes("diamond") ||
        name.includes("gem") ||
        name.includes("stone") ||
        name.includes("crystal") ||
        materialName.includes("diamond") ||
        materialName.includes("gem") ||
        materialName.includes("crystal") ||
        name.includes("brilliant") ||
        name.includes("round") ||
        name.includes("cut") ||
        (mesh.material &&
          mesh.material.color &&
          mesh.material.color.r > 0.8 &&
          mesh.material.color.g > 0.8 &&
          mesh.material.color.b > 0.8) ||
        (mesh.material && mesh.material.transparent) ||
        (mesh.material && mesh.material.opacity < 1.0)
      );
    });

    // Apply uniform diamond material
    potentialDiamonds.forEach((mesh) => {
      mesh.userData.isDiamond = true;
      mesh.userData.isMetal = false;

      mesh.material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.98,
        transparent: true,
        opacity: 0.95,
        reflectivity: 1.0,
        envMapIntensity: 3.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        ior: 2.42,
        thickness: 0.3,
        attenuationDistance: 0.3,
        attenuationColor: new THREE.Color(0xffffff),
        side: THREE.DoubleSide,
      });

      if (this.envMap) {
        mesh.material.envMap = this.envMap;
      }

      mesh.material.needsUpdate = true;
    });

    console.log(
      `🔧 Forced ${potentialDiamonds.length} meshes to uniform diamond`
    );
  }

  /**
   * Reset to original diamond materials (opal/moonstone style)
   */
  resetToOriginalMaterials() {
    this.enhancedMeshes.forEach((mesh) => {
      if (mesh.userData.isDiamond) {
        this._applyDiamondMaterial(mesh);
      }
    });
    console.log("🔄 Reset diamonds to original materials");
  }

  /**
   * Get enhancement statistics
   */
  getEnhancementStats() {
    const stats = {
      total: this.enhancedMeshes.size,
      diamonds: 0,
      metals: 0,
    };

    this.enhancedMeshes.forEach((mesh) => {
      if (mesh.userData.isDiamond) {
        stats.diamonds++;
      } else if (mesh.userData.isMetal) {
        stats.metals++;
      }
    });

    return stats;
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.enhancedMeshes.clear();
    this.envMap = null;
    console.log("🧹 Cleaned up RingEnhancer");
  }
}

/**
 * Utility function to create and use RingEnhancer
 */
export const enhanceRingModel = (model, envMap = null) => {
  const enhancer = new RingEnhancer(envMap);
  enhancer.enhanceRingModel(model, envMap);
  return enhancer;
};

export default RingEnhancer;

// // Three.js loaded studio_small_03_4k.hdr in setupEnvironment() and passed to RingEnhancer via:

//   In loadModel() of Three.js
//   this.ringEnhancer = new RingEnhancer(this.envMap);
//   this.ringEnhancer.enhanceRingModel(this.model, this.envMap);

//   RingEnhancer just receives and uses the pre-prepared envMap
