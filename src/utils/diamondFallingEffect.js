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
      ...config,
    };
  }

  // Diamond class
  createDiamond(isInitial = false) {
    const canvasWidth = this.canvas ? this.canvas.width : window.innerWidth;
    const canvasHeight = this.canvas ? this.canvas.height : window.innerHeight;

    const diamond = {
      x: Math.random() * canvasWidth,
      y: isInitial ? Math.random() * canvasHeight : -50, // Random Y on init for immediate full-screen effect
      size: this.config.size * (0.5 + Math.random() * 1),
      speed: this.config.speed * (0.5 + Math.random() * 0.5),
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayAmount: this.config.sway * (2 + Math.random() * 3),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        (this.config.rotation / 5) * (Math.random() - 0.5) * 0.1,
      initialX: Math.random() * canvasWidth,
      opacity: 0.6 + Math.random() * 0.4,
      sparkle: Math.random() * Math.PI * 2,
      canvasWidth: canvasWidth, // Store canvas width for reset

      reset: function () {
        this.x = Math.random() * this.canvasWidth;
        this.y = -50; // Reset to top to fall again continuously
        this.initialX = this.x;
      },

      update: function (time, canvasHeight) {
        this.y += this.speed;
        this.x =
          this.initialX +
          Math.sin(time * 0.001 * this.swaySpeed) * this.swayAmount;
        this.rotation += this.rotationSpeed;
        this.sparkle += 0.1;

        if (this.y > canvasHeight + 50) {
          this.reset();
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

  // Initialize diamonds
  initDiamonds() {
    this.diamonds = [];
    for (let i = 0; i < this.config.count; i++) {
      this.diamonds.push(this.createDiamond(true)); // Pass true for initial spread
    }
  }

  // Animation loop
  animate = () => {
    if (!this.isActive || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const time = Date.now();

    this.diamonds.forEach((diamond) => {
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
    `;
    this.ctx = this.canvas.getContext("2d");

    container.appendChild(this.canvas);

    this.setupCanvas();
    this.initDiamonds();

    this.isActive = true;
    this.animate();

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

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.canvas = null;
    this.ctx = null;
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
