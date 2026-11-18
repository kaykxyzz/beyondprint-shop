/* Homepage hero background: the chosen interactive "Light shafts" gradient (values from the gradient generator).
   Pass 1 draws the light at 30% resolution (softness 1); pass 2 stretches it to the screen and adds the fine moving grain.
   Paused when the hero is off screen, still for reduced motion. Without WebGL the concrete background stays. */
/* Floating cut-out logo: a gentle idle drift, a 3D turn toward the cursor over the hero, and a small turn as the page scrolls. */
(() => {
  const hero = document.querySelector('.hero'), wm = hero && hero.querySelector('.wm');
  if (!wm || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ry = 0, rx = 0, fy = 0, lastY = scrollY, vel = 0, t0 = performance.now(), prev = t0, px = 0, py = 0, on = 0, onT = 0;
  hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); px = (e.clientX - b.left) / b.width - .5; py = (e.clientY - b.top) / b.height - .5; onT = 1; }, { passive: true });
  hero.addEventListener('pointerleave', () => { onT = 0; });
  const tick = now => {
    const dt = Math.min(.05, (now - prev) / 1000); prev = now;
    const t = (now - t0) / 1000, y = scrollY, h = hero.offsetHeight || 1;
    vel += ((y - lastY) / Math.max(dt, .001) - vel) * (1 - Math.exp(-dt * 6)); lastY = y;
    const p = Math.min(1.2, y / h);
    on += (onT - on) * (1 - Math.exp(-dt * 4));
    const tRy = Math.sin(t * .5) * 4 + Math.sin(p * Math.PI * 1.5) * 12 + Math.max(-8, Math.min(8, vel * .01)) + px * 28 * on;
    const tRx = Math.sin(t * .37) * 3 - p * 6 - py * 20 * on;
    ry += (tRy - ry) * (1 - Math.exp(-dt * 4)); rx += (tRx - rx) * (1 - Math.exp(-dt * 4));
    fy = Math.sin(t * .8) * 7;
    if (y < h * 1.3) {
      wm.style.setProperty('--wry', ry.toFixed(2) + 'deg'); wm.style.setProperty('--wrx', rx.toFixed(2) + 'deg'); wm.style.setProperty('--wfy', fy.toFixed(1) + 'px');
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

(() => {
  const hero = document.querySelector('.hero');
  const cv = hero && hero.querySelector('.hero-gl');
  if (!cv) return;
  const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

  /* final values */
  const C = { base: '#5cc7bb', light: '#b8fff7', halo: '#f8bec2' };
  const V = { dir: 0 /* bottom */, speed: .3, follow: .13, push: .33, depth: .5, sheen: 0, halo: .23,
              rise: .9, spread: .62, scount: 16, samount: 1, sdrift: .64, vign: 0, grain: 0,
              exposure: -.19, contrast: 1.04, saturation: .9 };
  const SCALE = .3; // softness 1
  let B = hex(C.base), L = hex(C.light), H = hex(C.halo);

  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const LIGHT = `precision highp float;
uniform vec2 uRes;uniform float uTime,uDir;uniform vec3 uBg,uBase,uAccent;
uniform float uRise,uSpread,uOriginX,uLift,uShaftCount,uShaftAmount,uShaftDrift,uVignette;
float h11(float x){return fract(sin(x*127.1)*43758.5453123);}
float vn1(float x){float i=floor(x);float f=fract(x);f=f*f*(3.-2.*f);return mix(h11(i),h11(i+1.),f);}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;float aspect=uRes.x/uRes.y;float t=uTime;
 float breathe=1.+.06*sin(t*.35);float depth=mix(.05,1.2,uSpread);
 vec2 lp;float acrossUv;float edgeCoord;
 if(uDir>.5){lp=vec2(uOriginX,1.+depth);acrossUv=uv.x;edgeCoord=1.-uv.y;}
 else{lp=vec2(uOriginX,-depth);acrossUv=uv.x;edgeCoord=uv.y;}
 vec2 q=vec2((uv.x-lp.x)*aspect,uv.y-lp.y);float d=length(q);
 float k=mix(9.,1.4,uRise)/breathe;
 float g=clamp(exp(-d*k)/max(exp(-depth*k),1e-4),0.,1.);
 float sx=acrossUv*uShaftCount;float dr=t*uShaftDrift;
 float s=vn1(sx+dr)*.6+vn1(sx*2.17-dr*.8)*.4;
 g*=mix(1.,.45+1.25*s,uShaftAmount*smoothstep(0.,.35,edgeCoord));
 g=clamp(g*(1.+uLift*.25),0.,1.);
 vec3 col=mix(uBg,uBase,smoothstep(0.,.68,g));
 col=mix(col,uAccent,smoothstep(.58,.99,g));
 vec2 vc=uv-.5;vc.x*=aspect;col*=1.-uVignette*smoothstep(.35,.95,length(vc));
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
  const FINISH = `precision highp float;
uniform sampler2D uTex;uniform vec2 uRes;uniform float uTime,uGrain,uExp,uCon,uSat;
float ign(vec2 p,float f){p+=5.588238*mod(f,64.);return fract(52.9829189*fract(.06711056*p.x+.00583715*p.y));}
void main(){vec2 f=gl_FragCoord.xy;vec3 c=texture2D(uTex,f/uRes).rgb;
 c=c*exp2(uExp);c=(c-.5)*uCon+.5;float y=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(y),c,uSat);
 c+=(ign(f,floor(uTime*24.))-.5)*uGrain;gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
  const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const link = src => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, src)); gl.linkProgram(p); return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null; };
  const pL = link(LIGHT), pF = link(FINISH);
  if (!pL || !pF) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const quad = p => { const a = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0); };
  const U = (p, n) => gl.getUniformLocation(p, n);
  const uL = Object.fromEntries(['uRes','uTime','uDir','uBg','uBase','uAccent','uRise','uSpread','uOriginX','uLift','uShaftCount','uShaftAmount','uShaftDrift','uVignette'].map(n => [n, U(pL, n)]));
  const uF = { tex: U(pF, 'uTex'), res: U(pF, 'uRes'), time: U(pF, 'uTime'), grain: U(pF, 'uGrain'), exp: U(pF, 'uExp'), con: U(pF, 'uCon'), sat: U(pF, 'uSat') };

  const shape = () => {
  gl.uniform1f(uL.uDir, V.dir);
  gl.uniform3fv(uL.uBg, B.map(v => v * (1 - .6 * V.depth)));
  gl.uniform3fv(uL.uBase, mix(B, L, .15 + .5 * V.sheen));
  gl.uniform3fv(uL.uAccent, mix(L, H, Math.min(1, V.halo * 1.6)));
  gl.uniform1f(uL.uRise, V.rise); gl.uniform1f(uL.uSpread, V.spread);
  gl.uniform1f(uL.uShaftCount, V.scount); gl.uniform1f(uL.uShaftAmount, V.samount); gl.uniform1f(uL.uShaftDrift, V.sdrift); gl.uniform1f(uL.uVignette, V.vign);
  };

  const fbo = gl.createFramebuffer(), tex = gl.createTexture();
  let fw = 1, fh = 1;
  const size = () => {
    const w = hero.clientWidth, h = hero.clientHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    fw = Math.max(1, Math.round(w * SCALE)); fh = Math.max(1, Math.round(h * SCALE));
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  new ResizeObserver(size).observe(hero); size();

  let visible = true, on = false, onE = 0, tx = .5, mx = .5, lx = .5, clock = 0, t = 0, last = performance.now();
  hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width; on = true; }, { passive: true });
  hero.addEventListener('pointerleave', () => { on = false; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);

  hero.classList.add('gl-on');
  window.BPHero = { V, C, setColor(k, v) { C[k] = v; B = hex(C.base); L = hex(C.light); H = hex(C.halo); } };
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) {
      clock += dt;
      if (!on) tx = .5 + Math.sin(clock * .18) * .22;
      mx += (tx - mx) * V.follow;
      onE += ((on ? 1 : 0) - onE) * (1 - Math.exp(-dt * 5));
      lx += (mx - lx) * (1 - Math.exp(-8 * dt));
      if (!still) t = (t + dt * V.speed * 4) % 3600;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, fw, fh);
      gl.useProgram(pL); quad(pL); shape();
      gl.uniform2f(uL.uRes, fw, fh); gl.uniform1f(uL.uTime, t);
      gl.uniform1f(uL.uOriginX, .5 + (lx - .5) * Math.min(1, V.push) * onE); gl.uniform1f(uL.uLift, V.push * onE);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height);
      gl.useProgram(pF); quad(pF);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(uF.tex, 0);
      gl.uniform2f(uF.res, cv.width, cv.height); gl.uniform1f(uF.time, still ? 0 : clock); gl.uniform1f(uF.grain, V.grain); gl.uniform1f(uF.exp, V.exposure); gl.uniform1f(uF.con, V.contrast); gl.uniform1f(uF.sat, V.saturation);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
