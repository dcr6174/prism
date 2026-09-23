/* 88 Stop autoplay: videos that start without you clicking get paused (except listed video sites). */
(() => { const P = window.__prism;
  P.def('noautoplay', { early: true, sites: (P) => !P.U.anySite(P.host, P.cfg('noautoplay').except), run() {
    let userAt = 0; const mark = () => userAt = Date.now();
    ['pointerdown', 'keydown'].forEach(t => addEventListener(t, mark, true));
    document.addEventListener('play', (e) => { const v = e.target; if (!(v instanceof HTMLMediaElement)) return; if (Date.now() - userAt > 1500 && !v.dataset.prismAllowed) { v.pause(); v.autoplay = false; } else v.dataset.prismAllowed = '1'; }, true);
  } });
})();
