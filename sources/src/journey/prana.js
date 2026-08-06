/**
 * Prana — the breath made visible.
 *
 * Three parts:
 *
 *   THE CORE   a slow-turning mass of green-gold energy hanging ahead of the
 *              user — "अपने सामने देखिये, अनंत ऊर्जा". It brightens when they
 *              draw from it.
 *
 *   THE INTAKE gold particles that live in a loose shell all around the user.
 *              While the breath gate is open they stream toward a point just
 *              in front of the nose, going white-hot and shrinking as they
 *              arrive — absorbed, not splashed. The shell is biased toward
 *              the core, so most of the stream visibly comes *from* it.
 *
 *   THE RELEASE a red plume that pours from the same point on the exhale,
 *              tumbling forward and slightly down, dying out within arm's
 *              reach of the face.
 *
 * The intake point is locked to the head every frame, so turning while
 * breathing sweeps the stream with you — which reads not as a glitch but as
 * the current following the breath. That was free, and it is the best thing
 * here.
 */

import * as THREE from 'three';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// gold intake
// ---------------------------------------------------------------------------

const GOLD_VERT = /* glsl */`
  attribute float aSeed;
  attribute vec3  aDir;
  attribute float aRad;
  attribute float aSize;

  uniform float uTime;
  uniform float uIn;      // inhale gate 0..1
  uniform float uField;   // ambient presence of the prana field
  uniform float uPixel;
  uniform vec3  uNose;

  varying float vA;
  varying float vHot;

  void main() {
    float sp = 0.10 + fract(aSeed * 7.31) * 0.14;
    float s = fract(aSeed + uTime * sp * (0.22 + uIn * 1.4));

    // the source shell swirls slowly around the head
    float a0 = uTime * 0.05 + aSeed * 6.2831;
    float ca = cos(a0), sa = sin(a0);
    vec3 d = vec3(aDir.x * ca - aDir.z * sa, aDir.y, aDir.x * sa + aDir.z * ca);
    vec3 src = uNose + d * aRad;
    src.y += sin(uTime * 0.4 + aSeed * 20.0) * 0.08;

    float travel = smoothstep(0.0, 1.0, s) * uIn;
    vec3 p = mix(src, uNose, travel);

    // visible two ways: a faint ambient shimmer once the field exists, and
    // the bright streaming pass while the breath draws them in
    float idle = uField * (0.10 + 0.08 * sin(uTime * 0.8 + aSeed * 40.0));
    float stream = sin(travel * 3.14159) * uIn;   // zero at rest AND at arrival
    vA = max(idle, stream * 1.55);
    vHot = travel;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float px = aSize * uPixel * (30.0 / max(-mv.z, 0.3)) * (1.0 - 0.45 * travel);
    gl_PointSize = min(px, 64.0 * uPixel);
  }
`;

const GOLD_FRAG = /* glsl */`
  precision highp float;
  varying float vA;
  varying float vHot;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = exp(-r * r * 7.0) * vA;   // wide and soft: wisps, not dust
    if (a < 0.004) discard;
    // warm gold that runs white-hot as it is absorbed
    vec3 col = mix(vec3(1.0, 0.76, 0.28), vec3(1.0, 0.96, 0.80), vHot);
    gl_FragColor = vec4(col * a, a);
  }
`;

// ---------------------------------------------------------------------------
// red release
// ---------------------------------------------------------------------------

const RED_VERT = /* glsl */`
  attribute float aSeed;
  attribute vec3  aDir;

  uniform float uTime;
  uniform float uOut;     // exhale gate 0..1
  uniform float uPixel;
  uniform vec3  uNose;
  uniform vec3  uFwd;

  varying float vA;
  varying float vS;

  void main() {
    float s = fract(aSeed + uTime * (0.55 + fract(aSeed * 3.7) * 0.25));

    // spherical release: it leaves you in every direction, a soft shockwave
    vec3 dir = normalize(aDir + uFwd * 0.25 + vec3(0.0, -0.06, 0.0));
    float reach = (1.6 + fract(aSeed * 9.1) * 2.2) * (0.45 + 0.55 * uOut);
    vec3 p = uNose + dir * smoothstep(0.0, 1.0, s) * reach;
    p += vec3(sin(uTime * 1.3 + aSeed * 31.0),
              sin(uTime * 1.1 + aSeed * 17.0),
              cos(uTime * 1.2 + aSeed * 23.0)) * 0.06 * s;

    // born just past the lips, dead before it goes far
    vA = uOut * pow(1.0 - s, 1.5) * smoothstep(0.015, 0.12, s) * 1.5;
    vS = s;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float px = (1.8 + fract(aSeed * 5.3) * 3.2) * uPixel * (32.0 / max(-mv.z, 0.25));
    gl_PointSize = min(px, 58.0 * uPixel);
  }
`;

