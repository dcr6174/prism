/* Data tools: tabs, reading, clipboard, QA, jobs, shopping, downloads, privacy, time. */
(function () {
  const { h, toast, copy, send, download } = UI; const { sec, card, empty, fmtDate, fav } = T;
  const S = PrismStore;
  const link = (url, title) => h('a', { href: url, target: '_blank', rel: 'noopener' }, title || url);
  const liItem = (url, title, meta, ...btns) => h('li', {}, fav(url), h('div', { class: 'li-main' }, h('div', { class: 'ell' }, link(url, title)), h('div', { class: 'muted' }, meta || url)), ...btns);
  const btn = (label, fn, cls) => h('button', { class: 'btn small ' + (cls || ''), onclick: fn }, label);
  const rerender = () => T.render();

  /* ---------------- Tabs ---------------- */
  sec('collapse', { group: 'Tabs', title: 'Collapsed tabs', sub: 'Tabs you collapsed into lists. Restore one, a list, or delete.', feature: 'collapse', async render(b) {
    const l = await S.get('collapsed', []); if (!l.length) return b.append(empty('Nothing collapsed yet. Press Alt+K, "Collapse all tabs".'));
    for (const it of l) b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, it.label + ' · ' + it.tabs.length + ' tabs'),
      btn('Restore all', async () => { await send({ type: 'collapse:restore', id: it.id }); rerender(); }, 'primary'),
      btn('Delete', async () => { await S.update('collapsed', [], x => x.filter(y => y.id !== it.id)); rerender(); }, 'danger')),
      h('ul', { class: 'list' }, it.tabs.map((t, i) => liItem(t.url, t.title, null, btn('Open', async () => { await send({ type: 'collapse:restore', id: it.id, idx: i }); rerender(); }))))));
  } });
  sec('sessions', { group: 'Tabs', title: 'Sessions', sub: 'Saved windows. Restore opens a new window.', feature: 'sessions', async render(b) {
    const name = h('input', { placeholder: 'Name for this window, e.g. "Job hunt"' });
    b.append(card(h('div', { class: 'row' }, name, btn('Save current window', async () => { await send({ type: 'sessions:save', name: name.value }); toast('Saved'); rerender(); }, 'primary'))));
    const l = await S.get('sessions', []); if (!l.length) return b.append(empty('No sessions saved.'));
    b.append(card(h('ul', { class: 'list' }, l.map(s => h('li', {}, h('div', { class: 'li-main' }, h('b', {}, s.name), h('div', { class: 'muted' }, s.tabs.length + ' tabs · ' + fmtDate(s.t))),
      btn('Restore', () => send({ type: 'sessions:restore', id: s.id }), 'primary'), btn('Delete', async () => { await send({ type: 'sessions:delete', id: s.id }); rerender(); }, 'danger'))))));
  } });
  sec('snoozed', { group: 'Tabs', title: 'Snoozed tabs', sub: 'They reopen by themselves at the set time (Chrome must be open).', feature: 'snooze', async render(b) {
    const l = (await S.get('snoozed', [])).sort((x, y) => x.wake - y.wake); if (!l.length) return b.append(empty('No snoozed tabs.'));
    b.append(card(h('ul', { class: 'list' }, l.map(s => liItem(s.url, s.title, 'Wakes ' + fmtDate(s.wake), btn('Open now', async () => { chrome.tabs.create({ url: s.url }); await S.update('snoozed', [], x => x.filter(y => y.id !== s.id)); rerender(); }), btn('Remove', async () => { await S.update('snoozed', [], x => x.filter(y => y.id !== s.id)); rerender(); }, 'danger'))))));
  } });
  sec('unfinished', { group: 'Tabs', title: 'Unfinished videos', sub: 'YouTube videos you left between 5% and 90% watched.', feature: 'ytunfinished', async render(b) {
    const m = await S.get('ytUnfinished', {}); const l = Object.values(m).sort((x, y) => y.at - x.at); if (!l.length) return b.append(empty('Nothing here yet. Needs YouTube allowed in Site access.'));
    b.append(card(h('ul', { class: 'list' }, l.map(v => { const u = 'https://www.youtube.com/watch?v=' + v.id + '&t=' + v.t + 's'; return liItem(u, v.title, Math.round(v.t / v.dur * 100) + '% watched · ' + UI.ago(v.at), btn('Done', async () => { await S.update('ytUnfinished', {}, x => { delete x[v.id]; }); rerender(); })); }))));
  } });

  /* ---------------- Focus / time ---------------- */
  const day = (d) => { const x = new Date(Date.now() - d * 864e5); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const dur = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  sec('timedash', { group: 'Focus', title: 'Time dashboard', sub: 'Active time per site. Only counts while the tab is focused and you are not idle.', feature: 'timedash', async render(b) {
    const sel = h('select', { style: 'width:auto' }, [0, 1, 2, 3, 4, 5, 6].map(d => h('option', { value: d }, d === 0 ? 'Today' : d === 1 ? 'Yesterday' : day(d))), h('option', { value: 'w' }, 'Last 7 days'));
    const out = h('div'); b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, 'Where the time went'), sel), h('div', { class: 'gap' }), out));
    const draw = async () => {
      const days = sel.value === 'w' ? [0, 1, 2, 3, 4, 5, 6] : [+sel.value]; const tot = {};
      for (const d of days) { const t = await S.get('time:' + day(d), {}); for (const k in t) tot[k] = (tot[k] || 0) + t[k]; }
      const l = Object.entries(tot).sort((x, y) => y[1] - x[1]).slice(0, 25); const max = l.length ? l[0][1] : 1; const sum = l.reduce((a, x) => a + x[1], 0);
      out.innerHTML = ''; if (!l.length) { out.append(empty('No time recorded for this range.')); return; }
      out.append(h('p', { class: 'muted' }, 'Total ' + dur(sum)));
      out.append(h('ul', { class: 'list' }, l.map(([host, ms]) => h('li', {}, fav('https://' + host), h('div', { class: 'li-main' }, h('div', { class: 'row' }, h('span', { class: 'grow' }, host), h('b', {}, dur(ms))), h('div', { class: 'bar', style: { width: Math.max(2, ms / max * 100) + '%' } }))))));
    };
    sel.onchange = draw; draw();
    const log = await S.get('intentLog', []); if (log.length) b.append(card(h('h3', {}, 'Recent reasons you gave'), h('ul', { class: 'list' }, log.slice(0, 20).map(x => h('li', {}, h('b', {}, x.host), h('span', { class: 'grow muted' }, x.reason), h('span', { class: 'muted small' }, UI.ago(x.t)))))));
  } });

  /* ---------------- AI / writing ---------------- */
  sec('prompts', { group: 'Writing', title: 'Prompt library', sub: 'Used by "Send to AI". {{text}} is your selection, {{url}} and {{title}} the page.', feature: 'prompts', async render(b) {
    let l = await send({ type: 'prompts:get' }) || [];
    const box = h('div'); b.append(box, h('div', { class: 'row' }, btn('Add prompt', () => { l.push({ id: PrismU.uid(), name: 'New prompt', text: '{{text}}' }); draw(); }), btn('Save', async () => { await send({ type: 'prompts:save', prompts: l }); toast('Saved. Right-click menu updated.'); }, 'primary')));
    const draw = () => { box.innerHTML = ''; l.forEach((p, i) => box.append(card(h('div', { class: 'row' }, h('input', { value: p.name, oninput: e => p.name = e.target.value }), btn('Delete', () => { l.splice(i, 1); draw(); }, 'danger')), h('div', { class: 'gap' }), h('textarea', { rows: 3, oninput: e => p.text = e.target.value }, p.text)))); };
    draw();
  } });
  const listEditor = (key, def, fields, emptyText) => async (b) => {
    let l = await S.get(key, def); const box = h('div');
    const save = async () => { await S.set(key, l); toast('Saved'); };
    const draw = () => { box.innerHTML = ''; if (!l.length) box.append(empty(emptyText)); l.forEach((it, i) => box.append(card(h('div', { class: 'row' }, h('input', { value: it.name || '', placeholder: 'Name', oninput: e => it.name = e.target.value }), btn('Copy', () => copy(it.text)), btn('Delete', () => { l.splice(i, 1); draw(); save(); }, 'danger')), h('div', { class: 'gap' }), h('textarea', { rows: 4, oninput: e => it.text = e.target.value }, it.text || '')))); };
    b.append(h('div', { class: 'row' }, btn('Add', () => { l.unshift({ name: '', text: '' }); draw(); }), btn('Save', save, 'primary')), h('div', { class: 'gap' }), box); draw();
  };
  const REPLIES = [
    { name: 'Recruiter: interested', text: 'Hi, thanks for reaching out. I am interested in this role. Could you share the job description, the team, the location/work mode and the budget? My notice period is [X] days.' },
    { name: 'Recruiter: not now', text: 'Hi, thank you for thinking of me. I am not exploring this right now, but I would be happy to stay in touch for future roles.' },
    { name: 'Recruiter: ask CTC range', text: 'Thanks for the details. Before we go ahead, could you share the CTC range for this role? That helps us both avoid wasting time.' },
    { name: 'Follow-up after interview', text: 'Hi, thank you for the interview on [date]. I enjoyed learning about the team. Is there any update on the next steps?' },
  ];
  sec('replies', { group: 'Writing', title: 'Saved replies', sub: 'Also used by Gmail templates. Recruiter replies are included to start.', feature: 'replies', render: listEditor('replies', REPLIES, null, 'No replies yet.') });
  sec('cleantext', { group: 'Writing', title: 'Clean text', sub: 'Paste text copied from a PDF. Fixes broken lines and hyphens.', feature: 'cleanpdf', async render(b) {
    const i = h('textarea', { rows: 10, placeholder: 'Paste here' }); const o = h('pre', { class: 'out' });
    i.oninput = async () => { o.textContent = await send({ type: 'text:clean', text: i.value }) || ''; };
    b.append(card(i, h('div', { class: 'gap' }), o, h('div', { class: 'row' }, btn('Copy clean text', () => copy(o.textContent), 'primary'))));
  } });

  /* ---------------- Reading ---------------- */
  sec('readlist', { group: 'Reading', title: 'Reading list', sub: 'Pages saved with an offline text copy. Search and mark what you have read.', feature: 'readlist', async render(b, q) {
    const l = await S.get('readlist', []); const id = q.get('id');
    if (id) { const it = l.find(x => x.id === id); if (!it) return b.append(empty('Not found')); b.append(h('p', {}, link(it.url, 'Open original'), ' · ', h('a', { href: '#readlist' }, 'Back')), card(h('h2', {}, it.title), h('div', { class: 'gap' }), h('div', { style: 'white-space:pre-wrap;line-height:1.7;font-size:16px' }, it.text))); return; }
    if (!l.length) return b.append(empty('Nothing saved. Alt+K, "Save to reading list".'));
    const search = h('input', { type:'search', placeholder:'Search saved pages', 'aria-label':'Search reading list' });
    const status = h('select', { 'aria-label':'Reading status' }, h('option',{value:'all'},'All pages'),h('option',{value:'unread'},'Unread'),h('option',{value:'read'},'Read'));
    const list = h('ul', { class:'list' });
    const draw = () => {
      const term = search.value.toLowerCase().trim();
      const shown = l.filter(it => (status.value === 'all' || (status.value === 'read') === !!it.read) && (!term || (it.title + ' ' + it.url + ' ' + (it.text || '')).toLowerCase().includes(term)));
      list.replaceChildren(...shown.map(it => liItem(it.url, it.title, (it.read ? 'Read · ' : '') + UI.ago(it.t) + ' · ' + Math.max(1,Math.round((it.text || '').split(/\s+/).length / 220)) + ' min', h('a', { class:'btn small', href:'#readlist?id=' + encodeURIComponent(it.id) }, 'Offline copy'),
        btn(it.read ? 'Unread' : 'Mark read', async () => { await S.update('readlist', [], x => { const y=x.find(z=>z.id===it.id); if(y)y.read=!y.read; }); rerender(); }), btn('Delete', async () => { await S.update('readlist', [], x => x.filter(y=>y.id!==it.id)); rerender(); }, 'danger'))));
      if (!shown.length) list.append(h('li', {class:'muted'}, 'No pages match.'));
    };
    search.oninput=draw; status.onchange=draw;
    b.append(card(h('div',{class:'row wrap'},search,status),h('div',{class:'gap'}),list)); draw();
  } });
  sec('highlights', { group: 'Reading', title: 'Highlights', sub: 'Everything you highlighted, by page. Export as Markdown or make flashcards.', feature: 'highlights', async render(b) {
    const all = await S.get('highlights', {}); const pages = Object.entries(all).filter(([, p]) => p.items && p.items.length);
    if (!pages.length) return b.append(empty('No highlights yet. Select text on an allowed site and press H.'));
    const md = pages.map(([u, p]) => '## [' + p.title + '](' + u + ')\n' + p.items.map(i => '> ' + i.text + (i.note ? '\n\n' + i.note : '')).join('\n\n')).join('\n\n');
    b.append(h('div', { class: 'row' }, btn('Copy all as Markdown', () => copy(md)), btn('Download .md', () => download(new Blob([md], { type: 'text/markdown' }), 'highlights.md')), btn('Make flashcards from all', async () => { let n = 0; await S.update('flash', [], f => { for (const [, p] of pages) for (const i of p.items) if (!f.some(c => c.hid === i.id)) { f.push({ id: PrismU.uid(), hid: i.id, front: i.text.length > 140 ? i.text.slice(0, 140) + '…' : i.text, back: (i.note || '') + '\n— ' + p.title, due: Date.now(), interval: 0 }); n++; } }); toast(n + ' cards added'); }, 'primary')), h('div', { class: 'gap' }));
    for (const [u, p] of pages) b.append(card(h('h3', {}, link(u, p.title)), h('ul', { class: 'list' }, p.items.map(i => h('li', {}, h('div', { class: 'li-main' }, h('div', {}, i.text), i.note ? h('div', { class: 'muted' }, i.note) : null), btn('Delete', async () => { await S.update('highlights', {}, a => { a[u].items = a[u].items.filter(x => x.id !== i.id); }); rerender(); }, 'danger'))))));
  } });
  sec('flashcards', { group: 'Reading', title: 'Flashcards', sub: 'Due cards show on the new tab. Add your own or make them from highlights.', feature: 'flashcards', async render(b) {
    let l = await S.get('flash', []); const f = h('input', { placeholder: 'Front (question)' }), bk = h('input', { placeholder: 'Back (answer)' });
    b.append(card(h('div', { class: 'row' }, f, bk, btn('Add', async () => { if (!f.value) return; await S.update('flash', [], x => { x.push({ id: PrismU.uid(), front: f.value, back: bk.value, due: Date.now(), interval: 0 }); }); rerender(); }, 'primary'))));
    if (!l.length) return b.append(empty('No cards yet.'));
    const due = l.filter(c => (c.due || 0) <= Date.now()).length;
    b.append(card(h('p', { class: 'muted' }, l.length + ' cards · ' + due + ' due now'), h('ul', { class: 'list' }, l.map(c => h('li', {}, h('div', { class: 'li-main' }, h('div', {}, c.front), h('div', { class: 'muted' }, (c.back || '').trim() + ' · due ' + (c.due <= Date.now() ? 'now' : fmtDate(c.due)))), btn('Delete', async () => { await S.update('flash', [], x => x.filter(y => y.id !== c.id)); rerender(); }, 'danger'))))));
  } });
  const fmtT = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  sec('vidnotes', { group: 'Reading', title: 'Video notes', sub: 'Notes you took with Alt+N on videos. Click a time to jump there.', feature: 'vidnotes', async render(b) {
    const all = await S.get('vidnotes', {}); const l = Object.entries(all).filter(([, v]) => v.notes && v.notes.length);
    if (!l.length) return b.append(empty('No video notes yet.'));
    const md = l.map(([, v]) => '## ' + v.title + '\n' + v.notes.map(n => '- [' + fmtT(n.t) + '] ' + n.text).join('\n')).join('\n\n');
    b.append(h('div', { class: 'row' }, btn('Copy all as Markdown', () => copy(md))), h('div', { class: 'gap' }));
    for (const [k, v] of l) { const u = new URL(v.url); b.append(card(h('h3', {}, link(v.url, v.title)), h('ul', { class: 'list' }, v.notes.map(n => { u.searchParams.set('t', Math.floor(n.t) + 's'); return h('li', {}, h('a', { class: 'pill', href: u.href, target: '_blank' }, fmtT(n.t)), h('span', { class: 'grow' }, n.text)); })), h('div', { class: 'row' }, btn('Delete notes', async () => { await S.update('vidnotes', {}, a => { delete a[k]; }); rerender(); }, 'danger')))); }
  } });

  /* ---------------- Clipboard ---------------- */
  sec('clipboard', { group: 'Writing', title: 'Clipboard history', sub: 'Text you copied on allowed sites. Stored only on this computer. Password fields are never recorded.', feature: 'cliphist', async render(b) {
    const q = h('input', { type: 'search', placeholder: 'Search copies' }); const ul = h('ul', { class: 'list' });
    b.append(card(h('div', { class: 'row' }, q, btn('Clear unpinned', async () => { if (confirm('Clear all unpinned items?')) { await S.update('clipboard', [], l => l.filter(x => x.pin)); draw(); } }, 'danger')), h('div', { class: 'gap' }), ul));
    const draw = async () => { const l = await S.get('clipboard', []); const f = q.value.toLowerCase(); ul.innerHTML = ''; const m = l.filter(x => !f || x.text.toLowerCase().includes(f)); if (!m.length) ul.append(h('li', { class: 'muted' }, 'Nothing yet.'));
      m.slice(0, 300).forEach(x => ul.append(h('li', {}, h('div', { class: 'li-main' }, h('div', { class: 'ell' }, x.text), h('div', { class: 'muted' }, UI.ago(x.t) + ' · ' + (x.url ? new URL(x.url).hostname : ''))), btn(x.pin ? 'Unpin' : 'Pin', async () => { await S.update('clipboard', [], l => { const y = l.find(z => z.t === x.t && z.text === x.text); if (y) y.pin = !y.pin; }); draw(); }), btn('Copy', () => copy(x.text), 'primary')))); };
    q.oninput = draw; draw();
  } });

  /* ---------------- QA ---------------- */
  sec('testdata', { group: 'QA', title: 'Test data and form profiles', sub: 'Right-click any field for these strings. Profiles are used by "Fill form with fake data".', feature: 'testdata', async render(b) {
    const td = await send({ type: 'testdata:get' }) || {};
    b.append(card(h('h3', {}, 'Test strings'), h('ul', { class: 'list' }, Object.entries(td).map(([k, v]) => h('li', {}, h('div', { class: 'li-main' }, h('b', {}, k), h('div', { class: 'muted' }, v.slice(0, 120))), btn('Copy', () => copy(v)))))));
    let profs = await S.get('formProfiles', []); const box = h('div');
    const FIELDS = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'pincode', 'company', 'password'];
    const draw = () => { box.innerHTML = ''; profs.forEach((p, i) => box.append(h('div', { class: 'card' }, h('div', { class: 'row' }, h('input', { value: p.name, oninput: e => p.name = e.target.value }), h('span', { class: 'muted small' }, i === 0 ? 'Used first' : ''), btn('Delete', () => { profs.splice(i, 1); draw(); }, 'danger')), h('div', { class: 'grid', style: 'margin-top:10px' }, FIELDS.map(f => h('input', { placeholder: f, value: p.data[f] || '', oninput: e => p.data[f] = e.target.value })))))); };
    b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, 'Form profiles'), btn('Add profile', () => { profs.push({ name: 'Profile ' + (profs.length + 1), data: {} }); draw(); }), btn('Save', async () => { await S.set('formProfiles', profs); toast('Saved'); }, 'primary')), h('p', { class: 'muted small' }, 'Empty fields get random fake values.'), box)); draw();
  } });
  sec('json', { group: 'QA', title: 'JSON tool', sub: 'Paste JSON to format, validate, minify or query a path like data.items[0].id', feature: 'jsonview', async render(b) {
    const i = h('textarea', { rows: 10, placeholder: '{"paste": "json"}' }), path = h('input', { placeholder: 'Path (optional), e.g. data.items[0]' }), o = h('pre', { class: 'out' });
    const run = (min) => { try { let v = JSON.parse(i.value); if (path.value) for (const k of path.value.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)) v = v == null ? undefined : v[k]; o.textContent = JSON.stringify(v, null, min ? 0 : 2); o.style.color = ''; } catch (e) { o.textContent = e.message; o.style.color = 'var(--warn)'; } };
    b.append(card(i, h('div', { class: 'gap' }), h('div', { class: 'row' }, path, btn('Format', () => run(false), 'primary'), btn('Minify', () => run(true)), btn('Copy', () => copy(o.textContent))), h('div', { class: 'gap' }), o));
  } });
  sec('storage', { group: 'QA', title: 'Cookies and localStorage', sub: 'For the site you were last on. Needs that site allowed in Site access.', feature: 'storageview', async render(b, q) {
    const tab = await T.lastWebTab(); const url = q.get('url') || (tab && tab.url); if (!url) return b.append(empty('Open a website first.'));
    const u = new URL(url); const ok = await chrome.permissions.contains({ origins: [u.origin + '/*'] });
    b.append(h('p', {}, 'Site: ', h('b', {}, u.hostname)));
    if (!ok) { b.append(card(h('p', {}, 'PRISM needs access to ' + u.hostname + ' to read its cookies.'), btn('Allow ' + u.hostname, async () => { if (await chrome.permissions.request({ origins: [u.origin + '/*'] })) rerender(); }, 'primary'))); return; }
    const cookies = await chrome.cookies.getAll({ url });
    const cl = h('ul', { class: 'list' }, cookies.map(c => { const v = h('input', { value: c.value }); return h('li', {}, h('div', { class: 'li-main' }, h('b', {}, c.name), h('div', { class: 'muted' }, c.domain + ' · ' + (c.httpOnly ? 'HttpOnly · ' : '') + (c.secure ? 'Secure · ' : '') + (c.expirationDate ? 'expires ' + fmtDate(c.expirationDate * 1000) : 'session'))), v,
      btn('Save', async () => { await chrome.cookies.set({ url, name: c.name, value: v.value, domain: c.hostOnly ? undefined : c.domain, path: c.path, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, expirationDate: c.expirationDate }); toast('Cookie saved'); }), btn('Delete', async () => { await chrome.cookies.remove({ url, name: c.name }); rerender(); }, 'danger')); }));
    b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, cookies.length + ' cookies'), btn('Copy as JSON', () => copy(JSON.stringify(cookies, null, 2)))), cl));
    const ls = h('div'); b.append(card(h('h3', {}, 'localStorage'), ls));
    if (!tab || new URL(tab.url).origin !== u.origin) { ls.append(h('p', { class: 'muted' }, 'Keep a tab of this site open to edit localStorage.')); return; }
    const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => Object.entries(localStorage) });
    const rows = r.result || []; if (!rows.length) ls.append(h('p', { class: 'muted' }, 'Empty.'));
    ls.append(h('ul', { class: 'list' }, rows.map(([k, v]) => { const t = h('textarea', { rows: 2 }, v); return h('li', {}, h('div', { class: 'li-main' }, h('b', {}, k), t), btn('Save', async () => { await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (k, v) => localStorage.setItem(k, v), args: [k, t.value] }); toast('Saved'); }), btn('Delete', async () => { await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (k) => localStorage.removeItem(k), args: [k] }); rerender(); }, 'danger')); })));
  } });

  /* ---------------- Jobs ---------------- */
  const STAGES = [['saved', 'Saved'], ['applied', 'Applied'], ['interview', 'Interview'], ['offer', 'Offer'], ['rejected', 'Closed']];
  sec('jobs', { group: 'Career', title: 'Job tracker', sub: 'Save a job page with Alt+K, "Save job". Move it along here. Deadlines show on the new tab.', feature: 'jobtracker', async render(b) {
    const l = await S.get('jobs', []);
    const csv = () => ['role,company,location,status,deadline,followUp,saved,url,notes'].concat(l.map(j => [j.role, j.company, j.location, j.status, j.deadline, j.followUp, new Date(j.saved || Date.now()).toISOString().slice(0, 10), j.url, j.notes].map(x => '"' + String(x || '').replace(/"/g, '""') + '"').join(','))).join('\n');
    b.append(h('div', { class: 'row' }, h('span', { class: 'muted grow' }, l.length + ' jobs'), btn('Export CSV', () => download(new Blob([csv()], { type: 'text/csv' }), 'jobs.csv'))), h('div', { class: 'gap' }));
    const upd = async (id, f) => { await S.update('jobs', [], x => { const j = x.find(y => y.id === id); if (j) f(j); }); rerender(); };
    b.append(h('div', { class: 'grid' }, STAGES.map(([k, name]) => { const js = l.filter(j => (j.status || 'saved') === k); return h('div', { class: 'col' }, h('h3', {}, name, h('span', { class: 'muted' }, js.length)),
      js.map(j => h('div', { class: 'jcard' }, h('a', { href: j.url, target: '_blank' }, j.role || 'Role'), h('div', { class: 'muted' }, [j.company, j.location].filter(Boolean).join(' · ')), j.deadline ? h('div', { class: 'pill' }, 'Apply by ' + j.deadline) : null,
        h('label', { class:'small muted', style:'display:block;margin-top:8px' }, 'Follow up', h('input', { type:'date', value:j.followUp || '', 'aria-label':'Follow-up date for ' + (j.role || 'job'), onchange:e=>upd(j.id, x=>x.followUp=e.target.value) })),
        h('textarea', { rows: 2, placeholder: 'Notes', style: 'margin-top:6px;min-height:40px', onchange: e => upd(j.id, x => x.notes = e.target.value) }, j.notes || ''),
        h('div', { class: 'row', style: 'margin-top:6px' }, h('select', { onchange: e => upd(j.id, x => x.status = e.target.value) }, STAGES.map(([v, n]) => h('option', { value: v, selected: v === k }, n))), btn('×', async () => { if (confirm('Delete this job?')) { await S.update('jobs', [], x => x.filter(y => y.id !== j.id)); rerender(); } }, 'ghost'))))); })));
  } });

  /* ---------------- Shopping ---------------- */
  const spark = (hist) => { if (!hist || hist.length < 2) return h('span', { class: 'muted small' }, 'one price so far'); const W = 180, H = 36; const ys = hist.map(x => x[1]); const mn = Math.min(...ys), mx = Math.max(...ys) || 1; const t0 = hist[0][0], t1 = hist[hist.length - 1][0] || t0 + 1;
    const pts = hist.map(([t, y]) => ((t - t0) / (t1 - t0 || 1) * W).toFixed(1) + ',' + (H - 4 - (mx === mn ? 0.5 : (y - mn) / (mx - mn)) * (H - 8)).toFixed(1)).join(' ');
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('width', W); s.setAttribute('height', H); s.innerHTML = '<polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" points="' + pts + '"/>'; s.style.color = 'var(--accent)'; return s; };
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  sec('prices', { group: 'Shopping', title: 'Prices', sub: 'Price history from pages you visited, and products you watch for drops.', feature: 'pricelog', async render(b) {
    const w = await S.get('pricewatch', []);
    b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, 'Watching (' + w.length + ')'), btn('Check now', async () => { toast('Checking…'); await send({ type: 'pricewatch:check' }); rerender(); })), w.length ? h('ul', { class: 'list' }, w.map(x => { const ys = (x.history || []).map(y => y[1]); return liItem(x.url, x.title, (x.price ? 'Now ' + inr(x.price) : 'No price read yet') + (ys.length ? ' · low ' + inr(Math.min(...ys)) : '') + ' · checked ' + UI.ago(x.last), spark(x.history), btn('Stop', async () => { await S.update('pricewatch', [], l => l.filter(y => y.url !== x.url)); rerender(); }, 'danger')); })) : h('p', { class: 'muted' }, 'Open a product, then Alt+K, "Watch price".')));
    const m = await S.get('prices', {}); const l = Object.values(m).sort((a, c) => c.hist[c.hist.length - 1][0] - a.hist[a.hist.length - 1][0]);
    b.append(card(h('h3', {}, 'Price history (' + l.length + ')'), l.length ? h('ul', { class: 'list' }, l.slice(0, 100).map(x => { const ys = x.hist.map(y => y[1]); const now = ys[ys.length - 1]; return liItem(x.url, x.title, x.site + ' · now ' + inr(now) + ' · low ' + inr(Math.min(...ys)) + ' · high ' + inr(Math.max(...ys)), spark(x.hist)); })) : h('p', { class: 'muted' }, 'Visit product pages on Amazon, Flipkart or Myntra with those sites allowed.')));
  } });

  /* ---------------- Downloads ---------------- */
  sec('downloads', { group: 'Files', title: 'Downloads', sub: 'Search, open, show in folder, or download again.', feature: 'dlpanel', async render(b) {
    const q = h('input', { type: 'search', placeholder: 'Search file names' }); const ul = h('ul', { class: 'list' });
    b.append(card(q, h('div', { class: 'gap' }), ul));
    const draw = async () => { const l = await chrome.downloads.search({ query: q.value ? [q.value] : [], orderBy: ['-startTime'], limit: 150 }); ul.innerHTML = ''; if (!l.length) ul.append(h('li', { class: 'muted' }, 'No downloads found.'));
      for (const d of l) { const name = (d.filename || d.url).split(/[\\/]/).pop(); ul.append(h('li', {}, h('div', { class: 'li-main' }, h('div', { class: 'ell' }, name), h('div', { class: 'muted' }, T.kb(d.fileSize || d.totalBytes || 0) + ' · ' + fmtDate(d.startTime) + (d.exists === false ? ' · file deleted' : '') + (d.state !== 'complete' ? ' · ' + d.state : ''))),
        d.exists !== false && d.state === 'complete' ? btn('Open', () => chrome.downloads.open(d.id)) : null, d.exists !== false ? btn('Folder', () => chrome.downloads.show(d.id)) : null, btn('Again', () => chrome.downloads.download({ url: d.url })))); } };
    q.oninput = draw; draw();
  } });
  sec('batch', { group: 'Files', title: 'Batch download', sub: 'Files found on the page you collected from. Filter, tick, download.', feature: 'batchdl', async render(b) {
    const bt = await S.get('batch', null); if (!bt || !bt.items.length) return b.append(empty('Open a page, then Alt+K, "Collect images and PDFs".'));
    const kind = h('select', { style: 'width:auto' }, ['all', 'image', 'pdf', 'file'].map(k => h('option', { value: k }, k))), minw = h('input', { type: 'number', placeholder: 'Min width px', style: 'width:130px' }), ul = h('ul', { class: 'list' });
    const vis = () => bt.items.filter(i => (kind.value === 'all' || i.kind === kind.value) && (!minw.value || !i.w || i.w >= +minw.value));
    const draw = () => { ul.innerHTML = ''; vis().forEach(i => ul.append(h('li', {}, h('input', { type: 'checkbox', checked: true, 'data-u': i.url, style: 'width:auto' }), i.kind === 'image' ? h('img', { src: i.url, style: 'width:48px;height:48px;object-fit:cover;border-radius:6px' }) : h('span', { class: 'pill' }, i.kind), h('div', { class: 'li-main' }, h('div', { class: 'ell' }, i.url.split('/').pop().split('?')[0] || i.url), h('div', { class: 'muted' }, i.w ? i.w + '×' + i.h : ''))))); };
    kind.onchange = draw; minw.oninput = draw;
    b.append(card(h('p', {}, 'From ', link(bt.from, bt.title)), h('div', { class: 'row' }, kind, minw, btn('Download ticked', async () => { const us = [...ul.querySelectorAll('input:checked')].map(x => x.dataset.u); for (const u of us) { await chrome.downloads.download({ url: u, conflictAction: 'uniquify' }).catch(() => {}); await new Promise(r => setTimeout(r, 250)); } toast(us.length + ' downloads started'); }, 'primary')), h('div', { class: 'gap' }), ul)); draw();
  } });

  /* ---------------- Privacy ---------------- */
  sec('containers', { group: 'Privacy', title: 'Login switcher', sub: 'Save the cookies of a site as a named login, then switch between logins. Chrome has no real containers; this swaps cookie sets.', feature: 'containers', async render(b) {
    const tab = await T.lastWebTab(); const host = h('input', { placeholder: 'Site, e.g. linkedin.com', value: tab ? new URL(tab.url).hostname.replace(/^www\./, '') : '' }); const name = h('input', { placeholder: 'Login name, e.g. Work' });
    const sets = await S.get('cookieSets', {});
    const need = async (d) => { const o = ['https://*.' + d + '/*', 'https://' + d + '/*']; return (await chrome.permissions.contains({ origins: o })) || chrome.permissions.request({ origins: o }); };
    const getAll = async (d) => chrome.cookies.getAll({ domain: d });
    const clear = async (d) => { for (const c of await getAll(d)) await chrome.cookies.remove({ url: 'http' + (c.secure ? 's' : '') + '://' + c.domain.replace(/^\./, '') + c.path, name: c.name, storeId: c.storeId }); };
    b.append(card(h('div', { class: 'row' }, host, name, btn('Save current login', async () => { const d = host.value.trim(); if (!d || !name.value || !await need(d)) return; const cs = await getAll(d); await S.update('cookieSets', {}, s => { (s[d] = s[d] || {})[name.value] = cs; }); toast('Saved ' + cs.length + ' cookies'); rerender(); }, 'primary')), h('p', { class: 'muted small' }, 'Saved cookies stay only in this browser. They are sign-in secrets, so do not export backups to shared places.')));
    for (const [d, logins] of Object.entries(sets)) b.append(card(h('h3', {}, d), h('ul', { class: 'list' }, Object.keys(logins).map(n => h('li', {}, h('span', { class: 'grow' }, n + ' · ' + logins[n].length + ' cookies'),
      btn('Switch to this', async () => { if (!await need(d)) return; await clear(d); for (const c of logins[n]) { const o = { url: 'http' + (c.secure ? 's' : '') + '://' + c.domain.replace(/^\./, '') + c.path, name: c.name, value: c.value, path: c.path, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, expirationDate: c.expirationDate }; if (!c.hostOnly) o.domain = c.domain; await chrome.cookies.set(o).catch(() => {}); } toast('Switched. Reload ' + d); }, 'primary'),
      btn('Delete', async () => { await S.update('cookieSets', {}, s => { delete s[d][n]; if (!Object.keys(s[d]).length) delete s[d]; }); rerender(); }, 'danger'))))));
  } });
  const RISKY = { '<all_urls>': 3, '*://*/*': 3, 'http://*/*': 3, 'https://*/*': 3, debugger: 3, proxy: 3, nativeMessaging: 2, webRequest: 2, webRequestBlocking: 2, cookies: 2, history: 2, tabs: 1, clipboardRead: 2, management: 2, downloads: 1, declarativeNetRequest: 1, scripting: 1, privacy: 2, browsingData: 1, desktopCapture: 2, tabCapture: 2 };
  sec('extensions', { group: 'Privacy', title: 'Extension audit', sub: 'Your installed extensions ranked by how much they can see. High does not mean bad; it means trust it only if you know it.', feature: 'extaudit', async render(b) {
    const all = (await chrome.management.getAll()).filter(e => e.type === 'extension' && e.id !== chrome.runtime.id);
    const score = (e) => { const p = [...(e.permissions || []), ...(e.hostPermissions || [])]; let s = 0; const why = []; for (const x of p) { const r = RISKY[x] || (/^\*?:?\/\/\*|^\*:\/\/\*\//.test(x) ? 3 : 0); if (r) { s += r; why.push(x); } } if (e.installType !== 'normal' && e.installType !== 'admin') { why.push('installed as ' + e.installType); s += 1; } return { s, why }; };
    const l = all.map(e => Object.assign({ e }, score(e))).sort((a, c) => c.s - a.s);
    if (!l.length) return b.append(empty('No other extensions installed.'));
    b.append(card(h('ul', { class: 'list' }, l.map(({ e, s, why }) => { const lv = s >= 6 ? ['High', 'risk-h'] : s >= 3 ? ['Medium', 'risk-m'] : ['Low', 'risk-l']; return h('li', {}, e.icons && e.icons.length ? h('img', { src: e.icons[e.icons.length - 1].url, width: 24, height: 24 }) : null, h('div', { class: 'li-main' }, h('div', {}, h('b', {}, e.name), ' ', h('span', { class: lv[1] + ' small' }, lv[0]), e.enabled ? '' : h('span', { class: 'muted small' }, ' · off')), h('div', { class: 'muted' }, why.join(', ') || 'no sensitive permissions')),
      btn(e.enabled ? 'Turn off' : 'Turn on', async () => { await chrome.management.setEnabled(e.id, !e.enabled); rerender(); }), btn('Remove', () => chrome.management.uninstall(e.id, { showConfirmDialog: true }).then(rerender).catch(() => {}), 'danger')); }))));
  } });

  /* ---------------- Monitors ---------------- */
  sec('monitors', { group: 'Reading', title: 'Page monitors', sub: 'Pages PRISM re-checks every few hours while Chrome is open. Notifies when the text changes.', feature: 'pagemonitor', async render(b) {
    const u = h('input', { type: 'url', placeholder: 'https://…' });
    b.append(card(h('div', { class: 'row' }, u, btn('Watch', async () => { if (!u.value) return; const o = new URL(u.value).origin + '/*'; if (!await chrome.permissions.contains({ origins: [o] }) && !await chrome.permissions.request({ origins: [o] })) return; await send({ type: 'monitor:add', url: u.value }); rerender(); }, 'primary'), btn('Check all now', async () => { toast('Checking…'); const n = await send({ type: 'monitor:check' }); toast((n || 0) + ' changed'); rerender(); }))));
    const l = await S.get('monitors', []); if (!l.length) return b.append(empty('Nothing watched.'));
    b.append(card(h('ul', { class: 'list' }, l.map(x => liItem(x.url, x.title, (x.error ? x.error + ' · ' : '') + 'checked ' + UI.ago(x.last) + (x.changed ? ' · changed ' + UI.ago(x.changed) : ''), btn('Stop', async () => { await S.update('monitors', [], a => a.filter(y => y.id !== x.id)); rerender(); }, 'danger'))))));
  } });
})();

