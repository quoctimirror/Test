// Shape configurations mapping
// Each shape has its own model ID, metal, and band configuration

export const SHAPE_CONFIGS = {
  Fiston: {
    shape: 'Fiston',
    modelId: 'Cs9yFentQsiL9VOyTa8Rdw',
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
    modelId: 'Hprd00uZRoq8t0Ou1YlWMg',
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
    modelId: 'Qteju98xRgKe8y5KylzXIw',
    metal: 'Gold 24k',
    band: 'Single band'
  },
  Pear: {
    shape: 'Pear',
    modelId: 'MKyTIlEyRbi89oT6bH76yA',
    metal: 'Silver',
    band: 'Single band'
  },
  Twin: {
    shape: 'Twin',
    modelId: 'dY4BIhDDQNmCVTRrEpV2QQ',
    metal: 'Silver',
    band: 'Single band'
  },
  New: {
    shape: 'New',
    modelId: 'R4Yyjh0QQlmEtazcWf7IGA',
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
  return SHAPE_CONFIGS[shapeName] || SHAPE_CONFIGS.New;
};
