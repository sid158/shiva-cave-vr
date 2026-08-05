import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as ge,ae as U,an as le,M as W,C as Se,Y as se,E as X,a as A,ak as G,W as Z,G as we,al as Te,ah as ie,V as R,aC as Ae,S as Fe,aD as Me,aE as Pe,X as Ce,aG as Ee}from"./three-B0MzMegT.js";function ye(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Oe(o){const t=new ge(500,24,16),a=new U({side:le,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),r=new W(t,a);return r.frustumCulled=!1,r.renderOrder=-10,o.add(r),{mesh:r,set opacity(i){a.uniforms.uOpacity.value=i},get opacity(){return a.uniforms.uOpacity.value}}}const _e=`
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
`,ze=`
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
`;function Re(o,{count:t=5200}={}){const a=ye(20260805),r=new Float32Array(t*3),i=new Float32Array(t),m=new Float32Array(t),l=new Float32Array(t),h=new Float32Array(t*3),n=new Se;for(let u=0;u<t;u++){let c=a()*2-1;const T=a()*Math.PI*2;a()<.42&&(c*=.3);const M=Math.sqrt(Math.max(0,1-c*c)),P=90+a()*320;r[u*3]=Math.cos(T)*M*P,r[u*3+1]=c*P,r[u*3+2]=Math.sin(T)*M*P;const _=Math.pow(a(),2.4);m[u]=.85+_*4.2,i[u]=se.clamp(.86-_*.9+(a()-.5)*.22,0,.9),l[u]=a()*100;const D=a();D>.86?n.setHSL(.07+a()*.04,.55,.72):D>.66?n.setHSL(.12+a()*.03,.22,.85):n.setHSL(.58+a()*.06,.28+a()*.3,.88),h[u*3]=n.r,h[u*3+1]=n.g,h[u*3+2]=n.b}const s=new X;s.setAttribute("position",new A(r,3)),s.setAttribute("aDelay",new A(i,1)),s.setAttribute("aSize",new A(m,1)),s.setAttribute("aSeed",new A(l,1)),s.setAttribute("aTint",new A(h,3));const d={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},v=new U({vertexShader:_e,fragmentShader:ze,uniforms:d,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}),b=new Z(s,v);b.frustumCulled=!1,b.renderOrder=5;const g=new we;return g.add(b),o.add(g),{group:g,uniforms:d,set emerge(u){d.uEmerge.value=u},get emerge(){return d.uEmerge.value},set global(u){d.uGlobal.value=u},update(u,c){d.uTime.value=u,d.uPixel.value=c,g.rotation.y=u*.0042,g.rotation.x=Math.sin(u*.017)*.014}}}const De=`
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
`;function me(o,{radius:t=430,scale:a=2.1,gain:r=1,order:i=4}={}){const m=new ge(t,48,32),l={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:r}},h=new U({side:le,transparent:!0,depthWrite:!1,depthTest:!1,blending:G,uniforms:l,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:De}),n=new W(m,h);return n.frustumCulled=!1,n.renderOrder=i,o.add(n),{mesh:n,set emerge(s){l.uEmerge.value=s},get emerge(){return l.uEmerge.value},set palette(s){l.uPalette.value=s},set full(s){l.uFull.value=s},set radial(s){l.uRadial.value=s},update(s){l.uTime.value=s}}}const Ue=`
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
`;function Ge(o){const t=new Te(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},r=new U({side:le,transparent:!0,depthWrite:!1,depthTest:!1,blending:G,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ue}),i=new W(t,r);return i.frustumCulled=!1,i.renderOrder=5,o.add(i),{mesh:i,set emerge(m){a.uEmerge.value=m},update(m){a.uTime.value=m,i.rotation.y=m*.006}}}const Ie=`
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
`,ke=`
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
`;function Le(o,{count:t=260,radius:a=3}={}){const r=ye(77003),i=new Float32Array(t*3),m=new Float32Array(t),l=new Float32Array(t);for(let v=0;v<t;v++)i[v*3]=(r()-.5)*a*2.2,i[v*3+1]=.25+r()*2.3,i[v*3+2]=(r()-.5)*a*2.2,m[v]=r(),l[v]=.5+r()*1.4;const h=new X;h.setAttribute("position",new A(i,3)),h.setAttribute("aSeed",new A(m,1)),h.setAttribute("aSize",new A(l,1));const n={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},s=new U({vertexShader:Ie,fragmentShader:ke,uniforms:n,transparent:!0,depthWrite:!1,blending:G}),d=new Z(h,s);return d.frustumCulled=!1,d.renderOrder=3,o.add(d),{points:d,set fade(v){n.uFade.value=v},get fade(){return n.uFade.value},update(v,b){n.uTime.value=v,n.uPixel.value=b}}}const Ve=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Be=`
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
`;function We(o){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new U({vertexShader:Ve,fragmentShader:Be,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}),r=new W(new ie(.44,.44),a);r.frustumCulled=!1,r.renderOrder=30,o.add(r);let i=null,m=null,l=0;const h=new R(0,1.35,-1.7),n=new R,s=new R(0,1.35,-1.7);return r.position.copy(s),{mesh:r,uniforms:t,attachAnalyser(d,v){i=d.createAnalyser(),i.fftSize=512,i.smoothingTimeConstant=.55,m=new Uint8Array(i.frequencyBinCount),v.connect(i)},set fade(d){t.uFade.value=d},get fade(){return t.uFade.value},update(d,v,b){t.uTime.value=d,b.getWorldDirection(n),b.getWorldPosition(h),h.addScaledVector(n,1.7);const g=1-Math.exp(-v*5.5);s.lerp(h,g),r.position.set(s.x,s.y+Math.sin(d*.9)*.008,s.z);let u=0;if(i){i.getByteFrequencyData(m);const T=Math.max(8,m.length*.45|0);let F=0;for(let M=2;M<T;M++)F+=m[M];u=Math.min(1,F/(T-2)/132)}const c=u>l?1-Math.exp(-v*22):1-Math.exp(-v*3.2);l+=(u-l)*c,t.uLevel.value=l}}}function Ne(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const je=`
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
`,qe=`
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
`,Ye=`
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
`,He=`
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
`,Je=`
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
`,he=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function Ke(o){const t=Ne(90210),a=850,r=new Float32Array(a),i=new Float32Array(a*3),m=new Float32Array(a),l=new Float32Array(a),h=new R(0,.05,-1).normalize(),n=new R;for(let f=0;f<a;f++){r[f]=t();do n.set(t()*2-1,t()*2-1,t()*2-1);while(n.lengthSq()>1||n.lengthSq()<.05);n.normalize(),t()<.25&&n.lerp(h,.6).normalize(),i[f*3]=n.x,i[f*3+1]=n.y,i[f*3+2]=n.z,m[f]=2.2+Math.pow(t(),.7)*5.8,l[f]=1.8+t()*3.4}const s=new X;s.setAttribute("position",new A(new Float32Array(a*3),3)),s.setAttribute("aSeed",new A(r,1)),s.setAttribute("aDir",new A(i,3)),s.setAttribute("aRad",new A(m,1)),s.setAttribute("aSize",new A(l,1));const d={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new R(0,1.3,-.3)}},v=new Z(s,new U({vertexShader:je,fragmentShader:qe,uniforms:d,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));v.frustumCulled=!1,v.renderOrder=24,o.add(v);const b=700,g=new Float32Array(b),u=new Float32Array(b*3);for(let f=0;f<b;f++){g[f]=t();do n.set(t()*2-1,t()*2-1,t()*2-1);while(n.lengthSq()>1||n.lengthSq()<.05);n.normalize(),u[f*3]=n.x,u[f*3+1]=n.y,u[f*3+2]=n.z}const c=new X;c.setAttribute("position",new A(new Float32Array(b*3),3)),c.setAttribute("aSeed",new A(g,1)),c.setAttribute("aDir",new A(u,3));const T={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new R(0,1.3,-.3)},uFwd:{value:new R(0,0,-1)}},F=new Z(c,new U({vertexShader:Ye,fragmentShader:He,uniforms:T,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));F.frustumCulled=!1,F.renderOrder=25,o.add(F);const M={uTime:{value:0},uCore:{value:0},uIn:{value:0}},P=new W(new ie(16,16),new U({vertexShader:he,fragmentShader:Je,uniforms:M,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));P.position.set(0,2.5,-14),P.frustumCulled=!1,P.renderOrder=6,o.add(P);const _={uTime:{value:0},uCore:{value:0}},D=new W(new ie(5,90),new U({vertexShader:he,fragmentShader:`
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
      `,uniforms:_,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));D.position.set(0,2.5,-14.2),D.frustumCulled=!1,D.renderOrder=5,o.add(D);const L=new R,I=new R;let C=0,z=0;return{get breathing(){return Math.max(C,z)},set core(f){M.uCore.value=f,_.uCore.value=f},set field(f){d.uField.value=f},gateIn:0,gateOut:0,update(f,V,N,H){const j=1-Math.exp(-V*(this.gateIn>C?3.2:1.8));C+=(this.gateIn-C)*j;const $=1-Math.exp(-V*(this.gateOut>z?9:4));z+=(this.gateOut-z)*$,N.getWorldPosition(L),N.getWorldDirection(I),L.addScaledVector(I,.12),L.y-=.05,d.uTime.value=f,d.uPixel.value=H,d.uIn.value=C,d.uNose.value.copy(L),T.uTime.value=f,T.uPixel.value=H,T.uOut.value=z,T.uNose.value.copy(L),T.uFwd.value.copy(I),M.uTime.value=f,M.uIn.value=C,_.uTime.value=f}}}const O={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},S=116,x={start:S,url:"assets/audio/journey_02.mp3",starsOut:[S+5,S+17],palette:[S+6,S+21],full:[S+6,S+23],curtains:[S+10,S+26],core:[S+18.5,S+24.5],field:[S+20,S+28],breathIn:[S+28.9,S+33.3],breathOut:[S+33.6,S+38.5],loopFrom:S+66,loopPeriod:11.5,loopAmp:.62},Qe="assets/audio/journey_01.mp3",q=4,Xe=[82.5,88.5],pe=(o,t,a)=>o+(t-o)*a,p=(o,[t,a])=>se.clamp((o-t)/(a-t),0,1),y=o=>o*o*(3-2*o);function Y(o,t){const a=document.getElementById("status");a&&(a.textContent=o);const r=document.getElementById("substatus");r&&t!==void 0&&(r.textContent=t)}function Ze(o,t){const a=o.createGain();a.gain.value=0,a.connect(t);const r=o.createBiquadFilter();r.type="lowpass",r.frequency.value=220,r.Q.value=.6,r.connect(a);for(const[i,m]of[[38,.55],[57,.28],[76.4,.18]]){const l=o.createOscillator();l.type="sine",l.frequency.value=i;const h=o.createGain();h.gain.value=m,l.connect(h).connect(r),l.start()}return{set level(i){a.gain.setTargetAtTime(i*.09,o.currentTime,.25)}}}async function $e(){const o=document.getElementById("view"),t=new Ae({canvas:o,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Fe,t.toneMapping=Me,t.toneMappingExposure=1.15;const a=new Pe;a.background=null;const r=new Ce(70,window.innerWidth/window.innerHeight,.05,900);r.position.set(0,1.35,0);const i=new we;i.add(r),a.add(i);const m=Oe(a),l=Re(a),h=me(l.group,{radius:460,scale:.85,gain:.7,order:3}),n=me(l.group,{radius:300,scale:1.9,gain:1,order:4}),s=Ge(l.group),d=Le(a),v=We(a),b=Ke(a);window.addEventListener("resize",()=>{r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const g=new Audio;g.src=Qe,g.preload="auto",g.crossOrigin="anonymous";let u=!1;g.addEventListener("canplaythrough",()=>{u=!0},{once:!0}),g.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),u=!0},{once:!0});let c=null,T=null,F=null;function M(){if(!c)try{c=new(window.AudioContext||window.webkitAudioContext);const e=c.createGain();e.gain.value=1,e.connect(c.destination);const w=c.createMediaElementSource(g);F=c.createGain(),F.gain.value=1,w.connect(F).connect(e),v.attachAnalyser(c,F),T=Ze(c,e)}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let P=null,_=null,D=!1;async function L(){try{const w=await(await fetch(x.url)).arrayBuffer();c&&(P=await c.decodeAudioData(w))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}}let I=!1,C=0;g.addEventListener("loadedmetadata",()=>{isFinite(g.duration)&&g.duration});let z=null;function f(){if(z!==null)return z;if(!I)return-q;if(_!==null&&!D&&c){const e=x.start+(c.currentTime-_);return C=performance.now()/1e3-e,e}return!g.ended&&g.currentTime>.01?(C=performance.now()/1e3-g.currentTime,g.currentTime):performance.now()/1e3-C}let V="flat";async function N(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function H(){M(),c&&c.state==="suspended"&&await c.resume(),L();const e=await N();if(e){const w={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const E=await navigator.xr.requestSession(e,w);await t.xr.setSession(E),V=e,E.addEventListener("end",()=>{V="flat"})}catch(E){console.warn("[journey] could not start",e,E)}}document.body.classList.add("started"),I=!0,C=performance.now()/1e3+q,setTimeout(()=>{g.play().catch(w=>console.warn("[journey] autoplay blocked",w))},q*1e3)}let j=null;function $(e){if(j)return j;let w=y(p(e,[x.breathIn[0],x.breathIn[0]+1.6]))*(1-y(p(e,[x.breathIn[1],x.breathIn[1]+1]))),E=y(p(e,[x.breathOut[0],x.breathOut[0]+.25]))*(1-y(p(e,[x.breathOut[0]+.55,x.breathOut[0]+1.2])));if(e>x.loopFrom){const k=(e-x.loopFrom)%x.loopPeriod,J=x.loopAmp,K=J*y(p(k,[0,1.8]))*(1-y(p(k,[4.4,5.6]))),Q=J*y(p(k,[6,6.3]))*(1-y(p(k,[6.7,7.4])));w=Math.max(w,K),E=Math.max(E,Q)}return[w,E]}const ue=new R;let ce=-q,ee=0,te=0;t.setAnimationLoop(()=>{const e=f(),w=se.clamp(e-ce,.001,.1);ce=e;const E=t.getContext(),k=Math.max(.5,E.drawingBufferHeight/900);if(I&&_===null&&P&&c&&e>=x.start&&z===null){const B=c.createBufferSource();B.buffer=P,B.connect(F),B.onended=()=>{D=!0},B.start(),_=c.currentTime}const J=pe(0,.55,y(p(e,O.motesIn)))+pe(0,.45,y(p(e,O.motesFull)));d.fade=J*(1-y(p(e,[O.dim[0],O.dim[0]+9]))),d.update(e,k),m.opacity=Math.pow(p(e,O.dim),1.6),l.emerge=p(e,O.stars),l.global=1-y(p(e,x.starsOut)),l.update(e,k);const K=y(p(e,x.palette)),Q=y(p(e,x.full)),re=1-.45*b.breathing;n.emerge=y(p(e,O.nebula))*re,n.palette=K,n.full=Q,n.update(e),h.emerge=y(p(e,O.nebula))*.9*re,h.palette=K,h.full=Q,h.update(e*.55),s.emerge=y(p(e,x.curtains))*re,s.update(e);const ve=t.xr.isPresenting?t.xr.getCamera():r,[oe,ne]=$(e),xe=.05+oe*.85-ne*1;te+=(xe-te)*(1-Math.exp(-w*2.2)),ee+=te*w,n.radial=ee,h.radial=ee*.35,b.core=y(p(e,x.core)),b.field=y(p(e,x.field)),b.gateIn=oe,b.gateOut=ne,b.update(e,w,ve,k);const fe=y(p(e,[O.dim[0]+8,O.dim[1]+8]));if(ue.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(fe),i.position.copy(ue),i.rotation.z=Math.sin(e*.013)*.03*fe,v.fade=y(p(e,[-q+.8,-.2]))*(1-y(p(e,Xe))),v.update(e,w,ve),T)if(e<x.start-4){const B=y(p(e,O.drone)),be=1-.45*y(p(e,[90,118]));T.level=B*be}else T.level=.1+.1*oe-.04*ne;t.render(a,r)});const de=await N();de==="immersive-ar"?Y("Put your headset on and begin.","You will start in your own room."):de==="immersive-vr"?Y("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Y("Preview in browser","Open this page in the Quest browser for the full experience.");const ae=document.getElementById("begin");ae.disabled=!1,ae.addEventListener("click",async()=>{ae.disabled=!0,u||(Y("Loading the voice…"),await new Promise(e=>{if(u)return e();const w=setInterval(()=>{u&&(clearInterval(w),e())},100);setTimeout(()=>{clearInterval(w),e()},6e3)})),await H()}),window.JOURNEY={THREE:Ee,scene:a,camera:r,renderer:t,stars:l,nebula:n,voidShell:m,motes:d,narrator:v,prana:b,T:O,SEG2:x,seek:e=>{z=e},resume:()=>{z=null},look:(e,w=0)=>{r.rotation.set(w,e,0,"YXZ")},moveTo:(e,w,E)=>{i.position.set(0,0,0),r.position.set(e,w,E)},forceBreath:(e,w)=>{j=e===null?null:[e,w]},fakeLevel:e=>{v.uniforms.uLevel.value=e},dryStart:()=>{I=!0,C=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:f(),xrMode:V,voidOpacity:m.opacity,starEmerge:l.emerge,nebulaEmerge:n.emerge,orbFade:v.fade})},window.__JOURNEY_READY=!0}$e().catch(o=>{console.error(o),window.__JOURNEY_ERROR=String(o&&o.stack||o),Y("Something went wrong.",String(o))});
