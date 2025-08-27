import { useEffect, useRef } from 'react';
import './MetaballBackground.css';

const MetaballBackground = ({ className }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const glRef = useRef(null);
  const shaderProgramRef = useRef(null);
  const metaballsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseMetaballRef = useRef(null);

  // Shader sources
  const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    
    const int MAX_METABALLS = 100;
    
    uniform vec3 metaballs[MAX_METABALLS];
    uniform int metaballsAmount;
    
    uniform float spread;
    uniform float steps;
    uniform float blurStrength;
    
    uniform vec3 background;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 foreground;
    
    void main() {
      vec2 position = gl_FragCoord.xy;
      
      float value = 0.0;
      
      for(int i = 0; i < MAX_METABALLS; i++) {
        vec3 currentMetaball = metaballs[i];
        
        float currentDistance = pow(max(((currentMetaball.z + spread) - distance(currentMetaball.xy, position)) / spread, 0.0), 2.0);
        
        value += currentDistance;

        if(value >= 1.0 || i > metaballsAmount - 2) break;
      }

      value = sqrt(min(value, 1.0)) * steps;

      float valueWithSteps = floor(value) / steps;
      float ramp = (1.0 - (value - floor(value)) / steps) * blurStrength;

      // 4-color gradient
      vec3 color;
      float gradientValue = valueWithSteps * ramp;
      
      if (gradientValue < 0.25) {
        // Mix between background and color1
        color = mix(background, color1, gradientValue * 4.0);
      } else if (gradientValue < 0.5) {
        // Mix between color1 and color2
        color = mix(color1, color2, (gradientValue - 0.25) * 4.0);
      } else if (gradientValue < 0.75) {
        // Mix between color2 and foreground
        color = mix(color2, foreground, (gradientValue - 0.5) * 4.0);
      } else {
        // Pure foreground or beyond
        color = foreground;
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Configuration - Exact match with original HTML file
  const CONFIGURATION = {
    spread: 500,
    steps: 500,
    blurStrength: 0.5,
    background: { r: 196, g: 27, b: 89 },  // #C41B59
    color1: { r: 96, g: 4, b: 30 },        // #60041E
    color2: { r: 29, g: 0, b: 7 },         // #1D0007
    foreground: { r: 176, g: 22, b: 78 },  // #B0164E
    speed: 100, // Use original speed to match exact behavior
  };

  // Metaball class
  class Metaball {
    constructor() {
      this.size = 100 + Math.random() * 50; // Match original size: 100-150
      this.position = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      };
      this.velocity = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      };
    }

    update(delta) {
      this.position.x += this.velocity.x * delta * CONFIGURATION.speed;
      this.position.y += this.velocity.y * delta * CONFIGURATION.speed;

      const radius = (this.size + CONFIGURATION.spread) / 2;
      if (this.position.x < -radius) {
        this.position.x = -radius;
        this.velocity.x *= -1;
      } else if (this.position.x > window.innerWidth + radius) {
        this.position.x = window.innerWidth + radius;
        this.velocity.x *= -1;
      }

      if (this.position.y < -radius) {
        this.position.y = -radius;
        this.velocity.y *= -1;
      } else if (this.position.y > window.innerHeight + radius) {
        this.position.y = window.innerHeight + radius;
        this.velocity.y *= -1;
      }
    }

    toArray() {
      return [
        this.position.x,
        window.innerHeight - this.position.y,
        this.size,
      ];
    }
  }

  // Mouse metaball
  class MouseMetaball {
    constructor() {
      this.size = 120; // Match original size
      this.position = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      this.lerpFactor = 0.05; // Match original lerp factor
    }

    update(delta) {
      // Smoothly interpolate towards mouse position
      this.position.x += (mouseRef.current.x - this.position.x) * this.lerpFactor;
      this.position.y += (mouseRef.current.y - this.position.y) * this.lerpFactor;
    }

    toArray() {
      return [
        this.position.x,
        window.innerHeight - this.position.y,
        this.size,
      ];
    }
  }

  // Shader compilation functions
  const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const initShaderProgram = (gl, vsSource, fsSource) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  };

  const initRectangleBuffer = (gl) => {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
  };

  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    updateCanvasSize();

    // Initialize shaders and buffers
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const rectanglePosition = initRectangleBuffer(gl);
    shaderProgramRef.current = shaderProgram;

    // Get uniform locations
    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    const metaballsLocation = gl.getUniformLocation(shaderProgram, 'metaballs');
    const metaballsAmountLocation = gl.getUniformLocation(shaderProgram, 'metaballsAmount');
    const spreadLocation = gl.getUniformLocation(shaderProgram, 'spread');
    const stepsLocation = gl.getUniformLocation(shaderProgram, 'steps');
    const blurStrengthLocation = gl.getUniformLocation(shaderProgram, 'blurStrength');
    const foregroundColorLocation = gl.getUniformLocation(shaderProgram, 'foreground');
    const color2Location = gl.getUniformLocation(shaderProgram, 'color2');
    const color1Location = gl.getUniformLocation(shaderProgram, 'color1');
    const backgroundColorLocation = gl.getUniformLocation(shaderProgram, 'background');

    // Initialize metaballs
    const metaballs = [];
    for (let i = 0; i < 8; i++) { // Fewer metaballs for performance
      metaballs.push(new Metaball());
    }

    // Add mouse metaball
    const mouseMetaball = new MouseMetaball();
    metaballs.push(mouseMetaball);
    metaballsRef.current = metaballs;
    mouseMetaballRef.current = mouseMetaball;

    // Animation loop
    let lastTime = 0;
    const render = (time) => {
      const delta = (time - lastTime) / 1000;
      metaballsRef.current.forEach((mb) => mb.update(delta || 0));
      lastTime = time;

      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // IMPORTANT: Use program BEFORE setting uniforms
      gl.useProgram(shaderProgram);

      // Set uniforms - now these will work correctly
      gl.uniform3fv(
        metaballsLocation,
        new Float32Array(metaballsRef.current.map((mb) => mb.toArray()).flat())
      );
      gl.uniform1i(metaballsAmountLocation, metaballsRef.current.length);
      gl.uniform1f(stepsLocation, CONFIGURATION.steps);
      gl.uniform1f(spreadLocation, CONFIGURATION.spread);
      gl.uniform1f(blurStrengthLocation, CONFIGURATION.blurStrength);

      gl.uniform3f(
        foregroundColorLocation,
        CONFIGURATION.foreground.r / 255,
        CONFIGURATION.foreground.g / 255,
        CONFIGURATION.foreground.b / 255
      );
      gl.uniform3f(
        color2Location,
        CONFIGURATION.color2.r / 255,
        CONFIGURATION.color2.g / 255,
        CONFIGURATION.color2.b / 255
      );
      gl.uniform3f(
        color1Location,
        CONFIGURATION.color1.r / 255,
        CONFIGURATION.color1.g / 255,
        CONFIGURATION.color1.b / 255
      );
      gl.uniform3f(
        backgroundColorLocation,
        CONFIGURATION.background.r / 255,
        CONFIGURATION.background.g / 255,
        CONFIGURATION.background.b / 255
      );

      // Set up vertex attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, rectanglePosition);
      gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexPositionAttribute);

      // Draw the fullscreen quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(render);

    // Initialize mouse position
    mouseRef.current.x = canvas.width / 2;
    mouseRef.current.y = canvas.height / 2;

    // Mouse event listener that works with absolute positioning
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
    };

    // Add mouse event to the canvas
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Add to the document to catch all mouse movements over the canvas area
    const handleDocumentMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Only update if mouse is within canvas bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseRef.current.x = x;
        mouseRef.current.y = y;
      }
    };
    
    document.addEventListener('mousemove', handleDocumentMouseMove);

    // Resize event listener
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`metaball-background ${className || ''}`}
    />
  );
};

export default MetaballBackground;