import{G as pt,M as gt}from"./meshopt_decoder.module-D7UQsJ41.js";import{$ as je,g as D,o as ge,M as J,C as wt,p as ke,a3 as Ue,a as $,A as X,a4 as Ee,G as Ge,n as xe,P as Ce,V as Q,N as Me,c as Be,D as ct,a5 as xt,a6 as yt,B as bt,b as Ne,I as tt,f as at,Q as St,a7 as Tt,Y as Ft,S as _t,Z as At,_ as Mt,x as kt,a0 as Ut}from"./three-nyODTqkC.js";function ut(l){let t=l>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function Et(l){const t=new je(500,24,16),a=new D({side:ge,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),i=new J(t,a);return i.frustumCulled=!1,i.renderOrder=-10,l.add(i),{mesh:i,set opacity(c){a.uniforms.uOpacity.value=c},get opacity(){return a.uniforms.uOpacity.value}}}const Ct=`
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
`,Rt=`
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
`;function Ot(l,{count:t=5200}={}){const a=ut(20260805),i=new Float32Array(t*3),c=new Float32Array(t),x=new Float32Array(t),u=new Float32Array(t),g=new Float32Array(t*3),s=new wt;for(let m=0;m<t;m++){let T=a()*2-1;const O=a()*Math.PI*2;a()<.42&&(T*=.3);const C=Math.sqrt(Math.max(0,1-T*T)),P=90+a()*320;i[m*3]=Math.cos(O)*C*P,i[m*3+1]=T*P,i[m*3+2]=Math.sin(O)*C*P;const z=Math.pow(a(),2.4);x[m]=.85+z*4.2,c[m]=ke.clamp(.86-z*.9+(a()-.5)*.22,0,.9),u[m]=a()*100;const V=a();V>.86?s.setHSL(.07+a()*.04,.55,.72):V>.66?s.setHSL(.12+a()*.03,.22,.85):s.setHSL(.58+a()*.06,.28+a()*.3,.88),g[m*3]=s.r,g[m*3+1]=s.g,g[m*3+2]=s.b}const v=new Ue;v.setAttribute("position",new $(i,3)),v.setAttribute("aDelay",new $(c,1)),v.setAttribute("aSize",new $(x,1)),v.setAttribute("aSeed",new $(u,1)),v.setAttribute("aTint",new $(g,3));const b={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},S=new D({vertexShader:Ct,fragmentShader:Rt,uniforms:b,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}),k=new Ee(v,S);k.frustumCulled=!1,k.renderOrder=5;const A=new Ge;return A.add(k),l.add(A),{group:A,uniforms:b,set emerge(m){b.uEmerge.value=m},get emerge(){return b.uEmerge.value},set global(m){b.uGlobal.value=m},update(m,T){b.uTime.value=m,b.uPixel.value=T,A.rotation.y=m*.0042,A.rotation.x=Math.sin(m*.017)*.014}}}const Pt=`
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
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a * 3.4, a);
  }
`;function ot(l,{radius:t=430,scale:a=2.1,gain:i=1,order:c=4}={}){const x=new je(t,48,32),u={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:i},uHell:{value:0}},g=new D({side:ge,transparent:!0,depthWrite:!1,depthTest:!0,blending:X,uniforms:u,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Pt}),s=new J(x,g);return s.frustumCulled=!1,s.renderOrder=c,l.add(s),{mesh:s,set emerge(v){u.uEmerge.value=v},get emerge(){return u.uEmerge.value},set palette(v){u.uPalette.value=v},set full(v){u.uFull.value=v},set radial(v){u.uRadial.value=v},set hell(v){u.uHell.value=v},update(v){u.uTime.value=v}}}const Gt=`
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
`;function It(l){const t=new xe(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},i=new D({side:ge,transparent:!0,depthWrite:!1,depthTest:!1,blending:X,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:Gt}),c=new J(t,i);return c.frustumCulled=!1,c.renderOrder=5,l.add(c),{mesh:c,set emerge(x){a.uEmerge.value=x},update(x){a.uTime.value=x,c.rotation.y=x*.006}}}const qt=`
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
`,Lt=`
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
`;function zt(l,{count:t=260,radius:a=3}={}){const i=ut(77003),c=new Float32Array(t*3),x=new Float32Array(t),u=new Float32Array(t);for(let S=0;S<t;S++)c[S*3]=(i()-.5)*a*2.2,c[S*3+1]=.25+i()*2.3,c[S*3+2]=(i()-.5)*a*2.2,x[S]=i(),u[S]=.5+i()*1.4;const g=new Ue;g.setAttribute("position",new $(c,3)),g.setAttribute("aSeed",new $(x,1)),g.setAttribute("aSize",new $(u,1));const s={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},v=new D({vertexShader:qt,fragmentShader:Lt,uniforms:s,transparent:!0,depthWrite:!1,blending:X}),b=new Ee(g,v);return b.frustumCulled=!1,b.renderOrder=3,l.add(b),{points:b,set fade(S){s.uFade.value=S},get fade(){return s.uFade.value},update(S,k){s.uTime.value=S,s.uPixel.value=k}}}const Dt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Vt=`
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
`;function Nt(l){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new D({vertexShader:Dt,fragmentShader:Vt,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}),i=new J(new Ce(.44,.44),a);i.frustumCulled=!1,i.renderOrder=30,l.add(i);let c=null,x=null,u=0;const g=new Q(0,1.35,-1.7),s=new Q,v=new Q(0,1.35,-1.7);return i.position.copy(v),{mesh:i,uniforms:t,attachAnalyser(b,S){c=b.createAnalyser(),c.fftSize=512,c.smoothingTimeConstant=.55,x=new Uint8Array(c.frequencyBinCount),S.connect(c)},set fade(b){t.uFade.value=b},get fade(){return t.uFade.value},update(b,S,k){t.uTime.value=b,k.getWorldDirection(s),k.getWorldPosition(g),g.addScaledVector(s,1.7);const A=1-Math.exp(-S*5.5);v.lerp(g,A),i.position.set(v.x,v.y+Math.sin(b*.9)*.008,v.z);let m=0;if(c){c.getByteFrequencyData(x);const O=Math.max(8,x.length*.45|0);let n=0;for(let C=2;C<O;C++)n+=x[C];m=Math.min(1,n/(O-2)/132)}const T=m>u?1-Math.exp(-S*22):1-Math.exp(-S*3.2);u+=(m-u)*T,t.uLevel.value=u}}}function Bt(l){let t=l>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const Wt=`
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
`,jt=`
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
`,Ht=`
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
`,Yt=`
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
`,$t=`
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
`,rt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function Qt(l){const t=Bt(90210),a=850,i=new Float32Array(a),c=new Float32Array(a*3),x=new Float32Array(a),u=new Float32Array(a),g=new Q(0,.05,-1).normalize(),s=new Q;for(let y=0;y<a;y++){i[y]=t();do s.set(t()*2-1,t()*2-1,t()*2-1);while(s.lengthSq()>1||s.lengthSq()<.05);s.normalize(),t()<.25&&s.lerp(g,.6).normalize(),c[y*3]=s.x,c[y*3+1]=s.y,c[y*3+2]=s.z,x[y]=2.2+Math.pow(t(),.7)*5.8,u[y]=1.8+t()*3.4}const v=new Ue;v.setAttribute("position",new $(new Float32Array(a*3),3)),v.setAttribute("aSeed",new $(i,1)),v.setAttribute("aDir",new $(c,3)),v.setAttribute("aRad",new $(x,1)),v.setAttribute("aSize",new $(u,1));const b={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new Q(0,1.3,-.3)}},S=new Ee(v,new D({vertexShader:Wt,fragmentShader:jt,uniforms:b,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}));S.frustumCulled=!1,S.renderOrder=24,l.add(S);const k=700,A=new Float32Array(k),m=new Float32Array(k*3);for(let y=0;y<k;y++){A[y]=t();do s.set(t()*2-1,t()*2-1,t()*2-1);while(s.lengthSq()>1||s.lengthSq()<.05);s.normalize(),m[y*3]=s.x,m[y*3+1]=s.y,m[y*3+2]=s.z}const T=new Ue;T.setAttribute("position",new $(new Float32Array(k*3),3)),T.setAttribute("aSeed",new $(A,1)),T.setAttribute("aDir",new $(m,3));const O={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new Q(0,1.3,-.3)},uFwd:{value:new Q(0,0,-1)}},n=new Ee(T,new D({vertexShader:Ht,fragmentShader:Yt,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}));n.frustumCulled=!1,n.renderOrder=25,l.add(n);const C={uTime:{value:0},uCore:{value:0},uIn:{value:0}},P=new J(new Ce(16,16),new D({vertexShader:rt,fragmentShader:$t,uniforms:C,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}));P.position.set(0,2.5,-14),P.frustumCulled=!1,P.renderOrder=6,l.add(P);const z={uTime:{value:0},uCore:{value:0}},V=new J(new Ce(5,90),new D({vertexShader:rt,fragmentShader:`
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
      `,uniforms:z,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}));V.position.set(0,2.5,-14.2),V.frustumCulled=!1,V.renderOrder=5,l.add(V);const N=new Q,ee=new Q;let H=0,Z=0;return{get breathing(){return Math.max(H,Z)},set core(y){C.uCore.value=y,z.uCore.value=y},set field(y){b.uField.value=y},gateIn:0,gateOut:0,update(y,o,w,p){const G=1-Math.exp(-o*(this.gateIn>H?3.2:1.8));H+=(this.gateIn-H)*G;const f=1-Math.exp(-o*(this.gateOut>Z?9:4));Z+=(this.gateOut-Z)*f,w.getWorldPosition(N),w.getWorldDirection(ee),N.addScaledVector(ee,.12),N.y-=.05,b.uTime.value=y,b.uPixel.value=p,b.uIn.value=H,b.uNose.value.copy(N),O.uTime.value=y,O.uPixel.value=p,O.uOut.value=Z,O.uNose.value.copy(N),O.uFwd.value.copy(ee),C.uTime.value=y,C.uIn.value=H,z.uTime.value=y}}}const Kt=`
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
`,Jt=`
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

  // vertical almond (vesica) distance for the third eye
  float vesica(vec2 p, vec2 c, float w, float h) {
    vec2 q = p - c;
    q.x /= w; q.y /= h;
    return length(q) - 1.0;
  }
`,Zt=`
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
`,Xt=`
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
      col += NAVY * fil * m * 0.55;
      col += ELEC * fil * fil2 * m * 0.38;
      col += ICE * dust * m * 1.35;
      // a whisper of rose where the mass thins, like the reference's edges
      float edge = smoothstep(0.45, 0.80, length(e)) * head;
      col += ROSE * fil * edge * 0.28;
    }

    // ================= tripundra — three stripes of star-ash ================
    {
      float form = win(0.0, 0.42);
      float x = p.x, strip = 0.0;
      for (int i = 0; i < 3; i++) {
        float y0 = 0.30 + float(i) * 0.14;
        float dy = p.y - (y0 + x * x * 0.10);
        float band = exp(-dy * dy * 240.0);
        float reach = mix(1.2, 0.0, form);
        band *= smoothstep(reach, reach + 0.25, 1.0 - abs(x) / 0.46);
        strip += band;
      }
      strip *= smoothstep(0.54, 0.44, abs(x));
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
        float wnd = smoothstep(0.155, 0.11, abs(q.x));

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
      float corona = exp(-d * d * 55.0) * form * live;
      col += mix(NAVY * 2.4, ELEC, fil) * corona * (0.5 + 0.9 * fil2) * (1.0 + uFlare * 2.2);
      float rim = exp(-d * d * 420.0) * form * live;
      col += ICE * rim * (1.35 + uFlare * 2.6);
      col += ICE * dust * corona * (3.0 + uFlare * 5.0);
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
`,ea=`
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
`,nt=`
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
`,lt=`
  precision highp float;
  uniform float uTime;
  uniform float uShow;
  uniform float uTidal;   // 0..1 how far the tearing has gone
  uniform vec2  uDir;     // toward the other galaxy, in this quad's uv
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
    // the near side of the disc is dragged toward the other mass
    float side = dot(vUv, uDir) * 0.5 + 0.5;
    vec2 p = vUv + uDir * (uTidal * uTidal * 0.85 * side);
    float r = length(p);
    if (r > 1.15) discard;
    float ang = atan(p.y, p.x) + uTime * uSpin * (1.0 + uTidal * 2.5);
    float arm = 0.5 + 0.5 * cos(ang * 2.0 - log(max(r, 0.03)) * 5.5);
    arm = pow(arm, 2.0) * (0.5 + 0.5 * noise(p * 8.0));
    // the tidal bridge: matter strung out along the pull direction
    float bridge = exp(-pow(dot(vec2(-uDir.y, uDir.x), p), 2.0) * 30.0)
                 * smoothstep(0.0, 0.8, side) * uTidal * 1.4;
    float core = exp(-r * r * 16.0) * (1.4 + uTidal * 2.0);
    float disc = exp(-r * 2.2);
    vec3 col = vec3(0.70, 0.78, 1.0) * (arm * disc * 0.9)
             + vec3(1.0, 0.85, 0.55) * core
             + vec3(1.0, 0.65, 0.30) * bridge;
    float a = (arm * disc * 0.75 + core * 0.85 + bridge * 0.7) * uShow;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 1.6, a);
  }
`,ta=`
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
`,aa=`
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
`,oa=`
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
`,ra=`
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
`,ia=`
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
`;function he(l,t,a,i,{blending:c=X,order:x=8}={}){const u=new D({vertexShader:Kt,fragmentShader:a,uniforms:i,transparent:!0,depthWrite:!1,depthTest:!1,blending:c,side:ct}),g=new J(new Ce(l,t),u);return g.frustumCulled=!1,g.renderOrder=x,g}function na(l){const t=new Ge;l.add(t);const a={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},i=Jt,c=Zt.replace("__COMMON__",i).replace("__NOISE__",it),x=Xt.replace("__COMMON__",i).replace("__NOISE__",it),u=260,g=220,s=-190,v=55,b=he(u,g,c,a,{blending:Me,order:7});b.position.set(0,v,s),t.add(b);const S=he(u,g,x,a,{order:8});S.position.set(0,v,s),t.add(S);const k=new Q(0,v+.38*(g/2),s),A=he(34,34,ea,{uTime:a.uTime,uForm:{value:0}},{order:8});A.position.set(95,130,-180),t.add(A);const m=he(70,70,nt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});m.position.set(-150,45,-175),t.add(m);const T=he(44,44,nt,{uTime:a.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});T.position.set(150,20,-165),t.add(T);const O={uForm:{value:0}},n=new J(new xe(90,90,34,96,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:aa,uniforms:O,transparent:!0,depthWrite:!1,depthTest:!1,blending:Me,side:ge}));n.position.y=-14,n.renderOrder=9,n.frustumCulled=!1,t.add(n);const C={uTime:a.uTime,uForm:{value:0}},P=new J(new xe(110,110,60,96,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:oa,uniforms:C,transparent:!0,depthWrite:!1,depthTest:!1,blending:X,side:ge}));P.position.y=-12,P.renderOrder=6,P.frustumCulled=!1,t.add(P);const z=420,V=new Float32Array(z*3),N=new Float32Array(z);for(let r=0;r<z;r++){const Y=Math.random()*Math.PI*2,te=40+Math.random()*55;V[r*3]=Math.cos(Y)*te,V[r*3+1]=-20+Math.random()*30,V[r*3+2]=Math.sin(Y)*te,N[r]=Math.random()}const ee=new Ue;ee.setAttribute("position",new $(V,3)),ee.setAttribute("aSeed",new $(N,1));const H={uTime:a.uTime,uForm:{value:0},uPixel:{value:1}},Z=new Ee(ee,new D({vertexShader:`
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
    `,uniforms:H,transparent:!0,depthWrite:!1,depthTest:!1,blending:X}));Z.frustumCulled=!1,Z.renderOrder=9,t.add(Z);const y={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new Be(1,-.1)},uSpin:{value:.05}},o={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new Be(-1,.12)},uSpin:{value:-.065}},w=he(120,120,lt,y,{order:22}),p=he(95,95,lt,o,{order:22});w.position.set(-58,18,-135),p.position.set(58,30,-140),l.add(w),l.add(p),w.visible=p.visible=!1;const G={uTime:{value:0},uRing:{value:0}},f=he(420,420,ta,G,{order:23});f.position.set(0,24,-138),l.add(f),f.visible=!1;const U={uTime:{value:0},uGrow:{value:0}},E=he(7,7,ia,U,{order:26});E.position.set(0,1.5,-9),l.add(E);const I={uTime:{value:0},uRush:{value:0}},M=new J(new xe(3.2,3.2,130,40,1,!0),new D({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:ra,uniforms:I,transparent:!0,depthWrite:!1,depthTest:!1,blending:X,side:ge}));M.rotation.x=Math.PI/2,M.position.set(0,1.5,-20),M.renderOrder=27,M.frustumCulled=!1,l.add(M);const B={uBlack:{value:0},uWhite:{value:0}},R=new J(new je(.6,16,12),new D({vertexShader:`
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
      `,uniforms:B,transparent:!0,depthWrite:!1,depthTest:!1,blending:Me,side:ge}));return R.renderOrder=50,R.frustumCulled=!1,l.add(R),t.visible=!1,{group:t,eyeWorld:k,set collide(r){const Y=r>.001&&r<1;w.visible=p.visible=Y,y.uShow.value=o.uShow.value=Math.min(1,r*4),y.uTidal.value=o.uTidal.value=Math.pow(r,1.6);const te=58*(1-Math.pow(r,1.7)*.86);w.position.x=-te,p.position.x=te,p.position.y=30-Math.pow(r,1.7)*10},set flash(r){B.uWhite.value=r},set ring(r){G.uRing.value=r,f.visible=r>.002&&r<.999},set flare(r){a.uFlare.value=r},set fireSurge(r){C.uForm.value=Math.min(1.6,C.uForm.value*(1+r))},set portal(r){U.uGrow.value=r,E.visible=r>.002},set rush(r){I.uRush.value=r,M.visible=r>.002},set form(r){a.uForm.value=r,t.visible=r>.001||a.uSuck.value>.001,A.material.uniforms.uForm.value=Math.min(1,r*2.2),m.material.uniforms.uForm.value=Math.min(1,Math.max(0,r*1.8-.15)),T.material.uniforms.uForm.value=Math.min(1,Math.max(0,r*1.8-.25)),O.uForm.value=Math.min(1,r*2.6),C.uForm.value=Math.min(1,Math.max(0,r*2.2-.2)),H.uForm.value=Math.min(1,Math.max(0,r*2-.3))},set open(r){a.uOpen.value=r},set suck(r){a.uSuck.value=r;const Y=1+r*r*7;t.scale.setScalar(Y),t.position.copy(k).multiplyScalar(1-Y)},set black(r){B.uBlack.value=r},update(r,Y,te){a.uTime.value=r,U.uTime.value=r,I.uTime.value=r,y.uTime.value=r,o.uTime.value=r,G.uTime.value=r,H.uPixel.value=Y,R.visible!==B.uBlack.value>.003&&(R.visible=B.uBlack.value>.003),te.getWorldPosition(R.position),M.position.x=R.position.x,M.position.y=R.position.y}}}const We=`
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
`,la=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Pe=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,sa=`
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
`,ca=`
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
    float crackLine = smoothstep(0.80, 0.97, cracks);
    vec3 stone = mix(vec3(0.020, 0.014, 0.012), vec3(0.055, 0.042, 0.036), cell);
    // the fire underneath breathes through the cracks
    float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + p.y * 0.25);
    vec3 col = stone + vec3(0.85, 0.22, 0.03) * crackLine * pulse * 0.22 * uFire;
    // edges darker
    col *= 0.6 + 0.4 * smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    gl_FragColor = vec4(col, 1.0);
  }
`,ua=`
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
`,fa=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float glow = exp(-vUv.y * 3.0);
    float lick = fbm(vec2(vUv.x * 16.0, vUv.y * 4.0 - uTime * 0.05));
    vec3 col = mix(vec3(0.50, 0.06, 0.01), vec3(1.0, 0.35, 0.06), glow * lick);
    float a = glow * (0.4 + 0.4 * lick) * uForm * 0.6;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.4, a);
  }
