/* 156 Hover link preview: hold Shift over a link for a card with title, description and image. */
(() => { const P = window.__prism;
  P.def('hoverpreview', { run() {
    let over = null, timer, card; const cache = new Map();
    const hide = () => { card && card.remove(); card = null; };
    const go = async (a) => {
      if (!/^https?:/.test(a.href) || a.href.split('#')[0] === location.href.split('#')[0]) return;
      const r = a.getBoundingClientRect(); hide();
      card = P.ui.el('div', 'tip', '<span class="m">Loading preview…</span>'); card.style.cssText += ';left:' + Math.min(r.left, innerWidth - 340) + 'px;top:' + (r.bottom + 8 > innerHeight - 200 ? r.top - 210 : r.bottom + 8) + 'px;width:320px;max-width:320px'; P.ui.root().append(card);
      const my = card; let d = cache.get(a.href); if (!d) { d = await P.send({ type: 'preview:fetch', url: a.href }); cache.set(a.href, d); }
      if (my !== card || !d) return;
      card.innerHTML = d.error ? '<span class="m"></span>' : (d.image ? '<img style="width:100%;max-height:150px;object-fit:cover;border-radius:8px;margin-bottom:6px">' : '') + '<b></b><p style="margin:4px 0 0;font-size:12px;opacity:.8"></p><span class="m" style="font-size:11px"></span>';
      if (d.error) card.querySelector('.m').textContent = d.error; else { if (d.image) card.querySelector('img').src = new URL(d.image, a.href).href; card.querySelector('b').textContent = d.title; card.querySelector('p').textContent = (d.desc || '').slice(0, 220); card.querySelectorAll('.m')[0].textContent = d.site || ''; }
    };
    document.addEventListener('mouseover', (e) => { over = e.target.closest && e.target.closest('a[href]'); if (over && e.shiftKey) { clearTimeout(timer); timer = setTimeout(() => go(over), 250); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Shift' && over && !P.typing(e)) go(over); });
    document.addEventListener('keyup', (e) => { if (e.key === 'Shift') { clearTimeout(timer); hide(); } });
    addEventListener('scroll', hide, { passive: true });
  } });
})();
