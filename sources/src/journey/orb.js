/**
 * The narrator — a small golden light that holds the centre of your vision.
 *
 * She is a voice given a body: an analyser taps the narration and the orb
 * breathes with it — brightening on syllables, settling in the pauses, idling
 * with a slow pulse when the voice rests. When the narration ends she fades,
 * and by the time the stars arrive she is gone.
 *
 * Two deliberate choices keep it comfortable rather than HUD-like:
 *
 *   1. She FOLLOWS the gaze instead of being bolted to it. A head-locked
 *      object feels printed on the lenses — every micro-movement of the head
 *      drags it in lockstep and the eyes can never quite converge on it. So
 *      the orb glides toward the centre of view with critically-damped lag:
 *      always centred within a moment, never rigid.
 *
 *   2. She sits at 1.7 m — inside social distance but outside arm's reach,
 *      and far enough that vergence is relaxed for long viewing.
 */

import * as THREE from 'three';

const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform float uLevel;    // smoothed speech amplitude, 0..1
  uniform float uFade;     // overall presence, 0..1

  varying vec2 vUv;

  // tiny hash noise for the shimmer — anything stronger reads as fire
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;

    float breath = 0.5 + 0.5 * sin(uTime * 1.1);
    float live = 0.22 * breath + uLevel;          // idle pulse + speech

    // the core: near-white gold, tight, barely affected by speech
    float core = exp(-r * r * 46.0) * (1.0 + live * 0.35);

    // inner corona: swells with the voice
    float corona = exp(-r * r * 9.5) * (0.34 + live * 0.75);

    // outer veil: wide, soft, mostly speech-driven — this is the part that
    // visibly "speaks"
    float veil = exp(-r * r * 2.6) * (0.10 + live * 0.42);

    // a slow golden shimmer crawling over the corona, one octave, subtle
    float ang = atan(vUv.y, vUv.x);
    float shimmer = 0.92 + 0.08 * sin(ang * 3.0 - uTime * 0.7 + hash(vUv) * 0.35);

    vec3 gold  = vec3(1.00, 0.72, 0.28);
    vec3 cream = vec3(1.00, 0.94, 0.78);

    vec3 col = cream * core + gold * (corona * shimmer + veil);
    float a = (core + corona * 0.85 + veil * 0.6) * uFade;

    if (a < 0.004) discard;
    gl_FragColor = vec4(col * uFade, a);
  }
`;

export function createNarrator(scene) {
  const uniforms = {
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uFade: { value: 0 },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,               // she is never occluded, even by the void
    blending: THREE.AdditiveBlending,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 30;
  scene.add(mesh);

  // ---- speech analysis ----------------------------------------------------
  let analyser = null;
  let bins = null;
  let level = 0;

  const target = new THREE.Vector3(0, 1.35, -1.7);
  const dir = new THREE.Vector3();
  const pos = new THREE.Vector3(0, 1.35, -1.7);
  mesh.position.copy(pos);

  return {
    mesh,
    uniforms,

    /** tap the narration; call once the audio graph exists */
    attachAnalyser(ctx, sourceNode) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.55;
      bins = new Uint8Array(analyser.frequencyBinCount);
      sourceNode.connect(analyser);       // tap only — no onward connection
    },

    set fade(v) { uniforms.uFade.value = v; },
    get fade() { return uniforms.uFade.value; },

    update(t, dt, camera) {
      uniforms.uTime.value = t;

      // ---- where the person is looking ------------------------------------
      camera.getWorldDirection(dir);
      camera.getWorldPosition(target);
      target.addScaledVector(dir, 1.7);

      // critically-damped follow: centred within ~a third of a second, but
      // it *glides* there — the difference between a companion and a HUD
      const k = 1 - Math.exp(-dt * 5.5);
      pos.lerp(target, k);
      // a slow float, so she hangs in the air rather than being pinned to it
      mesh.position.set(
        pos.x,
        pos.y + Math.sin(t * 0.9) * 0.008,
        pos.z
      );

      // ---- how loudly she is speaking --------------------------------------
      let raw = 0;
      if (analyser) {
        analyser.getByteFrequencyData(bins);
        // speech energy lives in the low-mid bins; ignore the hiss above
        const n = Math.max(8, (bins.length * 0.45) | 0);
        let sum = 0;
        for (let i = 2; i < n; i++) sum += bins[i];
        raw = Math.min(1, (sum / (n - 2)) / 132);
      }
      // fast attack, slow release — syllables land, pauses linger
      const a = raw > level ? 1 - Math.exp(-dt * 22) : 1 - Math.exp(-dt * 3.2);
      level += (raw - level) * a;
      uniforms.uLevel.value = level;
    },
  };
}
