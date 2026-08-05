import{G as ut,M as ft}from"./meshopt_decoder.module-DqI91Qqu.js";import{$ as rt,g as W,o as Se,M as Z,C as ot,p as We,a3 as Ce,a as j,A as te,a4 as Ve,G as Ke,n as Ee,P as je,V as D,N as De,c as it,D as bt,a5 as Et,a6 as vt,B as Ct,b as qe,I as tt,f as at,a7 as Rt,Q as dt,a8 as mt,a9 as Pt,aa as Ot,Y as Gt,S as It,Z as Lt,_ as zt,x as Vt,a0 as Bt}from"./three-B5WSCczv.js";function Tt(s){let t=s>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Nt(s){const t=new rt(500,24,16),a=new W({side:Se,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),l=new Z(t,a);return l.frustumCulled=!1,l.renderOrder=-10,s.add(l),{mesh:l,set opacity(d){a.uniforms.uOpacity.value=d},get opacity(){return a.uniforms.uOpacity.value}}}const qt=`
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
`,Dt=`
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
`;function Wt(s,{count:t=5200}={}){const a=Tt(20260805),l=new Float32Array(t*3),d=new Float32Array(t),F=new Float32Array(t),h=new Float32Array(t),T=new Float32Array(t*3),u=new ot;for(let b=0;b<t;b++){let k=a()*2-1;const G=a()*Math.PI*2;a()<.42&&(k*=.3);const O=Math.sqrt(Math.max(0,1-k*k)),z=90+a()*320;l[b*3]=Math.cos(G)*O*z,l[b*3+1]=k*z,l[b*3+2]=Math.sin(G)*O*z;const H=Math.pow(a(),2.4);F[b]=.85+H*4.2,d[b]=We.clamp(.86-H*.9+(a()-.5)*.22,0,.9),h[b]=a()*100;const K=a();K>.86?u.setHSL(.07+a()*.04,.55,.72):K>.66?u.setHSL(.12+a()*.03,.22,.85):u.setHSL(.58+a()*.06,.28+a()*.3,.88),T[b*3]=u.r,T[b*3+1]=u.g,T[b*3+2]=u.b}const p=new Ce;p.setAttribute("position",new j(l,3)),p.setAttribute("aDelay",new j(d,1)),p.setAttribute("aSize",new j(F,1)),p.setAttribute("aSeed",new j(h,1)),p.setAttribute("aTint",new j(T,3));const _={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},A=new W({vertexShader:qt,fragmentShader:Dt,uniforms:_,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}),P=new Ve(p,A);P.frustumCulled=!1,P.renderOrder=5;const C=new Ke;return C.add(P),s.add(C),{group:C,uniforms:_,set emerge(b){_.uEmerge.value=b},get emerge(){return _.uEmerge.value},set global(b){_.uGlobal.value=b},update(b,k){_.uTime.value=b,_.uPixel.value=k,C.rotation.y=b*.0042,C.rotation.x=Math.sin(b*.017)*.014}}}const jt=`
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
`;function ht(s,{radius:t=430,scale:a=2.1,gain:l=1,order:d=4}={}){const F=new rt(t,48,32),h={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:l},uHell:{value:0},uBolt:{value:0}},T=new W({side:Se,transparent:!0,depthWrite:!1,depthTest:!0,blending:te,uniforms:h,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:jt}),u=new Z(F,T);return u.frustumCulled=!1,u.renderOrder=d,s.add(u),{mesh:u,set emerge(p){h.uEmerge.value=p},get emerge(){return h.uEmerge.value},set palette(p){h.uPalette.value=p},set full(p){h.uFull.value=p},set radial(p){h.uRadial.value=p},set hell(p){h.uHell.value=p},set bolt(p){h.uBolt.value=p},update(p){h.uTime.value=p}}}const Ht=`
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
`;function Yt(s){const t=new Ee(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},l=new W({side:Se,transparent:!0,depthWrite:!1,depthTest:!1,blending:te,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ht}),d=new Z(t,l);return d.frustumCulled=!1,d.renderOrder=5,s.add(d),{mesh:d,set emerge(F){a.uEmerge.value=F},update(F){a.uTime.value=F,d.rotation.y=F*.006}}}const $t=`
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
`,Qt=`
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
`;function Kt(s,{count:t=260,radius:a=3}={}){const l=Tt(77003),d=new Float32Array(t*3),F=new Float32Array(t),h=new Float32Array(t);for(let A=0;A<t;A++)d[A*3]=(l()-.5)*a*2.2,d[A*3+1]=.25+l()*2.3,d[A*3+2]=(l()-.5)*a*2.2,F[A]=l(),h[A]=.5+l()*1.4;const T=new Ce;T.setAttribute("position",new j(d,3)),T.setAttribute("aSeed",new j(F,1)),T.setAttribute("aSize",new j(h,1));const u={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},p=new W({vertexShader:$t,fragmentShader:Qt,uniforms:u,transparent:!0,depthWrite:!1,blending:te}),_=new Ve(T,p);return _.frustumCulled=!1,_.renderOrder=3,s.add(_),{points:_,set fade(A){u.uFade.value=A},get fade(){return u.uFade.value},update(A,P){u.uTime.value=A,u.uPixel.value=P}}}const Jt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Zt=`
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
`;function Xt(s){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new W({vertexShader:Jt,fragmentShader:Zt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}),l=new Z(new je(.44,.44),a);l.frustumCulled=!1,l.renderOrder=30,s.add(l);let d=null,F=null,h=0;const T=new D(0,1.35,-1.7),u=new D,p=new D(0,1.35,-1.7);return l.position.copy(p),{mesh:l,uniforms:t,attachAnalyser(_,A){d=_.createAnalyser(),d.fftSize=512,d.smoothingTimeConstant=.55,F=new Uint8Array(d.frequencyBinCount),A.connect(d)},set fade(_){t.uFade.value=_},get fade(){return t.uFade.value},update(_,A,P){t.uTime.value=_,P.getWorldDirection(u),P.getWorldPosition(T),T.addScaledVector(u,1.7);const C=1-Math.exp(-A*5.5);p.lerp(T,C),l.position.set(p.x,p.y+Math.sin(_*.9)*.008,p.z);let b=0;if(d){d.getByteFrequencyData(F);const G=Math.max(8,F.length*.45|0);let c=0;for(let O=2;O<G;O++)c+=F[O];b=Math.min(1,c/(G-2)/132)}const k=b>h?1-Math.exp(-A*22):1-Math.exp(-A*3.2);h+=(b-h)*k,t.uLevel.value=h}}}function ea(s){let t=s>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const ta=`
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
`,aa=`
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
`,oa=`
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
`,ia=`
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
`,ra=`
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
`,pt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function na(s){const t=ea(90210),a=850,l=new Float32Array(a),d=new Float32Array(a*3),F=new Float32Array(a),h=new Float32Array(a),T=new D(0,.05,-1).normalize(),u=new D;for(let M=0;M<a;M++){l[M]=t();do u.set(t()*2-1,t()*2-1,t()*2-1);while(u.lengthSq()>1||u.lengthSq()<.05);u.normalize(),t()<.25&&u.lerp(T,.6).normalize(),d[M*3]=u.x,d[M*3+1]=u.y,d[M*3+2]=u.z,F[M]=2.2+Math.pow(t(),.7)*5.8,h[M]=1.8+t()*3.4}const p=new Ce;p.setAttribute("position",new j(new Float32Array(a*3),3)),p.setAttribute("aSeed",new j(l,1)),p.setAttribute("aDir",new j(d,3)),p.setAttribute("aRad",new j(F,1)),p.setAttribute("aSize",new j(h,1));const _={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new D(0,1.3,-.3)}},A=new Ve(p,new W({vertexShader:ta,fragmentShader:aa,uniforms:_,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));A.frustumCulled=!1,A.renderOrder=24,s.add(A);const P=700,C=new Float32Array(P),b=new Float32Array(P*3);for(let M=0;M<P;M++){C[M]=t();do u.set(t()*2-1,t()*2-1,t()*2-1);while(u.lengthSq()>1||u.lengthSq()<.05);u.normalize(),b[M*3]=u.x,b[M*3+1]=u.y,b[M*3+2]=u.z}const k=new Ce;k.setAttribute("position",new j(new Float32Array(P*3),3)),k.setAttribute("aSeed",new j(C,1)),k.setAttribute("aDir",new j(b,3));const G={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new D(0,1.3,-.3)},uFwd:{value:new D(0,0,-1)}},c=new Ve(k,new W({vertexShader:oa,fragmentShader:ia,uniforms:G,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));c.frustumCulled=!1,c.renderOrder=25,s.add(c);const O={uTime:{value:0},uCore:{value:0},uIn:{value:0}},z=new Z(new je(16,16),new W({vertexShader:pt,fragmentShader:ra,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));z.position.set(0,2.5,-14),z.frustumCulled=!1,z.renderOrder=6,s.add(z);const H={uTime:{value:0},uCore:{value:0}},K=new Z(new je(5,90),new W({vertexShader:pt,fragmentShader:`
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
      `,uniforms:H,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));K.position.set(0,2.5,-14.2),K.frustumCulled=!1,K.renderOrder=5,s.add(K);const ae=new D,re=new D;let V=0,oe=0;return{get breathing(){return Math.max(V,oe)},set core(M){O.uCore.value=M,H.uCore.value=M},set field(M){_.uField.value=M},gateIn:0,gateOut:0,update(M,ie,ne,X){const i=1-Math.exp(-ie*(this.gateIn>V?3.2:1.8));V+=(this.gateIn-V)*i;const v=1-Math.exp(-ie*(this.gateOut>oe?9:4));oe+=(this.gateOut-oe)*v,ne.getWorldPosition(ae),ne.getWorldDirection(re),ae.addScaledVector(re,.12),ae.y-=.05,_.uTime.value=M,_.uPixel.value=X,_.uIn.value=V,_.uNose.value.copy(ae),G.uTime.value=M,G.uPixel.value=X,G.uOut.value=oe,G.uNose.value.copy(ae),G.uFwd.value.copy(re),O.uTime.value=M,O.uIn.value=V,H.uTime.value=M}}}const la=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ye=`
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
`,sa=`
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

  
  float win(float a, float b) { return smoothstep(a, b, uForm); }

  // vertical almond with true points top and bottom
  float vesica(vec2 p, vec2 c, float w, float h) {
    vec2 q = p - c;
    float env = 1.0 - (q.y * q.y) / (h * h);   // negative beyond the points
    return (abs(q.x) - w * env) / w;
  }
`,ca=`
  precision highp float;
  
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
`,ua=`
  precision highp float;
  
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
`,fa=`
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
`,gt=`
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
`,wt=`
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
`,va=`
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
`,da=`
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
`,ma=`
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
`,ha=`
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
`,pa=`
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
`,ga=`
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
`;function de(s,t,a,l,{blending:d=te,order:F=8}={}){const h=new W({vertexShader:la,fragmentShader:a,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:d,side:bt}),T=new Z(new je(s,t),h);return T.frustumCulled=!1,T.renderOrder=F,T}function wa(s){const t=new Ke;s.add(t);const a={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},l=sa,d=ca.replace("__COMMON__",l).replace("__NOISE__",Ye),F=ua.replace("__COMMON__",l).replace("__NOISE__",Ye),h=340,T=285,u=-190,p=62,_=de(h,T,d,a,{blending:De,order:7});_.position.set(0,p,u),t.add(_);const A=de(h,T,F,a,{order:8});A.position.set(0,p,u),t.add(A);const P=new D(0,p+.38*(T/2),u),C=de(34,34,fa,{uTime:a.uTime,uForm:{value:0}},{order:8});C.position.set(95,130,-180),t.add(C);const b=de(70,70,gt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});b.position.set(-150,45,-175),t.add(b);const k=de(44,44,gt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});k.position.set(150,20,-165),t.add(k);const G={uForm:{value:0}},c=new Z(new Ee(90,90,34,96,1,!0),new W({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ma,uniforms:G,transparent:!0,depthWrite:!1,depthTest:!1,blending:De,side:Se}));c.position.y=-14,c.renderOrder=9,c.frustumCulled=!1,t.add(c);const O={uTime:a.uTime,uForm:{value:0}},z=new Z(new Ee(110,110,60,96,1,!0),new W({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ha,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:te,side:Se}));z.position.y=-12,z.renderOrder=6,z.frustumCulled=!1,t.add(z);const H=420,K=new Float32Array(H*3),ae=new Float32Array(H);for(let o=0;o<H;o++){const e=Math.random()*Math.PI*2,n=40+Math.random()*55;K[o*3]=Math.cos(e)*n,K[o*3+1]=-20+Math.random()*30,K[o*3+2]=Math.sin(e)*n,ae[o]=Math.random()}const re=new Ce;re.setAttribute("position",new j(K,3)),re.setAttribute("aSeed",new j(ae,1));const V={uTime:a.uTime,uForm:{value:0},uPixel:{value:1}},oe=new Ve(re,new W({vertexShader:`
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
    `,uniforms:V,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));oe.frustumCulled=!1,oe.renderOrder=9,t.add(oe);const M={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new it(1,-.1)},uSpin:{value:.05},uTint:{value:new ot(.45,.62,1)}},ie={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new it(-1,.12)},uSpin:{value:-.065},uTint:{value:new ot(1,.58,.22)}},ne=de(175,175,wt,M,{order:22}),X=de(150,150,wt,ie,{order:22});ne.position.set(-62,20,-120),X.position.set(62,32,-125),s.add(ne),s.add(X),ne.visible=X.visible=!1;const i=(o,e)=>{const n={uTime:{value:0},uShow:{value:0}},f=de(430,330,`
      precision highp float;
      uniform float uTime;
      uniform float uShow;
      varying vec2 vUv;
      ${Ye}
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float n = fbm(vUv * 2.6 + uTime * 0.01);
        float body = exp(-r * r * 2.2) * (0.35 + 0.65 * n);
        float a = body * uShow * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(${o}) * a * 1.6, a);
      }
    `,n,{order:21});return f.position.set(e,26,-160),s.add(f),f.visible=!1,{u:n,m:f}},v=i("0.30, 0.45, 0.95",-120),y=i("0.95, 0.42, 0.12",120),E={uTime:{value:0},uWall:{value:0}},r=de(60,300,`
    precision highp float;
    uniform float uTime;
    uniform float uWall;
    varying vec2 vUv;
    ${Ye}
    void main() {
      float x = abs(vUv.x);
      float beam = exp(-x * x * 10.0);
      float tear = 0.6 + 0.6 * fbm(vec2(vUv.y * 5.0, uTime * 0.4));
      vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), tear - 0.6);
      float a = beam * tear * uWall;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * a * 2.6, a);
    }
  `,E,{order:24});r.position.set(0,24,-130),s.add(r),r.visible=!1;const g={uTime:{value:0},uRing:{value:0}},w=de(420,420,da,g,{order:23});w.position.set(0,24,-138),s.add(w),w.visible=!1;const U={uTime:{value:0},uLife:{value:0}},I=de(90,90,va,U,{order:22});I.position.set(0,24,-138),s.add(I),I.visible=!1;const L={uTime:{value:0},uGrow:{value:0}},B=de(7,7,ga,L,{order:26});B.position.set(0,1.5,-9),s.add(B);const ee={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},Y=new Z(new Ee(3.2,3.2,130,40,1,!0),new W({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:pa,uniforms:ee,transparent:!0,depthWrite:!1,depthTest:!1,blending:te,side:Se}));Y.rotation.x=Math.PI/2,Y.position.set(0,1.5,-20),Y.renderOrder=27,Y.frustumCulled=!1,s.add(Y);const fe={uBlack:{value:0},uWhite:{value:0}},ge=new Z(new rt(.6,16,12),new W({vertexShader:`
        void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,fragmentShader:`
        precision highp float;
        uniform float uBlack;
        uniform float uWhite;
        void main() {
          float a = max(uBlack, uWhite);
          if (a < 0.003) discard;
          gl_FragColor = vec4(vec3(uWhite) * 1.1, a);
        }
      `,uniforms:fe,transparent:!0,depthWrite:!1,depthTest:!1,blending:De,side:Se}));ge.renderOrder=50,ge.frustumCulled=!1,s.add(ge);const Fe=1400,Ue=new Float32Array(Fe*3),_e=new Float32Array(Fe*3),Re=new Float32Array(Fe);{const o=f=>f*(h/2),e=f=>p+f*(T/2),n=[];for(let f=0;f<3;f++)for(let R=0;R<200;R++){const $=(Math.random()*2-1)*.46;n.push([o($),e(.3+f*.14+$*$*.1),u+2])}for(let f=-1;f<=1;f+=2)for(let R=0;R<130;R++){const $=(Math.random()*2-1)*.14;n.push([o(f*.3+$),e(-.1+.03-$*$*1.6),u+2])}for(let f=0;f<220;f++){const R=Math.random()*Math.PI*2;n.push([o(Math.cos(R)*.062),e(.38+Math.sin(R)*.155),u+2])}for(let f=0;f<160;f++){const R=.3-Math.random()*.75;n.push([o((Math.random()*2-1)*.05),e(R),u+2])}for(;n.length<Fe;)n.push(n[Math.random()*n.length|0]);for(let f=0;f<Fe;f++){const R=n[f%n.length],$=Math.random()*Math.PI*2,le=(Math.random()-.35)*1.8,se=260+Math.random()*160;Ue[f*3]=Math.cos($)*Math.cos(le)*se,Ue[f*3+1]=60+Math.sin(le)*se*.7,Ue[f*3+2]=-80+Math.sin($)*Math.cos(le)*se*.5-80,_e[f*3]=R[0],_e[f*3+1]=R[1],_e[f*3+2]=R[2],Re[f]=Math.random()}}const ke=new Ce;ke.setAttribute("position",new j(Ue,3)),ke.setAttribute("aEnd",new j(_e,3)),ke.setAttribute("aSeed",new j(Re,1));const xe={uTime:{value:0},uForm:a.uForm,uPixel:{value:1}},Pe=new Ve(ke,new W({vertexShader:`
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
    `,fragmentShader:`
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
    `,uniforms:xe,transparent:!0,depthWrite:!1,depthTest:!1,blending:te}));return Pe.frustumCulled=!1,Pe.renderOrder=9,t.add(Pe),t.visible=!1,{group:t,eyeWorld:P,set collide(o){const e=o>.001&&o<1;ne.visible=X.visible=e,v.m.visible=y.m.visible=e,r.visible=o>.8&&o<.995,M.uShow.value=ie.uShow.value=Math.min(1,o*4),v.u.uShow.value=y.u.uShow.value=Math.min(1,o*3)*(1-o*.3),E.uWall.value=Math.max(0,(o-.8)/.2),M.uTidal.value=ie.uTidal.value=Math.pow(o,1.6);const n=62*(1-Math.pow(o,1.7)*.88);ne.position.x=-n,X.position.x=n,X.position.y=32-Math.pow(o,1.7)*12,v.m.position.x=-120+Math.pow(o,1.7)*55,y.m.position.x=120-Math.pow(o,1.7)*55},set flash(o){fe.uWhite.value=o},set ring(o){g.uRing.value=o,w.visible=o>.002&&o<.999},set remnant(o){U.uLife.value=o,I.visible=o>.002},set tunnelEnd(o){ee.uEnd.value=o},set flare(o){a.uFlare.value=o},set fireSurge(o){O.uForm.value=Math.min(1.6,O.uForm.value*(1+o))},set portal(o){L.uGrow.value=o,B.visible=o>.002},set rush(o){ee.uRush.value=o,Y.visible=o>.002},set form(o){a.uForm.value=o,t.visible=o>.001||a.uSuck.value>.001,C.material.uniforms.uForm.value=Math.min(1,o*2.2),b.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.15)),k.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.25)),G.uForm.value=Math.min(1,o*2.6),O.uForm.value=Math.min(1,Math.max(0,o*2.2-.2)),V.uForm.value=Math.min(1,Math.max(0,o*2-.3))},set open(o){a.uOpen.value=o},set suck(o){a.uSuck.value=o;const e=1+o*o*7;t.scale.setScalar(e),t.position.copy(P).multiplyScalar(1-e)},set black(o){fe.uBlack.value=o},update(o,e,n){a.uTime.value=o,L.uTime.value=o,ee.uTime.value=o,M.uTime.value=o,ie.uTime.value=o,v.u.uTime.value=o,y.u.uTime.value=o,E.uTime.value=o,g.uTime.value=o,U.uTime.value=o,xe.uTime.value=o,xe.uPixel.value=e,V.uPixel.value=e,ge.visible!==fe.uBlack.value>.003&&(ge.visible=fe.uBlack.value>.003),n.getWorldPosition(ge.position),Y.position.x=ge.position.x,Y.position.y=ge.position.y}}}const $e=`
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
`,xa=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Qe=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ya=`
  precision highp float;
  uniform float uTime;
  uniform float uFire;    // 1 burning .. 0 dead
  uniform float uSeed;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    vec2 p = vUv;                       // x -1..1, y -1..1 (bottom at pot rim)
    float yy = p.y * 0.5 + 0.5;         // 0 bottom .. 1 top
    float tongues = rfbm(vec2(p.x * 3.0 + uSeed * 9.0, yy * 2.2 - uTime * (0.9 + uSeed * 0.3)));
    float body = tongues * (1.0 - yy * yy) * (1.0 - abs(p.x) * abs(p.x));
    body = pow(body, 1.4);
    vec3 col = mix(vec3(1.0, 0.25, 0.03), vec3(1.0, 0.75, 0.25), body);
    col = mix(col, vec3(1.0, 0.95, 0.7), pow(body, 3.0));
    float a = body * uFire * 1.4;
    if (a < 0.006) discard;
    gl_FragColor = vec4(col * a * 1.8, a);
  }
`,ba=`
  precision highp float;
  uniform float uTime;
  uniform float uFire;
  varying vec2 vUv;      // x across (0..1), y along the full length
  
  __NOISE__
  void main() {
    vec2 p = vec2(vUv.x * 3.4, vUv.y * 160.0);
    // flagstone cells
    float cell = fbm(p * 0.9);
    float cracks = rfbm(p * 0.55);
    float crackLine = smoothstep(0.74, 0.95, cracks);
    vec3 stone = mix(vec3(0.024, 0.015, 0.011), vec3(0.058, 0.040, 0.030), cell);
    // the fire underneath breathes through the cracks
    float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + p.y * 0.25);
    vec3 col = stone + vec3(1.0, 0.26, 0.03) * crackLine * pulse * 0.4 * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    gl_FragColor = vec4(col, 1.0);
  }
`,Ta=`
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
    vec3 col = mix(vec3(0.010, 0.004, 0.004), vec3(0.45, 0.10, 0.02), edge * edge);
    gl_FragColor = vec4(col, a);
  }
`,Sa=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float glow = exp(-vUv.y * 2.2);
    float lick = fbm(vec2(vUv.x * 16.0, vUv.y * 4.0 - uTime * 0.05));
    vec3 col = mix(vec3(0.50, 0.06, 0.01), vec3(1.0, 0.35, 0.06), glow * lick);
    float a = glow * (0.4 + 0.4 * lick) * uForm * 0.85;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`,xt=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSeed;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float core = exp(-x * x * 4.0);
    float streaks = pow(noise(vec2(vUv.x * 9.0 + uSeed * 31.0, vUv.y * 5.0 + uTime * (0.55 + uSeed * 0.2))), 2.0);
    float vf = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    vec3 col = mix(vec3(0.9, 0.20, 0.03), vec3(1.0, 0.65, 0.20), streaks);
    float a = core * (streaks * 1.5 + 0.22) * vf * uForm * 1.25;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.0, a);
  }
