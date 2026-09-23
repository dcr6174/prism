/* The palette engine used by the popup and the new tab: one box over actions, tabs, bookmarks, history,
   search aliases (2), calculator (93) and lakh/crore conversions (127). */
(function (g) {
  const U = PrismU;
  const score = (text, q) => {
    text = (text || '').toLowerCase(); if (!q) return 1;
    let s = 0; for (const w of q.split(/\s+/)) { const i = text.indexOf(w); if (i < 0) return 0; s += i === 0 ? 3 : text[i - 1] === ' ' ? 2 : 1; }
    return s;
  };
  const fav = (url) => chrome.runtime.getURL('/_favicon/?pageUrl=' + encodeURIComponent(url) + '&size=32');
  g.Palette = {
    async search(q, settings, ctx) {
      const out = []; const on = (id) => id === 'core' || settings.on[id];
      q = q.trim(); const lq = q.toLowerCase();
      // calculator / lakh
      if (on('calc') && /^[=\d(]/.test(q)) { const v = U.calc(q); if (v != null) out.push({ kind: 'calc', title: '= ' + (+v.toFixed(6)).toLocaleString('en-IN'), sub: on('lakh') && Math.abs(v) >= 1e5 ? U.indian(v) : 'Enter to copy', copy: String(+v.toFixed(6)) }); }
      else if (on('lakh') && /\d/.test(q) && /(lakh|lac|crore|cr|million|mn|billion)\b/i.test(q)) { const v = U.parseAmount(q); if (isFinite(v)) out.push({ kind: 'calc', title: U.indian(v), sub: 'Enter to copy', copy: U.indian(v) }); }
      // aliases
      if (on('aliases')) {
        const [first, ...rest] = q.split(' ');
        for (const [k, url] of U.pairs(settings.cfg.aliases.aliases)) if (k === first.toLowerCase() && rest.length) out.push({ kind: 'search', title: k + ': ' + rest.join(' '), sub: url.replace('%s', ''), url: url.replace('%s', encodeURIComponent(rest.join(' '))) });
      }
      if (!q) {
        return out.concat((g.PRISM_ACTIONS || []).filter(a => a.feature === 'core' || on(a.feature)).filter(a => !a.page || ctx.page).slice(0, 0));
      }
      // actions
      for (const a of g.PRISM_ACTIONS || []) {
        if (a.feature !== 'core' && !on(a.feature)) continue;
        if (a.page && !ctx.page) continue;
        const s = score(a.label + ' ' + a.feature, lq); if (s) out.push({ kind: 'action', title: a.label, sub: 'PRISM action', action: a, s: s + 2 });
      }
      if (on('findtab') || on('onebox') || on('palette')) {
        const tabs = await chrome.tabs.query({});
        for (const t of tabs) { const s = score(t.title + ' ' + t.url, lq); if (s) out.push({ kind: 'tab', title: t.title, sub: t.url, tab: t, icon: t.favIconUrl || fav(t.url), s: s + 1 }); }
      }
      if (on('onebox') || on('palette')) {
        const [bm, hist] = await Promise.all([chrome.bookmarks.search(q).catch(() => []), chrome.history.search({ text: q, maxResults: 12, startTime: Date.now() - 90 * 864e5 })]);
        for (const b of bm.filter(b => b.url).slice(0, 8)) out.push({ kind: 'bookmark', title: b.title || b.url, sub: b.url, url: b.url, icon: fav(b.url), s: score(b.title + ' ' + b.url, lq) });
        for (const h of hist) if (!out.some(o => o.url === h.url)) out.push({ kind: 'history', title: h.title || h.url, sub: h.url, url: h.url, icon: fav(h.url), s: score(h.title + ' ' + h.url, lq) * 0.8 });
      }
      const head = out.filter(o => o.kind === 'calc' || o.kind === 'search');
      const rest = out.filter(o => !head.includes(o)).sort((a, b) => b.s - a.s).slice(0, 14);
      const looksUrl = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q) || /^https?:\/\//.test(q);
      const tail = [{ kind: 'web', title: (looksUrl ? 'Open ' : 'Search Google for ') + q, url: looksUrl ? (/^https?:/.test(q) ? q : 'https://' + q) : 'https://www.google.com/search?q=' + encodeURIComponent(q) }];
      return head.concat(rest, tail);
    },
    async run(item, ctx, newTab) {
      if (item.kind === 'calc') { await navigator.clipboard.writeText(item.copy); return 'Copied'; }
      if (item.kind === 'tab') { await chrome.tabs.update(item.tab.id, { active: true }); await chrome.windows.update(item.tab.windowId, { focused: true }); return null; }
      if (item.url) { if (newTab) await chrome.tabs.create({ url: item.url }); else await chrome.tabs.update({ url: item.url }); return null; }
      if (item.action) { const r = await item.action.run(ctx); if (r && r.error) return r.error; return item.action.done ? item.action.done(r) : (typeof r === 'string' ? r : 'Done'); }
    },
    fav,
    /* wires an <input> + <ul> into a keyboard-driven palette */
    bind(input, list, settings, ctxFn, onDone) {
      let items = [], sel = 0, seq = 0;
      const draw = () => {
        list.innerHTML = '';
        items.forEach((it, i) => {
          const li = UI.h('li', { class: i === sel ? 'sel' : '', onmousedown: (e) => { e.preventDefault(); sel = i; go(e.ctrlKey || e.metaKey); } },
            it.icon ? UI.h('img', { src: it.icon, alt: '', onerror: (e) => e.target.style.visibility = 'hidden' }) : UI.h('span', { style: { width: '16px', textAlign: 'center', color: 'var(--ink3)' } }, it.kind === 'calc' ? '=' : it.kind === 'action' ? '◆' : '↗'),
            UI.h('div', { class: 'grow' }, UI.h('div', { class: 'tt' }, it.title), it.sub ? UI.h('div', { class: 'u' }, it.sub) : null),
            UI.h('span', { class: 'k' }, it.kind));
          list.append(li);
        });
        const s = list.children[sel]; if (s) s.scrollIntoView({ block: 'nearest' });
      };
      const go = async (bg) => { const it = items[sel]; if (!it) return; const ctx = await ctxFn(); const r = await Palette.run(it, ctx, bg || ctx.newTabDefault); onDone && onDone(r, it); };
      input.addEventListener('input', async () => { const my = ++seq; const r = await Palette.search(input.value, settings, await ctxFn()); if (my !== seq) return; items = r; sel = 0; draw(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); draw(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
        else if (e.key === 'Enter') { e.preventDefault(); go(e.ctrlKey || e.metaKey); }
        else if (e.key === 'Escape') { input.value = ''; items = []; draw(); }
      });
    },
  };
})(self);
