/* 98 Unfinished-videos list: remembers YouTube videos you left between 5% and 90%. See Tools > Unfinished videos. */
(() => { const P = window.__prism;
  P.def('ytunfinished', { sites: ['youtube.com'], run() {
    setInterval(() => {
      if (location.pathname !== '/watch') return;
      const v = document.querySelector('video.html5-main-video'); if (!v || !v.duration || v.duration < 120) return;
      const id = new URLSearchParams(location.search).get('v'); const pct = v.currentTime / v.duration;
      const title = (document.querySelector('h1.ytd-watch-metadata, h1.title') || {}).innerText || document.title.replace(/ - YouTube$/, '');
      PrismStore.update('ytUnfinished', {}, (m) => { if (pct > 0.9 || pct < 0.05) delete m[id]; else m[id] = { id, title, t: Math.floor(v.currentTime), dur: Math.floor(v.duration), at: Date.now() }; });
    }, 10000);
  } });
})();
