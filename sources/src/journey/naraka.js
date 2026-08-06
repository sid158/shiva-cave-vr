/**
 * Section 4 — Naraka. The walk.
 *
 * The black hole sets us down at the head of a long stone causeway. Chained
 * posts. On both sides, great iron cauldrons boil with fire, and dark figures
 * rise out of them — silhouettes only, coming apart like ash. Fire falls from
 * the sky in distant columns with small shapes tumbling inside. A forest of
 * lava spires runs to the horizon under a churning blood-dark sky.
 *
 * And above the far gate, the clouds hold a face with horns. Its eyes are
 * open. They follow you the whole way. That is the engine of the scene —
 * everything else is spectacle; being WATCHED is personal.
 *
 * The walk is on rails, dead slow, no control. It ends when the voice gives
 * the mantra — the fires die mid-flame, the gate turns white, and water is
 * heard for the first time in the whole journey.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const WALK_LENGTH = 120;         // metres of causeway actually travelled

const NOISE = /* glsl */`
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.07 + 13.7; a *= 0.5; }
    return v;
  }
  float rfbm(vec2 p) {
    float v = 0.0, a = 0.55;
    for (int i = 0; i < 4; i++) {
      float n = 1.0 - abs(2.0 * noise(p) - 1.0);
      v += a * n * n;
      p = p * 2.13 + 17.1;
      a *= 0.5;
    }
    return v;
  }
`;

const BILLBOARD_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;

const FLAT_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// fire in a pot — tongues tearing upward, dying to embers when released
// ---------------------------------------------------------------------------
const POTFIRE_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uFire;    // 1 burning .. 0 dead
  uniform float uSeed;
  varying vec2 vUv;
  ${''}
  __NOISE__
  void main() {
    vec2 p = vUv;                       // x -1..1, y -1..1 (bottom at pot rim)
    float yy = p.y * 0.5 + 0.5;         // 0 bottom .. 1 top
    float tongues = rfbm(vec2(p.x * 3.0 + uSeed * 9.0, yy * 2.2 - uTime * (0.9 + uSeed * 0.3)));
    float body = tongues * (1.0 - yy * yy) * (1.0 - abs(p.x) * abs(p.x));
    body = pow(body, 1.4);
    vec3 col = mix(vec3(1.0, 0.25, 0.03), vec3(1.0, 0.75, 0.25), body);
    col = mix(col, vec3(1.0, 0.95, 0.7), pow(body, 3.0));
    float a = body * uFire * 1.4;
    if (a < 0.006) discard;
    gl_FragColor = vec4(col * a * 1.8, a);
  }
`;

// ---------------------------------------------------------------------------
// the causeway — cracked stone, fire breathing in the cracks
// ---------------------------------------------------------------------------
const ROAD_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uFire;
  varying vec2 vUv;      // x across (0..1), y along the full length
  ${''}
  __NOISE__
  void main() {
    vec2 p = vec2(vUv.x * 3.4, vUv.y * 160.0);
    // flagstone cells
    float cell = fbm(p * 0.9);
    float cracks = rfbm(p * 0.55);
    float crackLine = smoothstep(0.74, 0.95, cracks);
    vec3 stone = mix(vec3(0.024, 0.015, 0.011), vec3(0.058, 0.040, 0.030), cell);
    // the fire underneath breathes through the cracks
    float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + p.y * 0.25);
    vec3 col = stone + vec3(1.0, 0.26, 0.03) * crackLine * pulse * 0.4 * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    gl_FragColor = vec4(col, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// spire ridges and the burning horizon behind them
// ---------------------------------------------------------------------------
const SPIRE_FRAG = /* glsl */`
  precision highp float;
  uniform float uForm;
  uniform float uTall;    // ridge height factor
  varying vec2 vUv;
  float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float ridge(float x) {
    float v = 0.0, a = 0.6, f = 9.0;
    for (int i = 0; i < 4; i++) {
      float xx = x * f;
      float tri = abs(fract(xx + hash1(float(i) * 7.3)) * 2.0 - 1.0);
      v += pow(1.0 - tri, 3.0) * a;      // needle peaks, not hills
      a *= 0.55; f *= 2.3;
    }
    return v * uTall;
  }
  void main() {
    float h = ridge(vUv.x);
    float m = 1.0 - smoothstep(h - 0.015, h, vUv.y);
    float a = m * uForm;
    if (a < 0.004) discard;
    float edge = smoothstep(h - 0.10, h, vUv.y);
    vec3 col = mix(vec3(0.010, 0.004, 0.004), vec3(0.45, 0.10, 0.02), edge * edge);
    gl_FragColor = vec4(col, a);
  }
