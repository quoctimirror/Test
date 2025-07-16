// src/components/jsx/AR.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import "./AR.css";

import { calculateRingTarget } from "@utils/AR/RingTargetCalculator.js";
import ComparativeDebugDisplay from "./ComparativeDebugDisplay.jsx";
import { getRingById, DEFAULT_RING_ID } from "@config/models/rings.js";

const AR = () => {
  const { ringId } = useParams();
  const videoRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const debugCanvasRef = useRef(null);

  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [_currentRing, setCurrentRing] = useState(null);
  const [targetDebugData, setTargetDebugData] = useState(null);
  const [ringDebugData, setRingDebugData] = useState(null);

  const appState = useRef({
    handLandmarker: null,
    drawingUtils: null,
    animationFrameId: null,
    scene: null,
    camera: null,
    renderer: null,
    ringModel: null,
  }).current;

  useEffect(() => {
    // Determine which ring to load
    const selectedRingId = ringId || DEFAULT_RING_ID;
    const ringConfig = getRingById(selectedRingId);

    if (!ringConfig) {
      setLoadingMessage(`Ring not found with ID: ${selectedRingId}`);
      return;
    }

    setCurrentRing(ringConfig);
    console.log("Loading ring:", ringConfig);

    // --- 1. MAIN INITIALIZATION FUNCTION ---
    const initialize = async () => {
      await Promise.all([setupMediaPipe(), setupThreeScene(ringConfig)]);
      await startWebcam();
      startAnimationLoop();
    };

    // --- 2. MEDIAPIPE SETUP ---
    const setupMediaPipe = async () => {
      setLoadingMessage("Loading hand detection model...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
      );
      appState.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1, // Optimized for only 1 hand
      });
      console.log("MediaPipe ready.");
    };

    // --- 3. 3D SCENE SETUP ---
    const setupThreeScene = async (ringConfig) => {
      setLoadingMessage("Preparing 3D space...");
      appState.scene = new THREE.Scene();
      appState.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);
      appState.camera.position.z = 5;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      appState.scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      appState.scene.add(directionalLight);

      const loader = new GLTFLoader();
      return new Promise((resolve) => {
        setLoadingMessage(`Loading model ${ringConfig.name}...`);
        loader.load(
          ringConfig.modelPath,
          (gltf) => {
            console.log(`Model ${ringConfig.name} loaded successfully.`);
            appState.ringModel = gltf.scene;
            appState.ringModel.scale.set(
              ringConfig.scale.x,
              ringConfig.scale.y,
              ringConfig.scale.z
            );
            appState.ringModel.visible = false;
            appState.scene.add(appState.ringModel);
            resolve();
          },
          undefined,
          (error) => {
            console.error("Model loading error:", error);
            setLoadingMessage(`Error: Could not load model ${ringConfig.name}.`);
          }
        );
      });
    };

    // --- 4. WEBCAM & RENDERER STARTUP ---
    const startWebcam = async () => {
      setLoadingMessage("Opening camera...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "environment" },
        });
        videoRef.current.srcObject = stream;

        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            const vWidth = videoRef.current.videoWidth;
            const vHeight = videoRef.current.videoHeight;

            threeCanvasRef.current.width = vWidth;
            threeCanvasRef.current.height = vHeight;
            debugCanvasRef.current.width = vWidth;
            debugCanvasRef.current.height = vHeight;

            appState.camera.aspect = vWidth / vHeight;
            appState.camera.updateProjectionMatrix();

            appState.renderer = new THREE.WebGLRenderer({
              canvas: threeCanvasRef.current,
              alpha: true,
              antialias: true,
            });
            appState.renderer.setSize(vWidth, vHeight);
            appState.renderer.setPixelRatio(window.devicePixelRatio);
            console.log("Webcam and Renderer ready.");
            resolve();
          };
        });
      } catch (error) {
        console.error("Webcam error:", error);
        setLoadingMessage("Cannot access camera. Please grant permission.");
      }
    };

    // --- 5. MAIN ANIMATION LOOP ---
    const startAnimationLoop = () => {
      setLoadingMessage("");
      const debugCtx = debugCanvasRef.current.getContext("2d");
      appState.drawingUtils = new DrawingUtils(debugCtx);

      const animate = () => {
        if (videoRef.current && videoRef.current.readyState >= 4) {
          const results = appState.handLandmarker.detectForVideo(
            videoRef.current,
            performance.now()
          );
          processFrame(results, debugCtx);

          if (appState.renderer) {
            appState.renderer.render(appState.scene, appState.camera);
          }
        }
        appState.animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    };

    // --- 6. FRAME PROCESSING FUNCTION ---
    const processFrame = (results, ctx) => {
      drawHandLandmarks(ctx, results);

      if (
        results.landmarks &&
        results.landmarks.length > 0 &&
        appState.ringModel
      ) {
        const landmarks = results.landmarks[0];
        const target = calculateRingTarget(landmarks);

        setTargetDebugData(target);

        if (target) {
          appState.ringModel.visible = true;

          const viewSize = getCameraViewSize();
          const worldX = (target.position.x - 0.5) * viewSize.width;
          const worldY = -(target.position.y - 0.5) * viewSize.height;
          const worldZ = target.position.z * viewSize.width * 0.8;
          appState.ringModel.position.set(worldX, worldY, worldZ);

          const initialCorrection = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            Math.PI / 2
          );

          const dynamicRotation = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              THREE.MathUtils.degToRad(target.rotation.x),
              THREE.MathUtils.degToRad(target.rotation.y),
              THREE.MathUtils.degToRad(target.rotation.z),
              "XYZ"
            )
          );

          appState.ringModel.quaternion
            .copy(dynamicRotation)
            .multiply(initialCorrection);
        } else {
          appState.ringModel.visible = false;
        }
      } else {
        if (appState.ringModel) appState.ringModel.visible = false;
        setTargetDebugData(null);
      }

      if (appState.ringModel && appState.ringModel.visible) {
        const pos = appState.ringModel.position;
        const rot = appState.ringModel.rotation;
        setRingDebugData({
          position: { x: pos.x, y: pos.y, z: pos.z },
          rotation: {
            x: THREE.MathUtils.radToDeg(rot.x),
            y: THREE.MathUtils.radToDeg(rot.y),
            z: THREE.MathUtils.radToDeg(rot.z),
          },
        });
      } else {
        setRingDebugData(null);
      }
    };

    // --- 7. HELPER FUNCTIONS ---
    const drawHandLandmarks = (ctx, results) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (results.landmarks && results.landmarks.length > 0) {
        for (const landmarks of results.landmarks) {
          appState.drawingUtils.drawConnectors(
            landmarks,
            HandLandmarker.HAND_CONNECTIONS,
            { color: "lime" }
          );
          appState.drawingUtils.drawLandmarks(landmarks, {
            color: "red",
            radius: 4,
          });
        }
        const firstHand = results.landmarks[0];
        if (firstHand[13] && firstHand[14]) {
          const midpointX =
            ((firstHand[13].x + firstHand[14].x) / 2) * ctx.canvas.width;
          const midpointY =
            ((firstHand[13].y + firstHand[14].y) / 2) * ctx.canvas.height;
          ctx.beginPath();
          ctx.arc(midpointX, midpointY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "cyan";
          ctx.fill();
        }
      }
    };

    const getCameraViewSize = () => {
      const fovInRadians = (appState.camera.fov * Math.PI) / 180;
      const height =
        2 * Math.tan(fovInRadians / 2) * appState.camera.position.z;
      const width = height * appState.camera.aspect;
      return { width, height };
    };

    // --- 8. INITIALIZATION AND CLEANUP ---
    initialize();
    return () => {
      if (appState.animationFrameId) {
        cancelAnimationFrame(appState.animationFrameId);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [ringId, appState]);

  // --- 9. RENDER UI ---
  return (
    <>
      <div className="ar-jewelry-container">
        {loadingMessage && (
          <div className="loading-overlay">
            <p>{loadingMessage}</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="ar-video"
          autoPlay
          playsInline
          muted
        ></video>
        <canvas
          ref={debugCanvasRef}
          className="ar-canvas debug-canvas"
        ></canvas>
        <canvas
          ref={threeCanvasRef}
          className="ar-canvas three-canvas"
        ></canvas>
      </div>

      <ComparativeDebugDisplay
        targetData={targetDebugData}
        ringData={ringDebugData}
      />
    </>
  );
};

export default AR;
