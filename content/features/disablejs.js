/* 62 Disable CSS on this tab (JS and images are per-site switches in the background). */
(() => { const P = window.__prism;
  P.def('disablejs', { actions: { css() {
    const off = !document.documentElement.dataset.prismNoCss; document.documentElement.dataset.prismNoCss = off ? '1' : '';
    document.querySelectorAll('link[rel=stylesheet], style').forEach(s => { if (!s.id || !s.id.startsWith('prism-')) s.disabled = off; });
    document.querySelectorAll('[style]').forEach(el => { if (off) { el.dataset.prismStyle = el.getAttribute('style'); el.removeAttribute('style'); } else if (el.dataset.prismStyle != null) el.setAttribute('style', el.dataset.prismStyle); });
    P.ui.toast(off ? 'CSS off' : 'CSS back on'); return off ? 'CSS off' : 'CSS on';
  } } });
})();