`;

const HELLGLOW_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  ${''}
  __NOISE__
  void main() {
    float glow = exp(-vUv.y * 2.2);
    float lick = fbm(vec2(vUv.x * 16.0, vUv.y * 4.0 - uTime * 0.05));
    vec3 col = mix(vec3(0.50, 0.06, 0.01), vec3(1.0, 0.35, 0.06), glow * lick);
    float a = glow * (0.4 + 0.4 * lick) * uForm * 0.85;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`;

// ---------------------------------------------------------------------------
// a column of falling fire
// ---------------------------------------------------------------------------
const FIREFALL_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSeed;
  varying vec2 vUv;
  ${''}
  __NOISE__
  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float core = exp(-x * x * 4.0);
    float streaks = pow(noise(vec2(vUv.x * 9.0 + uSeed * 31.0, vUv.y * 5.0 + uTime * (0.55 + uSeed * 0.2))), 2.0);
    float vf = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    vec3 col = mix(vec3(0.9, 0.20, 0.03), vec3(1.0, 0.65, 0.20), streaks);
    float a = core * (streaks * 1.5 + 0.22) * vf * uForm * 1.25;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.0, a);
  }
`;

// ---------------------------------------------------------------------------
// THE WATCHER — horns, ember eyes that follow, a breathing maw
// ---------------------------------------------------------------------------
const WATCHER_DARK_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  varying vec2 vUv;
  ${''}
  __NOISE__
  // distance to a circular horn arc, mirrored
  float hornArc(vec2 p, float sgn) {
    vec2 c = vec2(0.26 * sgn, 0.10);
    float R = 0.38;
    float d = abs(length(p - c) - R);
    float ang = atan(p.y - c.y, (p.x - c.x) * sgn);
    float win = smoothstep(-0.2, 0.15, ang) * smoothstep(2.6, 1.9, ang);
    // thick at the temple, tapering to the raised tip
    float w = mix(0.16, 0.02, smoothstep(0.0, 2.2, ang));
    return smoothstep(w, w * 0.35, d) * win;
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float smoke = fbm(p * 2.8 + vec2(uTime * 0.015, -uTime * 0.02));

    // the skull: wide cranium, hollowed cheeks, a jaw that narrows
    vec2 e = p; e.y = (e.y - 0.02) * 1.05;
    float skull = 1.0 - smoothstep(0.38, 0.70, length(e * vec2(1.0, 1.15)));
    float jaw = 1.0 - smoothstep(0.20, 0.44, length((p - vec2(0.0, -0.40)) * vec2(1.30, 1.0)));
    float cheekL = smoothstep(0.08, 0.26, length(p - vec2(-0.32, -0.14)));
    float cheekR = smoothstep(0.08, 0.26, length(p - vec2(0.32, -0.14)));
    float head = max(skull, jaw) * (0.65 + 0.35 * smoke) * cheekL * cheekR;

    float horns = max(hornArc(p, -1.0), hornArc(p, 1.0));

    float a = max(head, horns) * uWatch * 0.88;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vec3(0.006, 0.002, 0.002), a);
  }
`;

