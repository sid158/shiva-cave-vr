import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as ke,ae as k,an as de,M as J,C as Je,Y as Oe,E as ye,a as U,ak as z,W as be,G as Re,al as Te,ah as Fe,V as H,am as Ue,c as Ve,y as Ke,aC as Xe,S as Ze,aD as et,aE as tt,X as at,aG as ot}from"./three-B0MzMegT.js";function Ye(r){let t=r>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}function rt(r){const t=new ke(500,24,16),a=new k({side:de,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),i=new J(t,a);return i.frustumCulled=!1,i.renderOrder=-10,r.add(i),{mesh:i,set opacity(c){a.uniforms.uOpacity.value=c},get opacity(){return a.uniforms.uOpacity.value}}}const it=`
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
`,nt=`
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
`;function lt(r,{count:t=5200}={}){const a=Ye(20260805),i=new Float32Array(t*3),c=new Float32Array(t),x=new Float32Array(t),f=new Float32Array(t),h=new Float32Array(t*3),l=new Je;for(let s=0;s<t;s++){let T=a()*2-1;const n=a()*Math.PI*2;a()<.42&&(T*=.3);const F=Math.sqrt(Math.max(0,1-T*T)),_=90+a()*320;i[s*3]=Math.cos(n)*F*_,i[s*3+1]=T*_,i[s*3+2]=Math.sin(n)*F*_;const I=Math.pow(a(),2.4);x[s]=.85+I*4.2,c[s]=Oe.clamp(.86-I*.9+(a()-.5)*.22,0,.9),f[s]=a()*100;const q=a();q>.86?l.setHSL(.07+a()*.04,.55,.72):q>.66?l.setHSL(.12+a()*.03,.22,.85):l.setHSL(.58+a()*.06,.28+a()*.3,.88),h[s*3]=l.r,h[s*3+1]=l.g,h[s*3+2]=l.b}const d=new ye;d.setAttribute("position",new U(i,3)),d.setAttribute("aDelay",new U(c,1)),d.setAttribute("aSize",new U(x,1)),d.setAttribute("aSeed",new U(f,1)),d.setAttribute("aTint",new U(h,3));const p={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1},uGlobal:{value:1}},g=new k({vertexShader:it,fragmentShader:nt,uniforms:p,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}),S=new be(d,g);S.frustumCulled=!1,S.renderOrder=5;const b=new Re;return b.add(S),r.add(b),{group:b,uniforms:p,set emerge(s){p.uEmerge.value=s},get emerge(){return p.uEmerge.value},set global(s){p.uGlobal.value=s},update(s,T){p.uTime.value=s,p.uPixel.value=T,b.rotation.y=s*.0042,b.rotation.x=Math.sin(s*.017)*.014}}}const st=`
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
`;function ze(r,{radius:t=430,scale:a=2.1,gain:i=1,order:c=4}={}){const x=new ke(t,48,32),f={uTime:{value:0},uEmerge:{value:0},uPalette:{value:0},uFull:{value:0},uRadial:{value:0},uScale:{value:a},uGain:{value:i}},h=new k({side:de,transparent:!0,depthWrite:!1,depthTest:!1,blending:z,uniforms:f,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:st}),l=new J(x,h);return l.frustumCulled=!1,l.renderOrder=c,r.add(l),{mesh:l,set emerge(d){f.uEmerge.value=d},get emerge(){return f.uEmerge.value},set palette(d){f.uPalette.value=d},set full(d){f.uFull.value=d},set radial(d){f.uRadial.value=d},update(d){f.uTime.value=d}}}const ct=`
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
`;function ut(r){const t=new Te(150,150,240,64,1,!0),a={uTime:{value:0},uEmerge:{value:0}},i=new k({side:de,transparent:!0,depthWrite:!1,depthTest:!1,blending:z,uniforms:a,vertexShader:`
      varying vec2 vUv;
      varying float vY;
      void main() {
        vUv = uv;
        vY = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:ct}),c=new J(t,i);return c.frustumCulled=!1,c.renderOrder=5,r.add(c),{mesh:c,set emerge(x){a.uEmerge.value=x},update(x){a.uTime.value=x,c.rotation.y=x*.006}}}const ft=`
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
`,dt=`
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
`;function vt(r,{count:t=260,radius:a=3}={}){const i=Ye(77003),c=new Float32Array(t*3),x=new Float32Array(t),f=new Float32Array(t);for(let g=0;g<t;g++)c[g*3]=(i()-.5)*a*2.2,c[g*3+1]=.25+i()*2.3,c[g*3+2]=(i()-.5)*a*2.2,x[g]=i(),f[g]=.5+i()*1.4;const h=new ye;h.setAttribute("position",new U(c,3)),h.setAttribute("aSeed",new U(x,1)),h.setAttribute("aSize",new U(f,1));const l={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},d=new k({vertexShader:ft,fragmentShader:dt,uniforms:l,transparent:!0,depthWrite:!1,blending:z}),p=new be(h,d);return p.frustumCulled=!1,p.renderOrder=3,r.add(p),{points:p,set fade(g){l.uFade.value=g},get fade(){return l.uFade.value},update(g,S){l.uTime.value=g,l.uPixel.value=S}}}const mt=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,ht=`
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
`;function pt(r){const t={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},a=new k({vertexShader:mt,fragmentShader:ht,uniforms:t,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}),i=new J(new Fe(.44,.44),a);i.frustumCulled=!1,i.renderOrder=30,r.add(i);let c=null,x=null,f=0;const h=new H(0,1.35,-1.7),l=new H,d=new H(0,1.35,-1.7);return i.position.copy(d),{mesh:i,uniforms:t,attachAnalyser(p,g){c=p.createAnalyser(),c.fftSize=512,c.smoothingTimeConstant=.55,x=new Uint8Array(c.frequencyBinCount),g.connect(c)},set fade(p){t.uFade.value=p},get fade(){return t.uFade.value},update(p,g,S){t.uTime.value=p,S.getWorldDirection(l),S.getWorldPosition(h),h.addScaledVector(l,1.7);const b=1-Math.exp(-g*5.5);d.lerp(h,b),i.position.set(d.x,d.y+Math.sin(p*.9)*.008,d.z);let s=0;if(c){c.getByteFrequencyData(x);const n=Math.max(8,x.length*.45|0);let E=0;for(let F=2;F<n;F++)E+=x[F];s=Math.min(1,E/(n-2)/132)}const T=s>f?1-Math.exp(-g*22):1-Math.exp(-g*3.2);f+=(s-f)*T,t.uLevel.value=f}}}function gt(r){let t=r>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const wt=`
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
`,xt=`
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
`,yt=`
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
`,bt=`
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
`,St=`
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
`,Ne=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`;function Tt(r){const t=gt(90210),a=850,i=new Float32Array(a),c=new Float32Array(a*3),x=new Float32Array(a),f=new Float32Array(a),h=new H(0,.05,-1).normalize(),l=new H;for(let m=0;m<a;m++){i[m]=t();do l.set(t()*2-1,t()*2-1,t()*2-1);while(l.lengthSq()>1||l.lengthSq()<.05);l.normalize(),t()<.25&&l.lerp(h,.6).normalize(),c[m*3]=l.x,c[m*3+1]=l.y,c[m*3+2]=l.z,x[m]=2.2+Math.pow(t(),.7)*5.8,f[m]=1.8+t()*3.4}const d=new ye;d.setAttribute("position",new U(new Float32Array(a*3),3)),d.setAttribute("aSeed",new U(i,1)),d.setAttribute("aDir",new U(c,3)),d.setAttribute("aRad",new U(x,1)),d.setAttribute("aSize",new U(f,1));const p={uTime:{value:0},uIn:{value:0},uField:{value:0},uPixel:{value:1},uNose:{value:new H(0,1.3,-.3)}},g=new be(d,new k({vertexShader:wt,fragmentShader:xt,uniforms:p,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}));g.frustumCulled=!1,g.renderOrder=24,r.add(g);const S=700,b=new Float32Array(S),s=new Float32Array(S*3);for(let m=0;m<S;m++){b[m]=t();do l.set(t()*2-1,t()*2-1,t()*2-1);while(l.lengthSq()>1||l.lengthSq()<.05);l.normalize(),s[m*3]=l.x,s[m*3+1]=l.y,s[m*3+2]=l.z}const T=new ye;T.setAttribute("position",new U(new Float32Array(S*3),3)),T.setAttribute("aSeed",new U(b,1)),T.setAttribute("aDir",new U(s,3));const n={uTime:{value:0},uOut:{value:0},uPixel:{value:1},uNose:{value:new H(0,1.3,-.3)},uFwd:{value:new H(0,0,-1)}},E=new be(T,new k({vertexShader:yt,fragmentShader:bt,uniforms:n,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}));E.frustumCulled=!1,E.renderOrder=25,r.add(E);const F={uTime:{value:0},uCore:{value:0},uIn:{value:0}},_=new J(new Fe(16,16),new k({vertexShader:Ne,fragmentShader:St,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}));_.position.set(0,2.5,-14),_.frustumCulled=!1,_.renderOrder=6,r.add(_);const I={uTime:{value:0},uCore:{value:0}},q=new J(new Fe(5,90),new k({vertexShader:Ne,fragmentShader:`
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
      `,uniforms:I,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}));q.position.set(0,2.5,-14.2),q.frustumCulled=!1,q.renderOrder=5,r.add(q);const N=new H,B=new H;let D=0,V=0;return{get breathing(){return Math.max(D,V)},set core(m){F.uCore.value=m,I.uCore.value=m},set field(m){p.uField.value=m},gateIn:0,gateOut:0,update(m,K,X,O){const L=1-Math.exp(-K*(this.gateIn>D?3.2:1.8));D+=(this.gateIn-D)*L;const R=1-Math.exp(-K*(this.gateOut>V?9:4));V+=(this.gateOut-V)*R,X.getWorldPosition(N),X.getWorldDirection(B),N.addScaledVector(B,.12),N.y-=.05,p.uTime.value=m,p.uPixel.value=O,p.uIn.value=D,p.uNose.value.copy(N),n.uTime.value=m,n.uPixel.value=O,n.uOut.value=V,n.uNose.value.copy(N),n.uFwd.value.copy(B),F.uTime.value=m,F.uIn.value=D,I.uTime.value=m}}}const Ft=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Be=`
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
`,At=`
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
`,_t=`
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
`,Mt=`
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
`,Ct=`
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
`,Le=`
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
`,We=`
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
`,Et=`
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
`,Ut=`
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
`,kt=`
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
`,Ot=`
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
`,Rt=`
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
`;function se(r,t,a,i,{blending:c=z,order:x=8}={}){const f=new k({vertexShader:Ft,fragmentShader:a,uniforms:i,transparent:!0,depthWrite:!1,depthTest:!1,blending:c,side:Ke}),h=new J(new Fe(r,t),f);return h.frustumCulled=!1,h.renderOrder=x,h}function Pt(r){const t=new Re;r.add(t);const a={uTime:{value:0},uForm:{value:0},uOpen:{value:0},uSuck:{value:0},uFlare:{value:0}},i=At,c=_t.replace("__COMMON__",i).replace("__NOISE__",Be),x=Mt.replace("__COMMON__",i).replace("__NOISE__",Be),f=260,h=220,l=-190,d=55,p=se(f,h,c,a,{blending:Ue,order:7});p.position.set(0,d,l),t.add(p);const g=se(f,h,x,a,{order:8});g.position.set(0,d,l),t.add(g);const S=new H(0,d+.38*(h/2),l),b=se(34,34,Ct,{uTime:a.uTime,uForm:{value:0}},{order:8});b.position.set(95,130,-180),t.add(b);const s=se(70,70,Le,{uTime:a.uTime,uForm:{value:0},uSpin:{value:.01}},{order:7});s.position.set(-150,45,-175),t.add(s);const T=se(44,44,Le,{uTime:a.uTime,uForm:{value:0},uSpin:{value:-.014}},{order:7});T.position.set(150,20,-165),t.add(T);const n={uForm:{value:0}},E=new J(new Te(90,90,34,96,1,!0),new k({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:Ut,uniforms:n,transparent:!0,depthWrite:!1,depthTest:!1,blending:Ue,side:de}));E.position.y=-14,E.renderOrder=9,E.frustumCulled=!1,t.add(E);const F={uTime:a.uTime,uForm:{value:0}},_=new J(new Te(110,110,60,96,1,!0),new k({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:kt,uniforms:F,transparent:!0,depthWrite:!1,depthTest:!1,blending:z,side:de}));_.position.y=-12,_.renderOrder=6,_.frustumCulled=!1,t.add(_);const I=420,q=new Float32Array(I*3),N=new Float32Array(I);for(let o=0;o<I;o++){const W=Math.random()*Math.PI*2,$=40+Math.random()*55;q[o*3]=Math.cos(W)*$,q[o*3+1]=-20+Math.random()*30,q[o*3+2]=Math.sin(W)*$,N[o]=Math.random()}const B=new ye;B.setAttribute("position",new U(q,3)),B.setAttribute("aSeed",new U(N,1));const D={uTime:a.uTime,uForm:{value:0},uPixel:{value:1}},V=new be(B,new k({vertexShader:`
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
    `,uniforms:D,transparent:!0,depthWrite:!1,depthTest:!1,blending:z}));V.frustumCulled=!1,V.renderOrder=9,t.add(V);const m={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new Ve(1,-.1)},uSpin:{value:.05}},K={uTime:{value:0},uShow:{value:0},uTidal:{value:0},uDir:{value:new Ve(-1,.12)},uSpin:{value:-.065}},X=se(120,120,We,m,{order:22}),O=se(95,95,We,K,{order:22});X.position.set(-58,18,-135),O.position.set(58,30,-140),r.add(X),r.add(O),X.visible=O.visible=!1;const L={uTime:{value:0},uRing:{value:0}},R=se(420,420,Et,L,{order:23});R.position.set(0,24,-138),r.add(R),R.visible=!1;const ve={uTime:{value:0},uGrow:{value:0}},fe=se(7,7,Rt,ve,{order:26});fe.position.set(0,1.5,-9),r.add(fe);const me={uTime:{value:0},uRush:{value:0}},Z=new J(new Te(3.2,3.2,130,40,1,!0),new k({vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:Ot,uniforms:me,transparent:!0,depthWrite:!1,depthTest:!1,blending:z,side:de}));Z.rotation.x=Math.PI/2,Z.position.set(0,1.5,-20),Z.renderOrder=27,Z.frustumCulled=!1,r.add(Z);const ie={uBlack:{value:0},uWhite:{value:0}},ee=new J(new ke(.6,16,12),new k({vertexShader:`
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
      `,uniforms:ie,transparent:!0,depthWrite:!1,depthTest:!1,blending:Ue,side:de}));return ee.renderOrder=50,ee.frustumCulled=!1,r.add(ee),t.visible=!1,{group:t,eyeWorld:S,set collide(o){const W=o>.001&&o<1;X.visible=O.visible=W,m.uShow.value=K.uShow.value=Math.min(1,o*4),m.uTidal.value=K.uTidal.value=Math.pow(o,1.6);const $=58*(1-Math.pow(o,1.7)*.86);X.position.x=-$,O.position.x=$,O.position.y=30-Math.pow(o,1.7)*10},set flash(o){ie.uWhite.value=o},set ring(o){L.uRing.value=o,R.visible=o>.002&&o<.999},set flare(o){a.uFlare.value=o},set fireSurge(o){F.uForm.value=Math.min(1.6,F.uForm.value*(1+o))},set portal(o){ve.uGrow.value=o,fe.visible=o>.002},set rush(o){me.uRush.value=o,Z.visible=o>.002},set form(o){a.uForm.value=o,t.visible=o>.001||a.uSuck.value>.001,b.material.uniforms.uForm.value=Math.min(1,o*2.2),s.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.15)),T.material.uniforms.uForm.value=Math.min(1,Math.max(0,o*1.8-.25)),n.uForm.value=Math.min(1,o*2.6),F.uForm.value=Math.min(1,Math.max(0,o*2.2-.2)),D.uForm.value=Math.min(1,Math.max(0,o*2-.3))},set open(o){a.uOpen.value=o},set suck(o){a.uSuck.value=o;const W=1+o*o*7;t.scale.setScalar(W),t.position.copy(S).multiplyScalar(1-W)},set black(o){ie.uBlack.value=o},update(o,W,$){a.uTime.value=o,ve.uTime.value=o,me.uTime.value=o,m.uTime.value=o,K.uTime.value=o,L.uTime.value=o,D.uPixel.value=W,ee.visible!==ie.uBlack.value>.003&&(ee.visible=ie.uBlack.value>.003),$.getWorldPosition(ee.position),Z.position.x=ee.position.x,Z.position.y=ee.position.y}}}const Y={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,104],nebula:[90,112],drone:[68,88]},C=116,A={start:C,url:"assets/audio/journey_02.mp3",starsOut:[C+5,C+17],palette:[C+6,C+21],full:[C+6,C+23],curtains:[C+10,C+26],core:[C+18.5,C+24.5],field:[C+20,C+28],breathIn:[C+28.9,C+33.3],breathOut:[C+33.6,C+38.5],loopFrom:C+66,loopPeriod:11.5,loopAmp:.62},M=C+64,w={voiceUrl:"assets/audio/journey_03.mp3",voiceAt:M,collide:[M+.3,M+6.8],blast:M+6.85,throw:[M+7,M+11],world:[M+9.5,M+16],drumFrom:M+23.5,form:[M+32.2,M+47.5],flare:[M+48.4,M+51],open:[M+60.8,M+65.5],suck:[M+64.5,M+70.5],black:[M+69.5,M+71.5]},Gt="assets/audio/journey_01.mp3",we=4,It=[82.5,88.5],je=(r,t,a)=>r+(t-r)*a,u=(r,[t,a])=>Oe.clamp((r-t)/(a-t),0,1),v=r=>r*r*(3-2*r);function xe(r,t){const a=document.getElementById("status");a&&(a.textContent=r);const i=document.getElementById("substatus");i&&t!==void 0&&(i.textContent=t)}function qt(r,t){const a=r.createGain();a.gain.value=0,a.connect(t);const i=r.createBiquadFilter();i.type="lowpass",i.frequency.value=220,i.Q.value=.6,i.connect(a);for(const[c,x]of[[38,.55],[57,.28],[76.4,.18]]){const f=r.createOscillator();f.type="sine",f.frequency.value=c;const h=r.createGain();h.gain.value=x,f.connect(h).connect(i),f.start()}return{set level(c){a.gain.setTargetAtTime(c*.09,r.currentTime,.25)}}}async function Dt(){const r=document.getElementById("view"),t=new Xe({canvas:r,antialias:!0,alpha:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(2,window.devicePixelRatio)),t.setSize(window.innerWidth,window.innerHeight),t.setClearAlpha(0),t.xr.enabled=!0,t.xr.setReferenceSpaceType("local-floor"),t.outputColorSpace=Ze,t.toneMapping=et,t.toneMappingExposure=1.15;const a=new tt;a.background=null;const i=new at(70,window.innerWidth/window.innerHeight,.05,900);i.position.set(0,1.35,0);const c=new Re;c.add(i),a.add(c);const x=rt(a),f=lt(a),h=ze(f.group,{radius:460,scale:.85,gain:.7,order:3}),l=ze(f.group,{radius:300,scale:1.9,gain:1,order:4}),d=ut(f.group),p=vt(a),g=pt(a),S=Tt(a),b=Pt(a);window.addEventListener("resize",()=>{i.aspect=window.innerWidth/window.innerHeight,i.updateProjectionMatrix(),t.setSize(window.innerWidth,window.innerHeight)});const s=new Audio;s.src=Gt,s.preload="auto",s.crossOrigin="anonymous";let T=!1;s.addEventListener("canplaythrough",()=>{T=!0},{once:!0}),s.addEventListener("error",()=>{console.warn("[journey] segment-1 voice failed to load"),T=!0},{once:!0});let n=null,E=null,F=null,_=null,I=null;function q(){if(!n)try{n=new(window.AudioContext||window.webkitAudioContext);const e=n.createGain();e.gain.value=1,e.connect(n.destination);const y=n.createMediaElementSource(s);F=n.createGain(),F.gain.value=1,y.connect(F).connect(e),g.attachAnalyser(n,F),E=qt(n,e);const P=n.sampleRate*2,j=n.createBuffer(1,P,n.sampleRate),ce=j.getChannelData(0);for(let oe=0;oe<P;oe++)ce[oe]=Math.random()*2-1;const te=n.createBufferSource();te.buffer=j,te.loop=!0;const ae=n.createBiquadFilter();ae.type="bandpass",ae.frequency.value=320,ae.Q.value=.7,_=n.createGain(),_.gain.value=0,te.connect(ae).connect(_).connect(e),te.start(),I=oe=>{const re=n.currentTime;for(const[ne,ge,he]of[[0,58,.5],[.19,46,.34]]){const ue=n.createOscillator();ue.type="sine",ue.frequency.setValueAtTime(ge*1.6,re+ne),ue.frequency.exponentialRampToValueAtTime(ge,re+ne+.06);const pe=n.createGain();pe.gain.setValueAtTime(0,re+ne),pe.gain.linearRampToValueAtTime(he*oe*.4,re+ne+.012),pe.gain.exponentialRampToValueAtTime(1e-4,re+ne+.3),ue.connect(pe).connect(e),ue.start(re+ne),ue.stop(re+ne+.4)}}}catch(e){console.warn("[journey] web audio unavailable, voice only",e)}}let N=null,B=null,D=!1,V=null,m=null,K=!1;async function X(){try{const y=await(await fetch(A.url)).arrayBuffer();n&&(N=await n.decodeAudioData(y))}catch(e){console.warn("[journey] segment-2 voice failed to load",e)}try{const y=await(await fetch(w.voiceUrl)).arrayBuffer();n&&(V=await n.decodeAudioData(y))}catch(e){console.warn("[journey] segment-3 voice failed to load",e)}}let O=!1,L=0;s.addEventListener("loadedmetadata",()=>{isFinite(s.duration)&&s.duration});let R=null;function ve(){if(R!==null)return R;if(!O)return-we;if(m!==null&&!K&&n){const e=w.voiceAt+(n.currentTime-m);return L=performance.now()/1e3-e,e}if(B!==null&&!D&&n){const e=A.start+(n.currentTime-B);return L=performance.now()/1e3-e,e}return!s.ended&&s.currentTime>.01?(L=performance.now()/1e3-s.currentTime,s.currentTime):performance.now()/1e3-L}let fe="flat";async function me(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function Z(){q(),n&&n.state==="suspended"&&await n.resume(),X();const e=await me();if(e){const y={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const P=await navigator.xr.requestSession(e,y);await t.xr.setSession(P),fe=e,P.addEventListener("end",()=>{fe="flat"})}catch(P){console.warn("[journey] could not start",e,P)}}document.body.classList.add("started"),O=!0,L=performance.now()/1e3+we,setTimeout(()=>{s.play().catch(y=>console.warn("[journey] autoplay blocked",y))},we*1e3)}let ie=null;function ee(e){if(ie)return ie;let y=v(u(e,[A.breathIn[0],A.breathIn[0]+1.6]))*(1-v(u(e,[A.breathIn[1],A.breathIn[1]+1]))),P=v(u(e,[A.breathOut[0],A.breathOut[0]+.25]))*(1-v(u(e,[A.breathOut[0]+.55,A.breathOut[0]+1.2])));if(e>A.loopFrom&&e<w.collide[0]){const j=(e-A.loopFrom)%A.loopPeriod,ce=A.loopAmp,te=ce*v(u(j,[0,1.8]))*(1-v(u(j,[4.4,5.6]))),ae=ce*v(u(j,[6,6.3]))*(1-v(u(j,[6.7,7.4])));y=Math.max(y,te),P=Math.max(P,ae)}return[y,P]}const o=new H;let W=-we,$=0,Ae=0,Pe=-1;t.setAnimationLoop(()=>{const e=ve(),y=Oe.clamp(e-W,.001,.1);W=e;const P=t.getContext(),j=Math.max(.5,P.drawingBufferHeight/900),ce=t.xr.isPresenting?t.xr.getCamera():i;if(O&&B===null&&N&&n&&e>=A.start&&R===null){const G=n.createBufferSource();G.buffer=N,G.connect(F),G.onended=()=>{D=!0},G.start(),B=n.currentTime}if(O&&m===null&&V&&n&&e>=w.voiceAt&&R===null){const G=n.createBufferSource();G.buffer=V,G.connect(F),G.onended=()=>{K=!0},G.start(),m=n.currentTime}const[te,ae]=ee(e),oe=v(u(e,w.collide)),re=v(u(e,[w.blast,w.blast+.22]))*(1-v(u(e,[w.blast+.55,w.blast+1.8]))),ne=u(e,[w.blast,w.blast+3.2]),ge=v(u(e,[w.throw[0],w.throw[0]+.6]))*(1-v(u(e,[w.throw[1]-1.2,w.throw[1]]))),he=v(u(e,w.form)),ue=v(u(e,w.world)),pe=v(u(e,[w.flare[0],w.flare[0]+.7]))*(1-v(u(e,[w.flare[1]-.6,w.flare[1]+1.2]))),Me=v(u(e,w.open)),le=v(u(e,w.suck)),Ce=v(u(e,w.black)),Q=v(u(e,[w.blast,w.blast+1.3])),He=v(u(e,[w.throw[1]-.5,w.throw[1]+3.5]));b.collide=oe,b.flash=re,b.ring=ne,b.rush=ge,b.form=Math.max(ue*.34,he),b.flare=pe,b.open=Me,b.suck=le,b.black=Ce,b.update(e,j,ce);const $e=je(0,.55,v(u(e,Y.motesIn)))+je(0,.45,v(u(e,Y.motesFull)));p.fade=$e*(1-v(u(e,[Y.dim[0],Y.dim[0]+9]))),p.update(e,j),x.opacity=Math.pow(u(e,Y.dim),1.6),f.emerge=u(e,Y.stars),f.global=1-v(u(e,A.starsOut))+He*(1-le)*.85,f.update(e,j);const Ie=v(u(e,A.palette)),qe=v(u(e,A.full)),Ee=(1-.45*S.breathing)*(1-Q)*(1-oe*.8);l.emerge=v(u(e,Y.nebula))*(Ee+Q*.3*(1-le)),l.palette=Ie*(1-Q*.85),l.full=qe*(1-Q*.6),l.update(e),h.emerge=v(u(e,Y.nebula))*(.9*Ee+Q*.45*(1-le)),h.palette=Ie*(1-Q*.85),h.full=qe*(1-Q*.6),h.update(e*.55),d.emerge=v(u(e,A.curtains))*Ee,d.update(e);const Qe=.05+te*.85-ae*1;Ae+=(Qe-Ae)*(1-Math.exp(-y*2.2)),$+=Ae*y,l.radial=$,h.radial=$*.35,S.core=v(u(e,A.core))*(1-Q),S.field=v(u(e,A.field))*(1-Q),S.gateIn=te*(1-Q),S.gateOut=ae*(1-Q),S.update(e,y,ce,j);const De=v(u(e,[Y.dim[0]+8,Y.dim[1]+8]))*(1-le);if(o.set(Math.sin(e*.031)*.55,Math.sin(e*.019+1.7)*.42,Math.cos(e*.024)*.55).multiplyScalar(De),c.position.copy(o),c.rotation.z=Math.sin(e*.013)*.03*De,g.fade=v(u(e,[-we+.8,-.2]))*(1-v(u(e,It))),g.update(e,y,ce),E)if(e<A.start-4){const G=v(u(e,Y.drone)),Se=1-.45*v(u(e,[90,118]));E.level=G*Se}else e<w.collide[0]?E.level=.1+.1*te-.04*ae:E.level=.1+oe*.16+he*.12+le*.4-Ce*.34;if(_&&n&&R===null){const G=oe*.18+re*1+ge*.55+le*.85;_.gain.setTargetAtTime(G*.16,n.currentTime,.12)}if(I&&R===null&&e>w.drumFrom&&Ce<.85){const G=1.45-he*.35-Me*.25-le*.25,Se=Math.floor(e/G);Se!==Pe&&(Pe=Se,I(.55+he*.3+Me*.45+le*.6))}t.render(a,i)});const Ge=await me();Ge==="immersive-ar"?xe("Put your headset on and begin.","You will start in your own room."):Ge==="immersive-vr"?xe("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):xe("Preview in browser","Open this page in the Quest browser for the full experience.");const _e=document.getElementById("begin");_e.disabled=!1,_e.addEventListener("click",async()=>{_e.disabled=!0,T||(xe("Loading the voice…"),await new Promise(e=>{if(T)return e();const y=setInterval(()=>{T&&(clearInterval(y),e())},100);setTimeout(()=>{clearInterval(y),e()},6e3)})),await Z()}),window.JOURNEY={THREE:ot,scene:a,camera:i,renderer:t,stars:f,nebula:l,voidShell:x,motes:p,narrator:g,prana:S,sec3:b,T:Y,SEG2:A,SEG3:w,seek:e=>{R=e},resume:()=>{R=null},look:(e,y=0)=>{i.rotation.set(y,e,0,"YXZ")},moveTo:(e,y,P)=>{c.position.set(0,0,0),i.position.set(e,y,P)},forceBreath:(e,y)=>{ie=e===null?null:[e,y]},fakeLevel:e=>{g.uniforms.uLevel.value=e},dryStart:()=>{O=!0,L=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:ve(),xrMode:fe,voidOpacity:x.opacity,starEmerge:f.emerge,nebulaEmerge:l.emerge,orbFade:g.fade})},window.__JOURNEY_READY=!0}Dt().catch(r=>{console.error(r),window.__JOURNEY_ERROR=String(r&&r.stack||r),xe("Something went wrong.",String(r))});
