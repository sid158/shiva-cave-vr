/**
 * The journey — segments one and two.
 *
 * SEGMENT ONE · "the room lets go"
 *   Passthrough. The user's real room, settled by the narration; from 1:10
 *   the world dulls — a black shell over the passthrough literally darkens
 *   the camera feed — completing exactly as the voice does. Within three
 *   seconds the first stars are burning, and the indigo nebula follows.
 *
 * SEGMENT TWO · "प्राण" — prana
 *   The stars leave. The nebula releases its band and floods the whole sky
 *   as a blue-green current veined with red. A mass of green-gold energy
 *   hangs ahead — अनंत ऊर्जा — and when the voice guides the breath, gold
 *   light streams from space into the breath, and red energy pours out with
 *   the exhale. After the voice leaves, the breathing continues on a slow
 *   cycle, and so does the light.
 *
 * THE AUDIO IS THE CLOCK. Segment one runs on its track's currentTime;
 * segment two resynchronises to its own track through the WebAudio clock
 * (buffer playback — immune to autoplay policy, since the context is already
 * running). Between and after tracks, wall time carries the clock forward
 * from wherever the audio left it. A dropped frame can never drift the
 * visuals from the voice.
 */

import * as THREE from 'three';
import { createVoid, createStars, createMotes, createNebula, createCurtains } from './space.js';
import { createNarrator } from './orb.js';
import { createPrana } from './prana.js';
import { createSection3 } from './shivaFace.js';
import { createNaraka } from './naraka.js';

// ---------------------------------------------------------------------------
// timeline — seconds on the master clock (segment 1 voice enters at 0)
// ---------------------------------------------------------------------------
const T = {
  motesIn:     [34.0, 64.0],   // something is present, barely
  motesFull:   [64.0, 78.0],

  // The world does not break — it dulls. Timed so the dark completes as the
  // voice does: her last words land in a room that is already almost gone,
  // and within three seconds of the final syllable the stars have begun.
  dim:         [70.0, 84.5],

  stars:       [85.5, 104.0],  // the sky assembles, faintest last
  nebula:      [90.0, 112.0],  // the fluid colour arrives under the stars

  drone:       [68.0, 88.0],   // sub-bass swell under the dimming
};

// --------------------------------------------------------------- segment 2 --
// Offsets measured against the actual recording (62.0s):
//   "अपने सामने देखिये, अनंत ऊर्जा"  at +19.6
//   "एक गहरी सांस लीजिये और रोकिये" ends +29.1  -> inhale 29..33
//   "अब सांस छोड़िये"                at +33.5    -> exhale 33.6..
//   voice ends                        +62.0
const S2 = 116.0;                    // segment two enters on the sky's heels
const SEG2 = {
  start:     S2,
  url:       'assets/audio/journey_02.mp3',
  starsOut:  [S2 + 5.0, S2 + 17.0],  // the stars completely disappear
  palette:   [S2 + 6.0, S2 + 21.0],  // indigo -> blue-green with red veins
  full:      [S2 + 6.0, S2 + 23.0],  // the band releases; fluid everywhere
  curtains:  [S2 + 10.0, S2 + 26.0], // the aurora sheets rise
  core:      [S2 + 18.5, S2 + 24.5], // अनंत ऊर्जा materialises ahead
  field:     [S2 + 20.0, S2 + 28.0], // ambient gold shimmer wakes
  breathIn:  [S2 + 28.9, S2 + 33.3], // guided inhale
  breathOut: [S2 + 33.6, S2 + 38.5], // guided exhale
  loopFrom:  S2 + 66.0,              // (superseded by section 3's portal)
  loopPeriod: 11.5,
  loopAmp:   0.62,
};