`,va=`
  precision highp float;
  uniform float uTime;
  uniform float uForm;
  uniform float uSeed;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    float x = vUv.x * 2.0 - 1.0;
    float core = exp(-x * x * 7.0);
    float streaks = pow(noise(vec2(vUv.x * 9.0 + uSeed * 31.0, vUv.y * 5.0 + uTime * (0.55 + uSeed * 0.2))), 2.0);
    float vf = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    vec3 col = mix(vec3(0.9, 0.20, 0.03), vec3(1.0, 0.65, 0.20), streaks);
    float a = core * (streaks * 1.2 + 0.12) * vf * uForm * 0.8;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * a * 2.0, a);
  }
`,da=`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // a hunched skull-mass of smoke, wider than tall
    vec2 e = p; e.y *= 1.15; e.y -= 0.05;
    float head = 1.0 - smoothstep(0.30, 0.85, length(e));
    float smoke = fbm(p * 2.8 + vec2(uTime * 0.015, -uTime * 0.02));
    // horn masses darken above
    float hornL = 1.0 - smoothstep(0.05, 0.30, abs((p.x + 0.42) - (p.y - 0.30) * 0.55));
    float hornR = 1.0 - smoothstep(0.05, 0.30, abs((p.x - 0.42) + (p.y - 0.30) * 0.55));
    float horns = max(hornL, hornR) * smoothstep(0.1, 0.55, p.y);
    float a = max(head * (0.55 + 0.35 * smoke), horns * 0.7) * uWatch;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vec3(0.012, 0.004, 0.004), a);
  }
