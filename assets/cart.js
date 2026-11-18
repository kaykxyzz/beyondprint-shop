/* Cart: header button + slide-in drawer on every page. Kept in this browser (localStorage) until checkout.
   Uploaded logos are stored beside the cart so checkout can show them. */
(() => {
  const CAT = window.BP_CAT; if (!CAT) return;
  const KEY = 'bp-cart-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = items => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} sync(); };
  const logoGet = k => { try { return k ? localStorage.getItem('bp-logo-' + k) : null; } catch { return null; } };
  const logoPut = (k, data) => { try { localStorage.setItem('bp-logo-' + k, data); return true; } catch { return false; } };
  const logoDel = k => { try { localStorage.removeItem('bp-logo-' + k); } catch {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = CAT.money;

  /* header button */
  const nav = document.querySelector('header .nav');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'cartbtn'; btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg><span class="lbl">Cart</span><span class="n">0</span>';
  if (nav) nav.insertBefore(btn, nav.querySelector('.cta') || nav.querySelector('.burger') || null);

  /* drawer */
  const d = document.createElement('aside');
  d.className = 'cartd'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Your cart'); d.hidden = true;
  d.innerHTML = `<div class="cartd-scrim" data-close></div><div class="cartd-panel">
    <header><b>Your cart</b><button type="button" class="x" data-close aria-label="Close cart">×</button></header>
    <div class="cartd-list"></div>
    <footer><div class="sum"><span>Subtotal <small>incl. GST</small></span><b data-sub>$0</b></div>
      <p class="note">Free art proof after you order. Nothing prints until you approve it.</p>
      <a class="btn btn-dark ck" href="${CAT.link('../checkout/')}">Checkout <span class="arw">→</span></a>
      <button type="button" class="keep" data-close>Keep shopping</button></footer></div>`;
  document.body.appendChild(d);
  const list = d.querySelector('.cartd-list');
  let lastFocus = null;
  const open = () => { lastFocus = document.activeElement; d.hidden = false; requestAnimationFrame(() => d.classList.add('on')); d.querySelector('.x').focus(); };
  const close = () => { d.classList.remove('on'); setTimeout(() => { d.hidden = true; }, 300); if (lastFocus) lastFocus.focus(); };
  btn.addEventListener('click', open);
  d.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  d.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { const f = [...d.querySelectorAll('button,a,input')].filter(x => !x.disabled && x.offsetParent); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });

  const detail = it => [it.colourName, it.deco, it.sizes ? Object.entries(it.sizes).filter(([, v]) => v > 0).map(([k, v]) => `${k}×${v}`).join(' ') : null]
    .filter(Boolean).map(esc).join(' · ');
  function sync() {
    const items = read(), n = items.length;
    btn.querySelector('.n').textContent = n; btn.classList.toggle('has', n > 0);
    btn.setAttribute('aria-label', `Cart, ${n} item${n === 1 ? '' : 's'}`);
    d.querySelector('[data-sub]').textContent = money(items.reduce((s, i) => s + i.total, 0));
    d.querySelector('.ck').classList.toggle('off', !n);
    list.innerHTML = n ? items.map((it, i) => `<div class="ci">
        <img loading="lazy" decoding="async" src="${esc(it.img)}" alt="">
        <div class="ci-b"><b>${esc(it.name)}</b><span class="ci-d">${detail(it)}</span>
          <span class="ci-d">${it.qty} ${esc(it.unitLabel)} · ${money(it.unit)} each${it.logo ? ' · logo attached' : ' · logo to follow'}</span></div>
        <div class="ci-r"><b>${money(it.total)}</b><button type="button" data-rm="${i}" aria-label="Remove ${esc(it.name)}">Remove</button></div></div>`).join('')
      : `<div class="ci-empty"><p>Your cart is empty.</p><a class="btn btn-teal" href="${CAT.link('../shop/')}">Browse the shop <span class="arw">→</span></a></div>`;
    list.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      const all = read(), [gone] = all.splice(+b.dataset.rm, 1); if (gone && gone.logo && !all.some(x => x.logo && x.logo.key === gone.logo.key)) logoDel(gone.logo.key); write(all);
    }));
  }
  window.BP_CART = {
    items: read, open, close, clear: () => { read().forEach(i => i.logo && logoDel(i.logo.key)); write([]); },
    add: it => { const all = read(); all.push(it); write(all); },
    logoGet, logoPut
  };
  addEventListener('storage', e => { if (e.key === KEY) sync(); });
  sync();
})();
