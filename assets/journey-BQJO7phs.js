import{G as xt,M as yt}from"./meshopt_decoder.module-CAVseX-1.js";import{$ as st,g as L,o as Oe,M as D,C as lt,p as Qe,a3 as Pe,a as B,A as se,a4 as Le,G as ct,n as Ne,P as Ke,V as Z,N as Ze,c as mt,D as ht,a5 as Pt,a6 as bt,B as zt,b as Be,I as ot,f as rt,Q as St,a7 as Tt,a8 as vt,Y as It,S as Gt,Z as Nt,_ as qt,x as Bt,a0 as Vt}from"./three-Bq7AKahx.js";function Ct(m){let t=m>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Dt(m){const t=new st(500,24,16),r=new L({side:Oe,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),u=new D(t,r);return u.frustumCulled=!1,u.renderOrder=-10,m.add(u),{mesh:u,set opacity(S){r.uniforms.uOpacity.value=S},get opacity(){return r.uniforms.uOpacity.value}}}const Lt=`
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
`,Wt=`
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
`;function jt(m,{count:t=5200}={}){const r=Ct(20260805),u=new Float32Array(t*3),S=new Float32Array(t),P=new Float32Array(t),F=new Float32Array(t),M=new Float32Array(t*3),p=new lt;for(let k=0;k<t;k++){let I=r()*2-1;const W=r()*Math.PI*2;r()<.42&&(I*=.3);const q=Math.sqrt(Math.max(0,1-I*I)),j=90+r()*320;u[k*3]=Math.cos(W)*q*j,u[k*3+1]=I*j,u[k*3+2]=Math.sin(W)*q*j;const $=Math.pow(r(),2.4);P[k]=.85+$*4.2,S[k]=Qe.clamp(.86-$*.9+(r()-.5)*.22,0,.9),F[k]=r()*100;const oe=r();oe>.86?p.setHSL(.07+r()*.04,.55,.72):oe>.66?p.setHSL(.12+r()*.03,.22,.85):p.setHSL(.58+r()*.06,.28+r()*.3,.88),M[k*3]=p.r,M[k*3+1]=p.g,M[k*3+2]=p.b}const y=new Pe;y.setAttribute("position",new B(u,3)),y.setAttribute("aDelay",new B(S,1)),y.setAttribute("aSize",new B(P,1)),y.setAttribute("aSeed",new B(F,1)),y.setAttribute("aTint",new B(M,3));const O={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},z=new L({vertexShader:Lt,fragmentShader:Wt,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}),V=new Le(y,z);V.frustumCulled=!1,V.renderOrder=5;const N=new ct;return N.add(V),m.add(N),{group:N,uniforms:O,set emerge(k){O.uEmerge.value=k},get emerge(){return O.uEmerge.value},set global(k){O.uGlobal.value=k},update(k,I){O.uTime.value=k,O.uPixel.value=I,N.rotation.y=k*.0042,N.rotation.x=Math.sin(k*.017)*.014}}}const Yt=`
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
`;function Ft(m,{radius:t=430,scale:r=2.1,gain:u=1,order:S=4}={}){const P=new st(t,48,32),F={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:r},uGain:{value:u},uHell:{value:0},uBolt:{value:0}},M=new L({side:Oe,transparent:!0,depthWrite:!1,depthTest:!0,blending:se,uniforms:F,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Yt}),p=new D(P,M);return p.frustumCulled=!1,p.renderOrder=S,m.add(p),{mesh:p,set emerge(y){F.uEmerge.value=y},get emerge(){return F.uEmerge.value},set palette(y){F.uPalette.value=y},set full(y){F.uFull.value=y},set radial(y){F.uRadial.value=y},set hell(y){F.uHell.value=y},set bolt(y){F.uBolt.value=y},update(y){F.uTime.value=y}}}const Ht=`
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
`;function $t(m){const t=new Ne(150,150,240,64,1,!0),r={uTime:{value:0},uEmerge:{value:0}},u=new L({side:Oe,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,uniforms:r,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ht}),S=new D(t,u);return S.frustumCulled=!1,S.renderOrder=5,m.add(S),{mesh:S,set emerge(P){r.uEmerge.value=P},update(P){r.uTime.value=P,S.rotation.y=P*.006}}}const Qt=`
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
`,Kt=`
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
`;function Xt(m,{count:t=260,radius:r=3}={}){const u=Ct(77003),S=new Float32Array(t*3),P=new Float32Array(t),F=new Float32Array(t);for(let z=0;z<t;z++)S[z*3]=(u()-.5)*r*2.2,S[z*3+1]=.25+u()*2.3,S[z*3+2]=(u()-.5)*r*2.2,P[z]=u(),F[z]=.5+u()*1.4;const M=new Pe;M.setAttribute("position",new B(S,3)),M.setAttribute("aSeed",new B(P,1)),M.setAttribute("aSize",new B(F,1));const p={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},y=new L({vertexShader:Qt,fragmentShader:Kt,uniforms:p,transparent:!0,depthWrite:!1,blending:se}),O=new Le(M,y);return O.frustumCulled=!1,O.renderOrder=3,m.add(O),{points:O,set fade(z){p.uFade.value=z},get fade(){return p.uFade.value},update(z,V){p.uTime.value=z,p.uPixel.value=V}}}const Zt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Jt=`
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
`;function ea(m){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},r=new L({vertexShader:Zt,fragmentShader:Jt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}),u=new D(new Ke(.44,.44),r);u.frustumCulled=!1,u.renderOrder=30,m.add(u);let S=null,P=null,F=0;const M=new Z(0,1.35,-1.7),p=new Z,y=new Z(0,1.35,-1.7);return u.position.copy(y),{mesh:u,uniforms:t,attachAnalyser(O,z){S=O.createAnalyser(),S.fftSize=512,S.smoothingTimeConstant=.55,P=new Uint8Array(S.frequencyBinCount),z.connect(S)},set fade(O){t.uFade.value=O},get fade(){return t.uFade.value},update(O,z,V){t.uTime.value=O,V.getWorldDirection(p),V.getWorldPosition(M),M.addScaledVector(p,1.7);const N=1-Math.exp(-z*5.5);y.lerp(M,N),u.position.set(y.x,y.y+Math.sin(O*.9)*.008,y.z);let k=0;if(S){S.getByteFrequencyData(P);const W=Math.max(8,P.length*.45|0);let f=0;for(let q=2;q<W;q++)f+=P[q];k=Math.min(1,f/(W-2)/132)}const I=k>F?1-Math.exp(-z*22):1-Math.exp(-z*3.2);F+=(k-F)*I,t.uLevel.value=F}}}function ta(m){let t=m>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const aa=`
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
`,oa=`
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
`,ra=`
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
`,na=`
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
`,_t=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function la(m){const t=ta(90210),r=850,u=new Float32Array(r),S=new Float32Array(r*3),P=new Float32Array(r),F=new Float32Array(r),M=new Z(0,.05,-1).normalize(),p=new Z;for(let R=0;R<r;R++){u[R]=t();do p.set(t()*2-1,t()*2-1,t()*2-1);while(p.lengthSq()>1||p.lengthSq()<.05);p.normalize(),t()<.25&&p.lerp(M,.6).normalize(),S[R*3]=p.x,S[R*3+1]=p.y,S[R*3+2]=p.z,P[R]=2.2+Math.pow(t(),.7)*5.8,F[R]=1.8+t()*3.4}const y=new Pe;y.setAttribute("position",new B(new Float32Array(r*3),3)),y.setAttribute("aSeed",new B(u,1)),y.setAttribute("aDir",new B(S,3)),y.setAttribute("aRad",new B(P,1)),y.setAttribute("aSize",new B(F,1));const O={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new Z(0,1.3,-.3)}},z=new Le(y,new L({vertexShader:aa,fragmentShader:oa,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));z.frustumCulled=!1,z.renderOrder=24,m.add(z);const V=700,N=new Float32Array(V),k=new Float32Array(V*3);for(let R=0;R<V;R++){N[R]=t();do p.set(t()*2-1,t()*2-1,t()*2-1);while(p.lengthSq()>1||p.lengthSq()<.05);p.normalize(),k[R*3]=p.x,k[R*3+1]=p.y,k[R*3+2]=p.z}const I=new Pe;I.setAttribute("position",new B(new Float32Array(V*3),3)),I.setAttribute("aSeed",new B(N,1)),I.setAttribute("aDir",new B(k,3));const W={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new Z(0,1.3,-.3)},uFwd:{value:new Z(0,0,-1)}},f=new Le(I,new L({vertexShader:ra,fragmentShader:ia,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));f.frustumCulled=!1,f.renderOrder=25,m.add(f);const q={uTime:{value:0},uCore:{value:0},uIn:{value:0}},j=new D(new Ke(16,16),new L({vertexShader:_t,fragmentShader:na,uniforms:q,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));j.position.set(0,2.5,-14),j.frustumCulled=!1,j.renderOrder=6,m.add(j);const $={uTime:{value:0},uCore:{value:0}},oe=new D(new Ke(5,90),new L({vertexShader:_t,fragmentShader:`
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
      `,uniforms:$,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));oe.position.set(0,2.5,-14.2),oe.frustumCulled=!1,oe.renderOrder=5,m.add(oe);const fe=new Z,ve=new Z;let re=0,ce=0;return{get breathing(){return Math.max(re,ce)},set core(R){q.uCore.value=R,$.uCore.value=R},set field(R){O.uField.value=R},gateIn:0,gateOut:0,update(R,me,de,ee){const Ce=1-Math.exp(-me*(this.gateIn>re?3.2:1.8));re+=(this.gateIn-re)*Ce;const Q=1-Math.exp(-me*(this.gateOut>ce?9:4));ce+=(this.gateOut-ce)*Q,de.getWorldPosition(fe),de.getWorldDirection(ve),fe.addScaledVector(ve,.12),fe.y-=.05,O.uTime.value=R,O.uPixel.value=ee,O.uIn.value=re,O.uNose.value.copy(fe),W.uTime.value=R,W.uPixel.value=ee,W.uOut.value=ce,W.uNose.value.copy(fe),W.uFwd.value.copy(ve),q.uTime.value=R,q.uIn.value=re,$.uTime.value=R}}}const sa=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,it=`
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
`,ca=`
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
`,ua=`
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
`,fa=`
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
`,va=`
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
`,Mt=`
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
`,At=`
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
`,da=`
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
`,ma=`
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
`,ha=`
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
`,pa=`
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
`,ga=`
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
`,wa=`
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
`;function Fe(m,t,r,u,{blending:S=se,order:P=8}={}){const F=new L({vertexShader:sa,fragmentShader:r,uniforms:u,transparent:!0,depthWrite:!1,depthTest:!1,blending:S,side:ht}),M=new D(new Ke(m,t),F);return M.frustumCulled=!1,M.renderOrder=P,M}function xa(m){const t=new ct;m.add(t);const r={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},u=ca,S=ua.replace("__COMMON__",u).replace("__NOISE__",it),P=fa.replace("__COMMON__",u).replace("__NOISE__",it),F=340,M=285,p=-190,y=62,O=Fe(F,M,S,r,{blending:Ze,order:7});O.position.set(0,y,p),t.add(O);const z=Fe(F,M,P,r,{order:8});z.position.set(0,y,p),t.add(z);const V=new Z(0,y+.38*(M/2),p),N=Fe(34,34,va,{uTime:r.uTime,uForm:{value:0}},{order:8});N.position.set(95,130,-180),t.add(N);const k=Fe(70,70,Mt,{uTime:r.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});k.position.set(-150,45,-175),t.add(k);const I=Fe(44,44,Mt,{uTime:r.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});I.position.set(150,20,-165),t.add(I);const W={uForm:{value:0}},f=new D(new Ne(90,90,34,96,1,!0),new L({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ha,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:Ze,side:Oe}));f.position.y=-14,f.renderOrder=9,f.frustumCulled=!1,t.add(f);const q={uTime:r.uTime,uForm:{value:0}},j=new D(new Ne(110,110,60,96,1,!0),new L({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:pa,uniforms:q,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Oe}));j.position.y=-12,j.renderOrder=6,j.frustumCulled=!1,t.add(j);const $=420,oe=new Float32Array($*3),fe=new Float32Array($);for(let a=0;a<$;a++){const U=Math.random()*Math.PI*2,d=40+Math.random()*55;oe[a*3]=Math.cos(U)*d,oe[a*3+1]=-20+Math.random()*30,oe[a*3+2]=Math.sin(U)*d,fe[a]=Math.random()}const ve=new Pe;ve.setAttribute("position",new B(oe,3)),ve.setAttribute("aSeed",new B(fe,1));const re={uTime:r.uTime,uForm:{value:0},uPixel:{value:1}},ce=new Le(ve,new L({vertexShader:`
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
    `,uniforms:re,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));ce.frustumCulled=!1,ce.renderOrder=9,t.add(ce);const R={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new mt(1,-.1)},uSpin:{value:.05},uTint:{value:new lt(.45,.62,1)}},me={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new mt(-1,.12)},uSpin:{value:-.065},uTint:{value:new lt(1,.58,.22)}},de=Fe(175,175,At,R,{order:22}),ee=Fe(150,150,At,me,{order:22});de.position.set(-62,20,-120),ee.position.set(62,32,-125),m.add(de),m.add(ee),de.visible=ee.visible=!1;const Ce=(a,U)=>{const d={uTime:{value:0},uShow:{value:0}},e=Fe(430,330,`
      precision highp float;
      uniform float uTime;
      uniform float uShow;
      varying vec2 vUv;
      ${it}
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float n = fbm(vUv * 2.6 + uTime * 0.01);
        float body = exp(-r * r * 2.2) * (0.35 + 0.65 * n);
        float a = body * uShow * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(${a}) * a * 1.6, a);
      }
    `,d,{order:21});return e.position.set(U,26,-160),m.add(e),e.visible=!1,{u:d,m:e}},Q=Ce("0.30, 0.45, 0.95",-120),pe=Ce("0.95, 0.42, 0.12",120),ze={uTime:{value:0},uWall:{value:0}},Ie=Fe(60,300,`
    precision highp float;
    uniform float uTime;
    uniform float uWall;
    varying vec2 vUv;
    ${it}
    void main() {
      float x = abs(vUv.x);
      float beam = exp(-x * x * 10.0);
      float tear = 0.6 + 0.6 * fbm(vec2(vUv.y * 5.0, uTime * 0.4));
      vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), tear - 0.6);
      float a = beam * tear * uWall;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * a * 2.6, a);
    }
  `,ze,{order:24});Ie.position.set(0,24,-130),m.add(Ie),Ie.visible=!1;const ge={uTime:{value:0},uRing:{value:0}},ue=Fe(420,420,ma,ge,{order:23});ue.position.set(0,24,-138),m.add(ue),ue.visible=!1;const K={uTime:{value:0},uLife:{value:0}},Se=Fe(90,90,da,K,{order:22});Se.position.set(0,24,-138),m.add(Se),Se.visible=!1;const Me={uTime:{value:0},uGrow:{value:0}},i=Fe(7,7,wa,Me,{order:26});i.position.set(0,1.5,-9),m.add(i);const s={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},c=new D(new Ne(3.2,3.2,130,40,1,!0),new L({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ga,uniforms:s,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Oe}));c.rotation.x=Math.PI/2,c.position.set(0,1.5,-20),c.renderOrder=27,c.frustumCulled=!1,m.add(c);const w={uBlack:{value:0},uWhite:{value:0}},o=new D(new st(.6,16,12),new L({vertexShader:`
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
      `,uniforms:w,transparent:!0,depthWrite:!1,depthTest:!1,blending:Ze,side:Oe}));o.renderOrder=50,o.frustumCulled=!1,m.add(o);const h=1400,A=new Float32Array(h*3),C=new Float32Array(h*3),l=new Float32Array(h);{const a=e=>e*(F/2),U=e=>y+e*(M/2),d=[];for(let e=0;e<3;e++)for(let n=0;n<200;n++){const x=(Math.random()*2-1)*.46;d.push([a(x),U(.3+e*.14+x*x*.1),p+2])}for(let e=-1;e<=1;e+=2)for(let n=0;n<130;n++){const x=(Math.random()*2-1)*.14;d.push([a(e*.3+x),U(-.1+.03-x*x*1.6),p+2])}for(let e=0;e<220;e++){const n=Math.random()*Math.PI*2;d.push([a(Math.cos(n)*.062),U(.38+Math.sin(n)*.155),p+2])}for(let e=0;e<160;e++){const n=.3-Math.random()*.75;d.push([a((Math.random()*2-1)*.05),U(n),p+2])}for(;d.length<h;)d.push(d[Math.random()*d.length|0]);for(let e=0;e<h;e++){const n=d[e%d.length],x=Math.random()*Math.PI*2,G=(Math.random()-.35)*1.8,X=260+Math.random()*160;A[e*3]=Math.cos(x)*Math.cos(G)*X,A[e*3+1]=60+Math.sin(G)*X*.7,A[e*3+2]=-80+Math.sin(x)*Math.cos(G)*X*.5-80,C[e*3]=n[0],C[e*3+1]=n[1],C[e*3+2]=n[2],l[e]=Math.random()}}const v=new Pe;v.setAttribute("position",new B(A,3)),v.setAttribute("aEnd",new B(C,3)),v.setAttribute("aSeed",new B(l,1));const g={uTime:{value:0},uForm:r.uForm,uPixel:{value:1}},b=new Le(v,new L({vertexShader:`
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
    `,uniforms:g,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));return b.frustumCulled=!1,b.renderOrder=9,t.add(b),t.visible=!1,{group:t,eyeWorld:V,set collide(a){const U=a>.001&&a<1;de.visible=ee.visible=U,Q.m.visible=pe.m.visible=U,Ie.visible=a>.8&&a<.995,R.uShow.value=me.uShow.value=Math.min(1,a*4),Q.u.uShow.value=pe.u.uShow.value=Math.min(1,a*3)*(1-a*.3),ze.uWall.value=Math.max(0,(a-.8)/.2),R.uTidal.value=me.uTidal.value=Math.pow(a,1.6);const d=62*(1-Math.pow(a,1.7)*.88);de.position.x=-d,ee.position.x=d,ee.position.y=32-Math.pow(a,1.7)*12,Q.m.position.x=-120+Math.pow(a,1.7)*55,pe.m.position.x=120-Math.pow(a,1.7)*55},set flash(a){w.uWhite.value=a},set ring(a){ge.uRing.value=a,ue.visible=a>.002&&a<.999},set remnant(a){K.uLife.value=a,Se.visible=a>.002},set tunnelEnd(a){s.uEnd.value=a},set flare(a){r.uFlare.value=a},set fireSurge(a){q.uForm.value=Math.min(1.6,q.uForm.value*(1+a))},set portal(a){Me.uGrow.value=a,i.visible=a>.002},set rush(a){s.uRush.value=a,c.visible=a>.002},set form(a){r.uForm.value=a,t.visible=a>.001||r.uSuck.value>.001,N.material.uniforms.uForm.value=Math.min(1,a*2.2),k.material.uniforms.uForm.value=Math.min(1,Math.max(0,a*1.8-.15)),I.material.uniforms.uForm.value=Math.min(1,Math.max(0,a*1.8-.25)),W.uForm.value=Math.min(1,a*2.6),q.uForm.value=Math.min(1,Math.max(0,a*2.2-.2)),re.uForm.value=Math.min(1,Math.max(0,a*2-.3))},set open(a){r.uOpen.value=a},set suck(a){r.uSuck.value=a;const U=1+a*a*7;t.scale.setScalar(U),t.position.copy(V).multiplyScalar(1-U)},set black(a){w.uBlack.value=a},update(a,U,d){r.uTime.value=a,Me.uTime.value=a,s.uTime.value=a,R.uTime.value=a,me.uTime.value=a,Q.u.uTime.value=a,pe.u.uTime.value=a,ze.uTime.value=a,ge.uTime.value=a,K.uTime.value=a,g.uTime.value=a,g.uPixel.value=U,re.uPixel.value=U,o.visible!==w.uBlack.value>.003&&(o.visible=w.uBlack.value>.003),d.getWorldPosition(o.position),c.position.x=o.position.x,c.position.y=o.position.y}}}const Ve=`
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
`,dt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,nt=`
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
    // the molten pool the tongues are born from — white-hot at the mouth
    float pool = exp(-yy * 6.0) * max(0.0, 1.0 - abs(p.x) * abs(p.x) * 1.4);
    pool *= 0.80 + 0.20 * sin(uTime * 2.1 + uSeed * 17.0);
    // sparks spat upward off the surface
    float spark = smoothstep(0.86, 0.97,
      noise(vec2(p.x * 7.0 + uSeed * 23.0, yy * 3.0 - uTime * (1.6 + uSeed * 0.4))))
      * (1.0 - yy * 0.6);
    vec3 col = mix(vec3(1.0, 0.25, 0.03), vec3(1.0, 0.75, 0.25), body);
    col = mix(col, vec3(1.0, 0.95, 0.7), pow(body, 3.0));
    col += vec3(1.0, 0.60, 0.16) * pool * 1.5 + vec3(1.0, 0.92, 0.62) * pool * pool * 1.3;
    col += vec3(1.0, 0.55, 0.12) * spark * 1.4;
    float a = (body + pool * 0.95 + spark * 0.6) * uFire * 1.4 * smoothstep(0.0, 0.07, yy);
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
    vec3 stone = mix(vec3(0.014, 0.008, 0.006), vec3(0.040, 0.026, 0.019), cell);
    // the fire underneath breathes through the cracks
    float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + p.y * 0.25);
    vec3 col = stone + vec3(1.0, 0.26, 0.03) * crackLine * pulse * 0.62 * uFire;
    float speck = smoothstep(0.965, 0.995, noise(p * 7.0));
    col += vec3(1.0, 0.45, 0.10) * speck * (0.3 + crackLine) * pulse * uFire * 0.9;
    // the whole slab drinks a little of the furnace light
    col += vec3(0.30, 0.07, 0.02) * (0.20 + 0.16 * pulse) * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);
    // the far end of the causeway is swallowed
    float far = smoothstep(0.30, 1.0, vUv.y);
    col = mix(col, vec3(0.100, 0.023, 0.008), far * 0.88);
    gl_FragColor = vec4(col, 1.0);
  }
`,Sa=`
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
    vec3 col = mix(vec3(0.004, 0.002, 0.002), vec3(0.30, 0.065, 0.014), edge * edge * edge);
    gl_FragColor = vec4(col, a);
  }
`,Ta=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float glow = exp(-vUv.y * 2.2);
    float lick = fbm(vec2(vUv.x * 16.0, vUv.y * 4.0 - uTime * 0.05));
    vec3 col = mix(vec3(0.50, 0.06, 0.01), vec3(1.0, 0.35, 0.06), glow * lick);
    float a = glow * (0.45 + 0.45 * lick) * uForm * 1.0;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`,kt=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSeed;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float fall = uTime * (0.85 + uSeed * 0.35);

    // the column wanders as it falls instead of hanging like a rod
    float sway = (noise(vec2(uSeed * 51.0, vUv.y * 1.6 - fall * 0.25)) - 0.5) * 0.85;
    x -= sway;

    // torn into separate falling masses, with gaps of nothing between them
    float clumps = noise(vec2(uSeed * 13.0, vUv.y * 3.2 - fall));
    float tear = smoothstep(0.30, 0.72, clumps);

    // narrow, hot spine with a ragged edge
    float w = 0.42 + 0.34 * noise(vec2(uSeed * 7.0 + 4.0, vUv.y * 6.0 - fall * 1.4));
    float core = exp(-x * x / (w * w) * 2.6);
    float turb = pow(noise(vec2(x * 3.2 + uSeed * 31.0, vUv.y * 7.0 - fall * 1.7)), 1.7);

    float vf = smoothstep(0.0, 0.10, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    // it dies out toward the ground into smoke
    float burn = mix(0.35, 1.0, smoothstep(0.0, 0.45, vUv.y));

    vec3 col = mix(vec3(0.62, 0.09, 0.01), vec3(1.0, 0.52, 0.12), turb);
    col = mix(col, vec3(1.0, 0.86, 0.52), pow(turb * core, 2.4));
    float a = core * tear * (turb * 1.20 + 0.06) * vf * burn * uForm * 0.72;
    if (a < 0.005) discard;
    gl_FragColor = vec4(col * a * 1.55, a);
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
         * (0.16 + uBolt * 2.6);

    float horns = max(hornArc(p, -1.0), hornArc(p, 1.0));
    col += vec3(0.60, 0.16, 0.03) * horns * (0.13 + smoke * 0.08 + uBolt * 1.6);

    // the eyes: two dim embers, always slightly wrong to look at. They do
    // not glow — they SMOULDER, and they never blink.
    for (int s = -1; s <= 1; s += 2) {
      vec2 c = vec2(0.20 * float(s), 0.04);
      vec2 q = p - c;
      float eye = 1.0 - smoothstep(0.030, 0.085, length(q * vec2(1.0, 1.8)));
      float smoulder = 0.40 + 0.12 * sin(uTime * 0.23 + float(s));
      col += vec3(0.85, 0.16, 0.02) * eye * (smoulder + uBolt * 1.2);
      vec2 pq = q - uLook * 0.035;
      float pupil = 1.0 - smoothstep(0.010, 0.026, length(pq * vec2(1.0, 0.9)));
      col -= vec3(0.8, 0.15, 0.02) * pupil * 1.2 * eye;
    }

    // the maw stays shut. A hairline of heat where a mouth would be — worse.
    float mawLine = p.y + 0.40 + sin(p.x * 14.0) * 0.012;
    float maw = exp(-mawLine * mawLine * 2600.0) * exp(-p.x * p.x * 5.0);
    float breathe = 0.5 + 0.5 * sin(uTime * 0.31);
    col += vec3(0.75, 0.14, 0.02) * maw * (0.16 + breathe * 0.12 + uBolt * 0.9);

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
    vec3 fire = mix(vec3(0.95, 0.20, 0.02), vec3(1.0, 0.62, 0.14), fbm(p * 3.0 + uTime * 0.05));
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 glowCol = mix(fire, white, uRelease);
    float flicker = mix(0.7 + 0.3 * fbm(vec2(uTime * 0.4, p.y * 3.0)), 1.0, uRelease);
    vec3 col = glowCol * arch * flicker * (1.15 + uRelease * 1.10);
    col = mix(col, vec3(0.010, 0.005, 0.006), towers);
    float a = max(arch * (0.60 + uRelease * 0.40), towers * 0.92) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;function Ge(m,t,r,u,{blending:S=se,order:P=8,vert:F=nt,side:M=ht}={}){const p=new L({vertexShader:F,fragmentShader:r.replace("__NOISE__",Ve),uniforms:u,transparent:!0,depthWrite:!1,blending:S,side:M}),y=new D(new Ke(m,t),p);return y.frustumCulled=!1,y.renderOrder=P,y}function Aa(m){const t=new ct;t.visible=!1,m.add(t);const r=[],u=[],S={uTime:{value:0},uForm:{value:0},uBolt:{value:0},uDie:{value:0}},P=new D(new st(380,40,24),new L({side:Oe,transparent:!0,depthWrite:!1,uniforms:S,vertexShader:`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uForm;
        uniform float uBolt;
        uniform float uDie;
        varying vec3 vDir;
        __NOISE__
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          // churning smoke, two layers shearing against each other
          vec2 q = d.xz / (abs(h) + 0.35);
          float sm1 = fbm(q * 1.6 + uTime * 0.010);
          float sm2 = fbm(q * 3.1 - uTime * 0.014 + 7.0);
          float churn = sm1 * 0.65 + sm2 * 0.35;

          // the land lights the smoke from below; overhead it starves to black
          float under = exp(-max(h, 0.0) * 3.2);
          float horizon = exp(-abs(h) * 6.0);

          vec3 deep = vec3(0.010, 0.003, 0.002);
          vec3 brown = vec3(0.13, 0.036, 0.012);
          vec3 hot = vec3(0.55, 0.13, 0.03);
          vec3 col = mix(deep, brown, under * (0.25 + 0.75 * churn * churn));
          col = mix(col, hot, horizon * (0.5 + 0.5 * churn));
          // the furnace beyond the gate: the sky burns hardest dead ahead
          float toGate = smoothstep(0.15, 0.95, -d.z);
          col += hot * toGate * horizon * (0.45 + 0.55 * churn) * 0.55;
          // lightning inside the churn
          col += vec3(0.85, 0.55, 0.55) * uBolt * churn * under * 1.4;
          // the mantra starves the fire out of the sky
          col *= (1.0 - uDie * 0.9);
          gl_FragColor = vec4(col, uForm);
        }
      `.replace("__NOISE__",Ve)}));P.renderOrder=-5,P.frustumCulled=!1,t.add(P);const F={uTime:{value:0},uFire:{value:1}};r.push(F),u.push(F);const M=new D(new Ke(760,760,1,1),new L({uniforms:F,vertexShader:`
        varying vec2 vW;
        void main() {
          vW = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec2 vW;
        __NOISE__
        void main() {
          vec2 q = vW * 0.030;
          // broken plates of cooled crust, with molten rivers in the gaps
          float crust = fbm(q * 1.4);
          float plate = fbm(q * 0.45 + 11.0);
          float channels = rfbm(q * 0.8);
          float crack = smoothstep(0.66, 0.92, channels);
          // a second, finer crack network so the ground has scale up close
          float fine = smoothstep(0.80, 0.97, rfbm(q * 3.4));
          float pulse = 0.7 + 0.3 * sin(uTime * 0.5 + crust * 9.0);

          // the crust is BLACK. Only the gaps are alive.
          vec3 rock = mix(vec3(0.007, 0.003, 0.002), vec3(0.038, 0.017, 0.010), crust);
          rock *= 0.55 + 0.45 * plate;              // plate-to-plate value shift
          vec3 melt = vec3(1.0, 0.30, 0.03) * crack * pulse * 1.35
                    + vec3(1.0, 0.45, 0.08) * fine * pulse * 0.35;
          // the molten rivers throw light onto the crust beside them
          float spill = smoothstep(0.42, 0.92, channels) * 0.5
                      + smoothstep(0.55, 1.0, rfbm(q * 0.8 + 3.0)) * 0.3;
          vec3 col = rock + melt * uFire + vec3(0.55, 0.13, 0.03) * spill * uFire * 0.30;

          col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);       // crush the darks

          // aerial perspective, but toward a DIM ember haze, not a bright wash
          float dist = length(vW) / 380.0;
          vec3 haze = vec3(0.135, 0.030, 0.010);
          col = mix(col, haze * (0.35 + 0.65 * uFire), smoothstep(0.30, 1.0, dist));
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",Ve)}));M.rotation.x=-Math.PI/2,M.position.y=-1.6,M.renderOrder=-4,M.frustumCulled=!1,t.add(M);{const i=`
      precision highp float;
      uniform float uTime;
      uniform float uForm;
      uniform float uSeed;
      varying vec2 vUv;
      __NOISE__
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float n = fbm(vec2(p.x * 2.5 + uTime * 0.02 + uSeed * 7.0, p.y * 2.0));
        float body = exp(-p.y * 1.8 - 1.8) * (0.5 + 0.5 * n);
        body += exp(-p.y * p.y * 2.0) * n * 0.15;
        float a = body * uForm * 0.16;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.55, 0.14, 0.03) * (0.6 + n * 0.6) * a * 2.0, a);
      }
    `.replace("__NOISE__",Ve);for(let s=0;s<3;s++){const c={uTime:{value:0},uForm:{value:1},uSeed:{value:s*.41}};r.push(c),u.push(c);const w=Ge(140,40,i,c,{order:8});w.position.set(0,12,-60-s*45),t.add(w)}}const p=new Pt(3806728,1.15);t.add(p);const y=[];for(let i=0;i<4;i++){const s=new bt(16734744,46,40,1.9);t.add(s),y.push(s)}const O={uTime:{value:0},uFire:{value:1}};r.push(O),u.push(O);const z=new D(new zt(3.6,.35,170),new L({vertexShader:nt,fragmentShader:ba.replace("__NOISE__",Ve),uniforms:O}));z.position.set(0,-.18,-70),t.add(z);const V=new Ne(.055,.075,.95,7),N=new Be({color:1511436,roughness:.9}),k=new ot(V,N,68),I=new rt;let W=0;for(let i=4;i>=-148;i-=4.5)for(const s of[-1.9,1.9]){if(W>=68)break;I.makeTranslation(s,.45,i),k.setMatrixAt(W++,I)}k.instanceMatrix.needsUpdate=!0,t.add(k);for(const[i,s,c,w]of[[210,90,.75,3],[330,150,.9,2]]){const o={uForm:{value:1},uTall:{value:c}},h=new D(new Ne(i,i,s,96,1,!0),new L({vertexShader:nt,fragmentShader:Sa,uniforms:o,transparent:!0,depthWrite:!1,side:Oe}));h.position.y=s*.32,h.renderOrder=w,h.frustumCulled=!1,t.add(h)}const f={uTime:{value:0},uForm:{value:1}};r.push(f),u.push(f);const q=new D(new Ne(360,360,200,96,1,!0),new L({vertexShader:nt,fragmentShader:Ta.replace("__NOISE__",Ve),uniforms:f,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Oe}));q.position.y=30,q.renderOrder=1,q.frustumCulled=!1,t.add(q);function j(i){let s=i*9781+7;const c=()=>(s=s*1664525+1013904223>>>0,s/4294967296),w=9,o=7,h=[],A=[],C=[];for(let g=0;g<w;g++)C.push(.55+c()*.75);for(let g=0;g<=o;g++){const b=g/o,a=Math.pow(1-b,.72),U=b*(c()-.5)*1.4,d=(c()-.5)*.1*b*b,e=(c()-.5)*.1*b*b;for(let n=0;n<w;n++){const x=n/w*Math.PI*2+U,G=g%2===0?1:.8,X=.62+c()*.62,ie=a*C[n]*G*X;h.push(Math.cos(x)*ie+d,b,Math.sin(x)*ie+e)}}const l=h.length/3;h.push(0,1,0);for(let g=0;g<o;g++)for(let b=0;b<w;b++){const a=(b+1)%w,U=g*w+b,d=g*w+a,e=(g+1)*w+a,n=(g+1)*w+b;A.push(U,d,e,U,e,n)}for(let g=0;g<w;g++)A.push(o*w+g,o*w+(g+1)%w,l);const v=new Pe;return v.setAttribute("position",new vt(h,3)),v.setIndex(A),v.computeVertexNormals(),v}{const i=`
      varying vec3 vN;
      varying vec3 vP;
      varying float vDepth;
      void main() {
        vP = position;
        #ifdef USE_INSTANCING
          vec4 wp = instanceMatrix * vec4(position, 1.0);
          // normals survive the non-uniform instance scale well enough for rock
          vN = normalize(mat3(instanceMatrix) * normal);
        #else
          vec4 wp = vec4(position, 1.0);
          vN = normalize(normal);
        #endif
        vec4 mv = modelViewMatrix * wp;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,s=`
      precision highp float;
      uniform float uTime;
      uniform float uFire;
      varying vec3 vN;
      varying vec3 vP;
      varying float vDepth;
      __NOISE__
      void main() {
        vec3 N = normalize(vN);
        float ang = atan(vP.z, vP.x);
        vec2 q = vec2(ang * 2.4, vP.y * 6.0);

        // the rock itself is nearly black. It is only ever seen because
        // something below it is burning.
        float grain = fbm(q * 2.2);
        vec3 rock = mix(vec3(0.008, 0.004, 0.003), vec3(0.042, 0.022, 0.015), grain);

        // the land is the light: faces that look DOWN catch it, faces that
        // look up at the dead sky stay black
        float fromBelow = clamp(-N.y, 0.0, 1.0);
        float side = clamp(0.45 + 0.55 * N.z, 0.0, 1.0);
        vec3 lit = vec3(1.0, 0.30, 0.07) * fromBelow * (0.35 + 0.35 * grain) * uFire;
        lit *= mix(0.10, 0.55, 1.0 - vP.y);           // only the feet catch it

        // molten veins climbing out of the base
        float veins = rfbm(q);
        float vein = smoothstep(0.80, 0.97, veins) * (1.0 - smoothstep(0.02, 0.30, vP.y));
        float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + ang * 3.0);
        vec3 col = rock + lit * 0.55 + vec3(1.0, 0.28, 0.03) * vein * pulse * uFire * 0.55;

        // a hard rim where the horizon furnace grazes the edge
        col += vec3(0.9, 0.26, 0.05) * pow(1.0 - abs(N.z), 6.0) * side * 0.14 * uFire;

        // contrast: push the darks down so the shape reads as a silhouette
        col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);

        // distance: the crag forest dissolves into the furnace haze
        float fog = 1.0 - exp(-vDepth * 0.0065);
        col = mix(col, vec3(0.085, 0.019, 0.006) * (0.35 + 0.65 * uFire), fog * 0.90);
        gl_FragColor = vec4(col, 1.0);
      }
    `.replace("__NOISE__",Ve),c={uTime:{value:0},uFire:{value:1}};r.push(c),u.push(c);const w=new L({vertexShader:i,fragmentShader:s,uniforms:c}),o=4,h=84,A=[];for(let d=0;d<o;d++)A.push(j(d+1));const C=new Array(o).fill(0);let l=99;const v=()=>(l=l*1664525+1013904223>>>0,l/4294967296),g=[];for(let d=0;d<h;d++){const e=d%2===0?-1:1,n=v()<.42,x=e*(n?7.5+v()*14:22+v()*62),G=15-v()*205,X=n?5+v()*16:12+v()*34,ie=n?1.1+v()*2:2+v()*4.2,we=d%o;C[we]++,g.push({v:we,x,z:G,h:X,r:ie,rx:(v()-.5)*.2,ry:v()*6.28,rz:(v()-.5)*.2})}const b=A.map((d,e)=>{const n=new ot(d,w,Math.max(1,C[e]));return n.frustumCulled=!1,t.add(n),n}),a=new Array(o).fill(0),U=new rt;for(const d of g)U.compose(new Z(d.x,-1.2,d.z),new St().setFromEuler(new Tt(d.rx,d.ry,d.rz)),new Z(d.r,d.h,d.r)),b[d.v].setMatrixAt(a[d.v]++,U);for(const d of b)d.instanceMatrix.needsUpdate=!0}{const i=[],s=[],c=[];for(const A of[-1.9,1.9]){const C=A>0?-1:1;for(let l=4;l>=-148+4.5;l-=4.5){const v=l-4.5;for(let g=0;g<7;g++){const b=g/7,a=(g+1)/7,U=.88-Math.sin(b*Math.PI)*.24,d=.88-Math.sin(a*Math.PI)*.24,e=l+(v-l)*b,n=l+(v-l)*a,x=i.length/3;i.push(A,U-.034,e,A,U+.034,e,A,d+.034,n,A,d-.034,n);for(let G=0;G<4;G++)s.push(C,0,0);c.push(x,x+1,x+2,x,x+2,x+3)}}}const o=new Pe;o.setAttribute("position",new vt(i,3)),o.setAttribute("normal",new vt(s,3)),o.setIndex(c);const h=new D(o,new Be({color:1708555,roughness:.55,metalness:.65,side:ht}));h.frustumCulled=!1,t.add(h)}{const i=[];for(let v=4;v>=-148;v-=4.5)for(const g of[-1.9,1.9]){if(i.length>=68)break;i.push([g,1.08,v])}const s=i.length,c=new Float32Array(s*4*3),w=new Float32Array(s*4*2),o=new Float32Array(s*4),h=[];i.forEach(([v,g,b],a)=>{const U=a*.61803%1,d=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let n=0;n<4;n++){const x=a*4+n;c.set([v,g,b],x*3),w.set(d[n],x*2),o[x]=U}const e=a*4;h.push(e,e+1,e+2,e,e+2,e+3)});const A=new Pe;A.setAttribute("aCenter",new B(c,3)),A.setAttribute("aCorner",new B(w,2)),A.setAttribute("aSeed",new B(o,1)),A.setAttribute("position",new B(new Float32Array(s*4*3),3)),A.setIndex(h);const C={uTime:{value:0},uFire:{value:1}};r.push(C),u.push(C);const l=new D(A,new L({uniforms:C,transparent:!0,depthWrite:!1,blending:se,vertexShader:`
        attribute vec3 aCenter;
        attribute vec2 aCorner;
        attribute float aSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = aCorner * 0.5 + 0.5;
          vSeed = aSeed;
          vec4 c = modelViewMatrix * vec4(aCenter, 1.0);
          c.xy += aCorner * vec2(0.16, 0.30);
          gl_Position = projectionMatrix * c;
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec2 vUv;
        varying float vSeed;
        __NOISE__
        void main() {
          float y = vUv.y;
          float x = vUv.x * 2.0 - 1.0 + sin(uTime * 9.0 + vSeed * 41.0) * 0.10 * y;
          float n = noise(vec2(vSeed * 37.0 + x * 3.0, y * 3.5 - uTime * (2.0 + vSeed)));
          float shape = (1.0 - y) * exp(-x * x * (5.0 + y * 22.0));
          vec3 col = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.85, 0.45), shape * n * 2.0);
          float a = shape * (0.45 + n * 0.75) * uFire;
          if (a < 0.006) discard;
          gl_FragColor = vec4(col * a * 1.7, a);
        }
      `.replace("__NOISE__",Ve)}));l.renderOrder=9,l.frustumCulled=!1,t.add(l)}{const s=new Float32Array(2160),c=new Float32Array(720);let w=7;const o=()=>(w=w*1664525+1013904223>>>0,w/4294967296);for(let l=0;l<720;l++)s[l*3]=(o()*2-1)*75,s[l*3+1]=o()*34,s[l*3+2]=20-o()*215,c[l]=o();const h=new Pe;h.setAttribute("position",new B(s,3)),h.setAttribute("aSeed",new B(c,1));const A={uTime:{value:0},uFire:{value:1}};r.push(A),u.push(A);const C=new Le(h,new L({uniforms:A,transparent:!0,depthWrite:!1,blending:se,vertexShader:`
        uniform float uTime;
        attribute float aSeed;
        varying float vA;
        void main() {
          vec3 p = position;
          float rise = mod(p.y + uTime * (0.55 + aSeed * 0.9), 34.0);
          p.y = rise;
          p.x += sin(uTime * (0.31 + aSeed * 0.4) + aSeed * 31.0) * (2.0 + aSeed * 3.0);
          p.z += cos(uTime * 0.23 + aSeed * 17.0) * 1.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float sz = (1.4 + aSeed * 2.4) * (120.0 / max(-mv.z, 2.0));
          gl_PointSize = clamp(sz, 1.0, 10.0);
          // brightest low, fading as the ash climbs and cools
          vA = (0.25 + aSeed * 0.5) * (1.0 - rise / 40.0);
          gl_Position = projectionMatrix * mv;
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uFire;
        varying float vA;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float g = exp(-r2 * 3.0);
          vec3 col = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.62, 0.18), g);
          float a = g * vA * uFire;
          if (a < 0.006) discard;
          gl_FragColor = vec4(col * a * 1.8, a);
        }
      `}));C.renderOrder=7,C.frustumCulled=!1,t.add(C)}const $=[];for(let i=0;i<9;i++){const s={uTime:{value:0},uForm:{value:1},uSeed:{value:i/9}};r.push(s),u.push(s);const c=Ge(7+i%3*3,150+i%4*34,kt,s,{order:4}),w=i/9*Math.PI*2+.4,o=175+i%4*60;c.position.set(Math.cos(w)*o,58,Math.sin(w)*o-60),c.rotation.y=-w+Math.PI/2,t.add(c),$.push(c)}const oe=`
    precision highp float;
    uniform float uTime;
    uniform float uFire;
    uniform float uSeed;
    uniform vec3  uCol;
    varying vec2 vUv;
    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float r2 = dot(p, p);
      if (r2 > 1.0) discard;
      // two stacked falloffs: a tight bright heart and a wide faint bleed
      float tight = exp(-r2 * 7.0);
      float wide  = exp(-r2 * 1.5) * 0.42;
      float breathe = 0.86 + 0.14 * sin(uTime * 3.1 + uSeed * 29.0);
      float a = (tight + wide) * (1.0 - r2) * uFire * breathe * 0.30;
      if (a < 0.003) discard;
      gl_FragColor = vec4(uCol * a * 2.2, a);
    }
  `;function fe(i,s,c,w,o,h){const A={uTime:{value:0},uFire:{value:1},uSeed:{value:h},uCol:{value:new lt(o)}};r.push(A),u.push(A);const C=Ge(w,w,oe,A,{order:7,vert:dt});return C.position.set(i,s,c),t.add(C),C}$.forEach((i,s)=>{fe(i.position.x,i.position.y-25,i.position.z,60,16734740,s*.7)});const ve={uTime:{value:0},uWatch:{value:0}},re={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new mt(0,0)}};r.push(ve,re);const ce=Ge(150,110,Fa,ve,{blending:Ze,order:5});ce.position.set(0,78,-235),t.add(ce);const R=Ge(150,110,_a,re,{order:6});R.position.set(0,78,-234),t.add(R);const me={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};r.push(me);const de=Ge(14,68,kt,me,{order:5});de.position.set(0,44,-238),t.add(de);const ee={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};r.push(ee);const Ce=Ge(22,28,Ma,ee,{blending:Ze,order:5});Ce.position.set(0,10,-168),t.add(Ce),new xt().setMeshoptDecoder(yt).load("assets/models/gate.glb",i=>{let s=null;if(i.scene.traverse(v=>{v.isMesh&&!s&&(s=v)}),!s)return;const c=s.geometry;c.computeBoundingBox();const w=c.boundingBox,o=new Z;w.getSize(o);const h=46/o.x,A=s.material&&s.material.map?new Be({map:s.material.map,roughness:.9,color:7034440}):new Be({color:2102288,roughness:.92}),C=new D(c,A);C.scale.setScalar(h),C.position.set(-(w.min.x+w.max.x)*.5*h,-w.min.y*h-.4,-166),C.frustumCulled=!1,t.add(C);const l=new bt(16730640,55,90,1.8);l.position.set(0,16,-158),t.add(l),y.push(l)});const Q=[];for(let i=0;i<14;i++){const s=i%2===0?-1:1,c=-6-i*10.5-i%3*1.5;Q.push(new Z(s*(4+i%3*.8),0,c))}const pe=[],ze=[],Ie=[],ge=[];let ue=1.45,K=null;const Se=new xt().setMeshoptDecoder(yt);Se.load("assets/models/cauldron.glb",i=>{let s=null;if(i.scene.traverse(e=>{e.isMesh&&!s&&(s=e)}),!s)return;const c=s.geometry;c.computeBoundingBox();const w=c.boundingBox,o=new Z;w.getSize(o);const h=3.1/Math.max(o.x,o.z),A=new Be({color:2299922,roughness:.93,metalness:.25}),C=new ot(c,A,Q.length),l=new rt;Q.forEach((e,n)=>{l.compose(new Z(e.x,-w.min.y*h-.15,e.z),new St().setFromEuler(new Tt(0,n*1.7%6.28,0)),new Z(h,h,h)),C.setMatrixAt(n,l)}),C.instanceMatrix.needsUpdate=!0,C.frustumCulled=!1,t.add(C);const v=new Ne(2.1,2.6,1.6,9),g=new Be({color:1182215,roughness:1}),b=new ot(v,g,Q.length),a=new rt;Q.forEach((e,n)=>{a.makeTranslation(e.x,-.9,e.z),b.setMatrixAt(n,a)}),b.instanceMatrix.needsUpdate=!0,b.frustumCulled=!1,t.add(b);const U=o.y*h;ue=U,K&&K();const d=`
      precision highp float;
      uniform float uTime;
      uniform float uFire;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r2 = dot(p, p);
        if (r2 > 1.0) discard;
        float g = exp(-r2 * 3.4);
        float flick = 0.82 + 0.18 * sin(uTime * 6.3 + uSeed * 31.0);
        vec3 col = mix(vec3(1.0, 0.32, 0.05), vec3(1.0, 0.72, 0.30), g);
        float a = g * (1.0 - r2) * uFire * flick * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(col * a * 1.7, a);
      }
    `;Q.forEach((e,n)=>{const x={uTime:{value:0},uFire:{value:1},uSeed:{value:n*.37%1}};r.push(x),u.push(x);const G=Ge(4,5,ya,x,{order:9,vert:dt});G.position.set(e.x,U+1.45,e.z),t.add(G);const X={uTime:{value:0},uFire:{value:1},uSeed:{value:n*.71%1}};r.push(X),u.push(X);const ie=Ge(4.6,4.6,d,X,{order:8,vert:dt});ie.position.set(e.x,U+.55,e.z),t.add(ie),fe(e.x,U+1.6,e.z,13,16738844,n*.53%1)}),y.forEach((e,n)=>{const x=Q[n*3]||Q[0];e.position.set(x.x,U+1,x.z)})}),Se.load("assets/models/figure.glb",i=>{let s=null;if(i.scene.traverse(l=>{l.isMesh&&!s&&(s=l)}),!s)return;const c=s.geometry;c.computeBoundingBox();const w=new Z;c.boundingBox.getSize(w);const o=1.75/w.y,h=new Be({color:1182472,roughness:1});for(let l=0;l<Q.length;l++){const v=(l<8?2:1)+l%2;for(let g=0;g<v;g++){const b=new D(c,h),a=Q[l],U=l*2.1+g*2.4,d=-.38-g*.16;b.scale.setScalar(o*(.85+g*.1)),b.position.set(a.x+Math.cos(U)*.42,ue+d,a.z+Math.sin(U)*.42),b.rotation.y=(l*2.1+g*2.8)%6.28,b.frustumCulled=!1,t.add(b),pe.push({mesh:b,seed:l*1.3+g*7.7,baseY:b.position.y,dy:d,pot:l})}}K=()=>{for(const l of pe){if(l.pot===void 0)continue;const v=ue+l.dy;l.mesh.position.y+=v-l.baseY,l.baseY=v}},K();const A=new Ne(.55,.78,2.6,8),C=new Be({color:1511432,roughness:1});for(let l=0;l<4;l++){const v=l%2?1:-1,g=-22-l*26,b=new D(A,C);b.position.set(v*3.7,.3,g),t.add(b);const a=new D(c,h);a.scale.setScalar(o*1.12),a.position.set(v*3.7,1.6,g),a.rotation.y=v>0?-1.25:1.25,a.frustumCulled=!1,t.add(a)}for(let l=0;l<13;l++){const v=l%2===0?-1:1,g=-9-l*8.4-l%3*2.2,b=new D(c,h);b.scale.setScalar(o*(1+l%3*.09)),b.position.set(v*2.25,-.62,g),b.rotation.y=v>0?-Math.PI/2:Math.PI/2,b.frustumCulled=!1,t.add(b),ge.push({mesh:b,side:v,z:g,seed:l*2.7,baseY:-.62,baseX:v*2.25})}for(let l=0;l<6;l++){const v=new D(c,h);v.scale.setScalar(o*2.2),v.frustumCulled=!1,t.add(v),ze.push({mesh:v,col:$[l%$.length],seed:l*3.3})}for(let l=0;l<8;l++){const v=new D(c,h);v.scale.setScalar(o*(1.3+l%3*.3)),v.frustumCulled=!1,t.add(v);const g=l/8*Math.PI*2+1.1,b=26+l%4*11;Ie.push({mesh:v,x:Math.cos(g)*b,z:Math.sin(g)*b-55,seed:l*5.1,speed:.1+l%3*.03})}});const Me=new Z;return{group:t,set reveal(i){t.visible=i>.002,S.uForm.value=i},set watch(i){ve.uWatch.value=i,re.uWatch.value=i,me.uForm.value=i*.45*(1-ee.uRelease.value)},set bolt(i){re.uBolt.value=i,S.uBolt.value=i},set release(i){S.uDie.value=i;for(const c of u)c.uFire&&(c.uFire.value=1-i);for(const c of u)c.uForm&&(c.uForm.value=1-i*.85);ee.uRelease.value=i;const s=1-i*.9;p.intensity=1.05*s+i*2.4,p.color.setRGB(.19+i*.7,.09+i*.75,.04+i*.8);for(const c of y)c.intensity=20*s},update(i,s){for(const o of r)o.uTime&&(o.uTime.value=i);S.uTime.value=i,s.getWorldPosition(Me);const c=Qe.clamp((Me.x-0)/60,-1,1),w=Qe.clamp((Me.y-40)/90,-1,.4);re.uLook.value.set(c,w);for(const o of pe){const h=Math.sin(i*.9+o.seed);o.mesh.rotation.z=h*.17,o.mesh.rotation.x=Math.sin(i*.6+o.seed*1.7)*.13,o.mesh.position.y=o.baseY+Math.sin(i*.5+o.seed)*.13}for(const o of ge){const h=1-Qe.clamp(Math.abs(Me.z-o.z)/7.5,0,1),A=h*h,C=Math.sin(i*1.5+o.seed)*.5+.5;o.mesh.position.y=o.baseY+C*.16+A*.62,o.mesh.position.x=o.baseX-o.side*A*.42,o.mesh.rotation.z=(Math.sin(i*1.1+o.seed*1.7)*.12-A*.3)*o.side,o.mesh.rotation.x=-A*.34}for(const o of Ie){const h=(i*o.speed+o.seed)%1;o.mesh.position.set(o.x,70-h*95,o.z),o.mesh.rotation.set(i*.9+o.seed,o.seed,i*.6)}for(const o of ze){const h=(i*.14+o.seed)%1;o.mesh.position.copy(o.col.position),o.mesh.position.y=140-h*170,o.mesh.rotation.set(i*.8+o.seed,i*.5,i*.7+o.seed)}for(let o=0;o<y.length;o++){const h=y[o];h.intensity>.2&&(h.intensity=h.intensity*.92+(16+Math.sin(i*7+o*2.3)*3+Math.sin(i*13.7+o)*2)*.08)}}}}const _e={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},ae=116,Y={start:ae,url:"assets/audio/journey_02.mp3",starsOut:[ae+5,ae+17],palette:[ae+6,ae+21],full:[ae+6,ae+23],curtains:[ae+10,ae+26],core:[ae+18.5,ae+24.5],field:[ae+20,ae+28],breathIn:[ae+28.9,ae+33.3],breathOut:[ae+33.6,ae+38.5],loopFrom:ae+66,loopPeriod:11.5,loopAmp:.62},$e=ae+63.5,J=$e+11,E={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:J,portal:[$e,$e+2.5],tunnel:[$e+2.3,$e+9.6],arrive:$e+9.6,collide:[J+.2,J+6.6],blast:J+6.85,remnant:[J+7.2,J+16],world:[J+9,J+16.5],drumFrom:J+23.5,form:[J+32.2,J+47.5],flare:[J+48.4,J+51],open:[J+60.8,J+65.5],suck:[J+64.5,J+70.5],black:[J+69.5,J+71.5]},be=J+73,he={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:be+2,reveal:[be,be+4.5],walk:[be+3,be+62],watch:[be+24.4,be+30.5],mantra:be+57.2,release:[be+57.2,be+61.5],white:[be+59.5,be+64.5],end:be+68},ka="assets/audio/journey_01.mp3",He=4,Ua=[82.5,88.5],Ut=(m,t,r)=>m+(t-m)*r,T=(m,[t,r])=>Qe.clamp((m-t)/(r-t),0,1),_=m=>m*m*(3-2*m);function Re(m,t){const r=document.getElementById("status");r&&(r.textContent=m);const u=document.getElementById("substatus");u&&t!==void 0&&(u.textContent=t)}function Ca(m,t){const r=m.createGain();r.gain.value=0,r.connect(t);const u=m.createBiquadFilter();u.type="lowpass",u.frequency.value=220,u.Q.value=.6,u.connect(r);for(const[S,P]of[[38,.55],[57,.28],[76.4,.18]]){const F=m.createOscillator();F.type="sine",F.frequency.value=S;const M=m.createGain();M.gain.value=P,F.connect(M).connect(u),F.start()}return{set level(S){r.gain.setTargetAtTime(S*.09,m.currentTime,.25)}}}async function Ea(){Re("Preparing…","starting the engine");const m=document.getElementById("view"),t=new It({canvas:m,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Gt,t.toneMapping=Nt,t.toneMappingExposure=1.15;const r=new qt;r.background=null;const u=new Bt(70,window.innerWidth/window.innerHeight,.05,900);u.position.set(0,1.35,0);const S=new ct;S.add(u),r.add(S),Re("Preparing…","building the sky");const P=Dt(r),F=jt(r),M=Ft(F.group,{radius:460,scale:.85,gain:.7,order:-2}),p=Ft(F.group,{radius:300,scale:1.9,gain:1,order:-1}),y=$t(F.group),O=Xt(r),z=ea(r),V=la(r);Re("Preparing…","building the worlds");const N=xa(r),k=Aa(r);window.addEventListener("resize",()=>{u.aspect=window.innerWidth/window.innerHeight,u.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const I=new Audio;I.src=ka,I.preload="auto",I.crossOrigin="anonymous";let W=!1;I.addEventListener("canplaythrough",()=>{W=!0},{once:!0}),I.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),W=!0},{once:!0});let f=null,q=null,j=null,$=null,oe=null,fe=0,ve=null;function re(){if(!f)try{f=new(window.AudioContext||window.webkitAudioContext);const e=f.createGain();e.gain.value=1,e.connect(f.destination);const n=f.createMediaElementSource(I);j=f.createGain(),j.gain.value=1,n.connect(j).connect(e),z.attachAnalyser(f,j),q=Ca(f,e);const x=f.sampleRate*2,G=f.createBuffer(1,x,f.sampleRate),X=G.getChannelData(0);for(let Ae=0;Ae<x;Ae++)X[Ae]=Math.random()*2-1;const ie=f.createBufferSource();ie.buffer=G,ie.loop=!0;const we=f.createBiquadFilter();we.type="bandpass",we.frequency.value=320,we.Q.value=.7,$=f.createGain(),$.gain.value=0,ie.connect(we).connect($).connect(e),ie.start(),oe=Ae=>{const te=f.currentTime+Math.random()*.25,ne=1.1+Math.random()*1.4,Ee=190+Math.random()*260,ke=f.createGain();ke.gain.value=0;const Te=f.createBiquadFilter();Te.type="lowpass",Te.frequency.value=700+(1-Ae)*2600,ke.connect(Te).connect(e);const Ue=(.03+Math.random()*.035)*(1-Ae*.8);ke.gain.setValueAtTime(1e-4,te),ke.gain.exponentialRampToValueAtTime(Ue,te+ne*.18),ke.gain.exponentialRampToValueAtTime(1e-4,te+ne);for(const[xe,Je,ye]of[[1,.9,7],[2.6,.5,11],[4.3,.22,15]]){const qe=f.createOscillator();qe.type="sawtooth",qe.frequency.setValueAtTime(Ee*xe*(.9+Math.random()*.25),te),qe.frequency.exponentialRampToValueAtTime(Ee*xe*.55,te+ne);const le=f.createBiquadFilter();le.type="bandpass",le.frequency.value=Ee*xe,le.Q.value=ye;const et=f.createGain();et.gain.value=Je,qe.connect(le).connect(et).connect(ke),qe.start(te),qe.stop(te+ne+.05)}const De=f.createBufferSource();De.buffer=G,De.loop=!0;const We=f.createBiquadFilter();We.type="bandpass",We.frequency.value=Ee*2.2,We.Q.value=2;const je=f.createGain();je.gain.value=.16,De.connect(We).connect(je).connect(ke),De.start(te),De.stop(te+ne+.05)},ve=Ae=>{const te=f.currentTime;for(const[ne,Ee,ke]of[[0,58,.5],[.19,46,.34]]){const Te=f.createOscillator();Te.type="sine",Te.frequency.setValueAtTime(Ee*1.6,te+ne),Te.frequency.exponentialRampToValueAtTime(Ee,te+ne+.06);const Ue=f.createGain();Ue.gain.setValueAtTime(0,te+ne),Ue.gain.linearRampToValueAtTime(ke*Ae*.4,te+ne+.012),Ue.gain.exponentialRampToValueAtTime(1e-4,te+ne+.3),Te.connect(Ue).connect(e),Te.start(te+ne),Te.stop(te+ne+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let ce=null,R=null,me=!1,de=null,ee=null,Ce=!1,Q=null,pe=null,ze=!1;async function Ie(){try{const n=await(await fetch(Y.url)).arrayBuffer();f&&(ce=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const n=await(await fetch(E.voiceUrl)).arrayBuffer();f&&(de=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const n=await(await fetch(he.voiceUrl)).arrayBuffer();f&&(Q=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let ge=!1,ue=0;I.addEventListener("loadedmetadata",()=>{isFinite(I.duration)&&I.duration});let K=null,Se=-He,Me=0;function i(){if(!ge)return-He;if(pe!==null&&!ze&&f){const e=he.voiceAt+(f.currentTime-pe);return ue=performance.now()/1e3-e,e}if(ee!==null&&!Ce&&f){const e=E.voiceAt+(f.currentTime-ee);return ue=performance.now()/1e3-e,e}if(R!==null&&!me&&f){const e=Y.start+(f.currentTime-R);return ue=performance.now()/1e3-e,e}return!I.ended&&I.currentTime>.01?(ue=performance.now()/1e3-I.currentTime,I.currentTime):performance.now()/1e3-ue}function s(){if(K!==null)return K;const e=i(),n=performance.now()/1e3,x=Math.min(.1,Math.max(5e-4,n-Me));Me=n;const G=e-Se;return Math.abs(G)>2.5?Se=e:Se+=G*Math.min(1,x*(Math.abs(G)>.05?3:60)),Se}let c="flat";async function w(){if(!navigator.xr)return null;const e=n=>Promise.race([n.catch(()=>!1),new Promise(x=>setTimeout(()=>x(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function o(){re(),f&&f.state==="suspended"&&await f.resume(),Ie();const e=await w();if(e){const n={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const x=await navigator.xr.requestSession(e,n);await t.xr.setSession(x),c=e,x.addEventListener("end",()=>{c="flat"})}catch(x){console.warn("[journey] could not start",e,x)}}document.body.classList.add("started"),ge=!0,ue=performance.now()/1e3+He,setTimeout(()=>{I.play().catch(n=>console.warn("[journey] autoplay blocked",n))},He*1e3)}let h=null;function A(e){if(h)return h;let n=_(T(e,[Y.breathIn[0],Y.breathIn[0]+1.6]))*(1-_(T(e,[Y.breathIn[1],Y.breathIn[1]+1]))),x=_(T(e,[Y.breathOut[0],Y.breathOut[0]+.25]))*(1-_(T(e,[Y.breathOut[0]+.55,Y.breathOut[0]+1.2])));if(e>Y.loopFrom&&e<E.collide[0]){const G=(e-Y.loopFrom)%Y.loopPeriod,X=Y.loopAmp,ie=X*_(T(G,[0,1.8]))*(1-_(T(G,[4.4,5.6]))),we=X*_(T(G,[6,6.3]))*(1-_(T(G,[6.7,7.4])));n=Math.max(n,ie),x=Math.max(x,we)}return[n,x]}const C=new Z;let l=-He,v=0,g=0,b=-1,a=0;t.setAnimationLoop(()=>{const e=s(),n=Qe.clamp(e-l,.001,.1);l=e;const x=t.getContext(),G=Math.max(.5,x.drawingBufferHeight/900),X=t.xr.isPresenting?t.xr.getCamera():u;if(ge&&R===null&&ce&&f&&e>=Y.start&&K===null){const H=f.createBufferSource();H.buffer=ce,H.connect(j),H.onended=()=>{me=!0},H.start(),R=f.currentTime}if(ge&&ee===null&&de&&f&&e>=E.voiceAt&&K===null){const H=f.createBufferSource();H.buffer=de,H.connect(j),H.onended=()=>{Ce=!0},H.start(),ee=f.currentTime}if(ge&&pe===null&&Q&&f&&e>=he.voiceAt&&K===null){const H=f.createBufferSource();H.buffer=Q,H.connect(j),H.onended=()=>{ze=!0},H.start(),pe=f.currentTime}const[ie,we]=A(e);_(T(e,E.portal))*(1-_(T(e,[E.tunnel[0]+1,E.tunnel[0]+2])));const Ae=_(T(e,[E.tunnel[0],E.tunnel[0]+1.6]))*(1-_(T(e,[E.tunnel[1]-1.4,E.tunnel[1]]))),te=_(T(e,[E.tunnel[1]-2.6,E.tunnel[1]-.3])),ne=_(T(e,E.collide)),Ee=_(T(e,[E.blast,E.blast+.25]))*(1-_(T(e,[E.blast+.5,E.blast+1.6]))),ke=T(e,[E.blast,E.blast+3.6]),Te=_(T(e,[E.remnant[0],E.remnant[0]+.8]))*(1-_(T(e,[E.remnant[1]-3,E.remnant[1]]))),Ue=_(T(e,E.form)),De=_(T(e,E.world)),We=_(T(e,[E.flare[0],E.flare[0]+.7]))*(1-_(T(e,[E.flare[1]-.6,E.flare[1]+1.2]))),je=_(T(e,E.open)),xe=_(T(e,E.suck)),Je=_(T(e,E.black)),ye=_(T(e,[E.tunnel[0]+.5,E.tunnel[0]+4.5])),qe=_(T(e,[E.arrive-.5,E.arrive+3])),le=_(T(e,he.reveal)),et=_(T(e,he.walk)),Et=_(T(e,he.watch)),Xe=_(T(e,he.release)),tt=_(T(e,he.white));N.collide=ne,N.ring=ke,N.rush=Ae,N.tunnelEnd=te,N.remnant=Te;const at=1-le;N.form=Math.max(De*.34,Ue)*at,N.flare=We*at,N.open=je*at,N.suck=xe*at,N.black=Math.max(Je*(1-le),0),N.flash=Math.max(Ee,tt*.92),N.update(e,G,X),k.reveal=le,k.watch=Et*(1-Xe),k.release=Xe,le>.5&&Xe<.2&&K===null&&Math.random()<n*.35&&(a=.7+Math.random()*.5),a*=Math.exp(-n*6),k.bolt=a,p.bolt=a,M.bolt=a,k.update(e,X);const Rt=Ut(0,.55,_(T(e,_e.motesIn)))+Ut(0,.45,_(T(e,_e.motesFull)));O.fade=Rt*(1-_(T(e,[_e.dim[0],_e.dim[0]+9]))),O.update(e,G),P.opacity=Math.pow(T(e,_e.dim),1.6),F.emerge=T(e,_e.stars),F.global=(1-_(T(e,Y.starsOut))+qe*(1-xe)*.85)*(1-le),F.update(e,G);const pt=_(T(e,Y.palette)),gt=_(T(e,Y.full)),ut=(1-.45*V.breathing)*(1-ye)*(1-ne*.8);p.hell=le*(1-tt),M.hell=le*(1-tt),p.emerge=_(T(e,_e.nebula))*(ut+ye*.3*(1-xe))*(1-le),p.palette=pt*(1-ye*.85),p.full=gt*(1-ye*.6),p.update(e),M.emerge=_(T(e,_e.nebula))*(.9*ut+ye*.45*(1-xe))*(1-le),M.palette=pt*(1-ye*.85),M.full=gt*(1-ye*.6),M.update(e*.55),y.emerge=_(T(e,Y.curtains))*ut,y.update(e);const Ot=.05+ie*.85-we*1;g+=(Ot-g)*(1-Math.exp(-n*2.2)),v+=g*n,p.radial=v,M.radial=v*.35,V.core=_(T(e,Y.core))*(1-ye),V.field=_(T(e,Y.field))*(1-ye),V.gateIn=ie*(1-ye),V.gateOut=we*(1-ye),V.update(e,n,X,G);const wt=_(T(e,[_e.dim[0]+8,_e.dim[1]+8]))*(1-xe);if(C.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(wt),e<he.reveal[0]?S.position.copy(C):S.position.set(0,0,-et*120),S.rotation.z=Math.sin(e*.013)*.03*wt,z.fade=_(T(e,[-He+.8,-.2]))*(1-_(T(e,Ua))),z.update(e,n,X),q)if(e<Y.start-4){const H=_(T(e,_e.drone)),Ye=1-.45*_(T(e,[90,118]));q.level=H*Ye}else e<E.collide[0]?q.level=.1+.1*ie-.04*we:e<he.reveal[0]?q.level=.1+ne*.16+Ue*.12+xe*.4-Je*.34:q.level=(.16+le*.1)*(1-Xe);if(oe&&K===null&&le>.25&&e<he.mantra?e>fe&&(oe(.25+Math.random()*.7),fe=e+1.6+Math.random()*4.2):K!==null&&(fe=e+2),$&&f&&K===null){const H=le*.3*(1-Xe),Ye=tt*.24,ft=ne*.16+Ee*1+Ae*.62+xe*.85+H+Ye;$.gain.setTargetAtTime(ft*.16,f.currentTime,.12)}if(ve&&K===null&&e>E.drumFrom&&e<he.mantra){let H;if(e<he.reveal[0])H=1.45-Ue*.35-je*.25-xe*.25;else{const ft=Math.floor(e/1.6);H=1.35+Math.sin(ft*12.9898)*43758.5453%1*.55}const Ye=Math.floor(e/H);Ye!==b&&(b=Ye,ve(.55+Ue*.3+je*.45+xe*.6+le*.25))}t.render(r,u)}),Re("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];r.traverse(n=>{e.push([n,n.visible]),n.visible=!0});try{t.compile(r,u)}catch(n){console.warn("[journey] compile",n)}for(const[n,x]of e)n.visible=x}Re("Preparing…","checking the headset");const U=await w();U==="immersive-ar"?Re("Put your headset on and begin.","You will start in your own room."):U==="immersive-vr"?Re("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Re("Preview in browser","Open this page in the Quest browser for the full experience.");const d=document.getElementById("begin");d.disabled=!1,d.addEventListener("click",async()=>{d.disabled=!0,W||(Re("Loading the voice…"),await new Promise(e=>{if(W)return e();const n=setInterval(()=>{W&&(clearInterval(n),e())},100);setTimeout(()=>{clearInterval(n),e()},6e3)})),await o()}),window.JOURNEY={THREE:Vt,scene:r,camera:u,renderer:t,stars:F,nebula:p,voidShell:P,motes:O,narrator:z,prana:V,sec3:N,naraka:k,T:_e,SEG2:Y,SEG3:E,SEG4:he,seek:e=>{K=e},resume:()=>{K=null},look:(e,n=0)=>{u.rotation.set(n,e,0,"YXZ")},moveTo:(e,n,x)=>{S.position.set(0,0,0),u.position.set(e,n,x)},forceBreath:(e,n)=>{h=e===null?null:[e,n]},fakeLevel:e=>{z.uniforms.uLevel.value=e},dryStart:()=>{ge=!0,ue=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:s(),xrMode:c,voidOpacity:P.opacity,starEmerge:F.emerge,nebulaEmerge:p.emerge,orbFade:z.fade})},window.__JOURNEY_READY=!0}Ea().catch(m=>{console.error(m),window.__JOURNEY_ERROR=String(m&&m.stack||m),Re("Something went wrong.",String(m))});
