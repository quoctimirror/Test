import { useEffect, useRef } from 'react';
import './NeonMetaballs.css';

const NeonMetaballs = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const CONFIG = {
      BLOB_COUNT: 4,
      BASE_RADIUS: [0.35, 0.5],
      SPEED: [0.15, 0.55], 
      INTENSITY: [0.6, 0.9],
      DPR_MAX: 1.5,
      EDGE_SHARPNESS: 0.01,
      BG_COLOR: [0.0, 0.0, 0.0],
    };

    const DPR = Math.min(window.devicePixelRatio || 1, CONFIG.DPR_MAX);

    function resize() {
      const w = Math.floor(canvas.clientWidth * DPR);
      const h = Math.floor(canvas.clientHeight * DPR);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    const vertSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragSrc = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_res;
      uniform float u_time;
      uniform int u_count;
      uniform vec4 u_balls[32];
      uniform vec3 u_bg;
      uniform float u_edgeSharp;

      float fieldAt(vec2 p) {
        float f = 0.0;
        for (int i = 0; i < 32; i++) {
          if (i >= u_count) break;
          vec4 b = u_balls[i];
          vec2 bp = b.xy - 0.5;
          bp.x *= u_res.x / u_res.y;
          float r = max(0.0001, b.z);
          float d = length(p - bp);
          float contrib = exp(-pow(d / r, 2.0) * 0.8) * b.w;
          f += contrib;
        }
        return f;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 p = uv - 0.5;
        p.x *= u_res.x / u_res.y;

        float field = fieldAt(p);
        float t = clamp(field, 0.0, 1.0);

        float eps = 1.0 / min(u_res.x, u_res.y);
        float fx = fieldAt(p + vec2(eps, 0.0)) - field;
        float fy = fieldAt(p + vec2(0.0, eps)) - field;
        float g = length(vec2(fx, fy));
        float edge = pow(clamp(1.0 - smoothstep(0.05, 0.8, g * 30.0 * u_edgeSharp), 0.0, 1.0), 0.3);

        vec3 lightPink = vec3(0.733, 0.137, 0.298);
        vec3 darkPink = vec3(0.604, 0.055, 0.204);
        vec3 black = vec3(0.0, 0.0, 0.0);

        vec3 base;
        if (t < 0.5) {
          base = mix(black, lightPink, smoothstep(0.0, 0.5, t));
        } else {
          base = mix(lightPink, darkPink, smoothstep(0.5, 1.0, t));
        }

        float threshold = 0.05;
        vec3 col = u_bg;
        
        if (t > threshold) {
          float intensity = min((t - threshold) * 2.0, 1.0);
          col = mix(u_bg, base, intensity);
          col += edge * darkPink * intensity * 0.8;
          
          float vign = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.22);
          col *= (0.55 + 0.45 * vign);
        }

        col = pow(max(col, 0.0), vec3(0.9));
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error("Shader compile error:\n" + info);
      }
      return sh;
    }

    function program(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(p);
        gl.deleteProgram(p);
        throw new Error("Program link error:\n" + info);
      }
      return p;
    }

    const prog = program(vertSrc, fragSrc);
    gl.useProgram(prog);

    // Fullscreen triangle
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), // big tri trick
      gl.STATIC_DRAW
    );
    
    const a_pos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

    const u_res = gl.getUniformLocation(prog, "u_res");
    const u_time = gl.getUniformLocation(prog, "u_time");
    const u_count = gl.getUniformLocation(prog, "u_count");
    const u_balls = gl.getUniformLocation(prog, "u_balls");
    const u_bg = gl.getUniformLocation(prog, "u_bg");
    const u_edgeSharp = gl.getUniformLocation(prog, "u_edgeSharp");

    gl.uniform3fv(u_bg, new Float32Array(CONFIG.BG_COLOR));
    gl.uniform1f(u_edgeSharp, CONFIG.EDGE_SHARPNESS);

    const MAX = 32;
    const count = Math.min(CONFIG.BLOB_COUNT, MAX);

    function randSeeded(i, a = 12.9898, b = 78.233, c = 43758.5453123) {
      const s = Math.sin(i * a + b) * c;
      return s - Math.floor(s);
    }
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const blobs = [];
    for (let i = 0; i < count; i++) {
      const r = lerp(CONFIG.BASE_RADIUS[0], CONFIG.BASE_RADIUS[1], randSeeded(i + 1));
      const sp = lerp(CONFIG.SPEED[0], CONFIG.SPEED[1], randSeeded(i + 2));
      const inten = lerp(CONFIG.INTENSITY[0], CONFIG.INTENSITY[1], randSeeded(i + 3));
      const ax = 0.2 + 0.2 * randSeeded(i + 4);
      const ay = 0.2 + 0.2 * randSeeded(i + 5);
      const phx = randSeeded(i + 6) * Math.PI * 2;
      const phy = randSeeded(i + 7) * Math.PI * 2;
      const dir = randSeeded(i + 8) > 0.5 ? 1 : -1;
      blobs.push({ r, sp, inten, ax, ay, phx, phy, dir, offsetX: 0, offsetY: 0 });
    }

    const mouse = {
      x: 0.5,
      y: 0.5,
      r: 0.11,
      inten: 1,
      active: false,
      vx: 0,
      vy: 0,
    };

    function onPointer(e) {
      const rect = canvas.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouse.vx = x - mouse.x;
        mouse.vy = y - mouse.y;
        mouse.x = x;
        mouse.y = y;
        mouse.active = true;
      } else {
        mouse.active = false;
      }
    }

    document.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerdown", onPointer, { passive: true });

    const ballsData = new Float32Array(MAX * 4);
    let start = performance.now();

    function frame() {
      const now = performance.now();
      const t = (now - start) / 1000;

      resize();

      for (let i = 0; i < count; i++) {
        const b = blobs[i];
        let x = 0.5 + b.ax * Math.cos((t * b.sp * 0.9 + b.phx) * b.dir);
        let y = 0.5 + b.ay * Math.sin((t * b.sp * 1.1 + b.phy) * b.dir);
        
        const off = i * 4;
        ballsData[off + 0] = x;
        ballsData[off + 1] = y;
        ballsData[off + 2] = b.r;
        ballsData[off + 3] = b.inten;
      }

      if (mouse.active) {
        const mSlot = count * 4;
        const speed = Math.hypot(mouse.vx, mouse.vy);
        const r = Math.min(0.18, 0.12 + speed * 0.4);
        mouse.r = lerp(mouse.r, r, 0.15);

        ballsData[mSlot + 0] = mouse.x;
        ballsData[mSlot + 1] = 1.0 - mouse.y;
        ballsData[mSlot + 2] = mouse.r;
        ballsData[mSlot + 3] = mouse.inten;
      }

      gl.uniform2f(u_res, canvas.width, canvas.height);
      gl.uniform1f(u_time, t);
      gl.uniform1i(u_count, mouse.active ? count + 1 : count);
      gl.uniform4fv(u_balls, ballsData);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationRef.current = requestAnimationFrame(frame);
    }

    gl.clearColor(CONFIG.BG_COLOR[0], CONFIG.BG_COLOR[1], CONFIG.BG_COLOR[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    addEventListener("resize", resize, { passive: true });
    resize();
    frame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div className={`neon-metaballs-container ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="neon-metaballs"
      />
    </div>
  );
};

export default NeonMetaballs;