const WATCHER_GLOW_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  uniform float uBolt;    // lightning behind him
  uniform vec2  uLook;    // where the pupils point — at YOU
  varying vec2 vUv;
  ${''}
  __NOISE__
  float hornArc(vec2 p, float sgn) {
    vec2 c = vec2(0.26 * sgn, 0.10);
    float R = 0.38;
    float d = abs(length(p - c) - R);
    float ang = atan(p.y - c.y, (p.x - c.x) * sgn);
    float win = smoothstep(-0.2, 0.15, ang) * smoothstep(2.6, 1.9, ang);
    float w = mix(0.16, 0.02, smoothstep(0.0, 2.2, ang));
    return smoothstep(w, w * 0.35, d) * win;
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    vec3 col = vec3(0.0);
    float smoke = fbm(p * 3.0 + vec2(uTime * 0.02, -uTime * 0.03));

    // He is BARELY there. Most of the time you doubt you saw him at all —
    // only the lightning betrays the shape in the cloud, for half a second.
    vec2 e = p; e.y = (e.y - 0.02) * 1.05;
    float rr = length(e * vec2(1.0, 1.12));
    float rim = exp(-pow(rr - 0.52, 2.0) * 34.0) * (0.35 + 0.65 * smoke);
    col += mix(vec3(0.30, 0.05, 0.015), vec3(0.75, 0.55, 0.65), uBolt) * rim
         * (0.10 + uBolt * 2.6);

    float horns = max(hornArc(p, -1.0), hornArc(p, 1.0));
    col += vec3(0.60, 0.16, 0.03) * horns * (0.08 + smoke * 0.06 + uBolt * 1.6);

    // the eyes: two dim embers, always slightly wrong to look at. They do
    // not glow — they SMOULDER, and they never blink.
    for (int s = -1; s <= 1; s += 2) {
      vec2 c = vec2(0.20 * float(s), 0.04);
      vec2 q = p - c;
      float eye = 1.0 - smoothstep(0.030, 0.085, length(q * vec2(1.0, 1.8)));
      float smoulder = 0.30 + 0.10 * sin(uTime * 0.23 + float(s));
      col += vec3(0.85, 0.16, 0.02) * eye * (smoulder + uBolt * 1.2);
      vec2 pq = q - uLook * 0.035;
      float pupil = 1.0 - smoothstep(0.010, 0.026, length(pq * vec2(1.0, 0.9)));
      col -= vec3(0.8, 0.15, 0.02) * pupil * 1.2 * eye;
    }

    // the maw stays shut. A hairline of heat where a mouth would be — worse.
    float mawLine = p.y + 0.40 + sin(p.x * 14.0) * 0.012;
    float maw = exp(-mawLine * mawLine * 2600.0) * exp(-p.x * p.x * 5.0);
    float breathe = 0.5 + 0.5 * sin(uTime * 0.31);
    col += vec3(0.75, 0.14, 0.02) * maw * (0.12 + breathe * 0.10 + uBolt * 0.9);

    float lum = dot(col, vec3(0.5));
    float a = min(lum, 1.0) * uWatch;
    if (a < 0.005) discard;
    gl_FragColor = vec4(max(col, 0.0) * uWatch, a);
  }
