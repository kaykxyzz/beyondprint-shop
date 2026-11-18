/* Gliding underline for the top bar. */
document.querySelectorAll('.nav nav').forEach(n=>{
  const i=document.createElement('span');i.className='ind';i.setAttribute('aria-hidden','true');n.appendChild(i);
  const home=()=>n.querySelector('a.on');
  const go=a=>{
    if(!a){n.classList.remove('ind-on');return}
    const fresh=!n.classList.contains('ind-on');
    if(fresh)i.style.transition='none';
    i.style.width=a.offsetWidth+'px';i.style.transform='translateX('+a.offsetLeft+'px)';
    if(fresh){i.offsetWidth;i.style.transition=''}
    n.classList.add('ind-on');
  };
  n.addEventListener('mouseover',e=>{const a=e.target.closest('a');if(a)go(a)});
  n.addEventListener('focusin',e=>{const a=e.target.closest('a');if(a)go(a)});
  n.addEventListener('mouseleave',()=>go(home()));
  n.addEventListener('focusout',e=>{if(!n.contains(e.relatedTarget))go(home())});
  addEventListener('resize',()=>{if(n.classList.contains('ind-on'))go(n.querySelector('a:hover')||home())});
  go(home());
});

/* Real jobs cards: tilt toward the cursor while hovered. */
if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){
  document.querySelectorAll('.wgrid .pol').forEach(c=>{
    c.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.setProperty('--ry',(x*14).toFixed(2)+'deg');c.style.setProperty('--rx',(-y*12).toFixed(2)+'deg')});
    c.addEventListener('pointerleave',()=>{c.style.removeProperty('--rx');c.style.removeProperty('--ry')});
  });
}

/* Reduced motion: hold autoplay videos on their first frame. */
if(matchMedia('(prefers-reduced-motion:reduce)').matches){
  document.querySelectorAll('video[autoplay]').forEach(v=>{v.removeAttribute('autoplay');v.pause()});
}

/* Smooth wheel scrolling: the page eases toward where the wheel sends it (desktop mouse and trackpad only).
   Run-ahead is capped so repeated flicks glide at a steady pace instead of stacking up speed.
   Any mouse press (including holding the wheel to autoscroll) hands control straight back to the browser.
   Keyboard, scrollbar and touch stay native. Off for reduced motion. */
(() => {
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const S = window.BPScroll = { ease: .035, wheel: 2, lead: 450, to: y => window.scrollTo({ top: y, behavior: still ? 'auto' : 'smooth' }) };
  if (fine && !still) {
    root.classList.add('lerp-scroll');
    let target = scrollY, cur = scrollY, active = false, last = 0;
    const max = () => root.scrollHeight - innerHeight;
    const inner = el => { for (; el && el !== document.body; el = el.parentElement) {
      const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true; } return false; };
    const stop = () => { active = false; target = cur = scrollY; };
    const step = now => {
      if (!active) return;
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
      cur += (target - cur) * (1 - Math.pow(1 - S.ease, dt * 60));
      if (Math.abs(target - cur) < .4) { cur = target; active = false; }
      window.scrollTo(0, cur);
      if (active) requestAnimationFrame(step);
    };
    const go = () => { if (!active) { active = true; last = performance.now(); requestAnimationFrame(step); } };
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || inner(e.target)) return;
      e.preventDefault();
      const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1) * S.wheel;
      if (!active) { target = cur = scrollY; }
      target = Math.max(0, Math.min(max(), Math.max(cur - S.lead, Math.min(cur + S.lead, target + d))));
      go();
    }, { passive: false });
    addEventListener('pointerdown', stop, { passive: true });
    addEventListener('keydown', stop, { passive: true });
    addEventListener('scroll', () => { if (!active) target = cur = scrollY; }, { passive: true });
    S.to = y => { target = Math.max(0, Math.min(max(), y)); if (!active) cur = scrollY; go(); };
  }
  /* same-page anchors (#quote, #shop…) glide with the same feel, landing below the sticky header */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href').slice(1); if (!id) return;
    const el = document.getElementById(id); if (!el) return;
    e.preventDefault();
    const hd = document.getElementById('hd'), off = hd ? hd.offsetHeight : 0;
    S.to(el.getBoundingClientRect().top + scrollY - off);
    try { history.replaceState(null, '', '#' + id); } catch (_) {}
  });
  /* back to top */
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'totop'; b.setAttribute('aria-label', 'Back to top');
  b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(b);
  b.addEventListener('click', () => S.to(0));
  const show = () => b.classList.toggle('on', scrollY > innerHeight * .8);
  addEventListener('scroll', show, { passive: true }); show();
})();
