/* ============================================
   LIQUID ETHER — vanilla JS fluid simulation
   Animated noise + mouse-reactive flow
   ============================================ */

(function () {
  "use strict";

  const DEFAULT_COLORS = ["#0cd123", "#5bfc9e", "#b9fabd"];

  function hexToVec3(hex) {
    let h = (hex || "").replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16) || 0;
    return [
      ((n >> 16) & 255) / 255,
      ((n >> 8) & 255) / 255,
      (n & 255) / 255,
    ];
  }

  /* ============================================
     SHADERS
     ============================================ */

  const vert = /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // FBM noise + animated domain warping for fluid look
  const frag = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uMouseActive;
    uniform vec3 uColor0;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uIntensity;
    uniform float uCursorSize;
    uniform float uAutoMode;
    uniform float uAutoSpeed;
    varying vec2 vUv;

    // Hash
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    // Value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // FBM
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * noise(p);
        p *= 2.05;
        a *= 0.5;
      }
      return v;
    }

    // Domain warp
    float warpedFbm(vec2 p, float t) {
      vec2 q = vec2(fbm(p + vec2(0.0, t * 0.3)), fbm(p + vec2(5.2, t * 0.2) + 1.3));
      vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7 + t * 0.15, 9.2)), fbm(p + 4.0 * q + vec2(8.3, 2.8 - t * 0.12)));
      return fbm(p + 4.0 * r);
    }

    void main() {
      vec2 uv = vUv;
      vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.5;

      // Auto demo center
      float autoT = uTime * uAutoSpeed;
      vec2 autoCenter = vec2(cos(autoT) * 0.6, sin(autoT * 0.7) * 0.4);
      vec2 mouse = mix(autoCenter, uMouse, uMouseActive);

      // Animated flow
      float t = uTime * 0.18;
      float n = warpedFbm(p * 1.2 + mouse * 0.5, t);

      // Mouse attractor
      float md = length(p - mouse * vec2(uResolution.x / uResolution.y, 1.0) * 1.2);
      float mouseInfluence = exp(-md * (1.8 / max(uCursorSize, 0.0001))) * uMouseActive * 0.4;
      n += mouseInfluence;

      // Two layers with offset for color mix
      float n2 = warpedFbm(p * 1.6 - vec2(t * 0.4, t * 0.25) + 7.0, t * 0.7);

      // Color mixing
      vec3 col = mix(uColor0, uColor1, smoothstep(0.20, 0.65, n));
      col = mix(col, uColor2, smoothstep(0.45, 0.85, n2));

      // Highlight
      float h = smoothstep(0.55, 0.95, n);
      col += vec3(0.2, 0.5, 0.3) * h * 0.6;

      // Dark veins
      float v = smoothstep(0.05, 0.0, n);
      col = mix(col, col * 0.25, v * 0.5);

      // Vignette
      float vig = smoothstep(1.3, 0.3, length(p));
      col *= mix(0.4, 1.0, vig);

      // Glow
      col *= uIntensity;

      // Alpha based on dark mask
      float alpha = 1.0;
      gl_FragColor = vec4(col, alpha);
    }
  `;

  /* ============================================
     WEBGL MANAGER
     ============================================ */

  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function createProgram(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }

  function createQuad(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0, 0,
         1, -1, 0, 1, 0,
        -1,  1, 0, 0, 1,
         1,  1, 0, 1, 1,
      ]),
      gl.STATIC_DRAW
    );
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 2, 1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
    gl.bindVertexArray(null);
    return vao;
  }

  function identityMatrix4() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }

  /* ============================================
     LIQUID ETHER CLASS
     ============================================ */

  class LiquidEther {
    constructor(container, options = {}) {
      this.container = container;
      this.colors = options.colors || DEFAULT_COLORS;
      this.intensity = options.intensity || 1.0;
      this.cursorSize = options.cursorSize || 1.0;
      this.autoDemo = options.autoDemo !== false;
      this.autoSpeed = options.autoSpeed || 0.6;
      this.autoIntensity = options.autoIntensity || 2.2;
      this.autoResumeDelay = options.autoResumeDelay || 3000;
      this.mouseForce = options.mouseForce || 20;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.startTime = performance.now();
      this.lastUserActivity = 0;
      this.mouseTarget = { x: 0, y: 0 };
      this.mouseCurrent = { x: 0, y: 0 };
      this.raf = null;
      this.resizeRaf = null;
      this.gl = null;
      this.program = null;
      this.quad = null;
      this.canvas = null;
      this.uniforms = null;
      this.bound = {
        onResize: this._onResize.bind(this),
        onPointer: this._onPointer.bind(this),
        onPointerLeave: this._onPointerLeave.bind(this),
        onTouch: this._onTouch.bind(this),
      };
    }

    init() {
      this._build();
      this._setupEvents();
      this._loop();
    }

    _build() {
      const canvas = document.createElement("canvas");
      canvas.className = "liquid-ether__canvas";
      this.canvas = canvas;
      this.container.appendChild(canvas);

      let gl = null;
      try {
        gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true });
      } catch (e) {}
      if (!gl) {
        try {
          gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
        } catch (e) {}
      }
      if (!gl) {
        console.warn("LiquidEther: WebGL not available");
        return;
      }
      this.gl = gl;

      this.program = createProgram(gl, vert, frag);
      this.quad = createQuad(gl);

      this.uniforms = {
        uTime: gl.getUniformLocation(this.program, "uTime"),
        uResolution: gl.getUniformLocation(this.program, "uResolution"),
        uMouse: gl.getUniformLocation(this.program, "uMouse"),
        uMouseActive: gl.getUniformLocation(this.program, "uMouseActive"),
        uColor0: gl.getUniformLocation(this.program, "uColor0"),
        uColor1: gl.getUniformLocation(this.program, "uColor1"),
        uColor2: gl.getUniformLocation(this.program, "uColor2"),
        uIntensity: gl.getUniformLocation(this.program, "uIntensity"),
        uCursorSize: gl.getUniformLocation(this.program, "uCursorSize"),
        uAutoMode: gl.getUniformLocation(this.program, "uAutoMode"),
        uAutoSpeed: gl.getUniformLocation(this.program, "uAutoSpeed"),
        mvMatrix: gl.getUniformLocation(this.program, "modelViewMatrix"),
        projMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      };

      this._resize();
    }

    _resize() {
      if (!this.canvas || !this.gl) return;
      const rect = this.container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * this.dpr));
      const h = Math.max(1, Math.floor(rect.height * this.dpr));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      this.gl.viewport(0, 0, w, h);
    }

    _setupEvents() {
      window.addEventListener("resize", this.bound.onResize, { passive: true });
      this.container.addEventListener("mousemove", this.bound.onPointer, { passive: true });
      this.container.addEventListener("mouseleave", this.bound.onPointerLeave, { passive: true });
      this.container.addEventListener("touchmove", this.bound.onTouch, { passive: true });
      this.container.addEventListener("touchend", this.bound.onPointerLeave, { passive: true });
    }

    _onResize() {
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => this._resize());
    }

    _onPointer(e) {
      const rect = this.container.getBoundingClientRect();
      this.mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.lastUserActivity = performance.now();
    }

    _onTouch(e) {
      if (!e.touches || !e.touches[0]) return;
      const rect = this.container.getBoundingClientRect();
      this.mouseTarget.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseTarget.y = -(((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1);
      this.lastUserActivity = performance.now();
    }

    _onPointerLeave() {
      this.lastUserActivity = 0;
    }

    _loop() {
      const tick = () => {
        this._render();
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }

    _render() {
      const gl = this.gl;
      if (!gl || !this.program) return;

      const now = performance.now();
      const t = (now - this.startTime) / 1000;

      // Auto demo logic
      const sinceUser = now - this.lastUserActivity;
      const autoActive = this.autoDemo && (this.lastUserActivity === 0 || sinceUser > this.autoResumeDelay);
      const autoRamp = this.lastUserActivity === 0
        ? 1
        : Math.min(1, Math.max(0, (sinceUser - this.autoResumeDelay) / (this.autoRampDuration * 1000)));

      let mouseX, mouseY, mouseActive;
      if (autoActive) {
        const at = t * this.autoSpeed;
        mouseX = Math.cos(at) * 0.6;
        mouseY = Math.sin(at * 0.7) * 0.4;
        mouseActive = autoRamp;
      } else {
        // Smooth follow
        const ease = 0.08;
        this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * ease;
        this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * ease;
        mouseX = this.mouseCurrent.x;
        mouseY = this.mouseCurrent.y;
        mouseActive = 1.0;
      }

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(this.program);
      gl.bindVertexArray(this.quad);

      gl.uniform1f(this.uniforms.uTime, t);
      gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.uniforms.uMouse, mouseX, mouseY);
      gl.uniform1f(this.uniforms.uMouseActive, mouseActive);
      gl.uniform3fv(this.uniforms.uColor0, hexToVec3(this.colors[0]));
      gl.uniform3fv(this.uniforms.uColor1, hexToVec3(this.colors[1] || this.colors[0]));
      gl.uniform3fv(this.uniforms.uColor2, hexToVec3(this.colors[2] || this.colors[1] || this.colors[0]));
      gl.uniform1f(this.uniforms.uIntensity, this.intensity);
      gl.uniform1f(this.uniforms.uCursorSize, this.cursorSize);
      gl.uniform1f(this.uniforms.uAutoMode, autoActive ? 1.0 : 0.0);
      gl.uniform1f(this.uniforms.uAutoSpeed, this.autoSpeed);

      const m = identityMatrix4();
      gl.uniformMatrix4fv(this.uniforms.mvMatrix, false, m);
      gl.uniformMatrix4fv(this.uniforms.projMatrix, false, m);

      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    }

    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      window.removeEventListener("resize", this.bound.onResize);
      this.container.removeEventListener("mousemove", this.bound.onPointer);
      this.container.removeEventListener("mouseleave", this.bound.onPointerLeave);
      this.container.removeEventListener("touchmove", this.bound.onTouch);
      this.container.removeEventListener("touchend", this.bound.onPointerLeave);
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      if (this.gl) {
        if (this.program) this.gl.deleteProgram(this.program);
        if (this.quad) this.gl.deleteVertexArray(this.quad);
      }
    }
  }

  /* ============================================
     INIT
     ============================================ */

  function init() {
    const containers = document.querySelectorAll("[data-liquid-ether]");
    containers.forEach((c) => {
      if (c.dataset.liquidEtherInit === "1") return;
      c.dataset.liquidEtherInit = "1";
      const colorsAttr = c.getAttribute("data-colors");
      const colors = colorsAttr ? colorsAttr.split(",") : DEFAULT_COLORS;
      const intensity = parseFloat(c.getAttribute("data-intensity") || "1.4");
      const cursorSize = parseFloat(c.getAttribute("data-cursor-size") || "1.0");
      try {
        const inst = new LiquidEther(c, {
          colors: colors,
          intensity: intensity,
          cursorSize: cursorSize,
          autoDemo: true,
          autoSpeed: 0.6,
          autoIntensity: 2.2,
          autoResumeDelay: 3000,
          autoRampDuration: 0.6,
          mouseForce: 20,
        });
        inst.init();
        c.__liquidEther = inst;
      } catch (e) {
        console.error("LiquidEther init failed", e);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
