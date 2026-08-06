/**
 * The user's own room — acquired, rendered in monochrome, then broken apart.
 *
 * WebXR gives us no way to touch the passthrough image itself: the camera feed
 * is composited by the system *underneath* whatever we draw, so we cannot
 * desaturate it, dim it or post-process it. The trick is to go the other way —
 * we reconstruct the room's actual surfaces from Quest's scene understanding
 * and draw them, in grey, exactly on top of where the real walls are. Because
 * the geometry lines up with what the eye already sees, the brain reads it as
 * "my room just turned black and white" rather than "something appeared".
 *
 * Then we shatter that reconstruction, and once the shards have drifted clear
 * an opaque void has faded in behind them — which is what actually removes the
 * passthrough from view.
 *
 * Source priority:
 *   1. mesh-detection  — the full scene mesh, best fidelity
 *   2. plane-detection — walls/floor/ceiling as polygons, still convincing
 *   3. a synthetic box — so the sequence works on a headset with no Space
 *      Setup, and on the desktop where there is no XR at all
 */

import * as THREE from 'three';

const FALLBACK = { w: 4.2, h: 2.7, d: 3.9, floor: 0.0 };

// ---------------------------------------------------------------------------
// geometry acquisition
// ---------------------------------------------------------------------------

/** Quest's scene mesh, already triangulated. */
function fromMeshes(frame, refSpace) {
  const set = frame.detectedMeshes;
  if (!set || set.size === 0) return null;
  const geos = [];
  for (const mesh of set) {
    const pose = frame.getPose(mesh.meshSpace, refSpace);
    if (!pose) continue;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mesh.vertices), 3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.indices), 1));
    g.applyMatrix4(new THREE.Matrix4().fromArray(pose.transform.matrix));
    geos.push(g.toNonIndexed());
    g.dispose();
  }
  return geos.length ? mergeGeometries(geos) : null;
}

/**
 * Planes come as a 2-D polygon in the plane's own space (X/Z, Y = 0). Fan
 * triangulation is safe here because Quest reports convex polygons.
 */
