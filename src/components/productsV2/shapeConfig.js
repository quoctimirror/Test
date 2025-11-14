// Shape configurations mapping
// Each shape has its own model ID, metal, and band configuration

export const SHAPE_CONFIGS = {
  Flower: {
    shape: 'Flower',
    modelId: 'HB3RidmJSdezIO1T2hdXcQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Fiston: {
    shape: 'Fiston',
    modelId: 'AheAiyfpTTyK9P2N-TAJ1A',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Myfav: {
    shape: 'Myfav',
    modelId: 'bTfEBf0fSHaflMHTd4scxw',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Oval: {
    shape: 'Oval',
    modelId: 'LvYj0l_IQeehkfX0ce4Zgw',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Trilogy: {
    shape: 'Trilogy',
    modelId: 'Kdof7H4YT9uh4NsSUfdd5Q',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Heart: {
    shape: 'Heart',
    modelId: 'Omh82cayR9iO1uIBLaDFGQ',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Pear: {
    shape: 'Pear',
    modelId: 'Szx6zKIcRNqn4YPzHVxa1Q',
    metal: 'Silver',
    band: 'Single band'
  },
  Twin: {
    shape: 'Twin',
    modelId: 'dY4BIhDDQNmCVTRrEpV2QQ',
    metal: 'Silver',
    band: 'Single band'
  },

  Example: {
    shape: 'Example',
    modelId: 'RUsrBi-vQey2vExitZOYig',
    metal: 'Gold 24k',
    band: 'Single band'
  },
};

// Get list of available shapes
export const AVAILABLE_SHAPES = Object.keys(SHAPE_CONFIGS);

// Get configuration for a specific shape
export const getShapeConfig = (shapeName) => {
  return SHAPE_CONFIGS[shapeName] || SHAPE_CONFIGS.Heart; // Default to Trilogy
};
