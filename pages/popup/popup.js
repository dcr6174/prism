/* Popup: palette (1, 15, 93), page actions, focus (20, 22, 147), notes (48, 49), accounts (137). */
const { $, h, toast } = UI; const U = PrismU;
let S, TAB;
const isPage = (t) => /^https?:/.test((t && t.url) || '');
const ctx = async () => ({ tab: TAB, page: isPage(TAB), input: '' });
(async () => {
  S = await UI.theme();
  [TAB] = await chrome.tabs.query({ active: true, currentWindow: true });
  const q = $('#q');
  Palette.bind(q, $('#results'), S, ctx, (r, it) => { if (r) toast(r); if (it && it.action && it.action.close) setTimeout(() => window.close(), 250); if (it && (it.kind === 'tab' || it.url)) window.close(); });
  q.focus();
  $('#tabs').onclick = (e) => { const t = e.target.closest('button')?.dataset.t; if (!t) return; document.querySelectorAll('#tabs button').forEach(b => { b.classList.toggle('on', b.dataset.t === t); b.setAttribute('aria-selected', b.dataset.t === t); }); document.querySelectorAll('[data-p]').forEach(s => s.hidden = s.dataset.p !== t); };
  $('#opt').onclick = e => { e.preventDefault(); chrome.runtime.openOptionsPage(); };
  $('#tools').onclick = e => { e.preventDefault(); chrome.tabs.create({ url: chrome.runtime.getURL('pages/tools/tools.html') }); };
  $('#featureCount').textContent = PRISM_FEATURES.filter(f => S.on[f.id]).length + ' / 160 on';
  home().catch(e => { console.warn(e); $('#home').append(h('p', { class:'muted small' }, 'Overview unavailable. Search and other sections still work.')); }); page(); focus(); notes(); accounts();
})();
const run = async (a) => {
  try { const r = await a.run(await ctx()); if (r && r.error) return toast(r.error); toast(a.done ? a.done(r) : typeof r === 'string' ? r : 'Done'); if (a.close) setTimeout(() => window.close(), 300); }
  catch (e) { toast(String(e.message || e)); }
};
async function home() {
  const box = $('#home');
  const website = isPage(TAB);
  const host = website ? U.host(TAB.url) : '';
  let allowed = false;
  if (website) {
    try { allowed = await chrome.permissions.contains({ origins: [new URL(TAB.url).origin + '/*'] }); } catch (e) { console.warn(e); }
  }
  const site = h('div', { class:'pp-site' }, h('span', { class:'pp-site-icon', 'aria-hidden':'true' }, website ? (host[0] || '•').toUpperCase() : '✦'), h('div',{class:'grow'},h('strong',{},website ? host : 'Browser page'),h('small',{class:'muted'},website ? (allowed ? 'Page features allowed' : 'Page features need site access') : 'Open a website for page actions')), h('span',{class:'pp-status ' + (allowed ? 'allowed' : '')},allowed ? 'Allowed' : website ? 'Limited' : 'Ready'));
  box.append(site);
  const shortcuts = [
    ['⊞', 'PDF Studio', 'pdf', 'lilac'], ['↗', 'Job tracker', 'jobs', 'peach'],
    ['⌘', 'QA kit', 'testdata', 'mint'], ['◉', 'Record', 'recorder', 'blue']
  ];
  const open = hash => chrome.tabs.create({url:chrome.runtime.getURL('pages/tools/tools.html#' + hash)});
  box.append(h('div',{class:'grp'},'Jump into'),h('div',{class:'pp-shortcuts'},...shortcuts.map(([icon,label,hash,tone])=>h('button',{class:'pp-shortcut '+tone,onclick:()=>open(hash)},h('span',{class:'pp-shortcut-icon','aria-hidden':'true'},icon),h('span',{},label)))));
  const favorite = (await PrismStore.get('tools:favorites', [])).filter(x=>typeof x==='string');
  const recent = (await PrismStore.get('tools:recent', [])).filter(x=>typeof x==='string');
  const pinned = [...new Set([...favorite,...recent])].filter(x=>x!=='home').slice(0,6);
  box.append(h('div',{class:'row pp-heading'},h('div',{class:'grp grow'},'Yours'),h('span',{class:'muted small'},favorite.length+' pinned')),
    pinned.length ? h('div',{class:'chips pp-personal'},...pinned.map(id=>h('button',{class:'chip',onclick:()=>open(id)},favorite.includes(id)?'★ ':'↗ ',id==='pdf'?'PDF Studio':id.replace(/[-_]/g,' ')))) : h('div',{class:'pp-empty'},'Pin a tool from All tools. It will show up here.'));
  const fast = [website ? 'Copy clean link' : 'Close duplicate tabs', website ? 'Full-page screenshot' : 'Open saved sessions', website ? 'Save to reading list (offline copy)' : 'Start Pomodoro'];
  const acts = fast.map(label=>PRISM_ACTIONS.find(a=>a.label===label)).filter(a=>a&&S.on[a.feature]);
  if (acts.length) box.append(h('div',{class:'grp'},'Quick actions'),h('div',{class:'pp-actions'},...acts.map(a=>h('button',{class:'pp-action',onclick:()=>run(a)},h('span',{},a.label),h('span',{'aria-hidden':'true'},'↗')))));
  box.append(h('p',{class:'muted small pp-help'},'Search above to reach every available action, tab and bookmark.'));
}
function page() {
  const box = $('#page');
  const groups = [['Copy', ['Copy page as Markdown', 'Copy Markdown link', 'Copy clean link', 'Copy all links on page', 'Copy bug report block']],
    ['Capture', ['Full-page screenshot', 'QR code for this page', 'Save to reading list (offline copy)', 'Save this job to tracker']],
    ['Read', ['Reader mode', 'Summarise page (on-device AI)', 'Translate selection / page (on-device)', 'Read page aloud']],
    ['QA', ['Pick element -> Playwright locator', 'Fill form with fake data', 'Accessibility check', 'Performance snapshot', 'Check broken links', 'Show viewport size overlay']],
    ['Tabs', ['Close duplicate tabs', 'Collapse all tabs into a list', 'Snooze tab 3 hours', 'Group tabs by site']]];
  if (!isPage(TAB)) box.append(h('p', { class: 'muted small' }, 'Page tools work on normal web pages. Tab tools below still work.'));
  for (const [g, labels] of groups) {
    const acts = labels.map(l => PRISM_ACTIONS.find(a => a.label === l)).filter(a => a && (a.feature === 'core' || S.on[a.feature]) && (!a.page || isPage(TAB)));
    if (!acts.length) continue;
    box.append(h('div', { class: 'grp' }, g), h('div', { class: 'chips' }, acts.map(a => h('button', { class: 'chip', onclick: () => run(a) }, a.label.replace(/ \(.*\)$/, '')))));
  }
  box.append(h('p', { class: 'faint small', style: { marginTop: '12px' } }, 'Type in the box above for all ' + PRISM_ACTIONS.length + ' actions.'));
}
async function focus() {
  const box = $('#focus');
  if (S.on.pomodoro) {
    let p = (await UI.send({ type: 'pomo:state' })) || { phase: 'idle' };
    const r = UI.roll('00:00', 'pop-digits'); const lab = h('span', { class: 'muted small' });
    const paint = (anim) => { const c = S.cfg.pomodoro; const on = p.phase !== 'idle'; r.set(UI.hms(on ? p.ends - Date.now() : (c.work || 25) * 60000, false), anim); r.el.classList.toggle('live', on); lab.textContent = p.phase === 'work' ? 'Focus' : p.phase === 'rest' ? 'Break' : 'Ready'; };
    paint(false); UI.everySecond(() => p.phase !== 'idle' && paint(true));
    box.append(h('div', { class: 'grp' }, 'Pomodoro'), h('div', { class: 'row' }, h('div', { class: 'grow' }, lab, r.el),
      h('button', { class: 'btn primary', onclick: async () => { await UI.send({ type: p.phase !== 'idle' ? 'pomo:stop' : 'pomo:start' }); window.close(); } }, p.phase !== 'idle' ? 'Stop' : 'Start focus')));
  }
  if (S.on.lockdown) {
    const until = await UI.send({ type: 'lockdown:state' });
    box.append(h('div', { class: 'grp' }, 'Lockdown'), until > Date.now() ? h('p', { class: 'muted' }, 'On until ' + new Date(until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '. Only your allowlist opens.')
      : h('div', { class: 'row' }, h('span', { class: 'muted grow small' }, 'Only allowlisted sites open.'), ...[25, 50, 90].map(m => h('button', { class: 'btn small', onclick: async () => { await UI.send({ type: 'lockdown:start', minutes: m }); toast('Lockdown ' + m + ' min'); } }, m + 'm'))));
  }
  if (S.on.tasktimer) {
    const st = await PrismStore.get('tasktimer', { running: null, log: [] });
    const inp = h('input', { placeholder: 'Task name' });
    let row;
    if (st.running) { const r = UI.roll('00:00:00', 'pop-digits live'); r.set(UI.hms(Date.now() - st.running.start), false); UI.everySecond(() => r.set(UI.hms(Date.now() - st.running.start)));
      row = h('div', { class: 'row' }, h('div', { class: 'grow' }, h('span', { class: 'muted small' }, st.running.name), r.el), h('button', { class: 'btn primary small', onclick: async () => { st.log.unshift({ name: st.running.name, start: st.running.start, end: Date.now() }); st.running = null; await PrismStore.set('tasktimer', st); toast('Stopped'); window.close(); } }, 'Stop')); }
    else row = h('div', { class: 'row' }, inp, h('button', { class: 'btn primary small', onclick: async () => { st.running = { name: inp.value || 'Task', start: Date.now() }; await PrismStore.set('tasktimer', st); toast('Timer started'); window.close(); } }, 'Start'));
    box.append(h('div', { class: 'grp' }, 'Task timer'), row);
  }
  if (S.on.timedash) {
    const t = await PrismStore.get('time:' + U.today(), {});
    const top = Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 5);
    box.append(h('div', { class: 'grp' }, 'Today'), top.length ? h('ul', { class: 'list' }, top.map(([k, v]) => h('li', {}, h('span', { class: 'grow' }, k), h('span', { class: 'muted' }, U.fmtMin(v))))) : h('p', { class: 'faint small' }, 'No browsing time yet today.'));
  }
}
async function notes() {
  const box = $('#notes');
  if (S.on.scratch) {
    const ta = h('textarea', { id: 'scratch', placeholder: 'Scratchpad. Saved as you type.' });
    ta.value = await PrismStore.get('scratch', '');
    ta.oninput = () => PrismStore.set('scratch', ta.value);
    box.append(h('div', { class: 'grp' }, 'Scratchpad'), ta);
  }
  if (S.on.replies) {
    const rs = await PrismStore.get('replies', []);
    box.append(h('div', { class: 'grp' }, 'Saved replies'), rs.length ? h('div', { class: 'chips' }, rs.slice(0, 12).map(r => h('button', { class: 'chip', title: r.text, onclick: () => UI.copy(r.text, 'Reply copied') }, r.name))) : h('p', { class: 'faint small' }, 'Add replies in Tools > Saved replies.'));
  }
}
function accounts() {
  const box = $('#accounts');
  if (!S.on.gaccounts) return box.append(h('p', { class: 'faint' }, 'Turn on "Google account switch" in Settings.'));
  const apps = [['Gmail', 'https://mail.google.com/mail/u/%d/'], ['Drive', 'https://drive.google.com/drive/u/%d/'], ['Calendar', 'https://calendar.google.com/calendar/u/%d/'], ['Meet', 'https://meet.google.com/?authuser=%d'], ['YouTube', 'https://www.youtube.com/?authuser=%d']];
  for (let i = 0; i < 3; i++) box.append(h('div', { class: 'grp' }, 'Account /u/' + i), h('div', { class: 'chips' }, apps.map(([n, u]) => h('button', { class: 'chip', onclick: () => chrome.tabs.create({ url: u.replace('%d', i) }) }, n))));
  box.append(h('p', { class: 'faint small', style: { marginTop: '10px' } }, '/u/0 is the first account you signed in with, /u/1 the second, and so on.'));
}

