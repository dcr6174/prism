/* 91 Shortcut remap inside web pages (Chrome's own shortcuts like Ctrl+T cannot be changed by any extension).
   Rules: "ctrl+d = block", "alt+u = copyurl", "ctrl+shift+x = top". */
(() => { const P = window.__prism;
  const combo = (e) => [e.ctrlKey && 'ctrl', e.metaKey && 'meta', e.altKey && 'alt', e.shiftKey && 'shift', e.key.toLowerCase()].filter(Boolean).join('+');
  const ACT = { block: () => true, copyurl: () => { P.copy(location.href, 'URL copied'); return true; }, top: () => { scrollTo({ top: 0, behavior: 'smooth' }); return true; }, bottom: () => { scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); return true; }, back: () => { history.back(); return true; } };
  P.def('remap', { run() {
    const rules = Object.fromEntries(P.U.pairs(P.cfg('remap').rules).map(([k, v]) => [k.toLowerCase().replace(/\s/g, ''), v.toLowerCase()]));
    P.key((e) => { const r = rules[combo(e)]; if (r && ACT[r]) { if (r === 'block') P.ui.toast('Blocked ' + combo(e) + ' (PRISM remap)', 1200); return ACT[r](); } });
  } });
})();
