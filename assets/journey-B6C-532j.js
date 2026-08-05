import"./modulepreload-polyfill-B5Qt9EMX.js";import{aF as G,ae as C,an as q,M as I,C as Z,Y as j,E as W,a as b,ak as R,W as H,G as V,aC as K,S as $,aD as ee,aE as te,X as ae,V as ne,aG as re}from"./three-B0MzMegT.js";function Y(n){let e=n>>>0;return()=>(e=e*1664525+1013904223>>>0,e/4294967296)}function ie(n){const e=new G(500,24,16),t=new C({side:q,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),a=new I(e,t);return a.frustumCulled=!1,a.renderOrder=-10,n.add(a),{mesh:a,set opacity(o){t.uniforms.uOpacity.value=o},get opacity(){return t.uniforms.uOpacity.value}}}const oe=`
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
    float p = smoothstep(aDelay, aDelay + 0.22, uEmerge);

    // slow, uneven scintillation — never a uniform blink
    float tw = 0.82 + 0.18 * sin(uTime * (0.35 + aSeed * 0.7) + aSeed * 62.8);

    vBright = p * tw;
    vTint = aTint;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixel * (340.0 / max(-mv.z, 1.0)) * (0.55 + 0.45 * p);
  }
`,se=`
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
`;function le(n,{count:e=5200}={}){const t=Y(20260805),a=new Float32Array(e*3),o=new Float32Array(e),v=new Float32Array(e),m=new Float32Array(e),d=new Float32Array(e*3),f=new Z;for(let c=0;c<e;c++){let h=t()*2-1;const E=t()*Math.PI*2;t()<.42&&(h*=.3);const M=Math.sqrt(Math.max(0,1-h*h)),S=90+t()*320;a[c*3]=Math.cos(E)*M*S,a[c*3+1]=h*S,a[c*3+2]=Math.sin(E)*M*S;const F=Math.pow(t(),2.4);v[c]=.85+F*4.2,o[c]=j.clamp(.86-F*.9+(t()-.5)*.22,0,.9),m[c]=t()*100;const _=t();_>.86?f.setHSL(.07+t()*.04,.55,.72):_>.66?f.setHSL(.12+t()*.03,.22,.85):f.setHSL(.58+t()*.06,.28+t()*.3,.88),d[c*3]=f.r,d[c*3+1]=f.g,d[c*3+2]=f.b}const i=new W;i.setAttribute("position",new b(a,3)),i.setAttribute("aDelay",new b(o,1)),i.setAttribute("aSize",new b(v,1)),i.setAttribute("aSeed",new b(m,1)),i.setAttribute("aTint",new b(d,3));const u={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1}},s=new C({vertexShader:oe,fragmentShader:se,uniforms:u,transparent:!0,depthWrite:!1,depthTest:!1,blending:R}),g=new H(i,s);g.frustumCulled=!1,g.renderOrder=5;const x=new V;return x.add(g),n.add(x),{group:x,uniforms:u,set emerge(c){u.uEmerge.value=c},get emerge(){return u.uEmerge.value},update(c,h){u.uTime.value=c,u.uPixel.value=h,x.rotation.y=c*.0042,x.rotation.x=Math.sin(c*.017)*.014}}}const ce=`
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
`,de=`
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
`;function ue(n,{count:e=260,radius:t=3}={}){const a=Y(77003),o=new Float32Array(e*3),v=new Float32Array(e),m=new Float32Array(e);for(let s=0;s<e;s++)o[s*3]=(a()-.5)*t*2.2,o[s*3+1]=.25+a()*2.3,o[s*3+2]=(a()-.5)*t*2.2,v[s]=a(),m[s]=.5+a()*1.4;const d=new W;d.setAttribute("position",new b(o,3)),d.setAttribute("aSeed",new b(v,1)),d.setAttribute("aSize",new b(m,1));const f={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},i=new C({vertexShader:ce,fragmentShader:de,uniforms:f,transparent:!0,depthWrite:!1,blending:R}),u=new H(d,i);return u.frustumCulled=!1,u.renderOrder=3,n.add(u),{points:u,set fade(s){f.uFade.value=s},get fade(){return f.uFade.value},update(s,g){f.uTime.value=s,f.uPixel.value=g}}}const me=`
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
`;function fe(n){const e=new G(430,48,32),t={uTime:{value:0},uEmerge:{value:0}},a=new C({side:q,transparent:!0,depthWrite:!1,depthTest:!1,blending:R,uniforms:t,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:me}),o=new I(e,a);return o.frustumCulled=!1,o.renderOrder=4,n.add(o),{mesh:o,set emerge(v){t.uEmerge.value=v},get emerge(){return t.uEmerge.value},update(v){t.uTime.value=v}}}const w={motesIn:[34,64],motesFull:[64,78],dim:[78,94],stars:[101,152],nebula:[116,176],drone:[76,96]},ve="assets/audio/journey_01.mp3",L=(n,e,t)=>n+(e-n)*t,y=(n,[e,t])=>j.clamp((n-e)/(t-e),0,1),T=n=>n*n*(3-2*n);function P(n,e){const t=document.getElementById("status");t&&(t.textContent=n);const a=document.getElementById("substatus");a&&e!==void 0&&(a.textContent=e)}function pe(n,e){const t=n.createGain();t.gain.value=0,t.connect(e);const a=n.createBiquadFilter();a.type="lowpass",a.frequency.value=220,a.Q.value=.6,a.connect(t);for(const[o,v]of[[38,.55],[57,.28],[76.4,.18]]){const m=n.createOscillator();m.type="sine",m.frequency.value=o;const d=n.createGain();d.gain.value=v,m.connect(d).connect(a),m.start()}return{set level(o){t.gain.setTargetAtTime(o*.09,n.currentTime,.25)}}}async function he(){const n=document.getElementById("view"),e=new K({canvas:n,antialias:!0,alpha:!0,powerPreference:"high-performance"});e.setPixelRatio(Math.min(2,window.devicePixelRatio)),e.setSize(window.innerWidth,window.innerHeight),e.setClearAlpha(0),e.xr.enabled=!0,e.xr.setReferenceSpaceType("local-floor"),e.outputColorSpace=$,e.toneMapping=ee,e.toneMappingExposure=1.15;const t=new te;t.background=null;const a=new ae(70,window.innerWidth/window.innerHeight,.05,900);a.position.set(0,1.35,0);const o=new V;o.add(a),t.add(o);const v=ie(t),m=le(t),d=fe(m.group),f=ue(t);window.addEventListener("resize",()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight)});const i=new Audio;i.src=ve,i.preload="auto",i.crossOrigin="anonymous";let u=!1;i.addEventListener("canplaythrough",()=>{u=!0},{once:!0}),i.addEventListener("error",()=>{console.warn("[journey] voiceover failed to load"),u=!0},{once:!0});let s=null,g=null;function x(){if(!s)try{s=new(window.AudioContext||window.webkitAudioContext);const l=s.createGain();l.gain.value=1,l.connect(s.destination);const p=s.createMediaElementSource(i),r=s.createGain();r.gain.value=1,p.connect(r).connect(l),g=pe(s,l)}catch(l){console.warn("[journey] web audio unavailable, voice only",l)}}let c=!1,h=0,E=84.4;i.addEventListener("loadedmetadata",()=>{isFinite(i.duration)&&(E=i.duration)});let A=null;function M(){return A!==null?A:c?!i.ended&&i.currentTime>.01?(h=performance.now()/1e3-i.currentTime,i.currentTime):(i.ended||i.currentTime>=E-.05,performance.now()/1e3-h):0}let S="flat";async function F(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function _(){x(),s&&s.state==="suspended"&&await s.resume();const l=await F();if(l){const p={requiredFeatures:["local-floor"],optionalFeatures:["hand-tracking"]};try{const r=await navigator.xr.requestSession(l,p);await e.xr.setSession(r),S=l,r.addEventListener("end",()=>{S="flat"})}catch(r){console.warn("[journey] could not start",l,r)}}document.body.classList.add("started"),c=!0,h=performance.now()/1e3,i.play().catch(p=>console.warn("[journey] autoplay blocked",p))}const O=new ne;e.setAnimationLoop((l,p)=>{const r=M(),U=e.getContext(),k=Math.max(.5,U.drawingBufferHeight/900),N=L(0,.55,T(y(r,w.motesIn)))+L(0,.45,T(y(r,w.motesFull)));f.fade=N*(1-T(y(r,[w.dim[0],w.dim[0]+9]))),f.update(r,k);const J=y(r,w.dim);v.opacity=Math.pow(J,1.6),m.emerge=y(r,w.stars),m.update(r,k),d.emerge=T(y(r,w.nebula)),d.update(r);const B=T(y(r,[w.dim[0]+8,w.dim[1]+8]));if(O.set(Math.sin(r*.031)*.55,Math.sin(r*.019+1.7)*.42,Math.cos(r*.024)*.55).multiplyScalar(B),o.position.copy(O),o.rotation.z=Math.sin(r*.013)*.03*B,g){const Q=T(y(r,w.drone)),X=1-.45*T(y(r,[98,126]));g.level=Q*X}e.render(t,a)});const D=await F();D==="immersive-ar"?P("Put your headset on and begin.","You will start in your own room."):D==="immersive-vr"?P("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):P("Preview in browser","Open this page in the Quest browser for the full experience.");const z=document.getElementById("begin");z.disabled=!1,z.addEventListener("click",async()=>{z.disabled=!0,u||(P("Loading the voice…"),await new Promise(l=>{if(u)return l();const p=setInterval(()=>{u&&(clearInterval(p),l())},100);setTimeout(()=>{clearInterval(p),l()},6e3)})),await _()}),window.JOURNEY={THREE:re,scene:t,camera:a,renderer:e,stars:m,nebula:d,voidShell:v,motes:f,T:w,seek:l=>{A=l},resume:()=>{A=null},look:(l,p=0)=>{a.rotation.set(p,l,0,"YXZ")},moveTo:(l,p,r)=>{o.position.set(0,0,0),a.position.set(l,p,r)},dryStart:()=>{c=!0,h=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:M(),xrMode:S,voidOpacity:v.opacity,starEmerge:m.emerge,nebulaEmerge:d.emerge})},window.__JOURNEY_READY=!0}he().catch(n=>{console.error(n),window.__JOURNEY_ERROR=String(n&&n.stack||n),P("Something went wrong.",String(n))});
