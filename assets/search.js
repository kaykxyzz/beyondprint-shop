/* Header product search (every page): type to see matching products and categories; Enter or click opens it in the shop.
   Arrow keys move through results, Esc clears. Uses the shared catalogue in products.js. */
(() => {
  const CAT = window.BP_CAT; if (!CAT) return;
  const nav = document.querySelector('header .nav'); if (!nav) return;
  let box = nav.querySelector('.search');
  if (!box) { box = document.createElement('div'); box.className = 'search'; nav.insertBefore(box, nav.querySelector('.cartbtn') || nav.querySelector('.cta') || null); }
  box.setAttribute('role', 'search');
  box.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
    '<input type="search" placeholder="Search products…" aria-label="Search products" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="bp-sres">' +
    '<ul class="sres" id="bp-sres" role="listbox" hidden></ul>';
  const inp = box.querySelector('input'), list = box.querySelector('.sres');
  const shop = CAT.link('../shop/');
  const norm = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g, ' ');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let hits = [], sel = -1;
  const search = q => {
    const words = norm(q).split(' ').filter(Boolean); if (!words.length) return [];
    const score = hay => words.every(w => hay.includes(w)) ? words.reduce((s, w) => s + (hay.startsWith(w) ? 2 : 1), 0) : 0;
    const c = CAT.cats.map(x => ({ n: x.n, u: shop + '#cat-' + x.group, kind: 'cat', s: score(norm(x.n)) + 1 })).filter(x => x.s > 1);
    const p = CAT.products.map(x => ({ n: x.n, c: x.c, p: x.p, u: shop + '#p-' + x.id, kind: 'prod', s: score(norm(x.n + ' ' + x.k + ' ' + x.c)) })).filter(x => x.s > 0);
    return [...c.sort((a, b) => b.s - a.s).slice(0, 2), ...p.sort((a, b) => b.s - a.s)].slice(0, 7);
  };
  const render = () => {
    const q = inp.value.trim();
    if (!q) { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); return; }
    hits = search(q); sel = -1;
    list.innerHTML = hits.length ? hits.map((h, i) => `<li role="option" id="bp-sr-${i}" aria-selected="false"><a href="${h.u}"><b>${esc(h.n)}</b><span class="c">${h.kind === 'cat' ? 'Category' : esc(h.c)}</span><span class="p">${h.kind === 'prod' ? 'from ' + CAT.money(h.p) : 'View all →'}</span></a></li>`).join('')
      : `<li class="none">No products match “${esc(q)}”. Try caps, stickers or tees, or <a href="${CAT.link('../contact/')}">ask us about it</a>.</li>`;
    list.hidden = false; inp.setAttribute('aria-expanded', 'true');
  };
  const mark = i => {
    sel = i; list.querySelectorAll('[role=option]').forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0) inp.setAttribute('aria-activedescendant', 'bp-sr-' + i); else inp.removeAttribute('aria-activedescendant');
  };
  inp.addEventListener('input', render);
  inp.addEventListener('focus', () => { if (inp.value.trim()) render(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); mark((sel + 1) % hits.length); }
    else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); mark(sel <= 0 ? hits.length - 1 : sel - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const a = list.querySelectorAll('[role=option] a')[Math.max(0, sel)]; if (a) a.click(); }
    else if (e.key === 'Escape') { inp.value = ''; render(); }
  });
  list.addEventListener('click', () => { list.hidden = true; inp.value = ''; inp.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('pointerdown', e => { if (!box.contains(e.target)) { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); } });
})();
