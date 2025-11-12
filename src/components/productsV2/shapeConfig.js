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
    modelId: 'eOcY7UV6TMWbra25hv9dwQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Flower: {
    shape: 'Flower',
    modelId: 'HB3RidmJSdezIO1T2hdXcQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Pear1: {
    shape: 'Pear1',
    modelId: 'BVCcaUMSTFKhP8qZ-ztWLQ',
    metal: 'Silver',
    band: 'Single band'
  },
};

// Get list of available shapes
export const AVAILABLE_SHAPES = Object.keys(SHAPE_CONFIGS);

// Get configuration for a specific shape
export const getShapeConfig = (shapeName) => {
  return SHAPE_CONFIGS[shapeName] || SHAPE_CONFIGS.Pear1; // Default to Fiston
};
