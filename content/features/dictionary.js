/* 113 Double-click dictionary: Alt + double-click a word (free dictionaryapi.dev, no key). */
(() => { const P = window.__prism;
  P.def('dictionary', { run() {
    document.addEventListener('dblclick', async (e) => {
      if (!e.altKey) return;
      const w = String(getSelection()).trim(); if (!/^[a-zA-Z'-]{2,40}$/.test(w)) return;
      const t = P.ui.tip(e.clientX + 8, e.clientY + 14, '<b>' + P.esc(w) + '</b> <span class="m">looking up...</span>');
      const r = await P.send({ type: 'dict:lookup', word: w });
      t.innerHTML = r && !r.error ? '<b>' + P.esc(r.word) + '</b> <span class="m">' + P.esc(r.phonetic) + '</span>' + r.meanings.map(m => '<div style="margin-top:6px"><span class="m">' + P.esc(m.pos) + '</span><br>' + m.defs.map(d => '• ' + P.esc(d)).join('<br>') + '</div>').join('') : '<b>' + P.esc(w) + '</b> <span class="m">no meaning found</span>';
      const off = () => { t.remove(); removeEventListener('mousedown', off, true); }; setTimeout(() => addEventListener('mousedown', off, true), 50);
    });
  } });
})();
