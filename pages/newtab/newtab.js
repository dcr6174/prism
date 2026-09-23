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
  clock(); links(); todo(); weather(); countdowns(); closed(); tatkal(); timer(); pomodoro(); flash();
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
  let list = await PrismStore.get('quicklinks', Palette.QUICKLINKS.slice());
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
/* Weather (7): never guesses where you are. Uses the city you typed, or lat/lon saved only after you
   click "Use my location" (browser geolocation). With neither, it asks. */
const WCODES = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };
async function saveWeatherCfg(patch) {
  await PrismStore.patch(all => Object.assign(all.cfg.weather, patch)); Object.assign(S.cfg.weather, patch);
  await PrismStore.set('weatherCache', null);
}
function askLocation(el, msg) {
  el.innerHTML = '';
  const inp = h('input', { placeholder: 'Your city', class: 'wcity' });
  const setCity = async () => { const v = inp.value.trim(); if (!v) return inp.focus(); await saveWeatherCfg({ city: v, lat: '', lon: '' }); weather(); };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') setCity(); });
  const geo = h('button', { class: 'btn small', onclick: () => {
    geo.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(async (p) => { await saveWeatherCfg({ city: '', lat: String(+p.coords.latitude.toFixed(3)), lon: String(+p.coords.longitude.toFixed(3)) }); weather(); },
      (e) => askLocation(el, 'Could not get your location (' + (e.message || 'blocked') + '). Type your city instead.'), { timeout: 12000, maximumAge: 36e5 });
  } }, 'Use my location');
  el.append(h('div', { class: 'wask' }, h('div', { class: 'small' }, msg || 'Where are you? For weather.'), h('div', { class: 'row' }, inp, h('button', { class: 'btn small primary', onclick: setCity }, 'Set')), geo));
}
async function weather() {
  if (!S.on.weather) return;
  const el = $('#weather'); const c = S.cfg.weather; const city = (c.city || '').trim(); const lat = parseFloat(c.lat), lon = parseFloat(c.lon);
  const hasGeo = isFinite(lat) && isFinite(lon);
  if (!city && !hasGeo) return askLocation(el);
  const key = city || lat + ',' + lon;
  const cache = await PrismStore.get('weatherCache', null);
  const show = (w) => { el.innerHTML = ''; el.append(h('b', {}, Math.round(w.t) + '°'), w.desc + ' · ' + w.city, h('br'), 'H ' + Math.round(w.hi) + '° L ' + Math.round(w.lo) + '° · ', h('a', { href: '#', class: 'wchange', onclick: (e) => { e.preventDefault(); askLocation(el, 'Change location'); } }, 'change')); };
  if (cache && cache.key === key && Date.now() - cache.at < 30 * 60000) return show(cache);
  try {
    let p = { latitude: lat, longitude: lon, name: 'Your location' };
    if (city) { const g = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(city))).json(); if (!g.results || !g.results[0]) return askLocation(el, 'Could not find "' + city + '". Try another spelling.'); p = g.results[0]; }
    const f = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`)).json();
    const w = { key, city: p.name, t: f.current.temperature_2m, desc: WCODES[f.current.weather_code] || '-', hi: f.daily.temperature_2m_max[0], lo: f.daily.temperature_2m_min[0], at: Date.now() };
    PrismStore.set('weatherCache', w); show(w);
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
/* Tatkal (124): a live countdown card. Rolling spring digits, a sliding "bubble" pill that morphs between
   AC and Non-AC, soft blobs that speed up as the window gets close, and an Open-now state with a Book button. */
function tatkal() {
  if (!S.on.tatkal) return;
  const el = $('#tatkal'); const card = el.closest('.card'); card.classList.add('tk-card');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kinds = [{ id: 'ac', label: 'AC', hr: 10, time: '10:00' }, { id: 'nonac', label: 'Non-AC', hr: 11, time: '11:00' }];
  const openFor = (k) => { const t = tatkalNext(k.hr) - 864e5; return Date.now() >= t && Date.now() < t + 15 * 60000; };
  const soonest = () => kinds.slice().sort((a, b) => (openFor(b) - openFor(a)) || (tatkalNext(a.hr) - tatkalNext(b.hr)))[0];
  let cur = soonest(), manual = false;
  el.innerHTML = '';
  const blobs = h('div', { class: 'tk-blobs', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
  const bubble = h('span', { class: 'tk-bubble' });
  const pills = kinds.map(k => h('button', { class: 'tk-pill', onclick: () => { manual = true; pick(k); } }, h('b', {}, k.label), h('small', {}, k.time)));
  const seg = h('div', { class: 'tk-seg' }, bubble, ...pills);
  const slots = []; const digits = h('div', { class: 'tk-digits', role: 'timer', 'aria-live': 'off' });
  ['h', 'h', ':', 'm', 'm', ':', 's', 's'].forEach((c) => {
    if (c === ':') return digits.append(h('span', { class: 'tk-colon' }, ':'));
    const slot = h('span', { class: 'tk-slot' }, h('span', { class: 'tk-d' }, '0')); slot.v = '0'; slots.push(slot); digits.append(slot);
  });
  const units = h('div', { class: 'tk-units' }, h('span', {}, 'hours'), h('span', {}, 'min'), h('span', {}, 'sec'));
  const bar = h('div', { class: 'tk-bar' }, h('span'));
  const note = h('div', { class: 'tk-note' });
  const book = h('a', { class: 'btn primary tk-book', href: 'https://www.irctc.co.in/nget/train-search', target: '_blank' }, 'Book on IRCTC');
  el.append(blobs, seg, digits, units, bar, h('div', { class: 'tk-foot' }, note, book));
  const moveBubble = () => {
    const i = kinds.indexOf(cur); const p = pills[i];
    bubble.style.width = p.offsetWidth + 'px'; bubble.style.transform = `translateX(${p.offsetLeft - 4}px)`;
    pills.forEach((x, j) => x.classList.toggle('on', j === i));
    if (!reduce) { bubble.classList.remove('jelly'); void bubble.offsetWidth; bubble.classList.add('jelly'); }
  };
  const setDigit = (slot, v, animate) => {
    if (slot.v === v) return; slot.v = v;
    const old = slot.lastChild; const n = h('span', { class: 'tk-d' + (animate && !reduce ? ' in' : '') }, v);
    if (animate && !reduce) { old.classList.add('out'); setTimeout(() => old.remove(), 520); } else old.remove();
    slot.append(n);
  };
  const pick = (k) => { cur = k; moveBubble(); card.classList.remove('tk-morph'); void card.offsetWidth; if (!reduce) card.classList.add('tk-morph'); draw(false); };
  const draw = (animate = true) => {
    if (!manual) { const s = soonest(); if (s !== cur) { cur = s; moveBubble(); } }
    const open = openFor(cur); const left = tatkalNext(cur.hr) - Date.now();
    const sec = Math.max(0, Math.floor(left / 1000));
    const str = String(Math.floor(sec / 3600)).padStart(2, '0') + String(Math.floor(sec % 3600 / 60)).padStart(2, '0') + String(sec % 60).padStart(2, '0');
    if (open) UI.hms(Date.now() - (tatkalNext(cur.hr) - 864e5)).split('').forEach((d, i) => setDigit(slots[i], d, animate)); else str.split('').forEach((d, i) => setDigit(slots[i], d, animate));
    bar.firstChild.style.transform = `scaleX(${open ? 1 : Math.min(1, 1 - left / 864e5)})`;
    const state = open ? 'open' : sec <= 300 ? 'now' : sec <= 3600 ? 'soon' : 'far';
    card.dataset.tk = state;
    units.children[0].textContent = open ? 'open for' : 'hours';
    note.textContent = open ? cur.label + ' Tatkal is OPEN - go now' : state === 'now' ? 'Get ready - log in to IRCTC now' : state === 'soon' ? 'Under an hour. Keep your passenger list ready.' : 'Opens ' + cur.time + ' IST, one day before travel';
    book.hidden = !(open || state === 'now');
  };
  requestAnimationFrame(() => { moveBubble(); bubble.classList.remove('jelly'); });
  addEventListener('resize', moveBubble);
  draw(false);
  const loop = () => { draw(true); setTimeout(loop, 1000 - Date.now() % 1000 + 5); };
  setTimeout(loop, 1000 - Date.now() % 1000 + 5);
}
/* Task timer (147): live H:MM:SS with rolling digits. */
async function timer() {
  if (!S.on.tasktimer) return;
  const box = $('#timer'); const card = box.closest('.card'); card.classList.add('live-card');
  let stopTick = null;
  const draw = async () => {
    stopTick && stopTick(); stopTick = null;
    const st = await PrismStore.get('tasktimer', { running: null, log: [] });
    box.innerHTML = ''; card.classList.toggle('on', !!st.running);
    if (st.running) {
      const r = UI.roll('00:00:00', 'live lc-digits');
      r.set(UI.hms(Date.now() - st.running.start), false);
      box.append(h('div', { class: 'lc-name' }, h('span', { class: 'live-dot' }), st.running.name), r.el, h('div', { class: 'lc-units' }, h('span', {}, 'hours'), h('span', {}, 'min'), h('span', {}, 'sec')),
        h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { class: 'btn primary small', onclick: async () => { st.log.unshift({ name: st.running.name, start: st.running.start, end: Date.now() }); st.running = null; await PrismStore.set('tasktimer', st); draw(); } }, 'Stop')));
      stopTick = UI.everySecond(() => r.set(UI.hms(Date.now() - st.running.start)));
    } else {
      const inp = h('input', { placeholder: 'What are you working on?' });
      const go = async () => { st.running = { name: inp.value.trim() || 'Task', start: Date.now() }; await PrismStore.set('tasktimer', st); draw(); };
      inp.addEventListener('keydown', (e) => e.key === 'Enter' && go());
      box.append(h('div', { class: 'row' }, inp, h('button', { class: 'btn primary small', onclick: go }, 'Start')));
    }
    const fmt = (ms) => { const t = UI.hms(ms); return (t.slice(0, 2) !== '00' ? +t.slice(0, 2) + 'h ' : '') + +t.slice(2, 4) + 'm ' + t.slice(4) + 's'; };
    const today = st.log.filter(l => new Date(l.start).toDateString() === new Date().toDateString());
    if (today.length) box.append(h('div', { class: 'faint small', style: { marginTop: '10px' } }, 'Today: ' + today.map(l => l.name + ' ' + fmt(l.end - l.start)).join(' · ')));
  };
  draw();
}
/* Pomodoro (22) on the new tab: live MM:SS with a progress ring. The background owns the timer. */
async function pomodoro() {
  const card = $('[data-feature=pomodoro]'); if (!S.on.pomodoro) return;
  const box = $('#pomo'); card.classList.add('live-card');
  const R = 34, C = 2 * Math.PI * R;
  const ring = h('div', { class: 'pm-ring' }); ring.innerHTML = `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="pm-track"/><circle cx="40" cy="40" r="${R}" class="pm-prog" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`;
  const r = UI.roll('00:00', 'live lc-digits');
  const phase = h('div', { class: 'lc-name' }); const btn = h('button', { class: 'btn primary small' });
  box.append(h('div', { class: 'pm-top' }, ring, h('div', {}, phase, r.el)), h('div', { class: 'row', style: { marginTop: '12px' } }, btn));
  let p = { phase: 'idle' };
  const refresh = async () => { p = (await UI.send({ type: 'pomo:state' })) || { phase: 'idle' }; paint(false); };
  const paint = (animate = true) => {
    const c = S.cfg.pomodoro; const on = p.phase !== 'idle';
    const total = (p.phase === 'rest' ? (c.rest || 5) : (c.work || 25)) * 60000;
    const left = on ? Math.max(0, p.ends - Date.now()) : total;
    r.set(UI.hms(left, false), animate); r.el.classList.toggle('live', on);
    card.classList.toggle('on', on); card.dataset.phase = p.phase;
    phase.innerHTML = ''; phase.append(on ? h('span', { class: 'live-dot' }) : '', p.phase === 'work' ? 'Focus' : p.phase === 'rest' ? 'Break' : 'Ready - ' + (c.work || 25) + ' min focus');
    ring.querySelector('.pm-prog').setAttribute('stroke-dashoffset', String(C * (on ? 1 - left / total : 0)));
    btn.textContent = on ? 'Stop' : 'Start focus';
    if (on && left <= 0) setTimeout(refresh, 2500);
  };
  btn.onclick = async () => { await UI.send({ type: p.phase !== 'idle' ? 'pomo:stop' : 'pomo:start' }); refresh(); };
  PrismStore.onChange((ch) => { if (ch.focus) refresh(); });
  await refresh(); UI.everySecond(() => p.phase !== 'idle' && paint());
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
