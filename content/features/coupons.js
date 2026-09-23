/* 122 Coupon memory: remembers codes you type into coupon/promo boxes per site and offers them next time. */
(() => { const P = window.__prism;
  const isCoupon = (el) => el && el.tagName === 'INPUT' && /coupon|promo|voucher|discount|offer.?code|gift.?code/i.test([el.name, el.id, el.placeholder, el.getAttribute('aria-label')].join(' '));
  P.def('coupons', { run() {
    document.addEventListener('change', (e) => { const el = e.target; if (!isCoupon(el) || !el.value.trim()) return; const code = el.value.trim().toUpperCase().slice(0, 40); PrismStore.update('coupons', {}, (m) => { const l = m[P.host] = m[P.host] || []; if (!l.some(c => c.code === code)) l.unshift({ code, t: Date.now() }); m[P.host] = l.slice(0, 20); }); }, true);
    document.addEventListener('focusin', async (e) => {
      const el = e.target; if (!isCoupon(el) || el.value) return;
      const l = (await PrismStore.get('coupons', {}))[P.host]; if (!l || !l.length) return;
      const b = el.getBoundingClientRect();
      const t = P.ui.tip(b.left, b.bottom + 6, '<b>Codes you used here</b><br>' + l.slice(0, 6).map(c => '<span data-c="' + P.esc(c.code) + '" style="display:inline-block;margin:4px 4px 0 0;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.14);cursor:pointer">' + P.esc(c.code) + '</span>').join(''));
      t.style.pointerEvents = 'auto';
      t.onmousedown = (ev) => { const c = ev.target.dataset.c; if (c) { ev.preventDefault(); (P.setVal || ((a, v) => { a.value = v; a.dispatchEvent(new Event('input', { bubbles: true })); }))(el, c); t.remove(); } };
      el.addEventListener('blur', () => setTimeout(() => t.remove(), 200), { once: true });
    }, true);
  } });
})();
