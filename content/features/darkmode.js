/* 76 Force dark mode on chosen sites (invert filter that keeps images and video natural). Palette toggles it per page. */
(() => { const P = window.__prism;
  const CSS = 'html { filter: invert(.92) hue-rotate(180deg) !important; background: #fff !important; } img, video, picture, canvas, iframe, svg image, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }';
  P.def('darkmode', { early: true, sites: (P) => P.U.anySite(P.host, P.cfg('darkmode').sites), run() { if (!matchMedia('(prefers-color-scheme: dark)').matches || true) P.css('dark', CSS); },
    actions: { async toggle() { const on = !document.getElementById('prism-css-dark'); if (on) P.css('dark', CSS); else P.uncss('dark'); return on ? 'Dark on' : 'Dark off'; } } });
})();
