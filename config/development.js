// Development configuration for Vercel deployment
export default {
  app: {
    name: "Mirror Diamond Website - Development",
    version: "1.0.0",
    environment: "development",
    baseUrl: "https://mirror-clone-eight.vercel.app/",
  },
  api: {
    baseUrl: "https://api-dev.mirror-diamond.com/api",
    timeout: 15000,
  },
  mediappe: {
    modelUrl:
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    wasmUrl:
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm",
  },
  models: {
    ringModelPath: "/arTryOn/ring_test_model.glb",
  },
  camera: {
    defaultWidth: 1280,
    defaultHeight: 720,
    facingMode: "environment",
  },
  debug: {
    enabled: true,
    showConsole: true,
    showDebugCanvas: true,
  },
  vercel: {
    analytics: true,
    speedInsights: true,
  },
  cdn: {
    enabled: true,
    baseUrl: "https://cdn.mirror-diamond.com",
  },
};
