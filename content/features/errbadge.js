/* 52 Console-error badge: counts page errors (seen by content/mainworld.js) on the toolbar icon. */
(() => { const P = window.__prism;
  P.def('errbadge', { early: true, run() {
    let t; document.addEventListener('prism:error', (e) => { clearTimeout(t); t = setTimeout(() => P.send({ type: 'badge:errors', n: e.detail.n }), 300); });
  } });
})();