const RED_FRAG = /* glsl */`
  precision highp float;
  varying float vA;
  varying float vS;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = exp(-r * r * 6.0) * vA;   // soft breath, not sparks
    if (a < 0.004) discard;
    // ember-bright at the lips, deep red as it disperses
    vec3 col = mix(vec3(1.0, 0.48, 0.20), vec3(0.55, 0.07, 0.10), vS);
    gl_FragColor = vec4(col * a, a);
  }
`;

// ---------------------------------------------------------------------------
// the core — अनंत ऊर्जा, hanging ahead
// ---------------------------------------------------------------------------

const CORE_FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uCore;    // emergence 0..1
  uniform float uIn;      // brightens while being drawn from

  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.1 + 7.3; a *= 0.52; }
    return v;
  }

  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;

    // polar swirl: the mass slowly turns on itself
    float ang = atan(vUv.y, vUv.x) + uTime * 0.06 - r * 1.8;
    vec2 pp = vec2(cos(ang), sin(ang)) * r;

    float n = fbm(pp * 2.6 + uTime * 0.03);
    float n2 = fbm(pp * 5.2 - uTime * 0.05 + 3.7);

    float body = smoothstep(1.0, 0.15, r) * (0.45 + 0.55 * n);
    float wisps = smoothstep(0.9, 0.2, r) * smoothstep(0.55, 0.95, n2) * 0.6;
    float heart = exp(-r * r * 7.0) * (0.7 + 0.3 * sin(uTime * 0.55));

    vec3 green = vec3(0.15, 0.85, 0.45);
    vec3 gold  = vec3(1.00, 0.83, 0.35);
    vec3 col = mix(green, gold, heart * 0.9 + n * 0.15);

    float a = (body * 0.30 + wisps * 0.22 + heart * 0.55)
            * uCore * (0.75 + 0.45 * uIn);
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 1.6, a);
  }
