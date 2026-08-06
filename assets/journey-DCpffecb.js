import{G as ft,M as vt}from"./meshopt_decoder.module-HoA6BCbr.js";import{$ as Je,g as B,o as Me,M as D,C as rt,p as je,a3 as Ee,a as L,A as ie,a4 as ze,G as Xe,n as Ce,P as Ve,V as K,N as We,c as it,D as nt,a5 as Pt,a6 as dt,B as Ot,b as Re,I as $e,f as Qe,a7 as Rt,Q as mt,a8 as ht,a9 as pt,Y as Gt,S as It,Z as zt,_ as Nt,x as qt,a0 as Lt}from"./three-LF7EJF-g.js";function _t(u){let t=u>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Vt(u){const t=new Je(500,24,16),o=new B({side:Me,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),s=new D(t,o);return s.frustumCulled=!1,s.renderOrder=-10,u.add(s),{mesh:s,set opacity(p){o.uniforms.uOpacity.value=p},get opacity(){return o.uniforms.uOpacity.value}}}const Bt=`
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
`;function Wt(u,{count:t=5200}={}){const o=_t(20260805),s=new Float32Array(t*3),p=new Float32Array(t),U=new Float32Array(t),x=new Float32Array(t),b=new Float32Array(t*3),f=new rt;for(let S=0;S<t;S++){let P=o()*2-1;const W=o()*Math.PI*2;o()<.42&&(P*=.3);const N=Math.sqrt(Math.max(0,1-P*P)),j=90+o()*320;s[S*3]=Math.cos(W)*N*j,s[S*3+1]=P*j,s[S*3+2]=Math.sin(W)*N*j;const Z=Math.pow(o(),2.4);U[S]=.85+Z*4.2,p[S]=je.clamp(.86-Z*.9+(o()-.5)*.22,0,.9),x[S]=o()*100;const H=o();H>.86?f.setHSL(.07+o()*.04,.55,.72):H>.66?f.setHSL(.12+o()*.03,.22,.85):f.setHSL(.58+o()*.06,.28+o()*.3,.88),b[S*3]=f.r,b[S*3+1]=f.g,b[S*3+2]=f.b}const h=new Ee;h.setAttribute("position",new L(s,3)),h.setAttribute("aDelay",new L(p,1)),h.setAttribute("aSize",new L(U,1)),h.setAttribute("aSeed",new L(x,1)),h.setAttribute("aTint",new L(b,3));const k={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},C=new B({vertexShader:Bt,fragmentShader:Dt,uniforms:k,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}),V=new ze(h,C);V.frustumCulled=!1,V.renderOrder=5;const z=new Xe;return z.add(V),u.add(z),{group:z,uniforms:k,set emerge(S){k.uEmerge.value=S},get emerge(){return k.uEmerge.value},set global(S){k.uGlobal.value=S},update(S,P){k.uTime.value=S,k.uPixel.value=P,z.rotation.y=S*.0042,z.rotation.x=Math.sin(S*.017)*.014}}}const jt=`
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
`;function gt(u,{radius:t=430,scale:o=2.1,gain:s=1,order:p=4}={}){const U=new Je(t,48,32),x={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:o},uGain:{value:s},uHell:{value:0},uBolt:{value:0}},b=new B({side:Me,transparent:!0,depthWrite:!1,depthTest:!0,blending:ie,uniforms:x,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:jt}),f=new D(U,b);return f.frustumCulled=!1,f.renderOrder=p,u.add(f),{mesh:f,set emerge(h){x.uEmerge.value=h},get emerge(){return x.uEmerge.value},set palette(h){x.uPalette.value=h},set full(h){x.uFull.value=h},set radial(h){x.uRadial.value=h},set hell(h){x.uHell.value=h},set bolt(h){x.uBolt.value=h},update(h){x.uTime.value=h}}}const Yt=`
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
`;function Ht(u){const t=new Ce(150,150,240,64,1,!0),o={uTime:{value:0},uEmerge:{value:0}},s=new B({side:Me,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie,uniforms:o,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Yt}),p=new D(t,s);return p.frustumCulled=!1,p.renderOrder=5,u.add(p),{mesh:p,set emerge(U){o.uEmerge.value=U},update(U){o.uTime.value=U,p.rotation.y=U*.006}}}const $t=`
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
`;function Kt(u,{count:t=260,radius:o=3}={}){const s=_t(77003),p=new Float32Array(t*3),U=new Float32Array(t),x=new Float32Array(t);for(let C=0;C<t;C++)p[C*3]=(s()-.5)*o*2.2,p[C*3+1]=.25+s()*2.3,p[C*3+2]=(s()-.5)*o*2.2,U[C]=s(),x[C]=.5+s()*1.4;const b=new Ee;b.setAttribute("position",new L(p,3)),b.setAttribute("aSeed",new L(U,1)),b.setAttribute("aSize",new L(x,1));const f={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},h=new B({vertexShader:$t,fragmentShader:Qt,uniforms:f,transparent:!0,depthWrite:!1,blending:ie}),k=new ze(b,h);return k.frustumCulled=!1,k.renderOrder=3,u.add(k),{points:k,set fade(C){f.uFade.value=C},get fade(){return f.uFade.value},update(C,V){f.uTime.value=C,f.uPixel.value=V}}}const Zt=`
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
`;function Xt(u){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},o=new B({vertexShader:Zt,fragmentShader:Jt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}),s=new D(new Ve(.44,.44),o);s.frustumCulled=!1,s.renderOrder=30,u.add(s);let p=null,U=null,x=0;const b=new K(0,1.35,-1.7),f=new K,h=new K(0,1.35,-1.7);return s.position.copy(h),{mesh:s,uniforms:t,attachAnalyser(k,C){p=k.createAnalyser(),p.fftSize=512,p.smoothingTimeConstant=.55,U=new Uint8Array(p.frequencyBinCount),C.connect(p)},set fade(k){t.uFade.value=k},get fade(){return t.uFade.value},update(k,C,V){t.uTime.value=k,V.getWorldDirection(f),V.getWorldPosition(b),b.addScaledVector(f,1.7);const z=1-Math.exp(-C*5.5);h.lerp(b,z),s.position.set(h.x,h.y+Math.sin(k*.9)*.008,h.z);let S=0;if(p){p.getByteFrequencyData(U);const W=Math.max(8,U.length*.45|0);let v=0;for(let N=2;N<W;N++)v+=U[N];S=Math.min(1,v/(W-2)/132)}const P=S>x?1-Math.exp(-C*22):1-Math.exp(-C*3.2);x+=(S-x)*P,t.uLevel.value=x}}}function ea(u){let t=u>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const ta=`
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
`,ra=`
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
`,ia=`
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
`,wt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function na(u){const t=ea(90210),o=850,s=new Float32Array(o),p=new Float32Array(o*3),U=new Float32Array(o),x=new Float32Array(o),b=new K(0,.05,-1).normalize(),f=new K;for(let A=0;A<o;A++){s[A]=t();do f.set(t()*2-1,t()*2-1,t()*2-1);while(f.lengthSq()>1||f.lengthSq()<.05);f.normalize(),t()<.25&&f.lerp(b,.6).normalize(),p[A*3]=f.x,p[A*3+1]=f.y,p[A*3+2]=f.z,U[A]=2.2+Math.pow(t(),.7)*5.8,x[A]=1.8+t()*3.4}const h=new Ee;h.setAttribute("position",new L(new Float32Array(o*3),3)),h.setAttribute("aSeed",new L(s,1)),h.setAttribute("aDir",new L(p,3)),h.setAttribute("aRad",new L(U,1)),h.setAttribute("aSize",new L(x,1));const k={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new K(0,1.3,-.3)}},C=new ze(h,new B({vertexShader:ta,fragmentShader:aa,uniforms:k,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));C.frustumCulled=!1,C.renderOrder=24,u.add(C);const V=700,z=new Float32Array(V),S=new Float32Array(V*3);for(let A=0;A<V;A++){z[A]=t();do f.set(t()*2-1,t()*2-1,t()*2-1);while(f.lengthSq()>1||f.lengthSq()<.05);f.normalize(),S[A*3]=f.x,S[A*3+1]=f.y,S[A*3+2]=f.z}const P=new Ee;P.setAttribute("position",new L(new Float32Array(V*3),3)),P.setAttribute("aSeed",new L(z,1)),P.setAttribute("aDir",new L(S,3));const W={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new K(0,1.3,-.3)},uFwd:{value:new K(0,0,-1)}},v=new ze(P,new B({vertexShader:oa,fragmentShader:ra,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));v.frustumCulled=!1,v.renderOrder=25,u.add(v);const N={uTime:{value:0},uCore:{value:0},uIn:{value:0}},j=new D(new Ve(16,16),new B({vertexShader:wt,fragmentShader:ia,uniforms:N,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));j.position.set(0,2.5,-14),j.frustumCulled=!1,j.renderOrder=6,u.add(j);const Z={uTime:{value:0},uCore:{value:0}},H=new D(new Ve(5,90),new B({vertexShader:wt,fragmentShader:`
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
      `,uniforms:Z,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));H.position.set(0,2.5,-14.2),H.frustumCulled=!1,H.renderOrder=5,u.add(H);const me=new K,fe=new K;let te=0,le=0;return{get breathing(){return Math.max(te,le)},set core(A){N.uCore.value=A,Z.uCore.value=A},set field(A){k.uField.value=A},gateIn:0,gateOut:0,update(A,se,$,ne){const ge=1-Math.exp(-se*(this.gateIn>te?3.2:1.8));te+=(this.gateIn-te)*ge;const we=1-Math.exp(-se*(this.gateOut>le?9:4));le+=(this.gateOut-le)*we,$.getWorldPosition(me),$.getWorldDirection(fe),me.addScaledVector(fe,.12),me.y-=.05,k.uTime.value=A,k.uPixel.value=ne,k.uIn.value=te,k.uNose.value.copy(me),W.uTime.value=A,W.uPixel.value=ne,W.uOut.value=le,W.uNose.value.copy(me),W.uFwd.value.copy(fe),N.uTime.value=A,N.uIn.value=te,Z.uTime.value=A}}}const la=`
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
`,xt=`
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
`;function be(u,t,o,s,{blending:p=ie,order:U=8}={}){const x=new B({vertexShader:la,fragmentShader:o,uniforms:s,transparent:!0,depthWrite:!1,depthTest:!1,blending:p,side:nt}),b=new D(new Ve(u,t),x);return b.frustumCulled=!1,b.renderOrder=U,b}function wa(u){const t=new Xe;u.add(t);const o={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},s=sa,p=ca.replace("__COMMON__",s).replace("__NOISE__",Ke),U=ua.replace("__COMMON__",s).replace("__NOISE__",Ke),x=340,b=285,f=-190,h=62,k=be(x,b,p,o,{blending:We,order:7});k.position.set(0,h,f),t.add(k);const C=be(x,b,U,o,{order:8});C.position.set(0,h,f),t.add(C);const V=new K(0,h+.38*(b/2),f),z=be(34,34,fa,{uTime:o.uTime,uForm:{value:0}},{order:8});z.position.set(95,130,-180),t.add(z);const S=be(70,70,xt,{uTime:o.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});S.position.set(-150,45,-175),t.add(S);const P=be(44,44,xt,{uTime:o.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});P.position.set(150,20,-165),t.add(P);const W={uForm:{value:0}},v=new D(new Ce(90,90,34,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ma,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:We,side:Me}));v.position.y=-14,v.renderOrder=9,v.frustumCulled=!1,t.add(v);const N={uTime:o.uTime,uForm:{value:0}},j=new D(new Ce(110,110,60,96,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ha,uniforms:N,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie,side:Me}));j.position.y=-12,j.renderOrder=6,j.frustumCulled=!1,t.add(j);const Z=420,H=new Float32Array(Z*3),me=new Float32Array(Z);for(let a=0;a<Z;a++){const e=Math.random()*Math.PI*2,l=40+Math.random()*55;H[a*3]=Math.cos(e)*l,H[a*3+1]=-20+Math.random()*30,H[a*3+2]=Math.sin(e)*l,me[a]=Math.random()}const fe=new Ee;fe.setAttribute("position",new L(H,3)),fe.setAttribute("aSeed",new L(me,1));const te={uTime:o.uTime,uForm:{value:0},uPixel:{value:1}},le=new ze(fe,new B({vertexShader:`
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
    `,uniforms:te,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));le.frustumCulled=!1,le.renderOrder=9,t.add(le);const A={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new it(1,-.1)},uSpin:{value:.05},uTint:{value:new rt(.45,.62,1)}},se={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new it(-1,.12)},uSpin:{value:-.065},uTint:{value:new rt(1,.58,.22)}},$=be(175,175,yt,A,{order:22}),ne=be(150,150,yt,se,{order:22});$.position.set(-62,20,-120),ne.position.set(62,32,-125),u.add($),u.add(ne),$.visible=ne.visible=!1;const ge=(a,e)=>{const l={uTime:{value:0},uShow:{value:0}},d=be(430,330,`
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
        gl_FragColor = vec4(vec3(${a}) * a * 1.6, a);
      }
    `,l,{order:21});return d.position.set(e,26,-160),u.add(d),d.visible=!1,{u:l,m:d}},we=ge("0.30, 0.45, 0.95",-120),_e=ge("0.95, 0.42, 0.12",120),ce={uTime:{value:0},uWall:{value:0}},ue=be(60,300,`
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
  `,ce,{order:24});ue.position.set(0,24,-130),u.add(ue),ue.visible=!1;const re={uTime:{value:0},uRing:{value:0}},r=be(420,420,da,re,{order:23});r.position.set(0,24,-138),u.add(r),r.visible=!1;const c={uTime:{value:0},uLife:{value:0}},m=be(90,90,va,c,{order:22});m.position.set(0,24,-138),u.add(m),m.visible=!1;const _={uTime:{value:0},uGrow:{value:0}},i=be(7,7,ga,_,{order:26});i.position.set(0,1.5,-9),u.add(i);const g={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},F=new D(new Ce(3.2,3.2,130,40,1,!0),new B({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:pa,uniforms:g,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie,side:Me}));F.rotation.x=Math.PI/2,F.position.set(0,1.5,-20),F.renderOrder=27,F.frustumCulled=!1,u.add(F);const E={uBlack:{value:0},uWhite:{value:0}},n=new D(new Je(.6,16,12),new B({vertexShader:`
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
      `,uniforms:E,transparent:!0,depthWrite:!1,depthTest:!1,blending:We,side:Me}));n.renderOrder=50,n.frustumCulled=!1,u.add(n);const T=1400,O=new Float32Array(T*3),R=new Float32Array(T*3),q=new Float32Array(T);{const a=d=>d*(x/2),e=d=>h+d*(b/2),l=[];for(let d=0;d<3;d++)for(let G=0;G<200;G++){const X=(Math.random()*2-1)*.46;l.push([a(X),e(.3+d*.14+X*X*.1),f+2])}for(let d=-1;d<=1;d+=2)for(let G=0;G<130;G++){const X=(Math.random()*2-1)*.14;l.push([a(d*.3+X),e(-.1+.03-X*X*1.6),f+2])}for(let d=0;d<220;d++){const G=Math.random()*Math.PI*2;l.push([a(Math.cos(G)*.062),e(.38+Math.sin(G)*.155),f+2])}for(let d=0;d<160;d++){const G=.3-Math.random()*.75;l.push([a((Math.random()*2-1)*.05),e(G),f+2])}for(;l.length<T;)l.push(l[Math.random()*l.length|0]);for(let d=0;d<T;d++){const G=l[d%l.length],X=Math.random()*Math.PI*2,ve=(Math.random()-.35)*1.8,de=260+Math.random()*160;O[d*3]=Math.cos(X)*Math.cos(ve)*de,O[d*3+1]=60+Math.sin(ve)*de*.7,O[d*3+2]=-80+Math.sin(X)*Math.cos(ve)*de*.5-80,R[d*3]=G[0],R[d*3+1]=G[1],R[d*3+2]=G[2],q[d]=Math.random()}}const J=new Ee;J.setAttribute("position",new L(O,3)),J.setAttribute("aEnd",new L(R,3)),J.setAttribute("aSeed",new L(q,1));const ae={uTime:{value:0},uForm:o.uForm,uPixel:{value:1}},I=new ze(J,new B({vertexShader:`
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
    `,uniforms:ae,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie}));return I.frustumCulled=!1,I.renderOrder=9,t.add(I),t.visible=!1,{group:t,eyeWorld:V,set collide(a){const e=a>.001&&a<1;$.visible=ne.visible=e,we.m.visible=_e.m.visible=e,ue.visible=a>.8&&a<.995,A.uShow.value=se.uShow.value=Math.min(1,a*4),we.u.uShow.value=_e.u.uShow.value=Math.min(1,a*3)*(1-a*.3),ce.uWall.value=Math.max(0,(a-.8)/.2),A.uTidal.value=se.uTidal.value=Math.pow(a,1.6);const l=62*(1-Math.pow(a,1.7)*.88);$.position.x=-l,ne.position.x=l,ne.position.y=32-Math.pow(a,1.7)*12,we.m.position.x=-120+Math.pow(a,1.7)*55,_e.m.position.x=120-Math.pow(a,1.7)*55},set flash(a){E.uWhite.value=a},set ring(a){re.uRing.value=a,r.visible=a>.002&&a<.999},set remnant(a){c.uLife.value=a,m.visible=a>.002},set tunnelEnd(a){g.uEnd.value=a},set flare(a){o.uFlare.value=a},set fireSurge(a){N.uForm.value=Math.min(1.6,N.uForm.value*(1+a))},set portal(a){_.uGrow.value=a,i.visible=a>.002},set rush(a){g.uRush.value=a,F.visible=a>.002},set form(a){o.uForm.value=a,t.visible=a>.001||o.uSuck.value>.001,z.material.uniforms.uForm.value=Math.min(1,a*2.2),S.material.uniforms.uForm.value=Math.min(1,Math.max(0,a*1.8-.15)),P.material.uniforms.uForm.value=Math.min(1,Math.max(0,a*1.8-.25)),W.uForm.value=Math.min(1,a*2.6),N.uForm.value=Math.min(1,Math.max(0,a*2.2-.2)),te.uForm.value=Math.min(1,Math.max(0,a*2-.3))},set open(a){o.uOpen.value=a},set suck(a){o.uSuck.value=a;const e=1+a*a*7;t.scale.setScalar(e),t.position.copy(V).multiplyScalar(1-e)},set black(a){E.uBlack.value=a},update(a,e,l){o.uTime.value=a,_.uTime.value=a,g.uTime.value=a,A.uTime.value=a,se.uTime.value=a,we.u.uTime.value=a,_e.u.uTime.value=a,ce.uTime.value=a,re.uTime.value=a,c.uTime.value=a,ae.uTime.value=a,ae.uPixel.value=e,te.uPixel.value=e,n.visible!==E.uBlack.value>.003&&(n.visible=E.uBlack.value>.003),l.getWorldPosition(n.position),F.position.x=n.position.x,F.position.y=n.position.y}}}const Ie=`
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
`,bt=`
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
`,xa=`
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
`,ya=`
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
    vec3 col = stone + vec3(1.0, 0.26, 0.03) * crackLine * pulse * 0.62 * uFire;
    float speck = smoothstep(0.965, 0.995, noise(p * 7.0));
    col += vec3(1.0, 0.45, 0.10) * speck * (0.3 + crackLine) * pulse * uFire * 0.9;
    // the whole slab drinks a little of the furnace light
    col += vec3(0.30, 0.07, 0.02) * (0.22 + 0.18 * pulse) * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    gl_FragColor = vec4(col, 1.0);
  }
`,ba=`
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
    float a = glow * (0.45 + 0.45 * lick) * uForm * 1.0;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`,St=`
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
    float a = core * (streaks * 1.5 + 0.22) * vf * uForm * 1.45;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.0, a);
  }
`,Ta=`
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
`,Fa=`
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
    vec3 fire = mix(vec3(0.75, 0.16, 0.03), vec3(1.0, 0.55, 0.16), fbm(p * 3.0 + uTime * 0.05));
    vec3 white = vec3(1.0, 0.98, 0.92);
    vec3 glowCol = mix(fire, white, uRelease);
    float flicker = mix(0.7 + 0.3 * fbm(vec2(uTime * 0.4, p.y * 3.0)), 1.0, uRelease);
    vec3 col = glowCol * arch * flicker * (0.55 + uRelease * 1.55);
    col = mix(col, vec3(0.010, 0.005, 0.006), towers);
    float a = max(arch * (0.60 + uRelease * 0.40), towers * 0.92) * uForm;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`;function Ge(u,t,o,s,{blending:p=ie,order:U=8,vert:x=Ze,side:b=nt}={}){const f=new B({vertexShader:x,fragmentShader:o.replace("__NOISE__",Ie),uniforms:s,transparent:!0,depthWrite:!1,blending:p,side:b}),h=new D(new Ve(u,t),f);return h.frustumCulled=!1,h.renderOrder=U,h}function Ma(u){const t=new Xe;t.visible=!1,u.add(t);const o=[],s=[],p={uTime:{value:0},uForm:{value:0},uBolt:{value:0},uDie:{value:0}},U=new D(new Je(380,40,24),new B({side:Me,transparent:!0,depthWrite:!1,uniforms:p,vertexShader:`
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
      `.replace("__NOISE__",Ie)}));U.renderOrder=-5,U.frustumCulled=!1,t.add(U);const x={uTime:{value:0},uFire:{value:1}};o.push(x),s.push(x);const b=new D(new Ve(760,760,1,1),new B({uniforms:x,vertexShader:`
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
      `.replace("__NOISE__",Ie)}));b.rotation.x=-Math.PI/2,b.position.y=-1.6,b.renderOrder=-4,b.frustumCulled=!1,t.add(b);{const r=`
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
    `.replace("__NOISE__",Ie);for(let c=0;c<3;c++){const m={uTime:{value:0},uForm:{value:1},uSeed:{value:c*.41}};o.push(m),s.push(m);const _=Ge(140,40,r,m,{order:8});_.position.set(0,12,-60-c*45),t.add(_)}}const f=new Pt(4858382,2.6);t.add(f);const h=[];for(let r=0;r<4;r++){const c=new dt(16734744,34,44,1.7);t.add(c),h.push(c)}const k={uTime:{value:0},uFire:{value:1}};o.push(k),s.push(k);const C=new D(new Ot(3.6,.35,170),new B({vertexShader:Ze,fragmentShader:ya.replace("__NOISE__",Ie),uniforms:k}));C.position.set(0,-.18,-70),t.add(C);const V=new Ce(.055,.075,.95,7),z=new Re({color:1511436,roughness:.9}),S=new $e(V,z,68),P=new Qe;let W=0;for(let r=4;r>=-148;r-=4.5)for(const c of[-1.9,1.9]){if(W>=68)break;P.makeTranslation(c,.45,r),S.setMatrixAt(W++,P)}S.instanceMatrix.needsUpdate=!0,t.add(S);for(const[r,c,m,_]of[[210,90,.75,3],[330,150,.9,2]]){const i={uForm:{value:1},uTall:{value:m}},g=new D(new Ce(r,r,c,96,1,!0),new B({vertexShader:Ze,fragmentShader:ba,uniforms:i,transparent:!0,depthWrite:!1,side:Me}));g.position.y=c*.32,g.renderOrder=_,g.frustumCulled=!1,t.add(g)}const v={uTime:{value:0},uForm:{value:1}};o.push(v),s.push(v);const N=new D(new Ce(360,360,200,96,1,!0),new B({vertexShader:Ze,fragmentShader:Sa.replace("__NOISE__",Ie),uniforms:v,transparent:!0,depthWrite:!1,depthTest:!1,blending:ie,side:Me}));N.position.y=30,N.renderOrder=1,N.frustumCulled=!1,t.add(N);{const r=new Rt(1,1,7,3,!0);r.translate(0,.5,0);const c=new B({vertexShader:`
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
      `.replace("__NOISE__",Ie),uniforms:{uTime:{value:0},uFire:{value:1}}});o.push(c.uniforms),s.push(c.uniforms);const m=68,_=new $e(r,c,m),i=new Qe;let g=99;const F=()=>(g=g*1664525+1013904223>>>0,g/4294967296);for(let E=0;E<m;E++){const T=(E%2===0?-1:1)*(9+F()*55),O=15-F()*195,R=7+F()*28,q=1.4+F()*3.2;i.compose(new K(T,-1,O),new mt().setFromEuler(new ht((F()-.5)*.22,F()*6.28,(F()-.5)*.22)),new K(q,R,q)),_.setMatrixAt(E,i)}_.instanceMatrix.needsUpdate=!0,_.frustumCulled=!1,t.add(_)}{const r=[],c=[],m=[];for(const F of[-1.9,1.9]){const E=F>0?-1:1;for(let n=4;n>=-148+4.5;n-=4.5){const T=n-4.5;for(let O=0;O<7;O++){const R=O/7,q=(O+1)/7,J=.88-Math.sin(R*Math.PI)*.24,ae=.88-Math.sin(q*Math.PI)*.24,I=n+(T-n)*R,a=n+(T-n)*q,e=r.length/3;r.push(F,J-.034,I,F,J+.034,I,F,ae+.034,a,F,ae-.034,a);for(let l=0;l<4;l++)c.push(E,0,0);m.push(e,e+1,e+2,e,e+2,e+3)}}}const i=new Ee;i.setAttribute("position",new pt(r,3)),i.setAttribute("normal",new pt(c,3)),i.setIndex(m);const g=new D(i,new Re({color:1708555,roughness:.55,metalness:.65,side:nt}));g.frustumCulled=!1,t.add(g)}{const r=[];for(let T=4;T>=-148;T-=4.5)for(const O of[-1.9,1.9]){if(r.length>=68)break;r.push([O,1.08,T])}const c=r.length,m=new Float32Array(c*4*3),_=new Float32Array(c*4*2),i=new Float32Array(c*4),g=[];r.forEach(([T,O,R],q)=>{const J=q*.61803%1,ae=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let a=0;a<4;a++){const e=q*4+a;m.set([T,O,R],e*3),_.set(ae[a],e*2),i[e]=J}const I=q*4;g.push(I,I+1,I+2,I,I+2,I+3)});const F=new Ee;F.setAttribute("aCenter",new L(m,3)),F.setAttribute("aCorner",new L(_,2)),F.setAttribute("aSeed",new L(i,1)),F.setAttribute("position",new L(new Float32Array(c*4*3),3)),F.setIndex(g);const E={uTime:{value:0},uFire:{value:1}};o.push(E),s.push(E);const n=new D(F,new B({uniforms:E,transparent:!0,depthWrite:!1,blending:ie,vertexShader:`
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
      `.replace("__NOISE__",Ie)}));n.renderOrder=9,n.frustumCulled=!1,t.add(n)}{const c=new Float32Array(2160),m=new Float32Array(720);let _=7;const i=()=>(_=_*1664525+1013904223>>>0,_/4294967296);for(let n=0;n<720;n++)c[n*3]=(i()*2-1)*75,c[n*3+1]=i()*34,c[n*3+2]=20-i()*215,m[n]=i();const g=new Ee;g.setAttribute("position",new L(c,3)),g.setAttribute("aSeed",new L(m,1));const F={uTime:{value:0},uFire:{value:1}};o.push(F),s.push(F);const E=new ze(g,new B({uniforms:F,transparent:!0,depthWrite:!1,blending:ie,vertexShader:`
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
      `}));E.renderOrder=7,E.frustumCulled=!1,t.add(E)}const j=[];for(let r=0;r<18;r++){const c={uTime:{value:0},uForm:{value:1},uSeed:{value:r/18}};o.push(c),s.push(c);const m=Ge(8+r%3*3,170+r%4*30,St,c,{order:4}),_=r/18*Math.PI*2+.4,i=95+r%4*48;m.position.set(Math.cos(_)*i,55,Math.sin(_)*i-40),m.rotation.y=-_+Math.PI/2,t.add(m),j.push(m)}const Z={uTime:{value:0},uWatch:{value:0}},H={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new it(0,0)}};o.push(Z,H);const me=Ge(150,110,Ta,Z,{blending:We,order:5});me.position.set(0,78,-235),t.add(me);const fe=Ge(150,110,_a,H,{order:6});fe.position.set(0,78,-234),t.add(fe);const te={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};o.push(te);const le=Ge(14,68,St,te,{order:5});le.position.set(0,26,-232),t.add(le);const A={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};o.push(A);const se=Ge(22,28,Fa,A,{blending:We,order:5});se.position.set(0,10,-168),t.add(se),new ft().setMeshoptDecoder(vt).load("assets/models/gate.glb",r=>{let c=null;if(r.scene.traverse(T=>{T.isMesh&&!c&&(c=T)}),!c)return;const m=c.geometry;m.computeBoundingBox();const _=m.boundingBox,i=new K;_.getSize(i);const g=46/i.x,F=c.material&&c.material.map?new Re({map:c.material.map,roughness:.9,color:7034440}):new Re({color:2102288,roughness:.92}),E=new D(m,F);E.scale.setScalar(g),E.position.set(-(_.min.x+_.max.x)*.5*g,-_.min.y*g-.4,-166),E.frustumCulled=!1,t.add(E);const n=new dt(16730640,55,90,1.8);n.position.set(0,16,-158),t.add(n),h.push(n)});const $=[];for(let r=0;r<14;r++){const c=r%2===0?-1:1,m=-6-r*10.5-r%3*1.5;$.push(new K(c*(4+r%3*.8),0,m))}const ne=[],ge=[],we=[];let _e=1.45,ce=null;const ue=new ft().setMeshoptDecoder(vt);ue.load("assets/models/cauldron.glb",r=>{let c=null;if(r.scene.traverse(I=>{I.isMesh&&!c&&(c=I)}),!c)return;const m=c.geometry;m.computeBoundingBox();const _=m.boundingBox,i=new K;_.getSize(i);const g=3.1/Math.max(i.x,i.z),F=new Re({color:2299922,roughness:.93,metalness:.25}),E=new $e(m,F,$.length),n=new Qe;$.forEach((I,a)=>{n.compose(new K(I.x,-_.min.y*g-.15,I.z),new mt().setFromEuler(new ht(0,a*1.7%6.28,0)),new K(g,g,g)),E.setMatrixAt(a,n)}),E.instanceMatrix.needsUpdate=!0,E.frustumCulled=!1,t.add(E);const T=new Ce(2.1,2.6,1.6,9),O=new Re({color:1182215,roughness:1}),R=new $e(T,O,$.length),q=new Qe;$.forEach((I,a)=>{q.makeTranslation(I.x,-.9,I.z),R.setMatrixAt(a,q)}),R.instanceMatrix.needsUpdate=!0,R.frustumCulled=!1,t.add(R);const J=i.y*g;_e=J,ce&&ce();const ae=`
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
    `;$.forEach((I,a)=>{const e={uTime:{value:0},uFire:{value:1},uSeed:{value:a*.37%1}};o.push(e),s.push(e);const l=Ge(4,5,xa,e,{order:9,vert:bt});l.position.set(I.x,J+1.45,I.z),t.add(l);const d={uTime:{value:0},uFire:{value:1},uSeed:{value:a*.71%1}};o.push(d),s.push(d);const G=Ge(4.6,4.6,ae,d,{order:8,vert:bt});G.position.set(I.x,J+.55,I.z),t.add(G)}),h.forEach((I,a)=>{const e=$[a*3]||$[0];I.position.set(e.x,J+1,e.z)})}),ue.load("assets/models/figure.glb",r=>{let c=null;if(r.scene.traverse(n=>{n.isMesh&&!c&&(c=n)}),!c)return;const m=c.geometry;m.computeBoundingBox();const _=new K;m.boundingBox.getSize(_);const i=1.75/_.y,g=new Re({color:1182472,roughness:1});for(let n=0;n<$.length;n++){const T=(n<8?2:1)+n%2;for(let O=0;O<T;O++){const R=new D(m,g),q=$[n],J=n*2.1+O*2.4,ae=-.38-O*.16;R.scale.setScalar(i*(.85+O*.1)),R.position.set(q.x+Math.cos(J)*.42,_e+ae,q.z+Math.sin(J)*.42),R.rotation.y=(n*2.1+O*2.8)%6.28,R.frustumCulled=!1,t.add(R),ne.push({mesh:R,seed:n*1.3+O*7.7,baseY:R.position.y,dy:ae,pot:n})}}ce=()=>{for(const n of ne){if(n.pot===void 0)continue;const T=_e+n.dy;n.mesh.position.y+=T-n.baseY,n.baseY=T}},ce();const F=new Ce(.55,.78,2.6,8),E=new Re({color:1511432,roughness:1});for(let n=0;n<4;n++){const T=n%2?1:-1,O=-22-n*26,R=new D(F,E);R.position.set(T*3.7,.3,O),t.add(R);const q=new D(m,g);q.scale.setScalar(i*1.12),q.position.set(T*3.7,1.6,O),q.rotation.y=T>0?-1.25:1.25,q.frustumCulled=!1,t.add(q)}for(let n=0;n<6;n++){const T=new D(m,g);T.scale.setScalar(i*2.2),T.frustumCulled=!1,t.add(T),ge.push({mesh:T,col:j[n*3],seed:n*3.3})}for(let n=0;n<8;n++){const T=new D(m,g);T.scale.setScalar(i*(1.3+n%3*.3)),T.frustumCulled=!1,t.add(T);const O=n/8*Math.PI*2+1.1,R=26+n%4*11;we.push({mesh:T,x:Math.cos(O)*R,z:Math.sin(O)*R-55,seed:n*5.1,speed:.1+n%3*.03})}});const re=new K;return{group:t,set reveal(r){t.visible=r>.002,p.uForm.value=r},set watch(r){Z.uWatch.value=r,H.uWatch.value=r,te.uForm.value=r*.45*(1-A.uRelease.value)},set bolt(r){H.uBolt.value=r,p.uBolt.value=r},set release(r){p.uDie.value=r;for(const m of s)m.uFire&&(m.uFire.value=1-r);for(const m of s)m.uForm&&(m.uForm.value=1-r*.85);A.uRelease.value=r;const c=1-r*.9;f.intensity=1.6*c+r*2.2,f.color.setRGB(.19+r*.7,.09+r*.75,.04+r*.8);for(const m of h)m.intensity=20*c},update(r,c){for(const i of o)i.uTime&&(i.uTime.value=r);p.uTime.value=r,c.getWorldPosition(re);const m=je.clamp((re.x-0)/60,-1,1),_=je.clamp((re.y-40)/90,-1,.4);H.uLook.value.set(m,_);for(const i of ne){const g=Math.sin(r*.9+i.seed);i.mesh.rotation.z=g*.17,i.mesh.rotation.x=Math.sin(r*.6+i.seed*1.7)*.13,i.mesh.position.y=i.baseY+Math.sin(r*.5+i.seed)*.13}for(const i of we){const g=(r*i.speed+i.seed)%1;i.mesh.position.set(i.x,70-g*95,i.z),i.mesh.rotation.set(r*.9+i.seed,i.seed,r*.6)}for(const i of ge){const g=(r*.14+i.seed)%1;i.mesh.position.copy(i.col.position),i.mesh.position.y=140-g*170,i.mesh.rotation.set(r*.8+i.seed,r*.5,r*.7+i.seed)}for(let i=0;i<h.length;i++){const g=h[i];g.intensity>.2&&(g.intensity=g.intensity*.92+(16+Math.sin(r*7+i*2.3)*3+Math.sin(r*13.7+i)*2)*.08)}}}}const Se={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},oe=116,Y={start:oe,url:"assets/audio/journey_02.mp3",starsOut:[oe+5,oe+17],palette:[oe+6,oe+21],full:[oe+6,oe+23],curtains:[oe+10,oe+26],core:[oe+18.5,oe+24.5],field:[oe+20,oe+28],breathIn:[oe+28.9,oe+33.3],breathOut:[oe+33.6,oe+38.5],loopFrom:oe+66,loopPeriod:11.5,loopAmp:.62},Le=oe+63.5,ee=Le+11,M={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:ee,portal:[Le,Le+2.5],tunnel:[Le+2.3,Le+9.6],arrive:Le+9.6,collide:[ee+.2,ee+6.6],blast:ee+6.85,remnant:[ee+7.2,ee+16],world:[ee+9,ee+16.5],drumFrom:ee+23.5,form:[ee+32.2,ee+47.5],flare:[ee+48.4,ee+51],open:[ee+60.8,ee+65.5],suck:[ee+64.5,ee+70.5],black:[ee+69.5,ee+71.5]},he=ee+73,pe={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:he+2,reveal:[he,he+4.5],walk:[he+3,he+62],watch:[he+24.4,he+30.5],mantra:he+57.2,release:[he+57.2,he+61.5],white:[he+59.5,he+64.5],end:he+68},Aa="assets/audio/journey_01.mp3",qe=4,ka=[82.5,88.5],Tt=(u,t,o)=>u+(t-u)*o,w=(u,[t,o])=>je.clamp((u-t)/(o-t),0,1),y=u=>u*u*(3-2*u);function Fe(u,t){const o=document.getElementById("status");o&&(o.textContent=u);const s=document.getElementById("substatus");s&&t!==void 0&&(s.textContent=t)}function Ua(u,t){const o=u.createGain();o.gain.value=0,o.connect(t);const s=u.createBiquadFilter();s.type="lowpass",s.frequency.value=220,s.Q.value=.6,s.connect(o);for(const[p,U]of[[38,.55],[57,.28],[76.4,.18]]){const x=u.createOscillator();x.type="sine",x.frequency.value=p;const b=u.createGain();b.gain.value=U,x.connect(b).connect(s),x.start()}return{set level(p){o.gain.setTargetAtTime(p*.09,u.currentTime,.25)}}}async function Ca(){Fe("Preparing…","starting the engine");const u=document.getElementById("view"),t=new Gt({canvas:u,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=It,t.toneMapping=zt,t.toneMappingExposure=1.15;const o=new Nt;o.background=null;const s=new qt(70,window.innerWidth/window.innerHeight,.05,900);s.position.set(0,1.35,0);const p=new Xe;p.add(s),o.add(p),Fe("Preparing…","building the sky");const U=Vt(o),x=Wt(o),b=gt(x.group,{radius:460,scale:.85,gain:.7,order:-2}),f=gt(x.group,{radius:300,scale:1.9,gain:1,order:-1}),h=Ht(x.group),k=Kt(o),C=Xt(o),V=na(o);Fe("Preparing…","building the worlds");const z=wa(o),S=Ma(o);window.addEventListener("resize",()=>{s.aspect=window.innerWidth/window.innerHeight,s.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const P=new Audio;P.src=Aa,P.preload="auto",P.crossOrigin="anonymous";let W=!1;P.addEventListener("canplaythrough",()=>{W=!0},{once:!0}),P.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),W=!0},{once:!0});let v=null,N=null,j=null,Z=null,H=null;function me(){if(!v)try{v=new(window.AudioContext||window.webkitAudioContext);const e=v.createGain();e.gain.value=1,e.connect(v.destination);const l=v.createMediaElementSource(P);j=v.createGain(),j.gain.value=1,l.connect(j).connect(e),C.attachAnalyser(v,j),N=Ua(v,e);const d=v.sampleRate*2,G=v.createBuffer(1,d,v.sampleRate),X=G.getChannelData(0);for(let Pe=0;Pe<d;Pe++)X[Pe]=Math.random()*2-1;const ve=v.createBufferSource();ve.buffer=G,ve.loop=!0;const de=v.createBiquadFilter();de.type="bandpass",de.frequency.value=320,de.Q.value=.7,Z=v.createGain(),Z.gain.value=0,ve.connect(de).connect(Z).connect(e),ve.start(),H=Pe=>{const Ae=v.currentTime;for(const[xe,Be,et]of[[0,58,.5],[.19,46,.34]]){const Oe=v.createOscillator();Oe.type="sine",Oe.frequency.setValueAtTime(Be*1.6,Ae+xe),Oe.frequency.exponentialRampToValueAtTime(Be,Ae+xe+.06);const ke=v.createGain();ke.gain.setValueAtTime(0,Ae+xe),ke.gain.linearRampToValueAtTime(et*Pe*.4,Ae+xe+.012),ke.gain.exponentialRampToValueAtTime(1e-4,Ae+xe+.3),Oe.connect(ke).connect(e),Oe.start(Ae+xe),Oe.stop(Ae+xe+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let fe=null,te=null,le=!1,A=null,se=null,$=!1,ne=null,ge=null,we=!1;async function _e(){try{const l=await(await fetch(Y.url)).arrayBuffer();v&&(fe=await v.decodeAudioData(l))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const l=await(await fetch(M.voiceUrl)).arrayBuffer();v&&(A=await v.decodeAudioData(l))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const l=await(await fetch(pe.voiceUrl)).arrayBuffer();v&&(ne=await v.decodeAudioData(l))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let ce=!1,ue=0;P.addEventListener("loadedmetadata",()=>{isFinite(P.duration)&&P.duration});let re=null,r=-qe,c=0;function m(){if(!ce)return-qe;if(ge!==null&&!we&&v){const e=pe.voiceAt+(v.currentTime-ge);return ue=performance.now()/1e3-e,e}if(se!==null&&!$&&v){const e=M.voiceAt+(v.currentTime-se);return ue=performance.now()/1e3-e,e}if(te!==null&&!le&&v){const e=Y.start+(v.currentTime-te);return ue=performance.now()/1e3-e,e}return!P.ended&&P.currentTime>.01?(ue=performance.now()/1e3-P.currentTime,P.currentTime):performance.now()/1e3-ue}function _(){if(re!==null)return re;const e=m(),l=performance.now()/1e3,d=Math.min(.1,Math.max(5e-4,l-c));c=l;const G=e-r;return Math.abs(G)>2.5?r=e:r+=G*Math.min(1,d*(Math.abs(G)>.05?3:60)),r}let i="flat";async function g(){if(!navigator.xr)return null;const e=l=>Promise.race([l.catch(()=>!1),new Promise(d=>setTimeout(()=>d(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function F(){me(),v&&v.state==="suspended"&&await v.resume(),_e();const e=await g();if(e){const l={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const d=await navigator.xr.requestSession(e,l);await t.xr.setSession(d),i=e,d.addEventListener("end",()=>{i="flat"})}catch(d){console.warn("[journey] could not start",e,d)}}document.body.classList.add("started"),ce=!0,ue=performance.now()/1e3+qe,setTimeout(()=>{P.play().catch(l=>console.warn("[journey] autoplay blocked",l))},qe*1e3)}let E=null;function n(e){if(E)return E;let l=y(w(e,[Y.breathIn[0],Y.breathIn[0]+1.6]))*(1-y(w(e,[Y.breathIn[1],Y.breathIn[1]+1]))),d=y(w(e,[Y.breathOut[0],Y.breathOut[0]+.25]))*(1-y(w(e,[Y.breathOut[0]+.55,Y.breathOut[0]+1.2])));if(e>Y.loopFrom&&e<M.collide[0]){const G=(e-Y.loopFrom)%Y.loopPeriod,X=Y.loopAmp,ve=X*y(w(G,[0,1.8]))*(1-y(w(G,[4.4,5.6]))),de=X*y(w(G,[6,6.3]))*(1-y(w(G,[6.7,7.4])));l=Math.max(l,ve),d=Math.max(d,de)}return[l,d]}const T=new K;let O=-qe,R=0,q=0,J=-1,ae=0;t.setAnimationLoop(()=>{const e=_(),l=je.clamp(e-O,.001,.1);O=e;const d=t.getContext(),G=Math.max(.5,d.drawingBufferHeight/900),X=t.xr.isPresenting?t.xr.getCamera():s;if(ce&&te===null&&fe&&v&&e>=Y.start&&re===null){const Q=v.createBufferSource();Q.buffer=fe,Q.connect(j),Q.onended=()=>{le=!0},Q.start(),te=v.currentTime}if(ce&&se===null&&A&&v&&e>=M.voiceAt&&re===null){const Q=v.createBufferSource();Q.buffer=A,Q.connect(j),Q.onended=()=>{$=!0},Q.start(),se=v.currentTime}if(ce&&ge===null&&ne&&v&&e>=pe.voiceAt&&re===null){const Q=v.createBufferSource();Q.buffer=ne,Q.connect(j),Q.onended=()=>{we=!0},Q.start(),ge=v.currentTime}const[ve,de]=n(e);y(w(e,M.portal))*(1-y(w(e,[M.tunnel[0]+1,M.tunnel[0]+2])));const Pe=y(w(e,[M.tunnel[0],M.tunnel[0]+1.6]))*(1-y(w(e,[M.tunnel[1]-1.4,M.tunnel[1]]))),Ae=y(w(e,[M.tunnel[1]-2.6,M.tunnel[1]-.3])),xe=y(w(e,M.collide)),Be=y(w(e,[M.blast,M.blast+.25]))*(1-y(w(e,[M.blast+.5,M.blast+1.6]))),et=w(e,[M.blast,M.blast+3.6]),Oe=y(w(e,[M.remnant[0],M.remnant[0]+.8]))*(1-y(w(e,[M.remnant[1]-3,M.remnant[1]]))),ke=y(w(e,M.form)),Ft=y(w(e,M.world)),Mt=y(w(e,[M.flare[0],M.flare[0]+.7]))*(1-y(w(e,[M.flare[1]-.6,M.flare[1]+1.2]))),tt=y(w(e,M.open)),Ue=y(w(e,M.suck)),lt=y(w(e,M.black)),Te=y(w(e,[M.tunnel[0]+.5,M.tunnel[0]+4.5])),At=y(w(e,[M.arrive-.5,M.arrive+3])),ye=y(w(e,pe.reveal)),kt=y(w(e,pe.walk)),Ut=y(w(e,pe.watch)),De=y(w(e,pe.release)),Ye=y(w(e,pe.white));z.collide=xe,z.ring=et,z.rush=Pe,z.tunnelEnd=Ae,z.remnant=Oe;const He=1-ye;z.form=Math.max(Ft*.34,ke)*He,z.flare=Mt*He,z.open=tt*He,z.suck=Ue*He,z.black=Math.max(lt*(1-ye),0),z.flash=Math.max(Be,Ye*.92),z.update(e,G,X),S.reveal=ye,S.watch=Ut*(1-De),S.release=De,ye>.5&&De<.2&&re===null&&Math.random()<l*.35&&(ae=.7+Math.random()*.5),ae*=Math.exp(-l*6),S.bolt=ae,f.bolt=ae,b.bolt=ae,S.update(e,X);const Ct=Tt(0,.55,y(w(e,Se.motesIn)))+Tt(0,.45,y(w(e,Se.motesFull)));k.fade=Ct*(1-y(w(e,[Se.dim[0],Se.dim[0]+9]))),k.update(e,G),U.opacity=Math.pow(w(e,Se.dim),1.6),x.emerge=w(e,Se.stars),x.global=(1-y(w(e,Y.starsOut))+At*(1-Ue)*.85)*(1-ye),x.update(e,G);const st=y(w(e,Y.palette)),ct=y(w(e,Y.full)),at=(1-.45*V.breathing)*(1-Te)*(1-xe*.8);f.hell=ye*(1-Ye),b.hell=ye*(1-Ye),f.emerge=y(w(e,Se.nebula))*(at+Te*.3*(1-Ue))*(1-ye),f.palette=st*(1-Te*.85),f.full=ct*(1-Te*.6),f.update(e),b.emerge=y(w(e,Se.nebula))*(.9*at+Te*.45*(1-Ue))*(1-ye),b.palette=st*(1-Te*.85),b.full=ct*(1-Te*.6),b.update(e*.55),h.emerge=y(w(e,Y.curtains))*at,h.update(e);const Et=.05+ve*.85-de*1;q+=(Et-q)*(1-Math.exp(-l*2.2)),R+=q*l,f.radial=R,b.radial=R*.35,V.core=y(w(e,Y.core))*(1-Te),V.field=y(w(e,Y.field))*(1-Te),V.gateIn=ve*(1-Te),V.gateOut=de*(1-Te),V.update(e,l,X,G);const ut=y(w(e,[Se.dim[0]+8,Se.dim[1]+8]))*(1-Ue);if(T.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(ut),e<pe.reveal[0]?p.position.copy(T):p.position.set(0,0,-kt*120),p.rotation.z=Math.sin(e*.013)*.03*ut,C.fade=y(w(e,[-qe+.8,-.2]))*(1-y(w(e,ka))),C.update(e,l,X),N)if(e<Y.start-4){const Q=y(w(e,Se.drone)),Ne=1-.45*y(w(e,[90,118]));N.level=Q*Ne}else e<M.collide[0]?N.level=.1+.1*ve-.04*de:e<pe.reveal[0]?N.level=.1+xe*.16+ke*.12+Ue*.4-lt*.34:N.level=(.16+ye*.1)*(1-De);if(Z&&v&&re===null){const Q=ye*.3*(1-De),Ne=Ye*.24,ot=xe*.16+Be*1+Pe*.62+Ue*.85+Q+Ne;Z.gain.setTargetAtTime(ot*.16,v.currentTime,.12)}if(H&&re===null&&e>M.drumFrom&&e<pe.mantra){let Q;if(e<pe.reveal[0])Q=1.45-ke*.35-tt*.25-Ue*.25;else{const ot=Math.floor(e/1.6);Q=1.35+Math.sin(ot*12.9898)*43758.5453%1*.55}const Ne=Math.floor(e/Q);Ne!==J&&(J=Ne,H(.55+ke*.3+tt*.45+Ue*.6+ye*.25))}t.render(o,s)}),Fe("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];o.traverse(l=>{e.push([l,l.visible]),l.visible=!0});try{t.compile(o,s)}catch(l){console.warn("[journey] compile",l)}for(const[l,d]of e)l.visible=d}Fe("Preparing…","checking the headset");const I=await g();I==="immersive-ar"?Fe("Put your headset on and begin.","You will start in your own room."):I==="immersive-vr"?Fe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Fe("Preview in browser","Open this page in the Quest browser for the full experience.");const a=document.getElementById("begin");a.disabled=!1,a.addEventListener("click",async()=>{a.disabled=!0,W||(Fe("Loading the voice…"),await new Promise(e=>{if(W)return e();const l=setInterval(()=>{W&&(clearInterval(l),e())},100);setTimeout(()=>{clearInterval(l),e()},6e3)})),await F()}),window.JOURNEY={THREE:Lt,scene:o,camera:s,renderer:t,stars:x,nebula:f,voidShell:U,motes:k,narrator:C,prana:V,sec3:z,naraka:S,T:Se,SEG2:Y,SEG3:M,SEG4:pe,seek:e=>{re=e},resume:()=>{re=null},look:(e,l=0)=>{s.rotation.set(l,e,0,"YXZ")},moveTo:(e,l,d)=>{p.position.set(0,0,0),s.position.set(e,l,d)},forceBreath:(e,l)=>{E=e===null?null:[e,l]},fakeLevel:e=>{C.uniforms.uLevel.value=e},dryStart:()=>{ce=!0,ue=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:_(),xrMode:i,voidOpacity:U.opacity,starEmerge:x.emerge,nebulaEmerge:f.emerge,orbFade:C.fade})},window.__JOURNEY_READY=!0}Ca().catch(u=>{console.error(u),window.__JOURNEY_ERROR=String(u&&u.stack||u),Fe("Something went wrong.",String(u))});
