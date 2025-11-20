/**
 * Diamond Falling Effect Utility
 * Canvas-based animation for luxury diamond particles
 */

class DiamondFallingEffect {
  constructor(containerId, config = {}) {
    this.containerId = containerId;
    this.canvas = null;
    this.ctx = null;
    this.diamonds = [];
    this.animationId = null;
    this.isActive = false;

    // Default configuration
    this.config = {
      count: 30,
      speed: 3,
      size: 15,
      sway: 5,
      rotation: 5,
      fallAreaWidth: 1, // Default: full width (1 = 100%, 0.26 = 26%)
      fallAreaAlign: 'left', // 'left', 'center', 'right'
      ...config,
    };
  }

  // Diamond class
  createDiamond(isInitial = false) {
    const canvasWidth = this.canvas ? this.canvas.width : window.innerWidth;
    const canvasHeight = this.canvas ? this.canvas.height : window.innerHeight;

    // Calculate fall area based on config
    const fallAreaPixelWidth = canvasWidth * this.config.fallAreaWidth;
    let fallAreaStartX = 0;

    if (this.config.fallAreaAlign === 'center') {
      fallAreaStartX = (canvasWidth - fallAreaPixelWidth) / 2;
    } else if (this.config.fallAreaAlign === 'right') {
      fallAreaStartX = canvasWidth - fallAreaPixelWidth;
    }
    // 'left' alignment keeps fallAreaStartX = 0

    const getRandomX = () => fallAreaStartX + Math.random() * fallAreaPixelWidth;

    const diamond = {
      x: getRandomX(),
      y: isInitial ? Math.random() * canvasHeight : -50, // Random Y on init for immediate full-screen effect
      size: this.config.size * (0.5 + Math.random() * 1),
      speed: this.config.speed * (0.5 + Math.random() * 0.5),
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayAmount: this.config.sway * (2 + Math.random() * 3),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        (this.config.rotation / 5) * (Math.random() - 0.5) * 0.1,
      initialX: getRandomX(),
      baseOpacity: 0.6 + Math.random() * 0.4, // Store base opacity
      opacity: 0, // Start with 0 opacity for fade-in
      targetOpacity: 0.6 + Math.random() * 0.4, // Target opacity to fade to
      fadeProgress: 0, // 0 to 1 for fade-in animation
      sparkle: Math.random() * Math.PI * 2,
      canvasWidth: canvasWidth, // Store canvas width for reset
      fallAreaWidth: this.config.fallAreaWidth, // Store fall area config
      fallAreaAlign: this.config.fallAreaAlign,
      hasLanded: false, // Track if diamond has reached bottom

      reset: function () {
        // Recalculate fall area on reset
        const pixelWidth = this.canvasWidth * this.fallAreaWidth;
        let startX = 0;

        if (this.fallAreaAlign === 'center') {
          startX = (this.canvasWidth - pixelWidth) / 2;
        } else if (this.fallAreaAlign === 'right') {
          startX = this.canvasWidth - pixelWidth;
        }

        this.x = startX + Math.random() * pixelWidth;
        this.y = -50; // Reset to top to fall again continuously
        this.initialX = this.x;

        // Reset fade-in for smooth re-entry
        this.fadeProgress = 0;
        this.opacity = 0;
      },

      update: function (time, canvasHeight) {
        // Fade in opacity gradually
        if (this.fadeProgress < 1) {
          this.fadeProgress += 0.02; // Adjust speed of fade-in
          this.opacity = this.targetOpacity * Math.min(this.fadeProgress, 1);
        }

        // If diamond has landed, stop updating position
        if (this.hasLanded) {
          // Keep sparkle animation even when landed
          this.sparkle += 0.1;
          return;
        }

        // Update position - fall down
        this.y += this.speed;
        this.x =
          this.initialX +
          Math.sin(time * 0.001 * this.swaySpeed) * this.swayAmount;
        this.rotation += this.rotationSpeed;
        this.sparkle += 0.1;

        // Check if reached bottom (with some margin for the diamond size)
        if (this.y >= canvasHeight - 50) {
          this.y = canvasHeight - 50; // Snap to bottom position
          this.hasLanded = true; // Mark as landed
          this.rotationSpeed = 0; // Stop rotation when landed
        }
      },

      draw: function (ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const sparkleIntensity = (Math.sin(this.sparkle) + 1) / 2;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          this.size * 2.5
        );
        glowGradient.addColorStop(
          0,
          `rgba(255, 255, 255, ${this.opacity * sparkleIntensity * 0.4})`
        );
        glowGradient.addColorStop(
          0.3,
          `rgba(180, 220, 255, ${this.opacity * sparkleIntensity * 0.2})`
        );
        glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        const topHeight = this.size * 0.4;
        const bottomHeight = this.size * 0.8;
        const width = this.size * 0.8;
        const tableWidth = this.size * 0.5;

        // Table (top flat surface)
        const tableGradient = ctx.createLinearGradient(
          -tableWidth / 2,
          -topHeight,
          tableWidth / 2,
          -topHeight
        );
        tableGradient.addColorStop(
          0,
          `rgba(200, 230, 255, ${this.opacity * 0.9})`
        );
        tableGradient.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${this.opacity})`
        );
        tableGradient.addColorStop(
          1,
          `rgba(200, 230, 255, ${this.opacity * 0.9})`
        );

        ctx.fillStyle = tableGradient;
        ctx.beginPath();
        ctx.moveTo(-tableWidth / 2, -topHeight);
        ctx.lineTo(tableWidth / 2, -topHeight);
        ctx.lineTo(tableWidth / 2, -topHeight * 0.6);
        ctx.lineTo(-tableWidth / 2, -topHeight * 0.6);
        ctx.closePath();
        ctx.fill();

        // Left crown facet
        const leftCrownGradient = ctx.createLinearGradient(
          -width,
          0,
          -tableWidth / 2,
          -topHeight
        );
        leftCrownGradient.addColorStop(
          0,
          `rgba(150, 200, 255, ${this.opacity * 0.7})`
        );
        leftCrownGradient.addColorStop(
          1,
          `rgba(220, 240, 255, ${this.opacity * 0.85})`
        );

        ctx.fillStyle = leftCrownGradient;
        ctx.beginPath();
        ctx.moveTo(-tableWidth / 2, -topHeight);
        ctx.lineTo(-width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Right crown facet
        const rightCrownGradient = ctx.createLinearGradient(
          width,
          0,
          tableWidth / 2,
          -topHeight
        );
        rightCrownGradient.addColorStop(
          0,
          `rgba(180, 220, 255, ${this.opacity * 0.75})`
        );
        rightCrownGradient.addColorStop(
          1,
          `rgba(240, 250, 255, ${this.opacity * 0.9})`
        );

        ctx.fillStyle = rightCrownGradient;
        ctx.beginPath();
        ctx.moveTo(tableWidth / 2, -topHeight);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Left pavilion
        const leftPavilionGradient = ctx.createLinearGradient(
          -width,
          0,
          0,
          bottomHeight
        );
        leftPavilionGradient.addColorStop(
          0,
          `rgba(100, 150, 255, ${this.opacity * 0.6})`
        );
        leftPavilionGradient.addColorStop(
          0.5,
          `rgba(150, 200, 255, ${this.opacity * 0.5})`
        );
        leftPavilionGradient.addColorStop(
          1,
          `rgba(180, 220, 255, ${this.opacity * 0.4})`
        );

        ctx.fillStyle = leftPavilionGradient;
        ctx.beginPath();
        ctx.moveTo(-width, 0);
        ctx.lineTo(0, bottomHeight);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Right pavilion
        const rightPavilionGradient = ctx.createLinearGradient(
          width,
          0,
          0,
          bottomHeight
        );
        rightPavilionGradient.addColorStop(
          0,
          `rgba(120, 170, 255, ${this.opacity * 0.65})`
        );
        rightPavilionGradient.addColorStop(
          0.5,
          `rgba(170, 210, 255, ${this.opacity * 0.55})`
        );
        rightPavilionGradient.addColorStop(
          1,
          `rgba(200, 230, 255, ${this.opacity * 0.45})`
        );

        ctx.fillStyle = rightPavilionGradient;
        ctx.beginPath();
        ctx.moveTo(width, 0);
        ctx.lineTo(0, bottomHeight);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -topHeight);
        ctx.lineTo(width, 0);
        ctx.lineTo(0, bottomHeight);
        ctx.lineTo(-width, 0);
        ctx.closePath();
        ctx.stroke();

        // Internal facet lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(-width, 0);
        ctx.lineTo(width, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-tableWidth / 2, -topHeight);
        ctx.lineTo(0, bottomHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tableWidth / 2, -topHeight);
        ctx.lineTo(0, bottomHeight);
        ctx.stroke();

        // Sparkle highlights
        if (sparkleIntensity > 0.7) {
          ctx.fillStyle = `rgba(255, 255, 255, ${
            (sparkleIntensity - 0.7) * this.opacity
          })`;
          ctx.beginPath();
          ctx.arc(tableWidth * 0.2, -topHeight * 0.8, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(-tableWidth * 0.15, -topHeight * 0.7, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      },
    };

    return diamond;
  }

  // Setup canvas
  setupCanvas() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    this.canvas.width = container.offsetWidth || window.innerWidth;
    this.canvas.height = container.offsetHeight || window.innerHeight;

    // Update canvasWidth in all existing diamonds
    this.diamonds.forEach((diamond) => {
      diamond.canvasWidth = this.canvas.width;
    });
  }

  // Initialize diamonds with staggered spawn
  initDiamonds() {
    this.diamonds = [];
    const spawnDelay = 80; // milliseconds between each diamond spawn (increased for smoother effect)

    for (let i = 0; i < this.config.count; i++) {
      const diamond = this.createDiamond(true); // Pass true for initial spread

      // Add spawn delay - later diamonds fade in later
      diamond.spawnDelay = i * spawnDelay;
      diamond.spawnTime = Date.now() + diamond.spawnDelay;
      diamond.hasSpawned = false;

      this.diamonds.push(diamond);
    }
  }

  // Animation loop
  animate = () => {
    if (!this.isActive || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const time = Date.now();

    this.diamonds.forEach((diamond) => {
      // Check if diamond should spawn yet
      if (!diamond.hasSpawned) {
        if (time >= diamond.spawnTime) {
          diamond.hasSpawned = true;
        } else {
          return; // Skip this diamond until spawn time
        }
      }

      diamond.update(time, this.canvas.height);
      diamond.draw(this.ctx);
    });

    this.animationId = requestAnimationFrame(this.animate);
  };

  // Start effect
  start() {
    if (this.isActive) {
      return;
    }

    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 205;
      opacity: 0;
      transition: opacity 0.8s ease-in;
    `;
    this.ctx = this.canvas.getContext("2d");

    container.appendChild(this.canvas);

    this.setupCanvas();
    this.initDiamonds();

    this.isActive = true;
    this.animate();

    // Fade in canvas smoothly
    requestAnimationFrame(() => {
      this.canvas.style.opacity = '1';
    });

    // Handle resize
    this.resizeHandler = () => this.setupCanvas();
    window.addEventListener("resize", this.resizeHandler);
  }

  // Stop effect
  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }

    // Fade out canvas smoothly before removing
    if (this.canvas) {
      this.canvas.style.opacity = '0';

      // Remove canvas after fade-out completes
      setTimeout(() => {
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
      }, 300); // Shorter fade-out duration
    }

    this.diamonds = [];
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isActive) {
      this.initDiamonds();
    }
  }
}

export default DiamondFallingEffect;