`;

const CORE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;

// ---------------------------------------------------------------------------

export function createPrana(scene) {
  const rand = rng(90210);

  // ---- gold intake ---------------------------------------------------------
  const NG = 850;
  const gSeed = new Float32Array(NG);
  const gDir = new Float32Array(NG * 3);
  const gRad = new Float32Array(NG);
  const gSize = new Float32Array(NG);
  const fwd = new THREE.Vector3(0, 0.05, -1).normalize();
  const v = new THREE.Vector3();
  for (let i = 0; i < NG; i++) {
    gSeed[i] = rand();
    // 55% of the shell leans toward the core ahead — the stream visibly
    // comes from the अनंत ऊर्जा, the rest from everywhere
    do {
      v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    } while (v.lengthSq() > 1 || v.lengthSq() < 0.05);
    v.normalize();
    // from the surroundings, all of them — the whole sphere contracts inward
    if (rand() < 0.25) v.lerp(fwd, 0.6).normalize();
    gDir[i * 3] = v.x; gDir[i * 3 + 1] = v.y; gDir[i * 3 + 2] = v.z;
    gRad[i] = 2.2 + Math.pow(rand(), 0.7) * 5.8;
    gSize[i] = 1.8 + rand() * 3.4;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NG * 3), 3));
  gGeo.setAttribute('aSeed', new THREE.BufferAttribute(gSeed, 1));
  gGeo.setAttribute('aDir', new THREE.BufferAttribute(gDir, 3));
  gGeo.setAttribute('aRad', new THREE.BufferAttribute(gRad, 1));
  gGeo.setAttribute('aSize', new THREE.BufferAttribute(gSize, 1));

  const gUni = {
    uTime: { value: 0 }, uIn: { value: 0 }, uField: { value: 0 },
    uPixel: { value: 1 }, uNose: { value: new THREE.Vector3(0, 1.3, -0.3) },
  };
  const gold = new THREE.Points(gGeo, new THREE.ShaderMaterial({
    vertexShader: GOLD_VERT, fragmentShader: GOLD_FRAG, uniforms: gUni,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  }));
  gold.frustumCulled = false;
  gold.renderOrder = 24;
  scene.add(gold);

  // ---- red release ---------------------------------------------------------
  const NR = 700;
  const rSeed = new Float32Array(NR);
  const rDir = new Float32Array(NR * 3);
  for (let i = 0; i < NR; i++) {
    rSeed[i] = rand();
    do {
      v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    } while (v.lengthSq() > 1 || v.lengthSq() < 0.05);
    v.normalize();
    rDir[i * 3] = v.x; rDir[i * 3 + 1] = v.y; rDir[i * 3 + 2] = v.z;
  }
  const rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NR * 3), 3));
  rGeo.setAttribute('aSeed', new THREE.BufferAttribute(rSeed, 1));
  rGeo.setAttribute('aDir', new THREE.BufferAttribute(rDir, 3));

  const rUni = {
    uTime: { value: 0 }, uOut: { value: 0 }, uPixel: { value: 1 },
    uNose: { value: new THREE.Vector3(0, 1.3, -0.3) },
    uFwd: { value: new THREE.Vector3(0, 0, -1) },
  };
  const red = new THREE.Points(rGeo, new THREE.ShaderMaterial({
    vertexShader: RED_VERT, fragmentShader: RED_FRAG, uniforms: rUni,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  }));
  red.frustumCulled = false;
  red.renderOrder = 25;
  scene.add(red);

  // ---- the core ------------------------------------------------------------
  const cUni = { uTime: { value: 0 }, uCore: { value: 0 }, uIn: { value: 0 } };
  const core = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 16.0),
    new THREE.ShaderMaterial({
      vertexShader: CORE_VERT, fragmentShader: CORE_FRAG, uniforms: cUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
  core.position.set(0, 2.5, -14.0);
  core.frustumCulled = false;
  core.renderOrder = 6;         // among the nebula, behind the particles
  scene.add(core);

  // a pillar of light rising through the core — the vertical axis the whole
  // scene was missing
  const pUni = { uTime: { value: 0 }, uCore: { value: 0 } };
  const pillar = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 90.0),
    new THREE.ShaderMaterial({
      vertexShader: CORE_VERT,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uTime;
        uniform float uCore;
        varying vec2 vUv;
        void main() {
          float x = abs(vUv.x);
          float beam = exp(-x * x * 9.0);
          float flow = 0.75 + 0.25 * sin(vUv.y * 9.0 - uTime * 0.5);
          float vfall = 1.0 - abs(vUv.y) * abs(vUv.y);
          vec3 col = mix(vec3(0.20, 0.75, 0.45), vec3(0.85, 0.95, 0.70),
                         exp(-x * x * 30.0));
          float a = beam * flow * vfall * 0.22 * uCore;
          if (a < 0.004) discard;
          gl_FragColor = vec4(col * a * 2.2, a);
        }
      `,
      uniforms: pUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending,
    }));
  pillar.position.set(0, 2.5, -14.2);
  pillar.frustumCulled = false;
  pillar.renderOrder = 5;
  scene.add(pillar);

  // ---------------------------------------------------------------------------
  const nose = new THREE.Vector3();
  const dir = new THREE.Vector3();
  let smoothIn = 0, smoothOut = 0;

  return {
    get breathing() { return Math.max(smoothIn, smoothOut); },
    set core(v2) { cUni.uCore.value = v2; pUni.uCore.value = v2; },
    set field(v2) { gUni.uField.value = v2; },
    gateIn: 0,
    gateOut: 0,

    update(t, dt, camera, pr) {
      // gates ease rather than switch — breath has no square edges
      const ki = 1 - Math.exp(-dt * (this.gateIn > smoothIn ? 3.2 : 1.8));
      smoothIn += (this.gateIn - smoothIn) * ki;
      const ko = 1 - Math.exp(-dt * (this.gateOut > smoothOut ? 9.0 : 4.0));
      smoothOut += (this.gateOut - smoothOut) * ko;

      camera.getWorldPosition(nose);
      camera.getWorldDirection(dir);
      nose.addScaledVector(dir, 0.12);      // just before the face: the pull
      nose.y -= 0.05;                       // is TOWARD you, unmistakably

      gUni.uTime.value = t; gUni.uPixel.value = pr;
      gUni.uIn.value = smoothIn;
      gUni.uNose.value.copy(nose);

      rUni.uTime.value = t; rUni.uPixel.value = pr;
      rUni.uOut.value = smoothOut;
      rUni.uNose.value.copy(nose);
      rUni.uFwd.value.copy(dir);

      cUni.uTime.value = t;
      cUni.uIn.value = smoothIn;
      pUni.uTime.value = t;
    },
  };
}
