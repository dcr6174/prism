/* 72 Auto theater mode + remember playback speed per channel. */
(() => { const P = window.__prism;
  P.def('yttheater', { sites: ['youtube.com'], run() {
    let lastUrl = '';
    const onWatch = async () => {
      if (location.pathname !== '/watch' || location.href === lastUrl) return; lastUrl = location.href;
      const flexy = await P.yt.wait('ytd-watch-flexy'); if (flexy && !flexy.hasAttribute('theater')) { const b = document.querySelector('.ytp-size-button'); if (b) b.click(); }
      const v = await P.yt.wait('video.html5-main-video'); const ch = await P.yt.wait('ytd-channel-name a, #owner #channel-name a');
      const chan = ch ? ch.textContent.trim() : ''; if (!v || !chan) return;
      const speeds = await PrismStore.get('ytSpeed', {}); if (speeds[chan]) setTimeout(() => v.playbackRate = speeds[chan], 600);
      v.onratechange = () => PrismStore.update('ytSpeed', {}, (m) => { if (v.playbackRate === 1) delete m[chan]; else m[chan] = v.playbackRate; });
    };
    P.yt = P.yt || { wait: async (s) => { for (let i = 0; i < 30; i++) { const e = document.querySelector(s); if (e) return e; await new Promise(r => setTimeout(r, 150)); } } };
    document.addEventListener('yt-navigate-finish', onWatch); onWatch();
  } });
})();
