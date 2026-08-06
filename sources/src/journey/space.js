/**
 * The void, the stars, the nebula, and the motes that precede them all.
 *
 * The void is what actually removes passthrough from the headset: an opaque
 * shell drawn around the user, faded up as the world dulls. Once it is solid
 * there is no camera feed left to see, and we are in a rendered world.
 *
 * The stars then arrive far more slowly than feels comfortable to author, and
 * in segment two they leave again — the prana field wants the whole sky.
 */

import * as THREE from 'three';

// deterministic RNG so the sky is identical every run
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// the void
// ---------------------------------------------------------------------------

export function createVoid(scene) {
  // Not pure black: a headset showing #000 reads as "the screen is off", and
  // the eye loses all sense of depth. A near-black with the faintest vertical
  // gradient keeps the space feeling like a space.
  const geo = new THREE.SphereGeometry(500, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uOpacity;
      varying vec3 vDir;
      void main() {
        float h = vDir.y * 0.5 + 0.5;
        vec3 col = mix(vec3(0.004, 0.006, 0.013), vec3(0.011, 0.013, 0.026), h);
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;      // behind everything
  scene.add(mesh);
  return {
    mesh,
    set opacity(v) { mat.uniforms.uOpacity.value = v; },
    get opacity() { return mat.uniforms.uOpacity.value; },
  };
}

// ---------------------------------------------------------------------------
// stars
// ---------------------------------------------------------------------------

const STAR_VERT = /* glsl */`
  attribute float aDelay;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3  aTint;

  uniform float uEmerge;   // 0..1 across the whole emergence window
  uniform float uTime;
  uniform float uPixel;
  uniform float uGlobal;   // whole-sky dimmer, for when the stars must leave

  varying float vBright;
  varying vec3  vTint;

  void main() {
    // Each star waits for its own moment. Spread over the full window they
    // appear one at a time, the way real stars do as the eye dark-adapts.
    float p = smoothstep(aDelay, aDelay + 0.12, uEmerge);

    // no scintillation — steady light, nothing pulling at the eye
    vBright = p * uGlobal;
    vTint = aTint;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (340.0 / max(-mv.z, 1.0)) * (0.55 + 0.45 * p);
  }
`;

const STAR_FRAG = /* glsl */`
  precision highp float;
  varying float vBright;
  varying vec3  vTint;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    // tight core with a soft bloom skirt, so bright stars read as points of
    // light rather than discs
    float core = exp(-r * r * 42.0);
    float halo = exp(-r * r * 6.0) * 0.42;
    float a = (core + halo) * vBright;
    if (a < 0.002) discard;
    gl_FragColor = vec4(vTint * a, a);
  }
`;

export function createStars(scene, { count = 5200 } = {}) {
  const rand = rng(20260805);
  const pos = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  const tint = new Float32Array(count * 3);

  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // uniform on a sphere, then pulled toward a galactic band so the sky has
    // structure instead of looking like even noise
    let u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const band = rand();
    if (band < 0.42) u *= 0.30;                    // concentrate near the band
    const s = Math.sqrt(Math.max(0, 1 - u * u));
    const r = 90 + rand() * 320;
    pos[i * 3] = Math.cos(theta) * s * r;
    pos[i * 3 + 1] = u * r;
    pos[i * 3 + 2] = Math.sin(theta) * s * r;

    // The brightest stars arrive first and alone. The faint majority fill in
    // late, which is what makes the sky seem to keep deepening.
    const mag = Math.pow(rand(), 2.4);             // few bright, many faint
    size[i] = 0.85 + mag * 4.2;
    delay[i] = THREE.MathUtils.clamp(0.86 - mag * 0.9 + (rand() - 0.5) * 0.22, 0, 0.9);
    seed[i] = rand() * 100;

    // real starlight: mostly blue-white, a minority warm
    const warm = rand();
    if (warm > 0.86) c.setHSL(0.07 + rand() * 0.04, 0.55, 0.72);
    else if (warm > 0.66) c.setHSL(0.12 + rand() * 0.03, 0.22, 0.85);
    else c.setHSL(0.58 + rand() * 0.06, 0.28 + rand() * 0.3, 0.88);
    tint[i * 3] = c.r; tint[i * 3 + 1] = c.g; tint[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));

  const uniforms = {
    uEmerge: { value: 0 },
    uTime: { value: 0 },
    uPixel: { value: 1 },
    uGlobal: { value: 1 },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;

  // parented to a group so the whole sky can drift without moving the user
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  return {
    group,
    uniforms,
    set emerge(v) { uniforms.uEmerge.value = v; },
    get emerge() { return uniforms.uEmerge.value; },
    set global(v) { uniforms.uGlobal.value = v; },
    update(t, pixelRatio) {
      uniforms.uTime.value = t;
      uniforms.uPixel.value = pixelRatio;
      // A barely-perceptible tumble. Any faster and it becomes motion the
      // inner ear disagrees with, which in a seated headset means nausea.
      group.rotation.y = t * 0.0042;
      group.rotation.x = Math.sin(t * 0.017) * 0.014;
    },
  };
}

// ---------------------------------------------------------------------------
// nebula — the fluid colour of deep space, and later of the prana field
// ---------------------------------------------------------------------------

const NEBULA_FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uEmerge;
  uniform float uPalette;  // 0 = segment-1 indigo/teal, 1 = prana blue-green + red
  uniform float uFull;     // 0 = banded like a galaxy, 1 = flowing everywhere
  uniform float uRadial;   // integrated breath-flow: the whole field streams
                           // toward the viewer on the inhale, away on the exhale
  uniform float uScale;    // structure size — smaller number = vaster clouds
  uniform float uGain;     // layer brightness
  uniform float uHell;     // the sky over Naraka: charcoal and blood
  uniform float uBolt;     // lightning inside the churn

  varying vec3 vDir;

  // value noise over a direction, cheap enough to run per-pixel in stereo
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(11.3, 7.1, 5.7);
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float t = uTime * 0.011;

    // Domain warp is what makes it read as fluid rather than static cloud:
    // the noise field is sampled through another noise field that is itself
    // slowly advecting, so the structures shear and fold instead of merely
    // scrolling.
    vec3 q = d * uScale + d * uRadial;
    vec3 warp = vec3(
      fbm(q + vec3(t * 0.7, 0.0, t * 0.4)),
      fbm(q + vec3(5.2, t * 0.6, 1.3)),
      fbm(q + vec3(1.7, 9.2, t * 0.5)));
    float n = fbm(q * 1.6 + (warp - 0.5) * 2.6 - vec3(0.0, 0.0, t));

    // concentrated in the stars' band at first; in the prana world the band
    // releases and the fluid runs over the whole sphere
    float bandK = mix(1.55, 0.42, uFull);
    float band = exp(-pow(d.y * bandK + (warp.x - 0.5) * 1.35, 2.0));
    float body = smoothstep(mix(0.34, 0.24, uFull), 0.80, n) * band;

    // a second, thinner veil everywhere so the black is never truly empty
    float veil = smoothstep(0.48, 0.92, fbm(d * 3.4 + warp * 1.4)) * 0.55;

    // two palettes, crossfaded: deep space, then the living prana field —
    // blue-green currents with veins of red running where the flow knots
    vec3 indigo = mix(vec3(0.13, 0.17, 0.42), vec3(0.03, 0.17, 0.30), uPalette);
    vec3 teal   = mix(vec3(0.09, 0.30, 0.34), vec3(0.05, 0.26, 0.21), uPalette);
    vec3 rose   = mix(vec3(0.38, 0.15, 0.30), vec3(0.48, 0.08, 0.10), uPalette);
    indigo = mix(indigo, vec3(0.050, 0.007, 0.004), uHell);
    teal   = mix(teal,   vec3(0.110, 0.020, 0.008), uHell);
    rose   = mix(rose,   vec3(0.45, 0.075, 0.015), uHell);
    vec3 col = mix(teal, indigo, smoothstep(0.2, 0.8, n));
    col = mix(col, rose, smoothstep(mix(0.75, 0.66, uPalette), 0.95, n * band) * mix(0.7, 1.0, uPalette));

    float a = (body * 0.85 + veil * 0.26) * uEmerge * (1.0 + 0.12 * uFull) * uGain
            * (1.0 - uHell * 0.45);
    col *= 1.0 + uBolt * uHell * 2.6;      // the clouds light from inside
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a * 3.4, a);
  }
