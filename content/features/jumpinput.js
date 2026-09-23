/* 92 Jump to first input (I), scroll with J / K, G top, Shift+G bottom - only outside text boxes. */
(() => { const P = window.__prism;
  P.def('jumpinput', { run() {
    P.key((e) => {
      if (P.typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'i') { const el = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]), textarea, [contenteditable=true]')].find(x => { const b = x.getBoundingClientRect(); return b.width && b.height && getComputedStyle(x).visibility !== 'hidden'; }); if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); return true; } }
      if (e.key === 'j') { scrollBy({ top: 120, behavior: 'smooth' }); return true; }
      if (e.key === 'k') { scrollBy({ top: -120, behavior: 'smooth' }); return true; }
      if (e.key === 'G') { scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); return true; }
      if (e.key === 'g') { scrollTo({ top: 0, behavior: 'smooth' }); return true; }
    });
  } });
})();
