/**
 * Section 3 — the first appearance.
 *
 * The instant the segment-2 voice finishes, a wormhole opens ahead. Five
 * seconds of tunnel, and we emerge under a different sky: mountains ringing
 * the horizon with fire behind them, galaxies turning, a crescent moon — and
 * over the next eight seconds the sky itself condenses into a face. Closed
 * eyes of ember. Three stripes of star-dust. A third eye, shut.
 *
 * Then it opens. Its pupil is a black hole, and it takes us.
 *
 * Everything here is light — no geometry beyond quads and a cylinder. The
 * face is a single SDF composition shader drawn twice: once in normal
 * blending to DARKEN (the head's mass, the black pupil — additive light can
 * never make darkness), once additively for everything that glows.
 */

import * as THREE from 'three';

// shared billboard-ish vertex: world-positioned quad, no rotation stripping —
// these hang fixed in the sky like constellations, not facing the user
const QUAD_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

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

  // ridged fbm: the electric filaments everything in the reference is veined
  // with — fold the noise about its midline and sharpen the creases
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

  // star grain: a field of pinpoint stars, brightness power-law distributed.
  // Multiplied into a feature mask it turns smooth light into star-dust.
  float grain(vec2 p, float scale) {
    vec2 g = p * scale;
    vec2 cell = floor(g);
    vec2 f = fract(g);
    vec2 jitter = vec2(hash(cell), hash(cell + 19.7));
    float d = length(f - 0.35 - jitter * 0.3);
    float b = pow(hash(cell + 7.3), 18.0);
    return b * exp(-d * d * 34.0);
  }
  float stardust(vec2 p) {
    return grain(p, 60.0) * 1.2 + grain(p + 3.1, 130.0) * 0.7;
  }
`;

// ---------------------------------------------------------------------------
// the face — feature layout in face-space uv [-1,1]
//   third eye centre (0, 0.38), eyes (±0.30, -0.10), stripes y .30/.44/.58
// ---------------------------------------------------------------------------

const FACE_COMMON = /* glsl */`
  uniform float uTime;
  uniform float uForm;    // 0..1 assembly of the whole face
  uniform float uOpen;    // 0..1 the third eye opening
  uniform float uSuck;    // 0..1 the black hole taking everything
  uniform float uFlare;   // the surge when her name for him lands
  varying vec2 vUv;

  // spacetime gives way around the opened eye: everything nearer the pupil
  // is dragged inward and sheared around it
  vec2 lens(vec2 p) {
    vec2 c = vec2(0.0, 0.38);
    vec2 q = p - c;
    float r = length(q) + 1e-4;
    float pull = uSuck * 0.30 / (r + 0.22);
    float twist = uSuck * 1.35 / (r * 3.2 + 0.55);
    float cs = cos(twist), sn = sin(twist);
    q = vec2(q.x * cs - q.y * sn, q.x * sn + q.y * cs);
    return c + q * (1.0 - pull);
  }

  ${'' /* per-feature assembly window */}
  float win(float a, float b) { return smoothstep(a, b, uForm); }

  // vertical almond with true points top and bottom
  float vesica(vec2 p, vec2 c, float w, float h) {
    vec2 q = p - c;
    float env = 1.0 - (q.y * q.y) / (h * h);   // negative beyond the points
    return (abs(q.x) - w * env) / w;
  }
`;

const FACE_DARK_FRAG = /* glsl */`
  precision highp float;
  ${'' /* darkening pass: the head's mass, and the black pupil */}
  __COMMON__
  __NOISE__

  void main() {
    vec2 p = lens(vUv);
    float t = uTime * 0.02;

    // ---- the head: a dense nebular mass, striated like painted currents ----
    vec2 e = p; e.y *= 0.72;
    float rr = length(e);
    float head = 1.0 - smoothstep(0.26, 0.85, rr);

    // the flow circles the eye sockets, the way the reference's dust does
    vec2 warp = vec2(fbm(p * 1.4 + t), fbm(p * 1.2 - t + 4.7)) - 0.5;
    float tex = fbm(p * 2.6 + warp * 1.3);
    float stria = rfbm(p * 3.4 + warp * 1.8);
    float mass = head * (0.45 + 0.40 * tex + 0.30 * stria) * win(0.15, 0.7);

    // ---- the dark interior of the closed third eye ----
    float dv = vesica(p, vec2(0.0, 0.38), 0.062, 0.155);
    float socket = (1.0 - smoothstep(-0.35, 0.0, dv)) * win(0.62, 1.0) * 0.65;

    // ---- the pupil: a hole in the world ----
    float pr = 0.012 + uOpen * 0.075 + uSuck * uSuck * 2.4;
    float pupil = 1.0 - smoothstep(pr * 0.72, pr, distance(p, vec2(0.0, 0.38)));
    pupil *= step(0.015, uOpen + uSuck);

    float a = max(max(mass * 0.9, socket), pupil * 0.985);
    if (a < 0.004) discard;
    // navy depths, richer where the striations knot; true black in the pupil
    vec3 body = mix(vec3(0.016, 0.026, 0.070), vec3(0.045, 0.065, 0.150), tex);
    body = mix(body, vec3(0.030, 0.030, 0.085), stria * 0.5);
    vec3 col = mix(body, vec3(0.004, 0.006, 0.02), socket);
    col = mix(col, vec3(0.0), pupil);
    gl_FragColor = vec4(col, a);
  }
