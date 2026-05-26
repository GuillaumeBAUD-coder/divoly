"use client";

import { useEffect, useRef } from "react";

// ─── GLSL ────────────────────────────────────────────────────────────────────

const VERT = `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_mouseRaw;
uniform vec3  u_click;
uniform float u_speed;
uniform float u_intensity;

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5*u_res) / u_res.y;
  float t = u_time * (0.18 * u_speed);

  vec2 mp = p - 0.6 * (p - m) * exp(-length(p-m)*1.0);
  vec2 q = mp * 1.4;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    q = vec2(
      sin(q.y*1.30 + t + length(q)*0.55 + fi*0.4),
      cos(q.x*1.45 - t*0.7 + length(q)*0.55 - fi*0.3)
    ) + q*0.72;
  }
  float v = 0.5 + 0.5*sin(q.x + q.y + t);

  vec3 a = vec3(0.06, 0.02, 0.01);
  vec3 b = vec3(0.55, 0.15, 0.03);
  vec3 c = vec3(1.00, 0.52, 0.16);
  vec3 d = vec3(1.00, 0.88, 0.62);
  vec3 col = mix(a, b, smoothstep(0.0, 0.45, v));
  col = mix(col, c, smoothstep(0.4, 0.75, v));
  col = mix(col, d, smoothstep(0.78, 1.0, v));

  float sheen = sin(v*12.0 + p.x*4.0 + m.x*6.0 + t*1.2);
  col += vec3(0.14,0.08,0.04) * sheen * u_intensity * 0.6;

  float dm = length(p - m);
  col += exp(-dm*3.5) * vec3(1.0, 0.78, 0.5) * 0.18;

  if (u_click.z >= 0.0){
    vec2 cm = (u_click.xy - 0.5*u_res) / u_res.y;
    float bloom = exp(-length(p - cm)*4.0) * exp(-u_click.z*1.9);
    col += bloom * vec3(1.0, 0.7, 0.35) * 0.85;
  }

  col *= 1.0 - 0.18*smoothstep(0.6, 1.4, length(p));
  outColor = vec4(col, 1.0);
}`;

// ─── Component ───────────────────────────────────────────────────────────────

export function PlasmaMarbleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect mobile / low-end device: skip WebGL entirely, rely on CSS fallback
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" }) as WebGL2RenderingContext | null;
    if (!gl) return;

    // compile
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "a_pos");
    gl.linkProgram(prog);

    const u = {
      res:       gl.getUniformLocation(prog, "u_res"),
      time:      gl.getUniformLocation(prog, "u_time"),
      mouse:     gl.getUniformLocation(prog, "u_mouse"),
      mouseRaw:  gl.getUniformLocation(prog, "u_mouseRaw"),
      click:     gl.getUniformLocation(prog, "u_click"),
      speed:     gl.getUniformLocation(prog, "u_speed"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
    };

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // On mobile: cap DPR to 1 to halve GPU pixel count
    let dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth  * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // state
    const mouse    = [canvas.width * 0.5, canvas.height * 0.5];
    const mouseRaw = [canvas.width * 0.5, canvas.height * 0.5];
    const click    = { x: 0, y: 0, t0: -1 };
    const start    = performance.now() / 1000;

    // Target FPS: 60 on desktop, 30 on mobile
    const targetInterval = isMobile ? 1000 / 30 : 1000 / 60;
    let lastFrameTime = 0;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRaw[0] = (e.clientX - rect.left) * dpr;
      mouseRaw[1] = canvas.height - (e.clientY - rect.top) * dpr;
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.clientY > rect.bottom || e.clientY < rect.top) return;
      click.x  = (e.clientX - rect.left) * dpr;
      click.y  = canvas.height - (e.clientY - rect.top) * dpr;
      click.t0 = performance.now() / 1000;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    // Pause rendering when tab is hidden (Page Visibility API)
    let visible = !document.hidden;
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    let rafId = 0;
    const frame = (timestamp: number) => {
      rafId = requestAnimationFrame(frame);

      // Skip frame if tab hidden or not enough time has passed (FPS cap)
      if (!visible) return;
      if (timestamp - lastFrameTime < targetInterval) return;
      lastFrameTime = timestamp;

      const now = performance.now() / 1000;
      const t   = now - start;

      mouse[0] += (mouseRaw[0] - mouse[0]) * 0.08;
      mouse[1] += (mouseRaw[1] - mouse[1]) * 0.08;

      let clickAge = -1;
      if (click.t0 >= 0) {
        const age = now - click.t0;
        if (age < 3.5) clickAge = age;
        else click.t0 = -1;
      }

      gl.useProgram(prog);
      gl.uniform2f(u.res,       canvas.width, canvas.height);
      gl.uniform1f(u.time,      t);
      gl.uniform2f(u.mouse,     mouse[0],    mouse[1]);
      gl.uniform2f(u.mouseRaw,  mouseRaw[0], mouseRaw[1]);
      gl.uniform3f(u.click,     click.x,     click.y, clickAge);
      gl.uniform1f(u.speed,     0.95);
      gl.uniform1f(u.intensity, 0.45);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
