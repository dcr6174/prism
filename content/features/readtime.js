/* 35 Reading time on the toolbar badge (articles only). */
(() => { const P = window.__prism;
  P.def('readtime', { run() {
    setTimeout(() => {
      const art = document.querySelector('article') || document.querySelector('main');
      const words = ((art || document.body).innerText || '').split(/\s+/).length;
      if (!art && words < 600) return;
      const min = Math.round(words / 230); if (min >= 1) P.send({ type: 'badge:readtime', min });
    }, 1500);
  } });
})();