`;

const FACE_GLOW_FRAG = /* glsl */`
  precision highp float;
  ${'' /* additive pass: everything on the face that burns */}
  __COMMON__
  __NOISE__

  void main() {
    vec2 p = lens(vUv);
    float t = uTime;
    vec3 col = vec3(0.0);

    // shared texture fields — every feature is veined and grained by these
    vec2 warp = vec2(fbm(p * 1.6 + t * 0.015), fbm(p * 1.4 - t * 0.012 + 7.7)) - 0.5;
    float fil = rfbm(p * 4.2 + warp * 1.6);          // electric filaments
    float fil2 = rfbm(p * 9.0 - warp * 1.2 + 3.3);   // finer nerves
    float dust = stardust(p + warp * 0.08);          // pinpoint stars

    vec3 NAVY   = vec3(0.10, 0.16, 0.45);
    vec3 ELEC   = vec3(0.36, 0.55, 1.00);
    vec3 ICE    = vec3(0.78, 0.88, 1.00);
    vec3 ROSE   = vec3(0.75, 0.30, 0.55);

    // ================= the head's own faint life ===========================
    {
      vec2 e = p; e.y *= 0.72;
      float head = 1.0 - smoothstep(0.30, 0.85, length(e));
      float m = head * win(0.2, 0.75);
      // filaments crawling through the mass, star-dust embedded in it
      col += NAVY * fil * m * 0.85;
      col += ELEC * fil * fil2 * m * 0.55;
      col += ICE * dust * m * 1.6;
      // a whisper of rose where the mass thins, like the reference's edges
      float edge = smoothstep(0.45, 0.80, length(e)) * head;
      col += ROSE * fil * edge * 0.38;

      // the great brows: two sweeping arcs of dense star-cloud over the eyes
      for (int sb = -1; sb <= 1; sb += 2) {
        float bx = (p.x - 0.30 * float(sb)) / 0.30;
        float by = p.y - (0.10 - bx * bx * 0.10);
        float brow = exp(-by * by * 60.0) * smoothstep(1.4, 0.4, abs(bx));
        col += mix(NAVY * 2.4, ELEC, fil) * brow * 0.55 * win(0.3, 0.7);
        col += ICE * dust * brow * 1.4 * win(0.3, 0.7);
      }
    }

    // ================= tripundra — three stripes of star-ash ================
    {
      float form = win(0.0, 0.42);
      float x = p.x, strip = 0.0;
      for (int i = 0; i < 3; i++) {
        float y0 = 0.32 + float(i) * 0.15;
        float dy = p.y - (y0 - x * x * 0.08);
        float band = exp(-dy * dy * 140.0);
        float reach = mix(1.2, 0.0, form);
        band *= smoothstep(reach, reach + 0.25, 1.0 - abs(x) / 0.52);
        strip += band;
      }
      strip *= smoothstep(0.60, 0.48, abs(x));
      // dimmer, not cut, where the third eye's column crosses
      strip *= 0.45 + 0.55 * smoothstep(0.04, 0.15, abs(x));
      float body = strip * (0.25 + 0.75 * fil) * form;
      col += mix(NAVY * 2.2, ICE, fil * 0.7) * body * 0.85;
      col += ELEC * fil2 * strip * form * 0.5;
      col += ICE * dust * strip * form * 2.6;          // the ash IS stars
    }

    // ================= closed eyes — embers behind lids ====================
    {
      float form = win(0.22, 0.60);
      for (int s = -1; s <= 1; s += 2) {
        vec2 c = vec2(0.30 * float(s), -0.10);
        vec2 q = p - c;
        float breathe = 0.72 + 0.28 * sin(t * 0.6 + float(s) * 0.7);

        float upper = q.y - (0.030 - q.x * q.x * 1.6);
        float lower = q.y + (0.035 - q.x * q.x * 1.3);
        float between = smoothstep(0.012, -0.02, upper) * smoothstep(-0.012, 0.02, lower);
        float wnd = smoothstep(0.21, 0.13, abs(q.x));

        // molten interior, textured, with a white-hot heart
        float lidTex = 0.45 + 0.75 * rfbm(q * 26.0 + t * 0.03);
        col += vec3(1.0, 0.55, 0.20) * between * wnd * lidTex * 1.6 * form * breathe;
        float heart = exp(-length(q * vec2(2.2, 9.0)) * 3.0);
        col += vec3(1.0, 0.92, 0.75) * heart * wnd * 0.9 * form * breathe;

        // bright lash line, star grain caught in it
        float lash = exp(-upper * upper * 2200.0) * wnd;
        col += vec3(1.0, 0.80, 0.45) * lash * 0.9 * form * breathe;
        col += ICE * dust * lash * 3.0 * form;

        // ember under-halo and the blue brow arch
        col += vec3(0.85, 0.40, 0.16) * exp(-length(q * vec2(1.2, 2.0)) * 5.0)
             * 0.25 * form * breathe;
        float brow = q.y - (0.13 - q.x * q.x * 1.1);
        float browM = exp(-brow * brow * 700.0) * smoothstep(0.21, 0.13, abs(q.x));
        col += mix(NAVY * 2.0, ELEC, fil) * browM * 0.8 * form;
        col += ICE * dust * browM * 1.6 * form;
      }
    }

    // ================= the nose bridge — a fall of star-lit light ==========
    {
      float form = win(0.50, 0.82);
      float wdt = 120.0 + 300.0 * smoothstep(0.30, -0.5, p.y);
      float band = exp(-p.x * p.x * wdt)
                 * smoothstep(0.36, 0.22, p.y) * smoothstep(-0.62, -0.10, p.y);
      float streaks = rfbm(vec2(p.x * 26.0, p.y * 5.0 - t * 0.03));
      col += mix(NAVY * 2.0, ICE, streaks * 0.8) * band * (0.30 + 0.55 * streaks) * form;
      col += ICE * dust * band * 2.2 * form;
    }

    // ================= the third eye ========================================
    {
      float form = win(0.62, 1.0);
      vec2 c = vec2(0.0, 0.38);
      float d = vesica(p, c, 0.062, 0.155);
      float live = 1.0 - uSuck;

      // layered rim: a wide electric corona, veined; then an ice-sharp line
      float corona = exp(-d * d * 14.0) * form * live;
      col += mix(NAVY * 2.4, ELEC, fil) * corona * (0.5 + 0.9 * fil2) * (1.0 + uFlare * 2.2);
      float rim = exp(-d * d * 90.0) * form * live * (0.5 + 0.5 * fil);
      col += ICE * rim * (0.95 + uFlare * 2.6);
      col += ICE * dust * corona * (3.5 + uFlare * 5.0);
      // the interior holds a veiled light even while closed
      float inner = (1.0 - smoothstep(-0.9, 0.0, d)) * form * live;
      col += vec3(0.30, 0.42, 0.80) * inner * (0.30 + 0.25 * fil2);
      // the surge on his name: a pressure wave of light off the almond
      col += ICE * exp(-abs(d - 0.35 * uFlare) * 30.0) * uFlare * 0.9;

      // the flame crown rising off the almond, filamented
      vec2 fq = vec2(p.x * 22.0, (p.y - 0.50) * 8.0 - t * 0.22);
      float wisp = rfbm(fq) * exp(-p.x * p.x * 150.0)
                 * smoothstep(0.46, 0.62, p.y) * smoothstep(0.86, 0.62, p.y);
      col += mix(ELEC, ICE, wisp) * wisp * 1.1 * form * live;

      // and a mirrored fall below, feeding the nose
      float below = rfbm(vec2(p.x * 22.0, (p.y - 0.20) * 8.0 + t * 0.18))
                  * exp(-p.x * p.x * 220.0)
                  * smoothstep(0.30, 0.20, p.y) * smoothstep(0.06, 0.20, p.y);
      col += ELEC * below * 0.7 * form * live;

      // ---- opening ----
      float pr = 0.012 + uOpen * 0.075 + uSuck * uSuck * 2.4;
      float ring = exp(-pow(distance(p, c) - pr, 2.0) * 2600.0);
      col += vec3(1.0, 0.72, 0.30) * ring * (uOpen * 0.9 + uSuck) * 2.8;

      float ang = atan(p.y - c.y, p.x - c.x);
      float swirl = 0.5 + 0.5 * sin(ang * 3.0 - t * 1.4 + distance(p, c) * 40.0);
      float acc = exp(-pow(distance(p, c) - pr * 1.5, 2.0) * 700.0) * swirl;
      col += vec3(0.95, 0.55, 0.25) * acc * (uOpen * 1.1 + uSuck * 1.8);
      // a red dread washes the face while the eye is open
      col += vec3(0.55, 0.10, 0.03) * exp(-distance(p, c) * 2.2) * uOpen * 0.8;

      float inside = 1.0 - smoothstep(-0.25, 0.05, d);
      col += vec3(0.85, 0.90, 1.0) * inside * uOpen * (1.0 - uOpen) * 0.9;

      // ---- the eye in flames: fire tearing radially off the opened lid ----
      float fireGate = uOpen * 1.15 + uSuck * 2.0;
      if (fireGate > 0.01) {
        vec2 q = p - c;
        float r2 = length(q) + 1e-4;
        float ang2 = atan(q.y, q.x);
        // radial tongues, streaming outward, torn by ridged noise
        float tongues = rfbm(vec2(ang2 * 3.2, r2 * 9.0 - t * 0.9));
        float reach = smoothstep(0.85, 0.06, r2) * smoothstep(pr * 0.8, pr * 1.6, r2);
        float fl = tongues * tongues * reach * fireGate;
        col += mix(vec3(1.0, 0.30, 0.05), vec3(1.0, 0.75, 0.30), tongues) * fl * 1.6;
      }
    }

    float lum = dot(col, vec3(0.4));
    if (lum < 0.004) discard;
    gl_FragColor = vec4(col, min(lum * 1.4, 1.0));
  }
