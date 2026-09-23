/* 95 Locked pinned tabs (page side): in a pinned tab, links to other sites open in a new tab so the pinned app stays put. */
(() => { const P = window.__prism;
  P.def('lockpin', { async run() {
    const me = await P.send({ type: 'tab:self' }); if (!me || !me.pinned) return;
    document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.ctrlKey || e.metaKey) return; try { const u = new URL(a.href); if (u.hostname !== location.hostname && /^https?:/.test(u.protocol)) { e.preventDefault(); e.stopPropagation(); window.open(a.href, '_blank'); } } catch (x) {} }, true);
  } });
})();