// --------------------------------------------------------------- section 3 --
// No voiceover yet — the whole passage is provisional and will be re-timed
// to the recording when it arrives.
const S3P = S2 + 63.5;               // the portal opens on her last breath
const V3 = S3P + 11.0;               // and her voice returns AFTER the crossing
const SEG3 = {
  voiceUrl: 'assets/audio/journey_03.mp3',
  voiceAt:  V3,
  portal:   [S3P, S3P + 2.5],        // the wormhole tears open ahead
  tunnel:   [S3P + 2.3, S3P + 9.6],  // seven seconds through it
  arrive:   S3P + 9.6,               // flung into the still dark
  // measured against the 60.45s recording (offsets from V3):
  //   "...नष्ट होते आये हैं"  ends +6.7   -> the collision detonates
  //   "न कोई प्रारम्भ"        at  +32.2   -> the face begins
  //   "शिव"                   at  +48.4   -> the flare
  //   voice ends                  +60.4   -> the eye opens, burning
  collide:  [V3 + 0.2, V3 + 6.6],
  blast:    V3 + 6.85,
  remnant:  [V3 + 7.2, V3 + 16.0],   // the merged wreck cools and dies
  world:    [V3 + 9.0, V3 + 16.5],
  drumFrom: V3 + 23.5,
  form:     [V3 + 32.2, V3 + 47.5],
  flare:    [V3 + 48.4, V3 + 51.0],
  open:     [V3 + 60.8, V3 + 65.5],
  suck:     [V3 + 64.5, V3 + 70.5],
  black:    [V3 + 69.5, V3 + 71.5],
};

// --------------------------------------------------------------- section 4 --
// Keyed to the 62.75s recording:
//   "इस जगह को नर्क बोला गया है"   at +11.7  (hell is named)
//   "इसे ध्यान से देखिये..."        at +22.4  (the Watcher)
//   "ॐ नमः शिवाय"                  at +55.2  (the release)
const S4 = V3 + 73.0;                // out of the black, onto the stone
const SEG4 = {
  voiceUrl: 'assets/audio/journey_04.mp3',
  voiceAt:  S4 + 2.0,
  reveal:   [S4, S4 + 4.5],
  walk:     [S4 + 3.0, S4 + 62.0],
  watch:    [S4 + 24.4, S4 + 30.5],  // "इसका रूप भयंकर है"
  mantra:   S4 + 57.2,               // "ॐ नमः शिवाय"
  release:  [S4 + 57.2, S4 + 61.5],
  white:    [S4 + 59.5, S4 + 64.5],
  end:      S4 + 68.0,
};

const AUDIO_URL = 'assets/audio/journey_01.mp3';

// Breathing room between pressing Begin and the first word. The orb arrives
// in this quiet — presence first, voice second.
const START_DELAY = 4.0;

// segment-1 voice ends at 84.4s; the narrator dissolves with the world and
// does not return — in the prana world the voice is bodiless
const ORB1_OUT = [82.5, 88.5];

const lerp = (a, b, t) => a + (b - a) * t;
const inv = (t, [a, b]) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const ease = (x) => x * x * (3 - 2 * x);

// ---------------------------------------------------------------------------

function status(msg, sub) {
  const el = document.getElementById('status');
  if (el) el.textContent = msg;
  const s = document.getElementById('substatus');
  if (s && sub !== undefined) s.textContent = sub;
}

/**
 * A single low tone that swells as the room dims. Silence through the
 * dissolution reads as a bug rather than as space, and the body registers a
 * sub-bass rise as physical movement — it is most of why the drop feels like
 * falling. Kept quiet enough to sit under the voice.
 */
function createDrone(ctx, destination) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220;
  filter.Q.value = 0.6;
  filter.connect(gain);

  // detuned sines an octave apart beat slowly against each other
  for (const [freq, level] of [[38, 0.55], [57, 0.28], [76.4, 0.18]]) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    o.connect(g).connect(filter);
    o.start();
  }
  return {
    set level(v) {
      gain.gain.setTargetAtTime(v * 0.09, ctx.currentTime, 0.25);
    },
  };
}

// ---------------------------------------------------------------------------

