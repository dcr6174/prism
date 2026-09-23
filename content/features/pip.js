/* 75 Picture-in-Picture for the biggest playing video on any page. */
(() => { const P = window.__prism;
  const go = async () => {
    if (document.pictureInPictureElement) { await document.exitPictureInPicture(); return 'PiP off'; }
    const v = [...document.querySelectorAll('video')].filter(v => v.readyState > 0).sort((a, b) => (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight))[0];
    if (!v) { P.ui.toast('No video found'); return; }
    v.removeAttribute('disablepictureinpicture'); await v.requestPictureInPicture(); return 'PiP on';
  };
  P.def('pip', { sites: ['youtube.com'], run() { P.key((e) => { if (e.altKey && e.key.toLowerCase() === 'p' && !e.shiftKey) { go(); return true; } }); }, actions: { toggle: go } });
})();
