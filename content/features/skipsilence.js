/* 107 Skip silences (speeds up quiet parts via Web Audio) + Shift+I skips the intro. Off by default: can glitch on some sites. */
(() => { const P = window.__prism;
  P.def('skipsilence', { run() {
    P.key((e) => { if (e.shiftKey && e.key === 'I' && !P.typing(e)) { const v = P.vid && P.vid(); if (v) { v.currentTime += P.cfg('skipsilence').intro || 85; P.ui.toast('Skipped intro'); return true; } } });
    const hooked = new WeakSet();
    document.addEventListener('play', (e) => {
      const v = e.target; if (!(v instanceof HTMLVideoElement) || hooked.has(v)) return; hooked.add(v);
      try {
        const ctx = new AudioContext(); const src = ctx.createMediaElementSource(v); const an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an); an.connect(ctx.destination);
        const buf = new Float32Array(an.fftSize); let base = v.playbackRate, fast = false;
        setInterval(() => { if (v.paused) return; an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x; const rms = Math.sqrt(s / buf.length);
          if (rms < 0.01 && !fast) { base = v.playbackRate; v.playbackRate = Math.min(4, base * 2.5); fast = true; } else if (rms >= 0.01 && fast) { v.playbackRate = base; fast = false; } }, 120);
      } catch (err) { /* cross-origin media without CORS cannot be analysed */ }
    }, true);
  } });
})();
