import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as Se,ae as C,an as ne,M as K,C as Ne,Y as Te,E as de,a as O,ak as V,W as ve,G as Fe,al as pe,ah as he,V as H,am as be,y as Be,aC as We,S as Le,aD as je,aE as Ye,X as He,aG as $e}from"./three-B0MzMegT.js";function De(r){let t=r>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Qe(r){const t=new Se(500,24,16),a=new C({side:ne,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      precision highp float;
      uniform float uOpacity;
      varying vec3 vDir;
      void main() {
        float h = vDir.y * 0.5 + 0.5;
        vec3 col = mix(vec3(0.004, 0.006, 0.013), vec3(0.011, 0.013, 0.026), h);
        gl_FragColor = vec4(col, uOpacity);
      }
    `}),o=new K(t,a);return o.frustumCulled=!1,o.renderOrder=-10,r.add(o),{mesh:o,set opacity(s){a.uniforms.uOpacity.value=s},get opacity(){return a.uniforms.uOpacity.value}}}const Je=`
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
`,Ke=`
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
`;function Xe(r,{count:t=5200}={}){const a=De(20260805),o=new Float32Array(t*3),s=new Float32Array(t),w=new Float32Array(t),c=new Float32Array(t),v=new Float32Array(t*3),i=new Ne;for(let n=0;n<t;n++){let S=a()*2-1;const l=a()*Math.PI*2;a()<.42&&(S*=.3);const F=Math.sqrt(Math.max(0,1-S*S)),_=90+a()*320;o[n*3]=Math.cos(l)*F*_,o[n*3+1]=S*_,o[n*3+2]=Math.sin(l)*F*_;const R=Math.pow(a(),2.4);w[n]=.85+R*4.2,s[n]=Te.clamp(.86-R*.9+(a()-.5)*.22,0,.9),c[n]=a()*100;const G=a();G>.86?i.setHSL(.07+a()*.04,.55,.72):G>.66?i.setHSL(.12+a()*.03,.22,.85):i.setHSL(.58+a()*.06,.28+a()*.3,.88),v[n*3]=i.r,v[n*3+1]=i.g,v[n*3+2]=i.b}const u=new de;u.setAttribute("position",new O(o,3)),u.setAttribute("aDelay",new O(s,1)),u.setAttribute("aSize",new O(w,1)),u.setAttribute("aSeed",new O(c,1)),u.setAttribute("aTint",new O(v,3));const h={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},g=new C({vertexShader:Je,fragmentShader:Ke,uniforms:h,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}),y=new ve(u,g);y.frustumCulled=!1,y.renderOrder=5;const b=new Fe;return b.add(y),r.add(b),{group:b,uniforms:h,set emerge(n){h.uEmerge.value=n},get emerge(){return h.uEmerge.value},set global(n){h.uGlobal.value=n},update(n,S){h.uTime.value=n,h.uPixel.value=S,b.rotation.y=n*.0042,b.rotation.x=Math.sin(n*.017)*.014}}}const Ze=`
  precision highp float;

  uniform float uTime;
  uniform float uEmerge;
  uniform float uPalette;  // 0 = segment-1 indigo/teal, 1 = prana blue-green + red
  uniform float uFull;     // 0 = banded like a galaxy, 1 = flowing everywhere
  uniform float uRadial;   // integrated breath-flow: the whole field streams
                           // toward the viewer on the inhale, away on the exhale
  uniform float uScale;    // structure size — smaller number = vaster clouds
  uniform float uGain;     // layer brightness

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
    vec3 col = mix(teal, indigo, smoothstep(0.2, 0.8, n));
    col = mix(col, rose, smoothstep(mix(0.75, 0.66, uPalette), 0.95, n * band) * mix(0.7, 1.0, uPalette));

    float a = (body * 0.85 + veil * 0.26) * uEmerge * (1.0 + 0.12 * uFull) * uGain;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a * 3.4, a);
  }
`;function Pe(r,{radius:t=430,scale:a=2.1,gain:o=1,order:s=4}={}){const w=new Se(t,48,32),c={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:o}},v=new C({side:ne,transparent:!0,depthWrite:!1,depthTest:!1,blending:V,uniforms:c,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ze}),i=new K(w,v);return i.frustumCulled=!1,i.renderOrder=s,r.add(i),{mesh:i,set emerge(u){c.uEmerge.value=u},get emerge(){return c.uEmerge.value},set palette(u){c.uPalette.value=u},set full(u){c.uFull.value=u},set radial(u){c.uRadial.value=u},update(u){c.uTime.value=u}}}const et=`
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
`;function tt(r){const t=new pe(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},o=new C({side:ne,transparent:!0,depthWrite:!1,depthTest:!1,blending:V,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:et}),s=new K(t,o);return s.frustumCulled=!1,s.renderOrder=5,r.add(s),{mesh:s,set emerge(w){a.uEmerge.value=w},update(w){a.uTime.value=w,s.rotation.y=w*.006}}}const at=`
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
`,ot=`
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
`;function rt(r,{count:t=260,radius:a=3}={}){const o=De(77003),s=new Float32Array(t*3),w=new Float32Array(t),c=new Float32Array(t);for(let g=0;g<t;g++)s[g*3]=(o()-.5)*a*2.2,s[g*3+1]=.25+o()*2.3,s[g*3+2]=(o()-.5)*a*2.2,w[g]=o(),c[g]=.5+o()*1.4;const v=new de;v.setAttribute("position",new O(s,3)),v.setAttribute("aSeed",new O(w,1)),v.setAttribute("aSize",new O(c,1));const i={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},u=new C({vertexShader:at,fragmentShader:ot,uniforms:i,transparent:!0,depthWrite:!1,blending:V}),h=new ve(v,u);return h.frustumCulled=!1,h.renderOrder=3,r.add(h),{points:h,set fade(g){i.uFade.value=g},get fade(){return i.uFade.value},update(g,y){i.uTime.value=g,i.uPixel.value=y}}}const it=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,nt=`
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
`;function lt(r){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new C({vertexShader:it,fragmentShader:nt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}),o=new K(new he(.44,.44),a);o.frustumCulled=!1,o.renderOrder=30,r.add(o);let s=null,w=null,c=0;const v=new H(0,1.35,-1.7),i=new H,u=new H(0,1.35,-1.7);return o.position.copy(u),{mesh:o,uniforms:t,attachAnalyser(h,g){s=h.createAnalyser(),s.fftSize=512,s.smoothingTimeConstant=.55,w=new Uint8Array(s.frequencyBinCount),g.connect(s)},set fade(h){t.uFade.value=h},get fade(){return t.uFade.value},update(h,g,y){t.uTime.value=h,y.getWorldDirection(i),y.getWorldPosition(v),v.addScaledVector(i,1.7);const b=1-Math.exp(-g*5.5);u.lerp(v,b),o.position.set(u.x,u.y+Math.sin(h*.9)*.008,u.z);let n=0;if(s){s.getByteFrequencyData(w);const l=Math.max(8,w.length*.45|0);let M=0;for(let F=2;F<l;F++)M+=w[F];n=Math.min(1,M/(l-2)/132)}const S=n>c?1-Math.exp(-g*22):1-Math.exp(-g*3.2);c+=(n-c)*S,t.uLevel.value=c}}}function st(r){let t=r>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const ct=`
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
`,ut=`
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
`,ft=`
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
`,dt=`
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
`,vt=`
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
`,Ee=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function mt(r){const t=st(90210),a=850,o=new Float32Array(a),s=new Float32Array(a*3),w=new Float32Array(a),c=new Float32Array(a),v=new H(0,.05,-1).normalize(),i=new H;for(let m=0;m<a;m++){o[m]=t();do i.set(t()*2-1,t()*2-1,t()*2-1);while(i.lengthSq()>1||i.lengthSq()<.05);i.normalize(),t()<.25&&i.lerp(v,.6).normalize(),s[m*3]=i.x,s[m*3+1]=i.y,s[m*3+2]=i.z,w[m]=2.2+Math.pow(t(),.7)*5.8,c[m]=1.8+t()*3.4}const u=new de;u.setAttribute("position",new O(new Float32Array(a*3),3)),u.setAttribute("aSeed",new O(o,1)),u.setAttribute("aDir",new O(s,3)),u.setAttribute("aRad",new O(w,1)),u.setAttribute("aSize",new O(c,1));const h={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new H(0,1.3,-.3)}},g=new ve(u,new C({vertexShader:ct,fragmentShader:ut,uniforms:h,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}));g.frustumCulled=!1,g.renderOrder=24,r.add(g);const y=700,b=new Float32Array(y),n=new Float32Array(y*3);for(let m=0;m<y;m++){b[m]=t();do i.set(t()*2-1,t()*2-1,t()*2-1);while(i.lengthSq()>1||i.lengthSq()<.05);i.normalize(),n[m*3]=i.x,n[m*3+1]=i.y,n[m*3+2]=i.z}const S=new de;S.setAttribute("position",new O(new Float32Array(y*3),3)),S.setAttribute("aSeed",new O(b,1)),S.setAttribute("aDir",new O(n,3));const l={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new H(0,1.3,-.3)},uFwd:{value:new H(0,0,-1)}},M=new ve(S,new C({vertexShader:ft,fragmentShader:dt,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}));M.frustumCulled=!1,M.renderOrder=25,r.add(M);const F={uTime:{value:0},uCore:{value:0},uIn:{value:0}},_=new K(new he(16,16),new C({vertexShader:Ee,fragmentShader:vt,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}));_.position.set(0,2.5,-14),_.frustumCulled=!1,_.renderOrder=6,r.add(_);const R={uTime:{value:0},uCore:{value:0}},G=new K(new he(5,90),new C({vertexShader:Ee,fragmentShader:`
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
      `,uniforms:R,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}));G.position.set(0,2.5,-14.2),G.frustumCulled=!1,G.renderOrder=5,r.add(G);const N=new H,B=new H;let I=0,$=0;return{get breathing(){return Math.max(I,$)},set core(m){F.uCore.value=m,R.uCore.value=m},set field(m){h.uField.value=m},gateIn:0,gateOut:0,update(m,W,z,D){const X=1-Math.exp(-W*(this.gateIn>I?3.2:1.8));I+=(this.gateIn-I)*X;const q=1-Math.exp(-W*(this.gateOut>$?9:4));$+=(this.gateOut-$)*q,z.getWorldPosition(N),z.getWorldDirection(B),N.addScaledVector(B,.12),N.y-=.05,h.uTime.value=m,h.uPixel.value=D,h.uIn.value=I,h.uNose.value.copy(N),l.uTime.value=m,l.uPixel.value=D,l.uOut.value=$,l.uNose.value.copy(N),l.uFwd.value.copy(B),F.uTime.value=m,F.uIn.value=I,R.uTime.value=m}}}const pt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Re=`
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
`,ht=`
  uniform float uTime;
  uniform float uForm;    // 0..1 assembly of the whole face
  uniform float uOpen;    // 0..1 the third eye opening
  uniform float uSuck;    // 0..1 the black hole taking everything
  varying vec2 vUv;

  
  float win(float a, float b) { return smoothstep(a, b, uForm); }

  // vertical almond (vesica) distance for the third eye
  float vesica(vec2 p, vec2 c, float w, float h) {
    vec2 q = p - c;
    q.x /= w; q.y /= h;
    return length(q) - 1.0;
  }
`,gt=`
  precision highp float;
  
  __COMMON__
  __NOISE__

  void main() {
    vec2 p = vUv;
    float t = uTime * 0.02;

    // ---- the head: a darker, denser presence in the sky ----
    vec2 e = p; e.y *= 0.72;
    float head = 1.0 - smoothstep(0.30, 0.88, length(e));
    // flowing striations, like the reference's painted currents
    float tex = fbm(p * 2.2 + vec2(fbm(p * 1.3 + t), fbm(p * 1.1 - t)) * 0.8);
    float mass = head * (0.55 + 0.45 * tex) * win(0.15, 0.7);

    // ---- the pupil: a hole in the world ----
    float pr = 0.012 + uOpen * 0.075 + uSuck * uSuck * 2.4;
    float pupil = 1.0 - smoothstep(pr * 0.72, pr, distance(p, vec2(0.0, 0.38)));
    pupil *= step(0.015, uOpen + uSuck);

    float a = max(mass * 0.85, pupil * 0.98);
    if (a < 0.004) discard;
    // deep indigo mass; the pupil overrides to true black
    vec3 col = mix(vec3(0.030, 0.045, 0.105), vec3(0.0), pupil);
    gl_FragColor = vec4(col, a);
  }
`,wt=`
  precision highp float;
  
  __COMMON__
  __NOISE__

  void main() {
    vec2 p = vUv;
    float t = uTime;
    vec3 col = vec3(0.0);

    // ================= tripundra — three stripes of streaming star-dust ====
    {
      float form = win(0.0, 0.42);
      float x = p.x, strip = 0.0;
      for (int i = 0; i < 3; i++) {
        float y0 = 0.30 + float(i) * 0.14;
        // the stripes arc very slightly, like ash laid on by a thumb
        float dy = p.y - (y0 + x * x * 0.10);
        float band = exp(-dy * dy * 260.0);
        // they assemble from the OUTSIDE IN: dust streams toward the centre
        float reach = mix(1.2, 0.0, form);
        band *= smoothstep(reach, reach + 0.25, 1.0 - abs(x) / 0.46);
        strip += band;
      }
      strip *= smoothstep(0.54, 0.44, abs(x));           // stripe extent
      strip *= 0.35 + 0.85 * fbm(vec2(p.x * 7.0 - t * 0.05, p.y * 22.0));
      strip *= 1.0 - exp(-pow(abs(x) - 0.055, 2.0) * 240.0) * step(abs(p.y - 0.44), 0.22)
             * step(0.055, abs(x) + 0.0);                // part around the eye
      col += vec3(0.62, 0.72, 1.0) * strip * 1.05 * form;
    }

    // ================= closed eyes — embers behind lids ====================
    {
      float form = win(0.22, 0.60);
      for (int s = -1; s <= 1; s += 2) {
        vec2 c = vec2(0.30 * float(s), -0.10);
        vec2 q = p - c;
        float breathe = 0.72 + 0.28 * sin(t * 0.6 + float(s) * 0.7);

        // the closed lid: an almond of ember light. Upper arc curves down,
        // lower arc curves up; the light lives between them.
        float upper = q.y - (0.030 - q.x * q.x * 1.6);
        float lower = q.y + (0.035 - q.x * q.x * 1.3);
        float between = smoothstep(0.012, -0.02, upper) * smoothstep(-0.012, 0.02, lower);
        float wnd = smoothstep(0.155, 0.11, abs(q.x));
        float lidTex = 0.6 + 0.4 * fbm(q * 22.0 + t * 0.04);
        col += vec3(1.0, 0.58, 0.22) * between * wnd * lidTex * 1.5 * form * breathe;

        // the lash line itself, bright
        float lash = exp(-upper * upper * 2200.0) * wnd;
        col += vec3(1.0, 0.80, 0.45) * lash * 0.9 * form * breathe;

        // a soft ember under-halo, and the brow arch above
        col += vec3(0.85, 0.40, 0.16) * exp(-length(q * vec2(1.2, 2.0)) * 5.0)
             * 0.22 * form * breathe;
        float brow = q.y - (0.13 - q.x * q.x * 1.1);
        col += vec3(0.35, 0.45, 0.75) * exp(-brow * brow * 900.0)
             * smoothstep(0.20, 0.13, abs(q.x)) * 0.5 * form;
      }
    }

    // ================= the nose bridge — a fall of faint light =============
    {
      float form = win(0.50, 0.82);
      float wdt = 130.0 + 320.0 * smoothstep(0.30, -0.5, p.y);   // narrows downward
      float band = exp(-p.x * p.x * wdt)
                 * smoothstep(0.36, 0.22, p.y) * smoothstep(-0.62, -0.10, p.y);
      col += vec3(0.55, 0.68, 0.95) * band * 0.55 * form
           * (0.6 + 0.4 * fbm(vec2(p.y * 10.0 - t * 0.04, p.x * 24.0)));
    }

    // ================= the third eye ========================================
    {
      float form = win(0.62, 1.0);
      vec2 c = vec2(0.0, 0.38);
      float d = vesica(p, c, 0.062, 0.155);

      // the closed outline: a burning almond rim with an inner blue corona
      float rim = exp(-d * d * 300.0) * form * (1.0 - uSuck);
      col += vec3(0.75, 0.85, 1.0) * rim * 1.15;
      float corona = exp(-d * d * 60.0) * form * (1.0 - uSuck);
      col += vec3(0.30, 0.45, 0.90) * corona * 0.45;

      // flame-wisps rising off the almond, like the reference's crown
      vec2 fq = vec2(p.x * 26.0, (p.y - 0.50) * 9.0 - t * 0.25);
      float wisp = fbm(fq) * exp(-p.x * p.x * 170.0)
                 * smoothstep(0.46, 0.60, p.y) * smoothstep(0.82, 0.60, p.y);
      col += vec3(0.55, 0.70, 1.0) * wisp * 0.95 * form * (1.0 - uSuck);

      // ---- opening: the interior wakes ----
      float inside = 1.0 - smoothstep(-0.25, 0.05, d);
      // the iris: an amber ring around the darkness, present once opening
      float pr = 0.012 + uOpen * 0.075 + uSuck * uSuck * 2.4;
      float ring = exp(-pow(distance(p, c) - pr, 2.0) * 2600.0);
      col += vec3(1.0, 0.72, 0.30) * ring * (uOpen * 0.9 + uSuck) * 1.4;

      // accretion: light shearing around the hole as it feeds
      float ang = atan(p.y - c.y, p.x - c.x);
      float swirl = 0.5 + 0.5 * sin(ang * 3.0 - t * 1.4 + distance(p, c) * 40.0);
      float acc = exp(-pow(distance(p, c) - pr * 1.5, 2.0) * 700.0) * swirl;
      col += vec3(0.95, 0.55, 0.25) * acc * (uOpen * 0.5 + uSuck * 1.2);

      // interior pale light while half-open (before the dark swallows it)
      col += vec3(0.85, 0.90, 1.0) * inside * uOpen * (1.0 - uOpen) * 0.9;
    }

    float lum = dot(col, vec3(0.4));
    if (lum < 0.004) discard;
    gl_FragColor = vec4(col, min(lum * 1.4, 1.0));
  }
`,xt=`
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
`,Ge=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSpin;
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
`,yt=`
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
`,bt=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  
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
`,St=`
  precision highp float;
  uniform float uTime;
  uniform float uRush;    // travel intensity 0..1
  varying vec2 vUv;       // x around, y along
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    // long streaks tearing past, plus rings pulsing through
    float speed = uTime * (2.0 + uRush * 9.0);
    float streaks = pow(noise(vec2(vUv.x * 26.0, vUv.y * 2.0 + speed)), 2.4);
    float rings = 0.5 + 0.5 * sin((vUv.y + speed * 0.23) * 40.0);
    rings = pow(rings, 6.0) * 0.4;
    vec3 col = mix(vec3(0.25, 0.45, 0.95), vec3(0.75, 0.55, 1.0), vUv.y);
    float a = (streaks * 1.1 + rings) * uRush;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 1.8, a);
  }
