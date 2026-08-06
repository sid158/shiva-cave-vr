import{G as ut,M as ft}from"./meshopt_decoder.module-DqI91Qqu.js";import{$ as Je,g as B,o as _e,M as j,C as it,p as je,a3 as Ge,a as H,A as oe,a4 as De,G as Xe,n as Pe,P as Ne,V as W,N as We,c as rt,D as bt,a5 as Et,a6 as vt,B as Ct,b as ze,I as $e,f as Qe,a7 as Pt,Q as dt,a8 as mt,a9 as Rt,aa as Ot,Y as Gt,S as It,Z as zt,_ as Lt,x as Bt,a0 as Dt}from"./three-B5WSCczv.js";function Tt(s){let t=s>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Nt(s){const t=new Je(500,24,16),a=new B({side:_e,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),r=new j(t,a);return r.frustumCulled=!1,r.renderOrder=-10,s.add(r),{mesh:r,set opacity(m){a.uniforms.uOpacity.value=m},get opacity(){return a.uniforms.uOpacity.value}}}const Vt=`
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
`,qt=`
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
`;function Wt(s,{count:t=5200}={}){const a=Tt(20260805),r=new Float32Array(t*3),m=new Float32Array(t),A=new Float32Array(t),g=new Float32Array(t),y=new Float32Array(t*3),u=new it;for(let b=0;b<t;b++){let U=a()*2-1;const z=a()*Math.PI*2;a()<.42&&(U*=.3);const O=Math.sqrt(Math.max(0,1-U*U)),L=90+a()*320;r[b*3]=Math.cos(z)*O*L,r[b*3+1]=U*L,r[b*3+2]=Math.sin(z)*O*L;const Y=Math.pow(a(),2.4);A[b]=.85+Y*4.2,m[b]=je.clamp(.86-Y*.9+(a()-.5)*.22,0,.9),g[b]=a()*100;const N=a();N>.86?u.setHSL(.07+a()*.04,.55,.72):N>.66?u.setHSL(.12+a()*.03,.22,.85):u.setHSL(.58+a()*.06,.28+a()*.3,.88),y[b*3]=u.r,y[b*3+1]=u.g,y[b*3+2]=u.b}const d=new Ge;d.setAttribute("position",new H(r,3)),d.setAttribute("aDelay",new H(m,1)),d.setAttribute("aSize",new H(A,1)),d.setAttribute("aSeed",new H(g,1)),d.setAttribute("aTint",new H(y,3));const F={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},k=new B({vertexShader:Vt,fragmentShader:qt,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}),I=new De(d,k);I.frustumCulled=!1,I.renderOrder=5;const P=new Xe;return P.add(I),s.add(P),{group:P,uniforms:F,set emerge(b){F.uEmerge.value=b},get emerge(){return F.uEmerge.value},set global(b){F.uGlobal.value=b},update(b,U){F.uTime.value=b,F.uPixel.value=U,P.rotation.y=b*.0042,P.rotation.x=Math.sin(b*.017)*.014}}}const jt=`
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
`;function ht(s,{radius:t=430,scale:a=2.1,gain:r=1,order:m=4}={}){const A=new Je(t,48,32),g={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:r},uHell:{value:0},uBolt:{value:0}},y=new B({side:_e,transparent:!0,depthWrite:!1,depthTest:!0,blending:oe,uniforms:g,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:jt}),u=new j(A,y);return u.frustumCulled=!1,u.renderOrder=m,s.add(u),{mesh:u,set emerge(d){g.uEmerge.value=d},get emerge(){return g.uEmerge.value},set palette(d){g.uPalette.value=d},set full(d){g.uFull.value=d},set radial(d){g.uRadial.value=d},set hell(d){g.uHell.value=d},set bolt(d){g.uBolt.value=d},update(d){g.uTime.value=d}}}const Ht=`
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
`;function Yt(s){const t=new Pe(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},r=new B({side:_e,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Ht}),m=new j(t,r);return m.frustumCulled=!1,m.renderOrder=5,s.add(m),{mesh:m,set emerge(A){a.uEmerge.value=A},update(A){a.uTime.value=A,m.rotation.y=A*.006}}}const $t=`
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
`;function Kt(s,{count:t=260,radius:a=3}={}){const r=Tt(77003),m=new Float32Array(t*3),A=new Float32Array(t),g=new Float32Array(t);for(let k=0;k<t;k++)m[k*3]=(r()-.5)*a*2.2,m[k*3+1]=.25+r()*2.3,m[k*3+2]=(r()-.5)*a*2.2,A[k]=r(),g[k]=.5+r()*1.4;const y=new Ge;y.setAttribute("position",new H(m,3)),y.setAttribute("aSeed",new H(A,1)),y.setAttribute("aSize",new H(g,1));const u={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},d=new B({vertexShader:$t,fragmentShader:Qt,uniforms:u,transparent:!0,depthWrite:!1,blending:oe}),F=new De(y,d);return F.frustumCulled=!1,F.renderOrder=3,s.add(F),{points:F,set fade(k){u.uFade.value=k},get fade(){return u.uFade.value},update(k,I){u.uTime.value=k,u.uPixel.value=I}}}const Zt=`
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
`;function Xt(s){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new B({vertexShader:Zt,fragmentShader:Jt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}),r=new j(new Ne(.44,.44),a);r.frustumCulled=!1,r.renderOrder=30,s.add(r);let m=null,A=null,g=0;const y=new W(0,1.35,-1.7),u=new W,d=new W(0,1.35,-1.7);return r.position.copy(d),{mesh:r,uniforms:t,attachAnalyser(F,k){m=F.createAnalyser(),m.fftSize=512,m.smoothingTimeConstant=.55,A=new Uint8Array(m.frequencyBinCount),k.connect(m)},set fade(F){t.uFade.value=F},get fade(){return t.uFade.value},update(F,k,I){t.uTime.value=F,I.getWorldDirection(u),I.getWorldPosition(y),y.addScaledVector(u,1.7);const P=1-Math.exp(-k*5.5);d.lerp(y,P),r.position.set(d.x,d.y+Math.sin(F*.9)*.008,d.z);let b=0;if(m){m.getByteFrequencyData(A);const z=Math.max(8,A.length*.45|0);let f=0;for(let O=2;O<z;O++)f+=A[O];b=Math.min(1,f/(z-2)/132)}const U=b>g?1-Math.exp(-k*22):1-Math.exp(-k*3.2);g+=(b-g)*U,t.uLevel.value=g}}}function ea(s){let t=s>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const ta=`
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
`;function na(s){const t=ea(90210),a=850,r=new Float32Array(a),m=new Float32Array(a*3),A=new Float32Array(a),g=new Float32Array(a),y=new W(0,.05,-1).normalize(),u=new W;for(let _=0;_<a;_++){r[_]=t();do u.set(t()*2-1,t()*2-1,t()*2-1);while(u.lengthSq()>1||u.lengthSq()<.05);u.normalize(),t()<.25&&u.lerp(y,.6).normalize(),m[_*3]=u.x,m[_*3+1]=u.y,m[_*3+2]=u.z,A[_]=2.2+Math.pow(t(),.7)*5.8,g[_]=1.8+t()*3.4}const d=new Ge;d.setAttribute("position",new H(new Float32Array(a*3),3)),d.setAttribute("aSeed",new H(r,1)),d.setAttribute("aDir",new H(m,3)),d.setAttribute("aRad",new H(A,1)),d.setAttribute("aSize",new H(g,1));const F={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new W(0,1.3,-.3)}},k=new De(d,new B({vertexShader:ta,fragmentShader:aa,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));k.frustumCulled=!1,k.renderOrder=24,s.add(k);const I=700,P=new Float32Array(I),b=new Float32Array(I*3);for(let _=0;_<I;_++){P[_]=t();do u.set(t()*2-1,t()*2-1,t()*2-1);while(u.lengthSq()>1||u.lengthSq()<.05);u.normalize(),b[_*3]=u.x,b[_*3+1]=u.y,b[_*3+2]=u.z}const U=new Ge;U.setAttribute("position",new H(new Float32Array(I*3),3)),U.setAttribute("aSeed",new H(P,1)),U.setAttribute("aDir",new H(b,3));const z={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new W(0,1.3,-.3)},uFwd:{value:new W(0,0,-1)}},f=new De(U,new B({vertexShader:oa,fragmentShader:ia,uniforms:z,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));f.frustumCulled=!1,f.renderOrder=25,s.add(f);const O={uTime:{value:0},uCore:{value:0},uIn:{value:0}},L=new j(new Ne(16,16),new B({vertexShader:pt,fragmentShader:ra,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));L.position.set(0,2.5,-14),L.frustumCulled=!1,L.renderOrder=6,s.add(L);const Y={uTime:{value:0},uCore:{value:0}},N=new j(new Ne(5,90),new B({vertexShader:pt,fragmentShader:`
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
      `,uniforms:Y,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));N.position.set(0,2.5,-14.2),N.frustumCulled=!1,N.renderOrder=5,s.add(N);const fe=new W,le=new W;let Z=0,ie=0;return{get breathing(){return Math.max(Z,ie)},set core(_){O.uCore.value=_,Y.uCore.value=_},set field(_){F.uField.value=_},gateIn:0,gateOut:0,update(_,re,V,ee){const he=1-Math.exp(-re*(this.gateIn>Z?3.2:1.8));Z+=(this.gateIn-Z)*he;const pe=1-Math.exp(-re*(this.gateOut>ie?9:4));ie+=(this.gateOut-ie)*pe,V.getWorldPosition(fe),V.getWorldDirection(le),fe.addScaledVector(le,.12),fe.y-=.05,F.uTime.value=_,F.uPixel.value=ee,F.uIn.value=Z,F.uNose.value.copy(fe),z.uTime.value=_,z.uPixel.value=ee,z.uOut.value=ie,z.uNose.value.copy(fe),z.uFwd.value.copy(le),O.uTime.value=_,O.uIn.value=Z,Y.uTime.value=_}}}const la=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ke=`
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
`;function xe(s,t,a,r,{blending:m=oe,order:A=8}={}){const g=new B({vertexShader:la,fragmentShader:a,uniforms:r,transparent:!0,depthWrite:!1,depthTest:!1,blending:m,side:bt}),y=new j(new Ne(s,t),g);return y.frustumCulled=!1,y.renderOrder=A,y}function wa(s){const t=new Xe;s.add(t);const a={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},r=sa,m=ca.replace("__COMMON__",r).replace("__NOISE__",Ke),A=ua.replace("__COMMON__",r).replace("__NOISE__",Ke),g=340,y=285,u=-190,d=62,F=xe(g,y,m,a,{blending:We,order:7});F.position.set(0,d,u),t.add(F);const k=xe(g,y,A,a,{order:8});k.position.set(0,d,u),t.add(k);const I=new W(0,d+.38*(y/2),u),P=xe(34,34,fa,{uTime:a.uTime,uForm:{value:0}},{order:8});P.position.set(95,130,-180),t.add(P);const b=xe(70,70,gt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});b.position.set(-150,45,-175),t.add(b);const U=xe(44,44,gt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});U.position.set(150,20,-165),t.add(U);const z={uForm:{value:0}},f=new j(new Pe(90,90,34,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ma,uniforms:z,transparent:!0,depthWrite:!1,depthTest:!1,blending:We,side:_e}));f.position.y=-14,f.renderOrder=9,f.frustumCulled=!1,t.add(f);const O={uTime:a.uTime,uForm:{value:0}},L=new j(new Pe(110,110,60,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ha,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe,side:_e}));L.position.y=-12,L.renderOrder=6,L.frustumCulled=!1,t.add(L);const Y=420,N=new Float32Array(Y*3),fe=new Float32Array(Y);for(let i=0;i<Y;i++){const e=Math.random()*Math.PI*2,l=40+Math.random()*55;N[i*3]=Math.cos(e)*l,N[i*3+1]=-20+Math.random()*30,N[i*3+2]=Math.sin(e)*l,fe[i]=Math.random()}const le=new Ge;le.setAttribute("position",new H(N,3)),le.setAttribute("aSeed",new H(fe,1));const Z={uTime:a.uTime,uForm:{value:0},uPixel:{value:1}},ie=new De(le,new B({vertexShader:`
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
    `,uniforms:Z,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));ie.frustumCulled=!1,ie.renderOrder=9,t.add(ie);const _={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new rt(1,-.1)},uSpin:{value:.05},uTint:{value:new it(.45,.62,1)}},re={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new rt(-1,.12)},uSpin:{value:-.065},uTint:{value:new it(1,.58,.22)}},V=xe(175,175,wt,_,{order:22}),ee=xe(150,150,wt,re,{order:22});V.position.set(-62,20,-120),ee.position.set(62,32,-125),s.add(V),s.add(ee),V.visible=ee.visible=!1;const he=(i,e)=>{const l={uTime:{value:0},uShow:{value:0}},v=xe(430,330,`
      precision highp float;
      uniform float uTime;
      uniform float uShow;
      varying vec2 vUv;
      ${Ke}
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float n = fbm(vUv * 2.6 + uTime * 0.01);
        float body = exp(-r * r * 2.2) * (0.35 + 0.65 * n);
        float a = body * uShow * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(${i}) * a * 1.6, a);
      }
    `,l,{order:21});return v.position.set(e,26,-160),s.add(v),v.visible=!1,{u:l,m:v}},pe=he("0.30, 0.45, 0.95",-120),Fe=he("0.95, 0.42, 0.12",120),se={uTime:{value:0},uWall:{value:0}},o=xe(60,300,`
    precision highp float;
    uniform float uTime;
    uniform float uWall;
    varying vec2 vUv;
    ${Ke}
    void main() {
      float x = abs(vUv.x);
      float beam = exp(-x * x * 10.0);
      float tear = 0.6 + 0.6 * fbm(vec2(vUv.y * 5.0, uTime * 0.4));
      vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), tear - 0.6);
      float a = beam * tear * uWall;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * a * 2.6, a);
    }
  `,se,{order:24});o.position.set(0,24,-130),s.add(o),o.visible=!1;const c={uTime:{value:0},uRing:{value:0}},h=xe(420,420,da,c,{order:23});h.position.set(0,24,-138),s.add(h),h.visible=!1;const E={uTime:{value:0},uLife:{value:0}},n=xe(90,90,va,E,{order:22});n.position.set(0,24,-138),s.add(n),n.visible=!1;const T={uTime:{value:0},uGrow:{value:0}},x=xe(7,7,ga,T,{order:26});x.position.set(0,1.5,-9),s.add(x);const M={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},R=new j(new Pe(3.2,3.2,130,40,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:pa,uniforms:M,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe,side:_e}));R.rotation.x=Math.PI/2,R.position.set(0,1.5,-20),R.renderOrder=27,R.frustumCulled=!1,s.add(R);const G={uBlack:{value:0},uWhite:{value:0}},X=new j(new Je(.6,16,12),new B({vertexShader:`
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
      `,uniforms:G,transparent:!0,depthWrite:!1,depthTest:!1,blending:We,side:_e}));X.renderOrder=50,X.frustumCulled=!1,s.add(X);const ne=1400,ve=new Float32Array(ne*3),be=new Float32Array(ne*3),$=new Float32Array(ne);{const i=v=>v*(g/2),e=v=>d+v*(y/2),l=[];for(let v=0;v<3;v++)for(let C=0;C<200;C++){const Q=(Math.random()*2-1)*.46;l.push([i(Q),e(.3+v*.14+Q*Q*.1),u+2])}for(let v=-1;v<=1;v+=2)for(let C=0;C<130;C++){const Q=(Math.random()*2-1)*.14;l.push([i(v*.3+Q),e(-.1+.03-Q*Q*1.6),u+2])}for(let v=0;v<220;v++){const C=Math.random()*Math.PI*2;l.push([i(Math.cos(C)*.062),e(.38+Math.sin(C)*.155),u+2])}for(let v=0;v<160;v++){const C=.3-Math.random()*.75;l.push([i((Math.random()*2-1)*.05),e(C),u+2])}for(;l.length<ne;)l.push(l[Math.random()*l.length|0]);for(let v=0;v<ne;v++){const C=l[v%l.length],Q=Math.random()*Math.PI*2,ce=(Math.random()-.35)*1.8,ue=260+Math.random()*160;ve[v*3]=Math.cos(Q)*Math.cos(ce)*ue,ve[v*3+1]=60+Math.sin(ce)*ue*.7,ve[v*3+2]=-80+Math.sin(Q)*Math.cos(ce)*ue*.5-80,be[v*3]=C[0],be[v*3+1]=C[1],be[v*3+2]=C[2],$[v]=Math.random()}}const te=new Ge;te.setAttribute("position",new H(ve,3)),te.setAttribute("aEnd",new H(be,3)),te.setAttribute("aSeed",new H($,1));const ae={uTime:{value:0},uForm:a.uForm,uPixel:{value:1}},Me=new De(te,new B({vertexShader:`
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
    `,uniforms:ae,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe}));return Me.frustumCulled=!1,Me.renderOrder=9,t.add(Me),t.visible=!1,{group:t,eyeWorld:I,set collide(i){const e=i>.001&&i<1;V.visible=ee.visible=e,pe.m.visible=Fe.m.visible=e,o.visible=i>.8&&i<.995,_.uShow.value=re.uShow.value=Math.min(1,i*4),pe.u.uShow.value=Fe.u.uShow.value=Math.min(1,i*3)*(1-i*.3),se.uWall.value=Math.max(0,(i-.8)/.2),_.uTidal.value=re.uTidal.value=Math.pow(i,1.6);const l=62*(1-Math.pow(i,1.7)*.88);V.position.x=-l,ee.position.x=l,ee.position.y=32-Math.pow(i,1.7)*12,pe.m.position.x=-120+Math.pow(i,1.7)*55,Fe.m.position.x=120-Math.pow(i,1.7)*55},set flash(i){G.uWhite.value=i},set ring(i){c.uRing.value=i,h.visible=i>.002&&i<.999},set remnant(i){E.uLife.value=i,n.visible=i>.002},set tunnelEnd(i){M.uEnd.value=i},set flare(i){a.uFlare.value=i},set fireSurge(i){O.uForm.value=Math.min(1.6,O.uForm.value*(1+i))},set portal(i){T.uGrow.value=i,x.visible=i>.002},set rush(i){M.uRush.value=i,R.visible=i>.002},set form(i){a.uForm.value=i,t.visible=i>.001||a.uSuck.value>.001,P.material.uniforms.uForm.value=Math.min(1,i*2.2),b.material.uniforms.uForm.value=Math.min(1,Math.max(0,i*1.8-.15)),U.material.uniforms.uForm.value=Math.min(1,Math.max(0,i*1.8-.25)),z.uForm.value=Math.min(1,i*2.6),O.uForm.value=Math.min(1,Math.max(0,i*2.2-.2)),Z.uForm.value=Math.min(1,Math.max(0,i*2-.3))},set open(i){a.uOpen.value=i},set suck(i){a.uSuck.value=i;const e=1+i*i*7;t.scale.setScalar(e),t.position.copy(I).multiplyScalar(1-e)},set black(i){G.uBlack.value=i},update(i,e,l){a.uTime.value=i,T.uTime.value=i,M.uTime.value=i,_.uTime.value=i,re.uTime.value=i,pe.u.uTime.value=i,Fe.u.uTime.value=i,se.uTime.value=i,c.uTime.value=i,E.uTime.value=i,ae.uTime.value=i,ae.uPixel.value=e,Z.uPixel.value=e,X.visible!==G.uBlack.value>.003&&(X.visible=G.uBlack.value>.003),l.getWorldPosition(X.position),R.position.x=X.position.x,R.position.y=X.position.y}}}const Oe=`
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
`,Ze=`
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
`,_a=`
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
`,Fa=`
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
`;function Re(s,t,a,r,{blending:m=oe,order:A=8,vert:g=Ze,side:y=bt}={}){const u=new B({vertexShader:g,fragmentShader:a.replace("__NOISE__",Oe),uniforms:r,transparent:!0,depthWrite:!1,blending:m,side:y}),d=new j(new Ne(s,t),u);return d.frustumCulled=!1,d.renderOrder=A,d}function Aa(s){const t=new Xe;t.visible=!1,s.add(t);const a=[],r=[],m={uTime:{value:0},uForm:{value:0},uBolt:{value:0},uDie:{value:0}},A=new j(new Je(380,40,24),new B({side:_e,transparent:!0,depthWrite:!1,uniforms:m,vertexShader:`
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

          vec3 deep = vec3(0.020, 0.006, 0.004);
          vec3 brown = vec3(0.16, 0.045, 0.015);
          vec3 hot = vec3(0.55, 0.13, 0.03);
          vec3 col = mix(deep, brown, under * (0.4 + 0.6 * churn));
          col = mix(col, hot, horizon * (0.5 + 0.5 * churn));
          // lightning inside the churn
          col += vec3(0.85, 0.55, 0.55) * uBolt * churn * under * 1.4;
          // the mantra starves the fire out of the sky
          col *= (1.0 - uDie * 0.9);
          gl_FragColor = vec4(col, uForm);
        }
      `.replace("__NOISE__",Oe)}));A.renderOrder=-5,A.frustumCulled=!1,t.add(A);const g={uTime:{value:0},uFire:{value:1}};a.push(g),r.push(g);const y=new j(new Ne(760,760,1,1),new B({uniforms:g,vertexShader:`
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
          float crust = fbm(q * 1.4);
          float channels = rfbm(q * 0.8);
          float crack = smoothstep(0.62, 0.88, channels);
          float pulse = 0.7 + 0.3 * sin(uTime * 0.5 + crust * 9.0);
          vec3 rock = mix(vec3(0.022, 0.010, 0.007), vec3(0.065, 0.030, 0.018), crust);
          vec3 melt = vec3(1.0, 0.30, 0.03) * crack * pulse;
          // aerial perspective: the land dissolves into the horizon's furnace
          float dist = length(vW) / 380.0;
          vec3 haze = vec3(0.45, 0.11, 0.03);
          vec3 col = mix(rock + melt * uFire, haze * (0.4 + 0.6 * uFire), smoothstep(0.35, 1.0, dist));
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",Oe)}));y.rotation.x=-Math.PI/2,y.position.y=-1.6,y.renderOrder=-4,y.frustumCulled=!1,t.add(y);{const o=`
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
    `.replace("__NOISE__",Oe);for(let c=0;c<3;c++){const h={uTime:{value:0},uForm:{value:1},uSeed:{value:c*.41}};a.push(h),r.push(h);const E=Re(140,40,o,h,{order:8});E.position.set(0,12,-60-c*45),t.add(E)}}const u=new Et(4398861,2.4);t.add(u);const d=[];for(let o=0;o<4;o++){const c=new vt(16734744,34,44,1.7);t.add(c),d.push(c)}const F={uTime:{value:0},uFire:{value:1}};a.push(F),r.push(F);const k=new j(new Ct(3.6,.35,170),new B({vertexShader:Ze,fragmentShader:ba.replace("__NOISE__",Oe),uniforms:F}));k.position.set(0,-.18,-70),t.add(k);const I=new Pe(.055,.075,.95,7),P=new ze({color:1511436,roughness:.9}),b=new $e(I,P,68),U=new Qe;let z=0;for(let o=4;o>=-148;o-=4.5)for(const c of[-1.9,1.9]){if(z>=68)break;U.makeTranslation(c,.45,o),b.setMatrixAt(z++,U)}b.instanceMatrix.needsUpdate=!0,t.add(b);for(const[o,c,h,E]of[[210,90,.75,3],[330,150,.9,2]]){const n={uForm:{value:1},uTall:{value:h}},T=new j(new Pe(o,o,c,96,1,!0),new B({vertexShader:Ze,fragmentShader:Ta,uniforms:n,transparent:!0,depthWrite:!1,side:_e}));T.position.y=c*.32,T.renderOrder=E,T.frustumCulled=!1,t.add(T)}const f={uTime:{value:0},uForm:{value:1}};a.push(f),r.push(f);const O=new j(new Pe(360,360,200,96,1,!0),new B({vertexShader:Ze,fragmentShader:Sa.replace("__NOISE__",Oe),uniforms:f,transparent:!0,depthWrite:!1,depthTest:!1,blending:oe,side:_e}));O.position.y=30,O.renderOrder=1,O.frustumCulled=!1,t.add(O);{const o=new Pt(1,1,7,3,!0);o.translate(0,.5,0);const c=new B({vertexShader:`
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
      `.replace("__NOISE__",Oe),uniforms:{uTime:{value:0},uFire:{value:1}}});a.push(c.uniforms),r.push(c.uniforms);const h=68,E=new $e(o,c,h),n=new Qe;let T=99;const x=()=>(T=T*1664525+1013904223>>>0,T/4294967296);for(let M=0;M<h;M++){const G=(M%2===0?-1:1)*(9+x()*55),X=15-x()*195,ne=7+x()*28,ve=1.4+x()*3.2;n.compose(new W(G,-1,X),new dt().setFromEuler(new mt((x()-.5)*.22,x()*6.28,(x()-.5)*.22)),new W(ve,ne,ve)),E.setMatrixAt(M,n)}E.instanceMatrix.needsUpdate=!0,E.frustumCulled=!1,t.add(E)}{const o=new Rt({color:1182214});for(const c of[-1.9,1.9]){const h=[];for(let n=4;n>=-148;n-=4.5){const T=n-4.5;for(let x=0;x<=6;x++){const M=x/6;h.push(new W(c,.88-Math.sin(M*Math.PI)*.22,n+(T-n)*M))}}const E=new Ot(new Ge().setFromPoints(h),o);E.frustumCulled=!1,t.add(E)}}const L=[];for(let o=0;o<18;o++){const c={uTime:{value:0},uForm:{value:1},uSeed:{value:o/18}};a.push(c),r.push(c);const h=Re(8+o%3*3,170+o%4*30,xt,c,{order:4}),E=o/18*Math.PI*2+.4,n=95+o%4*48;h.position.set(Math.cos(E)*n,55,Math.sin(E)*n-40),h.rotation.y=-E+Math.PI/2,t.add(h),L.push(h)}const Y={uTime:{value:0},uWatch:{value:0}},N={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new rt(0,0)}};a.push(Y,N);const fe=Re(150,110,_a,Y,{blending:We,order:5});fe.position.set(0,78,-235),t.add(fe);const le=Re(150,110,Fa,N,{order:6});le.position.set(0,78,-234),t.add(le);const Z={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};a.push(Z);const ie=Re(14,68,xt,Z,{order:5});ie.position.set(0,26,-232),t.add(ie);const _={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};a.push(_);const re=Re(34,40,Ma,_,{blending:We,order:5});re.position.set(0,14,-168),t.add(re),new ut().setMeshoptDecoder(ft).load("assets/models/gate.glb",o=>{let c=null;if(o.scene.traverse(G=>{G.isMesh&&!c&&(c=G)}),!c)return;const h=c.geometry;h.computeBoundingBox();const E=h.boundingBox,n=new W;E.getSize(n);const T=46/n.x,x=c.material&&c.material.map?new ze({map:c.material.map,roughness:.9,color:7034440}):new ze({color:2102288,roughness:.92}),M=new j(h,x);M.scale.setScalar(T),M.position.set(0,-E.min.y*T-.4,-166),M.frustumCulled=!1,t.add(M);const R=new vt(16730640,55,90,1.8);R.position.set(0,16,-158),t.add(R),d.push(R)});const V=[];for(let o=0;o<14;o++){const c=o%2===0?-1:1,h=-6-o*10.5-o%3*1.5;V.push(new W(c*(4+o%3*.8),0,h))}const ee=[],he=[],pe=[],Fe=new ut().setMeshoptDecoder(ft);Fe.load("assets/models/cauldron.glb",o=>{let c=null;if(o.scene.traverse($=>{$.isMesh&&!c&&(c=$)}),!c)return;const h=c.geometry;h.computeBoundingBox();const E=h.boundingBox,n=new W;E.getSize(n);const T=3.1/Math.max(n.x,n.z),x=new ze({color:2299922,roughness:.93,metalness:.25}),M=new $e(h,x,V.length),R=new Qe;V.forEach(($,te)=>{R.compose(new W($.x,-E.min.y*T-.15,$.z),new dt().setFromEuler(new mt(0,te*1.7%6.28,0)),new W(T,T,T)),M.setMatrixAt(te,R)}),M.instanceMatrix.needsUpdate=!0,M.frustumCulled=!1,t.add(M);const G=new Pe(2.1,2.6,1.6,9),X=new ze({color:1182215,roughness:1}),ne=new $e(G,X,V.length),ve=new Qe;V.forEach(($,te)=>{ve.makeTranslation($.x,-.9,$.z),ne.setMatrixAt(te,ve)}),ne.instanceMatrix.needsUpdate=!0,ne.frustumCulled=!1,t.add(ne);const be=n.y*T;V.forEach(($,te)=>{const ae={uTime:{value:0},uFire:{value:1},uSeed:{value:te*.37%1}};a.push(ae),r.push(ae);const Me=Re(3.3,4.3,ya,ae,{order:9,vert:xa});Me.position.set($.x,be+1.3,$.z),t.add(Me)}),d.forEach(($,te)=>{const ae=V[te*3]||V[0];$.position.set(ae.x,be+1,ae.z)})}),Fe.load("assets/models/figure.glb",o=>{let c=null;if(o.scene.traverse(x=>{x.isMesh&&!c&&(c=x)}),!c)return;const h=c.geometry;h.computeBoundingBox();const E=new W;h.boundingBox.getSize(E);const n=1.75/E.y,T=new ze({color:1182472,roughness:1});for(let x=0;x<V.length;x++){const M=1+x%2;for(let R=0;R<M;R++){const G=new j(h,T),X=V[x];G.scale.setScalar(n*(.9+R*.13)),G.position.set(X.x+(R?.45:-.3),.55,X.z+(R?-.2:.25)),G.rotation.y=(x*2.1+R*2.8)%6.28,G.frustumCulled=!1,t.add(G),ee.push({mesh:G,seed:x*1.3+R*7.7,baseY:G.position.y})}}for(let x=0;x<6;x++){const M=new j(h,T);M.scale.setScalar(n*2.2),M.frustumCulled=!1,t.add(M),he.push({mesh:M,col:L[x*3],seed:x*3.3})}for(let x=0;x<8;x++){const M=new j(h,T);M.scale.setScalar(n*(1.3+x%3*.3)),M.frustumCulled=!1,t.add(M);const R=x/8*Math.PI*2+1.1,G=26+x%4*11;pe.push({mesh:M,x:Math.cos(R)*G,z:Math.sin(R)*G-55,seed:x*5.1,speed:.1+x%3*.03})}});const se=new W;return{group:t,set reveal(o){t.visible=o>.002,m.uForm.value=o},set watch(o){Y.uWatch.value=o,N.uWatch.value=o,Z.uForm.value=o*.45*(1-_.uRelease.value)},set bolt(o){N.uBolt.value=o,m.uBolt.value=o},set release(o){m.uDie.value=o;for(const h of r)h.uFire&&(h.uFire.value=1-o);for(const h of r)h.uForm&&(h.uForm.value=1-o*.85);_.uRelease.value=o;const c=1-o*.9;u.intensity=1.6*c+o*2.2,u.color.setRGB(.19+o*.7,.09+o*.75,.04+o*.8);for(const h of d)h.intensity=20*c},update(o,c){for(const n of a)n.uTime&&(n.uTime.value=o);m.uTime.value=o,c.getWorldPosition(se);const h=je.clamp((se.x-0)/60,-1,1),E=je.clamp((se.y-40)/90,-1,.4);N.uLook.value.set(h,E);for(const n of ee){const T=Math.sin(o*.9+n.seed);n.mesh.rotation.z=T*.14,n.mesh.rotation.x=Math.sin(o*.6+n.seed*1.7)*.1,n.mesh.position.y=n.baseY+Math.sin(o*.5+n.seed)*.1}for(const n of pe){const T=(o*n.speed+n.seed)%1;n.mesh.position.set(n.x,70-T*95,n.z),n.mesh.rotation.set(o*.9+n.seed,n.seed,o*.6)}for(const n of he){const T=(o*.14+n.seed)%1;n.mesh.position.copy(n.col.position),n.mesh.position.y=140-T*170,n.mesh.rotation.set(o*.8+n.seed,o*.5,o*.7+n.seed)}for(let n=0;n<d.length;n++){const T=d[n];T.intensity>.2&&(T.intensity=T.intensity*.92+(16+Math.sin(o*7+n*2.3)*3+Math.sin(o*13.7+n)*2)*.08)}}}}const ye={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},J=116,D={start:J,url:"assets/audio/journey_02.mp3",starsOut:[J+5,J+17],palette:[J+6,J+21],full:[J+6,J+23],curtains:[J+10,J+26],core:[J+18.5,J+24.5],field:[J+20,J+28],breathIn:[J+28.9,J+33.3],breathOut:[J+33.6,J+38.5],loopFrom:J+66,loopPeriod:11.5,loopAmp:.62},Be=J+63.5,K=Be+11,S={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:K,portal:[Be,Be+2.5],tunnel:[Be+2.3,Be+9.6],arrive:Be+9.6,collide:[K+.2,K+6.6],blast:K+6.85,remnant:[K+7.2,K+16],world:[K+9,K+16.5],drumFrom:K+23.5,form:[K+32.2,K+47.5],flare:[K+48.4,K+51],open:[K+60.8,K+65.5],suck:[K+64.5,K+70.5],black:[K+69.5,K+71.5]},de=K+73,me={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:de+2,reveal:[de,de+4.5],walk:[de+3,de+62],watch:[de+24.4,de+30.5],mantra:de+57.2,release:[de+57.2,de+61.5],white:[de+59.5,de+64.5],end:de+68},ka="assets/audio/journey_01.mp3",Le=4,Ua=[82.5,88.5],yt=(s,t,a)=>s+(t-s)*a,p=(s,[t,a])=>je.clamp((s-t)/(a-t),0,1),w=s=>s*s*(3-2*s);function Se(s,t){const a=document.getElementById("status");a&&(a.textContent=s);const r=document.getElementById("substatus");r&&t!==void 0&&(r.textContent=t)}function Ea(s,t){const a=s.createGain();a.gain.value=0,a.connect(t);const r=s.createBiquadFilter();r.type="lowpass",r.frequency.value=220,r.Q.value=.6,r.connect(a);for(const[m,A]of[[38,.55],[57,.28],[76.4,.18]]){const g=s.createOscillator();g.type="sine",g.frequency.value=m;const y=s.createGain();y.gain.value=A,g.connect(y).connect(r),g.start()}return{set level(m){a.gain.setTargetAtTime(m*.09,s.currentTime,.25)}}}async function Ca(){Se("Preparing…","starting the engine");const s=document.getElementById("view"),t=new Gt({canvas:s,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=It,t.toneMapping=zt,t.toneMappingExposure=1.15;const a=new Lt;a.background=null;const r=new Bt(70,window.innerWidth/window.innerHeight,.05,900);r.position.set(0,1.35,0);const m=new Xe;m.add(r),a.add(m),Se("Preparing…","building the sky");const A=Nt(a),g=Wt(a),y=ht(g.group,{radius:460,scale:.85,gain:.7,order:-2}),u=ht(g.group,{radius:300,scale:1.9,gain:1,order:-1}),d=Yt(g.group),F=Kt(a),k=Xt(a),I=na(a);Se("Preparing…","building the worlds");const P=wa(a),b=Aa(a);window.addEventListener("resize",()=>{r.aspect=window.innerWidth/window.innerHeight,r.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const U=new Audio;U.src=ka,U.preload="auto",U.crossOrigin="anonymous";let z=!1;U.addEventListener("canplaythrough",()=>{z=!0},{once:!0}),U.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),z=!0},{once:!0});let f=null,O=null,L=null,Y=null,N=null;function fe(){if(!f)try{f=new(window.AudioContext||window.webkitAudioContext);const e=f.createGain();e.gain.value=1,e.connect(f.destination);const l=f.createMediaElementSource(U);L=f.createGain(),L.gain.value=1,l.connect(L).connect(e),k.attachAnalyser(f,L),O=Ea(f,e);const v=f.sampleRate*2,C=f.createBuffer(1,v,f.sampleRate),Q=C.getChannelData(0);for(let Ee=0;Ee<v;Ee++)Q[Ee]=Math.random()*2-1;const ce=f.createBufferSource();ce.buffer=C,ce.loop=!0;const ue=f.createBiquadFilter();ue.type="bandpass",ue.frequency.value=320,ue.Q.value=.7,Y=f.createGain(),Y.gain.value=0,ce.connect(ue).connect(Y).connect(e),ce.start(),N=Ee=>{const Ae=f.currentTime;for(const[ge,Ve,et]of[[0,58,.5],[.19,46,.34]]){const Ce=f.createOscillator();Ce.type="sine",Ce.frequency.setValueAtTime(Ve*1.6,Ae+ge),Ce.frequency.exponentialRampToValueAtTime(Ve,Ae+ge+.06);const ke=f.createGain();ke.gain.setValueAtTime(0,Ae+ge),ke.gain.linearRampToValueAtTime(et*Ee*.4,Ae+ge+.012),ke.gain.exponentialRampToValueAtTime(1e-4,Ae+ge+.3),Ce.connect(ke).connect(e),Ce.start(Ae+ge),Ce.stop(Ae+ge+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let le=null,Z=null,ie=!1,_=null,re=null,V=!1,ee=null,he=null,pe=!1;async function Fe(){try{const l=await(await fetch(D.url)).arrayBuffer();f&&(le=await f.decodeAudioData(l))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const l=await(await fetch(S.voiceUrl)).arrayBuffer();f&&(_=await f.decodeAudioData(l))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const l=await(await fetch(me.voiceUrl)).arrayBuffer();f&&(ee=await f.decodeAudioData(l))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let se=!1,o=0;U.addEventListener("loadedmetadata",()=>{isFinite(U.duration)&&U.duration});let c=null,h=-Le,E=0;function n(){if(!se)return-Le;if(he!==null&&!pe&&f){const e=me.voiceAt+(f.currentTime-he);return o=performance.now()/1e3-e,e}if(re!==null&&!V&&f){const e=S.voiceAt+(f.currentTime-re);return o=performance.now()/1e3-e,e}if(Z!==null&&!ie&&f){const e=D.start+(f.currentTime-Z);return o=performance.now()/1e3-e,e}return!U.ended&&U.currentTime>.01?(o=performance.now()/1e3-U.currentTime,U.currentTime):performance.now()/1e3-o}function T(){if(c!==null)return c;const e=n(),l=performance.now()/1e3,v=Math.min(.1,Math.max(5e-4,l-E));E=l;const C=e-h;return Math.abs(C)>2.5?h=e:h+=C*Math.min(1,v*(Math.abs(C)>.05?3:60)),h}let x="flat";async function M(){if(!navigator.xr)return null;const e=l=>Promise.race([l.catch(()=>!1),new Promise(v=>setTimeout(()=>v(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function R(){fe(),f&&f.state==="suspended"&&await f.resume(),Fe();const e=await M();if(e){const l={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const v=await navigator.xr.requestSession(e,l);await t.xr.setSession(v),x=e,v.addEventListener("end",()=>{x="flat"})}catch(v){console.warn("[journey] could not start",e,v)}}document.body.classList.add("started"),se=!0,o=performance.now()/1e3+Le,setTimeout(()=>{U.play().catch(l=>console.warn("[journey] autoplay blocked",l))},Le*1e3)}let G=null;function X(e){if(G)return G;let l=w(p(e,[D.breathIn[0],D.breathIn[0]+1.6]))*(1-w(p(e,[D.breathIn[1],D.breathIn[1]+1]))),v=w(p(e,[D.breathOut[0],D.breathOut[0]+.25]))*(1-w(p(e,[D.breathOut[0]+.55,D.breathOut[0]+1.2])));if(e>D.loopFrom&&e<S.collide[0]){const C=(e-D.loopFrom)%D.loopPeriod,Q=D.loopAmp,ce=Q*w(p(C,[0,1.8]))*(1-w(p(C,[4.4,5.6]))),ue=Q*w(p(C,[6,6.3]))*(1-w(p(C,[6.7,7.4])));l=Math.max(l,ce),v=Math.max(v,ue)}return[l,v]}const ne=new W;let ve=-Le,be=0,$=0,te=-1,ae=0;t.setAnimationLoop(()=>{const e=T(),l=je.clamp(e-ve,.001,.1);ve=e;const v=t.getContext(),C=Math.max(.5,v.drawingBufferHeight/900),Q=t.xr.isPresenting?t.xr.getCamera():r;if(se&&Z===null&&le&&f&&e>=D.start&&c===null){const q=f.createBufferSource();q.buffer=le,q.connect(L),q.onended=()=>{ie=!0},q.start(),Z=f.currentTime}if(se&&re===null&&_&&f&&e>=S.voiceAt&&c===null){const q=f.createBufferSource();q.buffer=_,q.connect(L),q.onended=()=>{V=!0},q.start(),re=f.currentTime}if(se&&he===null&&ee&&f&&e>=me.voiceAt&&c===null){const q=f.createBufferSource();q.buffer=ee,q.connect(L),q.onended=()=>{pe=!0},q.start(),he=f.currentTime}const[ce,ue]=X(e);w(p(e,S.portal))*(1-w(p(e,[S.tunnel[0]+1,S.tunnel[0]+2])));const Ee=w(p(e,[S.tunnel[0],S.tunnel[0]+1.6]))*(1-w(p(e,[S.tunnel[1]-1.4,S.tunnel[1]]))),Ae=w(p(e,[S.tunnel[1]-2.6,S.tunnel[1]-.3])),ge=w(p(e,S.collide)),Ve=w(p(e,[S.blast,S.blast+.25]))*(1-w(p(e,[S.blast+.5,S.blast+1.6]))),et=p(e,[S.blast,S.blast+3.6]),Ce=w(p(e,[S.remnant[0],S.remnant[0]+.8]))*(1-w(p(e,[S.remnant[1]-3,S.remnant[1]]))),ke=w(p(e,S.form)),St=w(p(e,S.world)),_t=w(p(e,[S.flare[0],S.flare[0]+.7]))*(1-w(p(e,[S.flare[1]-.6,S.flare[1]+1.2]))),tt=w(p(e,S.open)),Ue=w(p(e,S.suck)),nt=w(p(e,S.black)),Te=w(p(e,[S.tunnel[0]+.5,S.tunnel[0]+4.5])),Ft=w(p(e,[S.arrive-.5,S.arrive+3])),we=w(p(e,me.reveal)),Mt=w(p(e,me.walk)),At=w(p(e,me.watch)),qe=w(p(e,me.release)),He=w(p(e,me.white));P.collide=ge,P.ring=et,P.rush=Ee,P.tunnelEnd=Ae,P.remnant=Ce;const Ye=1-we;P.form=Math.max(St*.34,ke)*Ye,P.flare=_t*Ye,P.open=tt*Ye,P.suck=Ue*Ye,P.black=Math.max(nt*(1-we),0),P.flash=Math.max(Ve,He*.92),P.update(e,C,Q),b.reveal=we,b.watch=At*(1-qe),b.release=qe,we>.5&&qe<.2&&c===null&&Math.random()<l*.35&&(ae=.7+Math.random()*.5),ae*=Math.exp(-l*6),b.bolt=ae,u.bolt=ae,y.bolt=ae,b.update(e,Q);const kt=yt(0,.55,w(p(e,ye.motesIn)))+yt(0,.45,w(p(e,ye.motesFull)));F.fade=kt*(1-w(p(e,[ye.dim[0],ye.dim[0]+9]))),F.update(e,C),A.opacity=Math.pow(p(e,ye.dim),1.6),g.emerge=p(e,ye.stars),g.global=(1-w(p(e,D.starsOut))+Ft*(1-Ue)*.85)*(1-we),g.update(e,C);const lt=w(p(e,D.palette)),st=w(p(e,D.full)),at=(1-.45*I.breathing)*(1-Te)*(1-ge*.8);u.hell=we*(1-He),y.hell=we*(1-He),u.emerge=w(p(e,ye.nebula))*(at+Te*.3*(1-Ue))*(1-we),u.palette=lt*(1-Te*.85),u.full=st*(1-Te*.6),u.update(e),y.emerge=w(p(e,ye.nebula))*(.9*at+Te*.45*(1-Ue))*(1-we),y.palette=lt*(1-Te*.85),y.full=st*(1-Te*.6),y.update(e*.55),d.emerge=w(p(e,D.curtains))*at,d.update(e);const Ut=.05+ce*.85-ue*1;$+=(Ut-$)*(1-Math.exp(-l*2.2)),be+=$*l,u.radial=be,y.radial=be*.35,I.core=w(p(e,D.core))*(1-Te),I.field=w(p(e,D.field))*(1-Te),I.gateIn=ce*(1-Te),I.gateOut=ue*(1-Te),I.update(e,l,Q,C);const ct=w(p(e,[ye.dim[0]+8,ye.dim[1]+8]))*(1-Ue);if(ne.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(ct),e<me.reveal[0]?m.position.copy(ne):m.position.set(0,0,-Mt*120),m.rotation.z=Math.sin(e*.013)*.03*ct,k.fade=w(p(e,[-Le+.8,-.2]))*(1-w(p(e,Ua))),k.update(e,l,Q),O)if(e<D.start-4){const q=w(p(e,ye.drone)),Ie=1-.45*w(p(e,[90,118]));O.level=q*Ie}else e<S.collide[0]?O.level=.1+.1*ce-.04*ue:e<me.reveal[0]?O.level=.1+ge*.16+ke*.12+Ue*.4-nt*.34:O.level=(.16+we*.1)*(1-qe);if(Y&&f&&c===null){const q=we*.3*(1-qe),Ie=He*.24,ot=ge*.16+Ve*1+Ee*.62+Ue*.85+q+Ie;Y.gain.setTargetAtTime(ot*.16,f.currentTime,.12)}if(N&&c===null&&e>S.drumFrom&&e<me.mantra){let q;if(e<me.reveal[0])q=1.45-ke*.35-tt*.25-Ue*.25;else{const ot=Math.floor(e/1.6);q=1.35+Math.sin(ot*12.9898)*43758.5453%1*.55}const Ie=Math.floor(e/q);Ie!==te&&(te=Ie,N(.55+ke*.3+tt*.45+Ue*.6+we*.25))}t.render(a,r)}),Se("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];a.traverse(l=>{e.push([l,l.visible]),l.visible=!0});try{t.compile(a,r)}catch(l){console.warn("[journey] compile",l)}for(const[l,v]of e)l.visible=v}Se("Preparing…","checking the headset");const Me=await M();Me==="immersive-ar"?Se("Put your headset on and begin.","You will start in your own room."):Me==="immersive-vr"?Se("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Se("Preview in browser","Open this page in the Quest browser for the full experience.");const i=document.getElementById("begin");i.disabled=!1,i.addEventListener("click",async()=>{i.disabled=!0,z||(Se("Loading the voice…"),await new Promise(e=>{if(z)return e();const l=setInterval(()=>{z&&(clearInterval(l),e())},100);setTimeout(()=>{clearInterval(l),e()},6e3)})),await R()}),window.JOURNEY={THREE:Dt,scene:a,camera:r,renderer:t,stars:g,nebula:u,voidShell:A,motes:F,narrator:k,prana:I,sec3:P,naraka:b,T:ye,SEG2:D,SEG3:S,SEG4:me,seek:e=>{c=e},resume:()=>{c=null},look:(e,l=0)=>{r.rotation.set(l,e,0,"YXZ")},moveTo:(e,l,v)=>{m.position.set(0,0,0),r.position.set(e,l,v)},forceBreath:(e,l)=>{G=e===null?null:[e,l]},fakeLevel:e=>{k.uniforms.uLevel.value=e},dryStart:()=>{se=!0,o=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:T(),xrMode:x,voidOpacity:A.opacity,starEmerge:g.emerge,nebulaEmerge:u.emerge,orbFade:k.fade})},window.__JOURNEY_READY=!0}Ca().catch(s=>{console.error(s),window.__JOURNEY_ERROR=String(s&&s.stack||s),Se("Something went wrong.",String(s))});
