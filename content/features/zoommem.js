/* 42 Per-site font bump (zoom itself is remembered by the background). Alt+= / Alt+- are in caret.js. */
(() => { const P = window.__prism;
  P.def('zoommem', { early: true, async run() {
    const f = (await PrismStore.get('fontBump', {}))[P.host] || parseFloat((P.U.pairs(P.cfg('zoommem').fonts).find(([s]) => P.U.siteMatch(P.host, s)) || [])[1]);
    if (f) P.css('fontbump', 'html { font-size: ' + f + '% !important; } body { font-size: ' + f / 100 + 'em; }');
  } });
})();