`;

export function createNebula(parent, { radius = 430, scale = 2.1, gain = 1.0,
                                       order = 4 } = {}) {
  const geo = new THREE.SphereGeometry(radius, 48, 32);
  const uniforms = { uTime: { value: 0 }, uEmerge: { value: 0 },
                     uPalette: { value: 0 }, uFull: { value: 0 },
                     uRadial: { value: 0 }, uScale: { value: scale },
                     uGain: { value: gain }, uHell: { value: 0 },
                     uBolt: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    depthTest: true,       // hell has real ground; the sky must stay behind it
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: NEBULA_FRAG,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;      // behind the stars, in front of the void
  parent.add(mesh);
  return {
    mesh,
    set emerge(v) { uniforms.uEmerge.value = v; },
    get emerge() { return uniforms.uEmerge.value; },
    set palette(v) { uniforms.uPalette.value = v; },
    set full(v) { uniforms.uFull.value = v; },
    set radial(v) { uniforms.uRadial.value = v; },
    set hell(v) { uniforms.uHell.value = v; },
    set bolt(v) { uniforms.uBolt.value = v; },
    update(t) { uniforms.uTime.value = t; },
  };
}

// ---------------------------------------------------------------------------
// aurora curtains — vertical sheets of light, for the prana world's scale
// ---------------------------------------------------------------------------

const CURTAIN_FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uEmerge;

  varying vec2 vUv;      // x around the cylinder, y along its height
  varying float vY;      // world height, for the vertical falloff

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.13 + 5.7; a *= 0.5; }
    return v;
  }

  void main() {
    // tall slow streaks, drifting sideways; a second field breaks the columns
    float streak = fbm(vec2(vUv.x * 10.0 + uTime * 0.016, vUv.y * 1.2 - uTime * 0.008));
    float breakup = fbm(vec2(vUv.x * 23.0 - uTime * 0.011, vUv.y * 3.1));
    float body = smoothstep(0.48, 0.85, streak) * smoothstep(0.3, 0.75, breakup);

    // fade at the top and bottom so the sheets hang rather than end
    float vfall = smoothstep(-1.0, -0.45, vY / 120.0) * smoothstep(1.0, 0.35, vY / 120.0);

    vec3 col = mix(vec3(0.05, 0.30, 0.22), vec3(0.10, 0.42, 0.38), streak);
    float a = body * vfall * 0.16 * uEmerge;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 3.0, a);
  }
`;

