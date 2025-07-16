// Production configuration
export default {
  app: {
    name: 'Mirror Diamond Website',
    version: '1.0.0',
    environment: 'production',
    baseUrl: 'https://mirror-diamond.com'
  },
  api: {
    baseUrl: 'https://api.mirror-diamond.com/api',
    timeout: 20000
  },
  mediappe: {
    modelUrl: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
    wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
  },
  models: {
    ringModelPath: '/arTryOn/ring_test_model.glb'
  },
  camera: {
    defaultWidth: 1280,
    defaultHeight: 720,
    facingMode: 'environment'
  },
  debug: {
    enabled: false,
    showConsole: false,
    showDebugCanvas: false
  },
  vercel: {
    analytics: true,
    speedInsights: true
  },
  cdn: {
    enabled: true,
    baseUrl: 'https://cdn.mirror-diamond.com'
  },
  security: {
    enableCSP: true,
    enableHSTS: true
  },
  performance: {
    enableGzip: true,
    enableBrotli: true,
    cacheMaxAge: 31536000
  }
};