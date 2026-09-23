/* 157 Real publish date: reads JSON-LD, meta tags and <time> for published / modified dates. */
(() => { const P = window.__prism;
  const get = () => {
    let pub, mod;
    for (const j of P.jsonld()) for (const x of [].concat(j, j['@graph'] || [])) { if (!x) continue; pub = pub || x.datePublished; mod = mod || x.dateModified; }
    pub = pub || P.meta('article:published_time') || P.meta('og:published_time') || P.meta('date') || P.meta('publish-date') || P.meta('dc.date');
    mod = mod || P.meta('article:modified_time') || P.meta('og:updated_time') || P.meta('last-modified');
    if (!pub) { const t = document.querySelector('time[datetime]'); pub = t && t.getAttribute('datetime'); }
    const f = (s) => { const d = s && new Date(s); return d && !isNaN(d) ? d : null; };
    return { pub: f(pub), mod: f(mod) };
  };
  const ago = (d) => { const days = Math.round((Date.now() - d) / 864e5); return days < 1 ? 'today' : days < 60 ? days + ' days ago' : days < 730 ? Math.round(days / 30) + ' months ago' : Math.round(days / 365) + ' years ago'; };
  const label = () => { const { pub, mod } = get(); if (!pub && !mod) return null; return [pub && 'Published ' + pub.toDateString() + ' (' + ago(pub) + ')', mod && (!pub || mod - pub > 864e5) && 'Updated ' + mod.toDateString() + ' (' + ago(mod) + ')'].filter(Boolean).join(' · '); };
  P.def('pubdate', { run() {
    setTimeout(() => { if (!P.jsonld().length && !P.meta('article:published_time')) return; const l = label(); const { pub } = get(); if (!l || !pub || Date.now() - pub < 864e5 * 365) return; P.ui.toast('⏳ ' + l, 5000); }, 1500);
  }, actions: { show() { const l = label() || 'No publish date found on this page'; P.ui.toast(l, 6000); return l; } } });
})();
