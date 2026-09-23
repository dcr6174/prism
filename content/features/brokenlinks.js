/* 61 Broken-link checker. Same-site links are checked directly; other sites need "All sites" access, else marked unknown. */
(() => { const P = window.__prism;
  P.def('brokenlinks', { actions: { async check() {
    const links = [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href.split('#')[0]).filter(u => /^https?:/.test(u)))].slice(0, 300);
    const p = P.ui.panel('Broken links', '<p class="m">Checking ' + links.length + ' links...</p><table></table>', { id: 'bl' });
    const res = []; let i = 0, done = 0;
    const worker = async () => { while (i < links.length) { const u = links[i++]; let st;
      try { if (new URL(u).origin !== location.origin) throw 0; const r = await fetch(u, { method: 'HEAD', redirect: 'follow', credentials: 'omit' }); st = r.status; if (st === 405 || st === 403) { const g = await fetch(u, { credentials: 'omit' }); st = g.status; } }
      catch (e) { try { await fetch(u, { mode: 'no-cors', credentials: 'omit' }); st = 'unknown'; } catch { st = 'failed'; } }
      res.push([u, st]); done++; p.querySelector('.m').textContent = done + ' / ' + links.length + ' checked'; } };
    await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
    const bad = res.filter(([, s]) => s === 'failed' || (typeof s === 'number' && s >= 400));
    const unk = res.filter(([, s]) => s === 'unknown').length;
    p.querySelector('.m').textContent = bad.length + ' broken, ' + (res.length - bad.length - unk) + ' OK, ' + unk + ' unknown (cross-site, blocked by CORS)';
    p.querySelector('table').innerHTML = bad.map(([u, s]) => '<tr><td>' + s + '</td><td><a href="' + P.esc(u) + '" target="_blank">' + P.esc(u) + '</a></td></tr>').join('') || '<tr><td>Nothing broken found.</td></tr>';
    document.querySelectorAll('a[href]').forEach(a => { if (bad.some(([u]) => u === a.href.split('#')[0])) a.style.outline = '2px solid #E0915F'; });
  } } });
})();
