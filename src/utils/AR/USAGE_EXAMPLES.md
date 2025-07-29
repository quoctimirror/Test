# View360 System Usage Examples

## Basic Usage (Default Configuration)

```javascript
import { createViewer } from "@utils/AR/Three";

// Creates viewer with default settings
const viewer = createViewer(containerElement);
viewer.init();
```

## Custom Configuration Examples

### 1. Different Model and Scale
```javascript
const viewer = createViewer(containerElement, {
  modelPath: "/view360/premium-ring.glb",
  modelScale: 3.5,
  cameraPosition: { x: 0, y: 6, z: 15 }
});
```

### 2. Adjusted Post-Processing Effects
```javascript
const viewer = createViewer(containerElement, {
  bloomStrength: 0.4,
  bloomRadius: 0.12,
  bloomThreshold: 0.8
});
```

### 3. Different Mirror Setup
```javascript
const viewer = createViewer(containerElement, {
  mirrorColor: 0xcccccc,
  mirrorPosition: { y: -3, z: 1.5 }
});
```

### 4. Complete Custom Configuration
```javascript
const viewer = createViewer(containerElement, {
  // Model settings
  modelPath: "/view360/luxury-ring.glb",
  modelScale: 4.0,
  modelPosition: { x: 0, y: 0.5, z: 0 },
  initialYRotation: Math.PI / 2,
  
  // Camera settings
  cameraPosition: { x: 2, y: 8, z: 18 },
  cameraFov: 75,
  
  // Visual effects
  bloomStrength: 0.3,
  bloomRadius: 0.1,
  bloomThreshold: 0.85,
  
  // Mirror customization
  mirrorColor: 0xf0f0f0,
  mirrorPosition: { y: -2, z: 3 }
});
```

## Material Change Usage

### New Unified Handler (Recommended)
```javascript
// Single function handles all material types
handleMaterialChange('gold');
handleMaterialChange('silver');
handleMaterialChange('platinum');
handleMaterialChange('rose-gold');
handleMaterialChange('reset');
```

### Original Functions (Still Supported)
```javascript
// Backward compatibility maintained
handleGoldMaterial();
handleSilverMaterial();
handlePlatinumMaterial();
handleRoseGoldMaterial();
handleResetMaterials();
```

## Benefits of Refactored System

1. **Easy Customization**: Change any aspect without modifying core code
2. **Better Maintainability**: Single configuration object vs scattered hardcoded values
3. **Extensibility**: Easy to add new configuration options
4. **Backward Compatibility**: All existing code continues to work
5. **Type Safety**: Configuration can be typed for better IDE support

## Configuration Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `modelPath` | string | "/view360/ring.glb" | Path to 3D model file |
| `modelScale` | number | 2.5 | Scale factor for the model |
| `modelPosition` | object | {x:0, y:0, z:0} | Model position |
| `initialYRotation` | number | Math.PI | Initial rotation angle |
| `cameraPosition` | object | {x:0, y:5.3, z:10.5} | Camera position |
| `cameraFov` | number | 65 | Camera field of view |
| `bloomStrength` | number | 0.2 | Post-processing bloom intensity |
| `bloomRadius` | number | 0.08 | Post-processing bloom radius |
| `bloomThreshold` | number | 0.9 | Post-processing bloom threshold |
| `mirrorColor` | number | 0xe6e6e6 | Mirror surface color |
| `mirrorPosition` | object | {y:-2.5, z:2} | Mirror position |