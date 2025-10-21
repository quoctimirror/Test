// Shape configurations mapping
// Each shape has its own model ID, metal, and band configuration

export const SHAPE_CONFIGS = {
  Round: {
    shape: 'Round',
    modelId: 'U1Jy-K8MR4-qUOC_YIWkWQ',
    metal: 'Platinum',
    band: 'Double band'
  },
  Pear: {
    shape: 'Pear',
    modelId: 'OPdq2RjLTsikXl71-YvsJg',
    metal: 'Silver',
    band: 'Single band'
  },
  Emerald: {
    shape: 'Emerald',
    modelId: 'cpHdSLPBRlOGSeRzDiA77Q',
    metal: 'Rose Gold',
    band: 'Single band'
  },
  Fiston: {
    shape: 'Fiston',
    modelId: 'MFGQrBe1RpiawHlEpH3fJQ',
    metal: 'Gold 24k',
    band: 'Single band'
  }
};

// Get list of available shapes
export const AVAILABLE_SHAPES = Object.keys(SHAPE_CONFIGS);

// Get configuration for a specific shape
export const getShapeConfig = (shapeName) => {
  return SHAPE_CONFIGS[shapeName] || SHAPE_CONFIGS.Pear; // Default to Pear
};
