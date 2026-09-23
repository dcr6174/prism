/* 106 Speed control on every HTML5 video: S slower, D faster, R reset, shows a small badge. 0.1x - 16x. */
(() => { const P = window.__prism;
  P.vid = P.vid || (() => { const vs = [...document.querySelectorAll('video')]; return vs.find(v => !v.paused) || vs.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]; });
  P.def('speed', { run() {
    const show = (v) => { const b = v.getBoundingClientRect(); P.ui.tip(Math.max(0, b.left + 10), Math.max(0, b.top + 10), '<b>' + v.playbackRate.toFixed(2).replace(/0$/, '') + 'x</b>', 900); };
    P.key((e) => {
      if (P.typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase(); if (!['s', 'd', 'r'].includes(k)) return;
      const v = P.vid(); if (!v) return;
      if (k === 's') v.playbackRate = Math.max(0.1, +(v.playbackRate - 0.1).toFixed(2));
      if (k === 'd') v.playbackRate = Math.min(16, +(v.playbackRate + 0.1).toFixed(2));
      if (k === 'r') v.playbackRate = 1;
      show(v); return true;
    });
  } });
})();