async function boot() {
  status('Preparing\u2026', 'starting the engine');
  const canvas = document.getElementById('view');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,                  // required: passthrough shows through
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearAlpha(0);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 900);
  camera.position.set(0, 1.35, 0);

  // the rig exists so the drift in deep space can move the viewer without
  // touching the XR camera, which the headset owns
  const rig = new THREE.Group();
  rig.add(camera);
  scene.add(rig);

  status('Preparing\u2026', 'building the sky');
  const voidShell = createVoid(scene);
  const stars = createStars(scene);
  // two fluid layers: a vast, slow, distant one for scale, and the nearer
  // current that carries the detail and the breath
  const nebulaFar = createNebula(stars.group, { radius: 460, scale: 0.85, gain: 0.7, order: -2 });
  const nebula = createNebula(stars.group, { radius: 300, scale: 1.9, gain: 1.0, order: -1 });
  const curtains = createCurtains(stars.group);
  const motes = createMotes(scene);
  const narrator = createNarrator(scene);
  const prana = createPrana(scene);
  status('Preparing\u2026', 'building the worlds');
  const sec3 = createSection3(scene);
  const naraka = createNaraka(scene);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ------------------------------------------------------------- audio ----
  const audio = new Audio();
  audio.src = AUDIO_URL;
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  let audioReady = false;
  audio.addEventListener('canplaythrough', () => { audioReady = true; }, { once: true });
  audio.addEventListener('error', () => {
    console.warn('[journey] segment-1 voice failed to load');
    audioReady = true;                     // never block the experience on it
  }, { once: true });

  let ctx = null;
  let drone = null;
  let voiceBus = null;
  let whooshGain = null;
  let beat = null;
  function initAudioGraph() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      const src = ctx.createMediaElementSource(audio);
      voiceBus = ctx.createGain();
      voiceBus.gain.value = 1.0;
      src.connect(voiceBus).connect(master);
      narrator.attachAnalyser(ctx, voiceBus);
      drone = createDrone(ctx, master);

      // ---- section-3 instruments ----------------------------------------
      // the tunnel's roar: looped noise through a resonant bandpass
      const nlen = ctx.sampleRate * 2;
      const nbuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
      const nd = nbuf.getChannelData(0);
      for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;
      const nsrc = ctx.createBufferSource();
      nsrc.buffer = nbuf;
      nsrc.loop = true;
      const nbp = ctx.createBiquadFilter();
      nbp.type = 'bandpass';
      nbp.frequency.value = 320;
      nbp.Q.value = 0.7;
      whooshGain = ctx.createGain();
      whooshGain.gain.value = 0;
      nsrc.connect(nbp).connect(whooshGain).connect(master);
      nsrc.start();

      // the damaru heart: a two-stroke pulse, deep and dry
      beat = (strength) => {
        const t0 = ctx.currentTime;
        for (const [dt, f0, g0] of [[0, 58, 0.5], [0.19, 46, 0.34]]) {
          const o = ctx.createOscillator();
          o.type = 'sine';
          o.frequency.setValueAtTime(f0 * 1.6, t0 + dt);
          o.frequency.exponentialRampToValueAtTime(f0, t0 + dt + 0.06);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t0 + dt);
          g.gain.linearRampToValueAtTime(g0 * strength * 0.4, t0 + dt + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.30);
          o.connect(g).connect(master);
          o.start(t0 + dt);
          o.stop(t0 + dt + 0.4);
        }
      };
    } catch (e) {
      console.warn('[journey] web audio unavailable, voice only', e);
    }
  }

  // segment 2 rides the WebAudio clock: decoded buffer, started on schedule.
  // A second <audio> element could be blocked by autoplay policy this long
  // after the user's gesture; a buffer on a running context cannot be.
  let buf2 = null;
  let s2StartCtx = null;
  let s2Done = false;
  let buf3 = null;
  let s3StartCtx = null;
  let s3Done = false;
  let buf4 = null;
  let s4StartCtx = null;
  let s4Done = false;
  async function loadSeg2() {
    try {
      const r = await fetch(SEG2.url);
      const ab = await r.arrayBuffer();
      if (ctx) buf2 = await ctx.decodeAudioData(ab);
    } catch (e) {
      console.warn('[journey] segment-2 voice failed to load', e);
    }
    try {
      const r3 = await fetch(SEG3.voiceUrl);
      const ab3 = await r3.arrayBuffer();
      if (ctx) buf3 = await ctx.decodeAudioData(ab3);
    } catch (e) {
      console.warn('[journey] segment-3 voice failed to load', e);
    }
    try {
      const r4 = await fetch(SEG4.voiceUrl);
      const ab4 = await r4.arrayBuffer();
      if (ctx) buf4 = await ctx.decodeAudioData(ab4);
    } catch (e) {
      console.warn('[journey] segment-4 voice failed to load', e);
    }
  }

  // -------------------------------------------------------- the clock ----
  let started = false;
  let tailStart = 0;
  let audioDuration = 84.4;
  audio.addEventListener('loadedmetadata', () => {
    if (isFinite(audio.duration)) audioDuration = audio.duration;
  });

  let manualT = null;              // debug override
  let smoothT = -START_DELAY;
  let lastPerf = 0;
  function rawNow() {
    if (!started) return -START_DELAY;
    if (s4StartCtx !== null && !s4Done && ctx) {
      const tt = SEG4.voiceAt + (ctx.currentTime - s4StartCtx);
      tailStart = performance.now() / 1000 - tt;
      return tt;
    }
    // segment three playing: its buffer clock is authoritative
    if (s3StartCtx !== null && !s3Done && ctx) {
      const tt = SEG3.voiceAt + (ctx.currentTime - s3StartCtx);
      tailStart = performance.now() / 1000 - tt;
      return tt;
    }
    // segment two playing: its buffer clock is authoritative
    if (s2StartCtx !== null && !s2Done && ctx) {
      const tt = SEG2.start + (ctx.currentTime - s2StartCtx);
      tailStart = performance.now() / 1000 - tt;
      return tt;
    }
    // segment one playing: its element clock is authoritative
    if (!audio.ended && audio.currentTime > 0.01) {
      tailStart = performance.now() / 1000 - audio.currentTime;
      return audio.currentTime;
    }
    // between and after tracks: wall time carries on from where audio left it
    return performance.now() / 1000 - tailStart;
  }
  /**
   * Every voice hand-off re-anchors the clock, and the two clocks are never
   * more than a couple hundred milliseconds apart — but a couple hundred
   * milliseconds of every eased value snapping at once reads as the world
   * glitching. So the visible clock SLEWS: it converges on the true clock
   * over a third of a second instead of jumping.
   */
  function now() {
    if (manualT !== null) return manualT;
    const raw = rawNow();
    const pf = performance.now() / 1000;
    const wdt = Math.min(0.1, Math.max(0.0005, pf - lastPerf));
    lastPerf = pf;
    const diff = raw - smoothT;
    if (Math.abs(diff) > 2.5) smoothT = raw;               // a real seek: snap
    else smoothT += diff * Math.min(1, wdt * (Math.abs(diff) > 0.05 ? 3.0 : 60.0));
    return smoothT;
  }

  // ------------------------------------------------------- XR session ----
  let xrMode = 'flat';

  async function pickSessionMode() {
    if (!navigator.xr) return null;
    const capped = (p) => Promise.race([
      p.catch(() => false),
      new Promise((r) => setTimeout(() => r(false), 4000)),
    ]);
    if (await capped(navigator.xr.isSessionSupported('immersive-ar'))) return 'immersive-ar';
    if (await capped(navigator.xr.isSessionSupported('immersive-vr'))) return 'immersive-vr';
    return null;
  }

  async function enter() {
    initAudioGraph();
    if (ctx && ctx.state === 'suspended') await ctx.resume();
    loadSeg2();                     // decode during segment one

    const mode = await pickSessionMode();
    if (mode) {
      const init = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking'],
      };
      try {
        const session = await navigator.xr.requestSession(mode, init);
        await renderer.xr.setSession(session);
        xrMode = mode;
        session.addEventListener('end', () => { xrMode = 'flat'; });
      } catch (e) {
        console.warn('[journey] could not start', mode, e);
      }
    }

    document.body.classList.add('started');
    started = true;
    // the clock counts up from -START_DELAY; the voice enters at zero
    tailStart = performance.now() / 1000 + START_DELAY;
    setTimeout(() => {
      audio.play().catch((e) => console.warn('[journey] autoplay blocked', e));
    }, START_DELAY * 1000);
  }

  // -------------------------------------------------- segment-2 breathing --
  let breathOverride = null;       // [in, out] for headless verification
  function breathGates(t) {
    if (breathOverride) return breathOverride;
    // the guided breath, exactly where the voice asks for it
    let gIn = ease(inv(t, [SEG2.breathIn[0], SEG2.breathIn[0] + 1.6]))
            * (1 - ease(inv(t, [SEG2.breathIn[1], SEG2.breathIn[1] + 1.0])));
    let gOut = ease(inv(t, [SEG2.breathOut[0], SEG2.breathOut[0] + 0.25]))
             * (1 - ease(inv(t, [SEG2.breathOut[0] + 0.55, SEG2.breathOut[0] + 1.2])));
    // after she falls silent: the slow cycle she asked them to keep —
    // gentler, endless
    if (t > SEG2.loopFrom && t < SEG3.collide[0]) {
      const ph = (t - SEG2.loopFrom) % SEG2.loopPeriod;
      const a = SEG2.loopAmp;
      const li = a * ease(inv(ph, [0.0, 1.8])) * (1 - ease(inv(ph, [4.4, 5.6])));
      const lo = a * ease(inv(ph, [6.0, 6.3])) * (1 - ease(inv(ph, [6.7, 7.4])));
      gIn = Math.max(gIn, li);
      gOut = Math.max(gOut, lo);
    }
    return [gIn, gOut];
  }

  // ----------------------------------------------------------- the loop --
  const drift = new THREE.Vector3();
  let prevT = -START_DELAY;
  let radialFlow = 0;
  let flowVel = 0;
  let lastBeatIdx = -1;
  let boltEnv = 0;

  renderer.setAnimationLoop(() => {
    const t = now();
    const dt2 = THREE.MathUtils.clamp(t - prevT, 0.001, 0.1);
    prevT = t;
    const gl = renderer.getContext();
    const pr = Math.max(0.5, gl.drawingBufferHeight / 900);
    const activeCam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;

    // --- start each segment's voice on schedule ----------------------------
    if (started && s2StartCtx === null && buf2 && ctx && t >= SEG2.start && manualT === null) {
      const s2 = ctx.createBufferSource();
      s2.buffer = buf2;
      s2.connect(voiceBus);
      s2.onended = () => { s2Done = true; };
      s2.start();
      s2StartCtx = ctx.currentTime;
    }
    if (started && s3StartCtx === null && buf3 && ctx && t >= SEG3.voiceAt && manualT === null) {
      const s3src = ctx.createBufferSource();
      s3src.buffer = buf3;
      s3src.connect(voiceBus);
      s3src.onended = () => { s3Done = true; };
      s3src.start();
      s3StartCtx = ctx.currentTime;
    }
    if (started && s4StartCtx === null && buf4 && ctx && t >= SEG4.voiceAt && manualT === null) {
      const s4src = ctx.createBufferSource();
      s4src.buffer = buf4;
      s4src.connect(voiceBus);
      s4src.onended = () => { s4Done = true; };
      s4src.start();
      s4StartCtx = ctx.currentTime;
    }

    // --- every timeline value, up front -------------------------------------
    const [gIn, gOut] = breathGates(t);

    // section 3: the crossing, then — witnessed from the far shore — the
    // death of two universes, and out of the wreckage, him
    const portalV = ease(inv(t, SEG3.portal))
                  * (1 - ease(inv(t, [SEG3.tunnel[0] + 1.0, SEG3.tunnel[0] + 2.0])));
    const rushV = ease(inv(t, [SEG3.tunnel[0], SEG3.tunnel[0] + 1.6]))
                * (1 - ease(inv(t, [SEG3.tunnel[1] - 1.4, SEG3.tunnel[1]])));
    const tunnelEndV = ease(inv(t, [SEG3.tunnel[1] - 2.6, SEG3.tunnel[1] - 0.3]));
    const collideV = ease(inv(t, SEG3.collide));
    const flashV = ease(inv(t, [SEG3.blast, SEG3.blast + 0.25]))
                 * (1 - ease(inv(t, [SEG3.blast + 0.5, SEG3.blast + 1.6])));
    const ringV = inv(t, [SEG3.blast, SEG3.blast + 3.6]);
    const remnantV = ease(inv(t, [SEG3.remnant[0], SEG3.remnant[0] + 0.8]))
                   * (1 - ease(inv(t, [SEG3.remnant[1] - 3.0, SEG3.remnant[1]])));
    const formV = ease(inv(t, SEG3.form));
    const worldV = ease(inv(t, SEG3.world));
    const flareV = ease(inv(t, [SEG3.flare[0], SEG3.flare[0] + 0.7]))
                 * (1 - ease(inv(t, [SEG3.flare[1] - 0.6, SEG3.flare[1] + 1.2])));
    const openV = ease(inv(t, SEG3.open));
    const suckV = ease(inv(t, SEG3.suck));
    const blackV = ease(inv(t, SEG3.black));
    const s3fade = ease(inv(t, [SEG3.tunnel[0] + 0.5, SEG3.tunnel[0] + 4.5]));
    const starsBack = ease(inv(t, [SEG3.arrive - 0.5, SEG3.arrive + 3.0]));

    // section 4 values
    const hellV = ease(inv(t, SEG4.reveal));
    const walkV = ease(inv(t, SEG4.walk));
    const watchV = ease(inv(t, SEG4.watch));
    const releaseV = ease(inv(t, SEG4.release));
    const whiteV4 = ease(inv(t, SEG4.white));

    sec3.collide = collideV;
    sec3.ring = ringV;
    sec3.rush = rushV;
    sec3.tunnelEnd = tunnelEndV;
    sec3.remnant = remnantV;
    // the world (mountains, fire, embers, moon, galaxies) rides ahead of the
    // face itself: form carries both, offset so the ground arrives first —
    // and ALL of section 3 is gone once hell has us
    const s3gone = 1 - hellV;
    sec3.form = Math.max(worldV * 0.34, formV) * s3gone;
    sec3.flare = flareV * s3gone;
    sec3.open = openV * s3gone;
    sec3.suck = suckV * s3gone;
    sec3.black = Math.max(blackV * (1 - hellV), 0);
    sec3.flash = Math.max(flashV, whiteV4 * 0.92);
    sec3.update(t, pr, activeCam);

    // ---- section 4: the walk through Naraka -------------------------------
    naraka.reveal = hellV;
    naraka.watch = watchV * (1 - releaseV);
    naraka.release = releaseV;
    // lightning: sudden strikes, fast decay, none after the mantra
    if (hellV > 0.5 && releaseV < 0.2 && manualT === null && Math.random() < dt2 * 0.35) {
      boltEnv = 0.7 + Math.random() * 0.5;
    }
    boltEnv *= Math.exp(-dt2 * 6.0);
    naraka.bolt = boltEnv;
    nebula.bolt = boltEnv;
    nebulaFar.bolt = boltEnv;
    naraka.update(t, activeCam);

    // --- motes -------------------------------------------------------------
    const moteFade =
      lerp(0, 0.55, ease(inv(t, T.motesIn))) + lerp(0, 0.45, ease(inv(t, T.motesFull)));
    motes.fade = moteFade * (1 - ease(inv(t, [T.dim[0], T.dim[0] + 9])));
    motes.update(t, pr);

    // --- the dimming -------------------------------------------------------
    voidShell.opacity = Math.pow(inv(t, T.dim), 1.6);

    // --- stars, nebula, curtains --------------------------------------------
    stars.emerge = inv(t, T.stars);
    stars.global = ((1 - ease(inv(t, SEG2.starsOut))) + starsBack * (1 - suckV) * 0.85) * (1 - hellV);
    stars.update(t, pr);

    const paletteV = ease(inv(t, SEG2.palette));
    const fullV = ease(inv(t, SEG2.full));
    // when the breath happens the sky steps back for it; through the tunnel
    // the prana world streams away entirely
    const recede = (1 - 0.45 * prana.breathing) * (1 - s3fade) * (1 - collideV * 0.8);
    nebula.hell = hellV * (1 - whiteV4);
    nebulaFar.hell = hellV * (1 - whiteV4);
    nebula.emerge = (ease(inv(t, T.nebula)) * (recede + s3fade * 0.30 * (1 - suckV)))
                  * (1 - hellV);
    nebula.palette = paletteV * (1 - s3fade * 0.85);
    nebula.full = fullV * (1 - s3fade * 0.6);
    nebula.update(t);
    nebulaFar.emerge = (ease(inv(t, T.nebula)) * (0.9 * recede + s3fade * 0.45 * (1 - suckV)))
                     * (1 - hellV);
    nebulaFar.palette = paletteV * (1 - s3fade * 0.85);
    nebulaFar.full = fullV * (1 - s3fade * 0.6);
    nebulaFar.update(t * 0.55);              // the distance moves slower
    curtains.emerge = ease(inv(t, SEG2.curtains)) * recede;
    curtains.update(t);

    // --- prana --------------------------------------------------------------
    // the sky itself breathes: inward on the inhale, out on the exhale
    const targetVel = 0.05 + gIn * 0.85 - gOut * 1.0;
    flowVel += (targetVel - flowVel) * (1 - Math.exp(-dt2 * 2.2));
    radialFlow += flowVel * dt2;
    nebula.radial = radialFlow;
    nebulaFar.radial = radialFlow * 0.35;

    prana.core = ease(inv(t, SEG2.core)) * (1 - s3fade);
    prana.field = ease(inv(t, SEG2.field)) * (1 - s3fade);
    prana.gateIn = gIn * (1 - s3fade);
    prana.gateOut = gOut * (1 - s3fade);
    prana.update(t, dt2, activeCam, pr);

    // --- drift ---------------------------------------------------------------
    const free = ease(inv(t, [T.dim[0] + 8, T.dim[1] + 8])) * (1 - suckV);
    drift.set(
      Math.sin(t * 0.031) * 0.55,
      Math.sin(t * 0.019 + 1.7) * 0.42,
      Math.cos(t * 0.024) * 0.55
    ).multiplyScalar(free);
    if (t < SEG4.reveal[0]) rig.position.copy(drift);
    else rig.position.set(0, 0, -walkV * 120);
    rig.rotation.z = Math.sin(t * 0.013) * 0.030 * free;

    // --- the narrator ---------------------------------------------------------
    narrator.fade =
      ease(inv(t, [-START_DELAY + 0.8, -0.2])) * (1 - ease(inv(t, ORB1_OUT)));
    narrator.update(t, dt2, activeCam);

    // --- drone, roar, heartbeat -----------------------------------------------
    if (drone) {
      if (t < SEG2.start - 4) {
        const swell = ease(inv(t, T.drone));
        const settle = 1 - 0.45 * ease(inv(t, [90, 118]));
        drone.level = swell * settle;
      } else if (t < SEG3.collide[0]) {
        drone.level = 0.10 + 0.10 * gIn - 0.04 * gOut;
      } else if (t < SEG4.reveal[0]) {
        drone.level = 0.10 + collideV * 0.16 + formV * 0.12 + suckV * 0.4 - blackV * 0.34;
      } else {
        drone.level = (0.16 + hellV * 0.10) * (1 - releaseV);
      }
    }
    if (whooshGain && ctx && manualT === null) {
      const fireRoar = hellV * 0.30 * (1 - releaseV);
      const water = whiteV4 * 0.24;                    // the first water
      const roar = collideV * 0.16 + flashV * 1.0 + rushV * 0.62 + suckV * 0.85
                 + fireRoar + water;
      whooshGain.gain.setTargetAtTime(roar * 0.16, ctx.currentTime, 0.12);
    }
    if (beat && manualT === null && t > SEG3.drumFrom && t < SEG4.mantra) {
      let period;
      if (t < SEG4.reveal[0]) {
        period = 1.45 - formV * 0.35 - openV * 0.25 - suckV * 0.25;   // it quickens
      } else {
        // in hell the heartbeat is wrong: it stumbles
        const base = Math.floor(t / 1.6);
        period = 1.35 + ((Math.sin(base * 12.9898) * 43758.5453) % 1) * 0.55;
      }
      const idx = Math.floor(t / period);
      if (idx !== lastBeatIdx) {
        lastBeatIdx = idx;
        beat(0.55 + formV * 0.3 + openV * 0.45 + suckV * 0.6 + hellV * 0.25);
      }
    }

    renderer.render(scene, camera);
  });

  // --------------------------------------------------------------- UI ----
  // Compile every shader in the whole journey NOW. A program that compiles
  // mid-experience freezes the frame it first appears on — which is exactly
  // the "break" between sections. Pay the cost here, behind the Begin button.
  status('Preparing\u2026', 'warming the shaders');
  await new Promise((r) => setTimeout(r, 30));    // let the status paint
  {
    const wasVis = [];
    scene.traverse((o) => { wasVis.push([o, o.visible]); o.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) { console.warn('[journey] compile', e); }
    for (const [o, v] of wasVis) o.visible = v;
  }

  status('Preparing\u2026', 'checking the headset');
  const mode = await pickSessionMode();
  if (mode === 'immersive-ar') {
    status('Put your headset on and begin.', 'You will start in your own room.');
  } else if (mode === 'immersive-vr') {
    status('Passthrough unavailable — begin anyway.',
           'Your room will be represented rather than seen.');
  } else {
    status('Preview in browser', 'Open this page in the Quest browser for the full experience.');
  }

  const btn = document.getElementById('begin');
  btn.disabled = false;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    if (!audioReady) {
      status('Loading the voice…');
      await new Promise((r) => {
        if (audioReady) return r();
        const iv = setInterval(() => { if (audioReady) { clearInterval(iv); r(); } }, 100);
        setTimeout(() => { clearInterval(iv); r(); }, 6000);
      });
    }
    await enter();
  });

  // ------------------------------------------------------------ debug ----
  window.JOURNEY = {
    THREE, scene, camera, renderer, stars, nebula, voidShell, motes,
    narrator, prana, sec3, naraka, T, SEG2, SEG3, SEG4,
    seek: (t) => { manualT = t; },
    resume: () => { manualT = null; },
    look: (yaw, pitch = 0) => { camera.rotation.set(pitch, yaw, 0, 'YXZ'); },
    moveTo: (x, y, z) => { rig.position.set(0, 0, 0); camera.position.set(x, y, z); },
    /** force the breath gates for headless verification */
    forceBreath: (i, o) => { breathOverride = (i === null) ? null : [i, o]; },
    /** feed the orb a fake speech level when there is no analyser */
    fakeLevel: (v) => { narrator.uniforms.uLevel.value = v; },
    dryStart: () => {
      started = true;
      tailStart = performance.now() / 1000;
      document.body.classList.add('started');
    },
    state: () => ({
      t: now(), xrMode, voidOpacity: voidShell.opacity,
      starEmerge: stars.emerge, nebulaEmerge: nebula.emerge,
      orbFade: narrator.fade,
    }),
  };
  window.__JOURNEY_READY = true;
}

boot().catch((e) => {
  console.error(e);
  window.__JOURNEY_ERROR = String(e && e.stack || e);
  status('Something went wrong.', String(e));
});
