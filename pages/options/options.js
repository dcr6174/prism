/* Options: per-feature toggles + settings generated from the registry, site access, theme, backup. */
const { $, h, toast } = UI;
let S;
const save = async () => { await PrismStore.save(S); await UI.send({ type: 'settings:changed' }); };
const PACKS = [
  ['All sites', ['<all_urls>']],
  ['YouTube', ['https://www.youtube.com/*', 'https://m.youtube.com/*']],
  ['Gmail', ['https://mail.google.com/*']],
  ['Google Search', ['https://www.google.com/*', 'https://www.google.co.in/*']],
  ['Job sites', ['https://www.linkedin.com/*', 'https://www.naukri.com/*', 'https://in.indeed.com/*', 'https://www.indeed.com/*']],
  ['Shopping', ['https://www.amazon.in/*', 'https://www.flipkart.com/*', 'https://www.myntra.com/*', 'https://www.bigbasket.com/*', 'https://blinkit.com/*']],
  ['IRCTC', ['https://www.irctc.co.in/*']],
  ['AI chats', ['https://chatgpt.com/*', 'https://claude.ai/*', 'https://gemini.google.com/*', 'https://www.perplexity.ai/*']],
  ['Social', ['https://www.reddit.com/*', 'https://x.com/*', 'https://www.instagram.com/*', 'https://www.facebook.com/*']],
];
(async () => {
  S = await UI.theme();
  if (location.hash === '#welcome') $('#welcome').hidden = false;
  $('#theme').value = S.theme || 'auto';
  $('#theme').onchange = async (e) => { S.theme = e.target.value; document.documentElement.dataset.theme = S.theme; await save(); };
  await access(); features();
  $('#find').oninput = (e) => filter(e.target.value);
  $('#exp').onclick = async () => UI.download(new Blob([JSON.stringify(await chrome.storage.local.get(null), null, 1)], { type: 'application/json' }), 'prism-backup-' + PrismU.today() + '.json');
  $('#imp').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; const data = JSON.parse(await f.text()); await chrome.storage.local.set(data); toast('Imported. Reloading...'); setTimeout(() => location.reload(), 700); };
  $('#reset').onclick = async () => { if (!confirm('Reset all settings to default? Your data (notes, tracker, lists) stays.')) return; S = PrismStore.defaults(); await save(); location.reload(); };
})();
async function access() {
  const draw = async () => {
    const p = await chrome.permissions.getAll(); const o = p.origins || [];
    $('#packs').innerHTML = '';
    for (const [name, origins] of PACKS) {
      const on = o.includes('<all_urls>') || origins.every(x => o.includes(x));
      $('#packs').append(h('button', { class: 'pack' + (on ? ' on' : ''), onclick: async () => {
        if (on) { await chrome.permissions.remove({ origins }); } else if (!(await chrome.permissions.request({ origins }))) return toast('Not allowed');
        await UI.send({ type: 'scripts:sync' }); draw();
      } }, (on ? '✓ ' : '+ ') + name));
    }
    const ul = $('#granted'); ul.innerHTML = '';
    for (const x of o) ul.append(h('li', {}, h('span', { class: 'grow' }, x === '<all_urls>' ? 'All sites' : x), h('button', { class: 'btn small ghost danger', onclick: async () => { await chrome.permissions.remove({ origins: [x] }); await UI.send({ type: 'scripts:sync' }); draw(); } }, 'Remove')));
    if (!o.length) ul.append(h('li', { class: 'faint small' }, 'No sites yet. Page features are off everywhere.'));
  };
  $('#siteAdd').onclick = async () => {
    let v = $('#siteIn').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (!v) return;
    const origins = ['https://' + v + '/*', 'https://*.' + v.replace(/^www\./, '') + '/*'];
    if (await chrome.permissions.request({ origins })) { $('#siteIn').value = ''; await UI.send({ type: 'scripts:sync' }); draw(); toast('Allowed ' + v); }
  };
  draw();
}
function field(f, c) {
  const val = S.cfg[f.id][c.k];
  const set = async (v) => { S.cfg[f.id][c.k] = v; await save(); toast('Saved'); };
  if (c.type === 'bool') return h('div', { class: 'row', style: { marginTop: '8px' } }, UI.switchEl(!!val, set), h('span', { class: 'small' }, c.label));
  let inp;
  if (c.type === 'list') { inp = h('textarea', { rows: Math.min(8, Math.max(3, (val || []).length + 1)) }); inp.value = (val || []).join('\n'); inp.onchange = () => set(inp.value.split('\n').map(x => x.trim()).filter(Boolean)); }
  else { inp = h('input', { type: c.type === 'number' ? 'number' : 'text', step: 'any' }); inp.value = val == null ? '' : val; inp.onchange = () => set(c.type === 'number' ? parseFloat(inp.value) : inp.value); }
  return h('div', {}, h('label', { class: 'f' }, c.label + (c.type === 'list' ? ' - one per line' : '')), inp);
}
function features() {
  const box = $('#groups'); const groups = {};
  for (const f of PRISM_FEATURES) (groups[f.group] = groups[f.group] || []).push(f);
  for (const g in groups) {
    const on = groups[g].filter(f => S.on[f.id]).length;
    box.append(h('div', { class: 'grp', 'data-g': g }, h('h2', {}, g), h('span', {}, on + ' of ' + groups[g].length + ' on')));
    for (const f of groups[g]) {
      const hasCfg = f.cfg.length || HINT[f.id];
      const card = h('div', { class: 'feat', 'data-id': f.id, 'data-s': (f.n + ' ' + f.name + ' ' + f.desc + ' ' + g).toLowerCase() });
      card.append(h('div', { class: 'top', onclick: (e) => { if (e.target.closest('.switch')) return; if (hasCfg) card.classList.toggle('open'); } },
        h('span', { class: 'n' }, String(f.n)), h('div', { class: 'grow' }, h('div', { class: 'name' }, f.name), h('div', { class: 'd' }, f.desc)),
        hasCfg ? h('span', { class: 'chev' }, '›') : null,
        UI.switchEl(!!S.on[f.id], async (v) => { S.on[f.id] = v; await save(); toast(f.name + (v ? ' on' : ' off')); })));
      if (hasCfg) card.append(h('div', { class: 'cfg' }, h('div', {}, h('div', { class: 'in' }, HINT[f.id] ? h('p', { class: 'muted small', html: HINT[f.id] }) : null, f.cfg.map(c => field(f, c))))));
      box.append(card);
    }
  }
  $('#count').textContent = PRISM_FEATURES.filter(f => S.on[f.id]).length + ' of ' + PRISM_FEATURES.length + ' on';
}
function filter(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.feat').forEach(c => c.hidden = q && !c.dataset.s.includes(q));
  document.querySelectorAll('.grp').forEach(g => { let n = g.nextElementSibling, any = false; while (n && n.classList.contains('feat')) { if (!n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; });
}
const HINT = {
  blocker: 'Sites here never load. Add from the popup with "Block this site", too.',
  schedules: 'Format: <code>site = days hh:mm-hh:mm</code>. Days: <code>daily</code>, <code>weekdays</code>, <code>weekends</code>, <code>mon-fri</code>, <code>sat,sun</code>.',
  aisummary: 'Uses Chrome\'s built-in Gemini Nano when your Chrome supports it (desktop Chrome 138+, enough disk and memory). Otherwise PRISM hands the page to your chat site.',
  translate: 'Uses Chrome\'s built-in Translator API (desktop Chrome 138+). Language packs download once, then work offline.',
  containers: 'Experimental. Chrome has no real containers; PRISM swaps saved cookie sets for one site.',
  pricewatch: 'Runs only while Chrome is open. Needs Shopping site access. Sites can change their pages and break this.',
  pagemonitor: 'Runs only while Chrome is open. Needs access to the watched site.',
  copyurl: 'Change shortcuts at chrome://extensions/shortcuts.',
  palette: 'Change the Alt+K shortcut at chrome://extensions/shortcuts.',
  dlsort: 'Files go into Downloads/PRISM/PDFs, Images, Installers and so on.',
  quicklinks: 'Add and remove links right on the new tab page.',
  prompts: 'Edit prompts in Tools > Prompt library. They show up when you right-click selected text.',
  irctc: 'Fill-only. You still solve the captcha and press every button yourself. Format: <code>Name, Age, M</code>.',
};
