/* Shop page: filter + sort the catalogue, product panel with options, tier pricing, logo upload, add to cart. */
(() => {
  const CAT = window.BP_CAT, CART = window.BP_CART; if (!CAT) return;
  const { money, tierOf, unit } = CAT;
  const $ = s => document.querySelector(s), grid = $('#shopgrid'), dlg = $('#pdlg');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let group = 'all', sort = 'popular';
  const label = { unit: 'units', pack: 'packs', set: 'sets', job: 'job' };

  /* filters */
  const chips = $('#shopchips');
  chips.innerHTML = CAT.groups.map(([k, n]) => `<button type="button" data-g="${k}" aria-pressed="${k === group}">${n}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; group = b.dataset.g; render(); });
  $('#shopsort').addEventListener('change', e => { sort = e.target.value; render(); });

  function render() {
    chips.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === group)));
    let list = CAT.products.filter(p => group === 'all' || p.group === group);
    if (sort === 'low') list = [...list].sort((a, b) => a.p - b.p);
    if (sort === 'high') list = [...list].sort((a, b) => b.p - a.p);
    $('#shopcount').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.map(p => `<article class="prod" id="p-${p.id}">
      <button type="button" class="hit" data-open="${p.id}" aria-label="Customise ${esc(p.n)}"></button>
      <div class="im"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy"></div>
      <div class="bd"><span class="cat">${esc(p.c)}</span><div class="nm">${esc(p.n)}</div>
        <div class="meta"><div class="price"><span>from</span>${money(p.p)}</div><span class="min">Min ${p.min} ${label[p.unit] === 'units' ? '' : label[p.unit]}</span></div>
        <span class="go">Customise <b>→</b></span></div></article>`).join('');
  }
  grid.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openProduct(b.dataset.open); });

  /* product panel */
  let cur = null, logo = null, lastFocus = null;
  function openProduct(id) {
    const p = CAT.byId(id); if (!p) return; cur = p; logo = null; lastFocus = document.activeElement;
    const sizes = p.sizes ? `<fieldset class="f"><legend>Sizes <small>(enter how many of each)</small></legend><div class="sizes">${p.sizes.map(s =>
      `<label><span>${s}</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-size="${s}"></label>`).join('')}</div></fieldset>`
      : `<div class="f"><label for="pq">Quantity <small>(${label[p.unit]})</small></label><input id="pq" type="number" inputmode="numeric" min="${p.min}" step="1" value="${p.min}"></div>`;
    const colours = p.colours ? `<fieldset class="f"><legend>Colour</legend><div class="sw">${p.colours.map((c, i) =>
      `<label class="swc"><input type="radio" name="pc" value="${i}" ${i ? '' : 'checked'}><i style="background:${c}"></i><span class="vh">Colour ${i + 1}</span></label>`).join('')}</div></fieldset>` : '';
    const deco = p.deco && p.deco.length > 1 ? `<div class="f"><label for="pd">Decoration</label><select id="pd">${p.deco.map(([n, a], i) =>
      `<option value="${i}">${esc(n)}${a ? ` (+${money(a)} each)` : ''}</option>`).join('')}</select></div>` : '';
    const tiers = p.tiers.length > 1 ? `<div class="f"><span class="lab">Price per ${p.unit} by quantity</span><table class="tiers"><thead><tr>${p.tiers.map(([q]) => `<th>${q}+</th>`).join('')}</tr></thead>
      <tbody><tr>${p.tiers.map(([q, f]) => `<td data-q="${q}">${money(p.p * f)}</td>`).join('')}</tr></tbody></table></div>` : '';
    dlg.querySelector('.pd-body').innerHTML = `
      <div class="pd-img"><img loading="lazy" decoding="async" src="${p.img}" alt="${esc(p.n)}"></div>
      <div class="pd-form">
        <span class="cat">${esc(p.c)}</span><h2 id="pdt">${esc(p.n)}</h2><p class="desc">${esc(p.d)}</p>
        ${colours}${sizes}${deco}${tiers}
        <fieldset class="f"><legend>Your logo or artwork</legend>
          <label class="drop" for="pl"><input id="pl" type="file" accept="image/*,.pdf,.ai,.eps,.svg"><span class="drop-t">Upload your logo <small>PNG, JPG, SVG, PDF or AI</small></span><img class="drop-i" alt="" hidden></label>
          <p class="hint">No file yet? Add to cart anyway and send it after you order. We’ll email a free art proof either way.</p></fieldset>
        <div class="f"><label for="pn">Notes <small>(optional)</small></label><textarea id="pn" rows="2" placeholder="Print colours, placement, names on backs…"></textarea></div>
        <div class="pd-total"><div><span class="lab">Total incl. GST</span><b id="ptot">$0</b><small id="punit"></small></div>
          <button type="button" class="btn btn-dark" id="padd">Add to cart <span class="arw">→</span></button></div>
        <p class="err" id="perr" role="alert"></p>
      </div>`;
    dlg.querySelectorAll('input,select').forEach(i => i.addEventListener('input', price));
    dlg.querySelector('#pl').addEventListener('change', readLogo);
    dlg.querySelector('#padd').addEventListener('click', add);
    price();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('modal-open');
    try { history.replaceState(null, '', '#p-' + p.id); } catch (_) {}
  }
  const qtyOf = () => cur.sizes ? [...dlg.querySelectorAll('[data-size]')].reduce((s, i) => s + Math.max(0, +i.value || 0), 0) : Math.max(0, +(dlg.querySelector('#pq').value) || 0);
  const decoOf = () => { const s = dlg.querySelector('#pd'); return cur.deco ? cur.deco[s ? +s.value : 0] : null; };
  function price() {
    const q = qtyOf(), dc = decoOf(), u = unit(cur, Math.max(q, cur.min), dc ? dc[1] : 0), tier = tierOf(cur, q);
    dlg.querySelector('#ptot').textContent = q ? money(u * q) : money(0);
    dlg.querySelector('#punit').textContent = q ? `${q} × ${money(u)}` : `Minimum ${cur.min}`;
    dlg.querySelectorAll('.tiers td').forEach(td => td.classList.toggle('on', +td.dataset.q === tier[0] && q >= cur.min));
    dlg.querySelector('#perr').textContent = '';
  }
  function readLogo(e) {
    const f = e.target.files[0]; const img = dlg.querySelector('.drop-i'), t = dlg.querySelector('.drop-t');
    if (!f) return;
    logo = { name: f.name, key: Date.now().toString(36), data: null };
    t.innerHTML = `${esc(f.name)} <small>Tap to change</small>`;
    if (f.type.startsWith('image/') && f.size < 1.5e6) {
      const r = new FileReader(); r.onload = () => { logo.data = r.result; img.src = r.result; img.hidden = false; }; r.readAsDataURL(f);
    } else img.hidden = true;
  }
  function add() {
    const q = qtyOf(), err = dlg.querySelector('#perr');
    if (q < cur.min) { err.textContent = `This product starts at ${cur.min} ${label[cur.unit]}. Add ${cur.min - q} more to continue.`; return; }
    const dc = decoOf(), u = unit(cur, q, dc ? dc[1] : 0);
    const ci = dlg.querySelector('[name=pc]:checked');
    const sizes = cur.sizes ? Object.fromEntries([...dlg.querySelectorAll('[data-size]')].map(i => [i.dataset.size, Math.max(0, +i.value || 0)])) : null;
    let lg = null;
    if (logo) { lg = { name: logo.name, key: logo.key }; if (logo.data && CART) CART.logoPut(logo.key, logo.data); }
    CART && CART.add({ pid: cur.id, name: cur.n, img: cur.img, qty: q, unit: Math.round(u * 100) / 100, total: Math.round(u * q * 100) / 100,
      unitLabel: label[cur.unit], colourName: ci && cur.colours.length > 1 ? `Colour ${+ci.value + 1}` : null, colour: ci ? cur.colours[+ci.value] : null,
      deco: dc && cur.deco.length > 1 ? dc[0] : null, sizes, logo: lg, notes: dlg.querySelector('#pn').value.trim() });
    closeProduct(); CART && CART.open();
  }
  function closeProduct() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    document.documentElement.classList.remove('modal-open');
    try { history.replaceState(null, '', location.pathname); } catch (_) {}
    if (lastFocus) lastFocus.focus();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-pclose]')) closeProduct(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeProduct(); });

  /* deep links: #cat-apparel filters, #p-tee-staple opens a product */
  const route = () => {
    const h = location.hash.slice(1);
    if (h.startsWith('cat-')) { const g = h.slice(4); if (CAT.groups.some(([k]) => k === g)) { group = g; render(); } }
    if (h.startsWith('p-')) { const p = CAT.byId(h.slice(2)); if (p) { if (group !== 'all' && p.group !== group) { group = 'all'; render(); } openProduct(p.id); } }
  };
  render(); route();
  addEventListener('hashchange', route);
})();