`;

// ---------------------------------------------------------------------------

const CRESCENT_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  void main() {
    float d1 = length(vUv);
    float d2 = length(vUv - vec2(0.34, 0.18));
    float body = smoothstep(0.86, 0.80, d1) * smoothstep(0.80, 0.88, d2);
    float glow = exp(-pow(max(0.0, d1 - 0.82), 2.0) * 60.0) * smoothstep(0.72, 0.95, d2);
    // a glint travelling slowly along the limb
    float ang = atan(vUv.y, vUv.x);
    float glint = exp(-pow(ang - (-0.6 + sin(uTime * 0.05) * 0.8), 2.0) * 6.0);
    vec3 col = vec3(0.80, 0.88, 1.0) * (body * (0.5 + 0.25 * glint) + glow * 0.35);
    float a = (body * 0.75 + glow * 0.3) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * uForm, a);
  }
`;

const GALAXY_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSpin;
  varying vec2 vUv;
  ${'' /* log-spiral arms of soft dust */}
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;
    float ang = atan(vUv.y, vUv.x) + uTime * uSpin;
    // two arms: brightness peaks along a logarithmic spiral
    float arm = 0.5 + 0.5 * cos(ang * 2.0 - log(max(r, 0.03)) * 5.5);
    arm = pow(arm, 2.2) * (0.5 + 0.5 * noise(vUv * 9.0));
    float core = exp(-r * r * 22.0) * 1.4;
    float disc = exp(-r * 2.6);
    vec3 col = vec3(0.75, 0.82, 1.0) * (arm * disc * 0.8)
             + vec3(1.0, 0.88, 0.65) * core;
    float a = (arm * disc * 0.5 + core * 0.6) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a, a);
  }