`,ma=`
  precision highp float;
  uniform float uTime;
  uniform float uWatch;
  uniform vec2  uLook;    // where the pupils point — at YOU
  varying vec2 vUv;
  
  __NOISE__
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    vec3 col = vec3(0.0);
    float smoke = fbm(p * 3.0 + vec2(uTime * 0.02, -uTime * 0.03));

    // rims of ember light crawling over the smoke mass
    vec2 e = p; e.y *= 1.15; e.y -= 0.05;
    float rr = length(e);
    float rim = exp(-pow(rr - 0.55, 2.0) * 30.0) * (0.4 + 0.6 * smoke);
    col += vec3(0.75, 0.14, 0.03) * rim * 0.8;

    // horn edges burning
    float hL = exp(-pow(abs((p.x + 0.42) - (p.y - 0.30) * 0.55) - 0.10, 2.0) * 300.0);
    float hR = exp(-pow(abs((p.x - 0.42) + (p.y - 0.30) * 0.55) - 0.10, 2.0) * 300.0);
    float hmask = smoothstep(0.12, 0.5, p.y) * smoothstep(0.95, 0.55, p.y);
    col += vec3(0.95, 0.30, 0.06) * (hL + hR) * hmask * 0.7;

    // THE EYES. Open. On you.
    for (int s = -1; s <= 1; s += 2) {
      vec2 c = vec2(0.20 * float(s), 0.06);
      vec2 q = p - c;
      float eye = 1.0 - smoothstep(0.045, 0.105, length(q * vec2(1.0, 1.9)));
      col += vec3(1.0, 0.32, 0.05) * eye * 1.6;
      // the pupil tracks — a darker slit inside the ember
      vec2 pq = q - uLook * 0.035;
      float pupil = 1.0 - smoothstep(0.012, 0.030, length(pq * vec2(1.0, 0.9)));
      col -= vec3(0.95, 0.35, 0.1) * pupil * 1.5 * eye;
      // narrow lids
      float lid = smoothstep(0.09, 0.05, abs(q.y) * 2.2 - abs(q.x) * 0.4);
      col *= mix(vec3(1.0), vec3(lid), eye * 0.001 + 0.0);   // keep shape soft
    }

    // the maw: a wide glow low on the face, breathing with the drone
    float maw = exp(-pow((p.y + 0.34) * 4.4, 2.0)) * exp(-p.x * p.x * 7.0);
    float breathe = 0.55 + 0.45 * sin(uTime * 0.45);
    col += vec3(1.0, 0.22, 0.03) * maw * breathe * 0.9;

    float lum = dot(col, vec3(0.5));
    float a = min(lum, 1.0) * uWatch;
    if (a < 0.005) discard;
    gl_FragColor = vec4(max(col, 0.0) * uWatch, a);
  }
