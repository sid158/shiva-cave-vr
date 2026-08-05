import"./modulepreload-polyfill-B5Qt9EMX.js";import{C as K,V as H,ae as V,am as oe,y as re,ab as ie,M as Q,B as se,E as q,a as A,j as X,Y as j,aF as le,an as ce,ak as Z,W as ee,G as te,aC as ue,S as de,aD as fe,aE as me,X as ve,aG as pe}from"./three-B0MzMegT.js";const L={w:4.2,h:2.7,d:3.9,floor:0};function he(r,o){const t=r.detectedMeshes;if(!t||t.size===0)return null;const a=[];for(const d of t){const u=r.getPose(d.meshSpace,o);if(!u)continue;const i=new q;i.setAttribute("position",new A(new Float32Array(d.vertices),3)),i.setIndex(new A(new Uint32Array(d.indices),1)),i.applyMatrix4(new X().fromArray(u.transform.matrix)),a.push(i.toNonIndexed()),i.dispose()}return a.length?ae(a):null}function ge(r,o){const t=r.detectedPlanes;if(!t||t.size===0)return null;const a=[];for(const d of t){const u=r.getPose(d.planeSpace,o);if(!u||!d.polygon||d.polygon.length<3)continue;const i=d.polygon,l=[];for(let s=1;s<i.length-1;s++)for(const m of[i[0],i[s],i[s+1]])l.push(m.x,m.y,m.z);const c=new q;c.setAttribute("position",new A(new Float32Array(l),3)),ye(c,.45),c.applyMatrix4(new X().fromArray(u.transform.matrix)),a.push(c)}return a.length?ae(a):null}function we(){const r=new se(L.w,L.h,L.d,9,6,8);return r.translate(0,L.floor+L.h/2,0),r.toNonIndexed()}function ye(r,o){let t=r.getAttribute("position").array;for(let a=0;a<5;a++){const d=[];let u=!1;for(let i=0;i<t.length;i+=9){const l=[t[i],t[i+1],t[i+2]],c=[t[i+3],t[i+4],t[i+5]],s=[t[i+6],t[i+7],t[i+8]],m=[$(l,c),$(c,s),$(s,l)],v=Math.max(m[0],m[1],m[2]);if(v<=o){d.push(...l,...c,...s);continue}u=!0;let g,y,f;m[0]===v?(g=l,y=c,f=s):m[1]===v?(g=c,y=s,f=l):(g=s,y=l,f=c);const b=[(g[0]+y[0])/2,(g[1]+y[1])/2,(g[2]+y[2])/2];d.push(...g,...b,...f,...b,...y,...f)}if(t=new Float32Array(d),!u)break}return r.setAttribute("position",new A(t,3)),r}const $=(r,o)=>Math.hypot(r[0]-o[0],r[1]-o[1],r[2]-o[2]);function ae(r){let o=0;for(const u of r)o+=u.getAttribute("position").count;const t=new Float32Array(o*3);let a=0;for(const u of r)t.set(u.getAttribute("position").array,a),a+=u.getAttribute("position").count*3,u.dispose();const d=new q;return d.setAttribute("position",new A(t,3)),d}function be(r,o){const t=r.getAttribute("position").array,a=t.length/9;let d=1337;const u=()=>(d=d*1664525+1013904223>>>0,d/4294967296),i=new Float32Array(a*3);let l=.001;for(let e=0;e<a;e++){const n=e*9,w=(t[n]+t[n+3]+t[n+6])/3,k=(t[n+1]+t[n+4]+t[n+7])/3,C=(t[n+2]+t[n+5]+t[n+8])/3;i[e*3]=w,i[e*3+1]=k,i[e*3+2]=C,l=Math.max(l,Math.hypot(w-o.x,C-o.z))}const c=Math.max(24,Math.min(240,Math.round(a/7))),s=new Float32Array(c),m=new Float32Array(c),v=new Float32Array(c);for(let e=0;e<c;e++){const n=Math.min(a-1,Math.floor(u()*a));s[e]=i[n*3],m[e]=i[n*3+1],v[e]=i[n*3+2]}const g=new Int32Array(a);for(let e=0;e<a;e++){const n=i[e*3],w=i[e*3+1],k=i[e*3+2];let C=0,z=1/0;for(let h=0;h<c;h++){const x=n-s[h],Y=(w-m[h])*1.55,U=k-v[h],J=x*x+Y*Y+U*U;J<z&&(z=J,C=h)}g[e]=C}const y=new Float32Array(c),f=new Float32Array(c*3);for(let e=0;e<a;e++){const n=g[e];f[n*3]+=i[e*3],f[n*3+1]+=i[e*3+1],f[n*3+2]+=i[e*3+2],y[n]++}const b=new Float32Array(c),R=new Float32Array(c);for(let e=0;e<c;e++){const n=Math.max(1,y[e]);f[e*3]/=n,f[e*3+1]/=n,f[e*3+2]/=n;const w=u();b[e]=w;const k=j.clamp((f[e*3+1]-o.y+1.6)/3.4,0,1),C=j.clamp(Math.hypot(f[e*3]-o.x,f[e*3+2]-o.z)/l,0,1);R[e]=j.clamp(.4*k+.3*(1-C)+.22*w,0,.84)}const O=e=>`${Math.round(t[e]*2048)},${Math.round(t[e+1]*2048)},${Math.round(t[e+2]*2048)}`,E=new Array(a*3),M=new Map;for(let e=0;e<a*3;e++){const n=O(e*3);let w=M.get(n);w===void 0&&(w=M.size,M.set(n,w)),E[e]=w}const F=new Map,B=(e,n)=>e<n?`${e}_${n}`:`${n}_${e}`;for(let e=0;e<a;e++){const n=E[e*3],w=E[e*3+1],k=E[e*3+2];for(const[C,z]of[[w,k],[k,n],[n,w]]){const h=B(C,z),x=F.get(h);x===void 0?F.set(h,g[e]):x!==g[e]&&F.set(h,-1)}}const D=new Float32Array(a*9),I=new Float32Array(a*3),G=new Float32Array(a*3),_=new Float32Array(a*9),p=new Float32Array(a*9);for(let e=0;e<a;e++){const n=g[e],w=E[e*3],k=E[e*3+1],C=E[e*3+2],z=[F.get(B(k,C))===-1?1:0,F.get(B(C,w))===-1?1:0,F.get(B(w,k))===-1?1:0];for(let h=0;h<3;h++){const x=e*9+h*3;D[x]=f[n*3],D[x+1]=f[n*3+1],D[x+2]=f[n*3+2],I[e*3+h]=b[n],G[e*3+h]=R[n],_[x]=h===0?1:0,_[x+1]=h===1?1:0,_[x+2]=h===2?1:0,p[x]=z[0],p[x+1]=z[1],p[x+2]=z[2]}}return r.setAttribute("aCentroid",new A(D,3)),r.setAttribute("aSeed",new A(I,1)),r.setAttribute("aDelay",new A(G,1)),r.setAttribute("aBary",new A(_,3)),r.setAttribute("aEdge",new A(p,3)),r.computeVertexNormals(),c}const Ae=`
  attribute vec3 aCentroid;
  attribute float aSeed;
  attribute float aDelay;
  attribute vec3 aBary;
  attribute vec3 aEdge;    // which of the 3 edges is a shard boundary

  uniform float uBreak;    // 0..1 shatter progress
  uniform vec3  uCenter;

  varying vec3  vBary;
  varying vec3  vEdge;
  varying float vSeed;
  varying float vPiece;    // this shard's own progress
  varying vec3  vNormalW;

  void main() {
    float p = clamp((uBreak - aDelay) / max(1.0 - aDelay, 1e-4), 0.0, 1.0);
    float e = p * p * (3.0 - 2.0 * p);        // smoothstep ease

    vec3 rel = position - aCentroid;

    // tumble about the centroid, axis varying per piece
    float ang = e * (aSeed - 0.5) * 5.0;
    float c = cos(ang), s = sin(ang);
    rel = vec3(rel.x * c - rel.z * s, rel.y, rel.x * s + rel.z * c);
    float ang2 = e * (fract(aSeed * 7.3) - 0.5) * 4.0;
    float c2 = cos(ang2), s2 = sin(ang2);
    rel = vec3(rel.x, rel.y * c2 - rel.z * s2, rel.y * s2 + rel.z * c2);

    // drift outward from the room's centre and upward, like ash
    vec3 out3 = aCentroid - uCenter;
    out3.y *= 0.25;
    vec3 dir = normalize(out3 + vec3(0.0, 0.35, 0.0) + 1e-5);
    float rise = e * (1.4 + aSeed * 3.4);
    vec3 drift = dir * e * (0.9 + aSeed * 2.2) + vec3(0.0, rise, 0.0);

    vec3 world = aCentroid + rel + drift;

    vBary = aBary;
    vEdge = aEdge;
    vSeed = aSeed;
    vPiece = p;
    vNormalW = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  }
`,xe=`
  precision highp float;

  uniform float uReveal;    // 0..1 monochrome materialising over passthrough
  uniform float uBreak;
  uniform vec3  uCrack;

  varying vec3  vBary;
  varying vec3  vEdge;
  varying float vSeed;
  varying float vPiece;
  varying vec3  vNormalW;

  void main() {
    // Distance to the nearest edge that is an actual shard boundary. Interior
    // triangulation is ignored, so the geometry's own tessellation never
    // shows — only the fracture lines do.
    vec3 masked = vBary + (1.0 - vEdge) * 10.0;
    float edge = min(min(masked.x, masked.y), masked.z);

    // A hairline before anything moves — the crack appears first, then opens.
    float seamW = 0.006 + 0.085 * vPiece;
    float seam = 1.0 - smoothstep(0.0, seamW, edge);

    // flat monochrome: enough normal response to read as surfaces, no colour
    float lambert = 0.62 + 0.38 * abs(normalize(vNormalW).y);
    float grey = (0.40 + 0.13 * vSeed) * lambert;

    // the glow is faint until the piece actually starts to move
    float glow = seam * (0.25 + 2.0 * vPiece);
    vec3 col = vec3(grey) + uCrack * glow;

    // pieces thin out as they drift away
    float alpha = uReveal * (1.0 - smoothstep(0.30, 1.0, vPiece));
    alpha = max(alpha, uReveal * seam * (1.0 - vPiece * 0.85));

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;function Se(r){const o={uReveal:{value:0},uBreak:{value:0},uCenter:{value:new H(0,1.2,0)},uCrack:{value:new K(16773848)}},t=new V({vertexShader:Ae,fragmentShader:xe,uniforms:o,transparent:!0,side:re,depthWrite:!1,blending:oe});let a=null,d=null,u=0;function i(l,c){a&&(r.remove(a),a.geometry.dispose());const m=new ie().setFromBufferAttribute(l.getAttribute("position")).getCenter(new H);o.uCenter.value.copy(m),u=be(l,m),a=new Q(l,t),a.frustumCulled=!1,a.renderOrder=2,r.add(a),d=c;const v=l.getAttribute("position").count/3;console.info(`[room] ${c}: ${v} triangles -> ${u} shards`)}return{get source(){return d},get shards(){return u},get ready(){return a!==null},material:t,tryAcquire(l,c){if(a||!l)return;let s=null;try{s=he(l,c)}catch{}if(s&&s.getAttribute("position").count>60){i(s,"scene mesh");return}try{s=ge(l,c)}catch{}s&&s.getAttribute("position").count>24&&i(s,"detected planes")},useFallback(){a||i(we(),"synthetic room")},setReveal(l){o.uReveal.value=l},setBreak(l){o.uBreak.value=l},get visible(){return a?a.visible:!1},set visible(l){a&&(a.visible=l)}}}function ne(r){let o=r>>>0;return()=>(o=o*1664525+1013904223>>>0,o/4294967296)}function Me(r){const o=new le(500,24,16),t=new V({side:ce,transparent:!0,depthWrite:!1,uniforms:{uOpacity:{value:0}},vertexShader:`
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
    `}),a=new Q(o,t);return a.frustumCulled=!1,a.renderOrder=-10,r.add(a),{mesh:a,set opacity(d){t.uniforms.uOpacity.value=d},get opacity(){return t.uniforms.uOpacity.value}}}const Fe=`
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
`,ke=`
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
`;function Ce(r,{count:o=5200}={}){const t=ne(20260805),a=new Float32Array(o*3),d=new Float32Array(o),u=new Float32Array(o),i=new Float32Array(o),l=new Float32Array(o*3),c=new K;for(let f=0;f<o;f++){let b=t()*2-1;const R=t()*Math.PI*2;t()<.42&&(b*=.3);const E=Math.sqrt(Math.max(0,1-b*b)),M=90+t()*320;a[f*3]=Math.cos(R)*E*M,a[f*3+1]=b*M,a[f*3+2]=Math.sin(R)*E*M;const F=Math.pow(t(),2.4);u[f]=.85+F*4.2,d[f]=j.clamp(.86-F*.9+(t()-.5)*.22,0,.9),i[f]=t()*100;const B=t();B>.86?c.setHSL(.07+t()*.04,.55,.72):B>.66?c.setHSL(.12+t()*.03,.22,.85):c.setHSL(.58+t()*.06,.28+t()*.3,.88),l[f*3]=c.r,l[f*3+1]=c.g,l[f*3+2]=c.b}const s=new q;s.setAttribute("position",new A(a,3)),s.setAttribute("aDelay",new A(d,1)),s.setAttribute("aSize",new A(u,1)),s.setAttribute("aSeed",new A(i,1)),s.setAttribute("aTint",new A(l,3));const m={uEmerge:{value:0},uTime:{value:0},uPixel:{value:1}},v=new V({vertexShader:Fe,fragmentShader:ke,uniforms:m,transparent:!0,depthWrite:!1,depthTest:!1,blending:Z}),g=new ee(s,v);g.frustumCulled=!1,g.renderOrder=5;const y=new te;return y.add(g),r.add(y),{group:y,uniforms:m,set emerge(f){m.uEmerge.value=f},get emerge(){return m.uEmerge.value},update(f,b){m.uTime.value=f,m.uPixel.value=b,y.rotation.y=f*.0042,y.rotation.x=Math.sin(f*.017)*.014}}}const Ee=`
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
`,Te=`
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
`;function Pe(r,{count:o=260,radius:t=3}={}){const a=ne(77003),d=new Float32Array(o*3),u=new Float32Array(o),i=new Float32Array(o);for(let v=0;v<o;v++)d[v*3]=(a()-.5)*t*2.2,d[v*3+1]=.25+a()*2.3,d[v*3+2]=(a()-.5)*t*2.2,u[v]=a(),i[v]=.5+a()*1.4;const l=new q;l.setAttribute("position",new A(d,3)),l.setAttribute("aSeed",new A(u,1)),l.setAttribute("aSize",new A(i,1));const c={uTime:{value:0},uPixel:{value:1},uFade:{value:0}},s=new V({vertexShader:Ee,fragmentShader:Te,uniforms:c,transparent:!0,depthWrite:!1,blending:Z}),m=new ee(l,s);return m.frustumCulled=!1,m.renderOrder=3,r.add(m),{points:m,set fade(v){c.uFade.value=v},get fade(){return c.uFade.value},update(v,g){c.uTime.value=v,c.uPixel.value=g}}}const S={motesIn:[34,64],motesFull:[64,78],reveal:[78,82.4],break:[81.6,91.5],voidClose:[82.8,89.8],stars:[99.5,154],drone:[76,88]},ze="assets/audio/journey_01.mp3",N=(r,o,t)=>r+(o-r)*t,T=(r,[o,t])=>j.clamp((r-o)/(t-o),0,1),P=r=>r*r*(3-2*r);function W(r,o){const t=document.getElementById("status");t&&(t.textContent=r);const a=document.getElementById("substatus");a&&o!==void 0&&(a.textContent=o)}function Be(r,o){const t=r.createGain();t.gain.value=0,t.connect(o);const a=r.createBiquadFilter();a.type="lowpass",a.frequency.value=220,a.Q.value=.6,a.connect(t);for(const[d,u]of[[38,.55],[57,.28],[76.4,.18]]){const i=r.createOscillator();i.type="sine",i.frequency.value=d;const l=r.createGain();l.gain.value=u,i.connect(l).connect(a),i.start()}return{set level(d){t.gain.setTargetAtTime(d*.09,r.currentTime,.25)}}}async function Re(){const r=document.getElementById("view"),o=new ue({canvas:r,antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setPixelRatio(Math.min(2,window.devicePixelRatio)),o.setSize(window.innerWidth,window.innerHeight),o.setClearAlpha(0),o.xr.enabled=!0,o.xr.setReferenceSpaceType("local-floor"),o.outputColorSpace=de,o.toneMapping=fe,o.toneMappingExposure=1.15;const t=new me;t.background=null;const a=new ve(70,window.innerWidth/window.innerHeight,.05,900);a.position.set(0,1.35,0);const d=new te;d.add(a),t.add(d);const u=Se(t),i=Me(t),l=Ce(t),c=Pe(t);window.addEventListener("resize",()=>{a.aspect=window.innerWidth/window.innerHeight,a.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)});const s=new Audio;s.src=ze,s.preload="auto",s.crossOrigin="anonymous";let m=!1;s.addEventListener("canplaythrough",()=>{m=!0},{once:!0}),s.addEventListener("error",()=>{console.warn("[journey] voiceover failed to load"),m=!0},{once:!0});let v=null,g=null;function y(){if(!v)try{v=new(window.AudioContext||window.webkitAudioContext);const p=v.createGain();p.gain.value=1,p.connect(v.destination);const e=v.createMediaElementSource(s),n=v.createGain();n.gain.value=1,e.connect(n).connect(p),g=Be(v,p)}catch(p){console.warn("[journey] web audio unavailable, voice only",p)}}let f=!1,b=0,R=84.4;s.addEventListener("loadedmetadata",()=>{isFinite(s.duration)&&(R=s.duration)});let O=null;function E(){return O!==null?O:f?!s.ended&&s.currentTime>.01?(b=performance.now()/1e3-s.currentTime,s.currentTime):(s.ended||s.currentTime>=R-.05,performance.now()/1e3-b):0}let M="flat",F=!1;async function B(){if(!navigator.xr)return null;try{if(await navigator.xr.isSessionSupported("immersive-ar"))return"immersive-ar"}catch{}try{if(await navigator.xr.isSessionSupported("immersive-vr"))return"immersive-vr"}catch{}return null}async function D(){y(),v&&v.state==="suspended"&&await v.resume();const p=await B();if(p){const e={requiredFeatures:["local-floor"],optionalFeatures:p==="immersive-ar"?["mesh-detection","plane-detection","anchors","hand-tracking","unbounded","bounded-floor"]:["hand-tracking"]};try{const n=await navigator.xr.requestSession(p,e);await o.xr.setSession(n),M=p,n.addEventListener("end",()=>{M="flat"})}catch(n){console.warn("[journey] could not start",p,n)}}M!=="immersive-ar"&&(u.useFallback(),F=!0),document.body.classList.add("started"),f=!0,b=performance.now()/1e3,s.play().catch(e=>console.warn("[journey] autoplay blocked",e))}const I=new H;o.setAnimationLoop((p,e)=>{const n=E(),w=o.getContext(),k=Math.max(.5,w.drawingBufferHeight/900);if(!F&&e&&M==="immersive-ar"){const h=o.xr.getReferenceSpace();h&&u.tryAcquire(e,h),u.ready&&n>8&&(F=!0),!u.ready&&n>S.reveal[0]-6&&(u.useFallback(),F=!0)}const C=M==="immersive-ar"?N(0,.55,P(T(n,S.motesIn)))+N(0,.45,P(T(n,S.motesFull))):N(0,.35,P(T(n,S.motesIn)))+N(0,.3,P(T(n,S.motesFull)));if(c.fade=C*(1-P(T(n,[S.break[0],S.break[0]+5]))),c.update(n,k),u.ready){const h=M==="immersive-ar"?P(T(n,S.reveal)):Math.max(.85,P(T(n,S.reveal)));u.setReveal(h),u.setBreak(P(T(n,S.break))),u.visible=n<S.break[1]+1.5}i.opacity=P(T(n,S.voidClose)),l.emerge=T(n,S.stars),l.update(n,k);const z=P(T(n,[S.break[0],S.break[1]]));if(I.set(Math.sin(n*.031)*.55,Math.sin(n*.019+1.7)*.42,Math.cos(n*.024)*.55).multiplyScalar(z),d.position.copy(I),d.rotation.z=Math.sin(n*.013)*.03*z,g){const h=P(T(n,S.drone)),x=1-.45*P(T(n,[92,120]));g.level=h*x}o.render(t,a)});const G=await B();G==="immersive-ar"?W("Put your headset on and begin.","You will start in your own room."):G==="immersive-vr"?W("Passthrough unavailable — begin anyway.","Your room will be represented rather than seen."):W("Preview in browser","Open this page in the Quest browser for the full experience.");const _=document.getElementById("begin");_.disabled=!1,_.addEventListener("click",async()=>{_.disabled=!0,m||(W("Loading the voice…"),await new Promise(p=>{if(m)return p();const e=setInterval(()=>{m&&(clearInterval(e),p())},100);setTimeout(()=>{clearInterval(e),p()},6e3)})),await D()}),window.JOURNEY={THREE:pe,scene:t,camera:a,renderer:o,room:u,stars:l,voidShell:i,motes:c,T:S,seek:p=>{O=p},resume:()=>{O=null},look:(p,e=0)=>{a.rotation.set(e,p,0,"YXZ")},moveTo:(p,e,n)=>{d.position.set(0,0,0),a.position.set(p,e,n)},dryStart:()=>{u.useFallback(),F=!0,f=!0,b=performance.now()/1e3,document.body.classList.add("started")},state:()=>({t:E(),xrMode:M,roomSource:u.source,shards:u.shards,reveal:u.ready,voidOpacity:i.opacity,starEmerge:l.emerge})},window.__JOURNEY_READY=!0}Re().catch(r=>{console.error(r),window.__JOURNEY_ERROR=String(r&&r.stack||r),W("Something went wrong.",String(r))});
