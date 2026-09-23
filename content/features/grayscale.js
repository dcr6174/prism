/* 152 Grayscale chosen sites: colour makes feeds sticky; grey makes them boring. */
(() => { const P = window.__prism;
  P.def('grayscale', { sites: () => (P.cfg('grayscale').sites || []).some(s => P.U.siteMatch(P.host, s)), run() { P.css('grayscale', 'html{filter:grayscale(1)!important}'); } });
})();
