import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as I,ae as z,an as j,M as D,C as re,Y as B,E as H,a as M,ak as O,W as Y,G as N,ah as ie,V as R,aC as se,S as le,aD as ce,aE as de,X as ue,aG as ve}from"./three-B0MzMegT.js";function J(n){let e=n>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function me(n){const e=new I(500,24,16),t=new z({side:j,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),a=new D(e,t);return a.frustumCulled=!1,a.renderOrder=-10,n.add(a),{mesh:a,set opacity(r){t.uniforms.uOpacity.value=r},get opacity(){return t.uniforms.uOpacity.value}}}const fe=`
  attribute float aDelay;
  attribute float aSize;
  attribute float aSeed;
  attribute vec3  aTint;

  uniform float uEmerge;   // 0..1 across the whole emergence window
  uniform float uTime;
  uniform float uPixel;

  varying float vBright;
  varying vec3  vTint;

  void main() {
    // Each star waits for its own moment. Spread over the full window they
    // appear one at a time, the way real stars do as the eye dark-adapts.
    float p = smoothstep(aDelay, aDelay + 0.12, uEmerge);

    // no scintillation — steady light, nothing pulling at the eye
    vBright = p;
    vTint = aTint;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (340.0 / max(-mv.z, 1.0)) * (0.55 + 0.45 * p);
  }
`,pe=`
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
`;function he(n,{count:e=5200}={}){const t=J(20260805),a=new Float32Array(e*3),r=new Float32Array(e),m=new Float32Array(e),d=new Float32Array(e),u=new Float32Array(e*3),p=new re;for(let c=0;c<e;c++){let g=t()*2-1;const y=t()*Math.PI*2;t()<.42&&(g*=.3);const x=Math.sqrt(Math.max(0,1-g*g)),E=90+t()*320;a[c*3]=Math.cos(y)*x*E,a[c*3+1]=g*E,a[c*3+2]=Math.sin(y)*x*E;const F=Math.pow(t(),2.4);m[c]=.85+F*4.2,r[c]=B.clamp(.86-F*.9+(t()-.5)*.22,0,.9),d[c]=t()*100;const P=t();P>.86?p.setHSL(.07+t()*.04,.55,.72):P>.66?p.setHSL(.12+t()*.03,.22,.85):p.setHSL(.58+t()*.06,.28+t()*.3,.88),u[c*3]=p.r,u[c*3+1]=p.g,u[c*3+2]=p.b}const v=new H;v.setAttribute("position",new M(a,3)),v.setAttribute("aDelay",new M(r,1)),v.setAttribute("aSize",new M(m,1)),v.setAttribute("aSeed",new M(d,1)),v.setAttribute("aTint",new M(u,3));const o={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1}},l=new z({vertexShader:fe,fragmentShader:pe,uniforms:o,transparent:!0,depthWrite:!1,depthTest:!1,blending:O}),f=new Y(v,l);f.frustumCulled=!1,f.renderOrder=5;const w=new N;return w.add(f),n.add(w),{group:w,uniforms:o,set emerge(c){o.uEmerge.value=c},get emerge(){return o.uEmerge.value},update(c,g){o.uTime.value=c,o.uPixel.value=g,w.rotation.y=c*.0042,w.rotation.x=Math.sin(c*.017)*.014}}}const ge=`
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
`,we=`
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
`;function ye(n,{count:e=260,radius:t=3}={}){const a=J(77003),r=new Float32Array(e*3),m=new Float32Array(e),d=new Float32Array(e);for(let l=0;l<e;l++)r[l*3]=(a()-.5)*t*2.2,r[l*3+1]=.25+a()*2.3,r[l*3+2]=(a()-.5)*t*2.2,m[l]=a(),d[l]=.5+a()*1.4;const u=new H;u.setAttribute("position",new M(r,3)),u.setAttribute("aSeed",new M(m,1)),u.setAttribute("aSize",new M(d,1));const p={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},v=new z({vertexShader:ge,fragmentShader:we,uniforms:p,transparent:!0,depthWrite:!1,blending:O}),o=new Y(u,v);return o.frustumCulled=!1,o.renderOrder=3,n.add(o),{points:o,set fade(l){p.uFade.value=l},get fade(){return p.uFade.value},update(l,f){p.uTime.value=l,p.uPixel.value=f}}}const xe=`
  precision highp float;

  uniform float uTime;
  uniform float uEmerge;

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

    // concentrated in the same band the stars favour, torn by the warp
    float band = exp(-pow(d.y * 1.55 + (warp.x - 0.5) * 1.35, 2.0));
    float body = smoothstep(0.34, 0.80, n) * band;

    // a second, thinner veil everywhere so the black is never truly empty
    float veil = smoothstep(0.48, 0.92, fbm(d * 3.4 + warp * 1.4)) * 0.55;

    // deep-space palette: indigo body, teal where it thins, a rare warm core
    vec3 indigo = vec3(0.13, 0.17, 0.42);
    vec3 teal   = vec3(0.09, 0.30, 0.34);
    vec3 rose   = vec3(0.38, 0.15, 0.30);
    vec3 col = mix(teal, indigo, smoothstep(0.2, 0.8, n));
    col = mix(col, rose, smoothstep(0.75, 0.97, n * band) * 0.7);

    float a = (body * 0.85 + veil * 0.26) * uEmerge;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col * a * 3.4, a);
  }
`;function be(n){const e=new I(430,48,32),t={uTime:{value:0},uEmerge:{value:0}},a=new z({side:j,transparent:!0,depthWrite:!1,depthTest:!1,blending:O,uniforms:t,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:xe}),r=new D(e,a);return r.frustumCulled=!1,r.renderOrder=4,n.add(r),{mesh:r,set emerge(m){t.uEmerge.value=m},get emerge(){return t.uEmerge.value},update(m){t.uTime.value=m}}}const Se=`
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    // billboard: strip the rotation out of the modelView basis
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
    gl_Position = projectionMatrix * mv;
  }
`,Te=`
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
`;function Me(n){const e={uTime:{value:0},uLevel:{value:0},uFade:{value:0}},t=new z({vertexShader:Se,fragmentShader:Te,uniforms:e,transparent:!0,depthWrite:!1,depthTest:!1,blending:O}),a=new D(new ie(.44,.44),t);a.frustumCulled=!1,a.renderOrder=30,n.add(a);let r=null,m=null,d=0;const u=new R(0,1.35,-1.7),p=new R,v=new R(0,1.35,-1.7);return a.position.copy(v),{mesh:a,uniforms:e,attachAnalyser(o,l){r=o.createAnalyser(),r.fftSize=512,r.smoothingTimeConstant=.55,m=new Uint8Array(r.frequencyBinCount),l.connect(r)},set fade(o){e.uFade.value=o},get fade(){return e.uFade.value},update(o,l,f){e.uTime.value=o,f.getWorldDirection(p),f.getWorldPosition(u),u.addScaledVector(p,1.7);const w=1-Math.exp(-l*5.5);v.lerp(u,w),a.position.set(v.x,v.y+Math.sin(o*.9)*.008,v.z);let c=0;if(r){r.getByteFrequencyData(m);const y=Math.max(8,m.length*.45|0);let A=0;for(let x=2;x<y;x++)A+=m[x];c=Math.min(1,A/(y-2)/132)}const g=c>d?1-Math.exp(-l*22):1-Math.exp(-l*3.2);d+=(c-d)*g,e.uLevel.value=d}}}const b={motesIn:[34,64],motesFull:[64,78],dim:[70,84.5],stars:[85.5,122],nebula:[94,148],drone:[68,88]},Ae="assets/audio/journey_01.mp3",_=4,Ee=[82.5,88.5],W=(n,e,t)=>n+(e-n)*t,S=(n,[e,t])=>B.clamp((n-e)/(t-e),0,1),T=n=>n*n*(3-2*n);function C(n,e){const t=document.getElementById("status");t&&(t.textContent=n);const a=document.getElementById("substatus");a&&e!==void 0&&(a.textContent=e)}function Fe(n,e){const t=n.createGain();t.gain.value=0,t.connect(e);const a=n.createBiquadFilter();a.type="lowpass",a.frequency.value=220,a.Q.value=.6,a.connect(t);for(const[r,m]of[[38,.55],[57,.28],[76.4,.18]]){const d=n.createOscillator();d.type="sine",d.frequency.value=r;const u=n.createGain();u.gain.value=m,d.connect(u).connect(a),d.start()}return{set level(r){t.gain.setTargetAtTime(r*.09,n.currentTime,.25)}}}async function Pe(){const n=document.getElementById("view"),e=new se({canvas:n,antialias:!0,alpha:!0,powerPreference:"high-performance"});e.setPixelRatio(Math.min(2,window.devicePixelRatio)),e.setSize(window.innerWidth,window.innerHeight),e.setClearAlpha(0),e.xr.enabled=!0,e.xr.setReferenceSpaceType("local-floor"),e.outputColorSpace=le,e.toneMapping=ce,e.toneMappingExposure=1.15;const t=new de;t.background=null;const a=new ue(70,window.innerWidth/window.innerHeight,.05,900);a.position.set(0,1.35,0);const r=new N;r.add(a),t.add(r);const m=me(t),d=he(t),u=be(d.group),p=ye(t),v=Me(t);window.addEventListener("resize",()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)});const o=new Audio;o.src=Ae,o.preload="auto",o.crossOrigin="anonymous";let l=!1;o.addEventListener("canplaythrough",()=>{l=!0},{once:!0}),o.addEventListener("error",()=>{console.warn("[journey] voiceover failed to load"),l=!0},{once:!0});let f=null,w=null;function c(){if(!f)try{f=new(window.AudioContext||window.webkitAudioContext);const s=f.createGain();s.gain.value=1,s.connect(f.destination);const h=f.createMediaElementSource(o),i=f.createGain();i.gain.value=1,h.connect(i).connect(s),v.attachAnalyser(f,i),w=Fe(f,s)}catch(s){console.warn("[journey] web audio unavailable, voice only",s)}}let g=!1,y=0,A=84.4;o.addEventListener("loadedmetadata",()=>{isFinite(o.duration)&&(A=o.duration)});let x=null;function E(){return x!==null?x:g?!o.ended&&o.currentTime>.01?(y=performance.now()/1e3-o.currentTime,o.currentTime):(o.ended||o.currentTime>=A-.05,performance.now()/1e3-y):-_}let F="flat";async function P(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function Q(){c(),f&&f.state==="suspended"&&await f.resume();const s=await P();if(s){const h={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const i=await navigator.xr.requestSession(s,h);await e.xr.setSession(i),F=s,i.addEventListener("end",()=>{F="flat"})}catch(i){console.warn("[journey] could not start",s,i)}}document.body.classList.add("started"),g=!0,y=performance.now()/1e3+_,setTimeout(()=>{o.play().catch(h=>console.warn("[journey] autoplay blocked",h))},_*1e3)}const k=new R;let G=-_;e.setAnimationLoop((s,h)=>{const i=E(),X=B.clamp(i-G,.001,.1);G=i;const Z=e.getContext(),q=Math.max(.5,Z.drawingBufferHeight/900),K=W(0,.55,T(S(i,b.motesIn)))+W(0,.45,T(S(i,b.motesFull)));p.fade=K*(1-T(S(i,[b.dim[0],b.dim[0]+9]))),p.update(i,q);const $=S(i,b.dim);m.opacity=Math.pow($,1.6),d.emerge=S(i,b.stars),d.update(i,q),u.emerge=T(S(i,b.nebula)),u.update(i);const V=T(S(i,[b.dim[0]+8,b.dim[1]+8]));k.set(Math.sin(i*.031)*.55,Math.sin(i*.019+1.7)*.42,Math.cos(i*.024)*.55).multiplyScalar(V),r.position.copy(k),r.rotation.z=Math.sin(i*.013)*.03*V;const ee=e.xr.isPresenting?e.xr.getCamera():a,te=T(S(i,[-_+.8,-.2])),ae=1-T(S(i,Ee));if(v.fade=te*ae,v.update(i,X,ee),w){const ne=T(S(i,b.drone)),oe=1-.45*T(S(i,[90,118]));w.level=ne*oe}e.render(t,a)});const U=await P();U==="immersive-ar"?C("Put your headset on and begin.","You will start in your own room."):U==="immersive-vr"?C("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):C("Preview in browser","Open this page in the Quest browser for the full experience.");const L=document.getElementById("begin");L.disabled=!1,L.addEventListener("click",async()=>{L.disabled=!0,l||(C("Loading the voice…"),await new Promise(s=>{if(l)return s();const h=setInterval(()=>{l&&(clearInterval(h),s())},100);setTimeout(()=>{clearInterval(h),s()},6e3)})),await Q()}),window.JOURNEY={THREE:ve,scene:t,camera:a,renderer:e,stars:d,nebula:u,voidShell:m,motes:p,narrator:v,T:b,seek:s=>{x=s},resume:()=>{x=null},look:(s,h=0)=>{a.rotation.set(h,s,0,"YXZ")},moveTo:(s,h,i)=>{r.position.set(0,0,0),a.position.set(s,h,i)},dryStart:()=>{g=!0,y=performance.now()/1e3,document.body.classList.add("started")},fakeLevel:s=>{v.uniforms.uLevel.value=s},state:()=>({t:E(),xrMode:F,voidOpacity:m.opacity,starEmerge:d.emerge,nebulaEmerge:u.emerge,orbFade:v.fade})},window.__JOURNEY_READY=!0}Pe().catch(n=>{console.error(n),window.__JOURNEY_ERROR=String(n&&n.stack||n),C("Something went wrong.",String(n))});
