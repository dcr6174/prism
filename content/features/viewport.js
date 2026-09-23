/* 58 Viewport overlay (live size); presets resize the window from the palette. */
(() => { const P = window.__prism;
  P.def('viewport', { actions: { overlay() {
    const r = P.ui.root(); let o = r.querySelector('.vp');
    if (o) { o.remove(); return; }
    o = P.ui.el('div', 'b vp'); o.style.right = '14px'; o.style.bottom = '14px'; o.style.padding = '6px 12px'; r.append(o);
    const up = () => o.textContent = innerWidth + ' × ' + innerHeight + '  @' + devicePixelRatio + 'x'; up(); addEventListener('resize', up);
    o.onclick = () => o.remove();
  } } });
})();
