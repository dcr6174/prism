/* PRISM Tools: one page, one hash section per tool. Sections register with T.sec(hash, {title, sub, group, feature, render(body)}). */
(function (g) {
  const { $, h } = UI;
  const T = { secs: {}, order: [] };
  T.sec = (hash, spec) => { T.secs[hash] = spec; T.order.push(hash); };
  T.empty = (text) => h('div', { class: 'empty' }, text);
  T.card = (...kids) => h('section', { class: 'card fade-in' }, ...kids);
  T.fmtDate = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  T.kb = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  T.fav = (url) => h('img', { src: chrome.runtime.getURL('/_favicon/?pageUrl=' + encodeURIComponent(url) + '&size=16'), width: 16, height: 16, alt: '' });
  T.dropZone = (label, accept, multiple, onFiles) => {
    const inp = h('input', { type: 'file', accept, multiple, hidden: true, onchange: () => { onFiles([...inp.files]); inp.value = ''; } });
    const d = h('div', { class: 'drop' }, label, inp);
    d.onclick = () => inp.click();
    d.ondragover = (e) => { e.preventDefault(); d.classList.add('over'); }; d.ondragleave = () => d.classList.remove('over');
    d.ondrop = (e) => { e.preventDefault(); d.classList.remove('over'); onFiles([...e.dataTransfer.files]); };
    return d;
  };
  T.readBuf = (f) => f.arrayBuffer();
  T.lastWebTab = async () => (await chrome.tabs.query({})).filter(t => /^https?:/.test(t.url || '')).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
  T.render = async () => {
    const hash = (location.hash.slice(1) || T.order[0]).split('?')[0]; const s = T.secs[hash] || T.secs[T.order[0]];
    document.querySelectorAll('#links a').forEach(a => a.classList.toggle('on', a.dataset.h === hash));
    $('#title').textContent = s.title; $('#sub').textContent = s.sub || ''; document.title = s.title + ' · PRISM';
    const body = $('#body'); body.innerHTML = '';
    if (s.feature && T.settings && T.settings.on[s.feature] === false) { body.append(T.card(h('p', {}, 'This tool is switched off. '), h('a', { class: 'btn', href: '../options/options.html#' + s.feature }, 'Turn it on in settings'))); return; }
    try { await s.render(body, new URLSearchParams(location.hash.split('?')[1] || '')); } catch (e) { console.error(e); body.append(T.card(h('p', { class: 'muted' }, 'Something went wrong: ' + e.message))); }
  };
  T.nav = () => {
    const box = $('#links'); box.innerHTML = ''; let grp = '';
    const q = ($('#navfind').value || '').toLowerCase();
    for (const k of T.order) { const s = T.secs[k]; if (q && !(s.title + ' ' + (s.sub || '')).toLowerCase().includes(q)) continue; if (s.group !== grp) { grp = s.group; box.append(h('div', { class: 'g' }, grp)); } box.append(h('a', { href: '#' + k, 'data-h': k }, s.title)); }
  };
  g.T = T;
})(self);
