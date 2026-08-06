import{G as xt,M as yt}from"./meshopt_decoder.module-CAVseX-1.js";import{$ as st,g as B,o as Re,M as V,C as lt,p as Qe,a3 as Oe,a as D,A as se,a4 as Le,G as ct,n as qe,P as Ze,V as X,N as Xe,c as mt,D as ht,a5 as zt,a6 as bt,B as St,b as Be,I as at,f as rt,Q as Tt,a7 as Ft,a8 as vt,Y as It,S as Gt,Z as Nt,_ as qt,x as Vt,a0 as Bt}from"./three-Bq7AKahx.js";function Et(m){let t=m>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Dt(m){const t=new st(500,24,16),i=new B({side:Re,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),u=new V(t,i);return u.frustumCulled=!1,u.renderOrder=-10,m.add(u),{mesh:u,set opacity(S){i.uniforms.uOpacity.value=S},get opacity(){return i.uniforms.uOpacity.value}}}const Lt=`
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
`;function jt(m,{count:t=5200}={}){const i=Et(20260805),u=new Float32Array(t*3),S=new Float32Array(t),O=new Float32Array(t),F=new Float32Array(t),M=new Float32Array(t*3),g=new lt;for(let k=0;k<t;k++){let I=i()*2-1;const W=i()*Math.PI*2;i()<.42&&(I*=.3);const q=Math.sqrt(Math.max(0,1-I*I)),j=90+i()*320;u[k*3]=Math.cos(W)*q*j,u[k*3+1]=I*j,u[k*3+2]=Math.sin(W)*q*j;const $=Math.pow(i(),2.4);O[k]=.85+$*4.2,S[k]=Qe.clamp(.86-$*.9+(i()-.5)*.22,0,.9),F[k]=i()*100;const ae=i();ae>.86?g.setHSL(.07+i()*.04,.55,.72):ae>.66?g.setHSL(.12+i()*.03,.22,.85):g.setHSL(.58+i()*.06,.28+i()*.3,.88),M[k*3]=g.r,M[k*3+1]=g.g,M[k*3+2]=g.b}const y=new Oe;y.setAttribute("position",new D(u,3)),y.setAttribute("aDelay",new D(S,1)),y.setAttribute("aSize",new D(O,1)),y.setAttribute("aSeed",new D(F,1)),y.setAttribute("aTint",new D(M,3));const R={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},z=new B({vertexShader:Lt,fragmentShader:Wt,uniforms:R,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}),L=new Le(y,z);L.frustumCulled=!1,L.renderOrder=5;const N=new ct;return N.add(L),m.add(N),{group:N,uniforms:R,set emerge(k){R.uEmerge.value=k},get emerge(){return R.uEmerge.value},set global(k){R.uGlobal.value=k},update(k,I){R.uTime.value=k,R.uPixel.value=I,N.rotation.y=k*.0042,N.rotation.x=Math.sin(k*.017)*.014}}}const Yt=`
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
`;function _t(m,{radius:t=430,scale:i=2.1,gain:u=1,order:S=4}={}){const O=new st(t,48,32),F={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:i},uGain:{value:u},uHell:{value:0},uBolt:{value:0}},M=new B({side:Re,transparent:!0,depthWrite:!1,depthTest:!0,blending:se,uniforms:F,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Yt}),g=new V(O,M);return g.frustumCulled=!1,g.renderOrder=S,m.add(g),{mesh:g,set emerge(y){F.uEmerge.value=y},get emerge(){return F.uEmerge.value},set palette(y){F.uPalette.value=y},set full(y){F.uFull.value=y},set radial(y){F.uRadial.value=y},set hell(y){F.uHell.value=y},set bolt(y){F.uBolt.value=y},update(y){F.uTime.value=y}}}const Ht=`
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
`;function $t(m){const t=new qe(150,150,240,64,1,!0),i={uTime:{value:0},uEmerge:{value:0}},u=new B({side:Re,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,uniforms:i,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ht}),S=new V(t,u);return S.frustumCulled=!1,S.renderOrder=5,m.add(S),{mesh:S,set emerge(O){i.uEmerge.value=O},update(O){i.uTime.value=O,S.rotation.y=O*.006}}}const Qt=`
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
`,Zt=`
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
`;function Kt(m,{count:t=260,radius:i=3}={}){const u=Et(77003),S=new Float32Array(t*3),O=new Float32Array(t),F=new Float32Array(t);for(let z=0;z<t;z++)S[z*3]=(u()-.5)*i*2.2,S[z*3+1]=.25+u()*2.3,S[z*3+2]=(u()-.5)*i*2.2,O[z]=u(),F[z]=.5+u()*1.4;const M=new Oe;M.setAttribute("position",new D(S,3)),M.setAttribute("aSeed",new D(O,1)),M.setAttribute("aSize",new D(F,1));const g={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},y=new B({vertexShader:Qt,fragmentShader:Zt,uniforms:g,transparent:!0,depthWrite:!1,blending:se}),R=new Le(M,y);return R.frustumCulled=!1,R.renderOrder=3,m.add(R),{points:R,set fade(z){g.uFade.value=z},get fade(){return g.uFade.value},update(z,L){g.uTime.value=z,g.uPixel.value=L}}}const Xt=`
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
`;function eo(m){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},i=new B({vertexShader:Xt,fragmentShader:Jt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}),u=new V(new Ze(.44,.44),i);u.frustumCulled=!1,u.renderOrder=30,m.add(u);let S=null,O=null,F=0;const M=new X(0,1.35,-1.7),g=new X,y=new X(0,1.35,-1.7);return u.position.copy(y),{mesh:u,uniforms:t,attachAnalyser(R,z){S=R.createAnalyser(),S.fftSize=512,S.smoothingTimeConstant=.55,O=new Uint8Array(S.frequencyBinCount),z.connect(S)},set fade(R){t.uFade.value=R},get fade(){return t.uFade.value},update(R,z,L){t.uTime.value=R,L.getWorldDirection(g),L.getWorldPosition(M),M.addScaledVector(g,1.7);const N=1-Math.exp(-z*5.5);y.lerp(M,N),u.position.set(y.x,y.y+Math.sin(R*.9)*.008,y.z);let k=0;if(S){S.getByteFrequencyData(O);const W=Math.max(8,O.length*.45|0);let f=0;for(let q=2;q<W;q++)f+=O[q];k=Math.min(1,f/(W-2)/132)}const I=k>F?1-Math.exp(-z*22):1-Math.exp(-z*3.2);F+=(k-F)*I,t.uLevel.value=F}}}function to(m){let t=m>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const oo=`
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
`,ao=`
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
`,ro=`
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
`,io=`
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
`,no=`
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
`,Mt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function lo(m){const t=to(90210),i=850,u=new Float32Array(i),S=new Float32Array(i*3),O=new Float32Array(i),F=new Float32Array(i),M=new X(0,.05,-1).normalize(),g=new X;for(let P=0;P<i;P++){u[P]=t();do g.set(t()*2-1,t()*2-1,t()*2-1);while(g.lengthSq()>1||g.lengthSq()<.05);g.normalize(),t()<.25&&g.lerp(M,.6).normalize(),S[P*3]=g.x,S[P*3+1]=g.y,S[P*3+2]=g.z,O[P]=2.2+Math.pow(t(),.7)*5.8,F[P]=1.8+t()*3.4}const y=new Oe;y.setAttribute("position",new D(new Float32Array(i*3),3)),y.setAttribute("aSeed",new D(u,1)),y.setAttribute("aDir",new D(S,3)),y.setAttribute("aRad",new D(O,1)),y.setAttribute("aSize",new D(F,1));const R={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new X(0,1.3,-.3)}},z=new Le(y,new B({vertexShader:oo,fragmentShader:ao,uniforms:R,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));z.frustumCulled=!1,z.renderOrder=24,m.add(z);const L=700,N=new Float32Array(L),k=new Float32Array(L*3);for(let P=0;P<L;P++){N[P]=t();do g.set(t()*2-1,t()*2-1,t()*2-1);while(g.lengthSq()>1||g.lengthSq()<.05);g.normalize(),k[P*3]=g.x,k[P*3+1]=g.y,k[P*3+2]=g.z}const I=new Oe;I.setAttribute("position",new D(new Float32Array(L*3),3)),I.setAttribute("aSeed",new D(N,1)),I.setAttribute("aDir",new D(k,3));const W={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new X(0,1.3,-.3)},uFwd:{value:new X(0,0,-1)}},f=new Le(I,new B({vertexShader:ro,fragmentShader:io,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));f.frustumCulled=!1,f.renderOrder=25,m.add(f);const q={uTime:{value:0},uCore:{value:0},uIn:{value:0}},j=new V(new Ze(16,16),new B({vertexShader:Mt,fragmentShader:no,uniforms:q,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));j.position.set(0,2.5,-14),j.frustumCulled=!1,j.renderOrder=6,m.add(j);const $={uTime:{value:0},uCore:{value:0}},ae=new V(new Ze(5,90),new B({vertexShader:Mt,fragmentShader:`
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
      `,uniforms:$,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));ae.position.set(0,2.5,-14.2),ae.frustumCulled=!1,ae.renderOrder=5,m.add(ae);const fe=new X,ve=new X;let re=0,ce=0;return{get breathing(){return Math.max(re,ce)},set core(P){q.uCore.value=P,$.uCore.value=P},set field(P){R.uField.value=P},gateIn:0,gateOut:0,update(P,me,de,ee){const Ce=1-Math.exp(-me*(this.gateIn>re?3.2:1.8));re+=(this.gateIn-re)*Ce;const Q=1-Math.exp(-me*(this.gateOut>ce?9:4));ce+=(this.gateOut-ce)*Q,de.getWorldPosition(fe),de.getWorldDirection(ve),fe.addScaledVector(ve,.12),fe.y-=.05,R.uTime.value=P,R.uPixel.value=ee,R.uIn.value=re,R.uNose.value.copy(fe),W.uTime.value=P,W.uPixel.value=ee,W.uOut.value=ce,W.uNose.value.copy(fe),W.uFwd.value.copy(ve),q.uTime.value=P,q.uIn.value=re,$.uTime.value=P}}}const so=`
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
`,co=`
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
`,uo=`
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
`,fo=`
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
`,vo=`
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
`,At=`
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
`,kt=`
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
`,mo=`
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
`,ho=`
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
`,po=`
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
`,go=`
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
`,wo=`
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
`,xo=`
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
`;function Fe(m,t,i,u,{blending:S=se,order:O=8}={}){const F=new B({vertexShader:so,fragmentShader:i,uniforms:u,transparent:!0,depthWrite:!1,depthTest:!1,blending:S,side:ht}),M=new V(new Ze(m,t),F);return M.frustumCulled=!1,M.renderOrder=O,M}function yo(m){const t=new ct;m.add(t);const i={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},u=co,S=uo.replace("__COMMON__",u).replace("__NOISE__",it),O=fo.replace("__COMMON__",u).replace("__NOISE__",it),F=340,M=285,g=-190,y=62,R=Fe(F,M,S,i,{blending:Xe,order:7});R.position.set(0,y,g),t.add(R);const z=Fe(F,M,O,i,{order:8});z.position.set(0,y,g),t.add(z);const L=new X(0,y+.38*(M/2),g),N=Fe(34,34,vo,{uTime:i.uTime,uForm:{value:0}},{order:8});N.position.set(95,130,-180),t.add(N);const k=Fe(70,70,At,{uTime:i.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});k.position.set(-150,45,-175),t.add(k);const I=Fe(44,44,At,{uTime:i.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});I.position.set(150,20,-165),t.add(I);const W={uForm:{value:0}},f=new V(new qe(90,90,34,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:po,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:Xe,side:Re}));f.position.y=-14,f.renderOrder=9,f.frustumCulled=!1,t.add(f);const q={uTime:i.uTime,uForm:{value:0}},j=new V(new qe(110,110,60,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:go,uniforms:q,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Re}));j.position.y=-12,j.renderOrder=6,j.frustumCulled=!1,t.add(j);const $=420,ae=new Float32Array($*3),fe=new Float32Array($);for(let o=0;o<$;o++){const U=Math.random()*Math.PI*2,d=40+Math.random()*55;ae[o*3]=Math.cos(U)*d,ae[o*3+1]=-20+Math.random()*30,ae[o*3+2]=Math.sin(U)*d,fe[o]=Math.random()}const ve=new Oe;ve.setAttribute("position",new D(ae,3)),ve.setAttribute("aSeed",new D(fe,1));const re={uTime:i.uTime,uForm:{value:0},uPixel:{value:1}},ce=new Le(ve,new B({vertexShader:`
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
    `,uniforms:re,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));ce.frustumCulled=!1,ce.renderOrder=9,t.add(ce);const P={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new mt(1,-.1)},uSpin:{value:.05},uTint:{value:new lt(.45,.62,1)}},me={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new mt(-1,.12)},uSpin:{value:-.065},uTint:{value:new lt(1,.58,.22)}},de=Fe(175,175,kt,P,{order:22}),ee=Fe(150,150,kt,me,{order:22});de.position.set(-62,20,-120),ee.position.set(62,32,-125),m.add(de),m.add(ee),de.visible=ee.visible=!1;const Ce=(o,U)=>{const d={uTime:{value:0},uShow:{value:0}},e=Fe(430,330,`
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
        gl_FragColor = vec4(vec3(${o}) * a * 1.6, a);
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
  `,ze,{order:24});Ie.position.set(0,24,-130),m.add(Ie),Ie.visible=!1;const ge={uTime:{value:0},uRing:{value:0}},ue=Fe(420,420,ho,ge,{order:23});ue.position.set(0,24,-138),m.add(ue),ue.visible=!1;const Z={uTime:{value:0},uLife:{value:0}},Se=Fe(90,90,mo,Z,{order:22});Se.position.set(0,24,-138),m.add(Se),Se.visible=!1;const Me={uTime:{value:0},uGrow:{value:0}},r=Fe(7,7,xo,Me,{order:26});r.position.set(0,1.5,-9),m.add(r);const s={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},c=new V(new qe(3.2,3.2,130,40,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:wo,uniforms:s,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Re}));c.rotation.x=Math.PI/2,c.position.set(0,1.5,-20),c.renderOrder=27,c.frustumCulled=!1,m.add(c);const p={uBlack:{value:0},uWhite:{value:0}},a=new V(new st(.6,16,12),new B({vertexShader:`
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
      `,uniforms:p,transparent:!0,depthWrite:!1,depthTest:!1,blending:Xe,side:Re}));a.renderOrder=50,a.frustumCulled=!1,m.add(a);const h=1400,A=new Float32Array(h*3),C=new Float32Array(h*3),l=new Float32Array(h);{const o=e=>e*(F/2),U=e=>y+e*(M/2),d=[];for(let e=0;e<3;e++)for(let n=0;n<200;n++){const x=(Math.random()*2-1)*.46;d.push([o(x),U(.3+e*.14+x*x*.1),g+2])}for(let e=-1;e<=1;e+=2)for(let n=0;n<130;n++){const x=(Math.random()*2-1)*.14;d.push([o(e*.3+x),U(-.1+.03-x*x*1.6),g+2])}for(let e=0;e<220;e++){const n=Math.random()*Math.PI*2;d.push([o(Math.cos(n)*.062),U(.38+Math.sin(n)*.155),g+2])}for(let e=0;e<160;e++){const n=.3-Math.random()*.75;d.push([o((Math.random()*2-1)*.05),U(n),g+2])}for(;d.length<h;)d.push(d[Math.random()*d.length|0]);for(let e=0;e<h;e++){const n=d[e%d.length],x=Math.random()*Math.PI*2,G=(Math.random()-.35)*1.8,K=260+Math.random()*160;A[e*3]=Math.cos(x)*Math.cos(G)*K,A[e*3+1]=60+Math.sin(G)*K*.7,A[e*3+2]=-80+Math.sin(x)*Math.cos(G)*K*.5-80,C[e*3]=n[0],C[e*3+1]=n[1],C[e*3+2]=n[2],l[e]=Math.random()}}const v=new Oe;v.setAttribute("position",new D(A,3)),v.setAttribute("aEnd",new D(C,3)),v.setAttribute("aSeed",new D(l,1));const w={uTime:{value:0},uForm:i.uForm,uPixel:{value:1}},b=new Le(v,new B({vertexShader:`
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
    `,uniforms:w,transparent:!0,depthWrite:!1,depthTest:!1,blending:se}));return b.frustumCulled=!1,b.renderOrder=9,t.add(b),t.visible=!1,{group:t,eyeWorld:L,set collide(o){const U=o>.001&&o<1;de.visible=ee.visible=U,Q.m.visible=pe.m.visible=U,Ie.visible=o>.8&&o<.995,P.uShow.value=me.uShow.value=Math.min(1,o*4),Q.u.uShow.value=pe.u.uShow.value=Math.min(1,o*3)*(1-o*.3),ze.uWall.value=Math.max(0,(o-.8)/.2),P.uTidal.value=me.uTidal.value=Math.pow(o,1.6);const d=62*(1-Math.pow(o,1.7)*.88);de.position.x=-d,ee.position.x=d,ee.position.y=32-Math.pow(o,1.7)*12,Q.m.position.x=-120+Math.pow(o,1.7)*55,pe.m.position.x=120-Math.pow(o,1.7)*55},set flash(o){p.uWhite.value=o},set ring(o){ge.uRing.value=o,ue.visible=o>.002&&o<.999},set remnant(o){Z.uLife.value=o,Se.visible=o>.002},set tunnelEnd(o){s.uEnd.value=o},set flare(o){i.uFlare.value=o},set fireSurge(o){q.uForm.value=Math.min(1.6,q.uForm.value*(1+o))},set portal(o){Me.uGrow.value=o,r.visible=o>.002},set rush(o){s.uRush.value=o,c.visible=o>.002},set form(o){i.uForm.value=o,t.visible=o>.001||i.uSuck.value>.001,N.material.uniforms.uForm.value=Math.min(1,o*2.2),k.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.15)),I.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.25)),W.uForm.value=Math.min(1,o*2.6),q.uForm.value=Math.min(1,Math.max(0,o*2.2-.2)),re.uForm.value=Math.min(1,Math.max(0,o*2-.3))},set open(o){i.uOpen.value=o},set suck(o){i.uSuck.value=o;const U=1+o*o*7;t.scale.setScalar(U),t.position.copy(L).multiplyScalar(1-U)},set black(o){p.uBlack.value=o},update(o,U,d){i.uTime.value=o,Me.uTime.value=o,s.uTime.value=o,P.uTime.value=o,me.uTime.value=o,Q.u.uTime.value=o,pe.u.uTime.value=o,ze.uTime.value=o,ge.uTime.value=o,Z.uTime.value=o,w.uTime.value=o,w.uPixel.value=U,re.uPixel.value=U,a.visible!==p.uBlack.value>.003&&(a.visible=p.uBlack.value>.003),d.getWorldPosition(a.position),c.position.x=a.position.x,c.position.y=a.position.y}}}const Ne=`
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
`,bo=`
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
`,So=`
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
    col = mix(col, vec3(0.30, 0.075, 0.020), far * 0.85);
    gl_FragColor = vec4(col, 1.0);
  }
`,To=`
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
`,Fo=`
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
`,Ut=`
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
`,_o=`
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
`,Mo=`
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
`,Ao=`
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
`;function Ge(m,t,i,u,{blending:S=se,order:O=8,vert:F=nt,side:M=ht}={}){const g=new B({vertexShader:F,fragmentShader:i.replace("__NOISE__",Ne),uniforms:u,transparent:!0,depthWrite:!1,blending:S,side:M}),y=new V(new Ze(m,t),g);return y.frustumCulled=!1,y.renderOrder=O,y}function ko(m){const t=new ct;t.visible=!1,m.add(t);const i=[],u=[],S={uTime:{value:0},uForm:{value:0},uBolt:{value:0},uDie:{value:0}},O=new V(new st(380,40,24),new B({side:Re,transparent:!0,depthWrite:!1,uniforms:S,vertexShader:`
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
          vec3 brown = vec3(0.30, 0.085, 0.028);
          vec3 hot = vec3(0.95, 0.26, 0.055);
          vec3 col = mix(deep, brown, under * (0.35 + 0.65 * churn));
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
      `.replace("__NOISE__",Ne)}));O.renderOrder=-5,O.frustumCulled=!1,t.add(O);const F={uTime:{value:0},uFire:{value:1}};i.push(F),u.push(F);const M=new V(new Ze(760,760,1,1),new B({uniforms:F,vertexShader:`
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
          // vW.x is distance from the causeway centreline, vW.y is -worldZ
          vec2 q = vW * 0.030;
          float d = length(vW);

          // ---- the molten flow: domain-warped, always moving --------------
          vec2 warp = vec2(fbm(q * 0.7 + uTime * 0.010),
                           fbm(q * 0.7 + 5.2 - uTime * 0.008));
          vec2 fq = q + (warp - 0.5) * 1.6;
          float flow = fbm(fq * 1.15 - vec2(0.0, uTime * 0.035));
          float fine = fbm(fq * 4.2 - vec2(0.0, uTime * 0.10));

          // ---- the crust: plates of cooled rock floating on the melt ------
          float plate = fbm(q * 1.15 + 11.0);
          float sheet = fbm(q * 3.6 + 31.0);
          // crust covers a little under half; the rest is open molten rock
          float crustM = smoothstep(0.40, 0.60, plate * 0.68 + sheet * 0.32);
          // right beside the causeway the ground is solid bank, not lake
          float bank = smoothstep(11.0, 4.5, abs(vW.x));
          crustM = clamp(crustM + bank * 0.85, 0.0, 1.0);

          // ---- temperature of the open melt -------------------------------
          float heat = clamp(flow * 0.72 + fine * 0.38, 0.0, 1.0);
          heat = pow(heat, 0.80);
          vec3 melt = mix(vec3(0.62, 0.055, 0.006), vec3(1.0, 0.30, 0.02),
                          smoothstep(0.10, 0.55, heat));
          melt = mix(melt, vec3(1.0, 0.66, 0.10), smoothstep(0.50, 0.82, heat));
          melt = mix(melt, vec3(1.0, 0.92, 0.62), smoothstep(0.80, 0.99, heat));
          float boil = 0.90 + 0.10 * sin(uTime * 0.9 + flow * 22.0);
          melt *= boil;

          // the skin: a dark net of cooling crust drawn over the molten rock,
          // torn open where the flow is fastest. This is what stops it reading
          // as a smooth orange sheet.
          float web1 = rfbm(fq * 5.5);
          float web2 = rfbm(fq * 13.0 + 4.0);
          float skin = smoothstep(0.42, 0.80, web1) * 0.72
                     + smoothstep(0.55, 0.88, web2) * 0.38;
          skin *= 1.0 - smoothstep(0.62, 0.95, heat);     // tears open where hottest
          melt = mix(melt, melt * vec3(0.10, 0.055, 0.045), clamp(skin, 0.0, 0.88));
          // and the torn edges of that skin glow hotter than the pool
          float tear = smoothstep(0.40, 0.50, web1) * (1.0 - smoothstep(0.50, 0.62, web1));
          melt += vec3(1.0, 0.55, 0.12) * tear * 0.55;

          // ---- the crust itself: black rock, cracked, edges still alight ---
          float grain = fbm(q * 5.5);
          vec3 rock = mix(vec3(0.020, 0.010, 0.007), vec3(0.075, 0.040, 0.026), grain);
          // fractures across the plates, glowing from underneath
          float crack = smoothstep(0.62, 0.90, rfbm(q * 2.6));
          float fineCrack = smoothstep(0.76, 0.96, rfbm(q * 8.5));
          rock += vec3(1.0, 0.30, 0.03) * crack * 0.85
                + vec3(1.0, 0.45, 0.08) * fineCrack * 0.30;
          // the shoreline: crust glows white-hot where it meets the melt
          float shore = (1.0 - abs(crustM * 2.0 - 1.0));
          rock += vec3(1.0, 0.52, 0.10) * pow(shore, 2.2) * 0.85;

          vec3 col = mix(melt, rock, crustM);
          col *= uFire * 0.85 + 0.15;

          // ---- aerial perspective toward the furnace horizon --------------
          float dist = d / 380.0;
          vec3 haze = vec3(0.85, 0.24, 0.045);
          col = mix(col, haze * (0.30 + 0.70 * uFire), smoothstep(0.34, 1.0, dist) * 0.85);
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",Ne)}));M.rotation.x=-Math.PI/2,M.position.y=-1.6,M.renderOrder=-4,M.frustumCulled=!1,t.add(M);{const r=`
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
    `.replace("__NOISE__",Ne);for(let s=0;s<3;s++){const c={uTime:{value:0},uForm:{value:1},uSeed:{value:s*.41}};i.push(c),u.push(c);const p=Ge(140,40,r,c,{order:8});p.position.set(0,12,-60-s*45),t.add(p)}}const g=new zt(7023116,2.15);t.add(g);const y=[];for(let r=0;r<4;r++){const s=new bt(16734744,46,40,1.9);t.add(s),y.push(s)}const R={uTime:{value:0},uFire:{value:1}};i.push(R),u.push(R);const z=new V(new St(3.6,.35,170),new B({vertexShader:nt,fragmentShader:So.replace("__NOISE__",Ne),uniforms:R}));z.position.set(0,-.18,-70),t.add(z);const L=new qe(.055,.075,.95,7),N=new Be({color:1511436,roughness:.9}),k=new at(L,N,68),I=new rt;let W=0;for(let r=4;r>=-148;r-=4.5)for(const s of[-1.9,1.9]){if(W>=68)break;I.makeTranslation(s,.45,r),k.setMatrixAt(W++,I)}k.instanceMatrix.needsUpdate=!0,t.add(k);for(const[r,s,c,p]of[[210,90,.75,3],[330,150,.9,2]]){const a={uForm:{value:1},uTall:{value:c}},h=new V(new qe(r,r,s,96,1,!0),new B({vertexShader:nt,fragmentShader:To,uniforms:a,transparent:!0,depthWrite:!1,side:Re}));h.position.y=s*.32,h.renderOrder=p,h.frustumCulled=!1,t.add(h)}const f={uTime:{value:0},uForm:{value:1}};i.push(f),u.push(f);const q=new V(new qe(360,360,200,96,1,!0),new B({vertexShader:nt,fragmentShader:Fo.replace("__NOISE__",Ne),uniforms:f,transparent:!0,depthWrite:!1,depthTest:!1,blending:se,side:Re}));q.position.y=30,q.renderOrder=1,q.frustumCulled=!1,t.add(q);function j(r){let s=r*9781+7;const c=()=>(s=s*1664525+1013904223>>>0,s/4294967296),p=9,a=7,h=[],A=[],C=[];for(let w=0;w<p;w++)C.push(.55+c()*.75);for(let w=0;w<=a;w++){const b=w/a,o=Math.pow(1-b,.72),U=b*(c()-.5)*1.4,d=(c()-.5)*.1*b*b,e=(c()-.5)*.1*b*b;for(let n=0;n<p;n++){const x=n/p*Math.PI*2+U,G=w%2===0?1:.8,K=.62+c()*.62,ie=o*C[n]*G*K;h.push(Math.cos(x)*ie+d,b,Math.sin(x)*ie+e)}}const l=h.length/3;h.push(0,1,0);for(let w=0;w<a;w++)for(let b=0;b<p;b++){const o=(b+1)%p,U=w*p+b,d=w*p+o,e=(w+1)*p+o,n=(w+1)*p+b;A.push(U,d,e,U,e,n)}for(let w=0;w<p;w++)A.push(a*p+w,a*p+(w+1)%p,l);const v=new Oe;return v.setAttribute("position",new vt(h,3)),v.setIndex(A),v.computeVertexNormals(),v}{const r=`
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
        // standing in a lake of molten rock: the light comes from underneath
        // and dies away up the shaft
        vec3 lit = vec3(1.0, 0.34, 0.06) * (0.30 + 0.70 * fromBelow)
                 * (0.45 + 0.55 * grain) * uFire;
        lit *= mix(0.06, 1.55, pow(1.0 - vP.y, 2.0));

        // molten veins climbing out of the base
        float veins = rfbm(q);
        float vein = smoothstep(0.80, 0.97, veins) * (1.0 - smoothstep(0.02, 0.30, vP.y));
        float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + ang * 3.0);
        vec3 col = rock + lit * 0.95 + vec3(1.0, 0.30, 0.03) * vein * pulse * uFire * 0.85;

        // a hard rim where the horizon furnace grazes the edge
        col += vec3(1.0, 0.34, 0.07) * pow(1.0 - abs(N.z), 4.0) * side * 0.36 * uFire;

        // contrast: push the darks down so the shape reads as a silhouette
        col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);

        // distance: the crag forest dissolves into the furnace haze
        float fog = 1.0 - exp(-vDepth * 0.0065);
        col = mix(col, vec3(0.52, 0.135, 0.030) * (0.30 + 0.70 * uFire), fog * 0.88);
        gl_FragColor = vec4(col, 1.0);
      }
    `.replace("__NOISE__",Ne),c={uTime:{value:0},uFire:{value:1}};i.push(c),u.push(c);const p=new B({vertexShader:r,fragmentShader:s,uniforms:c}),a=4,h=84,A=[];for(let d=0;d<a;d++)A.push(j(d+1));const C=new Array(a).fill(0);let l=99;const v=()=>(l=l*1664525+1013904223>>>0,l/4294967296),w=[];for(let d=0;d<h;d++){const e=d%2===0?-1:1,n=v()<.42,x=e*(n?7.5+v()*14:22+v()*62),G=15-v()*205,K=n?5+v()*16:12+v()*34,ie=n?1.1+v()*2:2+v()*4.2,we=d%a;C[we]++,w.push({v:we,x,z:G,h:K,r:ie,rx:(v()-.5)*.2,ry:v()*6.28,rz:(v()-.5)*.2})}const b=A.map((d,e)=>{const n=new at(d,p,Math.max(1,C[e]));return n.frustumCulled=!1,t.add(n),n}),o=new Array(a).fill(0),U=new rt;for(const d of w)U.compose(new X(d.x,-1.2,d.z),new Tt().setFromEuler(new Ft(d.rx,d.ry,d.rz)),new X(d.r,d.h,d.r)),b[d.v].setMatrixAt(o[d.v]++,U);for(const d of b)d.instanceMatrix.needsUpdate=!0}{const r={uTime:{value:0},uFire:{value:1}};i.push(r),u.push(r);const s=new B({uniforms:r,vertexShader:`
        varying vec3 vP;
        varying vec3 vN;
        void main() {
          vP = position;
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uFire;
        varying vec3 vP;
        varying vec3 vN;
        __NOISE__
        void main() {
          vec2 q = vec2(vP.y * 5.0, vP.z * 0.9);
          float cell = fbm(q * 1.4);
          float crack = smoothstep(0.72, 0.94, rfbm(q * 2.2));
          vec3 stone = mix(vec3(0.020, 0.011, 0.008), vec3(0.062, 0.040, 0.028), cell);
          // the lake throws light up the outer face
          float up = clamp(-vN.y, 0.0, 1.0) * 0.35 + clamp(abs(vN.x), 0.0, 1.0) * 0.65;
          float low = 1.0 - smoothstep(-0.25, 0.30, vP.y);
          vec3 col = stone
                   + vec3(1.0, 0.32, 0.05) * up * low * 0.55 * uFire
                   + vec3(1.0, 0.30, 0.03) * crack * 0.35 * uFire;
          col = clamp(col, 0.0, 1.0); col = col * col * (3.0 - 2.0 * col);
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",Ne)});for(const c of[-2,2]){const p=new V(new St(.44,.62,170),s);p.position.set(c,.1,-70),p.frustumCulled=!1,t.add(p)}}{const r=[],s=[],c=[];for(const A of[-1.9,1.9]){const C=A>0?-1:1;for(let l=4;l>=-148+4.5;l-=4.5){const v=l-4.5;for(let w=0;w<7;w++){const b=w/7,o=(w+1)/7,U=.88-Math.sin(b*Math.PI)*.24,d=.88-Math.sin(o*Math.PI)*.24,e=l+(v-l)*b,n=l+(v-l)*o,x=r.length/3;r.push(A,U-.034,e,A,U+.034,e,A,d+.034,n,A,d-.034,n);for(let G=0;G<4;G++)s.push(C,0,0);c.push(x,x+1,x+2,x,x+2,x+3)}}}const a=new Oe;a.setAttribute("position",new vt(r,3)),a.setAttribute("normal",new vt(s,3)),a.setIndex(c);const h=new V(a,new Be({color:1708555,roughness:.55,metalness:.65,side:ht}));h.frustumCulled=!1,t.add(h)}{const r=[];for(let v=4;v>=-148;v-=4.5)for(const w of[-1.9,1.9]){if(r.length>=68)break;r.push([w,1.08,v])}const s=r.length,c=new Float32Array(s*4*3),p=new Float32Array(s*4*2),a=new Float32Array(s*4),h=[];r.forEach(([v,w,b],o)=>{const U=o*.61803%1,d=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let n=0;n<4;n++){const x=o*4+n;c.set([v,w,b],x*3),p.set(d[n],x*2),a[x]=U}const e=o*4;h.push(e,e+1,e+2,e,e+2,e+3)});const A=new Oe;A.setAttribute("aCenter",new D(c,3)),A.setAttribute("aCorner",new D(p,2)),A.setAttribute("aSeed",new D(a,1)),A.setAttribute("position",new D(new Float32Array(s*4*3),3)),A.setIndex(h);const C={uTime:{value:0},uFire:{value:1}};i.push(C),u.push(C);const l=new V(A,new B({uniforms:C,transparent:!0,depthWrite:!1,blending:se,vertexShader:`
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
      `.replace("__NOISE__",Ne)}));l.renderOrder=9,l.frustumCulled=!1,t.add(l)}{const s=new Float32Array(2160),c=new Float32Array(720);let p=7;const a=()=>(p=p*1664525+1013904223>>>0,p/4294967296);for(let l=0;l<720;l++)s[l*3]=(a()*2-1)*75,s[l*3+1]=a()*34,s[l*3+2]=20-a()*215,c[l]=a();const h=new Oe;h.setAttribute("position",new D(s,3)),h.setAttribute("aSeed",new D(c,1));const A={uTime:{value:0},uFire:{value:1}};i.push(A),u.push(A);const C=new Le(h,new B({uniforms:A,transparent:!0,depthWrite:!1,blending:se,vertexShader:`
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
      `}));C.renderOrder=7,C.frustumCulled=!1,t.add(C)}const $=[];for(let r=0;r<9;r++){const s={uTime:{value:0},uForm:{value:1},uSeed:{value:r/9}};i.push(s),u.push(s);const c=Ge(7+r%3*3,150+r%4*34,Ut,s,{order:4}),p=r/9*Math.PI*2+.4,a=175+r%4*60;c.position.set(Math.cos(p)*a,58,Math.sin(p)*a-60),c.rotation.y=-p+Math.PI/2,t.add(c),$.push(c)}const ae=`
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
  `;function fe(r,s,c,p,a,h){const A={uTime:{value:0},uFire:{value:1},uSeed:{value:h},uCol:{value:new lt(a)}};i.push(A),u.push(A);const C=Ge(p,p,ae,A,{order:7,vert:dt});return C.position.set(r,s,c),t.add(C),C}$.forEach((r,s)=>{fe(r.position.x,r.position.y-25,r.position.z,60,16734740,s*.7)});const ve={uTime:{value:0},uWatch:{value:0}},re={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new mt(0,0)}};i.push(ve,re);const ce=Ge(150,110,_o,ve,{blending:Xe,order:5});ce.position.set(0,78,-235),t.add(ce);const P=Ge(150,110,Mo,re,{order:6});P.position.set(0,78,-234),t.add(P);const me={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};i.push(me);const de=Ge(14,68,Ut,me,{order:5});de.position.set(0,44,-238),t.add(de);const ee={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};i.push(ee);const Ce=Ge(22,28,Ao,ee,{blending:Xe,order:5});Ce.position.set(0,10,-168),t.add(Ce),new xt().setMeshoptDecoder(yt).load("assets/models/gate.glb",r=>{let s=null;if(r.scene.traverse(v=>{v.isMesh&&!s&&(s=v)}),!s)return;const c=s.geometry;c.computeBoundingBox();const p=c.boundingBox,a=new X;p.getSize(a);const h=46/a.x,A=s.material&&s.material.map?new Be({map:s.material.map,roughness:.9,color:7034440}):new Be({color:2102288,roughness:.92}),C=new V(c,A);C.scale.setScalar(h),C.position.set(-(p.min.x+p.max.x)*.5*h,-p.min.y*h-.4,-166),C.frustumCulled=!1,t.add(C);const l=new bt(16730640,55,90,1.8);l.position.set(0,16,-158),t.add(l),y.push(l)});const Q=[];for(let r=0;r<14;r++){const s=r%2===0?-1:1,c=-6-r*10.5-r%3*1.5;Q.push(new X(s*(4+r%3*.8),0,c))}const pe=[],ze=[],Ie=[],ge=[];let ue=1.45,Z=null;const Se=new xt().setMeshoptDecoder(yt);Se.load("assets/models/cauldron.glb",r=>{let s=null;if(r.scene.traverse(e=>{e.isMesh&&!s&&(s=e)}),!s)return;const c=s.geometry;c.computeBoundingBox();const p=c.boundingBox,a=new X;p.getSize(a);const h=3.1/Math.max(a.x,a.z),A=new Be({color:2299922,roughness:.93,metalness:.25}),C=new at(c,A,Q.length),l=new rt;Q.forEach((e,n)=>{l.compose(new X(e.x,-p.min.y*h-.15,e.z),new Tt().setFromEuler(new Ft(0,n*1.7%6.28,0)),new X(h,h,h)),C.setMatrixAt(n,l)}),C.instanceMatrix.needsUpdate=!0,C.frustumCulled=!1,t.add(C);const v=new qe(2.1,2.6,1.6,9),w=new Be({color:1182215,roughness:1}),b=new at(v,w,Q.length),o=new rt;Q.forEach((e,n)=>{o.makeTranslation(e.x,-.9,e.z),b.setMatrixAt(n,o)}),b.instanceMatrix.needsUpdate=!0,b.frustumCulled=!1,t.add(b);const U=a.y*h;ue=U,Z&&Z();const d=`
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
    `;Q.forEach((e,n)=>{const x={uTime:{value:0},uFire:{value:1},uSeed:{value:n*.37%1}};i.push(x),u.push(x);const G=Ge(4,5,bo,x,{order:9,vert:dt});G.position.set(e.x,U+1.45,e.z),t.add(G);const K={uTime:{value:0},uFire:{value:1},uSeed:{value:n*.71%1}};i.push(K),u.push(K);const ie=Ge(4.6,4.6,d,K,{order:8,vert:dt});ie.position.set(e.x,U+.55,e.z),t.add(ie),fe(e.x,U+1.6,e.z,13,16738844,n*.53%1)}),y.forEach((e,n)=>{const x=Q[n*3]||Q[0];e.position.set(x.x,U+1,x.z)})}),Se.load("assets/models/figure.glb",r=>{let s=null;if(r.scene.traverse(l=>{l.isMesh&&!s&&(s=l)}),!s)return;const c=s.geometry;c.computeBoundingBox();const p=new X;c.boundingBox.getSize(p);const a=1.75/p.y,h=new Be({color:1182472,roughness:1});for(let l=0;l<Q.length;l++){const v=(l<8?2:1)+l%2;for(let w=0;w<v;w++){const b=new V(c,h),o=Q[l],U=l*2.1+w*2.4,d=-.38-w*.16;b.scale.setScalar(a*(.85+w*.1)),b.position.set(o.x+Math.cos(U)*.42,ue+d,o.z+Math.sin(U)*.42),b.rotation.y=(l*2.1+w*2.8)%6.28,b.frustumCulled=!1,t.add(b),pe.push({mesh:b,seed:l*1.3+w*7.7,baseY:b.position.y,dy:d,pot:l})}}Z=()=>{for(const l of pe){if(l.pot===void 0)continue;const v=ue+l.dy;l.mesh.position.y+=v-l.baseY,l.baseY=v}},Z();const A=new qe(.55,.78,2.6,8),C=new Be({color:1511432,roughness:1});for(let l=0;l<4;l++){const v=l%2?1:-1,w=-22-l*26,b=new V(A,C);b.position.set(v*3.7,.3,w),t.add(b);const o=new V(c,h);o.scale.setScalar(a*1.12),o.position.set(v*3.7,1.6,w),o.rotation.y=v>0?-1.25:1.25,o.frustumCulled=!1,t.add(o)}for(let l=0;l<13;l++){const v=l%2===0?-1:1,w=-9-l*8.4-l%3*2.2,b=new V(c,h);b.scale.setScalar(a*(1+l%3*.09)),b.position.set(v*2.45,-1.08,w),b.rotation.y=v>0?-Math.PI/2:Math.PI/2,b.frustumCulled=!1,t.add(b),ge.push({mesh:b,side:v,z:w,seed:l*2.7,baseY:-1.08,baseX:v*2.45})}for(let l=0;l<6;l++){const v=new V(c,h);v.scale.setScalar(a*2.2),v.frustumCulled=!1,t.add(v),ze.push({mesh:v,col:$[l%$.length],seed:l*3.3})}for(let l=0;l<8;l++){const v=new V(c,h);v.scale.setScalar(a*(1.3+l%3*.3)),v.frustumCulled=!1,t.add(v);const w=l/8*Math.PI*2+1.1,b=26+l%4*11;Ie.push({mesh:v,x:Math.cos(w)*b,z:Math.sin(w)*b-55,seed:l*5.1,speed:.1+l%3*.03})}});const Me=new X;return{group:t,set reveal(r){t.visible=r>.002,S.uForm.value=r},set watch(r){ve.uWatch.value=r,re.uWatch.value=r,me.uForm.value=r*.45*(1-ee.uRelease.value)},set bolt(r){re.uBolt.value=r,S.uBolt.value=r},set release(r){S.uDie.value=r;for(const c of u)c.uFire&&(c.uFire.value=1-r);for(const c of u)c.uForm&&(c.uForm.value=1-r*.85);ee.uRelease.value=r;const s=1-r*.9;g.intensity=1.95*s+r*2.4,g.color.setRGB(.19+r*.7,.09+r*.75,.04+r*.8);for(const c of y)c.intensity=20*s},update(r,s){for(const a of i)a.uTime&&(a.uTime.value=r);S.uTime.value=r,s.getWorldPosition(Me);const c=Qe.clamp((Me.x-0)/60,-1,1),p=Qe.clamp((Me.y-40)/90,-1,.4);re.uLook.value.set(c,p);for(const a of pe){const h=Math.sin(r*.9+a.seed);a.mesh.rotation.z=h*.17,a.mesh.rotation.x=Math.sin(r*.6+a.seed*1.7)*.13,a.mesh.position.y=a.baseY+Math.sin(r*.5+a.seed)*.13}for(const a of ge){const h=1-Qe.clamp(Math.abs(Me.z-a.z)/7.5,0,1),A=h*h,C=Math.sin(r*1.5+a.seed)*.5+.5;a.mesh.position.y=a.baseY+C*.2+A*.8,a.mesh.position.x=a.baseX-a.side*A*.55,a.mesh.rotation.z=(Math.sin(r*1.1+a.seed*1.7)*.12-A*.3)*a.side,a.mesh.rotation.x=-A*.34}for(const a of Ie){const h=(r*a.speed+a.seed)%1;a.mesh.position.set(a.x,70-h*95,a.z),a.mesh.rotation.set(r*.9+a.seed,a.seed,r*.6)}for(const a of ze){const h=(r*.14+a.seed)%1;a.mesh.position.copy(a.col.position),a.mesh.position.y=140-h*170,a.mesh.rotation.set(r*.8+a.seed,r*.5,r*.7+a.seed)}for(let a=0;a<y.length;a++){const h=y[a];h.intensity>.2&&(h.intensity=h.intensity*.92+(16+Math.sin(r*7+a*2.3)*3+Math.sin(r*13.7+a)*2)*.08)}}}}const _e={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},oe=116,Y={start:oe,url:"assets/audio/journey_02.mp3",starsOut:[oe+5,oe+17],palette:[oe+6,oe+21],full:[oe+6,oe+23],curtains:[oe+10,oe+26],core:[oe+18.5,oe+24.5],field:[oe+20,oe+28],breathIn:[oe+28.9,oe+33.3],breathOut:[oe+33.6,oe+38.5],loopFrom:oe+66,loopPeriod:11.5,loopAmp:.62},$e=oe+63.5,J=$e+11,E={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:J,portal:[$e,$e+2.5],tunnel:[$e+2.3,$e+9.6],arrive:$e+9.6,collide:[J+.2,J+6.6],blast:J+6.85,remnant:[J+7.2,J+16],world:[J+9,J+16.5],drumFrom:J+23.5,form:[J+32.2,J+47.5],flare:[J+48.4,J+51],open:[J+60.8,J+65.5],suck:[J+64.5,J+70.5],black:[J+69.5,J+71.5]},be=J+73,he={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:be+2,reveal:[be,be+4.5],walk:[be+3,be+62],watch:[be+24.4,be+30.5],mantra:be+57.2,release:[be+57.2,be+61.5],white:[be+59.5,be+64.5],end:be+68},Uo="assets/audio/journey_01.mp3",He=4,Co=[82.5,88.5],Ct=(m,t,i)=>m+(t-m)*i,T=(m,[t,i])=>Qe.clamp((m-t)/(i-t),0,1),_=m=>m*m*(3-2*m);function Pe(m,t){const i=document.getElementById("status");i&&(i.textContent=m);const u=document.getElementById("substatus");u&&t!==void 0&&(u.textContent=t)}function Eo(m,t){const i=m.createGain();i.gain.value=0,i.connect(t);const u=m.createBiquadFilter();u.type="lowpass",u.frequency.value=220,u.Q.value=.6,u.connect(i);for(const[S,O]of[[38,.55],[57,.28],[76.4,.18]]){const F=m.createOscillator();F.type="sine",F.frequency.value=S;const M=m.createGain();M.gain.value=O,F.connect(M).connect(u),F.start()}return{set level(S){i.gain.setTargetAtTime(S*.09,m.currentTime,.25)}}}async function Po(){Pe("Preparing…","starting the engine");const m=document.getElementById("view"),t=new It({canvas:m,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Gt,t.toneMapping=Nt,t.toneMappingExposure=1.15;const i=new qt;i.background=null;const u=new Vt(70,window.innerWidth/window.innerHeight,.05,900);u.position.set(0,1.35,0);const S=new ct;S.add(u),i.add(S),Pe("Preparing…","building the sky");const O=Dt(i),F=jt(i),M=_t(F.group,{radius:460,scale:.85,gain:.7,order:-2}),g=_t(F.group,{radius:300,scale:1.9,gain:1,order:-1}),y=$t(F.group),R=Kt(i),z=eo(i),L=lo(i);Pe("Preparing…","building the worlds");const N=yo(i),k=ko(i);window.addEventListener("resize",()=>{u.aspect=window.innerWidth/window.innerHeight,u.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const I=new Audio;I.src=Uo,I.preload="auto",I.crossOrigin="anonymous";let W=!1;I.addEventListener("canplaythrough",()=>{W=!0},{once:!0}),I.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),W=!0},{once:!0});let f=null,q=null,j=null,$=null,ae=null,fe=0,ve=null;function re(){if(!f)try{f=new(window.AudioContext||window.webkitAudioContext);const e=f.createGain();e.gain.value=1,e.connect(f.destination);const n=f.createMediaElementSource(I);j=f.createGain(),j.gain.value=1,n.connect(j).connect(e),z.attachAnalyser(f,j),q=Eo(f,e);const x=f.sampleRate*2,G=f.createBuffer(1,x,f.sampleRate),K=G.getChannelData(0);for(let Ae=0;Ae<x;Ae++)K[Ae]=Math.random()*2-1;const ie=f.createBufferSource();ie.buffer=G,ie.loop=!0;const we=f.createBiquadFilter();we.type="bandpass",we.frequency.value=320,we.Q.value=.7,$=f.createGain(),$.gain.value=0,ie.connect(we).connect($).connect(e),ie.start(),ae=Ae=>{const te=f.currentTime+Math.random()*.25,ne=1.1+Math.random()*1.4,Ee=190+Math.random()*260,ke=f.createGain();ke.gain.value=0;const Te=f.createBiquadFilter();Te.type="lowpass",Te.frequency.value=700+(1-Ae)*2600,ke.connect(Te).connect(e);const Ue=(.03+Math.random()*.035)*(1-Ae*.8);ke.gain.setValueAtTime(1e-4,te),ke.gain.exponentialRampToValueAtTime(Ue,te+ne*.18),ke.gain.exponentialRampToValueAtTime(1e-4,te+ne);for(const[xe,Je,ye]of[[1,.9,7],[2.6,.5,11],[4.3,.22,15]]){const Ve=f.createOscillator();Ve.type="sawtooth",Ve.frequency.setValueAtTime(Ee*xe*(.9+Math.random()*.25),te),Ve.frequency.exponentialRampToValueAtTime(Ee*xe*.55,te+ne);const le=f.createBiquadFilter();le.type="bandpass",le.frequency.value=Ee*xe,le.Q.value=ye;const et=f.createGain();et.gain.value=Je,Ve.connect(le).connect(et).connect(ke),Ve.start(te),Ve.stop(te+ne+.05)}const De=f.createBufferSource();De.buffer=G,De.loop=!0;const We=f.createBiquadFilter();We.type="bandpass",We.frequency.value=Ee*2.2,We.Q.value=2;const je=f.createGain();je.gain.value=.16,De.connect(We).connect(je).connect(ke),De.start(te),De.stop(te+ne+.05)},ve=Ae=>{const te=f.currentTime;for(const[ne,Ee,ke]of[[0,58,.5],[.19,46,.34]]){const Te=f.createOscillator();Te.type="sine",Te.frequency.setValueAtTime(Ee*1.6,te+ne),Te.frequency.exponentialRampToValueAtTime(Ee,te+ne+.06);const Ue=f.createGain();Ue.gain.setValueAtTime(0,te+ne),Ue.gain.linearRampToValueAtTime(ke*Ae*.4,te+ne+.012),Ue.gain.exponentialRampToValueAtTime(1e-4,te+ne+.3),Te.connect(Ue).connect(e),Te.start(te+ne),Te.stop(te+ne+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let ce=null,P=null,me=!1,de=null,ee=null,Ce=!1,Q=null,pe=null,ze=!1;async function Ie(){try{const n=await(await fetch(Y.url)).arrayBuffer();f&&(ce=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const n=await(await fetch(E.voiceUrl)).arrayBuffer();f&&(de=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const n=await(await fetch(he.voiceUrl)).arrayBuffer();f&&(Q=await f.decodeAudioData(n))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let ge=!1,ue=0;I.addEventListener("loadedmetadata",()=>{isFinite(I.duration)&&I.duration});let Z=null,Se=-He,Me=0;function r(){if(!ge)return-He;if(pe!==null&&!ze&&f){const e=he.voiceAt+(f.currentTime-pe);return ue=performance.now()/1e3-e,e}if(ee!==null&&!Ce&&f){const e=E.voiceAt+(f.currentTime-ee);return ue=performance.now()/1e3-e,e}if(P!==null&&!me&&f){const e=Y.start+(f.currentTime-P);return ue=performance.now()/1e3-e,e}return!I.ended&&I.currentTime>.01?(ue=performance.now()/1e3-I.currentTime,I.currentTime):performance.now()/1e3-ue}function s(){if(Z!==null)return Z;const e=r(),n=performance.now()/1e3,x=Math.min(.1,Math.max(5e-4,n-Me));Me=n;const G=e-Se;return Math.abs(G)>2.5?Se=e:Se+=G*Math.min(1,x*(Math.abs(G)>.05?3:60)),Se}let c="flat";async function p(){if(!navigator.xr)return null;const e=n=>Promise.race([n.catch(()=>!1),new Promise(x=>setTimeout(()=>x(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function a(){re(),f&&f.state==="suspended"&&await f.resume(),Ie();const e=await p();if(e){const n={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const x=await navigator.xr.requestSession(e,n);await t.xr.setSession(x),c=e,x.addEventListener("end",()=>{c="flat"})}catch(x){console.warn("[journey] could not start",e,x)}}document.body.classList.add("started"),ge=!0,ue=performance.now()/1e3+He,setTimeout(()=>{I.play().catch(n=>console.warn("[journey] autoplay blocked",n))},He*1e3)}let h=null;function A(e){if(h)return h;let n=_(T(e,[Y.breathIn[0],Y.breathIn[0]+1.6]))*(1-_(T(e,[Y.breathIn[1],Y.breathIn[1]+1]))),x=_(T(e,[Y.breathOut[0],Y.breathOut[0]+.25]))*(1-_(T(e,[Y.breathOut[0]+.55,Y.breathOut[0]+1.2])));if(e>Y.loopFrom&&e<E.collide[0]){const G=(e-Y.loopFrom)%Y.loopPeriod,K=Y.loopAmp,ie=K*_(T(G,[0,1.8]))*(1-_(T(G,[4.4,5.6]))),we=K*_(T(G,[6,6.3]))*(1-_(T(G,[6.7,7.4])));n=Math.max(n,ie),x=Math.max(x,we)}return[n,x]}const C=new X;let l=-He,v=0,w=0,b=-1,o=0;t.setAnimationLoop(()=>{const e=s(),n=Qe.clamp(e-l,.001,.1);l=e;const x=t.getContext(),G=Math.max(.5,x.drawingBufferHeight/900),K=t.xr.isPresenting?t.xr.getCamera():u;if(ge&&P===null&&ce&&f&&e>=Y.start&&Z===null){const H=f.createBufferSource();H.buffer=ce,H.connect(j),H.onended=()=>{me=!0},H.start(),P=f.currentTime}if(ge&&ee===null&&de&&f&&e>=E.voiceAt&&Z===null){const H=f.createBufferSource();H.buffer=de,H.connect(j),H.onended=()=>{Ce=!0},H.start(),ee=f.currentTime}if(ge&&pe===null&&Q&&f&&e>=he.voiceAt&&Z===null){const H=f.createBufferSource();H.buffer=Q,H.connect(j),H.onended=()=>{ze=!0},H.start(),pe=f.currentTime}const[ie,we]=A(e);_(T(e,E.portal))*(1-_(T(e,[E.tunnel[0]+1,E.tunnel[0]+2])));const Ae=_(T(e,[E.tunnel[0],E.tunnel[0]+1.6]))*(1-_(T(e,[E.tunnel[1]-1.4,E.tunnel[1]]))),te=_(T(e,[E.tunnel[1]-2.6,E.tunnel[1]-.3])),ne=_(T(e,E.collide)),Ee=_(T(e,[E.blast,E.blast+.25]))*(1-_(T(e,[E.blast+.5,E.blast+1.6]))),ke=T(e,[E.blast,E.blast+3.6]),Te=_(T(e,[E.remnant[0],E.remnant[0]+.8]))*(1-_(T(e,[E.remnant[1]-3,E.remnant[1]]))),Ue=_(T(e,E.form)),De=_(T(e,E.world)),We=_(T(e,[E.flare[0],E.flare[0]+.7]))*(1-_(T(e,[E.flare[1]-.6,E.flare[1]+1.2]))),je=_(T(e,E.open)),xe=_(T(e,E.suck)),Je=_(T(e,E.black)),ye=_(T(e,[E.tunnel[0]+.5,E.tunnel[0]+4.5])),Ve=_(T(e,[E.arrive-.5,E.arrive+3])),le=_(T(e,he.reveal)),et=_(T(e,he.walk)),Pt=_(T(e,he.watch)),Ke=_(T(e,he.release)),tt=_(T(e,he.white));N.collide=ne,N.ring=ke,N.rush=Ae,N.tunnelEnd=te,N.remnant=Te;const ot=1-le;N.form=Math.max(De*.34,Ue)*ot,N.flare=We*ot,N.open=je*ot,N.suck=xe*ot,N.black=Math.max(Je*(1-le),0),N.flash=Math.max(Ee,tt*.92),N.update(e,G,K),k.reveal=le,k.watch=Pt*(1-Ke),k.release=Ke,le>.5&&Ke<.2&&Z===null&&Math.random()<n*.35&&(o=.7+Math.random()*.5),o*=Math.exp(-n*6),k.bolt=o,g.bolt=o,M.bolt=o,k.update(e,K);const Rt=Ct(0,.55,_(T(e,_e.motesIn)))+Ct(0,.45,_(T(e,_e.motesFull)));R.fade=Rt*(1-_(T(e,[_e.dim[0],_e.dim[0]+9]))),R.update(e,G),O.opacity=Math.pow(T(e,_e.dim),1.6),F.emerge=T(e,_e.stars),F.global=(1-_(T(e,Y.starsOut))+Ve*(1-xe)*.85)*(1-le),F.update(e,G);const pt=_(T(e,Y.palette)),gt=_(T(e,Y.full)),ut=(1-.45*L.breathing)*(1-ye)*(1-ne*.8);g.hell=le*(1-tt),M.hell=le*(1-tt),g.emerge=_(T(e,_e.nebula))*(ut+ye*.3*(1-xe))*(1-le),g.palette=pt*(1-ye*.85),g.full=gt*(1-ye*.6),g.update(e),M.emerge=_(T(e,_e.nebula))*(.9*ut+ye*.45*(1-xe))*(1-le),M.palette=pt*(1-ye*.85),M.full=gt*(1-ye*.6),M.update(e*.55),y.emerge=_(T(e,Y.curtains))*ut,y.update(e);const Ot=.05+ie*.85-we*1;w+=(Ot-w)*(1-Math.exp(-n*2.2)),v+=w*n,g.radial=v,M.radial=v*.35,L.core=_(T(e,Y.core))*(1-ye),L.field=_(T(e,Y.field))*(1-ye),L.gateIn=ie*(1-ye),L.gateOut=we*(1-ye),L.update(e,n,K,G);const wt=_(T(e,[_e.dim[0]+8,_e.dim[1]+8]))*(1-xe);if(C.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(wt),e<he.reveal[0]?S.position.copy(C):S.position.set(0,0,-et*120),S.rotation.z=Math.sin(e*.013)*.03*wt,z.fade=_(T(e,[-He+.8,-.2]))*(1-_(T(e,Co))),z.update(e,n,K),q)if(e<Y.start-4){const H=_(T(e,_e.drone)),Ye=1-.45*_(T(e,[90,118]));q.level=H*Ye}else e<E.collide[0]?q.level=.1+.1*ie-.04*we:e<he.reveal[0]?q.level=.1+ne*.16+Ue*.12+xe*.4-Je*.34:q.level=(.16+le*.1)*(1-Ke);if(ae&&Z===null&&le>.25&&e<he.mantra?e>fe&&(ae(.25+Math.random()*.7),fe=e+1.6+Math.random()*4.2):Z!==null&&(fe=e+2),$&&f&&Z===null){const H=le*.3*(1-Ke),Ye=tt*.24,ft=ne*.16+Ee*1+Ae*.62+xe*.85+H+Ye;$.gain.setTargetAtTime(ft*.16,f.currentTime,.12)}if(ve&&Z===null&&e>E.drumFrom&&e<he.mantra){let H;if(e<he.reveal[0])H=1.45-Ue*.35-je*.25-xe*.25;else{const ft=Math.floor(e/1.6);H=1.35+Math.sin(ft*12.9898)*43758.5453%1*.55}const Ye=Math.floor(e/H);Ye!==b&&(b=Ye,ve(.55+Ue*.3+je*.45+xe*.6+le*.25))}t.render(i,u)}),Pe("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];i.traverse(n=>{e.push([n,n.visible]),n.visible=!0});try{t.compile(i,u)}catch(n){console.warn("[journey] compile",n)}for(const[n,x]of e)n.visible=x}Pe("Preparing…","checking the headset");const U=await p();U==="immersive-ar"?Pe("Put your headset on and begin.","You will start in your own room."):U==="immersive-vr"?Pe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Pe("Preview in browser","Open this page in the Quest browser for the full experience.");const d=document.getElementById("begin");d.disabled=!1,d.addEventListener("click",async()=>{d.disabled=!0,W||(Pe("Loading the voice…"),await new Promise(e=>{if(W)return e();const n=setInterval(()=>{W&&(clearInterval(n),e())},100);setTimeout(()=>{clearInterval(n),e()},6e3)})),await a()}),window.JOURNEY={THREE:Bt,scene:i,camera:u,renderer:t,stars:F,nebula:g,voidShell:O,motes:R,narrator:z,prana:L,sec3:N,naraka:k,T:_e,SEG2:Y,SEG3:E,SEG4:he,seek:e=>{Z=e},resume:()=>{Z=null},look:(e,n=0)=>{u.rotation.set(n,e,0,"YXZ")},moveTo:(e,n,x)=>{S.position.set(0,0,0),u.position.set(e,n,x)},forceBreath:(e,n)=>{h=e===null?null:[e,n]},fakeLevel:e=>{z.uniforms.uLevel.value=e},dryStart:()=>{ge=!0,ue=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:s(),xrMode:c,voidOpacity:O.opacity,starEmerge:F.emerge,nebulaEmerge:g.emerge,orbFade:z.fade})},window.__JOURNEY_READY=!0}Po().catch(m=>{console.error(m),window.__JOURNEY_ERROR=String(m&&m.stack||m),Pe("Something went wrong.",String(m))});