`,ha=`
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
`;function _e(l,t,a,i,{blending:c=X,order:x=8,vert:u=Pe,side:g=ct}={}){const s=new D({vertexShader:u,fragmentShader:a.replace("__NOISE__",We),uniforms:i,transparent:!0,depthWrite:!1,blending:c,side:g}),v=new J(new Ce(l,t),s);return v.frustumCulled=!1,v.renderOrder=x,v}function pa(l){const t=new Ge;t.visible=!1,l.add(t);const a=[],i=[],c=new xt(3151370,1.6);t.add(c);const x=[];for(let o=0;o<4;o++){const w=new yt(16734744,20,26,1.8);t.add(w),x.push(w)}const u={uTime:{value:0},uFire:{value:1}};a.push(u),i.push(u);const g=new J(new bt(3.6,.35,170),new D({vertexShader:Pe,fragmentShader:ca.replace("__NOISE__",We),uniforms:u}));g.position.set(0,-.18,-70),t.add(g);const s=new xe(.055,.075,.95,7),v=new Ne({color:1511436,roughness:.9}),b=new tt(s,v,68),S=new at;let k=0;for(let o=4;o>=-148;o-=4.5)for(const w of[-1.9,1.9]){if(k>=68)break;S.makeTranslation(w,.45,o),b.setMatrixAt(k++,S)}b.instanceMatrix.needsUpdate=!0,t.add(b);for(const[o,w,p,G]of[[210,90,.75,3],[330,150,.9,2]]){const f={uForm:{value:1},uTall:{value:p}},U=new J(new xe(o,o,w,96,1,!0),new D({vertexShader:Pe,fragmentShader:ua,uniforms:f,transparent:!0,depthWrite:!1,side:ge}));U.position.y=w*.32,U.renderOrder=G,U.frustumCulled=!1,t.add(U)}const A={uTime:{value:0},uForm:{value:1}};a.push(A),i.push(A);const m=new J(new xe(360,360,200,96,1,!0),new D({vertexShader:Pe,fragmentShader:fa.replace("__NOISE__",We),uniforms:A,transparent:!0,depthWrite:!1,depthTest:!1,blending:X,side:ge}));m.position.y=30,m.renderOrder=1,m.frustumCulled=!1,t.add(m);const T=[];for(let o=0;o<8;o++){const w={uTime:{value:0},uForm:{value:1},uSeed:{value:o/8}};a.push(w),i.push(w);const p=_e(16,190,va,w,{order:4}),G=o/8*Math.PI*2+.4,f=130+o%3*55;p.position.set(Math.cos(G)*f,60,Math.sin(G)*f-40),p.rotation.y=-G+Math.PI/2,t.add(p),T.push(p)}const O={uTime:{value:0},uWatch:{value:0}},n={uTime:{value:0},uWatch:{value:0},uLook:{value:new Be(0,0)}};a.push(O,n);const C=_e(150,110,da,O,{blending:Me,order:5});C.position.set(0,78,-235),t.add(C);const P=_e(150,110,ma,n,{order:6});P.position.set(0,78,-234),t.add(P);const z={uTime:{value:0},uForm:{value:1},uRelease:{value:0}};a.push(z);const V=_e(60,44,ha,z,{blending:Me,order:7});V.position.set(0,15,-165),t.add(V);const N=[];for(let o=0;o<14;o++){const w=o%2===0?-1:1,p=-6-o*10.5-o%3*1.5;N.push(new Q(w*(5.3+o%3*.9),0,p))}const ee=[],H=[],Z=new pt().setMeshoptDecoder(gt);Z.load("assets/models/cauldron.glb",o=>{let w=null;if(o.scene.traverse(R=>{R.isMesh&&!w&&(w=R)}),!w)return;const p=w.geometry;p.computeBoundingBox();const G=p.boundingBox,f=new Q;G.getSize(f);const U=2.4/Math.max(f.x,f.z),E=new Ne({color:2299922,roughness:.93,metalness:.25}),I=new tt(p,E,N.length),M=new at;N.forEach((R,r)=>{M.compose(new Q(R.x,-G.min.y*U-.15,R.z),new St().setFromEuler(new Tt(0,r*1.7%6.28,0)),new Q(U,U,U)),I.setMatrixAt(r,M)}),I.instanceMatrix.needsUpdate=!0,I.frustumCulled=!1,t.add(I);const B=f.y*U;N.forEach((R,r)=>{const Y={uTime:{value:0},uFire:{value:1},uSeed:{value:r*.37%1}};a.push(Y),i.push(Y);const te=_e(2.4,3,sa,Y,{order:9,vert:la});te.position.set(R.x,B+.9,R.z),t.add(te)}),x.forEach((R,r)=>{const Y=N[r*3]||N[0];R.position.set(Y.x,B+1,Y.z)})}),Z.load("assets/models/figure.glb",o=>{let w=null;if(o.scene.traverse(E=>{E.isMesh&&!w&&(w=E)}),!w)return;const p=w.geometry;p.computeBoundingBox();const G=new Q;p.boundingBox.getSize(G);const f=1.75/G.y,U=new Ne({color:1182472,roughness:1});for(let E=0;E<N.length;E++){const I=1+E%2;for(let M=0;M<I;M++){const B=new J(p,U),R=N[E];B.scale.setScalar(f*(.9+M*.13)),B.position.set(R.x+(M?.45:-.3),.55,R.z+(M?-.2:.25)),B.rotation.y=(E*2.1+M*2.8)%6.28,B.frustumCulled=!1,t.add(B),ee.push({mesh:B,seed:E*1.3+M*7.7,baseY:B.position.y})}}for(let E=0;E<4;E++){const I=new J(p,U);I.scale.setScalar(f*2.2),I.frustumCulled=!1,t.add(I),H.push({mesh:I,col:T[E*2],seed:E*3.3})}});const y=new Q;return{group:t,set reveal(o){t.visible=o>.002},set watch(o){O.uWatch.value=o,n.uWatch.value=o},set release(o){for(const p of i)p.uFire&&(p.uFire.value=1-o);for(const p of i)p.uForm&&(p.uForm.value=1-o*.85);z.uRelease.value=o;const w=1-o*.9;c.intensity=1.6*w+o*2.2,c.color.setRGB(.19+o*.7,.09+o*.75,.04+o*.8);for(const p of x)p.intensity=20*w},update(o,w){for(const f of a)f.uTime&&(f.uTime.value=o);w.getWorldPosition(y);const p=ke.clamp((y.x-0)/60,-1,1),G=ke.clamp((y.y-40)/90,-1,.4);n.uLook.value.set(p,G);for(const f of ee){const U=Math.sin(o*.9+f.seed);f.mesh.rotation.z=U*.14,f.mesh.rotation.x=Math.sin(o*.6+f.seed*1.7)*.1,f.mesh.position.y=f.baseY+Math.sin(o*.5+f.seed)*.1}for(const f of H){const U=(o*.14+f.seed)%1;f.mesh.position.copy(f.col.position),f.mesh.position.y=140-U*170,f.mesh.rotation.set(o*.8+f.seed,o*.5,o*.7+f.seed)}for(let f=0;f<x.length;f++){const U=x[f];U.intensity>.2&&(U.intensity=U.intensity*.92+(16+Math.sin(o*7+f*2.3)*3+Math.sin(o*13.7+f)*2)*.08)}}}}const ie={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},j=116,q={start:j,url:"assets/audio/journey_02.mp3",starsOut:[j+5,j+17],palette:[j+6,j+21],full:[j+6,j+23],curtains:[j+10,j+26],core:[j+18.5,j+24.5],field:[j+20,j+28],breathIn:[j+28.9,j+33.3],breathOut:[j+33.6,j+38.5],loopFrom:j+66,loopPeriod:11.5,loopAmp:.62},W=j+64,_={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:W,collide:[W+.3,W+6.8],blast:W+6.85,throw:[W+7,W+11],world:[W+9.5,W+16],drumFrom:W+23.5,form:[W+32.2,W+47.5],flare:[W+48.4,W+51],open:[W+60.8,W+65.5],suck:[W+64.5,W+70.5],black:[W+69.5,W+71.5]},ae=253.5,oe={voiceUrl:"assets/audio/journey_04.mp3",voiceAt:ae+2,reveal:[ae,ae+4.5],walk:[ae+3,ae+62],watch:[ae+24.4,ae+30.5],mantra:ae+57.2,release:[ae+57.2,ae+61.5],white:[ae+59.5,ae+64.5],end:ae+68},ga="assets/audio/journey_01.mp3",Ae=4,wa=[82.5,88.5],st=(l,t,a)=>l+(t-l)*a,d=(l,[t,a])=>ke.clamp((l-t)/(a-t),0,1),h=l=>l*l*(3-2*l);function pe(l,t){const a=document.getElementById("status");a&&(a.textContent=l);const i=document.getElementById("substatus");i&&t!==void 0&&(i.textContent=t)}function xa(l,t){const a=l.createGain();a.gain.value=0,a.connect(t);const i=l.createBiquadFilter();i.type="lowpass",i.frequency.value=220,i.Q.value=.6,i.connect(a);for(const[c,x]of[[38,.55],[57,.28],[76.4,.18]]){const u=l.createOscillator();u.type="sine",u.frequency.value=c;const g=l.createGain();g.gain.value=x,u.connect(g).connect(i),u.start()}return{set level(c){a.gain.setTargetAtTime(c*.09,l.currentTime,.25)}}}async function ya(){pe("Preparing…","starting the engine");const l=document.getElementById("view"),t=new Ft({canvas:l,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=_t,t.toneMapping=At,t.toneMappingExposure=1.15;const a=new Mt;a.background=null;const i=new kt(70,window.innerWidth/window.innerHeight,.05,900);i.position.set(0,1.35,0);const c=new Ge;c.add(i),a.add(c),pe("Preparing…","building the sky");const x=Et(a),u=Ot(a),g=ot(u.group,{radius:460,scale:.85,gain:.7,order:-2}),s=ot(u.group,{radius:300,scale:1.9,gain:1,order:-1}),v=It(u.group),b=zt(a),S=Nt(a),k=Qt(a);pe("Preparing…","building the worlds");const A=na(a),m=pa(a);window.addEventListener("resize",()=>{i.aspect=window.innerWidth/window.innerHeight,i.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const T=new Audio;T.src=ga,T.preload="auto",T.crossOrigin="anonymous";let O=!1;T.addEventListener("canplaythrough",()=>{O=!0},{once:!0}),T.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),O=!0},{once:!0});let n=null,C=null,P=null,z=null,V=null;function N(){if(!n)try{n=new(window.AudioContext||window.webkitAudioContext);const e=n.createGain();e.gain.value=1,e.connect(n.destination);const F=n.createMediaElementSource(T);P=n.createGain(),P.gain.value=1,F.connect(P).connect(e),S.attachAnalyser(n,P),C=xa(n,e);const K=n.sampleRate*2,re=n.createBuffer(1,K,n.sampleRate),ve=re.getChannelData(0);for(let ce=0;ce<K;ce++)ve[ce]=Math.random()*2-1;const le=n.createBufferSource();le.buffer=re,le.loop=!0;const se=n.createBiquadFilter();se.type="bandpass",se.frequency.value=320,se.Q.value=.7,z=n.createGain(),z.gain.value=0,le.connect(se).connect(z).connect(e),le.start(),V=ce=>{const ue=n.currentTime;for(const[de,Fe,ye]of[[0,58,.5],[.19,46,.34]]){const we=n.createOscillator();we.type="sine",we.frequency.setValueAtTime(Fe*1.6,ue+de),we.frequency.exponentialRampToValueAtTime(Fe,ue+de+.06);const be=n.createGain();be.gain.setValueAtTime(0,ue+de),be.gain.linearRampToValueAtTime(ye*ce*.4,ue+de+.012),be.gain.exponentialRampToValueAtTime(1e-4,ue+de+.3),we.connect(be).connect(e),we.start(ue+de),we.stop(ue+de+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let ee=null,H=null,Z=!1,y=null,o=null,w=!1,p=null,G=null,f=!1;async function U(){try{const F=await(await fetch(q.url)).arrayBuffer();n&&(ee=await n.decodeAudioData(F))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const F=await(await fetch(_.voiceUrl)).arrayBuffer();n&&(y=await n.decodeAudioData(F))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}try{const F=await(await fetch(oe.voiceUrl)).arrayBuffer();n&&(p=await n.decodeAudioData(F))}catch(e){console.warn("[journey] segment-4 voice failed to load",e)}}let E=!1,I=0;T.addEventListener("loadedmetadata",()=>{isFinite(T.duration)&&T.duration});let M=null;function B(){if(M!==null)return M;if(!E)return-Ae;if(G!==null&&!f&&n){const e=oe.voiceAt+(n.currentTime-G);return I=performance.now()/1e3-e,e}if(o!==null&&!w&&n){const e=_.voiceAt+(n.currentTime-o);return I=performance.now()/1e3-e,e}if(H!==null&&!Z&&n){const e=q.start+(n.currentTime-H);return I=performance.now()/1e3-e,e}return!T.ended&&T.currentTime>.01?(I=performance.now()/1e3-T.currentTime,T.currentTime):performance.now()/1e3-I}let R="flat";async function r(){if(!navigator.xr)return null;const e=F=>Promise.race([F.catch(()=>!1),new Promise(K=>setTimeout(()=>K(!1),4e3))]);return await e(navigator.xr.isSessionSupported("immersive-ar"))?"immersive-ar":await e(navigator.xr.isSessionSupported("immersive-vr"))?"immersive-vr":null}async function Y(){N(),n&&n.state==="suspended"&&await n.resume(),U();const e=await r();if(e){const F={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const K=await navigator.xr.requestSession(e,F);await t.xr.setSession(K),R=e,K.addEventListener("end",()=>{R="flat"})}catch(K){console.warn("[journey] could not start",e,K)}}document.body.classList.add("started"),E=!0,I=performance.now()/1e3+Ae,setTimeout(()=>{T.play().catch(F=>console.warn("[journey] autoplay blocked",F))},Ae*1e3)}let te=null;function ft(e){if(te)return te;let F=h(d(e,[q.breathIn[0],q.breathIn[0]+1.6]))*(1-h(d(e,[q.breathIn[1],q.breathIn[1]+1]))),K=h(d(e,[q.breathOut[0],q.breathOut[0]+.25]))*(1-h(d(e,[q.breathOut[0]+.55,q.breathOut[0]+1.2])));if(e>q.loopFrom&&e<_.collide[0]){const re=(e-q.loopFrom)%q.loopPeriod,ve=q.loopAmp,le=ve*h(d(re,[0,1.8]))*(1-h(d(re,[4.4,5.6]))),se=ve*h(d(re,[6,6.3]))*(1-h(d(re,[6.7,7.4])));F=Math.max(F,le),K=Math.max(K,se)}return[F,K]}const He=new Q;let Ye=-Ae,Ie=0,qe=0,$e=-1;t.setAnimationLoop(()=>{const e=B(),F=ke.clamp(e-Ye,.001,.1);Ye=e;const K=t.getContext(),re=Math.max(.5,K.drawingBufferHeight/900),ve=t.xr.isPresenting?t.xr.getCamera():i;if(E&&H===null&&ee&&n&&e>=q.start&&M===null){const L=n.createBufferSource();L.buffer=ee,L.connect(P),L.onended=()=>{Z=!0},L.start(),H=n.currentTime}if(E&&o===null&&y&&n&&e>=_.voiceAt&&M===null){const L=n.createBufferSource();L.buffer=y,L.connect(P),L.onended=()=>{w=!0},L.start(),o=n.currentTime}if(E&&G===null&&p&&n&&e>=oe.voiceAt&&M===null){const L=n.createBufferSource();L.buffer=p,L.connect(P),L.onended=()=>{f=!0},L.start(),G=n.currentTime}const[le,se]=ft(e),ce=h(d(e,_.collide)),ue=h(d(e,[_.blast,_.blast+.22]))*(1-h(d(e,[_.blast+.55,_.blast+1.8]))),de=d(e,[_.blast,_.blast+3.2]),Fe=h(d(e,[_.throw[0],_.throw[0]+.6]))*(1-h(d(e,[_.throw[1]-1.2,_.throw[1]]))),ye=h(d(e,_.form)),we=h(d(e,_.world)),be=h(d(e,[_.flare[0],_.flare[0]+.7]))*(1-h(d(e,[_.flare[1]-.6,_.flare[1]+1.2]))),ze=h(d(e,_.open)),me=h(d(e,_.suck)),Ke=h(d(e,_.black)),ne=h(d(e,[_.blast,_.blast+1.3])),vt=h(d(e,[_.throw[1]-.5,_.throw[1]+3.5])),fe=h(d(e,oe.reveal)),Je=h(d(e,oe.walk)),dt=h(d(e,oe.watch)),Re=h(d(e,oe.release)),Se=h(d(e,oe.white));m.reveal=fe,m.watch=dt*(1-Re),m.release=Re,m.update(e,ve),c.position.z=-Je*120,A.collide=ce,A.ring=de,A.rush=Fe;const Oe=1-fe;A.form=Math.max(we*.34,ye)*Oe,A.flare=be*Oe,A.open=ze*Oe,A.suck=me*Oe,A.black=Math.max(Ke*(1-fe),0),A.flash=Math.max(ue,Se*.92),A.update(e,re,ve);const mt=st(0,.55,h(d(e,ie.motesIn)))+st(0,.45,h(d(e,ie.motesFull)));b.fade=mt*(1-h(d(e,[ie.dim[0],ie.dim[0]+9]))),b.update(e,re),x.opacity=Math.pow(d(e,ie.dim),1.6),u.emerge=d(e,ie.stars),u.global=1-h(d(e,q.starsOut))+vt*(1-me)*.85,u.update(e,re);const Ze=h(d(e,q.palette)),Xe=h(d(e,q.full)),De=(1-.45*k.breathing)*(1-ne)*(1-ce*.8);s.hell=fe*(1-Se),g.hell=fe*(1-Se),s.emerge=h(d(e,ie.nebula))*(De+ne*.3*(1-me))+fe*.28*(1-Se),s.palette=Ze*(1-ne*.85),s.full=Xe*(1-ne*.6),s.update(e),g.emerge=h(d(e,ie.nebula))*(.9*De+ne*.45*(1-me))+fe*.34*(1-Se),g.palette=Ze*(1-ne*.85),g.full=Xe*(1-ne*.6),g.update(e*.55),v.emerge=h(d(e,q.curtains))*De,v.update(e);const ht=.05+le*.85-se*1;qe+=(ht-qe)*(1-Math.exp(-F*2.2)),Ie+=qe*F,s.radial=Ie,g.radial=Ie*.35,k.core=h(d(e,q.core))*(1-ne),k.field=h(d(e,q.field))*(1-ne),k.gateIn=le*(1-ne),k.gateOut=se*(1-ne),k.update(e,F,ve,re);const et=h(d(e,[ie.dim[0]+8,ie.dim[1]+8]))*(1-me);if(He.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(et),e<oe.reveal[0]?c.position.copy(He):c.position.set(0,0,-Je*120),c.rotation.z=Math.sin(e*.013)*.03*et,S.fade=h(d(e,[-Ae+.8,-.2]))*(1-h(d(e,wa))),S.update(e,F,ve),C)if(e<q.start-4){const L=h(d(e,ie.drone)),Te=1-.45*h(d(e,[90,118]));C.level=L*Te}else e<_.collide[0]?C.level=.1+.1*le-.04*se:e<oe.reveal[0]?C.level=.1+ce*.16+ye*.12+me*.4-Ke*.34:C.level=(.16+fe*.1)*(1-Re);if(z&&n&&M===null){const L=fe*.3*(1-Re),Te=Se*.24,Ve=ce*.18+ue*1+Fe*.55+me*.85+L+Te;z.gain.setTargetAtTime(Ve*.16,n.currentTime,.12)}if(V&&M===null&&e>_.drumFrom&&e<oe.mantra){let L;if(e<oe.reveal[0])L=1.45-ye*.35-ze*.25-me*.25;else{const Ve=Math.floor(e/1.6);L=1.35+Math.sin(Ve*12.9898)*43758.5453%1*.55}const Te=Math.floor(e/L);Te!==$e&&($e=Te,V(.55+ye*.3+ze*.45+me*.6+fe*.25))}t.render(a,i)}),pe("Preparing…","checking the headset");const Qe=await r();Qe==="immersive-ar"?pe("Put your headset on and begin.","You will start in your own room."):Qe==="immersive-vr"?pe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):pe("Preview in browser","Open this page in the Quest browser for the full experience.");const Le=document.getElementById("begin");Le.disabled=!1,Le.addEventListener("click",async()=>{Le.disabled=!0,O||(pe("Loading the voice…"),await new Promise(e=>{if(O)return e();const F=setInterval(()=>{O&&(clearInterval(F),e())},100);setTimeout(()=>{clearInterval(F),e()},6e3)})),await Y()}),window.JOURNEY={THREE:Ut,scene:a,camera:i,renderer:t,stars:u,nebula:s,voidShell:x,motes:b,narrator:S,prana:k,sec3:A,naraka:m,T:ie,SEG2:q,SEG3:_,SEG4:oe,seek:e=>{M=e},resume:()=>{M=null},look:(e,F=0)=>{i.rotation.set(F,e,0,"YXZ")},moveTo:(e,F,K)=>{c.position.set(0,0,0),i.position.set(e,F,K)},forceBreath:(e,F)=>{te=e===null?null:[e,F]},fakeLevel:e=>{S.uniforms.uLevel.value=e},dryStart:()=>{E=!0,I=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:B(),xrMode:R,voidOpacity:x.opacity,starEmerge:u.emerge,nebulaEmerge:s.emerge,orbFade:S.fade})},window.__JOURNEY_READY=!0}ya().catch(l=>{console.error(l),window.__JOURNEY_ERROR=String(l&&l.stack||l),pe("Something went wrong.",String(l))});