`,Fa=`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  varying vec2 vUv;
  
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
`,_a=`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  uniform float uBolt;    // lightning behind him
  uniform vec2  uLook;    // where the pupils point — at YOU
  varying vec2 vUv;
  
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
    col += mix(vec3(0.30, 0.05, 0.015), vec3(0.75, 0.55, 0.65), uBolt) * rim
         * (0.10 + uBolt * 2.6);

    float horns = max(hornArc(p, -1.0), hornArc(p, 1.0));
    col += vec3(0.60, 0.16, 0.03) * horns * (0.08 + smoke * 0.06 + uBolt * 1.6);

    // the eyes: two dim embers, always slightly wrong to look at. They do
    // not glow — they SMOULDER, and they never blink.
    for (int s = -1; s <= 1; s += 2) {
      vec2 c = vec2(0.20 * float(s), 0.04);
      vec2 q = p - c;
      float eye = 1.0 - smoothstep(0.030, 0.085, length(q * vec2(1.0, 1.8)));
      float smoulder = 0.30 + 0.10 * sin(uTime * 0.23 + float(s));
      col += vec3(0.85, 0.16, 0.02) * eye * (smoulder + uBolt * 1.2);
      vec2 pq = q - uLook * 0.035;
      float pupil = 1.0 - smoothstep(0.010, 0.026, length(pq * vec2(1.0, 0.9)));
      col -= vec3(0.8, 0.15, 0.02) * pupil * 1.2 * eye;
    }

    // the maw stays shut. A hairline of heat where a mouth would be — worse.
    float mawLine = p.y + 0.40 + sin(p.x * 14.0) * 0.012;
    float maw = exp(-mawLine * mawLine * 2600.0) * exp(-p.x * p.x * 5.0);
    float breathe = 0.5 + 0.5 * sin(uTime * 0.31);
    col += vec3(0.75, 0.14, 0.02) * maw * (0.12 + breathe * 0.10 + uBolt * 0.9);

    float lum = dot(col, vec3(0.5));
    float a = min(lum, 1.0) * uWatch;
    if (a < 0.005) discard;
    gl_FragColor = vec4(max(col, 0.0) * uWatch, a);
  }