`;

// ---------------------------------------------------------------------------
// the collision — two galaxies torn into each other, and the blast
// ---------------------------------------------------------------------------

const COLLIDE_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uShow;
  uniform float uTidal;   // 0..1 how far the tearing has gone
  uniform vec2  uDir;     // toward the other galaxy, in this quad's uv
  uniform float uSpin;
  uniform vec3  uTint;    // one universe burns cold, the other warm
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float grain(vec2 p, float scale) {
    vec2 g = p * scale;
    vec2 cell = floor(g);
    vec2 f = fract(g);
    vec2 jitter = vec2(hash(cell), hash(cell + 19.7));
    float d = length(f - 0.35 - jitter * 0.3);
    float b = pow(hash(cell + 7.3), 16.0);
    return b * exp(-d * d * 30.0);
  }
  void main() {
    // the near side of the disc is dragged toward the other mass
    float side = dot(vUv, uDir) * 0.5 + 0.5;
    vec2 p = vUv + uDir * (uTidal * uTidal * 0.85 * side);
    float r = length(p);
    if (r > 1.15) discard;
    float ang = atan(p.y, p.x) + uTime * uSpin * (1.0 + uTidal * 2.5);

    // two arms with a bright ridge and a dust lane shadowing each
    float phase = ang * 2.0 - log(max(r, 0.03)) * 5.5;
    float arm = pow(0.5 + 0.5 * cos(phase), 2.0);
    float lane = pow(0.5 + 0.5 * cos(phase + 0.9), 4.0);
    arm *= (0.55 + 0.45 * noise(p * 9.0)) * (1.0 - lane * 0.65);

    // the tidal bridge: matter strung out along the pull direction
    float bridge = exp(-pow(dot(vec2(-uDir.y, uDir.x), p), 2.0) * 26.0)
                 * smoothstep(0.0, 0.8, side) * uTidal * 1.5;
    bridge *= 0.6 + 0.5 * noise(p * 14.0 + uTime * 0.2);

    float core = exp(-r * r * 26.0) * (0.75 + uTidal * 0.9);
    // glare cross off the core, like a lens catching it
    float glare = (exp(-abs(p.x) * 30.0) + exp(-abs(p.y) * 30.0)) * exp(-r * 2.6)
                * (0.5 + uTidal);
    float disc = exp(-r * 1.55);
    float dust = grain(p, 24.0) * disc * 2.2;

    vec3 col = uTint * (arm * disc * 1.8)
             + mix(uTint, vec3(1.0, 0.95, 0.85), 0.55) * core
             + vec3(0.95, 0.90, 0.80) * glare * 0.22
             + vec3(1.0, 0.62, 0.28) * bridge
             + mix(uTint, vec3(1.0), 0.5) * dust;
    float a = (arm * disc * 1.1 + core * 0.55 + bridge * 0.75 + glare * 0.18 + dust)
            * uShow;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 1.7, a);
  }
`;

const REMNANT_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uLife;   // 1 newborn wreck .. fading to 0
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;
    float ang = atan(vUv.y, vUv.x);
    // torn shells of ejecta drifting outward as it dies
    float shells = 0.5 + 0.5 * sin(r * 20.0 - uTime * 0.8 + noise(vec2(ang * 2.0, r * 4.0)) * 3.0);
    float body = exp(-r * r * 6.0) * (0.4 + 0.6 * shells);
    float core = exp(-r * r * 40.0) * 1.6;
    // white-hot at birth, dying through gold to ember red
    vec3 hot = vec3(1.0, 0.97, 0.90);
    vec3 mid = vec3(1.0, 0.62, 0.22);
    vec3 cold = vec3(0.45, 0.08, 0.03);
    vec3 col = mix(cold, mix(mid, hot, uLife), uLife * 0.8 + 0.2);
    float a = (body * 0.7 + core) * uLife;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.0, a);
  }
`;

const RING_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uRing;    // 0..1 expansion of the shockwave
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float r = length(vUv);
    float R = uRing * 0.95;
    float ang = atan(vUv.y, vUv.x);
    float torn = 0.7 + 0.5 * noise(vec2(ang * 3.0, R * 8.0));
    float ring = exp(-pow((r - R) * (26.0 - uRing * 18.0), 2.0)) * torn;
    float fade = (1.0 - uRing) * step(0.001, uRing);
    vec3 col = mix(vec3(0.55, 0.75, 1.0), vec3(1.0, 0.8, 0.5), torn - 0.7);
    float a = ring * fade * 1.2;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`;

// ---------------------------------------------------------------------------
// mountains — a jagged silhouette ring, fire behind it
// ---------------------------------------------------------------------------