`,Tt=`
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
`;function ce(r,t,a,o,{blending:s=V,order:w=8}={}){const c=new C({vertexShader:pt,fragmentShader:a,uniforms:o,transparent:!0,depthWrite:!1,depthTest:!1,blending:s,side:Be}),v=new K(new he(r,t),c);return v.frustumCulled=!1,v.renderOrder=w,v}function Ft(r){const t=new Fe;r.add(t);const a={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0}},o=ht,s=gt.replace("__COMMON__",o).replace("__NOISE__",Re),w=wt.replace("__COMMON__",o).replace("__NOISE__",Re),c=260,v=220,i=-190,u=55,h=ce(c,v,s,a,{blending:be,order:7});h.position.set(0,u,i),t.add(h);const g=ce(c,v,w,a,{order:8});g.position.set(0,u,i),t.add(g);const y=new H(0,u+.38*(v/2),i),b=ce(34,34,xt,{uTime:a.uTime,uForm:{value:0}},{order:8});b.position.set(95,130,-180),t.add(b);const n=ce(70,70,Ge,{uTime:a.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});n.position.set(-150,45,-175),t.add(n);const S=ce(44,44,Ge,{uTime:a.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});S.position.set(150,20,-165),t.add(S);const l={uForm:{value:0}},M=new K(new pe(90,90,34,96,1,!0),new C({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:yt,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:be,side:ne}));M.position.y=-14,M.renderOrder=9,M.frustumCulled=!1,t.add(M);const F={uTime:a.uTime,uForm:{value:0}},_=new K(new pe(110,110,60,96,1,!0),new C({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:bt,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:V,side:ne}));_.position.y=-12,_.renderOrder=6,_.frustumCulled=!1,t.add(_);const R=420,G=new Float32Array(R*3),N=new Float32Array(R);for(let d=0;d<R;d++){const Q=Math.random()*Math.PI*2,le=40+Math.random()*55;G[d*3]=Math.cos(Q)*le,G[d*3+1]=-20+Math.random()*30,G[d*3+2]=Math.sin(Q)*le,N[d]=Math.random()}const B=new de;B.setAttribute("position",new O(G,3)),B.setAttribute("aSeed",new O(N,1));const I={uTime:a.uTime,uForm:{value:0},uPixel:{value:1}},$=new ve(B,new C({vertexShader:`
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
    `,fragmentShader:`
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
    `,uniforms:I,transparent:!0,depthWrite:!1,depthTest:!1,blending:V}));$.frustumCulled=!1,$.renderOrder=9,t.add($);const m={uTime:{value:0},uGrow:{value:0}},W=ce(7,7,Tt,m,{order:26});W.position.set(0,1.5,-9),r.add(W);const z={uTime:{value:0},uRush:{value:0}},D=new K(new pe(3.2,3.2,130,40,1,!0),new C({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:St,uniforms:z,transparent:!0,depthWrite:!1,depthTest:!1,blending:V,side:ne}));D.rotation.x=Math.PI/2,D.position.set(0,1.5,-20),D.renderOrder=27,D.frustumCulled=!1,r.add(D);const X={uBlack:{value:0}},q=new K(new Se(.6,16,12),new C({vertexShader:`
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,fragmentShader:`
        precision highp float;
        uniform float uBlack;
        void main() {
          if (uBlack < 0.003) discard;
          gl_FragColor = vec4(0.0, 0.0, 0.0, uBlack);
        }
      `,uniforms:X,transparent:!0,depthWrite:!1,depthTest:!1,blending:be,side:ne}));return q.renderOrder=50,q.frustumCulled=!1,r.add(q),t.visible=!1,{group:t,eyeWorld:y,set portal(d){m.uGrow.value=d,W.visible=d>.002},set rush(d){z.uRush.value=d,D.visible=d>.002},set form(d){a.uForm.value=d,t.visible=d>.001||a.uSuck.value>.001,b.material.uniforms.uForm.value=Math.min(1,d*2.2),n.material.uniforms.uForm.value=Math.min(1,Math.max(0,d*1.8-.15)),S.material.uniforms.uForm.value=Math.min(1,Math.max(0,d*1.8-.25)),l.uForm.value=Math.min(1,d*2.6),F.uForm.value=Math.min(1,Math.max(0,d*2.2-.2)),I.uForm.value=Math.min(1,Math.max(0,d*2-.3))},set open(d){a.uOpen.value=d},set suck(d){a.uSuck.value=d;const Q=1+d*d*7;t.scale.setScalar(Q),t.position.copy(y).multiplyScalar(1-Q)},set black(d){X.uBlack.value=d},update(d,Q,le){a.uTime.value=d,m.uTime.value=d,z.uTime.value=d,I.uPixel.value=Q,q.visible!==X.uBlack.value>.003&&(q.visible=X.uBlack.value>.003),le.getWorldPosition(q.position),D.position.x=q.position.x,D.position.y=q.position.y}}}const Y={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},A=116,T={start:A,url:"assets/audio/journey_02.mp3",starsOut:[A+5,A+17],palette:[A+6,A+21],full:[A+6,A+23],curtains:[A+10,A+26],core:[A+18.5,A+24.5],field:[A+20,A+28],breathIn:[A+28.9,A+33.3],breathOut:[A+33.6,A+38.5],loopFrom:A+66,loopPeriod:11.5,loopAmp:.62},E=A+62.5,k={portal:[E,E+2.2],approach:[E+2.2,E+4.2],tunnel:[E+4,E+9.4],arrive:E+9.4,form:[E+10,E+18],open:[E+21,E+27.5],suck:[E+27.5,E+33],black:[E+31.5,E+33.5]},_t="assets/audio/journey_01.mp3",ue=4,At=[82.5,88.5],ze=(r,t,a)=>r+(t-r)*a,f=(r,[t,a])=>Te.clamp((r-t)/(a-t),0,1),p=r=>r*r*(3-2*r);function fe(r,t){const a=document.getElementById("status");a&&(a.textContent=r);const o=document.getElementById("substatus");o&&t!==void 0&&(o.textContent=t)}function Mt(r,t){const a=r.createGain();a.gain.value=0,a.connect(t);const o=r.createBiquadFilter();o.type="lowpass",o.frequency.value=220,o.Q.value=.6,o.connect(a);for(const[s,w]of[[38,.55],[57,.28],[76.4,.18]]){const c=r.createOscillator();c.type="sine",c.frequency.value=s;const v=r.createGain();v.gain.value=w,c.connect(v).connect(o),c.start()}return{set level(s){a.gain.setTargetAtTime(s*.09,r.currentTime,.25)}}}async function kt(){const r=document.getElementById("view"),t=new We({canvas:r,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Le,t.toneMapping=je,t.toneMappingExposure=1.15;const a=new Ye;a.background=null;const o=new He(70,window.innerWidth/window.innerHeight,.05,900);o.position.set(0,1.35,0);const s=new Fe;s.add(o),a.add(s);const w=Qe(a),c=Xe(a),v=Pe(c.group,{radius:460,scale:.85,gain:.7,order:3}),i=Pe(c.group,{radius:300,scale:1.9,gain:1,order:4}),u=tt(c.group),h=rt(a),g=lt(a),y=mt(a),b=Ft(a);window.addEventListener("resize",()=>{o.aspect=window.innerWidth/window.innerHeight,o.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const n=new Audio;n.src=_t,n.preload="auto",n.crossOrigin="anonymous";let S=!1;n.addEventListener("canplaythrough",()=>{S=!0},{once:!0}),n.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),S=!0},{once:!0});let l=null,M=null,F=null,_=null,R=null;function G(){if(!l)try{l=new(window.AudioContext||window.webkitAudioContext);const e=l.createGain();e.gain.value=1,e.connect(l.destination);const x=l.createMediaElementSource(n);F=l.createGain(),F.gain.value=1,x.connect(F).connect(e),g.attachAnalyser(l,F),M=Mt(l,e);const P=l.sampleRate*2,L=l.createBuffer(1,P,l.sampleRate),re=L.getChannelData(0);for(let ie=0;ie<P;ie++)re[ie]=Math.random()*2-1;const Z=l.createBufferSource();Z.buffer=L,Z.loop=!0;const ee=l.createBiquadFilter();ee.type="bandpass",ee.frequency.value=320,ee.Q.value=.7,_=l.createGain(),_.gain.value=0,Z.connect(ee).connect(_).connect(e),Z.start(),R=ie=>{const te=l.currentTime;for(const[j,se,J]of[[0,58,.5],[.19,46,.34]]){const ae=l.createOscillator();ae.type="sine",ae.frequency.setValueAtTime(se*1.6,te+j),ae.frequency.exponentialRampToValueAtTime(se,te+j+.06);const U=l.createGain();U.gain.setValueAtTime(0,te+j),U.gain.linearRampToValueAtTime(J*ie*.4,te+j+.012),U.gain.exponentialRampToValueAtTime(1e-4,te+j+.3),ae.connect(U).connect(e),ae.start(te+j),ae.stop(te+j+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let N=null,B=null,I=!1;async function $(){try{const x=await(await fetch(T.url)).arrayBuffer();l&&(N=await l.decodeAudioData(x))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}}let m=!1,W=0;n.addEventListener("loadedmetadata",()=>{isFinite(n.duration)&&n.duration});let z=null;function D(){if(z!==null)return z;if(!m)return-ue;if(B!==null&&!I&&l){const e=T.start+(l.currentTime-B);return W=performance.now()/1e3-e,e}return!n.ended&&n.currentTime>.01?(W=performance.now()/1e3-n.currentTime,n.currentTime):performance.now()/1e3-W}let X="flat";async function q(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function d(){G(),l&&l.state==="suspended"&&await l.resume(),$();const e=await q();if(e){const x={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const P=await navigator.xr.requestSession(e,x);await t.xr.setSession(P),X=e,P.addEventListener("end",()=>{X="flat"})}catch(P){console.warn("[journey] could not start",e,P)}}document.body.classList.add("started"),m=!0,W=performance.now()/1e3+ue,setTimeout(()=>{n.play().catch(x=>console.warn("[journey] autoplay blocked",x))},ue*1e3)}let Q=null;function le(e){if(Q)return Q;let x=p(f(e,[T.breathIn[0],T.breathIn[0]+1.6]))*(1-p(f(e,[T.breathIn[1],T.breathIn[1]+1]))),P=p(f(e,[T.breathOut[0],T.breathOut[0]+.25]))*(1-p(f(e,[T.breathOut[0]+.55,T.breathOut[0]+1.2])));if(e>T.loopFrom&&e<k.portal[0]){const L=(e-T.loopFrom)%T.loopPeriod,re=T.loopAmp,Z=re*p(f(L,[0,1.8]))*(1-p(f(L,[4.4,5.6]))),ee=re*p(f(L,[6,6.3]))*(1-p(f(L,[6.7,7.4])));x=Math.max(x,Z),P=Math.max(P,ee)}return[x,P]}const _e=new H;let Ae=-ue,ge=0,we=0,Me=-1;t.setAnimationLoop(()=>{const e=D(),x=Te.clamp(e-Ae,.001,.1);Ae=e;const P=t.getContext(),L=Math.max(.5,P.drawingBufferHeight/900),re=t.xr.isPresenting?t.xr.getCamera():o;if(m&&B===null&&N&&l&&e>=T.start&&z===null){const oe=l.createBufferSource();oe.buffer=N,oe.connect(F),oe.onended=()=>{I=!0},oe.start(),B=l.currentTime}const[Z,ee]=le(e),ie=p(f(e,k.portal))*(1-p(f(e,[k.tunnel[0]+1.2,k.tunnel[0]+2.2]))),te=p(f(e,[k.tunnel[0],k.tunnel[0]+1.4]))*(1-p(f(e,[k.tunnel[1]-1,k.tunnel[1]+.4]))),j=p(f(e,k.form)),se=p(f(e,k.open)),J=p(f(e,k.suck)),ae=p(f(e,k.black)),U=p(f(e,[k.tunnel[0],k.tunnel[1]])),Ie=p(f(e,[k.arrive,k.arrive+5]));b.portal=ie,b.rush=te,b.form=j,b.open=se,b.suck=J,b.black=ae,b.update(e,L,re);const qe=ze(0,.55,p(f(e,Y.motesIn)))+ze(0,.45,p(f(e,Y.motesFull)));h.fade=qe*(1-p(f(e,[Y.dim[0],Y.dim[0]+9]))),h.update(e,L),w.opacity=Math.pow(f(e,Y.dim),1.6),c.emerge=f(e,Y.stars),c.global=1-p(f(e,T.starsOut))+Ie*(1-J)*.85,c.update(e,L);const Oe=p(f(e,T.palette)),Ue=p(f(e,T.full)),ye=(1-.45*y.breathing)*(1-U);i.emerge=p(f(e,Y.nebula))*(ye+U*.3*(1-J)),i.palette=Oe*(1-U*.85),i.full=Ue*(1-U*.6),i.update(e),v.emerge=p(f(e,Y.nebula))*(.9*ye+U*.45*(1-J)),v.palette=Oe*(1-U*.85),v.full=Ue*(1-U*.6),v.update(e*.55),u.emerge=p(f(e,T.curtains))*ye,u.update(e);const Ve=.05+Z*.85-ee*1;we+=(Ve-we)*(1-Math.exp(-x*2.2)),ge+=we*x,i.radial=ge,v.radial=ge*.35,y.core=p(f(e,T.core))*(1-U),y.field=p(f(e,T.field))*(1-U),y.gateIn=Z*(1-U),y.gateOut=ee*(1-U),y.update(e,x,re,L);const Ce=p(f(e,[Y.dim[0]+8,Y.dim[1]+8]))*(1-J);if(_e.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(Ce),s.position.copy(_e),s.rotation.z=Math.sin(e*.013)*.03*Ce,g.fade=p(f(e,[-ue+.8,-.2]))*(1-p(f(e,At))),g.update(e,x,re),M)if(e<T.start-4){const oe=p(f(e,Y.drone)),me=1-.45*p(f(e,[90,118]));M.level=oe*me}else e<k.portal[0]?M.level=.1+.1*Z-.04*ee:M.level=.12+j*.1+J*.35-ae*.3;if(_&&l&&z===null){const oe=ie*.12+te*.5+J*.7;_.gain.setTargetAtTime(oe*.16,l.currentTime,.12)}if(R&&z===null&&j>.12&&ae<.85){const oe=1.18-se*.28-J*.22,me=Math.floor(e/oe);me!==Me&&(Me=me,R(.5+j*.3+se*.4+J*.5))}t.render(a,o)});const ke=await q();ke==="immersive-ar"?fe("Put your headset on and begin.","You will start in your own room."):ke==="immersive-vr"?fe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):fe("Preview in browser","Open this page in the Quest browser for the full experience.");const xe=document.getElementById("begin");xe.disabled=!1,xe.addEventListener("click",async()=>{xe.disabled=!0,S||(fe("Loading the voice…"),await new Promise(e=>{if(S)return e();const x=setInterval(()=>{S&&(clearInterval(x),e())},100);setTimeout(()=>{clearInterval(x),e()},6e3)})),await d()}),window.JOURNEY={THREE:$e,scene:a,camera:o,renderer:t,stars:c,nebula:i,voidShell:w,motes:h,narrator:g,prana:y,sec3:b,T:Y,SEG2:T,SEG3:k,seek:e=>{z=e},resume:()=>{z=null},look:(e,x=0)=>{o.rotation.set(x,e,0,"YXZ")},moveTo:(e,x,P)=>{s.position.set(0,0,0),o.position.set(e,x,P)},forceBreath:(e,x)=>{Q=e===null?null:[e,x]},fakeLevel:e=>{g.uniforms.uLevel.value=e},dryStart:()=>{m=!0,W=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:D(),xrMode:X,voidOpacity:w.opacity,starEmerge:c.emerge,nebulaEmerge:i.emerge,orbFade:g.fade})},window.__JOURNEY_READY=!0}kt().catch(r=>{console.error(r),window.__JOURNEY_ERROR=String(r&&r.stack||r),fe("Something went wrong.",String(r))});
