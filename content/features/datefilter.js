/* 105 Search-date filter: Past day / week / month / year chips on Google results. */
(() => { const P = window.__prism;
  P.def('datefilter', { sites: (P) => /^(www\.)?google\.[a-z.]+$/.test(location.hostname) && location.pathname === '/search', run() {
    if (document.getElementById('prism-df')) return;
    const bar = document.createElement('div'); bar.id = 'prism-df'; bar.style.cssText = 'display:flex;gap:6px;margin:8px 0 4px;font:13px Arial,sans-serif';
    const u = new URL(location.href); const cur = u.searchParams.get('tbs') || '';
    for (const [l, v] of [['Any time', ''], ['Past day', 'qdr:d'], ['Past week', 'qdr:w'], ['Past month', 'qdr:m'], ['Past year', 'qdr:y'], ['Past 2 years', 'qdr:y2']]) {
      const a = document.createElement('a'); const x = new URL(u); if (v) x.searchParams.set('tbs', v); else x.searchParams.delete('tbs'); a.href = x.toString(); a.textContent = l;
      a.style.cssText = 'padding:5px 11px;border-radius:999px;text-decoration:none;' + (cur === v ? 'background:#4F5BD5;color:#fff' : 'background:rgba(127,127,127,.14);color:inherit'); bar.append(a);
    }
    const host = document.querySelector('#appbar, #hdtb, #center_col, #rcnt'); if (host) (host.id === 'center_col' || host.id === 'rcnt' ? host.prepend(bar) : host.after(bar));
  } });
})();
