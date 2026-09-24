/* PRISM Tools: one page, one hash section per tool. Sections register with T.sec(hash, {title, sub, group, feature, render(body)}). */
(function (g) {
  const { $, h } = UI;
  const T = { secs: {}, order: [], cleanups: [], renderId: 0 };
  T.cleanup = fn => T.cleanups.push(fn);
  const libraries = {};
  T.library = name => {
    const paths = { pdf: '../../lib/pdf-lib.min.js', gif: '../../lib/gifenc.js' };
    if (!paths[name]) return Promise.reject(Error('Unknown library'));
    if (!libraries[name]) libraries[name] = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = paths[name];
      script.onload = resolve; script.onerror = () => { delete libraries[name]; script.remove(); reject(Error('Could not load the local ' + name + ' library. Reload PRISM and try again.')); };
      document.head.append(script);
    });
    return libraries[name];
  };
  T.sec = (hash, spec) => { T.secs[hash] = spec; T.order.push(hash); };
  T.empty = (text) => h('div', { class: 'empty' }, text);
  T.card = (...kids) => h('section', { class: 'card fade-in' }, ...kids);
  T.fmtDate = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  T.kb = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  T.fav = (url) => h('img', { src: chrome.runtime.getURL('/_favicon/?pageUrl=' + encodeURIComponent(url) + '&size=16'), width: 16, height: 16, alt: '' });
  T.dropZone = (label, accept, multiple, onFiles) => {
    let running = false;
    const handle = async fs => {
      if (running || !fs.length) return;
      running = true; d.setAttribute('aria-busy', 'true');
      try { await onFiles(multiple ? fs : fs.slice(0, 1)); }
      catch (e) { UI.toast(e.message || 'Could not read this file.'); }
      finally { running = false; d.removeAttribute('aria-busy'); inp.value = ''; }
    };
    const inp = h('input', { type: 'file', accept, multiple, hidden: true, onchange: () => handle([...inp.files]) });
    const d = h('div', { class: 'drop', role: 'button', tabindex: 0, 'aria-label': label }, h('span', { class: 'drop-symbol', 'aria-hidden': 'true' }, '↑'), h('strong', {}, label), h('small', {}, 'Processed on your device'), inp);
    d.onclick = e => { if (e.target !== inp && !running && !d.closest('fieldset:disabled')) inp.click(); };
    d.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); } };
    d.ondragover = e => { e.preventDefault(); d.classList.add('over'); }; d.ondragleave = () => d.classList.remove('over');
    d.ondrop = e => { e.preventDefault(); d.classList.remove('over'); if (!d.closest('fieldset:disabled')) handle([...e.dataTransfer.files]); };
    return d;
  };
  T.readBuf = (f) => f.arrayBuffer();
  T.lastWebTab = async () => (await chrome.tabs.query({})).filter(t => /^https?:/.test(t.url || '')).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))[0];
  T.render = async () => {
    const id = ++T.renderId;
    for (const fn of T.cleanups.splice(0)) { try { fn(); } catch (e) { console.warn(e); } }
    const requested = (location.hash.slice(1) || 'home').split('?')[0];
    const hash = T.secs[requested] ? requested : 'home'; const s = T.secs[hash];
    if (['pdf','sign','img2pdf','compress'].includes(hash)) { location.replace(chrome.runtime.getURL('pages/pdf-studio/index.html#' + (hash === 'pdf' ? 'pdf' + (location.hash.includes('?') ? '?' + location.hash.split('?')[1] : '') : hash))); return; }
    T.active = hash;
    if (hash !== 'home' && !s.hidden) {
      const recent = await PrismStore.get('tools:recent', []);
      if (id !== T.renderId) return;
      await PrismStore.set('tools:recent', [hash, ...recent.filter(k => k !== hash)].slice(0, 6));
    }
    if (id !== T.renderId) return;
    document.querySelectorAll('#links a').forEach(a => a.classList.toggle('on', a.dataset.h === hash));
    $('#title').textContent = s.title; $('#sub').textContent = s.sub || ''; document.title = s.title + ' · PRISM';
    const body = $('#body'); body.innerHTML = '';
    if (s.feature && T.settings && T.settings.on[s.feature] === false) { body.append(T.card(h('p', {}, 'This tool is switched off. '), h('a', { class: 'btn', href: '../options/options.html#' + s.feature }, 'Turn it on in settings'))); return; }
    try { if (['pdf', 'sign', 'img2pdf'].includes(hash)) await T.library('pdf'); if (hash === 'gif') await T.library('gif'); if (id !== T.renderId) return; await s.render(body, new URLSearchParams(location.hash.split('?')[1] || '')); } catch (e) { console.error(e); body.append(T.card(h('p', { class: 'muted' }, 'Something went wrong: ' + e.message))); }
  };
  T.nav = () => {
    const box = $('#links'); box.innerHTML = ''; let grp = '';
    const q = ($('#navfind').value || '').toLowerCase();
    for (const k of T.order) { const s = T.secs[k]; if (s.hidden) continue; if (q && !(s.title + ' ' + (s.sub || '')).toLowerCase().includes(q)) continue; if (s.group !== grp) { grp = s.group; box.append(h('div', { class: 'g' }, grp)); } box.append(h('a', { href: '#' + k, 'data-h': k, class: k === T.active ? 'on' : '' }, s.title)); }
  };
  g.T = T;
})(self);