const MOUNTAIN_FRAG = /* glsl */`
  precision highp float;
  uniform float uForm;
  varying vec2 vUv;   // x around the ring, y up the shell
  float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float ridge(float x) {
    // layered triangle ridges — believable peaks, dirt cheap
    float v = 0.0, a = 0.55, f = 6.0;
    for (int i = 0; i < 4; i++) {
      float xx = x * f;
      float tri = abs(fract(xx + hash1(float(i) * 7.3)) * 2.0 - 1.0);
      v += (1.0 - tri) * a;
      a *= 0.5; f *= 2.1;
    }
    return v * 0.55;
  }
  void main() {
    float h = ridge(vUv.x);
    float m = 1.0 - smoothstep(h - 0.012, h, vUv.y);
    float a = m * uForm;
    if (a < 0.004) discard;
    // near-black, faintly blue at the top edges where the fire catches
    float edge = smoothstep(h - 0.06, h, vUv.y);
    vec3 col = mix(vec3(0.008, 0.010, 0.016), vec3(0.10, 0.05, 0.03), edge * 0.7);
    gl_FragColor = vec4(col, a);
  }
`;

const FIRE_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  ${'' /* the ember glow that backlights the ridge */}
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float glow = exp(-vUv.y * 4.2);
    float lick = noise(vec2(vUv.x * 14.0, vUv.y * 5.0 - uTime * 0.06));
    vec3 col = mix(vec3(0.55, 0.16, 0.04), vec3(1.0, 0.55, 0.18), glow * lick);
    float a = glow * (0.35 + 0.4 * lick) * uForm * 0.5;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.2, a);
  }
`;

// ---------------------------------------------------------------------------
// the wormhole tunnel
// ---------------------------------------------------------------------------

const TUNNEL_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uRush;    // travel intensity 0..1
  uniform float uEnd;     // the far light growing as the exit nears
  varying vec2 vUv;       // x around, y along
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float speed = uTime * (2.0 + uRush * 9.0);
    // the whole bore slowly twists as it flies
    float xx = vUv.x + vUv.y * 0.35 + uTime * 0.02;

    // three layers of motion at three scales
    float micro = pow(noise(vec2(xx * 42.0, vUv.y * 3.0 + speed * 1.6)), 3.0);
    float streaks = pow(noise(vec2(xx * 22.0, vUv.y * 1.8 + speed)), 2.2);
    float bands = pow(noise(vec2(xx * 6.0, vUv.y * 0.7 + speed * 0.45)), 1.6) * 0.6;

    // pressure rings with a bright leading edge
    float ringPh = fract((vUv.y + speed * 0.23) * 6.0);
    float rings = pow(1.0 - abs(ringPh - 0.5) * 2.0, 9.0) * 0.55;

    // the colour of the passage drifts as we go deeper: blue -> violet -> teal
    float ph = vUv.y * 2.0 + uTime * 0.25;
    vec3 c1 = vec3(0.22, 0.42, 1.00);
    vec3 c2 = vec3(0.62, 0.35, 1.00);
    vec3 c3 = vec3(0.20, 0.85, 0.85);
    vec3 col = mix(mix(c1, c2, 0.5 + 0.5 * sin(ph)), c3, 0.5 + 0.5 * sin(ph * 0.37 + 2.0));

    // the destination: white-gold light flooding up the far end
    float endGlow = uEnd * exp(-(1.0 - vUv.y) * 5.0) * 2.2;
    col = mix(col, vec3(1.0, 0.96, 0.85), clamp(endGlow, 0.0, 0.85));

    float a = (micro * 0.8 + streaks * 1.1 + bands + rings + endGlow * 0.5) * uRush;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 1.8, a);
  }
`;

const PORTAL_FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uGrow;    // 0..1 birth of the portal
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float r = length(vUv);
    if (r > 1.0) discard;
    float ang = atan(vUv.y, vUv.x);
    // swirling accretion pulled toward a dark throat
    float swirl = noise(vec2(ang * 2.0 + r * 7.0 - uTime * 1.1, r * 5.0 - uTime * 0.7));
    float ring = exp(-pow(r - 0.55 * uGrow, 2.0) * 40.0);
    float throat = 1.0 - smoothstep(0.30 * uGrow, 0.50 * uGrow, r);
    vec3 col = mix(vec3(0.30, 0.50, 1.0), vec3(0.85, 0.65, 1.0), swirl)
             * (ring * (0.7 + 0.5 * swirl));
    col = mix(col, vec3(0.0), throat);
    float a = max(ring * uGrow, throat * uGrow * 0.95);
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;

// ---------------------------------------------------------------------------

const NOISE_JS = NOISE;
function quad(w, h, frag, uniforms, { blending = THREE.AdditiveBlending,
                                      order = 8 } = {}) {
  const mat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending,
    side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.frustumCulled = false;
  m.renderOrder = order;
  return m;
}

