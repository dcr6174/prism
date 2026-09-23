/* 149 Infinite-scroll stopper: after N screens of a feed, a calm pause card. You choose to keep going. */
(() => { const P = window.__prism;
  P.def('scrollstop', { sites: () => (P.cfg('scrollstop').sites || []).some(s => P.U.siteMatch(P.host, s)), run() {
    const N = +P.cfg('scrollstop').screens || 15; let next = N;
    addEventListener('scroll', () => {
      if (scrollY / innerHeight < next || P.ui.root().querySelector('[data-id="scrollstop"]')) return;
      const html = document.documentElement; const prev = html.style.overflow; html.style.overflow = 'hidden';
      const p = P.ui.panel('You have scrolled ' + next + ' screens', '<p>Still looking for something, or just scrolling?</p><div class="row"><button data-a="go">' + N + ' more screens</button><button data-a="top" class="ghost">Back to top</button><button data-a="close" class="ghost">Close tab</button></div>', { id: 'scrollstop', onClose: () => { html.style.overflow = prev; next += N; } });
      p.onclick = (e) => { const a = e.target.dataset.a; if (!a) return; html.style.overflow = prev; next += N; p.remove(); if (a === 'top') scrollTo({ top: 0, behavior: 'smooth' }), next = N; if (a === 'close') P.send({ type: 'tab:closeSelf' }); };
    }, { passive: true });
  } });
})();
