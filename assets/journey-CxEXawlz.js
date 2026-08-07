import{G as vt,M as dt}from"./meshopt_decoder.module-fomgdG_x.js";import{$ as st,g as D,o as ze,M as L,C as mt,p as Je,a3 as De,a as N,A as ne,a4 as je,G as ct,n as We,P as et,V as ee,N as tt,c as ht,D as pt,a5 as Gt,a6 as bt,B as yt,b as Ze,I as Tt,f as St,S as Rt,i as qt,a7 as Ft,Q as Bt,a8 as Dt,Y as Nt,Z as Vt,_ as Lt,x as Wt,a0 as jt}from"./three-Cl1WH0GR.js";function Ot(v){let t=v>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Yt(v){const t=new st(500,24,16),r=new D({side:ze,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),u=new L(t,r);return u.frustumCulled=!1,u.renderOrder=-10,v.add(u),{mesh:u,set opacity(p){r.uniforms.uOpacity.value=p},get opacity(){return r.uniforms.uOpacity.value}}}const Ht=`
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
`,$t=`
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
`;function Qt(v,{count:t=5200}={}){const r=Ot(20260805),u=new Float32Array(t*3),p=new Float32Array(t),E=new Float32Array(t),x=new Float32Array(t),F=new Float32Array(t*3),m=new mt;for(let _=0;_<t;_++){let O=r()*2-1;const W=r()*Math.PI*2;r()<.42&&(O*=.3);const G=Math.sqrt(Math.max(0,1-O*O)),j=90+r()*320;u[_*3]=Math.cos(W)*G*j,u[_*3+1]=O*j,u[_*3+2]=Math.sin(W)*G*j;const Y=Math.pow(r(),2.4);E[_]=.85+Y*4.2,p[_]=Je.clamp(.86-Y*.9+(r()-.5)*.22,0,.9),x[_]=r()*100;const Z=r();Z>.86?m.setHSL(.07+r()*.04,.55,.72):Z>.66?m.setHSL(.12+r()*.03,.22,.85):m.setHSL(.58+r()*.06,.28+r()*.3,.88),F[_*3]=m.r,F[_*3+1]=m.g,F[_*3+2]=m.b}const h=new De;h.setAttribute("position",new N(u,3)),h.setAttribute("aDelay",new N(p,1)),h.setAttribute("aSize",new N(E,1)),h.setAttribute("aSeed",new N(x,1)),h.setAttribute("aTint",new N(F,3));const C={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},R=new D({vertexShader:Ht,fragmentShader:$t,uniforms:C,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}),V=new je(h,R);V.frustumCulled=!1,V.renderOrder=5;const P=new ct;return P.add(V),v.add(P),{group:P,uniforms:C,set emerge(_){C.uEmerge.value=_},get emerge(){return C.uEmerge.value},set global(_){C.uGlobal.value=_},update(_,O){C.uTime.value=_,C.uPixel.value=O,P.rotation.y=_*.0042,P.rotation.x=Math.sin(_*.017)*.014}}}const Zt=`
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
`;function _t(v,{radius:t=430,scale:r=2.1,gain:u=1,order:p=4}={}){const E=new st(t,48,32),x={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:r},uGain:{value:u},uHell:{value:0},uBolt:{value:0}},F=new D({side:ze,transparent:!0,depthWrite:!1,depthTest:!0,blending:ne,uniforms:x,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Zt}),m=new L(E,F);return m.frustumCulled=!1,m.renderOrder=p,v.add(m),{mesh:m,set emerge(h){x.uEmerge.value=h},get emerge(){return x.uEmerge.value},set palette(h){x.uPalette.value=h},set full(h){x.uFull.value=h},set radial(h){x.uRadial.value=h},set hell(h){x.uHell.value=h},set bolt(h){x.uBolt.value=h},update(h){x.uTime.value=h}}}const Kt=`
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
`;function Xt(v){const t=new We(150,150,240,64,1,!0),r={uTime:{value:0},uEmerge:{value:0}},u=new D({side:ze,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne,uniforms:r,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Kt}),p=new L(t,u);return p.frustumCulled=!1,p.renderOrder=5,v.add(p),{mesh:p,set emerge(E){r.uEmerge.value=E},update(E){r.uTime.value=E,p.rotation.y=E*.006}}}const Jt=`
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
`,ea=`
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
`;function ta(v,{count:t=260,radius:r=3}={}){const u=Ot(77003),p=new Float32Array(t*3),E=new Float32Array(t),x=new Float32Array(t);for(let R=0;R<t;R++)p[R*3]=(u()-.5)*r*2.2,p[R*3+1]=.25+u()*2.3,p[R*3+2]=(u()-.5)*r*2.2,E[R]=u(),x[R]=.5+u()*1.4;const F=new De;F.setAttribute("position",new N(p,3)),F.setAttribute("aSeed",new N(E,1)),F.setAttribute("aSize",new N(x,1));const m={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},h=new D({vertexShader:Jt,fragmentShader:ea,uniforms:m,transparent:!0,depthWrite:!1,blending:ne}),C=new je(F,h);return C.frustumCulled=!1,C.renderOrder=3,v.add(C),{points:C,set fade(R){m.uFade.value=R},get fade(){return m.uFade.value},update(R,V){m.uTime.value=R,m.uPixel.value=V}}}const aa=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,oa=`
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
`;function ra(v){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},r=new D({vertexShader:aa,fragmentShader:oa,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}),u=new L(new et(.44,.44),r);u.frustumCulled=!1,u.renderOrder=30,v.add(u);let p=null,E=null,x=0;const F=new ee(0,1.35,-1.7),m=new ee,h=new ee(0,1.35,-1.7);return u.position.copy(h),{mesh:u,uniforms:t,attachAnalyser(C,R){p=C.createAnalyser(),p.fftSize=512,p.smoothingTimeConstant=.55,E=new Uint8Array(p.frequencyBinCount),R.connect(p)},set fade(C){t.uFade.value=C},get fade(){return t.uFade.value},update(C,R,V){t.uTime.value=C,V.getWorldDirection(m),V.getWorldPosition(F),F.addScaledVector(m,1.7);const P=1-Math.exp(-R*5.5);h.lerp(F,P),u.position.set(h.x,h.y+Math.sin(C*.9)*.008,h.z);let _=0;if(p){p.getByteFrequencyData(E);const W=Math.max(8,E.length*.45|0);let c=0;for(let G=2;G<W;G++)c+=E[G];_=Math.min(1,c/(W-2)/132)}const O=_>x?1-Math.exp(-R*22):1-Math.exp(-R*3.2);x+=(_-x)*O,t.uLevel.value=x}}}function ia(v){let t=v>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const na=`
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
`,la=`
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
`,sa=`
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
`,ca=`
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
`,ua=`
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
`;function fa(v){const t=ia(90210),r=850,u=new Float32Array(r),p=new Float32Array(r*3),E=new Float32Array(r),x=new Float32Array(r),F=new ee(0,.05,-1).normalize(),m=new ee;for(let k=0;k<r;k++){u[k]=t();do m.set(t()*2-1,t()*2-1,t()*2-1);while(m.lengthSq()>1||m.lengthSq()<.05);m.normalize(),t()<.25&&m.lerp(F,.6).normalize(),p[k*3]=m.x,p[k*3+1]=m.y,p[k*3+2]=m.z,E[k]=2.2+Math.pow(t(),.7)*5.8,x[k]=1.8+t()*3.4}const h=new De;h.setAttribute("position",new N(new Float32Array(r*3),3)),h.setAttribute("aSeed",new N(u,1)),h.setAttribute("aDir",new N(p,3)),h.setAttribute("aRad",new N(E,1)),h.setAttribute("aSize",new N(x,1));const C={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new ee(0,1.3,-.3)}},R=new je(h,new D({vertexShader:na,fragmentShader:la,uniforms:C,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));R.frustumCulled=!1,R.renderOrder=24,v.add(R);const V=700,P=new Float32Array(V),_=new Float32Array(V*3);for(let k=0;k<V;k++){P[k]=t();do m.set(t()*2-1,t()*2-1,t()*2-1);while(m.lengthSq()>1||m.lengthSq()<.05);m.normalize(),_[k*3]=m.x,_[k*3+1]=m.y,_[k*3+2]=m.z}const O=new De;O.setAttribute("position",new N(new Float32Array(V*3),3)),O.setAttribute("aSeed",new N(P,1)),O.setAttribute("aDir",new N(_,3));const W={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new ee(0,1.3,-.3)},uFwd:{value:new ee(0,0,-1)}},c=new je(O,new D({vertexShader:sa,fragmentShader:ca,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));c.frustumCulled=!1,c.renderOrder=25,v.add(c);const G={uTime:{value:0},uCore:{value:0},uIn:{value:0}},j=new L(new et(16,16),new D({vertexShader:Mt,fragmentShader:ua,uniforms:G,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));j.position.set(0,2.5,-14),j.frustumCulled=!1,j.renderOrder=6,v.add(j);const Y={uTime:{value:0},uCore:{value:0}},Z=new L(new et(5,90),new D({vertexShader:Mt,fragmentShader:`
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
      `,uniforms:Y,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));Z.position.set(0,2.5,-14.2),Z.frustumCulled=!1,Z.renderOrder=5,v.add(Z);const ve=new ee,te=new ee;let le=0,he=0;return{get breathing(){return Math.max(le,he)},set core(k){G.uCore.value=k,Y.uCore.value=k},set field(k){C.uField.value=k},gateIn:0,gateOut:0,update(k,ye,se,ce){const de=1-Math.exp(-ye*(this.gateIn>le?3.2:1.8));le+=(this.gateIn-le)*de;const pe=1-Math.exp(-ye*(this.gateOut>he?9:4));he+=(this.gateOut-he)*pe,se.getWorldPosition(ve),se.getWorldDirection(te),ve.addScaledVector(te,.12),ve.y-=.05,C.uTime.value=k,C.uPixel.value=ce,C.uIn.value=le,C.uNose.value.copy(ve),W.uTime.value=k,W.uPixel.value=ce,W.uOut.value=he,W.uNose.value.copy(ve),W.uFwd.value.copy(te),G.uTime.value=k,G.uIn.value=le,Y.uTime.value=k}}}const va=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,nt=`
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
`,da=`
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
`,ma=`
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
`,ha=`
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
`,pa=`
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
`,ga=`
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
`,wa=`
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
`,xa=`
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
`,ba=`
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
`,ya=`
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
`,Ta=`
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
`;function Ae(v,t,r,u,{blending:p=ne,order:E=8}={}){const x=new D({vertexShader:va,fragmentShader:r,uniforms:u,transparent:!0,depthWrite:!1,depthTest:!1,blending:p,side:pt}),F=new L(new et(v,t),x);return F.frustumCulled=!1,F.renderOrder=E,F}function Sa(v){const t=new ct;v.add(t);const r={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},u=da,p=ma.replace("__COMMON__",u).replace("__NOISE__",nt),E=ha.replace("__COMMON__",u).replace("__NOISE__",nt),x=340,F=285,m=-190,h=62,C=Ae(x,F,p,r,{blending:tt,order:7});C.position.set(0,h,m),t.add(C);const R=Ae(x,F,E,r,{order:8});R.position.set(0,h,m),t.add(R);const V=new ee(0,h+.38*(F/2),m),P=Ae(34,34,pa,{uTime:r.uTime,uForm:{value:0}},{order:8});P.position.set(95,130,-180),t.add(P);const _=Ae(70,70,At,{uTime:r.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});_.position.set(-150,45,-175),t.add(_);const O=Ae(44,44,At,{uTime:r.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});O.position.set(150,20,-165),t.add(O);const W={uForm:{value:0}},c=new L(new We(90,90,34,96,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:xa,uniforms:W,transparent:!0,depthWrite:!1,depthTest:!1,blending:tt,side:ze}));c.position.y=-14,c.renderOrder=9,c.frustumCulled=!1,t.add(c);const G={uTime:r.uTime,uForm:{value:0}},j=new L(new We(110,110,60,96,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ba,uniforms:G,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne,side:ze}));j.position.y=-12,j.renderOrder=6,j.frustumCulled=!1,t.add(j);const Y=420,Z=new Float32Array(Y*3),ve=new Float32Array(Y);for(let i=0;i<Y;i++){const z=Math.random()*Math.PI*2,U=40+Math.random()*55;Z[i*3]=Math.cos(z)*U,Z[i*3+1]=-20+Math.random()*30,Z[i*3+2]=Math.sin(z)*U,ve[i]=Math.random()}const te=new De;te.setAttribute("position",new N(Z,3)),te.setAttribute("aSeed",new N(ve,1));const le={uTime:r.uTime,uForm:{value:0},uPixel:{value:1}},he=new je(te,new D({vertexShader:`
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
    `,uniforms:le,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));he.frustumCulled=!1,he.renderOrder=9,t.add(he);const k={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new ht(1,-.1)},uSpin:{value:.05},uTint:{value:new mt(.45,.62,1)}},ye={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new ht(-1,.12)},uSpin:{value:-.065},uTint:{value:new mt(1,.58,.22)}},se=Ae(175,175,kt,k,{order:22}),ce=Ae(150,150,kt,ye,{order:22});se.position.set(-62,20,-120),ce.position.set(62,32,-125),v.add(se),v.add(ce),se.visible=ce.visible=!1;const de=(i,z)=>{const U={uTime:{value:0},uShow:{value:0}},w=Ae(430,330,`
      precision highp float;
      uniform float uTime;
      uniform float uShow;
      varying vec2 vUv;
      ${nt}
      void main() {
        float r = length(vUv);
        if (r > 1.0) discard;
        float n = fbm(vUv * 2.6 + uTime * 0.01);
        float body = exp(-r * r * 2.2) * (0.35 + 0.65 * n);
        float a = body * uShow * 0.55;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(${i}) * a * 1.6, a);
      }
    `,U,{order:21});return w.position.set(z,26,-160),v.add(w),w.visible=!1,{u:U,m:w}},pe=de("0.30, 0.45, 0.95",-120),Te=de("0.95, 0.42, 0.12",120),Ie={uTime:{value:0},uWall:{value:0}},Se=Ae(60,300,`
    precision highp float;
    uniform float uTime;
    uniform float uWall;
    varying vec2 vUv;
    ${nt}
    void main() {
      float x = abs(vUv.x);
      float beam = exp(-x * x * 10.0);
      float tear = 0.6 + 0.6 * fbm(vec2(vUv.y * 5.0, uTime * 0.4));
      vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.75), tear - 0.6);
      float a = beam * tear * uWall;
      if (a < 0.004) discard;
      gl_FragColor = vec4(col * a * 2.6, a);
    }
  `,Ie,{order:24});Se.position.set(0,24,-130),v.add(Se),Se.visible=!1;const Fe={uTime:{value:0},uRing:{value:0}},_e=Ae(420,420,wa,Fe,{order:23});_e.position.set(0,24,-138),v.add(_e),_e.visible=!1;const Ge={uTime:{value:0},uLife:{value:0}},me=Ae(90,90,ga,Ge,{order:22});me.position.set(0,24,-138),v.add(me),me.visible=!1;const a={uTime:{value:0},uGrow:{value:0}},n=Ae(7,7,Ta,a,{order:26});n.position.set(0,1.5,-9),v.add(n);const l={uTime:{value:0},uRush:{value:0},uEnd:{value:0}},d=new L(new We(3.2,3.2,130,40,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ya,uniforms:l,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne,side:ze}));d.rotation.x=Math.PI/2,d.position.set(0,1.5,-20),d.renderOrder=27,d.frustumCulled=!1,v.add(d);const o={uBlack:{value:0},uWhite:{value:0}},f=new L(new st(.6,16,12),new D({vertexShader:`
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
      `,uniforms:o,transparent:!0,depthWrite:!1,depthTest:!1,blending:tt,side:ze}));f.renderOrder=50,f.frustumCulled=!1,v.add(f);const s=1400,b=new Float32Array(s*3),S=new Float32Array(s*3),M=new Float32Array(s);{const i=w=>w*(x/2),z=w=>h+w*(F/2),U=[];for(let w=0;w<3;w++)for(let q=0;q<200;q++){const ue=(Math.random()*2-1)*.46;U.push([i(ue),z(.3+w*.14+ue*ue*.1),m+2])}for(let w=-1;w<=1;w+=2)for(let q=0;q<130;q++){const ue=(Math.random()*2-1)*.14;U.push([i(w*.3+ue),z(-.1+.03-ue*ue*1.6),m+2])}for(let w=0;w<220;w++){const q=Math.random()*Math.PI*2;U.push([i(Math.cos(q)*.062),z(.38+Math.sin(q)*.155),m+2])}for(let w=0;w<160;w++){const q=.3-Math.random()*.75;U.push([i((Math.random()*2-1)*.05),z(q),m+2])}for(;U.length<s;)U.push(U[Math.random()*U.length|0]);for(let w=0;w<s;w++){const q=U[w%U.length],ue=Math.random()*Math.PI*2,e=(Math.random()-.35)*1.8,y=260+Math.random()*160;b[w*3]=Math.cos(ue)*Math.cos(e)*y,b[w*3+1]=60+Math.sin(e)*y*.7,b[w*3+2]=-80+Math.sin(ue)*Math.cos(e)*y*.5-80,S[w*3]=q[0],S[w*3+1]=q[1],S[w*3+2]=q[2],M[w]=Math.random()}}const K=new De;K.setAttribute("position",new N(b,3)),K.setAttribute("aEnd",new N(S,3)),K.setAttribute("aSeed",new N(M,1));const B={uTime:{value:0},uForm:r.uForm,uPixel:{value:1}},H=new je(K,new D({vertexShader:`
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
    `,uniforms:B,transparent:!0,depthWrite:!1,depthTest:!1,blending:ne}));return H.frustumCulled=!1,H.renderOrder=9,t.add(H),t.visible=!1,{group:t,eyeWorld:V,set collide(i){const z=i>.001&&i<1;se.visible=ce.visible=z,pe.m.visible=Te.m.visible=z,Se.visible=i>.8&&i<.995,k.uShow.value=ye.uShow.value=Math.min(1,i*4),pe.u.uShow.value=Te.u.uShow.value=Math.min(1,i*3)*(1-i*.3),Ie.uWall.value=Math.max(0,(i-.8)/.2),k.uTidal.value=ye.uTidal.value=Math.pow(i,1.6);const U=62*(1-Math.pow(i,1.7)*.88);se.position.x=-U,ce.position.x=U,ce.position.y=32-Math.pow(i,1.7)*12,pe.m.position.x=-120+Math.pow(i,1.7)*55,Te.m.position.x=120-Math.pow(i,1.7)*55},set flash(i){o.uWhite.value=i},set ring(i){Fe.uRing.value=i,_e.visible=i>.002&&i<.999},set remnant(i){Ge.uLife.value=i,me.visible=i>.002},set tunnelEnd(i){l.uEnd.value=i},set flare(i){r.uFlare.value=i},set fireSurge(i){G.uForm.value=Math.min(1.6,G.uForm.value*(1+i))},set portal(i){a.uGrow.value=i,n.visible=i>.002},set rush(i){l.uRush.value=i,d.visible=i>.002},set form(i){r.uForm.value=i,t.visible=i>.001||r.uSuck.value>.001,P.material.uniforms.uForm.value=Math.min(1,i*2.2),_.material.uniforms.uForm.value=Math.min(1,Math.max(0,i*1.8-.15)),O.material.uniforms.uForm.value=Math.min(1,Math.max(0,i*1.8-.25)),W.uForm.value=Math.min(1,i*2.6),G.uForm.value=Math.min(1,Math.max(0,i*2.2-.2)),le.uForm.value=Math.min(1,Math.max(0,i*2-.3))},set open(i){r.uOpen.value=i},set suck(i){r.uSuck.value=i;const z=1+i*i*7;t.scale.setScalar(z),t.position.copy(V).multiplyScalar(1-z)},set black(i){o.uBlack.value=i},update(i,z,U){r.uTime.value=i,a.uTime.value=i,l.uTime.value=i,k.uTime.value=i,ye.uTime.value=i,pe.u.uTime.value=i,Te.u.uTime.value=i,Ie.uTime.value=i,Fe.uTime.value=i,Ge.uTime.value=i,B.uTime.value=i,B.uPixel.value=z,le.uPixel.value=z,f.visible!==o.uBlack.value>.003&&(f.visible=o.uBlack.value>.003),U.getWorldPosition(f.position),d.position.x=f.position.x,d.position.y=f.position.y}}}const Ve=`
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
`,Ut=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,lt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Fa=`
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
`,_a=`
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
`,Ma=`
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
`,Aa=`
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
`,Ct=`
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
`,ka=`
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
`,Ua=`
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
    col += mix(vec3(0.30, 0.05, 0.015), vec3(0.80, 0.10, 0.05), uBolt) * rim
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
`,Ca=`
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
`;function Be(v,t,r,u,{blending:p=ne,order:E=8,vert:x=lt,side:F=pt}={}){const m=new D({vertexShader:x,fragmentShader:r.replace("__NOISE__",Ve),uniforms:u,transparent:!0,depthWrite:!1,blending:p,side:F}),h=new L(new et(v,t),m);return h.frustumCulled=!1,h.renderOrder=E,h}function Ea(v){const t=new ct;t.visible=!1,v.add(t);const r=[],u=[],p={uTime:{value:0},uForm:{value:0},uBolt:{value:0},uDie:{value:0}},E=new L(new st(380,40,24),new D({side:ze,transparent:!0,depthWrite:!1,uniforms:p,vertexShader:`
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
          col += vec3(0.90, 0.09, 0.045) * uBolt * churn * under * 1.9;
          // the mantra starves the fire out of the sky
          col *= (1.0 - uDie * 0.9);
          gl_FragColor = vec4(col, uForm);
        }
      `.replace("__NOISE__",Ve)}));E.renderOrder=-5,E.frustumCulled=!1,t.add(E);const x={uTime:{value:0},uFire:{value:1}};r.push(x),u.push(x);const F=new L(new et(760,760,1,1),new D({uniforms:x,vertexShader:`
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
          col *= (uFire * 0.85 + 0.15) * 0.7;

          // ---- aerial perspective toward the furnace horizon --------------
          float dist = d / 380.0;
          vec3 haze = vec3(0.85, 0.24, 0.045);
          col = mix(col, haze * (0.30 + 0.70 * uFire), smoothstep(0.34, 1.0, dist) * 0.85);
          gl_FragColor = vec4(col, 1.0);
        }
      `.replace("__NOISE__",Ve)}));F.rotation.x=-Math.PI/2,F.position.y=-1.6,F.renderOrder=-4,F.frustumCulled=!1,t.add(F);{const a=`
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
        float a = body * uForm * 0.21;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.55, 0.14, 0.03) * (0.6 + n * 0.6) * a * 2.0, a);
      }
    `.replace("__NOISE__",Ve);for(let n=0;n<5;n++){const l={uTime:{value:0},uForm:{value:1},uSeed:{value:n*.41}};r.push(l),u.push(l);const d=Be(150,42,a,l,{order:8});d.position.set(0,11,-28-n*36),t.add(d)}for(let n=0;n<8;n++){const l={uTime:{value:0},uForm:{value:1},uSeed:{value:3.7+n*.83}};r.push(l),u.push(l);const d=Be(30,7,a,l,{order:8}),o=n%2===0?-1:1;d.position.set(o*(6.5+n%3*2),.9,-12-n*17),d.rotation.y=o*.35,t.add(d)}}const m=new Gt(7023116,2.15);t.add(m);const h=[];for(let a=0;a<4;a++){const n=new bt(16734744,46,40,1.9);t.add(n),h.push(n)}const C={uTime:{value:0},uFire:{value:1}};r.push(C),u.push(C);const R=new L(new yt(3.6,.35,170),new D({vertexShader:lt,fragmentShader:_a.replace("__NOISE__",Ve),uniforms:C}));R.position.set(0,-.18,-70),t.add(R);const V=new We(.055,.075,.95,7),P=new Ze({color:1511436,roughness:.9}),_=new Tt(V,P,68),O=new St;let W=0;for(let a=4;a>=-148;a-=4.5)for(const n of[-1.9,1.9]){if(W>=68)break;O.makeTranslation(n,.45,a),_.setMatrixAt(W++,O)}_.instanceMatrix.needsUpdate=!0,t.add(_);for(const[a,n,l,d]of[[210,90,.75,3],[330,150,.9,2]]){const o={uForm:{value:1},uTall:{value:l}},f=new L(new We(a,a,n,96,1,!0),new D({vertexShader:lt,fragmentShader:Ma,uniforms:o,transparent:!0,depthWrite:!1,side:ze}));f.position.y=n*.32,f.renderOrder=d,f.frustumCulled=!1,t.add(f)}const c={uTime:{value:0},uForm:{value:1}};r.push(c),u.push(c);const G=new L(new We(360,360,200,96,1,!0),new D({vertexShader:lt,fragmentShader:Aa.replace("__NOISE__",Ve),uniforms:c,transparent:!0,depthWrite:!1,depthTest:!0,blending:ne,side:ze}));G.position.y=30,G.renderOrder=1,G.frustumCulled=!1,t.add(G);const j=[];let Y=null;new vt().setMeshoptDecoder(dt).load("assets/models/hell_env.glb",n=>{n.scene.traverse(l=>{if(!l.isMesh)return;const d=l.material&&l.material.map?l.material.map:null;d&&(d.colorSpace=Rt,d.anisotropy=4);const o=l.material&&l.material.name||"";if(o.startsWith("lava_surface"))Y={uTime:{value:0},uDie:{value:0}},l.material=new D({uniforms:{uMap:{value:d},uTime:Y.uTime,uDie:Y.uDie},vertexShader:`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,fragmentShader:`
              precision highp float;
              uniform sampler2D uMap;
              uniform float uTime;
              uniform float uDie;
              varying vec2 vUv;
              void main() {
                vec3 col = texture2D(uMap, vUv).rgb;
                float heat = dot(col, vec3(0.6, 0.3, 0.1));
                float shimmer = 0.88 + 0.24 * sin(uTime * 0.8 + heat * 21.0)
                                       * smoothstep(0.12, 0.55, heat);
                col = clamp(col * 2.1 * shimmer, 0.0, 1.0);
                col = col * col * (3.0 - 2.0 * col);   // deep crust, blazing veins
                col *= (1.0 - uDie * 0.93);
                gl_FragColor = vec4(col, 1.0);
              }
            `});else{const f=new qt({map:d}),s=o.startsWith("crags")?[.52,.42,.38]:o.startsWith("terraces")?[.68,.6,.55]:[1,1,1];f.color.setRGB(...s),f.userData.base=s,j.push(f),l.material=f}l.frustumCulled=!1}),t.add(n.scene)});{const a={uTime:{value:0},uFire:{value:1}};r.push(a),u.push(a);const n=new D({uniforms:a,vertexShader:`
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
      `.replace("__NOISE__",Ve)});for(const l of[-2,2]){const d=new L(new yt(.44,.62,170),n);d.position.set(l,.1,-70),d.frustumCulled=!1,t.add(d)}}{const a=[],n=[],l=[];for(const s of[-1.9,1.9]){const b=s>0?-1:1;for(let S=4;S>=-148+4.5;S-=4.5){const M=S-4.5;for(let K=0;K<7;K++){const B=K/7,H=(K+1)/7,i=.88-Math.sin(B*Math.PI)*.24,z=.88-Math.sin(H*Math.PI)*.24,U=S+(M-S)*B,w=S+(M-S)*H,q=a.length/3;a.push(s,i-.034,U,s,i+.034,U,s,z+.034,w,s,z-.034,w);for(let ue=0;ue<4;ue++)n.push(b,0,0);l.push(q,q+1,q+2,q,q+2,q+3)}}}const o=new De;o.setAttribute("position",new Ft(a,3)),o.setAttribute("normal",new Ft(n,3)),o.setIndex(l);const f=new L(o,new Ze({color:1708555,roughness:.55,metalness:.65,side:pt}));f.frustumCulled=!1,t.add(f)}{const a=[];for(let M=4;M>=-148;M-=4.5)for(const K of[-1.9,1.9]){if(a.length>=68)break;a.push([K,1.08,M])}const n=a.length,l=new Float32Array(n*4*3),d=new Float32Array(n*4*2),o=new Float32Array(n*4),f=[];a.forEach(([M,K,B],H)=>{const i=H*.61803%1,z=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let w=0;w<4;w++){const q=H*4+w;l.set([M,K,B],q*3),d.set(z[w],q*2),o[q]=i}const U=H*4;f.push(U,U+1,U+2,U,U+2,U+3)});const s=new De;s.setAttribute("aCenter",new N(l,3)),s.setAttribute("aCorner",new N(d,2)),s.setAttribute("aSeed",new N(o,1)),s.setAttribute("position",new N(new Float32Array(n*4*3),3)),s.setIndex(f);const b={uTime:{value:0},uFire:{value:1}};r.push(b),u.push(b);const S=new L(s,new D({uniforms:b,transparent:!0,depthWrite:!1,blending:ne,vertexShader:`
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
      `.replace("__NOISE__",Ve)}));S.renderOrder=9,S.frustumCulled=!1,t.add(S)}{const n=new Float32Array(2160),l=new Float32Array(720);let d=7;const o=()=>(d=d*1664525+1013904223>>>0,d/4294967296);for(let S=0;S<720;S++)n[S*3]=(o()*2-1)*75,n[S*3+1]=o()*34,n[S*3+2]=20-o()*215,l[S]=o();const f=new De;f.setAttribute("position",new N(n,3)),f.setAttribute("aSeed",new N(l,1));const s={uTime:{value:0},uFire:{value:1}};r.push(s),u.push(s);const b=new je(f,new D({uniforms:s,transparent:!0,depthWrite:!1,blending:ne,vertexShader:`
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
      `}));b.renderOrder=7,b.frustumCulled=!1,t.add(b)}const Z=[];for(let a=0;a<9;a++){const n={uTime:{value:0},uForm:{value:1},uSeed:{value:a/9}};r.push(n),u.push(n);const l=Be(7+a%3*3,150+a%4*34,Ct,n,{order:4}),d=a/9*Math.PI*2+.4,o=175+a%4*60;l.position.set(Math.cos(d)*o,58,Math.sin(d)*o-60),l.rotation.y=-d+Math.PI/2,t.add(l),Z.push(l)}const ve={uTime:{value:0},uWatch:{value:0}},te={uTime:{value:0},uWatch:{value:0},uBolt:{value:0},uLook:{value:new ht(0,0)}};r.push(ve,te);const le=Be(150,110,ka,ve,{blending:tt,order:5});le.position.set(0,78,-235),t.add(le);const he=Be(150,110,Ua,te,{order:6});he.position.set(0,78,-234),t.add(he);const k={uTime:{value:0},uForm:{value:0},uSeed:{value:.5}};r.push(k);const ye=Be(14,68,Ct,k,{order:5});ye.position.set(0,44,-238),t.add(ye);const se={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};r.push(se);const ce=Be(22,28,Ca,se,{blending:tt,order:5});ce.position.set(0,10,-168),t.add(ce),new vt().setMeshoptDecoder(dt).load("assets/models/gate.glb",a=>{let n=null;if(a.scene.traverse(M=>{M.isMesh&&!n&&(n=M)}),!n)return;const l=n.geometry;l.computeBoundingBox();const d=l.boundingBox,o=new ee;d.getSize(o);const f=46/o.x,s=n.material&&n.material.map?new Ze({map:n.material.map,roughness:.9,color:7034440}):new Ze({color:2102288,roughness:.92}),b=new L(l,s);b.scale.setScalar(f),b.position.set(-(d.min.x+d.max.x)*.5*f,-d.min.y*f-.4,-166),b.frustumCulled=!1,t.add(b);const S=new bt(16730640,55,90,1.8);S.position.set(0,16,-158),t.add(S),h.push(S)});const de=[];for(let a=0;a<14;a++){const n=a%2===0?-1:1,l=-6-a*10.5-a%3*1.5;de.push(new ee(n*(4+a%3*.8),0,l))}const pe=[],Te=[],Ie=[],Se=[];let Fe=1.45,_e=null;const Ge=new vt().setMeshoptDecoder(dt);Ge.load("assets/models/soul.glb",a=>{let n=null;if(a.scene.traverse(f=>{f.isMesh&&!n&&(n=f)}),!n)return;const l=n.geometry;l.computeBoundingBox();const d=new ee;l.boundingBox.getSize(d);const o=1.8/d.y;l.scale(o,o,o),l.computeBoundingBox();for(const f of Se)f.mesh.geometry=l;for(const f of pe)f.pot!==void 0&&(f.mesh.geometry=l)}),Ge.load("assets/models/cauldron.glb",a=>{let n=null;if(a.scene.traverse(B=>{B.isMesh&&!n&&(n=B)}),!n)return;const l=n.geometry;l.computeBoundingBox();const d=l.boundingBox,o=new ee;d.getSize(o);const f=3.1/Math.max(o.x,o.z),s=new Ze({color:2299922,roughness:.93,metalness:.25}),b=new Tt(l,s,de.length),S=new St;de.forEach((B,H)=>{S.compose(new ee(B.x,-d.min.y*f-.15,B.z),new Bt().setFromEuler(new Dt(0,H*1.7%6.28,0)),new ee(f,f,f)),b.setMatrixAt(H,S)}),b.instanceMatrix.needsUpdate=!0,b.frustumCulled=!1,t.add(b);const M=o.y*f;Fe=M,_e&&_e();const K=`
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
    `;de.forEach((B,H)=>{const i={uTime:{value:0},uFire:{value:1},uSeed:{value:H*.37%1}};r.push(i),u.push(i);const z=Be(4,5,Fa,i,{order:9,vert:Ut});z.position.set(B.x,M+1.45,B.z),t.add(z);const U={uTime:{value:0},uFire:{value:1},uSeed:{value:H*.71%1}};r.push(U),u.push(U);const w=Be(4.6,4.6,K,U,{order:8,vert:Ut});w.position.set(B.x,M+.55,B.z),t.add(w)}),h.forEach((B,H)=>{const i=de[H*3]||de[0];B.position.set(i.x,M+1,i.z)})}),Ge.load("assets/models/figure.glb",a=>{let n=null;if(a.scene.traverse(s=>{s.isMesh&&!n&&(n=s)}),!n)return;const l=n.geometry;l.computeBoundingBox();const d=new ee;l.boundingBox.getSize(d);const o=1.75/d.y,f=new Ze({color:1182472,roughness:1});for(let s=0;s<de.length;s++){const b=(s<8?2:1)+s%2;for(let S=0;S<b;S++){const M=new L(l,f),K=de[s],B=s*2.1+S*2.4,H=-.38-S*.16;M.scale.setScalar(o*(.85+S*.1)),M.position.set(K.x+Math.cos(B)*.42,Fe+H,K.z+Math.sin(B)*.42),M.rotation.y=(s*2.1+S*2.8)%6.28,M.frustumCulled=!1,t.add(M),pe.push({mesh:M,seed:s*1.3+S*7.7,baseY:M.position.y,dy:H,pot:s})}}_e=()=>{for(const s of pe){if(s.pot===void 0)continue;const b=Fe+s.dy;s.mesh.position.y+=b-s.baseY,s.baseY=b}},_e();for(let s=0;s<13;s++){const b=s%2===0?-1:1,S=-9-s*8.4-s%3*2.2,M=new L(l,f);M.scale.setScalar(o*(1+s%3*.09)),M.position.set(b*2.45,-1.08,S),M.rotation.y=b>0?-Math.PI/2:Math.PI/2,M.frustumCulled=!1,t.add(M),Se.push({mesh:M,side:b,z:S,seed:s*2.7,baseY:-1.08,baseX:b*2.45})}for(let s=0;s<6;s++){const b=new L(l,f);b.scale.setScalar(o*2.2),b.frustumCulled=!1,t.add(b),Te.push({mesh:b,col:Z[s%Z.length],seed:s*3.3})}for(let s=0;s<8;s++){const b=new L(l,f);b.scale.setScalar(o*(1.3+s%3*.3)),b.frustumCulled=!1,t.add(b);const S=s/8*Math.PI*2+1.1,M=26+s%4*11;Ie.push({mesh:b,x:Math.cos(S)*M,z:Math.sin(S)*M-55,seed:s*5.1,speed:.1+s%3*.03})}});const me=new ee;return{group:t,set reveal(a){t.visible=a>.002,p.uForm.value=a},set watch(a){ve.uWatch.value=a,te.uWatch.value=a,k.uForm.value=a*.45*(1-se.uRelease.value)},set bolt(a){te.uBolt.value=a,p.uBolt.value=a},set release(a){p.uDie.value=a,Y&&(Y.uDie.value=a);for(const l of j){const d=l.userData.base||[1,1,1],o=1-a*.88;l.color.setRGB(d[0]*o,d[1]*o,d[2]*o)}for(const l of u)l.uFire&&(l.uFire.value=1-a);for(const l of u)l.uForm&&(l.uForm.value=1-a*.85);se.uRelease.value=a;const n=1-a*.9;m.intensity=1.95*n+a*2.4,m.color.setRGB(.19+a*.7,.09+a*.75,.04+a*.8);for(const l of h)l.intensity=20*n},update(a,n){for(const o of r)o.uTime&&(o.uTime.value=a);Y&&(Y.uTime.value=a),p.uTime.value=a,n.getWorldPosition(me);const l=Je.clamp((me.x-0)/60,-1,1),d=Je.clamp((me.y-40)/90,-1,.4);te.uLook.value.set(l,d);for(const o of pe){const f=Math.sin(a*.9+o.seed);o.mesh.rotation.z=f*.17,o.mesh.rotation.x=Math.sin(a*.6+o.seed*1.7)*.13,o.mesh.position.y=o.baseY+Math.sin(a*.5+o.seed)*.13}for(const o of Se){const f=1-Je.clamp(Math.abs(me.z-o.z)/7.5,0,1),s=f*f,b=Math.sin(a*1.5+o.seed)*.5+.5;o.mesh.position.y=o.baseY+b*.2+s*.8,o.mesh.position.x=o.baseX-o.side*s*.55,o.mesh.rotation.z=(Math.sin(a*1.1+o.seed*1.7)*.12-s*.3)*o.side,o.mesh.rotation.x=-s*.34}for(const o of Ie){const f=(a*o.speed+o.seed)%1;o.mesh.position.set(o.x,70-f*95,o.z),o.mesh.rotation.set(a*.9+o.seed,o.seed,a*.6)}for(const o of Te){const f=(a*.14+o.seed)%1;o.mesh.position.copy(o.col.position),o.mesh.position.y=140-f*170,o.mesh.rotation.set(a*.8+o.seed,a*.5,a*.7+o.seed)}for(let o=0;o<h.length;o++){const f=h[o];f.intensity>.2&&(f.intensity=f.intensity*.92+(16+Math.sin(a*7+o*2.3)*3+Math.sin(a*13.7+o)*2)*.08)}}}}const ke={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},re=116,$={start:re,url:"assets/audio/journey_02.mp3",starsOut:[re+5,re+17],palette:[re+6,re+21],full:[re+6,re+23],curtains:[re+10,re+26],core:[re+18.5,re+24.5],field:[re+20,re+28],breathIn:[re+28.9,re+33.3],breathOut:[re+33.6,re+38.5],loopFrom:re+66,loopPeriod:11.5,loopAmp:.62},Xe=re+63.5,J=Xe+11,A={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:J,portal:[Xe,Xe+2.5],tunnel:[Xe+2.3,Xe+9.6],arrive:Xe+9.6,collide:[J+.2,J+6.6],blast:J+6.85,remnant:[J+7.2,J+16],world:[J+9,J+16.5],drumFrom:J+23.5,form:[J+32.2,J+47.5],flare:[J+48.4,J+51],open:[J+60.8,J+65.5],suck:[J+64.5,J+70.5],black:[J+69.5,J+71.5]},be=J+73,ge={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:be+2,reveal:[be,be+4.5],walk:[be+3,be+62],watch:[be+24.4,be+30.5],mantra:be+57.2,release:[be+57.2,be+61.5],white:[be+59.5,be+64.5],end:be+68},Ra="assets/audio/journey_01.mp3",Ke=4,Oa=[82.5,88.5],Et=(v,t,r)=>v+(t-v)*r,g=(v,[t,r])=>Je.clamp((v-t)/(r-t),0,1),T=v=>v*v*(3-2*v);function Pe(v,t){const r=document.getElementById("status");r&&(r.textContent=v);const u=document.getElementById("substatus");u&&t!==void 0&&(u.textContent=t)}function Pa(v,t){const r=v.createGain();r.gain.value=0,r.connect(t);const u=v.createBiquadFilter();u.type="lowpass",u.frequency.value=220,u.Q.value=.6,u.connect(r);for(const[p,E]of[[38,.55],[57,.28],[76.4,.18]]){const x=v.createOscillator();x.type="sine",x.frequency.value=p;const F=v.createGain();F.gain.value=E,x.connect(F).connect(u),x.start()}return{set level(p){r.gain.setTargetAtTime(p*.09,v.currentTime,.25)}}}async function za(){Pe("Preparing…","starting the engine");const v=document.getElementById("view"),t=new Nt({canvas:v,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Rt,t.toneMapping=Vt,t.toneMappingExposure=1.15;const r=new Lt;r.background=null;const u=new Wt(70,window.innerWidth/window.innerHeight,.05,900);u.position.set(0,1.35,0);const p=new ct;p.add(u),r.add(p),Pe("Preparing…","building the sky");const E=Yt(r),x=Qt(r),F=_t(x.group,{radius:460,scale:.85,gain:.7,order:-2}),m=_t(x.group,{radius:300,scale:1.9,gain:1,order:-1}),h=Xt(x.group),C=ta(r),R=ra(r),V=fa(r);Pe("Preparing…","building the worlds");const P=Sa(r),_=Ea(r);window.addEventListener("resize",()=>{u.aspect=window.innerWidth/window.innerHeight,u.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const O=new Audio;O.src=Ra,O.preload="auto",O.crossOrigin="anonymous";let W=!1;O.addEventListener("canplaythrough",()=>{W=!0},{once:!0}),O.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),W=!0},{once:!0});let c=null,G=null,j=null,Y=null,Z=null,ve=0,te=null,le=null,he=!1,k=null;function ye(){if(!c)try{c=new(window.AudioContext||window.webkitAudioContext);const e=c.createGain();e.gain.value=1,e.connect(c.destination);const y=c.createMediaElementSource(O);j=c.createGain(),j.gain.value=1,y.connect(j).connect(e),R.attachAnalyser(c,j),G=Pa(c,e),fetch("assets/audio/hell_ambience.mp3").then(ae=>ae.arrayBuffer()).then(ae=>c.decodeAudioData(ae)).then(ae=>{le=ae}).catch(ae=>console.warn("[journey] hell ambience",ae));const Q=c.sampleRate*2,fe=c.createBuffer(1,Q,c.sampleRate),qe=fe.getChannelData(0);for(let ae=0;ae<Q;ae++)qe[ae]=Math.random()*2-1;const Ee=c.createBufferSource();Ee.buffer=fe,Ee.loop=!0;const Re=c.createBiquadFilter();Re.type="bandpass",Re.frequency.value=320,Re.Q.value=.7,Y=c.createGain(),Y.gain.value=0,Ee.connect(Re).connect(Y).connect(e),Ee.start(),Z=ae=>{const oe=c.currentTime+Math.random()*.25,ie=1.1+Math.random()*1.4,Oe=190+Math.random()*260,Ue=c.createGain();Ue.gain.value=0;const Me=c.createBiquadFilter();Me.type="lowpass",Me.frequency.value=700+(1-ae)*2600,Ue.connect(Me).connect(e);const Ce=(.03+Math.random()*.035)*(1-ae*.8);Ue.gain.setValueAtTime(1e-4,oe),Ue.gain.exponentialRampToValueAtTime(Ce,oe+ie*.18),Ue.gain.exponentialRampToValueAtTime(1e-4,oe+ie);for(const[we,at,xe]of[[1,.9,7],[2.6,.5,11],[4.3,.22,15]]){const Ne=c.createOscillator();Ne.type="sawtooth",Ne.frequency.setValueAtTime(Oe*we*(.9+Math.random()*.25),oe),Ne.frequency.exponentialRampToValueAtTime(Oe*we*.55,oe+ie);const X=c.createBiquadFilter();X.type="bandpass",X.frequency.value=Oe*we,X.Q.value=xe;const ot=c.createGain();ot.gain.value=at,Ne.connect(X).connect(ot).connect(Ue),Ne.start(oe),Ne.stop(oe+ie+.05)}const Le=c.createBufferSource();Le.buffer=fe,Le.loop=!0;const Ye=c.createBiquadFilter();Ye.type="bandpass",Ye.frequency.value=Oe*2.2,Ye.Q.value=2;const He=c.createGain();He.gain.value=.16,Le.connect(Ye).connect(He).connect(Ue),Le.start(oe),Le.stop(oe+ie+.05)},k=ae=>{const oe=c.currentTime;for(const[ie,Oe,Ue]of[[0,58,.5],[.19,46,.34]]){const Me=c.createOscillator();Me.type="sine",Me.frequency.setValueAtTime(Oe*1.6,oe+ie),Me.frequency.exponentialRampToValueAtTime(Oe,oe+ie+.06);const Ce=c.createGain();Ce.gain.setValueAtTime(0,oe+ie),Ce.gain.linearRampToValueAtTime(Ue*ae*.4,oe+ie+.012),Ce.gain.exponentialRampToValueAtTime(1e-4,oe+ie+.3),Me.connect(Ce).connect(e),Me.start(oe+ie),Me.stop(oe+ie+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let se=null,ce=null,de=!1,pe=null,Te=null,Ie=!1,Se=null,Fe=null,_e=!1;async function Ge(){try{const y=await(await fetch($.url)).arrayBuffer();c&&(se=await c.decodeAudioData(y))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const y=await(await fetch(A.voiceUrl)).arrayBuffer();c&&(pe=await c.decodeAudioData(y))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const y=await(await fetch(ge.voiceUrl)).arrayBuffer();c&&(Se=await c.decodeAudioData(y))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let me=!1,a=0;O.addEventListener("loadedmetadata",()=>{isFinite(O.duration)&&O.duration});let n=null,l=-Ke,d=0;function o(){if(!me)return-Ke;if(Fe!==null&&!_e&&c){const e=ge.voiceAt+(c.currentTime-Fe);return a=performance.now()/1e3-e,e}if(Te!==null&&!Ie&&c){const e=A.voiceAt+(c.currentTime-Te);return a=performance.now()/1e3-e,e}if(ce!==null&&!de&&c){const e=$.start+(c.currentTime-ce);return a=performance.now()/1e3-e,e}return!O.ended&&O.currentTime>.01?(a=performance.now()/1e3-O.currentTime,O.currentTime):performance.now()/1e3-a}function f(){if(n!==null)return n;const e=o(),y=performance.now()/1e3,Q=Math.min(.1,Math.max(5e-4,y-d));d=y;const fe=e-l;return Math.abs(fe)>2.5?l=e:l+=fe*Math.min(1,Q*(Math.abs(fe)>.05?3:60)),l}let s="flat";async function b(){if(!navigator.xr)return null;const e=y=>Promise.race([y.catch(()=>!1),new Promise(Q=>setTimeout(()=>Q(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function S(){ye(),c&&c.state==="suspended"&&await c.resume(),Ge();const e=await b();if(e){const y={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const Q=await navigator.xr.requestSession(e,y);await t.xr.setSession(Q),s=e,Q.addEventListener("end",()=>{s="flat"})}catch(Q){console.warn("[journey] could not start",e,Q)}}document.body.classList.add("started"),me=!0,a=performance.now()/1e3+Ke,setTimeout(()=>{O.play().catch(y=>console.warn("[journey] autoplay blocked",y))},Ke*1e3)}let M=null;function K(e){if(M)return M;let y=T(g(e,[$.breathIn[0],$.breathIn[0]+1.6]))*(1-T(g(e,[$.breathIn[1],$.breathIn[1]+1]))),Q=T(g(e,[$.breathOut[0],$.breathOut[0]+.25]))*(1-T(g(e,[$.breathOut[0]+.55,$.breathOut[0]+1.2])));if(e>$.loopFrom&&e<A.collide[0]){const fe=(e-$.loopFrom)%$.loopPeriod,qe=$.loopAmp,Ee=qe*T(g(fe,[0,1.8]))*(1-T(g(fe,[4.4,5.6]))),Re=qe*T(g(fe,[6,6.3]))*(1-T(g(fe,[6.7,7.4])));y=Math.max(y,Ee),Q=Math.max(Q,Re)}return[y,Q]}const B=new ee;let H=-Ke,i=0,z=0,U=-1,w=0;t.setAnimationLoop(()=>{const e=f(),y=Je.clamp(e-H,.001,.1);H=e;const Q=t.getContext(),fe=Math.max(.5,Q.drawingBufferHeight/900),qe=t.xr.isPresenting?t.xr.getCamera():u;if(me&&ce===null&&se&&c&&e>=$.start&&n===null){const I=c.createBufferSource();I.buffer=se,I.connect(j),I.onended=()=>{de=!0},I.start(),ce=c.currentTime}if(me&&Te===null&&pe&&c&&e>=A.voiceAt&&n===null){const I=c.createBufferSource();I.buffer=pe,I.connect(j),I.onended=()=>{Ie=!0},I.start(),Te=c.currentTime}if(me&&Fe===null&&Se&&c&&e>=ge.voiceAt&&n===null){const I=c.createBufferSource();I.buffer=Se,I.connect(j),I.onended=()=>{_e=!0},I.start(),Fe=c.currentTime}const[Ee,Re]=K(e);T(g(e,A.portal))*(1-T(g(e,[A.tunnel[0]+1,A.tunnel[0]+2])));const ae=T(g(e,[A.tunnel[0],A.tunnel[0]+1.6]))*(1-T(g(e,[A.tunnel[1]-1.4,A.tunnel[1]]))),oe=T(g(e,[A.tunnel[1]-2.6,A.tunnel[1]-.3])),ie=T(g(e,A.collide)),Oe=T(g(e,[A.blast,A.blast+.25]))*(1-T(g(e,[A.blast+.5,A.blast+1.6]))),Ue=g(e,[A.blast,A.blast+3.6]),Me=T(g(e,[A.remnant[0],A.remnant[0]+.8]))*(1-T(g(e,[A.remnant[1]-3,A.remnant[1]]))),Ce=T(g(e,A.form)),Le=T(g(e,A.world)),Ye=T(g(e,[A.flare[0],A.flare[0]+.7]))*(1-T(g(e,[A.flare[1]-.6,A.flare[1]+1.2]))),He=T(g(e,A.open)),we=T(g(e,A.suck)),at=T(g(e,A.black)),xe=T(g(e,[A.tunnel[0]+.5,A.tunnel[0]+4.5])),Ne=T(g(e,[A.arrive-.5,A.arrive+3])),X=T(g(e,ge.reveal)),ot=T(g(e,ge.walk)),Pt=T(g(e,ge.watch)),$e=T(g(e,ge.release)),rt=T(g(e,ge.white));P.collide=ie,P.ring=Ue,P.rush=ae,P.tunnelEnd=oe,P.remnant=Me;const it=1-X;P.form=Math.max(Le*.34,Ce)*it,P.flare=Ye*it,P.open=He*it,P.suck=we*it,P.black=Math.max(at*(1-X),0),P.flash=Math.max(Oe,rt*.92),P.update(e,fe,qe),_.reveal=X,_.watch=Pt*(1-$e),_.release=$e,X>.5&&$e<.2&&n===null&&Math.random()<y*.35&&(w=.7+Math.random()*.5),w*=Math.exp(-y*6),_.bolt=w,m.bolt=w,F.bolt=w,_.update(e,qe);const zt=Et(0,.55,T(g(e,ke.motesIn)))+Et(0,.45,T(g(e,ke.motesFull)));C.fade=zt*(1-T(g(e,[ke.dim[0],ke.dim[0]+9]))),C.update(e,fe),E.opacity=Math.pow(g(e,ke.dim),1.6),x.emerge=g(e,ke.stars),x.global=(1-T(g(e,$.starsOut))+Ne*(1-we)*.85)*(1-X),x.update(e,fe);const gt=T(g(e,$.palette)),wt=T(g(e,$.full)),ut=(1-.45*V.breathing)*(1-xe)*(1-ie*.8);m.hell=X*(1-rt),F.hell=X*(1-rt),m.emerge=T(g(e,ke.nebula))*(ut+xe*.3*(1-we))*(1-X),m.palette=gt*(1-xe*.85),m.full=wt*(1-xe*.6),m.update(e),F.emerge=T(g(e,ke.nebula))*(.9*ut+xe*.45*(1-we))*(1-X),F.palette=gt*(1-xe*.85),F.full=wt*(1-xe*.6),F.update(e*.55),h.emerge=T(g(e,$.curtains))*ut,h.update(e);const It=.05+Ee*.85-Re*1;z+=(It-z)*(1-Math.exp(-y*2.2)),i+=z*y,m.radial=i,F.radial=i*.35,V.core=T(g(e,$.core))*(1-xe),V.field=T(g(e,$.field))*(1-xe),V.gateIn=Ee*(1-xe),V.gateOut=Re*(1-xe),V.update(e,y,qe,fe);const xt=T(g(e,[ke.dim[0]+8,ke.dim[1]+8]))*(1-we);if(B.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(xt),e<ge.reveal[0]?p.position.copy(B):p.position.set(0,0,-ot*120),p.rotation.z=Math.sin(e*.013)*.03*xt,R.fade=T(g(e,[-Ke+.8,-.2]))*(1-T(g(e,Oa))),R.update(e,y,qe),G)if(e<$.start-4){const I=T(g(e,ke.drone)),Qe=1-.45*T(g(e,[90,118]));G.level=I*Qe}else e<A.collide[0]?G.level=.1+.1*Ee-.04*Re:e<ge.reveal[0]?G.level=.1+ie*.16+Ce*.12+we*.4-at*.34:G.level=(.16+X*.1)*(1-$e);if(c&&le&&!he&&X>.01&&n===null){he=!0;const I=c.createBufferSource();I.buffer=le,I.loop=!0,te=c.createGain(),te.gain.value=0,I.connect(te).connect(master),I.start()}if(te&&c){const I=X*.62*(1-$e*.96);te.gain.setTargetAtTime(I,c.currentTime,.6)}if(Z&&n===null&&X>.25&&e<ge.mantra?e>ve&&(Z(.25+Math.random()*.7),ve=e+1.6+Math.random()*4.2):n!==null&&(ve=e+2),Y&&c&&n===null){const I=X*.3*(1-$e),Qe=rt*.24,ft=ie*.16+Oe*1+ae*.62+we*.85+I+Qe;Y.gain.setTargetAtTime(ft*.16,c.currentTime,.12)}if(k&&n===null&&e>A.drumFrom&&e<ge.mantra){let I;if(e<ge.reveal[0])I=1.45-Ce*.35-He*.25-we*.25;else{const ft=Math.floor(e/1.6);I=1.35+Math.sin(ft*12.9898)*43758.5453%1*.55}const Qe=Math.floor(e/I);Qe!==U&&(U=Qe,k(.55+Ce*.3+He*.45+we*.6+X*.25))}t.render(r,u)}),Pe("Preparing…","warming the shaders"),await new Promise(e=>setTimeout(e,30));{const e=[];r.traverse(y=>{e.push([y,y.visible]),y.visible=!0});try{t.compile(r,u)}catch(y){console.warn("[journey] compile",y)}for(const[y,Q]of e)y.visible=Q}Pe("Preparing…","checking the headset");const q=await b();q==="immersive-ar"?Pe("Put your headset on and begin.","You will start in your own room."):q==="immersive-vr"?Pe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):Pe("Preview in browser","Open this page in the Quest browser for the full experience.");const ue=document.getElementById("begin");ue.disabled=!1,ue.addEventListener("click",async()=>{ue.disabled=!0,W||(Pe("Loading the voice…"),await new Promise(e=>{if(W)return e();const y=setInterval(()=>{W&&(clearInterval(y),e())},100);setTimeout(()=>{clearInterval(y),e()},6e3)})),await S()}),window.JOURNEY={THREE:jt,scene:r,camera:u,renderer:t,stars:x,nebula:m,voidShell:E,motes:C,narrator:R,prana:V,sec3:P,naraka:_,T:ke,SEG2:$,SEG3:A,SEG4:ge,seek:e=>{n=e},resume:()=>{n=null},look:(e,y=0)=>{u.rotation.set(y,e,0,"YXZ")},moveTo:(e,y,Q)=>{p.position.set(0,0,0),u.position.set(e,y,Q)},forceBreath:(e,y)=>{M=e===null?null:[e,y]},fakeLevel:e=>{R.uniforms.uLevel.value=e},dryStart:()=>{me=!0,a=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:f(),xrMode:s,voidOpacity:E.opacity,starEmerge:x.emerge,nebulaEmerge:m.emerge,orbFade:R.fade})},window.__JOURNEY_READY=!0}za().catch(v=>{console.error(v),window.__JOURNEY_ERROR=String(v&&v.stack||v),Pe("Something went wrong.",String(v))});
