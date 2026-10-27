// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

// The 3D stage behind the page: a glass Vauta icon with its waveform glowing inside, and a particle field that
// morphs with the scroll between five shapes: the two voices spiralling into the glass (0), the Me and Others
// waveforms (1), a page of minutes (2), a vault around the glass (3) and a calm horizon disk (4). State 5 is
// state 0 again, for the finale. Where the stage sits on screen is a separate input, the pose of each section.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const FOV = 35;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const COLORS = {
  me: '#3fe0ff',
  others: '#ff4fd8',
  indigo: '#6c63ff',
  teal: '#1fd6c1',
  lavender: '#c9cbff',
  white: '#ffffff',
};

// Bar heights of the app icon's waveform, left to right.
const ICON_BARS = [0.22, 0.45, 0.79, 0.55, 1.0, 0.7, 0.88, 0.43, 0.22];

const particleVertex = /* glsl */ `
  #define PI 3.141592653589793
  uniform float uTime;
  uniform float uState;
  uniform float uSize;
  uniform float uPR;
  uniform float uScale;
  uniform float uAlpha;
  uniform vec3 cMe;
  uniform vec3 cOthers;
  uniform vec3 cIndigo;
  uniform vec3 cTeal;
  uniform vec3 cLavender;
  uniform vec3 cWhite;
  attribute vec4 aSeed;
  attribute float aKind;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  varying vec3 vColor;
  varying float vAlpha;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  // 0: the two voices spiral into the glass, Me from one side and Others from the other.
  void hero(out vec3 p, out vec3 col, out float a) {
    float side = aSeed.x < 0.5 ? -1.0 : 1.0;
    float h = hash(aSeed.y * 91.7 + aSeed.z * 13.1);
    float t = fract(aSeed.y + uTime * (0.035 + 0.03 * aSeed.z));
    float r = mix(7.2, 0.3, pow(t, 0.72));
    float ang = (side > 0.0 ? 0.0 : PI) + t * 5.4 + (h - 0.5) * 0.7;
    float thick = (aSeed.w - 0.5) * 0.16 * r + (h - 0.5) * 0.05;
    p = vec3(cos(ang) * r, thick, sin(ang) * r);
    p.yz = rot(-0.38) * p.yz;
    p.xy = rot(0.16) * p.xy;
    col = side > 0.0 ? cOthers : cMe;
    col = mix(col, cWhite, smoothstep(0.7, 1.0, t) * 0.55);
    a = smoothstep(0.0, 0.14, t) * (1.0 - smoothstep(0.84, 0.99, t)) * 0.8;
  }

  // 1: two live waveforms, Me above and Others below.
  void waves(out vec3 p, out vec3 col, out float a) {
    float x = aP1.x;
    float lane = aP1.y;
    float env = 0.55 + 0.45 * sin(x * 0.8 - uTime * 1.5 * lane + lane);
    env *= 0.5 + 0.5 * sin(x * 2.2 + uTime * (2.1 + 0.6 * lane));
    env = max(env, 0.0);
    float edge = smoothstep(6.8, 3.2, abs(x));
    float amp = (0.04 + 0.52 * env * env) * edge;
    float v = aP1.z * 2.0 - 1.0;
    v = sign(v) * pow(abs(v), 1.5);
    float y = lane * 0.7 + amp * v * (0.85 + 0.15 * sin(x * 31.0 + uTime * 9.0));
    p = vec3(x, y, (aSeed.w - 0.5) * 0.3);
    col = lane > 0.0 ? cMe : cOthers;
    col = mix(col, cWhite, (1.0 - abs(v)) * 0.25 * env);
    a = 0.75 * (0.3 + 0.7 * edge);
  }

  // 2: a page of minutes.
  void page(out vec3 p, out vec3 col, out float a) {
    p = aP2;
    p.y += sin(uTime * 0.8 + aP2.x * 0.6) * 0.04;
    float g = clamp(0.5 - aP2.y / 4.2, 0.0, 1.0);
    col = mix(cIndigo, cTeal, g);
    col = mix(col, cLavender, 0.35 + 0.3 * aSeed.z);
    a = 0.45;
  }

  // 3: a vault: a globe of latitude and longitude lines and two orbits, Me and Others.
  void vault(out vec3 p, out vec3 col, out float a) {
    float theta = aP3.x;
    float phi = aP3.y;
    float kind = aP3.z;
    if (kind < 0.5) {
      float r = 2.15;
      p = vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta)) * r;
      p.xz = rot(uTime * 0.12) * p.xz;
      col = mix(cTeal, cIndigo, 0.5 + p.y / (2.0 * r));
      col = mix(col, cLavender, 0.25);
      a = 0.5;
    } else if (kind < 1.5) {
      float r = 2.75 + (aSeed.w - 0.5) * 0.06;
      p = vec3(cos(theta + uTime * 0.32) * r, (aSeed.z - 0.5) * 0.05, sin(theta + uTime * 0.32) * r);
      p.yz = rot(1.15) * p.yz;
      p.xy = rot(0.35) * p.xy;
      col = cMe;
      a = 0.8;
    } else {
      float r = 2.95 + (aSeed.w - 0.5) * 0.06;
      p = vec3(cos(theta - uTime * 0.26) * r, (aSeed.z - 0.5) * 0.05, sin(theta - uTime * 0.26) * r);
      p.yz = rot(1.05) * p.yz;
      p.xy = rot(-0.5) * p.xy;
      col = cOthers;
      a = 0.8;
    }
  }

  // 4: a calm, almost edge-on disk that lies like a horizon behind the content.
  void disk(out vec3 p, out vec3 col, out float a) {
    float r = 2.4 + aSeed.w * 5.0 + (aSeed.z - 0.5) * 0.3;
    float th = aP3.x + uTime * 0.25 / (0.6 + r * 0.25);
    p = vec3(cos(th) * r, (aSeed.y - 0.5) * 0.06, sin(th) * r);
    p.yz = rot(1.36) * p.yz;
    col = mix(cMe, cOthers, 0.5 + 0.5 * sin(th * 2.0 + aSeed.x * 2.0));
    col = mix(col, cLavender, 0.35);
    a = 0.5 * smoothstep(7.6, 5.0, r);
  }

  void shape(int s, out vec3 p, out vec3 col, out float a) {
    if (s == 1) { waves(p, col, a); }
    else if (s == 2) { page(p, col, a); }
    else if (s == 3) { vault(p, col, a); }
    else if (s == 4) { disk(p, col, a); }
    else { hero(p, col, a); }
  }

  void main() {
    vec3 p; vec3 col; float a;
    if (aKind > 0.5) {
      p = aP1 + vec3(sin(uTime * 0.05 + aSeed.y * 6.283), cos(uTime * 0.04 + aSeed.z * 6.283), sin(uTime * 0.03 + aSeed.x * 6.283)) * 0.35;
      col = mix(cLavender, cTeal, aSeed.z);
      a = 0.22 * (0.6 + 0.4 * sin(uTime * (0.6 + aSeed.w) + aSeed.y * 30.0));
    } else {
      float s = clamp(uState, 0.0, 5.0);
      float seg = min(floor(s), 4.0);
      float f = s - seg;
      vec3 p0; vec3 c0; float a0;
      vec3 p1; vec3 c1; float a1;
      shape(int(seg), p0, c0, a0);
      shape(int(seg) + 1, p1, c1, a1);
      // The morph sweeps across the shape from left to right instead of every particle leaving at once.
      float stagger = clamp(p0.x / 14.0 + 0.5, 0.0, 1.0) * 0.3 + aSeed.y * 0.12;
      float st = clamp((f - stagger) / 0.58, 0.0, 1.0);
      st = st * st * (3.0 - 2.0 * st);
      p = mix(p0, p1, st);
      col = mix(c0, c1, st);
      a = mix(a0, a1, st);
      float swirl = sin(st * PI);
      p += vec3(
        sin(p.y * 1.7 + uTime * 0.9 + aSeed.x * 6.0),
        cos(p.x * 1.3 - uTime * 0.7 + aSeed.w * 4.0),
        sin(p.x * 0.9 + p.y * 1.1)
      ) * swirl * 0.3 * (0.5 + aSeed.z);
      a *= 1.0 - 0.35 * swirl;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.5 + 0.95 * aSeed.w * aSeed.w);
    gl_PointSize = size * uPR * uScale * (9.0 / -mv.z);
    vColor = col;
    vAlpha = a * uAlpha;
  }
`;

const particleFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    if (d > 1.0) discard;
    float m = exp(-d * 3.6) - 0.027;
    gl_FragColor = vec4(vColor, m * vAlpha);
  }
`;

const backgroundFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;
  float glow(vec2 uv, vec2 c, float r) { float d = length(uv - c) / r; return exp(-d * d); }
  void main() {
    vec2 uv = vUv;
    vec2 a = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = uv * a;
    vec3 col = vec3(0.0018, 0.0022, 0.006);
    col += vec3(0.06, 0.035, 0.22) * glow(p, vec2(0.15 * a.x + 0.05 * sin(uTime * 0.07), 0.9), 0.75) * 0.55;
    col += vec3(0.0, 0.11, 0.12) * glow(p, vec2(0.92 * a.x, 0.12 + 0.04 * cos(uTime * 0.05)), 0.85) * 0.5;
    col += vec3(0.12, 0.0, 0.1) * glow(p, vec2(0.75 * a.x, 0.95), 0.5) * 0.18;
    float v = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(a.x * 0.8, 1.0)));
    col *= mix(0.55, 1.0, v);
    // A touch of noise, so the dark gradient never shows bands.
    col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Particle targets that do not depend on time: the wave lanes, the page and the vault lines.
function buildParticles(count) {
  const seed = new Float32Array(count * 4);
  const kind = new Float32Array(count);
  const p1 = new Float32Array(count * 3);
  const p2 = new Float32Array(count * 3);
  const p3 = new Float32Array(count * 3);
  const dustShare = 0.16;

  // The page of minutes: rectangles of "text" with rounded ends, drawn as dense point strips.
  const W = 3.0;
  const H = 3.9;
  const left = -W / 2 + 0.36;
  const lines = [];
  let y = H / 2 - 0.42;
  const push = (w, h, x = left, kind = 'text') => lines.push({ x, y, w, h, kind });
  push(1.85, 0.15, left, 'title'); y -= 0.3;
  push(1.25, 0.06, left, 'meta'); y -= 0.38;
  push(0.62, 0.07, left, 'label'); y -= 0.22;
  for (const w of [2.28, 2.28, 2.2, 1.45]) { push(w, 0.055); y -= 0.17; }
  y -= 0.15;
  push(0.7, 0.07, left, 'label'); y -= 0.24;
  for (const w of [1.95, 1.6]) { push(0.1, 0.1, left, 'bullet'); push(w, 0.055, left + 0.2); y -= 0.22; }
  y -= 0.1;
  push(0.45, 0.07, left, 'label'); y -= 0.24;
  for (const w of [1.75, 1.3]) { push(0.1, 0.1, left, 'bullet'); push(w, 0.055, left + 0.2); y -= 0.22; }
  const area = lines.reduce((s, l) => s + l.w * Math.max(l.h, 0.05), 0);
  const edgeLen = 2 * (W + H);

  for (let i = 0; i < count; i++) {
    const r = Math.random;
    seed.set([r(), r(), r(), r()], i * 4);
    const isDust = r() < dustShare;
    kind[i] = isDust ? 1 : 0;

    if (isDust) {
      const rad = 3.5 + Math.pow(r(), 0.7) * 8.5;
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      p1.set([Math.sin(ph) * Math.cos(th) * rad * 1.4, Math.cos(ph) * rad * 0.8, Math.sin(ph) * Math.sin(th) * rad - 2], i * 3);
      continue;
    }

    // 1: the waveform lanes.
    p1.set([(r() * 2 - 1) * 6.8, r() < 0.5 ? 1 : -1, r()], i * 3);

    // 2: page outline (20%) or text lines.
    if (r() < 0.2) {
      let d = r() * edgeLen;
      let px, py;
      if (d < W) { px = -W / 2 + d; py = H / 2; }
      else if ((d -= W) < H) { px = W / 2; py = H / 2 - d; }
      else if ((d -= H) < W) { px = W / 2 - d; py = -H / 2; }
      else { d -= W; px = -W / 2; py = -H / 2 + d; }
      // Fold the top-right corner like the icon's page.
      const fold = 0.5;
      if (px > W / 2 - fold && py > H / 2 - fold && (px - (W / 2 - fold)) + (py - (H / 2 - fold)) > fold) {
        const t = r();
        px = W / 2 - fold + t * fold;
        py = H / 2 - t * fold;
      }
      p2.set([px + (r() - 0.5) * 0.02, py + (r() - 0.5) * 0.02, 0.9 + (r() - 0.5) * 0.04], i * 3);
    } else {
      let pick = r() * area;
      let line = lines[0];
      for (const l of lines) { pick -= l.w * Math.max(l.h, 0.05); if (pick <= 0) { line = l; break; } }
      let px, py;
      if (line.kind === 'bullet') {
        const a = r() * Math.PI * 2;
        const rr = line.w / 2 * (0.75 + 0.25 * r());
        px = line.x + line.w / 2 + Math.cos(a) * rr;
        py = line.y + Math.sin(a) * rr;
      } else {
        px = line.x + r() * line.w;
        py = line.y + (r() - 0.5) * line.h;
      }
      p2.set([px, py, 0.9 + (r() - 0.5) * 0.05], i * 3);
    }

    // 3: vault globe lines (70%) and the two orbits.
    const v = r();
    if (v < 0.7) {
      if (r() < 0.55) {
        const lat = Math.floor(r() * 11) + 1;
        p3.set([r() * Math.PI * 2, (lat / 12) * Math.PI, 0], i * 3);
      } else {
        const lon = Math.floor(r() * 14);
        p3.set([(lon / 14) * Math.PI * 2, r() * Math.PI, 0], i * 3);
      }
    } else {
      p3.set([r() * Math.PI * 2, 0, v < 0.85 ? 1 : 2], i * 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  geometry.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
  geometry.setAttribute('aP1', new THREE.BufferAttribute(p1, 3));
  geometry.setAttribute('aP2', new THREE.BufferAttribute(p2, 3));
  geometry.setAttribute('aP3', new THREE.BufferAttribute(p3, 3));
  return geometry;
}

// A studio of coloured light for the glass to reflect.
function buildEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0x020208, side: THREE.BackSide }));
  env.add(room);
  const panel = (color, intensity, w, h, pos, look = [0, 0, 0]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  panel('#6c63ff', 3.0, 6, 9, [-7, 1, 2]);
  panel('#1fd6c1', 2.6, 6, 8, [7, -1, 1]);
  panel('#ffffff', 5.0, 10, 1.2, [0, 7, 2]);
  panel('#ff4fd8', 1.6, 5, 4, [3, -6, -3]);
  panel('#3fe0ff', 1.4, 4, 4, [-3, -5, 5]);
  panel('#ffffff', 1.2, 3, 3, [2, 3, 8]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  return texture;
}

function buildCore() {
  const core = new THREE.Group();

  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(2.4, 2.4, 0.56, 10, 0.42),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.06,
      transmission: 1,
      thickness: 1.1,
      ior: 1.48,
      iridescence: 0.75,
      iridescenceIOR: 1.32,
      iridescenceThicknessRange: [180, 620],
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      attenuationColor: new THREE.Color('#b9b5ff'),
      attenuationDistance: 2.6,
      specularIntensity: 1,
      envMapIntensity: 1.35,
    }),
  );
  glass.material.depthWrite = false;
  core.add(glass);

  const bars = [];
  const barGeometry = new THREE.CapsuleGeometry(0.056, 1, 8, 20);
  const from = new THREE.Color('#5b4dff');
  const to = new THREE.Color('#14d9c4');
  ICON_BARS.forEach((h, i) => {
    const c = from.clone().lerp(to, i / (ICON_BARS.length - 1));
    const m = new THREE.Mesh(barGeometry, new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(0.2), emissive: c, emissiveIntensity: 1.8, roughness: 0.4 }));
    m.position.set((i - 4) * 0.17, 0.05, 0);
    m.userData.base = h;
    core.add(m);
    bars.push(m);
  });

  // A soft halo behind the glass.
  const haloTexture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(6.5, 6.5),
    new THREE.MeshBasicMaterial({ map: haloTexture, color: new THREE.Color('#4a3fd1').multiplyScalar(0.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  halo.position.z = -1.2;
  core.add(halo);

  return { core, glass, bars, halo };
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export async function createStage(canvas, { reducedMotion = false } = {}) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const mobile = coarse || small;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'default', stencil: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x04050b, 1);

  // Budget device pixels rather than cap the pixel ratio, so a large Retina window costs no more than a laptop.
  // The scene is soft light and particles: below one device pixel per CSS pixel on very large screens still looks
  // the same.
  const budget = mobile ? 0.85e6 : 1.8e6;
  let dprCap = mobile ? 1.75 : 2;
  const pickDpr = (w, h) => Math.max(0.75, Math.min(window.devicePixelRatio || 1, dprCap, Math.sqrt(budget / (w * h))));
  let dpr = pickDpr(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  scene.environment = buildEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Background, drawn first and behind everything.
  const bgUniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } };
  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: bgUniforms,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
      fragmentShader: backgroundFragment,
      depthWrite: false,
      depthTest: false,
    }),
  );
  background.frustumCulled = false;
  background.renderOrder = -10;
  scene.add(background);

  const rig = new THREE.Group();
  scene.add(rig);

  const { core, glass, bars } = buildCore();
  rig.add(core);
  // The glass's refraction pass is the costliest part of the frame: draw it at half resolution.
  renderer.transmissionResolutionScale = 0.5;

  const count = mobile ? 22000 : 50000;
  const uniforms = {
    uTime: { value: 0 },
    uState: { value: 0 },
    uSize: { value: mobile ? 3.4 : 3.0 },
    uPR: { value: dpr },
    uScale: { value: 1 },
    uAlpha: { value: 1 },
    cMe: { value: new THREE.Color(COLORS.me) },
    cOthers: { value: new THREE.Color(COLORS.others) },
    cIndigo: { value: new THREE.Color(COLORS.indigo) },
    cTeal: { value: new THREE.Color(COLORS.teal) },
    cLavender: { value: new THREE.Color(COLORS.lavender) },
    cWhite: { value: new THREE.Color(COLORS.white) },
  };
  const points = new THREE.Points(
    buildParticles(count),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  points.frustumCulled = false;
  rig.add(points);

  // No multisampling: the composer would multisample every pass, which doubled the frame's GPU time for edges that
  // the bloom softens anyway.
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), mobile ? 0.75 : 0.9, 0.6, 0.62);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // Where the stage sits for each section of the page (its pose), by layout: x and y as a share of the half
  // screen, s the scale of the whole rig, and gz, gs, gry the glass icon's depth, scale and turn.
  // Wide screens keep the copy on the left; later sections move the stage out of the way of centred headlines.
  let aspect = 1;
  let halfW = 1;
  let halfH = 1;
  const poses = {
    wide: [
      { x: 0.62, y: 0.0, s: 0.9, gz: 0, gs: 1, gry: 0 }, // hero
      { x: 0.36, y: 0.0, s: 1.0, gz: 0, gs: 0.86, gry: 0.3 }, // 01 waves
      { x: 0.44, y: 0.0, s: 0.86, gz: -5, gs: 0.25, gry: -0.35 }, // 02 page
      { x: 0.44, y: 0.0, s: 0.82, gz: 0, gs: 0.95, gry: 0 }, // 03 vault
      { x: 0.86, y: 0.42, s: 0.4, gz: -1, gs: 0.9, gry: 0 }, // features
      { x: 0.0, y: -0.62, s: 1.15, gz: -3, gs: 0.5, gry: 0 }, // screens
      { x: -0.8, y: 0.34, s: 0.48, gz: -1, gs: 0.85, gry: 0 }, // numbers
      { x: 0.45, y: 0.0, s: 0.8, gz: -1, gs: 0.8, gry: 0 }, // privacy
      { x: 0.0, y: -0.66, s: 1.2, gz: -3, gs: 0.5, gry: 0 }, // compare
      { x: 0.0, y: 0.5, s: 0.5, gz: 0, gs: 1.3, gry: 0 }, // finale: follows .finale-orb, see anchorFinale
    ],
    tall: [
      { x: 0, y: 0.6, s: 0.66, gz: 0, gs: 1, gry: 0 },
      { x: 0, y: 0.34, s: 0.86, gz: 0, gs: 0.86, gry: 0.3 },
      { x: 0, y: 0.36, s: 0.6, gz: -5, gs: 0.25, gry: -0.35 },
      { x: 0, y: 0.38, s: 0.56, gz: 0, gs: 0.95, gry: 0 },
      { x: 0, y: 0.62, s: 0.4, gz: -1, gs: 0.9, gry: 0 },
      { x: 0, y: -0.7, s: 1.0, gz: -3, gs: 0.5, gry: 0 },
      { x: 0, y: 0.62, s: 0.4, gz: -1, gs: 0.85, gry: 0 },
      { x: 0, y: 0.62, s: 0.45, gz: -1, gs: 0.8, gry: 0 },
      { x: 0, y: -0.7, s: 1.0, gz: -3, gs: 0.5, gry: 0 },
      { x: 0, y: 0.55, s: 0.5, gz: 0, gs: 1.3, gry: 0 },
    ],
  };

  // Free space on tall screens for a pose's shape, from fit(); and the height of each pose's shape in scene units.
  const fitted = new Map();
  const shapeHeight = [2.4, 2.6, 3.9, 5.9];
  let baseScale = 1;

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    dpr = pickDpr(w, h);
    aspect = w / h;
    if (aspect >= 1) {
      camera.position.z = 9;
    } else {
      // On tall screens, keep the glass about three quarters of the screen wide.
      camera.position.z = THREE.MathUtils.clamp(2.05 / (TAN * aspect), 9, 16);
    }
    halfH = camera.position.z * TAN;
    halfW = halfH * aspect;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    // The bloom pass sizes itself from the composer: draw it at half resolution on phones.
    const k = mobile ? 0.5 : 1;
    bloom.setSize(Math.round(w * dpr * k), Math.round(h * dpr * k));
    uniforms.uPR.value = dpr;
    baseScale = aspect >= 1 ? Math.min(1.25, Math.max(0.8, h / 900)) : 1;
    bgUniforms.uRes.value.set(w, h);
    fitted.forEach((space, i) => fitPose(i, space));
  }
  resize();

  // Inputs from the page, eased in the loop.
  const input = { state: 0, dim: 1, pose: 0 };
  const eased = { state: 0, dim: 1, pose: 0 };
  const pointer = new THREE.Vector2();
  const pointerEased = new THREE.Vector2();
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || reducedMotion) return;
    pointer.set(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  const timer = new THREE.Timer();
  let time = 0;
  let frames = 0;
  let degraded = 0;
  let window_ = [];
  let windowStart = 0;
  let idle = 0;
  let dirty = true;

  // On tall screens a pose's shape sits in the free space above the copy, given in CSS pixels from the top of the
  // screen at the moment that section is read.
  function fitPose(i, space) {
    const h = canvas.clientHeight || window.innerHeight;
    const center = (space.top + space.bottom) / 2;
    const avail = Math.max(0, space.bottom - space.top);
    const unitsPerPx = (2 * halfH) / h;
    poses.tall[i].y = 1 - (2 * center) / h;
    poses.tall[i].s = THREE.MathUtils.clamp((avail * 0.82 * unitsPerPx) / shapeHeight[i], 0.4, 0.9);
  }

  // The finale's glass follows an empty box above its headline, given as a rectangle in CSS pixels.
  function anchorFinale(rect) {
    if (!rect) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    const unitsPerPx = (2 * halfH) / h;
    for (const list of [poses.wide, poses.tall]) {
      const pose = list[list.length - 1];
      pose.x = ((rect.left + rect.width / 2) / w) * 2 - 1;
      pose.y = 1 - (2 * (rect.top + rect.height / 2)) / h;
      // The vault (5.9 units across) fills the box; the glass sits inside it.
      pose.s = THREE.MathUtils.clamp((rect.height * 0.88 * unitsPerPx) / 5.9, 0.15, 1);
    }
  }

  function lerpLayout(list, s) {
    const i = Math.min(Math.floor(s), list.length - 2);
    const f = smoothstep(0, 1, s - i);
    const a = list[i];
    const b = list[i + 1];
    const out = {};
    for (const k of Object.keys(a)) out[k] = a[k] + (b[k] - a[k]) * f;
    return out;
  }

  function frame(timestamp) {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);
    // With reduced motion the stage holds still and only redraws when the page asks for a change.
    if (reducedMotion) {
      if (!dirty) return;
      dirty = false;
    } else {
      time += dt;
    }
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    eased.state += (input.state - eased.state) * k;
    eased.pose += (input.pose - eased.pose) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 2.6));
    eased.dim += (input.dim - eased.dim) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    pointerEased.lerp(pointer, 1 - Math.exp(-dt * 2.5));

    const s = THREE.MathUtils.clamp(eased.state, 0, 5);
    uniforms.uTime.value = time;
    uniforms.uState.value = s;
    bgUniforms.uTime.value = time;

    const pose = lerpLayout(aspect >= 1 ? poses.wide : poses.tall, THREE.MathUtils.clamp(eased.pose, 0, poses.wide.length - 1));
    // A smaller shape packs the same particles closer: make them smaller and fainter to match.
    const packed = THREE.MathUtils.clamp(pose.s / (aspect >= 1 ? 0.8 : 0.66), 0.4, 1);
    uniforms.uScale.value = baseScale * Math.max(0.6, packed);
    uniforms.uAlpha.value = packed;
    rig.position.set(pose.x * halfW, pose.y * halfH, 0);
    rig.scale.setScalar(pose.s);
    core.position.z = pose.gz;
    core.scale.setScalar(pose.gs);
    core.rotation.y = pose.gry + Math.sin(time * 0.35) * 0.22 + pointerEased.x * 0.5;
    core.rotation.x = Math.sin(time * 0.27) * 0.08 + pointerEased.y * 0.3;

    bars.forEach((bar, i) => {
      const live = 0.55 + 0.45 * Math.sin(time * (2.2 + i * 0.37) + i * 1.7) * Math.sin(time * 1.3 + i);
      const h = bar.userData.base * (0.55 + 0.45 * live) * 1.2;
      bar.scale.y = Math.max(0.08, h);
    });

    camera.position.x = pointerEased.x * 0.6;
    camera.position.y = -pointerEased.y * 0.4;
    // The camera leans towards the stage on wide screens, except at the finale, which sits exactly on its anchor.
    const follow = aspect >= 1 ? 0.25 * (1 - smoothstep(poses.wide.length - 2, poses.wide.length - 1, eased.pose)) : 0;
    camera.lookAt(rig.position.x * follow, rig.position.y * follow, 0);

    canvas.style.opacity = eased.dim.toFixed(3);

    // Once the stage has settled behind dimmed content, draw every other frame to save battery.
    const settled = Math.abs(input.state - eased.state) < 0.002 && Math.abs(input.pose - eased.pose) < 0.002;
    idle = settled ? idle + dt : 0;
    frames++;
    if (idle > 0.5 && eased.dim < 0.6 && frames % 2) return;
    composer.render(dt);

    // Step quality down on devices that cannot keep up: every 1.5 s, look at the median frame time of the frames
    // drawn. Skip the first second, while the page is still settling.
    if (reducedMotion || degraded >= 3 || frames < 60) return;
    const now = performance.now();
    if (!windowStart) windowStart = now;
    window_.push(dt);
    if (now - windowStart > 1500) {
      window_.sort((a, b) => a - b);
      if (window_[window_.length >> 1] > 1 / 45) {
        degraded++;
        if (degraded === 1) dprCap = Math.max(1, dpr - 0.5);
        else if (degraded === 2) dprCap = 1;
        else {
          bloom.enabled = false;
          points.geometry.setDrawRange(0, Math.floor(count * 0.6));
        }
        resize();
      }
      window_ = [];
      windowStart = now;
    }
  }

  let running = false;
  function start() {
    if (running) return;
    running = true;
    renderer.setAnimationLoop(frame);
  }
  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
  }

  // The canvas is sized to the large viewport, so it keeps its size as phone toolbars show and hide.
  new ResizeObserver(() => {
    resize();
    dirty = true;
  }).observe(canvas);

  // Compile every shader before the first frame, so the page does not stall when the stage appears.
  await renderer.compileAsync(scene, camera);
  start();

  return {
    set(state, dim, pose) {
      if (state !== input.state || dim !== input.dim || pose !== input.pose) dirty = true;
      input.state = state;
      input.dim = dim;
      input.pose = pose;
    },
    finale(rect) {
      anchorFinale(rect);
      dirty = true;
    },
    fit(i, space) {
      fitted.set(i, space);
      fitPose(i, space);
      dirty = true;
    },
    jump(state, dim, pose) {
      input.state = eased.state = state;
      input.dim = eased.dim = dim;
      input.pose = eased.pose = pose;
      dirty = true;
    },
    start,
    stop,
  };
}
