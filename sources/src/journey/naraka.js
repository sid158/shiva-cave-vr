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
    // the molten pool the tongues are born from — white-hot at the mouth
    float pool = exp(-yy * 6.0) * max(0.0, 1.0 - abs(p.x) * abs(p.x) * 1.4);
    pool *= 0.80 + 0.20 * sin(uTime * 2.1 + uSeed * 17.0);
    // sparks spat upward off the surface
    float spark = smoothstep(0.86, 0.97,
      noise(vec2(p.x * 7.0 + uSeed * 23.0, yy * 3.0 - uTime * (1.6 + uSeed * 0.4))))
      * (1.0 - yy * 0.6);
    vec3 col = mix(vec3(1.0, 0.25, 0.03), vec3(1.0, 0.75, 0.25), body);
    col = mix(col, vec3(1.0, 0.95, 0.7), pow(body, 3.0));
    col += vec3(1.0, 0.60, 0.16) * pool * 1.5 + vec3(1.0, 0.92, 0.62) * pool * pool * 1.3;
    col += vec3(1.0, 0.55, 0.12) * spark * 1.4;
    float a = (body + pool * 0.95 + spark * 0.6) * uFire * 1.4 * smoothstep(0.0, 0.07, yy);
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
    vec3 stone = mix(vec3(0.014, 0.008, 0.006), vec3(0.040, 0.026, 0.019), cell);
    // the fire underneath breathes through the cracks
    float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + p.y * 0.25);
    vec3 col = stone + vec3(1.0, 0.26, 0.03) * crackLine * pulse * 0.62 * uFire;
    float speck = smoothstep(0.965, 0.995, noise(p * 7.0));
    col += vec3(1.0, 0.45, 0.10) * speck * (0.3 + crackLine) * pulse * uFire * 0.9;
    // the whole slab drinks a little of the furnace light
    col += vec3(0.30, 0.07, 0.02) * (0.20 + 0.16 * pulse) * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);
    // the far end of the causeway is swallowed
    float far = smoothstep(0.30, 1.0, vUv.y);
    col = mix(col, vec3(0.30, 0.075, 0.020), far * 0.85);
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
    vec3 col = mix(vec3(0.004, 0.002, 0.002), vec3(0.30, 0.065, 0.014), edge * edge * edge);
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
    float a = glow * (0.45 + 0.45 * lick) * uForm * 1.0;
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
    float fall = uTime * (0.85 + uSeed * 0.35);

    // the column wanders as it falls instead of hanging like a rod
    float sway = (noise(vec2(uSeed * 51.0, vUv.y * 1.6 - fall * 0.25)) - 0.5) * 0.85;
    x -= sway;

    // torn into separate falling masses, with gaps of nothing between them
    float clumps = noise(vec2(uSeed * 13.0, vUv.y * 3.2 - fall));
    float tear = smoothstep(0.30, 0.72, clumps);

    // narrow, hot spine with a ragged edge
    float w = 0.42 + 0.34 * noise(vec2(uSeed * 7.0 + 4.0, vUv.y * 6.0 - fall * 1.4));
    float core = exp(-x * x / (w * w) * 2.6);
    float turb = pow(noise(vec2(x * 3.2 + uSeed * 31.0, vUv.y * 7.0 - fall * 1.7)), 1.7);

    float vf = smoothstep(0.0, 0.10, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    // it dies out toward the ground into smoke
    float burn = mix(0.35, 1.0, smoothstep(0.0, 0.45, vUv.y));

    vec3 col = mix(vec3(0.62, 0.09, 0.01), vec3(1.0, 0.52, 0.12), turb);
    col = mix(col, vec3(1.0, 0.86, 0.52), pow(turb * core, 2.4));
    float a = core * tear * (turb * 1.20 + 0.06) * vf * burn * uForm * 0.72;
    if (a < 0.005) discard;
    gl_FragColor = vec4(col * a * 1.55, a);
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
    col += mix(vec3(0.30, 0.05, 0.015), vec3(0.80, 0.10, 0.05), uBolt) * rim
         * (0.16 + uBolt * 2.6);

    float horns = max(hornArc(p, -1.0), hornArc(p, 1.0));
    col += vec3(0.60, 0.16, 0.03) * horns * (0.13 + smoke * 0.08 + uBolt * 1.6);

    // the eyes: two dim embers, always slightly wrong to look at. They do
    // not glow — they SMOULDER, and they never blink.
    for (int s = -1; s <= 1; s += 2) {
      vec2 c = vec2(0.20 * float(s), 0.04);
      vec2 q = p - c;
      float eye = 1.0 - smoothstep(0.030, 0.085, length(q * vec2(1.0, 1.8)));
      float smoulder = 0.40 + 0.12 * sin(uTime * 0.23 + float(s));
      col += vec3(0.85, 0.16, 0.02) * eye * (smoulder + uBolt * 1.2);
      vec2 pq = q - uLook * 0.035;
      float pupil = 1.0 - smoothstep(0.010, 0.026, length(pq * vec2(1.0, 0.9)));
      col -= vec3(0.8, 0.15, 0.02) * pupil * 1.2 * eye;
    }

    // the maw stays shut. A hairline of heat where a mouth would be — worse.
    float mawLine = p.y + 0.40 + sin(p.x * 14.0) * 0.012;
    float maw = exp(-mawLine * mawLine * 2600.0) * exp(-p.x * p.x * 5.0);
    float breathe = 0.5 + 0.5 * sin(uTime * 0.31);
    col += vec3(0.75, 0.14, 0.02) * maw * (0.16 + breathe * 0.12 + uBolt * 0.9);

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
    vec3 fire = mix(vec3(0.95, 0.20, 0.02), vec3(1.0, 0.62, 0.14), fbm(p * 3.0 + uTime * 0.05));
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 glowCol = mix(fire, white, uRelease);
    float flicker = mix(0.7 + 0.3 * fbm(vec2(uTime * 0.4, p.y * 3.0)), 1.0, uRelease);
    vec3 col = glowCol * arch * flicker * (1.15 + uRelease * 1.10);
    col = mix(col, vec3(0.010, 0.005, 0.006), towers);
    float a = max(arch * (0.60 + uRelease * 0.40), towers * 0.92) * uForm;
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

          vec3 deep = vec3(0.010, 0.003, 0.002);
          vec3 brown = vec3(0.30, 0.085, 0.028);
          vec3 hot = vec3(0.95, 0.26, 0.055);
          vec3 col = mix(deep, brown, under * (0.35 + 0.65 * churn));
          col = mix(col, hot, horizon * (0.5 + 0.5 * churn));
          // the furnace beyond the gate: the sky burns hardest dead ahead
          float toGate = smoothstep(0.15, 0.95, -d.z);
          col += hot * toGate * horizon * (0.45 + 0.55 * churn) * 0.55;
          // lightning inside the churn
          col += vec3(0.90, 0.09, 0.045) * uBolt * churn * under * 1.9;
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
          // vW.x is distance from the causeway centreline, vW.y is -worldZ
          vec2 q = vW * 0.030;
          float d = length(vW);

          // ---- the molten flow: domain-warped, always moving --------------
          vec2 warp = vec2(fbm(q * 0.7 + uTime * 0.010),
                           fbm(q * 0.7 + 5.2 - uTime * 0.008));
          vec2 fq = q + (warp - 0.5) * 1.6;
          float flow = fbm(fq * 1.15 - vec2(0.0, uTime * 0.035));
          float fine = fbm(fq * 4.2 - vec2(0.0, uTime * 0.10));

          // ---- the crust: plates of cooled rock floating on the melt ------
          float plate = fbm(q * 1.15 + 11.0);
          float sheet = fbm(q * 3.6 + 31.0);
          // crust covers a little under half; the rest is open molten rock
          float crustM = smoothstep(0.40, 0.60, plate * 0.68 + sheet * 0.32);
          // right beside the causeway the ground is solid bank, not lake
          float bank = smoothstep(11.0, 4.5, abs(vW.x));
          crustM = clamp(crustM + bank * 0.85, 0.0, 1.0);

          // ---- temperature of the open melt -------------------------------
          float heat = clamp(flow * 0.72 + fine * 0.38, 0.0, 1.0);
          heat = pow(heat, 0.80);
          vec3 melt = mix(vec3(0.62, 0.055, 0.006), vec3(1.0, 0.30, 0.02),
                          smoothstep(0.10, 0.55, heat));
          melt = mix(melt, vec3(1.0, 0.66, 0.10), smoothstep(0.50, 0.82, heat));
          melt = mix(melt, vec3(1.0, 0.92, 0.62), smoothstep(0.80, 0.99, heat));
          float boil = 0.90 + 0.10 * sin(uTime * 0.9 + flow * 22.0);
          melt *= boil;

          // the skin: a dark net of cooling crust drawn over the molten rock,
          // torn open where the flow is fastest. This is what stops it reading
          // as a smooth orange sheet.
          float web1 = rfbm(fq * 5.5);
          float web2 = rfbm(fq * 13.0 + 4.0);
          float skin = smoothstep(0.42, 0.80, web1) * 0.72
                     + smoothstep(0.55, 0.88, web2) * 0.38;
          skin *= 1.0 - smoothstep(0.62, 0.95, heat);     // tears open where hottest
          melt = mix(melt, melt * vec3(0.10, 0.055, 0.045), clamp(skin, 0.0, 0.88));
          // and the torn edges of that skin glow hotter than the pool
          float tear = smoothstep(0.40, 0.50, web1) * (1.0 - smoothstep(0.50, 0.62, web1));
          melt += vec3(1.0, 0.55, 0.12) * tear * 0.55;

          // ---- the crust itself: black rock, cracked, edges still alight ---
          float grain = fbm(q * 5.5);
          vec3 rock = mix(vec3(0.020, 0.010, 0.007), vec3(0.075, 0.040, 0.026), grain);
          // fractures across the plates, glowing from underneath
          float crack = smoothstep(0.62, 0.90, rfbm(q * 2.6));
          float fineCrack = smoothstep(0.76, 0.96, rfbm(q * 8.5));
          rock += vec3(1.0, 0.30, 0.03) * crack * 0.85
                + vec3(1.0, 0.45, 0.08) * fineCrack * 0.30;
          // the shoreline: crust glows white-hot where it meets the melt
          float shore = (1.0 - abs(crustM * 2.0 - 1.0));
          rock += vec3(1.0, 0.52, 0.10) * pow(shore, 2.2) * 0.85;

          vec3 col = mix(melt, rock, crustM);
          col *= (uFire * 0.85 + 0.15) * 0.7;

          // ---- aerial perspective toward the furnace horizon --------------
          float dist = d / 380.0;
          vec3 haze = vec3(0.85, 0.24, 0.045);
          col = mix(col, haze * (0.30 + 0.70 * uFire), smoothstep(0.34, 1.0, dist) * 0.85);
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
        float a = body * uForm * 0.21;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.55, 0.14, 0.03) * (0.6 + n * 0.6) * a * 2.0, a);
      }
    `).replace('__NOISE__', NOISE);
    for (let i = 0; i < 5; i++) {
      const u = { uTime: { value: 0 }, uForm: { value: 1 }, uSeed: { value: i * 0.41 } };
      timeU.push(u); fireU.push(u);
      const m2 = shaderQuad(150, 42, HAZE_FRAG, u, { order: 8 });
      m2.position.set(0, 11, -28 - i * 36);
      group.add(m2);
    }
    // and ground mist crawling off the melt onto the causeway banks
    for (let i = 0; i < 8; i++) {
      const u = { uTime: { value: 0 }, uForm: { value: 1 }, uSeed: { value: 3.7 + i * 0.83 } };
      timeU.push(u); fireU.push(u);
      const m3 = shaderQuad(30, 7, HAZE_FRAG, u, { order: 8 });
      const side = i % 2 === 0 ? -1 : 1;
      m3.position.set(side * (6.5 + (i % 3) * 2.0), 0.9, -12 - i * 17);
      m3.rotation.y = side * 0.35;
      group.add(m3);
    }
  }

  // ---- light, so the models exist ------------------------------------------
  const amb = new THREE.AmbientLight(0x6b2a0c, 2.15);
  group.add(amb);
  const potLights = [];
  for (let i = 0; i < 4; i++) {
    const L = new THREE.PointLight(0xff5a18, 46, 40, 1.9);
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

  // ---- THE BAKED WORLD -------------------------------------------------------
  // Modelled and lit in Blender: three rings of the Meshy basalt spires,
  // terraced basins carrying the cauldrons, souls frozen in the melt, and a
  // lava lake whose surface came out of a fluid simulation. All lighting is
  // Cycles global illumination baked into the textures — the cave's pipeline.
  const bakedMats = [];          // dimmed together at the mantra
  let lavaBakedU = null;
  {
    const envLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    envLoader.load('assets/models/hell_env.glb', (g) => {
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        const map = o.material && o.material.map ? o.material.map : null;
        if (map) { map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; }
        // gltfpack renames meshes — the MATERIAL name survives the merge
        const mname = (o.material && o.material.name) || '';
        if (mname.startsWith('lava_surface')) {
          lavaBakedU = { uTime: { value: 0 }, uDie: { value: 0 } };
          o.material = new THREE.ShaderMaterial({
            uniforms: { uMap: { value: map }, uTime: lavaBakedU.uTime, uDie: lavaBakedU.uDie },
            vertexShader: /* glsl */`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: /* glsl */`
              precision highp float;
              uniform sampler2D uMap;
              uniform float uTime;
              uniform float uDie;
              varying vec2 vUv;
              void main() {
                vec3 col = texture2D(uMap, vUv).rgb;
                float heat = dot(col, vec3(0.6, 0.3, 0.1));
                float shimmer = 0.88 + 0.24 * sin(uTime * 0.8 + heat * 21.0)
                                       * smoothstep(0.12, 0.55, heat);
                col = clamp(col * 2.1 * shimmer, 0.0, 1.0);
                col = col * col * (3.0 - 2.0 * col);   // deep crust, blazing veins
                col *= (1.0 - uDie * 0.93);
                gl_FragColor = vec4(col, 1.0);
              }
            `,
          });
        } else {
          const m2 = new THREE.MeshBasicMaterial({ map });
          // grade per group: the crags darker and redder than their grey
          // basalt albedo, the terraces a touch darker, souls left hot
          const tint = mname.startsWith('crags') ? [0.52, 0.42, 0.38]
                     : mname.startsWith('terraces') ? [0.68, 0.60, 0.55]
                     : [1.0, 1.0, 1.0];
          m2.color.setRGB(...tint);
          m2.userData.base = tint;
          bakedMats.push(m2);
          o.material = m2;
        }
        o.frustumCulled = false;
      });
      group.add(g.scene);
    });
  }

  // ---- the kerb wall: a low parapet of the same stone as the road. It is
  // what the souls at the edge haul themselves onto, and it stops the lake
  // from running straight up to your feet.
  {
    const kerbU = { uTime: { value: 0 }, uFire: { value: 1 } };
    timeU.push(kerbU); fireU.push(kerbU);
    const kerbMat = new THREE.ShaderMaterial({
      uniforms: kerbU,
      vertexShader: /* glsl */`
        varying vec3 vP;
        varying vec3 vN;
        void main() {
          vP = position;
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: (`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec3 vP;
        varying vec3 vN;
        __NOISE__
        void main() {
          vec2 q = vec2(vP.y * 5.0, vP.z * 0.9);
          float cell = fbm(q * 1.4);
          float crack = smoothstep(0.72, 0.94, rfbm(q * 2.2));
          vec3 stone = mix(vec3(0.020, 0.011, 0.008), vec3(0.062, 0.040, 0.028), cell);
          // the lake throws light up the outer face
          float up = clamp(-vN.y, 0.0, 1.0) * 0.35 + clamp(abs(vN.x), 0.0, 1.0) * 0.65;
          float low = 1.0 - smoothstep(-0.25, 0.30, vP.y);
          vec3 col = stone
                   + vec3(1.0, 0.32, 0.05) * up * low * 0.55 * uFire
                   + vec3(1.0, 0.30, 0.03) * crack * 0.35 * uFire;
          col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);
          gl_FragColor = vec4(col, 1.0);
        }
      `).replace('__NOISE__', NOISE),
    });
    for (const x of [-2.0, 2.0]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 170), kerbMat);
      w.position.set(x, 0.10, -70);
      w.frustumCulled = false;
      group.add(w);
    }
  }

  // ---- the chains: heavy iron, sagging between every pair of posts,
  // thick enough to catch the firelight ----------------------------------------
  {
    const pos = [], norm = [], idx = [];
    const half = 0.034;
    for (const x of [-1.9, 1.9]) {
      const nx = x > 0 ? -1 : 1;                    // faces the causeway
      for (let z = 4; z >= -148 + 4.5; z -= 4.5) {
        const zn = z - 4.5;
        for (let k = 0; k < 7; k++) {
          const f0 = k / 7, f1 = (k + 1) / 7;
          const y0 = 0.88 - Math.sin(f0 * Math.PI) * 0.24;
          const y1 = 0.88 - Math.sin(f1 * Math.PI) * 0.24;
          const z0 = z + (zn - z) * f0, z1 = z + (zn - z) * f1;
          const base = pos.length / 3;
          pos.push(x, y0 - half, z0,  x, y0 + half, z0,
                   x, y1 + half, z1,  x, y1 - half, z1);
          for (let q = 0; q < 4; q++) norm.push(nx, 0, 0);
          idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g2.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
    g2.setIndex(idx);
    const chains = new THREE.Mesh(g2, new THREE.MeshStandardMaterial({
      color: 0x1a120b, roughness: 0.55, metalness: 0.65, side: THREE.DoubleSide,
    }));
    chains.frustumCulled = false;
    group.add(chains);
  }

  // ---- small flames on the posts: the candles of the damned -------------------
  {
    const centers = [];
    for (let z = 4; z >= -148; z -= 4.5) {
      for (const x of [-1.9, 1.9]) {
        if (centers.length >= 68) break;
        centers.push([x, 1.08, z]);
      }
    }
    const N = centers.length;
    const aCenter = new Float32Array(N * 4 * 3);
    const aCorner = new Float32Array(N * 4 * 2);
    const aSeed = new Float32Array(N * 4);
    const tidx = [];
    centers.forEach(([x, y, z], i) => {
      const sd = (i * 0.61803) % 1;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let q = 0; q < 4; q++) {
        const v = i * 4 + q;
        aCenter.set([x, y, z], v * 3);
        aCorner.set(corners[q], v * 2);
        aSeed[v] = sd;
      }
      const b = i * 4;
      tidx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('aCenter', new THREE.BufferAttribute(aCenter, 3));
    tg.setAttribute('aCorner', new THREE.BufferAttribute(aCorner, 2));
    tg.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 4 * 3), 3));
    tg.setIndex(tidx);
    const torchU = { uTime: { value: 0 }, uFire: { value: 1 } };
    timeU.push(torchU); fireU.push(torchU);
    const torches = new THREE.Mesh(tg, new THREE.ShaderMaterial({
      uniforms: torchU,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */`
        attribute vec3 aCenter;
        attribute vec2 aCorner;
        attribute float aSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = aCorner * 0.5 + 0.5;
          vSeed = aSeed;
          vec4 c = modelViewMatrix * vec4(aCenter, 1.0);
          c.xy += aCorner * vec2(0.16, 0.30);
          gl_Position = projectionMatrix * c;
        }
      `,
      fragmentShader: (`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec2 vUv;
        varying float vSeed;
        __NOISE__
        void main() {
          float y = vUv.y;
          float x = vUv.x * 2.0 - 1.0 + sin(uTime * 9.0 + vSeed * 41.0) * 0.10 * y;
          float n = noise(vec2(vSeed * 37.0 + x * 3.0, y * 3.5 - uTime * (2.0 + vSeed)));
          float shape = (1.0 - y) * exp(-x * x * (5.0 + y * 22.0));
          vec3 col = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.85, 0.45), shape * n * 2.0);
          float a = shape * (0.45 + n * 0.75) * uFire;
          if (a < 0.006) discard;
          gl_FragColor = vec4(col * a * 1.7, a);
        }
      `).replace('__NOISE__', NOISE),
    }));
    torches.renderOrder = 9;
    torches.frustumCulled = false;
    group.add(torches);
  }

  // ---- ash and sparks riding the wind, everywhere ------------------------------
  {
    const NE = 720;
    const base = new Float32Array(NE * 3);
    const seed = new Float32Array(NE);
    let eh = 7;
    const ern = () => { eh = (eh * 1664525 + 1013904223) >>> 0; return eh / 4294967296; };
    for (let i = 0; i < NE; i++) {
      base[i * 3] = (ern() * 2 - 1) * 75;
      base[i * 3 + 1] = ern() * 34;
      base[i * 3 + 2] = 20 - ern() * 215;
      seed[i] = ern();
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(base, 3));
    eg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const emberU = { uTime: { value: 0 }, uFire: { value: 1 } };
    timeU.push(emberU); fireU.push(emberU);
    const embers = new THREE.Points(eg, new THREE.ShaderMaterial({
      uniforms: emberU,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */`
        uniform float uTime;
        attribute float aSeed;
        varying float vA;
        void main() {
          vec3 p = position;
          float rise = mod(p.y + uTime * (0.55 + aSeed * 0.9), 34.0);
          p.y = rise;
          p.x += sin(uTime * (0.31 + aSeed * 0.4) + aSeed * 31.0) * (2.0 + aSeed * 3.0);
          p.z += cos(uTime * 0.23 + aSeed * 17.0) * 1.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float sz = (1.4 + aSeed * 2.4) * (120.0 / max(-mv.z, 2.0));
          gl_PointSize = clamp(sz, 1.0, 10.0);
          // brightest low, fading as the ash climbs and cools
          vA = (0.25 + aSeed * 0.5) * (1.0 - rise / 40.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uFire;
        varying float vA;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float g = exp(-r2 * 3.0);
          vec3 col = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.62, 0.18), g);
          float a = g * vA * uFire;
          if (a < 0.006) discard;
          gl_FragColor = vec4(col * a * 1.8, a);
        }
      `,
    }));
    embers.renderOrder = 7;
    embers.frustumCulled = false;
    group.add(embers);
  }

  // ---- fire-falls ------------------------------------------------------------
  const fallMeshes = [];
  for (let i = 0; i < 9; i++) {
    const u = { uTime: { value: 0 }, uForm: { value: 1 }, uSeed: { value: i / 9 } };
    timeU.push(u); fireU.push(u);
    const q = shaderQuad(7 + (i % 3) * 3, 150 + (i % 4) * 34, FIREFALL_FRAG, u, { order: 4 });
    const a = (i / 9) * Math.PI * 2 + 0.4;
    const r = 175 + (i % 4) * 60;
    q.position.set(Math.cos(a) * r, 58, Math.sin(a) * r - 60);
    q.rotation.y = -a + Math.PI / 2;
    group.add(q);
    fallMeshes.push(q);
  }

  // ---- the bloom we cannot post-process: every hot thing gets a soft, huge,
  // very low-alpha halo, so the heat bleeds into the air around it ------------
  const BLOOM_FRAG = `
    precision highp float;
    uniform float uTime;
    uniform float uFire;
    uniform float uSeed;
    uniform vec3  uCol;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float r2 = dot(p, p);
      if (r2 > 1.0) discard;
      // two stacked falloffs: a tight bright heart and a wide faint bleed
      float tight = exp(-r2 * 7.0);
      float wide  = exp(-r2 * 1.5) * 0.42;
      float breathe = 0.86 + 0.14 * sin(uTime * 3.1 + uSeed * 29.0);
      float a = (tight + wide) * (1.0 - r2) * uFire * breathe * 0.30;
      if (a < 0.003) discard;
      gl_FragColor = vec4(uCol * a * 2.2, a);
    }
  `;
  function addBloom(x, y, z, size, col, seed) {
    const u = { uTime: { value: 0 }, uFire: { value: 1 }, uSeed: { value: seed },
                uCol: { value: new THREE.Color(col) } };
    timeU.push(u); fireU.push(u);
    const q = shaderQuad(size, size, BLOOM_FRAG, u, { order: 7, vert: BILLBOARD_VERT });
    q.position.set(x, y, z);
    group.add(q);
    return q;
  }
  // the fire columns bleed into the sky
  fallMeshes.forEach((q, i) => {
    addBloom(q.position.x, q.position.y - 25, q.position.z, 60, 0xff5a14, i * 0.7);
  });

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
  mawFall.position.set(0, 44, -238);
  group.add(mawFall);

  // ---- the gate: the real one, out of the forge -------------------------------
  const gateU = { uTime: { value: 0 }, uForm: { value: 1 }, uRelease: { value: 0 } };
  timeU.push(gateU);
  // the light INSIDE the arch — hellfire until the mantra turns it white
  const gate = shaderQuad(22, 28, GATE_FRAG, gateU,
                          { blending: THREE.NormalBlending, order: 5 });
  gate.position.set(0, 10, -168);
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
    // centre the arch over the road — the model's origin is off to one side
    mesh.position.set(-(bb.min.x + bb.max.x) * 0.5 * sg,
                      -bb.min.y * sg - 0.4, -166);
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
  const clawers = [];              // the ones at the kerb, within arm's reach
  let potTopY = 1.45;              // refined once the cauldron GLB lands
  let liftFigures = null;          // figure cb registers; cauldron cb re-lifts

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

  // the screaming figure replaces the placid one wherever it is close enough
  // to read — the kerb and the cauldrons
  loader.load('assets/models/soul.glb', (g) => {
    let src = null;
    g.scene.traverse((o) => { if (o.isMesh && !src) src = o; });
    if (!src) return;
    const sg = src.geometry;
    sg.computeBoundingBox();
    const size = new THREE.Vector3(); sg.boundingBox.getSize(size);
    const k = 1.8 / size.y;
    sg.scale(k, k, k);
    sg.computeBoundingBox();
    for (const c of clawers) c.mesh.geometry = sg;
    for (const s2 of sway) if (s2.pot !== undefined) s2.mesh.geometry = sg;
  });

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

    // fire above every mouth — born out of a molten pool at the rim
    const potH = size.y * s;
    potTopY = potH;
    if (liftFigures) liftFigures();
    const RIM_FRAG = (`
      precision highp float;
      uniform float uTime;
      uniform float uFire;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r2 = dot(p, p);
        if (r2 > 1.0) discard;
        float g = exp(-r2 * 3.4);
        float flick = 0.82 + 0.18 * sin(uTime * 6.3 + uSeed * 31.0);
        vec3 col = mix(vec3(1.0, 0.32, 0.05), vec3(1.0, 0.72, 0.30), g);
        float a = g * (1.0 - r2) * uFire * flick * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(col * a * 1.7, a);
      }
    `);
    potPositions.forEach((p, i) => {
      const u = { uTime: { value: 0 }, uFire: { value: 1 }, uSeed: { value: (i * 0.37) % 1 } };
      timeU.push(u); fireU.push(u);
      const f = shaderQuad(4.0, 5.0, POTFIRE_FRAG, u,
                           { order: 9, vert: BILLBOARD_VERT });
      f.position.set(p.x, potH + 1.45, p.z);
      group.add(f);
      // the spill of light over the rim and onto the souls inside
      const ru = { uTime: { value: 0 }, uFire: { value: 1 }, uSeed: { value: (i * 0.71) % 1 } };
      timeU.push(ru); fireU.push(ru);
      const rim = shaderQuad(4.6, 4.6, RIM_FRAG, ru,
                             { order: 8, vert: BILLBOARD_VERT });
      rim.position.set(p.x, potH + 0.55, p.z);
      group.add(rim);
      addBloom(p.x, potH + 1.6, p.z, 13, 0xff6a1c, (i * 0.53) % 1);
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

    // the souls are IN the cauldrons — arms up out of the molten light
    for (let i = 0; i < potPositions.length; i++) {
      const n = (i < 8 ? 2 : 1) + (i % 2);
      for (let k = 0; k < n; k++) {
        const mesh = new THREE.Mesh(geo, mat);
        const p = potPositions[i];
        const ang = i * 2.1 + k * 2.4;
        const dy = -0.38 - k * 0.16;
        mesh.scale.setScalar(s * (0.85 + k * 0.10));
        mesh.position.set(p.x + Math.cos(ang) * 0.42, potTopY + dy,
                          p.z + Math.sin(ang) * 0.42);
        mesh.rotation.y = (i * 2.1 + k * 2.8) % 6.28;
        mesh.frustumCulled = false;
        group.add(mesh);
        sway.push({ mesh, seed: i * 1.3 + k * 7.7, baseY: mesh.position.y, dy, pot: i });
      }
    }
    liftFigures = () => {
      for (const s2 of sway) {
        if (s2.pot === undefined) continue;
        const ny = potTopY + s2.dy;
        s2.mesh.position.y += ny - s2.baseY;
        s2.baseY = ny;
      }
    };
    liftFigures();
    // ---- THE KERB. This is the whole point of hell being in VR: something
    // is close enough to touch you. They climb at the causeway edge, and when
    // you draw level they lunge for the rail.
    for (let i = 0; i < 13; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -9 - i * 8.4 - (i % 3) * 2.2;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(s * (1.0 + (i % 3) * 0.09));
      // sunk below the kerb: only chest, shoulders and arms clear the stone
      mesh.position.set(side * 2.45, -1.08, z);
      mesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      mesh.frustumCulled = false;
      group.add(mesh);
      clawers.push({ mesh, side, z, seed: i * 2.7,
                     baseY: -1.08, baseX: side * 2.45 });
    }

    // falling forever inside the fire columns
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(s * 2.2);
      mesh.frustumCulled = false;
      group.add(mesh);
      tumblers.push({ mesh, col: fallMeshes[i % fallMeshes.length], seed: i * 3.3 });
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
      if (lavaBakedU) lavaBakedU.uDie.value = v;
      for (const m2 of bakedMats) {
        const b = m2.userData.base || [1, 1, 1];
        const d = 1 - v * 0.88;
        m2.color.setRGB(b[0] * d, b[1] * d, b[2] * d);
      }
      for (const u of fireU) if (u.uFire) u.uFire.value = 1 - v;
      for (const u of fireU) if (u.uForm) u.uForm.value = 1 - v * 0.85;
      gateU.uRelease.value = v;
      const dim = 1 - v * 0.9;
      amb.intensity = 1.95 * dim + v * 2.4;          // white light takes over
      amb.color.setRGB(0.19 + v * 0.7, 0.09 + v * 0.75, 0.04 + v * 0.8);
      for (const L of potLights) L.intensity = 20 * dim;
    },

    update(t, camera) {
      for (const u of timeU) if (u.uTime) u.uTime.value = t;
      if (lavaBakedU) lavaBakedU.uTime.value = t;
      domeU.uTime.value = t;

      // the Watcher's eyes find you
      camera.getWorldPosition(camPos);
      const dx = THREE.MathUtils.clamp((camPos.x - 0) / 60, -1, 1);
      const dy = THREE.MathUtils.clamp((camPos.y - 40) / 90, -1, 0.4);
      watchGlowU.uLook.value.set(dx, dy);

      // souls writhe — slowly, which is worse
      for (const s2 of sway) {
        const w = Math.sin(t * 0.9 + s2.seed);
        s2.mesh.rotation.z = w * 0.17;
        s2.mesh.rotation.x = Math.sin(t * 0.6 + s2.seed * 1.7) * 0.13;
        s2.mesh.position.y = s2.baseY + Math.sin(t * 0.5 + s2.seed) * 0.13;
      }
      // the kerb: slow clawing, and a lunge when you come level with them
      for (const c of clawers) {
        const near = 1 - THREE.MathUtils.clamp(Math.abs(camPos.z - c.z) / 7.5, 0, 1);
        const lunge = near * near;                     // sharp, only right beside you
        const claw = Math.sin(t * 1.5 + c.seed) * 0.5 + 0.5;
        c.mesh.position.y = c.baseY + claw * 0.20 + lunge * 0.80;
        c.mesh.position.x = c.baseX - c.side * lunge * 0.55;   // reaches across
        c.mesh.rotation.z = (Math.sin(t * 1.1 + c.seed * 1.7) * 0.12 - lunge * 0.30) * c.side;
        c.mesh.rotation.x = -lunge * 0.34;             // torso thrown at you
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
