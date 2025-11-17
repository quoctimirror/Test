import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useIJewelARTryOn Hook - Custom hook quản lý AR Try-On logic
 *
 * Chức năng:
 * - Khởi tạo WebGI viewer và iJewel SDK
 * - Load 3D model theo tên
 * - Quản lý AR Try-On state (start/stop)
 * - Xử lý camera controls (flip, switch finger)
 * - Progressive loading với progress bar
 * - iOS Safari optimizations (FULL QUALITY)
 */
export const useIJewelARTryOn = ({ canvasRef, modelName, onError, onModelLoad }) => {
  // ==========================================
  // STATES
  // ==========================================
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading models...');
  const [isARRunning, setIsARRunning] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // REFS
  // ==========================================
  const viewerRef = useRef(null);
  const tryonRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ==========================================
  // MODEL CONFIGURATIONS
  // ==========================================
  const modelConfigs = {
    demo_tryon: {
      glb: "/models/rings/demo_tryon.glb",
      json: "https://playground.ijewel3d.com/assets/demo/tryon/demo_tryon.json"
    },
    refined_mirror_fistion: {
      glb: "/models/rings/refined_mirror_fistion.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_flower: {
      glb: "/models/rings/refined_mirror_flower.glb",
      json: "/arTryOn/refined_mirror_flower_config.json"
    },
    refined_mirror_heart: {
      glb: "/models/rings/refined_mirror_heart.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_myfav: {
      glb: "/models/rings/refined_mirror_myfav.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_oval: {
      glb: "/models/rings/refined_mirror_oval.glb",
      json: "/arTryOn/refined_mirror_oval_config.json"
    },
    refined_mirror_pear: {
      glb: "/models/rings/pear.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_trilogy: {
      glb: "/models/rings/refined_mirror_trilogy.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_twin: {
      glb: "/models/rings/refined_mirror_twin.glb",
      json: "/arTryOn/standard.json"
    },
    refined_mirror_ufo: {
      glb: "/models/rings/refined_mirror_ufo.glb",
      json: "/arTryOn/standard.json"
    },
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const isIOSSafari = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua);
    return isIOS && isSafari;
  };

  const getModelKey = useCallback((name) => {
    if (modelConfigs[name]) return name;
    const fullName = name === 'demo' ? 'demo_tryon' : `refined_mirror_${name}`;
    if (modelConfigs[fullName]) return fullName;
    console.warn(`⚠️ Model "${name}" not found, using default: refined_mirror_oval`);
    return 'refined_mirror_oval';
  }, []);

  const loadModelProgressive = useCallback(async (modelKey) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      setLoadingProgress(0);
      setLoadingText('Loading models... This will take a few seconds.');

      // Clear scene to hide old model
      if (viewer.scene) {
        const scene = viewer.scene;
        // Remove all previous models from scene
        const models = scene.modelRoot?.children?.filter(child => child.modelObject) || [];
        models.forEach(model => {
          if (model.visible !== undefined) model.visible = false;
        });
      }

      setLoadingProgress(30);
      await viewer.load(modelConfigs[modelKey].json);

      setLoadingProgress(60);
      await viewer.load(modelConfigs[modelKey].glb);

      setLoadingProgress(90);
      await new Promise(resolve => setTimeout(resolve, 100));

      setLoadingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (onModelLoad) onModelLoad(modelKey);
      return true;
    } catch (err) {
      console.error('Progressive loading error:', err);
      setError('Failed to load model. Please refresh.');
      if (onError) onError(err);
      throw err;
    }
  }, [onModelLoad, onError]);

  const waitForSDKScripts = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;

      const check = () => {
        attempts++;

        if (typeof window.ViewerApp !== 'undefined' &&
          typeof window.DiamondPlugin !== 'undefined' &&
          typeof window.ij_vto !== 'undefined') {
          console.log('✅ All SDK scripts loaded');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Failed to load SDK scripts after 5 seconds'));
        } else {
          console.log(`⏳ Waiting for SDK scripts... (${attempts}/${maxAttempts})`);
          setTimeout(check, 100);
        }
      };

      check();
    });
  };

  const setupIOSHandlers = (canvas, viewer, tryon) => {
    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      console.error('⚠️ WebGL context lost!');
      if (tryon && tryon.running) tryon.stop().catch(() => { });
      alert('Memory issue detected. The page will reload.');
      setTimeout(() => window.location.reload(), 1000);
    }, false);

    canvas.addEventListener('webglcontextrestored', function () {
      console.log('✅ WebGL context restored');
    }, false);

    document.addEventListener('visibilitychange', async function () {
      if (document.hidden) {
        console.log('📱 Page hidden - stopping rendering');
        if (viewer) viewer.renderEnabled = false;
        if (tryon && tryon.running) {
          try {
            await tryon.stop();
            setIsARRunning(false);
          } catch (e) {
            console.error('Failed to stop tryon:', e);
          }
        }
      } else {
        console.log('📱 Page visible - resuming rendering');
        if (viewer) viewer.renderEnabled = true;
      }
    });

    window.addEventListener('pagehide', function () {
      console.log('📱 Page hiding - cleanup');
      if (viewer) viewer.renderEnabled = false;
      if (tryon && tryon.running) tryon.stop().catch(() => { });
    });

    console.log('🛡️ iOS handlers installed');
  };

  const initializeViewer = useCallback(async () => {
    if (!canvasRef.current || isInitializedRef.current) return;

    try {
      setIsLoading(true);
      const isIOS = isIOSSafari();

      if (isIOS) {
        console.log('🍎 iOS Safari detected - FULL QUALITY mode');
      }

      await waitForSDKScripts();

      const viewer = new window.ViewerApp({ canvas: canvasRef.current });
      viewerRef.current = viewer;

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      viewer.renderer.displayCanvasScaling = isMobile ? 1.0 : 1.5;
      console.log('📱 Canvas scaling:', viewer.renderer.displayCanvasScaling, '(Full quality)');

      await window.addBasePlugins(viewer);

      const diamondPlugin = await viewer.addPlugin(window.DiamondPlugin);
      diamondPlugin.setKey("LICENSE_KEY_FOR_IJEWEL_SDK");

      const tryon = await viewer.addPlugin(window.ij_vto.RingTryonPlugin);
      tryon.setKey("LICENSE_KEY_FOR_TRYON_SDK");
      tryonRef.current = tryon;

      if (isIOS) {
        setupIOSHandlers(canvasRef.current, viewer, tryon);
      }

      viewer.renderEnabled = false;
      const modelKey = getModelKey(modelName);
      await loadModelProgressive(modelKey);
      viewer.renderEnabled = true;

      await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      setIsLoading(false);
      isInitializedRef.current = true;

      console.log('✅ iJewel SDK initialized successfully');
      if (isIOS) {
        console.log('🍎 iOS: FULL QUALITY - Canvas 1.0, No throttling, MSAA enabled');
      }

    } catch (err) {
      console.error('❌ Initialization error:', err);
      setError('Failed to initialize AR Try-On');
      setIsLoading(false);
      if (onError) onError(err);
    }
  }, [canvasRef, modelName, getModelKey, loadModelProgressive, onError]);

  const toggleAR = useCallback(async () => {
    const tryon = tryonRef.current;
    const viewer = viewerRef.current;
    const canvas = canvasRef.current;
    if (!tryon || !canvas) return;

    try {
      if (tryon.running) {
        await tryon.stop();
        setIsARRunning(false);

        // Re-enable 3D viewer rendering when exiting AR
        if (viewer) {
          viewer.renderEnabled = true;
        }

        canvas.style.opacity = '1';
        console.log('🔙 Exited AR mode, viewer enabled');
      } else {
        // Hide canvas before starting to avoid showing front camera
        canvas.style.opacity = '0';

        // Disable 3D viewer rendering when entering AR mode
        if (viewer) {
          viewer.renderEnabled = false;
          console.log('🎥 Entering AR mode, viewer disabled');
        }

        await tryon.start();
        setIsARRunning(true);

        // Flip to back camera as soon as possible
        setTimeout(() => {
          if (tryon?.flipCamera) {
            tryon.flipCamera();
            console.log('📷 Flipping to back camera...');

            // Show canvas immediately after flip (total 500ms from start)
            setTimeout(() => {
              canvas.style.opacity = '1';
              console.log('✅ Back camera ready, showing canvas');
            }, 200);
          } else {
            // If flip failed, still show canvas
            canvas.style.opacity = '1';
          }
          hideWatermarks();
        }, 300);
      }
    } catch (err) {
      console.error('❌ AR toggle error:', err);
      // Re-enable viewer and show canvas even on error
      if (viewer) viewer.renderEnabled = true;
      if (canvas) canvas.style.opacity = '1';

      let errorMsg = 'Failed to start AR try-on.\n\n';
      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        errorMsg = 'Camera permission denied. Please allow camera access.';
      } else if (err.message.includes('NotFoundError')) {
        errorMsg = 'No camera found on this device.';
      } else if (err.message.includes('NotReadableError')) {
        errorMsg = 'Camera is in use by another app.';
      } else {
        errorMsg = err.message;
      }

      setError(errorMsg);
      if (onError) onError(err);
    }
  }, [onError]);

  const hideWatermarks = () => {
    console.log('🔍 Hiding watermarks...');

    document.querySelectorAll('div').forEach(el => {
      const text = el.textContent?.toLowerCase() || '';
      if (text.includes('ijewel') || text.includes('webgi') || text.includes('powered')) {
        el.style.display = 'none';
      }
    });

    console.log('✅ Watermarks hidden');
  };

  useEffect(() => {
    initializeViewer();

    return () => {
      const viewer = viewerRef.current;
      const tryon = tryonRef.current;

      if (tryon && tryon.running) {
        tryon.stop().catch(() => { });
      }

      if (viewer) {
        viewer.renderEnabled = false;
      }

      isInitializedRef.current = false;
    };
  }, [initializeViewer]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isInitializedRef.current) return;

    const reloadModel = async () => {
      setIsLoading(true);

      // Disable render while loading to hide old model
      viewer.renderEnabled = false;

      const modelKey = getModelKey(modelName);
      await loadModelProgressive(modelKey);

      // Re-enable render after new model is loaded
      viewer.renderEnabled = true;

      setIsLoading(false);
      console.log(`✅ Model switched to: ${modelKey}`);
    };

    reloadModel();
  }, [modelName, getModelKey, loadModelProgressive]);

  return {
    isLoading,
    loadingProgress,
    loadingText,
    isARRunning,
    error,
    startAR: toggleAR,
    stopAR: toggleAR,
    flipCamera: () => tryonRef.current?.flipCamera(),
    switchFinger: () => {
      const tryon = tryonRef.current;
      if (tryon) tryon.finger = (tryon.finger + 1) % 5;
    },
    saveImage: () => tryonRef.current?.saveImage(),
    viewer: viewerRef.current,
    tryon: tryonRef.current
  };
};
