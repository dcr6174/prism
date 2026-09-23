/* 111 Resume where you stopped: long videos/audio (10 min+) remember position per page. */
(() => { const P = window.__prism;
  const key = () => location.hostname + location.pathname + (new URLSearchParams(location.search).get('v') || '');
  P.def('resume', { run() {
    const done = new WeakSet();
    document.addEventListener('loadedmetadata', async (e) => {
      const m = e.target; if (!(m instanceof HTMLMediaElement) || m.duration < 600 || done.has(m)) return; done.add(m);
      if (/youtube\.com$/.test(location.hostname) && new URLSearchParams(location.search).get('t')) return;
      const pos = (await PrismStore.get('resume', {}))[key()];
      if (pos && pos > 30 && pos < m.duration - 30) { m.currentTime = pos; P.ui.toast('Resumed at ' + Math.floor(pos / 60) + ':' + String(Math.floor(pos % 60)).padStart(2, '0')); }
      setInterval(() => { if (!m.paused) PrismStore.update('resume', {}, (all) => { if (m.currentTime > m.duration - 30) delete all[key()]; else all[key()] = Math.floor(m.currentTime); const ks = Object.keys(all); if (ks.length > 300) delete all[ks[0]]; }); }, 15000);
    }, true);
  } });
})();
