import React, { useEffect, useState } from "react";
import { getMediaUrl } from "@utils/cloudflareMediaUtil";
import "./ScavengerHunt.css";

const ScavengerHunt = () => {
  const [status, setStatus] = useState("Loading AR Experience...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if scripts are loaded (they're in index.html)
    const checkScriptsLoaded = () => {
      // MindAR might be integrated into AFRAME, check for components
      const hasMindAR = window.MINDAR || window.AFRAME?.components?.['mindar-image'];

      return (
        window.AFRAME &&
        window.AFRAME.THREE &&
        window.GifReader
        // Note: Skip MINDAR check, it's integrated into AFRAME components
      );
    };

    if (checkScriptsLoaded()) {
      initializeAR();
    } else {
      // Wait for scripts to load
      const interval = setInterval(() => {
        if (checkScriptsLoaded()) {
          clearInterval(interval);
          initializeAR();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const forceCanvasFullScreen = () => {
    const canvas = document.querySelector("a-scene canvas");
    const sceneEl = document.querySelector("a-scene");

    if (canvas && sceneEl) {
      // Force canvas to full viewport
      canvas.style.width = "100vw !important";
      canvas.style.height = "100vh !important";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.objectFit = "cover";

      // Override canvas width/height attributes
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = vw;
      canvas.height = vh;

      // Force A-Frame renderer to match viewport
      if (sceneEl.renderer) {
        sceneEl.renderer.setSize(vw, vh, false);
        sceneEl.renderer.domElement.style.width = '100%';
        sceneEl.renderer.domElement.style.height = '100%';
      }

      // Force Three.js camera aspect ratio
      if (sceneEl.camera) {
        sceneEl.camera.aspect = vw / vh;
        sceneEl.camera.updateProjectionMatrix();
      }

      // Force MindAR video to full screen
      const video = document.querySelector('.scavenger-hunt video');
      if (video) {
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
      }

      // Keep forcing on resize
      const resizeHandler = () => {
        const newVw = window.innerWidth;
        const newVh = window.innerHeight;
        canvas.width = newVw;
        canvas.height = newVh;
        canvas.style.width = "100vw !important";
        canvas.style.height = "100vh !important";
        if (sceneEl.renderer) {
          sceneEl.renderer.setSize(newVw, newVh, false);
        }
        if (sceneEl.camera) {
          sceneEl.camera.aspect = newVw / newVh;
          sceneEl.camera.updateProjectionMatrix();
        }
        const video = document.querySelector('.scavenger-hunt video');
        if (video) {
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
        }
      };

      window.addEventListener('resize', resizeHandler);
      window.addEventListener('orientationchange', resizeHandler);

      // Also force update every frame for first few seconds
      let frameCount = 0;
      const forceInterval = setInterval(() => {
        const newVw = window.innerWidth;
        const newVh = window.innerHeight;
        canvas.width = newVw;
        canvas.height = newVh;
        if (sceneEl.renderer) {
          sceneEl.renderer.setSize(newVw, newVh, false);
        }
        if (sceneEl.camera) {
          sceneEl.camera.aspect = newVw / newVh;
          sceneEl.camera.updateProjectionMatrix();
        }
        const video = document.querySelector('.scavenger-hunt video');
        if (video) {
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
        }
        frameCount++;
        if (frameCount > 60) { // Stop after 60 frames (~1 second at 60fps)
          clearInterval(forceInterval);
        }
      }, 16);

    } else {
      setTimeout(forceCanvasFullScreen, 100);
    }
  };

  const initializeAR = () => {
    // Register animated-gif component IMMEDIATELY (before scene loads)
    if (window.AFRAME && !window.AFRAME.components["animated-gif"]) {
      window.AFRAME.registerComponent("animated-gif", {
        schema: {
          src: { type: "string" },
        },

        init: function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          this.canvas = canvas;
          this.ctx = ctx;

          // Set initial canvas size and loading indicator
          canvas.width = 512;
          canvas.height = 512;
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading GIF...', canvas.width/2, canvas.height/2);

          // Create texture
          const texture = new window.THREE.CanvasTexture(canvas);
          texture.minFilter = window.THREE.LinearFilter;
          texture.magFilter = window.THREE.LinearFilter;

          const material = new window.THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: window.THREE.DoubleSide,
          });

          this.el.getObject3D("mesh").material = material;
          this.texture = texture;
          this.texture.needsUpdate = true;

          // Load GIF and parse frames
          this.loadGIF(this.data.src);
        },

        loadGIF: function (url) {
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.arrayBuffer();
            })
            .then((buffer) => {
              const intArray = new Uint8Array(buffer);
              const reader = new window.GifReader(intArray);

              this.canvas.width = reader.width;
              this.canvas.height = reader.height;

              this.frames = [];
              this.delays = [];

              // Decode all frames
              const frameCount = reader.numFrames();
              const framePixels = new Uint8ClampedArray(
                reader.width * reader.height * 4
              );

              for (let i = 0; i < frameCount; i++) {
                reader.decodeAndBlitFrameRGBA(i, framePixels);

                const frameCanvas = document.createElement("canvas");
                frameCanvas.width = reader.width;
                frameCanvas.height = reader.height;
                const frameCtx = frameCanvas.getContext("2d");
                const imageData = new ImageData(
                  framePixels.slice(),
                  reader.width,
                  reader.height
                );
                frameCtx.putImageData(imageData, 0, 0);

                this.frames.push(frameCanvas);

                const frameInfo = reader.frameInfo(i);
                this.delays.push(frameInfo.delay * 10); // Convert to milliseconds
              }

              this.currentFrame = 0;
              this.lastFrameTime = Date.now();
              this.animateGIF();
            })
            .catch((err) => {
              // Fallback: show error texture
              this.ctx.fillStyle = '#ff0000';
              this.ctx.fillRect(0, 0, 100, 100);
              this.ctx.fillStyle = '#ffffff';
              this.ctx.font = '12px Arial';
              this.ctx.fillText('GIF Error', 10, 50);
              this.texture.needsUpdate = true;
            });
        },

        animateGIF: function () {
          if (!this.frames || this.frames.length === 0) return;

          const now = Date.now();
          const delay = this.delays[this.currentFrame] || 100;

          if (now - this.lastFrameTime >= delay) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.frames[this.currentFrame], 0, 0);
            this.texture.needsUpdate = true;

            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.lastFrameTime = now;
          }

          requestAnimationFrame(() => this.animateGIF());
        },
      });

      // Setup event listeners
      const sceneEl = document.querySelector("a-scene");
      if (sceneEl) {
        // Force full screen styles
        sceneEl.style.width = "100%";
        sceneEl.style.height = "100%";
        sceneEl.style.position = "absolute";
        sceneEl.style.top = "0";
        sceneEl.style.left = "0";

        // Check if scene is already loaded
        if (sceneEl.hasLoaded) {
          setIsLoading(false);
          forceCanvasFullScreen();
        } else {
          sceneEl.addEventListener("loaded", () => {
            setIsLoading(false);
            forceCanvasFullScreen();
          });
        }

        const target = document.querySelector("[mindar-image-target]");
        if (target) {
          target.addEventListener("targetFound", () => {
            setStatus("💎 Target Found!");
          });

          target.addEventListener("targetLost", () => {
            setStatus("Scanning for target...");
          });
        }
      } else {
        // Fallback: hide loading after timeout
        setTimeout(() => setIsLoading(false), 2000);
      }

      window.addEventListener("arError", (event) => {
        setStatus("AR Error: " + event.detail.error);
        setIsLoading(false);
      });
    } // Close if statement

    // Force re-apply component to entities that already have it
    // This needs to happen AFTER scene is loaded, outside the component registration check
    setTimeout(() => {
      const gifPlane = document.querySelector("#gif-plane");

      if (gifPlane) {
        if (gifPlane.components["animated-gif"]) {
          gifPlane.components["animated-gif"].init();
        } else {
          // Force component to be added to the entity
          gifPlane.setAttribute("animated-gif", `src: ${getMediaUrl("lumex-ar/Lumex91.gif")}`);
        }
      }
    }, 500);
  };

  return (
    <div className="scavenger-hunt">
      {isLoading && <div className="ar-loading">{status}</div>}

      <div className="welcome-logo">
        <img src={getMediaUrl("welcome/welcome_logo.svg")} alt="Welcome Logo" />
      </div>

      <a-scene
        mindar-image={`imageTargetSrc: ${getMediaUrl("lumex-ar/targets-mirror-hello.mind")}; autoStart: true; uiLoading: no; uiError: no; uiScanning: no; filterMinCF: 0.0001; filterBeta: 0.001;`}
        color-space="sRGB"
        renderer="colorManagement: true, physicallyCorrectLights, antialias: true, alpha: false"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        embedded
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0">
          <a-plane
            id="gif-plane"
            position="0.05 -0.15 0"
            height="0.15"
            width="0.15"
            rotation="0 0 0"
            animated-gif={`src: ${getMediaUrl("lumex-ar/Lumex91.gif")}`}
          ></a-plane>
        </a-entity>
      </a-scene>
    </div>
  );
};

export default ScavengerHunt;
