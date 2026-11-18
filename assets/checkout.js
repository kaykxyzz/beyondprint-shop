/* Checkout: order summary, delivery details (checked when you leave each field), shipping choice, artwork check,
   and a demo "Place order". No payment details are collected here: the real payment step connects to the shop platform. */
(() => {
  const CAT = window.BP_CAT, CART = window.BP_CART; if (!CAT || !CART) return;
  const { money } = CAT, $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SHIP = { standard: { n: 'Standard delivery', d: '3–7 business days after your proof is approved and printed', cost: s => s >= 250 ? 0 : 14.95 },
                 express: { n: 'Express delivery', d: '1–3 business days after printing', cost: () => 24.95 },
                 pickup: { n: 'Pick up in Yeppoon', d: '44 McBean Street, weekdays 8:30–5', cost: () => 0 } };
  const form = $('#ckform'), items = CART.items();

  if (!items.length) {
    $('#ckwrap').innerHTML = `<div class="ck-empty"><h2>Your cart is empty</h2><p>Add a product from the shop to check out.</p><a class="btn btn-dark" href="${CAT.link('../shop/')}">Browse the shop <span class="arw">→</span></a></div>`;
    return;
  }

  /* summary */
  const sub = items.reduce((s, i) => s + i.total, 0);
  $('#cklines').innerHTML = items.map(it => `<li><img loading="lazy" decoding="async" src="${esc(it.img)}" alt=""><div><b>${esc(it.name)}</b><span>${it.qty} ${esc(it.unitLabel)}${it.deco ? ' · ' + esc(it.deco) : ''}${it.colourName ? ' · ' + esc(it.colourName) : ''}</span></div><b>${money(it.total)}</b></li>`).join('');
  const totals = () => {
    const m = SHIP[form.ship.value] || SHIP.standard, sh = m.cost(sub), tot = sub + sh;
    $('#cksub').textContent = money(sub); $('#ckship').textContent = sh ? money(sh) : 'Free';
    $('#cktot').textContent = money(tot); $('#ckgst').textContent = money(tot / 11);
    $('#ckfree').hidden = !(form.ship.value === 'standard' && sub < 250);
    $('#ckfree').textContent = `Add ${money(250 - sub)} more for free standard delivery.`;
    $('#ckaddr').hidden = form.ship.value === 'pickup';
    $('#ckaddr').querySelectorAll('input,select').forEach(i => i.required = form.ship.value !== 'pickup' && i.dataset.req === '1');
    return tot;
  };
  form.querySelectorAll('[name=ship]').forEach(r => r.addEventListener('change', totals));

  /* artwork: one line per item, upload if missing */
  $('#ckart').innerHTML = items.map((it, i) => `<li><span><b>${esc(it.name)}</b> ${it.logo ? `<em class="ok">Logo attached: ${esc(it.logo.name)}</em>` : '<em>No logo yet</em>'}</span>
    ${it.logo ? '' : `<label class="up">Upload<input type="file" accept="image/*,.pdf,.ai,.eps,.svg" data-i="${i}"></label>`}</li>`).join('');
  $('#ckart').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const li = e.target.closest('li'); li.querySelector('em').textContent = 'Logo attached: ' + f.name; li.querySelector('em').className = 'ok';
    e.target.closest('label').remove();
  });

  /* validation: on leaving a field, cleared as soon as it is fixed */
  const RULES = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter an email like name@business.com.au so we can send your proof.',
    phone: v => !v || /^[0-9 +()-]{8,}$/.test(v) || 'Enter a phone number with at least 8 digits, or leave it blank.',
    postcode: v => /^\d{4}$/.test(v) || 'Enter a 4-digit Australian postcode.'
  };
  const check = el => {
    if (el.closest('[hidden]')) return true;
    const v = el.value.trim(), err = document.getElementById(el.id + '-e');
    let msg = '';
    if (el.required && !v) msg = el.dataset.msg || 'This one is needed to deliver your order.';
    else if (RULES[el.name]) { const r = RULES[el.name](v); if (r !== true) msg = r; }
    el.setAttribute('aria-invalid', String(!!msg)); if (err) err.textContent = msg;
    return !msg;
  };
  form.querySelectorAll('input[id],select[id]').forEach(el => {
    el.addEventListener('blur', () => { if (el.value || el.dataset.touched) check(el); el.dataset.touched = '1'; });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('input[id],select[id]')].filter(el => !check(el));
    if (bad.length) { bad[0].focus(); $('#ckmsg').textContent = `Check the ${bad.length === 1 ? 'highlighted field' : bad.length + ' highlighted fields'} and try again.`; return; }
    const tot = totals(), no = 'BP-' + Math.random().toString(36).slice(2, 7).toUpperCase(), email = form.email.value.trim();
    CART.clear();
    $('#ckwrap').innerHTML = `<div class="ck-done" tabindex="-1"><span class="kicker">Order received</span><h2>Thanks, ${esc(form.fname.value.trim())}.</h2>
      <p>Order <b>${no}</b> · ${money(tot)} incl. GST</p>
      <ol class="next"><li><b>Art proof</b>We email a free digital proof to ${esc(email)} within one business day.</li>
        <li><b>You approve</b>Ask for changes or approve it. Nothing prints until you do.</li>
        <li><b>Made &amp; sent</b>Most orders are made in 5–10 business days, then ${form.ship.value === 'pickup' ? 'ready to collect in Yeppoon' : 'shipped with tracking'}.</li></ol>
      <p class="demo">Prototype: no payment was taken and no order was sent.</p>
      <a class="btn btn-dark" href="${CAT.link('../shop/')}">Back to the shop <span class="arw">→</span></a></div>`;
    $('.ck-done').focus(); scrollTo({ top: 0 });
  });
  totals();
})();