`,Ma=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uRelease;   // 0 hellfire .. 1 white liberation
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // arch opening
    float arch = 1.0 - smoothstep(0.30, 0.44, length(vec2(p.x, max(0.0, p.y + 0.15) * 0.8)));
    // towers either side: dark, spiked
    float towers = step(0.55, abs(p.x)) * step(p.y, 0.35 + rfbm(vec2(p.x * 4.0, 0.0)) * 0.4);
    vec3 fire = mix(vec3(0.9, 0.25, 0.04), vec3(1.0, 0.8, 0.45), fbm(p * 3.0 + uTime * 0.05));
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 glowCol = mix(fire, white, uRelease);
    float flicker = mix(0.7 + 0.3 * fbm(vec2(uTime * 0.4, p.y * 3.0)), 1.0, uRelease);
    vec3 col = glowCol * arch * flicker * (0.7 + uRelease * 1.4);
    col = mix(col, vec3(0.010, 0.005, 0.006), towers);
    float a = max(arch * (0.75 + uRelease * 0.25), towers * 0.92) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;function Ie(s,t,a,l,{blending:d=te,order:F=8,vert:h=Qe,side:T=bt}={}){const u=new W({vertexShader:h,fragmentShader:a.replace("__NOISE__",$e),uniforms:l,transparent:!0,depthWrite:!1,blending:d,side:T}),p=new Z(new je(s,t),u);return p.frustumCulled=!1,p.renderOrder=F,p}function Aa(s){const t=new Ke;t.visible=!1,s.add(t);const a=[],l=[],d=new Et(4398861,2.4);t.add(d);const F=[];for(let i=0;i<4;i++){const v=new vt(16734744,34,44,1.7);t.add(v),F.push(v)}const h={uTime:{value:0},uFire:{value:1}};a.push(h),l.push(h);const T=new Z(new Ct(3.6,.35,170),new W({vertexShader:Qe,fragmentShader:ba.replace("__NOISE__",$e),uniforms:h}));T.position.set(0,-.18,-70),t.add(T);const u=new Ee(.055,.075,.95,7),p=new qe({color:1511436,roughness:.9}),_=new tt(u,p,68),A=new at;let P=0;for(let i=4;i>=-148;i-=4.5)for(const v of[-1.9,1.9]){if(P>=68)break;A.makeTranslation(v,.45,i),_.setMatrixAt(P++,A)}_.instanceMatrix.needsUpdate=!0,t.add(_);for(const[i,v,y,E]of[[210,90,.75,3],[330,150,.9,2]]){const r={uForm:{value:1},uTall:{value:y}},g=new Z(new Ee(i,i,v,96,1,!0),new W({vertexShader:Qe,fragmentShader:Ta,uniforms:r,transparent:!0,depthWrite:!1,side:Se}));g.position.y=v*.32,g.renderOrder=E,g.frustumCulled=!1,t.add(g)}const C={uTime:{value:0},uForm:{value:1}};a.push(C),l.push(C);const b=new Z(new Ee(360,360,200,96,1,!0),new W({vertexShader:Qe,fragmentShader:Sa.replace("__NOISE__",$e),uniforms:C,transparent:!0,depthWrite:!1,depthTest:!1,blending:te,side:Se}));b.position.y=30,b.renderOrder=1,b.frustumCulled=!1,t.add(b);{const i=new Rt(1,1,7,3,!0);i.translate(0,.5,0);const v=new W({vertexShader:`
        attribute float aGlow;
        varying vec3 vPos;
        varying float vGlow;
        void main() {
          vPos = position;
          vGlow = 1.0;
          #ifdef USE_INSTANCING
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          #endif
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec3 vPos;
        __NOISE__
        void main() {
          // dark volcanic rock with molten veins climbing from the base
          float ang = atan(vPos.z, vPos.x);
          vec2 q = vec2(ang * 2.2, vPos.y * 5.0);
          float veins = rfbm(q);
          float vein = smoothstep(0.60, 0.90, veins) * (1.0 - smoothstep(0.30, 1.0, vPos.y));
          float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + ang * 3.0);
          vec3 rock = mix(vec3(0.030, 0.014, 0.012), vec3(0.09, 0.045, 0.032), fbm(q * 1.7));
          vec3 col = rock + vec3(1.0, 0.30, 0.03) * vein * pulse * uFire * 1.5;
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",$e),uniforms:{uTime:{value:0},uFire:{value:1}}});a.push(v.uniforms),l.push(v.uniforms);const y=46,E=new tt(i,v,y),r=new at;let g=99;const w=()=>(g=g*1664525+1013904223>>>0,g/4294967296);for(let U=0;U<y;U++){const L=(U%2===0?-1:1)*(9+w()*55),B=15-w()*195,ee=7+w()*22,Y=1.4+w()*3.2;r.compose(new D(L,-1,B),new dt().setFromEuler(new mt((w()-.5)*.22,w()*6.28,(w()-.5)*.22)),new D(Y,ee,Y)),E.setMatrixAt(U,r)}E.instanceMatrix.needsUpdate=!0,E.frustumCulled=!1,t.add(E)}{const i=new Pt({color:1182214});for(const v of[-1.9,1.9]){const y=[];for(let r=4;r>=-148;r-=4.5){const g=r-4.5;for(let w=0;w<=6;w++){const U=w/6;y.push(new D(v,.88-Math.sin(U*Math.PI)*.22,r+(g-r)*U))}}const E=new Ot(new Ce().setFromPoints(y),i);E.frustumCulled=!1,t.add(E)}}const k=[];for(let i=0;i<18;i++){const v={uTime:{value:0},uForm:{value:1},uSeed:{value:i/18}};a.push(v),l.push(v);const y=Ie(8+i%3*3,170+i%4*30,xt,v,{order:4}),E=i/18*Math.PI*2+.4,r=95+i%4*48;y.position.set(Math.cos(E)*r,55,Math.sin(E)*r-40),y.rotation.y=-E+Math.PI/2,t.add(y),k.push(y)}const G={uTime:{value:0},uWatch:{value:0}},c={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new it(0,0)}};a.push(G,c);const O=Ie(150,110,Fa,G,{blending:De,order:5});O.position.set(0,78,-235),t.add(O);const z=Ie(150,110,_a,c,{order:6});z.position.set(0,78,-234),t.add(z);const H={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};a.push(H);const K=Ie(14,68,xt,H,{order:5});K.position.set(0,26,-232),t.add(K);const ae={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};a.push(ae);const re=Ie(34,40,Ma,ae,{blending:De,order:5});re.position.set(0,14,-168),t.add(re),new ut().setMeshoptDecoder(ft).load("assets/models/gate.glb",i=>{let v=null;if(i.scene.traverse(L=>{L.isMesh&&!v&&(v=L)}),!v)return;const y=v.geometry;y.computeBoundingBox();const E=y.boundingBox,r=new D;E.getSize(r);const g=46/r.x,w=v.material&&v.material.map?new qe({map:v.material.map,roughness:.9,color:7034440}):new qe({color:2102288,roughness:.92}),U=new Z(y,w);U.scale.setScalar(g),U.position.set(0,-E.min.y*g-.4,-166),U.frustumCulled=!1,t.add(U);const I=new vt(16730640,55,90,1.8);I.position.set(0,16,-158),t.add(I),F.push(I)});const V=[];for(let i=0;i<14;i++){const v=i%2===0?-1:1,y=-6-i*10.5-i%3*1.5;V.push(new D(v*(5.3+i%3*.9),0,y))}const oe=[],M=[],ie=[],ne=new ut().setMeshoptDecoder(ft);ne.load("assets/models/cauldron.glb",i=>{let v=null;if(i.scene.traverse(B=>{B.isMesh&&!v&&(v=B)}),!v)return;const y=v.geometry;y.computeBoundingBox();const E=y.boundingBox,r=new D;E.getSize(r);const g=3.1/Math.max(r.x,r.z),w=new qe({color:2299922,roughness:.93,metalness:.25}),U=new tt(y,w,V.length),I=new at;V.forEach((B,ee)=>{I.compose(new D(B.x,-E.min.y*g-.15,B.z),new dt().setFromEuler(new mt(0,ee*1.7%6.28,0)),new D(g,g,g)),U.setMatrixAt(ee,I)}),U.instanceMatrix.needsUpdate=!0,U.frustumCulled=!1,t.add(U);const L=r.y*g;V.forEach((B,ee)=>{const Y={uTime:{value:0},uFire:{value:1},uSeed:{value:ee*.37%1}};a.push(Y),l.push(Y);const fe=Ie(3.3,4.3,ya,Y,{order:9,vert:xa});fe.position.set(B.x,L+1.3,B.z),t.add(fe)}),F.forEach((B,ee)=>{const Y=V[ee*3]||V[0];B.position.set(Y.x,L+1,Y.z)})}),ne.load("assets/models/figure.glb",i=>{let v=null;if(i.scene.traverse(w=>{w.isMesh&&!v&&(v=w)}),!v)return;const y=v.geometry;y.computeBoundingBox();const E=new D;y.boundingBox.getSize(E);const r=1.75/E.y,g=new qe({color:1182472,roughness:1});for(let w=0;w<V.length;w++){const U=1+w%2;for(let I=0;I<U;I++){const L=new Z(y,g),B=V[w];L.scale.setScalar(r*(.9+I*.13)),L.position.set(B.x+(I?.45:-.3),.55,B.z+(I?-.2:.25)),L.rotation.y=(w*2.1+I*2.8)%6.28,L.frustumCulled=!1,t.add(L),oe.push({mesh:L,seed:w*1.3+I*7.7,baseY:L.position.y})}}for(let w=0;w<6;w++){const U=new Z(y,g);U.scale.setScalar(r*2.2),U.frustumCulled=!1,t.add(U),M.push({mesh:U,col:k[w*3],seed:w*3.3})}for(let w=0;w<8;w++){const U=new Z(y,g);U.scale.setScalar(r*(1.3+w%3*.3)),U.frustumCulled=!1,t.add(U);const I=w/8*Math.PI*2+1.1,L=26+w%4*11;ie.push({mesh:U,x:Math.cos(I)*L,z:Math.sin(I)*L-55,seed:w*5.1,speed:.1+w%3*.03})}});const X=new D;return{group:t,set reveal(i){t.visible=i>.002},set watch(i){G.uWatch.value=i,c.uWatch.value=i,H.uForm.value=i*.45*(1-ae.uRelease.value)},set bolt(i){c.uBolt.value=i},set release(i){for(const y of l)y.uFire&&(y.uFire.value=1-i);for(const y of l)y.uForm&&(y.uForm.value=1-i*.85);ae.uRelease.value=i;const v=1-i*.9;d.intensity=1.6*v+i*2.2,d.color.setRGB(.19+i*.7,.09+i*.75,.04+i*.8);for(const y of F)y.intensity=20*v},update(i,v){for(const r of a)r.uTime&&(r.uTime.value=i);v.getWorldPosition(X);const y=We.clamp((X.x-0)/60,-1,1),E=We.clamp((X.y-40)/90,-1,.4);c.uLook.value.set(y,E);for(const r of oe){const g=Math.sin(i*.9+r.seed);r.mesh.rotation.z=g*.14,r.mesh.rotation.x=Math.sin(i*.6+r.seed*1.7)*.1,r.mesh.position.y=r.baseY+Math.sin(i*.5+r.seed)*.1}for(const r of ie){const g=(i*r.speed+r.seed)%1;r.mesh.position.set(r.x,70-g*95,r.z),r.mesh.rotation.set(i*.9+r.seed,r.seed,i*.6)}for(const r of M){const g=(i*.14+r.seed)%1;r.mesh.position.copy(r.col.position),r.mesh.position.y=140-g*170,r.mesh.rotation.set(i*.8+r.seed,i*.5,i*.7+r.seed)}for(let r=0;r<F.length;r++){const g=F[r];g.intensity>.2&&(g.intensity=g.intensity*.92+(16+Math.sin(i*7+r*2.3)*3+Math.sin(i*13.7+r)*2)*.08)}}}}const me={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},J=116,N={start:J,url:"assets/audio/journey_02.mp3",starsOut:[J+5,J+17],palette:[J+6,J+21],full:[J+6,J+23],curtains:[J+10,J+26],core:[J+18.5,J+24.5],field:[J+20,J+28],breathIn:[J+28.9,J+33.3],breathOut:[J+33.6,J+38.5],loopFrom:J+66,loopPeriod:11.5,loopAmp:.62},ze=J+63.5,Q=ze+11,S={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:Q,portal:[ze,ze+2.5],tunnel:[ze+2.3,ze+9.6],arrive:ze+9.6,collide:[Q+.2,Q+6.6],blast:Q+6.85,remnant:[Q+7.2,Q+16],world:[Q+9,Q+16.5],drumFrom:Q+23.5,form:[Q+32.2,Q+47.5],flare:[Q+48.4,Q+51],open:[Q+60.8,Q+65.5],suck:[Q+64.5,Q+70.5],black:[Q+69.5,Q+71.5]},ce=Q+73,ue={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:ce+2,reveal:[ce,ce+4.5],walk:[ce+3,ce+62],watch:[ce+24.4,ce+30.5],mantra:ce+57.2,release:[ce+57.2,ce+61.5],white:[ce+59.5,ce+64.5],end:ce+68},Ua="assets/audio/journey_01.mp3",Le=4,ka=[82.5,88.5],yt=(s,t,a)=>s+(t-s)*a,m=(s,[t,a])=>We.clamp((s-t)/(a-t),0,1),x=s=>s*s*(3-2*s);function we(s,t){const a=document.getElementById("status");a&&(a.textContent=s);const l=document.getElementById("substatus");l&&t!==void 0&&(l.textContent=t)}function Ea(s,t){const a=s.createGain();a.gain.value=0,a.connect(t);const l=s.createBiquadFilter();l.type="lowpass",l.frequency.value=220,l.Q.value=.6,l.connect(a);for(const[d,F]of[[38,.55],[57,.28],[76.4,.18]]){const h=s.createOscillator();h.type="sine",h.frequency.value=d;const T=s.createGain();T.gain.value=F,h.connect(T).connect(l),h.start()}return{set level(d){a.gain.setTargetAtTime(d*.09,s.currentTime,.25)}}}async function Ca(){we("Preparing…","starting the engine");const s=document.getElementById("view"),t=new Gt({canvas:s,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=It,t.toneMapping=Lt,t.toneMappingExposure=1.15;const a=new zt;a.background=null;const l=new Vt(70,window.innerWidth/window.innerHeight,.05,900);l.position.set(0,1.35,0);const d=new Ke;d.add(l),a.add(d),we("Preparing…","building the sky");const F=Nt(a),h=Wt(a),T=ht(h.group,{radius:460,scale:.85,gain:.7,order:-2}),u=ht(h.group,{radius:300,scale:1.9,gain:1,order:-1}),p=Yt(h.group),_=Kt(a),A=Xt(a),P=na(a);we("Preparing…","building the worlds");const C=wa(a),b=Aa(a);window.addEventListener("resize",()=>{l.aspect=window.innerWidth/window.innerHeight,l.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const k=new Audio;k.src=Ua,k.preload="auto",k.crossOrigin="anonymous";let G=!1;k.addEventListener("canplaythrough",()=>{G=!0},{once:!0}),k.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),G=!0},{once:!0});let c=null,O=null,z=null,H=null,K=null;function ae(){if(!c)try{c=new(window.AudioContext||window.webkitAudioContext);const e=c.createGain();e.gain.value=1,e.connect(c.destination);const n=c.createMediaElementSource(k);z=c.createGain(),z.gain.value=1,n.connect(z).connect(e),A.attachAnalyser(c,z),O=Ea(c,e);const f=c.sampleRate*2,R=c.createBuffer(1,f,c.sampleRate),$=R.getChannelData(0);for(let Me=0;Me<f;Me++)$[Me]=Math.random()*2-1;const le=c.createBufferSource();le.buffer=R,le.loop=!0;const se=c.createBiquadFilter();se.type="bandpass",se.frequency.value=320,se.Q.value=.7,H=c.createGain(),H.gain.value=0,le.connect(se).connect(H).connect(e),le.start(),K=Me=>{const ye=c.currentTime;for(const[ve,Be,Je]of[[0,58,.5],[.19,46,.34]]){const Ae=c.createOscillator();Ae.type="sine",Ae.frequency.setValueAtTime(Be*1.6,ye+ve),Ae.frequency.exponentialRampToValueAtTime(Be,ye+ve+.06);const be=c.createGain();be.gain.setValueAtTime(0,ye+ve),be.gain.linearRampToValueAtTime(Je*Me*.4,ye+ve+.012),be.gain.exponentialRampToValueAtTime(1e-4,ye+ve+.3),Ae.connect(be).connect(e),Ae.start(ye+ve),Ae.stop(ye+ve+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let re=null,V=null,oe=!1,M=null,ie=null,ne=!1,X=null,i=null,v=!1;async function y(){try{const n=await(await fetch(N.url)).arrayBuffer();c&&(re=await c.decodeAudioData(n))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const n=await(await fetch(S.voiceUrl)).arrayBuffer();c&&(M=await c.decodeAudioData(n))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const n=await(await fetch(ue.voiceUrl)).arrayBuffer();c&&(X=await c.decodeAudioData(n))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let E=!1,r=0;k.addEventListener("loadedmetadata",()=>{isFinite(k.duration)&&k.duration});let g=null,w=-Le,U=0;function I(){if(!E)return-Le;if(i!==null&&!v&&c){const e=ue.voiceAt+(c.currentTime-i);return r=performance.now()/1e3-e,e}if(ie!==null&&!ne&&c){const e=S.voiceAt+(c.currentTime-ie);return r=performance.now()/1e3-e,e}if(V!==null&&!oe&&c){const e=N.start+(c.currentTime-V);return r=performance.now()/1e3-e,e}return!k.ended&&k.currentTime>.01?(r=performance.now()/1e3-k.currentTime,k.currentTime):performance.now()/1e3-r}function L(){if(g!==null)return g;const e=I(),n=performance.now()/1e3,f=Math.min(.1,Math.max(5e-4,n-U));U=n;const R=e-w;return Math.abs(R)>2.5?w=e:w+=R*Math.min(1,f*(Math.abs(R)>.05?3:60)),w}let B="flat";async function ee(){if(!navigator.xr)return null;const e=n=>Promise.race([n.catch(()=>!1),new Promise(f=>setTimeout(()=>f(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function Y(){ae(),c&&c.state==="suspended"&&await c.resume(),y();const e=await ee();if(e){const n={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const f=await navigator.xr.requestSession(e,n);await t.xr.setSession(f),B=e,f.addEventListener("end",()=>{B="flat"})}catch(f){console.warn("[journey] could not start",e,f)}}document.body.classList.add("started"),E=!0,r=performance.now()/1e3+Le,setTimeout(()=>{k.play().catch(n=>console.warn("[journey] autoplay blocked",n))},Le*1e3)}let fe=null;function ge(e){if(fe)return fe;let n=x(m(e,[N.breathIn[0],N.breathIn[0]+1.6]))*(1-x(m(e,[N.breathIn[1],N.breathIn[1]+1]))),f=x(m(e,[N.breathOut[0],N.breathOut[0]+.25]))*(1-x(m(e,[N.breathOut[0]+.55,N.breathOut[0]+1.2])));if(e>N.loopFrom&&e<S.collide[0]){const R=(e-N.loopFrom)%N.loopPeriod,$=N.loopAmp,le=$*x(m(R,[0,1.8]))*(1-x(m(R,[4.4,5.6]))),se=$*x(m(R,[6,6.3]))*(1-x(m(R,[6.7,7.4])));n=Math.max(n,le),f=Math.max(f,se)}return[n,f]}const Fe=new D;let Ue=-Le,_e=0,Re=0,ke=-1,xe=0;t.setAnimationLoop(()=>{const e=L(),n=We.clamp(e-Ue,.001,.1);Ue=e;const f=t.getContext(),R=Math.max(.5,f.drawingBufferHeight/900),$=t.xr.isPresenting?t.xr.getCamera():l;if(E&&V===null&&re&&c&&e>=N.start&&g===null){const q=c.createBufferSource();q.buffer=re,q.connect(z),q.onended=()=>{oe=!0},q.start(),V=c.currentTime}if(E&&ie===null&&M&&c&&e>=S.voiceAt&&g===null){const q=c.createBufferSource();q.buffer=M,q.connect(z),q.onended=()=>{ne=!0},q.start(),ie=c.currentTime}if(E&&i===null&&X&&c&&e>=ue.voiceAt&&g===null){const q=c.createBufferSource();q.buffer=X,q.connect(z),q.onended=()=>{v=!0},q.start(),i=c.currentTime}const[le,se]=ge(e);x(m(e,S.portal))*(1-x(m(e,[S.tunnel[0]+1,S.tunnel[0]+2])));const Me=x(m(e,[S.tunnel[0],S.tunnel[0]+1.6]))*(1-x(m(e,[S.tunnel[1]-1.4,S.tunnel[1]]))),ye=x(m(e,[S.tunnel[1]-2.6,S.tunnel[1]-.3])),ve=x(m(e,S.collide)),Be=x(m(e,[S.blast,S.blast+.25]))*(1-x(m(e,[S.blast+.5,S.blast+1.6]))),Je=m(e,[S.blast,S.blast+3.6]),Ae=x(m(e,[S.remnant[0],S.remnant[0]+.8]))*(1-x(m(e,[S.remnant[1]-3,S.remnant[1]]))),be=x(m(e,S.form)),St=x(m(e,S.world)),Ft=x(m(e,[S.flare[0],S.flare[0]+.7]))*(1-x(m(e,[S.flare[1]-.6,S.flare[1]+1.2]))),Ze=x(m(e,S.open)),Te=x(m(e,S.suck)),nt=x(m(e,S.black)),he=x(m(e,[S.tunnel[0]+.5,S.tunnel[0]+4.5])),_t=x(m(e,[S.arrive-.5,S.arrive+3])),pe=x(m(e,ue.reveal)),Mt=x(m(e,ue.walk)),At=x(m(e,ue.watch)),Ne=x(m(e,ue.release)),Oe=x(m(e,ue.white));C.collide=ve,C.ring=Je,C.rush=Me,C.tunnelEnd=ye,C.remnant=Ae;const He=1-pe;C.form=Math.max(St*.34,be)*He,C.flare=Ft*He,C.open=Ze*He,C.suck=Te*He,C.black=Math.max(nt*(1-pe),0),C.flash=Math.max(Be,Oe*.92),C.update(e,R,$),b.reveal=pe,b.watch=At*(1-Ne),b.release=Ne,pe>.5&&Ne<.2&&g===null&&Math.random()<n*.35&&(xe=.7+Math.random()*.5),xe*=Math.exp(-n*6),b.bolt=xe,u.bolt=xe,T.bolt=xe,b.update(e,$);const Ut=yt(0,.55,x(m(e,me.motesIn)))+yt(0,.45,x(m(e,me.motesFull)));_.fade=Ut*(1-x(m(e,[me.dim[0],me.dim[0]+9]))),_.update(e,R),F.opacity=Math.pow(m(e,me.dim),1.6),h.emerge=m(e,me.stars),h.global=1-x(m(e,N.starsOut))+_t*(1-Te)*.85,h.update(e,R);const lt=x(m(e,N.palette)),st=x(m(e,N.full)),Xe=(1-.45*P.breathing)*(1-he)*(1-ve*.8);u.hell=pe*(1-Oe),T.hell=pe*(1-Oe),u.emerge=x(m(e,me.nebula))*(Xe+he*.3*(1-Te))+pe*.28*(1-Oe),u.palette=lt*(1-he*.85),u.full=st*(1-he*.6),u.update(e),T.emerge=x(m(e,me.nebula))*(.9*Xe+he*.45*(1-Te))+pe*.34*(1-Oe),T.palette=lt*(1-he*.85),T.full=st*(1-he*.6),T.update(e*.55),p.emerge=x(m(e,N.curtains))*Xe,p.update(e);const kt=.05+le*.85-se*1;Re+=(kt-Re)*(1-Math.exp(-n*2.2)),_e+=Re*n,u.radial=_e,T.radial=_e*.35,P.core=x(m(e,N.core))*(1-he),P.field=x(m(e,N.field))*(1-he),P.gateIn=le*(1-he),P.gateOut=se*(1-he),P.update(e,n,$,R);const ct=x(m(e,[me.dim[0]+8,me.dim[1]+8]))*(1-Te);if(Fe.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(ct),e<ue.reveal[0]?d.position.copy(Fe):d.position.set(0,0,-Mt*120),d.rotation.z=Math.sin(e*.013)*.03*ct,A.fade=x(m(e,[-Le+.8,-.2]))*(1-x(m(e,ka))),A.update(e,n,$),O)if(e<N.start-4){const q=x(m(e,me.drone)),Ge=1-.45*x(m(e,[90,118]));O.level=q*Ge}else e<S.collide[0]?O.level=.1+.1*le-.04*se:e<ue.reveal[0]?O.level=.1+ve*.16+be*.12+Te*.4-nt*.34:O.level=(.16+pe*.1)*(1-Ne);if(H&&c&&g===null){const q=pe*.3*(1-Ne),Ge=Oe*.24,et=ve*.16+Be*1+Me*.62+Te*.85+q+Ge;H.gain.setTargetAtTime(et*.16,c.currentTime,.12)}if(K&&g===null&&e>S.drumFrom&&e<ue.mantra){let q;if(e<ue.reveal[0])q=1.45-be*.35-Ze*.25-Te*.25;else{const et=Math.floor(e/1.6);q=1.35+Math.sin(et*12.9898)*43758.5453%1*.55}const Ge=Math.floor(e/q);Ge!==ke&&(ke=Ge,K(.55+be*.3+Ze*.45+Te*.6+pe*.25))}t.render(a,l)}),we("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];a.traverse(n=>{e.push([n,n.visible]),n.visible=!0});try{t.compile(a,l)}catch(n){console.warn("[journey] compile",n)}for(const[n,f]of e)n.visible=f}we("Preparing…","checking the headset");const Pe=await ee();Pe==="immersive-ar"?we("Put your headset on and begin.","You will start in your own room."):Pe==="immersive-vr"?we("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):we("Preview in browser","Open this page in the Quest browser for the full experience.");const o=document.getElementById("begin");o.disabled=!1,o.addEventListener("click",async()=>{o.disabled=!0,G||(we("Loading the voice…"),await new Promise(e=>{if(G)return e();const n=setInterval(()=>{G&&(clearInterval(n),e())},100);setTimeout(()=>{clearInterval(n),e()},6e3)})),await Y()}),window.JOURNEY={THREE:Bt,scene:a,camera:l,renderer:t,stars:h,nebula:u,voidShell:F,motes:_,narrator:A,prana:P,sec3:C,naraka:b,T:me,SEG2:N,SEG3:S,SEG4:ue,seek:e=>{g=e},resume:()=>{g=null},look:(e,n=0)=>{l.rotation.set(n,e,0,"YXZ")},moveTo:(e,n,f)=>{d.position.set(0,0,0),l.position.set(e,n,f)},forceBreath:(e,n)=>{fe=e===null?null:[e,n]},fakeLevel:e=>{A.uniforms.uLevel.value=e},dryStart:()=>{E=!0,r=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:L(),xrMode:B,voidOpacity:F.opacity,starEmerge:h.emerge,nebulaEmerge:u.emerge,orbFade:A.fade})},window.__JOURNEY_READY=!0}Ca().catch(s=>{console.error(s),window.__JOURNEY_ERROR=String(s&&s.stack||s),we("Something went wrong.",String(s))});
