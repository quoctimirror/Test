// Default configuration for local development
export default {
  app: {
    name: 'Mirror Diamond Website',
    version: '1.0.0',
    port: 5173,
    host: 'localhost'
  },
  api: {
    baseUrl: 'http://localhost:5173/api',
    timeout: 10000
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
    enabled: true,
    showConsole: true,
    showDebugCanvas: true
  }
};