function fromPlanes(frame, refSpace) {
  const set = frame.detectedPlanes;
  if (!set || set.size === 0) return null;
  const geos = [];
  for (const plane of set) {
    const pose = frame.getPose(plane.planeSpace, refSpace);
    if (!pose || !plane.polygon || plane.polygon.length < 3) continue;
    const poly = plane.polygon;
    const verts = [];
    for (let i = 1; i < poly.length - 1; i++) {
      for (const p of [poly[0], poly[i], poly[i + 1]]) verts.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    // a wall as one huge triangle fan makes two enormous shards — cut it down
    subdivide(g, 0.45);
    g.applyMatrix4(new THREE.Matrix4().fromArray(pose.transform.matrix));
    geos.push(g);
  }
  return geos.length ? mergeGeometries(geos) : null;
}

/** A believable room for headsets without Space Setup, and for the desktop. */
function syntheticRoom() {
  const g = new THREE.BoxGeometry(FALLBACK.w, FALLBACK.h, FALLBACK.d, 9, 6, 8);
  g.translate(0, FALLBACK.floor + FALLBACK.h / 2, 0);
  return g.toNonIndexed();
}

/** Split any triangle whose longest edge exceeds `maxEdge`, repeatedly. */
function subdivide(geo, maxEdge) {
  let pos = geo.getAttribute('position').array;
  for (let pass = 0; pass < 5; pass++) {
    const out = [];
    let split = false;
    for (let i = 0; i < pos.length; i += 9) {
      const a = [pos[i], pos[i + 1], pos[i + 2]];
      const b = [pos[i + 3], pos[i + 4], pos[i + 5]];
      const c = [pos[i + 6], pos[i + 7], pos[i + 8]];
      const e = [dist(a, b), dist(b, c), dist(c, a)];
      const longest = Math.max(e[0], e[1], e[2]);
      if (longest <= maxEdge) { out.push(...a, ...b, ...c); continue; }
      split = true;
      // bisect the longest edge
      let p, q, r;
      if (e[0] === longest) { p = a; q = b; r = c; }
      else if (e[1] === longest) { p = b; q = c; r = a; }
      else { p = c; q = a; r = b; }
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
      out.push(...p, ...m, ...r, ...m, ...q, ...r);
    }
    pos = new Float32Array(out);
    if (!split) break;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return geo;
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function mergeGeometries(geos) {
  let n = 0;
  for (const g of geos) n += g.getAttribute('position').count;
  const pos = new Float32Array(n * 3);
  let o = 0;
  for (const g of geos) {
    pos.set(g.getAttribute('position').array, o);
    o += g.getAttribute('position').count * 3;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return out;
}

// ---------------------------------------------------------------------------
// per-triangle attributes for the shatter
// ---------------------------------------------------------------------------

/**
 * Group the triangles into irregular slabs, and give every vertex the data its
 * slab needs to fly apart as one rigid piece.
 *
 * Moving each triangle independently was the obvious first approach and it
 * looks completely wrong — a wall dissolving into uniform little triangles
 * reads as a mesh falling apart, not as stone breaking. Real fracture produces
 * a few big irregular plates and a scatter of small ones. So we cluster the
 * triangles around scattered seed points and treat each cluster as one shard:
 * shared centroid, shared tumble, shared delay.
 *
 * Cracks then run only along the boundaries *between* clusters, never across
 * the interior triangulation — which is the difference between a cracked wall
 * and a wireframe.
 */
function annotate(geo, center) {
  const pos = geo.getAttribute('position').array;
  const tris = pos.length / 9;

  // deterministic, so a given room always breaks the same way
  let hs = 1337;
  const rnd = () => {
    hs = (hs * 1664525 + 1013904223) >>> 0;
    return hs / 4294967296;
  };

  // --- triangle centroids -------------------------------------------------
  const tc = new Float32Array(tris * 3);
  let maxR = 0.001;
  for (let t = 0; t < tris; t++) {
    const i = t * 9;
    const x = (pos[i] + pos[i + 3] + pos[i + 6]) / 3;
    const y = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3;
    const z = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3;
    tc[t * 3] = x; tc[t * 3 + 1] = y; tc[t * 3 + 2] = z;
    maxR = Math.max(maxR, Math.hypot(x - center.x, z - center.z));
  }

  // --- scatter shard seeds and assign every triangle to the nearest -------
  const K = Math.max(24, Math.min(240, Math.round(tris / 7)));
  const sx = new Float32Array(K), sy = new Float32Array(K), sz = new Float32Array(K);
  for (let k = 0; k < K; k++) {
    const t = Math.min(tris - 1, Math.floor(rnd() * tris));
    sx[k] = tc[t * 3]; sy[k] = tc[t * 3 + 1]; sz[k] = tc[t * 3 + 2];
  }
  // anisotropic distance: shards come out wider than they are tall, the way
  // plaster and drywall actually break
  const cluster = new Int32Array(tris);
  for (let t = 0; t < tris; t++) {
    const x = tc[t * 3], y = tc[t * 3 + 1], z = tc[t * 3 + 2];
    let best = 0, bd = Infinity;
    for (let k = 0; k < K; k++) {
      const dx = x - sx[k], dy = (y - sy[k]) * 1.55, dz = z - sz[k];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bd) { bd = d; best = k; }
    }
    cluster[t] = best;
  }

  // --- per-shard centroid, seed, delay ------------------------------------
  const cCount = new Float32Array(K);
  const cCent = new Float32Array(K * 3);
  for (let t = 0; t < tris; t++) {
    const k = cluster[t];
    cCent[k * 3] += tc[t * 3];
    cCent[k * 3 + 1] += tc[t * 3 + 1];
    cCent[k * 3 + 2] += tc[t * 3 + 2];
    cCount[k]++;
  }
  const cSeed = new Float32Array(K), cDelay = new Float32Array(K);
  for (let k = 0; k < K; k++) {
    const n = Math.max(1, cCount[k]);
    cCent[k * 3] /= n; cCent[k * 3 + 1] /= n; cCent[k * 3 + 2] /= n;
    const s = rnd();
    cSeed[k] = s;
    // the room is lifted off rather than blown up: the floor and the low walls
    // release first, the ceiling last
    const height = THREE.MathUtils.clamp((cCent[k * 3 + 1] - center.y + 1.6) / 3.4, 0, 1);
    const radial = THREE.MathUtils.clamp(
      Math.hypot(cCent[k * 3] - center.x, cCent[k * 3 + 2] - center.z) / maxR, 0, 1);
    cDelay[k] = THREE.MathUtils.clamp(
      0.40 * height + 0.30 * (1 - radial) + 0.22 * s, 0, 0.84);
  }

  // --- which triangle edges are shard boundaries --------------------------
  // Weld by quantised position so triangles that share an edge in space are
  // recognised as neighbours even though they hold separate vertex copies.
  const key = (i) => `${Math.round(pos[i] * 2048)},${Math.round(pos[i + 1] * 2048)},${Math.round(pos[i + 2] * 2048)}`;
  const vid = new Array(tris * 3);
  const ids = new Map();
  for (let v = 0; v < tris * 3; v++) {
    const k = key(v * 3);
    let id = ids.get(k);
    if (id === undefined) { id = ids.size; ids.set(k, id); }
    vid[v] = id;
  }
  // edge -> the clusters touching it
  const edgeOwner = new Map();
  const ekey = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  for (let t = 0; t < tris; t++) {
    const a = vid[t * 3], b = vid[t * 3 + 1], c = vid[t * 3 + 2];
    for (const [p, q] of [[b, c], [c, a], [a, b]]) {
      const k = ekey(p, q);
      const prev = edgeOwner.get(k);
      if (prev === undefined) edgeOwner.set(k, cluster[t]);
      else if (prev !== cluster[t]) edgeOwner.set(k, -1);   // boundary
    }
  }

  // --- write attributes ---------------------------------------------------
  const centroid = new Float32Array(tris * 9);
  const seed = new Float32Array(tris * 3);
  const delay = new Float32Array(tris * 3);
  const bary = new Float32Array(tris * 9);
  const edge = new Float32Array(tris * 9);

  for (let t = 0; t < tris; t++) {
    const k = cluster[t];
    const a = vid[t * 3], b = vid[t * 3 + 1], c = vid[t * 3 + 2];
    // barycentric component i is zero along the edge opposite vertex i
    const em = [
      edgeOwner.get(ekey(b, c)) === -1 ? 1 : 0,
      edgeOwner.get(ekey(c, a)) === -1 ? 1 : 0,
      edgeOwner.get(ekey(a, b)) === -1 ? 1 : 0,
    ];
    for (let v = 0; v < 3; v++) {
      const o9 = t * 9 + v * 3;
      centroid[o9] = cCent[k * 3];
      centroid[o9 + 1] = cCent[k * 3 + 1];
      centroid[o9 + 2] = cCent[k * 3 + 2];
      seed[t * 3 + v] = cSeed[k];
      delay[t * 3 + v] = cDelay[k];
      bary[o9] = v === 0 ? 1 : 0;
      bary[o9 + 1] = v === 1 ? 1 : 0;
      bary[o9 + 2] = v === 2 ? 1 : 0;
      edge[o9] = em[0]; edge[o9 + 1] = em[1]; edge[o9 + 2] = em[2];
    }
  }

  geo.setAttribute('aCentroid', new THREE.BufferAttribute(centroid, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
  geo.setAttribute('aBary', new THREE.BufferAttribute(bary, 3));
  geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 3));
  geo.computeVertexNormals();
  return K;
}

// ---------------------------------------------------------------------------

const VERT = /* glsl */`
  attribute vec3 aCentroid;
  attribute float aSeed;
  attribute float aDelay;
  attribute vec3 aBary;
  attribute vec3 aEdge;    // which of the 3 edges is a shard boundary

  uniform float uBreak;    // 0..1 shatter progress
  uniform vec3  uCenter;

  varying vec3  vBary;
  varying vec3  vEdge;
  varying float vSeed;
  varying float vPiece;    // this shard's own progress
  varying vec3  vNormalW;

  void main() {
    float p = clamp((uBreak - aDelay) / max(1.0 - aDelay, 1e-4), 0.0, 1.0);
    float e = p * p * (3.0 - 2.0 * p);        // smoothstep ease

    vec3 rel = position - aCentroid;

    // tumble about the centroid, axis varying per piece
    float ang = e * (aSeed - 0.5) * 5.0;
    float c = cos(ang), s = sin(ang);
    rel = vec3(rel.x * c - rel.z * s, rel.y, rel.x * s + rel.z * c);
    float ang2 = e * (fract(aSeed * 7.3) - 0.5) * 4.0;
    float c2 = cos(ang2), s2 = sin(ang2);
    rel = vec3(rel.x, rel.y * c2 - rel.z * s2, rel.y * s2 + rel.z * c2);

    // drift outward from the room's centre and upward, like ash
    vec3 out3 = aCentroid - uCenter;
    out3.y *= 0.25;
    vec3 dir = normalize(out3 + vec3(0.0, 0.35, 0.0) + 1e-5);
    float rise = e * (1.4 + aSeed * 3.4);
    vec3 drift = dir * e * (0.9 + aSeed * 2.2) + vec3(0.0, rise, 0.0);

    vec3 world = aCentroid + rel + drift;

    vBary = aBary;
    vEdge = aEdge;
    vSeed = aSeed;
    vPiece = p;
    vNormalW = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  }
`;

const FRAG = /* glsl */`
  precision highp float;

  uniform float uReveal;    // 0..1 monochrome materialising over passthrough
  uniform float uBreak;
  uniform vec3  uCrack;

  varying vec3  vBary;
  varying vec3  vEdge;
  varying float vSeed;
  varying float vPiece;
  varying vec3  vNormalW;

  void main() {
    // Distance to the nearest edge that is an actual shard boundary. Interior
    // triangulation is ignored, so the geometry's own tessellation never
    // shows — only the fracture lines do.
    vec3 masked = vBary + (1.0 - vEdge) * 10.0;
    float edge = min(min(masked.x, masked.y), masked.z);

    // A hairline before anything moves — the crack appears first, then opens.
    float seamW = 0.006 + 0.085 * vPiece;
    float seam = 1.0 - smoothstep(0.0, seamW, edge);

    // flat monochrome: enough normal response to read as surfaces, no colour
    float lambert = 0.62 + 0.38 * abs(normalize(vNormalW).y);
    float grey = (0.40 + 0.13 * vSeed) * lambert;

    // the glow is faint until the piece actually starts to move
    float glow = seam * (0.25 + 2.0 * vPiece);
    vec3 col = vec3(grey) + uCrack * glow;

    // pieces thin out as they drift away
    float alpha = uReveal * (1.0 - smoothstep(0.30, 1.0, vPiece));
    alpha = max(alpha, uReveal * seam * (1.0 - vPiece * 0.85));

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ---------------------------------------------------------------------------

export function createRoom(scene) {
  const uniforms = {
    uReveal: { value: 0 },
    uBreak: { value: 0 },
    uCenter: { value: new THREE.Vector3(0, 1.2, 0) },
    uCrack: { value: new THREE.Color(0xfff2d8) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  let mesh = null;
  let source = null;
  let shards = 0;

  function install(geo, label) {
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
    const box = new THREE.Box3().setFromBufferAttribute(geo.getAttribute('position'));
    const center = box.getCenter(new THREE.Vector3());
    uniforms.uCenter.value.copy(center);
    shards = annotate(geo, center);
    mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    scene.add(mesh);
    source = label;
    const tris = geo.getAttribute('position').count / 3;
    console.info(`[room] ${label}: ${tris} triangles -> ${shards} shards`);
  }

  return {
    get source() { return source; },
    get shards() { return shards; },
    get ready() { return mesh !== null; },
    material,

    /**
     * Called every XR frame until the room is captured. We deliberately stop
     * looking once we have it — the geometry must be frozen before the break
     * begins, or shards would pop in mid-flight as Quest refines its mesh.
     */
    tryAcquire(frame, refSpace) {
      if (mesh || !frame) return;
      let geo = null;
      try { geo = fromMeshes(frame, refSpace); } catch (e) { /* not supported */ }
      if (geo && geo.getAttribute('position').count > 60) { install(geo, 'scene mesh'); return; }
      try { geo = fromPlanes(frame, refSpace); } catch (e) { /* not supported */ }
      if (geo && geo.getAttribute('position').count > 24) { install(geo, 'detected planes'); }
    },

    /** No scene data available — use the stand-in so the beat still lands. */
    useFallback() {
      if (mesh) return;
      install(syntheticRoom(), 'synthetic room');
    },

    setReveal(v) { uniforms.uReveal.value = v; },
    setBreak(v) { uniforms.uBreak.value = v; },
    get visible() { return mesh ? mesh.visible : false; },
    set visible(v) { if (mesh) mesh.visible = v; },
  };
}
