/* New tab: clock (5), palette/one box (1-3, 93), quick links (4), to-do (6), weather (7), countdowns (8, 70),
   recently closed (9), tatkal (124), task timer (147), flashcards (104). */
const { $, h, toast } = UI; const U = PrismU;
let S;
(async () => {
  S = await UI.theme();
  document.querySelectorAll('[data-feature]').forEach(el => { if (!S.on[el.dataset.feature]) el.hidden = true; });
  if (S.on.palette || S.on.onebox) {
    const q = $('#q');
    Palette.bind(q, $('#results'), S, async () => ({ tab: (await chrome.tabs.getCurrent()), page: false }), (r) => r && toast(r));
    q.focus();
    addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); q.select(); } });
  }
  clock(); links(); todo(); weather(); countdowns(); closed(); tatkal(); timer(); flash();
})();

function clock() {
  if (!S.on.clock) return;
  const tick = () => {
    const d = new Date();
    $('#time').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hr = d.getHours(); const part = hr < 5 ? 'Up late' : hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    $('#greet').textContent = part + (S.cfg.clock.name ? ', ' + S.cfg.clock.name : '') + ' · ' + d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  };
  tick(); setInterval(tick, 1000 * 10);
  const f = $('#focus'); PrismStore.get('focusNote', {}).then(n => { if (n.d === U.today()) f.value = n.text; });
  f.addEventListener('input', () => PrismStore.set('focusNote', { d: U.today(), text: f.value }));
}
async function links() {
  if (!S.on.quicklinks) return;
  const box = $('#links');
  let list = await PrismStore.get('quicklinks', [{ title: 'Gmail', url: 'https://mail.google.com' }, { title: 'LinkedIn', url: 'https://www.linkedin.com/jobs' }, { title: 'Naukri', url: 'https://www.naukri.com' }, { title: 'GitHub', url: 'https://github.com' }, { title: 'ChatGPT', url: 'https://chatgpt.com' }, { title: 'YouTube', url: 'https://www.youtube.com' }]);
  const draw = () => {
    box.innerHTML = '';
    list.forEach((l, i) => box.append(h('a', { href: l.url, title: l.url },
      h('span', { class: 'ic' }, l.icon && !/^https?:/.test(l.icon) ? l.icon : h('img', { src: l.icon || Palette.fav(l.url), alt: '' })),
      h('span', { class: 't' }, l.title),
      h('span', { class: 'del', title: 'Remove', onclick: (e) => { e.preventDefault(); list.splice(i, 1); PrismStore.set('quicklinks', list); draw(); } }, '×'))));
    box.append(h('button', { class: 'add', onclick: () => {
      const url = prompt('Link URL'); if (!url) return;
      const title = prompt('Name', U.host(url.startsWith('http') ? url : 'https://' + url)) || url;
      const icon = prompt('Icon (optional): an emoji or an image URL. Leave empty for the site icon.') || '';
      list.push({ title, url: url.startsWith('http') ? url : 'https://' + url, icon }); PrismStore.set('quicklinks', list); draw();
    } }, h('span', { class: 'ic' }, '+'), h('span', { class: 't' }, 'Add')));
  };
  draw();
}
async function todo() {
  if (!S.on.todo) return;
  let list = await PrismStore.get('todo', []);
  const ul = $('#todo');
  const draw = () => { ul.innerHTML = ''; list.forEach((t, i) => ul.append(h('li', { class: t.done ? 'done' : '', onclick: () => { t.done = !t.done; save(); } }, h('span', {}, t.text), h('button', { class: 'x', onclick: (e) => { e.stopPropagation(); list.splice(i, 1); save(); } }, '×')))); };
  const save = () => { PrismStore.set('todo', list); draw(); };
  $('#todoIn').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.value.trim()) { list.push({ text: e.target.value.trim(), done: false }); e.target.value = ''; save(); } });
  draw();
}
async function weather() {
  if (!S.on.weather) return;
  const el = $('#weather'); const city = S.cfg.weather.city || 'Bengaluru';
  const cache = await PrismStore.get('weatherCache', null);
  const show = (w) => { el.innerHTML = ''; el.append(h('b', {}, Math.round(w.t) + '°'), w.desc + ' · ' + w.city, h('br'), 'H ' + Math.round(w.hi) + '° L ' + Math.round(w.lo) + '°'); };
  if (cache && cache.city === city && Date.now() - cache.at < 30 * 60000) return show(cache);
  try {
    const g = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(city))).json();
    const p = g.results[0];
    const f = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`)).json();
    const codes = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };
    const w = { city: p.name, t: f.current.temperature_2m, desc: codes[f.current.weather_code] || '—', hi: f.daily.temperature_2m_max[0], lo: f.daily.temperature_2m_min[0], at: Date.now() };
    PrismStore.set('weatherCache', Object.assign({}, w, { city })); show(w);
  } catch (e) { el.textContent = 'Weather offline'; }
}
async function countdowns() {
  if (!S.on.countdowns && !S.on.appcount) { $('[data-feature=countdowns]').hidden = true; return; }
  $('[data-feature=countdowns]').hidden = false;
  let list = await PrismStore.get('countdowns', []);
  const jobs = S.on.appcount ? (await PrismStore.get('jobs', [])).filter(j => j.deadline && !['rejected', 'offer'].includes(j.status)) : [];
  const ul = $('#cd');
  const days = (d) => Math.ceil((new Date(d + 'T00:00:00') - new Date(U.today() + 'T00:00:00')) / 864e5);
  const draw = () => {
    ul.innerHTML = '';
    const all = list.map((c, i) => ({ name: c.name, date: c.date, i })).concat(jobs.map(j => ({ name: j.company + ' - ' + j.role, date: j.deadline, job: true })));
    all.sort((a, b) => a.date.localeCompare(b.date)).forEach(c => {
      const d = days(c.date);
      ul.append(h('li', {}, h('span', { class: 'big', style: { fontSize: '20px', minWidth: '46px' } }, d < 0 ? '✓' : String(d)), h('div', { class: 'grow' }, h('div', {}, c.name), h('div', { class: 'faint small' }, (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d < 0 ? 'Passed' : d + ' days') + (c.job ? ' · job tracker' : ''))),
        c.job ? null : h('button', { class: 'x', onclick: () => { list.splice(c.i, 1); PrismStore.set('countdowns', list); draw(); } }, '×')));
    });
  };
  $('#cdAdd').onclick = () => { const n = $('#cdName').value.trim(), d = $('#cdDate').value; if (!n || !d) return toast('Name and date'); list.push({ name: n, date: d }); PrismStore.set('countdowns', list); $('#cdName').value = ''; draw(); };
  if (!S.on.countdowns) $('#cdAdd').parentElement.hidden = true;
  draw();
}
async function closed() {
  if (!S.on.recentclosed) return;
  const s = await chrome.sessions.getRecentlyClosed({ maxResults: 8 });
  const ul = $('#closed');
  for (const x of s) {
    const t = x.tab || (x.window && x.window.tabs[0]); if (!t) continue;
    ul.append(h('li', { style: { cursor: 'pointer' }, onclick: () => chrome.sessions.restore((x.tab || x.window).sessionId) },
      h('img', { src: Palette.fav(t.url), style: { width: '16px' }, alt: '' }), h('span', { class: 'grow', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, x.window ? 'Window (' + x.window.tabs.length + ' tabs)' : t.title)));
  }
  if (!ul.children.length) ul.append(h('li', { class: 'faint' }, 'Nothing closed yet'));
}
/* IST is UTC+5:30 with no DST */
function tatkalNext(hour) {
  const now = Date.now(); const ist = new Date(now + 5.5 * 3600e3);
  const t = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), hour, 0, 0) - 5.5 * 3600e3;
  return t > now ? t : t + 864e5;
}
function tatkal() {
  if (!S.on.tatkal) return;
  const el = $('#tatkal');
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const tick = () => { el.innerHTML = ''; for (const [label, hr] of [['AC (10:00 IST)', 10], ['Non-AC (11:00 IST)', 11]]) el.append(h('div', { class: 'row' }, h('span', { class: 'muted' }, label), h('span', { class: 'big', style: { fontSize: '20px' } }, fmt(tatkalNext(hr) - Date.now())))); el.append(h('div', { class: 'faint small' }, 'Booking opens one day before travel.')); };
  tick(); setInterval(tick, 1000);
}
async function timer() {
  if (!S.on.tasktimer) return;
  const box = $('#timer');
  const draw = async () => {
    const st = await PrismStore.get('tasktimer', { running: null, log: [] });
    box.innerHTML = '';
    if (st.running) {
      const el = h('div', { class: 'big' }); const up = () => el.textContent = U.fmtMin(Date.now() - st.running.start) + ' · ' + st.running.name; up(); clearInterval(box._i); box._i = setInterval(up, 15000);
      box.append(el, h('button', { class: 'btn primary small', onclick: async () => { st.log.unshift({ name: st.running.name, start: st.running.start, end: Date.now() }); st.running = null; await PrismStore.set('tasktimer', st); draw(); } }, 'Stop'));
    } else {
      const inp = h('input', { placeholder: 'What are you working on?' });
      box.append(h('div', { class: 'row' }, inp, h('button', { class: 'btn primary small', onclick: async () => { st.running = { name: inp.value || 'Task', start: Date.now() }; await PrismStore.set('tasktimer', st); draw(); } }, 'Start')));
    }
    const today = st.log.filter(l => new Date(l.start).toDateString() === new Date().toDateString());
    if (today.length) box.append(h('div', { class: 'faint small', style: { marginTop: '8px' } }, 'Today: ' + today.map(l => l.name + ' ' + U.fmtMin(l.end - l.start)).join(' · ')));
  };
  draw();
}
async function flash() {
  if (!S.on.flashcards) return;
  const box = $('#flash');
  const cards = await PrismStore.get('flash', []);
  const due = cards.filter(c => (c.due || 0) <= Date.now());
  if (!due.length) { box.append(h('div', { class: 'faint' }, cards.length ? 'All caught up. ' + cards.length + ' cards.' : 'Highlight text on pages, then make cards in Tools > Flashcards.')); return; }
  const c = due[0]; let shown = false;
  const q = h('div', { class: 'flash-q' }, c.front);
  const a = h('div', { class: 'muted', hidden: true }, c.back || '');
  const grade = (g) => async () => { c.interval = g === 0 ? 1 : Math.round((c.interval || 1) * (g === 1 ? 2 : 3.5)); c.due = Date.now() + c.interval * 864e5; await PrismStore.set('flash', cards); box.innerHTML = ''; flash(); };
  const btns = h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => { if (!shown) { a.hidden = false; shown = true; btns.replaceChildren(h('button', { class: 'btn small', onclick: grade(0) }, 'Again'), h('button', { class: 'btn small', onclick: grade(1) }, 'Good'), h('button', { class: 'btn small primary', onclick: grade(2) }, 'Easy')); } } }, 'Show answer'));
  box.append(h('div', { class: 'faint small' }, due.length + ' due'), q, a, btns);
}
