/**
 * Smooth Scroll Utility
 * Creates cinematic smooth scrolling with parallax depth effect
 * Inspired by Rejouice and premium websites
 */

export class SmoothScroll {
  constructor(options = {}) {
    this.wrapper =
      options.wrapper || document.querySelector("[data-smooth-wrapper]");
    this.content =
      options.content || document.querySelector("[data-smooth-content]");

    if (!this.wrapper || !this.content) {
      console.warn("SmoothScroll: wrapper or content not found");
      return;
    }

    this.current = 0;
    this.target = 0;
    this.ease = options.ease || 0.075; // Lower = smoother but slower
    this.isRunning = false;
    this.rafId = null;

    this.init();
  }

  init() {
    // Set body height to enable native scroll
    this.setBodyHeight();

    // Listen to native scroll
    this.handleScroll = () => {
      this.target = window.scrollY;
    };
    window.addEventListener("scroll", this.handleScroll, { passive: true });

    // Handle resize
    this.handleResize = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.setBodyHeight();
      }, 250);
    };
    window.addEventListener("resize", this.handleResize);

    // Start animation loop
    this.start();
  }

  setBodyHeight() {
    if (this.content) {
      document.body.style.height = `${this.content.offsetHeight}px`;
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  animate() {
    if (!this.isRunning) return;

    // Smooth scroll easing formula
    this.current += (this.target - this.current) * this.ease;

    // Round to avoid jitter when close to target
    if (Math.abs(this.target - this.current) < 0.1) {
      this.current = this.target;
    }

    // Apply transform to wrapper
    if (this.wrapper) {
      this.wrapper.style.transform = `translate3d(0, -${this.current}px, 0)`;
    }

    // Apply parallax effect to elements with data-parallax attribute
    this.applyParallax();

    // Continue animation loop
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  applyParallax() {
    // Skip parallax on mobile/tablet - all sections scroll at same speed
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (isMobileOrTablet) return;

    const parallaxElements = document.querySelectorAll("[data-parallax]");

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const yPos = this.current * speed;
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }

  destroy() {
    this.stop();

    // Remove event listeners
    if (this.handleScroll) {
      window.removeEventListener("scroll", this.handleScroll);
    }
    if (this.handleResize) {
      window.removeEventListener("resize", this.handleResize);
    }

    // Reset styles
    if (this.wrapper) {
      this.wrapper.style.transform = "";
    }
    document.body.style.height = "";

    // Clear parallax
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    parallaxElements.forEach((el) => {
      el.style.transform = "";
    });
  }
}

export default SmoothScroll;
