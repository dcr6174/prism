/* 108 Timestamped video notes: Alt+N adds a note at the current time; notes show in a list you can click to jump. Export in Tools. */
(() => { const P = window.__prism;
  const key = () => location.hostname + location.pathname + (new URLSearchParams(location.search).get('v') || '');
  const fmt = (s) => { s = Math.floor(s); return (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + String(Math.floor(s % 3600 / 60)).padStart(s >= 3600 ? 2 : 1, '0') + ':' + String(s % 60).padStart(2, '0'); };
  P.def('vidnotes', { run() {
    const list = async () => {
      const v = P.vid && P.vid(); const all = await PrismStore.get('vidnotes', {}); const it = all[key()]; if (!it || !it.notes.length) return;
      const p = P.ui.panel('Video notes', it.notes.map((n, i) => '<div data-i="' + i + '" style="cursor:pointer;padding:5px 0;border-bottom:1px solid rgba(127,127,127,.2)"><b>' + fmt(n.t) + '</b> ' + P.esc(n.text) + '</div>').join(''), { id: 'vn', left: true, bottom: true });
      p.onclick = (e) => { const d = e.target.closest('[data-i]'); if (d && v) v.currentTime = it.notes[+d.dataset.i].t; };
    };
    P.key((e) => {
      if (!e.altKey || e.ctrlKey || !P.vid) return;
      if (e.key.toLowerCase() === 'n') { const v = P.vid(); if (!v) return; const t = v.currentTime; v.pause(); const text = prompt('Note at ' + fmt(t)); v.play(); if (!text) return true;
        PrismStore.update('vidnotes', {}, (all) => { const it = all[key()] = all[key()] || { title: document.title, url: location.href, notes: [] }; it.notes.push({ t, text }); it.notes.sort((a, b) => a.t - b.t); }).then(list); return true; }
      if (e.key.toLowerCase() === 'l') { list(); return true; }
    });
  } });
})();