export function createSection3(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const shared = {
    uTime: { value: 0 },
    uForm: { value: 0 },
    uOpen: { value: 0 },
    uSuck: { value: 0 },
    uFlare: { value: 0 },
  };

  const common = FACE_COMMON;
  const darkFrag = FACE_DARK_FRAG.replace('__COMMON__', common).replace('__NOISE__', NOISE);
  const glowFrag = FACE_GLOW_FRAG.replace('__COMMON__', common).replace('__NOISE__', NOISE);

  // ---- the face: two passes over the same region of sky -------------------
  const FACE_W = 340, FACE_H = 285, FACE_Z = -190, FACE_Y = 62;
  const faceDark = quad(FACE_W, FACE_H, darkFrag, shared,
                        { blending: THREE.NormalBlending, order: 7 });
  faceDark.position.set(0, FACE_Y, FACE_Z);
  group.add(faceDark);
  const faceGlow = quad(FACE_W, FACE_H, glowFrag, shared, { order: 8 });
  faceGlow.position.set(0, FACE_Y, FACE_Z);
  group.add(faceGlow);

  // where the third eye sits in world space — the suction pivot
  const eyeWorld = new THREE.Vector3(0, FACE_Y + 0.38 * (FACE_H / 2), FACE_Z);

  // ---- crescent, galaxies --------------------------------------------------
  const crescent = quad(34, 34, CRESCENT_FRAG,
                        { uTime: shared.uTime, uForm: { value: 0 } }, { order: 8 });
  crescent.position.set(95, 130, -180);
  group.add(crescent);

  const gal1 = quad(70, 70, GALAXY_FRAG,
                    { uTime: shared.uTime, uForm: { value: 0 }, uSpin: { value: 0.010 } },
                    { order: 7 });
  gal1.position.set(-150, 45, -175);
  group.add(gal1);
  const gal2 = quad(44, 44, GALAXY_FRAG,
                    { uTime: shared.uTime, uForm: { value: 0 }, uSpin: { value: -0.014 } },
                    { order: 7 });
  gal2.position.set(150, 20, -165);
  group.add(gal2);

  // ---- the ground: mountains all around, fire behind them -----------------
  const mtnUni = { uForm: { value: 0 } };
  const mtn = new THREE.Mesh(
    new THREE.CylinderGeometry(90, 90, 34, 96, 1, true),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: MOUNTAIN_FRAG,
      uniforms: mtnUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.NormalBlending, side: THREE.BackSide,
    }));
  mtn.position.y = -14;
  mtn.renderOrder = 9;
  mtn.frustumCulled = false;
  group.add(mtn);

  const fireUni = { uTime: shared.uTime, uForm: { value: 0 } };
  const fire = new THREE.Mesh(
    new THREE.CylinderGeometry(110, 110, 60, 96, 1, true),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: FIRE_FRAG,
      uniforms: fireUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
    }));
  fire.position.y = -12;
  fire.renderOrder = 6;
  fire.frustumCulled = false;
  group.add(fire);

  // ---- embers rising in the middle distance -------------------------------
  const NE = 420;
  const epos = new Float32Array(NE * 3);
  const eseed = new Float32Array(NE);
  for (let i = 0; i < NE; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 55;
    epos[i * 3] = Math.cos(a) * r;
    epos[i * 3 + 1] = -20 + Math.random() * 30;
    epos[i * 3 + 2] = Math.sin(a) * r;
    eseed[i] = Math.random();
  }
  const egeo = new THREE.BufferGeometry();
  egeo.setAttribute('position', new THREE.BufferAttribute(epos, 3));
  egeo.setAttribute('aSeed', new THREE.BufferAttribute(eseed, 1));
  const eUni = { uTime: shared.uTime, uForm: { value: 0 }, uPixel: { value: 1 } };
  const embers = new THREE.Points(egeo, new THREE.ShaderMaterial({
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime, uForm, uPixel;
      varying float vA;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * (0.5 + aSeed * 0.8) + aSeed * 40.0, 42.0);
        p.x += sin(uTime * 0.3 + aSeed * 20.0) * 2.0;
        float hf = 1.0 - smoothstep(6.0, 22.0, p.y);
        vA = uForm * hf * (0.35 + 0.65 * fract(aSeed * 7.7));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + aSeed * 2.2) * uPixel * (140.0 / max(-mv.z, 3.0));
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying float vA;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        if (r > 0.5) discard;
        float a = exp(-r * r * 10.0) * vA;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(1.0, 0.52, 0.16) * a, a);
      }
    `,
    uniforms: eUni,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  }));
  embers.frustumCulled = false;
  embers.renderOrder = 9;
  group.add(embers);

  // ---- the collision --------------------------------------------------------
  const colA_u = { uTime: { value: 0 }, uShow: { value: 0 }, uTidal: { value: 0 },
                   uDir: { value: new THREE.Vector2(1, -0.1) }, uSpin: { value: 0.05 },
                   uTint: { value: new THREE.Color(0.45, 0.62, 1.0) } };
  const colB_u = { uTime: { value: 0 }, uShow: { value: 0 }, uTidal: { value: 0 },
                   uDir: { value: new THREE.Vector2(-1, 0.12) }, uSpin: { value: -0.065 },
                   uTint: { value: new THREE.Color(1.0, 0.58, 0.22) } };
  const colA = quad(175, 175, COLLIDE_FRAG, colA_u, { order: 22 });
  const colB = quad(150, 150, COLLIDE_FRAG, colB_u, { order: 22 });
  colA.position.set(-62, 20, -120);
  colB.position.set(62, 32, -125);
  scene.add(colA); scene.add(colB);
  colA.visible = colB.visible = false;

  // each galaxy trails the haze of its whole universe behind it: one cold,
  // one burning — the sky divides into two weathers before they meet
  const hazeMk = (tint, x) => {
    const u = { uTime: { value: 0 }, uShow: { value: 0 } };
    const m = quad(430, 330, `
      precision highp float;
      uniform float uTime;
      uniform float uShow;
      varying vec2 vUv;
      ${NOISE}
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float n = fbm(vUv * 2.6 + uTime * 0.01);
        float body = exp(-r * r * 2.2) * (0.35 + 0.65 * n);
        float a = body * uShow * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(${tint}) * a * 1.6, a);
      }
    `, u, { order: 21 });
    m.position.set(x, 26, -160);
    scene.add(m);
    m.visible = false;
    return { u, m };
  };
  const hazeA = hazeMk('0.30, 0.45, 0.95', -120);
  const hazeB = hazeMk('0.95, 0.42, 0.12', 120);

  // the interface: a wall of annihilating light where the two universes meet
  const wallU = { uTime: { value: 0 }, uWall: { value: 0 } };
  const wall = quad(60, 300, `
    precision highp float;
    uniform float uTime;
    uniform float uWall;
    varying vec2 vUv;
    ${NOISE}
    void main() {
      float x = abs(vUv.x);
      float beam = exp(-x * x * 10.0);
      float tear = 0.6 + 0.6 * fbm(vec2(vUv.y * 5.0, uTime * 0.4));
      vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), tear - 0.6);
      float a = beam * tear * uWall;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * a * 2.6, a);
    }
  `, wallU, { order: 24 });
  wall.position.set(0, 24, -130);
  scene.add(wall);
  wall.visible = false;

  const ringUni = { uTime: { value: 0 }, uRing: { value: 0 } };
  const shock = quad(420, 420, RING_FRAG, ringUni, { order: 23 });
  shock.position.set(0, 24, -138);
  scene.add(shock);
  shock.visible = false;

  const remUni = { uTime: { value: 0 }, uLife: { value: 0 } };
  const remnant = quad(90, 90, REMNANT_FRAG, remUni, { order: 22 });
  remnant.position.set(0, 24, -138);
  scene.add(remnant);
  remnant.visible = false;

  // ---- the wormhole: portal quad + rushing tunnel --------------------------
  const portalUni = { uTime: { value: 0 }, uGrow: { value: 0 } };
  const portal = quad(7, 7, PORTAL_FRAG, portalUni, { order: 26 });
  portal.position.set(0, 1.5, -9);
  scene.add(portal);          // in the seg-2 world, not the face group

  const tunnelUni = { uTime: { value: 0 }, uRush: { value: 0 }, uEnd: { value: 0 } };
  const tunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 130, 40, 1, true),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: TUNNEL_FRAG,
      uniforms: tunnelUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending, side: THREE.BackSide,
    }));
  tunnel.rotation.x = Math.PI / 2;      // axis along Z: we fly down it
  tunnel.position.set(0, 1.5, -20);
  tunnel.renderOrder = 27;
  tunnel.frustumCulled = false;
  scene.add(tunnel);

  // ---- the final darkness ---------------------------------------------------
  const blackUni = { uBlack: { value: 0 }, uWhite: { value: 0 } };
  const blackout = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 12),
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */`
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uBlack;
        uniform float uWhite;
        void main() {
          float a = max(uBlack, uWhite);
          if (a < 0.003) discard;
          gl_FragColor = vec4(vec3(uWhite) * 1.1, a);
        }
      `,
      uniforms: blackUni,
      transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.NormalBlending, side: THREE.BackSide,
    }));
  blackout.renderOrder = 50;
  blackout.frustumCulled = false;
  scene.add(blackout);

  // ---- the star-streams: during formation, stars visibly flow into the
  // lines of the face — the sky is drawing him
  const NS = 1400;
  const sStart = new Float32Array(NS * 3);
  const sEnd = new Float32Array(NS * 3);
  const sSeed = new Float32Array(NS);
  {
    // targets sampled along the features, in face-quad local space
    const fx = (u) => u * (FACE_W / 2);
    const fy = (v) => FACE_Y + v * (FACE_H / 2);
    const targets = [];
    for (let i = 0; i < 3; i++) {                        // tripundra
      for (let k = 0; k < 200; k++) {
        const x = (Math.random() * 2 - 1) * 0.46;
        targets.push([fx(x), fy(0.30 + i * 0.14 + x * x * 0.10), FACE_Z + 2]);
      }
    }
    for (let sgn = -1; sgn <= 1; sgn += 2) {             // the eyes
      for (let k = 0; k < 130; k++) {
        const x = (Math.random() * 2 - 1) * 0.14;
        targets.push([fx(sgn * 0.30 + x), fy(-0.10 + 0.03 - x * x * 1.6), FACE_Z + 2]);
      }
    }
    for (let k = 0; k < 220; k++) {                      // the third eye
      const a = Math.random() * Math.PI * 2;
      targets.push([fx(Math.cos(a) * 0.062), fy(0.38 + Math.sin(a) * 0.155), FACE_Z + 2]);
    }
    for (let k = 0; k < 160; k++) {                      // the nose fall
      const v = 0.30 - Math.random() * 0.75;
      targets.push([fx((Math.random() * 2 - 1) * 0.05), fy(v), FACE_Z + 2]);
    }
    while (targets.length < NS) targets.push(targets[(Math.random() * targets.length) | 0]);
    for (let i = 0; i < NS; i++) {
      const tgt = targets[i % targets.length];
      // each streamer starts far away on the sphere of sky around the face
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.35) * 1.8;
      const R = 260 + Math.random() * 160;
      sStart[i * 3] = Math.cos(a) * Math.cos(b) * R;
      sStart[i * 3 + 1] = 60 + Math.sin(b) * R * 0.7;
      sStart[i * 3 + 2] = -80 + Math.sin(a) * Math.cos(b) * R * 0.5 - 80;
      sEnd[i * 3] = tgt[0]; sEnd[i * 3 + 1] = tgt[1]; sEnd[i * 3 + 2] = tgt[2];
      sSeed[i] = Math.random();
    }
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sStart, 3));
  sGeo.setAttribute('aEnd', new THREE.BufferAttribute(sEnd, 3));
  sGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const streamUni = { uTime: { value: 0 }, uForm: shared.uForm, uPixel: { value: 1 } };
  const streams = new THREE.Points(sGeo, new THREE.ShaderMaterial({
    vertexShader: /* glsl */`
      attribute vec3 aEnd;
      attribute float aSeed;
      uniform float uTime, uForm, uPixel;
      varying float vA;
      void main() {
        // each star leaves for the face at its own moment during formation
        float d0 = aSeed * 0.75;
        float p = clamp((uForm - d0) / 0.25, 0.0, 1.0);
        float e = p * p * (3.0 - 2.0 * p);
        vec3 pos = mix(position, aEnd, e);
        // a slight arc, so the flow reads as current rather than teleport
        pos.y += sin(e * 3.14159) * (6.0 + aSeed * 18.0);
        vA = sin(e * 3.14159) * 0.9 + (1.0 - step(0.999, e)) * 0.0;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.2 + aSeed * 2.0) * uPixel * (300.0 / max(-mv.z, 10.0));
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying float vA;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        if (r > 0.5) discard;
        float a = exp(-r * r * 18.0) * vA;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.80, 0.88, 1.0) * a, a);
      }
    `,
    uniforms: streamUni,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending,
  }));
  streams.frustumCulled = false;
  streams.renderOrder = 9;
  group.add(streams);

  group.visible = false;

  return {
    group, eyeWorld,
    /** 0..1 approach and tearing of the two galaxies */
    set collide(v) {
      const show = v > 0.001 && v < 1.0;
      colA.visible = colB.visible = show;
      hazeA.m.visible = hazeB.m.visible = show;
      wall.visible = v > 0.80 && v < 0.995;
      colA_u.uShow.value = colB_u.uShow.value = Math.min(1, v * 4.0);
      hazeA.u.uShow.value = hazeB.u.uShow.value = Math.min(1, v * 3.0) * (1 - v * 0.3);
      wallU.uWall.value = Math.max(0, (v - 0.80) / 0.20);
      colA_u.uTidal.value = colB_u.uTidal.value = Math.pow(v, 1.6);
      // they fall into each other, accelerating
      const d = 62 * (1 - Math.pow(v, 1.7) * 0.88);
      colA.position.x = -d;
      colB.position.x = d;
      colB.position.y = 32 - Math.pow(v, 1.7) * 12;
      hazeA.m.position.x = -120 + Math.pow(v, 1.7) * 55;
      hazeB.m.position.x = 120 - Math.pow(v, 1.7) * 55;
    },
    /** the detonation: white-out flash */
    set flash(v) { blackUni.uWhite.value = v; },
    /** the shockwave ring expanding from the impact */
    set ring(v) { ringUni.uRing.value = v; shock.visible = v > 0.002 && v < 0.999; },
    /** the merged wreck, cooling from white to ember to nothing */
    set remnant(v) { remUni.uLife.value = v; remnant.visible = v > 0.002; },
    /** the light at the end of the tunnel */
    set tunnelEnd(v) { tunnelUni.uEnd.value = v; },
    /** the surge when the name lands */
    set flare(v) { shared.uFlare.value = v; },
    /** the fire behind the mountains rises with the terror */
    set fireSurge(v) { fireUni.uForm.value = Math.min(1.6, fireUni.uForm.value * (1 + v)); },
    set portal(v) { portalUni.uGrow.value = v; portal.visible = v > 0.002; },
    set rush(v) { tunnelUni.uRush.value = v; tunnel.visible = v > 0.002; },
    set form(v) {
      shared.uForm.value = v;
      group.visible = v > 0.001 || shared.uSuck.value > 0.001;
      crescent.material.uniforms.uForm.value = Math.min(1, v * 2.2);
      gal1.material.uniforms.uForm.value = Math.min(1, Math.max(0, v * 1.8 - 0.15));
      gal2.material.uniforms.uForm.value = Math.min(1, Math.max(0, v * 1.8 - 0.25));
      mtnUni.uForm.value = Math.min(1, v * 2.6);
      fireUni.uForm.value = Math.min(1, Math.max(0, v * 2.2 - 0.2));
      eUni.uForm.value = Math.min(1, Math.max(0, v * 2.0 - 0.3));
    },
    set open(v) { shared.uOpen.value = v; },
    set suck(v) {
      shared.uSuck.value = v;
      // the world rushes toward the third eye: scale the whole sky-face up
      // around that point, so the hole grows to meet you
      const s = 1 + v * v * 7.0;
      group.scale.setScalar(s);
      group.position.copy(eyeWorld).multiplyScalar(1 - s);
    },
    set black(v) { blackUni.uBlack.value = v; },
    update(t, pr, camera) {
      shared.uTime.value = t;
      portalUni.uTime.value = t;
      tunnelUni.uTime.value = t;
      colA_u.uTime.value = t;
      colB_u.uTime.value = t;
      hazeA.u.uTime.value = t;
      hazeB.u.uTime.value = t;
      wallU.uTime.value = t;
      ringUni.uTime.value = t;
      remUni.uTime.value = t;
      streamUni.uTime.value = t;
      streamUni.uPixel.value = pr;
      eUni.uPixel.value = pr;
      if (blackout.visible !== blackUni.uBlack.value > 0.003) {
        blackout.visible = blackUni.uBlack.value > 0.003;
      }
      camera.getWorldPosition(blackout.position);
      // the tunnel stays threaded on the viewer
      tunnel.position.x = blackout.position.x;
      tunnel.position.y = blackout.position.y;
    },
  };
}
