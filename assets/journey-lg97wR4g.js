import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as ne,ae as I,an as ie,M as K,C as fe,Y as Z,E as Y,a as T,ak as G,W as J,G as se,ah as le,V as z,aC as me,S as he,aD as pe,aE as ge,X as we,aG as ye}from"./three-B0MzMegT.js";function ue(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function xe(o){const t=new ne(500,24,16),a=new I({side:ie,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),r=new K(t,a);return r.frustumCulled=!1,r.renderOrder=-10,o.add(r),{mesh:r,set opacity(i){a.uniforms.uOpacity.value=i},get opacity(){return a.uniforms.uOpacity.value}}}const be=`
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
`,Se=`
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
`;function Te(o,{count:t=5200}={}){const a=ue(20260805),r=new Float32Array(t*3),i=new Float32Array(t),v=new Float32Array(t),p=new Float32Array(t),g=new Float32Array(t*3),s=new fe;for(let u=0;u<t;u++){let b=a()*2-1;const A=a()*Math.PI*2;a()<.42&&(b*=.3);const S=Math.sqrt(Math.max(0,1-b*b)),P=90+a()*320;r[u*3]=Math.cos(A)*S*P,r[u*3+1]=b*P,r[u*3+2]=Math.sin(A)*S*P;const C=Math.pow(a(),2.4);v[u]=.85+C*4.2,i[u]=Z.clamp(.86-C*.9+(a()-.5)*.22,0,.9),p[u]=a()*100;const O=a();O>.86?s.setHSL(.07+a()*.04,.55,.72):O>.66?s.setHSL(.12+a()*.03,.22,.85):s.setHSL(.58+a()*.06,.28+a()*.3,.88),g[u*3]=s.r,g[u*3+1]=s.g,g[u*3+2]=s.b}const d=new Y;d.setAttribute("position",new T(r,3)),d.setAttribute("aDelay",new T(i,1)),d.setAttribute("aSize",new T(v,1)),d.setAttribute("aSeed",new T(p,1)),d.setAttribute("aTint",new T(g,3));const l={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},n=new I({vertexShader:be,fragmentShader:Se,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}),x=new J(d,n);x.frustumCulled=!1,x.renderOrder=5;const c=new se;return c.add(x),o.add(c),{group:c,uniforms:l,set emerge(u){l.uEmerge.value=u},get emerge(){return l.uEmerge.value},set global(u){l.uGlobal.value=u},update(u,b){l.uTime.value=u,l.uPixel.value=b,c.rotation.y=u*.0042,c.rotation.x=Math.sin(u*.017)*.014}}}const Ae=`
  precision highp float;

  uniform float uTime;
  uniform float uEmerge;
  uniform float uPalette;  // 0 = segment-1 indigo/teal, 1 = prana blue-green + red
  uniform float uFull;     // 0 = banded like a galaxy, 1 = flowing everywhere

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
    vec3 q = d * 2.1;
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

    float a = (body * 0.85 + veil * 0.26) * uEmerge * (1.0 + 0.12 * uFull);
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a * 3.4, a);
  }
`;function Fe(o){const t=new ne(430,48,32),a={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0}},r=new I({side:ie,transparent:!0,depthWrite:!1,depthTest:!1,blending:G,uniforms:a,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ae}),i=new K(t,r);return i.frustumCulled=!1,i.renderOrder=4,o.add(i),{mesh:i,set emerge(v){a.uEmerge.value=v},get emerge(){return a.uEmerge.value},set palette(v){a.uPalette.value=v},set full(v){a.uFull.value=v},update(v){a.uTime.value=v}}}const Me=`
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
`,Pe=`
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
`;function Oe(o,{count:t=260,radius:a=3}={}){const r=ue(77003),i=new Float32Array(t*3),v=new Float32Array(t),p=new Float32Array(t);for(let n=0;n<t;n++)i[n*3]=(r()-.5)*a*2.2,i[n*3+1]=.25+r()*2.3,i[n*3+2]=(r()-.5)*a*2.2,v[n]=r(),p[n]=.5+r()*1.4;const g=new Y;g.setAttribute("position",new T(i,3)),g.setAttribute("aSeed",new T(v,1)),g.setAttribute("aSize",new T(p,1));const s={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},d=new I({vertexShader:Me,fragmentShader:Pe,uniforms:s,transparent:!0,depthWrite:!1,blending:G}),l=new J(g,d);return l.frustumCulled=!1,l.renderOrder=3,o.add(l),{points:l,set fade(n){s.uFade.value=n},get fade(){return s.uFade.value},update(n,x){s.uTime.value=n,s.uPixel.value=x}}}const Ee=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,_e=`
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
`;function ze(o){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new I({vertexShader:Ee,fragmentShader:_e,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}),r=new K(new le(.44,.44),a);r.frustumCulled=!1,r.renderOrder=30,o.add(r);let i=null,v=null,p=0;const g=new z(0,1.35,-1.7),s=new z,d=new z(0,1.35,-1.7);return r.position.copy(d),{mesh:r,uniforms:t,attachAnalyser(l,n){i=l.createAnalyser(),i.fftSize=512,i.smoothingTimeConstant=.55,v=new Uint8Array(i.frequencyBinCount),n.connect(i)},set fade(l){t.uFade.value=l},get fade(){return t.uFade.value},update(l,n,x){t.uTime.value=l,x.getWorldDirection(s),x.getWorldPosition(g),g.addScaledVector(s,1.7);const c=1-Math.exp(-n*5.5);d.lerp(g,c),r.position.set(d.x,d.y+Math.sin(l*.9)*.008,d.z);let u=0;if(i){i.getByteFrequencyData(v);const A=Math.max(8,v.length*.45|0);let M=0;for(let S=2;S<A;S++)M+=v[S];u=Math.min(1,M/(A-2)/132)}const b=u>p?1-Math.exp(-n*22):1-Math.exp(-n*3.2);p+=(u-p)*b,t.uLevel.value=p}}}function Ce(o){let t=o>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const Re=`
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
    float idle = uField * (0.20 + 0.16 * sin(uTime * 0.8 + aSeed * 40.0));
    float stream = sin(travel * 3.14159) * uIn;   // zero at rest AND at arrival
    vA = max(idle, stream * 1.9);
    vHot = travel;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float px = aSize * uPixel * (30.0 / max(-mv.z, 0.3)) * (1.0 - 0.55 * travel);
    gl_PointSize = min(px, 42.0 * uPixel);
  }
`,De=`
  precision highp float;
  varying float vA;
  varying float vHot;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = exp(-r * r * 14.0) * vA;
    if (a < 0.004) discard;
    // warm gold that runs white-hot as it is absorbed
    vec3 col = mix(vec3(1.0, 0.76, 0.28), vec3(1.0, 0.96, 0.80), vHot);
    gl_FragColor = vec4(col * a, a);
  }
`,Ie=`
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
    float s = fract(aSeed + uTime * (0.15 + fract(aSeed * 3.7) * 0.10));

    // a plume: forward, spreading, sinking a little — breath in cold air
    vec3 dir = normalize(aDir * 0.62 + uFwd + vec3(0.0, -0.12, 0.0));
    float reach = (1.1 + fract(aSeed * 9.1) * 1.4) * (0.45 + 0.55 * uOut);
    vec3 p = uNose + dir * smoothstep(0.0, 1.0, s) * reach;
    p += vec3(sin(uTime * 1.3 + aSeed * 31.0),
              sin(uTime * 1.1 + aSeed * 17.0),
              cos(uTime * 1.2 + aSeed * 23.0)) * 0.06 * s;

    // born just past the lips, dead before it goes far
    vA = uOut * pow(1.0 - s, 1.5) * smoothstep(0.015, 0.12, s) * 1.7;
    vS = s;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float px = (0.9 + fract(aSeed * 5.3) * 1.8) * uPixel * (32.0 / max(-mv.z, 0.25));
    gl_PointSize = min(px, 36.0 * uPixel);
  }
`,Ge=`
  precision highp float;
  varying float vA;
  varying float vS;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = exp(-r * r * 12.0) * vA;
    if (a < 0.004) discard;
    // ember-bright at the lips, deep red as it disperses
    vec3 col = mix(vec3(1.0, 0.38, 0.16), vec3(0.52, 0.06, 0.10), vS);
    gl_FragColor = vec4(col * a, a);
  }
`,Ue=`
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
`,Be=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function Le(o){const t=Ce(90210),a=2400,r=new Float32Array(a),i=new Float32Array(a*3),v=new Float32Array(a),p=new Float32Array(a),g=new z(0,.05,-1).normalize(),s=new z;for(let f=0;f<a;f++){r[f]=t();do s.set(t()*2-1,t()*2-1,t()*2-1);while(s.lengthSq()>1||s.lengthSq()<.05);s.normalize(),t()<.55&&s.lerp(g,.72).normalize(),i[f*3]=s.x,i[f*3+1]=s.y,i[f*3+2]=s.z,v[f]=1.5+Math.pow(t(),.7)*3.6,p[f]=.7+t()*1.5}const d=new Y;d.setAttribute("position",new T(new Float32Array(a*3),3)),d.setAttribute("aSeed",new T(r,1)),d.setAttribute("aDir",new T(i,3)),d.setAttribute("aRad",new T(v,1)),d.setAttribute("aSize",new T(p,1));const l={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new z(0,1.3,-.3)}},n=new J(d,new I({vertexShader:Re,fragmentShader:De,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));n.frustumCulled=!1,n.renderOrder=24,o.add(n);const x=1200,c=new Float32Array(x),u=new Float32Array(x*3);for(let f=0;f<x;f++){c[f]=t();do s.set(t()*2-1,t()*2-1,t()*2-1);while(s.lengthSq()>1||s.lengthSq()<.05);s.normalize(),u[f*3]=s.x,u[f*3+1]=s.y,u[f*3+2]=s.z}const b=new Y;b.setAttribute("position",new T(new Float32Array(x*3),3)),b.setAttribute("aSeed",new T(c,1)),b.setAttribute("aDir",new T(u,3));const A={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new z(0,1.3,-.3)},uFwd:{value:new z(0,0,-1)}},M=new J(b,new I({vertexShader:Ie,fragmentShader:Ge,uniforms:A,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));M.frustumCulled=!1,M.renderOrder=25,o.add(M);const S={uTime:{value:0},uCore:{value:0},uIn:{value:0}},P=new K(new le(6.4,6.4),new I({vertexShader:Be,fragmentShader:Ue,uniforms:S,transparent:!0,depthWrite:!1,depthTest:!1,blending:G}));P.position.set(0,1.6,-5.6),P.frustumCulled=!1,P.renderOrder=6,o.add(P);const C=new z,O=new z;let E=0,R=0;return{set core(f){S.uCore.value=f},set field(f){l.uField.value=f},gateIn:0,gateOut:0,update(f,U,L,q){const k=1-Math.exp(-U*(this.gateIn>E?3.2:1.8));E+=(this.gateIn-E)*k;const Q=1-Math.exp(-U*(this.gateOut>R?4.5:1.6));R+=(this.gateOut-R)*Q,L.getWorldPosition(C),L.getWorldDirection(O),C.addScaledVector(O,.3),C.y-=.06,l.uTime.value=f,l.uPixel.value=q,l.uIn.value=E,l.uNose.value.copy(C),A.uTime.value=f,A.uPixel.value=q,A.uOut.value=R,A.uNose.value.copy(C),A.uFwd.value.copy(O),S.uTime.value=f,S.uIn.value=E}}}const _={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,122],nebula:[94,148],drone:[68,88]},h={start:154,url:"assets/audio/journey_02.mp3",starsOut:[160,174],palette:[162,178],full:[162,180],core:[172.5,178.5],field:[174,182],breathIn:[182.9,187.3],breathOut:[187.6,192.5],loopFrom:220,loopPeriod:11.5,loopAmp:.62},ke="assets/audio/journey_01.mp3",V=4,Ve=[82.5,88.5],Ne=[h.start-2.6,h.start-.3],qe=[h.start+62.5,h.start+68],oe=(o,t,a)=>o+(t-o)*a,m=(o,[t,a])=>Z.clamp((o-t)/(a-t),0,1),w=o=>o*o*(3-2*o);function N(o,t){const a=document.getElementById("status");a&&(a.textContent=o);const r=document.getElementById("substatus");r&&t!==void 0&&(r.textContent=t)}function We(o,t){const a=o.createGain();a.gain.value=0,a.connect(t);const r=o.createBiquadFilter();r.type="lowpass",r.frequency.value=220,r.Q.value=.6,r.connect(a);for(const[i,v]of[[38,.55],[57,.28],[76.4,.18]]){const p=o.createOscillator();p.type="sine",p.frequency.value=i;const g=o.createGain();g.gain.value=v,p.connect(g).connect(r),p.start()}return{set level(i){a.gain.setTargetAtTime(i*.09,o.currentTime,.25)}}}async function je(){const o=document.getElementById("view"),t=new me({canvas:o,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=he,t.toneMapping=pe,t.toneMappingExposure=1.15;const a=new ge;a.background=null;const r=new we(70,window.innerWidth/window.innerHeight,.05,900);r.position.set(0,1.35,0);const i=new se;i.add(r),a.add(i);const v=xe(a),p=Te(a),g=Fe(p.group),s=Oe(a),d=ze(a),l=Le(a);window.addEventListener("resize",()=>{r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const n=new Audio;n.src=ke,n.preload="auto",n.crossOrigin="anonymous";let x=!1;n.addEventListener("canplaythrough",()=>{x=!0},{once:!0}),n.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),x=!0},{once:!0});let c=null,u=null,b=null;function A(){if(!c)try{c=new(window.AudioContext||window.webkitAudioContext);const e=c.createGain();e.gain.value=1,e.connect(c.destination);const y=c.createMediaElementSource(n);b=c.createGain(),b.gain.value=1,y.connect(b).connect(e),d.attachAnalyser(c,b),u=We(c,e)}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let M=null,S=null,P=!1;async function C(){try{const y=await(await fetch(h.url)).arrayBuffer();c&&(M=await c.decodeAudioData(y))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}}let O=!1,E=0;n.addEventListener("loadedmetadata",()=>{isFinite(n.duration)&&n.duration});let R=null;function f(){if(R!==null)return R;if(!O)return-V;if(S!==null&&!P&&c){const e=h.start+(c.currentTime-S);return E=performance.now()/1e3-e,e}return!n.ended&&n.currentTime>.01?(E=performance.now()/1e3-n.currentTime,n.currentTime):performance.now()/1e3-E}let U="flat";async function L(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function q(){A(),c&&c.state==="suspended"&&await c.resume(),C();const e=await L();if(e){const y={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const F=await navigator.xr.requestSession(e,y);await t.xr.setSession(F),U=e,F.addEventListener("end",()=>{U="flat"})}catch(F){console.warn("[journey] could not start",e,F)}}document.body.classList.add("started"),O=!0,E=performance.now()/1e3+V,setTimeout(()=>{n.play().catch(y=>console.warn("[journey] autoplay blocked",y))},V*1e3)}let k=null;function Q(e){if(k)return k;let y=w(m(e,[h.breathIn[0],h.breathIn[0]+1.6]))*(1-w(m(e,[h.breathIn[1],h.breathIn[1]+1]))),F=w(m(e,[h.breathOut[0],h.breathOut[0]+.9]))*(1-w(m(e,[h.breathOut[1],h.breathOut[1]+1.4])));if(e>h.loopFrom){const D=(e-h.loopFrom)%h.loopPeriod,W=h.loopAmp,j=W*w(m(D,[0,1.8]))*(1-w(m(D,[4.4,5.6]))),H=W*w(m(D,[6,7]))*(1-w(m(D,[10,11.3])));y=Math.max(y,j),F=Math.max(F,H)}return[y,F]}const $=new z;let ee=-V;t.setAnimationLoop(()=>{const e=f(),y=Z.clamp(e-ee,.001,.1);ee=e;const F=t.getContext(),D=Math.max(.5,F.drawingBufferHeight/900);if(O&&S===null&&M&&c&&e>=h.start&&R===null){const B=c.createBufferSource();B.buffer=M,B.connect(b),B.onended=()=>{P=!0},B.start(),S=c.currentTime}const W=oe(0,.55,w(m(e,_.motesIn)))+oe(0,.45,w(m(e,_.motesFull)));s.fade=W*(1-w(m(e,[_.dim[0],_.dim[0]+9]))),s.update(e,D),v.opacity=Math.pow(m(e,_.dim),1.6),p.emerge=m(e,_.stars),p.global=1-w(m(e,h.starsOut)),p.update(e,D),g.emerge=w(m(e,_.nebula)),g.palette=w(m(e,h.palette)),g.full=w(m(e,h.full)),g.update(e);const j=t.xr.isPresenting?t.xr.getCamera():r,[H,ae]=Q(e);l.core=w(m(e,h.core)),l.field=w(m(e,h.field)),l.gateIn=H,l.gateOut=ae,l.update(e,y,j,D);const re=w(m(e,[_.dim[0]+8,_.dim[1]+8]));$.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(re),i.position.copy($),i.rotation.z=Math.sin(e*.013)*.03*re;const ce=w(m(e,[-V+.8,-.2]))*(1-w(m(e,Ve))),de=w(m(e,Ne))*(1-w(m(e,qe)));if(d.fade=Math.max(ce,de),d.update(e,y,j),u)if(e<h.start-4){const B=w(m(e,_.drone)),ve=1-.45*w(m(e,[90,118]));u.level=B*ve}else u.level=.1+.1*H-.04*ae;t.render(a,r)});const te=await L();te==="immersive-ar"?N("Put your headset on and begin.","You will start in your own room."):te==="immersive-vr"?N("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):N("Preview in browser","Open this page in the Quest browser for the full experience.");const X=document.getElementById("begin");X.disabled=!1,X.addEventListener("click",async()=>{X.disabled=!0,x||(N("Loading the voice…"),await new Promise(e=>{if(x)return e();const y=setInterval(()=>{x&&(clearInterval(y),e())},100);setTimeout(()=>{clearInterval(y),e()},6e3)})),await q()}),window.JOURNEY={THREE:ye,scene:a,camera:r,renderer:t,stars:p,nebula:g,voidShell:v,motes:s,narrator:d,prana:l,T:_,SEG2:h,seek:e=>{R=e},resume:()=>{R=null},look:(e,y=0)=>{r.rotation.set(y,e,0,"YXZ")},moveTo:(e,y,F)=>{i.position.set(0,0,0),r.position.set(e,y,F)},forceBreath:(e,y)=>{k=e===null?null:[e,y]},fakeLevel:e=>{d.uniforms.uLevel.value=e},dryStart:()=>{O=!0,E=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:f(),xrMode:U,voidOpacity:v.opacity,starEmerge:p.emerge,nebulaEmerge:g.emerge,orbFade:d.fade})},window.__JOURNEY_READY=!0}je().catch(o=>{console.error(o),window.__JOURNEY_ERROR=String(o&&o.stack||o),N("Something went wrong.",String(o))});