`;

// ---------------------------------------------------------------------------
// the gate — dark towers, and the light between them that changes sides
// ---------------------------------------------------------------------------
const GATE_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uRelease;   // 0 hellfire .. 1 white liberation
  varying vec2 vUv;
  ${''}
  __NOISE__
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // arch opening
    float arch = 1.0 - smoothstep(0.30, 0.44, length(vec2(p.x, max(0.0, p.y + 0.15) * 0.8)));
    // towers either side: dark, spiked
    float towers = step(0.55, abs(p.x)) * step(p.y, 0.35 + rfbm(vec2(p.x * 4.0, 0.0)) * 0.4);
    vec3 fire = mix(vec3(0.9, 0.25, 0.04), vec3(1.0, 0.8, 0.45), fbm(p * 3.0 + uTime * 0.05));
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 glowCol = mix(fire, white, uRelease);
    float flicker = mix(0.7 + 0.3 * fbm(vec2(uTime * 0.4, p.y * 3.0)), 1.0, uRelease);
    vec3 col = glowCol * arch * flicker * (0.7 + uRelease * 1.4);
    col = mix(col, vec3(0.010, 0.005, 0.006), towers);
    float a = max(arch * (0.75 + uRelease * 0.25), towers * 0.92) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;

// ---------------------------------------------------------------------------

function shaderQuad(w, h, frag, uniforms, { blending = THREE.AdditiveBlending,
                                            order = 8, vert = FLAT_VERT,
                                            side = THREE.DoubleSide } = {}) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag.replace('__NOISE__', NOISE),
    uniforms,
    transparent: true,
    depthWrite: false,
    blending,
    side,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.frustumCulled = false;
  m.renderOrder = order;
  return m;
}

export function createNaraka(scene) {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  const timeU = [];               // every uniform block that carries uTime
  const fireU = [];               // everything that dies at the mantra

  // ---- the dome: a ceiling of churning smoke, lit from below by the land ----
  const domeU = { uTime: { value: 0 }, uForm: { value: 0 }, uBolt: { value: 0 },
                  uDie: { value: 0 } };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(380, 40, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      uniforms: domeU,
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: (`
        precision highp float;
        uniform float uTime;
        uniform float uForm;
        uniform float uBolt;
        uniform float uDie;
        varying vec3 vDir;
        __NOISE__
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          // churning smoke, two layers shearing against each other
          vec2 q = d.xz / (abs(h) + 0.35);
          float sm1 = fbm(q * 1.6 + uTime * 0.010);
          float sm2 = fbm(q * 3.1 - uTime * 0.014 + 7.0);
          float churn = sm1 * 0.65 + sm2 * 0.35;

          // the land lights the smoke from below; overhead it starves to black
          float under = exp(-max(h, 0.0) * 3.2);
          float horizon = exp(-abs(h) * 6.0);

          vec3 deep = vec3(0.020, 0.006, 0.004);
          vec3 brown = vec3(0.16, 0.045, 0.015);
          vec3 hot = vec3(0.55, 0.13, 0.03);
          vec3 col = mix(deep, brown, under * (0.4 + 0.6 * churn));
          col = mix(col, hot, horizon * (0.5 + 0.5 * churn));
          // lightning inside the churn
          col += vec3(0.85, 0.55, 0.55) * uBolt * churn * under * 1.4;
          // the mantra starves the fire out of the sky
          col *= (1.0 - uDie * 0.9);
          gl_FragColor = vec4(col, uForm);
        }
      `).replace('__NOISE__', NOISE),
    }));
  dome.renderOrder = -5;
  dome.frustumCulled = false;
  group.add(dome);

  // ---- the land: a crust of cooling lava, cracked open and glowing ----------
  const lavaU = { uTime: { value: 0 }, uFire: { value: 1 } };
  timeU.push(lavaU); fireU.push(lavaU);
  const lava = new THREE.Mesh(
    new THREE.PlaneGeometry(760, 760, 1, 1),
    new THREE.ShaderMaterial({
      uniforms: lavaU,
      vertexShader: /* glsl */`
        varying vec2 vW;
        void main() {
          vW = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: (`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec2 vW;
        __NOISE__
        void main() {
          vec2 q = vW * 0.030;
          float crust = fbm(q * 1.4);
          float channels = rfbm(q * 0.8);
          float crack = smoothstep(0.62, 0.88, channels);
          float pulse = 0.7 + 0.3 * sin(uTime * 0.5 + crust * 9.0);
          vec3 rock = mix(vec3(0.022, 0.010, 0.007), vec3(0.065, 0.030, 0.018), crust);
          vec3 melt = vec3(1.0, 0.30, 0.03) * crack * pulse;
          // aerial perspective: the land dissolves into the horizon's furnace
          float dist = length(vW) / 380.0;
          vec3 haze = vec3(0.45, 0.11, 0.03);
          vec3 col = mix(rock + melt * uFire, haze * (0.4 + 0.6 * uFire), smoothstep(0.35, 1.0, dist));
          gl_FragColor = vec4(col, 1.0);
        }
      `).replace('__NOISE__', NOISE),
    }));
  lava.rotation.x = -Math.PI / 2;
  lava.position.y = -1.6;
  lava.renderOrder = -4;
  lava.frustumCulled = false;
  group.add(lava);

  // ---- haze planes across the walk: depth you can feel ----------------------
  {
    const HAZE_FRAG = (`
      precision highp float;
      uniform float uTime;
      uniform float uForm;
      uniform float uSeed;
      varying vec2 vUv;
      __NOISE__
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float n = fbm(vec2(p.x * 2.5 + uTime * 0.02 + uSeed * 7.0, p.y * 2.0));
        float body = exp(-p.y * 1.8 - 1.8) * (0.5 + 0.5 * n);
        body += exp(-p.y * p.y * 2.0) * n * 0.15;
        float a = body * uForm * 0.16;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.55, 0.14, 0.03) * (0.6 + n * 0.6) * a * 2.0, a);
      }
    `).replace('__NOISE__', NOISE);
    for (let i = 0; i < 3; i++) {
      const u = { uTime: { value: 0 }, uForm: { value: 1 }, uSeed: { value: i * 0.41 } };
      timeU.push(u); fireU.push(u);
      const m2 = shaderQuad(140, 40, HAZE_FRAG, u, { order: 8 });
      m2.position.set(0, 12, -60 - i * 45);
      group.add(m2);
    }
  }

  // ---- light, so the models exist ------------------------------------------
  const amb = new THREE.AmbientLight(0x431f0d, 2.4);
  group.add(amb);
  const potLights = [];
  for (let i = 0; i < 4; i++) {
    const L = new THREE.PointLight(0xff5a18, 34, 44, 1.7);
    group.add(L);
    potLights.push(L);
  }

  // ---- the causeway ---------------------------------------------------------
  const roadU = { uTime: { value: 0 }, uFire: { value: 1 } };
  timeU.push(roadU); fireU.push(roadU);
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.35, 170),
    new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT,
      fragmentShader: ROAD_FRAG.replace('__NOISE__', NOISE),
      uniforms: roadU,
    }));
  road.position.set(0, -0.18, -70);
  group.add(road);

  // chained posts
  const postGeo = new THREE.CylinderGeometry(0.055, 0.075, 0.95, 7);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x17100c, roughness: 0.9 });
  const posts = new THREE.InstancedMesh(postGeo, postMat, 68);
  const m4 = new THREE.Matrix4();
  let pi = 0;
  for (let z = 4; z >= -148; z -= 4.5) {
    for (const x of [-1.9, 1.9]) {
      if (pi >= 68) break;
      m4.makeTranslation(x, 0.45, z);
      posts.setMatrixAt(pi++, m4);
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  group.add(posts);

  // ---- spires + burning horizon --------------------------------------------
  for (const [r, h, tall, ord] of [[210, 90, 0.75, 3], [330, 150, 0.9, 2]]) {
    const u = { uForm: { value: 1 }, uTall: { value: tall } };
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, h, 96, 1, true),
      new THREE.ShaderMaterial({
        vertexShader: FLAT_VERT,
        fragmentShader: SPIRE_FRAG,
        uniforms: u,
        transparent: true, depthWrite: false, side: THREE.BackSide,
      }));
    ring.position.y = h * 0.32;
    ring.renderOrder = ord;
    ring.frustumCulled = false;
    group.add(ring);
  }
  const glowU = { uTime: { value: 0 }, uForm: { value: 1 } };
  timeU.push(glowU); fireU.push(glowU);
  const glowShell = new THREE.Mesh(
    new THREE.CylinderGeometry(360, 360, 200, 96, 1, true),
    new THREE.ShaderMaterial({
      vertexShader: FLAT_VERT,
      fragmentShader: HELLGLOW_FRAG.replace('__NOISE__', NOISE),
      uniforms: glowU,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
    }));
  glowShell.position.y = 30;
  glowShell.renderOrder = 1;
  glowShell.frustumCulled = false;
  group.add(glowShell);

  // ---- the spike forest: jagged lava-veined rock, both sides to the horizon --
  {
    const spikeGeo = new THREE.ConeGeometry(1, 1, 7, 3, true);
    spikeGeo.translate(0, 0.5, 0);
    const spikeMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        attribute float aGlow;
        varying vec3 vPos;
        varying float vGlow;
        void main() {
          vPos = position;
          vGlow = 1.0;
          #ifdef USE_INSTANCING
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          #endif
        }
      `,
      fragmentShader: (`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec3 vPos;
        __NOISE__
        void main() {
          // dark volcanic rock with molten veins climbing from the base
          float ang = atan(vPos.z, vPos.x);
          vec2 q = vec2(ang * 2.2, vPos.y * 5.0);
          float veins = rfbm(q);
          float vein = smoothstep(0.60, 0.90, veins) * (1.0 - smoothstep(0.30, 1.0, vPos.y));
          float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + ang * 3.0);
          vec3 rock = mix(vec3(0.030, 0.014, 0.012), vec3(0.09, 0.045, 0.032), fbm(q * 1.7));
          vec3 col = rock + vec3(1.0, 0.30, 0.03) * vein * pulse * uFire * 1.5;
          gl_FragColor = vec4(col, 1.0);
        }
      `).replace('__NOISE__', NOISE),
      uniforms: { uTime: { value: 0 }, uFire: { value: 1 } },
    });
    timeU.push(spikeMat.uniforms); fireU.push(spikeMat.uniforms);
    const NSPK = 68;
    const spikes = new THREE.InstancedMesh(spikeGeo, spikeMat, NSPK);
    const sm = new THREE.Matrix4();
    let hs = 99;
    const rnd = () => { hs = (hs * 1664525 + 1013904223) >>> 0; return hs / 4294967296; };
    for (let i = 0; i < NSPK; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (9 + rnd() * 55);
      const z = 15 - rnd() * 195;
      const h = 7 + rnd() * 28;
      const r = 1.4 + rnd() * 3.2;
      sm.compose(new THREE.Vector3(x, -1, z),
                 new THREE.Quaternion().setFromEuler(
                   new THREE.Euler((rnd() - 0.5) * 0.22, rnd() * 6.28, (rnd() - 0.5) * 0.22)),
                 new THREE.Vector3(r, h, r));
      spikes.setMatrixAt(i, sm);
    }
    spikes.instanceMatrix.needsUpdate = true;
    spikes.frustumCulled = false;
    group.add(spikes);
  }

  // ---- the chains: sagging between every pair of posts ------------------------
  {
    const chainMat = new THREE.LineBasicMaterial({ color: 0x120a06 });
    for (const x of [-1.9, 1.9]) {
      const pts = [];
      for (let z = 4; z >= -148; z -= 4.5) {
        const zn = z - 4.5;
        for (let k = 0; k <= 6; k++) {
          const f = k / 6;
          pts.push(new THREE.Vector3(
            x, 0.88 - Math.sin(f * Math.PI) * 0.22, z + (zn - z) * f));
        }
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts), chainMat);
      line.frustumCulled = false;
      group.add(line);
    }
  }

  // ---- fire-falls ------------------------------------------------------------
  const fallMeshes = [];
  for (let i = 0; i < 18; i++) {
    const u = { uTime: { value: 0 }, uForm: { value: 1 }, uSeed: { value: i / 18 } };
    timeU.push(u); fireU.push(u);
    const q = shaderQuad(8 + (i % 3) * 3, 170 + (i % 4) * 30, FIREFALL_FRAG, u, { order: 4 });
    const a = (i / 18) * Math.PI * 2 + 0.4;
    const r = 95 + (i % 4) * 48;
    q.position.set(Math.cos(a) * r, 55, Math.sin(a) * r - 40);
    q.rotation.y = -a + Math.PI / 2;
    group.add(q);
    fallMeshes.push(q);
  }

  // ---- THE WATCHER ------------------------------------------------------------
  const watchDarkU = { uTime: { value: 0 }, uWatch: { value: 0 } };
  const watchGlowU = { uTime: { value: 0 }, uWatch: { value: 0 },
                       uBolt: { value: 0 },
                       uLook: { value: new THREE.Vector2(0, 0) } };
  timeU.push(watchDarkU, watchGlowU);
  const wDark = shaderQuad(150, 110, WATCHER_DARK_FRAG, watchDarkU,
                           { blending: THREE.NormalBlending, order: 5 });
  wDark.position.set(0, 78, -235);
  group.add(wDark);
  const wGlow = shaderQuad(150, 110, WATCHER_GLOW_FRAG, watchGlowU, { order: 6 });
  wGlow.position.set(0, 78, -234);
  group.add(wGlow);

  // from his mouth, a column of fire falls behind the gate — the reference's
  // spine of the whole composition
  const mawFallU = { uTime: { value: 0 }, uForm: { value: 0 }, uSeed: { value: 0.5 } };
  timeU.push(mawFallU);
  const mawFall = shaderQuad(14, 68, FIREFALL_FRAG, mawFallU, { order: 5 });
  mawFall.position.set(0, 26, -232);
  group.add(mawFall);

  // ---- the gate: the real one, out of the forge -------------------------------
  const gateU = { uTime: { value: 0 }, uForm: { value: 1 }, uRelease: { value: 0 } };
  timeU.push(gateU);
  // the light INSIDE the arch — hellfire until the mantra turns it white
  const gate = shaderQuad(34, 40, GATE_FRAG, gateU,
                          { blending: THREE.NormalBlending, order: 5 });
  gate.position.set(0, 14, -168);
  group.add(gate);

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/models/gate.glb', (g) => {
    let src = null;
    g.scene.traverse((o) => { if (o.isMesh && !src) src = o; });
    if (!src) return;
    const geo = src.geometry;
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const size = new THREE.Vector3(); bb.getSize(size);
    const sg = 46 / size.x;                       // the arch spans the causeway
    const mat = src.material && src.material.map
      ? new THREE.MeshStandardMaterial({ map: src.material.map, roughness: 0.9,
                                         color: 0x6b5648 })
      : new THREE.MeshStandardMaterial({ color: 0x201410, roughness: 0.92 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(sg);
    mesh.position.set(0, -bb.min.y * sg - 0.4, -166);
    mesh.frustumCulled = false;
    group.add(mesh);
    // a light of its own, so the ironwork reads against the dark
    const gl2 = new THREE.PointLight(0xff4a10, 55, 90, 1.8);
    gl2.position.set(0, 16, -158);
    group.add(gl2);
    potLights.push(gl2);
  });

  // ---- cauldrons, figures (async once the GLBs land) ---------------------------
  const potPositions = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -6 - i * 10.5 - (i % 3) * 1.5;
    potPositions.push(new THREE.Vector3(side * (4.0 + (i % 3) * 0.8), 0, z));
  }
  const sway = [];                 // figures that writhe
  const tumblers = [];             // figures falling inside the fire columns
  const nearFallers = [];          // figures falling close enough to read

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

  loader.load('assets/models/cauldron.glb', (g) => {
    let src = null;
    g.scene.traverse((o) => { if (o.isMesh && !src) src = o; });
    if (!src) return;
    const geo = src.geometry;
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const size = new THREE.Vector3(); bb.getSize(size);
    const s = 3.1 / Math.max(size.x, size.z);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x231812, roughness: 0.93, metalness: 0.25,
    });
    const inst = new THREE.InstancedMesh(geo, mat, potPositions.length);
    const mm = new THREE.Matrix4();
    potPositions.forEach((p, i) => {
      mm.compose(
        new THREE.Vector3(p.x, -bb.min.y * s - 0.15, p.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (i * 1.7) % 6.28, 0)),
        new THREE.Vector3(s, s, s));
      inst.setMatrixAt(i, mm);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
    group.add(inst);

    // a pad of dark rock under every pot, standing out of the lava
    const padGeo = new THREE.CylinderGeometry(2.1, 2.6, 1.6, 9);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x120a07, roughness: 1.0 });
    const pads = new THREE.InstancedMesh(padGeo, padMat, potPositions.length);
    const pm = new THREE.Matrix4();
    potPositions.forEach((p, i) => {
      pm.makeTranslation(p.x, -0.9, p.z);
      pads.setMatrixAt(i, pm);
    });
    pads.instanceMatrix.needsUpdate = true;
    pads.frustumCulled = false;
    group.add(pads);

    // fire above every mouth
    const potH = size.y * s;
    potPositions.forEach((p, i) => {
      const u = { uTime: { value: 0 }, uFire: { value: 1 }, uSeed: { value: (i * 0.37) % 1 } };
      timeU.push(u); fireU.push(u);
      const f = shaderQuad(3.3, 4.3, POTFIRE_FRAG, u,
                           { order: 9, vert: BILLBOARD_VERT });
      f.position.set(p.x, potH + 1.3, p.z);
      group.add(f);
    });
    // the nearest pots carry the real lights
    potLights.forEach((L, i) => {
      const p = potPositions[i * 3] || potPositions[0];
      L.position.set(p.x, potH + 1.0, p.z);
    });
  });

  loader.load('assets/models/figure.glb', (g) => {
    let src = null;
    g.scene.traverse((o) => { if (o.isMesh && !src) src = o; });
    if (!src) return;
    const geo = src.geometry;
    geo.computeBoundingBox();
    const size = new THREE.Vector3(); geo.boundingBox.getSize(size);
    const s = 1.75 / size.y;
    // souls are silhouettes — near-black, the fire does the talking
    const mat = new THREE.MeshStandardMaterial({ color: 0x120b08, roughness: 1.0 });

    for (let i = 0; i < potPositions.length; i++) {
      const n = 1 + (i % 2);
      for (let k = 0; k < n; k++) {
        const mesh = new THREE.Mesh(geo, mat);
        const p = potPositions[i];
        mesh.scale.setScalar(s * (0.9 + (k * 0.13)));
        mesh.position.set(p.x + (k ? 0.45 : -0.3), 0.55, p.z + (k ? -0.2 : 0.25));
        mesh.rotation.y = (i * 2.1 + k * 2.8) % 6.28;
        mesh.frustumCulled = false;
        group.add(mesh);
        sway.push({ mesh, seed: i * 1.3 + k * 7.7, baseY: mesh.position.y });
      }
    }
    // falling forever inside the fire columns
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(s * 2.2);
      mesh.frustumCulled = false;
      group.add(mesh);
      tumblers.push({ mesh, col: fallMeshes[i * 3], seed: i * 3.3 });
    }
    // and eight falling in the middle distance, close enough to read as PEOPLE
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(s * (1.3 + (i % 3) * 0.3));
      mesh.frustumCulled = false;
      group.add(mesh);
      const a = (i / 8) * Math.PI * 2 + 1.1;
      const r = 26 + (i % 4) * 11;
      nearFallers.push({ mesh, x: Math.cos(a) * r, z: Math.sin(a) * r - 55,
                         seed: i * 5.1, speed: 0.10 + (i % 3) * 0.03 });
    }
  });

  // ---------------------------------------------------------------------------
  const camPos = new THREE.Vector3();

  return {
    group,
    /** everything at once: 0 hidden .. 1 fully present */
    set reveal(v) { group.visible = v > 0.002; domeU.uForm.value = v; },
    /** the Watcher condenses out of the cloud */
    set watch(v) {
      watchDarkU.uWatch.value = v;
      watchGlowU.uWatch.value = v;
      mawFallU.uForm.value = v * 0.45 * (1 - gateU.uRelease.value);
    },
    /** lightning inside the churn */
    set bolt(v) { watchGlowU.uBolt.value = v; domeU.uBolt.value = v; },
    /** the mantra: 0 burning .. 1 released */
    set release(v) {
      domeU.uDie.value = v;
      for (const u of fireU) if (u.uFire) u.uFire.value = 1 - v;
      for (const u of fireU) if (u.uForm) u.uForm.value = 1 - v * 0.85;
      gateU.uRelease.value = v;
      const dim = 1 - v * 0.9;
      amb.intensity = 1.6 * dim + v * 2.2;          // white light takes over
      amb.color.setRGB(0.19 + v * 0.7, 0.09 + v * 0.75, 0.04 + v * 0.8);
      for (const L of potLights) L.intensity = 20 * dim;
    },

    update(t, camera) {
      for (const u of timeU) if (u.uTime) u.uTime.value = t;
      domeU.uTime.value = t;

      // the Watcher's eyes find you
      camera.getWorldPosition(camPos);
      const dx = THREE.MathUtils.clamp((camPos.x - 0) / 60, -1, 1);
      const dy = THREE.MathUtils.clamp((camPos.y - 40) / 90, -1, 0.4);
      watchGlowU.uLook.value.set(dx, dy);

      // souls writhe — slowly, which is worse
      for (const s2 of sway) {
        const w = Math.sin(t * 0.9 + s2.seed);
        s2.mesh.rotation.z = w * 0.14;
        s2.mesh.rotation.x = Math.sin(t * 0.6 + s2.seed * 1.7) * 0.10;
        s2.mesh.position.y = s2.baseY + Math.sin(t * 0.5 + s2.seed) * 0.10;
      }
      for (const nf of nearFallers) {
        const cyc = ((t * nf.speed + nf.seed) % 1);
        nf.mesh.position.set(nf.x, 70 - cyc * 95, nf.z);
        nf.mesh.rotation.set(t * 0.9 + nf.seed, nf.seed, t * 0.6);
      }
      // and the falling never land
      for (const tb of tumblers) {
        const cyc = ((t * 0.14 + tb.seed) % 1);
        tb.mesh.position.copy(tb.col.position);
        tb.mesh.position.y = 140 - cyc * 170;
        tb.mesh.rotation.set(t * 0.8 + tb.seed, t * 0.5, t * 0.7 + tb.seed);
      }
      // firelight breathes
      for (let i = 0; i < potLights.length; i++) {
        const L = potLights[i];
        if (L.intensity > 0.2) {
          L.intensity = L.intensity * 0.92 + (16 + Math.sin(t * 7 + i * 2.3) * 3
            + Math.sin(t * 13.7 + i) * 2) * 0.08;
        }
      }
    },
  };
}
