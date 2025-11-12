// Shape configurations mapping
// Each shape has its own model ID, metal, and band configuration

export const SHAPE_CONFIGS = {
  // Round: {
  //   shape: 'Round',
  //   modelId: 'U1Jy-K8MR4-qUOC_YIWkWQ',
  //   metal: 'Platinum',
  //   band: 'Double band'
  // },
  // Pear: {
  //   shape: 'Pear',
  //   modelId: 'OPdq2RjLTsikXl71-YvsJg',
  //   metal: 'Silver',
  //   band: 'Single band'
  // },
  // Emerald: {
  //   shape: 'Emerald',
  //   modelId: 'cpHdSLPBRlOGSeRzDiA77Q',
  //   metal: 'Rose Gold',
  //   band: 'Single band'
  // },
  // Fiston: {
  //   shape: 'Fiston',
  //   modelId: 'eOcY7UV6TMWbra25hv9dwQ',
  //   metal: 'Gold 24k',
  //   band: 'Single band'
  // },
  // pear con loi
  // Pear: {
  //   shape: 'Pear-new',
  //   modelId: 'AyjFZ7scSKWL2myrRhXeYg',
  //   metal: 'Silver',
  //   band: 'Single band'
  // },
  Flower: {
    shape: 'Flower',
    modelId: 'HB3RidmJSdezIO1T2hdXcQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Fiston: {
    shape: 'Fiston-new',
    modelId: 'AheAiyfpTTyK9P2N-TAJ1A',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Myfav: {
    shape: 'Myfav',
    modelId: 'ao5z2CTsTtKaKswPYhGoGw',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Oval: {
    shape: 'Oval',
    modelId: 'BVCcaUMSTFKhP8qZ-ztWLQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Trilogy: {
    shape: 'Trilogy',
    modelId: 'DIfwfXYbQgOYRGjaoL0k6g',
    metal: 'Gold 24k',
    band: 'Single band'
  },
};

// Get list of available shapes
export const AVAILABLE_SHAPES = Object.keys(SHAPE_CONFIGS);

// Get configuration for a specific shape
export const getShapeConfig = (shapeName) => {
  return SHAPE_CONFIGS[shapeName] || SHAPE_CONFIGS.Trilogy; // Default to Trilogy
};
