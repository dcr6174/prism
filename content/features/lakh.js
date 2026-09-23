/* 127 Lakh / crore <-> million: select a number (e.g. "12,50,000", "1.2 crore", "3.5M") to see it both ways. */
(() => { const P = window.__prism;
  P.def('lakh', { run() {
    document.addEventListener('mouseup', () => setTimeout(() => {
      const s = String(getSelection()).trim(); if (!s || s.length > 30 || !/\d/.test(s) || !/(\d{1,2},\d{2},\d{3}|\d{5,}|lakh|lac|crore|\bcr\b|million|\bmn\b|\d\s?m\b|billion|\bbn\b)/i.test(s)) return;
      const v = P.U.parseAmount(s); if (!isFinite(v) || v < 1e4) return;
      const r = getSelection().getRangeAt(0).getBoundingClientRect();
      P.ui.tip(r.left, r.bottom + 6, '<b>' + P.esc(P.U.indian(v)) + '</b>', 4000);
    }, 10));
  } });
})();