export function createCurtains(parent) {
  const geo = new THREE.CylinderGeometry(150, 150, 240, 64, 1, true);
  const uniforms = { uTime: { value: 0 }, uEmerge: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: CURTAIN_FRAG,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  parent.add(mesh);
  return {
    mesh,
    set emerge(v) { uniforms.uEmerge.value = v; },
    update(t) {
      uniforms.uTime.value = t;
      mesh.rotation.y = t * 0.006;
    },
  };
}

// ---------------------------------------------------------------------------
// motes — the first sign that something is present, while still in the room
// ---------------------------------------------------------------------------

const MOTE_VERT = /* glsl */`
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixel;
  uniform float uFade;
  varying float vA;
  void main() {
    vec3 p = position;
    // slow convection, no two on the same path
    p.x += sin(uTime * 0.14 + aSeed * 6.3) * 0.34;
    p.y += sin(uTime * 0.09 + aSeed * 3.1) * 0.26 + mod(uTime * 0.021 + aSeed, 1.0) * 0.7 - 0.35;
    p.z += cos(uTime * 0.11 + aSeed * 4.7) * 0.34;

    float breathe = 0.55 + 0.45 * sin(uTime * 0.5 + aSeed * 9.0);
    vA = uFade * breathe;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (26.0 / max(-mv.z, 0.4));
  }
`;

const MOTE_FRAG = /* glsl */`
  precision highp float;
  varying float vA;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = exp(-r * r * 16.0) * vA;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vec3(1.0, 0.94, 0.82) * a, a);
  }
`;

export function createMotes(scene, { count = 260, radius = 3.0 } = {}) {
  const rand = rng(77003);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // filling a box rather than a sphere keeps them inside the room's shape
    pos[i * 3] = (rand() - 0.5) * radius * 2.2;
    pos[i * 3 + 1] = 0.25 + rand() * 2.3;
    pos[i * 3 + 2] = (rand() - 0.5) * radius * 2.2;
    seed[i] = rand();
    size[i] = 0.5 + rand() * 1.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const uniforms = { uTime: { value: 0 }, uPixel: { value: 1 }, uFade: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    vertexShader: MOTE_VERT,
    fragmentShader: MOTE_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 3;
  scene.add(points);

  return {
    points,
    set fade(v) { uniforms.uFade.value = v; },
    get fade() { return uniforms.uFade.value; },
    update(t, pixelRatio) {
      uniforms.uTime.value = t;
      uniforms.uPixel.value = pixelRatio;
    },
  };
}
